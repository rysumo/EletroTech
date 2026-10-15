/* =============================================
   ELETROTECH — Animations
   Intersection Observer, Fluid Staggering,
   Precision Counters, Organic Hero Bubbles
   ============================================= */

const Animations = (() => {
  let revealObserver = null;
  let counterObserver = null;

  function init() {
    initRevealAnimations();
    initBubbles();
    initCounters();
    initTiltParallax();
    initCardSpotlight();
  }

  // Check if reduced motion is requested
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Scroll reveal animations
  function initRevealAnimations() {
    const unrevealed = document.querySelectorAll(
      '.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .reveal-scale:not(.visible)'
    );

    if (unrevealed.length === 0) return;

    if (prefersReducedMotion()) {
      unrevealed.forEach(el => el.classList.add('visible'));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // Calculate natural stagger based on sibling position in grid/flex
            const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
            const siblingIndex = siblings.indexOf(el);
            const staggerDelay = siblingIndex >= 0 && siblings.length > 1
              ? Math.min(siblingIndex * 60, 320)
              : 0;

            if (staggerDelay > 0) {
              setTimeout(() => {
                el.classList.add('visible');
              }, staggerDelay);
            } else {
              el.classList.add('visible');
            }

            revealObserver.unobserve(el);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      });
    }

    unrevealed.forEach(el => revealObserver.observe(el));
  }

  // Decorative O₂ bubbles in hero with organic hydrodynamic drift
  function initBubbles() {
    const container = document.getElementById('bubbles');
    if (!container) return;
    if (prefersReducedMotion()) return;

    container.innerHTML = ''; // Prevent duplicates

    const count = 28;
    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const size = Math.floor(Math.random() * 26 + 8); // 8px to 34px
      // Lateral sinusoidal sway amplitude (-36px to +36px)
      const drift = (Math.random() * 28 + 12) * (Math.random() > 0.5 ? 1 : -1);
      const duration = (Math.random() * 5 + 6.5).toFixed(1);
      const delay = (Math.random() * 7).toFixed(1);
      const opacity = (Math.random() * 0.45 + 0.45).toFixed(2);

      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${(Math.random() * 94 + 3).toFixed(1)}%`;
      bubble.style.setProperty('--drift', `${drift.toFixed(1)}px`);
      bubble.style.animationDuration = `${duration}s`;
      bubble.style.animationDelay = `${delay}s`;
      bubble.style.opacity = opacity;
      container.appendChild(bubble);
    }
  }

  // Animated counters with easeOutExpo curve
  function initCounters() {
    const counters = document.querySelectorAll('.stat-value:not(.counted)');
    if (counters.length === 0) return;

    if (prefersReducedMotion()) {
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.value || counter.textContent) || 0;
        const suffix = counter.dataset.suffix || '';
        counter.textContent = target + suffix;
        counter.classList.add('counted');
      });
      return;
    }

    if (!counterObserver) {
      counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
    }

    counters.forEach(counter => counterObserver.observe(counter));
  }

  // High-precision smooth counter using requestAnimationFrame & deceleration easing
  function animateCounter(el) {
    if (el.classList.contains('counted')) return;
    el.classList.add('counted');

    const target = parseInt(el.dataset.value || el.textContent) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1800; // 1.8s
    let startTime = null;

    // Easing: easeOutExpo (fast start, silky-smooth finish)
    function easeOutExpo(x) {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = easeOutExpo(progress);
      const current = Math.floor(eased * target);

      if (progress < 1) {
        el.textContent = current + suffix;
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  }

  // Interactive 3D tilt with LERP spring interpolation (inspired by Quadrangular & modern agency standards)
  function initTiltParallax() {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(pointer: fine)').matches && window.innerWidth < 992) return;

    const items = [
      {
        container: document.getElementById('hero'),
        element: document.querySelector('.hero-image img'),
        maxDeg: 10,
        maxTranslate: 18
      },
      {
        container: document.getElementById('featured'),
        element: document.querySelector('.featured-image img'),
        maxDeg: 9,
        maxTranslate: 16
      }
    ];

    items.forEach(({ container, element, maxDeg, maxTranslate }) => {
      if (!container || !element) return;

      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;
      let isHovering = false;
      let rafId = null;

      container.addEventListener('pointermove', (e) => {
        const rect = container.getBoundingClientRect();
        // Normalized -0.5 to 0.5
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;
        targetX = Math.max(-0.5, Math.min(0.5, normX));
        targetY = Math.max(-0.5, Math.min(0.5, normY));
        isHovering = true;
        if (!rafId) rafId = requestAnimationFrame(update);
      }, { passive: true });

      container.addEventListener('pointerleave', () => {
        targetX = 0;
        targetY = 0;
        isHovering = false;
      });

      function update(time) {
        // LERP interpolation
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        // Subtle ambient float combined with pointer tilt
        const ambientY = Math.sin(time * 0.002) * 5;

        const posX = (currentX * maxTranslate).toFixed(2);
        const posY = (currentY * maxTranslate + ambientY).toFixed(2);
        const rotY = (currentX * maxDeg).toFixed(2);
        const rotX = (-currentY * maxDeg).toFixed(2);

        element.style.transform = `translate3d(${posX}px, ${posY}px, 0) rotateY(${rotY}deg) rotateX(${rotX}deg)`;

        rafId = requestAnimationFrame(update);
      }

      rafId = requestAnimationFrame(update);
    });
  }

  // Dynamic card spotlight tracking pointer coordinates (--mouse-x, --mouse-y)
  function initCardSpotlight() {
    if (prefersReducedMotion()) return;

    // Use event delegation on document so static and dynamically rendered cards both receive spotlight
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.card, .service-card, .stat-card');
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });
  }

  return {
    init,
    initRevealAnimations,
    initCounters,
    animateCounter,
    initBubbles,
    initTiltParallax,
    initCardSpotlight
  };
})();
