# Phase 5: 実装

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 5                            |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 2.5h                         |

## 目的

Phase 2 の設計に従い、4 つのファイルを修正・拡張して Phase 4 のテストを全て Green にする。

## 実行タスク

1. `apps/desktop/src/preload/ipc-utils.ts` に `"skill-creator:execute-plan": 1_800_000` を追加
2. `apps/desktop/src/main/ipc/creatorHandlers.ts` の execute ハンドラーを fire-and-forget に変更
3. `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` に `onPhaseChanged` callback を追加
4. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` に `executeAsync` を追加、callback ワイヤリング
5. Phase 4 のテストが全て Green になることを確認する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像            |

## 実行手順

### ステップ 1: ipc-utils.ts の修正

```bash
# 現状確認
grep -n "CHANNEL_TIMEOUTS\|skill-creator" apps/desktop/src/preload/ipc-utils.ts
```

**変更内容**: `CHANNEL_TIMEOUTS` オブジェクトに 1 行追加

```typescript
// 変更前: skill-creator:execute-plan が未登録
const CHANNEL_TIMEOUTS: Record<string, number> = {
  // 既存のエントリ
};

// 変更後: 1_800_000ms（30分）を追加
export const CHANNEL_TIMEOUTS: Partial<Record<string, number>> = {
  // 既存のエントリ（変更なし）
  "skill-creator:execute-plan": 1_800_000, // 30分: スキル生成は最大30分かかるため
};
```

確認事項:

- `CHANNEL_TIMEOUTS` が `export` されているか確認する（テスト用）
- `getChannelTimeout(channel)` が `CHANNEL_TIMEOUTS` を参照し、未定義チャンネルは `IPC_TIMEOUT_MS` にフォールバックすることを確認する
- 既存のエントリ順序を変えないこと

### ステップ 2: creatorHandlers.ts の修正

```bash
# 現状確認
grep -n "execute-plan\|execute\|runtimeSkillCreator" apps/desktop/src/main/ipc/creatorHandlers.ts
```

**変更内容**: `await runtimeSkillCreatorService.execute(...)` を fire-and-forget に変更

```typescript
// 変更前（ブロッキング）
ipcMain.handle("skill-creator:execute-plan", async (_event, req) => {
  await runtimeSkillCreatorService.execute(req.planId, req); // 最大30分ブロック
  return { success: true };
});

// 変更後（fire-and-forget）
ipcMain.handle("skill-creator:execute-plan", async (_event, req) => {
  const { planId } = req;
  // fire-and-forget: バックグラウンドで非同期実行
  // エラーと snapshot は executeAsync → onWorkflowStateSnapshot → SKILL_CREATOR_WORKFLOW_STATE_CHANGED に通知される
  void runtimeSkillCreatorService.executeAsync(planId, args);
  return { accepted: true, planId }; // 100ms 以内に即座に返す
});
```

確認事項:

- `runtimeSkillCreatorService` が `creatorHandlers.ts` のスコープでアクセス可能か確認する
- `void` キーワードで ESLint の `no-floating-promises` を満たすこと
- 戻り値の型変更（`{ success }` → `{ accepted, planId }`）が `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` の consumer 契約に影響しないか確認する

### ステップ 3: SkillCreatorWorkflowEngine.ts の修正

```bash
# 現状確認
grep -n "SkillCreatorExecuteAsyncPhase\|phase\|transition" apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts | head -20
```

**変更内容**: `onPhaseChanged` オプション callback プロパティを追加

```typescript
// PhaseChangedCallback 型を追加（export）
export type PhaseChangedCallback = (
  planId: string,
  phase: SkillCreatorExecuteAsyncPhase,
  progress: number,
) => void;

export class SkillCreatorWorkflowEngine {
  // onPhaseChanged callback を追加
  onPhaseChanged?: PhaseChangedCallback;

