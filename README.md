# Ryan Chan · Portfolio

A responsive static portfolio for software engineering work, research, and selected personal projects. Built with semantic HTML, CSS, and a small analytics script. No runtime framework or build dependencies.

Live site: https://ryanchan339.github.io/

## Preview and publish

Run `python3 -m http.server 8766 --bind 127.0.0.1` in this directory, then visit `http://127.0.0.1:8766/`.

Pushes to `main` deploy through `.github/workflows/pages.yml`. The workflow stages the HTML, CSS, JavaScript, `projects/`, and `assets/`, then publishes to GitHub Pages. Local links use relative paths. The custom 404 uses root-relative paths so it works below nested URLs.

## Content

- `index.html`: full-width introduction with current role and education, a selected project gallery, a linear experience section, then education and tools. Organization logos are local SVGs.
- `experience.html`, `work.html`, `contact.html`: standalone views for existing links.
- `projects/`: project writeups, technical decisions, results, and limitations.
- `assets/Ryan-Chan-Resume.pdf`: one-page resume compiled from Ryan's supplied LaTeX, with Swift and TypeScript bolded.
- `styles.css`: shared shell, dark homepage, responsive design, and reduced-motion handling.
- `details.css`: matching dark styles for the project, experience, contact, and privacy pages.
- `site.js`: optional Umami Cloud integration and per-browser analytics preferences.
- `privacy.html`: analytics disclosure and opt-out.

When changing CSS or JavaScript, update the `?v=` cache token in the HTML files.

### Evidence and media

Professional descriptions use Ryan's resume and avoid nonpublic product names. Public project source links are included where available; NFL QB Analytics does not expose a private repository.

Video Search's sampling and throughput numbers are limited to its benchmark footage and hardware. Its walkthrough is an illustrative interface capture with sample results, not a recorded inference run. Stock Trader separates its dated backtest from five-fold walk-forward results; the saved dashboard shows approximately 0.506 ROC AUC and −0.7% average excess return. The page describes the evaluation limits rather than treating a backtest as evidence of live performance.

Existing media is retained from the original portfolio. SpotifyBook uses sample listening data and album artwork; sources are in `assets/spotifybook-sample-sources.json`. Its capture does not authenticate an account or create a playlist. Videos play only through native controls, never automatically.

## Analytics

Set `UMAMI_WEBSITE_ID` in `site.js` to the Website ID from a user-owned Umami Cloud account. The default script is `https://cloud.umami.is/script.js`. The website ID is public, not a credential. No password or API key belongs in this repository.

Until configured, the site makes no analytics requests. After configuration:

- Page views and fixed-label link clicks (resume, industry/research work, projects, GitHub, LinkedIn, email) are counted. A resume event measures a link click, not completed delivery of the PDF.
- No application-specific tagged URLs are added.
- The tracker is limited to `ryanchan339.github.io` and uses manual page/event tracking to avoid duplicate counts.
- No analytics cookies are set. A documented `before-send` hook strips query strings, fragments, event properties, and visitor IDs; referrers are reduced to origins.
- No session replay, performance reporting, error capture, or visitor identification is enabled.
- Global Privacy Control, Do Not Track, local previews, and the per-browser opt-out prevent loading the tracker.
- The privacy page exposes the opt-out. The preference uses one localStorage entry.
- Keep Umami Share URLs disabled if the dashboard should stay private. This integration never enables a Share URL.

The standard analytics records do not expose visitor IP addresses. The hosted provider still processes network information and may keep operational or security logs; see its privacy policy. Cookie-free analytics should not be described as zero data processing.

Uses documented tracker configuration and functions: https://umami.is/docs/tracker-configuration and https://umami.is/docs/tracker-functions. The free Hobby plan's limits are provider-controlled; check https://umami.is/pricing for current limits.

## Verification

Review the homepage and project pages at desktop, tablet, and narrow mobile widths. Verify the resume PDF, local links/anchors, native video controls, keyboard focus, reduced motion, and privacy preference. Analytics requests should include a page path or fixed event label, never URL query strings or entered text. Use an intercepted count endpoint when testing to avoid polluting real statistics.

## Visual design

The visual direction draws from Sinan Tokmak’s portfolio in Figma’s examples (https://www.figma.com/resource-library/portfolio-website-examples/ and https://sinantokmak.framer.website/): charcoal `#292F36`, deep section backgrounds `#1A1E23`, turquoise `#12F7D6`, and Ubuntu / IBM Plex Mono typography. The layout uses a full-width header and introduction, image-led project gallery, linear experience rows, and a background section. The implementation and content are original; organization logos use existing local SVGs.

Fonts are self-hosted as Latin WOFF2 files in `assets/fonts/` (about 53 KB total). Ubuntu’s UFL and copyright notices and IBM Plex Mono’s OFL are retained alongside the files. No external font requests are made.
