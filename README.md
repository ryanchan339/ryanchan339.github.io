# Ryan Chan portfolio

A static portfolio with four main pages—Home, Work, Experience, and Contact—and four project detail pages. Plain HTML, CSS, and JavaScript; no package installation or build step is required.

## Preview

From this directory, run `python -m http.server 8766 --bind 127.0.0.1` and open `http://127.0.0.1:8766/`.

## Publish on GitHub Pages

1. Put the contents of this directory, including `.github/` and `.nojekyll`, at the root of the chosen GitHub repository.
2. Use the `main` branch, or change the branch in `.github/workflows/pages.yml` to match your repository.
3. In the repository's **Settings → Pages**, choose **GitHub Actions** as the source.
4. Push to `main` or run the **Deploy portfolio to GitHub Pages** workflow manually.

Published portfolio: https://ryanchan339.github.io/

Source repository: https://github.com/ryanchan339/ryanchan339.github.io

Updates pushed to `main` deploy automatically through GitHub Actions. Local links and media paths are relative.

Page, CSS, JavaScript, and media links include a release token to keep browser caches from mixing versions. Refresh that token across the HTML when publishing changed page, style, or media files.

The workflow follows GitHub's documented configure/upload/deploy pattern: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Edit

- `index.html`: introduction and resume/social links, followed by education, experience, and projects in individually spaced glass rows.
- `home.css`: the homepage layout, with clear glass surfaces, a plain white background, and accessible opaque fallbacks.
- `assets/liquid-glass.js`: cached convex-edge refraction maps, document-aligned backdrop copies, and pointer-responsive highlights, with native scrolling and a CSS glass fallback.
- `work.html`: four project showcases, with three recorded demos and an NFL application architecture summary.
- `experience.html`: professional, research, and teaching experience, plus illustrative Python Two Sum and transformer acceleration animations.
- `contact.html`: email, LinkedIn, GitHub, and copy-email action.
- `projects/*.html`: project explanations and source links.
- `styles.css`: layout, typography, colors, and responsive behavior.
- `format.css`: Marco-style tile grid, floating pill, gallery, and message-style Contact layout.
- `glass.css`: white and cool-gray fills, black controls, subtle borders, light shadows, whole-tile actions, and hover expansion for tiles without flippable screens. It uses no background blur.
- `site.js`: sliding navigation, hover and keyboard-focus demo playback, immediate preview activation, manual project flips, interactive preview switching, email actions, and legacy section-link redirects.
- `preview-motion.css`: short project-specific CSS/SVG openings, which begin immediately and fade into the interface recording after 2.4 seconds, plus the Experience coding and accelerator animations. No background blur or frame timer loop is used. Outside coding uses native slide animations and a two-second autoplay timeout.
- `assets/*.jpg`, `assets/*.png`: still preview posters.
- `assets/*.mp4`: 16-second silent walkthrough loops, encoded as H.264 with fast-start metadata.

## Media and content provenance

