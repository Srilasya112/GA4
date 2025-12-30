
# My Simple Blog (GA4-ready)

A minimal website that includes:
- A call-to-action **button**
- A **contact form** with a **file attachment** input
- An HTML5 **video**

It is instrumented to send GA4 events via `gtag.js`.

## Quick start
1. Open `index.html` in a browser.
2. Replace `G-XXXXXXXXXX` in the `<head>` with your GA4 **Measurement ID**.
3. Publish anywhere (GitHub Pages, Netlify, Vercel, or any static host).

## Events & Parameters
- `cta_click`: `button_id`, `button_text`, `page_path`
- `file_attach`: `attachment_name`, `attachment_type`, `attachment_size_kb` (numeric)
- `form_submit`: `form_id`, `form_fields_count` (numeric), `time_to_submit_seconds` (numeric)
- `video_play` / `video_pause` / `video_progress` / `video_complete`: `video_title`, `percent_viewed` (numeric)

## Suggested GA4 Custom Definitions
Create *custom dimensions* for:
- `form_id`
- `attachment_type`
- `button_text`

Create *custom metrics* for:
- `attachment_size_kb` (Unit: **Kilobytes**)
- `time_to_submit_seconds` (Unit: **Seconds**)

## Calculated Metric Example
If you mark `form_submit` as a **key event** (conversion), create a calculated metric:
- **Form submission rate (%)** = `{Conversions} / {Users} * 100`

## Notes
- The video uses the public Big Buck Bunny sample file.
- If GA4 tag is not configured, events are logged to console for debugging.
