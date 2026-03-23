# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| Phase名    | 設計                                      |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 1                                   |
| 後続Phase  | Phase 3（設計レビュー）                   |
| ステータス | not_started                               |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

session state machine、artifact-first result、manual share bridge を一つの surface 契約として設計する。

## 実行タスク

- session state contract 設計
- persistence / restore 設計
- artifact bridge 設計
- share / provenance 設計

## 参照資料

- 依存Phase: Phase 1
- task 要件: `phase-1-requirements.md`
- root pack: `../../phase-2-design.md`
- upstream task: `../step-01-seq-task-01-guided-execution-shell-foundation/index.md`

## 実行手順

### ステップ1: state machine を定義する

`collapsed / ready / running / done / aborted / unavailable` を定義し、各 state の CTA を固定する。

### ステップ2: persistence を定義する

session ID の採番、保持件数、reopen restore、cleanup 条件を定義する。

### ステップ3: artifact bridge を定義する

`成果物 → 要約 → transcript 詳細` の順で結果面を定義する。

## 統合テスト連携

state machine、restore、manual share、artifact priority を Phase 4 でテスト可能な形に落とす。

## 成果物

| 成果物               | パス                                        | 説明                     |
| -------------------- | ------------------------------------------- | ------------------------ |
| 設計サマリー         | `outputs/phase-2/design-summary.md`         | 設計結論                 |
| session state 契約   | `outputs/phase-2/session-state-contract.md` | state / CTA / transition |
| artifact bridge 設計 | `outputs/phase-2/artifact-bridge-design.md` | 結果表示と manual share  |

## 完了条件

- [ ] state machine が 6 state で定義されている
- [ ] session restore の条件が定義されている
- [ ] artifact-first の表示順が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md)
