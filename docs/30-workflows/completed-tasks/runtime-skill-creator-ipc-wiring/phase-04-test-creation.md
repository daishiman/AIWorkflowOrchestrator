# Phase 4: テスト作成 - Runtime Skill Creator IPC Wiring

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Phase     | 4 - テスト作成                              |
| 前提Phase | Phase 3（設計レビュー）                     |
| 関連Issue | #1434                                       |

## 目的

public runtime surface の契約を先に固定し、Main / Preload / registration wiring の回帰を Red-to-Green で閉じる。

## 実行タスク

- `creatorHandlers.ts` の 3 チャンネルに対する正常系・異常系テストを作成する
- `skillCreatorHandlers.ts` 経由の統合登録テストを作成する
- `skill-creator-api.ts` の runtime public method 3 件を検証する
- sender validation / sanitize / graceful degradation の契約を明文化する

## 参照資料

| 資料名             | パス                                                                           | 説明                   |
| ------------------ | ------------------------------------------------------------------------------ | ---------------------- |
| Phase 1 要件       | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-01-requirements.md`  | 受入条件               |
| Phase 2 設計       | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-02-design.md`        | 命名・DI 方針          |
| Phase 3 レビュー   | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-03-design-review.md` | 設計ゲート             |
| Main IPC 実装      | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                 | runtime public handler |
| Skill Creator 登録 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                            | public entrypoint      |
| Preload API        | `apps/desktop/src/preload/skill-creator-api.ts`                                | renderer 公開面        |

## 実行手順

### Step 1: Main handler テストを作成する

対象ファイル:

- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`
- `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts`

固定する観点:

- `skill-creator:plan` / `skill-creator:execute-plan` / `skill-creator:improve-skill` が登録される
- `prompt` / `planId` / `skillSpec` / `skillName` / `feedback` に trim 前提の P42 バリデーションが入る
- sender 不正時は `toIPCValidationError` 経由で reject される
- runtime service 未注入時は `Runtime Skill Creator は現在利用できません` を返す
- error は `sanitizeErrorMessage` 後の文字列だけを返す

### Step 2: Preload runtime API テストを作成する

対象ファイル:

- `apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts`

固定する観点:

- `IPC_CHANNELS.SKILL_CREATOR_PLAN`
- `IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN`
- `IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL`
- `planSkill()` / `executePlan()` / `improveSkillWithFeedback()`
- `ALLOWED_INVOKE_CHANNELS` への登録

### Step 3: registration wiring テストを補強する

既存 mock が `getSkillExecutorInstance` を欠くと registration test が崩れるため、`ipc/index.ts` 系テストの mock export を補完する。

## 統合テスト連携

- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/creatorHandlers.test.ts src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts src/preload/__tests__/skill-creator-api.runtime.test.ts`

## 成果物

| 成果物             | パス                                                                       | 説明                         |
| ------------------ | -------------------------------------------------------------------------- | ---------------------------- |
| Main handler tests | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`              | runtime public handler 契約  |
| Registration tests | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts` | skillCreator entrypoint 統合 |
| Preload tests      | `apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts`     | renderer surface 契約        |

## 完了条件

- [ ] 3 チャンネルの登録・解除テストがある
- [ ] sender validation / sanitize / P42 バリデーションのテストがある
- [ ] graceful degradation の戻り値テストがある
- [ ] preload method 3 件の invoke wiring テストがある
- [ ] **本Phase内の全タスクを100%実行完了**
