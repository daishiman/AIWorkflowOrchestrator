# 設計上の問題点と解決策一覧

| 問題点                                     | 重大度 | 解決策                                                  |
| ------------------------------------------ | ------ | ------------------------------------------------------- |
| alias の相対パス指定では不安定な場合がある | MINOR  | `path.resolve(__dirname, ...)` で絶対パスに修正         |
| ウィザード起動 UI のセレクターが未確認     | MINOR  | Phase 4 実装開始前に `SkillCreateWizard.tsx` を確認     |
| ConversationRoundStep スキップボタン未確認 | MINOR  | Phase 4 実装開始前に `ConversationRoundStep.tsx` を確認 |

## 解決策適用状況: 全件解消（Phase 5 実装時に対応）
