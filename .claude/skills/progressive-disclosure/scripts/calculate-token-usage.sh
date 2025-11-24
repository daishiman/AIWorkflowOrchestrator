#!/bin/bash

# File Size Checker for Claude Code Skills
# Checks line counts and estimates tokens based on character count

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <skill-directory>"
    echo "Example: $0 .claude/skills/database-design"
    exit 1
fi

SKILL_DIR=$1

if [ ! -d "$SKILL_DIR" ]; then
    echo "Error: Directory not found: $SKILL_DIR"
    exit 1
fi

echo "=========================================="
echo "File Size Analysis: $(basename $SKILL_DIR)"
echo "=========================================="
echo ""

total_lines=0
total_chars=0

# SKILL.md
if [ -f "$SKILL_DIR/SKILL.md" ]; then
    lines=$(wc -l < "$SKILL_DIR/SKILL.md")
    chars=$(wc -m < "$SKILL_DIR/SKILL.md")
    tokens=$((chars / 3))

    echo "SKILL.md:"
    echo "  Lines: $lines"
    echo "  Estimated tokens: $tokens"

    if [ $lines -le 500 ]; then
        echo "  Status: ✓ OK"
    elif [ $lines -le 550 ]; then
        echo "  Status: ⚠ 500行超過"
    else
        echo "  Status: ✗ 分割推奨"
    fi

    total_lines=$((total_lines + lines))
    total_chars=$((total_chars + chars))
else
    echo "⚠ SKILL.md not found"
fi

# Resources
echo ""
echo "Resources:"
if [ -d "$SKILL_DIR/resources" ]; then
    for file in "$SKILL_DIR/resources"/*.md; do
        if [ -f "$file" ]; then
            lines=$(wc -l < "$file")
            chars=$(wc -m < "$file")
            tokens=$((chars / 3))
            basename_file=$(basename "$file")

            echo "  - $basename_file:"
            echo "    Lines: $lines"
            echo "    Estimated tokens: $tokens"

            if [ $lines -le 500 ]; then
                echo "    Status: ✓ OK"
            else
                echo "    Status: ⚠️ 500行超過"
            fi

            total_lines=$((total_lines + lines))
            total_chars=$((total_chars + chars))
        fi
    done
else
    echo "  No resources directory"
fi

# Summary
echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
total_tokens=$((total_chars / 3))

echo "Total lines: $total_lines"
echo "Total characters: $total_chars"
echo "Estimated tokens: $total_tokens"
echo ""

if [ $total_lines -le 3000 ]; then
    echo "✅ 全体サイズ良好"
elif [ $total_lines -le 5000 ]; then
    echo "⚠ やや大きめ、最適化を検討"
else
    echo "✗ 大きすぎる、分割を推奨"
fi

echo ""
echo "参考:"
echo "- 推定トークン/行: $((total_tokens / total_lines)) tokens/line"
echo "- SKILL.md推奨: <500行"
echo "- リソース推奨: 各<500行"
echo ""
echo "注: トークン見積もりは文字数÷3で計算（日英混在・コード考慮）"
