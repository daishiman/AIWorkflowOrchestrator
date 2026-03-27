# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 6                                    |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

Layer 3 / Layer 4 verify の edge case、delegated boundary 侵食、non-goal regression を補強する。

## 実行タスク

- optional field / empty evidence の edge case を追加する
- governance / session 侵食防止 regression を追加する
- re-verify action の fail path を追加する

## 参照資料

| 資料名         | パス                             | 説明           |
| -------------- | -------------------------------- | -------------- |
| test matrix    | `outputs/phase-4/test-matrix.md` | baseline suite |
| implementation | `phase-5-implementation.md`      | 更新順         |

## 実行手順

### ステップ1: fail path を増やす

- evidence 欠落、partial provenance、route snapshot 不一致、action disable 条件を足す。

### ステップ2: sibling boundary regression を増やす

- approval / disclosure / resume invalidation を本 task の response に混入させない確認を追加する。

## 統合テスト連携

- Phase 7 で concern coverage と regression coverage の両方を数える。
- Phase 9 で docs QA と合わせて drift を監査する。

## 成果物

| 成果物                 | パス                                        | 説明                         |
| ---------------------- | ------------------------------------------- | ---------------------------- |
| test expansion summary | `outputs/phase-6/test-expansion-summary.md` | edge case と regression 拡張 |

## 完了条件

- [ ] edge case が列挙されている
- [ ] sibling boundary regression が定義されている
- [ ] re-verify fail path が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
