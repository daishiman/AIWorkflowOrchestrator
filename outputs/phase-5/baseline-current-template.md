# baseline / current 分離記録テンプレート

## 監査結果分類

### baseline（既存課題・スコープ外）

| 検出内容                 | 該当ファイル                            | 対応方針   |
| ------------------------ | --------------------------------------- | ---------- |
| 例: 既存フォーマット違反 | docs/30-workflows/unassigned-task/\*.md | 別タスク化 |

### current（今回修正必須）

| 検出内容         | 該当ファイル     | 修正内容   | 修正完了 |
| ---------------- | ---------------- | ---------- | -------- |
| 例: 新規参照切れ | task-workflow.md | 参照先更新 | [ ]      |

### 最終判定

`audit-unassigned-tasks: 全体 <PASS/FAIL>（baseline: N件, current: M件）→ current <PASS/FAIL>`
