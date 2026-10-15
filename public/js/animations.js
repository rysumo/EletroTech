/* =============================================
   ELETROTECH — Animations
   Scroll Reveal (Optical Focus + Stagger),
   O₂ Bubbles, Counters (easeOutExpo),
   3D Tilt Parallax (LERP), Card Spotlight
   ============================================= */

const Animations = (() => {
  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let revealObserver = null;
  let counterObserver = null;
  let spotlightInitialized = false;
  let tiltInitialized = false;

  function init() {
    initHeroAura();
    initRevealAnimations();
    initBubbles();
    initCounters();
    initTiltParallax();
    initCardSpotlight();
  }

  // Injects .hero-glow-aura into #hero if not already present in DOM
  function initHeroAura() {
    const hero = document.getElementById('hero');
    if (!hero || hero.querySelector('.hero-glow-aura')) return;
    const aura = document.createElement('div');
    aura.className = 'hero-glow-aura';
    aura.setAttribute('aria-hidden', 'true');
    hero.insertBefore(aura, hero.firstChild);
  }

  // 2. Scroll Reveal com "foco óptico" e stagger automático entre irmãos
  function initRevealAnimations() {
    const selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
    const reveals = document.querySelectorAll(selector);

    if (prefersReducedMotion()) {
      reveals.forEach(el => el.classList.add('visible'));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const parent = el.parentElement;

            if (parent) {
              const siblings = Array.from(parent.children).filter(child =>
                child.matches(selector)
              );
              if (siblings.length > 1) {
                const idx = siblings.indexOf(el);
                const delay = Math.min(Math.max(idx, 0) * 60, 320);
                el.style.transitionDelay = `${delay}ms`;
              }
            }

            el.classList.add('visible');
            obs.unobserve(el);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      });
    }

    reveals.forEach(el => {
      if (!el.classList.contains('visible')) {
        revealObserver.observe(el);
      }
    });
  }

  // 3.3 Bolhas de O₂ (28 bolhas com oscilação lateral orgânica)
  function initBubbles() {
    const container = document.getElementById('bubbles');
    if (!container || prefersReducedMotion()) return;

    container.innerHTML = '';
    const count = 28;

    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';

      const size = Math.random() * 26 + 8; // 8–34px
      const left = Math.random() * 94 + 3; // 3–97%
      const duration = Math.random() * 5 + 6.5; // 6.5–11.5s
      const delay = Math.random() * 7; // 0–7s
      const opacity = (Math.random() * 0.45 + 0.45).toFixed(2); // 0.45–0.90
      const driftMagnitude = Math.random() * 28 + 12; // 12–40px
      const driftSign = Math.random() < 0.5 ? -1 : 1;
      const drift = (driftMagnitude * driftSign).toFixed(1);

      bubble.style.width = `${size.toFixed(1)}px`;
      bubble.style.height = `${size.toFixed(1)}px`;
      bubble.style.left = `${left.toFixed(2)}%`;
      bubble.style.animationDuration = `${duration.toFixed(2)}s`;
      bubble.style.animationDelay = `${delay.toFixed(2)}s`;
      bubble.style.setProperty('--drift', `${drift}px`);
      bubble.style.setProperty('--bubble-opacity', opacity);

      container.appendChild(bubble);
    }
  }

  // 4. Tilt 3D com inércia LERP e flutuação senoidal contínua
  function initTiltParallax() {
    if (tiltInitialized || prefersReducedMotion()) return;

    const hasFinePointer =
      window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer && window.innerWidth < 992) return;

    const configs = [
      {
        container: document.getElementById('hero'),
        target: document.querySelector('.hero-image img'),
        maxDeg: 10,
        maxTranslate: 18
      },
      {
        container: document.getElementById('featured'),
        target: document.querySelector('.featured-image img'),
        maxDeg: 9,
        maxTranslate: 16
      }
    ].filter(item => item.container && item.target);

    if (configs.length === 0) return;
    tiltInitialized = true;

    const states = configs.map(cfg => {
      const state = {
        ...cfg,
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0
      };

      cfg.container.addEventListener('pointermove', (e) => {
        const rect = cfg.container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        state.targetX = Math.max(-0.5, Math.min(0.5, nx));
        state.targetY = Math.max(-0.5, Math.min(0.5, ny));
      }, { passive: true });

      cfg.container.addEventListener('pointerleave', () => {
        state.targetX = 0;
        state.targetY = 0;
      }, { passive: true });

      return state;
    });

    const lerpFactor = 0.08;

    function tick(now) {
      const floatY = Math.sin(now * 0.002) * 5;

      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        s.currentX += (s.targetX - s.currentX) * lerpFactor;
        s.currentY += (s.targetY - s.currentY) * lerpFactor;

        const tx = s.currentX * 2 * s.maxTranslate;
        const ty = s.currentY * 2 * s.maxTranslate + floatY;
        const rotY = s.currentX * 2 * s.maxDeg;
        const rotX = -s.currentY * 2 * s.maxDeg;

        s.target.style.transform =
          `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // 5. Spotlight nos cards via delegação de eventos
  function initCardSpotlight() {
    if (spotlightInitialized || prefersReducedMotion()) return;
    spotlightInitialized = true;

    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.card, .service-card, .stat-card');
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
      card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
    }, { passive: true });
  }

  // 7. Contadores de estatísticas com desaceleração easeOutExpo
  function initCounters() {
    const counters = document.querySelectorAll('.stat-value');
    if (counters.length === 0) return;

    if (prefersReducedMotion()) {
      counters.forEach(el => {
        const target = parseInt(el.dataset.value || el.textContent, 10) || 0;
        const suffix = el.dataset.suffix || '';
        el.textContent = `${target}${suffix}`;
        el.dataset.counted = 'true';
      });
      return;
    }

    if (!counterObserver) {
      counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.dataset.counted !== 'true') {
              el.dataset.counted = 'true';
              animateCounter(el);
            }
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.25 });
    }

    counters.forEach(counter => {
      if (counter.dataset.counted !== 'true') {
        counterObserver.observe(counter);
      }
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.value || el.textContent, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1800;

    if (prefersReducedMotion() || target === 0) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const startTime = performance.now();
    el.textContent = `0${suffix}`;

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo: 1 - 2^(-10x)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(eased * target);

      el.textContent = `${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${target}${suffix}`;
      }
    }

    requestAnimationFrame(update);
  }

  return {
    init,
    initRevealAnimations,
    initCounters,
    animateCounter
  };
})();
