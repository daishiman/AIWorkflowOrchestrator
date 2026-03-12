# Persist Boundary

## persist する state

| 項目                                   | 理由                                     |
| -------------------------------------- | ---------------------------------------- |
| `conversationId`                       | long-term history と再接続するため       |
| `mode`                                 | 再開後の UI と rules を復元するため      |
| `title`                                | recent rail と active session 表示に必要 |
| `draftInput`                           | 入力途中の文面復元                       |
| `systemPrompt`                         | モード依存の会話補助情報を復元           |
| `summary` / `attachments` / `metadata` | handoff context の再表示に必要           |

## persist しない state

| 項目                 | 理由                                |
| -------------------- | ----------------------------------- |
| `isStreaming`        | reload 後に再送してはいけない       |
| `streamingContent`   | placeholder の一時データ            |
| `currentStreamId`    | process-local stream 識別子         |
| `streamingMessageId` | placeholder message の一時 ID       |
| `streamingError`     | 再開時に stale error を持ち越さない |

## 判定

non-persist keys は `NON_PERSISTED_CHAT_OVERLAY_KEYS` を正本にする。
