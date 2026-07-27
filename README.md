# The Bridal Masterclass, Landing Page

A high-conversion landing page for **Blush Lounge by Sneha**'s online pro bridal
masterclass (Blush School of Beauty), built for Google & Meta ad traffic.

- **Event:** Sunday, 30 August 2026 · 11:00 AM – 2:30 PM IST · Live on Zoom
- **Fee:** ₹5,000 + GST early bird until 30 July, then ₹7,500 + GST (100% adjustable toward the in-person Delhi 2027 course)
- **Register:** WhatsApp +91 95995 71735 · makeoverbysneha@gmail.com

## Files

| File | Purpose |
|------|---------|
| `index.html` | The page, all content and structure |
| `styles.css` | All styling (luxury editorial theme, fully responsive) |
| `script.js` | Countdown, scroll reveals, mobile menu, sticky mobile CTA |
| `assets/tracking.js` | **Google + Meta conversion tracking**, add your IDs here |
| `assets/images/` | Sneha's real photos from the brochure (web-optimised) |

No build step, no dependencies, it's plain HTML/CSS/JS.

## 1. Add your tracking IDs (Google + Meta)

Open **`assets/tracking.js`** and fill in the `CONFIG` block near the top:

```js
var CONFIG = {
  gtm:       "",   // Google Tag Manager, e.g. "GTM-XXXXXXX"  (optional)
  ga4:       "",   // Google Analytics 4, e.g. "G-XXXXXXXXXX"
  googleAds: "",   // Google Ads conversion ID, e.g. "AW-123456789"
  adsLabel:  "",   // Google Ads conversion LABEL for a lead
  metaPixel: "3444548752378307"   // Meta Pixel (already set)
};
```

Leave any entry as `""` to skip it. You can use Google Tag Manager **or** the direct
GA4 / Google Ads tags, or both. The Meta Pixel is already live (including the
`<noscript>` fallback in `index.html`); the Google entries are still blank.

**There is exactly ONE conversion event**, so Events Manager stays clean and you
only ever optimise toward a single action:

| Action | Google | Meta | dataLayer (for GTM) |
|--------|--------|------|---------------------|
| Page load | `page_view` | `PageView` | , |
| Any contact: form submit, WhatsApp, call or email | Ads conversion + GA4 `generate_lead` | `Lead` | `reserve_lead` |
| "Reserve seat" buttons that only scroll | , | , | `reserve_intent` |

The conversion is **de-duplicated per visit**, so one person tapping several
buttons still counts once. How they got in touch rides along as the
`contact_method` parameter (`form` / `whatsapp` / `call` / `email`) rather than
creating extra event types. Any `tel:`, `wa.me` or `mailto:` link anywhere on the
page counts automatically, so a call button added later needs no tracking code.

Lead value follows the real price: ₹5,000 during the early bird, ₹7,500 after,
so ROAS reporting stays accurate.

> Tip: keep your `?utm_source=...` ad parameters in the landing-page URL, GA4 and
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

## Where the leads go

Every button on the page (floating WhatsApp, Reserve Seat, sticky bar) routes to
the reserve form, so contact details are always captured. On submit the form:

1. **Saves the lead to Supabase** (project `bbs-flowboard`, table
   `masterclass_leads`) with name, phone, city, and the ad that produced it
   (`utm_*`, `fbclid`, `gclid`, referrer). This happens *before* WhatsApp opens,
   using `keepalive`, so the lead is recorded even if the visitor never taps send.
2. Fires the single `Lead` conversion event.
3. Opens WhatsApp pre-filled to `+91 95995 71735`, then shows an on-page
   confirmation with a manual WhatsApp link in case the popup was blocked.

The table is **insert-only** for the public key: the site can submit a lead but
cannot read the list back, so nobody can harvest leads from the page source.

**Viewing leads:** supabase.com → `bbs-flowboard` → Table Editor →
`masterclass_leads`. An hourly routine also pushes new leads to phone and email
via the `leads-digest` edge function.

### Optional: also mirror to a Google Sheet

1. Open the Sheet → **Extensions → Apps Script**.
2. Replace the code with:

   ```js
   function doPost(e) {
     var ss = SpreadsheetApp.getActiveSpreadsheet();
     var sheet = ss.getSheetByName('form leads');
     if (!sheet) {
       sheet = ss.getSheets().filter(function (s) {
         return s.getName().toLowerCase().trim() === 'form leads';
       })[0] || ss.getSheets()[0];
     }
     if (sheet.getLastRow() === 0) sheet.appendRow(['Timestamp', 'Name', 'Phone', 'City', 'Page']);
     var d = JSON.parse(e.postData.contents);
     sheet.appendRow([new Date(), d.name, d.phone, d.city, d.page]);
     return ContentService.createTextOutput(JSON.stringify({ ok: true }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. **Deploy → New deployment → Web app**; set *Execute as: Me* and *Who has access: Anyone*; **Deploy** and authorize.
4. Copy the Web app URL (ends in `/exec`) and paste it into `SHEET_ENDPOINT` near the top of the
   reserve-form section in `script.js`.

Every submission then appends a row to your Sheet.

## Things you may want to swap

- **Testimonials (biggest conversion lift):** the page has no reviews yet, add 3–5 real
  student testimonials (name + line + ideally a photo) and it will convert noticeably better.
  Ask me to drop in a testimonials section when you have them.
- **Portfolio link:** the gallery shows Sneha's work on-page. If you have an external
  student-portfolio link, point the "Step inside the virtual classroom" heading there.
- **Bio:** the "Meet Sneha Chowdhury" section is grounded in the brochure. There's an HTML
  comment where you can add years of experience, notable clients, or press.
- **Images:** replace anything in `assets/images/` (keep the same filenames) to update.
  Images display at their natural aspect ratio, no cropping or stretching.

---
Built from the official Blush Lounge masterclass brochure.
