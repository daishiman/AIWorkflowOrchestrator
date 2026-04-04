# task-9D〜9J 仕様同期チェックリスト

## 1. 旧参照パス

- [ ] `preload/skillAPI.ts` が 0 件
- [ ] `main/ipc/channels.ts` が 0 件
- [ ] `packages/shared/src/types/skillChain.ts` など旧命名が 0 件

## 2. 必須 artifacts.modifies

各 task に次が存在すること:
- [ ] `apps/desktop/src/preload/channels.ts`
- [ ] `apps/desktop/src/preload/skill-api.ts`
- [ ] `apps/desktop/src/preload/types.ts`
- [ ] `packages/shared/src/types/index.ts`

## 3. 必須 artifacts.creates

各 task の domain に対応する以下が存在すること:
- [ ] `packages/shared/src/types/skill-chain.ts`
- [ ] `packages/shared/src/types/skill-fork.ts`
- [ ] `packages/shared/src/types/skill-share.ts`
- [ ] `packages/shared/src/types/skill-schedule.ts`
- [ ] `packages/shared/src/types/skill-debug.ts`
- [ ] `packages/shared/src/types/skill-docs.ts`
- [ ] `packages/shared/src/types/skill-analytics.ts`

## 4. External API IPC 整合（TASK-SDK-SC-03）

- [ ] `packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_EXTERNAL_API_CHANNELS` が定義されている
- [ ] `SKILL_CREATOR_EXTERNAL_API_CHANNELS` に `CONFIGURE_API`, `API_CONFIGURED`, `API_TEST_RESULT` の 3 チャネルが含まれる
- [ ] `SKILL_CREATOR_SESSION_CHANNELS` に `EXTERNAL_API_CONFIG_REQUIRED` が含まれる
- [ ] `apps/desktop/src/preload/channels.ts` が `SKILL_CREATOR_EXTERNAL_API_CHANNELS` をスプレッドで取り込んでいる
- [ ] `packages/shared/src/types/skillCreatorExternalApi.ts` に以下の型が定義されている:
  - [ ] `ExternalApiConnectionConfig`
  - [ ] `ExternalApiAuthType`
  - [ ] `ExternalApiTimeoutError`
  - [ ] `ExternalApiHttpError`
  - [ ] `IExternalApiAdapter`
- [ ] `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts` に `configure-api` ハンドラが登録されている
- [ ] `apps/desktop/src/preload/skill-creator-session-api.ts` に `EXTERNAL_API_CONFIG_REQUIRED` イベント購読がある

## 5. 追加整合

- [ ] task-9I の Date型が IPC境界で ISO 8601 `string` として定義される
- [ ] `task-003-execution-plan.md` の `skill-api.ts` 参照が最新化される
