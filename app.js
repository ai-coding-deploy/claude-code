/* =============================================================
   CortexLens School — app.js
   Modules:
     - Header scroll state
     - Mobile nav toggle
     - Scroll-reveal (IntersectionObserver)
     - Library accordion
     - Student reflections slider
     - Modal system (focus trap, scroll lock, Esc, outside click)
     - Cookie banner (localStorage: cortexlens_consent)
     - Newsletter form (front-end validation, success state)
     - Footer year stamp
   ============================================================= */

(function () {
  'use strict';

  // -----------------------------------------------------------
  // 1. Utilities
  // -----------------------------------------------------------
  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(sel)
    );
  }

  // -----------------------------------------------------------
  // 2. Header scroll state
  // -----------------------------------------------------------
  (function header() {
    var header = $('.site-header');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 24) {
        header.classList.add('site-header--solid');
      } else {
        header.classList.remove('site-header--solid');
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  // -----------------------------------------------------------
  // 3. Mobile nav toggle
  // -----------------------------------------------------------
  (function mobileNav() {
    var toggle = $('.site-header__menu-toggle');
    var nav = $('.site-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('site-nav--open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    $all('.site-nav__link', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('site-nav--open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  })();

  // -----------------------------------------------------------
  // 4. Scroll reveal
  // -----------------------------------------------------------
  (function reveal() {
    var targets = $all('.reveal');
    if (!targets.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('reveal--in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('reveal--in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  })();

  // -----------------------------------------------------------
  // 5. Library accordion
  // -----------------------------------------------------------
  (function accordion() {
    var items = $all('.library-item');
    items.forEach(function (item) {
      var trigger = $('.library-item__trigger', item);
      var panel = $('.library-item__panel', item);
      if (!trigger || !panel) return;

      trigger.addEventListener('click', function () {
        var open = item.classList.toggle('library-item--open');
        trigger.setAttribute('aria-expanded', String(open));
      });
    });
  })();

  // -----------------------------------------------------------
  // 6. Student reflections slider
  // -----------------------------------------------------------
  (function slider() {
    var root = $('.reflections');
    if (!root) return;
    var track = $('.reflections__track', root);
    var slides = $all('.reflections__slide', root);
    var dotsWrap = $('.reflections__dots', root);
    var prevBtn = $('.reflections__arrow--prev', root);
    var nextBtn = $('.reflections__arrow--next', root);
    if (!track || slides.length === 0) return;

    var index = 0;
    var dots = [];

    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'reflections__dot';
      b.setAttribute('aria-label', 'Go to reflection ' + (i + 1));
      b.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(b);
      dots.push(b);
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      dots.forEach(function (d, di) {
        d.classList.toggle('reflections__dot--active', di === index);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { go(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(index + 1); });

    go(0);

    if (!prefersReducedMotion) {
      var autoplay = setInterval(function () { go(index + 1); }, 7000);
      root.addEventListener('mouseenter', function () { clearInterval(autoplay); });
    }
  })();

  // -----------------------------------------------------------
  // 7. Modal system
  // -----------------------------------------------------------
  var modalApi = (function modals() {
    var openModalEl = null;
    var lastFocus = null;

    var focusableSelector = [
      'a[href]', 'button:not([disabled])', 'input:not([disabled])',
      'textarea:not([disabled])', 'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    function lockBody(lock) {
      document.body.classList.toggle('is-locked', lock);
    }

    function trapKey(e) {
      if (!openModalEl) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;

      var focusables = $all(focusableSelector, openModalEl)
        .filter(function (el) { return !el.hasAttribute('disabled'); });
      if (focusables.length === 0) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }

    function open(modalId) {
      var modal = document.getElementById(modalId);
      if (!modal) return;
      if (openModalEl === modal) return;
      if (openModalEl) close();

      lastFocus = document.activeElement;
      openModalEl = modal;
      modal.classList.add('modal--open');
      modal.setAttribute('aria-hidden', 'false');
      lockBody(true);

      window.setTimeout(function () {
        var first = $(focusableSelector, modal);
        if (first) first.focus();
      }, 30);

      document.addEventListener('keydown', trapKey);
    }

    function close() {
      if (!openModalEl) return;
      openModalEl.classList.remove('modal--open');
      openModalEl.setAttribute('aria-hidden', 'true');
      openModalEl = null;
      lockBody(false);
      document.removeEventListener('keydown', trapKey);
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    }

    // Wire openers
    $all('[data-modal-open]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        open(el.getAttribute('data-modal-open'));
      });
    });

    // Wire closers (× buttons and backdrops)
    $all('.modal').forEach(function (modal) {
      $all('[data-modal-close]', modal).forEach(function (el) {
        el.addEventListener('click', close);
      });
      var backdrop = $('.modal__backdrop', modal);
      if (backdrop) {
        backdrop.addEventListener('click', close);
      }
    });

    return { open: open, close: close };
  })();

  // -----------------------------------------------------------
  // 8. Cookie banner
  // -----------------------------------------------------------
  (function cookies() {
    var KEY = 'cortexlens_consent';
    var banner = $('.cookie-banner');
    if (!banner) return;

    function get() {
      try { return localStorage.getItem(KEY); }
      catch (e) { return null; }
    }
    function set(value) {
      try { localStorage.setItem(KEY, value); }
      catch (e) { /* ignore */ }
    }

    function show() {
      // Slight delay so it doesn't appear before paint settles.
      window.setTimeout(function () {
        banner.classList.add('cookie-banner--visible');
      }, 600);
    }
    function hide() {
      banner.classList.remove('cookie-banner--visible');
    }

    if (!get()) {
      show();
    }

    var acceptBtn = $('.cookie-banner__btn--accept', banner);
    var declineBtn = $('.cookie-banner__btn--decline', banner);
    var manageBtn = $('.cookie-banner__btn--manage', banner);

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        set('accepted');
        hide();
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        set('declined');
        hide();
      });
    }
    if (manageBtn) {
      manageBtn.addEventListener('click', function () {
        modalApi.open('modal-cookies');
      });
    }
  })();

  // -----------------------------------------------------------
  // 9. Newsletter form
  // -----------------------------------------------------------
  (function newsletter() {
    var form = $('.newsletter__form');
    if (!form) return;
    var input = $('.newsletter__input', form);
    var msg = $('.newsletter__message', form);

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = (input.value || '').trim();

      if (!value) {
        setMessage('Please enter your email address.', 'error');
        input.focus();
        return;
      }
      if (!emailRe.test(value)) {
        setMessage('That email address looks incomplete. Please check it.', 'error');
        input.focus();
        return;
      }

      setMessage(
        'Thank you. Your first Field Note will arrive soon at ' + value + '.',
        'success'
      );
      form.reset();
    });

    function setMessage(text, kind) {
      msg.textContent = text;
      msg.classList.remove('newsletter__message--error',
        'newsletter__message--success');
      if (kind) {
        msg.classList.add('newsletter__message--' + kind);
      }
    }
  })();

  // -----------------------------------------------------------
  // 10. Footer year
  // -----------------------------------------------------------
  (function footerYear() {
    var y = $('.site-footer__year');
    if (y) y.textContent = String(new Date().getFullYear());
  })();
})();
