# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 3                                                      |
| Phase名    | 設計レビュー                                           |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                |
| タスク名   | 会話基盤・セッション統合                               |
| 前提Phase  | [phase-2-design.md](./phase-2-design.md)               |
| 後続Phase  | [phase-4-test-creation.md](./phase-4-test-creation.md) |
| ステータス | completed                                              |
| 作成日     | 2026-03-12                                             |

## 目的

Task02 の設計が重複実装、状態分散、文脈注入の混線を防げる粒度かを判定する。

## 実行タスク

- session review: create / revive / handoff が 1 契約に収まっているかを確認する
- mode review: general / workspace / skill-lifecycle の差分が adapter へ閉じているかを確認する
- streaming review: requestId / cancel / end / error の責務が競合しないかを確認する
- archive split review: current workflow と completed archive の役割が混ざっていないかを確認する
- Task03 review: Task03 が独自チャット基盤を増やさずに済むかを確認する

## 参照資料

| 参照資料             | パス                                                                           | 内容                  |
| -------------------- | ------------------------------------------------------------------------------ | --------------------- |
| Phase 1 requirements | `outputs/phase-1/requirements-definition.md`                                   | 要件正本              |
| session model        | `outputs/phase-2/session-model.md`                                             | session 契約          |
| mode state machine   | `outputs/phase-2/chat-mode-state-machine.md`                                   | mode 遷移             |
| streaming contract   | `outputs/phase-2/streaming-contract.md`                                        | stream 契約           |
| mode adapter design  | `outputs/phase-2/mode-adapter-design.md`                                       | adapter 分離          |
| review criteria      | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS/MINOR/MAJOR      |
| task workflow guide  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | archive/current split |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                             | 内容                 |
| ------------------------- | -------------------------------------------------------------------------------- | -------------------- |
| task workflow             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`             | archive/current 台帳 |
| lessons learned           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`           | 再利用知見           |
| arch-state-management     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`     | current ownership    |
| architecture-chat-history | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | history 境界         |
| llm-streaming             | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`             | stream lifecycle     |

## レビュー観点

- 1 つの session 契約で 3 モードを説明できるか
- workspace 固有文脈が general chat を汚染しないか
- completed archive と current reopen design が混同されていないか
- Task03 が別基盤を増やさずに handoff できるか

## 統合テスト連携

| 観点           | 連携内容                                           |
| -------------- | -------------------------------------------------- |
| review result  | Phase 4 のテスト観点に review 指摘を落とし込む     |
| archive split  | Phase 12 の documentation へ split 理由を引き継ぐ  |
| Task03 handoff | Task03 依存契約を contract test 観点として固定する |

## 成果物

| 成果物           | パス                                        | 説明                  |
| ---------------- | ------------------------------------------- | --------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`   | PASS/MINOR/MAJOR 判定 |
| 指摘一覧         | `outputs/phase-3/design-review-findings.md` | 観点別指摘            |
| 差し戻し計画     | `outputs/phase-3/remediation-plan.md`       | 戻り先と対処          |

## 完了条件

- [x] PASS/MINOR/MAJOR 判定が記録されている
- [x] archive/current split の扱いが判定に含まれている
- [x] Task03 着手可否が判定されている
- [x] MAJOR 指摘時の戻り先が明記されている
