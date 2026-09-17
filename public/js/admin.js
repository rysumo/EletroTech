/* =============================================
   ELETROTECH — Admin Panel JavaScript
   ============================================= */

const AdminApp = (() => {
  const API = '/api';
  let token = localStorage.getItem('eletrotech-admin-token');
  let categories = [];

  // ============================
  // AUTH
  // ============================
  function authHeaders() {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  }

  async function login(username, password) {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      token = data.token;
      localStorage.setItem('eletrotech-admin-token', token);
      showDashboard(data.user);
    } catch (err) {
      document.getElementById('login-error').textContent = err.message || 'Erro ao fazer login';
    }
  }

  async function verifyToken() {
    if (!token) return false;
    try {
      const res = await fetch(`${API}/auth/verify`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.valid ? data.user : false;
    } catch {
      localStorage.removeItem('eletrotech-admin-token');
      token = null;
      return false;
    }
  }

  function logout() {
    token = null;
    localStorage.removeItem('eletrotech-admin-token');
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('admin-login').style.display = '';
  }

  function showDashboard(user) {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
    document.getElementById('admin-user-name').textContent = user.username;
    loadProducts();
    loadCategories();
  }

  // ============================
  // PRODUCTS
  // ============================
  async function loadCategories() {
    try {
      const res = await fetch(`${API}/categories`);
      categories = await res.json();
      const select = document.getElementById('product-category');
      select.innerHTML = '<option value="">Sem categoria</option>' +
        categories.map(c => `<option value="${c.id}">${c.name_pt}</option>`).join('');
    } catch (err) { console.error(err); }
  }

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/products/all`, { headers: authHeaders() });
      const products = await res.json();
      const tbody = document.getElementById('products-tbody');
      tbody.innerHTML = products.map(p => `
        <tr>
          <td>${p.id}</td>
          <td>${p.name_pt}</td>
          <td>${p.category_name_pt || '-'}</td>
          <td><span class="badge-active ${p.is_featured ? 'badge-yes' : 'badge-no'}">${p.is_featured ? 'Sim' : 'Não'}</span></td>
          <td>${p.discount_percent > 0 ? p.discount_percent + '%' : '-'}</td>
          <td><span class="badge-active ${p.is_active ? 'badge-yes' : 'badge-no'}">${p.is_active ? 'Sim' : 'Não'}</span></td>
          <td class="actions">
            <button class="btn-action btn-edit" onclick="AdminApp.editProduct(${p.id})">✏️ Editar</button>
            <button class="btn-action btn-delete" onclick="AdminApp.deleteProduct(${p.id})">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (err) { console.error(err); }
  }

  function openProductForm(product = null) {
    const modal = document.getElementById('product-form-modal');
    document.getElementById('product-form-title').textContent = product ? 'Editar Produto' : 'Novo Produto';
    document.getElementById('product-form').reset();
    document.getElementById('product-image-preview').style.display = 'none';
    document.getElementById('product-id').value = product ? product.id : '';

    if (product) {
      document.getElementById('product-category').value = product.category_id || '';
      document.getElementById('product-name-pt').value = product.name_pt || '';
      document.getElementById('product-name-en').value = product.name_en || '';
      document.getElementById('product-name-es').value = product.name_es || '';
      document.getElementById('product-desc-pt').value = product.description_pt || '';
      document.getElementById('product-desc-en').value = product.description_en || '';
      document.getElementById('product-desc-es').value = product.description_es || '';
      document.getElementById('product-features-pt').value = product.features_pt || '';
      document.getElementById('product-features-en').value = product.features_en || '';
      document.getElementById('product-features-es').value = product.features_es || '';
      document.getElementById('product-discount').value = product.discount_percent || 0;
      document.getElementById('product-featured').checked = !!product.is_featured;
      document.getElementById('product-active').checked = product.is_active !== 0;
      document.getElementById('product-whatsapp-pt').value = product.whatsapp_message_pt || '';
      document.getElementById('product-sort').value = product.sort_order || 0;
      if (product.image) {
        const preview = document.getElementById('product-image-preview');
        preview.src = product.image;
        preview.style.display = 'block';
      }
    }
    modal.classList.add('active');
  }

  async function editProduct(id) {
    try {
      const res = await fetch(`${API}/products/${id}`, { headers: authHeaders() });
      const product = await res.json();
      openProductForm(product);
    } catch (err) { console.error(err); }
  }

  async function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const formData = new FormData();

    formData.append('category_id', document.getElementById('product-category').value);
    formData.append('name_pt', document.getElementById('product-name-pt').value);
    formData.append('name_en', document.getElementById('product-name-en').value);
    formData.append('name_es', document.getElementById('product-name-es').value);
    formData.append('description_pt', document.getElementById('product-desc-pt').value);
    formData.append('description_en', document.getElementById('product-desc-en').value);
    formData.append('description_es', document.getElementById('product-desc-es').value);
    formData.append('features_pt', document.getElementById('product-features-pt').value);
    formData.append('features_en', document.getElementById('product-features-en').value);
    formData.append('features_es', document.getElementById('product-features-es').value);
    formData.append('discount_percent', document.getElementById('product-discount').value);
    formData.append('is_featured', document.getElementById('product-featured').checked ? '1' : '0');
    formData.append('is_active', document.getElementById('product-active').checked ? '1' : '0');
    formData.append('whatsapp_message_pt', document.getElementById('product-whatsapp-pt').value);
    formData.append('sort_order', document.getElementById('product-sort').value);

    const imageFile = document.getElementById('product-image').files[0];
    if (imageFile) formData.append('image', imageFile);

    const preview = document.getElementById('product-image-preview');
    if (preview.src && !imageFile) formData.append('existing_image', preview.src.replace(window.location.origin, ''));

    try {
      const url = id ? `${API}/products/${id}` : `${API}/products`;
      const method = id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      closeModal('product-form-modal');
      loadProducts();
    } catch (err) { alert(err.message); }
  }

  async function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: authHeaders() });
      loadProducts();
    } catch (err) { console.error(err); }
  }

  // ============================
  // FAQ
  // ============================
  async function loadFaq() {
    try {
      const res = await fetch(`${API}/faq/all`, { headers: authHeaders() });
      const faqs = await res.json();
      const tbody = document.getElementById('faq-tbody');
      tbody.innerHTML = faqs.map(f => `
        <tr>
          <td>${f.id}</td>
          <td>${f.question_pt}</td>
          <td>${f.sort_order}</td>
          <td><span class="badge-active ${f.is_active ? 'badge-yes' : 'badge-no'}">${f.is_active ? 'Sim' : 'Não'}</span></td>
          <td class="actions">
            <button class="btn-action btn-edit" onclick="AdminApp.editFaq(${f.id}, '${encodeURIComponent(JSON.stringify(f))}')">✏️ Editar</button>
            <button class="btn-action btn-delete" onclick="AdminApp.deleteFaq(${f.id})">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (err) { console.error(err); }
  }

  function openFaqForm(faq = null) {
    const modal = document.getElementById('faq-form-modal');
    document.getElementById('faq-form-title').textContent = faq ? 'Editar FAQ' : 'Nova Pergunta';
    document.getElementById('faq-form').reset();
    document.getElementById('faq-id').value = faq ? faq.id : '';

    if (faq) {
      document.getElementById('faq-question-pt').value = faq.question_pt || '';
      document.getElementById('faq-question-en').value = faq.question_en || '';
      document.getElementById('faq-question-es').value = faq.question_es || '';
      document.getElementById('faq-answer-pt').value = faq.answer_pt || '';
      document.getElementById('faq-answer-en').value = faq.answer_en || '';
      document.getElementById('faq-answer-es').value = faq.answer_es || '';
      document.getElementById('faq-sort').value = faq.sort_order || 0;
      document.getElementById('faq-active').checked = faq.is_active !== 0;
    }
    modal.classList.add('active');
  }

  function editFaq(id, encodedData) {
    const faq = JSON.parse(decodeURIComponent(encodedData));
    openFaqForm(faq);
  }

  async function saveFaq(e) {
    e.preventDefault();
    const id = document.getElementById('faq-id').value;
    const body = {
      question_pt: document.getElementById('faq-question-pt').value,
      question_en: document.getElementById('faq-question-en').value,
      question_es: document.getElementById('faq-question-es').value,
      answer_pt: document.getElementById('faq-answer-pt').value,
      answer_en: document.getElementById('faq-answer-en').value,
      answer_es: document.getElementById('faq-answer-es').value,
      sort_order: document.getElementById('faq-sort').value,
      is_active: document.getElementById('faq-active').checked ? '1' : '0',
    };

    try {
      const url = id ? `${API}/faq/${id}` : `${API}/faq`;
      const method = id ? 'PUT' : 'POST';
      await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      closeModal('faq-form-modal');
      loadFaq();
    } catch (err) { alert('Erro ao salvar FAQ'); }
  }

  async function deleteFaq(id) {
    if (!confirm('Tem certeza?')) return;
    await fetch(`${API}/faq/${id}`, { method: 'DELETE', headers: authHeaders() });
    loadFaq();
  }

  // ============================
  // SERVICES
  // ============================
  async function loadServices() {
    try {
      const res = await fetch(`${API}/services/all`, { headers: authHeaders() });
      const services = await res.json();
      const tbody = document.getElementById('services-tbody');
      tbody.innerHTML = services.map(s => `
        <tr>
          <td>${s.id}</td>
          <td>${s.title_pt}</td>
          <td>${s.icon || '-'}</td>
          <td>${s.sort_order}</td>
          <td><span class="badge-active ${s.is_active ? 'badge-yes' : 'badge-no'}">${s.is_active ? 'Sim' : 'Não'}</span></td>
          <td class="actions">
            <button class="btn-action btn-edit" onclick="AdminApp.editService(${s.id}, '${encodeURIComponent(JSON.stringify(s))}')">✏️ Editar</button>
            <button class="btn-action btn-delete" onclick="AdminApp.deleteService(${s.id})">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (err) { console.error(err); }
  }

  function openServiceForm(service = null) {
    const modal = document.getElementById('service-form-modal');
    document.getElementById('service-form-title').textContent = service ? 'Editar Serviço' : 'Novo Serviço';
    document.getElementById('service-form').reset();
    document.getElementById('service-id').value = service ? service.id : '';

    if (service) {
      document.getElementById('service-icon').value = service.icon || '';
      document.getElementById('service-title-pt').value = service.title_pt || '';
      document.getElementById('service-title-en').value = service.title_en || '';
      document.getElementById('service-title-es').value = service.title_es || '';
      document.getElementById('service-desc-pt').value = service.description_pt || '';
      document.getElementById('service-desc-en').value = service.description_en || '';
      document.getElementById('service-desc-es').value = service.description_es || '';
      document.getElementById('service-sort').value = service.sort_order || 0;
      document.getElementById('service-active').checked = service.is_active !== 0;
    }
    modal.classList.add('active');
  }

  function editService(id, encodedData) {
    const service = JSON.parse(decodeURIComponent(encodedData));
    openServiceForm(service);
  }

  async function saveService(e) {
    e.preventDefault();
    const id = document.getElementById('service-id').value;
    const body = {
      icon: document.getElementById('service-icon').value,
      title_pt: document.getElementById('service-title-pt').value,
      title_en: document.getElementById('service-title-en').value,
      title_es: document.getElementById('service-title-es').value,
      description_pt: document.getElementById('service-desc-pt').value,
      description_en: document.getElementById('service-desc-en').value,
      description_es: document.getElementById('service-desc-es').value,
      sort_order: document.getElementById('service-sort').value,
      is_active: document.getElementById('service-active').checked ? '1' : '0',
    };

    try {
      const url = id ? `${API}/services/${id}` : `${API}/services`;
      const method = id ? 'PUT' : 'POST';
      await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      closeModal('service-form-modal');
      loadServices();
    } catch (err) { alert('Erro ao salvar serviço'); }
  }

  async function deleteService(id) {
    if (!confirm('Tem certeza?')) return;
    await fetch(`${API}/services/${id}`, { method: 'DELETE', headers: authHeaders() });
    loadServices();
  }

  // ============================
  // SETTINGS
  // ============================
  async function changePassword(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const msg = document.getElementById('password-message');

    if (newPassword !== confirmPassword) {
      msg.textContent = 'As senhas não coincidem';
      msg.style.color = 'var(--color-danger)';
      return;
    }

    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      msg.textContent = 'Senha alterada com sucesso!';
      msg.style.color = 'var(--color-success)';
      document.getElementById('change-password-form').reset();
    } catch (err) {
      msg.textContent = err.message;
      msg.style.color = 'var(--color-danger)';
    }
  }

  // ============================
  // NAVIGATION
  // ============================
  function switchSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.getElementById(`section-${section}`).style.display = 'block';
    document.getElementById('admin-page-title').textContent =
      { products: 'Produtos', faq: 'FAQ', services: 'Serviços', settings: 'Configurações' }[section] || section;

    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.sidebar-link[data-section="${section}"]`)?.classList.add('active');

    // Load data for section
    if (section === 'faq') loadFaq();
    else if (section === 'services') loadServices();
    else if (section === 'products') loadProducts();
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }

  // ============================
  // INIT
  // ============================
  async function init() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      login(
        document.getElementById('login-username').value,
        document.getElementById('login-password').value
      );
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Sidebar navigation
    document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        switchSection(link.dataset.section);
        // Close mobile sidebar
        document.getElementById('admin-sidebar').classList.remove('active');
      });
    });

    // Mobile sidebar
    document.getElementById('mobile-sidebar-toggle')?.addEventListener('click', () => {
      document.getElementById('admin-sidebar').classList.toggle('active');
    });

    // Product form
    document.getElementById('btn-add-product').addEventListener('click', () => openProductForm());
    document.getElementById('product-form').addEventListener('submit', saveProduct);
    document.getElementById('product-form-close').addEventListener('click', () => closeModal('product-form-modal'));
    document.getElementById('product-form-cancel').addEventListener('click', () => closeModal('product-form-modal'));

    // Image preview
    document.getElementById('product-image').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const preview = document.getElementById('product-image-preview');
          preview.src = ev.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    // FAQ form
    document.getElementById('btn-add-faq').addEventListener('click', () => openFaqForm());
    document.getElementById('faq-form').addEventListener('submit', saveFaq);
    document.getElementById('faq-form-close').addEventListener('click', () => closeModal('faq-form-modal'));
    document.getElementById('faq-form-cancel').addEventListener('click', () => closeModal('faq-form-modal'));

    // Service form
    document.getElementById('btn-add-service').addEventListener('click', () => openServiceForm());
    document.getElementById('service-form').addEventListener('submit', saveService);
    document.getElementById('service-form-close').addEventListener('click', () => closeModal('service-form-modal'));
    document.getElementById('service-form-cancel').addEventListener('click', () => closeModal('service-form-modal'));

    // Settings
    document.getElementById('change-password-form').addEventListener('submit', changePassword);

    // Close modals on overlay click
    document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });

    // Check if already logged in
    const user = await verifyToken();
    if (user) {
      showDashboard(user);
    }
  }

  // Start
  document.addEventListener('DOMContentLoaded', init);

  return {
    editProduct, deleteProduct,
    editFaq, deleteFaq,
    editService, deleteService,
  };
})();
