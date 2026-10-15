// Small touches only: scroll reveal, active nav link, copy email, resume button, footer year.
(function () {
  'use strict';

  // Reveal sections as they scroll into view (everything is visible without JS).
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((item) => observer.observe(item));
  } else {
    items.forEach((item) => item.classList.add('is-in'));
  }

  // Highlight the nav link of the section in view.
  const links = new Map([...document.querySelectorAll('.nav__links a')].map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const sections = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const link = links.get(entry.target.id);
        if (link) link.classList.toggle('is-active', entry.isIntersecting);
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => spy.observe(section));
  }

  // Copy email.
  const copyButton = document.querySelector('[data-copy]');
  const status = document.querySelector('.copied');
  if (copyButton && status) {
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(copyButton.dataset.copy);
        status.textContent = 'Copied';
      } catch (_) {
        status.textContent = 'Select the address to copy it';
      }
      setTimeout(() => (status.textContent = ''), 2000);
    });
  }

  // Show "Download resume" only once resume.pdf is on the site.
  const resume = document.querySelector('[data-resume]');
  if (resume && location.protocol.startsWith('http')) {
    fetch('resume.pdf', { method: 'HEAD' })
      .then((response) => {
        if (response.ok) resume.hidden = false;
      })
      .catch(() => {});
  }

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero terminal types its lines one by one (the full text is in the HTML for no-JS and reduced motion).
  const term = document.querySelector('.term__body');
  if (term && !calm) {
    const segments = [...term.childNodes].map((node) => ({
      cls: node.nodeType === 1 ? node.className : '',
      text: node.textContent,
    }));
    term.style.minHeight = `${term.offsetHeight}px`; // keep the card's size while it types
    term.replaceChildren();
    term.classList.add('is-typing');
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    (async () => {
      await sleep(600);
      let commandNext = false;
      for (const segment of segments) {
        if (segment.cls === 'cursor') continue;
        const span = document.createElement('span');
        if (segment.cls) span.className = segment.cls;
        term.append(span, cursor);
        if (segment.cls === 'p') {
          span.textContent = segment.text; // the "$" prompt appears at once
          commandNext = true;
          continue;
        }
        if (commandNext) {
          // A command: typed character by character.
          for (const char of segment.text) {
            span.textContent += char;
            await sleep(char === '\n' ? 260 : 55 + Math.random() * 45);
          }
          commandNext = false;
        } else {
          // Its output: appears a moment later, all at once.
          await sleep(180);
          span.textContent = segment.text;
          await sleep(420);
        }
      }
      term.classList.remove('is-typing');
    })();
  }

  // A soft glow follows the mouse; cards light up where the pointer is.
  if (!calm && window.matchMedia('(pointer: fine)').matches) {
    const glow = document.querySelector('.mouse-glow');
    let x = 0;
    let y = 0;
    let frame = 0;
    window.addEventListener('pointermove', (event) => {
      x = event.clientX;
      y = event.clientY;
      if (glow) glow.classList.add('is-on');
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (glow) glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
      }
    }, { passive: true });
    document.addEventListener('pointerleave', () => glow && glow.classList.remove('is-on'));
    document.querySelectorAll('.product, .skills__group').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const box = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - box.left}px`);
        card.style.setProperty('--my', `${event.clientY - box.top}px`);
      }, { passive: true });
    });
  }

  // Footer year.
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
