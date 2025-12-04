#!/bin/bash
# Claude Code 完了通知Hook（音声 + デスクトップ通知）
# イベント: Stop
# 目的: タスク完了時に音声とデスクトップ通知で知らせる

set -euo pipefail

# 標準入力からJSONを読み取り
INPUT=$(cat)

# macOSの場合のみ実行
if [[ "$(uname)" == "Darwin" ]]; then
  # デスクトップ通知（バックグラウンドでOK - 即時完了）
  osascript -e 'display notification "処理が完了しました" with title "Claude Code" sound name "Glass"' &

  # 効果音（短い音なのでバックグラウンドでOK）
  afplay /System/Library/Sounds/Glass.aiff &

  # 音声通知（フォアグラウンドで実行し、完了を待つ）
  # バックグラウンドにするとスクリプト終了時に中断される
  say "クロードコードの処理が完了しました"
fi

# Linuxの場合
if [[ "$(uname)" == "Linux" ]]; then
  # notify-sendがある場合
  if command -v notify-send &> /dev/null; then
    notify-send "Claude Code" "処理が完了しました" &
  fi

  # espeak/festival等がある場合
  if command -v espeak &> /dev/null; then
    espeak "Claude Code processing completed"
  fi
fi

exit 0
