# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 12                                   |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

Task06 の verify / improve / re-entry 契約を implementation guide、system spec update summary、unassigned task detection まで同期できる状態へ整理する。

## 実行タスク

- Task 12-1: implementation guide を Part 1 / Part 2 の 2 部構成で作成する
- Task 12-2: system spec update summary を Step 1-A / 1-B / 1-C / Step 2 判定つきで作成する
- Task 12-3: documentation changelog を validator 結果と MINOR 追跡有無つきで作成する
- Task 12-4: unassigned-task detection を SF-03 4 パターン点検つきで作成する
- Task 12-5: skill feedback report を改善点なしの場合も含めて作成する
- Task 12-6: phase12 compliance check を docs-only mode 判定つきで作成する

## 参照資料

| 資料名                 | パス                                                                             | 説明                  |
| ---------------------- | -------------------------------------------------------------------------------- | --------------------- |
| Phase 2 design         | `phase-2-design.md`                                                              | topology と DTO       |
| Phase 5 implementation | `phase-5-implementation.md`                                                      | 実装対象              |
| Phase 6 test expansion | `phase-6-test-expansion.md`                                                      | edge case             |
| Phase 7 coverage       | `phase-7-coverage-check.md`                                                      | coverage              |
| Phase 8 refactoring    | `phase-8-refactoring.md`                                                         | 分離結果              |
| Phase 9 QA             | `phase-9-quality-assurance.md`                                                   | QA 結果               |
| Phase 10 final review  | `phase-10-final-review.md`                                                       | Phase 12 の前提       |
| Phase 11 manual test   | `phase-11-manual-test.md`                                                        | 画面証跡の前提        |
| task-spec guide        | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` | Phase 12 必須成果物   |
| system spec workflow   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`   | system spec sync 手順 |

## 実行手順

### ステップ0: docs-only 判定と validator 方針を固定する

- 本 workflow は `spec_created` を目標とする docs-only task として扱う
- 実装コードの完了記録ではなく、仕様書・成果物・リンク・validator の整合を記録対象にする
- 未来表現を残さず、今回差分で判断できる範囲だけを `PASS` / `不要` / `未検出` で確定する

### ステップ1: 実装ガイドをまとめる

- Part 1: verify / improve 閉ループを日常例で説明する
- Part 2: DTO / IPC / panel wiring を型定義・API 例・エラー処理つきで説明する

### ステップ2: system spec と workflow 文書の更新対象をまとめる

- Step 1-A: この workflow 内の完了記録、変更履歴、関連ドキュメントを整理する
- Step 1-B: `spec_created` 判定と artifacts 同期状態を整理する
- Step 1-C: Task05 / Task07 / Task08 との関連境界と follow-up を整理する
- Step 2: `.claude/skills/aiworkflow-requirements/references/*` への domain spec sync 要否を判定する

### ステップ3: follow-up を検出する

- Layer 3 / Layer 4 verify は新規未タスクとして formalize する
- governance hardening は Task07 の既存責務として扱い、新規未タスク化しない
- session compatibility は Task08 の既存責務として扱い、新規未タスク化しない

### ステップ4: validator 結果を確定する

- `validate-phase-output.js` の結果を記録する
- 未来表現の残存有無を記録する
- 参照ファイルと成果物ファイル名の整合を記録する

## 成果物

| 成果物                     | パス                                                     | 説明                       |
| -------------------------- | -------------------------------------------------------- | -------------------------- |
| documentation spec         | `phase-12-documentation.md`                              | Phase 12 指示              |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2            |
| system-spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | 仕様同期の対象             |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 変更履歴                   |
| unassigned-task detection  | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 検出             |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | skill 改善点               |
| phase12 compliance check   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1 から 12-5 の確認 |

## 完了条件

- [ ] implementation guide が Part 1 / Part 2 の必須要件を満たしている
- [ ] system spec update summary が Step 1-A / 1-B / 1-C / Step 2 判定を含んでいる
- [ ] unassigned-task detection が SF-03 の 4 パターン点検を含んでいる
- [ ] phase12 compliance check が Task 12-1 から 12-6 までを確認している
- [ ] **本Phase内の全タスクを100%実行完了**
