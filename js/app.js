/**
 * PM SHRI KV Suranussi — Main Application Logic
 * Part A: Init, Theme, Drive URL Converter, All Public Renders
 */

/* ── Boot ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkExistingSession();
  renderAllSections();
  refreshCategoryDropdowns();
  initRouter();

  const navLogin = document.getElementById('navLoginBtn');
  if (navLogin) {
    navLogin.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      handleNavLoginClick();
    });
  }

  window.addEventListener('pm_shri_state_changed', () => {
    renderAllSections();
    if (Auth.isLoggedIn()) renderAdminDashboard();
  });
  window.addEventListener('pm_shri_supabase_state', e => {
    updateSupabaseStatusBadge(e.detail);
  });

  // Global keyboard shortcut for admin portal (Ctrl+Shift+A)
  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      handleNavLoginClick();
    }
  });
});

/* ── Google Drive URL Converter & Fallback Handlers ──────────── */
function getDriveId(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ];
  for (const p of patterns) {
    const m = raw.match(p);
    if (m) return m[1];
  }
  return null;
}

function isDriveUrl(url) {
  return typeof url === 'string' && (
    url.includes('drive.google.com') ||
    url.includes('googleusercontent.com') ||
    url.includes('docs.google.com')
  );
}

function convertDriveUrl(raw, type = 'image') {
  if (!raw || raw === '#') return raw;
  const id = getDriveId(raw);
  if (!id) return raw;
  if (type === 'pdf') return `https://drive.google.com/file/d/${id}/preview`;
  // Use first-party server proxy when running on an HTTP/HTTPS web server (bypasses adblockers, Brave Shields, & 303 redirects)
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    return `/api/proxy-image?id=${id}`;
  }
  // Google direct CDN fallback
  return `https://lh3.googleusercontent.com/d/${id}`;
}

function handleDriveImgError(img, driveId) {
  if (!img) return;
  const id = driveId || getDriveId(img.getAttribute('data-raw-src') || img.src);
  if (id && !img.dataset.triedLh3) {
    img.dataset.triedLh3 = '1';
    img.src = `https://lh3.googleusercontent.com/d/${id}`;
    return;
  }
  if (id && !img.dataset.triedThumb) {
    img.dataset.triedThumb = '1';
    img.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
    return;
  }
  if (!img.dataset.triedFallback) {
    img.dataset.triedFallback = '1';
    img.src = 'assets/images/pm_shri.png';
  }
}

/* ── Theme ───────────────────────────────────────────────────── */
function initTheme() {
  const t = localStorage.getItem('PM_SHRI_THEME') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  _updateThemeIcon(t);
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('PM_SHRI_THEME', next);
    _updateThemeIcon(next);
  });
}
function _updateThemeIcon(t) {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.innerHTML = t === 'dark' ? `<i class="fas fa-sun" style="color:#e6ab2c"></i>` : `<i class="fas fa-moon"></i>`;
}

/* ── Auth / Session ──────────────────────────────────────────── */
function checkExistingSession() {
  if (Auth.isLoggedIn()) _setNavLoggedIn(true);
}

function _setNavLoggedIn(in_) {
  const btns = document.querySelectorAll('.btn-nav-admin, #navLoginBtn, .topbar-admin-btn, .nav-admin-chip');
  btns.forEach(btn => {
    if (in_) {
      btn.innerHTML = `<i class="fas fa-tachometer-alt"></i> Dashboard`;
    } else {
      btn.innerHTML = `<i class="fas fa-lock"></i> Admin Portal`;
    }
  });
}

function handleNavLoginClick() {
  if (Auth.isLoggedIn()) { showAdminView(); } else { openLoginModal(); }
}

/* ── Login Modal ─────────────────────────────────────────────── */
function openLoginModal() {
  const m = document.getElementById('loginModal');
  if (!m) return;
  m.style.display = 'flex';
  m.style.opacity = '1';
  m.style.visibility = 'visible';
  m.style.pointerEvents = 'auto';
  m.classList.add('active');
  setTimeout(() => {
    const inp = document.getElementById('loginUsername');
    if (inp) inp.focus();
  }, 60);
  clearLoginError();
}
function closeLoginModal() {
  const m = document.getElementById('loginModal');
  if (!m) return;
  m.classList.remove('active');
  m.style.opacity = '0';
  m.style.visibility = 'hidden';
  m.style.pointerEvents = 'none';
  m.style.display = 'none';
  const form = document.getElementById('loginForm');
  if (form) form.reset();
  clearLoginError();
}
function clearLoginError() {
  const el = document.getElementById('loginError');
  if (el) el.style.display = 'none';
}
function showLoginError(msg) {
  const el = document.getElementById('loginError');
  const tx = document.getElementById('loginErrorText');
  if (el && tx) { tx.textContent = msg; el.style.display = 'flex'; }
}
function togglePasswordVisibility() {
  const inp = document.getElementById('loginPassword');
  const ico = document.getElementById('pwdEyeIcon');
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text';     ico.className = 'fas fa-eye-slash'; }
  else                         { inp.type = 'password'; ico.className = 'fas fa-eye'; }
}
function handleLoginSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  clearLoginError();
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Signing in…`;
  btn.disabled = true;
  setTimeout(() => {
    const result = Auth.login(username, password);
    btn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Sign In`;
    btn.disabled = false;
    if (result.success) {
      closeLoginModal();
      _setNavLoggedIn(true);
      showAdminView();
    } else {
      showLoginError(result.error);
    }
  }, 600);
}