  // 既存のフェーズ遷移メソッドを修正して callback を呼ぶ
  triggerPhaseTransition(
    planId: string,
    newPhase: SkillCreatorExecuteAsyncPhase,
    progress: number,
  ): void {
    // 既存の状態更新処理（変更なし）
    this.onPhaseChanged?.(planId, newPhase, progress); // internal hook
  }
}
```

確認事項:

- 既存のフェーズ遷移メソッド名を確認し、正しいメソッドに callback を追加すること
- `SkillCreatorExecuteAsyncPhase` 型が既存定義から import されているか確認すること
- `this.onPhaseChanged?.()` の Optional Chaining で undefined 時に例外が発生しないこと

### ステップ 4: RuntimeSkillCreatorFacade.ts の修正

```bash
# 現状確認
grep -n "execute\|WorkflowEngine\|mainWindow\|webContents" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | head -20
```

**変更内容**: `executeAsync` メソッドを追加し、内部 progress hook と snapshot bridge を分離

```typescript
// RuntimeSkillCreatorFacade.ts に追加
async executeAsync(
  planId: string,
  args: {
    planId: string;
    skillSpec: string;
    authMode?: AuthMode;
    apiKey?: string | null;
  },
): Promise<void> {
  // constructor で onPhaseChanged -> onWorkflowStateSnapshot の bridge を wiring 済み
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

確認事項:

- `this.workflowEngine` と `this.onWorkflowStateSnapshot` の既存 DI/責務境界を確認すること
- `errorMessage` のログ出力に機密情報が含まれないことを確認すること
- `SkillCreatorWorkflowUiSnapshot` を public relay の snapshot として再利用できることを確認すること

### ステップ 5: TypeScript 型チェックとテスト実行

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テストファイル 1: Green 確認
pnpm --filter @repo/desktop exec vitest run \
  src/preload/__tests__/ipc-utils.execute-plan-timeout.test.ts

# テストファイル 2: Green 確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts

# テストファイル 3: Green 確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.phase-events.test.ts
```

Phase 4 の全テスト（TC-T1-01, TC-T1-02, TC-T2-01〜04, TC-T3-01〜04）が全て PASS することを確認する。

## 実装上の注意事項

| 注意点                  | 内容                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `void` キーワード       | `void runtimeSkillCreatorService.executeAsync(planId, args)` は ESLint ルール `@typescript-eslint/no-floating-promises` への対応 |
| エラー隔離              | `executeAsync` 内で catch してスローしないことで、ハンドラーへのエラー伝播を防ぐ                                                 |
| 戻り値の変更            | `{ success: true }` → `{ accepted: true, planId }` の breaking change 影響を事前確認すること                                     |
| Optional Chaining       | `this.onPhaseChanged?.(planId, phase, progress)` の `?.` で未設定時の TypeScript 型安全を確保                                    |
| CHANNEL_TIMEOUTS export | テストが `CHANNEL_TIMEOUTS` を import できるよう export されていることを確認                                                     |

## 多角的チェック観点

- `void runtimeSkillCreatorService.executeAsync(planId, args)` の fire-and-forget が実際に ESLint エラーを発生させないか確認したか
- `executeAsync` 内でエラーが `throw` されないことで、呼び出し元の `ipcMain.handle` が例外を受け取らないことを確認したか
- Renderer 側（`SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` 等）が戻り値 `{ accepted, planId }` を正しく処理できるか確認したか
- `onPhaseChanged?.()` が内部 progress hook として only-engine で完結しているか確認したか

## 成果物

| 成果物                      | パス                                                                   | 説明           |
| --------------------------- | ---------------------------------------------------------------------- | -------------- |
| CHANNEL_TIMEOUTS 追加       | `apps/desktop/src/preload/ipc-utils.ts`                                | 実装済みコード |
| fire-and-forget ハンドラー  | `apps/desktop/src/main/ipc/creatorHandlers.ts`                         | 実装済みコード |
| onPhaseChanged callback     | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 実装済みコード |
| executeAsync + ワイヤリング | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | 実装済みコード |

## 完了条件

- [ ] `CHANNEL_TIMEOUTS` に `"skill-creator:execute-plan": 1_800_000` が追加されている
- [ ] `creatorHandlers.ts` の execute ハンドラーが `void runtimeSkillCreatorService.executeAsync(planId, args)` + 即時 return に変更されている
- [ ] `SkillCreatorWorkflowEngine` に `onPhaseChanged?: PhaseChangedCallback` が追加されている
- [ ] `RuntimeSkillCreatorFacade` に `executeAsync(planId, args): Promise<void>` が追加されている
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] Phase 4 の全テスト（TC-T1-01〜02, TC-T2-01〜04, TC-T3-01〜04）が全て PASS している（Green）

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（修正ファイル 4 本）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 6: テスト拡充 へ進む
