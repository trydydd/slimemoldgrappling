#!/usr/bin/env python3
"""
Migrate game files from the markdown-body Top/Bottom-Player convention to
structured frontmatter (top_player/bottom_player objects), so a render-game
partial can produce DESIGN.md's Game Role Block.

Usage:
    python3 scripts/migrate_games.py --dry-run   # preview changes, write nothing
    python3 scripts/migrate_games.py             # write migrated files
    python3 scripts/migrate_games.py --dry-run path/to/one_game.md  # single file
"""
import sys
import re
from pathlib import Path

import yaml

ROLE_HEADER_RE = re.compile(
    r'^\*\*(Top Player|Bottom Player|Attacking Player|Defending Player|Offensive Player|Defensive Player)\*\*:\s*$'
)
FIELD_RE = re.compile(
    r'^\s*\*\s+\*\*(Position|Objective|Constraints|Win Condition)\*\*:\s?(.*)$'
)
FIELD_KEYS = {
    'Position': 'position',
    'Objective': 'objective',
    'Constraints': 'constraints',
    'Win Condition': 'win_condition',
}


class MigrationError(Exception):
    pass


def split_frontmatter(text):
    if not text.startswith('---'):
        raise MigrationError("missing frontmatter")
    parts = text.split('---', 2)
    if len(parts) < 3:
        raise MigrationError("malformed frontmatter")
    frontmatter = yaml.safe_load(parts[1]) or {}
    body = parts[2]
    # body starts right after the closing '---'; drop a single leading newline
    if body.startswith('\n'):
        body = body[1:]
    return frontmatter, body


def parse_role_block(lines, start_idx):
    """Parse one role block starting at the header line. Returns (role_dict, next_idx)."""
    header_match = ROLE_HEADER_RE.match(lines[start_idx].strip())
    label = header_match.group(1)
    role = {'label': label}
    i = start_idx + 1
    fields_found = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            if fields_found >= 4:
                break
            continue
        field_match = FIELD_RE.match(line)
        if not field_match:
            break
        field_name, value = field_match.groups()
        role[FIELD_KEYS[field_name]] = value.strip()
        fields_found += 1
        i += 1
    if fields_found != 4:
        raise MigrationError(
            f"expected 4 fields for {label}, found {fields_found}"
        )
    return role, i


def migrate_body(body):
    lines = body.split('\n')
    role_line_idxs = [i for i, l in enumerate(lines) if ROLE_HEADER_RE.match(l.strip())]
    if len(role_line_idxs) != 2:
        raise MigrationError(f"expected 2 role headers, found {len(role_line_idxs)}")

    first_idx, second_idx = role_line_idxs
    preamble = '\n'.join(lines[:first_idx]).strip()

    top_role, after_first_idx = parse_role_block(lines, first_idx)
    if after_first_idx > second_idx:
        raise MigrationError("first role block overruns second role header")
    bottom_role, after_second_idx = parse_role_block(lines, second_idx)

    postamble = '\n'.join(lines[after_second_idx:]).strip()

    return top_role, bottom_role, preamble, postamble


def migrate_file(path, dry_run=True):
    text = path.read_text()
    frontmatter, body = split_frontmatter(text)
    top_role, bottom_role, preamble, postamble = migrate_body(body)

    new_frontmatter = dict(frontmatter)
    new_frontmatter['top_player'] = top_role
    new_frontmatter['bottom_player'] = bottom_role
    if postamble:
        new_frontmatter['notes'] = postamble

    new_body = preamble
    if new_body:
        new_body += '\n'

    fm_yaml = yaml.safe_dump(
        new_frontmatter, sort_keys=False, allow_unicode=True, width=1000
    )
    new_text = f"---\n{fm_yaml}---\n\n{new_body}" if new_body else f"---\n{fm_yaml}---\n"

    if dry_run:
        return new_text
    path.write_text(new_text)
    return None


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    targets = [a for a in args if not a.startswith('--')]

    if targets:
        files = [Path(t) for t in targets]
    else:
        files = sorted(
            p for p in Path('content/games').rglob('*.md') if p.name != '_index.md'
        )

    errors = []
    migrated = 0
    for f in files:
        try:
            result = migrate_file(f, dry_run=dry_run)
        except MigrationError as e:
            errors.append((f, str(e)))
            continue
        except Exception as e:
            errors.append((f, f"unexpected error: {e}"))
            continue
        migrated += 1
        if dry_run:
            print(f"=== {f} ===")
            print(result)
            print()

    print(f"\n{'Would migrate' if dry_run else 'Migrated'} {migrated}/{len(files)} files.")
    if errors:
        print(f"\n{len(errors)} ERRORS:")
        for f, msg in errors:
            print(f"  {f}: {msg}")
        sys.exit(1)


if __name__ == '__main__':
    main()
