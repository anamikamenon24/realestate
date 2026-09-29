/**
 * ANN REAL ESTATE - LUXURY DUBAI PROPERTY PORTAL
 * Client-Side Router, Dynamic Data Fetching, & Anti-Spam Form Controller
 */

// Global State
let allProperties = [];
let allProjects = [];
let allDevelopers = [];
let allStaff = [];

// Helper: Format number to AED currency string
function formatAED(amount) {
  return 'AED ' + Number(amount).toLocaleString('en-US');
}

// Luxury Loading State Generator
function renderLuxuryLoader(message = 'CURATING ARCHITECTURAL DOSSIER...') {
  return `
    <div class="luxury-loader-wrap">
      <div class="luxury-spinner">
        <div class="luxury-spinner-inner"></div>
      </div>
      <span class="gold-label" style="letter-spacing: 0.25em;">${message}</span>
      <div style="font-family: var(--font-heading); font-size: 22px; color: var(--color-charcoal); margin-top: 10px;">Ann Real Estate Private Advisory</div>
    </div>
  `;
}

// Luxury Error & 404 State Generator
function renderLuxuryNotFound(title = 'Residence Not Found', subtitle = 'The requested property dossier is currently unavailable or has been archived from private circulation.', returnHash = '#properties', returnText = 'EXPLORE READY RESIDENCES') {
  return `
    <div class="luxury-error-wrap">
      <div class="brand-logo brand-logo--charcoal" style="margin: 0 auto 20px auto; display: flex;">
        <span class="logo-title">A N N</span>
        <span class="logo-divider"></span>
        <span class="logo-subtitle">REAL ESTATE</span>
      </div>
      <span class="gold-label">EXCLUSIVE PORTFOLIO ARCHIVE</span>
      <h2 style="font-size: clamp(30px, 4vw, 46px); color: var(--color-charcoal); margin: 12px 0 16px 0;">${title}</h2>
      <p style="color: var(--color-warm-gray); max-width: 520px; margin: 0 auto 28px auto; line-height: 1.8; font-size: 15px;">
        ${subtitle}
      </p>
      <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
        <button type="button" class="btn btn-charcoal-fill" onclick="navigateTo('${returnHash}')">
          ${returnText}
        </button>
        <button type="button" class="btn btn-gold-outline" onclick="openRegisterModal()">
          REGISTER BESPOKE INQUIRY
        </button>
      </div>
    </div>
  `;
}

// ============================================================================
// 1. Navigation & Client-Side SPA Router
// ============================================================================
function navigateTo(hash, updateHistory = true) {
  if (!hash || hash === '#' || hash === '#home') {
    hash = '#home';
  }

  if (updateHistory && window.location.hash !== hash) {
    window.location.hash = hash;
  }

  // Parse route: e.g. #property/slug or #project/slug
  const cleanHash = hash.replace(/^#/, '');
  const parts = cleanHash.split('/');
  const route = parts[0];
  const param = parts[1];

  // Dynamic SEO Robots Handling: Hide Admin from Search Engines
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.name = 'robots';
    document.head.appendChild(robotsMeta);
  }
  if (route === 'admin' || route === 'crm') {
    robotsMeta.setAttribute('content', 'noindex, nofollow, noarchive, nosnippet');
  } else {
    robotsMeta.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  }

  // Hide all views
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active');
  });

  // Reset window scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update Nav Active Links
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === `#${route}` || (route === 'home' && linkHref === '#home')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Route Dispatcher
  if (route === 'home') {
    showView('view-home');
    renderHomeComponents();
  } else if (route === 'properties') {
    showView('view-properties');
    renderPropertiesCatalog();
  } else if (route === 'property' && param) {
    showView('view-property-detail');
    renderPropertyDetailPage(param);
  } else if (route === 'off-plan') {
    showView('view-off-plan');
    renderOffPlanCatalog();
  } else if (route === 'project' && param) {
    showView('view-project-detail');
    renderProjectDetailPage(param);
  } else if (route === 'mortgage-calc' || route === 'calculator') {
    showView('view-calculator');
    initMortgageCalculator();
  } else if (route === 'sell' || route === 'sell-with-us') {
    showView('view-sell');
  } else if (route === 'about') {
    showView('view-about');
    renderAboutPage();
  } else if (route === 'contact') {
    showView('view-contact');
  } else if (route === 'admin' || route === 'crm') {
    showView('view-admin');
    initAdminPortal();
  } else {
    showView('view-home');
  }

  // Close mobile drawer if open
  closeMobileMenu();
}

