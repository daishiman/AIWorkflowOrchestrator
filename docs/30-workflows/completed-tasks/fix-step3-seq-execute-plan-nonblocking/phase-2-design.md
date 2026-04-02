# Phase 2: 設計

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 2                            |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 1.5h                         |

## 目的

4 つの concern ごとに変更設計を定義し、IPC 4 層の整合性を確認する。DI 境界の型配置と `executeAsync` のメソッドシグネチャを確定する。

## 実行タスク

1. concern ごとの変更設計（4 concerns）
2. IPC 4 層整合性チェック
3. DI 境界の型配置判断（`onPhaseChanged` の型定義場所）
4. `executeAsync` メソッドシグネチャ設計
5. `SkillCreatorExecuteAsyncPhase` 型の確認（内部 progress 専用型の再利用）

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像            |

## 実行手順

### ステップ 1: concern ごとの変更設計

以下の 4 つの concern を設計し、`outputs/phase-2/design-topology.md` に記録する。

#### Concern 1: CHANNEL_TIMEOUTS（ipc-utils.ts）

**現状（問題あり）**:

```typescript
// ipc-utils.ts
const CHANNEL_TIMEOUTS: Record<string, number> = {
  // "skill-creator:execute-plan" が未登録 → デフォルト 5000ms が適用される
};
```

**修正後**:

```typescript
// ipc-utils.ts
export const CHANNEL_TIMEOUTS: Partial<Record<string, number>> = {
  "skill-creator:execute-plan": 1_800_000, // 30分（P0暫定対応）
};
```

変更量: 1 行追加

#### Concern 2: execute ハンドラー（creatorHandlers.ts）

**現状（問題あり）**:

```typescript
// creatorHandlers.ts
ipcMain.handle("skill-creator:execute-plan", async (_event, req) => {
  await runtimeSkillCreatorService.execute(req.planId, req); // ← 30分ブロック
  return { success: true };
});
```

**修正後（fire-and-forget）**:

```typescript
// creatorHandlers.ts
ipcMain.handle("skill-creator:execute-plan", async (_event, req) => {
  const { planId } = req;
  // fire-and-forget: バックグラウンドで非同期実行
  void runtimeSkillCreatorService.executeAsync(planId, args);
  return { accepted: true, planId }; // 即座に返す（100ms 以内）
});
```

変更量: 小（〜5 行の変更）

#### Concern 3: onPhaseChanged callback（SkillCreatorWorkflowEngine.ts）

**追加設計**:

```typescript
// SkillCreatorWorkflowEngine.ts
export type PhaseChangedCallback = (
  planId: string,
  phase: SkillCreatorExecuteAsyncPhase,
  progress: number,
) => void;

export class SkillCreatorWorkflowEngine {
  onPhaseChanged?: PhaseChangedCallback; // オプション callback

  private transitionPhase(
    planId: string,
    newPhase: SkillCreatorExecuteAsyncPhase,
    progress: number,
  ): void {
    // 既存のフェーズ遷移処理
    this.onPhaseChanged?.(planId, newPhase, progress); // internal hook
  }
}
```

型定義場所: `SkillCreatorWorkflowEngine.ts` 内（DI 境界の外側、型のみエクスポート）
Renderer へは公開しない。内部進捗ラベルとしてのみ利用する。

#### Concern 4: executeAsync（RuntimeSkillCreatorFacade.ts）

**追加設計**:

```typescript
// RuntimeSkillCreatorFacade.ts
async executeAsync(
  planId: string,
  args: {
    planId: string;
    skillSpec: string;
    authMode?: AuthMode;
    apiKey?: string | null;
  },
): Promise<void> {
  try {
    this.workflowEngine.triggerPhaseTransition(planId, "executing", 0);
    const executeResult = await this.execute(
      {
        planId,
        skillSpec: args.skillSpec.trim(),
        estimatedSteps: 3,
        skillName: "",
        description: "",
        agents: [],
        scripts: [],
        triggers: [],
        anchors: [],
      },
      args.authMode ?? "api-key",
      args.apiKey ?? null,
    );
    // execute() の戻り値は success / terminal_handoff を含むので、
    // 成功時は complete、失敗時は error として internal hook を流す。
    const phase =
      typeof executeResult === "object" &&
      executeResult !== null &&
      "success" in executeResult &&
      executeResult.success === false
        ? "error"
        : "complete";
    this.workflowEngine.triggerPhaseTransition(
      planId,
      phase,
      phase === "complete" ? 100 : 0,
    );
  } catch (error) {
    this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const snapshot = this.workflowEngine.getWorkflowState(planId);
    if (!snapshot) {
      this.onWorkflowStateSnapshot?.(planId, null, errorMessage);
    }
    console.error("[RuntimeSkillCreatorFacade] executeAsync failed", planId, errorMessage);
  }
}
```

```typescript
// RuntimeSkillCreatorFacade.ts constructor
this.workflowEngine.onPhaseChanged = (planId) => {
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (snapshot) {
    this.onWorkflowStateSnapshot?.(planId, snapshot);
  }
};
```

### ステップ 2: IPC 4 層整合性チェック

