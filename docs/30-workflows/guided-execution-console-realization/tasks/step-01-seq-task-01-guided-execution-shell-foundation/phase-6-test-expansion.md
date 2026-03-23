# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 6                                              |
| Phase名    | テスト拡充                                     |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 4-5                                      |
| 後続Phase  | Phase 7（カバレッジ確認）                      |
| ステータス | not_started                                    |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

route、label、CTA の境界値と回帰 guard を追加する。

## 実行タスク

- repeated open
- unavailable state
- compact / narrow width
- stale handler / stale label の回帰 guard

## 参照資料

- 依存Phase: Phase 5
- task 実装計画: `phase-5-implementation.md`
- root pack: `../../phase-6-test-expansion.md`
- root UX: `../../ui-ux-realization.md`

## 実行手順

### ステップ1: 境界値を追加する

二重クリック、surface 切替、未設定状態でも CTA が no-op にならないかを見る。

### ステップ2: label regression を追加する

front に `terminal` が再流入していないかを文字列レベルで検査する。

## 統合テスト連携

Phase 7 で negative case を coverage 対象に含める。

## 成果物

| 成果物               | パス                                           | 説明       |
| -------------------- | ---------------------------------------------- | ---------- |
| regression 拡張計画  | `outputs/phase-6/regression-expansion-plan.md` | 拡張方針   |
| edge case マトリクス | `outputs/phase-6/edge-case-matrix.md`          | 境界値一覧 |

## 完了条件

- [ ] repeated open を扱っている
- [ ] unavailable / compact を扱っている
- [ ] label regression の guard がある
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md)
