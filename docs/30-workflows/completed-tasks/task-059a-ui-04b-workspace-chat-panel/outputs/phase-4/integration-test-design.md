# Phase 4 統合テスト設計

## シナリオ

1. ファイル選択 → 背景情報添付 → 送信 → stream完了 → conversation保存
2. mention選択 → 自動添付 → preview表示
3. stream error 受信時の alert 表示

## モック戦略

- `window.electronAPI.file.*`
- `window.electronAPI.llm.*`
- `window.conversationAPI.*`
- store hooks の selector mock
