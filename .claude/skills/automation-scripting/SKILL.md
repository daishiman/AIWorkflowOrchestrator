---
name: automation-scripting
description: |
  ## 概要
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/automation-scripting/resources/script-patterns.md`: スクリプトパターン集

  専門分野:
  - (要追加)

  使用タイミング:
  - (要追加)

  Use proactively when (要追加).
version: 1.0.0
---

# 自動化スクリプティング

## 概要
開発タスクの自動化に必要なスクリプティングパターンとベストプラクティス

## 核心概念

### 1. スクリプトの役割
- 反復的な手作業の自動化
- CI/CDパイプラインの実装
- 環境セットアップの標準化

### 2. スクリプト言語の選択
| 用途 | 言語 | 理由 |
|------|------|------|
| Gitフック | Bash | 標準搭載 |
| ビルド | Node.js/pnpm | フロントエンドエコシステム |
| データ処理 | Python | 豊富なライブラリ |
| システム管理 | Bash | OS統合 |

### 3. スクリプト設計の原則
- 単一責任: 1スクリプト = 1タスク
- 冪等性: 何度実行しても同じ結果
- 可視性: エラー出力は明確に
- テスト可能性: 関数化・モジュール化

## 設計パターン

### パターン1: チェック・実行・検証
```bash
#!/bin/bash
# 前提条件チェック → 処理実行 → 結果検証

# チェック
if [ ! -d "src" ]; then
  echo "Error: src directory not found"
  exit 1
fi

# 実行
pnpm run build

# 検証
if [ ! -f "dist/index.js" ]; then
  echo "Error: Build output not found"
  exit 1
fi
```

### パターン2: エラーハンドリング
```bash
#!/bin/bash
set -euo pipefail  # 厳密モード
trap 'echo "Error on line $LINENO"' ERR

# エラー発生時も実行
cleanup() {
  rm -f temp_file
  pkill -P $$ || true
}
trap cleanup EXIT
```

### パターン3: 並列実行
```bash
#!/bin/bash
# 複数のタスクを並列化

task1 &
PID1=$!

task2 &
PID2=$!

wait $PID1 $PID2
echo "All tasks completed"
```

## 実装パターン

### パターン1: ビルドスクリプト
```bash
#!/bin/bash
# 自動ビルド・最適化

pnpm run clean
pnpm run build
pnpm run optimize
pnpm run test
```

### パターン2: デプロイスクリプト
```bash
#!/bin/bash
# 本番環境へのデプロイ自動化

check_branch
run_tests
build_production
backup_current
deploy_new
verify_deployment
```

### パターン3: セットアップスクリプト
```bash
#!/bin/bash
# 開発環境の初期化

install_dependencies
configure_git_hooks
setup_database
generate_env_file
```

## 関連スキル

- `.claude/skills/git-hooks-concepts/SKILL.md`: Gitフック統合
- `.claude/skills/linting-formatting-automation/SKILL.md`: コード品質自動化
- `.claude/skills/approval-gates/SKILL.md`: 承認プロセス自動化

## 参照リソース

### 詳細リソース
- `.claude/skills/automation-scripting/resources/script-patterns.md`: スクリプトパターン集
- `.claude/skills/automation-scripting/resources/error-handling.md`: エラーハンドリング

### テンプレート
- `.claude/skills/automation-scripting/templates/generic-script-template.sh`: 汎用スクリプト
- `.claude/skills/automation-scripting/templates/parallel-runner-template.sh`: 並列実行テンプレート

### スクリプト
- `.claude/skills/automation-scripting/scripts/validate-scripts.mjs`: スクリプト検証ツール
