# Phase 13: PR作成

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 13                      |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | Phase 12                |
| 後続Phase  | handoff only            |
| ステータス | blocked                 |
| 主担当     | user approval required  |

## 目的

この workflow では Phase 13 を実行しないことを明確化し、PR 作成が user の明示承認後の別タスクであることを固定する。

## 実行タスク

- blocked 条件を確認する
- handoff 文面を用意する
- commit、push、PR作成を実行しない

## 参照資料

| 資料             | パス                                                                       | 用途                   |
| ---------------- | -------------------------------------------------------------------------- | ---------------------- |
| execute workflow | `.claude/skills/task-specification-creator/references/execute-workflow.md` | user approval 原則     |
| workflow index   | `docs/30-workflows/electron-build-infra-fix/index.md`                      | スコープ外確認         |
| phase 10         | `docs/30-workflows/electron-build-infra-fix/phase-10-final-review.md`      | AC 完了条件確認        |
| phase 12         | `docs/30-workflows/electron-build-infra-fix/phase-12-documentation.md`     | close-out 完了条件確認 |

## 実行手順

### ステップ1: blocked 条件の確認

- Phase 10 と Phase 12 が完了していても user approval がない限り実行しない

### ステップ2: handoff

- 変更要点、検証結果、残リスクだけを user に引き渡す

### ステップ3: 非実行の明記

- commit、push、PR作成コマンドはここでは実行しない

## 成果物

| 成果物       | パス                               | 説明              |
| ------------ | ---------------------------------- | ----------------- |
| handoff note | `outputs/phase-13/handoff-note.md` | user 承認待ちメモ |

## 完了条件

- [ ] blocked の理由が明記されている
- [ ] user approval が必須であることが明記されている
- [ ] commit、push、PR作成をこの workflow のスコープ外として扱っている
- [ ] 次アクションが handoff のみである
