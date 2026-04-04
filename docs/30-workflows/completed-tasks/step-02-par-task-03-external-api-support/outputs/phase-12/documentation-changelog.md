# Documentation Changelog — TASK-SDK-SC-03（2026-04-03）

## この更新で修正した観点

1. `creatorHandlers.ts` 前提の古い記述を、実際の main 連携先である `SkillCreatorIpcBridge` 前提へ修正。
2. `skillCreatorAPI` / `skillCreatorSessionAPI` / `SkillLifecyclePanel` の wiring 完了を反映。
3. `configureExternalApi` の戻り値契約を `success` ベースで扱う前提に合わせ、UI 側の説明も整合させた。
4. Phase 11 のスクリーンショット証跡不足は、引き続き未完了として残した。

## 実装ファイルの現況（参照）

### 実装済み

1. `packages/shared/src/types/skillCreatorExternalApi.ts`
2. `packages/shared/src/ipc/channels.ts`
3. `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts`
4. `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`
5. `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`
6. `apps/desktop/src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts`
7. `apps/desktop/src/preload/channels.ts`
8. `apps/desktop/src/preload/skill-creator-api.ts`
9. `apps/desktop/src/preload/skill-creator-session-api.ts`
10. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
11. `apps/desktop/src/renderer/components/skill/ExternalApiConfigForm.tsx`

## コマンド証跡（今回実行）

- `pnpm -C apps/desktop exec vitest run src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts`
- `pnpm -C apps/desktop exec vitest run src/main/services/runtime/__tests__/SkillCreatorSdkSession.test.ts`
- `pnpm -C apps/desktop exec vitest run src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts`
- `pnpm -C apps/desktop exec tsc -p tsconfig.json --noEmit`

## 検証結果

- 3つの vitest 実行はすべて PASS
- `tsc -p tsconfig.json --noEmit` は PASS
- したがって、今回の実施分で `configure-api` の wiring と型整合は確認済み

## 命名衝突に関する注意

`skillCreator.ts` の既存 `ExternalApiConfig`（`InterviewResult.externalApis` 用）と、  
`skillCreatorExternalApi.ts` の `ExternalApiConnectionConfig`（接続設定用）は用途が異なる。  
同名扱いしないこと。
