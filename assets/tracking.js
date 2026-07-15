/* ============================================================
   Blush Lounge · Conversion tracking layer
   Google (GA4 / Google Ads / Tag Manager) + Meta (Facebook) Pixel
   ------------------------------------------------------------
   HOW TO USE
   1. Open this file and fill in your IDs in the CONFIG block below.
      - Leave an entry as "" (empty) to skip that platform.
      - You can use EITHER Google Tag Manager (gtm) OR the direct
        GA4 / Google Ads tags, or both. All three are supported.
   2. That's it. Every "Reserve" / "Register" button already fires
      the right conversion events (see EVENTS below). No other edits
      needed.

   EVENTS THAT FIRE (used by ad platforms to optimise & report):
   - Page load ............ Google PageView + Meta PageView
   - Reserve/Register click  Google Ads conversion + GA4 "generate_lead"
                             + Meta "Lead"  + dataLayer "reserve_lead"
   - Reserve-intent click .. GA4 "begin_checkout" + Meta "InitiateCheckout"
                             + dataLayer "reserve_intent"
   ============================================================ */
(function () {
  "use strict";

  /* ======================= CONFIG ======================= */
  var CONFIG = {
    gtm:       "",   // Google Tag Manager container, e.g. "GTM-XXXXXXX"
    ga4:       "",   // Google Analytics 4, e.g. "G-XXXXXXXXXX"
    googleAds: "",   // Google Ads conversion ID, e.g. "AW-123456789"
    adsLabel:  "",   // Google Ads conversion LABEL for a lead, e.g. "AbC-D_efG12"
    metaPixel: ""    // Meta (Facebook) Pixel ID, e.g. "1234567890123456"
  };
  /* =================== END OF CONFIG ==================== */

  var isSet = function (v) { return typeof v === "string" && v.length > 3 && v.indexOf("X") === -1; };

  // dataLayer is always available (works with or without GTM)
  window.dataLayer = window.dataLayer || [];
  function dl(obj) { window.dataLayer.push(obj); }

  /* ---- Load a script tag helper ---- */
  function inject(src) {
    var s = document.createElement("script");
    s.async = true; s.src = src;
    document.head.appendChild(s);
  }

  /* ---- Google (gtag) ---- */
  var hasGtag = isSet(CONFIG.ga4) || isSet(CONFIG.googleAds);
  if (hasGtag) {
    var firstId = isSet(CONFIG.ga4) ? CONFIG.ga4 : CONFIG.googleAds;
    inject("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(firstId));
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    if (isSet(CONFIG.ga4)) gtag("config", CONFIG.ga4);
    if (isSet(CONFIG.googleAds)) gtag("config", CONFIG.googleAds);
  }

  /* ---- Google Tag Manager ---- */
  if (isSet(CONFIG.gtm)) {
    (function () {
      dl({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      inject("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(CONFIG.gtm));
    })();
  }

  /* ---- Meta (Facebook) Pixel ---- */
  if (isSet(CONFIG.metaPixel)) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", CONFIG.metaPixel);
    window.fbq("track", "PageView");
  }

  /* ---- Public event helpers ---- */
  window.blushTrack = {
    lead: function (method) {
      dl({ event: "reserve_lead", method: method || "unknown" });
      if (typeof gtag === "function") {
        if (isSet(CONFIG.ga4)) gtag("event", "generate_lead", { method: method, currency: "INR", value: 7500 });
        if (isSet(CONFIG.googleAds) && isSet(CONFIG.adsLabel)) {
          gtag("event", "conversion", { send_to: CONFIG.googleAds + "/" + CONFIG.adsLabel, value: 7500, currency: "INR" });
        }
      }
      if (typeof fbq === "function") fbq("track", "Lead", { content_name: "Bridal Masterclass", currency: "INR", value: 7500 });
    },
    intent: function (method) {
      dl({ event: "reserve_intent", method: method || "cta" });
      if (typeof gtag === "function" && isSet(CONFIG.ga4)) gtag("event", "begin_checkout", { currency: "INR", value: 7500 });
      if (typeof fbq === "function") fbq("track", "InitiateCheckout", { content_name: "Bridal Masterclass", currency: "INR", value: 7500 });
    }
  };

  /* ---- Auto-bind CTAs via data attributes ---- */
  function bind() {
    document.querySelectorAll("[data-track]").forEach(function (el) {
      el.addEventListener("click", function () {
        var type = el.getAttribute("data-track");
        var method = el.getAttribute("data-track-method") || "";
        if (type === "lead") window.blushTrack.lead(method);
        else if (type === "intent") window.blushTrack.intent(method);
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
