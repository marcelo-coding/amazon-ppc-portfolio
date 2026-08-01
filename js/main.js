/* marcppc.dev — particles, scroll reveal, count-up, nav state */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Sticky nav scrolled state ---------------- */

  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 10) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var toggle = nav.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
        toggle.setAttribute(
          "aria-expanded",
          nav.classList.contains("open") ? "true" : "false"
        );
      });
      nav.querySelectorAll(".nav-links a").forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ---------------- Scroll reveal ---------------- */

  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    /* Sibling stagger is handled in CSS via nth-child transition delays. */
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------------- Count-up for stat numbers ---------------- */

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reducedMotion) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          cio.unobserve(entry.target);
          var el = entry.target;
          var target = parseFloat(el.getAttribute("data-count"));
          var prefix = el.getAttribute("data-prefix") || "";
          var suffix = el.getAttribute("data-suffix") || "";
          var start = null;
          var duration = 1200;
          var step = function (ts) {
            if (start === null) start = ts;
            var t = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - t, 3);
            var value = Math.round(target * eased);
            el.textContent = prefix + value + suffix;
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) {
      cio.observe(el);
    });
  }

  /* ---------------- Hero particle canvas ---------------- */

  var canvas = document.getElementById("particles");
  if (canvas && !reducedMotion) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.max(window.devicePixelRatio || 1, 1);
    var width = 0;
    var height = 0;
    var particles = [];
    var LINK_DIST = 110;

    var resize = function () {
      var rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    var seed = function () {
      particles = [];
      var count = Math.min(Math.floor(window.innerWidth / 18), 90);
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.6 + Math.random() * 1.6,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          alpha: 0.15 + Math.random() * 0.35,
          orange: i % 2 === 0
        });
      }
    };

    var tick = function () {
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += width;
        if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height;
        if (p.y > height) p.y -= height;
      }

      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            ctx.strokeStyle =
              "rgba(255,153,0," + ((1 - d / LINK_DIST) * 0.12).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      for (var j = 0; j < particles.length; j++) {
        var q = particles[j];
        ctx.fillStyle = q.orange
          ? "rgba(255,153,0," + q.alpha + ")"
          : "rgba(255,255,255," + q.alpha + ")";
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(tick);
    };

    resize();
    seed();
    requestAnimationFrame(tick);
    window.addEventListener("resize", function () {
      resize();
      seed();
    });
  }
})();
