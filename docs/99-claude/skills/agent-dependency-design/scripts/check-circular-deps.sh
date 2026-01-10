#!/bin/bash

# check-circular-deps.sh
# エージェント間の循環依存を検出するスクリプト
#
# 使用法:
#   ./check-circular-deps.sh <agent_file.md>
#
# 検出項目:
#   1. 直接循環（A → B → A）
#   2. 間接循環（A → B → C → A）
#   3. 自己参照（A → A）

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

echo "=== 循環依存検出 ==="
echo "対象ファイル: $AGENT_FILE"
echo ""

# エージェント名を取得
AGENT_NAME=$(grep "^name:" "$AGENT_FILE" | head -1 | sed 's/name: *//')

if [ -z "$AGENT_NAME" ]; then
    echo -e "${RED}エラー: エージェント名が見つかりません${NC}"
    exit 1
fi

echo "エージェント名: $AGENT_NAME"
echo ""

# 検証カウンター
ERRORS=0
WARNINGS=0

# 訪問済みノードを追跡する配列
declare -A visited

# 現在のパスを追跡する配列
declare -a path

# 依存関係を抽出する関数
extract_dependencies() {
    local file="$1"

    # Task(), Skill(), Agent()呼び出しから依存先を抽出
    grep -oE 'Task\([^)]+\)|Skill\([^)]+\)|Agent\([^)]+\)' "$file" 2>/dev/null | \
        grep -oE '\([^)]+\)' | \
        tr -d '()' | \
        while IFS= read -r dep; do
            # ファイルパスからエージェント名を抽出
            if [[ $dep == *.md ]]; then
                basename "$dep" .md
            fi
        done
}

# 循環依存を検出する再帰関数
check_circular() {
    local agent="$1"
    local depth="${2:-0}"

    # 最大深度チェック（無限ループ防止）
    if [ "$depth" -gt 20 ]; then
        echo -e "${YELLOW}  ⚠ 深度制限に達しました（depth=$depth）${NC}"
        return
    fi

    # 現在のパスに追加
    path+=("$agent")

    # エージェントファイルを探す
    local agent_file=""
    if [ -f ".claude/agents/$agent.md" ]; then
        agent_file=".claude/agents/$agent.md"
    elif [ -f "$agent" ]; then
        agent_file="$agent"
    fi

    if [ -z "$agent_file" ]; then
        return
    fi

    # 依存関係を取得
    local deps=$(extract_dependencies "$agent_file")

    for dep in $deps; do
        # 1. 自己参照チェック
        if [ "$dep" = "$agent" ]; then
            echo -e "${RED}  ✗ 自己参照検出: $agent → $agent${NC}"
            ERRORS=$((ERRORS + 1))
            continue
        fi

        # 2. 直接循環チェック（A → B → A）
        if [ "$dep" = "$AGENT_NAME" ]; then
            echo -e "${RED}  ✗ 直接循環検出: $AGENT_NAME → ... → $dep${NC}"
            echo -e "     パス: ${path[*]} → $dep"
            ERRORS=$((ERRORS + 1))
            continue
        fi

        # 3. 間接循環チェック（パス内に既に存在するか）
        for p in "${path[@]}"; do
            if [ "$p" = "$dep" ]; then
                echo -e "${RED}  ✗ 間接循環検出: $AGENT_NAME → ... → $dep → ...${NC}"
                echo -e "     パス: ${path[*]} → $dep"
                ERRORS=$((ERRORS + 1))
                continue 2
            fi
        done

        # まだ訪問していない場合、再帰的にチェック
        if [ -z "${visited[$dep]}" ]; then
            visited[$dep]=1
            check_circular "$dep" $((depth + 1))
            unset 'visited[$dep]'
        fi
    done

    # パスから削除
    unset 'path[-1]'
}

# メイン検証
echo "📊 [1/3] 依存関係の抽出..."

DEPS=$(extract_dependencies "$AGENT_FILE")

if [ -z "$DEPS" ]; then
    echo -e "${GREEN}  ✓ 依存関係なし（スタンドアロン）${NC}"
    echo ""
    echo "=== 検証結果サマリー ==="
    echo -e "${GREEN}✓ 循環依存は検出されませんでした${NC}"
    exit 0
fi

echo "依存先:"
for dep in $DEPS; do
    echo "  - $dep"
done

echo ""
echo "🔍 [2/3] 循環依存のチェック..."

# 初回訪問マーク
visited[$AGENT_NAME]=1

# 循環依存チェック実行
check_circular "$AGENT_NAME" 0

# 結果
echo ""
echo "📋 [3/3] 依存関係グラフ..."

# 依存関係の深度1のみを表示
echo "$AGENT_NAME"
for dep in $DEPS; do
    echo "  └─→ $dep"

    # 依存先の依存（深度2）
    local dep_file=""
    if [ -f ".claude/agents/$dep.md" ]; then
        dep_file=".claude/agents/$dep.md"
    fi

    if [ -n "$dep_file" ]; then
        local sub_deps=$(extract_dependencies "$dep_file")
        for sub_dep in $sub_deps; do
            echo "      └─→ $sub_dep"
        done
    fi
done

# 結果サマリー
echo ""
echo "=== 検証結果サマリー ==="
echo -e "エラー: ${RED}$ERRORS${NC}"
echo -e "警告: ${YELLOW}$WARNINGS${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "\n${GREEN}✓ 循環依存は検出されませんでした${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "\n${YELLOW}⚠ 警告がありますが、致命的ではありません${NC}"
    exit 0
else
    echo -e "\n${RED}✗ 循環依存が検出されました。修正が必要です${NC}"
    echo ""
    echo "推奨される解決策:"
    echo "  1. 依存の削減: 不要な依存を削除"
    echo "  2. 依存の反転: 依存方向を逆転"
    echo "  3. 中間層の導入: 仲介エージェントを追加"
    exit 1
fi
