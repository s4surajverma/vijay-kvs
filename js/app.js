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
});

/* ── Google Drive URL Converter ──────────────────────────────── */
function convertDriveUrl(raw, type = 'image') {
  if (!raw || raw === '#' || !raw.includes('drive.google.com')) return raw;
  let id = null;
  const patterns = [/\/file\/d\/([^/?#]+)/, /[?&]id=([^&]+)/, /\/d\/([^/?#]+)/];
  for (const p of patterns) { const m = raw.match(p); if (m) { id = m[1]; break; } }
  if (!id) return raw;
  if (type === 'image') return `https://drive.google.com/uc?export=view&id=${id}`;
  if (type === 'pdf')   return `https://drive.google.com/file/d/${id}/preview`;
  return raw;
}

function isDriveUrl(url) { return url && url.includes('drive.google.com'); }

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
  const btn = document.getElementById('navLoginBtn');
  if (!btn) return;
  if (in_) {
    btn.innerHTML = `<i class="fas fa-tachometer-alt"></i> Dashboard`;
  } else {
    btn.innerHTML = `<i class="fas fa-user-lock"></i> Login`;
  }
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
  document.getElementById('publicView').style.display = 'none';
  const av = document.getElementById('adminView');
  av.classList.add('active');
  renderAdminDashboard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function exitAdminView() {
  Auth.logout();
  _setNavLoggedIn(false);
  document.getElementById('adminView').classList.remove('active');
  document.getElementById('publicView').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Render All Public Sections ──────────────────────────────── */
function renderAllSections() {
  const d = DB.getData();
  renderTicker(d.announcements);
  renderHeroSection(d.heroSection);
  renderStatsBar(d.statsBar);
  renderSchoolInfo(d.schoolInfo);
  renderPrincipalMessage(d.principalMessage);
  renderAnnouncements(d.announcements);
  renderInitiatives(d.initiatives);
  renderStaffDirectory(d.staff);
  renderGallery(d.gallery);
  renderResources(d.resources);
}

/* ── Hero Section ─────────────────────────────────────────────── */
function renderHeroSection(h) {
  if (!h) return;
  const badge = document.getElementById('heroBadgeText');
  const title = document.getElementById('heroTitleText');
  const span  = document.getElementById('heroTitleSpan');
  const desc  = document.getElementById('heroDescText');
  const overlay = document.getElementById('heroOverlay');

  if (badge) badge.textContent = h.badge || '';
  if (span) {
    if (h.title && h.title.toLowerCase().startsWith('welcome to ')) {
      span.textContent = h.title.substring(11);
    } else {
      span.textContent = h.title || '';
    }
  } else if (title) {
    title.textContent = h.title || '';
  }
  if (desc) desc.textContent = h.description || '';

  if (overlay) {
    const bg = h.backgroundImage || 'assets/images/kv_campus.jpg';
    const bgUrl = isDriveUrl(bg) ? convertDriveUrl(bg, 'image') : bg;
    overlay.style.backgroundImage = `url('${bgUrl}')`;
  }
}

/* ── Stats Bar ───────────────────────────────────────────────── */
function renderStatsBar(stats) {
  const grid = document.getElementById('statsBarGrid');
  if (!grid || !stats) return;
  grid.innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="stat-number">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('');
}

/* ── Ticker ──────────────────────────────────────────────────── */
function renderTicker(items) {
  const el = document.getElementById('tickerContent');
  if (!el || !items) return;
  const html = items.map(a => `
    <div class="ticker-item">
      <i class="fas fa-bullhorn" style="color:var(--accent-gold)"></i>
      <strong>[${a.displayDate || a.date}]</strong> ${a.title}
      ${a.linkUrl && a.linkUrl !== '#' ? `<a href="${a.linkUrl}" target="_blank">View <i class="fas fa-external-link-alt"></i></a>` : ''}
    </div>`).join('');
  el.innerHTML = html + html;
}

/* ── School Info ──────────────────────────────────────────────── */
function renderSchoolInfo(info) {
  if (!info) return;
  _setText('schoolNameText', info.name);
  _setText('schoolTaglineText', info.tagline || `${info.sector || 'Defense Sector'} • Est. ${info.established || '1979'} • ${info.affiliation || ''}`);
  
  // Badge handling
  const badgeTag  = document.getElementById('schoolBadgeTag');
  const badgeIcon = document.getElementById('schoolBadgeIcon');
  const badgeText = document.getElementById('schoolBadgeText');
  
  if (badgeTag) {
    if (info.showBadge === false) {
      badgeTag.style.display = 'none';
    } else {
      badgeTag.style.display = 'inline-flex';
      const isPm = info.isPmShri !== false;
      if (isPm) {
        badgeTag.className = 'school-badge-tag badge-pm-shri';
        if (badgeIcon) badgeIcon.className = 'fas fa-certificate';
        if (badgeText) badgeText.textContent = info.badgeText || 'PM SHRI CENTER OF EDUCATIONAL EXCELLENCE';
      } else {
        badgeTag.className = 'school-badge-tag badge-normal-kv';
        if (badgeIcon) badgeIcon.className = 'fas fa-award';
        if (badgeText) badgeText.textContent = info.badgeText || 'KENDRIYA VIDYALAYA SANGATHAN • CENTER OF EXCELLENCE';
      }
    }
  }

  // Navigation initiatives text
  _setText('navInitiativesText', info.isPmShri !== false ? 'PM SHRI Initiatives' : 'Key Initiatives');

  // Hero primary button
  const heroBtn = document.getElementById('heroPrimaryBtn');
  if (heroBtn) heroBtn.innerHTML = `<i class="fas fa-compass"></i> ${info.isPmShri !== false ? 'Explore PM SHRI Initiatives' : 'Explore Key Initiatives'}`;

  // About section
  _setText('aboutTitleText', `About ${info.name || 'Our Vidyalaya'}`);
  _setText('aboutSubtitleText', info.subtitle || `A premier ${info.sector || 'Defense Sector'} Kendriya Vidyalaya in ${info.region || 'Jalandhar Region'}`);
  _setText('schoolHistoryText', info.history);
  _setText('schoolVisionText',  info.vision);
  _setText('schoolMissionText', info.mission);

  const campusImg = document.getElementById('aboutCampusImg');
  if (campusImg) {
    const cImg = info.campusImage || 'assets/images/kv_campus.jpg';
    campusImg.src = isDriveUrl(cImg) ? convertDriveUrl(cImg, 'image') : cImg;
  }

  // Initiatives section title
  _setText('initiativesTitleText', info.isPmShri !== false ? 'PM SHRI Key Initiatives' : 'Key Vidyalaya Initiatives');

  // Gallery subtitle
  _setText('gallerySubtitle', `Capturing the vibrant learning environment at ${info.shortName || info.name}`);

  // Contact details
  _setText('contactAddressText', info.address || '');
  _setText('contactPhoneText',   info.phone || '');
  _setText('contactEmailText',   info.email || '');
  _setText('contactHoursText',   info.workingHours || 'Monday - Saturday: 7:30 AM - 1:40 PM');

  // Footer
  _setText('footerSchoolName', info.name);
  _setText('footerSchoolDesc', info.footerDescription || `Empowering children through quality education, national integration, and innovative pedagogy. A premier ${info.isPmShri !== false ? 'PM SHRI ' : ''}Kendriya Vidyalaya.`);
  _setText('footerCopyright',  `© ${new Date().getFullYear()} ${info.name}. All Rights Reserved. Designed with modern web standards.`);
  _setText('footerInitiativesLink', info.isPmShri !== false ? 'PM SHRI Initiatives' : 'Key Initiatives');

  // Website Managed By Attribution
  const mb = info.managedBy || { name: 'Vijay Kumar', designation: 'HM', kvName: 'PM SHRI KV Suranussi', show: true };
  const mbSec = document.getElementById('footerManagedBySection');
  if (mbSec) {
    if (mb.show === false) {
      mbSec.style.display = 'none';
    } else {
      mbSec.style.display = 'flex';
      _setText('footerManagedByName', mb.name || 'Vijay Kumar');
      _setText('footerManagedByDesig', mb.designation || 'HM');
      _setText('footerManagedByKv', mb.kvName || info.shortName || info.name || 'PM SHRI KV Suranussi');
    }
  }

  // Page title & meta
  document.title = `${info.name} | Administrator Web Portal`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', `Official Portal of ${info.name}. Excellence in education, holistic pedagogy, and academic development.`);

  // Admin workplace display
  _setText('adminWorkplaceDisplay', `Current Workplace: ${info.shortName || info.name}`);
  _setText('loginModalSubtitle', `${info.shortName || info.name} — Content Management`);
}
function _setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val || ''; }

/* ── Principal ───────────────────────────────────────────────── */
function renderPrincipalMessage(p) {
  if (!p) return;
  _setText('principalName',  p.name);
  _setText('principalTitle', p.title);
  const q = document.getElementById('principalQuote');
  if (q) q.textContent = `"${p.quote}"`;
  const img = document.getElementById('principalImg');
  if (img) img.src = isDriveUrl(p.image) ? convertDriveUrl(p.image, 'image') : (p.image || 'assets/images/principal.png');
  const content = document.getElementById('principalContent');
  if (content) content.innerHTML = p.content.split('\n\n').map(para => `<p style="margin-bottom:1rem">${para.replace(/\n/g,'<br>')}</p>`).join('');
}

/* ── Announcements ───────────────────────────────────────────── */
function renderAnnouncements(list) {
  const el = document.getElementById('announcementsContainer');
  if (!el) return;
  if (!list || !list.length) { el.innerHTML = `<p class="text-muted">No announcements currently.</p>`; return; }
  el.innerHTML = list.map(a => {
    const parts = (a.displayDate || a.date).split('.');
    return `<div class="announcement-card">
      <div class="ann-date-box">
        <span class="ann-date-day">${parts[0] || '01'}</span>
        <span class="ann-date-sub">${parts.slice(1).join('/') || '01/2025'}</span>
      </div>
      <div class="ann-info">
        <div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.3rem">
          ${a.badge ? `<span class="card-badge">${a.badge}</span>` : ''}
          <span style="font-size:.8rem;color:var(--accent-gold);font-weight:600">${a.category}</span>
        </div>
        <h4>${a.title}</h4>
        <p>${a.description}</p>
        ${a.linkUrl && a.linkUrl !== '#' ? `<a href="${a.linkUrl}" target="_blank" style="display:inline-block;margin-top:.6rem;color:var(--accent-blue);font-weight:600;font-size:.88rem">Access Circular <i class="fas fa-arrow-right"></i></a>` : ''}
      </div>
    </div>`;
  }).join('');
}

/* ── Initiatives ─────────────────────────────────────────────── */
function renderInitiatives(list) {
  const navDropdown = document.getElementById('navInitiativesDropdown');
  if (navDropdown && list) {
    navDropdown.innerHTML = list.slice(0, 6).map(item => `
      <a href="#initiatives" class="dropdown-link">
        <i class="fas ${item.icon || 'fa-rocket'}" style="margin-right:.4rem;color:var(--accent-gold)"></i> ${item.title}
      </a>
    `).join('') + `<a href="#initiatives" class="dropdown-link" style="border-top:1px solid var(--border-color);font-weight:700">Explore All Initiatives <i class="fas fa-arrow-right"></i></a>`;
  }

  const el = document.getElementById('initiativesContainer');
  if (!el || !list) return;
  el.innerHTML = list.map(i => {
    const imgSrc = isDriveUrl(i.image) ? convertDriveUrl(i.image, 'image') : (i.image || 'assets/images/pm_shri.png');
    return `<div class="card">
      <div class="card-img-wrapper"><img src="${imgSrc}" class="card-img" alt="${i.title}"></div>
      <div class="card-body">
        <span class="card-badge"><i class="fas ${i.icon || 'fa-star'}"></i> ${i.category}</span>
        <h3 class="card-title">${i.title}</h3>
        <p class="card-text">${i.summary}</p>
        <p style="font-size:.88rem;color:var(--text-muted);border-top:1px solid var(--border-color);padding-top:.8rem;margin-top:auto">${i.details}</p>
      </div>
    </div>`;
  }).join('');
}

/* ── Staff Directory ──────────────────────────────────────────── */
function renderStaffDirectory(list, q = '') {
  const el = document.getElementById('staffTableBody');
  if (!el || !list) return;
  const f = list.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    s.designation.toLowerCase().includes(q.toLowerCase()) ||
    s.department.toLowerCase().includes(q.toLowerCase())
  );
  if (!f.length) { el.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem">No staff found.</td></tr>`; return; }
  el.innerHTML = f.map(m => `<tr>
    <td><strong>${m.name}</strong></td>
    <td><span class="card-badge">${m.designation}</span></td>
    <td>${m.department}</td>
    <td>${m.qualification || 'N/A'}</td>
    <td><a href="mailto:${m.email}" style="color:var(--accent-blue)"><i class="fas fa-envelope"></i> ${m.email}</a></td>
  </tr>`).join('');
}

/* ── Gallery ──────────────────────────────────────────────────── */
function renderGallery(list, cat = 'All') {
  const container = document.getElementById('galleryFilterContainer');
  const grid = document.getElementById('galleryGrid');
  if (!list) return;

  // Dynamically build filter buttons if container exists
  if (container) {
    const rawCategories = list.map(i => i.category).filter(Boolean);
    const uniqueCats = ['All', ...new Set(rawCategories)];
    container.innerHTML = uniqueCats.map(c => `
      <button class="filter-btn ${c === cat ? 'active' : ''}" onclick="renderGallery(DB.getData().gallery, '${c}')">
        ${c === 'All' ? 'All Photos' : c}
      </button>
    `).join('');
  }

  if (!grid) return;
  const items = cat === 'All' ? list : list.filter(i => i.category === cat);
  grid.innerHTML = items.map(item => {
    const src = isDriveUrl(item.srcUrl) ? convertDriveUrl(item.srcUrl, 'image') : (item.srcUrl || item.image || '');
    return `<div class="gallery-item" onclick="openViewer('${item.srcUrl}','${item.title}','${item.caption}','${item.type || 'photo'}')">
      <img src="${src}" alt="${item.title}">
      <div class="gallery-overlay">
        <span style="font-size:.75rem;color:var(--accent-gold);font-weight:700">${item.category}</span>
        <div class="gallery-caption">${item.title}</div>
      </div>
    </div>`;
  }).join('');
}

/* ── Resources ───────────────────────────────────────────────── */
function renderResources(list, search = '') {
  const el = document.getElementById('resourcesContainer');
  if (!el || !list) return;
  const f = list.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );
  el.innerHTML = f.map(r => {
    const hasSrc = r.srcUrl && r.srcUrl !== '#';
    const isDrive = isDriveUrl(r.srcUrl);
    return `<div class="card" style="padding:1.5rem;flex-direction:row;align-items:center;justify-content:space-between;gap:1rem">
      <div style="display:flex;gap:1.2rem;align-items:center">
        <div style="width:50px;height:50px;border-radius:var(--radius-sm);background:rgba(230,171,44,.15);color:var(--accent-gold-hover);display:flex;align-items:center;justify-content:center;font-size:1.5rem">
          <i class="fas fa-file-pdf"></i>
        </div>
        <div>
          <span style="font-size:.75rem;color:var(--accent-teal);font-weight:700">${r.category} • ${r.fileType} (${r.size})</span>
          <h4 style="font-size:1.05rem;margin-top:.2rem">${r.title}</h4>
          <span style="font-size:.8rem;color:var(--text-muted)">Published: ${r.date}</span>
        </div>
      </div>
      ${hasSrc
        ? isDrive
          ? `<button onclick="openViewer('${r.srcUrl}','${r.title}','','pdf')" class="btn-primary" style="padding:.6rem 1.2rem;font-size:.88rem;white-space:nowrap"><i class="fas fa-eye"></i> View PDF</button>`
          : `<a href="${r.srcUrl}" target="_blank" class="btn-primary" style="padding:.6rem 1.2rem;font-size:.88rem;white-space:nowrap"><i class="fas fa-download"></i> Download</a>`
        : `<button class="btn-secondary" disabled style="padding:.6rem 1.2rem;font-size:.88rem;opacity:.5;cursor:not-allowed"><i class="fas fa-link-slash"></i> No Link</button>`
      }
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

/* ── Contact Form ─────────────────────────────────────────────── */
async function handlePublicContactSubmit(e) {
  e.preventDefault();
  const schoolName = DB.getData().schoolInfo?.name || 'Vidyalaya';
  const inq = {
    name:    document.getElementById('contactName').value.trim(),
    email:   document.getElementById('contactEmail').value.trim(),
    phone:   document.getElementById('contactPhone').value.trim(),
    subject: document.getElementById('contactSubject').value.trim(),
    message: document.getElementById('contactMessage').value.trim()
  };
  await DB.submitInquiry(inq);
  e.target.reset();
  alert(`Thank you! Your inquiry has been submitted to ${schoolName} administration.`);
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN PANEL — Part B
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

/* ── Dashboard Overview Stats ─────────────────────────────────── */
function renderAdminDashboard() {
  const d = DB.getData();
  _setNum('adminStatAnnouncements', d.announcements.length);
  _setNum('adminStatStaff',         d.staff.length);
  _setNum('adminStatGallery',       d.gallery.length);
  _setNum('adminStatResources',     d.resources.length);
  _setNum('adminStatInquiries',     d.inquiries.length);

  const user = Auth.getUser();
  _setText('adminUserDisplay', user ? user.displayName : 'Administrator');
  _setText('adminWorkplaceDisplay', `Current Workplace: ${d.schoolInfo.shortName || d.schoolInfo.name}`);

  renderAdminAnnouncementsList(d.announcements);
  renderAdminStaffList(d.staff);
  renderAdminInquiriesList(d.inquiries);
  renderAdminGalleryList(d.gallery);
  renderAdminResourcesList(d.resources);
  populateSchoolInfoForm(d.schoolInfo);
  populateHeroStatsForm(d.heroSection, d.statsBar);
  populatePrincipalForm(d.principalMessage);
  renderAdminInitiativesList(d.initiatives);
  refreshCategoryDropdowns();
  populateSupabaseConfigUI();
}
function _setNum(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function _setChecked(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }
function _setVal(id, val) { const el = document.getElementById(id); if (el) el.value = (val !== undefined && val !== null) ? val : ''; }

/* ── Campus & Hero Photo Selection Helpers ───────────────────── */
function selectCampusPhotoType(type) {
  const inp = document.getElementById('siCampusImage');
  if (!inp) return;
  if (type === 'kv') {
    inp.value = 'assets/images/kv_campus.jpg';
  } else if (type === 'pmshri') {
    inp.value = 'assets/images/hero.png';
  } else if (type === 'custom') {
    if (inp.value === 'assets/images/kv_campus.jpg' || inp.value === 'assets/images/hero.png') {
      inp.value = '';
    }
    inp.focus();
  }
  previewDriveInput('siCampusImage', 'siCampusImgPrev');
}

function detectCampusPhotoType(val) {
  val = (val || '').trim();
  if (val === 'assets/images/kv_campus.jpg') {
    _setChecked('optCampusKv', true);
  } else if (val === 'assets/images/hero.png') {
    _setChecked('optCampusPmShri', true);
  } else {
    _setChecked('optCampusCustom', true);
  }
}

function selectHeroPhotoType(type) {
  const inp = document.getElementById('heroBgImage');
  if (!inp) return;
  if (type === 'kv') {
    inp.value = 'assets/images/kv_campus.jpg';
  } else if (type === 'pmshri') {
    inp.value = 'assets/images/hero.png';
  } else if (type === 'custom') {
    if (inp.value === 'assets/images/kv_campus.jpg' || inp.value === 'assets/images/hero.png') {
      inp.value = '';
    }
    inp.focus();
  }
  previewDriveInput('heroBgImage', 'heroBgPrev');
}

function detectHeroPhotoType(val) {
  val = (val || '').trim();
  if (val === 'assets/images/kv_campus.jpg') {
    _setChecked('optHeroKv', true);
  } else if (val === 'assets/images/hero.png') {
    _setChecked('optHeroPmShri', true);
  } else {
    _setChecked('optHeroCustom', true);
  }
}

/* ── Tab: School Info & Workplace Profile ─────────────────────── */
function populateSchoolInfoForm(info) {
  if (!info) return;
  _setVal('siName',         info.name);
  _setVal('siShortName',    info.shortName || '');
  _setVal('siAffiliation',  info.affiliation);
  _setVal('siSector',       info.sector || '');
  _setVal('siRegion',       info.region || '');
  _setVal('siEstablished',  info.established || '');
  _setVal('siBadgeText',    info.badgeText || '');
  _setVal('siTagline',      info.tagline);
  _setVal('siSubtitle',     info.subtitle || '');
  _setVal('siCampusImage',  info.campusImage || '');
  _setVal('siAddress',      info.address);
  _setVal('siPhone',        info.phone);
  _setVal('siEmail',        info.email);
  _setVal('siWorkingHours', info.workingHours || '');
  _setVal('siHistory',      info.history);
  _setVal('siVision',       info.vision);
  _setVal('siMission',      info.mission);
  _setVal('siFooterDesc',   info.footerDescription || '');

  // Website Managed By Attribution inputs
  const mb = info.managedBy || { name: 'Vijay Kumar', designation: 'HM', kvName: 'PM SHRI KV Suranussi', show: true };
  _setVal('mbName',         mb.name || 'Vijay Kumar');
  _setVal('mbDesignation',  mb.designation || 'HM');
  _setVal('mbKvName',       mb.kvName || info.shortName || info.name || 'PM SHRI KV Suranussi');
  _setVal('siMbName',       mb.name || 'Vijay Kumar');
  _setVal('siMbDesignation',mb.designation || 'HM');
  _setVal('siMbKvName',     mb.kvName || info.shortName || info.name || 'PM SHRI KV Suranussi');
  const mbShowCb = document.getElementById('mbShow');
  if (mbShowCb) mbShowCb.checked = mb.show !== false;

  const pmCheckbox = document.getElementById('siIsPmShri');
  if (pmCheckbox) pmCheckbox.checked = info.isPmShri !== false;

  const showBadgeCheck = document.getElementById('siShowBadge');
  if (showBadgeCheck) showBadgeCheck.checked = info.showBadge !== false;

  detectCampusPhotoType(info.campusImage || 'assets/images/kv_campus.jpg');
  previewDriveInput('siCampusImage', 'siCampusImgPrev');
}

function handleSaveSchoolInfo(e) {
  e.preventDefault();
  const data = DB.getData();
  const isPm = document.getElementById('siIsPmShri')?.checked ?? true;
  const showBadge = document.getElementById('siShowBadge')?.checked ?? true;

  const mbNameVal  = (document.getElementById('siMbName')?.value || data.schoolInfo?.managedBy?.name || 'Vijay Kumar').trim();
  const mbDesigVal = (document.getElementById('siMbDesignation')?.value || data.schoolInfo?.managedBy?.designation || 'HM').trim();
  const mbKvVal    = (document.getElementById('siMbKvName')?.value || data.schoolInfo?.managedBy?.kvName || 'PM SHRI KV Suranussi').trim();

  data.schoolInfo = {
    ...data.schoolInfo,
    name:              document.getElementById('siName').value,
    shortName:         document.getElementById('siShortName').value,
    isPmShri:          isPm,
    schoolType:        isPm ? 'PM SHRI Kendriya Vidyalaya' : 'Normal Kendriya Vidyalaya',
    affiliation:       document.getElementById('siAffiliation').value,
    sector:            document.getElementById('siSector').value,
    region:            document.getElementById('siRegion').value,
    station:           document.getElementById('siAddress').value,
    established:       document.getElementById('siEstablished').value,
    badgeText:         document.getElementById('siBadgeText').value,
    showBadge:         showBadge,
    tagline:           document.getElementById('siTagline').value,
    subtitle:          document.getElementById('siSubtitle').value,
    campusImage:       document.getElementById('siCampusImage')?.value || 'assets/images/kv_campus.jpg',
    address:           document.getElementById('siAddress').value,
    phone:             document.getElementById('siPhone').value,
    email:             document.getElementById('siEmail').value,
    workingHours:      document.getElementById('siWorkingHours').value,
    history:           document.getElementById('siHistory').value,
    vision:            document.getElementById('siVision').value,
    mission:           document.getElementById('siMission').value,
    footerDescription: document.getElementById('siFooterDesc').value,
    managedBy: {
      name:        mbNameVal,
      designation: mbDesigVal,
      kvName:      mbKvVal,
      show:        data.schoolInfo?.managedBy?.show !== false
    }
  };

  // Sync to Settings tab inputs as well
  _setVal('mbName', mbNameVal);
  _setVal('mbDesignation', mbDesigVal);
  _setVal('mbKvName', mbKvVal);

  DB.saveData(data);
  _toast('Workplace & School info saved successfully!');
}

function togglePmShriOptions(isPm) {
  const badgeInput = document.getElementById('siBadgeText');
  if (badgeInput) {
    if (isPm && (!badgeInput.value || badgeInput.value.includes('KENDRIYA VIDYALAYA SANGATHAN'))) {
      badgeInput.value = 'PM SHRI CENTER OF EDUCATIONAL EXCELLENCE';
    } else if (!isPm && (!badgeInput.value || badgeInput.value.includes('PM SHRI'))) {
      badgeInput.value = 'KENDRIYA VIDYALAYA SANGATHAN • CENTER OF EXCELLENCE';
    }
  }
}

function applyWorkplaceTransferPreset() {
  const sector = document.getElementById('siSector')?.value.trim() || 'Defense Sector';
  const region = document.getElementById('siRegion')?.value.trim() || 'Jalandhar Region';
  const est = document.getElementById('siEstablished')?.value.trim() || '1979';
  const aff = document.getElementById('siAffiliation')?.value.trim() || 'CBSE Affiliation No: 1600012';
  const isPm = document.getElementById('siIsPmShri')?.checked ?? true;

  const autoSubtitle = `A premier ${sector} Kendriya Vidyalaya in ${region}`;
  const autoTagline = `${sector} • Est. ${est} • ${aff}`;
  
  _setVal('siSubtitle', autoSubtitle);
  _setVal('siTagline', autoTagline);
  togglePmShriOptions(isPm);

  _toast('Tagline & Subtitle auto-generated from school profile!', 'success');
}

/* ── Tab: Hero & Stats ────────────────────────────────────────── */
function populateHeroStatsForm(hero, stats) {
  // Always fall back to seed defaults so the form is never empty
  hero  = hero  || DEFAULT_SEED_DATA.heroSection;
  stats = stats || DEFAULT_SEED_DATA.statsBar;

  _setVal('heroBadge', hero.badge);
  _setVal('heroTitle',  hero.title);
  _setVal('heroDesc',   hero.description);
  _setVal('heroBgImage', hero.backgroundImage || '');
  detectHeroPhotoType(hero.backgroundImage || 'assets/images/kv_campus.jpg');
  previewDriveInput('heroBgImage', 'heroBgPrev');

  const container = document.getElementById('statsEditorList');
  if (!container || !Array.isArray(stats)) return;
  container.innerHTML = stats.map((s, i) => `
    <div style="display:grid;grid-template-columns:1fr 2fr auto;gap:.8rem;align-items:center;margin-bottom:.8rem">
      <input type="text" class="form-control" value="${s.value}" placeholder="e.g. 1500+" id="statVal_${i}">
      <input type="text" class="form-control" value="${s.label}" placeholder="e.g. Active Students" id="statLbl_${i}">
      <button type="button" onclick="removeStatRow(${i})" style="background:var(--accent-crimson);color:#fff;padding:.5rem .8rem;border-radius:var(--radius-sm);border:none;cursor:pointer;flex-shrink:0"><i class="fas fa-trash"></i></button>
    </div>`).join('');
}

function handleSaveHeroStats(e) {
  e.preventDefault();
  const data = DB.getData();
  data.heroSection = {
    badge:           document.getElementById('heroBadge').value,
    title:           document.getElementById('heroTitle').value,
    description:     document.getElementById('heroDesc').value,
    backgroundImage: document.getElementById('heroBgImage')?.value || 'assets/images/kv_campus.jpg',
  };
  const rows = document.querySelectorAll('#statsEditorList > div');
  data.statsBar = Array.from(rows).map(row => {
    const inputs = row.querySelectorAll('input');
    return {
      value: inputs[0] ? inputs[0].value.trim() : '',
      label: inputs[1] ? inputs[1].value.trim() : '',
    };
  }).filter(s => s.value || s.label);
  DB.saveData(data);
  _toast('Hero section & stats saved!');
}

function addStatRow() {
  const c = document.getElementById('statsEditorList');
  if (!c) return;
  const i = c.children.length;
  const div = document.createElement('div');
  div.style.cssText = 'display:grid;grid-template-columns:1fr 2fr auto;gap:.8rem;align-items:center;margin-bottom:.8rem';
  div.innerHTML = `
    <input type="text" class="form-control" placeholder="e.g. 200+" id="statVal_${i}">
    <input type="text" class="form-control" placeholder="e.g. New Stat"  id="statLbl_${i}">
    <button type="button" onclick="this.parentElement.remove()" style="background:var(--accent-crimson);color:#fff;padding:.5rem .8rem;border-radius:var(--radius-sm);border:none;cursor:pointer"><i class="fas fa-trash"></i></button>`;
  c.appendChild(div);
}

function removeStatRow(i) {
  const el = document.querySelectorAll('#statsEditorList > div')[i];
  if (el) el.remove();
}

/* ── Tab: Principal ───────────────────────────────────────────── */
function populatePrincipalForm(p) {
  if (!p) return;
  _setVal('pName',    p.name);
  _setVal('pTitle',   p.title);
  _setVal('pImage',   p.image);
  _setVal('pQuote',   p.quote);
  _setVal('pContent', p.content);
}
function handleSavePrincipal(e) {
  e.preventDefault();
  const data = DB.getData();
  data.principalMessage = {
    ...data.principalMessage,
    name:    document.getElementById('pName').value,
    title:   document.getElementById('pTitle').value,
    image:   document.getElementById('pImage').value,
    quote:   document.getElementById('pQuote').value,
    content: document.getElementById('pContent').value,
  };
  DB.saveData(data);
  _toast('Principal information saved!');
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
  gal: ['PM SHRI', 'FLN & Activities', 'Campus', 'Events', 'Sports', 'Balvatika & Toy Pedagogy', 'CCA & Cultural', 'Science & Innovation'],
  res: ['Curriculum', 'Question Banks', 'Newsletters', 'Admissions', 'Circulars', 'Reports', 'Study Material', 'Syllabus'],
  newAnn: ['Training', 'Workshops', 'Pedagogy', 'FLN / NIPUN', 'Curriculum', 'Circular', 'Inclusive Education', 'Admissions', 'Examinations']
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
    const preview = isDriveUrl(g.srcUrl) ? convertDriveUrl(g.srcUrl, 'image') : (g.srcUrl || '');
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border-color);gap:1rem">
      <div style="display:flex;gap:1rem;align-items:center">
        ${preview ? `<img src="${preview}" style="width:60px;height:45px;object-fit:cover;border-radius:6px;border:1px solid var(--border-color)">` : ''}
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

/* ── Tab: Staff ───────────────────────────────────────────────── */
function renderAdminStaffList(list) {
  const el = document.getElementById('adminStaffList');
  if (!el) return;
  el.innerHTML = list.map(s => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border-color)">
      <div>
        <strong>${s.name}</strong> (${s.designation})
        <p style="font-size:.85rem;color:var(--text-muted)">${s.department} • ${s.email}</p>
      </div>
      <button onclick="deleteStaff('${s.id}')" style="background:var(--accent-crimson);color:#fff;padding:.4rem .8rem;border-radius:var(--radius-sm);border:none;cursor:pointer">
        <i class="fas fa-trash"></i> Remove
      </button>
    </div>`).join('');
}
function handleAddStaff(e) {
  e.preventDefault();
  const data = DB.getData();
  data.staff.push({
    id:            'st-' + Date.now(),
    name:          document.getElementById('newStaffName').value,
    designation:   document.getElementById('newStaffDesignation').value,
    department:    document.getElementById('newStaffDept').value,
    qualification: document.getElementById('newStaffQual').value,
    email:         document.getElementById('newStaffEmail').value,
  });
  DB.saveData(data);
  e.target.reset();
  _toast('Staff profile added!');
}
function deleteStaff(id) {
  if (!confirm('Remove this staff profile?')) return;
  const data = DB.getData();
  data.staff = data.staff.filter(s => s.id !== id);
  DB.saveData(data);
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

/* ── Tab: Settings / Webmaster Attribution ─────────────────── */
function handleSaveManagedBy(e) {
  e.preventDefault();
  const data = DB.getData();
  if (!data.schoolInfo) data.schoolInfo = {};
  const nameVal  = document.getElementById('mbName').value.trim();
  const desigVal = document.getElementById('mbDesignation').value.trim();
  const kvVal    = document.getElementById('mbKvName').value.trim();
  const showVal  = document.getElementById('mbShow').checked;

  data.schoolInfo.managedBy = {
    name:        nameVal,
    designation: desigVal,
    kvName:      kvVal,
    show:        showVal
  };

  // Sync to School Info tab inputs
  _setVal('siMbName', nameVal);
  _setVal('siMbDesignation', desigVal);
  _setVal('siMbKvName', kvVal);

  DB.saveData(data);
  _toast('Website Manager attribution saved!');
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
  const cleanName = (d.schoolInfo?.shortName || d.schoolInfo?.name || 'KV_Portal')
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
  const raw = document.getElementById(inputId)?.value;
  const prev = document.getElementById(previewId);
  if (!prev) return;
  if (!raw || raw === '#') { prev.style.display = 'none'; return; }
  const src = isDriveUrl(raw) ? convertDriveUrl(raw, 'image') : raw;
  prev.src = src;
  prev.style.display = 'block';
  prev.onerror = () => { prev.style.display = 'none'; };
}
