#!/bin/bash
# TASK-9B-A: skill-creator SKILL.md 検証スクリプト
# Phase 4: TDD Red - この時点でテストは失敗することを期待

set -e

SKILL_FILE="$HOME/.aiworkflow/skills/skill-creator/SKILL.md"
ERRORS=0
PASS=0

echo "=== SKILL.md 検証スクリプト ==="
echo "対象: $SKILL_FILE"
echo ""

# ============================================
# Test 1: ファイル存在確認
# ============================================
echo -n "[Test 1] ファイル存在確認... "
if [ -f "$SKILL_FILE" ]; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL: ファイルが存在しません"
  ((ERRORS++))
  echo "=== 検証結果 ==="
  echo "PASS: $PASS"
  echo "FAIL: $ERRORS"
  echo "ステータス: RED (SKILL.md未作成)"
  exit 1
fi

# ============================================
# Test 2: YAML Frontmatter 必須フィールド
# ============================================
echo -n "[Test 2] YAML Frontmatter 必須フィールド... "
if grep -q "^name:" "$SKILL_FILE" && \
   grep -q "^description:" "$SKILL_FILE" && \
   grep -q "^allowed-tools:" "$SKILL_FILE"; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL: name/description/allowed-tools が不足"
  ((ERRORS++))
fi

# ============================================
# Test 3: name がハイフンケース
# ============================================
echo -n "[Test 3] name がハイフンケース (skill-creator)... "
if grep -q "^name: skill-creator" "$SKILL_FILE"; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL: name が 'skill-creator' ではありません"
  ((ERRORS++))
fi

# ============================================
# Test 4: allowed-tools 9ツール確認
# ============================================
echo -n "[Test 4] allowed-tools 9ツール確認... "
TOOLS_OK=true
for tool in Read Write Edit Glob Grep Bash Task WebFetch AskUserQuestion; do
  if ! grep -q "  - $tool" "$SKILL_FILE"; then
    echo ""
    echo "  ❌ Missing tool: $tool"
    TOOLS_OK=false
  fi
done
if [ "$TOOLS_OK" = true ]; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL"
  ((ERRORS++))
fi

# ============================================
# Test 5: 12機能の存在確認
# ============================================
echo -n "[Test 5] 12機能セクション確認... "
FEATURES_OK=true
# chat は "/skill-creator`" または "/skill-creator chat" でマッチ
if ! grep -qiE "/skill-creator\`|/skill-creator chat" "$SKILL_FILE"; then
  echo ""
  echo "  ❌ Missing feature: chat"
  FEATURES_OK=false
fi
for feature in api improve execute use chain fork share schedule debug docs stats; do
  if ! grep -qi "/skill-creator $feature" "$SKILL_FILE"; then
    echo ""
    echo "  ❌ Missing feature: $feature"
    FEATURES_OK=false
  fi
done
if [ "$FEATURES_OK" = true ]; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL"
  ((ERRORS++))
fi

# ============================================
# Test 6: agents/ 参照5つ以上
# ============================================
echo -n "[Test 6] agents/ 参照5つ以上... "
AGENT_COUNT=$(grep -c "agents/" "$SKILL_FILE" || echo "0")
if [ "$AGENT_COUNT" -ge 5 ]; then
  echo "✅ PASS ($AGENT_COUNT 参照)"
  ((PASS++))
else
  echo "❌ FAIL: $AGENT_COUNT 参照 (5つ以上必要)"
  ((ERRORS++))
fi

# ============================================
# Test 7: references/ 参照4つ以上
# ============================================
echo -n "[Test 7] references/ 参照4つ以上... "
REF_COUNT=$(grep -c "references/" "$SKILL_FILE" || echo "0")
if [ "$REF_COUNT" -ge 4 ]; then
  echo "✅ PASS ($REF_COUNT 参照)"
  ((PASS++))
else
  echo "❌ FAIL: $REF_COUNT 参照 (4つ以上必要)"
  ((ERRORS++))
fi

# ============================================
# Test 8: Anchors セクション存在
# ============================================
echo -n "[Test 8] Anchors セクション存在... "
if grep -q "Anchors:" "$SKILL_FILE"; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL: Anchors セクションがありません"
  ((ERRORS++))
fi

# ============================================
# Test 9: Trigger セクション存在
# ============================================
echo -n "[Test 9] Trigger セクション存在... "
if grep -q "Trigger:" "$SKILL_FILE"; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL: Trigger セクションがありません"
  ((ERRORS++))
fi

# ============================================
# 結果サマリー
# ============================================
echo ""
echo "=== 検証結果 ==="
echo "PASS: $PASS"
echo "FAIL: $ERRORS"

if [ "$ERRORS" -eq 0 ]; then
  echo "ステータス: ✅ GREEN (全テスト成功)"
  exit 0
else
  echo "ステータス: ❌ RED ($ERRORS 件の失敗)"
  exit 1
fi
