/* ========================================================
   EYFA NATURAL OIL – JavaScript
   ======================================================== */

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHamburger();
  initAOS();
  initTestimonialSlider();
  initTabSystem();
  initKandunganBars();
  initSmoothScroll();
  initFloatingWAVisibility();
  initProductDropdown();
  initMarketplaceModal();
  initBTSVideo();
});

/* ============================================================
   NAVBAR – scroll effect
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   HAMBURGER MENU
   ============================================================ */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!btn || !navLinks) return;

  btn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    // Animate spans
    const spans = btn.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      btn.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity = '';
      });
    });
  });
}

/* ============================================================
   LIGHTWEIGHT AOS (Animate On Scroll)
   ============================================================ */
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  const revealVisibleElements = () => {
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('aos-animate');
      }
    });
  };

  revealVisibleElements();
  document.body.classList.add('aos-ready');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.aosDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));

  let ticking = false;
  const revealOnViewportChange = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      revealVisibleElements();
      ticking = false;
    });
  };

  requestAnimationFrame(() => {
    setTimeout(revealVisibleElements, 100);
    setTimeout(revealVisibleElements, 600);
    setTimeout(revealVisibleElements, 1200);
  });
  window.addEventListener('load', revealVisibleElements, { once: true });
  window.addEventListener('hashchange', revealVisibleElements);
  window.addEventListener('scroll', revealOnViewportChange, { passive: true });
  window.addEventListener('resize', revealOnViewportChange, { passive: true });
}

/* ============================================================
   KANDUNGAN BARS ANIMATION
   ============================================================ */
function initKandunganBars() {
  const bars = document.querySelectorAll('.kand-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
}

/* ============================================================
   TESTIMONIAL SLIDER — Fixed & Synced
   ============================================================ */
function initTestimonialSlider() {
  const track       = document.getElementById('testiTrack');
  const prevBtn     = document.getElementById('testiPrev');
  const nextBtn     = document.getElementById('testiNext');
  const dotsEl      = document.getElementById('testiDots');
  const viewport    = track ? track.closest('.testi-viewport') : null;

  if (!track || !prevBtn || !nextBtn || !viewport) return;

  const cards = Array.from(track.querySelectorAll('.testi-card'));
  const GAP   = 24; // must match CSS gap
  let currentIndex   = 0;
  let autoplayTimer  = null;
  let isAnimating    = false;

  /* ---- How many cards are visible at once ---- */
  function getVisible() {
    const w = window.innerWidth;
    if (w <= 640)  return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  /* ---- Set exact card width via CSS custom property ---- */
  function setCardWidths() {
    const visible    = getVisible();
    const totalGaps  = GAP * (visible - 1);
    const cardPx     = Math.floor((viewport.offsetWidth - totalGaps) / visible);
    cards.forEach(c => c.style.setProperty('--card-w', cardPx + 'px'));
    return cardPx;
  }

  /* ---- Total number of slide positions ---- */
  function getTotalSlides() {
    return Math.max(1, cards.length - getVisible() + 1);
  }

  /* ---- Build / rebuild dot indicators ---- */
  function buildDots() {
    dotsEl.innerHTML = '';
    const total = getTotalSlides();
    for (let i = 0; i < total; i++) {
      const d = document.createElement('button');
      d.className   = 'testi-dot' + (i === currentIndex ? ' active' : '');
      d.setAttribute('aria-label', `Testimoni ${i + 1}`);
      d.addEventListener('click', () => { goTo(i); resetAutoplay(); });
      dotsEl.appendChild(d);
    }
  }

  function updateDots() {
    dotsEl.querySelectorAll('.testi-dot')
          .forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  }

  /* ---- Highlight the first visible card ---- */
  function updateActiveCard() {
    cards.forEach((c, i) => c.classList.toggle('active-card', i === currentIndex));
  }

  /* ---- Move the track to the correct position ---- */
  function goTo(index) {
    if (isAnimating) return;
    const total = getTotalSlides();
    currentIndex = ((index % total) + total) % total;   // wrap-around safe

    // Re-measure card width each time (handles font-load / resize edge cases)
    const cardPx = setCardWidths();
    const offset = currentIndex * (cardPx + GAP);

    isAnimating = true;
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
    updateActiveCard();

    // Release lock after transition completes (500ms matches CSS)
    setTimeout(() => { isAnimating = false; }, 520);
  }

  /* ---- Navigation buttons ---- */
  prevBtn.addEventListener('click', () => {
    goTo(currentIndex - 1);
    resetAutoplay();
  });
  nextBtn.addEventListener('click', () => {
    goTo(currentIndex + 1);
    resetAutoplay();
  });

  /* ---- Autoplay ---- */
  function startAutoplay() {
    autoplayTimer = setInterval(() => goTo(currentIndex + 1), 5000);
  }
  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  /* ---- Touch / swipe support ---- */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      goTo(delta > 0 ? currentIndex + 1 : currentIndex - 1);
      resetAutoplay();
    }
  }, { passive: true });

  /* ---- Resize: rebuild everything ---- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Clamp index to new total
      currentIndex = Math.min(currentIndex, getTotalSlides() - 1);
      buildDots();
      goTo(currentIndex);
    }, 150);
  }, { passive: true });

  /* ---- Initial render ---- */
  // Wait one frame so the DOM has painted and offsetWidth is reliable
  requestAnimationFrame(() => {
    setCardWidths();
    buildDots();
    goTo(0);
    startAutoplay();
  });
}

