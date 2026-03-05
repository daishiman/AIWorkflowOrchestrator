# Phase 6 テスト拡充計画

## 追加戦略

- 異常系: validation / sender / internal exception の3系統を明示分離
- 境界系: import と importFromSource の誤接続を専用テストで固定
- 回帰系: share 3チャネル whitelist と errorCode透過を固定

## 実行結果

| テストファイル                | 件数 | 結果 |
| ----------------------------- | ---- | ---- |
| `skillHandlers.share.test.ts` | 34   | PASS |
| `skill-api.contract.test.ts`  | 60   | PASS |
| 合計                          | 94   | PASS |

## 次段階

- Phase7 で対象ファイル限定カバレッジを計測してギャップ化
