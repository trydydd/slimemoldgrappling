# Slime Mold Grappling Club

The live site can be found at [https://slimemoldgrappling.com](https://slimemoldgrappling.com)

## Hosting

This site deploys twice, on purpose:

* **GitHub Pages** serves the canonical domain [slimemoldgrappling.com](https://slimemoldgrappling.com). It deploys automatically from the `main` branch via `.github/workflows/hugo.yaml`.
* **Netlify** serves [slimemoldgrappling.netlify.app](https://slimemoldgrappling.netlify.app) from the same repo (`netlify.toml`). It exists for pull request **deploy previews** (every PR gets a rendered preview link), **Netlify Forms**, and the game-submission function.

Both pin Hugo `0.121.1` — if you bump the version, change it in **both** `netlify.toml` and `.github/workflows/hugo.yaml`.

## Theme

The site uses the [Relearn theme](https://github.com/McShelby/hugo-theme-relearn) as a **git submodule** pinned to a known-good commit. When cloning the repo, bring it along:

```shell
git clone --recurse-submodules https://github.com/trydydd/slimemoldgrappling
# or, in an existing clone:
git submodule update --init
```

To upgrade the theme later: `cd themes/hugo-theme-relearn && git fetch && git checkout <new tag>`, then rebuild and re-check the site-level overrides that shadow theme files (`layouts/partials/meta.html`, `layouts/alias.html`, `layouts/partials/menu-footer.html`, `archetypes/chapter.md` — each has a comment noting what it changes), and commit the new submodule pointer.

## Submit a game (no account needed)

Anyone can contribute a game without touching GitHub: the [Submit a Game](https://slimemoldgrappling.com/contribute/) page has a plain web form. The flow:

1. The form posts to **Netlify Forms** (honeypot + Akismet spam filtering happens there; submissions are also kept in the Netlify Forms dashboard as a backstop).
2. Netlify automatically runs `netlify/functions/submission-created.js` for each verified submission. The function builds a game markdown file from the fields, pushes it to a `submissions/<slug>-<timestamp>` branch, and opens a **pull request**.
3. A maintainer reviews the PR (the Netlify deploy preview shows the rendered game) and merges it — nothing is published automatically. New games arrive tagged `untested`.

Because the canonical domain is served by GitHub Pages (which can't accept POSTs), the form's `action` points at the Netlify mirror (`params.formEndpoint` in `config.toml`) — a plain HTML form post is a navigation, so this works from either domain.

### Maintainer setup (one-time, in the Netlify + GitHub UIs)

1. Create a **fine-grained GitHub personal access token** scoped to *this repo only*, with **Contents: read/write** and **Pull requests: read/write**. Set an expiry reminder.
2. In the Netlify site settings, add the environment variable **`GH_SUBMISSION_TOKEN`** with that token (scope it to Functions).
3. In the Netlify UI, enable **form detection** (Forms → Enable), then redeploy; the deploy log should report one form (`submit-a-game`) and the bundled `submission-created` function.
4. Send a test submission from both `slimemoldgrappling.com/contribute/` and the netlify.app mirror and confirm a PR appears.
5. Free-tier Netlify Forms allows ~100 submissions/month. If the function ever errors, the submission is still in the Forms dashboard — nothing is lost.

## Manually create a new game:
* copy the file `game_template.md` into the directory for the category of game that you would like to create in `content/games/`. 
* Rename the file to accurately describe your game. Use underscores '_' instead of spaces in the filename.
* Update the fields in the file:
  * title
  * tags (keep `untested` until the game has been tried in class; look at the other games in your category for an idea of what other tags to use)
  * the fields for describing the game

Games are listed **alphabetically by title** within their category (every `content/games/**/_index.md` sets `ordersectionsby: title`), so you do not need to set a `weight` on games.

## See your changes live with Hugo
run hugo server locally to see live changes on the site in your browser at localhost:1313
```shell
hugo server
```

## Add new content using Hugo
create a new game in an existing folder using hugo:
```shell
hugo new --kind game games/guard_games/supine_guard/closed_guard/wet_dog.md
```

Create a new directory inside of games using hugo:
```shell
hugo new --kind chapter games/mount/_index.md
```

create a new top level section in the lefthand nav bar using hugo:
```shell
hugo new --kind chapter why/_index.md
```

Everything under `content/games/` is ordered alphabetically by title, so games and game categories need no `weight`. Elsewhere (top-level sections, lesson plan weeks, training log months) ordering is still controlled by the `weight` front matter field: 1 is shown first, higher integers later. When creating a new section outside of games, open the file and set `weight` to slot it where you want it.