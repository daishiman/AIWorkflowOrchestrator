# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 6                                    |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

Phase 4 の基本観点に加え、warning 通過、hard fail、apply 部分成功、re-verify fail の edge case を補強する。

## 実行タスク

- warning path を追加する
- apply partial success path を追加する
- terminal handoff path を追加する
- provenance 欠落 path を追加する

## 参照資料

| 資料名              | パス                             | 説明     |
| ------------------- | -------------------------------- | -------- |
| Phase 4 test matrix | `outputs/phase-4/test-matrix.md` | 基本観点 |
| Phase 5 実装        | `phase-5-implementation.md`      | 実装対象 |

## 実行手順

### ステップ1: fail / warning 系を追加する

- verify fail -> improve へ遷移
- warning 相当 -> apply へ進める
- terminal handoff -> guidance 表示

### ステップ2: result 系を追加する

- apply partial success
- apply skippedDetails 表示
- re-verify fail 後の再改善起点

## 成果物

| 成果物                 | パス                                        | 説明                 |
| ---------------------- | ------------------------------------------- | -------------------- |
| テスト拡充仕様         | `phase-6-test-expansion.md`                 | edge case の追加方針 |
| test expansion summary | `outputs/phase-6/test-expansion-summary.md` | 追加ケース一覧       |

## 統合テスト連携

- Phase 5 の基本ケースへ fail / warning / handoff / partial success を追加する
- Phase 7 の coverage 確認で edge case が抜けていないか判定する

## 完了条件

- [ ] fail / warning / handoff / partial success の edge case が列挙されている
- [ ] **本Phase内の全タスクを100%実行完了**
