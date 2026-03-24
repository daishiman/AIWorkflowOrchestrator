# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 3                                               |
| Phase名    | 設計レビュー                                    |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 2                                         |
| 後続Phase  | Phase 4（テスト作成）                           |
| ステータス | not_started                                     |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

approval 漏れ、開示不足、auto-send 侵入、front 露出過多をレビューする。

## 実行タスク

- approval review
- disclosure review
- manual boundary review
- gate decision

## 参照資料

- 依存Phase: Phase 1, Phase 2
- task 要件: `phase-1-requirements.md`
- task 設計: `phase-2-design.md`
- root pack: `../../phase-3-design-review.md`
- upstream tasks: `../step-01-seq-task-01-guided-execution-shell-foundation/index.md`, `../step-02-seq-task-02-session-dock-artifact-bridge/index.md`

## 実行手順

### ステップ1: approval 漏れをレビューする

危険操作や外部送信が承認なしで進まないかを判定する。

### ステップ2: disclosure をレビューする

AI 利用と外部送信の開示が session start で見えるかを判定する。

### ステップ3: front 露出をレビューする

advanced console が default UI に侵入していないかを確認する。

## 統合テスト連携

Phase 4 では approval / disclosure / auto-send prohibition の negative case を含める。

## 成果物

| 成果物           | パス                                      | 説明       |
| ---------------- | ----------------------------------------- | ---------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 判定と指摘 |
| gate 決定        | `outputs/phase-3/gate-decision.md`        | 着手条件   |

## 完了条件

- [ ] approval 漏れが review 対象になっている
- [ ] disclosure 不足が review 対象になっている
- [ ] advanced console front 露出過多が review 対象になっている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md)
