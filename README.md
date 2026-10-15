# Dheeraj Deokar · portfolio

Personal site, served by GitHub Pages at https://iamdheeraj0211.github.io/

Plain HTML, CSS and a little JavaScript: no build step, no framework, no tracking.

## Edit
- **Content:** `index.html`. Each section is marked: Hero, Products, Experience, Skills, About, Contact.
- **Look:** `styles.css`. Colours are at the top: dark by default, light for light-mode visitors.
- **Behaviour:** `main.js` (scroll reveal, active nav link, copy email, resume button, footer year).
- **Resume:** put the PDF at `resume.pdf`. The "Download resume" button appears by itself once it's there.
- **EarlyApply store link:** add a second button next to "Visit EarlyApply" once it's published.
- **Bizznify:** replace `assets/bizznify-placeholder.svg` with real screenshots at launch, and remove the "Launching soon" badge.

## Check before publishing
```
node --experimental-websocket tools/capture.js
```
Renders desktop and mobile screenshots (dark and light) into `tools/shots/`, rebuilds `assets/og.png` (the link preview image), and reports console errors, broken images or sideways scrolling.

## Publish
Commit and push to `main`; GitHub Pages updates the site within a minute or two.
