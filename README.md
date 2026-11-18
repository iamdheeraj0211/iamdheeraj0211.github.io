# Dheeraj Deokar · portfolio

Personal site, served by GitHub Pages at https://iamdheeraj0211.github.io/

Plain HTML, CSS and a little JavaScript: no build step, no framework, no tracking.

## Edit
- **Content:** `index.html`. Each section is marked: Hero, Products, Experience, Skills, About, Contact.
- **Look:** `styles.css`. Colours are at the top: light (paper) by default, dark for dark-mode visitors.
- **Behaviour:** `main.js` (scroll reveal, active nav link, copy email, resume button, footer year; no cursor or terminal effects on purpose).
- **Resume:** put the PDF at `resume.pdf`. The "Download resume" button appears by itself once it's there.
- **EarlyApply store link:** the "Add to Chrome" button points at the Chrome Web Store listing (ID mdnefacoafkpdmbnjdaijlgahjnebgbo).
- **Bizznify:** one card with the module flow (four business-type tabs). Text comes from the Bizznify landing page; update both together.

## Check before publishing
```
node --experimental-websocket tools/capture.js
```
Renders desktop and mobile screenshots (dark and light) into `tools/shots/`, rebuilds `assets/og.png` (the link preview image), and reports console errors, broken images or sideways scrolling.

## Publish
Commit and push to `main`; GitHub Pages updates the site within a minute or two.
