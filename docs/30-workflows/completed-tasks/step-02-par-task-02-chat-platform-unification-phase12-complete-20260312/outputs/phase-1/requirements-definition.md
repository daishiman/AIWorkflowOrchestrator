# Phase 1 要件定義

## 目的

Task02 の current workflow では、会話 UI を 1 つに全面統合する前に、mode / handoff / revive / streaming overlay の契約を current HEAD 準拠で固定する。

## current 実装の観測結果

| 観点              | current HEAD                                                                     | 今回の扱い                                   |
| ----------------- | -------------------------------------------------------------------------------- | -------------------------------------------- |
| general chat      | `ChatView` + `chatSlice` + `useStreamingChat`                                    | 既存 UX を維持しつつ、共通 contract へ寄せる |
| workspace chat    | `useWorkspaceChatController` が `conversationAPI` と `llm.streamChat()` を束ねる | handoff と request 生成を共通 helper 化する  |
| skill-lifecycle   | `skillLifecycleJourney.ts` に導線契約、`SkillLifecyclePanel.tsx` に操作 UI       | chat handoff payload を contract 化する      |
| streaming overlay | `chatSlice` が `isStreaming` / `currentStreamId` / placeholder を保持            | revive 対象外として固定する                  |
| compare baseline  | `completed-tasks/step-02-par-task-02-chat-platform-unification/`                 | 比較資料として維持し、current へ戻さない     |

## 今回の要件

1. `general | workspace | skill-lifecycle` を mode として同じ語彙で表現できること。
2. `WorkspaceView` / `SkillCenterView` / Task03 側は entry surface、`ChatView` は execution surface として責務を分離すること。
3. handoff payload に `mode` `sourceSurface` `targetSurface` `request` `title` `summary` `attachments` `metadata` を持たせること。
4. revive snapshot には会話再開に必要な `mode` `conversationId` `title` `draftInput` `systemPrompt` `summary` `attachments` `metadata` のみを含めること。
5. `isStreaming` `streamingContent` `currentStreamId` `streamingMessageId` `streamingError` は revive 対象外として扱うこと。
6. Workspace の file context 生成と Skill Lifecycle の skill handoff は、個別 UI に閉じず shared helper へ寄せること。
7. full transport unification が未完了なら、Phase 12 で未タスク化して status を正しく残すこと。

## 非目標

- `ChatView` をこのターンで `conversationAPI` 完全統合まで差し替えること。
- Main Process の LLM handler 契約を再設計すること。
- completed archive を current workflow へ上書きすること。

## 実装に落ちた要件

| 要件                                | 実装                                                            |
| ----------------------------------- | --------------------------------------------------------------- |
| 共通 mode / handoff / revive 契約   | `packages/shared/src/types/chat-platform.ts`                    |
| Workspace handoff / request builder | `apps/desktop/src/renderer/features/chat-platform/contracts.ts` |
| Skill Lifecycle handoff helper      | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` |
| revive 非対象 overlay reset         | `apps/desktop/src/renderer/store/slices/chatSlice.ts`           |
| representative screenshot harness   | `apps/desktop/src/renderer/phase11-chat-platform.{html,tsx}`    |

## 残課題

- general chat の persistent conversation transport は legacy 実装のまま。
- screenshot harness は renderer mock であり、実 Electron shell の end-to-end 置換ではない。
