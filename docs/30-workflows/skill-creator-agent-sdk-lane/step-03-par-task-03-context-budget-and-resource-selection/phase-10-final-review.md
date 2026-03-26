# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 10                                    |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

Task03 の設計と handoff が downstream task に渡せる品質かを最終 gate で判定する。

## 実行タスク

- source discovery 設計の妥当性を判定する
- budget / degrade の責務境界を判定する
- downstream handoff の十分性を判定する

## 参照資料

| 資料名       | パス                                    | 説明         |
| ------------ | --------------------------------------- | ------------ |
| Phase 5 実装 | `phase-5-implementation.md`             | 実装対象     |
| Phase 2 設計 | `phase-2-design.md`                     | 元設計       |
| Phase 3 gate | `outputs/phase-3/design-review-gate.md` | review 結果  |
| Phase 9 QA   | `phase-9-quality-assurance.md`          | quality gate |

## 実行手順

### ステップ1: 設計を再判定する

- fixed root 非前提が保たれているか確認する。
- provenance と downstream boundary が一貫しているか確認する。

### ステップ2: handoff を再判定する

- Task04 / 05 / 06 / 07 / 08 が追加解釈なしで読めるか確認する。

## 判定

PASS

## 妥当性根拠

- 全読み込み回避と必要十分読み込みの両立が取れている
- 単一固定 directory を正本にしない source discovery が定義されている
- Task04 と責務を衝突させずに並列進行できる
- Task07 / Task08 が必要とする provenance / snapshot handoff がある

## 次 task への引き継ぎ

- Task04 / 05 へ source provenance / warning 表示前提を渡す
- Task06 へ verify 対象 snapshot 前提を渡す
- Task07 へ degrade 時の route 影響点と custom root disclosure 論点を渡す
- Task08 へ source snapshot compatibility 前提を渡す

## 未決のまま残してよい事項

- token budget の最終閾値チューニング
- advanced caching 戦略
- custom root の trust scoring 詳細

## 統合テスト連携

- Phase 4 / 6 / 7 / 9 の観点が final review に引き継がれていることを確認する。
- Phase 12 に validation 結果と handoff 先を記録する。

## 成果物

| 成果物       | パス                       | 説明             |
| ------------ | -------------------------- | ---------------- |
| final review | `phase-10-final-review.md` | 最終 gate の本文 |

## 完了条件

- [ ] source discovery / budget / degrade / provenance の 4 本柱が揃っている
- [ ] downstream handoff が明記されている
- [ ] 未決事項が Task03 の責務外に閉じている
- [ ] **本Phase内の全タスクを100%実行完了**
