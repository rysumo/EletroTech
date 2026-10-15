/* =============================================
   ELETROTECH — Products Module
   Fetch, render, filter, and modal for products
   ============================================= */

const Products = (() => {
  let allProducts = [];
  let categories = [];
  let currentFilter = 'all';

  async function init() {
    await Promise.all([fetchCategories(), fetchProducts()]);
    renderFilterTabs();
    renderProducts();
  }

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        allProducts = await res.json();
      } else {
        allProducts = [];
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      allProducts = [];
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        categories = Array.isArray(data) ? data : [];
      } else {
        categories = [];
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      categories = [];
    }
  }

  function renderFilterTabs() {
    const container = document.getElementById('filter-tabs');
    if (!container) return;

    const suffix = I18n.getLangSuffix();
    const allLabel = { 'pt-BR': 'Todos', 'en': 'All', 'es': 'Todos' };
    const lang = I18n.getLang();

    let html = `<button class="filter-tab active" data-filter="all">${allLabel[lang] || 'Todos'}</button>`;
    categories.forEach(cat => {
      const name = cat[`name${suffix}`] || cat.name_pt;
      const iconSvg = typeof Icons !== 'undefined' ? Icons.getCategoryIcon(cat.slug) : '';
      html += `<button class="filter-tab" data-filter="${cat.slug}">${iconSvg} ${name}</button>`;
    });

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (currentFilter === tab.dataset.filter) return;
        currentFilter = tab.dataset.filter;
        container.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const grid = document.getElementById('products-grid');
        if (grid) {
          // Fluid exit: fade out and subtle slide
          grid.style.transition = 'opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1), transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)';
          grid.style.opacity = '0';
          grid.style.transform = 'translateY(12px) scale(0.99)';

          setTimeout(() => {
            renderProducts(true);
            // Silky-smooth entry with ease-out curve
            grid.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            grid.style.opacity = '1';
            grid.style.transform = 'translateY(0) scale(1)';
          }, 220);
        } else {
          renderProducts();
        }
      });
    });
  }

  function renderProducts(fromFilter = false) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const suffix = I18n.getLangSuffix();
    const filtered = currentFilter === 'all'
      ? allProducts
      : allProducts.filter(p => p.category_slug === currentFilter);

    if (filtered.length === 0) {
      const emptyMsg = { 'pt-BR': 'Nenhum produto encontrado nesta categoria.', 'en': 'No products found in this category.', 'es': 'No se encontraron produtos en esta categoría.' };
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: var(--color-gray-400);">
        <p style="font-size: var(--text-lg);">${emptyMsg[I18n.getLang()] || emptyMsg['pt-BR']}</p>
      </div>`;
      return;
    }

    grid.innerHTML = filtered.map((product, index) => {
      const name = product[`name${suffix}`] || product.name_pt;
      const desc = product[`description${suffix}`] || product.description_pt;
      const catName = product[`category_name${suffix}`] || product.category_name_pt || '';
      const shortDesc = desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
      const btnLabel = { 'pt-BR': 'Ver Detalhes', 'en': 'View Details', 'es': 'Ver Detalles' };
      const visibilityClass = fromFilter ? 'visible' : '';
      const staggerStyle = fromFilter ? `style="transition-delay: ${Math.min(index * 45, 250)}ms;"` : '';

      return `
        <div class="card reveal-scale ${visibilityClass}" ${staggerStyle} data-product-id="${product.id}">
          ${product.discount_percent > 0 ? `<span class="card-badge">-${product.discount_percent}%</span>` : ''}
          ${product.is_featured ? `<span class="card-featured"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Destaque</span>` : ''}
          <div class="card-image product-card-placeholder" ${product.image ? `role="img" aria-label="${name}" style="background-image: url('${product.image}'); background-size: cover; background-position: center; color: transparent;"` : ''}>
            ${!product.image ? `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="opacity: 0.35;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>` : ''}
          </div>
          <div class="card-body">
            <span class="card-category">${catName}</span>
            <h5 class="card-title">${name}</h5>
            <p class="card-text">${shortDesc}</p>
            <button class="btn btn-primary btn-sm" onclick="Products.openModal(${product.id})">
              ${btnLabel[I18n.getLang()] || btnLabel['pt-BR']}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Re-init reveal animations for any unrevealed elements
    if (!fromFilter) {
      Animations.initRevealAnimations();
    }
  }

  function openModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const suffix = I18n.getLangSuffix();
    const name = product[`name${suffix}`] || product.name_pt;
    const desc = product[`description${suffix}`] || product.description_pt;
    const catName = product[`category_name${suffix}`] || product.category_name_pt || '';
    const features = (product[`features${suffix}`] || product.features_pt || '').split(';').filter(f => f.trim());
    const whatsappMsg = product[`whatsapp_message${suffix}`] || product.whatsapp_message_pt || '';

    document.getElementById('modal-title').textContent = name;
    document.getElementById('modal-description').textContent = desc;
    document.getElementById('modal-category').textContent = catName;

    const modalImage = document.getElementById('modal-image');
    if (product.image) {
      modalImage.src = product.image;
      modalImage.alt = name;
      modalImage.style.display = 'block';
    } else {
      modalImage.style.display = 'none';
    }

    const featuresContainer = document.getElementById('modal-features');
    featuresContainer.innerHTML = features.map(f =>
      `<div class="modal-feature-item"><span>${f.trim()}</span></div>`
    ).join('');

    const rawNumber = typeof SiteSettings !== 'undefined' ? SiteSettings.get('whatsapp_number', '45999241306') : '45999241306';
    const cleanNumber = String(rawNumber).replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    const whatsappLink = `https://wa.me/${fullNumber}?text=${encodeURIComponent(whatsappMsg)}`;
    document.getElementById('modal-whatsapp').href = whatsappLink;

    // Show modal
    const overlay = document.getElementById('product-modal');
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  }

  function closeModal() {
    const overlay = document.getElementById('product-modal');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  // Initialize modal close handlers
  function initModal() {
    const overlay = document.getElementById('product-modal');
    const closeBtn = document.getElementById('modal-close');
    const closeBtnAlt = document.getElementById('modal-close-btn');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtnAlt) closeBtnAlt.addEventListener('click', closeModal);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  async function refresh() {
    await fetchProducts();
    renderFilterTabs();
    renderProducts();
  }

  return { init, openModal, closeModal, initModal, refresh };
})();
