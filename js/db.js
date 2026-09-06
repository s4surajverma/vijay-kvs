/**
 * PM SHRI KV Suranussi — Database Abstraction Layer
 * ─────────────────────────────────────────────────
 * Hybrid Local-First & Supabase Cloud Architecture:
 * - Local-First: Zero lag, instantaneous offline reads/writes via localStorage.
 * - Cloud-Sync: When Supabase credentials are configured, seamlessly syncs
 *   with PostgreSQL `site_content` and `contact_inquiries` in the cloud.
 * - Realtime: Listens to PostgreSQL database change events for instant multi-device sync.
 */

const DB = (() => {

  /* ── Storage Keys ──────────────────────────────────────────── */
  const DATA_KEY         = 'PM_SHRI_KVS_DATA_V2';
  const AUTH_KEY         = 'PM_SHRI_KVS_AUTH_V1';
  const SESSION_KEY      = 'PM_SHRI_KVS_SESSION';
  const SUPABASE_CFG_KEY = 'PM_SHRI_KVS_SUPABASE_CFG_V1';
  const OLD_KEY          = 'PM_SHRI_KVS_SURANUSSI_DATA_V1'; // legacy migration

  /* ── Cloud Supabase State ───────────────────────────────────── */
  let _supabaseClient   = null;
  let _supabaseChannel  = null;
  let _isCloudConnected = false;
  let _lastCloudSync    = null;
  let _lastCloudError   = null;
  let _isSyncing        = false;

  /* ── Auth Credentials ─────────────────────────────────────── */

  /**
   * Get stored admin credentials.
   * Environment variables from Render (ADMIN_USERNAME, ADMIN_PASSWORD) take precedence.
   */
  function getCredentials() {
    const envUser = window.APP_CONFIG?.adminUsername || 'admin';
    const envPass = window.APP_CONFIG?.adminPassword || 'kvs@2024';

    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          username: envUser,
          password: parsed.password || envPass,
          displayName: parsed.displayName || 'Site Administrator'
        };
      }
    } catch (e) { /* fall through */ }

    // First-run defaults derived from environment
    const defaults = { username: envUser, password: envPass, displayName: 'Site Administrator' };
    localStorage.setItem(AUTH_KEY, JSON.stringify(defaults));
    return defaults;
  }

  /**
   * Persist updated credentials.
   */
  function updateCredentials(updates) {
    const current = getCredentials();
    const updated = { ...current, ...updates };
    localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    return updated;
  }

  /* ── Session ──────────────────────────────────────────────── */

  /**
   * Create a browser session (8-hour TTL stored in sessionStorage).
   */
  function createSession(user) {
    const session = {
      user,
      loggedInAt: Date.now(),
      expiresAt:  Date.now() + 8 * 60 * 60 * 1000  // 8 hours
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  /**
   * Return the active session, or null if expired / absent.
   */
  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch (e) { return null; }
  }

  /**
   * Invalidate the current session.
   */
  function destroySession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  /* ── Site Data & Local Cache ──────────────────────────────── */

  /**
   * Merge an existing (possibly older-schema) data object with the
   * current DEFAULT_SEED_DATA so new fields are always present.
   */
  function _mergeWithDefaults(existing) {
    const d = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    return {
      ...d,
      ...existing,
      schoolInfo: {
        ...d.schoolInfo,
        ...(existing.schoolInfo || {}),
        managedBy: existing.schoolInfo?.managedBy || existing.managedBy || d.schoolInfo.managedBy,
        campusImage: existing.schoolInfo?.campusImage || d.schoolInfo.campusImage
      },
      heroSection: {
        ...d.heroSection,
        ...(existing.heroSection || {}),
        backgroundImage: existing.heroSection?.backgroundImage || d.heroSection.backgroundImage
      },
      principalMessage: {
        ...d.principalMessage,
        ...(existing.principalMessage || {})
      },
      statsBar:      existing.statsBar      || d.statsBar,
      // Preserve all user-edited arrays
      announcements: existing.announcements || d.announcements,
      initiatives:   existing.initiatives   || d.initiatives,
      staff:         existing.staff         || d.staff,
      gallery:       existing.gallery       || d.gallery,
      resources:     existing.resources     || d.resources,
      inquiries:     existing.inquiries     || d.inquiries,
    };
  }

  /**
   * Load local site data instantly from localStorage.
   */
  function _getLocalData() {
    try {
      const saved = localStorage.getItem(DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.heroSection?.backgroundImage || !parsed.schoolInfo?.campusImage || !parsed.schoolInfo?.subtitle || parsed.schoolInfo?.isPmShri === undefined || !parsed.schoolInfo?.managedBy) {
          const merged = _mergeWithDefaults(parsed);
          _saveLocalData(merged);
          return merged;
        }
        return parsed;
      }

      // Attempt one-time migration from V1 key
      const legacy = localStorage.getItem(OLD_KEY);
      if (legacy) {
        const merged = _mergeWithDefaults(JSON.parse(legacy));
        _saveLocalData(merged);
        return merged;
      }
    } catch (e) {
      console.warn('[DB] Could not load local data, reverting to defaults.', e);
    }
    const defaults = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    _saveLocalData(defaults);
    return defaults;
  }

  function _saveLocalData(data) {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[DB] Failed to save to localStorage.', e);
    }
  }

  /**
   * Load full site data.
   * Synchronously returns the locally cached data for instantaneous render,
   * while initiating a non-blocking background fetch if connected to Supabase.
   */
  function getData() {
    const local = _getLocalData();
    // Non-blocking background sync if connected
    if (_supabaseClient && !_isSyncing) {
      setTimeout(() => pullFromSupabase(true), 10);
    }
    return local;
  }

  /**
   * Persist full site data and broadcast a change event.
   * Immediately saves locally and pushes to Supabase in the background.
   */
  function saveData(data, skipCloudPush = false) {
    _saveLocalData(data);
    window.dispatchEvent(new CustomEvent('pm_shri_state_changed', { detail: data }));

    if (_supabaseClient && !skipCloudPush) {
      pushToSupabase(data).catch(err => {
        console.warn('[DB] Background cloud push deferred:', err.message);
      });
    }
    return data;
  }

  /**
   * Get a single top-level section (e.g. 'gallery').
   */
  function getSection(key) {
    return getData()[key];
  }

  /**
   * Save a single top-level section.
   */
  function saveSection(key, value) {
    const data = getData();
    data[key] = value;
    return saveData(data);
  }

  /**
   * Reset all data to factory defaults.
   */
  function resetToDefault() {
    const defaults = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    return saveData(defaults);
  }

  /**
   * Export current data as a JSON string (for manual backup).
   */
  function exportJSON() {
    return JSON.stringify(getData(), null, 2);
  }

  /**
   * Import data from a JSON string (basic schema check).
   */
  function importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.schoolInfo && parsed.announcements) {
        saveData(parsed);
        return true;
      }
    } catch (e) {
      console.error('[DB] Invalid JSON for import.', e);
    }
    return false;
  }

  /* ── Supabase Integration Methods ─────────────────────────── */

  /**
   * Retrieve configured Supabase credentials.
   * Prioritizes Render environment variables injected via window.APP_CONFIG.
   */
  function getSupabaseConfig() {
    let cfg = { url: '', anonKey: '', source: 'default' };

    // 1. Primary: Render Environment variables via window.APP_CONFIG
    if (window.APP_CONFIG?.supabaseUrl && window.APP_CONFIG?.supabaseAnonKey) {
      cfg.url = window.APP_CONFIG.supabaseUrl;
      cfg.anonKey = window.APP_CONFIG.supabaseAnonKey;
      cfg.source = 'Render Environment';
      return cfg;
    }

    // 2. Secondary: Static window.SUPABASE_CONFIG
    if (window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey) {
      cfg.url = window.SUPABASE_CONFIG.url;
      cfg.anonKey = window.SUPABASE_CONFIG.anonKey;
      cfg.source = 'Static Config';
      return cfg;
    }

    // 3. Fallback: LocalStorage
    try {
      const stored = localStorage.getItem(SUPABASE_CFG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) {
          cfg.url = parsed.url;
          cfg.anonKey = parsed.anonKey;
          cfg.source = 'Local Storage';
          return cfg;
        }
      }
    } catch (e) { /* fall through */ }

    return cfg;
  }

  /**
   * Get current Supabase status.
   */
  function getSupabaseStatus() {
    const cfg = getSupabaseConfig();
    return {
      isConfigured: Boolean(cfg.url && cfg.anonKey),
      isConnected: _isCloudConnected,
      lastSync: _lastCloudSync,
      lastError: _lastCloudError,
      source: cfg.source,
      url: cfg.url
    };
  }

  /**
   * Initialize Supabase client and subscribe to real-time events.
   */
  async function initSupabase(url, anonKey, persist = true) {
    const cleanUrl = (url || '').trim();
    const cleanKey = (anonKey || '').trim();

    if (!cleanUrl || !cleanKey) {
      _supabaseClient = null;
      _isCloudConnected = false;
      if (persist) {
        localStorage.removeItem(SUPABASE_CFG_KEY);
      }
      _notifySupabaseState();
      return { success: false, error: 'URL and Anon Key are required.' };
    }

    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
      _lastCloudError = 'Supabase JS library not loaded.';
      _notifySupabaseState();
      return { success: false, error: _lastCloudError };
    }

    try {
      _supabaseClient = window.supabase.createClient(cleanUrl, cleanKey, {
        auth: { persistSession: false }
      });

      if (persist) {
        localStorage.setItem(SUPABASE_CFG_KEY, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
      }

      // Test connection
      const test = await testSupabaseConnection();
      if (!test.success) {
        return test;
      }

      // Setup real-time listener
      _setupRealtimeSubscription();

      // Background pull to ensure freshest data
      pullFromSupabase(true).catch(() => {});

      return { success: true };
    } catch (err) {
      _supabaseClient = null;
      _isCloudConnected = false;
      _lastCloudError = err.message;
      _notifySupabaseState();
      return { success: false, error: err.message };
    }
  }

  /**
   * Test Supabase connection by pinging the site_content table.
   */
  async function testSupabaseConnection() {
    if (!_supabaseClient) {
      return { success: false, error: 'Supabase client is not initialized.' };
    }
    try {
      const { data, error } = await _supabaseClient
        .from('site_content')
        .select('id, updated_at')
        .eq('id', 'main')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        _isCloudConnected = false;
        _lastCloudError = error.message;
        _notifySupabaseState();
        return { success: false, error: error.message };
      }

      _isCloudConnected = true;
      _lastCloudError = null;
      _lastCloudSync = new Date().toISOString();
      _notifySupabaseState();
      return { success: true, rowExists: Boolean(data) };
    } catch (err) {
      _isCloudConnected = false;
      _lastCloudError = err.message;
      _notifySupabaseState();
      return { success: false, error: err.message };
    }
  }

  /**
   * Push local data up to Supabase `site_content`.
   */
  async function pushToSupabase(customData = null) {
    if (!_supabaseClient) throw new Error('Supabase client is not connected.');
    const dataToSave = customData || _getLocalData();
    _isSyncing = true;

    try {
      const { error } = await _supabaseClient
        .from('site_content')
        .upsert({
          id: 'main',
          data: dataToSave,
          updated_at: new Date().toISOString(),
          updated_by: Auth?.getUser()?.displayName || 'admin'
        });

      if (error) throw error;

      _isCloudConnected = true;
      _lastCloudSync = new Date().toISOString();
      _lastCloudError = null;
      _notifySupabaseState();
      return { success: true };
    } catch (err) {
      _lastCloudError = err.message;
      _notifySupabaseState();
      throw err;
    } finally {
      _isSyncing = false;
    }
  }

  /**
   * Pull latest content from Supabase `site_content`.
   */
  async function pullFromSupabase(silent = false) {
    if (!_supabaseClient) return { success: false, error: 'Not connected' };
    if (_isSyncing) return { success: true, skipped: true };
    _isSyncing = true;

    try {
      const { data, error } = await _supabaseClient
        .from('site_content')
        .select('data, updated_at')
        .eq('id', 'main')
        .maybeSingle();

      if (error) throw error;

      if (!data || !data.data) {
        // If remote table is empty, auto-seed it with our rich local dataset!
        await pushToSupabase();
        return { success: true, autoSeeded: true };
      }

      const merged = _mergeWithDefaults(data.data);
      _saveLocalData(merged);
      _isCloudConnected = true;
      _lastCloudSync = data.updated_at || new Date().toISOString();
      _lastCloudError = null;

      // Broadcast update so open tabs and current UI immediately refresh
      window.dispatchEvent(new CustomEvent('pm_shri_state_changed', { detail: merged }));
      _notifySupabaseState();

      return { success: true, data: merged };
    } catch (err) {
      _lastCloudError = err.message;
      _notifySupabaseState();
      if (!silent) throw err;
      return { success: false, error: err.message };
    } finally {
      _isSyncing = false;
    }
  }

  /**
   * Submit an inquiry to local storage AND Supabase `contact_inquiries`.
   */
  async function submitInquiry(inquiry) {
    const data = getData();
    if (!data.inquiries) data.inquiries = [];

    const newInquiry = {
      id: 'inq_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: 'New',
      ...inquiry
    };

    data.inquiries.unshift(newInquiry);
    saveData(data);

    // If Supabase is connected, push into contact_inquiries table
    if (_supabaseClient) {
      try {
        await _supabaseClient.from('contact_inquiries').insert([{
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone || '',
          subject: inquiry.subject || 'General Inquiry',
          message: inquiry.message,
          status: 'new'
        }]);
      } catch (e) {
        console.warn('[DB] Could not sync inquiry to cloud table:', e);
      }
    }
    return newInquiry;
  }

  /**
   * Setup real-time postgres_changes subscription.
   */
  function _setupRealtimeSubscription() {
    if (!_supabaseClient) return;
    try {
      if (_supabaseChannel) {
        _supabaseClient.removeChannel(_supabaseChannel);
      }
      _supabaseChannel = _supabaseClient
        .channel('public:site_content_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'site_content',
          filter: 'id=eq.main'
        }, payload => {
          if (payload.new && payload.new.data) {
            const merged = _mergeWithDefaults(payload.new.data);
            _saveLocalData(merged);
            _lastCloudSync = payload.new.updated_at || new Date().toISOString();
            window.dispatchEvent(new CustomEvent('pm_shri_state_changed', { detail: merged }));
            _notifySupabaseState();
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('[DB] Realtime subscription could not be established:', e);
    }
  }

  function _notifySupabaseState() {
    window.dispatchEvent(new CustomEvent('pm_shri_supabase_state', {
      detail: getSupabaseStatus()
    }));
  }

  // Auto-init on page load if config is found
  setTimeout(() => {
    const cfg = getSupabaseConfig();
    if (cfg.url && cfg.anonKey) {
      initSupabase(cfg.url, cfg.anonKey, false).catch(() => {});
    }
  }, 100);

  /* ── Public Interface ─────────────────────────────────────── */
  return {
    // Auth
    getCredentials,
    updateCredentials,
    // Session
    createSession,
    getSession,
    destroySession,
    // Data
    getData,
    saveData,
    getSection,
    saveSection,
    resetToDefault,
    exportJSON,
    importJSON,
    // Inquiries
    submitInquiry,
    // Cloud Supabase
    getSupabaseConfig,
    getSupabaseStatus,
    initSupabase,
    testSupabaseConnection,
    pushToSupabase,
    pullFromSupabase
  };

})();
