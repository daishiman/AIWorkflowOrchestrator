# セキュリティ契約監査

## 監査対象

- stream cancel
- context leak
- internal implementation wording
- persist revive

## 結果

- PASS: `abortStreaming()` は `cancelStream(requestId)` を経由する
- PASS: skill-lifecycle system prompt は internal planner/subagent 露出禁止を含む
- PASS: Workspace context は selected files/workspacePath のみを注入する
- PASS: model 未選択は送信を拒否し、曖昧な request を投げない

## 残リスク

- ChatHistoryView 側の履歴 API は本タスク未統合のため別監査が必要
