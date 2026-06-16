/* =========================================================
   Brian's Mobile Mechanics — behavior v2
   Language · header · reveals · intro · phone · form
   + scroll progress · custom cursor · magnetic buttons
   + 3D tilt cards · parallax · staggered reveals
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Phone (kept out of the HTML) ---------- */
  var P_TEL = "KzE5MDk0NDk0MzM0";        // +19094494334
  function tel() { return atob(P_TEL); }
  window.bmmCall = function () { window.location.href = "tel:" + tel(); };
  window.bmmText = function (body) {
    var b = body ? "?&body=" + encodeURIComponent(body) : "";
    window.location.href = "sms:" + tel() + b;
  };

  /* ---------- Language ---------- */
  var KEY = "bmm-lang";
  function preferred() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === "en" || saved === "es") return saved;
    return (navigator.language || "en").toLowerCase().indexOf("es") === 0 ? "es" : "en";
  }
  function movePill() {
    var tog = document.querySelector(".lang-toggle"); if (!tog) return;
    var pill = tog.querySelector(".lang-pill");
    var active = tog.querySelector("button.is-active");
    if (pill && active) { pill.style.width = active.offsetWidth + "px"; pill.style.transform = "translateX(" + (active.offsetLeft - 3) + "px)"; }
  }
  function applyLang(lang) {
    var dict = (window.I18N && window.I18N[lang]) || {};
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n"); if (dict[k] != null) el.innerHTML = dict[k];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph"); if (dict[k] != null) el.setAttribute("placeholder", dict[k]);
    });
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      var on = b.getAttribute("data-lang-btn") === lang;
      b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    movePill();
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    updateStatus();
    initRotator();
  }

  /* ---------- Hero rotating word ---------- */
  var rotTimer = null;
  function initRotator() {
    var rot = document.querySelector(".rotator");
    if (!rot) return;
    var inner = rot.querySelector("span") || rot;
    var lang = document.documentElement.getAttribute("lang") || "en";
    var raw = (window.I18N[lang] && window.I18N[lang].hero_rotwords) || "";
    var words = raw.split("|").filter(Boolean);
    if (rotTimer) { clearInterval(rotTimer); rotTimer = null; }
    if (!words.length) return;
    var i = 0;
    inner.textContent = words[0];
    if (reduce || words.length < 2) return;
    rotTimer = setInterval(function () {
      inner.classList.add("out");
      setTimeout(function () {
        i = (i + 1) % words.length;
        inner.textContent = words[i];
        inner.classList.remove("out"); inner.classList.add("in");
        requestAnimationFrame(function () { inner.classList.remove("in"); });
      }, 420);
    }, 2400);
  }

  /* ---------- Live open / closed status ---------- */
  function updateStatus() {
    var badge = document.getElementById("hero-status");
    if (!badge) return;
    var lang = document.documentElement.getAttribute("lang") || "en";
    var dict = window.I18N[lang] || {};
    var now = new Date(), day = now.getDay(), h = now.getHours();
    var open = day >= 1 && day <= 6 && h >= 7 && h < 19; // Mon–Sat 7am–7pm
    badge.style.setProperty("--status", open ? "#2fae66" : "#d9534f");
    var b = badge.querySelector("b"), s = badge.querySelector("small");
    if (b) b.textContent = open ? (dict.status_open || "Open now") : (dict.status_closed || "Closed now");
    if (s) s.textContent = dict.contact_hours_val || "Mon–Sat · 7 AM – 7 PM";
  }
  function initLang() {
    var tog = document.querySelector(".lang-toggle");
    if (tog && !tog.querySelector(".lang-pill")) {
      var pill = document.createElement("span"); pill.className = "lang-pill"; tog.insertBefore(pill, tog.firstChild);
    }
    applyLang(preferred());
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang-btn")); });
    });
    window.addEventListener("resize", movePill);
  }

  /* ---------- Header (shadow + hide on scroll down) ---------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    var menuBtn = document.querySelector(".menu-btn");
    var nav = document.querySelector(".nav");
    var last = 0;
    if (header) {
      var onScroll = function () {
        var y = window.scrollY;
        header.classList.toggle("scrolled", y > 8);
        if (!nav || !nav.classList.contains("open")) {
          header.classList.toggle("hide", y > last && y > 400);
        }
        last = y;
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    if (menuBtn && nav) {
      menuBtn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        menuBtn.classList.toggle("open", open);
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("open"); menuBtn.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ---------- Scroll progress bar ---------- */
  function initProgress() {
    var bar = document.createElement("div"); bar.className = "scroll-progress"; document.body.appendChild(bar);
    var tick = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? h.scrollTop / max : 0;
      bar.style.transform = "scaleX(" + p + ")";
    };
    tick(); window.addEventListener("scroll", tick, { passive: true }); window.addEventListener("resize", tick);
  }

  /* ---------- Scroll reveal (+ stagger) ---------- */
  function initReveal() {
    var els = document.querySelectorAll("[data-reveal], [data-stagger]");
    if (!("IntersectionObserver" in window) || !els.length) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.hasAttribute("data-stagger")) {
          Array.prototype.forEach.call(el.children, function (c, i) {
            c.style.transitionDelay = (i * 0.08) + "s";
          });
        }
        el.classList.add("in"); io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Parallax (images drift on scroll) ---------- */
  function initParallax() {
    if (reduce) return;
    var items = [].slice.call(document.querySelectorAll(".hero-photo img, .split-media img, .cta-bg img"));
    if (!items.length) return;
    var ticking = false;
    var update = function () {
      var vh = window.innerHeight;
      items.forEach(function (img) {
        var r = img.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var center = r.top + r.height / 2;
        var pct = (center - vh / 2) / vh;           // -0.5..0.5
        img.style.transform = "translateY(" + (pct * -7) + "%)";
      });
      ticking = false;
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", update);
  }

  /* ---------- 3D tilt + glow on cards ---------- */
  function initTilt() {
    if (!fine || reduce) return;
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.transform = "perspective(900px) rotateX(" + ((0.5 - py) * 6) + "deg) rotateY(" + ((px - 0.5) * 6) + "deg) translateY(-6px)";
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (!fine || reduce) return;
    document.querySelectorAll(".btn--primary, .btn--light, .socials a").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + mx * 0.22 + "px," + (my * 0.22 - 3) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Custom cursor ---------- */
  function initCursor() {
    if (!fine || reduce) return;
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    var ring = document.createElement("div"); ring.className = "cursor-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    var rx = 0, ry = 0, x = 0, y = 0;
    document.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY;
      dot.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%)";
    });
    var loop = function () {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button, .card, input, textarea, .chip")) ring.classList.add("hot");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button, .card, input, textarea, .chip")) ring.classList.remove("hot");
    });
  }

  /* ---------- Intro loader ---------- */
  function initIntro() {
    var intro = document.querySelector(".intro");
    if (!intro) return;
    var seen = false; try { seen = sessionStorage.getItem("bmm-intro") === "1"; } catch (e) {}
    if (reduce || seen) { intro.parentNode.removeChild(intro); return; }
    document.body.style.overflow = "hidden";
    var count = intro.querySelector(".intro-count");
    if (count) {
      var n = 0, ci = setInterval(function () {
        n += Math.floor(Math.random() * 13) + 4; if (n >= 100) { n = 100; clearInterval(ci); }
        count.textContent = n + "%";
      }, 130);
    }
    var finish = function () {
      intro.classList.add("done"); document.body.style.overflow = "";
      setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 1000);
      try { sessionStorage.setItem("bmm-intro", "1"); } catch (e) {}
    };
    setTimeout(finish, 1850);
  }

  /* ---------- Contact form -> SMS ---------- */
  function initForm() {
    var form = document.getElementById("quote-form"); if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form), lines = [];
      if (data.get("name")) lines.push("Name: " + data.get("name"));
      if (data.get("vehicle")) lines.push("Vehicle: " + data.get("vehicle"));
      if (data.get("phone")) lines.push("Phone: " + data.get("phone"));
      if (data.get("message")) lines.push("Issue: " + data.get("message"));
      var status = form.querySelector(".form-status");
      if (status) {
        var lang = document.documentElement.getAttribute("lang") || "en";
        status.innerHTML = (window.I18N[lang] && window.I18N[lang].form_status_ok) || "";
        status.classList.add("show", "ok");
      }
      window.bmmText("Hi Brian, I'd like a quote.\n" + lines.join("\n"));
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      if (!q) return;
      q.setAttribute("aria-expanded", "false");
      q.addEventListener("click", function () {
        var open = item.classList.toggle("open");
        q.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* ---------- Sticky mobile action bar ---------- */
  function createMobileBar() {
    if (document.querySelector(".mobile-bar")) return;
    var bar = document.createElement("div");
    bar.className = "mobile-bar";
    bar.innerHTML =
      '<button class="mb-call" type="button" aria-label="Call Brian"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span data-i18n="mbar_call">Call</span></button>' +
      '<button class="mb-text" type="button" aria-label="Text Brian"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg><span data-i18n="mbar_text">Text</span></button>' +
      '<a class="mb-quote" href="contact.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 10h8M8 14h5"/></svg><span data-i18n="mbar_quote">Free Quote</span></a>';
    document.body.appendChild(bar);
    bar.querySelector(".mb-call").addEventListener("click", function () { window.bmmCall(); });
    bar.querySelector(".mb-text").addEventListener("click", function () { window.bmmText("Hi Brian, I'd like a quote."); });
  }

  /* ---------- Back to top ---------- */
  function createToTop() {
    var btn = document.createElement("button");
    btn.className = "to-top"; btn.type = "button"; btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);
    btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
    var onScroll = function () { btn.classList.toggle("show", window.scrollY > 700); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    var nums = document.querySelectorAll(".stat-num[data-count]");
    if (!nums.length) return;
    var run = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduce) { el.textContent = target + suffix; return; }
      var start = null, dur = 1500;
      var step = function (t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function initYear() { var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear(); }

  /* ---------- Boot ---------- */
  initIntro();
  document.addEventListener("DOMContentLoaded", function () {
    createMobileBar(); createToTop();
    initLang(); initHeader(); initProgress(); initReveal();
    initParallax(); initTilt(); initMagnetic(); initCursor();
    initForm(); initFaq(); initCounters(); initYear();
  });
})();
