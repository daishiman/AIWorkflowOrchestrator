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

  # 音声通知（独立プロセスとして実行）
  # nohup + & + disown で親プロセス終了後も継続実行
  # 出力を /dev/null にリダイレクトして nohup.out 作成を防止
  nohup say "クロードコードの処理が完了しました" > /dev/null 2>&1 &
  disown
fi

# Linuxの場合
if [[ "$(uname)" == "Linux" ]]; then
  # notify-sendがある場合
  if command -v notify-send &> /dev/null; then
    notify-send "Claude Code" "処理が完了しました" &
  fi

  # espeak/festival等がある場合（独立プロセスとして実行）
  if command -v espeak &> /dev/null; then
    nohup espeak -v ja "クロードコードの処理が完了しました" > /dev/null 2>&1 &
    disown
  fi
fi

exit 0