function showView(viewId) {
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileToggle = document.getElementById('mobileToggle');
  if (mobileMenu && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    if (mobileToggle) mobileToggle.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Handle Sticky Navbar
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  function handleScroll() {
    // If not on home page, keep navbar white
    const isHome = !window.location.hash || window.location.hash === '#home';
    if (!isHome || window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('hashchange', handleScroll);
  handleScroll();
}

// ============================================================================
// 2. Data Fetching API Services
// ============================================================================
async function fetchInitialData() {
  try {
    const [propsRes, projsRes, devsRes, staffRes] = await Promise.all([
      fetch('/api/properties').then(r => r.json()),
      fetch('/api/off-plan').then(r => r.json()),
      fetch('/api/developers').then(r => r.json()),
      fetch('/api/staff').then(r => r.json())
    ]);

    allProperties = propsRes.properties || [];
    allProjects = projsRes.projects || [];
    allDevelopers = devsRes.developers || [];
    allStaff = staffRes.staff || [];

    // Trigger current route rendering
    navigateTo(window.location.hash || '#home', false);
  } catch (err) {
    console.error('Failed to load portal data:', err);
  }
}

// ============================================================================
// 3. Home View Rendering
// ============================================================================
function renderHomeComponents() {
  // 1. Featured Properties (Top 3)
  const featGrid = document.getElementById('homeFeaturedGrid');
  if (featGrid && allProperties.length > 0) {
    const featured = allProperties.slice(0, 3);
    featGrid.innerHTML = featured.map(p => createPropertyCardHTML(p)).join('');
  }

  // 2. Featured Off-Plan Projects (Top 2)
  const offPlanGrid = document.getElementById('homeOffPlanGrid');
  if (offPlanGrid && allProjects.length > 0) {
    const featuredProjects = allProjects.slice(0, 2);
    offPlanGrid.innerHTML = featuredProjects.map(proj => createProjectCardHTML(proj)).join('');
  }
}

// Card HTML Generators
function createPropertyCardHTML(item) {
  return `
    <article class="property-card" onclick="navigateTo('#property/${item.slug}')">
      <div class="card-image-box">
        <img src="${item.image_url}" alt="${item.title}" loading="lazy" />
        <span class="card-badge ${item.status.includes('Ready') ? 'badge-ready' : 'badge-offplan'}">
          ${item.status}
        </span>
        <div class="card-overlay-actions">
          <span class="btn btn-hero-solid" style="padding: 10px 18px; font-size: 10px;">VIEW RESIDENCE</span>
        </div>
      </div>
      
      <!-- Thin gold line required by user specification -->
      <div class="card-gold-line"></div>
      
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        
        <!-- Area plus "From AED X" in small capital letters -->
        <div class="card-meta">
          ${item.community.toUpperCase()} • FROM ${formatAED(item.price_aed)}
        </div>

        <div class="card-specs">
          <span>${item.bedrooms} Bedrooms</span>
          <span>•</span>
          <span>${item.bathrooms} Baths</span>
          <span>•</span>
          <span>${item.sqft.toLocaleString()} Sq.Ft.</span>
        </div>
      </div>
    </article>
  `;
}

function createProjectCardHTML(proj) {
  return `
    <div class="offplan-grid" style="margin-bottom: 50px;">
      <div class="offplan-visual" onclick="navigateTo('#project/${proj.slug}')" style="cursor: pointer;">
        <img src="${proj.image_url}" alt="${proj.title}" loading="lazy" />
      </div>
      <div class="offplan-info">
        <span class="gold-label">${proj.community.toUpperCase()} • OFF-PLAN LAUNCH</span>
        <h3 style="font-size: 36px; color: var(--color-charcoal); margin-bottom: 14px;">${proj.title}</h3>
        <p style="color: var(--color-warm-gray); font-size: 15px; line-height: 1.8; margin-bottom: 20px;">
          ${proj.description}
        </p>

        <div class="offplan-features">
          <div class="feature-box">
            <div class="feature-number">${proj.payment_plan.split('(')[0].trim()}</div>
            <div class="feature-label">Milestone Plan</div>
          </div>
          <div class="feature-box">
            <div class="feature-number">${proj.handover_date}</div>
            <div class="feature-label">Handover Date</div>
          </div>
          <div class="feature-box">
            <div class="feature-number">${proj.roi_estimate.split(' ')[0]}</div>
            <div class="feature-label">Projected Yield</div>
          </div>
          <div class="feature-box">
            <div class="feature-number">${formatAED(proj.price_from_aed)}</div>
            <div class="feature-label">Starting Price</div>
          </div>
        </div>

        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button type="button" class="btn btn-charcoal-fill" onclick="navigateTo('#project/${proj.slug}')">
            VIEW PROJECT & BROCHURE
          </button>
          <button type="button" class="btn btn-charcoal-outline" onclick="openBrochureModal('${proj.title}')">
            DOWNLOAD DOSSIER
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// 4. Properties Catalog Page & Filtering
// ============================================================================
let propFilters = {
  community: 'all',
  bedrooms: 'all',
  type: 'all',
  priceRange: 'all',
  searchQuery: ''
};

function renderPropertiesCatalog() {
  const grid = document.getElementById('catalogPropertyGrid');
  const countEl = document.getElementById('catalogResultsCount');
  if (!grid) return;

  const filtered = allProperties.filter(item => {
    // Community
    if (propFilters.community !== 'all' && !item.community.toLowerCase().includes(propFilters.community.toLowerCase())) {
      return false;
    }
    // Bedrooms
    if (propFilters.bedrooms !== 'all' && item.bedrooms !== parseInt(propFilters.bedrooms, 10)) {
      return false;
    }
    // Type
    if (propFilters.type !== 'all' && !item.property_type.toLowerCase().includes(propFilters.type.toLowerCase())) {
      return false;
    }
    // Price Range
    if (propFilters.priceRange === 'under-5m' && item.price_aed >= 5000000) return false;
    if (propFilters.priceRange === '5m-15m' && (item.price_aed < 5000000 || item.price_aed > 15000000)) return false;
    if (propFilters.priceRange === '15m-30m' && (item.price_aed < 15000000 || item.price_aed > 30000000)) return false;
    if (propFilters.priceRange === 'over-30m' && item.price_aed < 30000000) return false;

    // Search query
    if (propFilters.searchQuery) {
      const q = propFilters.searchQuery.toLowerCase();
      const match = item.title.toLowerCase().includes(q) ||
                    item.community.toLowerCase().includes(q) ||
                    item.property_type.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  if (countEl) {
    countEl.innerText = `Showing ${filtered.length} of ${allProperties.length} Luxury Properties`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 70px 20px; color: var(--color-warm-gray);">
        <p style="font-family: var(--font-heading); font-size: 32px; color: var(--color-charcoal); margin-bottom: 8px;">No Residences Found</p>
        <p style="font-size: 14px;">Try resetting your filters to view other prime Dubai homes.</p>
        <button class="btn btn-charcoal-outline" style="margin-top: 24px;" onclick="resetPropertiesCatalogFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => createPropertyCardHTML(p)).join('');
}

function initCatalogFilters() {
  const commSelect = document.getElementById('filterCommunity');
  const bedSelect = document.getElementById('filterBedrooms');
  const typeSelect = document.getElementById('filterType');
  const priceSelect = document.getElementById('filterPrice');
  const searchInput = document.getElementById('filterSearch');

  if (commSelect) commSelect.addEventListener('change', e => { propFilters.community = e.target.value; renderPropertiesCatalog(); });
  if (bedSelect) bedSelect.addEventListener('change', e => { propFilters.bedrooms = e.target.value; renderPropertiesCatalog(); });
  if (typeSelect) typeSelect.addEventListener('change', e => { propFilters.type = e.target.value; renderPropertiesCatalog(); });
  if (priceSelect) priceSelect.addEventListener('change', e => { propFilters.priceRange = e.target.value; renderPropertiesCatalog(); });
  if (searchInput) searchInput.addEventListener('input', e => { propFilters.searchQuery = e.target.value.trim(); renderPropertiesCatalog(); });
}

function resetPropertiesCatalogFilters() {
  propFilters = { community: 'all', bedrooms: 'all', type: 'all', priceRange: 'all', searchQuery: '' };
  ['filterCommunity', 'filterBedrooms', 'filterType', 'filterPrice'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = 'all';
  });
  const s = document.getElementById('filterSearch');
  if (s) s.value = '';
  renderPropertiesCatalog();
}

// Quick filter trigger from Home Search Bar
function handleHomeSearch(event) {
  event.preventDefault();
  const comm = document.getElementById('homeSearchCommunity').value;
  const type = document.getElementById('homeSearchType').value;
  const budget = document.getElementById('homeSearchBudget').value;

  propFilters.community = comm;
  propFilters.type = type;
  propFilters.priceRange = budget;

  // Sync to catalog select inputs
  const commEl = document.getElementById('filterCommunity');
  if (commEl) commEl.value = comm;
  const typeEl = document.getElementById('filterType');
  if (typeEl) typeEl.value = type;
  const priceEl = document.getElementById('filterPrice');
  if (priceEl) priceEl.value = budget;

  navigateTo('#properties');
}

// ============================================================================
// 5. Dedicated Property Detail Page
// ============================================================================
async function renderPropertyDetailPage(slug) {
  const container = document.getElementById('propertyDetailContent');
  if (!container) return;

  container.innerHTML = renderLuxuryLoader('ACCESSING CONFIDENTIAL RESIDENCE ARCHIVE...');

  try {
    const res = await fetch(`/api/properties/${slug}`);
    const data = await res.json();
    if (!data.success || !data.property) {
      container.innerHTML = renderLuxuryNotFound('Residence Not Found', 'The requested ultra-luxury property is currently unavailable, private, or has been archived from circulation.', '#properties', 'EXPLORE READY RESIDENCES');
      return;
    }

    const prop = data.property;
    const featuresList = (prop.features || '').split(',').map(f => f.trim()).filter(Boolean);

    container.innerHTML = `
      <div class="breadcrumb-nav" style="padding-top: 20px; background: transparent; border: none;">
        <div class="breadcrumb-container">
          <a href="#home">Home</a>
          <span class="breadcrumb-sep">/</span>
          <a href="#properties">Properties</a>
          <span class="breadcrumb-sep">/</span>
          <span>${prop.title}</span>
        </div>
      </div>

      <div class="detail-layout">
        <div class="detail-grid">
          
          <!-- Main Content Column -->
          <div class="detail-main">
            <div>
              <span class="gold-label">${prop.community.toUpperCase()} • ${prop.property_type.toUpperCase()}</span>
              <h1 style="font-size: clamp(36px, 4.5vw, 56px); margin: 8px 0 16px 0; color: var(--color-charcoal);">${prop.title}</h1>
              <div style="font-family: var(--font-sans); font-size: 20px; color: var(--color-gold); font-weight: 600; letter-spacing: 0.1em;">
                ${formatAED(prop.price_aed)}
              </div>
            </div>

            <!-- Hero Gallery Image -->
            <div class="detail-gallery">
              <img src="${prop.image_url}" alt="${prop.title}" />
            </div>

            <!-- Architectural Specs Grid -->
            <div class="detail-specs-grid">
              <div>
                <div class="spec-cell-value">${prop.bedrooms}</div>
                <div class="spec-cell-label">Bedrooms</div>
              </div>
              <div>
                <div class="spec-cell-value">${prop.bathrooms}</div>
                <div class="spec-cell-label">Bathrooms</div>
              </div>
              <div>
                <div class="spec-cell-value">${prop.sqft.toLocaleString()}</div>
                <div class="spec-cell-label">Sq.Ft. Built-Up</div>
              </div>
              <div>
                <div class="spec-cell-value" style="font-size: 18px; line-height: 1.5;">${prop.property_type}</div>
                <div class="spec-cell-label">Residence Type</div>
              </div>
              <div>
                <div class="spec-cell-value" style="font-size: 16px; line-height: 1.6; color: var(--color-gold);">${prop.status}</div>
                <div class="spec-cell-label">Status</div>
              </div>
            </div>

            <!-- Architectural Narrative -->
            <div>
              <h3 style="font-size: 26px; margin-bottom: 14px; color: var(--color-charcoal);">Architectural Overview</h3>
              <p style="color: var(--color-warm-gray); font-size: 16px; line-height: 1.9;">
                ${prop.description}
              </p>
            </div>

            <!-- Signature Features -->
            <div>
              <h3 style="font-size: 24px; margin-bottom: 14px; color: var(--color-charcoal);">Residence Highlights</h3>
              <div class="features-pill-list">
                ${featuresList.map(f => `
                  <div class="feature-pill">✦ ${f}</div>
                `).join('')}
              </div>
            </div>

            <!-- Developer Attribution -->
            <div style="background-color: var(--color-off-white); padding: 28px; border-left: 2px solid var(--color-gold);">
              <span class="gold-label">MASTER DEVELOPER</span>
              <h4 style="font-size: 20px; color: var(--color-charcoal); margin-bottom: 6px;">${prop.developer_name || 'Ann Sovereign Developments'}</h4>
              <p style="font-size: 13.5px; color: var(--color-warm-gray); margin: 0;">${prop.developer_description || 'Crafting Dubai’s most distinguished architectural residences.'}</p>
            </div>

          </div>

          <!-- Sidebar Column: Twin Forms ("Book a Viewing" & "Enquire") -->
          <div class="detail-sidebar">
            
            <!-- 1. Book a Viewing Form -->
            <div class="sidebar-form-card highlight">
              <span class="gold-label">SCHEDULE INSPECTION</span>
              <h3 class="sidebar-form-title">Book a Private Viewing</h3>
              <p class="sidebar-form-subtitle">Arrange a discreet, guided private tour with our Senior Client Director.</p>
              
              <form onsubmit="handleBookViewingSubmit(event, ${prop.id}, '${prop.title}')" class="luxury-form">
                <!-- Anti-spam honeypot -->
                <input type="text" name="website_hp" class="hp-field" style="display: none !important; position: absolute; left: -9999px; visibility: hidden; opacity: 0; width: 0; height: 0;" tabindex="-1" autocomplete="off" aria-hidden="true" />

                <div class="form-group">
                  <label>Preferred Date & Time</label>
                  <input type="datetime-local" name="viewing_date" class="form-control" required />
                </div>

                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" name="full_name" class="form-control" placeholder="e.g. Lord Alexander Wright" required />
                </div>

                <div class="form-group">
                  <label>Direct Phone / WhatsApp</label>
                  <input type="tel" name="phone" class="form-control" placeholder="+971 50 000 0000" required />
                </div>

                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" class="form-control" placeholder="alexander@domain.com" required />
                </div>

                <div class="form-group">
                  <label>Assigned Private Agent</label>
                  <select name="agent_id" class="form-control">
                    <option value="1">Rashid Al-Falasi (Managing Director)</option>
                    <option value="2">Helena Vance-Montgomery (Europe Desk)</option>
                    <option value="3">Kareem Mansoor (Institutional Desk)</option>
                  </select>
                </div>

                <button type="submit" class="btn btn-gold-fill" style="width: 100%; margin-top: 10px;">
                  CONFIRM PRIVATE VIEWING
                </button>
              </form>
            </div>

            <!-- 2. Enquire Form -->
            <div class="sidebar-form-card">
              <span class="gold-label">DISCREET INQUIRY</span>
              <h3 class="sidebar-form-title">Enquire on this Property</h3>
              <p class="sidebar-form-subtitle">Request complete floorplans, payment structures, or off-market seller notes.</p>
              
              <form onsubmit="handleEnquirySubmit(event, ${prop.id}, '${prop.title}')" class="luxury-form">
                <!-- Anti-spam honeypot -->
                <input type="text" name="website_hp" class="hp-field" style="display: none !important; position: absolute; left: -9999px; visibility: hidden; opacity: 0; width: 0; height: 0;" tabindex="-1" autocomplete="off" aria-hidden="true" />

                <div class="form-group">
                  <label>Your Name</label>
                  <input type="text" name="full_name" class="form-control" placeholder="Your full name" required />
                </div>

                <div class="form-group">
                  <label>Direct Phone / WhatsApp</label>
                  <input type="tel" name="phone" class="form-control" placeholder="+971 50 123 4567" required />
                </div>

                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" class="form-control" placeholder="email@address.com" required />
                </div>

                <div class="form-group">
                  <label>Your Question or Inquiry</label>
                  <textarea name="notes" class="form-control" rows="3" placeholder="I would like to inquire about negotiable terms or floorplan specs..."></textarea>
                </div>

                <button type="submit" class="btn btn-charcoal-fill" style="width: 100%;">
                  SEND DISCREET INQUIRY
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    `;
  } catch (err) {
    console.error('Error rendering property detail:', err);
    container.innerHTML = renderLuxuryNotFound('Advisory Notice', 'Unable to retrieve residence details at this time. Please check your connection or contact our DIFC office.', '#properties', 'RETURN TO PORTFOLIO');
  }
}

// ============================================================================
// 6. Dedicated Off-Plan Projects Catalog & Detail Page
// ============================================================================
function renderOffPlanCatalog() {
  const grid = document.getElementById('catalogOffPlanGrid');
  if (!grid) return;
  grid.innerHTML = allProjects.map(proj => createProjectCardHTML(proj)).join('');
}

async function renderProjectDetailPage(slug) {
  const container = document.getElementById('projectDetailContent');
  if (!container) return;

  container.innerHTML = renderLuxuryLoader('RETRIEVING MASTER DEVELOPMENT DOSSIER...');

  try {
    const res = await fetch(`/api/off-plan/${slug}`);
    const data = await res.json();
    if (!data.success || !data.project) {
      container.innerHTML = renderLuxuryNotFound('Development Not Found', 'The requested visionary launch has reached capacity or is not currently in public circulation.', '#off-plan', 'EXPLORE OFF-PLAN PROJECTS');
      return;
    }

    const proj = data.project;

    container.innerHTML = `
      <div class="breadcrumb-nav" style="padding-top: 20px; background: transparent; border: none;">
        <div class="breadcrumb-container">
          <a href="#home">Home</a>
          <span class="breadcrumb-sep">/</span>
          <a href="#off-plan">Off-Plan Projects</a>
          <span class="breadcrumb-sep">/</span>
          <span>${proj.title}</span>
        </div>
      </div>

      <div class="detail-layout">
        <div class="detail-grid">
          
          <div class="detail-main">
            <div>
              <span class="gold-label">${proj.community.toUpperCase()} • OFF-PLAN DEVELOPMENT</span>
              <h1 style="font-size: clamp(36px, 4.5vw, 56px); margin: 8px 0 16px 0; color: var(--color-charcoal);">${proj.title}</h1>
              <div style="font-family: var(--font-sans); font-size: 20px; color: var(--color-gold); font-weight: 600; letter-spacing: 0.1em;">
                PRICING FROM ${formatAED(proj.price_from_aed)}
              </div>
            </div>

            <div class="detail-gallery">
              <img src="${proj.image_url}" alt="${proj.title}" />
            </div>

            <div class="detail-specs-grid">
              <div>
                <div class="spec-cell-value">${proj.handover_date}</div>
                <div class="spec-cell-label">Estimated Handover</div>
              </div>
              <div>
                <div class="spec-cell-value" style="font-size: 20px;">${proj.roi_estimate.split(' ')[0]}</div>
                <div class="spec-cell-label">Projected Net ROI</div>
              </div>
              <div>
                <div class="spec-cell-value" style="font-size: 16px;">10-Year Golden Visa</div>
                <div class="spec-cell-label">UAE Residency</div>
              </div>
              <div>
                <div class="spec-cell-value" style="font-size: 16px;">${proj.status}</div>
                <div class="spec-cell-label">Construction Progress</div>
              </div>
            </div>

            <div>
              <h3 style="font-size: 26px; margin-bottom: 14px; color: var(--color-charcoal);">Master Development Vision</h3>
              <p style="color: var(--color-warm-gray); font-size: 16px; line-height: 1.9;">
                ${proj.description}
              </p>
            </div>

            <!-- Milestone Payment Plan Visualizer -->
            <div style="background-color: var(--color-off-white); padding: 32px; border: 1px solid var(--color-light-gray);">
              <span class="gold-label">INVESTOR PAYMENT SCHEDULE</span>
              <h3 style="font-size: 24px; color: var(--color-charcoal); margin-bottom: 12px;">Milestone Breakdown</h3>
              <p style="font-size: 15px; font-weight: 500; color: var(--color-charcoal); margin-bottom: 20px;">
                ${proj.payment_plan}
              </p>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                <div style="background: #FFFFFF; padding: 18px; border: 1px solid var(--color-light-gray);">
                  <div style="font-family: var(--font-heading); font-size: 24px; color: var(--color-gold);">10% - 20%</div>
                  <div style="font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-warm-gray); margin-top: 4px;">On Booking / SPA</div>
                </div>
                <div style="background: #FFFFFF; padding: 18px; border: 1px solid var(--color-light-gray);">
                  <div style="font-family: var(--font-heading); font-size: 24px; color: var(--color-charcoal);">40% - 60%</div>
                  <div style="font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-warm-gray); margin-top: 4px;">Linked to Milestones</div>
                </div>
                <div style="background: #FFFFFF; padding: 18px; border: 1px solid var(--color-light-gray);">
                  <div style="font-family: var(--font-heading); font-size: 24px; color: var(--color-gold);">30% - 50%</div>
                  <div style="font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-warm-gray); margin-top: 4px;">On Handover / Key Receipt</div>
                </div>
              </div>
            </div>

            <!-- Available Units -->
            <div>
              <h3 style="font-size: 24px; margin-bottom: 12px; color: var(--color-charcoal);">Unit Configurations Available</h3>
              <div class="features-pill-list">
                <div class="feature-pill">✦ ${proj.bedrooms_available}</div>
                <div class="feature-pill">✦ Freehold Ownership For All Nationalities</div>
                <div class="feature-pill">✦ Escrow Account Statutory Protection</div>
              </div>
            </div>

          </div>

          <!-- Sidebar: Download Brochure & Enquire Form -->
          <div class="detail-sidebar">
            <div class="sidebar-form-card highlight">
              <span class="gold-label">OFFICIAL INVESTMENT DOSSIER</span>
              <h3 class="sidebar-form-title">Download Brochure</h3>
              <p class="sidebar-form-subtitle">Instant access to complete floorplans, payment milestones, and master unit availability.</p>

              <form onsubmit="handleBrochureDownloadSubmit(event, ${proj.id}, '${proj.title}')" class="luxury-form">
                <!-- Anti-spam honeypot -->
                <input type="text" name="website_hp" class="hp-field" style="display: none !important; position: absolute; left: -9999px; visibility: hidden; opacity: 0; width: 0; height: 0;" tabindex="-1" autocomplete="off" aria-hidden="true" />

                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" name="full_name" class="form-control" placeholder="Lord / Mr. / Ms. Name" required />
                </div>

                <div class="form-group">
                  <label>Direct WhatsApp / Phone</label>
                  <input type="tel" name="phone" class="form-control" placeholder="+971 50 000 0000" required />
                </div>

                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" class="form-control" placeholder="client@luxuryportfolio.com" required />
                </div>

                <div class="form-group">
                  <label>Investment Timeline</label>
                  <select name="timeline" class="form-control">
                    <option value="Immediate Allocation">Immediate VIP Allocation</option>
                    <option value="Within 30-60 Days">Within 30–60 Days</option>
                    <option value="Exploring Market">Exploring Market Options</option>
                  </select>
                </div>

                <button type="submit" class="btn btn-gold-fill" style="width: 100%; margin-top: 10px;">
                  DOWNLOAD DOSSIER (PDF)
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    `;
  } catch (err) {
    console.error('Error rendering project detail:', err);
    container.innerHTML = renderLuxuryNotFound('Advisory Notice', 'Unable to retrieve development specifications. Please check your connection or contact our DIFC office.', '#off-plan', 'RETURN TO OFF-PLAN');
  }
}

// ============================================================================
// 7. Mortgage Calculator & Advisor Form
// ============================================================================
function initMortgageCalculator() {
  const priceInput = document.getElementById('calcPrice');
  const downPaymentInput = document.getElementById('calcDownPayment');
  const durationInput = document.getElementById('calcDuration');
  const interestInput = document.getElementById('calcInterest');

  const priceVal = document.getElementById('calcPriceVal');
  const downVal = document.getElementById('calcDownVal');
  const durationVal = document.getElementById('calcDurationVal');
  const interestVal = document.getElementById('calcInterestVal');

  const monthlyPaymentEl = document.getElementById('calcMonthlyPayment');
  const loanAmountEl = document.getElementById('calcLoanAmount');
  const downAmountEl = document.getElementById('calcDownAmount');
  const dldFeeEl = document.getElementById('calcDldFee');
  const agencyFeeEl = document.getElementById('calcAgencyFee');
  const upfrontCashEl = document.getElementById('calcUpfrontCash');

  if (!priceInput) return;

  function calculate() {
    const price = parseFloat(priceInput.value) || 0;
    const downPercent = parseFloat(downPaymentInput.value) || 20;
    const years = parseFloat(durationInput.value) || 25;
    const annualRate = parseFloat(interestInput.value) || 4.5;

    // Display labels
    if (priceVal) priceVal.innerText = formatAED(price);
    if (downVal) downVal.innerText = `${downPercent}% (${formatAED(price * (downPercent / 100))})`;
    if (durationVal) durationVal.innerText = `${years} Years`;
    if (interestVal) interestVal.innerText = `${annualRate.toFixed(2)}%`;

    // Financial math
    const downPayment = price * (downPercent / 100);
    const loanAmount = price - downPayment;
    const monthlyRate = (annualRate / 100) / 12;
    const totalMonths = years * 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      monthlyPayment = loanAmount / totalMonths;
    }

    // Dubai Acquisition Fees:
    const dldFee = (price * 0.04) + 580;
    const agencyFee = (price * 0.02) * 1.05;
    const trusteeFee = 4200;
    const upfrontCash = downPayment + dldFee + agencyFee + trusteeFee;

    // Output formatted results
    if (monthlyPaymentEl) monthlyPaymentEl.innerText = formatAED(Math.round(monthlyPayment));
    if (loanAmountEl) loanAmountEl.innerText = formatAED(Math.round(loanAmount));
    if (downAmountEl) downAmountEl.innerText = formatAED(Math.round(downPayment));
    if (dldFeeEl) dldFeeEl.innerText = formatAED(Math.round(dldFee));
    if (agencyFeeEl) agencyFeeEl.innerText = formatAED(Math.round(agencyFee));
    if (upfrontCashEl) upfrontCashEl.innerText = formatAED(Math.round(upfrontCash));

    // Update Interactive Visual LTV Breakdown Chart
    const ltvRatio = 100 - downPercent;
    const ltvRatioLabel = document.getElementById('ltvRatioLabel');
    const ltvBarEquity = document.getElementById('ltvBarEquity');
    const ltvBarLoan = document.getElementById('ltvBarLoan');
    const ltvLegendEquity = document.getElementById('ltvLegendEquity');
    const ltvLegendLoan = document.getElementById('ltvLegendLoan');
    const ltvLegendFees = document.getElementById('ltvLegendFees');

    if (ltvRatioLabel) ltvRatioLabel.innerText = `LTV: ${ltvRatio}% | EQUITY: ${downPercent}%`;
    if (ltvBarEquity) ltvBarEquity.style.width = `${downPercent}%`;
    if (ltvBarLoan) ltvBarLoan.style.width = `${ltvRatio}%`;
    if (ltvLegendEquity) ltvLegendEquity.innerText = formatAED(Math.round(downPayment));
    if (ltvLegendLoan) ltvLegendLoan.innerText = formatAED(Math.round(loanAmount));
    if (ltvLegendFees) ltvLegendFees.innerText = formatAED(Math.round(dldFee + agencyFee + trusteeFee));
  }

  [priceInput, downPaymentInput, durationInput, interestInput].forEach(slider => {
    slider.addEventListener('input', calculate);
  });

  calculate();
}

// ============================================================================
// 8. About & Team Page Rendering
// ============================================================================
function renderAboutPage() {
  const teamGrid = document.getElementById('aboutTeamGrid');
  if (teamGrid && allStaff.length > 0) {
    teamGrid.innerHTML = allStaff.map(s => `
      <div class="team-card">
        <div class="team-avatar-box">
          <img src="${s.avatar_url}" alt="${s.full_name}" loading="lazy" />
        </div>
        <div class="team-content">
          <h3 class="team-name">${s.full_name}</h3>
          <div class="team-role">${s.role}</div>
          <div class="team-phone">${s.phone}</div>
          <button class="btn btn-charcoal-outline" style="margin-top: 18px; padding: 10px 18px; font-size: 10px;" onclick="openCallbackModal('${s.full_name}')">
            DIRECT CONSULTATION
          </button>
        </div>
      </div>
    `).join('');
  }
}

// ============================================================================
// 9. Centralized Anti-Spam Lead Submission Controller
// ============================================================================
async function submitLeadForm(formEl, leadType, extraData = {}, errorEl = null) {
  const formData = new FormData(formEl);
  const data = Object.fromEntries(formData.entries());

  // Merge extra data
  Object.assign(data, extraData);
  data.lead_type = leadType;

  // Basic validation
  if (!data.full_name || data.full_name.trim().length < 2) {
    const msg = 'Please enter your full name.';
    if (errorEl) { errorEl.innerText = msg; errorEl.style.display = 'block'; }
    showToast(msg);
    return false;
  }
  const cleanPhone = (data.phone || '').replace(/[\s\-\+\(\)]/g, '');
  if (!cleanPhone || cleanPhone.length < 7) {
    const msg = 'Please enter a valid telephone or WhatsApp number.';
    if (errorEl) { errorEl.innerText = msg; errorEl.style.display = 'block'; }
    showToast(msg);
    return false;
  }

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!result.success) {
      const msg = result.message || 'Submission error. Please check your entries.';
      if (errorEl) { errorEl.innerText = msg; errorEl.style.display = 'block'; }
      showToast(msg);
      return false;
    }

    // Reset form
    formEl.reset();

    // Show Thank-You Modal
    openThankYouModal({
      vipCode: result.vip_code || 'ANN-8821',
      clientName: result.full_name || data.full_name,
      leadType: leadType
    });

    return true;

  } catch (err) {
    console.error('Lead submission failed:', err);
    const msg = 'Network error. Please check your connection and try again.';
    if (errorEl) { errorEl.innerText = msg; errorEl.style.display = 'block'; }
    showToast(msg);
    return false;
  }
}

// Specific form action handlers
function handleBookViewingSubmit(e, propertyId, propertyTitle) {
  e.preventDefault();
  submitLeadForm(e.target, 'Property Viewing Request', {
    property_id: propertyId,
    source_form: 'Property Page - Book a Viewing Form',
    notes: `Viewing booked for ${propertyTitle}`
  });
}

function handleEnquirySubmit(e, propertyId, propertyTitle) {
  e.preventDefault();
  submitLeadForm(e.target, 'Property General Enquiry', {
    property_id: propertyId,
    source_form: 'Property Page - Enquire Form'
  });
}

function handleBrochureDownloadSubmit(e, projectId, projectTitle) {
  e.preventDefault();
  submitLeadForm(e.target, 'Off-Plan Brochure Download', {
    project_id: projectId,
    source_form: 'Off-Plan - Download Brochure Form',
    notes: `Brochure requested for ${projectTitle}`
  });
}

function handleMortgageAdvisorSubmit(e) {
  e.preventDefault();
  const price = document.getElementById('calcPrice') ? document.getElementById('calcPrice').value : '';
  const loan = document.getElementById('calcLoanAmount') ? document.getElementById('calcLoanAmount').innerText : '';
  submitLeadForm(e.target, 'Mortgage & Pre-Approval Advisory', {
    budget_aed: price,
    source_form: 'Mortgage Calculator - Advisor Request Form',
    notes: `Calculated loan requested: ${loan}`
  });
}

function handleSellValuationSubmit(e) {
  e.preventDefault();
  submitLeadForm(e.target, 'Seller Property Valuation Request', {
    source_form: 'Sell Page - Valuation Request Form'
  });
}

function handleContactPageSubmit(e) {
  e.preventDefault();
  submitLeadForm(e.target, 'Contact Page Message', {
    source_form: 'Contact Page - Message Form'
  });
}

async function handleCallbackModalSubmit(e) {
  e.preventDefault();
  const success = await submitLeadForm(e.target, 'Priority Call Me Back', {
    source_form: 'Floating Widget - Rapid Callback Modal'
  });
  if (success) {
    closeCallbackModal();
  }
}

async function handleRegisterInterestSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorEl = document.getElementById('registerModalError');
  if (errorEl) errorEl.style.display = 'none';

  const origText = submitBtn ? submitBtn.innerText : 'CONFIRM VIP REGISTRATION';
  if (submitBtn) {
    submitBtn.innerText = 'PROCESSING REGISTRATION...';
    submitBtn.disabled = true;
  }

  const success = await submitLeadForm(form, 'VIP Register Interest', {
    source_form: 'VIP Register Interest Form'
  }, errorEl);

  if (submitBtn) {
    submitBtn.innerText = origText;
    submitBtn.disabled = false;
  }

  if (success) {
    closeRegisterModal();
  }
}

// ============================================================================
// 10. Modals Management (Thank You, Call Me Back, Register, Brochure)
// ============================================================================
function openThankYouModal(info) {
  const modal = document.getElementById('thankYouModal');
  const codeEl = document.getElementById('thankYouVipCode');
  const nameEl = document.getElementById('thankYouClientName');
  const typeEl = document.getElementById('thankYouLeadType');

  if (codeEl) codeEl.innerText = info.vipCode;
  if (nameEl) nameEl.innerText = info.clientName;
  if (typeEl) typeEl.innerText = info.leadType;

  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeThankYouModal() {
  const modal = document.getElementById('thankYouModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function openCallbackModal(preferredAgent = '') {
  const modal = document.getElementById('callbackModal');
  const agentNote = document.getElementById('callbackAgentNote');
  if (agentNote && preferredAgent) {
    agentNote.innerText = `Consultation with ${preferredAgent}`;
  }
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCallbackModal() {
  const modal = document.getElementById('callbackModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function openRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function openBrochureModal(projectTitle = '') {
  openRegisterModal();
}

// Toast Notice Utility
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerText = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4200);
}

// ============================================================================
// 11. Global Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initCatalogFilters();

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        mobileMenu.classList.add('open');
        mobileToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // Hash Routing Listener
  window.addEventListener('hashchange', () => {
    navigateTo(window.location.hash);
  });

  // Delegated Hash Navigation Listener
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash && hash !== '#') {
      if (hash === '#admin') {
        e.preventDefault();
        openAdminCrmLogin(e);
      } else {
        e.preventDefault();
        navigateTo(hash);
      }
    }
  });

  // Fetch initial data and start SPA
  fetchInitialData();
});

// ============================================================================
// 12. Admin CRM & Real-Time Deal Pipeline Engine
// ============================================================================
let currentAdminUser = null;
let activeAdminTab = 'dashboard';
let notificationIntervalId = null;
let draggedLeadId = null;
let currentDossierLeadId = null;
let allAdminLeads = [];

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (currentAdminUser) {
    headers['x-user-id'] = currentAdminUser.id;
    headers['x-user-role'] = currentAdminUser.role;
  }
  return headers;
}

function quickFillLogin(email, password) {
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  if (emailInput) emailInput.value = email;
  if (passInput) passInput.value = password;
}

function openAdminCrmLogin(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }
  closeMobileMenu();

  // Reset any logged-in session so the user is asked for email & password
  currentAdminUser = null;
  localStorage.removeItem('ann_admin_user');
  if (notificationIntervalId) {
    clearInterval(notificationIntervalId);
    notificationIntervalId = null;
  }

  // Ensure Admin view is active
  document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
  showView('view-admin');

  if (window.location.hash !== '#admin') {
    window.location.hash = '#admin';
  }

  // Highlight admin link in navbar
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    if (link.getAttribute('href') === '#admin') link.classList.add('active');
    else link.classList.remove('active');
  });

  const loginView = document.getElementById('adminLoginView');
  const workspaceView = document.getElementById('adminWorkspaceView');
  if (loginView) loginView.style.display = 'flex';
  if (workspaceView) workspaceView.style.display = 'none';

  // Empty the inputs so it specifically asks for Email and Password
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const errorEl = document.getElementById('loginErrorNotice');
  if (errorEl) errorEl.style.display = 'none';

  if (emailInput) {
    emailInput.value = '';
    setTimeout(() => {
      try { emailInput.focus(); } catch (err) {}
    }, 150);
  }
  if (passInput) passInput.value = '';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginErrorNotice');
  if (errorEl) errorEl.style.display = 'none';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) {
      if (errorEl) {
        errorEl.innerText = data.message || 'Invalid staff credentials.';
        errorEl.style.display = 'block';
      }
      return;
    }

    currentAdminUser = data.user;
    localStorage.setItem('ann_admin_user', JSON.stringify(currentAdminUser));
    initAdminPortal();
    showToast(`Welcome back, ${currentAdminUser.full_name}`);
  } catch (err) {
    console.error('Login error:', err);
    if (errorEl) {
      errorEl.innerText = 'Network error during authentication.';
      errorEl.style.display = 'block';
    }
  }
}

function handleAdminLogout() {
  currentAdminUser = null;
  localStorage.removeItem('ann_admin_user');
  if (notificationIntervalId) {
    clearInterval(notificationIntervalId);
    notificationIntervalId = null;
  }
  initAdminPortal();
  showToast('Logged out of Admin CRM.');
}

function initAdminPortal() {
  const stored = localStorage.getItem('ann_admin_user');
  if (stored) {
    try { currentAdminUser = JSON.parse(stored); } catch (e) { currentAdminUser = null; }
  }

  const loginView = document.getElementById('adminLoginView');
  const workspaceView = document.getElementById('adminWorkspaceView');

  if (!currentAdminUser) {
    if (loginView) loginView.style.display = 'flex';
    if (workspaceView) workspaceView.style.display = 'none';
    return;
  }

  // User is logged in
  if (loginView) loginView.style.display = 'none';
  if (workspaceView) workspaceView.style.display = 'block';

  // Role badge and greeting
  const roleBadge = document.getElementById('adminUserRoleBadge');
  const greeting = document.getElementById('adminUserGreeting');
  if (roleBadge) {
    roleBadge.innerText = currentAdminUser.role === 'admin' ? 'ADMINISTRATOR' : 'SENIOR CLIENT DIRECTOR';
  }
  if (greeting) {
    greeting.innerText = `Welcome, ${currentAdminUser.full_name}`;
  }

  // If agent, customize filter or views
  const filterAgentWrapper = document.getElementById('filterAgentWrapper');
  if (filterAgentWrapper) {
    if (currentAdminUser.role === 'agent') {
      filterAgentWrapper.style.display = 'none';
    } else {
      filterAgentWrapper.style.display = 'flex';
    }
  }

  // Start 60-second Notification Polling
  fetchAdminNotifications();
  if (!notificationIntervalId) {
    notificationIntervalId = setInterval(fetchAdminNotifications, 60000);
  }

  // Switch to current active tab
  switchAdminTab(activeAdminTab || 'dashboard');
}

async function fetchAdminNotifications() {
  if (!currentAdminUser) return;
  try {
    const res = await fetch('/api/admin/notifications', { headers: getAuthHeaders() });
    const data = await res.json();
    if (!data.success) return;

    const badge = document.getElementById('adminBellBadge');
    if (badge) {
      if (data.unread_count > 0) {
        badge.innerText = data.unread_count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    const list = document.getElementById('adminNotificationsList');
    if (list) {
      if (!data.recent || data.recent.length === 0) {
        list.innerHTML = `<div style="font-size: 12px; color: var(--color-warm-gray); text-align: center; padding: 12px;">No incoming inquiries</div>`;
      } else {
        list.innerHTML = data.recent.map(item => `
          <div class="notif-item" onclick="openLeadDetailModal(${item.id}); toggleAdminNotificationsMenu(false);">
            <div class="notif-name">${item.full_name}</div>
            <div class="notif-meta">
              <span>${item.source_form || item.lead_type || 'Website Inquiry'}</span> • 
              <span style="color: var(--color-gold);">${formatAED(item.budget_aed || 0)}</span> • 
              <strong>${item.rating || 'WARM'}</strong>
            </div>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error fetching notifications:', err);
  }
}

function toggleAdminNotificationsMenu(forceClose) {
  const menu = document.getElementById('adminNotificationsMenu');
  if (!menu) return;
  if (forceClose === false) {
    menu.classList.remove('open');
  } else {
    menu.classList.toggle('open');
  }
}

function switchAdminTab(tabName) {
  activeAdminTab = tabName;
  document.querySelectorAll('.admin-nav-item').forEach(el => {
    if (el.getAttribute('data-tab') === tabName) el.classList.add('active');
    else el.classList.remove('active');
  });

  document.querySelectorAll('.admin-tab-pane').forEach(el => {
    el.classList.remove('active');
  });
  const targetPane = document.getElementById(`tab-${tabName}`);
  if (targetPane) targetPane.classList.add('active');

  if (tabName === 'dashboard') loadAdminDashboard();
  else if (tabName === 'pipeline') loadAdminPipeline();
  else if (tabName === 'leads') loadAdminLeads();
  else if (tabName === 'viewings') loadAdminViewings();
  else if (tabName === 'leaderboard') loadAdminLeaderboard();
  else if (tabName === 'stale') loadAdminStaleLeads();
  else if (tabName === 'inventory') loadAdminInventory();
}

async function loadAdminDashboard() {
  try {
    const res = await fetch('/api/admin/dashboard', { headers: getAuthHeaders() });
    const data = await res.json();
    if (!data.success) return;

    const m = data.metrics || {};
    const leadsTodayEl = document.getElementById('metricLeadsToday');
    const totalPipelineEl = document.getElementById('metricTotalPipelineVal');
    const viewingsWeekEl = document.getElementById('metricViewingsWeek');
    const salesMonthEl = document.getElementById('metricSalesMonth');
    const dealsCountEl = document.getElementById('metricDealsCount');
    const commMonthEl = document.getElementById('metricCommissionMonth');

    if (leadsTodayEl) leadsTodayEl.innerText = m.new_leads_today || 0;
    if (totalPipelineEl) totalPipelineEl.innerText = formatAED(m.total_pipeline_value_aed || 0);
    if (viewingsWeekEl) viewingsWeekEl.innerText = m.viewings_this_week || 0;
    if (salesMonthEl) salesMonthEl.innerText = formatAED(m.sales_volume_month_aed || 0);
    if (dealsCountEl) dealsCountEl.innerText = `${m.sales_count_month || 0} Won transactions`;
    if (commMonthEl) commMonthEl.innerText = formatAED(m.commission_month_aed || 0);

    // Chart: Leads by Stage
    const stageBarsEl = document.getElementById('chartStageBars');
    if (stageBarsEl && data.stage_breakdown) {
      const stages = ['New', 'Contacted', 'Viewing', 'Offer', 'Won', 'Lost'];
      const maxCount = Math.max(...stages.map(s => data.stage_breakdown[s] || 0), 1);
      stageBarsEl.innerHTML = stages.map(s => {
        const count = data.stage_breakdown[s] || 0;
        const pct = Math.round((count / maxCount) * 100);
        return `
          <div class="chart-bar-row">
            <span class="chart-bar-label">${s}</span>
            <div class="chart-bar-track">
              <div class="chart-bar-fill" style="width: ${Math.max(pct, 5)}%;"></div>
            </div>
            <span class="chart-bar-val">${count}</span>
          </div>
        `;
      }).join('');
    }

    // Chart: Quality Breakdown
    const qualityBarsEl = document.getElementById('chartQualityBars');
    if (qualityBarsEl && data.rating_breakdown) {
      const ratings = [
        { label: 'HOT (70-100)', key: 'HOT', color: '#C5221F' },
        { label: 'WARM (40-69)', key: 'WARM', color: '#B8975A' },
        { label: 'COLD (<40)', key: 'COLD', color: '#5F6368' }
      ];
      const maxCount = Math.max(...ratings.map(r => data.rating_breakdown[r.key] || 0), 1);
      qualityBarsEl.innerHTML = ratings.map(r => {
        const count = data.rating_breakdown[r.key] || 0;
        const pct = Math.round((count / maxCount) * 100);
        return `
          <div class="chart-bar-row">
            <span class="chart-bar-label">${r.label}</span>
            <div class="chart-bar-track">
              <div class="chart-bar-fill" style="width: ${Math.max(pct, 5)}%; background-color: ${r.color};"></div>
            </div>
            <span class="chart-bar-val">${count}</span>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

async function loadAdminPipeline() {
  const boardEl = document.getElementById('kanbanBoard');
  if (!boardEl) return;
  boardEl.innerHTML = `<div style="padding: 40px; text-align: center; grid-column: 1 / -1;"><span class="gold-label">LOADING DEAL PIPELINE...</span></div>`;

  try {
    const res = await fetch('/api/admin/leads', { headers: getAuthHeaders() });
    const data = await res.json();
    if (!data.success) return;

    allAdminLeads = data.leads || [];

    const stages = [
      { name: 'New', title: 'New Leads' },
      { name: 'Contacted', title: 'Contacted' },
      { name: 'Viewing', title: 'Viewing Booked' },
      { name: 'Offer', title: 'Offer Made' },
      { name: 'Won', title: 'Won (Closed)' },
      { name: 'Lost', title: 'Lost' }
    ];

    boardEl.innerHTML = stages.map(st => {
      const stageLeads = allAdminLeads.filter(l => (l.stage || 'New') === st.name);
      return `
        <div class="kanban-column" ondragover="handleKanbanDragOver(event)" ondrop="handleKanbanDrop(event, '${st.name}')">
          <div class="kanban-col-header">
            <span>${st.title}</span>
            <span class="kanban-col-count">${stageLeads.length}</span>
          </div>
          <div class="kanban-cards-wrapper">
            ${stageLeads.map(l => createKanbanCardHTML(l)).join('')}
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading pipeline:', err);
  }
}

function createKanbanCardHTML(lead) {
  const badgeClass = lead.rating === 'HOT' ? 'badge-hot' : lead.rating === 'WARM' ? 'badge-warm' : 'badge-cold';
  const cleanPhone = (lead.phone || '').replace(/[\s\-\+\(\)]/g, '');
  return `
    <div class="kanban-card" draggable="true" ondragstart="handleKanbanDragStart(event, ${lead.id})">
      <div class="lead-header-row">
        <span class="lead-name" onclick="openLeadDetailModal(${lead.id})">${lead.full_name}</span>
        <span class="lead-rating-badge ${badgeClass}">${lead.rating} ${lead.score || 0}</span>
      </div>

      <div class="lead-budget">${formatAED(lead.budget_aed || 0)}</div>

      <div class="lead-subtext">
        <div>${lead.specific_interest || lead.source_form || 'Direct Web Inquiry'}</div>
        <div style="font-size: 10px; color: var(--color-warm-gray); margin-top: 2px;">Advisor: <strong>${lead.agent_name || 'Unassigned'}</strong></div>
      </div>

      <div class="lead-actions-row">
        <a href="tel:${cleanPhone}" class="btn-icon-link" title="Call directly">
          📞 Call
        </a>
        <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(lead.full_name)},%20this%20is%20Ann%20Real%20Estate." target="_blank" rel="noopener noreferrer" class="btn-icon-link" style="color: #25D366;" title="WhatsApp buyer">
          💬 WhatsApp
        </a>
        <button type="button" class="btn-icon-link" onclick="openLeadDetailModal(${lead.id})" title="View complete dossier">
          Dossier
        </button>
      </div>
    </div>
  `;
}

function handleKanbanDragStart(e, leadId) {
  draggedLeadId = leadId;
  e.dataTransfer.setData('text/plain', leadId);
}

function handleKanbanDragOver(e) {
  e.preventDefault();
}

async function handleKanbanDrop(e, targetStage) {
  e.preventDefault();
  const leadId = draggedLeadId || parseInt(e.dataTransfer.getData('text/plain'), 10);
  if (!leadId) return;

  if (targetStage === 'Won') {
    openWonDealModal(leadId);
    return;
  }

  try {
    const res = await fetch(`/api/admin/leads/${leadId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stage: targetStage })
    });
    const result = await res.json();
    if (result.success) {
      showToast(`Lead moved to ${targetStage}`);
      loadAdminPipeline();
    }
  } catch (err) {
    console.error('Error updating stage:', err);
  }
}

async function loadAdminLeads() {
  const tbody = document.getElementById('adminLeadsTableBody');
  if (!tbody) return;

  const search = document.getElementById('adminLeadSearch') ? document.getElementById('adminLeadSearch').value.trim() : '';
  const stage = document.getElementById('adminLeadStageFilter') ? document.getElementById('adminLeadStageFilter').value : 'all';
  const rating = document.getElementById('adminLeadRatingFilter') ? document.getElementById('adminLeadRatingFilter').value : 'all';
  const agent = document.getElementById('adminLeadAgentFilter') ? document.getElementById('adminLeadAgentFilter').value : 'all';

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (stage !== 'all') params.set('stage', stage);
  if (rating !== 'all') params.set('rating', rating);
  if (agent !== 'all') params.set('agentId', agent);

  try {
    const res = await fetch(`/api/admin/leads?${params.toString()}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!data.success) return;

    allAdminLeads = data.leads || [];

    if (allAdminLeads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--color-warm-gray);">No leads matching criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = allAdminLeads.map(l => {
      const badgeClass = l.rating === 'HOT' ? 'badge-hot' : l.rating === 'WARM' ? 'badge-warm' : 'badge-cold';
      const cleanPhone = (l.phone || '').replace(/[\s\-\+\(\)]/g, '');
      return `
        <tr>
          <td><span class="lead-rating-badge ${badgeClass}">${l.rating} (${l.score || 0})</span></td>
          <td><strong>${l.full_name}</strong></td>
          <td>
            <div>${l.phone}</div>
            <div style="font-size: 11px; color: var(--color-warm-gray);">${l.email}</div>
          </td>
          <td><span style="font-size: 11px; background: var(--color-off-white); padding: 3px 8px; border: 1px solid var(--color-light-gray);">${l.source_form || 'Website Inquiry'}</span></td>
          <td><strong style="color: var(--color-gold);">${formatAED(l.budget_aed || 0)}</strong></td>
          <td><span style="font-weight: 500;">${l.stage || 'New'}</span></td>
          <td>${l.agent_name || 'Unassigned'}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <a href="tel:${cleanPhone}" class="btn-icon-link" title="Call">📞</a>
              <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(l.full_name)},%20this%20is%20Ann%20Real%20Estate." target="_blank" rel="noopener noreferrer" class="btn-icon-link" style="color: #25D366;" title="WhatsApp">💬</a>
              <button type="button" class="btn-icon-link" onclick="openLeadDetailModal(${l.id})">Dossier</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading leads:', err);
  }
}

function handleAdminLeadsFilterChange() {
  loadAdminLeads();
}

function exportLeadsToExcel() {
  if (!allAdminLeads || allAdminLeads.length === 0) {
    showToast('No leads available to export.');
    return;
  }

  const headers = [
    'Lead ID',
    'Full Name',
    'Phone',
    'Email',
    'Score',
    'Rating',
    'Budget (AED)',
    'Stage',
    'Source Form',
    'Acquisition Timeline',
    'Specific Interest',
    'Assigned Advisor',
    'Created At'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = allAdminLeads.map(l => [
    escapeCSV(l.id),
    escapeCSV(l.full_name),
    escapeCSV(l.phone),
    escapeCSV(l.email),
    escapeCSV(l.score),
    escapeCSV(l.rating),
    escapeCSV(l.budget_aed),
    escapeCSV(l.stage),
    escapeCSV(l.source_form || 'Website Inquiry'),
    escapeCSV(l.timeline),
    escapeCSV(l.specific_interest),
    escapeCSV(l.agent_name),
    escapeCSV(l.created_at)
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Ann_Real_Estate_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Excel CSV download complete.');
}

async function openLeadDetailModal(leadId) {
  currentDossierLeadId = leadId;
  const modal = document.getElementById('leadDetailModal');
  if (!modal) return;

  try {
    const res = await fetch(`/api/admin/leads/${leadId}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!data.success || !data.lead) return;

    const lead = data.lead;

    document.getElementById('leadModalName').innerText = lead.full_name;
    document.getElementById('leadModalId').innerText = lead.id;
    document.getElementById('leadModalCreatedAt').innerText = new Date(lead.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    document.getElementById('leadModalScore').innerText = lead.score || 0;

    const badge = document.getElementById('leadModalRatingBadge');
    if (badge) {
      badge.className = `lead-rating-badge ${lead.rating === 'HOT' ? 'badge-hot' : lead.rating === 'WARM' ? 'badge-warm' : 'badge-cold'}`;
      badge.innerText = `${lead.rating} (${lead.score || 0}/100)`;
    }

    const cleanPhone = (lead.phone || '').replace(/[\s\-\+\(\)]/g, '');
    const callLink = document.getElementById('leadModalCallLink');
    if (callLink) callLink.href = `tel:${cleanPhone}`;

    const waLink = document.getElementById('leadModalWhatsAppLink');
    if (waLink) waLink.href = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(lead.full_name)},%20this%20is%20Ann%20Real%20Estate.`;

    document.getElementById('leadModalPhone').innerText = lead.phone || 'N/A';
    document.getElementById('leadModalEmail').innerText = lead.email || 'N/A';
    document.getElementById('leadModalBudget').innerText = formatAED(lead.budget_aed || 0);
    document.getElementById('leadModalTimeline').innerText = lead.timeline || 'Immediate Ready Acquisition';
    document.getElementById('leadModalSource').innerText = lead.source_form || 'Direct Web Inquiry';
    document.getElementById('leadModalInterest').innerText = lead.specific_interest || 'General Luxury Portfolio';

    const stageSelect = document.getElementById('leadModalStageSelect');
    if (stageSelect) stageSelect.value = lead.stage || 'New';

    const agentSelect = document.getElementById('leadModalAgentSelect');
    if (agentSelect) agentSelect.value = lead.assigned_agent_id || 1;

    // Render notes feed
    renderLeadNotesFeed(lead.notes_history || []);

    // Populate property options for viewing
    const propSelect = document.getElementById('leadModalViewingPropSelect');
    if (propSelect && allProperties.length > 0) {
      propSelect.innerHTML = allProperties.map(p => `<option value="${p.id}">${p.title} (${formatAED(p.price_aed)})</option>`).join('');
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  } catch (err) {
    console.error('Error opening lead detail:', err);
  }
}

function closeLeadDetailModal() {
  const modal = document.getElementById('leadDetailModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderLeadNotesFeed(notes) {
  const feed = document.getElementById('leadModalNotesFeed');
  if (!feed) return;
  if (!notes || notes.length === 0) {
    feed.innerHTML = `<div style="font-size: 12px; color: var(--color-warm-gray); text-align: center; padding: 16px;">No activity logged yet. Add the first interaction note above.</div>`;
    return;
  }

  feed.innerHTML = notes.map(n => `
    <div class="note-bubble">
      <div class="note-meta">
        <strong>${n.agent_name || 'Staff Advisor'}</strong>
        <span>${new Date(n.created_at).toLocaleString()}</span>
      </div>
      <div class="note-text">${n.note_text}</div>
    </div>
  `).join('');
}

async function handleLeadModalAddNote(e) {
  e.preventDefault();
  const input = document.getElementById('leadModalNewNoteText');
  const text = input ? input.value.trim() : '';
  if (!text || !currentDossierLeadId) return;

  try {
    const res = await fetch(`/api/admin/leads/${currentDossierLeadId}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ note_text: text })
    });
    const result = await res.json();
    if (result.success) {
      input.value = '';
      showToast('Interaction note logged.');
      // Refresh modal
      openLeadDetailModal(currentDossierLeadId);
    }
  } catch (err) {
    console.error('Error adding note:', err);
  }
}

