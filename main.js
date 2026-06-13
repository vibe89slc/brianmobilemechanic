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

  function initYear() { var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear(); }

  /* ---------- Boot ---------- */
  initIntro();
  document.addEventListener("DOMContentLoaded", function () {
    initLang(); initHeader(); initProgress(); initReveal();
    initParallax(); initTilt(); initMagnetic(); initCursor();
    initForm(); initFaq(); initYear();
  });
})();
