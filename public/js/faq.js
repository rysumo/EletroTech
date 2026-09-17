/* =============================================
   ELETROTECH — FAQ Module
   Fetch and render accordion FAQ
   ============================================= */

const FAQ = (() => {
  let faqData = [];

  async function init() {
    await fetchFAQ();
    renderFAQ();
  }

  async function fetchFAQ() {
    try {
      const res = await fetch('/api/faq');
      faqData = await res.json();
    } catch (err) {
      console.error('Error fetching FAQ:', err);
      faqData = [];
    }
  }

  function renderFAQ() {
    const container = document.getElementById('faq-accordion');
    if (!container) return;

    const suffix = I18n.getLangSuffix();

    container.innerHTML = faqData.map((item, index) => {
      const question = item[`question${suffix}`] || item.question_pt;
      const answer = item[`answer${suffix}`] || item.answer_pt;

      return `
        <div class="accordion-item reveal" data-index="${index}">
          <button class="accordion-trigger" aria-expanded="false" id="faq-trigger-${index}">
            <span>${question}</span>
            <span class="accordion-icon">▼</span>
          </button>
          <div class="accordion-content" id="faq-content-${index}">
            <div class="accordion-content-inner">
              ${answer}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers
    container.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const content = item.querySelector('.accordion-content');
        const isActive = item.classList.contains('active');

        // Close all others
        container.querySelectorAll('.accordion-item').forEach(other => {
          other.classList.remove('active');
          other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
          other.querySelector('.accordion-content').style.maxHeight = null;
        });

        // Toggle current
        if (!isActive) {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });

    // Re-init reveal animations
    Animations.initRevealAnimations();
  }

  async function refresh() {
    await fetchFAQ();
    renderFAQ();
  }

  return { init, refresh };
})();