/* ── Admin View Show / Hide ──────────────────────────────────── */
function showAdminView() {
  const pub = document.getElementById('publicView');
  if (pub) pub.style.display = 'none';
  const av = document.getElementById('adminView');
  if (av) {
    av.classList.add('active');
    av.style.display = 'block';
  }
  _setNavLoggedIn(true);
  renderAdminDashboard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exitAdminView() {
  Auth.logout();
  _setNavLoggedIn(false);
  const av = document.getElementById('adminView');
  if (av) {
    av.classList.remove('active');
    av.style.display = 'none';
  }
  const pub = document.getElementById('publicView');
  if (pub) pub.style.display = 'block';
  window.location.hash = '#/';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Dedicated Full-Page SPA Router ───────────────────────────── */
function initRouter() {
  window.addEventListener('hashchange', handleHashRouting);
  handleHashRouting();
}

function handleHashRouting() {
  const raw = window.location.hash || '#/';
  // Normalize route string (e.g. '#/about?section=journey' -> 'about')
  let clean = raw.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  if (clean === '' || clean === 'home') clean = 'home';

  // Support direct routing to admin or login
  if (clean === 'admin' || clean === 'login') {
    if (Auth.isLoggedIn()) {
      showAdminView();
    } else {
      const pub = document.getElementById('publicView');
      if (pub) pub.style.display = 'block';
      const av = document.getElementById('adminView');
      if (av) {
        av.classList.remove('active');
        av.style.display = 'none';
      }
      openLoginModal();
    }
    return;
  }

  // When visiting any public page, ensure publicView is visible and adminView is hidden
  const pub = document.getElementById('publicView');
  if (pub) pub.style.display = 'block';
  const av = document.getElementById('adminView');
  if (av) {
    av.classList.remove('active');
    av.style.display = 'none';
  }

  // Extract optional query param (e.g. ?section=qualifications)
  const queryStr = raw.includes('?') ? raw.split('?')[1] : '';
  const params = new URLSearchParams(queryStr);
  const subtab = params.get('section');

  const validPages = ['home', 'about', 'leadership', 'resources', 'training', 'innovations', 'gallery', 'contact'];
  const pageId = validPages.includes(clean) ? clean : 'home';

  // Toggle active class across full-page views
  document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.add('active');

  // Highlight active navbar link
  document.querySelectorAll('.vijay-nav-menu .nav-link-btn').forEach(btn => {
    if (btn.getAttribute('data-page') === pageId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Ensure fresh content is rendered for the target page
  const d = DB.getData();
  if (pageId === 'home') {
    renderHomepageProfile(d.profile);
    renderLatestUpdates(d.announcements);
  } else if (pageId === 'about') {
    renderModalAbout(d.profile);
    if (subtab) {
      setTimeout(() => {
        const targetSec = document.getElementById(`profSection_${subtab}`);
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetSec.style.outline = '3px solid #dfa83b';
          targetSec.style.transition = 'outline 0.3s ease';
          setTimeout(() => { targetSec.style.outline = 'none'; }, 2200);
        }
      }, 200);
    }
  } else if (pageId === 'leadership') {
    renderModalInitiatives(d.initiatives);
  } else if (pageId === 'resources') {
    renderModalResources();
  } else if (pageId === 'training') {
    renderModalAnnouncements(d.announcements);
  } else if (pageId === 'gallery') {
    renderModalGallery(d.gallery);
  }

  // Smooth scroll to top on page switch
  if (!subtab) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function navigateTo(page, subtab) {
  if (subtab) {
    window.location.hash = `#/${page}?section=${subtab}`;
  } else {
    window.location.hash = `#/${page}`;
  }
}

// Backward compatibility helpers
function openSubpage(type, subtab) {
  navigateTo(type, subtab);
}

function closeSubpage() {
  navigateTo('home');
}

/* ── Render All Public Sections ──────────────────────────────── */
function renderAllSections() {
  const d = DB.getData();
  renderNavigationMenus(d.menus);
  renderHomepageProfile(d.profile);
  renderLatestUpdates(d.announcements);
  renderModalAbout(d.profile);
  renderModalInitiatives(d.initiatives);
  renderModalResources();
  renderModalAnnouncements(d.announcements);
  renderModalGallery(d.gallery);
}

function _escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderNavigationMenus(menus) {
  if (!menus || !Array.isArray(menus)) {
    const d = DB.getData();
    menus = d.menus || (typeof DEFAULT_SEED_DATA !== 'undefined' ? DEFAULT_SEED_DATA.menus : []);
  }
  if (!menus || !menus.length) return;

  menus.forEach(item => {
    // 1. Top sticky navbar link
    const navBtn = document.querySelector(`.vijay-nav-menu .nav-link-btn[data-page="${item.id}"]`);
    if (navBtn) {
      navBtn.textContent = item.label;
    }

    // 2. Footer quick links
    const footerLinks = document.querySelectorAll(`.footer-links-list a[href="${item.href}"]`);
    footerLinks.forEach(fl => {
      fl.textContent = item.label;
    });

    // 3. Homepage Linked Category Cards (5 Colorful Cards)
    const catCard = document.querySelector(`.category-cards-grid a[href="${item.href}"]`);
    if (catCard) {
      const titleEl = catCard.querySelector('.cat-card-title');
      if (titleEl) {
        titleEl.textContent = item.cardTitle || item.label;
      }
      const descEl = catCard.querySelector('.cat-card-desc');
      if (descEl && item.cardDesc) {
        descEl.textContent = item.cardDesc;
      }
    }

    // 4. Homepage Middle Column: About Me Card Heading
    if (item.id === 'about') {
      const midAboutTitle = document.querySelector('.mid-about-title');
      if (midAboutTitle) {
        midAboutTitle.textContent = item.cardTitle || item.label;
      }
    }

    // 5. Subpage hero banners & breadcrumbs
    const pageView = document.getElementById(`page-${item.id}`);
    if (pageView && item.id !== 'home') {
      const heroTitle = pageView.querySelector('.subpage-hero-title');
      if (heroTitle) {
        heroTitle.textContent = item.cardTitle || item.label;
      }
      const breadcrumbTrail = pageView.querySelector('.breadcrumb-trail');
      if (breadcrumbTrail) {
        breadcrumbTrail.innerHTML = `<a href="#/">Home</a> / <span>${_escapeHtml(item.label)}</span>`;
      }
    }
  });
}

function _setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val || ''; }
function _setNum(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function _setChecked(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }
function _setVal(id, val) { const el = document.getElementById(id); if (el) el.value = (val !== undefined && val !== null) ? val : ''; }

function renderHomepageProfile(prof) {
  if (!prof) return;
  _setText('homeBioSnippet', prof.bio);
  _setText('homeQuoteText', prof.quote);
  _setText('footerAddressText', prof.address ? prof.address.replace(/,\s*/g, ',\n') : 'PM SHRI Kendriya Vidyalaya Suranussi, Jalandhar');
  const emailEl = document.getElementById('footerEmailLink');
  if (emailEl) {
    emailEl.textContent = prof.email || 'vijaykumar.edu@gmail.com';
    emailEl.href = `mailto:${prof.email || 'vijaykumar.edu@gmail.com'}`;
  }

  const fbLinks = document.querySelectorAll('.soc-icon.fb, #topbarSocialFb, #footerSocialFb');
  fbLinks.forEach(el => { el.href = prof.facebook || 'https://facebook.com'; });

  const ytLinks = document.querySelectorAll('.soc-icon.yt, #topbarSocialYt, #footerSocialYt');
  ytLinks.forEach(el => { el.href = prof.youtube || 'https://youtube.com'; });

  const igLinks = document.querySelectorAll('.soc-icon.ig, #topbarSocialIg, #footerSocialIg');
  igLinks.forEach(el => { el.href = prof.instagram || 'https://instagram.com'; });
}

function renderLatestUpdates(list) {
  const el = document.getElementById('homeLatestUpdatesList');
  if (!el || !list || !list.length) return;
  el.innerHTML = list.slice(0, 5).map(a => {
    let day = '28';
    let month = 'Aug';
    if (a.displayDate && a.displayDate.includes(' ')) {
      const parts = a.displayDate.trim().split(/\s+/);
      day = parts[0] || '28';
      month = parts[1] || 'Aug';
    } else if (a.displayDate && a.displayDate.includes('.')) {
      const parts = a.displayDate.split('.');
      day = parts[0] || '28';
      month = 'Aug';
    } else if (a.date) {
      const dt = new Date(a.date);
      if (!isNaN(dt.getTime())) {
        day = String(dt.getDate()).padStart(2, '0');
        month = dt.toLocaleString('en-US', { month: 'short' });
      }
    }
    const cat = (a.category || '').toLowerCase();
    const targetSubpage = cat.includes('training') || cat.includes('cpd') ? 'training' :
                          cat.includes('event') || cat.includes('photo') ? 'gallery' : 'resources';
    return `<a href="javascript:void(0)" onclick="openSubpage('${targetSubpage}')" class="update-item-row">
      <div class="update-date-badge">
        <span class="badge-day">${day}</span>
        <span class="badge-month">${month}</span>
      </div>
      <span class="update-title-text">${a.title}</span>
      <i class="fas fa-arrow-right update-chevron"></i>
    </a>`;
  }).join('');
}

function renderModalAbout(prof) {
  if (!prof) return;
  _setText('aboutBioFull', prof.bio);
  _setText('aboutJourneyText', prof.journey);
  _setText('aboutVisionText', prof.vision);

  const qualEl = document.getElementById('aboutQualList');
  if (qualEl && prof.qualifications) {
    const items = prof.qualifications.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    qualEl.innerHTML = items.map(item => `<li>${item}</li>`).join('');
  }

  const rolesEl = document.getElementById('aboutRolesList');
  if (rolesEl && prof.responsibilities) {
    const items = prof.responsibilities.split(/\n/).map(s => s.trim()).filter(Boolean);
    rolesEl.innerHTML = items.map(item => `<li>${item}</li>`).join('');
  }
}

function renderModalInitiatives(list) {
  const el = document.getElementById('modalInitiativesGrid');
  if (!el || !list) return;
  el.innerHTML = list.map(i => {
    const isDrive = isDriveUrl(i.image);
    const driveId = isDrive ? getDriveId(i.image) : null;
    const imgSrc = isDrive ? convertDriveUrl(i.image, 'image') : (i.image || 'assets/images/toy_library.png');
    return `<div class="card" style="display:flex;flex-direction:column">
      <div class="card-img-wrapper" style="height:190px">
        <img src="${imgSrc}" class="card-img" alt="${i.title}" onerror="handleDriveImgError(this, '${driveId || ''}')" loading="lazy">
      </div>
      <div class="card-body" style="flex:1;display:flex;flex-direction:column">
        <span class="card-badge" style="align-self:flex-start;margin-bottom:0.6rem"><i class="fas ${i.icon || 'fa-star'}"></i> ${i.category}</span>
        <h3 class="card-title" style="font-size:1.15rem;margin-bottom:0.5rem">${i.title}</h3>
        <p class="card-text" style="font-size:0.9rem;color:var(--text-muted);margin-bottom:0.8rem">${i.summary}</p>
        <p style="font-size:0.85rem;color:var(--text-muted);border-top:1px solid var(--border-color);padding-top:0.8rem;margin-top:auto">${i.details}</p>
      </div>
    </div>`;
  }).join('');
}

function renderModalResources(query = '') {
  const el = document.getElementById('modalResourcesContainer');
  if (!el) return;
  const list = DB.getData().resources || [];
  const filtered = list.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.category.toLowerCase().includes(query.toLowerCase())
  );
  if (!filtered.length) {
    el.innerHTML = `<p style="color:var(--text-muted);padding:1.5rem 0">No resources found matching your search.</p>`;
    return;
  }
  el.innerHTML = filtered.map(r => {
    const hasSrc = r.srcUrl && r.srcUrl !== '#';
    const isDrive = isDriveUrl(r.srcUrl);
    return `<div class="card" style="padding:1.2rem;display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
      <div style="display:flex;gap:1.2rem;align-items:center">
        <div style="width:46px;height:46px;border-radius:10px;background:rgba(230,171,44,.15);color:#dfa83b;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">
          <i class="fas fa-file-pdf"></i>
        </div>
        <div>
          <span style="font-size:.78rem;color:var(--accent-teal);font-weight:700">${r.category} &bull; ${r.fileType || 'PDF'} (${r.size || 'PDF Document'})</span>
          <h4 style="font-size:1.02rem;margin:0.2rem 0;color:var(--primary)">${r.title}</h4>
          <span style="font-size:.8rem;color:var(--text-muted)">Published: ${r.date || 'Recent'}</span>
        </div>
      </div>
      <div>
        ${hasSrc
          ? isDrive
            ? `<button onclick="openViewer('${r.srcUrl}','${r.title.replace(/'/g,"\\'")}','','pdf')" class="btn-primary" style="padding:.5rem 1.1rem;font-size:.85rem"><i class="fas fa-eye"></i> View PDF</button>`
            : `<a href="${r.srcUrl}" target="_blank" class="btn-primary" style="padding:.5rem 1.1rem;font-size:.85rem"><i class="fas fa-download"></i> Access</a>`
          : `<button class="btn-secondary" style="padding:.5rem 1.1rem;font-size:.85rem;opacity:0.6" onclick="alert('Document link will be available shortly.')"><i class="fas fa-info-circle"></i> In Library</button>`
        }
      </div>
    </div>`;
  }).join('');
}

function renderModalAnnouncements(list) {
  const el = document.getElementById('modalAnnouncementsContainer');
  if (!el) return;
  if (!list || !list.length) {
    el.innerHTML = `<p style="color:var(--text-muted);padding:1rem 0">No updates or training materials available yet.</p>`;
    return;
  }
  el.innerHTML = list.map(a => {
    return `<div class="announcement-card" style="margin-bottom:1rem">
      <div class="ann-date-box">
        <span class="ann-date-day">${a.displayDate || a.date || 'NEW'}</span>
      </div>
      <div class="ann-info">
        <div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.3rem">
          ${a.badge ? `<span class="card-badge">${a.badge}</span>` : ''}
          <span style="font-size:.8rem;color:var(--accent-gold);font-weight:600">${a.category || 'General'}</span>
        </div>
        <h4>${a.title}</h4>
        <p>${a.description || ''}</p>
        ${a.linkUrl && a.linkUrl !== '#' ? (
          a.linkUrl.startsWith('#')
            ? `<a href="javascript:void(0)" onclick="openSubpage('${a.linkUrl.replace('#','')}')" style="display:inline-block;margin-top:.6rem;color:var(--accent-blue);font-weight:600;font-size:.88rem">Explore Section <i class="fas fa-arrow-right"></i></a>`
            : `<a href="${a.linkUrl}" target="_blank" rel="noopener" style="display:inline-block;margin-top:.6rem;color:var(--accent-blue);font-weight:600;font-size:.88rem">Access Document <i class="fas fa-external-link-alt"></i></a>`
        ) : ''}
      </div>
    </div>`;
  }).join('');
}

function renderModalGallery(list, cat = 'All') {
  const filterEl = document.getElementById('modalGalleryFilters');
  const gridEl = document.getElementById('modalGalleryGrid');
  if (!list) return;

  if (filterEl) {
    const rawCategories = list.map(i => i.category).filter(Boolean);
    const uniqueCats = ['All', ...new Set(rawCategories)];
    filterEl.innerHTML = uniqueCats.map(c => `
      <button class="filter-btn ${c === cat ? 'active' : ''}" onclick="renderModalGallery(DB.getData().gallery, '${c}')">
        ${c === 'All' ? 'All Photos' : c}
      </button>
    `).join('');
  }

  if (!gridEl) return;
  const items = cat === 'All' ? list : list.filter(i => i.category === cat);
  gridEl.innerHTML = items.map(item => {
    const isDrive = isDriveUrl(item.srcUrl);
    const driveId = isDrive ? getDriveId(item.srcUrl) : null;
    const src = isDrive ? convertDriveUrl(item.srcUrl, 'image') : (item.srcUrl || item.image || '');
    const safeTitle = (item.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeCaption = (item.caption || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    return `<div class="gallery-item" onclick="openViewer('${item.srcUrl}','${safeTitle}','${safeCaption}','${item.type || 'photo'}')">
      <img src="${src}" alt="${item.title}" onerror="handleDriveImgError(this, '${driveId || ''}')" referrerpolicy="no-referrer" loading="lazy">
      <div class="gallery-overlay">
        <span style="font-size:.75rem;color:var(--accent-gold);font-weight:700">${item.category}</span>
        <div class="gallery-caption">${item.title}</div>
      </div>
    </div>`;
  }).join('');
}

/* ── Universal Media Viewer (image + PDF iframe) ─────────────── */
function openViewer(rawUrl, title, caption, type) {
  const modal   = document.getElementById('viewerModal');
  const imgEl   = document.getElementById('viewerImg');
  const ifrEl   = document.getElementById('viewerIframe');
  const titleEl = document.getElementById('viewerTitle');
  const capEl   = document.getElementById('viewerCaption');

  if (!modal) return;
  if (titleEl) titleEl.textContent = title || '';
  if (capEl)   capEl.textContent   = caption || '';

  const isPdf = type === 'pdf';
  imgEl.style.display  = isPdf ? 'none' : 'block';
  ifrEl.style.display  = isPdf ? 'block' : 'none';

  if (isPdf) {
    ifrEl.src = isDriveUrl(rawUrl) ? convertDriveUrl(rawUrl, 'pdf') : rawUrl;
  } else {
    const driveId = isDriveUrl(rawUrl) ? getDriveId(rawUrl) : null;
    imgEl.onerror = () => { handleDriveImgError(imgEl, driveId); };
    imgEl.src = isDriveUrl(rawUrl) ? convertDriveUrl(rawUrl, 'image') : rawUrl;
  }
  modal.classList.add('active');
}

function closeViewer() {
  const modal = document.getElementById('viewerModal');
  if (modal) {
    modal.classList.remove('active');
    const ifr = document.getElementById('viewerIframe');
    if (ifr) ifr.src = '';
  }
}

/* ── Contact Form Submission ──────────────────────────────────── */
async function handlePublicContactSubmit(e) {
  e.preventDefault();
  const inq = {
    id:      'inq-' + Date.now(),
    name:    document.getElementById('contactName').value.trim(),
    email:   document.getElementById('contactEmail').value.trim(),
    phone:   (document.getElementById('contactPhone')?.value || '').trim(),
    subject: (document.getElementById('contactSubject')?.value || 'Portfolio Inquiry').trim(),
    message: document.getElementById('contactMessage').value.trim(),
    status:  'NEW',
    date:    new Date().toLocaleDateString('en-GB')
  };
  await DB.submitInquiry(inq);
  e.target.reset();
  alert('Thank you! Your message has been sent to Vijay Kumar, Headmaster.');
  closeSubpage();
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN PANEL — CMS Part B
   ═══════════════════════════════════════════════════════════════ */

/* ── Tab Switcher ─────────────────────────────────────────────── */
function switchAdminTab(name) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const sel = document.querySelector(`.admin-tab[data-tab="${name}"]`);
  if (sel) sel.classList.add('active');
  document.querySelectorAll('.admin-tab-content').forEach(p => p.style.display = 'none');
  const panel = document.getElementById(`adminTab_${name}`);
  if (panel) panel.style.display = 'block';
}

/* ── Dashboard Overview Stats & Profile ──────────────────────── */
function renderAdminDashboard() {
  const d = DB.getData();
  _setNum('adminStatAnnouncements', d.announcements?.length || 0);
  _setNum('adminStatResources',     d.resources?.length || 0);
  _setNum('adminStatInitiatives',   d.initiatives?.length || 0);
  _setNum('adminStatGallery',       d.gallery?.length || 0);
  _setNum('adminStatInquiries',     d.inquiries?.length || 0);

  const user = Auth.getUser();
  _setText('adminUserDisplay', user ? user.displayName : 'Administrator');
  _setText('adminWorkplaceDisplay', `Headmaster: ${d.profile?.name || 'Vijay Kumar'} • ${d.profile?.school || 'PM SHRI KV Suranussi'}`);

  populateProfileForm(d.profile);
  renderAdminMenusList(d.menus || []);
  renderAdminAnnouncementsList(d.announcements || []);
  renderAdminResourcesList(d.resources || []);
  renderAdminInitiativesList(d.initiatives || []);
  renderAdminGalleryList(d.gallery || []);
  renderAdminInquiriesList(d.inquiries || []);
  refreshCategoryDropdowns();
  populateSupabaseConfigUI();
}

function populateProfileForm(prof) {
  if (!prof) return;
  _setVal('profName',           prof.name);
  _setVal('profRole',           prof.role);
  _setVal('profSchool',         prof.school);
  _setVal('profStage',          prof.stage);
  _setVal('profMotto',          prof.motto);
  _setVal('profBio',            prof.bio);
  _setVal('profQuote',          prof.quote);
  _setVal('profQualifications', prof.qualifications);
  _setVal('profRoles',          prof.responsibilities);
  _setVal('profJourney',        prof.journey);
  _setVal('profVision',         prof.vision);
  _setVal('profEmail',          prof.email);
  _setVal('profPhone',          prof.phone);
  _setVal('profAddress',        prof.address);
  _setVal('profFacebook',       prof.facebook || 'https://facebook.com');
  _setVal('profYoutube',        prof.youtube || 'https://youtube.com');
  _setVal('profInstagram',      prof.instagram || 'https://instagram.com');
}

function handleSaveProfile(e) {
  e.preventDefault();
  const d = DB.getData();
  if (!d.profile) d.profile = {};

  d.profile.name             = document.getElementById('profName').value.trim();
  d.profile.role             = document.getElementById('profRole').value.trim();
  d.profile.school           = document.getElementById('profSchool').value.trim();
  d.profile.stage            = document.getElementById('profStage').value.trim();
  d.profile.motto            = document.getElementById('profMotto').value.trim();
  d.profile.bio              = document.getElementById('profBio').value.trim();
  d.profile.quote            = document.getElementById('profQuote').value.trim();
  d.profile.qualifications   = document.getElementById('profQualifications').value.trim();
  d.profile.responsibilities = document.getElementById('profRoles').value.trim();
  d.profile.journey          = document.getElementById('profJourney').value.trim();
  d.profile.vision           = document.getElementById('profVision').value.trim();
  d.profile.email            = document.getElementById('profEmail').value.trim();
  d.profile.phone            = document.getElementById('profPhone').value.trim();
  d.profile.address          = document.getElementById('profAddress').value.trim();
  d.profile.facebook         = document.getElementById('profFacebook').value.trim() || 'https://facebook.com';
  d.profile.youtube          = document.getElementById('profYoutube').value.trim() || 'https://youtube.com';
  d.profile.instagram        = document.getElementById('profInstagram').value.trim() || 'https://instagram.com';

  DB.saveData(d);
  renderAllSections();
  _toast('Profile and social media links saved successfully!');
}

/* ── Tab: Navigation Menus ────────────────────────────────────── */
function renderAdminMenusList(menus) {
  const tbody = document.getElementById('adminMenusTableBody');
  if (!tbody) return;
  if (!menus || !Array.isArray(menus) || !menus.length) {
    const d = DB.getData();
    menus = d.menus || (typeof DEFAULT_SEED_DATA !== 'undefined' ? DEFAULT_SEED_DATA.menus : []);
  }
  if (!menus || !menus.length) return;

  tbody.innerHTML = menus.map(m => `
    <tr style="border-bottom:1px solid var(--border-color);">
      <td style="padding:0.75rem 1rem;">
        <span style="font-family:monospace;font-size:0.82rem;background:var(--bg-card);padding:0.25rem 0.6rem;border-radius:4px;border:1px solid var(--border-color);color:var(--accent-gold);font-weight:700">
          ${m.href}
        </span>
      </td>
      <td style="padding:0.75rem 1rem;">
        <input type="text" id="menuLabelInput_${m.id}" class="form-control" data-id="${m.id}" value="${_escapeHtml(m.label)}" placeholder="${m.defaultLabel || m.label}" oninput="syncCardTitleInput('${m.id}')" required style="font-weight:600;">
      </td>
      <td style="padding:0.75rem 1rem;">
        <input type="text" id="cardTitleInput_${m.id}" class="form-control" data-id="${m.id}" value="${_escapeHtml(m.cardTitle || m.label)}" placeholder="${m.cardTitle || m.label}" oninput="this.dataset.userEdited='true'" style="font-weight:600;">
      </td>
      <td style="padding:0.75rem 1rem;">
        <input type="text" id="cardDescInput_${m.id}" class="form-control" data-id="${m.id}" value="${_escapeHtml(m.cardDesc || '')}" placeholder="Optional subtitle / badge text" style="font-size:0.85rem;">
      </td>
      <td style="padding:0.75rem 1rem;text-align:center;">
        <button type="button" class="btn-secondary" style="padding:0.35rem 0.7rem;font-size:0.8rem" onclick="resetSingleMenu('${m.id}')" title="Reset to original">
          <i class="fas fa-undo"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function syncCardTitleInput(id) {
  const navInp = document.getElementById(`menuLabelInput_${id}`);
  const cardTitleInp = document.getElementById(`cardTitleInput_${id}`);
  if (navInp && cardTitleInp && !cardTitleInp.dataset.userEdited) {
    cardTitleInp.value = navInp.value;
  }
}

function resetSingleMenu(id) {
  const def = typeof DEFAULT_SEED_DATA !== 'undefined' ? DEFAULT_SEED_DATA.menus.find(x => x.id === id) : null;
  if (def) {
    const navInp = document.getElementById(`menuLabelInput_${id}`);
    if (navInp) navInp.value = def.defaultLabel || def.label;
    const cardTitleInp = document.getElementById(`cardTitleInput_${id}`);
    if (cardTitleInp) {
      cardTitleInp.value = def.cardTitle || def.label;
      delete cardTitleInp.dataset.userEdited;
    }
    const cardDescInp = document.getElementById(`cardDescInput_${id}`);
    if (cardDescInp) cardDescInp.value = def.cardDesc || '';
  }
}

function handleSaveMenus(e) {
  if (e) e.preventDefault();
  const d = DB.getData();
  if (!d.menus || !d.menus.length) {
    d.menus = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.menus));
  }

  d.menus = d.menus.map(item => {
    const navInp = document.getElementById(`menuLabelInput_${item.id}`);
    const cardTitleInp = document.getElementById(`cardTitleInput_${item.id}`);
    const cardDescInp = document.getElementById(`cardDescInput_${item.id}`);

    const navVal = navInp ? navInp.value.trim() : item.label;
    const cardTitleVal = cardTitleInp ? cardTitleInp.value.trim() : '';
    const cardDescVal = cardDescInp ? cardDescInp.value.trim() : '';

    return {
      ...item,
      label: navVal || item.defaultLabel || item.label,
      cardTitle: cardTitleVal || navVal || item.cardTitle || item.label,
      cardDesc: cardDescVal || item.cardDesc || ''
    };
  });

  DB.saveData(d);
  renderNavigationMenus(d.menus);
  renderAdminMenusList(d.menus);
  _toast('Navigation menus & linked cards saved successfully!');
}

function handleResetMenus() {
  if (!confirm('Are you sure you want to reset all navigation menu names and card titles to their defaults?')) return;
  const d = DB.getData();
  d.menus = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.menus));
  DB.saveData(d);
  renderNavigationMenus(d.menus);
  renderAdminMenusList(d.menus);
  _toast('Navigation menu names and cards reset to defaults.');
}

/* ── Tab: Initiatives ─────────────────────────────────────────── */
function renderAdminInitiativesList(list) {
  const el = document.getElementById('adminInitiativesList');
  if (!el) return;
  if (!list.length) { el.innerHTML = `<p class="text-muted">No initiatives added.</p>`; return; }
  el.innerHTML = list.map(it => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border-color)">
      <div>
        <strong><i class="fas ${it.icon || 'fa-star'}" style="color:var(--accent-gold);margin-right:.4rem"></i>${it.title}</strong>
        <p style="font-size:.85rem;color:var(--text-muted)">${it.category} • ${it.summary.substring(0,60)}…</p>
      </div>
      <button onclick="deleteInitiative('${it.id}')" style="background:var(--accent-crimson);color:#fff;padding:.4rem .8rem;border-radius:var(--radius-sm);border:none;cursor:pointer">
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>`).join('');
}

function updateInitIconPreview(val) {
  const customInput = document.getElementById('initIcon');
  const ico = document.getElementById('initIconPreviewIco');
  if (val === '__custom__') {
    if (customInput) {
      customInput.style.display = 'block';
      customInput.value = '';
      customInput.focus();
    }
  } else {
    if (customInput) {
      customInput.style.display = 'none';
      customInput.value = val;
    }
    if (ico) {
      ico.className = 'fas ' + (val || 'fa-star');
    }
  }
}

function handleAddInitiative(e) {
  e.preventDefault();
  const data = DB.getData();
  const imgUrl = document.getElementById('initImage').value;
  data.initiatives.push({
    id:       'init-' + Date.now(),
    title:    document.getElementById('initTitle').value,
    category: document.getElementById('initCategory').value,
    icon:     document.getElementById('initIcon').value || 'fa-star',
    image:    imgUrl,
    summary:  document.getElementById('initSummary').value,
    details:  document.getElementById('initDetails').value,
  });
  DB.saveData(data);
  e.target.reset();

  // Reset icon selection & previews
  const sel = document.getElementById('initIconSelect');
  if (sel) sel.value = 'fa-book-reader';
  const customInput = document.getElementById('initIcon');
  if (customInput) { customInput.value = 'fa-book-reader'; customInput.style.display = 'none'; }
  const previewIco = document.getElementById('initIconPreviewIco');
  if (previewIco) previewIco.className = 'fas fa-book-reader';
  const imgPrev = document.getElementById('initImgPrev');
  if (imgPrev) imgPrev.style.display = 'none';

  _toast('Initiative added!');
}
function deleteInitiative(id) {
  if (!confirm('Delete this initiative?')) return;
  const data = DB.getData();
  data.initiatives = data.initiatives.filter(i => i.id !== id);
  DB.saveData(data);
}

/* ── Category Management Helpers ─────────────────────────────── */
const DEFAULT_CATEGORIES = {
  gal: ['Events & Celebrations', 'Awards & Certificates', 'Classroom & FLN Moments', 'Toy Pedagogy & Workshops', 'Student Showcases'],
  res: ['Worksheets', 'Lesson Plans', 'CCT & HOTS Question Banks', 'Assessment Tools', 'Phonics & FLN Aids', 'Teacher Handbooks'],
  newAnn: ['Assessment', 'Training & CPD', 'Teaching Resources', 'FLN & NIPUN', 'Pedagogy', 'School Events', 'Workshops']
};

function refreshCategoryDropdowns() {
  const data = DB.getData();
  
  // Gallery categories
  const galExisting = (data.gallery || []).map(g => g.category).filter(Boolean);
  const galCats = Array.from(new Set([...DEFAULT_CATEGORIES.gal, ...galExisting]));
  _populateCategorySelect('galCategory', galCats);

  // Resources categories
  const resExisting = (data.resources || []).map(r => r.category).filter(Boolean);
  const resCats = Array.from(new Set([...DEFAULT_CATEGORIES.res, ...resExisting]));
  _populateCategorySelect('resCategory', resCats);

  // Announcement categories
  const annExisting = (data.announcements || []).map(a => a.category).filter(Boolean);
  const annCats = Array.from(new Set([...DEFAULT_CATEGORIES.newAnn, ...annExisting]));
  _populateCategorySelect('newAnnCategory', annCats);
}

function _populateCategorySelect(selectId, categories) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const currentVal = sel.value;
  sel.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('') +
                  `<option value="__new__">➕ + Add New Category...</option>`;
  if (currentVal && categories.includes(currentVal)) {
    sel.value = currentVal;
  }
}

function handleCategorySelectChange(prefix, val) {
  const group = document.getElementById(prefix + 'NewCategoryGroup');
  const input = document.getElementById(prefix + 'NewCategory');
  if (val === '__new__') {
    if (group) group.style.display = 'block';
    if (input) { input.value = ''; input.focus(); }
  } else {
    if (group) group.style.display = 'none';
  }
}

function toggleNewCategoryInput(prefix) {
  const sel = document.getElementById(prefix === 'newAnn' ? 'newAnnCategory' : prefix + 'Category');
  const group = document.getElementById(prefix + 'NewCategoryGroup');
  const input = document.getElementById(prefix + 'NewCategory');
  if (sel) sel.value = '__new__';
  if (group) group.style.display = 'block';
  if (input) { input.focus(); }
}

function cancelNewCategoryInput(prefix) {
  const sel = document.getElementById(prefix === 'newAnn' ? 'newAnnCategory' : prefix + 'Category');
  const group = document.getElementById(prefix + 'NewCategoryGroup');
  const input = document.getElementById(prefix + 'NewCategory');
  if (group) group.style.display = 'none';
  if (input) input.value = '';
  if (sel && sel.options.length > 0) sel.selectedIndex = 0;
}

function getEffectiveCategory(prefix) {
  const selectId = prefix === 'newAnn' ? 'newAnnCategory' : prefix + 'Category';
  const sel = document.getElementById(selectId);
  const val = sel ? sel.value : '';
  if (val === '__new__') {
    const input = document.getElementById(prefix + 'NewCategory');
    const custom = input ? input.value.trim() : '';
    if (!custom) {
      if (input) input.focus();
      return null;
    }
    return custom;
  }
  return val;
}

/* ── Tab: Gallery ─────────────────────────────────────────────── */
function renderAdminGalleryList(list) {
  const el = document.getElementById('adminGalleryList');
  if (!el) return;
  if (!list.length) { el.innerHTML = `<p class="text-muted">No gallery items.</p>`; return; }
  el.innerHTML = list.map(g => {
    const isDrive = isDriveUrl(g.srcUrl);
    const driveId = isDrive ? getDriveId(g.srcUrl) : null;
    const preview = isDrive ? convertDriveUrl(g.srcUrl, 'image') : (g.srcUrl || '');
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border-color);gap:1rem">
      <div style="display:flex;gap:1rem;align-items:center">
        ${preview ? `<img src="${preview}" onerror="handleDriveImgError(this, '${driveId || ''}')" referrerpolicy="no-referrer" style="width:60px;height:45px;object-fit:cover;border-radius:6px;border:1px solid var(--border-color)">` : ''}
        <div>
          <strong>${g.title}</strong>
          <p style="font-size:.8rem;color:var(--text-muted)">${g.category} • ${g.type || 'photo'}</p>
        </div>
      </div>
      <button onclick="deleteGalleryItem('${g.id}')" style="background:var(--accent-crimson);color:#fff;padding:.4rem .8rem;border-radius:var(--radius-sm);border:none;cursor:pointer;flex-shrink:0">
        <i class="fas fa-trash"></i>
      </button>
    </div>`;
  }).join('');
}

