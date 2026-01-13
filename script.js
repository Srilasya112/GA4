
/*****************************
 * Smooth scroll for internal links
 *****************************/
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

/*****************************
 * DATA LAYER HELPERS
 *****************************/
window.dataLayer = window.dataLayer || [];

/**
 * Push to dataLayer with common page context
 * @param {string} eventName
 * @param {object} payload
 */
function dlPush(eventName, payload = {}) {
  window.dataLayer.push({
    event: eventName,
    page_title: document.title,
    page_location: location.href,
    page_path: location.pathname,
    ...payload,
  });
  // Dev log (optional)
  console.log('[DL]', eventName, payload);
}

/* Initial page_view (optional if GA4 Config tag handles page views) */
dlPush('page_view');

/*****************************
 * Header CTA ("Get Started")
 *****************************/
const ctaBtn = document.getElementById('ctaBtn');
if (ctaBtn) {
  ctaBtn.addEventListener('click', () => {
    // DataLayer event
    dlPush('cta_click', {
      button_id: 'ctaBtn',
      button_text: ctaBtn.textContent.trim(),
      cta_context: 'header',
    });

    // Original behavior: scroll to pricing
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
}

/*****************************
 * Hero CTA ("Book a Free Call") — if present
 *****************************/
const heroCta = document.getElementById('heroCta');
if (heroCta) {
  heroCta.addEventListener('click', () => {
    dlPush('cta_click', {
      button_id: 'heroCta',
      button_text: heroCta.textContent.trim(),
      cta_context: 'hero',
    });
  });
}

/*****************************
 * Navigation & Footer link clicks
 *****************************/
document.querySelectorAll('.nav-link, .footer-link').forEach(link => {
  link.addEventListener('click', () => {
    dlPush('nav_click', {
      link_text: link.textContent.trim(),
      link_url: link.getAttribute('href'),
      link_type: link.classList.contains('ext') ? 'external' : 'internal',
      nav_area: link.closest('header') ? 'header' : (link.closest('footer') ? 'footer' : 'unknown'),
    });
  });
});

/*****************************
 * Pricing plan selects (Choose buttons)
 *****************************/
document.querySelectorAll('#pricing .price-card .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const planCard = btn.closest('.price-card');
    const planName = planCard?.querySelector('h3')?.textContent?.trim() || 'Unknown';
    dlPush('pricing_select', {
      pricing_plan: planName,
      button_text: btn.textContent.trim(),
    });
  });
});

/*****************************
 * Form + File attachment (demo only)
 *****************************/
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');
let formStartTS = null;

if (form) {
  // First focus → form_start
  form.addEventListener('focusin', () => {
    if (!formStartTS) {
      formStartTS = Date.now();
      dlPush('form_start', {
        form_id: 'contactForm',
        form_fields_count: 4,
      });
    }
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

      // DataLayer event (avoid PII per policy; consider removing attachment_name)
      dlPush('file_attach', {
        form_id: 'contactForm',
        attachment_name: f.name,            // Consider hashing/removing if your PII policy requires
        attachment_type: f.type || 'unknown',
        attachment_size_kb: sizeKB,
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const timeToSubmitSec = formStartTS ? Math.round((Date.now() - formStartTS) / 1000) : null;

    dlPush('form_submit', {
      form_id: 'contactForm',
      form_fields_count: 4,
      time_to_submit_seconds: timeToSubmitSec,
    });

    statusEl.textContent = `Thanks! (demo) Submitted in ${timeToSubmitSec ?? '—'}s.`;
    form.reset();
    formStartTS = null;
  });
}

/*****************************
 * Video engagement (runs only if #sampleVideo exists)
 *****************************/
const videoEl = document.getElementById('sampleVideo');
let lastQuartile = 0;

if (videoEl) {
  videoEl.addEventListener('play', () => {
    dlPush('video_play', {
      video_title: videoEl.getAttribute('aria-label') || 'Featured video',
      video_src: videoEl.currentSrc || 'unknown',
    });
  });

  videoEl.addEventListener('pause', () => {
    dlPush('video_pause', {
      video_title: videoEl.getAttribute('aria-label') || 'Featured video',
      current_time_sec: Math.floor(videoEl.currentTime),
    });
  });

  videoEl.addEventListener('ended', () => {
    dlPush('video_complete', {
      video_title: videoEl.getAttribute('aria-label') || 'Featured video',
    });
  });

  videoEl.addEventListener('timeupdate', () => {
    const d = videoEl.duration;
    if (!d || isNaN(d)) return;
    const pct = (videoEl.currentTime / d) * 100;
    const q = pct >= 75 ? 75 : pct >= 50 ? 50 : pct >= 25 ? 25 : 0;
    if (q > 0 && q !== lastQuartile) {
      lastQuartile = q;
      dlPush('video_progress', {
        video_title: videoEl.getAttribute('aria-label') || 'Featured video',
        percent_viewed: q,
      });
    }
  });
}
