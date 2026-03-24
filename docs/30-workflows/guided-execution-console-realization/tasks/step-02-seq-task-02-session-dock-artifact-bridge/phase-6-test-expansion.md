# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| Phase名    | テスト拡充                                |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 4-5                                 |
| 後続Phase  | Phase 7（カバレッジ確認）                 |
| ステータス | not_started                               |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

state 境界、restore failure、empty artifact、share cancel の edge case を追加する。

## 実行タスク

- state boundary 追加
- restore failure 追加
- share cancel 追加
- empty artifact 追加

## 参照資料

- 依存Phase: Phase 5
- task 実装計画: `phase-5-implementation.md`
- root pack: `../../phase-6-test-expansion.md`
- upstream task: `../step-01-seq-task-01-guided-execution-shell-foundation/index.md`

## 成果物

| 成果物               | パス                                           | 説明       |
| -------------------- | ---------------------------------------------- | ---------- |
| regression 拡張計画  | `outputs/phase-6/regression-expansion-plan.md` | 拡張方針   |
| edge case マトリクス | `outputs/phase-6/edge-case-matrix.md`          | 境界値一覧 |

## 完了条件

- [ ] restore failure ケースがある
- [ ] aborted / empty artifact ケースがある
- [ ] share cancel ケースがある
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md)
