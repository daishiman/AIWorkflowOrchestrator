# Phase 11 Manual Test Checklist

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| Phase    | 11                                   |
| タイプ   | docs-only / NON_VISUAL               |
| 実施対象 | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 |

## チェック一覧

| TC-ID | 実施内容                           | evidence                                             | 判定 | 備考                        |
| ----- | ---------------------------------- | ---------------------------------------------------- | ---- | --------------------------- |
| TC-01 | Task/Step 分離の確認               | `phase-spec-template.md`                             | PASS | plan と current fact を分離 |
| TC-02 | docs-only evidence ルール確認      | `phase-spec-template.md` / `phase-11-manual-test.md` | PASS | screenshot 不要             |
| TC-03 | Phase 12 root evidence 確認        | `phase12-task-spec-compliance-check.md`              | PASS | root evidence 必須          |
| TC-04 | 可読性確認                         | `phase-spec-template.md`                             | PASS | 1 セクション 1 責務         |
| TC-05 | Handlebars 構文確認                | `phase-spec-template.md` / validator rerun           | PASS | タグバランス良好            |
| TC-06 | 既存フォーマット互換性             | `phase-10-final-review.md`                           | PASS | 破壊的変更なし              |
| TC-07 | 苦戦箇所欄の明確化                 | `unassigned-task-template.md`                        | PASS | 追記済み                    |
| TC-08 | root evidence / artifacts parity   | `phase12-task-spec-compliance-check.md`              | PASS | parity を集約               |
| TC-09 | spec_created 固定                  | `phase-12-documentation.md` / `index.md`             | PASS | completed に置換しない      |
| TC-10 | docs-only evidence の正本化        | `manual-test-result.md`                              | PASS | checklist/result が正本     |
| TC-11 | 既存仕様書との非互換なし           | `phase-1`〜`phase-10`                                | PASS | 依存関係整合                |
| TC-12 | canonical/mirror touched-file sync | `.claude` / `.agents` diff                           | PASS | touched files のみ同波同期  |
