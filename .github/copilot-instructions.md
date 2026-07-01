# Slime Mold Grappling Club - AI Agent Instructions

## Project Overview

This is a Hugo-based documentation site for Brazilian Jiu-Jitsu (BJJ) training using the constraints-led approach and ecological dynamics. The site publishes constrained games, lesson plans, blog content, and interactive tools for submission grappling education.

**Live Site**: https://slimemoldgrappling.com  
**Theme**: hugo-theme-relearn (documentation-focused)  
**Hugo Version**: 0.121.0/0.121.1

## Architecture & Content Structure

### Content Hierarchy
- **Games** (`content/games/`): Hierarchical structure of constrained BJJ games organized by position (side_control, mount, guard, back, etc.). Each game defines objectives, constraints, and win conditions for top/bottom players.
- **Lesson Plans** (`content/lesson_plans/`): Pre-built class structures combining multiple games in sequences, organized by curriculum (foundations, blocks, intro).
- **Blog** (`content/blog/`): Educational articles on training methodology, game creation, and grappling concepts.
- **Resources** (`content/resources/`): Reference materials including books, videos, podcasts, newsletter archives, and interactive tools.

### Key Patterns

**Game Structure** - All games follow this YAML frontmatter + content pattern:
```markdown
---
archetype: "game"
title: "Game Name"
tags: ["position", "progression-type"]
weight: 0  # Display order (1=first, higher=later)
---

**Top Player**:
  * **Position**: Starting position description
  * **Objective**: What they're trying to achieve
  * **Constraints**: Rules limiting their actions
  * **Win Condition**: How they win

**Bottom Player**:
  * **Position**: Starting position description
  * **Objective**: What they're trying to achieve
  * **Constraints**: Rules limiting their actions
  * **Win Condition**: How they escape/reverse
```

**Lesson Plan Structure** - Uses Hugo expand shortcodes to embed games:
```markdown
{{% expand open=true title="**Game 1: Title**" %}}
{{% include_page_body "games/path/to/game" %}}
{{% /expand %}}
```

The `include_page_body` shortcode (`layouts/shortcodes/include_page_body.html`) pulls raw content from game files to avoid duplication.

### Weight-Based Navigation
The theme uses `weight` fields to order content. When adding items to a category:
1. Count existing items in that category
2. Set weight to count + 1
3. Lower weight = displayed first

## Development Workflows

### Local Development
```bash
hugo server  # Runs at localhost:1313 with live reload
```

### Creating New Content

**New Game (Manual)**:
1. Copy `game_template.md` into appropriate `content/games/` subdirectory
2. Rename with underscores (e.g., `arm_isolation.md`)
3. Update frontmatter (title, tags, weight) and game structure

**New Game (Hugo CLI)**:
```bash
hugo new --kind game games/guard_games/closed_guard/game_name/_index.md
```

**New Category**:
```bash
hugo new --kind chapter games/new_position/_index.md
```

**New Top-Level Section**:
```bash
hugo new --kind chapter section_name/_index.md
```

### Deployment
- **Primary**: Netlify (auto-deploys from main branch)
- **Secondary**: GitHub Pages via `.github/workflows/hugo.yaml`
- Both use Hugo 0.121.x with `--gc --minify` flags

## Project-Specific Conventions

### File Naming
- Use underscores for spaces: `maintain_scarf_hold.md` not `maintain scarf hold.md`
- Game files can be standalone `.md` or `_index.md` in a directory
- Category index files are always `_index.md`

### Archetypes
Located in `archetypes/`, define templates for Hugo content creation:
- `game.md`: Games with top/bottom player structure
- `lesson_plan.md`: Pre-structured lesson with expand blocks
- `blog.md`, `training_log.md`, `bdt.md`: Other content types

### Custom Shortcodes
- `{{< random_games >}}`: Interactive JavaScript tool for generating random game parameters (position, goals, constraints)
- `{{< rpat_tool >}}`: Representative Practice Assessment Tool (8-question rating form)
- `{{< newsletter >}}`: MailerLite signup form
- `{{% include_page_body "path" %}}`: Embeds raw content from another page (note: uses `%` not `<>`)
- `{{< linktree >}}`: Link collection display