async function handleLeadModalStageChange(newStage) {
  if (!currentDossierLeadId) return;
  if (newStage === 'Won') {
    closeLeadDetailModal();
    openWonDealModal(currentDossierLeadId);
    return;
  }

  try {
    const res = await fetch(`/api/admin/leads/${currentDossierLeadId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stage: newStage })
    });
    const result = await res.json();
    if (result.success) {
      showToast(`Stage updated to ${newStage}`);
      if (activeAdminTab === 'pipeline') loadAdminPipeline();
      if (activeAdminTab === 'leads') loadAdminLeads();
    }
  } catch (err) {
    console.error('Error changing stage:', err);
  }
}

async function handleLeadModalAgentChange(agentId) {
  if (!currentDossierLeadId) return;
  try {
    const res = await fetch(`/api/admin/leads/${currentDossierLeadId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ assigned_agent_id: parseInt(agentId, 10) })
    });
    const result = await res.json();
    if (result.success) {
      showToast('Assigned advisor updated.');
      if (activeAdminTab === 'pipeline') loadAdminPipeline();
      if (activeAdminTab === 'leads') loadAdminLeads();
    }
  } catch (err) {
    console.error('Error updating advisor:', err);
  }
}

async function handleLeadModalBookViewing(e) {
  e.preventDefault();
  const propId = document.getElementById('leadModalViewingPropSelect').value;
  const dt = document.getElementById('leadModalViewingDateTime').value;
  if (!propId || !dt || !currentDossierLeadId) return;

  try {
    const res = await fetch('/api/admin/viewings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        lead_id: currentDossierLeadId,
        property_id: parseInt(propId, 10),
        viewing_date: dt,
        agent_id: currentAdminUser ? currentAdminUser.id : 2,
        notes: 'Scheduled from buyer dossier'
      })
    });
    const result = await res.json();
    if (result.success) {
      showToast('Viewing scheduled successfully.');
      e.target.reset();
    }
  } catch (err) {
    console.error('Error booking viewing:', err);
  }
}

