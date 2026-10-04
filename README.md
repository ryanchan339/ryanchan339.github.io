# Ryan Chan portfolio

A static portfolio with five main pages—Home, About, Work, Experience, and Contact—and three project detail pages. Plain HTML, CSS, and JavaScript; no package installation or build step is required.

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

- `index.html`: mixed-size project, introduction, experience, education, interests, and contact tiles. The introduction uses Ryan's name, LinkedIn/GitHub buttons, two linked logo cards for Amazon and UIUC, and the supplied San Francisco sunset photograph.
- `about.html`: Ryan's introduction, supplied Central Park photograph, and education.
- `work.html`: all three project showcases and demos.
- `experience.html`: professional, research, and teaching experience, plus an illustrative Python Two Sum editor and terminal animation.
- `contact.html`: email, LinkedIn, GitHub, and copy-email action.
- `projects/*.html`: project explanations and source links.
- `styles.css`: layout, typography, colors, and responsive behavior.
- `format.css`: Marco-style tile grid, floating pill, gallery, and message-style Contact layout.
- `glass.css`: white and cool-gray fills, black controls, subtle borders, light shadows, whole-tile actions, and hover expansion for tiles without flippable screens. It uses no background blur.
- `site.js`: sliding navigation, hover and keyboard-focus demo playback, immediate preview activation, manual project flips, interactive preview switching, email actions, and legacy section-link redirects.
- `preview-motion.css`: short project-specific CSS/SVG openings, which begin immediately and fade into the interface recording after 2.4 seconds, plus the Experience coding animation. No background blur or animation timer loop is used.
- `assets/*.jpg`, `assets/*.png`: still preview posters.
- `assets/*.mp4`: 16-second silent walkthrough loops, encoded as H.264 with fast-start metadata.

## Media and content provenance

