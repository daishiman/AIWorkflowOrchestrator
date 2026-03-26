# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-01                                                                                 |
| Phase      | 13                                                                                          |
| Phase名    | PR作成                                                                                      |
| ステータス | blocked                                                                                     |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12 |
| 後続Phase  | なし                                                                                        |
| 作成日     | 2026-03-26                                                                                  |

## 目的

ユーザーの明示承認を得たあとにだけ、manifest foundation の変更を PR へまとめる。承認前は準備情報だけを整理し、commit と push は行わない。

## 実行タスク

- preflight summary 作成: 変更対象、検証結果、open decision を一枚にまとめる
- PR description 草案作成: Why、What、Risk、Follow-up を整理する
- local check list 作成: build、test、lint、typecheck の実行順を整理する
- blocked state 維持: 承認が来るまで commit、push、PR を行わない

## 参照資料

| 資料名                     | パス                                             | 説明          |
| -------------------------- | ------------------------------------------------ | ------------- |
| Phase 10                   | `phase-10-final-review.md`                       | final gate    |
| Phase 11                   | `phase-11-manual-test.md`                        | manual result |
| Phase 12                   | `phase-12-documentation.md`                      | sync result   |
| final-review-result        | `outputs/phase-10/final-review-result.md`        | PR 本文の根拠 |
| manual-test-result         | `outputs/phase-11/manual-test-result.md`         | 検証結果      |
| system-spec-update-summary | `outputs/phase-12/system-spec-update-summary.md` | sync サマリー |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                   | 内容           |
| --------------- | ---------------------------------------------------------------------- | -------------- |
| task-workflow   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 台帳更新確認   |
| lessons-learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | follow-up 確認 |

## 実行手順

1. final review、manual test、documentation sync の3結果を一枚にまとめる。
2. PR description の見出しを `Why / What / Risk / Follow-up` で固定する。
3. `build / test / lint / typecheck` の local check 順を記録する。
4. ユーザー承認が来るまで blocked を維持する。

## 成果物

| 成果物         | パス                                 | 説明                       |
| -------------- | ------------------------------------ | -------------------------- |
| pr-preparation | `outputs/phase-13/pr-preparation.md` | PR 草案と local check list |

## 完了条件

- [ ] preflight summary が定義されている
- [ ] PR description 草案の見出しが固定されている
- [ ] local check list の実行順が定義されている
- [ ] ユーザー承認前は commit、push、PR を行わないことが明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