| 層               | ファイル                                                             | 確認内容                                                                                            | 状態     |
| ---------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------- |
| 定数定義         | `apps/desktop/src/preload/channels.ts` / `packages/shared/src/types` | `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が定義されているか                                           | 確認対象 |
| CHANNEL_TIMEOUTS | `apps/desktop/src/preload/ipc-utils.ts`                              | `"skill-creator:execute-plan": 1_800_000` を追加                                                    | 変更対象 |
| ハンドラー登録   | `apps/desktop/src/main/ipc/creatorHandlers.ts`                       | `ipcMain.handle('skill-creator:execute-plan', ...)`                                                 | 変更対象 |
| Preload API      | `apps/desktop/src/preload/skill-creator-api.ts`                      | `executePlan()` の現行 `IpcResult<SkillCreatorExecutePlanAck>` 契約と ack / snapshot への差分を確認 | 確認対象 |

4 層が全て整合していることを `design-topology.md` に記録する。

### ステップ 3: DI 境界の型配置判断

`onPhaseChanged` の型 `PhaseChangedCallback` は以下の理由で `SkillCreatorWorkflowEngine.ts` 内に定義する:

- `SkillCreatorExecuteAsyncPhase` は `SkillCreatorWorkflowEngine` が直接使用する内部進捗型
- Facade は Engine の型を import するため依存方向が自然
- Renderer 側には内部 phase 名を公開しない（Renderer は `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の snapshot 型のみを知ればよい）

### ステップ 4: executeAsync メソッドシグネチャ

```typescript
// RuntimeSkillCreatorFacade.ts
executeAsync(
  planId: string,
  args: {
    planId: string;
    skillSpec: string;
    authMode?: AuthMode;
    apiKey?: string | null;
  },
): Promise<void>
```

- 戻り値は `Promise<void>`（fire-and-forget のため呼び出し側は await しない）
- `skillCreatorAPI.executePlan()` の公開契約は `IpcResult<SkillCreatorExecutePlanAck>` に更新済みで、Renderer の compat path は snapshot と一緒に Phase 3 / 9 で確認する
- `SkillCreatorWorkflowEngine.onPhaseChanged` は内部 progress hook として扱い、Renderer への公開契約にはしない
- `RuntimeSkillCreatorFacade` の constructor で `workflowEngine.onPhaseChanged` を snapshot bridge に接続する
- snapshot は `onWorkflowStateSnapshot` を通じて既存の `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` を再利用する
- `planId` を第 1 引数に置くことで snapshot bridging を簡潔にする

### ステップ 5: `SkillCreatorExecuteAsyncPhase` 型の確認

```bash
# `SkillCreatorExecuteAsyncPhase` 型の定義場所を確認
grep -rn "SkillCreatorExecuteAsyncPhase" apps/desktop/src/ --include="*.ts"
grep -rn "SkillCreatorExecuteAsyncPhase" packages/shared/src/ --include="*.ts"
```

既存の workflow state 用 phase 名と executeAsync の進捗ラベルは混ぜず、`SkillCreatorExecuteAsyncPhase` として別管理する。

## アーキテクチャ設計図

### 修正後のシーケンス

```
Renderer                    Main Process                   Agent SDK
   │                             │                              │
   │──invoke('execute-plan')────▶│                              │
   │◀── { accepted, planId } ───│  ← 100ms 以内               │
   │                             │──── void runtimeSkillCreatorService.executeAsync()──▶│
   │                             │                              │ (非同期実行)
   │◀── internal hook ───────────│◀── onPhaseChanged(planId, phase, progress) ─▶│
   │◀── send(SKILL_CREATOR_WORKFLOW_STATE_CHANGED snapshot) ── snapshot bridge ─▶│
```

### concern 間の依存関係

```
creatorHandlers.ts
    └─ calls ──▶ RuntimeSkillCreatorFacade.executeAsync(planId, args)
                     ├─ internal hook ─▶ SkillCreatorWorkflowEngine.onPhaseChanged(planId, phase, progress)
                     └─ bridges ───────▶ onWorkflowStateSnapshot
                                         └─ emits ──▶ webContents.send(SKILL_CREATOR_WORKFLOW_STATE_CHANGED snapshot)
```

## 多角的チェック観点

- `void runtimeSkillCreatorService.executeAsync(planId, args)` の `void` キーワードで ESLint の `@typescript-eslint/no-floating-promises` を満たしているか
- `engine.onPhaseChanged` が null/undefined の場合に Optional Chaining `?.` で安全に呼ばれるか
- エラー発生時に `executeAsync` 内の catch が `throw` しないことで、呼び出し元ハンドラーに例外が伝播しないことを確認しているか
- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` のペイロード型 `SkillCreatorWorkflowUiSnapshot` が既存 Renderer 側リスナーと互換しているか

## 成果物

| 成果物           | パス                                 | 説明                                                 |
| ---------------- | ------------------------------------ | ---------------------------------------------------- |
| 設計トポロジー表 | `outputs/phase-2/design-topology.md` | concern ごとの設計表、IPC 4 層整合性確認、型配置判断 |

## 完了条件

- [ ] 4 つの concern（CHANNEL_TIMEOUTS / Handler / Engine / Facade）の変更設計が明記されている
- [ ] IPC 4 層（定数定義 / CHANNEL_TIMEOUTS / ハンドラー登録 / Preload API）の整合性確認が完了している
- [ ] `onPhaseChanged` の型定義場所（`SkillCreatorWorkflowEngine.ts` 内）が決定されている
- [ ] `executeAsync` のメソッドシグネチャ（`(planId, args): Promise<void>`）が確定している
- [ ] `SkillCreatorExecuteAsyncPhase` 型の既存定義場所が確認され、再利用方針が明記されている
- [ ] シーケンス図で修正後の非同期フローが図示されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-2/design-topology.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 3: 設計レビュー へ進む
