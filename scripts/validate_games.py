#!/usr/bin/env python3
"""
Validate game files have required structure and content.
Run this script to check games follow the Top Player/Bottom Player pattern.
"""
import os
import sys
import re
from pathlib import Path

def validate_game(filepath):
    """Ensure game has required structure"""
    try:
        content = Path(filepath).read_text()
    except Exception as e:
        return [f"Could not read file {filepath}: {e}"]
    
    errors = []
    
    # Check for frontmatter
    if not content.startswith('---'):
        errors.append(f"Missing frontmatter: {filepath}")
        return errors
    
    # Check for required sections
    if '**Top Player**:' not in content:
        errors.append(f"Missing Top Player section: {filepath}")
    if '**Bottom Player**:' not in content:
        errors.append(f"Missing Bottom Player section: {filepath}")
    
    # Check each section has required fields
    required_fields = ['Position', 'Objective', 'Constraints', 'Win Condition']
    for field in required_fields:
        pattern = f'\\*\\*{field}\\*\\*:'
        count = len(re.findall(pattern, content))
        if count < 2:  # Should appear in both Top and Bottom
            errors.append(f"Field '{field}' missing or incomplete (found {count}/2): {filepath}")
    
    # Check for WHAT not HOW principle (look for instructional language)
    instructional_patterns = [
        r'step \d+',
        r'first,.*then',
        r'grab.*wrist',
        r'put.*here',
        r'take.*grip',
    ]
    for pattern in instructional_patterns:
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
