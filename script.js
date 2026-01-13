/************************************************
 * 1. DATA LAYER HELPERS
 ************************************************/
window.dataLayer = window.dataLayer || [];

/**
 * Pushes events to dataLayer with standardized context.
 * @param {string} eventName 
 * @param {object} payload 
 */
function dlPush(eventName, payload = {}) {
    window.dataLayer.push({
        event: eventName,
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        ...payload,
    });
    // Optional: console.debug('[DL]', eventName, payload);
}

// Initial page view trigger
dlPush('page_view');

/************************************************
 * 2. NAVIGATION & LINKS
 ************************************************/

// Smooth scroll for internal fragment links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href').slice(1);
        if (!targetId) return; // Ignore plain "#" links

        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Generic Link Tracking (Nav & Footer)
document.querySelectorAll('.nav-link, .footer-link').forEach(link => {
    link.addEventListener('click', () => {
        dlPush('nav_click', {
            link_text: link.textContent.trim(),
            link_url: link.getAttribute('href'),
            link_type: link.hostname === window.location.hostname ? 'internal' : 'external',
            nav_area: link.closest('header') ? 'header' : (link.closest('footer') ? 'footer' : 'other'),
        });
    });
});

/************************************************
 * 3. CTA & PRICING INTERACTION
 ************************************************/

// Header CTA
const ctaBtn = document.getElementById('ctaBtn');
if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
        dlPush('cta_click', { button_id: 'ctaBtn', cta_context: 'header' });
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    });
}

// Hero CTA
const heroCta = document.getElementById('heroCta');
if (heroCta) {
    heroCta.addEventListener('click', () => {
        dlPush('cta_click', { button_id: 'heroCta', cta_context: 'hero' });
    });
}

// Pricing Plan Selection
document.querySelectorAll('#pricing .price-card .btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const planName = btn.closest('.price-card')?.querySelector('h3')?.textContent?.trim();
        dlPush('pricing_select', {
            pricing_plan: planName || 'Unknown',
            button_text: btn.textContent.trim(),
        });
    });
});

/************************************************
 * 4. FORM TRACKING (WITH PII PROTECTION)
 ************************************************/
const contactForm = document.getElementById('contactForm');
let formStartTS = null;

if (contactForm) {
    // Track first interaction
    contactForm.addEventListener('focusin', () => {
        if (!formStartTS) {
            formStartTS = Date.now();
            dlPush('form_start', { form_id: 'contactForm' });
        }
    }, { once: true });

    // File Attachment Tracking
    const fileInput = document.getElementById('attachment');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const sizeKB = Math.round(file.size / 1024);
            
            // NOTE: We omit 'file.name' to prevent accidental PII collection (e.g. "John_Doe_Resume.pdf")
            dlPush('file_attach', {
                form_id: 'contactForm',
                attachment_type: file.type || 'unknown',
                attachment_size_kb: sizeKB
            });

            const metaBox = document.getElementById('fileMeta');
            if (metaBox) metaBox.textContent = `Attached: (${sizeKB} KB)`;
        });
    }

    // Submission Tracking
    contactForm.addEventListener('submit', (e) => {
        const timeToSubmit = formStartTS ? Math.round((Date.now() - formStartTS) / 1000) : 0;
        
        dlPush('form_submit', {
            form_id: 'contactForm',
            time_to_submit_seconds: timeToSubmit
        });
        
        // Form logic continues (e.g., fetch or allow default)
    });
}

/************************************************
 * 5. VIDEO ENGAGEMENT (MULTI-VIDEO SUPPORT)
 ************************************************/
document.querySelectorAll('video').forEach(video => {
    // Use data attributes to track state per video element
    video.addEventListener('play', () => {
        dlPush('video_start', { video_title: video.title || video.id || 'HTML5 Video' });
    });

    video.addEventListener('pause', () => {
        if (video.currentTime < video.duration) { // Don't trigger pause on "ended"
            dlPush('video_pause', { 
                video_title: video.title || video.id,
                current_time: Math.floor(video.currentTime) 
            });
        }
    });

    video.addEventListener('timeupdate', () => {
        const progress = Math.floor((video.currentTime / video.duration) * 100);
        const milestones = [25, 50, 75];
        
        milestones.forEach(ms => {
            const marker = `reached_${ms}`;
            // If milestone reached and not already tracked for this video
            if (progress >= ms && !video.dataset[marker]) {
                video.dataset[marker] = 'true';
                dlPush('video_progress', {
                    video_title: video.title || video.id,
                    percent_viewed: ms
                });
            }
        });
    });

    video.addEventListener('ended', () => {
        dlPush('video_complete', { video_title: video.title || video.id });
    });
});
