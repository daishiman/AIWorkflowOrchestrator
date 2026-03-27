# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 7                                    |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

Layer 3 / Layer 4 verify の concern、field set、delegated boundary、manual evidence がカバーされているかを確認する。

## 実行タスク

- concern coverage を確認する
- layer coverage を確認する
- delegated boundary coverage を確認する
- manual evidence coverage を確認する

## 参照資料

| 資料名          | パス                                           | 説明                  |
| --------------- | ---------------------------------------------- | --------------------- |
| contract matrix | `outputs/phase-2/layer34-contract-matrix.md`   | concern 母集団        |
| test matrix     | `outputs/phase-4/test-matrix.md`               | suite 母集団          |
| implementation  | `outputs/phase-5/implementation-sequencing.md` | 実装単位と suite 対応 |
| test expansion  | `outputs/phase-6/test-expansion-summary.md`    | edge case 母集団      |

## 実行手順

### ステップ1: concern x suite を照合する

- concern ごとに最低 1 つの unit / integration / docs QA / manual 証跡があるかを確認する。

### ステップ2: delegated item coverage を確認する

- Task07 / Task08 侵食防止が docs QA と regression の両方に存在するかを確認する。

## 統合テスト連携

- Phase 9 で coverage 漏れが品質 gate 違反にならないことを再確認する。

## 成果物

| 成果物           | パス                                  | 説明                     |
| ---------------- | ------------------------------------- | ------------------------ |
| coverage summary | `outputs/phase-7/coverage-summary.md` | concern / layer coverage |

## 完了条件

- [ ] concern coverage が説明できる
- [ ] delegated boundary coverage がある
- [ ] manual evidence coverage がある
- [ ] **本Phase内の全タスクを100%実行完了**
