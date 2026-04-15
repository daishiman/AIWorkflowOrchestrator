# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 12                                            |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 前提Phase  | Phase 11                                      |
| 後続Phase  | Phase 13                                      |
| 作成日     | 2026-04-15                                    |
| ステータス | completed                                     |

## 目的

実装ガイド、仕様同期、未タスク検出、スキルフィードバックを canonical 6 成果物へ閉じる。

## Task 12-1 から 12-6

| Task | 成果物                                  | 目的                                                                  |
| ---- | --------------------------------------- | --------------------------------------------------------------------- |
| 12-1 | `implementation-guide.md`               | Part 1 / Part 2 の実装ガイド                                          |
| 12-2 | `system-spec-update-summary.md`         | `task-specification-creator` / `aiworkflow-requirements` への同期結果 |
| 12-3 | `documentation-changelog.md`            | 変更ファイルと validator 結果の記録                                   |
| 12-4 | `unassigned-task-detection.md`          | 0 件でも検出結果を残す                                                |
| 12-5 | `skill-feedback-report.md`              | 改善提案または改善点なしの記録                                        |
| 12-6 | `phase12-task-spec-compliance-check.md` | Task 12-1 から 12-5 の準拠確認                                        |

## 実行タスク

- [x] Phase 11 の結果を取り込み、Part 1 / Part 2 の実装ガイドを作成する
- [x] `task-specification-creator` と `aiworkflow-requirements` の更新要否を整理し、必要な場合は current facts を同期する
- [x] documentation changelog に current / baseline / validator 結果を記録する
- [x] 未タスク候補を整理し、0 件でも結果を残す
- [x] skill feedback を整理する
- [x] Task 12-1 から 12-5 の準拠チェックを作成する

## 統合テスト連携

| 接続点   | 確認内容                                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1  | 要件と成果物説明が矛盾しないこと                                                                                                       |
| Phase 2  | 設計方針が実装ガイドへ反映されていること                                                                                               |
| Phase 5  | 実装結果の説明と変更ファイル一覧が一致すること                                                                                         |
| Phase 6  | 追加テストの意図が実装ガイドへ反映されていること                                                                                       |
| Phase 7  | カバレッジ結果が changelog または compliance check に反映されること                                                                    |
| Phase 8  | リファクタ結果が system spec summary と矛盾しないこと                                                                                  |
| Phase 9  | validator と quality gate の結果が changelog に残ること                                                                                |
| Phase 10 | MINOR がある場合に追跡先が明記されること                                                                                               |
| Phase 11 | 手動テスト所見が implementation guide と unassigned detection に反映され、`phase11-capture-metadata.json` を必要に応じて参照できること |

## 完了条件

- [x] canonical 6 成果物が全て定義されている
- [x] current / baseline / validator 結果が記録されている
- [x] 未タスク検出結果が 0 件でも記録されている
- [x] skill feedback の記録が存在する
- [x] compliance check で Task 12-1 から 12-5 の確認結果が残っている

## 成果物

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 参照資料

| 資料名                     | パス                                                 |
| -------------------------- | ---------------------------------------------------- |
| Phase 1 成果物             | `outputs/phase-1/requirements-definition.md`         |
| Phase 2 成果物             | `outputs/phase-2/design-document.md`                 |
| Phase 5 成果物             | `outputs/phase-5/implementation-record.md`           |
| Phase 6 成果物             | `outputs/phase-6/extended-test-record.md`            |
| Phase 7 成果物             | `outputs/phase-7/coverage-report.md`                 |
| Phase 8 成果物             | `outputs/phase-8/refactoring-record.md`              |
| Phase 9 成果物             | `outputs/phase-9/quality-report.md`                  |
| Phase 10 成果物            | `outputs/phase-10/final-review-result.md`            |
| Phase 11 成果物            | `outputs/phase-11/manual-test-result.md`             |
| Phase 11 証跡              | `outputs/phase-11/phase11-capture-metadata.json`     |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md` |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`    |
