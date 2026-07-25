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

   EVENTS THAT FIRE
   There is exactly ONE conversion event, so Events Manager and Google Ads
   stay clean and you only ever optimise toward a single action:

   - Page load ......... Meta "PageView" + Google page_view  (not a conversion)
   - Any contact ....... Meta "Lead" + GA4 "generate_lead" + the Google Ads
                         conversion. Fires when the visitor submits the form,
                         or taps WhatsApp / call / email. De-duplicated per
                         visit, so one person = one conversion no matter how
                         many buttons they tap. How they reached out is sent
                         as the "contact_method" parameter (form, whatsapp,
                         call, email), not as a separate event.

   The "Reserve seat" buttons that only scroll to the form are recorded in
   dataLayer only, never sent to Meta or Google Ads.
   ============================================================ */
(function () {
  "use strict";

  /* ======================= CONFIG ======================= */
  var CONFIG = {
    gtm:       "",   // Google Tag Manager container, e.g. "GTM-XXXXXXX"
    ga4:       "",   // Google Analytics 4, e.g. "G-XXXXXXXXXX"
    googleAds: "",   // Google Ads conversion ID, e.g. "AW-123456789"
    adsLabel:  "",   // Google Ads conversion LABEL for a lead, e.g. "AbC-D_efG12"
    metaPixel: "3444548752378307"    // Meta (Facebook) Pixel ID
  };
  /* =================== END OF CONFIG ==================== */

  var isSet = function (v) { return typeof v === "string" && v.length > 3 && v.indexOf("X") === -1; };

  /* ---- Current ticket price (early bird until 30 July 2026, then full fee) ---- */
  var EARLYBIRD_ENDS = new Date("2026-07-30T23:59:59+05:30").getTime();
  var price = function () { return Date.now() > EARLYBIRD_ENDS ? 7500 : 5000; };

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

  /* ============================================================
     ONE conversion event
     ------------------------------------------------------------
     Whatever the visitor does to reach out (submits the form, taps
     WhatsApp, taps a call button, taps email) fires exactly ONE
     conversion: Meta "Lead" + GA4 "generate_lead" + the Google Ads
     conversion. It is de-duplicated per visit, so a single person
     tapping WhatsApp three times still counts as one conversion.

     The "how they contacted us" detail rides along as a parameter
     (contact_method), so you can still segment in reporting without
     creating extra event types in Events Manager.
     ============================================================ */
  var FIRED_KEY = "blush_converted";
  var firedMemory = false;

  function alreadyFired() {
    if (firedMemory) return true;
    try { return sessionStorage.getItem(FIRED_KEY) === "1"; } catch (e) { return false; }
  }
  function markFired() {
    firedMemory = true;
    try { sessionStorage.setItem(FIRED_KEY, "1"); } catch (e) {}
  }

  window.blushTrack = {
    /* The single conversion. Safe to call from anywhere, any number of times. */
    convert: function (method) {
      if (alreadyFired()) return false;
      markFired();
      var v = price();
      var how = method || "unknown";
      dl({ event: "reserve_lead", contact_method: how, value: v, currency: "INR" });
      if (typeof gtag === "function") {
        if (isSet(CONFIG.ga4)) {
          gtag("event", "generate_lead", { contact_method: how, currency: "INR", value: v });
        }
        if (isSet(CONFIG.googleAds) && isSet(CONFIG.adsLabel)) {
          gtag("event", "conversion", { send_to: CONFIG.googleAds + "/" + CONFIG.adsLabel, value: v, currency: "INR" });
        }
      }
      if (typeof fbq === "function") {
        fbq("track", "Lead", { content_name: "Bridal Masterclass", contact_method: how, currency: "INR", value: v });
      }
      return true;
    },

    /* Page-navigation CTAs (the "Reserve seat" buttons that only scroll down).
       Recorded in dataLayer for funnel insight only. Deliberately NOT sent to
       Meta or Google Ads, so they never show up as conversions. */
    nudge: function (method) {
      dl({ event: "reserve_intent", contact_method: method || "cta" });
    }
  };
  // Backwards-compatible aliases
  window.blushTrack.lead = window.blushTrack.convert;
  window.blushTrack.intent = window.blushTrack.nudge;

  /* ---- Auto-bind ---- */
  function isContactLink(el) {
    var href = (el.getAttribute("href") || "").toLowerCase();
    return href.indexOf("wa.me") > -1 || href.indexOf("api.whatsapp.com") > -1 ||
           href.indexOf("tel:") === 0 || href.indexOf("mailto:") === 0;
  }

  // One delegated listener handles the whole page, so buttons added to the
  // markup later (a call button, a second WhatsApp link, anything) are tracked
  // automatically with no extra code.
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("[data-track], a[href]") : null;
    if (!el) return;

    // 1) Explicitly tagged elements win
    var tagged = el.closest("[data-track]");
    if (tagged) {
      var type = tagged.getAttribute("data-track");
      var method = tagged.getAttribute("data-track-method") || "";
      if (type === "lead" || type === "convert") window.blushTrack.convert(method);
      else window.blushTrack.nudge(method);
      return;
    }

    // 2) Any WhatsApp / call / email link counts as the conversion
    if (el.tagName === "A" && isContactLink(el)) {
      var href = (el.getAttribute("href") || "").toLowerCase();
      var how = href.indexOf("tel:") === 0 ? "call"
              : href.indexOf("mailto:") === 0 ? "email" : "whatsapp";
      window.blushTrack.convert(how);
    }
  }, true);
})();
