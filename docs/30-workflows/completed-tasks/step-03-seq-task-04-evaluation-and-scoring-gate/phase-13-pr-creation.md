# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 13                      |
| Phase名    | PR作成                  |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | blocked                 |
| 前提Phase  | Phase 12                |
| 後続Phase  | なし                    |

## 目的

ユーザーの明示承認がある場合だけ PR 作成手順を実行し、承認がない場合は blocked を維持する。

## 実行タスク

- タスク1: Phase 12 までの完了根拠を確認する。
- タスク2: ユーザーの明示承認有無を確認する。
- タスク3: 承認がある場合のみ PR 作成手順を実行する。
- タスク4: 承認がない場合は blocked 理由を記録する。

## 参照資料

| 参照資料        | パス                                                                                                                                                                                                                                                                                                                                                                             | 目的                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| PRルール        | `.claude/skills/task-specification-creator/references/commands.md`                                                                                                                                                                                                                                                                                                               | PR関連コマンド確認                          |
| レビュー基準    | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`                                                                                                                                                                                                                                                                                                   | 事前条件確認                                |
| Phase 12 成果物 | `./phase-12-documentation.md`                                                                                                                                                                                                                                                                                                                                                    | 完了根拠確認                                |
| 依存Phase成果物 | phase-1-requirements.md（Phase 1）, phase-2-design.md（Phase 2）, phase-5-implementation.md（Phase 5）, phase-6-test-expansion.md（Phase 6）, phase-7-coverage-check.md（Phase 7）, phase-8-refactoring.md（Phase 8）, phase-9-quality-assurance.md（Phase 9）, phase-10-final-review.md（Phase 10）, phase-11-manual-test.md（Phase 11）, phase-12-documentation.md（Phase 12） | Phase 1/2/5/6/7/8/9/10/11/12 の成果物を参照 |

## 実行手順

1. Phase 12 完了条件と成果物を確認する。
2. ユーザー承認の記録を確認する。
3. 承認がある場合のみ PR 作成手順を実行する。
4. 承認がない場合は blocked 記録を残す。

## 多角的チェック観点（AIが判断）

- 承認確認なしでPR作成に進んでいないか。
- ローカル検証結果が揃っているか。
- blocked 理由が明確か。

## サブタスク管理

| SubAgent   | 責務                      | 実行方式 | 出力                       |
| ---------- | ------------------------- | -------- | -------------------------- |
| SubAgent-A | 完了根拠監査              | 並列     | release-readiness-check.md |
| SubAgent-B | 承認状態確認              | 並列     | approval-state-log.md      |
| SubAgent-C | blocked条件と禁止操作監査 | 並列     | blocked-guard-log.md       |

## 成果物

| 成果物       | パス                               | 内容                     |
| ------------ | ---------------------------------- | ------------------------ |
| PR作成仕様   | `./phase-13-pr-creation.md`        | PR実行条件と手順         |
| 実行可否記録 | `outputs/phase-13/pr-readiness.md` | approval と blocked 理由 |

## 完了条件

- [ ] ユーザー明示承認の有無が記録されている
- [ ] 承認がない場合の blocked 理由が記録されている
- [ ] 承認がある場合のみ PR 作成手順を実行している

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次Phase

ユーザー承認を受けた後にのみ実行する。
