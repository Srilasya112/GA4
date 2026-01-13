/************************************************
 * 1. DATA LAYER HELPERS
 ************************************************/
window.dataLayer = window.dataLayer || [];

function dlPush(eventName, payload = {}) {
    window.dataLayer.push({
        event: eventName,
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        ...payload,
    });
}

// Initial page view
dlPush('page_view');

/************************************************
 * 2. NAVIGATION & LINKS
 ************************************************/

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        if (!targetId) return;

        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Nav & footer link tracking
document.querySelectorAll('.nav-link, .footer-link').forEach(link => {
    link.addEventListener('click', () => {
        dlPush('nav_click', {
            link_text: link.textContent.trim(),
            link_url: link.getAttribute('href'),
            link_type: link.hostname === window.location.hostname ? 'internal' : 'external',
        });
    });
});

/************************************************
 * 3. CTA & PRICING
 ************************************************/

// Header CTA
const ctaBtn = document.getElementById('ctaBtn');
if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
        dlPush('cta_click', {
            button_id: 'ctaBtn',
            cta_context: 'header'
        });
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    });
}

// Hero CTA
const heroCta = document.getElementById('heroCta');
if (heroCta) {
    heroCta.addEventListener('click', () => {
        dlPush('cta_click', {
            button_id: 'heroCta',
            cta_context: 'hero'
        });
    });
}

// Pricing selection
document.querySelectorAll('.price-card').forEach(card => {
    card.addEventListener('click', () => {
        const plan = card.querySelector('h3')?.textContent || 'Unknown';
        dlPush('pricing_select', { pricing_plan: plan });
    });
});

/************************************************
 * 4. FORM TRACKING (NO PII)
 ************************************************/
const contactForm = document.getElementById('contactForm');
let formStartTime = null;

if (contactForm) {
    contactForm.addEventListener('focusin', () => {
        if (!formStartTime) {
            formStartTime = Date.now();
            dlPush('form_start', { form_id: 'contactForm' });
        }
    }, { once: true });

    const fileInput = document.getElementById('attachment');
    if (fileInput) {
        fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;

            const sizeKB = Math.round(file.size / 1024);
            dlPush('file_attach', {
                form_id: 'contactForm',
                file_size_kb: sizeKB,
                file_type: file.type
            });

            document.getElementById('fileMeta').textContent =
                `File attached (${sizeKB} KB)`;
        });
    }

    contactForm.addEventListener('submit', () => {
        const timeTaken = formStartTime
            ? Math.round((Date.now() - formStartTime) / 1000)
            : 0;

        dlPush('form_submit', {
            form_id: 'contactForm',
            time_to_submit_seconds: timeTaken
        });
    });
}

/************************************************
 * 5. VIDEO TRACKING
 ************************************************/
document.querySelectorAll('video').forEach(video => {

    video.addEventListener('play', () => {
        dlPush('video_start', {
            video_title: video.id || 'Furniture Video'
        });
    });

    video.addEventListener('pause', () => {
        if (video.currentTime < video.duration) {
            dlPush('video_pause', {
                video_title: video.id,
                current_time: Math.floor(video.currentTime)
            });
        }
    });

    video.addEventListener('timeupdate', () => {
        const percent = Math.floor((video.currentTime / video.duration) * 100);
        [25, 50, 75].forEach(p => {
            if (percent >= p && !video.dataset[`p${p}`]) {
                video.dataset[`p${p}`] = true;
                dlPush('video_progress', {
                    video_title: video.id,
                    percent_viewed: p
                });
            }
        });
    });

    video.addEventListener('ended', () => {
        dlPush('video_complete', {
            video_title: video.id
        });
    });
});
