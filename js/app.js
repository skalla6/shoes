/* Skalla demo flow. Plain JavaScript, no build step. */
(function () {
  "use strict";

  var POOL = (window.SKALLA_POOL || []).slice();
  var IMG_DIR = "assets/portfolio/";
  var BEN_EMAIL = "skalla.ai.design@gmail.com";
  var STORE_KEY = "skalla-demo-v1";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- State (kept across page changes and reloads) ---------- */
  var state = load();
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* private mode: keep in memory */ }
  }
  function reset() {
    state = {};
    save();
  }

  /* ---------- Images with a labelled fallback ---------- */
  function imgSrc(item) { return IMG_DIR + item.file; }
  function makeImg(item) {
    var img = new Image();
    img.src = imgSrc(item);
    img.alt = item.title + " (" + item.file + ")";
    img.loading = "lazy";
    img.onerror = function () {
      var box = document.createElement("div");
      box.className = "missing";
      box.textContent = "Image missing: " + item.file;
      img.replaceWith(box);
    };
    return img;
  }

  /* ---------- Card used by both the 3 ideas and the portfolio ---------- */
  function makeCard(item, onPick) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card";
    btn.setAttribute("aria-pressed", "false");
    var imgWrap = document.createElement("div");
    imgWrap.className = "img";
    imgWrap.appendChild(makeImg(item));
    var meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = '<div class="title"></div><div class="filename"></div>';
    meta.firstChild.textContent = item.title;
    meta.lastChild.textContent = item.file;
    var tick = document.createElement("span");
    tick.className = "tick";
    tick.setAttribute("aria-hidden", "true");
    tick.textContent = "✓";
    btn.appendChild(imgWrap);
    btn.appendChild(meta);
    btn.appendChild(tick);
    btn.addEventListener("click", function () {
      $$(".card", btn.parentNode).forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      onPick(item);
    });
    if (state.selected && state.selected.file === item.file) btn.setAttribute("aria-pressed", "true");
    return btn;
  }

  /* ---------- 3 random, distinct designs from the pool ---------- */
  function pickThree() {
    var copy = POOL.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy.slice(0, Math.min(3, copy.length));
  }
  window.SKALLA_pickThree = pickThree; // exposed for testing

  /* ---------- Landing: magic ---------- */
  var stage = $(".stage");
  var hero = $("#hero");
  var magic = $("#magic");
  var magicInner = $("#magicInner");
  var opened = false;

  function sizeMagic() {
    if (!opened) return;
    // shoes shrink to 0.85 from the top, so the box rises by the 15% they free up
    var lift = hero.offsetHeight * 0.15;
    magic.style.marginTop = (20 - lift) + "px";
    magic.style.height = magicInner.offsetHeight + "px";
  }
  function openMagic(instant) {
    if (opened) return;
    opened = true;
    if (instant) stage.classList.add("no-anim");
    stage.classList.add("open");
    stopSparks();
    sizeMagic();
    if (instant) requestAnimationFrame(function () { requestAnimationFrame(function () { stage.classList.remove("no-anim"); }); });
    else setTimeout(function () { $("#cantThink").focus({ preventScroll: true }); }, 700);
  }
  function closeMagic() {
    opened = false;
    stage.classList.remove("open");
    magic.style.marginTop = "";
    magic.style.height = "";
    $("#results").hidden = true;
    startSparks();
  }
  $("#magicBtn").addEventListener("click", function () { openMagic(false); });
  window.addEventListener("resize", sizeMagic);

  /* electricity around the magic button */
  var sparksSvg = $("#sparks");
  var sparkTimer = null;
  function bolt(w, h) {
    // a short jagged arc that hugs the outside of the button
    var pad = 18, x0 = pad - 5, y0 = pad - 5, x1 = w + pad + 5, y1 = h + pad + 5;
    var pw = x1 - x0, ph = y1 - y0, per = 2 * (pw + ph);
    function at(t) {
      t = ((t % per) + per) % per;
      if (t < pw) return [x0 + t, y0, 0, -1];
      t -= pw; if (t < ph) return [x1, y0 + t, 1, 0];
      t -= ph; if (t < pw) return [x1 - t, y1, 0, 1];
      t -= pw; return [x0, y1 - t, -1, 0];
    }
    var start = Math.random() * per, len = 26 + Math.random() * 46, steps = 6;
    var d = "";
    for (var i = 0; i <= steps; i++) {
      var p = at(start + (len * i) / steps);
      var j = (i === 0 || i === steps) ? 0 : (Math.random() * 9 - 2);
      d += (i ? "L" : "M") + (p[0] + p[2] * j).toFixed(1) + " " + (p[1] + p[3] * j).toFixed(1);
    }
    return d;
  }
  function drawSparks() {
    var w = magic.offsetWidth, h = magic.offsetHeight;
    var n = 1 + Math.floor(Math.random() * 3);
    var html = "";
    for (var i = 0; i < n; i++) html += '<path d="' + bolt(w, h) + '" opacity="' + (0.45 + Math.random() * 0.55).toFixed(2) + '"/>';
    sparksSvg.innerHTML = html;
  }
  function startSparks() {
    if (reduceMotion || sparkTimer) return;
    sparkTimer = setInterval(drawSparks, 90);
  }
  function stopSparks() {
    clearInterval(sparkTimer); sparkTimer = null;
    sparksSvg.innerHTML = "";
  }
  startSparks();

  /* cant think? -> 3 ideas */
  var ideaPick = null;
  function generate() {
    var results = $("#results"), loading = $("#loading"), ideas = $("#ideas"), grid = $("#ideaGrid");
    results.hidden = false;
    loading.hidden = false;
    ideas.hidden = true;
    ideaPick = null;
    $("#ideaContinue").disabled = true;
    setTimeout(function () {
      grid.innerHTML = "";
      pickThree().forEach(function (item) {
        var card = makeCard(item, function (it) { ideaPick = it; $("#ideaContinue").disabled = false; });
        card.setAttribute("aria-pressed", "false");
        grid.appendChild(card);
      });
      loading.hidden = true;
      ideas.hidden = false;
      results.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }, reduceMotion ? 200 : 1400);
  }
  $("#cantThink").addEventListener("click", generate);
  $("#again").addEventListener("click", generate);
  $("#ideaContinue").addEventListener("click", function () {
    if (ideaPick) choose(ideaPick, "generated");
  });

  /* ---------- Portfolio ---------- */
  var portfolioPick = null;
  function renderPortfolio() {
    var grid = $("#portfolioGrid");
    grid.innerHTML = "";
    portfolioPick = state.selected || null;
    POOL.forEach(function (item) {
      grid.appendChild(makeCard(item, function (it) {
        portfolioPick = it;
        $("#portfolioCta").hidden = false;
      }));
    });
    $("#portfolioCta").hidden = !portfolioPick;
  }
  $("#portfolioContinue").addEventListener("click", function () {
    if (portfolioPick) choose(portfolioPick, "portfolio");
  });

  function choose(item, source) {
    if (!state.selected || state.selected.file !== item.file) {
      state.paid = false;
    }
    state.selected = { file: item.file, title: item.title, source: source };
    save();
    location.hash = "#/process";
  }

  /* ---------- Bindings ---------- */
  function bind() {
    var s = state.selected || {};
    $$('[data-bind="thumb"]').forEach(function (img) { if (s.file) { img.src = IMG_DIR + s.file; img.alt = s.title || ""; } });
    $$('[data-bind="title"]').forEach(function (el) { el.textContent = s.title || ""; });
    $$('[data-bind="file"]').forEach(function (el) { el.textContent = s.file || ""; });
    $$('[data-bind="ideas"]').forEach(function (el) { el.textContent = state.ideas || ""; });
    $$('[data-bind="size"]').forEach(function (el) { el.textContent = state.size || ""; });
    $$('[data-bind="ship"]').forEach(function (el) { el.textContent = state.ship || "Standard"; });
  }

  /* ---------- Process page: Step A then Step B ---------- */
  function renderProcess() {
    $("#ideasInput").value = state.ideas || "";
    $("#emailInput").value = state.email || "";
    $("#sizeInput").value = state.size || "";
    var hasIdeas = !!(state.ideas && state.ideas.trim());
    showStep(hasIdeas && state.stepB ? "B" : "A");
  }
  function showStep(which) {
    $("#stepA").hidden = which !== "A";
    $("#ideasSummary").hidden = which !== "B";
    $("#stepB").hidden = which !== "B";
    bind();
  }
  $("#stepA").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $("#ideasInput").value.trim();
    $("#ideasError").hidden = !!v;
    if (!v) { $("#ideasInput").focus(); return; }
    state.ideas = v; state.stepB = true; save();
    showStep("B");
    $("#emailInput").focus();
  });
  $("#editIdeas").addEventListener("click", function () {
    state.stepB = false; save();
    showStep("A");
    $("#ideasInput").focus();
  });
  $("#stepB").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("#emailInput").value.trim();
    var size = $("#sizeInput").value.trim();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    $("#emailError").hidden = emailOk;
    $("#sizeError").hidden = !!size;
    if (!emailOk) { $("#emailInput").focus(); return; }
    if (!size) { $("#sizeInput").focus(); return; }
    state.email = email; state.size = size; save();
    location.hash = "#/sent";
  });

  /* ---------- Email preview (demo, nothing is sent) ---------- */
  function composeEmail() {
    var s = state.selected;
    var subject = "Skalla 1-of-1 idea: " + s.title + " (" + s.file + "), size " + state.size;
    var body =
      "Hi Ben,\n\n" +
      "Here are my ideas for a custom 1-of-1 pair:\n\n" +
      state.ideas + "\n\n" +
      "Reference design: " + s.title + " (" + s.file + ")\n" +
      "Shoe size: " + state.size + "\n" +
      "My email: " + state.email + "\n\n" +
      "Thanks!";
    return { to: BEN_EMAIL, subject: subject, body: body };
  }
  function renderSent() {
    var m = composeEmail();
    $('[data-bind="mailTo"]').textContent = m.to;
    $('[data-bind="mailSubject"]').textContent = m.subject;
    $('[data-bind="mailBody"]').textContent = m.body;
    $("#mailtoBtn").href = "mailto:" + m.to +
      "?subject=" + encodeURIComponent(m.subject) +
      "&body=" + encodeURIComponent(m.body);
  }
  $("#copyBtn").addEventListener("click", function () {
    var m = composeEmail();
    var text = "To: " + m.to + "\nSubject: " + m.subject + "\n\n" + m.body;
    var btn = this;
    function done() { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy email"; }, 1600); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
      ta.remove();
    }
  });

  /* ---------- Checkout (demo, no payment provider) ---------- */
  function renderCheckout() {
    var ship = state.ship || "Standard";
    $$('input[name="ship"]').forEach(function (r) { r.checked = r.value === ship; });
    var pay = $("#payBtn");
    pay.disabled = false;
    pay.textContent = "Pay $300 + shipping (demo)";
    bind();
  }
  $$('input[name="ship"]').forEach(function (r) {
    r.addEventListener("change", function () { state.ship = r.value; save(); bind(); });
  });
  $("#payBtn").addEventListener("click", function () {
    var pay = this;
    pay.disabled = true;
    pay.textContent = "Confirming (demo)…";
    setTimeout(function () {
      state.paid = true; save();
      location.hash = "#/paid";
    }, reduceMotion ? 100 : 1000);
  });

  /* ---------- Start over ---------- */
  $$("[data-restart]").forEach(function (a) {
    a.addEventListener("click", function () { reset(); closeMagic(); });
  });

  /* ---------- Router ---------- */
  var routes = {
    "": "home", "/": "home",
    "/portfolio": "portfolio",
    "/process": "process",
    "/sent": "sent",
    "/checkout": "checkout",
    "/paid": "paid"
  };
  function route() {
    var path = location.hash.replace(/^#/, "");
    var view = routes[path] || "home";
    var s = state;
    var hasDesign = !!s.selected;
    var hasDetails = hasDesign && s.ideas && s.email && s.size;

    if ((view === "process") && !hasDesign) return go("#/");
    if ((view === "sent" || view === "checkout") && !hasDetails) return go(hasDesign ? "#/process" : "#/");
    if (view === "paid" && !s.paid) return go(hasDetails ? "#/checkout" : "#/");

    $$(".view").forEach(function (v) { v.hidden = v.getAttribute("data-view") !== view; });

    if (view === "home") {
      // coming back from a later step keeps the box open
      if (hasDesign && !opened) openMagic(true);
      if (opened) requestAnimationFrame(sizeMagic);
    }
    if (view === "portfolio") renderPortfolio();
    if (view === "process") renderProcess();
    if (view === "sent") renderSent();
    if (view === "checkout") renderCheckout();
    bind();
    window.scrollTo(0, 0);
  }
  function go(hash) { location.replace(hash); }
  window.addEventListener("hashchange", route);
  route();
})();
