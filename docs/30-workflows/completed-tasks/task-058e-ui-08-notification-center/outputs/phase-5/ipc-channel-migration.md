# Phase 5 IPC差分対応

## 追加した channel

| channel               | 変更点                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `notification:delete` | `IPC_CHANNELS`、Preload allowlist、Preload API、typed request/response、Main handler、service に追加 |

## 後方互換

| channel                      | 扱い                                       |
| ---------------------------- | ------------------------------------------ |
| `notification:clear`         | 既存契約として残置。058e UI からは呼ばない |
| `notification:get-history`   | 再利用                                     |
| `notification:mark-read`     | 再利用                                     |
| `notification:mark-all-read` | 再利用                                     |
| `notification:new`           | 再利用                                     |

## validation 契約

- sender 検証を必須化
- `notificationId` は string / 非空 / 非blank の 3段バリデーション
- 失敗メッセージは `sanitizeErrorMessage()` を経由