function openWonDealModalForCurrentLead() {
  if (currentDossierLeadId) {
    closeLeadDetailModal();
    openWonDealModal(currentDossierLeadId);
  }
}

function openWonDealModal(leadId) {
  const modal = document.getElementById('wonDealModal');
  if (!modal) return;

  const lead = allAdminLeads.find(l => l.id === parseInt(leadId, 10));
  document.getElementById('wonLeadId').value = leadId;
  document.getElementById('wonBuyerName').value = lead ? lead.full_name : `Lead #${leadId}`;

  const propSelect = document.getElementById('wonPropertySelect');
  if (propSelect && allProperties.length > 0) {
    propSelect.innerHTML = allProperties.map(p => `
      <option value="${p.id}" data-price="${p.price_aed}">${p.title} (${p.community} - ${formatAED(p.price_aed)})</option>
    `).join('');
  }

  // Pre-fill price
  const priceInput = document.getElementById('wonSalePrice');
  const defaultPrice = (lead && lead.budget_aed && lead.budget_aed > 0) ? lead.budget_aed : (allProperties[0] ? allProperties[0].price_aed : 15000000);
  if (priceInput) {
    priceInput.value = defaultPrice;
  }
  calculateWonCommissionLive();

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWonDealModal() {
  const modal = document.getElementById('wonDealModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function calculateWonCommissionLive() {
  const priceInput = document.getElementById('wonSalePrice');
  const commBox = document.getElementById('wonCommissionAmount');
  if (!priceInput || !commBox) return;

  const price = parseFloat(priceInput.value) || 0;
  const comm = price * 0.02;
  commBox.innerText = formatAED(comm);
}

async function handleConfirmWonDeal(e) {
  e.preventDefault();
  const leadId = document.getElementById('wonLeadId').value;
  const propId = document.getElementById('wonPropertySelect').value;
  const salePrice = parseFloat(document.getElementById('wonSalePrice').value) || 0;
  const notes = document.getElementById('wonNotes').value;

  try {
    const res = await fetch(`/api/admin/leads/${leadId}/won`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        property_id: parseInt(propId, 10),
        sale_price_aed: salePrice,
        notes: notes
      })
    });
    const result = await res.json();
    if (result.success) {
      closeWonDealModal();
      showToast(`🏆 Deal marked WON! 2% Commission: ${formatAED(result.commission_aed || salePrice * 0.02)} recorded. Property marked Sold.`);
      // Refresh views
      fetchInitialData();
      if (activeAdminTab === 'dashboard') loadAdminDashboard();
      if (activeAdminTab === 'pipeline') loadAdminPipeline();
      if (activeAdminTab === 'leads') loadAdminLeads();
      if (activeAdminTab === 'leaderboard') loadAdminLeaderboard();
      if (activeAdminTab === 'inventory') loadAdminInventory();
    } else {
      showToast(result.message || 'Error closing deal');
    }
  } catch (err) {
    console.error('Error confirming won deal:', err);
  }
}

