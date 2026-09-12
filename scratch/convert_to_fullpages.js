const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update Navbar Links with data-page attributes and standard hash URLs
const oldNavMenu = `<ul class="vijay-nav-menu">
          <li><a href="javascript:void(0)" class="nav-link-btn active" onclick="window.scrollTo({top:0,behavior:'smooth'});">Home</a></li>
          <li><a href="javascript:void(0)" class="nav-link-btn" onclick="openSubpage('about');">About Me</a></li>
          <li><a href="javascript:void(0)" class="nav-link-btn" onclick="openSubpage('leadership');">Academic Leadership</a></li>
          <li><a href="javascript:void(0)" class="nav-link-btn" onclick="openSubpage('resources');">Resources</a></li>
          <li><a href="javascript:void(0)" class="nav-link-btn" onclick="openSubpage('training');">Training &amp; CPD</a></li>
          <li><a href="javascript:void(0)" class="nav-link-btn" onclick="openSubpage('innovations');">Innovations</a></li>
          <li><a href="javascript:void(0)" class="nav-link-btn" onclick="openSubpage('gallery');">Gallery</a></li>
          <li><a href="javascript:void(0)" class="nav-link-btn" onclick="openSubpage('contact');">Contact</a></li>
        </ul>`;

const newNavMenu = `<ul class="vijay-nav-menu">
          <li><a href="#/" class="nav-link-btn active" data-page="home">Home</a></li>
          <li><a href="#/about" class="nav-link-btn" data-page="about">About Me</a></li>
          <li><a href="#/leadership" class="nav-link-btn" data-page="leadership">Academic Leadership</a></li>
          <li><a href="#/resources" class="nav-link-btn" data-page="resources">Resources</a></li>
          <li><a href="#/training" class="nav-link-btn" data-page="training">Training &amp; CPD</a></li>
          <li><a href="#/innovations" class="nav-link-btn" data-page="innovations">Innovations</a></li>
          <li><a href="#/gallery" class="nav-link-btn" data-page="gallery">Gallery</a></li>
          <li><a href="#/contact" class="nav-link-btn" data-page="contact">Contact</a></li>
        </ul>`;

html = html.replace(oldNavMenu, newNavMenu);

// 2. Wrap the home page content inside <div id="page-home" class="page-view active"> ... </div>
// Home content starts at <!-- Hero Section (Exact 100% Mockup Representation) -->
// and ends before <!-- Footer (Strictly Matching Mockup) -->
const homeStartTag = '<!-- Hero Section (Exact 100% Mockup Representation) -->';
const footerStartTag = '<!-- Footer (Strictly Matching Mockup) -->';

const idxHome = html.indexOf(homeStartTag);
const idxFooter = html.indexOf(footerStartTag);

if (idxHome === -1 || idxFooter === -1) {
  console.error('Could not find home start or footer start markers!');
  process.exit(1);
}

const homeContent = html.substring(idxHome, idxFooter).trim();

