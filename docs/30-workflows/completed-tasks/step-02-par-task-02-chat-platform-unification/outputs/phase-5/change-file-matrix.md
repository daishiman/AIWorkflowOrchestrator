# 変更ファイルマトリクス

| ファイル                                                               | 変更種別       | 目的                                          |
| ---------------------------------------------------------------------- | -------------- | --------------------------------------------- |
| `apps/desktop/src/renderer/store/types.ts`                             | extend         | session/context 型追加                        |
| `apps/desktop/src/renderer/features/chat-platform/session.ts`          | new            | session/helper 集約                           |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`                  | refactor       | 共通 session/stream state 化                  |
| `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                  | refactor       | facade 化                                     |
| `apps/desktop/src/renderer/store/index.ts`                             | extend         | persist/revive/selectors                      |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`                   | refactor       | mode switcher / recent rail / context summary |
| `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`              | extend         | workspace handoff CTA                         |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`            | extend         | lifecycle handoff CTA                         |
| `apps/desktop/src/renderer/components/molecules/ChatMessage/index.tsx` | refactor       | light theme readability                       |
| `apps/desktop/scripts/capture-task-skill-lifecycle-02-phase11.mjs`     | new            | screenshot 自動取得                           |
| 各 test file                                                           | rewrite/extend | 新契約に追従                                  |
