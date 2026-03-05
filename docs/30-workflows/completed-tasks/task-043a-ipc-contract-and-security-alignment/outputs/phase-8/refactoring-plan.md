# Phase 8 リファクタリング計画

## 対象

- `skillHandlers.share.ts` のエラー処理重複
- チャネル定義の参照一貫性

## 実施内容

| 項目             | 変更                                             |
| ---------------- | ------------------------------------------------ |
| エラー正規化     | `internalError` / `sanitizeErrorMessage` を導入  |
| sender専用エラー | `senderValidationError` を導入                   |
| チャネル定数化   | unregister/register を `IPC_CHANNELS` 参照へ統一 |

## 効果

- 契約ドリフト耐性向上
- セキュリティ例外の分類一貫性向上
- テストしやすさ向上