// 3. Extract the 7 subpages and convert them from modals to full-page views
const pagesContent = `
    <!-- ═══════════════════════════════════════════════════════
         PAGE 1: HOME PAGE (EXACT MOCKUP)
         ═══════════════════════════════════════════════════════ -->
    <div id="page-home" class="page-view active">
      ${homeContent}
    </div>

    <!-- ═══════════════════════════════════════════════════════
         PAGE 2: ABOUT ME
         ═══════════════════════════════════════════════════════ -->
    <div id="page-about" class="page-view">
      <div class="subpage-hero-banner">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/"><i class="fas fa-home"></i> Home</a>
            <span class="sep">/</span>
            <span class="current">About Vijay Kumar</span>
          </div>
          <h1 class="subpage-hero-title">About Vijay Kumar</h1>
          <p class="subpage-hero-subtitle">Headmaster &bull; PM SHRI Kendriya Vidyalaya Suranussi, Jalandhar</p>
        </div>
      </div>
      <div class="container subpage-main-container">
        <div class="fullpage-card">
          <div style="display:flex;gap:2.2rem;align-items:center;margin-bottom:2.5rem;flex-wrap:wrap">
            <img src="assets/images/vijay_kumar_desk_hd.png" alt="Vijay Kumar" style="width:145px;height:145px;border-radius:50%;object-fit:cover;border:4px solid #dfa83b;box-shadow:0 8px 24px rgba(14,38,62,0.12)">
            <div style="flex:1">
              <h2 style="font-size:1.85rem;color:var(--primary);margin-bottom:0.35rem">Vijay Kumar</h2>
              <p style="font-weight:700;color:#dfa83b;font-size:1.05rem;margin-bottom:0.75rem">Headmaster &bull; Foundational &amp; Preparatory Stage</p>
              <p style="font-size:0.98rem;color:var(--text-muted);line-height:1.75" id="aboutBioFull">
                Passionate educator and dedicated school leader committed to foundational literacy, child-centric learning environments, and empowering primary teachers through continuous professional development.
              </p>
            </div>
          </div>

          <div class="profile-details-grid">
            <!-- Academic Qualifications -->
            <div id="profSection_qualifications" class="profile-box">
              <h4><i class="fas fa-graduation-cap"></i> Academic Qualifications</h4>
              <ul id="aboutQualList">
                <li>M.A., B.Ed., PG Diploma in School Leadership &amp; Administration</li>
                <li>Certified NIPUN Bharat &amp; Foundational Literacy &amp; Numeracy Mentor</li>
                <li>Specialized Training in Toy Pedagogy &amp; Indigenous Learning Aids (NCERT)</li>
                <li>Continuous Professional Development (CPD) Master Resource Person</li>
              </ul>
            </div>

            <!-- Professional Journey -->
            <div id="profSection_journey" class="profile-box">
              <h4><i class="fas fa-briefcase"></i> Professional Journey</h4>
              <p id="aboutJourneyText">
                Dedicated career spanning over two decades with Kendriya Vidyalaya Sangathan (KVS), spearheading primary foundational stage academic initiatives, toy library laboratories, higher-order thinking (HOTS) question banks, and transformative pedagogical leadership across multiple stations.
              </p>
            </div>

            <!-- Vision & Mission -->
            <div id="profSection_vision" class="profile-box">
              <h4><i class="fas fa-bullseye"></i> Vision &amp; Mission</h4>
              <p id="aboutVisionText">
                <strong>Vision:</strong> To cultivate a joyful, stimulating, and inclusive learning ecosystem where every child's innate potential is recognized and nurtured.<br>
                <strong>Mission:</strong> Universal acquisition of foundational literacy and numeracy (FLN) by Grade 3 through experiential play, indigenous toys, and compassionate mentoring.
              </p>
            </div>

            <!-- Roles & Responsibilities -->
            <div id="profSection_roles" class="profile-box">
              <h4><i class="fas fa-user-check"></i> Roles &amp; Responsibilities</h4>
              <ul id="aboutRolesList">
                <li>Leading Foundational &amp; Preparatory Stage academic delivery under NEP 2020</li>
                <li>Guiding primary faculty in competency-based lesson planning and assessment</li>
                <li>Coordinating Toy &amp; Puppet Library and activity-based learning studios</li>
                <li>Organizing faculty CPD workshops, Bloom's Taxonomy sessions, and parent dialogues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         PAGE 3: ACADEMIC LEADERSHIP
         ═══════════════════════════════════════════════════════ -->
    <div id="page-leadership" class="page-view">
      <div class="subpage-hero-banner">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/"><i class="fas fa-home"></i> Home</a>
            <span class="sep">/</span>
            <span class="current">Academic Leadership</span>
          </div>
          <h1 class="subpage-hero-title">Academic Leadership &amp; Initiatives</h1>
          <p class="subpage-hero-subtitle">FLN &bull; NIPUN Bharat &bull; Foundational &amp; Preparatory Stage</p>
        </div>
      </div>
      <div class="container subpage-main-container">
        <div class="cards-grid" id="modalInitiativesGrid">
          <!-- Populated dynamically from DB.getData().initiatives -->
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         PAGE 4: TEACHING RESOURCES
         ═══════════════════════════════════════════════════════ -->
    <div id="page-resources" class="page-view">
      <div class="subpage-hero-banner">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/"><i class="fas fa-home"></i> Home</a>
            <span class="sep">/</span>
            <span class="current">Teaching Resources</span>
          </div>
          <h1 class="subpage-hero-title">Teaching Resources Hub</h1>
          <p class="subpage-hero-subtitle">Worksheets &bull; Lesson Plans &bull; CCT/HOTS Question Banks &bull; Assessment Tools</p>
        </div>
      </div>
      <div class="container subpage-main-container">
        <div class="fullpage-card">
          <div style="margin-bottom:1.8rem;max-width:480px">
            <input type="text" class="form-control" placeholder="Search resources by title or subject..." onkeyup="renderModalResources(this.value)">
          </div>
          <div id="modalResourcesContainer" style="display:flex;flex-direction:column;gap:1rem">
            <!-- Populated dynamically from DB.getData().resources -->
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         PAGE 5: TRAINING & CPD
         ═══════════════════════════════════════════════════════ -->
    <div id="page-training" class="page-view">
      <div class="subpage-hero-banner">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/"><i class="fas fa-home"></i> Home</a>
            <span class="sep">/</span>
            <span class="current">Training &amp; CPD</span>
          </div>
          <h1 class="subpage-hero-title">Training &amp; Continuous Professional Development</h1>
          <p class="subpage-hero-subtitle">Workshops &bull; Presentations &bull; Faculty Capacity Building</p>
        </div>
      </div>
      <div class="container subpage-main-container">
        <div id="modalAnnouncementsContainer" class="announcements-list">
          <!-- Populated dynamically from DB.getData().announcements -->
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         PAGE 6: INNOVATIONS & ACTIVITIES
         ═══════════════════════════════════════════════════════ -->
    <div id="page-innovations" class="page-view">
      <div class="subpage-hero-banner">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/"><i class="fas fa-home"></i> Home</a>
            <span class="sep">/</span>
            <span class="current">Innovations &amp; Activities</span>
          </div>
          <h1 class="subpage-hero-title">Innovations &amp; Activities</h1>
          <p class="subpage-hero-subtitle">Vidyavani &bull; TLM Labs &bull; Student Projects &bull; Experiential Learning</p>
        </div>
      </div>
      <div class="container subpage-main-container">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.8rem">
          <div class="fullpage-card">
            <h3 style="color:var(--primary);margin-bottom:0.8rem;display:flex;align-items:center;gap:0.6rem">
              <i class="fas fa-cubes" style="color:#dfa83b"></i> Toy-Based Pedagogy &amp; Puppet Corner
            </h3>
            <p style="color:var(--text-muted);line-height:1.75">
              Integrating indigenous Indian toys, cloth puppets, and tactile counting aids to make foundational mathematics and language learning enjoyable and intuitive.
            </p>
          </div>
          <div class="fullpage-card">
            <h3 style="color:var(--primary);margin-bottom:0.8rem;display:flex;align-items:center;gap:0.6rem">
              <i class="fas fa-broadcast-tower" style="color:#0284c7"></i> Vidyavani &amp; Student Expression
            </h3>
            <p style="color:var(--text-muted);line-height:1.75">
              School audio broadcast and public speaking forum empowering primary children to recite poems, deliver news, and narrate moral stories with confidence.
            </p>
          </div>
          <div class="fullpage-card">
            <h3 style="color:var(--primary);margin-bottom:0.8rem;display:flex;align-items:center;gap:0.6rem">
              <i class="fas fa-leaf" style="color:#059669"></i> Nature &amp; Experiential Projects
            </h3>
            <p style="color:var(--text-muted);line-height:1.75">
              Observation corners, seed germination kits, and junior science exploration tables encouraging direct engagement with the natural environment.
            </p>
          </div>
          <div class="fullpage-card">
            <h3 style="color:var(--primary);margin-bottom:0.8rem;display:flex;align-items:center;gap:0.6rem">
              <i class="fas fa-award" style="color:#7c3aed"></i> Joyful Assessment &amp; Classroom Recognition
            </h3>
            <p style="color:var(--text-muted);line-height:1.75">
              Non-threatening peer assessments, sticker rubrics, and the Best Classroom Trophy cultivating collaboration, cleanliness, and mutual respect.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         PAGE 7: GALLERY & ACHIEVEMENTS
         ═══════════════════════════════════════════════════════ -->
    <div id="page-gallery" class="page-view">
      <div class="subpage-hero-banner">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/"><i class="fas fa-home"></i> Home</a>
            <span class="sep">/</span>
            <span class="current">Gallery &amp; Achievements</span>
          </div>
          <h1 class="subpage-hero-title">Gallery &amp; Achievements</h1>
          <p class="subpage-hero-subtitle">Events &bull; Certificates &bull; Memorable Moments</p>
        </div>
      </div>
      <div class="container subpage-main-container">
        <div class="gallery-filters" id="modalGalleryFilters" style="margin-bottom:2rem">
          <!-- Filter buttons -->
        </div>
        <div class="gallery-grid" id="modalGalleryGrid">
          <!-- Populated dynamically from DB.getData().gallery -->
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         PAGE 8: CONTACT
         ═══════════════════════════════════════════════════════ -->
    <div id="page-contact" class="page-view">
      <div class="subpage-hero-banner">
        <div class="container">
          <div class="breadcrumb-trail">
            <a href="#/"><i class="fas fa-home"></i> Home</a>
            <span class="sep">/</span>
            <span class="current">Contact</span>
          </div>
          <h1 class="subpage-hero-title">Get in Touch</h1>
          <p class="subpage-hero-subtitle">Connect with Vijay Kumar, Headmaster</p>
        </div>
      </div>
      <div class="container subpage-main-container">
        <div class="fullpage-card">
          <div style="display:grid;grid-template-columns:1fr 1.3fr;gap:3rem">
            <div>
              <h3 style="color:var(--primary);margin-bottom:1.5rem;font-size:1.3rem">Direct Contact Details</h3>
              <div style="display:flex;gap:1rem;margin-bottom:1.5rem;align-items:flex-start">
                <div style="width:44px;height:44px;border-radius:50%;background:#eef6fc;color:#0284c7;display:flex;align-items:center;justify-content:center;font-size:1.15rem;flex-shrink:0">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <strong style="color:var(--primary);font-size:0.95rem">Official Workplace:</strong>
                  <p style="font-size:0.92rem;color:var(--text-muted);margin-top:0.25rem">PM SHRI Kendriya Vidyalaya Suranussi, GT Road, Jalandhar, Punjab - 144027</p>
                </div>
              </div>
              <div style="display:flex;gap:1rem;margin-bottom:1.5rem;align-items:flex-start">
                <div style="width:44px;height:44px;border-radius:50%;background:#eef6fc;color:#0284c7;display:flex;align-items:center;justify-content:center;font-size:1.15rem;flex-shrink:0">
                  <i class="fas fa-envelope"></i>
                </div>
                <div>
                  <strong style="color:var(--primary);font-size:0.95rem">Email:</strong>
                  <p style="font-size:0.92rem;color:var(--text-muted);margin-top:0.25rem"><a href="mailto:vijaykumar.edu@gmail.com" style="color:inherit">vijaykumar.edu@gmail.com</a></p>
                </div>
              </div>
              <div style="display:flex;gap:1rem;margin-bottom:1.5rem;align-items:flex-start">
                <div style="width:44px;height:44px;border-radius:50%;background:#eef6fc;color:#0284c7;display:flex;align-items:center;justify-content:center;font-size:1.15rem;flex-shrink:0">
                  <i class="fas fa-globe"></i>
                </div>
                <div>
                  <strong style="color:var(--primary);font-size:0.95rem">Website:</strong>
                  <p style="font-size:0.92rem;color:var(--text-muted);margin-top:0.25rem">www.vijaysirkvs.com</p>
                </div>
              </div>
            </div>

            <div>
              <h3 style="color:var(--primary);margin-bottom:1.5rem;font-size:1.3rem">Send a Message</h3>
              <form onsubmit="handlePublicContactSubmit(event)">
                <div class="form-group" style="margin-bottom:1rem">
                  <label class="form-label">Your Name *</label>
                  <input type="text" id="contactName" class="form-control" required placeholder="Your full name">
                </div>
                <div class="form-group" style="margin-bottom:1rem">
                  <label class="form-label">Your Email *</label>
                  <input type="email" id="contactEmail" class="form-control" required placeholder="email@example.com">
                </div>
                <div class="form-group" style="margin-bottom:1rem">
                  <label class="form-label">Subject</label>
                  <input type="text" id="contactSubject" class="form-control" placeholder="Inquiry subject">
                </div>
                <div class="form-group" style="margin-bottom:1.2rem">
                  <label class="form-label">Message *</label>
                  <textarea id="contactMessage" class="form-control" rows="4" required placeholder="Write your message here..."></textarea>
                </div>
                <button type="submit" class="btn-primary" style="width:100%;padding:0.75rem;font-size:0.95rem"><i class="fas fa-paper-plane"></i> Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
`;

