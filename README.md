# Ceylon Substrates

Marketing website for Ceylon Substrates. It is a fully static, client-side–rendered
site (no build step). Each page is a `.dc.html` "Design Component" file whose inline
`<x-dc>` template is rendered in the browser by `support.js` (which loads React from a CDN).

## Pages

- `index.html` / `Ceylon Substrates.dc.html` — Home
- `Products.dc.html` — Products
- `Mix Your Blend.dc.html` — Blend configurator
- `About.dc.html` — About
- `Certifications.dc.html` — Quality / certifications
- `Gallery.dc.html` — Gallery
- `Knowledge Centre.dc.html` — Knowledge centre
- `Contact.dc.html` — Contact

`index.html` is a copy of `Ceylon Substrates.dc.html` so the site loads at the root URL.
If you edit the home page, update both files (or re-copy).

## Supporting files (required — do not delete)

- `support.js` — the rendering runtime
- `image-slot.js`, `i18n.js`, `translations.js` — page scripts
- `lion-dark.png`, `logo.svg` — branding assets
- `uploads/` — product/gallery images
- `.nojekyll` — tells GitHub Pages to serve every file as-is (needed because some
  files contain spaces, e.g. `Mix Your Blend.dc.html`)

## Hosting on GitHub Pages

1. Commit and push everything to GitHub:
   ```bash
   git add -A
   git commit -m "Add site for GitHub Pages hosting"
   git push origin main
   ```
2. On GitHub, open the repo → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **main** and folder **/ (root)**, then **Save**.
5. Wait ~1 minute. Your site will be live at:
   `https://joshuah6414.github.io/CeylonSubstrates/`

## Local preview

Because the pages are fetched at runtime, open the site through a local web server
(not by double-clicking the file):

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/`.
