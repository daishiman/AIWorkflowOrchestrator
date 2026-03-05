# Phase 10 最終レビュー基準

## Gate条件

| 条件                                | 判定 |
| ----------------------------------- | ---- |
| 契約ドリフト防止（定数参照化）      | PASS |
| エラーコード3分類（1001/2004/5001） | PASS |
| import/importFromSource 境界固定    | PASS |
| 主要テスト・型検査 PASS             | PASS |
| Phase11 証跡取得可能                | PASS |

## 不合格条件

- sender検証を bypass できる経路が残る
- `errorCode` が preload で欠落する
- 主要テストが1件でも失敗する
