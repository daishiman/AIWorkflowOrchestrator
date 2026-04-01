# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 4                            |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 2h                           |

## 目的

実装前にテストファイル 3 本を作成し、全て Red（失敗）状態であることを確認する。Phase 5 の実装によってこれらが Green になることがゴール。

## 実行タスク

1. `ipc-utils.execute-plan-timeout.test.ts` 作成（CHANNEL_TIMEOUTS 検証）
2. `creatorHandlers.fire-and-forget.test.ts` 作成（fire-and-forget 動作検証）
3. `SkillCreatorWorkflowEngine.phase-events.test.ts` 作成（onPhaseChanged 検証）
4. 3 本全てを Red 状態で確認する
5. 命名規則が Phase 1 で確認した camelCase と整合しているか検証する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像            |

## 実行手順

### ステップ 1: テストファイル 1 — CHANNEL_TIMEOUTS 検証

**ファイル**: `apps/desktop/src/preload/__tests__/ipc-utils.execute-plan-timeout.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { CHANNEL_TIMEOUTS } from "../ipc-utils";

describe("CHANNEL_TIMEOUTS - skill-creator:execute-plan", () => {
  it("TC-T1-01: CHANNEL_TIMEOUTS に skill-creator:execute-plan が 1_800_000ms で登録されている", () => {
    expect(CHANNEL_TIMEOUTS["skill-creator:execute-plan"]).toBe(1_800_000);
  });

  it("TC-T1-02: 1_800_000ms は 30 分であることを確認", () => {
    const thirtyMinutesMs = 30 * 60 * 1000;
    expect(CHANNEL_TIMEOUTS["skill-creator:execute-plan"]).toBe(
      thirtyMinutesMs,
    );
  });
});
```

Red 確認: `CHANNEL_TIMEOUTS` に `"skill-creator:execute-plan"` が未登録のため失敗する。

### ステップ 2: テストファイル 2 — fire-and-forget 動作検証

**ファイル**: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("creatorHandlers - skill-creator:execute-plan fire-and-forget", () => {
  let mockFacade: { executeAsync: ReturnType<typeof vi.fn> };
  let invokeExecutePlan: (req: { planId: string }) => Promise<unknown>;

  beforeEach(() => {
    mockFacade = { executeAsync: vi.fn().mockResolvedValue(undefined) };
    // ハンドラーのセットアップ（実際のテストでは ipcMain のモック経由）
  });

  it("TC-T2-01: execute-plan invoke が 100ms 以内に { accepted: true, planId } を返す", async () => {
    const slowExecution = new Promise<void>((resolve) =>
      setTimeout(resolve, 10_000),
    );
    mockFacade.executeAsync.mockReturnValue(slowExecution);

    const startTime = Date.now();
    const result = await invokeExecutePlan({ planId: "plan-001" });
    const elapsed = Date.now() - startTime;

    expect(result).toEqual({ accepted: true, planId: "plan-001" });
    expect(elapsed).toBeLessThan(100);
  });

  it("TC-T2-02: バックグラウンドで executeAsync が呼ばれる", async () => {
    mockFacade.executeAsync.mockResolvedValue(undefined);

    await invokeExecutePlan({ planId: "plan-001" });

    expect(mockFacade.executeAsync).toHaveBeenCalledWith(
      "plan-001",
      expect.any(Object),
    );
  });

  it("TC-T2-03: executeAsync がエラーを throw しても invoke は正常に返る", async () => {
    // executeAsync 内でエラーは catch されるため、invoke には伝播しない
    mockFacade.executeAsync.mockImplementation(async () => {
      throw new Error("Agent SDK error");
    });

    const result = await invokeExecutePlan({ planId: "plan-001" });

    // invoke は { accepted: true, planId } を返す（エラーが伝播しない）
    expect(result).toEqual({ accepted: true, planId: "plan-001" });
  });

  it("TC-T2-04: 複数の planId が並列で invoke されてもそれぞれ受け付けられる", async () => {
    const [result1, result2] = await Promise.all([
      invokeExecutePlan({ planId: "plan-001" }),
      invokeExecutePlan({ planId: "plan-002" }),
    ]);

    expect(result1).toEqual({ accepted: true, planId: "plan-001" });
    expect(result2).toEqual({ accepted: true, planId: "plan-002" });
  });
});
```

Red 確認: 現状ハンドラーが `await` でブロックするため TC-T2-01 が 100ms を超えて失敗する。

### ステップ 3: テストファイル 3 — onPhaseChanged 検証

**ファイル**: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.phase-events.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";
import { SkillCreatorWorkflowEngine } from "../SkillCreatorWorkflowEngine";

describe("SkillCreatorWorkflowEngine - onPhaseChanged callback", () => {
  it("TC-T3-01: onPhaseChanged が undefined の場合に例外が発生しない", () => {
    const engine = new SkillCreatorWorkflowEngine();
    engine.onPhaseChanged = undefined;

    // フェーズ遷移を発生させる（エンジンの内部メソッド経由）
    expect(() => engine.triggerPhaseTransition("analyzing", 10)).not.toThrow();
  });

  it("TC-T3-02: onPhaseChanged が登録されている場合にフェーズ遷移時に呼ばれる", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const mockCallback = vi.fn();
    engine.onPhaseChanged = mockCallback;

    engine.triggerPhaseTransition("analyzing", 10);

    expect(mockCallback).toHaveBeenCalledWith("analyzing", 10);
  });

  it("TC-T3-03: 複数のフェーズ遷移が順番通りに callback を呼ぶ", () => {
    const engine = new SkillCreatorWorkflowEngine();
    const calls: Array<[string, number]> = [];
    engine.onPhaseChanged = (phase, progress) => calls.push([phase, progress]);

    engine.triggerPhaseTransition("analyzing", 10);
    engine.triggerPhaseTransition("designing", 30);
    engine.triggerPhaseTransition("implementing", 60);

    expect(calls).toEqual([
      ["analyzing", 10],
      ["designing", 30],
      ["implementing", 60],
    ]);
  });

  it("TC-T3-04: onPhaseChanged callback が型 (WorkflowPhase, number) => void を受け取る", () => {
    const engine = new SkillCreatorWorkflowEngine();

    // TypeScript の型安全性を確認（コンパイル時エラーがないこと）
    const typedCallback: (phase: string, progress: number) => void = vi.fn();
    engine.onPhaseChanged = typedCallback;

    expect(engine.onPhaseChanged).toBe(typedCallback);
  });
});
```

