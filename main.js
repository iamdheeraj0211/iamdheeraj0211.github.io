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

  // Footer year.
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
