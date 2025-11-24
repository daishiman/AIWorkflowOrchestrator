#!/bin/bash

# Documentation Structure Analyzer
# Analyzes and reports on documentation structure quality

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <skill-directory>"
    echo "Example: $0 .claude/skills/database-design"
    exit 1
fi

SKILL_DIR=$1

echo "=== Documentation Structure Analysis ==="
echo "Skill: $(basename $SKILL_DIR)"
echo ""

# File count
echo "【ファイル構成】"
echo "SKILL.md: $([ -f "$SKILL_DIR/SKILL.md" ] && echo '✓' || echo '✗')"
echo "resources/: $(find $SKILL_DIR/resources -name "*.md" 2>/dev/null | wc -l | tr -d ' ')ファイル"
echo "scripts/: $(find $SKILL_DIR/scripts -type f 2>/dev/null | wc -l | tr -d ' ')ファイル"
echo "templates/: $(find $SKILL_DIR/templates -type f 2>/dev/null | wc -l | tr -d ' ')ファイル"
echo ""

# Line counts
echo "【行数チェック】"
if [ -f "$SKILL_DIR/SKILL.md" ]; then
    lines=$(wc -l < "$SKILL_DIR/SKILL.md")
    if [ $lines -le 500 ]; then
        echo "SKILL.md: $lines行 ✓"
    else
        echo "SKILL.md: $lines行 ⚠️ 超過"
    fi
fi

# Resource files
if [ -d "$SKILL_DIR/resources" ]; then
    for file in "$SKILL_DIR/resources"/*.md; do
        if [ -f "$file" ]; then
            lines=$(wc -l < "$file")
            basename_file=$(basename "$file")
            if [ $lines -le 500 ]; then
                echo "  $basename_file: $lines行 ✓"
            else
                echo "  $basename_file: $lines行 ⚠️ 超過"
            fi
        fi
    done
fi

echo ""
echo "=== 分析完了 ==="
