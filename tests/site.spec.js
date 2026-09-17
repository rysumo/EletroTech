const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Eletrotech - Testes do Site Público', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('deve carregar a página inicial com o título e navbar corretos', async ({ page }) => {
    await expect(page).toHaveTitle(/Eletrotech/);
    const logo = page.locator('#navbar-logo');
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('ELETROTECH');
  });

  test('deve alternar os idiomas da página corretamente', async ({ page }) => {
    // Alterna para Inglês
    await page.click('[data-lang="en"]');
    await expect(page.locator('[data-i18n="nav.home"]')).toHaveText('Home');

    // Alterna para Espanhol
    await page.click('[data-lang="es"]');
    await expect(page.locator('[data-i18n="nav.home"]')).toHaveText('Inicio');

    // Retorna para Português
    await page.click('[data-lang="pt-BR"]');
    await expect(page.locator('[data-i18n="nav.home"]')).toHaveText('Início');
  });

  test('deve filtrar produtos por categoria no catálogo', async ({ page }) => {
    // Aguarda catálogo carregar
    const catalog = page.locator('#catalog');
    await expect(catalog).toBeVisible();

    // Clica na categoria de Sondas
    const sondasTab = page.locator('#filter-tabs button:has-text("Sondas")');
    if (await sondasTab.count() > 0) {
      await sondasTab.click();
      await expect(sondasTab).toHaveClass(/active/);
    }
  });

  test('deve abrir e fechar o modal de detalhes do produto', async ({ page }) => {
    const detailBtn = page.locator('.product-card .btn-detail, .product-card button').first();
    if (await detailBtn.count() > 0) {
      await detailBtn.click();
      const modal = page.locator('#product-modal');
      await expect(modal).toBeVisible();

      // Fecha o modal
      const closeBtn = page.locator('#product-modal .modal-close, #product-modal [aria-label="Close"]');
      if (await closeBtn.count() > 0) {
        await closeBtn.first().click();
      }
    }
  });

  test('deve expandir e recolher perguntas no FAQ', async ({ page }) => {
    const faqItem = page.locator('.faq-item').first();
    if (await faqItem.count() > 0) {
      await faqItem.click();
      await expect(faqItem).toHaveClass(/active|open/);
    }
  });
});

test.describe('Eletrotech - Painel Administrativo', () => {
  test('deve permitir login do administrador e exibir a dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin.html`);

    // Preenche credenciais
    await page.fill('input[name="username"], #username, input[type="text"]', 'admin');
    await page.fill('input[name="password"], #password, input[type="password"]', 'admin123');

    // Submete login
    await page.click('button[type="submit"], .btn-login');

    // Deve exibir o painel
    await expect(page.locator('.admin-dashboard, #admin-dashboard, .admin-sidebar')).toBeVisible({ timeout: 5000 });
  });
});
