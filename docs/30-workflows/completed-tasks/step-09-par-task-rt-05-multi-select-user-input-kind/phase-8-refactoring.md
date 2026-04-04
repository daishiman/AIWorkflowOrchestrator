# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 8                            |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

`multi_select` 追加で生じた重複を見直し、helper 抽出が本当に必要な箇所だけを整える。

## 実行タスク

- checkbox toggle の重複有無を確認する
- submit payload 組み立ての分岐が過剰になっていないか確認する
- helper 抽出が要ると判断した場合だけ renderer ローカルに閉じる
- shared type と engine へ renderer 都合のロジックを持ち込まない

## 参照資料

| 資料名           | パス                        | 説明     |
| ---------------- | --------------------------- | -------- |
| Phase 5 実装     | `phase-5-implementation.md` | 実装結果 |
| Phase 7 coverage | `phase-7-coverage-check.md` | 監査結果 |

## 実行手順

### リファクタ方針

- checkbox toggle が 1 箇所だけなら抽象化しない
- submit payload の条件分岐が読める範囲なら局所修正で留める
- helper を作る場合は renderer ローカル関数に閉じる

## 統合テスト連携

- Phase 9 で refactor 後も test matrix が変わらず green であることを確認する
- Phase 10 で抽象化過多になっていないか再確認する

## 成果物

| 成果物         | パス                              | 説明               |
| -------------- | --------------------------------- | ------------------ |
| リファクタ方針 | `phase-8-refactoring.md`          | 重複削減の判断基準 |
| refactor log   | `outputs/phase-8/refactor-log.md` | 実施内容の記録     |

## 完了条件

- [ ] 不要な抽象化を増やしていない
- [ ] renderer ローカルに閉じた改善方針が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
