# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------- |
| Phase      | 13                                                                                          |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001                                          |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001                                          |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12 |
| 後続Phase  | なし                                                                                        |
| ステータス | blocked                                                                                     |
| 作成日     | 2026-03-26                                                                                  |

## 目的

ユーザーが明示指示した場合にのみ PR 作成へ進む条件を固定する。

## 実行タスク

- 実装完了、QA 完了、Phase 12 判定完了を確認する
- PR 作成はユーザー承認後のみ許可する
- 本 task では PR を作成しない前提を明記する

## 前提Phase 完了条件

| Phase    | 必須条件                                                    |
| -------- | ----------------------------------------------------------- |
| Phase 10 | AC-01〜04 と scope control が Go 判定で閉じている           |
| Phase 11 | manual-test-checklist/result が current fact で埋まっている |
| Phase 12 | 6成果物が揃い、Step 1-A〜1-C / Step 2 判定が記録されている  |

## 参照資料

| 参照資料 | パス                        | 内容     |
| -------- | --------------------------- | -------- |
| Phase 10 | `phase-10-final-review.md`  | Go 判定  |
| Phase 12 | `phase-12-documentation.md` | doc 判定 |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                       | 内容          |
| ------------------- | -------------------------------------------------------------------------- | ------------- |
| task workflow rules | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md` | PR 前提ルール |

## 成果物

| 成果物  | パス                      | 説明           |
| ------- | ------------------------- | -------------- |
| PR 条件 | `phase-13-pr-creation.md` | 実施条件の固定 |

## 完了条件

- [ ] PR 作成がユーザー承認後のみであることが明記されている
- [ ] 前提Phase の完了条件が列挙されている
- [ ] 本 turn では PR 非実施であることが明記されている
- [ ] 追加の禁止事項がない
