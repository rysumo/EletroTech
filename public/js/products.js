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
      allProducts = await res.json();
    } catch (err) {
      console.error('Error fetching products:', err);
      allProducts = [];
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      categories = await res.json();
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
      html += `<button class="filter-tab" data-filter="${cat.slug}">${cat.icon || ''} ${name}</button>`;
    });

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentFilter = tab.dataset.filter;
        container.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderProducts();
      });
    });
  }

  function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const suffix = I18n.getLangSuffix();
    const filtered = currentFilter === 'all'
      ? allProducts.filter(p => !p.is_featured)
      : allProducts.filter(p => p.category_slug === currentFilter && !p.is_featured);

    if (filtered.length === 0) {
      const emptyMsg = { 'pt-BR': 'Nenhum produto encontrado nesta categoria.', 'en': 'No products found in this category.', 'es': 'No se encontraron productos en esta categoría.' };
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: var(--color-gray-400);">
        <p style="font-size: var(--text-lg);">${emptyMsg[I18n.getLang()] || emptyMsg['pt-BR']}</p>
      </div>`;
      return;
    }

    grid.innerHTML = filtered.map(product => {
      const name = product[`name${suffix}`] || product.name_pt;
      const desc = product[`description${suffix}`] || product.description_pt;
      const catName = product[`category_name${suffix}`] || product.category_name_pt || '';
      const shortDesc = desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
      const btnLabel = { 'pt-BR': 'Ver Detalhes', 'en': 'View Details', 'es': 'Ver Detalles' };

      return `
        <div class="card reveal-scale" data-product-id="${product.id}">
          ${product.discount_percent > 0 ? `<span class="card-badge">-${product.discount_percent}%</span>` : ''}
          ${product.is_featured ? `<span class="card-featured">⭐ Destaque</span>` : ''}
          <div class="card-image product-card-placeholder" ${product.image ? `style="background-image: url('${product.image}'); background-size: cover; background-position: center; color: transparent;"` : ''}>
            ${!product.image ? '📦' : ''}
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

    // Re-init reveal animations for new elements
    Animations.initRevealAnimations();
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

    const whatsappLink = `https://wa.me/5545999241306?text=${encodeURIComponent(whatsappMsg)}`;
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
