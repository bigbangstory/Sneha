# The Bridal Masterclass — Landing Page

A high-conversion landing page for **Blush Lounge by Sneha**'s online pro bridal
masterclass (Blush School of Beauty), built for Google & Meta ad traffic.

- **Event:** Sunday, 30 August 2026 · 11:00 AM – 2:30 PM IST · Live on Zoom
- **Fee:** ₹7,500 + GST (100% adjustable toward the in-person Delhi 2027 course)
- **Register:** WhatsApp +91 99719 33095 · makeoverbysneha@gmail.com

## Files

| File | Purpose |
|------|---------|
| `index.html` | The page — all content and structure |
| `styles.css` | All styling (luxury editorial theme, fully responsive) |
| `script.js` | Countdown, scroll reveals, mobile menu, sticky mobile CTA |
| `assets/tracking.js` | **Google + Meta conversion tracking** — add your IDs here |
| `assets/images/` | Sneha's real photos from the brochure (web-optimised) |

No build step, no dependencies — it's plain HTML/CSS/JS.

## 1. Add your tracking IDs (Google + Meta)

Open **`assets/tracking.js`** and fill in the `CONFIG` block near the top:

```js
var CONFIG = {
  gtm:       "",   // Google Tag Manager, e.g. "GTM-XXXXXXX"  (optional)
  ga4:       "",   // Google Analytics 4, e.g. "G-XXXXXXXXXX"
  googleAds: "",   // Google Ads conversion ID, e.g. "AW-123456789"
  adsLabel:  "",   // Google Ads conversion LABEL for a lead
  metaPixel: ""    // Meta (Facebook) Pixel ID
};
```

Leave any entry as `""` to skip it. You can use Google Tag Manager **or** the direct
GA4 / Google Ads tags — or both. Also replace `PIXEL_ID` in the `<noscript>` Meta tag
inside `index.html` once you have the pixel.

**Events that fire automatically** (already wired to every button):

| Action | Google | Meta | dataLayer (for GTM) |
|--------|--------|------|---------------------|
| Page load | PageView | PageView | — |
| Reserve via WhatsApp / Register by email | Ads conversion + GA4 `generate_lead` | `Lead` | `reserve_lead` |
| "Reserve seat" (scroll-to-form) clicks | GA4 `begin_checkout` | `InitiateCheckout` | `reserve_intent` |

Lead value is set to ₹7,500 (INR) so ad platforms can optimise on value.

> Tip: keep your `?utm_source=...` ad parameters in the landing-page URL — GA4 and
> the pixels read them automatically.

## 2. Preview locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## 3. Deploy (pick one)

- **Vercel:** `vercel` (or drag the folder into vercel.com) → instant URL.
- **Netlify:** drag the folder onto app.netlify.com/drop.
- **GitHub Pages:** enable Pages on this repo → serve from the branch root.

All three serve static files directly; no configuration needed.

## How registration works

The price-card form collects **name + WhatsApp number (+ optional city)** and, on submit,
opens WhatsApp with all the details pre-filled to `+91 99719 33095` — and fires the `Lead`
conversion event. No backend or database is needed. There's also an email fallback link.

## Things you may want to swap

- **Testimonials (biggest conversion lift):** the page has no reviews yet — add 3–5 real
  student testimonials (name + line + ideally a photo) and it will convert noticeably better.
  Ask me to drop in a testimonials section when you have them.
- **Portfolio link:** the gallery shows Sneha's work on-page. If you have an external
  student-portfolio link, point the "Step inside the virtual classroom" heading there.
- **Bio:** the "Meet Sneha Chowdhury" section is grounded in the brochure. There's an HTML
  comment where you can add years of experience, notable clients, or press.
- **Images:** replace anything in `assets/images/` (keep the same filenames) to update.
  Images display at their natural aspect ratio — no cropping or stretching.

---
Built from the official Blush Lounge masterclass brochure.
