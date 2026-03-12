# 仕様抽出計画

## 参照順序

1. `interfaces-chat-history.md`
2. `llm-workspace-chat-edit.md`
3. `arch-state-management.md`
4. `llm-ipc-types.md`
5. `llm-streaming.md`

## 1 概念 1 クエリ

| 概念              | 主検索語          | 採用理由                      |
| ----------------- | ----------------- | ----------------------------- |
| session model     | `ChatSessionDTO`  | 履歴/永続化契約の起点         |
| stream IPC        | `llm:stream-chat` | partial update と cancel 契約 |
| workspace context | `workspacePath`   | file handoff の正本           |
| chat UI           | `ChatView`        | mode 表示責務                 |
| workspace UI      | `WorkspaceView`   | file attach / handoff 責務    |
| lifecycle job     | `skill-lifecycle` | Task03 downstream 契約        |

## 抽出結果の使い道

- Phase 2: domain model と adapter 設計
- Phase 4: contract test checklist
- Phase 9: spec extraction audit
