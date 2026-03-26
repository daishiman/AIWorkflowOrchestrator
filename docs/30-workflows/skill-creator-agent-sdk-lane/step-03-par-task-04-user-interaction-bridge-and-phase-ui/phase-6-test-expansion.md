# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 6                                    |
| 機能名 | user-interaction-bridge-and-phase-ui |
| 作成日 | 2026-03-26                           |

## 目的

未回答、キャンセル、stale requestId、listener 解放漏れ、secret redaction、handoff 再表示といった edge case を補う。

## 実行タスク

- question kind 別の異常系を拡張する
- event / listener のライフサイクルを補う
- provenance summary と handoff card の regression を補う

## 拡張対象

- request 受信前 submit
- stale `requestId` submit
- `single_select` の option 欠落
- `secret` の log / snapshot redaction
- `workflow-state-changed` listener の subscribe / unsubscribe
- execute handoff 後の panel 再描画

## 参照資料

| 資料名         | パス                             | 説明           |
| -------------- | -------------------------------- | -------------- |
| Phase 5 実装   | `phase-5-implementation.md`      | 実装対象       |
| Phase 4 テスト | `phase-4-test-creation.md`       | 基本 matrix    |
| test matrix    | `outputs/phase-4/test-matrix.md` | test case 基礎 |

## 成果物

| 成果物         | パス                        | 説明               |
| -------------- | --------------------------- | ------------------ |
| テスト拡充計画 | `phase-6-test-expansion.md` | edge case 追加方針 |

## 統合テスト連携

- Main / Preload / Renderer の各層で異常系を追加する
- stale submit と secret redaction は contract regression として固定する
- handoff 再表示は renderer state reset の回帰観点とする

## 完了条件

- [ ] interaction edge case が列挙されている
- [ ] event / listener 観点が追加されている
- [ ] secret / handoff / provenance の regression 観点が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**
