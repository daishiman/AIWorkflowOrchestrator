# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 6                            |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 1.5h                         |

## 目的

Phase 4 の基本テストに加え、エッジケース・並列実行・エラーパス・イベント完全性を検証するテストを追加する。Phase 7 のカバレッジ目標達成に向けてテストを充実させる。

## 実行タスク

1. エラーパステストの追加（`executeAsync` 内例外の伝播遮断確認）
2. 並列 planId 実行テストの追加
3. `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` ペイロードの完全性テスト追加
4. フェーズ遷移 progress 値の境界値テスト追加
5. 全テストが PASS することを確認する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像            |

## 実行手順

### ステップ 1: エラーパステストの追加

**追加先**: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts`

```typescript
// TC-T2-05: executeAsync がエラーになった後でも次の invoke が正常に動作する
it("TC-T2-05: 1回目の executeAsync がエラーになった後、2回目の invoke が正常に動作する", async () => {
  mockFacade.executeAsync
    .mockRejectedValueOnce(new Error("first execution failed"))
    .mockResolvedValueOnce(undefined);

  const result1 = await invokeExecutePlan({ planId: "plan-001" });
  const result2 = await invokeExecutePlan({ planId: "plan-002" });

  expect(result1).toEqual({ accepted: true, planId: "plan-001" });
  expect(result2).toEqual({ accepted: true, planId: "plan-002" });
  expect(mockFacade.executeAsync).toHaveBeenCalledTimes(2);
});

// TC-T2-06: planId が文字列であることを確認
it("TC-T2-06: planId が req から正しく抽出されて executeAsync に渡される", async () => {
  mockFacade.executeAsync.mockResolvedValue(undefined);
  const planId = "unique-plan-id-abc-123";

  await invokeExecutePlan({ planId });

  expect(mockFacade.executeAsync).toHaveBeenCalledWith(
    planId,
    expect.objectContaining({ planId }),
  );
});
```

### ステップ 2: 並列実行テストの追加

**追加先**: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts`

```typescript
// TC-T2-07: 10 件の並列 invoke が全て 100ms 以内に返る
it("TC-T2-07: 10 件の並列 invoke が全て 100ms 以内に { accepted: true } を返す", async () => {
  const neverResolves = () => new Promise<void>(() => {});
  mockFacade.executeAsync.mockImplementation(neverResolves);

  const startTime = Date.now();
  const results = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      invokeExecutePlan({ planId: `plan-${i.toString().padStart(3, "0")}` }),
    ),
  );
  const elapsed = Date.now() - startTime;

  expect(elapsed).toBeLessThan(100);
  results.forEach((result, i) => {
    expect(result).toEqual({
      accepted: true,
      planId: `plan-${i.toString().padStart(3, "0")}`,
    });
  });
});
```

### ステップ 3: onPhaseChanged / snapshot bridge テスト

**追加先**: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.phase-events.test.ts`

```typescript
// TC-T3-05: onPhaseChanged のペイロードが planId / phase / progress を持つ
it("TC-T3-05: onPhaseChanged callback に渡される progress が 0〜100 の範囲である", () => {
  const engine = new SkillCreatorWorkflowEngine();
  const receivedProgress: number[] = [];
  const receivedPlanIds: string[] = [];
  engine.onPhaseChanged = (planId, _phase, progress) => {
    receivedPlanIds.push(planId);
    receivedProgress.push(progress);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  };

  engine.triggerPhaseTransition("plan-001", "executing", 10);
  engine.triggerPhaseTransition("plan-001", "complete", 30);
  engine.triggerPhaseTransition("plan-001", "error", 70);
  engine.triggerPhaseTransition("plan-002", "executing", 100);

  expect(receivedProgress).toEqual([10, 30, 70, 100]);
  expect(receivedPlanIds).toEqual([
    "plan-001",
    "plan-001",
    "plan-001",
    "plan-002",
  ]);
});

