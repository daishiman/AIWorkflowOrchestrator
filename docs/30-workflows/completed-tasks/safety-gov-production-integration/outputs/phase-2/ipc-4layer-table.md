# IPC 4層整合性テーブル

| チャンネル                      | 1. 定数定義              | 2. ホワイトリスト            | 3. ハンドラ登録 | 4. Preload API |
| ------------------------------- | ------------------------ | ---------------------------- | --------------- | -------------- |
| `APPROVAL_RESPOND`              | ✅ `preload/channels.ts` | ✅ `ALLOWED_INVOKE_CHANNELS` | ❌ → 今回追加   | ❌ → 今回追加  |
| `APPROVAL_REQUEST`              | ✅ `preload/channels.ts` | ✅ `ALLOWED_ON_CHANNELS`     | N/A (push)      | ❌ → 今回追加  |
| `EXECUTION_GET_DISCLOSURE_INFO` | ✅ `preload/channels.ts` | ✅ `ALLOWED_INVOKE_CHANNELS` | ❌ → 今回追加   | ❌ → 今回追加  |
| `EXECUTION_GET_TERMINAL_LOG`    | ✅ `preload/channels.ts` | ✅ `ALLOWED_INVOKE_CHANNELS` | ❌ → 今回追加   | ❌ → 今回追加  |
| `EXECUTION_GET_COPY_COMMAND`    | ✅ `preload/channels.ts` | ✅ `ALLOWED_INVOKE_CHANNELS` | ❌ → 今回追加   | ❌ → 今回追加  |

## 結果

- **層1（定数定義）**: 5/5 完了
- **層2（ホワイトリスト）**: 5/5 完了
- **層3（ハンドラ登録）**: 0/4 → 今回追加（APPROVAL_REQUEST は push なのでハンドラ不要）
- **層4（Preload API）**: 0/5 → 今回追加
