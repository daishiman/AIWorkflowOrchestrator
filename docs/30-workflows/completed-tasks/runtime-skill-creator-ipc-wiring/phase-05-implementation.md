# Phase 5: 実装 - Runtime Skill Creator IPC Wiring

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Phase     | 5 - 実装                                    |
| 前提Phase | Phase 4（テスト作成）                       |
| 関連Issue | #1434                                       |

## 目的

`RuntimeSkillCreatorFacade` の plan / execute / improve を、既存 `skill-creator:*` public surface に矛盾なく接続する。

## 実行タスク

- `channels.ts` に public runtime 3 チャンネルを追加する
- `creatorHandlers.ts` を runtime helper として public 名へ寄せる
- `skillCreatorHandlers.ts` / `ipc/index.ts` から DI 付きで登録する
- `skill-creator-api.ts` と shared types を public surface に合わせて拡張する
- `RuntimeSkillCreatorFacade` の auth key fallback を回復する

## 参照資料

| 資料名                     | パス                                                                       | 説明                     |
| -------------------------- | -------------------------------------------------------------------------- | ------------------------ |
| Phase 2 設計               | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-02-design.md`    | 採用設計                 |
| Phase 4 Main tests         | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`              | runtime handler 契約     |
| Phase 4 registration tests | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts` | entrypoint wiring        |
| Phase 4 preload tests      | `apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts`     | renderer runtime surface |
| Main IPC index             | `apps/desktop/src/main/ipc/index.ts`                                       | 登録順序                 |
| Runtime helper             | `apps/desktop/src/main/ipc/creatorHandlers.ts`                             | handler 実装             |
| Shared contract            | `packages/shared/src/types/skillCreator.ts`                                | request/response 型      |
| Runtime facade             | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`      | policy / handoff 分岐    |

## 実行手順

### Step 1: public channel を追加する

対象:

- `apps/desktop/src/preload/channels.ts`

追加する契約:

- `SKILL_CREATOR_PLAN: "skill-creator:plan"`
- `SKILL_CREATOR_EXECUTE_PLAN: "skill-creator:execute-plan"`
- `SKILL_CREATOR_IMPROVE_SKILL: "skill-creator:improve-skill"`
- `ALLOWED_INVOKE_CHANNELS` への 3 件追加

### Step 2: Main handler を public runtime helper に寄せる

対象:

- `apps/desktop/src/main/ipc/creatorHandlers.ts`

実装方針:

- `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })`
- 文字列引数は `isBlank()` で P42 準拠バリデーション
- `runtimeSkillCreatorService` がない場合も handler は登録し、`Runtime Skill Creator は現在利用できません` を返す
- error envelope は既存 `skillCreatorAPI` に合わせて `error?: string` を維持する
- `sanitizeErrorMessage()` で internal path / token を除去する

### Step 3: registration と DI を接続する

対象:

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`

実装方針:

- `registerSkillCreatorHandlers(mainWindow, skillCreatorService, runtimeSkillCreatorService?)`
- `getSkillExecutorInstance()` を export して `ipc/index.ts` から取得する
- `RuntimeSkillCreatorFacade({ skillExecutor, authKeyService })` を生成して渡す
- SkillExecutor 不在時は warning を残しつつ degraded runtime handlers を維持する

### Step 4: shared contract と preload を拡張する

対象:

- `packages/shared/src/types/skillCreator.ts`
- `packages/shared/src/types/index.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`

追加内容:

- `SkillCreatorPlanRequest`
- `SkillCreatorExecutePlanRequest`
- `SkillCreatorImproveSkillRequest`
- `RuntimeSkillCreatorPlanResponse`
- `RuntimeSkillCreatorExecuteResult`
- `RuntimeSkillCreatorImproveResponse`
- `TerminalHandoffBundle`
- `planSkill()` / `executePlan()` / `improveSkillWithFeedback()`

### Step 5: auth key fallback を回復する

対象:

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

実装方針:

- `authMode === "api-key"` かつ `apiKey` 未指定時だけ `RuntimePolicyResolver.resolveWithService()` を使う
- 明示的に `apiKey` が渡された場合はその値を優先する
- `execute()` は `SkillExecutor` 側の authKeyService DI と競合しないよう、decision 解決だけを合わせる

## 統合テスト連携

- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/creatorHandlers.test.ts src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts src/preload/__tests__/skill-creator-api.runtime.test.ts`

## 成果物

| 成果物            | パス                                                                  | 説明                   |
| ----------------- | --------------------------------------------------------------------- | ---------------------- |
| Main IPC 実装     | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | runtime public handler |
| Registration 実装 | `apps/desktop/src/main/ipc/index.ts`                                  | facade DI              |
| Shared contract   | `packages/shared/src/types/skillCreator.ts`                           | preload/main 共通契約  |
| Preload API       | `apps/desktop/src/preload/skill-creator-api.ts`                       | renderer 公開面        |
| Runtime facade    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | auth fallback 整合     |

## 完了条件

- [ ] public runtime 3 チャンネルが `channels.ts` と allowlist に登録されている
- [ ] Main handler が sender validation / sanitize / degraded error を備える
- [ ] `skillCreatorHandlers.ts` / `ipc/index.ts` から runtime helper が登録される
- [ ] shared contract と preload method が public 名に一致する
- [ ] `resolveWithService()` による auth key fallback が plan / improve で有効になっている
- [ ] **本Phase内の全タスクを100%実行完了**
