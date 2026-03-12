# Ownership Diff

| concern                 | before                     | after                                          |
| ----------------------- | -------------------------- | ---------------------------------------------- |
| mode enum               | 暗黙                       | `packages/shared/src/types/chat-platform.ts`   |
| Workspace handoff       | controller 内ローカル関数  | `renderer/features/chat-platform/contracts.ts` |
| lifecycle handoff       | navigation 契約のみ        | `skillLifecycleJourney.ts` 内 helper           |
| overlay reset           | `chatSlice` 個別実装       | `createEmptyChatStreamOverlayState()` 基準     |
| screenshot verification | app shell 依存になりやすい | dedicated harness                              |
