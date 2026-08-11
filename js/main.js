/* marcppc.dev — particles, scroll reveal, count-up, nav state, tooling carousel */

(function () {
  "use strict";

  var reducedMotion = false; /* animations forced on, the OS reduce flag was hiding every reveal and particle */

  var boot = function () {
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

    /* Auto-tag inner page content so article pages animate without markup edits.
       Elements already carrying .reveal keep their authored behavior. */
    var autoSel = [
      ".article > h2", ".article > h3", ".article > h4", ".article > p",
      ".article > ul", ".article > ol", ".article > blockquote",
      ".article .stat-callout", ".article .adconsole", ".article .prodcar",
      ".page-hero .eyebrow", ".page-hero h1", ".page-hero-inner > p"
    ].join(",");
    var autoIdx = 0;
    document.querySelectorAll(autoSel).forEach(function (el) {
      if (el.classList.contains("reveal")) return;
      el.classList.add("reveal-auto");
      el.style.transitionDelay = ((autoIdx % 4) * 0.07) + "s";
      autoIdx++;
    });

    var revealEls = document.querySelectorAll(".reveal, .reveal-auto");
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

    /* ---------------- Hero particle canvas ----------------
       Always runs; the owner wants the ambient background moving even
       when the OS reports prefers-reduced-motion. */

    var canvas = document.getElementById("particles");
    if (canvas && canvas.getContext) {
      var ctx = canvas.getContext("2d");
      var dpr = Math.max(window.devicePixelRatio || 1, 1);
      var width = 0;
      var height = 0;
      var particles = [];
      var LINK_DIST = 120;

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
        var count = Math.min(Math.max(Math.floor(window.innerWidth / 14), 40), 90);
        for (var i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 0.7 + Math.random() * 1.7,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            alpha: 0.2 + Math.random() * 0.3,
            orange: i % 2 === 0
          });
        }
      };

      var frames = 0;
      var usingFallback = false;

      var tick = function () {
        frames++;
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
                "rgba(255,153,0," + ((1 - d / LINK_DIST) * 0.14).toFixed(3) + ")";
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

        if (!usingFallback) requestAnimationFrame(tick);
      };

      resize();
      seed();
      requestAnimationFrame(tick);
      /* If requestAnimationFrame is throttled or unavailable, drive the
         loop on a timer so the background keeps moving regardless. */
      window.setTimeout(function () {
        if (frames === 0) {
          usingFallback = true;
          window.setInterval(tick, 40);
        }
      }, 600);
      window.addEventListener("resize", function () {
        resize();
        seed();
      });
    }

    /* ---------------- Carousels (case studies, tooling) ---------------- */

    var setupCarousel = function (track) {
      var carousel = track.closest(".carousel") || track.parentElement;
      var prevBtn = carousel.querySelector(".car-prev");
      var nextBtn = carousel.querySelector(".car-next");
      var GAP = 24;

      var stepSize = function () {
        var card = track.querySelector(".car-card");
        return card ? card.getBoundingClientRect().width + GAP : 404;
      };

      var advance = function (dir) {
        var maxScroll = track.scrollWidth - track.clientWidth;
        var target = track.scrollLeft + dir * stepSize();
        if (dir > 0 && track.scrollLeft >= maxScroll - 4) target = 0;
        if (dir < 0 && track.scrollLeft <= 4) target = maxScroll;
        track.scrollTo({
          left: target,
          behavior: reducedMotion ? "auto" : "smooth"
        });
      };

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          advance(1);
        });
      }
      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          advance(-1);
        });
      }

      if (!reducedMotion) {
        var timer = null;
        var startAuto = function () {
          if (timer === null) {
            timer = window.setInterval(function () {
              advance(1);
            }, 5000);
          }
        };
        var stopAuto = function () {
          if (timer !== null) {
            window.clearInterval(timer);
            timer = null;
          }
        };
        carousel.addEventListener("mouseenter", stopAuto);
        carousel.addEventListener("mouseleave", startAuto);
        carousel.addEventListener("focusin", stopAuto);
        carousel.addEventListener("focusout", startAuto);
        startAuto();
      }
    };

    document.querySelectorAll(".car-track").forEach(setupCarousel);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
