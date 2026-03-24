# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 2                                               |
| Phase名    | 設計                                            |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 1                                         |
| 後続Phase  | Phase 3（設計レビュー）                         |
| ステータス | not_started                                     |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

approval sheet、disclosure、advanced console boundary、manual boundary enforcement を設計する。

## 実行タスク

- approval contract 設計
- disclosure contract 設計
- advanced console boundary 設計
- enforcement points 設計

## 参照資料

- 依存Phase: Phase 1
- task 要件: `phase-1-requirements.md`
- root pack: `../../phase-2-design.md`
- upstream tasks: `../step-01-seq-task-01-guided-execution-shell-foundation/index.md`, `../step-02-seq-task-02-session-dock-artifact-bridge/index.md`

## 実行手順

### ステップ1: approval contract を定義する

どの操作で承認が必要か、何を表示するか、どこで停止できるかを決める。

### ステップ2: disclosure contract を定義する

AI 利用、外部送信、データ保持の説明を session start にどう出すかを決める。

### ステップ3: advanced console boundary を定義する

front default では隠し、opt-in の detail layer としてのみ開く条件を定める。

## 統合テスト連携

approval trigger、disclosure visibility、auto-send prohibition の 3 群を Phase 4 へ渡す。

## 成果物

| 成果物                     | パス                                                  | 説明        |
| -------------------------- | ----------------------------------------------------- | ----------- |
| 設計サマリー               | `outputs/phase-2/design-summary.md`                   | 設計結論    |
| approval / disclosure 契約 | `outputs/phase-2/approval-and-disclosure-contract.md` | 承認と開示  |
| advanced console boundary  | `outputs/phase-2/advanced-console-boundary.md`        | opt-in 条件 |

## 完了条件

- [ ] approval trigger が定義されている
- [ ] disclosure timing が定義されている
- [ ] advanced console の露出条件が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md)
