# System Spec Update Summary — TASK-SDK-SC-03（2026-04-03時点）

## Step 1-A: 完了記録

- タスクID: `TASK-SDK-SC-03`
- 現在ステータス: **実装済み（Phase 11証跡待ち）**
- scope外: commit / PR / push

## Step 1-B: 実装状況テーブル

| ファイル                                                                                   | 変更種別 | 状態           |
| ------------------------------------------------------------------------------------------ | -------- | -------------- |
| `packages/shared/src/types/skillCreatorExternalApi.ts`                                     | 新規     | 完了           |
| `packages/shared/src/types/index.ts`                                                       | 変更     | 完了           |
| `packages/shared/index.ts`                                                                 | 変更     | 完了           |
| `packages/shared/src/ipc/channels.ts`                                                      | 変更     | 完了           |
| `packages/shared/package.json`                                                             | 変更     | 完了           |
| `packages/shared/tsup.config.ts`                                                           | 変更     | 完了           |
| `apps/desktop/tsconfig.json`                                                               | 変更     | 完了           |
| `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`                | 新規     | 完了           |
| `apps/desktop/src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts` | 新規     | 完了           |
| `apps/desktop/src/renderer/components/skill/ExternalApiConfigForm.tsx`                     | 新規     | 完了（単体UI） |
| `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`                          | 変更     | 完了           |
| `apps/desktop/src/preload/channels.ts`                                                     | 変更     | 完了           |
| `apps/desktop/src/preload/skill-creator-api.ts`                                            | 変更     | 完了           |
| `apps/desktop/src/preload/skill-creator-session-api.ts`                                    | 変更     | 完了           |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                       | 変更     | 完了           |

## Step 1-C: 関連タスク反映

| タスク             | 判定        | 根拠                                                  |
| ------------------ | ----------- | ----------------------------------------------------- |
| `TASK-SDK-SC-03`   | in_progress | 配線は完了、Phase 11 スクリーンショット証跡のみ未完了 |
| `UT-SDK-SC-03-001` | open        | Phase 11 UIスクリーンショット証跡不足を吸収する残課題 |

## Step 2: 新規 interface / IPC / UI contract 反映状況

| 契約要素                                                                 | 反映状況                                   |
| ------------------------------------------------------------------------ | ------------------------------------------ |
| `ExternalApiConnectionConfig` / `IExternalApiAdapter`                    | 反映済み                                   |
| `SKILL_CREATOR_SESSION_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED`            | 反映済み（main/preload/renderer 配線完了） |
| `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API`                      | 反映済み（invoke/handler 配線完了）        |
| `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_CONFIGURED` / `API_TEST_RESULT` | 反映済み（bridge から renderer へ送出）    |
| `ExternalApiConfigForm`                                                  | 反映済み（表示導線完了）                   |
