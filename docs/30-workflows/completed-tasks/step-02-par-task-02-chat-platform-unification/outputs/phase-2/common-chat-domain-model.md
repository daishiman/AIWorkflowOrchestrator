# 共通チャットドメインモデル

## Entity

- `ChatSessionRecord`
  - `id`, `mode`, `title`, `messages`, `createdAt`, `updatedAt`, `context`, `lastUserMessage`, `lastError`
- `ChatMessage`
  - `role`, `content`, `timestamp`, `sessionId`, `mode`, `isStreaming`, `errorCode`, `retryable`

## Value Object

- `ChatMode`
- `SkillLifecycleChatJob`
- `ChatSessionContext`
- `StreamingError`

## Registry

- `modeSessionIds`: mode ごとの再利用 session を引く index
- `chatSessionOrder`: recent rail 用の更新順 index

## 実装マッピング

- 型: `apps/desktop/src/renderer/store/types.ts`
- helper: `apps/desktop/src/renderer/features/chat-platform/session.ts`
- state: `apps/desktop/src/renderer/store/slices/chatSlice.ts`

## 設計意図

- mode 差分は `context` と `systemPrompt` 合成に閉じ込める。
- message list 自体は mode 非依存に保つ。
