# テストマトリクス

| レイヤー | 対象          | ファイル                                                                | 観点                                     |
| -------- | ------------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| Unit     | session/state | `src/renderer/store/slices/chatSlice.test.ts`                           | 初期化、mode 切替、send/abort/error      |
| Unit     | view contract | `src/renderer/views/ChatView/ChatView.test.tsx`                         | mode switch、retry/stop、fetchProviders  |
| Unit     | view contract | `src/renderer/views/WorkspaceView/WorkspaceView.test.tsx`               | workspace handoff、attach、preview       |
| Unit     | view contract | `src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx` | lifecycle start button、empty/loading    |
| Manual   | UI evidence   | Phase 11 screenshots                                                    | light theme readability、handoff surface |

## テスト境界

- domain/state は `chatSlice.test.ts`
- UI handoff は view test
- screenshot は visual contract
