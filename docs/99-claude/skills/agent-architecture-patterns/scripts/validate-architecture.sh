#!/bin/bash

# validate-architecture.sh
# エージェントアーキテクチャの妥当性を検証するスクリプト
#
# 使用法:
#   ./validate-architecture.sh <agent_file.md>
#
# 検証項目:
#   1. アーキテクチャパターンの一貫性
#   2. 循環依存の検出
#   3. 単一責任原則の遵守
#   4. 依存関係の妥当性

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

echo "=== エージェントアーキテクチャ検証 ==="
echo "対象ファイル: $AGENT_FILE"
echo ""

# 検証カウンター
ERRORS=0
WARNINGS=0

# 1. アーキテクチャパターンの検出
echo "📐 [1/4] アーキテクチャパターンの検出..."

if grep -q "orchestrator\|オーケストレーター" "$AGENT_FILE"; then
    echo -e "${GREEN}  ✓ Orchestrator-Worker パターン検出${NC}"
    PATTERN="orchestrator"
elif grep -q "pipeline\|パイプライン" "$AGENT_FILE"; then
    echo -e "${GREEN}  ✓ Pipeline パターン検出${NC}"
    PATTERN="pipeline"
elif grep -q "hub-and-spoke\|ハブアンドスポーク" "$AGENT_FILE"; then
    echo -e "${GREEN}  ✓ Hub-and-Spoke パターン検出${NC}"
    PATTERN="hub-and-spoke"
elif grep -q "state-machine\|状態機械" "$AGENT_FILE"; then
    echo -e "${GREEN}  ✓ State Machine パターン検出${NC}"
    PATTERN="state-machine"
else
    echo -e "${YELLOW}  ⚠ アーキテクチャパターンが明示されていません${NC}"
    WARNINGS=$((WARNINGS + 1))
    PATTERN="unknown"
fi

# 2. 循環依存の検出
echo "🔄 [2/4] 循環依存の検出..."

# エージェント名を取得
AGENT_NAME=$(grep "^name:" "$AGENT_FILE" | head -1 | sed 's/name: *//')

# 依存エージェントリストを抽出
DEPS=$(grep -E "Task\(|Skill\(|Agent\(" "$AGENT_FILE" | grep -oE '\([^)]+\)' | tr -d '()' || true)

if [ -n "$DEPS" ]; then
    # 各依存先をチェック
    for DEP in $DEPS; do
        if [ -f "$DEP" ]; then
            # 依存先が自分自身を依存していないかチェック
            if grep -q "$AGENT_NAME" "$DEP" 2>/dev/null; then
                echo -e "${RED}  ✗ 循環依存検出: $AGENT_NAME ⇄ $DEP${NC}"
                ERRORS=$((ERRORS + 1))
            fi
        fi
    done

    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}  ✓ 循環依存なし${NC}"
    fi
else
    echo -e "${GREEN}  ✓ 依存関係なし（スタンドアロン）${NC}"
fi

# 3. 単一責任原則の検証
echo "📋 [3/4] 単一責任原則の検証..."

# "役割"セクションの数をカウント
ROLE_COUNT=$(grep -c "^## 役割\|^## Role" "$AGENT_FILE" || echo "0")

if [ "$ROLE_COUNT" -eq 1 ]; then
    echo -e "${GREEN}  ✓ 単一責任原則を遵守${NC}"
elif [ "$ROLE_COUNT" -eq 0 ]; then
    echo -e "${RED}  ✗ 役割セクションが定義されていません${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${YELLOW}  ⚠ 複数の役割が定義されています（$ROLE_COUNT 個）${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Phase数をチェック（3-7が推奨）
PHASE_COUNT=$(grep -c "^### Phase" "$AGENT_FILE" || echo "0")

if [ "$PHASE_COUNT" -ge 3 ] && [ "$PHASE_COUNT" -le 7 ]; then
    echo -e "${GREEN}  ✓ Phase数適切（$PHASE_COUNT 個）${NC}"
elif [ "$PHASE_COUNT" -gt 7 ]; then
    echo -e "${YELLOW}  ⚠ Phase数が多すぎます（$PHASE_COUNT 個）- 分割を検討${NC}"
    WARNINGS=$((WARNINGS + 1))
elif [ "$PHASE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}  ⚠ Phase数が少ないです（$PHASE_COUNT 個）${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 4. 依存関係の妥当性
echo "🔗 [4/4] 依存関係の妥当性検証..."

# tools の検証
if grep -q "^tools:" "$AGENT_FILE"; then
    TOOLS=$(grep "^tools:" "$AGENT_FILE" | sed 's/tools: *//')
    echo -e "${GREEN}  ✓ ツール定義あり: $TOOLS${NC}"

    # パターンごとの推奨ツールチェック
    if [ "$PATTERN" = "orchestrator" ]; then
        if ! echo "$TOOLS" | grep -q "Task"; then
            echo -e "${YELLOW}  ⚠ Orchestratorパターンには Task ツールが推奨されます${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    echo -e "${RED}  ✗ ツール定義がありません${NC}"
    ERRORS=$((ERRORS + 1))
fi

# スキル依存の検証
SKILL_DEPS=$(grep -c "Skill(" "$AGENT_FILE" || echo "0")
if [ "$SKILL_DEPS" -gt 0 ]; then
    echo -e "${GREEN}  ✓ スキル依存あり（$SKILL_DEPS 個）${NC}"
else
    echo -e "${YELLOW}  ⚠ スキル依存なし - プログレッシブディスクロージャーを検討${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 結果サマリー
echo ""
echo "=== 検証結果サマリー ==="
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
