# Entry / Execution Boundary

## 所有者

| concern                  | owner                                                                       |
| ------------------------ | --------------------------------------------------------------------------- |
| request / context の入力 | `WorkspaceView` / `SkillLifecyclePanel` / current `ChatView`                |
| handoff payload 生成     | `renderer/features/chat-platform/contracts.ts` / `skillLifecycleJourney.ts` |
| 会話実行                 | `ChatView` / `useStreamingChat` / workspace controller                      |
| persistence              | current は Workspace controller が主担当、general は未統合                  |
| screenshot evidence      | `phase11-chat-platform.{html,tsx}` harness                                  |

## 境界の意図

- entry surface は「何を会話へ渡すか」を決める。
- execution surface は「どう会話を流すか」を決める。
- この分離により、UI 導線変更と会話 transport 変更を別フェーズで進められる。
