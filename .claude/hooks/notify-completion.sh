#!/bin/bash
# Claude Code 完了通知Hook（音声 + デスクトップ通知）
# イベント: Stop
# 目的: タスク完了時に音声とデスクトップ通知で知らせる

set -euo pipefail

# 標準入力からJSONを読み取り
INPUT=$(cat)

# macOSの場合のみ実行
if [[ "$(uname)" == "Darwin" ]]; then
  # 音声通知
  say "クロードコードの処理が完了しました" &

  # 効果音（オプション）
  afplay /System/Library/Sounds/Glass.aiff &

  # デスクトップ通知
  osascript -e 'display notification "処理が完了しました" with title "Claude Code" sound name "Glass"' &
fi

# Linuxの場合
if [[ "$(uname)" == "Linux" ]]; then
  # notify-sendがある場合
  if command -v notify-send &> /dev/null; then
    notify-send "Claude Code" "処理が完了しました" &
  fi

  # espeak/festival等がある場合
  if command -v espeak &> /dev/null; then
    espeak "Claude Code processing completed" &
  fi
fi

exit 0
