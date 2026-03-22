# Phase 2: 設計 - Skill Creator Public IPC Wiring 統合

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Phase     | 2 - 設計                                    |
| 前提Phase | Phase 1（要件定義）                         |
| 関連Issue | #1434                                       |

## 目的

runtime plan/execute/improve を既存の Skill Creator public surface に吸収し、dead-end な `creator:*` 経路を増やさずに IPC 契約を一本化する。

## 実行タスク

- public channel 名と shared 型を確定する
- `skillCreatorHandlers.ts` を public entrypoint とする登録方式を決める
- `RuntimeSkillCreatorFacade` の DI と graceful degradation 方針を決める
- runtime 用テスト配置を既存 suite と競合しない形で決める

## 参照資料

| 資料名           | パス                                                                                                            | 説明                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 1 要件     | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-01-requirements.md`                                   | AC とスコープ                 |
| IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                    | sender validation / allowlist |
| runtime workflow | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | runtime policy の既知課題     |
| shared 型        | `packages/shared/src/types/skillCreator.ts`                                                                     | public contract 追加先        |

## 1. 設計方針

### 1.1 統合戦略: Public Surface Unification

既存の `skillCreatorHandlers.ts` を public entrypoint のまま維持し、その内部から runtime handler helper を登録する。
これにより renderer から見える入口は `skillCreatorAPI` のまま変わらず、`creator:*` という別名前空間を増やさない。

理由:

- public surface の入口を `skillCreatorHandlers.ts` / `skill-creator-api.ts` に一本化できる
- runtime 契約を `packages/shared/src/types/skillCreator.ts` に置くことで preload/main drift を減らせる
- `creatorHandlers.ts` は内部 helper として再利用し、既存 dead code を増やさない

### 1.2 命名規則

既存の `skill-creator:*` 名前空間を維持し、public 操作名として次を追加する。

| role     | チャンネル名                  | IPC_CHANNELS 定数名           |
| -------- | ----------------------------- | ----------------------------- |
| Planner  | `skill-creator:plan`          | `SKILL_CREATOR_PLAN`          |
| Executor | `skill-creator:execute-plan`  | `SKILL_CREATOR_EXECUTE_PLAN`  |
| Improver | `skill-creator:improve-skill` | `SKILL_CREATOR_IMPROVE_SKILL` |

P44準拠: internal role 名を外部チャネルに露出しない。

## 2. アーキテクチャ設計

### 2.1 変更対象ファイル一覧

| #   | ファイル                                    | 変更内容                                                                |
| --- | ------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | `preload/channels.ts`                       | 3チャンネル定数追加 + ホワイトリスト追加                                |
| 2   | `main/ipc/creatorHandlers.ts`               | runtime helper 化 + sender validation + graceful degradation            |
| 3   | `main/ipc/skillCreatorHandlers.ts`          | public entrypoint から runtime helper を登録                            |
| 4   | `main/ipc/index.ts`                         | `RuntimeSkillCreatorFacade` を `SkillExecutor` / `authKeyService` で DI |
| 5   | `main/ipc/skillHandlers.ts`                 | `getSkillExecutorInstance()` を export                                  |
| 6   | `preload/skill-creator-api.ts`              | 3メソッド追加（`planSkill`, `executePlan`, `improveSkillWithFeedback`） |
| 7   | `packages/shared/src/types/skillCreator.ts` | preload/main 共通 contract 追加                                         |
| 8   | `main/services/runtime/*.ts`                | shared contract を参照するよう整理                                      |

### 2.2 DI 構成

```text
ipc/index.ts
  ├── registerSkillHandlers(...)
  │    └── _skillExecutorInstance を初期化
  ├── getSkillExecutorInstance()
  └── new RuntimeSkillCreatorFacade({
        skillExecutor,
        authKeyService,
      })
        ↓
    registerSkillCreatorHandlers(
      mainWindow,
      skillCreatorService,
      runtimeSkillCreatorService,
    )
```

`getSkillExecutorInstance()` が `null` の場合でも public handler 自体は登録し、呼び出し時に graceful degradation で一定エラーを返す。

### 2.3 登録順序

`registerSkillHandlers()` の後に `registerSkillCreatorHandlers()` を呼ぶ。これで `SkillExecutor` の可用性を最大化しつつ、runtime service 不在時も channel 自体は不在にしない。

## 3. インターフェース設計

### 3.1 IPC チャンネル定義

```typescript
SKILL_CREATOR_PLAN: "skill-creator:plan",
SKILL_CREATOR_EXECUTE_PLAN: "skill-creator:execute-plan",
SKILL_CREATOR_IMPROVE_SKILL: "skill-creator:improve-skill",
```

### 3.2 shared contract

`packages/shared/src/types/skillCreator.ts` に以下を追加する。

- `TerminalHandoffBundle`
- `RuntimeSkillCreatorPlanResult`
- `RuntimeSkillCreatorExecuteResult`
- `RuntimeSkillCreatorImproveResult`
- `RuntimeSkillCreatorPlanResponse`
- `RuntimeSkillCreatorImproveResponse`

### 3.3 Preload API

```typescript
planSkill(
  prompt: string,
  authMode?: AuthMode,
  apiKey?: string | null,
): Promise<IpcResult<RuntimeSkillCreatorPlanResponse>>;

executePlan(
  planId: string,
  skillSpec: string,
  authMode?: AuthMode,
  apiKey?: string | null,
): Promise<IpcResult<RuntimeSkillCreatorExecuteResult>>;

improveSkillWithFeedback(
  skillName: string,
  feedback: string,
  authMode?: AuthMode,
  apiKey?: string | null,
): Promise<IpcResult<RuntimeSkillCreatorImproveResponse>>;
```

public `skillCreatorAPI` の既存契約に合わせ、runtime handler も `error?: string` を返す。

## 4. セキュリティ設計

| 項目                 | 対応                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| sender validation    | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })`   |
| error sanitize       | `sanitizeErrorMessage(error, fallbackMessage)`                                   |
| P42                  | `prompt`, `planId`, `skillSpec`, `skillName`, `feedback` に 3段バリデーション    |
| graceful degradation | runtime service 未注入時に `"Runtime Skill Creator は現在利用できません"` を返す |
| allowlist            | `ALLOWED_INVOKE_CHANNELS` に3チャネルを追加                                      |

## 5. テスト設計

| ファイル                                  | テスト対象                           |
| ----------------------------------------- | ------------------------------------ |
| `skillCreatorHandlers.runtime.test.ts`    | 正常系・異常系・graceful degradation |
| `skillCreatorHandlers.validation.test.ts` | P42バリデーション                    |
| `skillCreatorHandlers.security.test.ts`   | sender validation / sanitize         |
| `skill-creator-api.runtime.test.ts`       | preload の channel wiring            |

## 6. 移行計画

1. shared 型を追加する
2. `channels.ts` / `skill-creator-api.ts` へ public runtime surface を追加する
3. `creatorHandlers.ts` を internal helper として再構成する
4. `skillCreatorHandlers.ts` / `ipc/index.ts` から helper を DI 付きで登録する
5. runtime / preload テストを追加する

## 統合テスト連携

| レイヤー        | テストファイル                                                                       | 確認内容                                                               |
| --------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Main helper     | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`                        | runtime public 3 チャンネル、P42、sender validation、degraded response |
| Main entrypoint | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts`           | `skillCreatorHandlers.ts` 経由の登録と optional DI                     |
| Preload         | `apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts`               | `safeInvoke` と 3 メソッド wiring                                      |
| Runtime service | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | stored key fallback、terminal handoff、execute 委譲                    |

## 成果物

| 成果物         | パス                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| Phase 2 設計書 | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-02-design.md` |

## 完了条件

- [ ] public channel 名と shared 型の対応が確定している
- [ ] `skillCreatorHandlers.ts` を entrypoint に保つ登録方針が明示されている
- [ ] runtime service 不在時の graceful degradation 方針が定義されている
- [ ] テスト配置が実ファイル名ベースで記述されている