function handleAddGalleryItem(e) {
  e.preventDefault();
  const category = getEffectiveCategory('gal');
  if (!category) {
    _toast('Please enter the new category name.', 'error');
    return;
  }
  const data = DB.getData();
  data.gallery.push({
    id:       'gal-' + Date.now(),
    title:    document.getElementById('galTitle').value,
    category: category,
    type:     'photo',
    srcUrl:   document.getElementById('galUrl').value,
    caption:  document.getElementById('galCaption').value,
  });
  DB.saveData(data);
  e.target.reset();
  cancelNewCategoryInput('gal');
  refreshCategoryDropdowns();
  _toast(`Gallery photo added in "${category}"!`);
}

function deleteGalleryItem(id) {
  if (!confirm('Remove this gallery item?')) return;
  const data = DB.getData();
  data.gallery = data.gallery.filter(g => g.id !== id);
  DB.saveData(data);
  refreshCategoryDropdowns();
}

/* ── Tab: Resources ───────────────────────────────────────────── */
function renderAdminResourcesList(list) {
  const el = document.getElementById('adminResourcesList');
  if (!el) return;
  if (!list.length) { el.innerHTML = `<p class="text-muted">No resources added.</p>`; return; }
  el.innerHTML = list.map(r => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border-color)">
      <div>
        <strong>${r.title}</strong>
        <p style="font-size:.8rem;color:var(--text-muted)">${r.category} • ${r.fileType} • ${r.date}</p>
        <p style="font-size:.75rem;color:var(--accent-blue);word-break:break-all">${r.srcUrl !== '#' ? r.srcUrl.substring(0,60) + '…' : 'No link'}</p>
      </div>
      <button onclick="deleteResource('${r.id}')" style="background:var(--accent-crimson);color:#fff;padding:.4rem .8rem;border-radius:var(--radius-sm);border:none;cursor:pointer;flex-shrink:0">
        <i class="fas fa-trash"></i>
      </button>
    </div>`).join('');
}

function handleAddResource(e) {
  e.preventDefault();
  const category = getEffectiveCategory('res');
  if (!category) {
    _toast('Please enter the new category name.', 'error');
    return;
  }
  const data = DB.getData();
  data.resources.unshift({
    id:       'res-' + Date.now(),
    title:    document.getElementById('resTitle').value,
    category: category,
    fileType: 'PDF Document',
    size:     document.getElementById('resSize').value || 'N/A',
    date:     document.getElementById('resDate').value,
    srcUrl:   document.getElementById('resUrl').value || '#',
  });
  DB.saveData(data);
  e.target.reset();
  cancelNewCategoryInput('res');
  refreshCategoryDropdowns();
  _toast(`Resource added in "${category}"!`);
}

function deleteResource(id) {
  if (!confirm('Remove this resource?')) return;
  const data = DB.getData();
  data.resources = data.resources.filter(r => r.id !== id);
  DB.saveData(data);
  refreshCategoryDropdowns();
}

/* ── Tab: Announcements ───────────────────────────────────────── */
function renderAdminAnnouncementsList(list) {
  const el = document.getElementById('adminAnnouncementsList');
  if (!el) return;
  el.innerHTML = list.map(a => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border-color)">
      <div>
        <strong>${a.title}</strong>
        <p style="font-size:.85rem;color:var(--text-muted)">${a.displayDate || a.date} • ${a.category}</p>
      </div>
      <button onclick="deleteAnnouncement('${a.id}')" style="background:var(--accent-crimson);color:#fff;padding:.4rem .8rem;border-radius:var(--radius-sm);border:none;cursor:pointer">
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>`).join('');
}