// Extract Footer
const footerEndMarker = '<!-- ── LOGIN MODAL ── -->';
const idxFooterEnd = html.indexOf(footerEndMarker);
if (idxFooterEnd === -1) {
  console.error('Could not find login modal marker!');
  process.exit(1);
}

// In current index.html, footer starts at idxFooter and runs until the start of modals.
// Let's find where footer actually ends:
const footerSection = html.substring(idxFooter, html.indexOf('<!-- ── PORTFOLIO SUBPAGE MODALS'));

// Combine:
// [Everything before home] + [pagesContent] + [footerSection] + [Everything after modals (login modal, viewer modal, adminView, scripts)]
const afterModals = html.substring(html.indexOf('<!-- ── LOGIN MODAL ── -->'));

let newHtml = html.substring(0, idxHome) + pagesContent + '\n' + footerSection + '\n' + afterModals;

// 4. Update Quick Links in Footer to use clean hash routes
newHtml = newHtml.replace(/href="javascript:void\(0\)" onclick="openSubpage\('about'\)"/g, 'href="#/about"');
newHtml = newHtml.replace(/href="javascript:void\(0\)" onclick="openSubpage\('leadership'\)"/g, 'href="#/leadership"');
newHtml = newHtml.replace(/href="javascript:void\(0\)" onclick="openSubpage\('resources'\)"/g, 'href="#/resources"');
newHtml = newHtml.replace(/href="javascript:void\(0\)" onclick="openSubpage\('training'\)"/g, 'href="#/training"');
newHtml = newHtml.replace(/href="javascript:void\(0\)" onclick="openSubpage\('innovations'\)"/g, 'href="#/innovations"');
newHtml = newHtml.replace(/href="javascript:void\(0\)" onclick="openSubpage\('gallery'\)"/g, 'href="#/gallery"');
newHtml = newHtml.replace(/href="javascript:void\(0\)" onclick="openSubpage\('contact'\)"/g, 'href="#/contact"');
newHtml = newHtml.replace(/href="javascript:void\(0\)" onclick="window\.scrollTo\(\{top:0,behavior:'smooth'\}\)"/g, 'href="#/"');

