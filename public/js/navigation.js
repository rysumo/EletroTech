/* =============================================
   ELETROTECH — Navigation
   Sticky navbar, mobile menu, smooth scroll
   ============================================= */

const Navigation = (() => {
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navbar-nav');
  const menuToggle = document.getElementById('menu-toggle');
  const sections = document.querySelectorAll('.section[id]');

  function init() {
    // Scroll effect for navbar
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mobile menu toggle
    if (menuToggle) {
      menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          closeMobileMenu();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Close menu on click outside
    document.addEventListener('click', (e) => {
      if (navLinks && navLinks.classList.contains('active') &&
          !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Escape key closes menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });

    // Active section highlighting
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          setActiveLink(id);
        }
      });
    }, { rootMargin: '-40% 0px -60% 0px' });

    sections.forEach(section => observer.observe(section));
  }

  function handleScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function toggleMobileMenu() {
    if (!navLinks || !menuToggle) return;
    const isActive = navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
    document.body.classList.toggle('no-scroll', isActive);
  }

  function closeMobileMenu() {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  function setActiveLink(sectionId) {
    document.querySelectorAll('.navbar-nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  return { init };
})();