function handleAddAnnouncement(e) {
  e.preventDefault();
  const category = getEffectiveCategory('newAnn');
  if (!category) {
    _toast('Please enter the new category name.', 'error');
    return;
  }
  const data = DB.getData();
  data.announcements.unshift({
    id:          'ann-' + Date.now(),
    date:        document.getElementById('newAnnDate').value,
    displayDate: document.getElementById('newAnnDate').value,
    title:       document.getElementById('newAnnTitle').value,
    category:    category,
    badge:       document.getElementById('newAnnBadge').value,
    description: document.getElementById('newAnnDesc').value,
    linkUrl:     document.getElementById('newAnnLink').value || '#',
  });
  DB.saveData(data);
  e.target.reset();
  cancelNewCategoryInput('newAnn');
  refreshCategoryDropdowns();
  _toast(`Announcement published in "${category}"!`);
}

function deleteAnnouncement(id) {
  if (!confirm('Delete this announcement?')) return;
  const data = DB.getData();
  data.announcements = data.announcements.filter(a => a.id !== id);
  DB.saveData(data);
  refreshCategoryDropdowns();
}

/* ── Tab: Inquiries ───────────────────────────────────────────── */
function renderAdminInquiriesList(list) {
  const el = document.getElementById('adminInquiriesList');
  if (!el) return;
  if (!list.length) { el.innerHTML = `<p class="text-muted">No inquiries yet.</p>`; return; }
  el.innerHTML = list.map(inq => `
    <div style="background:var(--bg-card);padding:1.2rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
        <span style="font-weight:700">${inq.name} (<a href="mailto:${inq.email}">${inq.email}</a> • ${inq.phone})</span>
        <span class="card-badge">${inq.status}</span>
      </div>
      <h5 style="color:var(--primary);margin-bottom:.3rem">Subject: ${inq.subject}</h5>
      <p style="font-size:.9rem;color:var(--text-muted);margin-bottom:.8rem">${inq.message}</p>
      <div style="display:flex;gap:.5rem">
        <button onclick="markInquiryResponded('${inq.id}')" style="background:var(--accent-teal);color:#fff;padding:.3rem .7rem;border-radius:var(--radius-sm);font-size:.8rem;border:none;cursor:pointer">
          <i class="fas fa-check"></i> Mark Responded
        </button>
        <button onclick="deleteInquiry('${inq.id}')" style="background:var(--accent-crimson);color:#fff;padding:.3rem .7rem;border-radius:var(--radius-sm);font-size:.8rem;border:none;cursor:pointer">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>`).join('');
}
function markInquiryResponded(id) {
  const data = DB.getData();
  const inq = data.inquiries.find(i => i.id === id);
  if (inq) { inq.status = 'Responded'; DB.saveData(data); }
}
function deleteInquiry(id) {
  if (!confirm('Delete this inquiry?')) return;
  const data = DB.getData();
  data.inquiries = data.inquiries.filter(i => i.id !== id);
  DB.saveData(data);
}

