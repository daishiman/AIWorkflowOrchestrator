# 要件トレーサビリティ

| 要件 / AC                               | 実装                                              | 自動テスト                                      | 手動証跡                           |
| --------------------------------------- | ------------------------------------------------- | ----------------------------------------------- | ---------------------------------- |
| AC-1 3 mode 共通基盤                    | `chatSlice.ts`, `session.ts`                      | `chatSlice.test.ts`                             | `TC-02-01`, `TC-02-04`, `TC-02-06` |
| AC-2 stream/history/abort/retry/context | `chatSlice.ts`, `useStreamingChat.ts`             | `chatSlice.test.ts`, `ChatView.test.tsx`        | `TC-02-02`                         |
| AC-3 slice と hook の責務整理           | `useStreamingChat.ts`                             | `chatSlice.test.ts`                             | n/a                                |
| AC-4 Workspace 文脈注入                 | `WorkspaceView/index.tsx`, `ChatView/index.tsx`   | `WorkspaceView.test.tsx`                        | `TC-02-03`, `TC-02-04`             |
| AC-5 Task03 contract                    | `SkillCenterView/index.tsx`, `ChatView/index.tsx` | `SkillCenterView.test.tsx`, `chatSlice.test.ts` | `TC-02-05`, `TC-02-06`             |
