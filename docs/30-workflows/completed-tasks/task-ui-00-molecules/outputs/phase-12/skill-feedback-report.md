# スキルフィードバックレポート: TASK-UI-00-MOLECULES

## 目的

`task-specification-creator` / `aiworkflow-requirements` 運用を、実装完了タスクでも破綻しない形に改善する。

## 改善提案

| 観点          | 提案                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------- |
| Phase進行管理 | `complete-phase.js` 実行時に phase file のステータス/checkbox を自動更新するオプションを追加 |
| Coverage運用  | モノレポ全体閾値とスコープ閾値を切替できるテンプレートコマンドを標準化                       |
| Phase 11      | Playwright証跡テンプレートに「テーマ(light/dark) + mobile」の必須ケースを既定追加            |
| Phase 12      | `spec_created` と `completed` の更新先テーブルを分離し、誤同期を減らす                       |

## 本タスクで有効だった運用

1. 関心分離: コード実装レーンと文書同期レーンを分離
2. 並列実行: `lint/typecheck`、ドキュメント監査を並列化
3. 検証固定: `verify-all-specs` + `validate-phase-output` + `validate-phase11-screenshot-coverage` を固定セット化
