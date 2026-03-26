# Current Code Anchor Map

| ファイル                                                              | 現在の責務                                   | manifest 側へ移さない内容                           |
| --------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`         | legacy static task 実行 facade               | 既存 create / executeTasks の orchestration         |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | runtime plan / execute / improve と handoff  | authMode 解決、SkillExecutor 委譲、terminal_handoff |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | public `skill-creator:*` IPC bridge          | channel 名、sender validation、error sanitize       |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | renderer 公開 surface                        | timeout、safeInvoke / safeOn、preload API 名        |
| `packages/shared/src/types/skillCreator.ts`                           | runtime request / response / shared contract | runtime union 型の authority                        |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`            | 新規 loader                                  | read / validate / normalize / cache だけを担当      |

## anchor と実装の 1:1 対応

- facade / service / IPC / preload は既存 owner のまま維持
- 新規追加は `ManifestLoader` と shared contract のみ
- authority owner は増やしたが authority 自体は増やしていない
