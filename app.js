/* The Highlander · Virginia's Bluest and Reddest Counties — clicker, map and list */
(function () {
  "use strict";
  var DATA = window.VA_DATA;
  var byF = {}; DATA.rows.forEach(function (r) { byF[r.fips] = r; });
  var st = { side: "dem", scope: "counties", hi: null };
  var fmt = function (n) { return n.toLocaleString("en-US"); };
  var pct = function (n) { return n.toFixed(1) + "%"; };
  var $ = function (s) { return document.querySelector(s); };
  var SVGNS = "http://www.w3.org/2000/svg";

  // initial state from the URL: #rep, #all, #rep-all
  var h = (location.hash || "").toLowerCase();
  if (h.indexOf("rep") > -1) st.side = "rep";
  if (h.indexOf("all") > -1 || h.indexOf("cities") > -1) st.scope = "all";

  $("#sD").textContent = pct(DATA.state.dp) + " statewide";
  $("#sR").textContent = pct(DATA.state.rp) + " statewide";

  // ---------- map
  var M = DATA.map, svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("viewBox", "0 0 " + M.w + " " + M.h);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Map of Virginia's counties and independent cities with the selected top 10 shaded");
  var gL = document.createElementNS(SVGNS, "g"), gS = document.createElementNS(SVGNS, "path"), gD = document.createElementNS(SVGNS, "g");
  var paths = {};
  Object.keys(M.shapes).forEach(function (f) {
    var p = document.createElementNS(SVGNS, "path");
    p.setAttribute("d", M.shapes[f].p); p.setAttribute("class", "m-l"); p.dataset.f = f;
    gL.appendChild(p); paths[f] = p;
  });
  gS.setAttribute("d", M.state); gS.setAttribute("class", "m-state");
  svg.appendChild(gL); svg.appendChild(gS); svg.appendChild(gD);
  $("#map").insertBefore(svg, $("#tip"));

  var tip = $("#tip");
  function showTip(f, evt) {
    var r = byF[f]; if (!r) return;
    var list = DATA.lists[st.side + "-" + st.scope], k = list.indexOf(f);
    tip.innerHTML = "<b>" + r.name + "</b>" +
      '<span class="d">Warner ' + pct(r.dp) + "</span> · " + '<span class="r">Mizusawa ' + pct(r.rp) + "</span>" +
      (k > -1 ? "<br>No. " + (k + 1) + " most " + (st.side === "dem" ? "Democratic" : "Republican") : "");
    var box = $("#map").getBoundingClientRect();
    var x = evt ? evt.clientX - box.left : 0, y = evt ? evt.clientY - box.top : 0;
    if (!evt) { var c = M.shapes[f].c, s = box.width / M.w; x = c[0] * s; y = c[1] * s; }
    tip.style.left = Math.max(90, Math.min(box.width - 90, x)) + "px";
    tip.style.top = y + "px";
    tip.hidden = false;
  }
  function hideTip() { tip.hidden = true; }
  gL.addEventListener("pointermove", function (e) { var f = e.target.dataset && e.target.dataset.f; if (f) { setHi(f); showTip(f, e); } });
  gL.addEventListener("pointerleave", function () { setHi(null); hideTip(); });

  function setHi(f) {
    if (st.hi === f) return;
    if (st.hi && paths[st.hi]) paths[st.hi].classList.remove("hi");
    document.querySelectorAll(".row.hi, .m-dot.hi").forEach(function (n) { n.classList.remove("hi"); });
    st.hi = f;
    if (!f) return;
    var p = paths[f]; p.classList.add("hi"); gL.appendChild(p); // raise so the outline isn't covered
    var row = document.querySelector('.row[data-f="' + f + '"]'); if (row) row.classList.add("hi");
    var dot = gD.querySelector('[data-f="' + f + '"]'); if (dot) dot.classList.add("hi");
  }

  // Markers keep the same on-screen size at any width; neighbours that would overlap
  // (e.g. Arlington, Alexandria and Falls Church) are nudged apart with a leader line to the true spot.
  function placeDots(list) {
    while (gD.firstChild) gD.removeChild(gD.firstChild);
    var w = svg.getBoundingClientRect().width || M.w, k = M.w / w;
    var r = (w < 500 ? 7.5 : 9) * k, gap = 2 * r + 2 * k;
    var pts = list.map(function (f) { var c = M.shapes[f].c; return { f: f, ax: c[0], ay: c[1], x: c[0], y: c[1] }; });
    for (var it = 0; it < 120; it++) {
      var moved = false;
      for (var a = 0; a < pts.length; a++) for (var b = a + 1; b < pts.length; b++) {
        var p = pts[a], q = pts[b], dx = q.x - p.x, dy = q.y - p.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < gap) {
          if (d < 0.01) { dx = 1; dy = 0; d = 1; }
          var push = (gap - d) / 2 + 0.01, ux = dx / d, uy = dy / d;
          p.x -= ux * push; p.y -= uy * push; q.x += ux * push; q.y += uy * push; moved = true;
        }
      }
      if (!moved) break;
    }
    pts.forEach(function (p, i) {
      var g = document.createElementNS(SVGNS, "g");
      if (Math.hypot(p.x - p.ax, p.y - p.ay) > r * 0.5) {
        var ln = document.createElementNS(SVGNS, "line");
        ln.setAttribute("x1", p.ax); ln.setAttribute("y1", p.ay); ln.setAttribute("x2", p.x); ln.setAttribute("y2", p.y);
        ln.setAttribute("stroke", "#1D1D1B"); ln.setAttribute("stroke-width", 0.9 * k);
        var an = document.createElementNS(SVGNS, "circle");
        an.setAttribute("cx", p.ax); an.setAttribute("cy", p.ay); an.setAttribute("r", 1.8 * k); an.setAttribute("fill", "#1D1D1B");
        g.appendChild(ln); g.appendChild(an);
      }
      var dot = document.createElementNS(SVGNS, "circle");
      dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y); dot.setAttribute("r", r);
      dot.setAttribute("class", "m-dot"); dot.setAttribute("stroke-width", 1.5 * k); dot.dataset.f = p.f;
      var t = document.createElementNS(SVGNS, "text");
      t.setAttribute("x", p.x); t.setAttribute("y", p.y + 0.5 * k); t.setAttribute("class", "m-num");
      t.setAttribute("font-size", (w < 500 ? 9 : 10.5) * k); t.textContent = i + 1;
      g.appendChild(dot); g.appendChild(t); gD.appendChild(g);
    });
    if (st.hi) { var hd = gD.querySelector('[data-f="' + st.hi + '"]'); if (hd) hd.classList.add("hi"); }
  }
  var lastW = 0, rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { var w = svg.getBoundingClientRect().width; if (Math.abs(w - lastW) > 1) { lastW = w; placeDots(DATA.lists[st.side + "-" + st.scope]); } }, 120);
  });

  // ---------- render
  function render() {
    var list = DATA.lists[st.side + "-" + st.scope];
    document.body.classList.toggle("side-rep", st.side === "rep");
    document.querySelectorAll(".pick").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.side === st.side)); });
    document.querySelectorAll(".scope button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.scope === st.scope)); });
    var cities = st.scope === "all";
    $("#title").textContent = cities ? "Virginia’s Bluest and Reddest Localities" : "Virginia’s Bluest and Reddest Counties";
    $("#lhName").textContent = cities ? "County or city" : "County";

    // map fill + numbered markers (so small cities stay visible)
    Object.keys(paths).forEach(function (f) { paths[f].classList.toggle("on", list.indexOf(f) > -1); });
    placeDots(list);

    // list
    var ol = $("#list"); ol.innerHTML = "";
    list.forEach(function (f, i) {
      var r = byF[f], lead = st.side === "dem" ? r.m : -r.m;
      var li = document.createElement("li");
      li.className = "row"; li.dataset.f = f; li.tabIndex = 0; li.style.setProperty("--i", i);
      li.setAttribute("aria-label", (i + 1) + ". " + r.name + ": Warner " + pct(r.dp) + ", Mizusawa " + pct(r.rp) + ", " + fmt(r.t) + " votes");
      li.innerHTML =
        '<span class="rk num">' + (i + 1) + "</span>" +
        '<div><div class="nm">' + r.name + (r.complete ? "" : "<small>partial</small>") + "</div>" +
        '<div class="bar" aria-hidden="true"><span class="d"></span><span class="w"></span><span class="r"></span><i></i></div></div>' +
        '<span class="mg num">+' + lead.toFixed(1) + "<small>pts</small></span>";
      li.addEventListener("pointerenter", function () { setHi(f); });
      li.addEventListener("pointerleave", function () { setHi(null); });
      li.addEventListener("focus", function () { setHi(f); showTip(f); });
      li.addEventListener("blur", function () { setHi(null); hideTip(); });
      ol.appendChild(li);
    });
    st.hi = null;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      ol.querySelectorAll(".row").forEach(function (li) {
        var r = byF[li.dataset.f], b = li.querySelectorAll(".bar span");
        b[0].style.width = r.d / r.t * 100 + "%"; b[1].style.width = r.w / r.t * 100 + "%"; b[2].style.width = r.r / r.t * 100 + "%";
      });
    }); });

    try { history.replaceState(null, "", "#" + st.side + (st.scope === "all" ? "-all" : "")); } catch (e) { /* sandboxed */ }
  }

  document.querySelectorAll(".pick").forEach(function (b) {
    b.addEventListener("click", function () { if (st.side !== b.dataset.side) { st.side = b.dataset.side; hideTip(); render(); } });
  });
  document.querySelectorAll(".scope button").forEach(function (b) {
    b.addEventListener("click", function () { if (st.scope !== b.dataset.scope) { st.scope = b.dataset.scope; hideTip(); render(); } });
  });

  render();

  // ---------- loading screen + iframe height
  var t0 = Date.now(), splash = $("#splash");
  function done() { setTimeout(function () { splash.classList.add("done"); }, Math.max(0, 750 - (Date.now() - t0))); }
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1800); })]).then(done);

  if (window.parent !== window) {
    var last = 0;
    var send = function () {
      var hgt = Math.ceil($("#app").getBoundingClientRect().height);
      if (Math.abs(hgt - last) > 2) { last = hgt; try { window.parent.postMessage({ type: "highlander-va-top10-height", height: hgt }, "*"); } catch (e) { /* ignore */ } }
    };
    send();
    if (window.ResizeObserver) new ResizeObserver(send).observe($("#app"));
    window.addEventListener("load", send); window.addEventListener("resize", send);
  }
})();
