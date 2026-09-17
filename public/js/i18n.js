/* =============================================
   ELETROTECH — i18n (Internationalization)
   ============================================= */

const I18n = (() => {
  let currentLang = localStorage.getItem('eletrotech-lang') || 'pt-BR';
  let translations = {};

  async function loadLanguage(lang) {
    try {
      const res = await fetch(`/i18n/${lang}.json`);
      if (!res.ok) throw new Error(`Failed to load ${lang}`);
      translations = await res.json();
      currentLang = lang;
      localStorage.setItem('eletrotech-lang', lang);
      applyTranslations();
      updateLangButtons();
      document.documentElement.lang = lang === 'pt-BR' ? 'pt-BR' : lang;
    } catch (err) {
      console.warn(`i18n: Could not load ${lang}, falling back to pt-BR`, err);
      if (lang !== 'pt-BR') {
        await loadLanguage('pt-BR');
      }
    }
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(translations, key);
      if (value) {
        el.textContent = value;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = getNestedValue(translations, key);
      if (value) {
        el.placeholder = value;
      }
    });
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  function updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  function init() {
    // Language selector buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang !== currentLang) {
          loadLanguage(lang);
          // Re-fetch dynamic content in new language
          if (window.Products) window.Products.refresh();
          if (window.FAQ) window.FAQ.refresh();
          if (window.App) window.App.refreshDynamic();
        }
      });
    });

    loadLanguage(currentLang);
  }

  function getLang() {
    return currentLang;
  }

  function getLangSuffix() {
    if (currentLang === 'pt-BR') return '_pt';
    if (currentLang === 'en') return '_en';
    if (currentLang === 'es') return '_es';
    return '_pt';
  }

  return { init, loadLanguage, getLang, getLangSuffix, applyTranslations };
})();