async function loadAdminViewings() {
  const tbody = document.getElementById('adminViewingsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/viewings', { headers: getAuthHeaders() });
    const data = await res.json();
    if (!data.success) return;

    const viewings = data.viewings || [];
    if (viewings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--color-warm-gray);">No scheduled viewings.</td></tr>`;
      return;
    }

    tbody.innerHTML = viewings.map(v => `
      <tr>
        <td><strong>${new Date(v.viewing_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></td>
        <td>${v.property_title || 'Private Residence'}</td>
        <td>${v.lead_name || 'VIP Client'}</td>
        <td>${v.agent_name || 'Staff Advisor'}</td>
        <td><span style="font-size: 11px; padding: 3px 8px; background: #E8F0FE; color: #1A73E8; font-weight: 600;">${v.status || 'Confirmed'}</span></td>
        <td style="color: var(--color-warm-gray);">${v.notes || '-'}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading viewings:', err);
  }
}

function openScheduleViewingModal() {
  const modal = document.getElementById('viewingBookingModal');
  if (!modal) return;

  const leadSelect = document.getElementById('viewingModalLeadSelect');
  if (leadSelect && allAdminLeads.length > 0) {
    leadSelect.innerHTML = allAdminLeads.map(l => `<option value="${l.id}">${l.full_name} (${formatAED(l.budget_aed || 0)})</option>`).join('');
  }

  const propSelect = document.getElementById('viewingModalPropertySelect');
  if (propSelect && allProperties.length > 0) {
    propSelect.innerHTML = allProperties.map(p => `<option value="${p.id}">${p.title} (${p.community})</option>`).join('');
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeScheduleViewingModal() {
  const modal = document.getElementById('viewingBookingModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

async function handleScheduleViewingSubmit(e) {
  e.preventDefault();
  const leadId = document.getElementById('viewingModalLeadSelect').value;
  const propId = document.getElementById('viewingModalPropertySelect').value;
  const dt = document.getElementById('viewingModalDateTime').value;
  const agentId = document.getElementById('viewingModalAgentSelect').value;
  const notes = document.getElementById('viewingModalNotes').value;

  try {
    const res = await fetch('/api/admin/viewings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        lead_id: parseInt(leadId, 10),
        property_id: parseInt(propId, 10),
        viewing_date: dt,
        agent_id: parseInt(agentId, 10),
        notes: notes
      })
    });
    const result = await res.json();
    if (result.success) {
      closeScheduleViewingModal();
      showToast('Viewing inspection reserved.');
      loadAdminViewings();
    }
  } catch (err) {
    console.error('Error reserving viewing:', err);
  }
}

async function loadAdminLeaderboard() {
  const grid = document.getElementById('leaderboardGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/admin/leaderboard', { headers: getAuthHeaders() });
    const data = await res.json();
    if (!data.success) return;

    const lb = data.leaderboard || [];
    grid.innerHTML = lb.map(agent => {
      const quotaPct = Math.min(Math.round(agent.quota_percent || 0), 100);
      return `
        <div class="leaderboard-card">
          <div class="leaderboard-card-header">
            <img src="${agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" alt="${agent.full_name}" class="leaderboard-avatar" />
            <div>
              <h3 style="font-size: 20px; color: var(--color-charcoal); margin: 0;">${agent.full_name}</h3>
              <div style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-gold); margin-top: 2px;">${agent.role}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span>Target: AED 25,000,000</span>
            <strong>${quotaPct}% Achieved</strong>
          </div>

          <div class="leaderboard-progress-bar">
            <div class="leaderboard-progress-fill" style="width: ${quotaPct}%;"></div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--color-light-gray); text-align: center;">
            <div>
              <div style="font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-warm-gray);">Closed Volume</div>
              <div style="font-family: var(--font-heading); font-size: 20px; color: var(--color-charcoal); margin-top: 2px;">${formatAED(agent.sales_volume_aed || 0)}</div>
            </div>
            <div>
              <div style="font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-warm-gray);">2% Commission</div>
              <div style="font-family: var(--font-heading); font-size: 20px; color: var(--color-gold); margin-top: 2px;">${formatAED(agent.commission_earned_aed || 0)}</div>
            </div>
          </div>

          <div style="font-size: 11px; color: var(--color-warm-gray); text-align: center; margin-top: 12px;">
            Deals Closed: <strong>${agent.deals_won || 0}</strong> • Active Leads: <strong>${agent.active_leads || 0}</strong>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading leaderboard:', err);
  }
}

