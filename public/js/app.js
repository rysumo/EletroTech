/* =============================================
   ELETROTECH — App (Main Orchestrator)
   ============================================= */

const App = (() => {
  async function init() {
    console.log('🚀 Eletrotech site initializing...');

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

    console.log('✅ Eletrotech site ready!');
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

      return `
        <div class="service-card reveal-scale">
          <div class="service-card-icon">${service.icon || '⚡'}</div>
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

      return `
        <div class="stat-card reveal-scale">
          <div class="stat-icon">${stat.icon || '📊'}</div>
          <div class="stat-value" data-value="${stat.value}" data-suffix="${stat.suffix || ''}">0</div>
          <div class="stat-label">${label}</div>
        </div>
      `;
    }).join('');

    Animations.initRevealAnimations();
    // Re-init counters for newly added elements
    initStatsCounters();
  }

  function initStatsCounters() {
    const counters = document.querySelectorAll('.stat-value');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.value);
          const suffix = el.dataset.suffix || '';
          animateCounter(el, target, suffix);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  function animateCounter(el, target, suffix) {
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target + suffix;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current) + suffix;
      }
    }, stepTime);
  }

  async function refreshDynamic() {
    await Promise.all([fetchServices(), fetchStats()]);
  }

  return { init, refreshDynamic };
})();

// Boot the app
document.addEventListener('DOMContentLoaded', () => App.init());
