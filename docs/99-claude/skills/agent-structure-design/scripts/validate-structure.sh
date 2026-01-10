#!/bin/bash

# validate-structure.sh
# エージェント構造の妥当性を検証するスクリプト
#
# 使用法:
#   ./validate-structure.sh <agent_file.md>
#
# 検証項目:
#   1. YAML Frontmatterの構文チェック
#   2. 必須フィールドの存在確認
#   3. 必須セクションの存在確認
#   4. ファイル構造の妥当性

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 引数チェック
if [ $# -eq 0 ]; then
    echo "使用法: $0 <agent_file.md>"
    exit 1
fi

AGENT_FILE="$1"

if [ ! -f "$AGENT_FILE" ]; then
    echo -e "${RED}エラー: ファイルが見つかりません: $AGENT_FILE${NC}"
    exit 1
fi

echo "=== エージェント構造検証 ==="
echo "対象ファイル: $AGENT_FILE"
echo ""

# 検証カウンター
ERRORS=0
WARNINGS=0

# 1. YAML Frontmatter構文チェック
echo "📝 [1/4] YAML Frontmatter構文チェック..."

# YAML Frontmatterの抽出
if grep -q "^---$" "$AGENT_FILE"; then
    # 最初の --- から2番目の --- までを抽出
    FRONTMATTER=$(sed -n '/^---$/,/^---$/p' "$AGENT_FILE" | sed '1d;$d')

    # YAMLパーサーで検証（yqが利用可能な場合）
    if command -v yq &> /dev/null; then
        echo "$FRONTMATTER" | yq eval '.' - > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}  ✓ YAML構文が正しいです${NC}"
        else
            echo -e "${RED}  ✗ YAML構文エラーが検出されました${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "${YELLOW}  ⚠ yqがインストールされていないため、YAML構文チェックをスキップ${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}  ✗ YAML Frontmatterが見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. 必須フィールドの存在確認
echo "🔍 [2/4] 必須フィールドの存在確認..."

# 必須フィールドリスト
REQUIRED_FIELDS=("name" "description" "tools" "model" "version")

for FIELD in "${REQUIRED_FIELDS[@]}"; do
    if grep -q "^$FIELD:" "$AGENT_FILE"; then
        VALUE=$(grep "^$FIELD:" "$AGENT_FILE" | head -1 | sed "s/^$FIELD: *//")
        echo -e "${GREEN}  ✓ $FIELD: $VALUE${NC}"
    else
        echo -e "${RED}  ✗ 必須フィールド '$FIELD' が見つかりません${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# toolsフィールドの妥当性チェック
if grep -q "^tools:" "$AGENT_FILE"; then
    TOOLS=$(grep "^tools:" "$AGENT_FILE" | sed 's/tools: *//')

    # 有効なツールリスト
    VALID_TOOLS=("Read" "Write" "Edit" "Grep" "Glob" "Bash" "Task" "MultiEdit" "TodoWrite")

    # 各ツールが有効かチェック
    for TOOL in $(echo "$TOOLS" | tr -d '[],' | tr ' ' '\n'); do
        if [[ " ${VALID_TOOLS[@]} " =~ " ${TOOL} " ]]; then
            :
        else
            echo -e "${YELLOW}  ⚠ 未知のツール: $TOOL${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
fi

# modelフィールドの妥当性チェック
if grep -q "^model:" "$AGENT_FILE"; then
    MODEL=$(grep "^model:" "$AGENT_FILE" | sed 's/model: *//')

    VALID_MODELS=("sonnet" "opus" "haiku")

    if [[ " ${VALID_MODELS[@]} " =~ " ${MODEL} " ]]; then
        :
    else
        echo -e "${YELLOW}  ⚠ 未知のモデル: $MODEL${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# versionフィールドのセマンティックバージョニングチェック
