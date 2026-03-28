# Phase 13: PR作成

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 13                                                  |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

ユーザーの明示承認がある場合のみ、PR 作成へ進むための blocked phase を保持する。

## 実行タスク

- Phase 1〜12 完了確認
- git diff / status 確認
- PR 用 change summary 準備

## 参照資料

| 資料名                 | パス                                                     | 説明           |
| ---------------------- | -------------------------------------------------------- | -------------- |
| phase 2 design         | `outputs/phase-2/design.md`                              | 設計基準       |
| phase 5 implementation | `outputs/phase-5/implementation.md`                      | 実装内容       |
| phase 6 test expansion | `outputs/phase-6/test-expansion.md`                      | test 範囲      |
| phase 7 coverage       | `outputs/phase-7/coverage-check.md`                      | coverage 結果  |
| phase 8 refactoring    | `outputs/phase-8/refactoring.md`                         | 最終構造       |
| phase 9 QA             | `outputs/phase-9/quality-assurance.md`                   | 検証結果       |
| phase 10 final review  | `outputs/phase-10/final-review.md`                       | gate 判定      |
| phase 11 result        | `outputs/phase-11/manual-test-result.md`                 | 手動検証       |
| phase 12 compliance    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | close-out 判定 |
| verification report    | `outputs/verification-report.md`                         | 構造検証結果   |
| phase 13 summary       | `outputs/phase-13/pr-creation.md`                        | blocked 条件   |

## 実行手順

### ステップ1: blocked 条件を確認する

ユーザー承認がない限り commit、push、PR 作成を行わない。

### ステップ2: 承認後のみ差分確認へ進む

`git status`、`git diff --stat` を確認し、PR summary を作成する。

## 成果物

| 成果物           | パス                              | 説明                     |
| ---------------- | --------------------------------- | ------------------------ |
| PR phase summary | `outputs/phase-13/pr-creation.md` | blocked ルールと準備事項 |

## 完了条件

- [ ] ユーザー承認が取得されている
- [ ] Phase 1〜12 が完了している
- [ ] PR 作成前の差分確認が終わっている
- [ ] 本Phase内の全タスクを100%実行完了
