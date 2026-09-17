/* =============================================
   ELETROTECH — Animations
   Intersection Observer, Counters, Bubbles
   ============================================= */

const Animations = (() => {
  function init() {
    initRevealAnimations();
    initBubbles();
    initCounters();
  }

  // Scroll reveal animations
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animations for siblings
          const delay = index * 100;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  }

  // Decorative O₂ bubbles in hero
  function initBubbles() {
    const container = document.getElementById('bubbles');
    if (!container) return;

    const count = 20;
    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const size = Math.random() * 30 + 8;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.animationDuration = `${Math.random() * 8 + 6}s`;
      bubble.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(bubble);
    }
  }

  // Animated counters
  function initCounters() {
    const counters = document.querySelectorAll('.stat-value');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.value || el.textContent);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    function update() {
      current += step;
      if (current >= target) {
        el.textContent = target + suffix;
        return;
      }
      el.textContent = Math.floor(current) + suffix;
      requestAnimationFrame(update);
    }

    el.textContent = '0' + suffix;
    requestAnimationFrame(update);
  }

  return { init, initRevealAnimations };
})();
