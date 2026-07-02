#!/usr/bin/env python3
"""
Validate game files have required structure and content.
Run this script to check games follow the Top Player/Bottom Player pattern.
"""
import os
import sys
import re
from pathlib import Path

import yaml

# Accepted (top, bottom) role-name pairs a game may use for its two sides.
ROLE_PAIRS = [
    ('Top Player', 'Bottom Player'),
    ('Attacking Player', 'Defending Player'),
    ('Offensive Player', 'Defensive Player'),
]

REQUIRED_ROLE_FIELDS = ['position', 'objective', 'constraints', 'win_condition']

INSTRUCTIONAL_PATTERNS = [
    r'step \d+',
    r'first,.*then',
    r'grab.*wrist',
    r'put.*here',
    r'take.*grip',
]


def split_frontmatter(content):
    """Return (frontmatter_dict_or_None, frontmatter_yaml_text_or_None)."""
    if not content.startswith('---'):
        return None, None
    parts = content.split('---', 2)
    if len(parts) < 3:
        return None, None
    try:
        frontmatter = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError:
        return None, None
    return frontmatter, parts[1]


def validate_structured_role(role, label, filepath, errors):
    if not isinstance(role, dict):
        errors.append(f"{label} is not a mapping: {filepath}")
        return
    if not role.get('label'):
        errors.append(f"{label} missing 'label': {filepath}")
    for field in REQUIRED_ROLE_FIELDS:
        value = role.get(field)
        if value is None or str(value).strip() == '':
            errors.append(f"{label} missing or empty '{field}': {filepath}")


def validate_game(filepath):
    """Ensure game has required structure (structured frontmatter or legacy markdown body)."""
    try:
        content = Path(filepath).read_text()
    except Exception as e:
        return [f"Could not read file {filepath}: {e}"]

    errors = []

    # Check for frontmatter
    if not content.startswith('---'):
        errors.append(f"Missing frontmatter: {filepath}")
        return errors

    frontmatter, _ = split_frontmatter(content)
    if frontmatter is not None and 'top_player' in frontmatter and 'bottom_player' in frontmatter:
        # Structured frontmatter format (post-migration).
        validate_structured_role(frontmatter['top_player'], 'top_player', filepath, errors)
        validate_structured_role(frontmatter['bottom_player'], 'bottom_player', filepath, errors)
    else:
        # Legacy markdown-body convention (pre-migration).
        matched_pair = None
        for first, second in ROLE_PAIRS:
            if f'**{first}**:' in content or f'**{second}**:' in content:
                matched_pair = (first, second)
                break

        if matched_pair is None:
            accepted = ' or '.join(f'{first}/{second}' for first, second in ROLE_PAIRS)
            errors.append(f"Missing role sections (expected {accepted}): {filepath}")
        else:
            first, second = matched_pair
            if f'**{first}**:' not in content:
                errors.append(f"Missing {first} section: {filepath}")
            if f'**{second}**:' not in content:
                errors.append(f"Missing {second} section: {filepath}")

        # Check each section has required fields
        required_fields = ['Position', 'Objective', 'Constraints', 'Win Condition']
        for field in required_fields:
            pattern = f'\\*\\*{field}\\*\\*:'
            count = len(re.findall(pattern, content))
            if count < 2:  # Should appear in both Top and Bottom
                errors.append(f"Field '{field}' missing or incomplete (found {count}/2): {filepath}")

    # Check for WHAT not HOW principle (look for instructional language)
    for pattern in INSTRUCTIONAL_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE):
            errors.append(f"WARNING: Possible HOW instruction instead of WHAT (pattern: '{pattern}'): {filepath}")

    return errors

def validate_lesson_plan(filepath):
    """Check that lesson plans reference valid games"""
    try:
        content = Path(filepath).read_text()
    except Exception as e:
        return [f"Could not read file {filepath}: {e}"]
    
    errors = []
    
    # Find all include_page_body references
    includes = re.findall(r'{{% include_page_body "([^"]+)" %}}', content)
    
    for game_path in includes:
        # Some includes mistakenly include a trailing .md; strip it so it
        # isn't doubled up below.
        if game_path.endswith('.md'):
            game_path = game_path[:-len('.md')]

        # Convert to actual file path
        full_path = Path(f'content/{game_path}.md')
        if not full_path.exists():
            # Try _index.md
            full_path = Path(f'content/{game_path}/_index.md')
        
        if not full_path.exists():
            errors.append(f"Lesson plan references non-existent game: {game_path} in {filepath}")
    
    return errors

def main():
    games_dir = Path('content/games')
    lesson_plans_dir = Path('content/lesson_plans')
    all_errors = []
    all_warnings = []
    
    print("🔍 Validating games...")
    game_count = 0
    for game_file in games_dir.rglob('*.md'):
        if game_file.name == '_index.md':
            continue
        game_count += 1
        errors = validate_game(game_file)
        for error in errors:
            if 'WARNING' in error:
                all_warnings.append(error)
            else:
                all_errors.append(error)
    
    print(f"   Checked {game_count} game files")
    
    print("🔍 Validating lesson plans...")
    lesson_count = 0
    for lesson_file in lesson_plans_dir.rglob('*.md'):
        if lesson_file.name == '_index.md':
            continue
        lesson_count += 1
        errors = validate_lesson_plan(lesson_file)
        all_errors.extend(errors)
    
    print(f"   Checked {lesson_count} lesson plan files")
    
    # Print results
    if all_warnings:
        print("\n⚠️  WARNINGS:")
        for warning in all_warnings:
            print(f"  {warning}")
    
    if all_errors:
        print("\n❌ ERRORS:")
        for error in all_errors:
            print(f"  {error}")
        sys.exit(1)
    else:
        print("\n✅ All content validated successfully")
        if all_warnings:
            print(f"   ({len(all_warnings)} warnings - consider reviewing)")
        sys.exit(0)

if __name__ == '__main__':
    main()
