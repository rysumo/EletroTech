/* =============================================
   ELETROTECH — App (Main Orchestrator)
   ============================================= */

const App = (() => {
  async function init() {
    console.log('[Eletrotech] Site initializing...');

    // Set current year in footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Initialize modules
    Navigation.init();
    Animations.init();
    I18n.init();
    Products.initModal();

    // Fetch and render dynamic content
    await Promise.all([
      Products.init(),
      FAQ.init(),
      fetchServices(),
    ]);

    console.log('[Eletrotech] Site ready.');
  }

  async function fetchServices() {
    try {
      const res = await fetch('/api/services');
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const services = await res.json();
        renderServices(services);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  }

  function renderServices(services) {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    const suffix = I18n.getLangSuffix();

    grid.innerHTML = services.map(service => {
      const title = service[`title${suffix}`] || service.title_pt;
      const desc = service[`description${suffix}`] || service.description_pt;
      const iconSvg = typeof Icons !== 'undefined' ? Icons.getServiceIcon(service) : '';

      return `
        <div class="service-card reveal-scale">
          <div class="service-card-icon">${iconSvg}</div>
          <h5 class="service-card-title">${title}</h5>
          <p class="service-card-text">${desc}</p>
        </div>
      `;
    }).join('');

    Animations.initRevealAnimations();
  }

  async function refreshDynamic() {
    await fetchServices();
  }

  return { init, refreshDynamic };
})();

// Boot the app
document.addEventListener('DOMContentLoaded', () => App.init());