/* ============================================================
   TAB SYSTEM (Manfaat)
   ============================================================ */
function initTabSystem() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById(`panel-${target}`);
      if (panel) {
        panel.classList.add('active');
        // Re-trigger AOS for newly visible elements
        panel.querySelectorAll('[data-aos]').forEach(el => {
          el.classList.remove('aos-animate');
          requestAnimationFrame(() => {
            setTimeout(() => el.classList.add('aos-animate'), 50);
          });
        });
      }
    });
  });
}

/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ============================================================
   FLOATING WA VISIBILITY (Mobile)
   ============================================================ */
function initFloatingWAVisibility() {
  const floatingWA = document.getElementById('floatingWA');
  const footer = document.querySelector('footer');
  if (!floatingWA || !footer) return;

  const mobileMax = 768;
  let observer = null;
  let resizeTimer;

  const setupObserver = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    const isMobile = window.innerWidth <= mobileMax;
    if (!isMobile) {
      floatingWA.classList.remove('floating-wa--hidden');
      return;
    }

    observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        floatingWA.classList.add('floating-wa--hidden');
      } else {
        floatingWA.classList.remove('floating-wa--hidden');
      }
    }, { threshold: 0.15 });

    observer.observe(footer);
  };

  setupObserver();

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setupObserver, 150);
  }, { passive: true });
}

/* ============================================================
   PRODUCT DROPDOWN
   ============================================================ */
function initProductDropdown() {
  const toggle = document.getElementById('produkToggle');
  const menu = document.getElementById('produkMenu');
  const wrap = toggle ? toggle.closest('.nav-dropdown-wrap') : null;
  if (!toggle || !menu || !wrap) return;

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = wrap.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      wrap.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    if (!wrap.contains(event.target)) {
      wrap.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      wrap.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ============================================================
   MARKETPLACE ORDER MODAL
   ============================================================ */
function initMarketplaceModal() {
  const modal = document.getElementById('marketplaceModal');
  const closeBtn = document.getElementById('modalClose');
  if (!modal || !closeBtn) return;

  const orderButtons = [
    document.getElementById('navOrderBtn'),
    document.getElementById('hero-order-btn'),
    ...document.querySelectorAll('.btn-produk-order')
  ].filter(Boolean);

  const waLink = modal.querySelector('.platform-wa');
  const baseMessage = 'Halo Eyfa, saya ingin memesan Minyak Kemiri';

  const openModal = (event) => {
    if (event) event.preventDefault();
    const product = event && event.currentTarget ? event.currentTarget.dataset.product : '';
    if (waLink) {
      const message = product ? `Halo Eyfa, saya ingin memesan ${product}` : baseMessage;
      waLink.href = `https://wa.me/6287872252079?text=${encodeURIComponent(message)}`;
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  orderButtons.forEach(button => {
    button.addEventListener('click', openModal);
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ============================================================
   BTS VIDEO
   ============================================================ */
function initBTSVideo() {
  const video = document.getElementById('btsVideo');
  if (!video) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting && !video.paused) {
        video.pause();
      }
    });
  }, { threshold: 0.08 });

  observer.observe(video);
}

/* ============================================================
   FLOATING WA BUTTON
   ============================================================ */
(function () {
  const floatingWA = document.getElementById('floatingWA');
  if (!floatingWA) return;
  floatingWA.style.opacity = '1';
  floatingWA.style.pointerEvents = 'all';
})();
