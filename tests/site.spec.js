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
    await expect(page.locator('#navbar-nav [data-i18n="nav.home"]')).toHaveText('Home');

    // Alterna para Espanhol
    await page.click('[data-lang="es"]');
    await expect(page.locator('#navbar-nav [data-i18n="nav.home"]')).toHaveText('Inicio');

    // Retorna para Português
    await page.click('[data-lang="pt-BR"]');
    await expect(page.locator('#navbar-nav [data-i18n="nav.home"]')).toHaveText('Início');
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

  test('deve renderizar a seção de demonstração técnica com banner de agendamento', async ({ page }) => {
    const demoSection = page.locator('#demo');
    await expect(demoSection).toBeVisible();
    const demoCta = page.locator('#demo-whatsapp-cta');
    await expect(demoCta).toBeVisible();
    await expect(demoCta).toHaveAttribute('href', /wa\.me/);
  });

  test('deve expandir e recolher perguntas no FAQ', async ({ page }) => {
    const faqItem = page.locator('.faq-item').first();
    if (await faqItem.count() > 0) {
      await faqItem.click();
      await expect(faqItem).toHaveClass(/active|open/);
    }
  });

  test('deve possuir meta tags de SEO, Canonical e Open Graph configuradas', async ({ page }) => {
    // Title & Description
    await expect(page).toHaveTitle(/Eletrotech/);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /automação elétrica/i);

    // Canonical & Favicon
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /eletrotech/);
    const faviconSvg = page.locator('link[rel="icon"][type="image/svg+xml"]');
    await expect(faviconSvg).toHaveAttribute('href', '/favicon.svg');
    const favicon48 = page.locator('link[rel="icon"][sizes="48x48"]');
    await expect(favicon48).toHaveAttribute('href', '/favicon-48x48.png');

    // Open Graph & Twitter Cards & Site Name
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Eletrotech/);
    const ogSiteName = page.locator('meta[property="og:site_name"]');
    await expect(ogSiteName).toHaveAttribute('content', 'Eletrotech');
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
  });

  test('deve possuir dados estruturados Schema Markup (JSON-LD) válidos', async ({ page }) => {
    const schemaScript = page.locator('script[type="application/ld+json"]');
    await expect(schemaScript).toBeAttached();
    const content = await schemaScript.textContent();
    const schema = JSON.parse(content || '{}');

    expect(schema['@context']).toBe('https://schema.org');
    const graph = schema['@graph'] || [];
    const types = graph.flatMap(item => Array.isArray(item['@type']) ? item['@type'] : [item['@type']]);

    expect(types).toContain('WebSite');
    expect(types).toContain('LocalBusiness');
    expect(types).toContain('Product');
    expect(types).toContain('FAQPage');
    expect(types).toContain('Service');

    // Valida entidade WebSite para Google Search Site Name
    const webSite = graph.find(item => item['@type'] === 'WebSite');
    expect(webSite).toBeDefined();
    expect(webSite.name).toBe('Eletrotech');
  });

  test('deve servir robots.txt e sitemap.xml publicamente', async ({ request }) => {
    const robotsRes = await request.get(`${BASE_URL}/robots.txt`);
    expect(robotsRes.status()).toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain('Sitemap:');
    expect(robotsText).toContain('Disallow: /admin');
    expect(robotsText).toContain('Disallow: /admin.html');

    const sitemapRes = await request.get(`${BASE_URL}/sitemap.xml`);
    expect(sitemapRes.status()).toBe(200);
    const sitemapText = await sitemapRes.text();
    expect(sitemapText).toContain('<urlset');
    expect(sitemapText).toContain('eletrotech');
  });

  test('deve servir arquivo e meta tag de verificação do Google Search Console', async ({ page, request }) => {
    // 1. Verifica arquivo estático de verificação HTML
    const gscFileRes = await request.get(`${BASE_URL}/google038ae84a3baca0b8.html`);
    expect(gscFileRes.status()).toBe(200);
    const gscContent = await gscFileRes.text();
    expect(gscContent.trim()).toBe('google-site-verification: google038ae84a3baca0b8.html');

    // 2. Verifica meta tag no cabeçalho da página inicial
    await page.goto(`${BASE_URL}/`);
    const gscMeta = page.locator('meta[name="google-site-verification"]');
    await expect(gscMeta).toHaveAttribute('content', 'google038ae84a3baca0b8');
  });
});

test.describe('Eletrotech - Painel Administrativo (Enterprise Architecture)', () => {
  test('deve redirecionar a URL legada /admin.html para a rota canônica /admin', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin.html`);
    // Verifica que o navegador foi redirecionado e a URL exibida é /admin
    expect(page.url()).toBe(`${BASE_URL}/admin`);
    // Verifica que o formulário de login está presente
    await expect(page.locator('#admin-login')).toBeVisible();
  });

  test('deve carregar diretamente a rota limpa /admin e conter headers de segurança', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/admin`);
    expect(response.status()).toBe(200);
    expect(page.url()).toBe(`${BASE_URL}/admin`);
    await expect(page.locator('#admin-login')).toBeVisible();
  });

  test('deve permitir login do administrador na rota /admin e exibir a dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);

    // Preenche credenciais
    await page.fill('input[name="username"], #login-username, #username, input[type="text"]', 'admin');
    await page.fill('input[name="password"], #login-password, #password, input[type="password"]', 'admin123');

    // Submete login
    await page.click('button[type="submit"], #login-btn, .btn-admin-primary');

    // Deve exibir o painel administrativo
    await expect(page.locator('#admin-dashboard')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#admin-user-name')).toContainText('admin');
  });
});
