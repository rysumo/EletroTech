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
      fetchStats(),
    ]);

    console.log('[Eletrotech] Site ready.');
  }

  async function fetchServices() {
    try {
      const res = await fetch('/api/services');
      const services = await res.json();
      renderServices(services);
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

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const stats = await res.json();
      renderStats(stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }

  function renderStats(stats) {
    const grid = document.getElementById('stats-grid');
    if (!grid) return;

    const suffix = I18n.getLangSuffix();

    grid.innerHTML = stats.map(stat => {
      const label = stat[`label${suffix}`] || stat.label_pt;
      const iconSvg = typeof Icons !== 'undefined' ? Icons.getStatIcon(stat) : '';

      return `
        <div class="stat-card reveal-scale">
          <div class="stat-icon">${iconSvg}</div>
          <div class="stat-value" data-value="${stat.value}" data-suffix="${stat.suffix || ''}">0</div>
          <div class="stat-label">${label}</div>
        </div>
      `;
    }).join('');

    Animations.initRevealAnimations();
    // Trigger smooth counter animations for newly rendered elements
    Animations.initCounters();
  }

  async function refreshDynamic() {
    await Promise.all([fetchServices(), fetchStats()]);
  }

  return { init, refreshDynamic };
})();

// Boot the app
document.addEventListener('DOMContentLoaded', () => App.init());