// 5. Update category cards to use clean hash routes
newHtml = newHtml.replace(/onclick="openSubpage\('leadership'\)" class="cat-card-box/g, 'href="#/leadership" class="cat-card-box');
newHtml = newHtml.replace(/onclick="openSubpage\('resources'\)" class="cat-card-box/g, 'href="#/resources" class="cat-card-box');
newHtml = newHtml.replace(/onclick="openSubpage\('training'\)" class="cat-card-box/g, 'href="#/training" class="cat-card-box');
newHtml = newHtml.replace(/onclick="openSubpage\('innovations'\)" class="cat-card-box/g, 'href="#/innovations" class="cat-card-box');
newHtml = newHtml.replace(/onclick="openSubpage\('gallery'\)" class="cat-card-box/g, 'href="#/gallery" class="cat-card-box');

// 6. Update hero hotspots
newHtml = newHtml.replace(/onclick="openSubpage\('leadership'\)" class="hotspot-explore"/g, 'href="#/leadership" class="hotspot-explore"');
newHtml = newHtml.replace(/onclick="openSubpage\('about'\)" class="hotspot-journey"/g, 'href="#/about" class="hotspot-journey"');
newHtml = newHtml.replace(/onclick="openSubpage\('leadership'\)" class="hotspot-pillar-1"/g, 'href="#/leadership" class="hotspot-pillar-1"');
newHtml = newHtml.replace(/onclick="openSubpage\('leadership'\)" class="hotspot-pillar-2"/g, 'href="#/leadership" class="hotspot-pillar-2"');
newHtml = newHtml.replace(/onclick="openSubpage\('innovations'\)" class="hotspot-pillar-3"/g, 'href="#/innovations" class="hotspot-pillar-3"');
newHtml = newHtml.replace(/onclick="openSubpage\('innovations'\)" class="hotspot-pillar-4"/g, 'href="#/innovations" class="hotspot-pillar-4"');

// 7. Update About Me badges & Read more
newHtml = newHtml.replace(/onclick="openSubpage\('about'\)" class="btn-mid-readmore"/g, 'href="#/about" class="btn-mid-readmore"');
newHtml = newHtml.replace(/onclick="openSubpage\('about', 'qualifications'\)" class="about-badge-item"/g, 'href="#/about?section=qualifications" class="about-badge-item"');
newHtml = newHtml.replace(/onclick="openSubpage\('about', 'journey'\)" class="about-badge-item"/g, 'href="#/about?section=journey" class="about-badge-item"');
newHtml = newHtml.replace(/onclick="openSubpage\('about', 'vision'\)" class="about-badge-item"/g, 'href="#/about?section=vision" class="about-badge-item"');
newHtml = newHtml.replace(/onclick="openSubpage\('about', 'roles'\)" class="about-badge-item"/g, 'href="#/about?section=roles" class="about-badge-item"');

// 8. Update Latest updates "View all"
newHtml = newHtml.replace(/onclick="openSubpage\('training'\)" class="btn-viewall-updates"/g, 'href="#/training" class="btn-viewall-updates"');

fs.writeFileSync('index.html', newHtml, 'utf8');
console.log('index.html successfully updated to full-page architecture!');
