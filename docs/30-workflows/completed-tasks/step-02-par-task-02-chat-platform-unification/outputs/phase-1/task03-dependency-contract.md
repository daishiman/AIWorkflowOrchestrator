# Task03 依存契約

## Public Input

- `activateChatMode("skill-lifecycle", context)`
- `context.lifecycleJob`: `create | use | improve`
- `context.handoffLabel`: entry surface から受け渡す要約文
- `context.selectedSkillName`: 改善対象や再利用対象がある場合のみ設定

## Public Output

- `activeChatMode`
- `activeChatSessionId`
- `chatSessions[sessionId].context`
- `retryLastMessage()`
- `abortStreaming()`

## Forbidden Boundary

- Task03 が独自 `chatSlice` を新設しない。
- Task03 が `window.electronAPI.llm` を直接触らない。
- internal planner / subagent / codex の内部都合を user-facing prompt に露出しない。

## Failure Contract

- model 未選択: `MODEL_REQUIRED`
- stream start failure: `STREAM_START_ERROR`
- unavailable IPC: `LLM_NOT_AVAILABLE`

## Handoff Rule

- Skill Center は「入口」を担当し、実行会話は ChatView 側へ移す。
- Agent/Task03 は session context を読むが、session storage schema は追加しない。
