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
- [ ] `packages/shared/src/types/skill/index.ts`

## 3. 必須 artifacts.creates

各 task の domain に対応する以下が存在すること:
- [ ] `packages/shared/src/types/skill/chain.ts`
- [ ] `packages/shared/src/types/skill/fork.ts`
- [ ] `packages/shared/src/types/skill/share.ts`
- [ ] `packages/shared/src/types/skill/schedule.ts`
- [ ] `packages/shared/src/types/skill/debug.ts`
- [ ] `packages/shared/src/types/skill/docs.ts`
- [ ] `packages/shared/src/types/skill/analytics.ts`

## 4. 追加整合

- [ ] task-9I の Date型が IPC境界で ISO 8601 `string` として定義される
- [ ] `task-003-execution-plan.md` の `skill-api.ts` 参照が最新化される
