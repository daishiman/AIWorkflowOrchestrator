#!/bin/bash
# Claude Code セッション初期化Hook
# イベント: SessionStart
# 目的: セッション開始時の環境設定とコンテキスト準備

set -euo pipefail

# プロジェクトディレクトリ
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# セッションログ
LOG_DIR="${HOME}/.claude/logs"
mkdir -p "$LOG_DIR"

SESSION_LOG="${LOG_DIR}/sessions.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# セッション開始をログに記録
echo "${TIMESTAMP} | SESSION_START | ${PROJECT_DIR}" >> "$SESSION_LOG"

# Node.js環境の確認（pnpm優先）
if [[ -f "$PROJECT_DIR/package.json" ]]; then
  cd "$PROJECT_DIR"

  # pnpmが利用可能か確認
  if command -v pnpm &> /dev/null; then
    # node_modulesが存在しない場合は通知
    if [[ ! -d "node_modules" ]]; then
      echo "📦 node_modules が見つかりません。'pnpm install' を実行してください。"
    fi
  fi
fi

# Python環境の確認
if [[ -f "$PROJECT_DIR/pyproject.toml" || -f "$PROJECT_DIR/requirements.txt" ]]; then
  # 仮想環境の確認
  if [[ ! -d "$PROJECT_DIR/.venv" && ! -d "$PROJECT_DIR/venv" ]]; then
    echo "🐍 Python仮想環境が見つかりません。仮想環境の作成を検討してください。"
  fi
fi

# Git状態の簡易チェック
if [[ -d "$PROJECT_DIR/.git" ]]; then
  cd "$PROJECT_DIR"
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  CHANGES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  echo "🌿 Git: ブランチ=${BRANCH}, 未コミット変更=${CHANGES}件"
fi

exit 0
