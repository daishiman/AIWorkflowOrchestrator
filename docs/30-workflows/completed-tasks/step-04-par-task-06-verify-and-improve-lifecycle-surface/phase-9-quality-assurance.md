# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 9                                    |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

Task06 の初回 scope が Layer 1 / 2 verify と detail surface に収まり、Task05 / Task07 / Task08 と責務衝突していないか確認する。

## 実行タスク

- verify / improve 契約を再点検する
- hard fail / warning / re-verify の境界を確認する
- sibling task との責務分離を確認する
- IPC / preload / shared type の parity を確認する

## 参照資料

| 資料名                 | パス                                     | 説明           |
| ---------------------- | ---------------------------------------- | -------------- |
| Phase 2 設計           | `phase-2-design.md`                      | scope 基準     |
| Phase 5 implementation | `phase-5-implementation.md`              | 実装差分の確認 |
| Phase 7 coverage       | `outputs/phase-7/coverage-summary.md`    | coverage 確認  |
| Phase 8 summary        | `outputs/phase-8/refactoring-summary.md` | 分離後の状態   |

## 実行手順

### ステップ1: scope を点検する

- verify が第2実行エンジンへ膨張していない
- Layer 3 / 4 verify を持ち込んでいない

### ステップ2: boundary を点検する

- Task05 の navigation owner を奪っていない
- Task07 の governance copy を奪っていない
- Task08 の persistence semantics を奪っていない

### ステップ3: parity を点検する

- shared type
- main IPC
- preload API
- renderer panel

## 統合テスト連携

- Phase 5 実装差分と coverage summary を照合して未検証領域を洗う
- Phase 10 final review の判定入力として QA summary を渡す

## 成果物

| 成果物       | パス                            | 説明          |
| ------------ | ------------------------------- | ------------- |
| 品質保証仕様 | `phase-9-quality-assurance.md`  | QA 手順       |
| qa summary   | `outputs/phase-9/qa-summary.md` | QA 結果の要約 |

## 完了条件

- [ ] 初回 scope の過大化が防止されている
- [ ] hard fail / warning / re-verify の境界が記述されている
- [ ] Task05 / Task07 / Task08 との責務分離が記述されている
- [ ] **本Phase内の全タスクを100%実行完了**
