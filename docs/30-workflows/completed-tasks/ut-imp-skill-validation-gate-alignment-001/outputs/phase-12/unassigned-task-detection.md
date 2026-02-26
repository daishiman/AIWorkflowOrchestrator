# 未タスク検出レポート

## タスクID

UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001

## 検出結果サマリー

| ソース                               | 検出件数 | 判定                                                                                                                  |
| ------------------------------------ | -------: | --------------------------------------------------------------------------------------------------------------------- |
| Phase 3 MINOR 指摘                   |        3 | Phase 5で設計対応済み（新規未タスクなし）                                                                             |
| Phase 10 MINOR 指摘                  |        2 | 未タスク化済み（BOM UTF-8、空フィールドガード）                                                                       |
| Phase 11 発見事項                    |        0 | 新規未タスクなし                                                                                                      |
| コードコメント（指定3ファイル）      |        0 | TODO/FIXME/HACK/XXX なし（`phase-11-12-guide.md` の `# TODO/FIXMEスキャン` は見出しテキストであり実タスク化不要）     |
| skipされたテスト                     |        2 | TC-WC-NEW-001/002: 既存タスク `UT-IMP-SKILL-QUICK-VALIDATE-WARNING-BASELINE-CONTROL-001` のスコープ内（重複起票不要） |
| detect-unassigned raw（scripts配下） |        4 | 既存TODO（baseline）                                                                                                  |

## Phase 10 MINOR由来の未タスク

| 未タスクID                                  | ファイル                                                                             | 配置 | フォーマット監査        |
| ------------------------------------------- | ------------------------------------------------------------------------------------ | ---- | ----------------------- |
| UT-IMP-QUICK-VALIDATE-BOM-UTF8-001          | `docs/30-workflows/unassigned-task/task-imp-quick-validate-bom-utf8-001.md`          | OK   | target-file `current=0` |
| UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 | `docs/30-workflows/unassigned-task/task-imp-quick-validate-empty-field-guard-001.md` | OK   | target-file `current=0` |

## 3ステップ実施結果（P3対策）

| ステップ                 | 結果                                                            |
| ------------------------ | --------------------------------------------------------------- |
| 1. 指示書作成/配置       | 完了（2件とも `docs/30-workflows/unassigned-task/`）            |
| 2. task-workflow.md 登録 | 完了（残課題テーブルに2件登録済み）                             |
| 3. 関連仕様書リンク追加  | 完了（`spec-update-workflow.md` の既知制限事項に2件リンク済み） |

## current / baseline 分離

- 差分監査（`--diff-from HEAD`）: `current=0`, `baseline=73`
- 全体監査（scopeなし）: 73件（既存負債）

## skipされたテストの管理

| テストID      | テスト内容                                                               | 対応する既存タスク                                       | 判定                                 |
| ------------- | ------------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------ |
| TC-WC-NEW-001 | Warning 出力に severity レベル（warning-known/warning-action）が含まれる | UT-IMP-SKILL-QUICK-VALIDATE-WARNING-BASELINE-CONTROL-001 | 既存タスクのスコープ内。重複起票不要 |
| TC-WC-NEW-002 | Warning 分類の集計サマリが出力される                                     | UT-IMP-SKILL-QUICK-VALIDATE-WARNING-BASELINE-CONTROL-001 | 既存タスクのスコープ内。重複起票不要 |

備考: TC-WC-NEW-001/002 は `quick_validate.js` への Warning severity 分類出力機能の追加を前提としたテストケースであり、`UT-IMP-SKILL-QUICK-VALIDATE-WARNING-BASELINE-CONTROL-001`（`docs/30-workflows/unassigned-task/task-imp-skill-quick-validate-warning-baseline-control-001.md`）の Phase 5 で実装される際に `.skip` を解除する。

## 結論

- 新規に追加で起票すべき未タスク: **0件**
- 既知2件（Phase 10 MINOR）について、配置・参照・フォーマット整合を是正済み。
- skipテスト2件（TC-WC-NEW-001/002）は既存タスク `UT-IMP-SKILL-QUICK-VALIDATE-WARNING-BASELINE-CONTROL-001` のスコープ内であり、重複起票不要。
