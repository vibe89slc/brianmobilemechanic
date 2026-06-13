# Brian's Mobile Mechanics — Website

A fast, lightweight, fully static bilingual (EN/ES) marketing site for a mobile auto-repair
business serving the Salt Lake City, UT valley. No build step, no framework — just HTML, one
CSS file, and two small JS files. Built to deploy on **Cloudflare Pages**.

## Structure

```
index.html        Home
services.html     Full service list
about.html        Story + values
contact.html      Free-quote form + contact details
404.html          Branded not-found page
styles.css        Design system (brand colors, layout, animations)
i18n.js           English + Spanish copy (language toggle)
main.js           Animations, menu, phone obfuscation, SMS form
favicon.svg       Vector favicon
site.webmanifest  PWA / install metadata
robots.txt        Crawl rules
sitemap.xml       Sitemap
llms.txt          Summary for AI assistants / LLM crawlers
_headers          Cloudflare caching + security headers
assets/           Optimized WebP photos, logo, and icons
```

## Key features

- **Bilingual** — EN/ES toggle in the header, remembers the visitor's choice, and respects the
  browser language on first visit. English content lives in the HTML (good for SEO); Spanish is
  swapped in by `i18n.js`.
- **Animated logo intro** — the Kodi logo animates on first load (once per browser session, and
  skipped for visitors who prefer reduced motion).
- **Phone anti-scraping** — the number `(909) 449-4334` never appears in the HTML source. It's
  Base64-encoded in JS and only assembled into a `tel:`/`sms:` link when a visitor clicks. On the
  Contact page a "Show number" button reveals it.
- **SMS-based quote form** — no backend needed. Submitting the form opens the visitor's messaging
  app with their details pre-filled, ready to text to Brian. (See "Optional: real form backend".)
- **SEO** — per-page titles/descriptions/canonicals, Open Graph tags, `AutoRepair` JSON-LD with
  service area, sitemap, robots, and `llms.txt`.
- **Performance** — all images are optimized WebP with explicit width/height (no layout shift),
  lazy-loaded below the fold, hero image preloaded. Total page weight is very small.

## Brand

| Token  | Hex       | Use |
|--------|-----------|-----|
| Orange | `#bb6541` | primary accent / CTAs |
| Brown  | `#52261b` | headings on light, deep accents |
| Ink    | `#2e292d` | text / dark sections |
| White  | `#ffffff` | background |

## Local preview

It's plain static files. From this folder:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to Cloudflare Pages

1. Push this folder to a Git repo (or drag-and-drop the folder in the Pages dashboard).
2. **Build command:** _none_. **Build output directory:** `/` (the project root).
3. Add the custom domain (e.g. `briansmobilemechanics.com`) in the Pages project.

`_headers` is picked up automatically by Cloudflare Pages for caching + security headers.

## Before going live — update these

- Replace the placeholder domain `https://briansmobilemechanics.com` in `index.html`,
  `services.html`, `about.html`, `contact.html`, `sitemap.xml`, `robots.txt`, and `llms.txt`
  with the real domain.
- Confirm hours (`Mon–Sat · 7 AM – 7 PM`) and the service-area city list.
- Add real photos of Brian / his work to `assets/` and swap them in if available (current photos
  are licensed stock from Unsplash).
- Verify the Facebook/Instagram links resolve correctly.

## Optional: real form backend

The contact form currently composes a pre-filled text message (works great on phones, no server).
To also collect submissions by email, point the form at a service like
[Formspree](https://formspree.io) or a Cloudflare Pages Function and adjust `initForm()` in
`main.js`.
