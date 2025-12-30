
// GA-safe helper: if gtag is not present, just log
function sendEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params);
  } else {
    console.log('[GA DEBUG]', name, params);
  }
}

// 1) Button click tracking
const ctaBtn = document.getElementById('ctaBtn');
ctaBtn.addEventListener('click', () => {
  sendEvent('cta_click', {
    button_id: 'ctaBtn',
    button_text: ctaBtn.textContent.trim(),
    page_path: location.pathname,
  });
  // Simulate navigation to latest post
  alert('Imagine navigating to your latest post!');
});

// 2) Form + file attachment tracking
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');
let formStartTS = null;

form.addEventListener('focusin', (e) => {
  if (!formStartTS) formStartTS = Date.now();
});

const fileInput = document.getElementById('attachment');
const fileMetaBox = document.getElementById('fileMeta');
fileInput.addEventListener('change', (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const sizeKB = Math.round(f.size / 1024);
  const info = `Selected: ${f.name} • ${f.type || 'unknown/type'} • ${sizeKB} KB`;
  fileMetaBox.textContent = info;
  sendEvent('file_attach', {
    attachment_name: f.name,
    attachment_type: f.type || 'unknown',
    attachment_size_kb: sizeKB,
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const timeToSubmitSec = formStartTS ? Math.round((Date.now() - formStartTS) / 1000) : null;
  const payload = {
    form_id: 'contactForm',
    form_fields_count: 4,
    time_to_submit_seconds: timeToSubmitSec,
  };
  sendEvent('form_submit', payload);
  statusEl.textContent = 'Thanks! Your (demo) submission was captured.';
  form.reset();
  formStartTS = null;
});

// 3) Video engagement tracking
const video = document.getElementById('sampleVideo');
let lastSentQuartile = 0;

video.addEventListener('play', () => {
  sendEvent('video_play', {
    video_title: 'Big Buck Bunny',
    video_src: video.currentSrc || 'unknown',
  });
});

video.addEventListener('pause', () => {
  sendEvent('video_pause', { video_title: 'Big Buck Bunny', current_time_sec: Math.floor(video.currentTime) });
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
