// Turns a verified "Submit a Game" form submission into a pull request.
//
// Netlify invokes a function named `submission-created` automatically for
// every form submission that passes spam filtering (honeypot + Akismet).
// This one builds a game markdown file from the submitted fields, pushes it
// to a new `submissions/…` branch, and opens a PR for the maintainer to
// review. Nothing is ever merged automatically.
//
// Required environment variable (set in the Netlify UI, scoped to Functions):
//   GH_SUBMISSION_TOKEN  fine-grained PAT for trydydd/slimemoldgrappling
//                        with Contents: read/write and Pull requests: read/write
// Optional:
//   DRY_RUN=1            log the file that would be committed and stop
//
// Zero npm dependencies on purpose: plain fetch against the GitHub REST API,
// so the Hugo repo needs no package.json or node build step.

const REPO = "trydydd/slimemoldgrappling";
const API = `https://api.github.com/repos/${REPO}`;

exports.handler = async (event) => {
  try {
    const { payload } = JSON.parse(event.body);
    if (payload.form_name !== "submit-a-game") return ok("ignored: other form");

    const d = payload.data || {};
    const problem = validate(d);
    if (problem) return ok(`rejected: ${problem}`);

    const md = buildMarkdown(d);
    const slug = slugify(d.title);
    const path = `content/${d.category.replace(/\/+$/, "")}/${slug}.md`;

    if (process.env.DRY_RUN) {
      console.log(`DRY_RUN: would commit ${path}:\n${md}`);
      return ok("dry run");
    }

    // Category must be a real games section in the repo.
    const catCheck = await gh(`/contents/content/${d.category}/_index.md?ref=main`);
    if (!catCheck.ok) return ok(`rejected: unknown category ${d.category}`);

    const mainRef = await gh(`/git/ref/heads/main`);
    if (!mainRef.ok) throw new Error(`ref lookup failed: ${mainRef.status}`);
    const baseSha = (await mainRef.json()).object.sha;

    const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
    let branch = `submissions/${slug}-${stamp}`;
    let created = await gh(`/git/refs`, "POST", {
      ref: `refs/heads/${branch}`,
      sha: baseSha,
    });
    if (created.status === 422) {
      // branch name collision: re-suffix with seconds
      branch = `submissions/${slug}-${Date.now()}`;
      created = await gh(`/git/refs`, "POST", { ref: `refs/heads/${branch}`, sha: baseSha });
    }
    if (!created.ok) throw new Error(`branch create failed: ${created.status}`);

    const put = await gh(`/contents/${path}`, "PUT", {
      message: `Add community game submission: ${d.title.trim()}`,
      content: Buffer.from(md, "utf8").toString("base64"),
      branch,
    });
    if (!put.ok) throw new Error(`file create failed: ${put.status} ${await put.text()}`);

    const pr = await gh(`/pulls`, "POST", {
      title: `Game submission: ${d.title.trim()}`,
      head: branch,
      base: "main",
      body: prBody(d, path),
    });
    if (!pr.ok) throw new Error(`PR create failed: ${pr.status} ${await pr.text()}`);

    console.log(`opened PR: ${(await pr.json()).html_url}`);
    return ok("submitted");
  } catch (err) {
    // Never fail the submission: it is still stored in the Netlify Forms
    // dashboard, so a maintainer can recover it by hand.
    console.error("submission-created error:", err);
    return ok("error logged");
  }
};

function ok(msg) {
  return { statusCode: 200, body: msg };
}

function validate(d) {
  if (!d.title || !d.title.trim()) return "missing title";
  if (d.title.length > 120) return "title too long";
  if (!/^games(\/[a-z0-9_]+)*$/.test(d.category || "")) return "bad category";
  for (const f of [
    "top_position", "top_objective", "top_constraints", "top_win",
    "bottom_position", "bottom_objective", "bottom_constraints", "bottom_win",
  ]) {
    if (!d[f] || !d[f].trim()) return `missing field ${f}`;
  }
  if (d.video_url && !/^https?:\/\//.test(d.video_url)) return "bad video url";
  if (!slugify(d.title)) return "title has no usable characters";
  return null;
}

function slugify(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

// Field text is dropped into markdown bullet lines: collapse newlines and
// cap length so a submission cannot break the page structure.
function clean(text, max = 2000) {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function buildMarkdown(d) {
  const lines = [
    "---",
    `title: ${JSON.stringify(clean(d.title, 120))}`,
    'archetype: "game"',
    "tags:",
    "- untested",
    "- community submission",
    "---",
    "",
    "**Top Player**:",
    `  * **Position**: ${clean(d.top_position)}`,
    `  * **Objective**: ${clean(d.top_objective)}`,
    `  * **Constraints**: ${clean(d.top_constraints)}`,
    `  * **Win Condition**: ${clean(d.top_win)}`,
    "",
    "**Bottom Player**:",
    `  * **Position**: ${clean(d.bottom_position)}`,
    `  * **Objective**: ${clean(d.bottom_objective)}`,
    `  * **Constraints**: ${clean(d.bottom_constraints)}`,
    `  * **Win Condition**: ${clean(d.bottom_win)}`,
  ];
  if (clean(d.notes)) lines.push("", `**Notes**: ${clean(d.notes)}`);
  if (clean(d.video_url, 300)) lines.push("", `**Video**: <${clean(d.video_url, 300)}>`);
  if (clean(d.submitter, 120)) lines.push("", `**Attribution**: submitted by ${clean(d.submitter, 120)}`);
  return lines.join("\n") + "\n";
}

function prBody(d, path) {
  const credit = clean(d.submitter, 120) || "an anonymous contributor";
  return [
    `New game submitted through the [website form](https://slimemoldgrappling.com/contribute/) by ${credit}.`,
    "",
    `File: \`${path}\``,
    "",
    "Review checklist:",
    "- [ ] Category fits (move the file if not)",
    "- [ ] Wording is clear and safe to run in class",
    "- [ ] No spam / junk content",
    "- [ ] Netlify deploy preview renders correctly",
    "",
    "Merging publishes the game (tagged `untested`).",
  ].join("\n");
}

async function gh(pathname, method = "GET", body) {
  return fetch(`${API}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GH_SUBMISSION_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "slimemold-game-submission-bot",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
