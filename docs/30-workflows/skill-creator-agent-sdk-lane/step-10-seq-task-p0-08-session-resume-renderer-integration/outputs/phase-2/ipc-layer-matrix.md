# Phase 2: IPC 4層対応表

| チャンネル                       | 定数定義          | ホワイトリスト                | ハンドラ登録             | Preload API            |
| -------------------------------- | ----------------- | ----------------------------- | ------------------------ | ---------------------- |
| skill-creator:list-sessions      | ✓ channels.ts:343 | ✓ ALLOWED_INVOKE_CHANNELS:647 | ✓ creatorHandlers.ts:487 | ✓ skill-creator-api.ts |
| skill-creator:resume-session     | ✓ channels.ts:345 | ✓ ALLOWED_INVOKE_CHANNELS:649 | ✓ creatorHandlers.ts:526 | ✓ skill-creator-api.ts |
| skill-creator:delete-session     | ✓ channels.ts:346 | ✓ ALLOWED_INVOKE_CHANNELS:650 | ✓ creatorHandlers.ts:554 | ✓ skill-creator-api.ts |
| skill-creator:get-session-detail | ✓ channels.ts:344 | ✓ ALLOWED_INVOKE_CHANNELS:648 | ✓ creatorHandlers.ts:501 | ✓ skill-creator-api.ts |

**判定: 4層整合性 PASS**
