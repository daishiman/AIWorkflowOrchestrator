# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 8                                    |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

Layer 3 / Layer 4 verify 追加で増える naming drift、duplicate mapping、section drift を抑える方針を固定する。

## 実行タスク

- field name の統一ルールを定義する
- duplicate mapping の削減方針を定義する
- renderer section 命名規則を定義する

## 参照資料

| 資料名          | パス                                           | 説明                      |
| --------------- | ---------------------------------------------- | ------------------------- |
| spec extraction | `outputs/phase-1/spec-extraction-map.md`       | concern と current anchor |
| contract matrix | `outputs/phase-2/layer34-contract-matrix.md`   | field set 正本            |
| implementation  | `outputs/phase-5/implementation-sequencing.md` | 更新順と重複候補          |
| coverage        | `outputs/phase-7/coverage-summary.md`          | 漏れと重複                |
| test expansion  | `outputs/phase-6/test-expansion-summary.md`    | edge case と命名 drift    |

## 実行手順

### ステップ1: naming を統一する

- Layer 3 / Layer 4 の語彙は shared types を正本にする。
- renderer 独自 alias を増やさない。

### ステップ2: duplicate mapping を削る

- bridge 層で一度だけ mapping し、renderer 再変換を避ける。

## 統合テスト連携

- Phase 9 で naming drift と duplicate mapping が残っていないかを監査する。

## 成果物

| 成果物              | パス                                     | 説明                    |
| ------------------- | ---------------------------------------- | ----------------------- |
| refactoring summary | `outputs/phase-8/refactoring-summary.md` | naming / duplicate 方針 |

## 完了条件

- [ ] naming 正本が定義されている
- [ ] duplicate mapping 削減方針がある
- [ ] renderer section 命名規則がある
- [ ] **本Phase内の全タスクを100%実行完了**
