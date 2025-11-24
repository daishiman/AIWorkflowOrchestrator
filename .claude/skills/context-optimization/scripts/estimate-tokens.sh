#!/bin/bash

# Improved token estimator
# Estimates tokens based on actual character count and content type

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <file.md>"
    exit 1
fi

FILE=$1

if [ ! -f "$FILE" ]; then
    echo "Error: File not found: $FILE"
    exit 1
fi

# Count lines and characters
lines=$(wc -l < "$FILE")
chars=$(wc -m < "$FILE")

# Estimate tokens based on character count
# Conservative estimate:
# - For mixed content (markdown with Japanese/English): ~2.5 chars per token
# - This accounts for:
#   * Japanese text: ~1.5-2 chars/token (more efficient)
#   * English text: ~4 chars/token
#   * Code blocks: ~3-4 chars/token
#   * Markdown syntax: overhead
tokens=$((chars / 3))

echo "File: $(basename $FILE)"
echo "Lines: $lines"
echo "Characters: $chars"
echo "Estimated tokens: $tokens"
echo ""

# Evaluation based on 500-line standard and token count
if [ $lines -lt 500 ]; then
    if [ $tokens -lt 3000 ]; then
        echo "Status: ✅ 最適サイズ（行数・トークン共に良好）"
    else
        echo "Status: ⚠️ 行数は良好だがトークン多め（内容を圧縮検討）"
    fi
elif [ $lines -lt 550 ]; then
    echo "Status: ⚠️ 500行超過、分割を検討（目標: 500行以内）"
else
    echo "Status: ✗ 分割推奨（550行超過）"
fi

echo ""
echo "参考:"
echo "- 目標行数: <500行（推奨）、<550行（許容）"
echo "- 推定トークン/行: $((tokens / lines)) tokens/line"
