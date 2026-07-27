/* ============================================================
   Blush Lounge · Masterclass landing interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- Sticky nav shadow ---- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (window.scrollY > 12) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  var closeMenu = function () {
    links.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---- Scroll reveal ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Gallery masonry: full images, balanced columns (no cropping) ---- */
  var gallery = document.querySelector(".gallery");
  if (gallery) {
    var figs = Array.prototype.slice.call(gallery.children).filter(function (n) { return n.tagName === "FIGURE"; });
    var colCount = function () { return window.innerWidth <= 620 ? 2 : 3; };
    var built = 0;
    var buildMasonry = function () {
      var cols = colCount();
      gallery.textContent = "";
      var data = [];
      for (var i = 0; i < cols; i++) {
        var c = document.createElement("div");
        c.className = "gallery__col";
        gallery.appendChild(c);
        data.push({ el: c, h: 0 });
      }
      figs.forEach(function (fig) {
        var min = data[0];
        for (var j = 1; j < data.length; j++) { if (data[j].h < min.h) min = data[j]; }
        min.el.appendChild(fig);
        var img = fig.querySelector("img");
        var wv = parseFloat(img.getAttribute("width")) || 3;
        var hv = parseFloat(img.getAttribute("height")) || 4;
        min.h += hv / wv;
      });
      built = cols;
    };
    buildMasonry();
    var rzt;
    window.addEventListener("resize", function () {
      clearTimeout(rzt);
      rzt = setTimeout(function () { if (colCount() !== built) buildMasonry(); }, 150);
    }, { passive: true });
  }

  /* ---- Countdowns: class start + early bird deadline ---- */
  var CLASS_AT = new Date("2026-08-30T11:00:00+05:30").getTime();
  var EARLYBIRD_ENDS = new Date("2026-07-30T23:59:59+05:30").getTime();
  var classCds = document.querySelectorAll(".countdown:not([data-eb-countdown])");
  var ebCds = document.querySelectorAll("[data-eb-countdown]");
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };

  var paint = function (nodes, deadline) {
    if (!nodes.length) return;
    var diff = deadline - Date.now();
    var over = diff <= 0;
    var d = over ? 0 : Math.floor(diff / 86400000);
    var h = over ? 0 : Math.floor((diff % 86400000) / 3600000);
    var m = over ? 0 : Math.floor((diff % 3600000) / 60000);
    var s = over ? 0 : Math.floor((diff % 60000) / 1000);
    nodes.forEach(function (c) {
      var q = function (sel, v) { var el = c.querySelector(sel); if (el) el.textContent = v; };
      q("[data-d]", pad(d)); q("[data-h]", pad(h)); q("[data-m]", pad(m)); q("[data-s]", pad(s));
      c.classList.toggle("is-live", over);
    });
  };

  // Flip the page to regular pricing once the early bird window closes.
  var syncEarlyBird = function () {
    document.documentElement.classList.toggle("eb-expired", Date.now() > EARLYBIRD_ENDS);
  };

  var tickCd = function () {
    paint(classCds, CLASS_AT);
    paint(ebCds, EARLYBIRD_ENDS);
    syncEarlyBird();
  };
  tickCd();
  setInterval(tickCd, 1000);

  /* ---- Sticky mobile CTA visibility ---- */
  var bar = document.getElementById("stickybar");
  var register = document.getElementById("register");
  var footerEl = document.querySelector(".footer");
  if (bar) {
    var barObserver = function () {
      var y = window.scrollY;
      var pastHero = y > window.innerHeight * 0.7;
      // hide when the register section or the footer is in view
      var hideZone = false;
      if (register) {
        var r = register.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) hideZone = true;
      }
      if (footerEl) {
        var f = footerEl.getBoundingClientRect();
        if (f.top < window.innerHeight) hideZone = true;
      }
      bar.classList.toggle("is-visible", pastHero && !hideZone);
    };
    window.addEventListener("scroll", barObserver, { passive: true });
    barObserver();
  }

  /* ============================================================
     Lead capture
     Every form submission is saved to the Supabase "masterclass_leads"
     table BEFORE WhatsApp opens, so the lead is recorded even if the
     person never taps send in WhatsApp.
     ============================================================ */
  var LEADS_URL = "https://hutwzcjqatypbkyhmsxa.supabase.co/rest/v1/masterclass_leads";
  var LEADS_KEY = "sb_publishable_kypdytoSVQn9DVUhJoujPg_gx-gM7jk";
  // Optional: also mirror to a Google Sheet (Apps Script /exec URL). Leave "" to skip.
  var SHEET_ENDPOINT = "";

  /* Remember which ad brought them in, even after they scroll or reload. */
  var ATTR_KEY = "blush_attr";
  function captureAttribution() {
    var q = new URLSearchParams(location.search);
    var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid", "gclid"];
    var found = {}, any = false;
    keys.forEach(function (k) { var v = q.get(k); if (v) { found[k] = v; any = true; } });
    try {
      if (any) { sessionStorage.setItem(ATTR_KEY, JSON.stringify(found)); return found; }
      var saved = sessionStorage.getItem(ATTR_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (err) { return found; }
  }
  var attribution = captureAttribution();

  function saveLead(lead) {
    var row = {
      name: lead.name, phone: lead.phone, city: lead.city || null,
      utm_source: attribution.utm_source || null,
      utm_medium: attribution.utm_medium || null,
      utm_campaign: attribution.utm_campaign || null,
      utm_content: attribution.utm_content || null,
      fbclid: attribution.fbclid || null,
      gclid: attribution.gclid || null,
      referrer: document.referrer || null,
      page_url: location.href,
      user_agent: navigator.userAgent
    };
    // keepalive lets the request finish even as WhatsApp opens.
    try {
      fetch(LEADS_URL, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          "apikey": LEADS_KEY,
          "Authorization": "Bearer " + LEADS_KEY,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(row)
      }).catch(function () {});
    } catch (err) {}

    if (SHEET_ENDPOINT) {
      try {
        fetch(SHEET_ENDPOINT, {
          method: "POST", mode: "no-cors", keepalive: true,
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(row)
        }).catch(function () {});
      } catch (err) {}
    }
  }

  var form = document.getElementById("reserveForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var name = f["name"].value.trim();
      var phone = f["phone"].value.trim();
      var city = f["city"].value.trim();
      if (!name) { f["name"].focus(); return; }
      if (!phone) { f["phone"].focus(); return; }

      // 1) Save the lead first, so it is never lost
      saveLead({ name: name, phone: phone, city: city });
      // 2) Fire the single conversion event (Meta / GA4 / Google Ads)
      if (window.blushTrack) window.blushTrack.convert("form");
      // 3) Open WhatsApp with the details prefilled
      var eb = Date.now() <= EARLYBIRD_ENDS;
      var text = "Hi Blush Lounge! I'd like to reserve my seat for the Online Bridal Masterclass on 30 August 2026" +
        (eb ? " at the early bird price of Rs 5,000 + GST." : ".") +
        "\n\nName: " + name + "\nWhatsApp: " + phone + (city ? "\nCity: " + city : "") +
        "\n\nPlease share the payment details.";
      window.open("https://wa.me/919971933095?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  }

  /* ---- Current year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
