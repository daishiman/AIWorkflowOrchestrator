# Phase 9 IPC 品質チェック

| API                       | 検証項目                       | 判定 |
| ------------------------- | ------------------------------ | ---- |
| `file.read`               | 失敗時エラー surfacing         | PASS |
| `llm.streamChat`          | requestId管理 / cancel cleanup | PASS |
| `llm.onStreamChunk`       | chunk受信時 state+ref 同期     | PASS |
| `llm.onStreamEnd`         | assistant persist 実行         | PASS |
| `llm.onStreamError`       | alert表示 + stream state reset | PASS |
| `conversation.create`     | 初回のみ作成                   | PASS |
| `conversation.addMessage` | user/assistant 保存            | PASS |