Red 確認: `SkillCreatorWorkflowEngine` に `onPhaseChanged` プロパティが存在しないため全 TC が失敗する。

### ステップ 4: Red 状態の確認

```bash
# テストファイル 1: Red 確認
pnpm --filter @repo/desktop exec vitest run \
  src/preload/__tests__/ipc-utils.execute-plan-timeout.test.ts

# テストファイル 2: Red 確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts

# テストファイル 3: Red 確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.phase-events.test.ts
```

全テストが失敗することを確認する。

### ステップ 5: 命名規則の整合確認

| テスト内の識別子                                           | 命名規則   | 検証 |
| ---------------------------------------------------------- | ---------- | ---- |
| `executeAsync`                                             | camelCase  | OK   |
| `onPhaseChanged`                                           | camelCase  | OK   |
| `planId`                                                   | camelCase  | OK   |
| テストファイル名 `creatorHandlers.fire-and-forget.test.ts` | kebab-case | OK   |
| IPC チャンネル `'skill-creator:execute-plan'`              | kebab-case | OK   |

## 多角的チェック観点

- テストファイル 2 の TC-T2-03 で「executeAsync がエラーを throw しても invoke は正常」を検証しているか（エラー隔離の保証）
- テストファイル 3 の TC-T3-01 で `onPhaseChanged = undefined` 時の Optional Chaining を検証しているか
- 3 本のテストファイルが全て Red 状態であることが確認されているか（Green のままでは実装不要を意味する）
- `CHANNEL_TIMEOUTS` が `ipc-utils.ts` から export されているか確認したか（テストで import 可能か）

## 成果物

| 成果物                 | パス                                                                                               | 説明             |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ---------------- |
| タイムアウトテスト     | `apps/desktop/src/preload/__tests__/ipc-utils.execute-plan-timeout.test.ts`                        | Red 状態のテスト |
| fire-and-forget テスト | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts`                      | Red 状態のテスト |
| フェーズイベントテスト | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.phase-events.test.ts` | Red 状態のテスト |

## 完了条件

- [ ] `ipc-utils.execute-plan-timeout.test.ts` が作成されて Red 状態である
- [ ] `creatorHandlers.fire-and-forget.test.ts` が作成されて Red 状態である
- [ ] `SkillCreatorWorkflowEngine.phase-events.test.ts` が作成されて Red 状態である
- [ ] TC-T2-01（100ms 以内のレスポンス）が定義されている
- [ ] TC-T2-03（エラー隔離）が定義されている
- [ ] TC-T3-01（undefined callback 時の安全性）が定義されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（テストファイル 3 本）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 5: 実装 へ進む
