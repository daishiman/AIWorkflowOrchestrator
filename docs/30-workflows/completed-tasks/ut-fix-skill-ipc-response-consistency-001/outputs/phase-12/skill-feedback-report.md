# スキルフィードバックレポート（Phase 12）

## 対象

- `task-specification-creator`
- `aiworkflow-requirements`

## フィードバック

1. IPC契約表の「Main返却形 / Preload適用API」を標準列にするべき

- 今回、`execute` と `remove` のズレはこの2列が別管理だったことが原因。

2. `verify-all-specs` の出力保存オプションがあると追跡しやすい

- 現状は JSON 出力を手動転記する必要がある。

3. Phase 12 で「変更予定」ではなく「実変更ファイル」を必須化すべき

- 実装ガイドの品質差分（予定/実績）を防げる。

4. 完了済み未タスク移管時の参照更新を自動チェック化すべき

- `task-workflow.md` と `interfaces-agent-sdk-skill.md` の `unassigned-task` 参照が残ると `verify-unassigned-links` が失敗する。

5. Phase 12 必須成果物に `spec-update-summary.md` を機械検証で必須化すべき

- 出力漏れが発生しやすく、再監査での手戻り要因になりやすい。

## 実装時に有効だった点

- `validate-phase-output` + `verify-all-specs --strict` の二重検証は有効。
- 参照仕様（`interfaces-agent-sdk-skill.md`, `security-skill-ipc.md`）の明示指定により更新漏れを抑制できた。
