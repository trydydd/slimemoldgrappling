# Changelog

Notable changes to the Slime Mold Grappling Club site. Newest first.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/).
When you upgrade the vendored theme or make another notable change, add an entry here.

## 2026-07-03

### Changed
- **Theme is now vendored as pristine files instead of a git submodule.** `themes/hugo-theme-relearn/` holds a clean copy of upstream commit `609539c` (the 5.24.0 line) with **no in-theme edits** — a plain `git clone` builds with no submodule or Go setup. All customizations live in the site layer (see the README "Theme" section). Reverses the submodule conversion from the PR below.
- Game Role Block styles now reference the theme's **documented** CSS variables (`--MAIN-TITLES-TEXT-color`, `--ACCENT-color`, `--CODE-BLOCK-BORDER-color`) instead of undocumented `--INTERNAL-*` ones, so they stay stable across theme upgrades.

### Removed
- Deleted three site-level partials that only shadowed the theme to make a one-line change, replacing them with config/assets that the theme honors natively:
  - `layouts/partials/favicon.html` → the theme auto-detects `static/images/logo.svg` with the correct MIME type.
  - `layouts/partials/meta.html` → `disableSeoHiddenPages = false` in `config.toml` (hidden pages stay indexable **and** now appear in the sitemap).
  - `layouts/alias.html` → alias redirect stubs get the theme's default `noindex` again (standard for redirect pages).

## 2026-07-03 — Style revert + Game Role Block (PR #143)

### Changed
- Reverted the custom color/font theme variant back to the default Relearn styling to match `main`; removed `DESIGN.md`, `.impeccable/design.json`, `static/css/theme-slime-mold.css`, and the Google Fonts links.
- Restored the Game Role Block component (bordered Top/Bottom Player layout on every game page), styled to follow the active theme variant in both light and dark mode.

## 2026-07-03 — Maintainability overhaul + no-account submission form (PR #142)

### Added
- **"Submit a Game" flow** at `/contribute/`: a public web form (no GitHub account needed) that posts to Netlify Forms and, via `netlify/functions/submission-created.js`, opens a pull request for maintainer review. Nothing is published automatically.

### Changed
- Aligned the two deploy pipelines (GitHub Pages canonical, Netlify previews/forms) on Hugo `0.121.1`; `baseURL` → `https`.
- Converted internal links to `relref` shortcodes so broken links fail the build instead of 404ing silently.
- Games now order **alphabetically by title** within their category — no more manual `weight` bookkeeping for contributors.
- Fixed the broken `og:image`, renamed a typo'd file and a date folder (with redirects), and removed unused assets.