if grep -q "^version:" "$AGENT_FILE"; then
    VERSION=$(grep "^version:" "$AGENT_FILE" | sed 's/version: *//')

    if [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        :
    else
        echo -e "${YELLOW}  ⚠ バージョンがセマンティックバージョニング形式ではありません: $VERSION${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# 3. 必須セクションの存在確認
echo "📋 [3/4] 必須セクションの存在確認..."

# 必須セクションリスト
REQUIRED_SECTIONS=("## 役割" "## 専門分野" "## ワークフロー" "## ベストプラクティス")

for SECTION in "${REQUIRED_SECTIONS[@]}"; do
    if grep -q "^$SECTION" "$AGENT_FILE"; then
        echo -e "${GREEN}  ✓ セクションあり: $SECTION${NC}"
    else
        # 英語版もチェック
        EN_SECTION=$(echo "$SECTION" | sed 's/役割/Role/; s/専門分野/Specialties/; s/ワークフロー/Workflow/; s/ベストプラクティス/Best Practices/')
        if grep -q "^$EN_SECTION" "$AGENT_FILE"; then
            echo -e "${GREEN}  ✓ セクションあり: $EN_SECTION${NC}"
        else
            echo -e "${RED}  ✗ 必須セクションが見つかりません: $SECTION${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

# Phaseセクションのチェック
PHASE_COUNT=$(grep -c "^### Phase" "$AGENT_FILE" || echo "0")

if [ "$PHASE_COUNT" -ge 3 ] && [ "$PHASE_COUNT" -le 7 ]; then
    echo -e "${GREEN}  ✓ Phase数適切（$PHASE_COUNT 個）${NC}"
elif [ "$PHASE_COUNT" -gt 7 ]; then
    echo -e "${YELLOW}  ⚠ Phase数が多すぎます（$PHASE_COUNT 個）${NC}"
    WARNINGS=$((WARNINGS + 1))
elif [ "$PHASE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}  ⚠ Phase数が少ないです（$PHASE_COUNT 個）${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${RED}  ✗ Phaseセクションが見つかりません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 4. ファイル構造の妥当性
echo "📁 [4/4] ファイル構造の妥当性検証..."

# ファイルサイズチェック（推奨: 450-550行）
LINE_COUNT=$(wc -l < "$AGENT_FILE")

if [ "$LINE_COUNT" -ge 450 ] && [ "$LINE_COUNT" -le 550 ]; then
    echo -e "${GREEN}  ✓ ファイルサイズ適切（$LINE_COUNT 行）${NC}"
elif [ "$LINE_COUNT" -gt 550 ]; then
    echo -e "${YELLOW}  ⚠ ファイルが大きすぎます（$LINE_COUNT 行） - スキル分割を検討${NC}"
    WARNINGS=$((WARNINGS + 1))
elif [ "$LINE_COUNT" -lt 450 ]; then
    echo -e "${BLUE}  ℹ ファイルが小さめです（$LINE_COUNT 行）${NC}"
fi

# スキル参照のチェック
SKILL_REF_COUNT=$(grep -c "Skill(" "$AGENT_FILE" || echo "0")

if [ "$SKILL_REF_COUNT" -gt 0 ]; then
    echo -e "${GREEN}  ✓ スキル参照あり（$SKILL_REF_COUNT 個）${NC}"

    # 相対パスの使用を確認
    if grep "Skill(.claude/skills/" "$AGENT_FILE" > /dev/null; then
        echo -e "${GREEN}  ✓ 相対パス使用${NC}"
    else
        echo -e "${YELLOW}  ⚠ 絶対パスが使用されている可能性があります${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${BLUE}  ℹ スキル参照なし（スタンドアロンエージェント）${NC}"
fi

# 変更履歴の確認
if grep -q "## 変更履歴\|## Changelog" "$AGENT_FILE"; then
    echo -e "${GREEN}  ✓ 変更履歴セクションあり${NC}"
else
    echo -e "${YELLOW}  ⚠ 変更履歴セクションがありません${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 結果サマリー
echo ""
echo "=== 検証結果サマリー ==="
echo -e "ファイル: $AGENT_FILE"
echo -e "行数: $LINE_COUNT"
echo -e "エラー: ${RED}$ERRORS${NC}"
echo -e "警告: ${YELLOW}$WARNINGS${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "\n${GREEN}✓ すべての検証に合格しました${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "\n${YELLOW}⚠ 警告がありますが、致命的ではありません${NC}"
    exit 0
else
    echo -e "\n${RED}✗ エラーが検出されました。修正が必要です${NC}"
    exit 1
fi