/* ── Tab: Settings / Password Change ─────────────────────────── */
function handleChangePassword(e) {
  e.preventDefault();
  const curr = document.getElementById('pwdCurrent').value;
  const next = document.getElementById('pwdNew').value;
  const conf = document.getElementById('pwdConfirm').value;
  if (next !== conf) { _toast('New passwords do not match.', 'error'); return; }
  const result = Auth.changePassword(curr, next);
  if (result.success) {
    _toast('Password changed successfully!');
    e.target.reset();
  } else {
    _toast(result.error, 'error');
  }
}

/* ── Tab: Settings / Supabase Cloud Database (Render Managed) ─── */
function populateSupabaseConfigUI() {
  const status = DB.getSupabaseStatus();
  const cfg = DB.getSupabaseConfig();
  
  const urlEl = document.getElementById('spbConfiguredUrl');
  if (urlEl) {
    if (cfg.url) {
      urlEl.textContent = cfg.url;
      urlEl.title = cfg.url;
    } else {
      urlEl.textContent = 'None (Local Storage Mode)';
      urlEl.title = 'No SUPABASE_URL configured in Render Environment.';
    }
  }

  const srcEl = document.getElementById('spbConfigSource');
  if (srcEl) {
    srcEl.textContent = status.source || 'Render Environment';
  }

  const rtEl = document.getElementById('spbRealtimeStatus');
  if (rtEl) {
    if (status.isConnected) {
      rtEl.textContent = 'Active (Live Realtime Sync)';
      rtEl.style.color = '#2e7d32';
    } else if (status.isConfigured) {
      rtEl.textContent = 'Connecting...';
      rtEl.style.color = 'var(--accent-gold)';
    } else {
      rtEl.textContent = 'Disabled (Local Storage)';
      rtEl.style.color = 'var(--text-muted)';
    }
  }

  updateSupabaseStatusBadge(status);
}

