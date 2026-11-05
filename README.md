# Skalla: 1-of-1 Air Force 1s (demo)

A static demo of the Skalla custom-shoe flow. It's plain HTML, CSS and JavaScript, with no build step, framework or backend.

## Run it locally

**Easiest:** double-click `index.html`. It opens in your browser and the whole flow works.

**Like a real website** (recommended for testing on your phone on the same Wi‑Fi):

1. Open Terminal in this folder.
2. Run `python3 -m http.server 8000`
3. Visit http://localhost:8000

## Swap in the real images

- **Portfolio mockups:** drop the real files into `assets/portfolio/` using the same names
  (`0_0.jpeg`, `0_0-3.jpeg`, `0_1.jpeg`, `0_1-2.jpeg`, `0_1-3.jpeg`, `0_1-4.jpeg`, `0_2.jpeg`).
  They replace the labelled placeholders.
- **More mockups later:** add the file to `assets/portfolio/` and add one line to `js/portfolio.js`.
  The portfolio and the "generate 3 ideas" picker both read that list.
- **Hero shoe:** `assets/af1-blank.svg` is a detailed drawing of a white AF1 Low pair (with Swoosh).
  To use a photo, save it in `assets/` and change the `src` on the hero `<img>` in `index.html`.

## Files

```
index.html            all screens (landing, portfolio, process, email preview, checkout, paid)
css/styles.css        styling and animations
js/portfolio.js       the portfolio pool list (edit this to add designs)
js/app.js             flow, state, random picker, email composer, demo checkout
assets/af1-blank.svg  placeholder hero shoe
assets/portfolio/     7 placeholder slots, named for the real mockups
```

## Demo-only (not wired)

- **Email:** nothing is sent. The site shows the exact email to skalla.ai.design@gmail.com and
  offers an "Open in my email app" (mailto) button and a copy button.
- **Payment:** the pay button only shows a demo confirmation. No card is charged and no payment provider is connected.
- **Shipping rates:** Standard / Express both show "Calculated at checkout".

The visitor's progress (selected design, ideas, email, size, shipping choice) is saved in their own browser so it survives
page changes and reloads. "Start over" on the final screen clears it.

## Hosting later

This folder is the whole site. It can go on GitHub Pages, Netlify, Cloudflare Pages or any web server as-is,
and a custom domain can be pointed at any of them.
