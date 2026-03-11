# Phase 12 スキルフィードバック

## 対象別フィードバック

| 対象                         | 反映済み | フィードバック                                                                                                                                                                                                                            |
| ---------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `task-specification-creator` | はい     | Phase 12 では workflow root 文書の stale 記述も outputs と同じ優先度で同期する必要がある。`spec_created` のまま残ると Phase 完了判定を誤らせるため、変更履歴と LOGS に今回のケースを記録した                                              |
| `task-specification-creator` | はい     | `validate-phase11-screenshot-coverage` は `証跡/スクリーンショット` 列名と `phase-11-manual-test.md` の `テストケース` / `画面カバレッジマトリクス` を前提にする。Phase 11 成果物テンプレート側でこの列名をより強く固定すると再発しにくい |
| `aiworkflow-requirements`    | はい     | Notification 系は `Notification / History Domain` に実装の第1版、058e に UX 追補が分かれている。`notification:delete`、`お知らせ`、Portal、Bell utility action、live region などで再検索しやすいよう、正本側へ 058e 補足を同期した        |

## 次回改善候補

| 対象                         | 候補                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `task-specification-creator` | Step 1-B の例に「workflow root の `index.md` / traceability / verification-report 同期」を明示すると stale 本文を見落としにくい      |
| `task-specification-creator` | Phase 11 テンプレートに `証跡` 列と `画面カバレッジマトリクス` の必須見出しを固定すると coverage validator の false start を減らせる |
| `aiworkflow-requirements`    | NotificationCenter のように既存ドメイン実装へ UX 追補が重なる機能は、完了タスク節に「追補 workflow」欄を標準化すると探索しやすい     |

## 判定

- blocking feedback: なし
- documentation-only feedback: 2件
- 即時の追加未タスク化: 不要
