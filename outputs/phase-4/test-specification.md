# Phase 4 テスト仕様書

- タスクID: UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
- 作成日: 2026-02-25
- 担当SubAgent: SubAgent-B

## 検証シナリオ

| シナリオID | シナリオ名              | 検証手段                     | 期待出力          | 判定基準                |
| ---------- | ----------------------- | ---------------------------- | ----------------- | ----------------------- |
| VS-001     | 未タスク参照リンク整合  | `verify-unassigned-links.js` | `ALL_LINKS_EXIST` | exit code 0 / missing 0 |
| VS-002     | topic-map索引再生成     | `generate-index.js`          | 再生成成功        | 実行成功、差分確認可能  |
| VS-003     | task-workflow参照先実在 | `grep + test -f`             | `MISSING:` 0件    | 参照先全件実在          |
| VS-004     | SKILL validator有効判定 | `quick_validate.py`          | `Skill is valid!` | 2スキル PASS            |
| VS-005     | 3点同期検証可能性       | `grep -c TASK_ID`            | 5ファイル件数出力 | コマンド正常実行        |

## 検証結果テンプレート

| TC-ID  | 実行日時 | 実行者 | 結果 | ログ要約 | 備考 |
| ------ | -------- | ------ | ---- | -------- | ---- |
| TC-001 |          |        |      |          |      |
| TC-002 |          |        |      |          |      |
| TC-003 |          |        |      |          |      |
| TC-004 |          |        |      |          |      |
| TC-005 |          |        |      |          |      |
| TC-006 |          |        |      |          |      |
