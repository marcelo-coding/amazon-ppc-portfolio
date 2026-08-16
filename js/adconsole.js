/* marcppc.dev — Amazon Ad Console lookalike performance widget, v2.
   Faithful to the console: white card, "Performance" + range, metric tiles with
   carets, info icons and colored chips, per-metric axis scales (outer left,
   inner left, right), teal bar series behind lines, dashed hover cursor with
   tooltip, and the Show all / View chart only / Hide all control row.
   Usage: <div class="adconsole" data-config='{"title":"Performance","range":"Lifetime",
     "dates":[...],"series":[{"name","unit","color","type":"line|bar","values":[...],"axis":"L1|L2|R"}]}'> */
(function () {
  "use strict";
  function fmt(v, unit) {
    if (unit === "$") return "$" + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (unit === "%") return v.toFixed(2) + "%";
    return Math.round(v).toLocaleString();
  }
  function axisFmt(v, unit) {
    if (unit === "$") return "$" + Math.round(v).toLocaleString();
    if (unit === "%") return Math.round(v) + "%";
    if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
    if (v >= 1000) return Math.round(v / 1000) + "K";
    return Math.round(v).toLocaleString();
  }
  function totalOf(s) {
    if (s.total !== undefined) return fmt(s.total, s.unit);
    var sum = s.values.reduce(function (a, b) { return a + b; }, 0);
    if (s.unit === "%") return (sum / s.values.length).toFixed(2) + "%";
    return fmt(Math.round(sum * 100) / 100, s.unit);
  }
  var INFO = '<svg class="ac-info" width="12" height="12" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="none" stroke="#8a9199" stroke-width="1.3"/><rect x="7.2" y="6.8" width="1.6" height="5" fill="#8a9199"/><circle cx="8" cy="4.6" r="1" fill="#8a9199"/></svg>';
  var CARET = '<svg width="9" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="#565959" stroke-width="1.5" fill="none"/></svg>';
  var EXPAND = '<svg width="14" height="14" viewBox="0 0 16 16"><path d="M9 2h5v5M14 2 9.5 6.5M7 14H2V9M2 14l4.5-4.5" stroke="#565959" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>';

  document.querySelectorAll(".adconsole").forEach(function (host) {
    var cfg;
    try { cfg = JSON.parse(host.getAttribute("data-config")); } catch (e) { return; }
    var W = 900, H = 340, padL = 118, padR = 66, padT = 14, padB = 38;
    var innerW = W - padL - padR, innerH = H - padT - padB;
    var dates = cfg.dates, n = dates.length;
    var x = function (i) { return padL + (innerW * i) / (n - 1); };
    cfg.series.forEach(function (s) {
      s.max = Math.max.apply(null, s.values) * 1.12;
      s.y = function (v) { return padT + innerH - (innerH * v) / s.max; };
    });

    var tiles = cfg.series.map(function (s) {
      return '<div class="ac-tile"><div class="ac-tile-label">' + s.name + " " + CARET + " " + INFO + "</div>" +
        '<div class="ac-tile-val"><span class="ac-chip" style="background:' + s.color + '"></span>' + totalOf(s) + "</div></div>";
    }).join("");

    var grid = "";
    for (var g = 0; g <= 4; g++) {
      var gy = padT + (innerH * g) / 4;
      grid += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '" stroke="#e7e9e9" stroke-width="1"/>';
    }
    var labels = "";
    var leftCols = cfg.series.filter(function (s) { return s.axis !== "R"; }).slice(0, 2);
    var rightCol = cfg.series.filter(function (s) { return s.axis === "R"; })[0];
    for (g = 0; g <= 4; g++) {
      var vy = padT + (innerH * g) / 4 + 4;
      leftCols.forEach(function (s, ci) {
        var lx = ci === 0 ? padL - 62 : padL - 8;
        labels += '<text x="' + lx + '" y="' + vy + '" text-anchor="end" class="ac-axis" fill="' + s.color + '">' + axisFmt((s.max * (4 - g)) / 4, s.unit) + "</text>";
      });
      if (rightCol) labels += '<text x="' + (W - padR + 8) + '" y="' + vy + '" text-anchor="start" class="ac-axis" fill="' + rightCol.color + '">' + axisFmt((rightCol.max * (4 - g)) / 4, rightCol.unit) + "</text>";
    }
    [0, Math.floor((n - 1) / 3), Math.floor((2 * (n - 1)) / 3), n - 1].forEach(function (i) {
      labels += '<text x="' + x(i) + '" y="' + (H - 12) + '" text-anchor="middle" class="ac-axis" fill="#565959">' + dates[i] + "</text>";
    });

    var barsSvg = "", linesSvg = "";
    var bw = Math.max(2, (innerW / n) * 0.55);
    cfg.series.forEach(function (s) {
      if (s.type === "bar") {
        s.values.forEach(function (v, i) {
          barsSvg += '<rect x="' + (x(i) - bw / 2).toFixed(1) + '" y="' + s.y(v).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (padT + innerH - s.y(v)).toFixed(1) + '" fill="' + s.color + '" opacity="0.45"/>';
        });
      } else {
        var d = s.values.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + s.y(v).toFixed(1); }).join(" ");
        linesSvg += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2.4" stroke-linejoin="round"/>';
      }
    });

    host.innerHTML =
      '<div class="ac-controls"><a class="ac-ctl" data-act="all">Show all (' + cfg.series.length + ')</a><span class="ac-sep">|</span>' +
      '<a class="ac-ctl" data-act="chart">View chart only</a><span class="ac-sep">|</span><a class="ac-ctl" data-act="hide">Hide all</a></div>' +
      '<div class="ac-card">' +
      '<div class="ac-head"><span class="ac-title">' + (cfg.title || "Performance") + '</span><span class="ac-range">' + (cfg.range || "Lifetime") + '</span><span class="ac-expand">' + EXPAND + "</span></div>" +
      '<div class="ac-tiles">' + tiles + "</div>" +
      '<div class="ac-chartwrap"><svg viewBox="0 0 ' + W + " " + H + '" class="ac-svg">' + grid + barsSvg + labels + linesSvg +
      '<line class="ac-cursor" x1="0" y1="' + padT + '" x2="0" y2="' + (padT + innerH) + '" stroke="#8a9199" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>' +
      "</svg><div class=\"ac-tip\" hidden></div></div>" +
      (cfg.note ? '<div class="ac-note">' + cfg.note + "</div>" : "") +
      "</div>";

    var card = host.querySelector(".ac-card"), tilesEl = host.querySelector(".ac-tiles");
    host.querySelectorAll(".ac-ctl").forEach(function (a) {
      a.addEventListener("click", function () {
        var act = a.getAttribute("data-act");
        card.style.display = act === "hide" ? "none" : "";
        tilesEl.style.display = act === "chart" ? "none" : "";
      });
    });
    var svg = host.querySelector(".ac-svg"), tip = host.querySelector(".ac-tip"), cursor = host.querySelector(".ac-cursor");
    svg.addEventListener("mousemove", function (ev) {
      var r = svg.getBoundingClientRect();
      var px = ((ev.clientX - r.left) / r.width) * W;
      if (px < padL || px > W - padR) { tip.hidden = true; cursor.setAttribute("visibility", "hidden"); return; }
      var i = Math.max(0, Math.min(n - 1, Math.round(((px - padL) / innerW) * (n - 1))));
      cursor.setAttribute("x1", x(i)); cursor.setAttribute("x2", x(i));
      cursor.setAttribute("visibility", "visible");
      tip.innerHTML = "<strong>" + dates[i] + "</strong>" + cfg.series.map(function (s) {
        return '<div><span class="ac-chip" style="background:' + s.color + '"></span>' + s.name + " <b>" + fmt(s.values[i], s.unit) + "</b></div>";
      }).join("");
      tip.hidden = false;
      var lx = (x(i) / W) * r.width;
      tip.style.left = Math.min(Math.max(lx + 14, 8), r.width - 200) + "px";
      tip.style.top = "40px";
    });
    svg.addEventListener("mouseleave", function () { tip.hidden = true; cursor.setAttribute("visibility", "hidden"); });
  });
})();
