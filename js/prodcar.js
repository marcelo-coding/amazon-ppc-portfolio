/* Product carousel: real catalog product photos, auto advancing, swipeable. */
(function () {
  'use strict';

  function build(el) {
    var imgs = (el.getAttribute('data-imgs') || '').split('|').filter(Boolean);
    if (!imgs.length) return;
    var alts = (el.getAttribute('data-alts') || '').split('|');
    var caps = (el.getAttribute('data-caps') || '').split('|');
    var base = el.getAttribute('data-base') || '';
    var showCaps = el.hasAttribute('data-captions');
    var i = 0;

    var viewport = document.createElement('div');
    viewport.className = 'pc-viewport';

    var slides = imgs.map(function (src, n) {
      var s = document.createElement('div');
      s.className = 'pc-slide' + (n === 0 ? ' is-active' : '');
      var im = document.createElement('img');
      im.src = base + src;
      im.alt = alts[n] || '';
      im.loading = n === 0 ? 'eager' : 'lazy';
      s.appendChild(im);
      if (showCaps && caps[n]) {
        var c = document.createElement('div');
        c.className = 'pc-cap';
        c.textContent = caps[n];
        s.appendChild(c);
      }
      viewport.appendChild(s);
      return s;
    });

    var dots = document.createElement('div');
    dots.className = 'pc-dots';
    var dotEls = imgs.map(function (_, n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pc-dot' + (n === 0 ? ' is-active' : '');
      b.setAttribute('aria-label', 'Show product ' + (n + 1));
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        go(n);
        hold();
      });
      dots.appendChild(b);
      return b;
    });

    function arrow(dir, label, glyph) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pc-arrow pc-' + dir;
      b.setAttribute('aria-label', label);
      b.innerHTML = glyph;
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        go(i + (dir === 'next' ? 1 : -1));
        hold();
      });
      return b;
    }

    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      dotEls.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
    }

    el.textContent = '';
    el.appendChild(viewport);
    if (slides.length > 1) {
      el.appendChild(arrow('prev', 'Previous product', '&#8249;'));
      el.appendChild(arrow('next', 'Next product', '&#8250;'));
      el.appendChild(dots);
    }

    var timer = null, paused = false;
    function tick() { if (!paused && slides.length > 1) go(i + 1); }
    function start() { if (timer === null && slides.length > 1) timer = setInterval(tick, 4200); }
    function hold() { paused = true; setTimeout(function () { paused = false; }, 9000); }
    el.addEventListener('mouseenter', function () { paused = true; });
    el.addEventListener('mouseleave', function () { paused = false; });

    var x0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); hold(); }
      x0 = null;
    }, { passive: true });

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { start(); }
          else if (timer !== null) { clearInterval(timer); timer = null; }
        });
      }, { threshold: 0.2 }).observe(el);
    } else {
      start();
    }
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.prodcar'), build);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
