/* Video testimonials: the clip plays inside its own card, never in a popup. */
(function () {
  'use strict';

  function stopOthers(except) {
    Array.prototype.forEach.call(document.querySelectorAll('.vt-poster video'), function (v) {
      if (v !== except) { v.pause(); }
    });
  }

  function play(card) {
    var poster = card.querySelector('.vt-poster');
    if (!poster) return;

    var existing = poster.querySelector('video');
    if (existing) {
      stopOthers(existing);
      if (existing.paused) { existing.play(); } else { existing.pause(); }
      return;
    }

    var src = card.getAttribute('data-video');
    if (!src) return;

    var v = document.createElement('video');
    v.src = src;
    v.controls = true;
    v.autoplay = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.preload = 'metadata';
    var p = card.getAttribute('data-poster');
    if (p) v.poster = p;

    var img = poster.querySelector('img');
    var badge = poster.querySelector('.vt-play');
    if (img) img.style.display = 'none';
    if (badge) badge.style.display = 'none';
    poster.appendChild(v);
    card.classList.add('is-playing');

    v.addEventListener('play', function () { stopOthers(v); });
    v.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.vt-card'), function (card) {
      card.addEventListener('click', function (e) {
        if (e.target && e.target.tagName === 'VIDEO') return;
        e.preventDefault();
        play(card);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(card); }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
