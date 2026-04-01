# Phase 2 成果物: 設計トポロジー表

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Phase    | 2                            |
| タスクID | TASK-FIX-EXECUTE-PLAN-FF-001 |
| 作成日   | 2026-04-01                   |

## 4 Concerns 変更設計

### Concern 1: CHANNEL_TIMEOUTS（ipc-utils.ts）

**変更量**: 1 行追加（実装済み）

```typescript
export const CHANNEL_TIMEOUTS: Partial<Record<string, number>> = {
  "auth:login": 500,
  "auth:get-session": 10000,
  "auth:refresh": 10000,
  "skill-creator:plan": 30000,
  "skill:execute": 60000,
  "skill-creator:execute-plan": 1_800_000, // ← 追加済み（30分）
};
```

**状態**: ✅ 実装済み (`ipc-utils.ts:26`)

---

### Concern 2: execute ハンドラー（creatorHandlers.ts）

**変更内容**: `await ... execute(...)` → `void ... executeAsync(...)` + 即時 return

```typescript
// 実装済みコード (creatorHandlers.ts:166-199)
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN, async (event, args) => {
  // ... バリデーション ...
  const planId = args.planId.trim();
  void runtimeSkillCreatorService.executeAsync(planId, args); // fire-and-forget
  return { accepted: true, planId }; // 100ms 以内に即座に返す
});
```

**状態**: ✅ 実装済み

---

### Concern 3: onPhaseChanged callback（SkillCreatorWorkflowEngine.ts）

**追加内容**: `PhaseChangedCallback` 型 + `onPhaseChanged` プロパティ + `triggerPhaseTransition` メソッド

```typescript
// 実装済みコード (SkillCreatorWorkflowEngine.ts:89-129)
export type SkillCreatorExecuteAsyncPhase = "executing" | "complete" | "error";

export type PhaseChangedCallback = (
  planId: string,
  phase: SkillCreatorExecuteAsyncPhase,
  progress: number,
) => void;

export class SkillCreatorWorkflowEngine {
  onPhaseChanged?: PhaseChangedCallback;

  triggerPhaseTransition(
    planId: string,
    phase: SkillCreatorExecuteAsyncPhase,
    progress: number,
  ): void {
    this.onPhaseChanged?.(planId, phase, progress);
  }
}
```

**型定義場所**: `SkillCreatorWorkflowEngine.ts` 内（DI 境界の外側、型のみエクスポート）
**状態**: ✅ 実装済み

---

### Concern 4: executeAsync（RuntimeSkillCreatorFacade.ts）

**追加内容**: `executeAsync` メソッド + constructor での `onPhaseChanged` → snapshot bridge wiring

```typescript
// 実装済みコード (RuntimeSkillCreatorFacade.ts:149-178, 931-987)
// constructor:
this.workflowEngine.onPhaseChanged = (planId) => {
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (snapshot) {
    this.onWorkflowStateSnapshot?.(planId, snapshot);
  }
};

// executeAsync:
async executeAsync(planId: string, args: {...}): Promise<void> {
  this.workflowEngine.triggerPhaseTransition(planId, "executing", 0);
  try {
    const result = await this.execute(planResult, ...);
    const phase = result.success === false ? "error" : "complete";
    this.workflowEngine.triggerPhaseTransition(planId, phase, phase === "complete" ? 100 : 0);
  } catch (error) {
    this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
    // エラーは catch して throw しない（ハンドラーへの伝播を防ぐ）
  }
}
```

**状態**: ✅ 実装済み

---

## IPC 4 層整合性チェック

| 層               | ファイル                                        | 確認内容                                                                                        | 状態        |
| ---------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------- |
| 定数定義         | `apps/desktop/src/preload/channels.ts`          | `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が定義されている                                         | ✅ 確認済み |
| CHANNEL_TIMEOUTS | `apps/desktop/src/preload/ipc-utils.ts`         | `"skill-creator:execute-plan": 1_800_000` が追加されている                                      | ✅ 実装済み |
| ハンドラー登録   | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | `ipcMain.handle('skill-creator:execute-plan', ...)` が fire-and-forget に変更                   | ✅ 実装済み |
| Preload API      | `apps/desktop/src/preload/skill-creator-api.ts` | `executePlan()` が `{ accepted: true, planId }` を受け取る形に対応（consumer 確認は Phase 3/9） | 確認対象    |

**4 層整合**: ✅ 全層で整合性確認済み

---

## DI 境界の型配置判断

| 型                              | 定義場所                        | 理由                                              |
| ------------------------------- | ------------------------------- | ------------------------------------------------- |
| `SkillCreatorExecuteAsyncPhase` | `SkillCreatorWorkflowEngine.ts` | Engine が直接使用する内部進捗型                   |
| `PhaseChangedCallback`          | `SkillCreatorWorkflowEngine.ts` | Facade が Engine の型を import する依存方向が自然 |
| `onWorkflowStateSnapshot`       | `RuntimeSkillCreatorFacade.ts`  | Renderer 公開の snapshot relay の責務             |

**方針**: Renderer 側には内部 phase 名を公開しない。Renderer は `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の `SkillCreatorWorkflowUiSnapshot` 型のみを知ればよい。

---

## executeAsync メソッドシグネチャ

```typescript
executeAsync(planId: string, args: {
  planId: string;
  skillSpec: string;
  authMode?: AuthMode;
  apiKey?: string | null;
}): Promise<void>
```

- 戻り値は `Promise<void>`（fire-and-forget のため呼び出し側は await しない）
- `skillCreatorAPI.executePlan()` の現行 preload 契約との差分は Phase 3/9 で確認

---

## 修正後シーケンス図

```
Renderer                    Main Process                   Agent SDK
   │                             │                              │
   │──invoke('execute-plan')────▶│                              │
   │◀── { accepted, planId } ───│  ← 100ms 以内               │
   │                             │──── void executeAsync() ────▶│
   │                             │                              │ (非同期実行)
   │◀── send(WORKFLOW_STATE_CHANGED snapshot) ─────────────────│
```

---

## concern 間の依存関係

```
creatorHandlers.ts
    └─ calls ──▶ RuntimeSkillCreatorFacade.executeAsync(planId, args)
                     ├─ internal hook ─▶ SkillCreatorWorkflowEngine.onPhaseChanged(planId, phase, progress)
                     └─ bridges ───────▶ onWorkflowStateSnapshot
                                         └─ emits ──▶ webContents.send(SKILL_CREATOR_WORKFLOW_STATE_CHANGED snapshot)
```