// TC-T3-06: onPhaseChanged が後から差し替えられた場合に新しい callback が呼ばれる
it("TC-T3-06: onPhaseChanged を後から差し替えると新しい callback が呼ばれる", () => {
  const engine = new SkillCreatorWorkflowEngine();
  const firstCallback = vi.fn();
  const secondCallback = vi.fn();

  engine.onPhaseChanged = firstCallback;
  engine.triggerPhaseTransition("plan-001", "executing", 10);

  engine.onPhaseChanged = secondCallback;
  engine.triggerPhaseTransition("plan-001", "complete", 30);

  expect(firstCallback).toHaveBeenCalledTimes(1);
  expect(secondCallback).toHaveBeenCalledTimes(1);
});
```

### ステップ 4: Facade の executeAsync エラー処理テスト

**追加先**: 新規ファイル `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`

```typescript
// TC-T4-01: executeAsync の成功時に snapshot callback を通知する
it("TC-T4-01: executeAsync の成功時に snapshot callback を通知する", async () => {
  const { executeMock, facade, workflowEngine } = createFacade();
  const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
  const completeSpy = vi.fn();
  facade.onWorkflowStateSnapshot = completeSpy;

  vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
    type: "integrated_api",
    apiKey: "sk-test",
    permissionMode: "default",
  });
  executeMock.mockResolvedValue({
    executionId: "exec-001",
    success: true,
  });

  await facade.executeAsync("plan-001", {
    planId: "plan-001",
    skillSpec: "  skill spec  ",
    authMode: "api-key",
    apiKey: "sk-test",
  });

  expect(executeMock).toHaveBeenCalledTimes(1);
  expect(phaseSpy).toHaveBeenNthCalledWith(1, "plan-001", "executing", 0);
  expect(phaseSpy).toHaveBeenNthCalledWith(2, "plan-001", "complete", 100);
  expect(completeSpy).toHaveBeenCalledTimes(1);
  expect(completeSpy).toHaveBeenCalledWith(
    "plan-001",
    expect.objectContaining({
      planId: "plan-001",
      currentPhase: "verify",
    }),
  );
});

// TC-T4-02: executeAsync の失敗時に throw せず failure callback を通知する
it("TC-T4-02: executeAsync の失敗時に throw せず failure callback を通知する", async () => {
  const { executeMock, facade, workflowEngine } = createFacade();
  const phaseSpy = vi.spyOn(workflowEngine, "triggerPhaseTransition");
  const completeSpy = vi.fn();
  facade.onWorkflowStateSnapshot = completeSpy;

  vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockRejectedValue(
    new Error("resolve failed"),
  );
  executeMock.mockResolvedValue({
    executionId: "exec-002",
    success: true,
  });

  await expect(
    facade.executeAsync("plan-002", {
      planId: "plan-002",
      skillSpec: "skill spec",
      authMode: "api-key",
      apiKey: "sk-test",
    }),
  ).resolves.toBeUndefined();

  expect(executeMock).not.toHaveBeenCalled();
  expect(phaseSpy).toHaveBeenNthCalledWith(1, "plan-002", "executing", 0);
  expect(phaseSpy).toHaveBeenNthCalledWith(2, "plan-002", "error", 0);
  expect(completeSpy).toHaveBeenCalledTimes(1);
  expect(completeSpy).toHaveBeenCalledWith("plan-002", null, "resolve failed");
});
```

### ステップ 5: 全テスト実行

```bash
# 拡充後の全テスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/preload/__tests__/ipc-utils.execute-plan-timeout.test.ts \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts \
  src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.phase-events.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

## エッジケース一覧

| エッジケース                | テストID | 期待結果                                         |
| --------------------------- | -------- | ------------------------------------------------ |
| 1 回目エラー後の 2 回目正常 | TC-T2-05 | 2 回目も `{ accepted: true }` を返す             |
| planId の正確な受け渡し     | TC-T2-06 | `executeAsync` が正しい planId を受け取る        |
| 10 件並列 invoke            | TC-T2-07 | 全件 100ms 以内に返る                            |
| progress 値の境界           | TC-T3-05 | 0〜100 の範囲                                    |
| callback 差し替え           | TC-T3-06 | 新しい callback が呼ばれる                       |
| executeAsync 成功通知       | TC-T4-01 | `onWorkflowStateSnapshot` が snapshot を受け取る |
| executeAsync 失敗非伝播     | TC-T4-02 | `executeAsync` が resolve し、例外を外へ出さない |

## 多角的チェック観点

- TC-T2-07 の 10 件並列テストが実際の Electron 環境でも意味を持つか（Node.js シングルスレッドでも並列 ipcMain.handle の呼び出しは可能か）確認したか
- TC-T4-01 / TC-T4-02 のモック設定が実際の Facade DI 構造と合致しているか確認したか
- `RuntimeSkillCreatorFacade.executeAsync.test.ts` の成功/失敗両方で `triggerPhaseTransition` の planId が一致しているか確認したか

## 成果物

| 成果物             | パス                                       | 説明                           |
| ------------------ | ------------------------------------------ | ------------------------------ |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` | 追加テストケース一覧と実行結果 |

## 完了条件

- [ ] TC-T2-05〜07 のエッジケーステストが追加されている
- [ ] TC-T3-05〜06 のフェーズ遷移エッジケーステストが追加されている
- [ ] TC-T4-01〜02 の Facade エラー処理テストが追加されている
- [ ] 全テストが PASS している
- [ ] `test-expansion-report.md` に追加テストケース一覧が記録されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-6/test-expansion-report.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 7: カバレッジ確認 へ進む
