/* =============================================
   ELETROTECH — Site Settings Module
   Fetches editable site-wide info (WhatsApp number,
   contact details, social links) from the admin-managed
   /api/settings endpoint and applies it to the page,
   so these values no longer need to be hardcoded here.
   ============================================= */

const SiteSettings = (() => {
  let settings = {};

  async function init() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        settings = await res.json();
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
      settings = {};
    }
    apply();
  }

  function apply() {
    // Update every WhatsApp link on the page (hero, featured, footer, floating
    // button) to use the configured number, keeping each link's own message.
    if (settings.whatsapp_number) {
      const cleanNum = settings.whatsapp_number.replace(/\D/g, '');
      const fullNum = cleanNum.startsWith('55') ? cleanNum : `55${cleanNum}`;
      document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
        a.href = a.href.replace(/wa\.me\/\d+/, `wa.me/${fullNum}`);
      });
    }

    const phoneEl = document.getElementById('footer-phone-display');
    if (phoneEl && settings.phone_display) phoneEl.textContent = settings.phone_display;

    const igHandleEl = document.getElementById('footer-instagram-handle');
    if (igHandleEl && settings.instagram_handle) igHandleEl.textContent = settings.instagram_handle;

    const igLinkEl = document.getElementById('footer-instagram');
    if (igLinkEl && settings.instagram_url) igLinkEl.href = settings.instagram_url;
  }

  function get(key, fallback = '') {
    return settings[key] || fallback;
  }

  return { init, get };
})();
