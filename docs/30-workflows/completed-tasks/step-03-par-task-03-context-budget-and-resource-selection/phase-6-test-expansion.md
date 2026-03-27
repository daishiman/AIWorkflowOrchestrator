# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 6                                     |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

長文 reference、priority collision、fallback selection、multi-root conflict の edge case を補う。

## 実行タスク

- deep-dive reference が予算超過する case を追加する
- 同名 resource が複数 root に存在する case を追加する
- optional resource 欠落と required resource 欠落を分ける
- structure drift と cache drift の case を追加する

## 参照資料

| 資料名                | パス                                       | 説明             |
| --------------------- | ------------------------------------------ | ---------------- |
| Phase 5 実装          | `phase-5-implementation.md`                | 実装対象と順序   |
| Phase 4 テスト作成    | `phase-4-test-creation.md`                 | baseline suite   |
| test matrix           | `outputs/phase-4/test-matrix.md`           | regression case  |
| budget degrade matrix | `outputs/phase-2/budget-degrade-matrix.md` | edge case の根拠 |

## 実行手順

### ステップ1: multi-root edge case を足す

- 同名 resource conflict
- required marker 欠落 root
- explicit root と repo root の競合

### ステップ2: budget edge case を足す

- optional-quality drop
- optional-deep-dive drop
- provenance_incomplete warning

## 統合テスト連携

- Phase 7 で resource kind / candidate root coverage を計測できるよう case 名を揃える。
- Phase 9 の QA で silent fallback が追加されていないことを確認する。

## 成果物

| 成果物         | パス                        | 説明               |
| -------------- | --------------------------- | ------------------ |
| テスト拡充計画 | `phase-6-test-expansion.md` | edge case 追加方針 |

## 完了条件

- [ ] context budget の edge case が列挙されている
- [ ] multi-root conflict と structure drift の edge case がある
- [ ] optional / required の差がテストで区別されている
- [ ] **本Phase内の全タスクを100%実行完了**
