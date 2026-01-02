
// Smooth scroll for internal links (optional polyfill-style)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Header CTA
const ctaBtn = document.getElementById('ctaBtn');
if (ctaBtn) {
  ctaBtn.addEventListener('click', () => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
}

// Form + file attachment (demo only)
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');
let formStartTS = null;

if (form) {
  form.addEventListener('focusin', () => {
    if (!formStartTS) formStartTS = Date.now();
  });

  const fileInput = document.getElementById('attachment');
  const fileMetaBox = document.getElementById('fileMeta');

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const sizeKB = Math.round(f.size / 1024);
      const info = `Selected: ${f.name} • ${f.type || 'unknown/type'} • ${sizeKB} KB`;
      if (fileMetaBox) fileMetaBox.textContent = info;
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const timeToSubmitSec = formStartTS ? Math.round((Date.now() - formStartTS) / 1000) : null;
    statusEl.textContent = `Thanks! (demo) Submitted in ${timeToSubmitSec ?? '—'}s.`;
    form.reset();
    formStartTS = null;
  });
}
