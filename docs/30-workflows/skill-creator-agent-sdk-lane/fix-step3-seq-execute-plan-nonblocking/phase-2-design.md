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
5. `WorkflowPhase` 型の確認（既存型の再利用）

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
const CHANNEL_TIMEOUTS: Record<string, number> = {
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
  void facade.executeAsync(planId, req);
  return { accepted: true, planId }; // 即座に返す（100ms 以内）
});
```

変更量: 小（〜5 行の変更）

#### Concern 3: onPhaseChanged callback（SkillCreatorWorkflowEngine.ts）

**追加設計**:

```typescript
// SkillCreatorWorkflowEngine.ts
export type PhaseChangedCallback = (
  phase: WorkflowPhase,
  progress: number,
) => void;

export class SkillCreatorWorkflowEngine {
  onPhaseChanged?: PhaseChangedCallback; // オプション callback

  private transitionPhase(newPhase: WorkflowPhase, progress: number): void {
    // 既存のフェーズ遷移処理
    this.onPhaseChanged?.(newPhase, progress); // callback 呼び出し
  }
}
```

型定義場所: `SkillCreatorWorkflowEngine.ts` 内（DI 境界の外側、型のみエクスポート）

#### Concern 4: executeAsync（RuntimeSkillCreatorFacade.ts）

**追加設計**:

```typescript
// RuntimeSkillCreatorFacade.ts
async executeAsync(planId: string, req: ExecutePlanRequest): Promise<void> {
  const engine = this.getOrCreateEngine(planId);

  // onPhaseChanged を webContents.send にワイヤリング
  engine.onPhaseChanged = (phase: WorkflowPhase, progress: number) => {
    this.mainWindow.webContents.send(
      SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      { planId, phase, progress }
    );
  };

  try {
    await engine.execute(req);
  } catch (error) {
    // エラーは SKILL_CREATOR_WORKFLOW_STATE_CHANGED で通知
    this.mainWindow.webContents.send(
      SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      { planId, phase: 'failed', progress: 0, error: sanitizeErrorMessage(error) }
    );
  }
}
```

### ステップ 2: IPC 4 層整合性チェック

| 層               | ファイル                                                                             | 確認内容                                                  | 状態     |
| ---------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------- | -------- |
| 定数定義         | `apps/desktop/src/main/ipc/channels.ts` または `packages/shared/src/ipc/channels.ts` | `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が定義されているか | 確認対象 |
| CHANNEL_TIMEOUTS | `apps/desktop/src/preload/ipc-utils.ts`                                              | `"skill-creator:execute-plan": 1_800_000` を追加          | 変更対象 |
| ハンドラー登録   | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                       | `ipcMain.handle('skill-creator:execute-plan', ...)`       | 変更対象 |
| Preload API      | `apps/desktop/src/preload/skill-api.ts` または相当ファイル                           | `execute-plan` の invoke API が存在するか                 | 変更なし |

4 層が全て整合していることを `design-topology.md` に記録する。

### ステップ 3: DI 境界の型配置判断

`onPhaseChanged` の型 `PhaseChangedCallback` は以下の理由で `SkillCreatorWorkflowEngine.ts` 内に定義する:

- `WorkflowPhase` 型は `SkillCreatorWorkflowEngine` が直接使用する型
- Facade は Engine の型を import するため依存方向が自然
- Renderer 側には公開不要（Renderer は `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` のペイロード型のみを知ればよい）

### ステップ 4: executeAsync メソッドシグネチャ

```typescript
// RuntimeSkillCreatorFacade.ts
executeAsync(planId: string, req: ExecutePlanRequest): Promise<void>
```

- 戻り値は `Promise<void>`（fire-and-forget のため呼び出し側は await しない）
- エラーは `catch` 内で `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` に通知するため throw しない
- `planId` を第 1 引数に置くことで `onPhaseChanged` callback のワイヤリングを簡潔にする

### ステップ 5: WorkflowPhase 型の確認

```bash
# WorkflowPhase 型の定義場所を確認
grep -rn "WorkflowPhase" apps/desktop/src/ --include="*.ts"
grep -rn "WorkflowPhase" packages/shared/src/ --include="*.ts"
```

既存の `WorkflowPhase` 型を再利用する。新規定義しない。

## アーキテクチャ設計図

### 修正後のシーケンス

```
Renderer                    Main Process                   Agent SDK
   │                             │                              │
   │──invoke('execute-plan')────▶│                              │
   │◀── { accepted, planId } ───│  ← 100ms 以内               │
   │                             │──── void facade.executeAsync()──▶│
   │                             │                              │ (非同期実行)
   │◀── send(STATE_CHANGED) ────│◀── onPhaseChanged() ────────│
   │◀── send(STATE_CHANGED) ────│◀── onPhaseChanged() ────────│
   │◀── send(STATE_CHANGED) ────│◀── (完了) ──────────────────│
```

### concern 間の依存関係

```
creatorHandlers.ts
    └─ calls ──▶ RuntimeSkillCreatorFacade.executeAsync(planId, req)
                     └─ wires ──▶ SkillCreatorWorkflowEngine.onPhaseChanged
                                      └─ emits ──▶ webContents.send(STATE_CHANGED)
```

## 多角的チェック観点

- `void facade.executeAsync(planId, req)` の `void` キーワードで ESLint の `@typescript-eslint/no-floating-promises` を満たしているか
- `engine.onPhaseChanged` が null/undefined の場合に Optional Chaining `?.` で安全に呼ばれるか
- エラー発生時に `executeAsync` 内の catch が `throw` しないことで、呼び出し元ハンドラーに例外が伝播しないことを確認しているか
- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` のペイロード型 `{ planId, phase, progress }` が既存 Renderer 側リスナーと互換しているか

## 成果物

| 成果物           | パス                                 | 説明                                                 |
| ---------------- | ------------------------------------ | ---------------------------------------------------- |
| 設計トポロジー表 | `outputs/phase-2/design-topology.md` | concern ごとの設計表、IPC 4 層整合性確認、型配置判断 |

## 完了条件

- [ ] 4 つの concern（CHANNEL_TIMEOUTS / Handler / Engine / Facade）の変更設計が明記されている
- [ ] IPC 4 層（定数定義 / CHANNEL_TIMEOUTS / ハンドラー登録 / Preload API）の整合性確認が完了している
- [ ] `onPhaseChanged` の型定義場所（`SkillCreatorWorkflowEngine.ts` 内）が決定されている
- [ ] `executeAsync` のメソッドシグネチャ（`(planId, req): Promise<void>`）が確定している
- [ ] `WorkflowPhase` 型の既存定義場所が確認され、再利用方針が明記されている
- [ ] シーケンス図で修正後の非同期フローが図示されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-2/design-topology.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 3: 設計レビュー へ進む
