/* marcppc.dev — Ad Console style performance widget.
   Renders an Amazon Ads console lookalike: white card, metric tiles with
   colored chips and totals, dual-axis SVG line chart, hover tooltip.
   Usage: <div class="adconsole" data-config='{"title":"Performance","range":"...",
     "dates":[...], "series":[{"name":"Sales","unit":"$","color":"#E77600","axis":"money","values":[...]},...]}'></div> */
(function () {
  "use strict";
  var fmt = function (v, unit) {
    if (unit === "$") return "$" + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (unit === "%") return v.toFixed(2) + "%";
    return v.toLocaleString();
  };
  var fmtTotal = function (s) {
    if (s.total !== undefined) return fmt(s.total, s.unit);
    var sum = s.values.reduce(function (a, b) { return a + b; }, 0);
    if (s.unit === "%") return (sum / s.values.length).toFixed(2) + "%";
    return fmt(Math.round(sum * 100) / 100, s.unit);
  };
  document.querySelectorAll(".adconsole").forEach(function (host) {
    var cfg;
    try { cfg = JSON.parse(host.getAttribute("data-config")); } catch (e) { return; }
    var W = 860, H = 330, padL = 74, padR = 74, padT = 16, padB = 40;
    var innerW = W - padL - padR, innerH = H - padT - padB;
    var dates = cfg.dates, n = dates.length;
    var x = function (i) { return padL + (innerW * i) / (n - 1); };
    var axes = {};
    cfg.series.forEach(function (s) {
      var mx = Math.max.apply(null, s.values);
      var key = s.axis || "money";
      axes[key] = Math.max(axes[key] || 0, mx * 1.15);
    });
    var y = function (v, axis) { return padT + innerH - (innerH * v) / axes[axis || "money"]; };

    var tiles = cfg.series.map(function (s, i) {
      return '<div class="ac-tile" data-i="' + i + '">' +
        '<div class="ac-tile-label">' + s.name + ' <svg width="9" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="#565959" stroke-width="1.5" fill="none"/></svg></div>' +
        '<div class="ac-tile-val"><span class="ac-chip" style="background:' + s.color + '"></span>' + fmtTotal(s) + "</div></div>";
    }).join("");

    var grid = "";
    for (var g = 0; g <= 4; g++) {
      var gy = padT + (innerH * g) / 4;
      grid += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '" stroke="#e7e9e9" stroke-width="1"/>';
    }
    var money = axes.money || 0, count = axes.count;
    var labels = "";
    for (g = 0; g <= 4; g++) {
      var vy = padT + (innerH * g) / 4 + 4;
      if (money) labels += '<text x="' + (padL - 8) + '" y="' + vy + '" text-anchor="end" class="ac-axis">$' + Math.round((money * (4 - g)) / 4).toLocaleString() + "</text>";
      if (count) labels += '<text x="' + (W - padR + 8) + '" y="' + vy + '" text-anchor="start" class="ac-axis">' + Math.round((count * (4 - g)) / 4).toLocaleString() + "</text>";
    }
    var ticks = [0, Math.floor((n - 1) / 2), n - 1];
    ticks.forEach(function (i) {
      labels += '<text x="' + x(i) + '" y="' + (H - 14) + '" text-anchor="middle" class="ac-axis">' + dates[i] + "</text>";
    });

    var paths = cfg.series.map(function (s) {
      var d = s.values.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v, s.axis).toFixed(1); }).join(" ");
      return '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2.2" stroke-linejoin="round"/>';
    }).join("");

    host.innerHTML =
      '<div class="ac-card">' +
      '<div class="ac-head"><span class="ac-title">' + (cfg.title || "Performance") + '</span><span class="ac-range">' + (cfg.range || "") + "</span></div>" +
      '<div class="ac-tiles">' + tiles + "</div>" +
      '<div class="ac-chartwrap"><svg viewBox="0 0 ' + W + " " + H + '" class="ac-svg">' + grid + labels + paths +
      '<line class="ac-cursor" x1="0" y1="' + padT + '" x2="0" y2="' + (padT + innerH) + '" stroke="#8a9199" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>' +
      "</svg><div class=\"ac-tip\" hidden></div></div>" +
      (cfg.note ? '<div class="ac-note">' + cfg.note + "</div>" : "") +
      "</div>";

    var svg = host.querySelector(".ac-svg"), tip = host.querySelector(".ac-tip"), cursor = host.querySelector(".ac-cursor");
    svg.addEventListener("mousemove", function (ev) {
      var r = svg.getBoundingClientRect();
      var px = ((ev.clientX - r.left) / r.width) * W;
      if (px < padL || px > W - padR) { tip.hidden = true; cursor.setAttribute("visibility", "hidden"); return; }
      var i = Math.round(((px - padL) / innerW) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      cursor.setAttribute("x1", x(i)); cursor.setAttribute("x2", x(i));
      cursor.setAttribute("visibility", "visible");
      tip.innerHTML = "<strong>" + dates[i] + "</strong>" + cfg.series.map(function (s) {
        return '<div><span class="ac-chip" style="background:' + s.color + '"></span>' + s.name + " <b>" + fmt(s.values[i], s.unit) + "</b></div>";
      }).join("");
      tip.hidden = false;
      var lx = (x(i) / W) * r.width;
      tip.style.left = Math.min(Math.max(lx + 14, 8), r.width - 190) + "px";
      tip.style.top = "44px";
    });
    svg.addEventListener("mouseleave", function () { tip.hidden = true; cursor.setAttribute("visibility", "hidden"); });
  });
})();
