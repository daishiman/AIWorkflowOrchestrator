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
const CHANNEL_TIMEOUTS: Record<string, number> = {
  // 既存のエントリ（変更なし）
  "skill-creator:execute-plan": 1_800_000, // 30分: スキル生成は最大30分かかるため
};
```

確認事項:

- `CHANNEL_TIMEOUTS` が `export` されているか確認する（テスト用）
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
  // エラーは executeAsync 内で SKILL_CREATOR_WORKFLOW_STATE_CHANGED に通知される
  void facade.executeAsync(planId, req);
  return { accepted: true, planId }; // 100ms 以内に即座に返す
});
```

確認事項:

- `facade` が `creatorHandlers.ts` のスコープでアクセス可能か確認する
- `void` キーワードで ESLint の `no-floating-promises` を満たすこと
- 戻り値の型変更（`{ success }` → `{ accepted, planId }`）が Renderer 側に影響しないか確認する

### ステップ 3: SkillCreatorWorkflowEngine.ts の修正

```bash
# 現状確認
grep -n "WorkflowPhase\|phase\|transition" apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts | head -20
```

**変更内容**: `onPhaseChanged` オプション callback プロパティを追加

```typescript
// PhaseChangedCallback 型を追加（export）
export type PhaseChangedCallback = (
  phase: WorkflowPhase,
  progress: number,
) => void;

export class SkillCreatorWorkflowEngine {
  // onPhaseChanged callback を追加
  onPhaseChanged?: PhaseChangedCallback;

  // 既存のフェーズ遷移メソッドを修正して callback を呼ぶ
  private transitionToPhase(newPhase: WorkflowPhase, progress: number): void {
    // 既存の状態更新処理（変更なし）
    // ...

    // callback を呼ぶ（undefined の場合は Optional Chaining でスキップ）
    this.onPhaseChanged?.(newPhase, progress);
  }
}
```

確認事項:

- 既存のフェーズ遷移メソッド名を確認し、正しいメソッドに callback を追加すること
- `WorkflowPhase` 型が既存定義から import されているか確認すること
- `this.onPhaseChanged?.()` の Optional Chaining で undefined 時に例外が発生しないこと

### ステップ 4: RuntimeSkillCreatorFacade.ts の修正

```bash
# 現状確認
grep -n "execute\|WorkflowEngine\|mainWindow\|webContents" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | head -20
```

**変更内容**: `executeAsync` メソッドを追加し、`onPhaseChanged` を `webContents.send` にワイヤリング

```typescript
// RuntimeSkillCreatorFacade.ts に追加
import { SKILL_CREATOR_WORKFLOW_STATE_CHANGED } from '...'; // 既存 import の確認

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
    // エラーを SKILL_CREATOR_WORKFLOW_STATE_CHANGED で通知（throw しない）
    this.mainWindow.webContents.send(
      SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
      {
        planId,
        phase: 'failed',
        progress: 0,
        error: sanitizeErrorMessage(error)
      }
    );
  }
}
```

確認事項:

- `getOrCreateEngine(planId)` メソッドの名前を実際のコードで確認すること
- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` チャンネル定数の import パスを確認すること
- `sanitizeErrorMessage` の import 状況を確認すること
- `this.mainWindow` の参照方法（直接プロパティ or getter）を確認すること

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

| 注意点                  | 内容                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `void` キーワード       | `void facade.executeAsync(planId, req)` は ESLint ルール `@typescript-eslint/no-floating-promises` への対応 |
| エラー隔離              | `executeAsync` 内で catch してスローしないことで、ハンドラーへのエラー伝播を防ぐ                            |
| 戻り値の変更            | `{ success: true }` → `{ accepted: true, planId }` の breaking change 影響を事前確認すること                |
| Optional Chaining       | `this.onPhaseChanged?.(phase, progress)` の `?.` で未設定時の TypeScript 型安全を確保                       |
| CHANNEL_TIMEOUTS export | テストが `CHANNEL_TIMEOUTS` を import できるよう export されていることを確認                                |

## 多角的チェック観点

- `void facade.executeAsync()` の fire-and-forget が実際に ESLint エラーを発生させないか確認したか
- `executeAsync` 内でエラーが `throw` されないことで、呼び出し元の `ipcMain.handle` が例外を受け取らないことを確認したか
- Renderer 側（`creatorSlice.ts` 等）が戻り値 `{ accepted, planId }` を正しく処理できるか確認したか
- `onPhaseChanged?.()` が各フェーズ遷移メソッドで漏れなく呼ばれているか確認したか

## 成果物

| 成果物                      | パス                                                                   | 説明           |
| --------------------------- | ---------------------------------------------------------------------- | -------------- |
| CHANNEL_TIMEOUTS 追加       | `apps/desktop/src/preload/ipc-utils.ts`                                | 実装済みコード |
| fire-and-forget ハンドラー  | `apps/desktop/src/main/ipc/creatorHandlers.ts`                         | 実装済みコード |
| onPhaseChanged callback     | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 実装済みコード |
| executeAsync + ワイヤリング | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | 実装済みコード |

## 完了条件

- [ ] `CHANNEL_TIMEOUTS` に `"skill-creator:execute-plan": 1_800_000` が追加されている
- [ ] `creatorHandlers.ts` の execute ハンドラーが `void facade.executeAsync()` + 即時 return に変更されている
- [ ] `SkillCreatorWorkflowEngine` に `onPhaseChanged?: PhaseChangedCallback` が追加されている
- [ ] `RuntimeSkillCreatorFacade` に `executeAsync(planId, req): Promise<void>` が追加されている
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] Phase 4 の全テスト（TC-T1-01〜02, TC-T2-01〜04, TC-T3-01〜04）が全て PASS している（Green）

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（修正ファイル 4 本）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 6: テスト拡充 へ進む
