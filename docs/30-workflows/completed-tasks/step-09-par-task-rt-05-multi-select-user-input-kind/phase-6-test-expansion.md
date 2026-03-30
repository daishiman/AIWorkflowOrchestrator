# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 6                            |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

edge case と回帰 guard を追加し、`multi_select` が existing question host を壊さないことを保証する。

## 実行タスク

- 空配列、未知 option id、重複 id のテストを追加する
- request kind 切り替え時の state reset を検証する
- 既存 4 kind の submit payload が非破壊であることを再確認する
- renderer の disabled / enabled 条件を検証する

## 参照資料

| 資料名         | パス                        | 説明     |
| -------------- | --------------------------- | -------- |
| Phase 4 テスト | `phase-4-test-creation.md`  | baseline |
| Phase 5 実装   | `phase-5-implementation.md` | 実装内容 |

## 実行手順

### 追加ケース

| ID   | ケース                                                       | 期待値                     |
| ---- | ------------------------------------------------------------ | -------------------------- |
| T6-1 | `selectedOptionIds = []`                                     | fail                       |
| T6-2 | `selectedOptionIds` に未知 id を含む                         | fail                       |
| T6-3 | kind が `multi_select` から `single_select` へ切り替わる     | 配列 state が reset される |
| T6-4 | kind が `single_select` / `free_text` / `secret` / `confirm` | 既存 payload が維持される  |

## 統合テスト連携

- Phase 7 の coverage matrix に edge case を反映する
- Phase 9 の最終コマンド群へ追加ケースを含める

## 成果物

| 成果物            | パス                                   | 説明                 |
| ----------------- | -------------------------------------- | -------------------- |
| テスト拡充仕様    | `phase-6-test-expansion.md`            | edge case の追加方針 |
| regression matrix | `outputs/phase-6/regression-matrix.md` | 追加ケース一覧       |

## 完了条件

- [ ] edge case が追加されている
- [ ] state reset の回帰 guard が追加されている
- [ ] 既存 4 kind の非破壊が再確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
