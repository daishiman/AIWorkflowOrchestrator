# Phase 13: PR作成

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 13                                   |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

ユーザー承認が出た場合に限り、Phase 12 までの成果を PR 作成可能な形へまとめる。

## 実行タスク

- local check 結果を整理する
- change summary を整理する
- PR 情報をまとめる

## 参照資料

| 資料名                   | パス                                                                             | 説明               |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------ |
| Phase 2 design           | `phase-2-design.md`                                                              | topology の根拠    |
| Phase 5 implementation   | `phase-5-implementation.md`                                                      | 実装対象           |
| Phase 6 test expansion   | `phase-6-test-expansion.md`                                                      | edge case          |
| Phase 7 coverage         | `phase-7-coverage-check.md`                                                      | coverage           |
| Phase 8 refactoring      | `phase-8-refactoring.md`                                                         | 分離結果           |
| Phase 9 QA               | `phase-9-quality-assurance.md`                                                   | QA 判定            |
| Phase 10 final review    | `phase-10-final-review.md`                                                       | final gate         |
| Phase 11 manual test     | `phase-11-manual-test.md`                                                        | 手動確認結果の前提 |
| Phase 12 documentation   | `phase-12-documentation.md`                                                      | PR 前提            |
| task-spec Phase 13 guide | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | blocked ルール     |

## 実行手順

### ステップ1: blocked 条件を確認する

- user の明示承認がない間は blocked
- コミットと PR は実行しない

### ステップ2: 承認後に整理する内容を固定する

- local check result
- change summary
- PR 本文の根拠

## 成果物

| 成果物             | パス                                     | 説明             |
| ------------------ | ---------------------------------------- | ---------------- |
| PR 作成仕様        | `phase-13-pr-creation.md`                | Phase 13 の条件  |
| local-check-result | `outputs/phase-13/local-check-result.md` | ローカル確認結果 |
| change-summary     | `outputs/phase-13/change-summary.md`     | 差分要約         |

## 完了条件

- [ ] blocked 条件が明記されている
- [ ] 承認後にまとめる成果物が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