function updateSupabaseStatusBadge(status) {
  const badge = document.getElementById('spbStatusBadge');
  if (!badge) return;
  if (status.isConnected) {
    badge.style.background = 'rgba(46,125,50,.15)';
    badge.style.color = '#2e7d32';
    badge.innerHTML = '<i class="fas fa-check-circle"></i> Connected via Render Env';
    badge.title = `Synced with Supabase at ${status.lastSync || 'now'}`;
  } else if (status.isConfigured) {
    badge.style.background = 'rgba(198,40,40,.15)';
    badge.style.color = 'var(--accent-crimson)';
    badge.innerHTML = '<i class="fas fa-exclamation-circle"></i> Connection Failed';
    badge.title = status.lastError || 'Could not connect to Supabase';
  } else {
    badge.style.background = 'rgba(230,171,44,.15)';
    badge.style.color = 'var(--accent-gold)';
    badge.innerHTML = '<i class="fas fa-hard-drive"></i> Local Storage Mode';
    badge.title = 'No SUPABASE_URL/SUPABASE_ANON_KEY configured in Render environment.';
  }
}

async function handleTestSupabase(e) {
  if (e) e.preventDefault();
  const status = DB.getSupabaseStatus();
  if (!status.isConfigured) {
    _toast('No Supabase credentials configured in Render environment.', 'error');
    return;
  }
  const badge = document.getElementById('spbStatusBadge');
  if (badge) badge.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Testing...';

  const testRes = await DB.testSupabaseConnection();
  if (testRes.success) {
    _toast('Supabase connection verified! site_content table is ready.');
  } else {
    _toast('Supabase error: ' + testRes.error, 'error');
  }
  updateSupabaseStatusBadge(DB.getSupabaseStatus());
  populateSupabaseConfigUI();
}