### Content Philosophy
Games embody the **constraints-led approach** and **ecological dynamics** - they're not traditional technique instruction but structured problem-solving environments with:
- Intelligent resistance (always an active opponent)
- Clear objectives for both players
- Specific constraints that focus learning
- Win conditions that validate solutions

**Critical Teaching Principle**: Games should specify WHAT to do ("Isolate an arm"), never HOW to do it ("Grab the wrist, step over..."). This allows athletes to discover their own solutions.

The site teaches athletes to create their own games using the **scientific method framework**:
1. Observation (identify problem)
2. Question (understand cause)
3. Hypothesis (create solution)
4. Experiment (test with resistance)
5. Analyze (evaluate results)
6. Repeat (iterate)

### Curriculum Structure

The **Foundations curriculum** (12 weeks, 3 sessions/week) follows a **repeating focus pattern**:
- Week N's major focus (first 3 games) becomes Week N+1's minor focus (games 4-5)
- Example: Week 1 Day 1 focuses on "chest to back pinning" → Week 2 Day 1's secondary focus is also "chest to back pinning"
- This creates spaced repetition and progressive skill development

**Submission Categories** (one per week):
- Naked Chokes
- Arm In Chokes  
- Straight Arm Locks
- Twisting Arm Locks
- Straight Leg Locks
- Twisting Leg Locks

**Positional Coverage**:
- Standing Situations (introduced second half)
- Pinning Situations
- Guarded Situations

## Integration Points

### External Dependencies
- **Netlify**: Primary hosting, env vars in `netlify.toml`
- **GitHub Pages**: Secondary deployment via GitHub Actions
- **MailerLite**: Newsletter signups (account 917164)
- **Hugo Theme Relearn**: Git submodule at `themes/hugo-theme-relearn/`

### Theme Configuration (`config.toml`)
- Uses `ordersectionsby = "weight"` for manual ordering
- `collapsibleMenu = true` for nested nav
- Custom params: `images`, `description`, `themeVariant = "auto"`

### Static Assets
- `static/images/`: Site images (referenced as `/images/...` in markdown)
- `assets/`: Processed assets (fonts, images for compilation)
- `public/`: Generated output (gitignored)

## Critical Files
- [config.toml](config.toml): Hugo site configuration
- [netlify.toml](netlify.toml): Netlify build settings
- [.github/workflows/hugo.yaml](.github/workflows/hugo.yaml): GitHub Pages deployment
- [game_template.md](game_template.md): Quick reference template (use archetypes for Hugo CLI)
- [archetypes/game.md](archetypes/game.md): Game archetype with Hugo templating
- [layouts/shortcodes/](layouts/shortcodes/): Custom shortcode implementations

## Common Tasks

**Add a game to existing position**:
1. Check weight of last game in that position's directory
2. Create new file with weight = last + 1
3. Follow game structure pattern from existing games
4. Remember: Describe WHAT to do (objectives/constraints), not HOW (step-by-step technique)

**Create a lesson plan**:
1. Use `archetypes/lesson_plan.md` as template
2. Reference games using `{{% include_page_body "games/category/game_name" %}}`
3. Wrap in expand shortcodes for collapsible sections
4. Apply repeating focus pattern: This week's major focus → next week's minor focus

**Update navigation order**:
Modify `weight` values in frontmatter - restart `hugo server` to see changes.

**Test before deploy**:
Run `hugo server` and verify at localhost:1313. Check console for errors.

### Content Validation

Automated tests run on every PR via `.github/workflows/test-content.yml`:
- Hugo build succeeds
- Key pages generate correctly
- Games have required Top/Bottom Player structure
- All four fields present (Position, Objective, Constraints, Win Condition)
- Lesson plans reference existing games
- Warning checks for HOW vs WHAT principle violations

**Validation script**: `scripts/validate_games.py`

## Future Development Areas

These patterns are not yet established but may be developed:
- Advanced validation rules (tag consistency, weight sequencing, content balance)
- Analytics integration (track which games/lessons are most viewed)
- Interactive tool architecture standards (modular shortcode system)
