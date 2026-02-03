#!/bin/bash
# TASK-9B-A: skill-creator SKILL.md 拡充検証スクリプト
# Phase 6: テスト拡充 - 詳細な構造・内容・整合性検証

set -e

SKILL_FILE="$HOME/.aiworkflow/skills/skill-creator/SKILL.md"
ERRORS=0
PASS=0
WARNINGS=0

echo "=== SKILL.md 拡充検証スクリプト ==="
echo "対象: $SKILL_FILE"
echo ""

# ファイル存在確認（前提条件）
if [ ! -f "$SKILL_FILE" ]; then
  echo "❌ FATAL: SKILL.md が存在しません"
  exit 1
fi

# ============================================
# カテゴリ1: 詳細構造検証
# ============================================
echo "--- カテゴリ1: 詳細構造検証 ---"

# Test 1.1: name がハイフンケース形式
echo -n "[1.1] name がハイフンケース形式... "
NAME=$(grep "^name:" "$SKILL_FILE" | cut -d: -f2 | tr -d ' ')
if [[ "$NAME" =~ ^[a-z0-9-]+$ ]]; then
  echo "✅ PASS ($NAME)"
  ((PASS++))
else
  echo "❌ FAIL: '$NAME' はハイフンケースではありません"
  ((ERRORS++))
fi

# Test 1.2: description が複数行リテラル
echo -n "[1.2] description が複数行リテラル... "
if grep -q "^description: |" "$SKILL_FILE"; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL: description は '|' で始まる複数行リテラルである必要があります"
  ((ERRORS++))
fi

# Test 1.3: allowed-tools が配列形式
echo -n "[1.3] allowed-tools が配列形式... "
if grep -q "^allowed-tools:" "$SKILL_FILE" && \
   grep -A20 "^allowed-tools:" "$SKILL_FILE" | grep -q "  - "; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL: allowed-tools はYAML配列形式である必要があります"
  ((ERRORS++))
fi

echo ""

# ============================================
# カテゴリ2: description セクション詳細検証
# ============================================
echo "--- カテゴリ2: description セクション詳細検証 ---"

# Test 2.1: Anchors が3つ以上
echo -n "[2.1] Anchors が3つ以上... "
ANCHORS_SECTION=$(sed -n '/Anchors:/,/Trigger:/p' "$SKILL_FILE")
ANCHOR_COUNT=$(echo "$ANCHORS_SECTION" | grep -c "•" || echo "0")
if [ "$ANCHOR_COUNT" -ge 3 ]; then
  echo "✅ PASS ($ANCHOR_COUNT アンカー)"
  ((PASS++))
else
  echo "❌ FAIL: $ANCHOR_COUNT アンカー (3つ以上必要)"
  ((ERRORS++))
fi

# Test 2.2: Trigger に日英トリガーワード
echo -n "[2.2] Trigger に日英トリガーワード... "
TRIGGER_SECTION=$(sed -n '/Trigger:/,/^allowed-tools:/p' "$SKILL_FILE")
if echo "$TRIGGER_SECTION" | grep -qE "スキル作成|skill creation"; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL: Trigger に日英トリガーワードがありません"
  ((ERRORS++))
fi

echo ""

# ============================================
# カテゴリ3: 機能セクション詳細検証
# ============================================
echo "--- カテゴリ3: 機能セクション詳細検証 ---"

# Test 3.1: 各機能にH3ヘッダーが存在
echo -n "[3.1] 各機能にH3ヘッダー (###) が存在... "
H3_COUNT=$(grep -c "^### " "$SKILL_FILE" || echo "0")
if [ "$H3_COUNT" -ge 12 ]; then
  echo "✅ PASS ($H3_COUNT セクション)"
  ((PASS++))
else
  echo "❌ FAIL: $H3_COUNT セクション (12以上必要)"
  ((ERRORS++))
fi

# Test 3.2: 各機能に使用例が存在
echo -n "[3.2] 使用例 (**使用例:**) が存在... "
EXAMPLE_COUNT=$(grep -c "\*\*使用例:\*\*" "$SKILL_FILE" || echo "0")
if [ "$EXAMPLE_COUNT" -ge 10 ]; then
  echo "✅ PASS ($EXAMPLE_COUNT 使用例)"
  ((PASS++))
else
  echo "⚠️ WARNING: $EXAMPLE_COUNT 使用例 (推奨: 12)"
  ((WARNINGS++))
fi

echo ""

# ============================================
# カテゴリ4: 参照整合性検証
# ============================================
echo "--- カテゴリ4: 参照整合性検証 ---"

# Test 4.1: agents/ 参照パス形式
echo -n "[4.1] agents/ 参照パス形式 (agents/*.md)... "
INVALID_AGENT_PATH=false
while IFS= read -r line; do
  if [[ -n "$line" ]] && [[ ! "$line" =~ agents/[a-z-]+\.md ]]; then
    INVALID_AGENT_PATH=true
    echo ""
    echo "  ⚠️ 形式不正: $line"
  fi
done < <(grep -o "agents/[^ ]*" "$SKILL_FILE" | sort -u)
if [ "$INVALID_AGENT_PATH" = false ]; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "⚠️ WARNING: 一部パス形式が非標準"
  ((WARNINGS++))
fi

# Test 4.2: references/ 参照パス形式
echo -n "[4.2] references/ 参照パス形式 (references/*.md)... "
INVALID_REF_PATH=false
while IFS= read -r line; do
  if [[ -n "$line" ]] && [[ ! "$line" =~ references/[a-z-]+\.md ]]; then
    INVALID_REF_PATH=true
    echo ""
    echo "  ⚠️ 形式不正: $line"
  fi
done < <(grep -o "references/[^ ]*" "$SKILL_FILE" | sort -u)
if [ "$INVALID_REF_PATH" = false ]; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "⚠️ WARNING: 一部パス形式が非標準"
  ((WARNINGS++))
fi

echo ""

# ============================================
# カテゴリ5: 非機能要件検証
# ============================================
echo "--- カテゴリ5: 非機能要件検証 ---"

# Test 5.1: 500行以内
echo -n "[5.1] 500行以内 (NFR-001)... "
LINE_COUNT=$(wc -l < "$SKILL_FILE" | tr -d ' ')
if [ "$LINE_COUNT" -le 500 ]; then
  echo "✅ PASS ($LINE_COUNT 行)"
  ((PASS++))
else
  echo "❌ FAIL: $LINE_COUNT 行 (500行以内必要)"
  ((ERRORS++))
fi

# Test 5.2: ベストプラクティスセクション存在
echo -n "[5.2] ベストプラクティスセクション存在... "
if grep -q "## ベストプラクティス" "$SKILL_FILE"; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "⚠️ WARNING: ベストプラクティスセクションがありません"
  ((WARNINGS++))
fi

echo ""

# ============================================
# 結果サマリー
# ============================================
echo "=== 拡充検証結果 ==="
echo "PASS: $PASS"
echo "FAIL: $ERRORS"
echo "WARNING: $WARNINGS"

if [ "$ERRORS" -eq 0 ]; then
  echo "ステータス: ✅ GREEN (全必須テスト成功)"
  exit 0
else
  echo "ステータス: ❌ RED ($ERRORS 件の失敗)"
  exit 1
fi