- Video Search captures a preview of the original interface with sample library data, fixed illustrative results, and generated lecture frames. It does not record a new inference run or a real video seek.
- Stock Trader captures the original dashboard with committed report data generated September 11, 2026. The footage preserves its distinctions between backtests, walk-forward evaluations, and paper trading. It is a historical snapshot, not live data.
- SpotifyBook captures the original templates with a curated sample of real songs by Olivia Rodrigo, Drake, Bruno Mars, Steve Lacy, and Frank Sinatra. Track thumbnails and artist icons use their album artwork from the Apple music catalog. Ordering is sample data, not personal listening history. No account is authenticated and no playlist is created during the capture. Catalog and artwork sources are listed in `assets/spotifybook-sample-sources.json`. The opening animation reuses the same five locally stored album covers in `assets/spotify-cover-*.jpg`.
- The portrait SpotifyBook walkthrough remains in the assets from the earlier homepage. Home and Work use the landscape recordings, with animated openings and hover/focus playback; project pages retain their larger demos.
- Home exposes experience and project descriptions without tabs or hover. Resume and Email are the primary actions; GitHub and LinkedIn use inline SVG marks. Education and role links open their details on Experience.
- The floating navigation uses one black pill that glides and resizes to the hovered or keyboard-focused tab, then returns to the current page when the pointer leaves. Clicks keep native page navigation and modifier-key behavior; touch selection can continue its movement on the destination page. Labels stay readable as the pill passes under them. Mobile resizing recalculates its position, and reduced-motion settings use instant changes. Without JavaScript, the current-page tab retains its static pill.
- The supplied San Francisco skyline photograph remains in the assets from the earlier homepage. It is not displayed on the current homepage.
- Contact adds a white message surface, gray incoming bubble, blue outgoing action and send arrow, plus LinkedIn blue for the profile icon and connect button. The message colors reference [Apple's iMessage treatment](https://support.apple.com/en-us/104972); the LinkedIn card follows its [blue/white brand treatment](https://brand.linkedin.com/in-logo). Other pages retain the neutral palette.
- Mosaic tiles expand slightly on mouse hover or keyboard focus. Project cards play their silent interface demos on hover or when a project link receives keyboard focus. The Switch view button rotates mosaic project screens to their alternate capture; videos pause while that view is visible. Native links stretch across each tile while buttons, other links, and forms remain independently usable. Reduced-motion preferences disable expansion and use an instant view change.
- Outside coding slides to the next interest every two seconds while visible. Visitors can swipe on touch screens, drag with a mouse, click the tile, or use the Previous/Next arrows, dots, and keyboard arrow keys. Autoplay pauses on hover, keyboard focus, during gestures, offscreen, in hidden tabs, or with the Pause button; reduced motion disables autoplay and sliding transitions. Vertical touch scrolling and pinch zoom remain available. Research and teaching tiles jump to their corresponding experience entries; other tiles open their relevant page, GitHub, LinkedIn, or email action.
- Video Search previews use the tile's full inner width, with a taller grid row to show the complete interface. Outside coding has Previous/Next arrows that cycle through the four interests, alongside the direct-selection dots and a screen-reader announcement.
- Amazon's white wordmark and orange smile are sourced from the [About Amazon footer](https://www.aboutamazon.com/). Illinois's full-color Block I is sourced from the [official brand web resources](https://web.brand.illinois.edu/logos/), using https://cdn.brand.illinois.edu/logos/block-i.svg. Both are stored locally as SVGs; the original artwork is retained.
- The MP4s are edited walkthroughs assembled from four captured interface states each, with short transitions. No soundtrack is included.
- Project cards on Work begin with still posters. Clips load when visible and hovered, keyboard-focused, or explicitly started; hover playback pauses when the pointer and focus leave. Explicit Play keeps playback enabled until Pause, and a manual pause is respected on subsequent hovers. Clips also pause offscreen or when the page is hidden. Touch visitors can use the Play button. Reduced-motion preferences show still posters until the visitor explicitly starts a demo. Project detail pages retain visible-only playback. Each activation also starts a 2.4-second illustrative opening: a typed search query, scanner and staggered results; a schematic stock chart drawing with allocation steps; or moving sample music rows and a silent equalizer. These simplified illustrations are not live searches, financial results, or audio playback. Underlying card recordings run at 2× speed; detail-page recordings keep their original pace. Openings are hidden from assistive technology, do not intercept clicks, stop on pause/exit/hidden pages, and are disabled for reduced motion.
- Experience and education use Ryan's supplied résumé as background. The current résumé supplies experience details, project metrics, education, GPA, coursework, and grouped technical skills. The NFL project has a public writeup without a private repository link.

Source projects:

- https://github.com/ryanchan339/video-search-bar
- https://github.com/ryanchan339/Stock-Trader
- https://github.com/ryanchan339/The-SpotifyBook

## Included decisions

Marco.fyi-style four-column mosaic with mixed-size tiles, 16px gaps, 32px corners, and a floating Home / Work / Experience / Contact pill. The palette follows [onur.design](https://www.onur.design/): a white canvas, black typography and active controls, cool-gray panels, and subtle gray borders. Secondary text uses a darker gray to keep smaller labels readable. Controls have opaque fills, subtle borders, and light shadows, without gradients or background blur. The Work dot and navigation helper prompts are removed. The grid fits the viewport and becomes two columns or one column on smaller screens. Tiles expand slightly on mouse hover or keyboard focus; project cards play interface previews, with manual flips available through Switch view. Each exposes a native link or interest-cycling button across its body. Amazon and UIUC logo badges identify the roles and education. The original three projects and their demos are retained alongside the NFL project from the updated résumé. No personal portrait or phone number. The Contact composer opens an email draft in the visitor's mail app.

The Experience page replaces its Video Search tile with an illustrative Python Two Sum animation using two nested for loops, checking each distinct pair with j starting at i + 1. The displayed calls return [0, 1] for both [2, 7, 11, 15] with target 9 and [3, 3] with target 6. The terminal is a scripted visual preview, not a browser Python runtime. It starts when visible, supports whole-tile Pause/Resume and hover replay after completion, pauses offscreen or in hidden tabs, and shows the complete code and output under reduced motion.

The transformer acceleration tile illustrates computation with a diagonal wave across an 8×8 display grid and a repeating GEMM → Softmax → Output sequence. It is an abstract preview, not a simulation of hardware timing. It animates while visible, has a separate Pause/Play control, pauses offscreen and in hidden tabs, and remains static under reduced motion. The tile's research link still opens the ADAPT Lab experience entry.

The About page has been removed. Navigation contains Home, Work, Experience, and Contact. All former internal About links now lead to Experience or its education tile; the education tile links to the university website. No published page links to the removed page.


## Original design restored

The visual layout and interactive behavior are restored from commit `ecbccbe`, corresponding to the original `2990f6b94296` release. The current resume, privacy page, NFL writeup URL, and configured Umami analytics are retained. The tracker is appended to the original `site.js`, leaving its navigation, previews, tabs, and slideshow intact. Fixed-label links are marked with `data-track`.

Analytics loads only on `ryanchan339.github.io`; local previews, Do Not Track, Global Privacy Control, and the privacy-page opt-out prevent loading. Page paths exclude query strings and fragments, referrers are origin-only, and form text is not tracked.

## Résumé content update

The original design now includes the current Swift/iOS and TypeScript/Bedrock experience, research and teaching outcomes, GPA and coursework, and technical skills. Project writeups use the current résumé measurements. The Stock Trader recording remains an older dashboard snapshot and is labeled separately from the updated reported results.

## Glass homepage rows

Home follows one reading order: name and current affiliation, resume/social links, Education, Experience, and Projects. Each education, experience, and project entry occupies its own rounded glass row, with clear vertical gaps and section labels above the rows. Experience uses the full résumé bullets on both Home and the Experience page, with a system sans-serif font, 17px body copy (16px on mobile), and darker text. All three roles and all four projects, including SpotifyBook, are visible without tabs. Project previews sit beside descriptions on desktop and stack on small screens. Video Search, Stock Trader, and SpotifyBook retain their animated openings and recorded demos; the NFL architecture diagram highlights its data flow on hover or focus.

The information rows use a web approximation of liquid glass: clear centers, curved refractive edges, geometry-based highlights, and soft depth. The page and lenses share a plain white background. The floating navigation retains its original black sliding selector and white labels.

Scrolling uses the browser’s native movement and momentum. Cards keep their normal size and spacing throughout scrolling, without center-focus scaling or spring motion. Decorative rim lighting updates on input without a continuing frame loop. Hover retains a small tilt and expansion, with reduced-motion and contrast fallbacks.

Chromium receives backdrop refraction through SVG displacement maps based on a rounded meniscus profile. Other browsers keep the CSS backdrop and refract the controlled artwork layer with a regular SVG filter. A separate cached normal-based specular map draws the curved rim. Maps regenerate only when surface sizes change. Text stays above the optical layers and remains sharp. Reduced motion disables surface movement and automatic preview playback; visitors can still explicitly play a demo. Reduced-transparency, increased-contrast, forced-color, and unsupported-blur environments receive opaque fallbacks.

Design references: Apple’s [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/) explains lensing, geometry-responsive highlights, ambient color, and the Regular and Clear variants. This text-heavy layout borrows the restrained center and ambient edge treatment of Regular; it is an independent web approximation, not Apple’s native renderer.

LinkedIn uses blue, GitHub black and white, and Resume and Email use translucent white. Resume and Email omit arrow decorations; other homepage links use drawn SVG arrows. The standalone skills section is removed from both Home and Experience. Other content, links, and analytics are retained.
