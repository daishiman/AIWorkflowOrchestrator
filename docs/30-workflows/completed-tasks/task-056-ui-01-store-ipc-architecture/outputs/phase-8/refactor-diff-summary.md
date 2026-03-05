# Phase 8 成果物: リファクタ差分サマリー

## Before

- `notification/history` ハンドラに sender検証なし
- 例外メッセージをそのまま返却

## After

- `validateIpcSender` と `toIPCValidationError` を適用
- `sanitizeErrorMessage` で返却メッセージを整形
- sender拒否テストを追加