- Video Search captures a preview of the original interface with sample library data, fixed illustrative results, and generated lecture frames. It does not record a new inference run or a real video seek.
- Stock Trader captures the original dashboard with committed report data generated September 11, 2026. The footage preserves its distinctions between backtests, walk-forward evaluations, and paper trading. It is a historical snapshot, not live data.
- SpotifyBook captures the original templates with a curated sample of real songs by Olivia Rodrigo, Drake, Bruno Mars, Steve Lacy, and Frank Sinatra. Track thumbnails and artist icons use their album artwork from the Apple music catalog. Ordering is sample data, not personal listening history. No account is authenticated and no playlist is created during the capture. Catalog and artwork sources are listed in `assets/spotifybook-sample-sources.json`. The opening animation reuses the same five locally stored album covers in `assets/spotify-cover-*.jpg`.
- The tall Home tile uses a separate portrait SpotifyBook walkthrough captured from the same original templates at mobile size.
- The Home introduction is visual rather than prose. Its affiliation cards open the relevant education or experience page; the About arrow opens Ryan's full introduction. Social buttons use inline SVG marks and open the supplied LinkedIn and GitHub profiles.
- The floating navigation uses one black pill that glides and resizes to the hovered or keyboard-focused tab, then returns to the current page when the pointer leaves. Clicks keep native page navigation and modifier-key behavior; touch selection can continue its movement on the destination page. Labels stay readable as the pill passes under them. Mobile resizing recalculates its position, and reduced-motion settings use instant changes. Without JavaScript, the current-page tab retains its static pill.
- Home uses Ryan’s supplied `SF Skyline Linkedin.jpg` as `assets/san-francisco-sunset.jpg`, showing San Francisco and the Bay Bridge at sunset. About uses the supplied `dd05bddc197a1c9dba9ecb43e26b30af4dbcf4f9-1600x1066.jpg` as `assets/new-york-central-park.jpg`, showing Central Park and Manhattan. Both JPEGs are copied unchanged, with accurate location captions and image descriptions. The previous Wikimedia photographs and their captions have been replaced. No photographer or license is inferred for the supplied images.
- Contact adds a white message surface, gray incoming bubble, blue outgoing action and send arrow, plus LinkedIn blue for the profile icon and connect button. The message colors reference [Apple's iMessage treatment](https://support.apple.com/en-us/104972); the LinkedIn card follows its [blue/white brand treatment](https://brand.linkedin.com/in-logo). Other pages retain the neutral palette.
- Mosaic tiles expand slightly on mouse hover or keyboard focus. Project cards play their silent interface demos on hover or when a project link receives keyboard focus. The Switch view button rotates mosaic project screens to their alternate capture; videos pause while that view is visible. Native links stretch across each tile while buttons, other links, and forms remain independently usable. Reduced-motion preferences disable expansion and use an instant view change.
- Clicking the body of Outside coding cycles to the next interest. The Previous/Next arrows and direct-selection dots remain usable. Research and teaching tiles jump to their corresponding experience entries; other tiles open their relevant page, GitHub, LinkedIn, or email action.
- Video Search previews use the tile's full inner width, with a taller grid row to show the complete interface. Outside coding has Previous/Next arrows that cycle through the four interests, alongside the direct-selection dots and a screen-reader announcement.
- Amazon's white wordmark and orange smile are sourced from the [About Amazon footer](https://www.aboutamazon.com/). Illinois's full-color Block I is sourced from the [official brand web resources](https://web.brand.illinois.edu/logos/), using https://cdn.brand.illinois.edu/logos/block-i.svg. Both are stored locally as SVGs; the original artwork is retained.
- The MP4s are edited walkthroughs assembled from four captured interface states each, with short transitions. No soundtrack is included.
- Project cards on Home and Work begin with still posters. Clips load when visible and hovered, keyboard-focused, or explicitly started; hover playback pauses when the pointer and focus leave. Explicit Play keeps playback enabled until Pause, and a manual pause is respected on subsequent hovers. Clips also pause offscreen or when the page is hidden. Touch visitors can use the Play button. Reduced-motion preferences show still posters until the visitor explicitly starts a demo. Project detail pages retain visible-only playback. Each activation also starts a 2.4-second illustrative opening: a typed search query, scanner and staggered results; a schematic stock chart drawing with allocation steps; or moving sample music rows and a silent equalizer. These simplified illustrations are not live searches, financial results, or audio playback. Underlying card recordings run at 2× speed; detail-page recordings keep their original pace. Openings are hidden from assistive technology, do not intercept clicks, stop on pause/exit/hidden pages, and are disabled for reduced motion.
- Experience and education use Ryan's supplied résumé as background. Descriptions are rewritten, and GPA, the phone number, and the private NFL project are excluded.

Source projects:

- https://github.com/ryanchan339/video-search-bar
- https://github.com/ryanchan339/Stock-Trader
- https://github.com/ryanchan339/The-SpotifyBook

## Included decisions

Marco.fyi-style four-column mosaic with mixed-size tiles, 16px gaps, 32px corners, and a floating Home / About / Work / Experience / Contact pill. The palette follows [onur.design](https://www.onur.design/): a white canvas, black typography and active controls, cool-gray panels, and subtle gray borders. Secondary text uses a darker gray to keep smaller labels readable. Controls have opaque fills, subtle borders, and light shadows, without gradients or background blur. The Work dot and navigation helper prompts are removed. The grid fits the viewport and becomes two columns or one column on smaller screens. Tiles expand slightly on mouse hover or keyboard focus; project cards play interface previews, with manual flips available through Switch view. Each exposes a native link or interest-cycling button across its body. Amazon and UIUC logo badges identify the roles and education. Ryan's content, original three projects, supplied About text, and separate project detail pages are retained. No personal portrait, phone number, or GPA. The Contact composer opens an email draft in the visitor's mail app.

The Experience page replaces its Video Search tile with an illustrative Python Two Sum animation using two nested for loops, checking each distinct pair with j starting at i + 1. The displayed calls return [0, 1] for both [2, 7, 11, 15] with target 9 and [3, 3] with target 6. The terminal is a scripted visual preview, not a browser Python runtime. It starts when visible, supports whole-tile Pause/Resume and hover replay after completion, pauses offscreen or in hidden tabs, and shows the complete code and output under reduced motion.
