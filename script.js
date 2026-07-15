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

  /* ---- Countdown to class ---- */
  var target = new Date("2026-08-30T11:00:00+05:30").getTime();
  var out = document.getElementById("countdown");
  var tick = function () {
    if (!out) return;
    var diff = target - Date.now();
    if (diff <= 0) { out.textContent = "Class is live"; return; }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    out.textContent = d + "d " + h + "h " + m + "m";
  };
  tick();
  setInterval(tick, 30000);

  /* ---- Sticky mobile CTA visibility ---- */
  var bar = document.getElementById("stickybar");
  var register = document.getElementById("register");
  if (bar) {
    var barObserver = function () {
      var y = window.scrollY;
      var pastHero = y > window.innerHeight * 0.7;
      // hide when the register section itself is in view
      var atRegister = false;
      if (register) {
        var r = register.getBoundingClientRect();
        atRegister = r.top < window.innerHeight && r.bottom > 0;
      }
      bar.classList.toggle("is-visible", pastHero && !atRegister);
    };
    window.addEventListener("scroll", barObserver, { passive: true });
    barObserver();
  }

  /* ---- Reserve form -> prefilled WhatsApp + conversion event ---- */
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
      var text = "Hi Blush Lounge! I'd like to reserve my seat for the Online Bridal Masterclass on 30 August 2026." +
        "\n\nName: " + name + "\nWhatsApp: " + phone + (city ? "\nCity: " + city : "") +
        "\n\nPlease share the payment details.";
      var url = "https://wa.me/919971933095?text=" + encodeURIComponent(text);
      if (window.blushTrack) window.blushTrack.lead("form");
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---- Current year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
