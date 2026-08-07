/* Video testimonials: poster tiles that open the clip in a lightbox. */
(function () {
  'use strict';

  var overlay = null;

  function close() {
    if (!overlay) return;
    var v = overlay.querySelector('video');
    if (v) v.pause();
    overlay.remove();
    overlay = null;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) { if (e.key === 'Escape') close(); }

  function open(card) {
    close();
    var src = card.getAttribute('data-video');
    var embed = card.getAttribute('data-embed');
    if (!src && !embed) return;

    overlay = document.createElement('div');
    overlay.className = 'vt-overlay';
    var box = document.createElement('div');
    box.className = 'vt-box';

    if (embed) {
      var f = document.createElement('iframe');
      f.src = embed;
      f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.title = card.getAttribute('data-title') || 'Client testimonial';
      box.appendChild(f);
    } else {
      var v = document.createElement('video');
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      var poster = card.getAttribute('data-poster');
      if (poster) v.poster = poster;
      box.appendChild(v);
    }

    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'vt-close';
    x.setAttribute('aria-label', 'Close video');
    x.innerHTML = '&times;';
    x.addEventListener('click', close);
    box.appendChild(x);

    overlay.appendChild(box);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.vt-card'), function (card) {
      card.addEventListener('click', function (e) { e.preventDefault(); open(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
