# カバレッジ補完計画

1. 変更範囲判定は current 差分のテスト結果を正本にする
2. global threshold 未達は baseline 改善タスクとして別管理する
3. 追加回帰が必要になった場合は `aiHandlers` / `llmSlice` のエッジ分岐を優先