async function loadAdminStaleLeads() {
  const tbody = document.getElementById('adminStaleLeadsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/stale-leads', { headers: getAuthHeaders() });
    const data = await res.json();
    if (!data.success) return;

    const stale = data.staleLeads || [];
    if (stale.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color: #2ECC71;">✨ No stale leads! All buyer inquiries have recent activity.</td></tr>`;
      return;
    }

    tbody.innerHTML = stale.map(l => {
      const badgeClass = l.rating === 'HOT' ? 'badge-hot' : l.rating === 'WARM' ? 'badge-warm' : 'badge-cold';
      const cleanPhone = (l.phone || '').replace(/[\s\-\+\(\)]/g, '');
      return `
        <tr>
          <td><span class="lead-rating-badge ${badgeClass}">${l.rating}</span></td>
          <td><strong>${l.full_name}</strong></td>
          <td>
            <div>${l.phone}</div>
            <div style="font-size: 11px; color: var(--color-warm-gray);">${l.email}</div>
          </td>
          <td><span style="color: #D9383A; font-weight: 700;">${l.days_inactive} Days Inactive</span></td>
          <td>${l.agent_name || 'Unassigned'}</td>
          <td>
            <div style="display: flex; gap: 8px;">
              <a href="tel:${cleanPhone}" class="btn-icon-link" style="color: var(--color-charcoal);">📞 Call</a>
              <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(l.full_name)},%20this%20is%20Ann%20Real%20Estate." target="_blank" rel="noopener noreferrer" class="btn-icon-link" style="color: #25D366;">💬 WhatsApp</a>
              <button type="button" class="btn-icon-link" onclick="openLeadDetailModal(${l.id})">Add Note</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading stale leads:', err);
  }
}

async function loadAdminInventory() {
  const propTbody = document.getElementById('adminPropertiesTableBody');
  const projTbody = document.getElementById('adminProjectsTableBody');

  if (propTbody) {
    if (allProperties.length === 0) {
      propTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px;">No ready properties found.</td></tr>`;
    } else {
      propTbody.innerHTML = allProperties.map(p => `
        <tr>
          <td><img src="${p.image_url}" alt="${p.title}" style="width: 50px; height: 35px; object-fit: cover;" /></td>
          <td><strong>${p.title}</strong></td>
          <td>${p.community}</td>
          <td><strong style="color: var(--color-gold);">${formatAED(p.price_aed)}</strong></td>
          <td>${p.property_type}</td>
          <td><span style="font-size: 11px; padding: 2px 8px; border: 1px solid ${p.status === 'Sold' ? '#D9383A' : '#2ECC71'}; color: ${p.status === 'Sold' ? '#D9383A' : '#2ECC71'};">${p.status}</span></td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-icon-link" onclick="editProperty(${p.id})">Edit</button>
              <button type="button" class="btn-icon-link" style="color: #D9383A;" onclick="deleteProperty(${p.id})">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }

  if (projTbody) {
    if (allProjects.length === 0) {
      projTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px;">No off-plan projects found.</td></tr>`;
    } else {
      projTbody.innerHTML = allProjects.map(proj => `
        <tr>
          <td><img src="${proj.image_url}" alt="${proj.title}" style="width: 50px; height: 35px; object-fit: cover;" /></td>
          <td><strong>${proj.title}</strong></td>
          <td>${proj.community}</td>
          <td><strong style="color: var(--color-gold);">${formatAED(proj.price_from_aed)}</strong></td>
          <td>${proj.handover_date}</td>
          <td style="font-size: 11px;">${proj.payment_plan}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-icon-link" onclick="editProject(${proj.id})">Edit</button>
              <button type="button" class="btn-icon-link" style="color: #D9383A;" onclick="deleteProject(${proj.id})">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }
}

// Property CRUD
function openPropertyAdminModal(propertyId = null) {
  const modal = document.getElementById('propertyAdminModal');
  if (!modal) return;

  const idInput = document.getElementById('adminPropId');
  const titleInput = document.getElementById('adminPropTitle');
  const slugInput = document.getElementById('adminPropSlug');
  const priceInput = document.getElementById('adminPropPrice');
  const commInput = document.getElementById('adminPropCommunity');
  const typeInput = document.getElementById('adminPropType');
  const bedsInput = document.getElementById('adminPropBedrooms');
  const bathsInput = document.getElementById('adminPropBathrooms');
  const sqftInput = document.getElementById('adminPropSqft');
  const statusInput = document.getElementById('adminPropStatus');
  const imgInput = document.getElementById('adminPropImageUrl');
  const descInput = document.getElementById('adminPropDesc');
  const featInput = document.getElementById('adminPropFeatures');
  const modalTitle = document.getElementById('propertyAdminModalTitle');

  if (propertyId) {
    const prop = allProperties.find(p => p.id === propertyId);
    if (prop) {
      if (modalTitle) modalTitle.innerText = 'Edit Ready Property';
      idInput.value = prop.id;
      titleInput.value = prop.title;
      slugInput.value = prop.slug;
      priceInput.value = prop.price_aed;
      commInput.value = prop.community;
      typeInput.value = prop.property_type;
      bedsInput.value = prop.bedrooms;
      bathsInput.value = prop.bathrooms;
      sqftInput.value = prop.sqft;
      statusInput.value = prop.status;
      imgInput.value = prop.image_url;
      descInput.value = prop.description;
      featInput.value = prop.features;
    }
  } else {
    if (modalTitle) modalTitle.innerText = 'Add Ready Property';
    idInput.value = '';
    titleInput.value = '';
    slugInput.value = '';
    priceInput.value = '';
    imgInput.value = 'assets/images/palm-villa.jpg';
    descInput.value = '';
    featInput.value = '';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePropertyAdminModal() {
  const modal = document.getElementById('propertyAdminModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function editProperty(id) {
  openPropertyAdminModal(id);
}

async function handlePropertyAdminSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('adminPropId').value;
  const payload = {
    title: document.getElementById('adminPropTitle').value,
    slug: document.getElementById('adminPropSlug').value,
    price_aed: parseFloat(document.getElementById('adminPropPrice').value),
    community: document.getElementById('adminPropCommunity').value,
    property_type: document.getElementById('adminPropType').value,
    bedrooms: parseInt(document.getElementById('adminPropBedrooms').value, 10),
    bathrooms: parseInt(document.getElementById('adminPropBathrooms').value, 10),
    sqft: parseInt(document.getElementById('adminPropSqft').value, 10),
    status: document.getElementById('adminPropStatus').value,
    image_url: document.getElementById('adminPropImageUrl').value,
    description: document.getElementById('adminPropDesc').value,
    features: document.getElementById('adminPropFeatures').value
  };

  try {
    const url = id ? `/api/admin/properties/${id}` : '/api/admin/properties';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      closePropertyAdminModal();
      showToast(id ? 'Property updated.' : 'New property added.');
      await fetchInitialData();
      loadAdminInventory();
    }
  } catch (err) {
    console.error('Error saving property:', err);
  }
}

async function deleteProperty(id) {
  if (!confirm('Are you sure you wish to remove this luxury property?')) return;
  try {
    const res = await fetch(`/api/admin/properties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (result.success) {
      showToast('Property removed from portfolio.');
      await fetchInitialData();
      loadAdminInventory();
    }
  } catch (err) {
    console.error('Error deleting property:', err);
  }
}

// Project CRUD
function openProjectAdminModal(projectId = null) {
  const modal = document.getElementById('projectAdminModal');
  if (!modal) return;

  const idInput = document.getElementById('adminProjId');
  const titleInput = document.getElementById('adminProjTitle');
  const slugInput = document.getElementById('adminProjSlug');
  const priceInput = document.getElementById('adminProjPrice');
  const commInput = document.getElementById('adminProjCommunity');
  const handoverInput = document.getElementById('adminProjHandover');
  const planInput = document.getElementById('adminProjPaymentPlan');
  const roiInput = document.getElementById('adminProjRoi');
  const imgInput = document.getElementById('adminProjImageUrl');
  const descInput = document.getElementById('adminProjDesc');
  const modalTitle = document.getElementById('projectAdminModalTitle');

  if (projectId) {
    const proj = allProjects.find(p => p.id === projectId);
    if (proj) {
      if (modalTitle) modalTitle.innerText = 'Edit Off-Plan Project';
      idInput.value = proj.id;
      titleInput.value = proj.title;
      slugInput.value = proj.slug;
      priceInput.value = proj.price_from_aed;
      commInput.value = proj.community;
      handoverInput.value = proj.handover_date;
      planInput.value = proj.payment_plan;
      roiInput.value = proj.roi_estimate;
      imgInput.value = proj.image_url;
      descInput.value = proj.description;
    }
  } else {
    if (modalTitle) modalTitle.innerText = 'Add Off-Plan Project';
    idInput.value = '';
    titleInput.value = '';
    slugInput.value = '';
    priceInput.value = '';
    handoverInput.value = 'Q4 2027';
    planInput.value = '60/40 (20% Booking, 40% Construction, 40% Handover)';
    roiInput.value = '8.5% Net Projected';
    imgInput.value = 'assets/images/sky-penthouse.jpg';
    descInput.value = '';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProjectAdminModal() {
  const modal = document.getElementById('projectAdminModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function editProject(id) {
  openProjectAdminModal(id);
}

async function handleProjectAdminSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('adminProjId').value;
  const payload = {
    title: document.getElementById('adminProjTitle').value,
    slug: document.getElementById('adminProjSlug').value,
    price_from_aed: parseFloat(document.getElementById('adminProjPrice').value),
    community: document.getElementById('adminProjCommunity').value,
    handover_date: document.getElementById('adminProjHandover').value,
    payment_plan: document.getElementById('adminProjPaymentPlan').value,
    roi_estimate: document.getElementById('adminProjRoi').value,
    image_url: document.getElementById('adminProjImageUrl').value,
    description: document.getElementById('adminProjDesc').value
  };

  try {
    const url = id ? `/api/admin/projects/${id}` : '/api/admin/projects';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      closeProjectAdminModal();
      showToast(id ? 'Off-Plan Project updated.' : 'New Off-Plan Project added.');
      await fetchInitialData();
      loadAdminInventory();
    }
  } catch (err) {
    console.error('Error saving project:', err);
  }
}

async function deleteProject(id) {
  if (!confirm('Are you sure you wish to remove this off-plan development?')) return;
  try {
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (result.success) {
      showToast('Project removed.');
      await fetchInitialData();
      loadAdminInventory();
    }
  } catch (err) {
    console.error('Error deleting project:', err);
  }
}
