# Ryan Chan portfolio

A static portfolio with a homepage and three project detail pages. Plain HTML, CSS, and JavaScript; no package installation or build step is required.

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

The workflow follows GitHub's documented configure/upload/deploy pattern: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Edit

- `index.html`: homepage copy, experience, education, and contact.
- `projects/*.html`: project explanations and source links.
- `styles.css`: layout, typography, colors, and responsive behavior.
- `site.js`: section navigation and demo playback.
- `assets/*.jpg`: still preview posters.
- `assets/*.mp4`: 16-second silent walkthrough loops, encoded as H.264 with fast-start metadata.

## Media and content provenance

- Video Search captures a preview of the original interface with sample library data, fixed illustrative results, and generated lecture frames. It does not record a new inference run or a real video seek.
- Stock Trader captures the original dashboard with committed report data generated September 11, 2026. The footage preserves its distinctions between backtests, walk-forward evaluations, and paper trading. It is a historical snapshot, not live data.
- SpotifyBook captures the original templates using fictitious tracks, artists, and generated cover art. No account is authenticated and no playlist is created during the capture.
- The MP4s are edited walkthroughs assembled from four captured interface states each, with short transitions. No soundtrack is included.
- Homepage loops load only when visible, pause when offscreen or the page is hidden, and have user-operated pause controls. Reduced-motion preferences show still posters until the visitor explicitly starts a demo.
- Experience and education use Ryan's supplied résumé as background. Descriptions are rewritten, and GPA, the phone number, and the private NFL project are excluded.

Source projects:

- https://github.com/ryanchan339/video-search-bar
- https://github.com/ryanchan339/Stock-Trader
- https://github.com/ryanchan339/The-SpotifyBook

## Included decisions

Recruiter-focused; light background; muted blue accent; floating Work / Experience / Contact pill; name-only introduction; no portrait or headline; Video Search featured; original three projects; separate project pages; contact by email, LinkedIn, and GitHub; no phone number.
