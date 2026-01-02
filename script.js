
// GA-safe helper: if gtag is not present, just log
function sendEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params);
  } else {
    console.log('[GA DEBUG]', name, params);
  }
}

// ===== Nav link tracking =====
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    sendEvent('nav_click', {
      label: link.textContent.trim(),
      link_target: link.getAttribute('href'),
      external: link.classList.contains('ext') ? 'yes' : 'no',
    });
  });
});

// ===== Header CTA tracking =====
const ctaBtn = document.getElementById('ctaBtn');
if (ctaBtn) {
  ctaBtn.addEventListener('click', () => {
    sendEvent('cta_click', {
      button_id: 'ctaBtn',
      button_text: ctaBtn.textContent.trim(),
      page_path: location.pathname,
    });
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
}

// ===== Hero CTA tracking =====
const heroCta = document.getElementById('heroCta');
if (heroCta) {
  heroCta.addEventListener('click', () => {
    sendEvent('cta_click', {
      button_id: 'heroCta',
      button_text: heroCta.textContent.trim(),
      page_path: location.pathname,
    });
  });
}

// ===== Form + file attachment tracking =====
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
      sendEvent('file_attach', {
        attachment_name: f.name,
        attachment_type: f.type || 'unknown',
        attachment_size_kb: sizeKB,
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const timeToSubmitSec = formStartTS ? Math.round((Date.now() - formStartTS) / 1000) : null;
    const payload = {
      form_id: 'contactForm',
      form_fields_count: 4,
      time_to_submit_seconds: timeToSubmitSec,
    };
    sendEvent('form_submit', payload);
    if (statusEl) statusEl.textContent = 'Thanks! Your (demo) submission was captured.';
    form.reset();
    formStartTS = null;
  });
}

// ===== Video engagement tracking (kept, but only runs if a video exists) =====
const video = document.getElementById('sampleVideo');
let lastSentQuartile = 0;

if (video) {
  video.addEventListener('play', () => {
    sendEvent('video_play', {
      video_title: 'Big Buck Bunny',
      video_src: video.currentSrc || 'unknown',
    });
  });

  video.addEventListener('pause', () => {
    sendEvent('video_pause', {
      video_title: 'Big Buck Bunny',
      current_time_sec: Math.floor(video.currentTime)
    });
  });

  video.addEventListener('ended', () => {
    sendEvent('video_complete', { video_title: 'Big Buck Bunny' });
  });

  video.addEventListener('timeupdate', () => {
    if (!video.duration || isNaN(video.duration)) return;
    const p = (video.currentTime / video.duration) * 100;
    const quartile = p >= 75 ? 75 : p >= 50 ? 50 : p >= 25 ? 25 : 0;
    if (quartile > 0 && quartile !== lastSentQuartile) {
      lastSentQuartile = quartile;
      sendEvent('video_progress', { video_title: 'Big Buck Bunny', percent_viewed: quartile });
    }
  });
}

// ===== Optional: simulate video events for testing without a video =====
// Uncomment to test GA events:
// sendEvent('video_play', { video_title: 'Simulated', video_src: 'none' });
// sendEvent('video_progress', { video_title: 'Simulated', percent_viewed: 25 });
// sendEvent('video_progress', { video_title: 'Simulated', percent_viewed: 50 });
// sendEvent('video_progress', { video_title: 'Simulated', percent_viewed: 75 });
// sendEvent('video_complete', { video_title: 'Simulated' });