async function handlePushToCloud(e) {
  if (e) e.preventDefault();
  const status = DB.getSupabaseStatus();
  if (!status.isConfigured) {
    _toast('Configure SUPABASE_URL & SUPABASE_ANON_KEY on Render first.', 'error');
    return;
  }
  try {
    _toast('Pushing local data to cloud database...');
    await DB.pushToSupabase();
    _toast('Cloud database successfully updated with current portal data!');
  } catch (err) {
    _toast('Push failed: ' + err.message, 'error');
  }
}

async function handlePullFromCloud(e) {
  if (e) e.preventDefault();
  const status = DB.getSupabaseStatus();
  if (!status.isConfigured) {
    _toast('Configure SUPABASE_URL & SUPABASE_ANON_KEY on Render first.', 'error');
    return;
  }
  try {
    _toast('Pulling latest data from cloud...');
    const res = await DB.pullFromSupabase(false);
    if (res.autoSeeded) {
      _toast('Cloud was empty; initialized with current school data!');
    } else {
      _toast('Pulled and synced latest cloud content!');
    }
  } catch (err) {
    _toast('Pull failed: ' + err.message, 'error');
  }
}

/* ── Export / Reset ───────────────────────────────────────────── */
function exportAppData() {
  const d = DB.getData();
  const cleanName = (d.profile?.name || 'vijaysirkvs')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);
  const blob = new Blob([DB.exportJSON()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanName}_Backup_${Date.now()}.json`;
  a.click();
}
function resetAppData() {
  if (!confirm('Reset ALL website data to official seed defaults? This cannot be undone.')) return;
  DB.resetToDefault();
  _toast('Data reset to defaults.');
}

/* ── Toast Helper ─────────────────────────────────────────────── */
function _toast(msg, type = 'success') {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `admin-toast ${type === 'error' ? 'toast-error' : 'toast-success'}`;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

/* ── Drive URL Preview Helper ─────────────────────────────────── */
function previewDriveInput(inputId, previewId) {
  const input = document.getElementById(inputId);
  const raw = input?.value?.trim();
  const prev = document.getElementById(previewId);
  if (!prev) return;

  if (!raw || raw === '#') {
    prev.style.display = 'none';
    _toast('Please enter an image URL first.', 'error');
    return;
  }

  // Create or reuse feedback message element
  let fb = document.getElementById(previewId + '_fb');
  if (!fb) {
    fb = document.createElement('div');
    fb.id = previewId + '_fb';
    fb.style.marginTop = '0.5rem';
    fb.style.fontSize = '0.85rem';
    prev.parentNode.insertBefore(fb, prev.nextSibling);
  }
  fb.innerHTML = `<span style="color:var(--primary);font-weight:600"><i class="fas fa-spinner fa-spin"></i> Fetching image preview...</span>`;

  const isDrive = isDriveUrl(raw);
  const driveId = isDrive ? getDriveId(raw) : null;
  const src = isDrive ? convertDriveUrl(raw, 'image') : raw;

  prev.dataset.triedLh3 = '';
  prev.dataset.triedThumb = '';
  prev.dataset.triedFallback = '';
  prev.setAttribute('referrerpolicy', 'no-referrer');
  prev.style.display = 'block';
  prev.style.maxHeight = '180px';
  prev.style.borderRadius = 'var(--radius-sm)';
  prev.style.border = '2px solid var(--accent-gold)';
  prev.style.objectFit = 'contain';
  prev.style.background = '#f8f9fa';
  prev.src = src;

  prev.onload = () => {
    if (fb) fb.innerHTML = `<span style="color:var(--accent-teal);font-weight:600"><i class="fas fa-check-circle"></i> Preview loaded successfully!</span>`;
  };

  prev.onerror = () => {
    if (driveId && !prev.dataset.triedLh3) {
      prev.dataset.triedLh3 = '1';
      prev.src = `https://lh3.googleusercontent.com/d/${driveId}`;
      return;
    }
    if (driveId && !prev.dataset.triedThumb) {
      prev.dataset.triedThumb = '1';
      prev.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
      return;
    }
    if (fb) {
      fb.innerHTML = `<span style="color:var(--accent-crimson);line-height:1.4"><i class="fas fa-exclamation-triangle"></i> Image could not be loaded. Please ensure: <br>1. Google Drive permission is set to <strong>"Anyone with the link can view"</strong>.<br>2. If using Brave Browser, toggle <strong>Brave Shields OFF</strong> for this page. <a href="${raw}" target="_blank" style="color:var(--accent-blue);text-decoration:underline">Test link in new tab &rarr;</a></span>`;
    }
  };
}
