# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 6                                     |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

Phase 5 完了後、カバレッジ不足箇所を補完するテストを追加する。`execute()` に関して、`plan()` のテストパターン（L88-159）と同等の境界値・組み合わせテストを揃える。

対象の追加テストは3件。

- E-6: apiKey 未指定の api-key モード + integrated_api で execute が成功する
- E-7: apiKey 未指定の api-key モード + resolveWithService が terminal_handoff を返す（別パス）
- E-8: 明示的 apiKey + terminal_handoff（resolveWithService が呼ばれないことを確認）

## 実行タスク

1. `plan()` の L88-159 テストパターンを参照し、`execute()` における同等ケースをリストアップする
2. E-6, E-7, E-8 をテストファイルに追加する
3. 追加後のテストが全 PASS することを確認する

## 参照資料

- テスト対象: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- 参考パターン: 同ファイル `describe("plan")` ブロック L88-159
  - L88-108: apiKey 未指定の api-key モードでは authKeyService 経由の解決を使う
  - L110-139: apiKey 未指定の api-key モードで stored key がない場合は terminal_handoff
  - L141-159: 明示的 apiKey が渡された場合は resolveWithService を使わない
- Phase 5 成果物: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

## 実行手順

### Step 1: テストパターンの対応関係を確認する

| plan() テスト | execute() テスト | 内容                                                            |
| ------------- | ---------------- | --------------------------------------------------------------- |
| L88-108       | E-6              | apiKey 未指定 + integrated_api → executor 呼び出し成功          |
| L110-139      | E-7              | apiKey 未指定 + resolveWithService → terminal_handoff           |
| L141-159      | E-8              | 明示的 apiKey + resolve 呼び出し確認（terminal_handoff ケース） |

### Step 2: E-6 を追加する

`describe("execute")` ブロックの末尾に追加する。

```typescript
it("apiKey 未指定の api-key モードで resolveWithService が integrated_api を返す場合は executor に委譲する", async () => {
  vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
  vi.spyOn(
    RuntimePolicyResolver.prototype,
    "resolveWithService",
  ).mockResolvedValue({
    type: "integrated_api",
    apiKey: "stored-key",
    permissionMode: "default",
  });
  executeMock.mockResolvedValue({
    executionId: "exec-006",
    success: true,
  });
  vi.spyOn(Date, "now").mockReturnValue(1_710_000_000_006);

  const result = await facade.execute(
    {
      planId: "plan-006",
      skillSpec: "spec body",
      estimatedSteps: 3,
    },
    "api-key",
    null,
  );

  expect(executeMock).toHaveBeenCalled();
  expect(result).toEqual({
    executeId: "exec-006",
    skillName: "spec body",
    success: true,
    error: undefined,
  });
});
```

### Step 3: E-7 を追加する

E-4 は Phase 4 で「resolveWithService 経由の terminal_handoff」を検証済みだが、E-4 は `buildSpy` の呼び出しを `toHaveBeenCalled()` のみで確認している。E-7 では `buildSpy` の引数まで検証する。

```typescript
it("apiKey 未指定の api-key モードで resolveWithService が terminal_handoff を返す場合は build 引数が正しい", async () => {
  vi.spyOn(RuntimePolicyResolver.prototype, "resolve");
  vi.spyOn(
    RuntimePolicyResolver.prototype,
    "resolveWithService",
  ).mockResolvedValue({
    type: "terminal_handoff",
    bundle: {
      launcher: "claude",
      promptBundle: "",
      cwd: "/tmp",
      suggestedCommand: 'claude -p "fallback"',
      manualRetryRule: "retry",
    },
  });
  const handoffBundle = {
    launcher: "claude",
    promptBundle: "stored-spec",
    cwd: process.cwd(),
    suggestedCommand: "cmd",
    manualRetryRule: "retry",
  };
  const buildSpy = vi
    .spyOn(TerminalHandoffBuilder.prototype, "build")
    .mockReturnValue(handoffBundle);

  const result = await facade.execute(
    {
      planId: "plan-007",
      skillSpec: "stored-spec",
      estimatedSteps: 3,
    },
    "api-key",
    null,
  );

  expect(buildSpy).toHaveBeenCalledWith("stored-spec", process.cwd());
  expect(executeMock).not.toHaveBeenCalled();
  expect(result).toEqual({
    type: "terminal_handoff",
    bundle: handoffBundle,
  });
});
```

### Step 4: E-8 を追加する

`plan()` の L141-159 に対応するテスト。明示的 apiKey が渡された場合に `resolve` が呼ばれ `resolveWithService` が呼ばれないことを確認する。terminal_handoff が返る場合の分岐も検証する。

```typescript
it("明示的 apiKey が渡された場合は resolveWithService を使わない", async () => {
  const resolveSpy = vi
    .spyOn(RuntimePolicyResolver.prototype, "resolve")
    .mockResolvedValue({
      type: "terminal_handoff",
      bundle: {
        launcher: "claude",
        promptBundle: "",
        cwd: "/tmp",
        suggestedCommand: 'claude -p "fallback"',
        manualRetryRule: "retry",
      },
    });
  const resolveWithServiceSpy = vi.spyOn(
    RuntimePolicyResolver.prototype,
    "resolveWithService",
  );
  vi.spyOn(TerminalHandoffBuilder.prototype, "build").mockReturnValue({
    launcher: "claude",
    promptBundle: "spec",
    cwd: process.cwd(),
    suggestedCommand: "cmd",
    manualRetryRule: "retry",
  });

  await facade.execute(
    {
      planId: "plan-008",
      skillSpec: "spec",
      estimatedSteps: 3,
    },
    "api-key",
    "explicit-key",
  );

  expect(resolveSpy).toHaveBeenCalledWith("api-key", "explicit-key");
  expect(resolveWithServiceSpy).not.toHaveBeenCalled();
  expect(executeMock).not.toHaveBeenCalled();
});
```

### Step 5: 全テストが PASS することを確認する

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260323-120152-wt-5/apps/desktop
pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

全テスト（E-1 〜 E-8 を含む `describe` 配下の全ケース）が PASS することを確認する。

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

本 Phase は Unit テストのみ。`execute()` 戻り値の Union 型が IPC ハンドラに影響する場合のテストは別タスクスコープ。

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物                     | パス                                                                                 | 説明                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストファイル（追記済み） | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | E-6: apiKey 未指定 + integrated_api の execute 成功ケース、E-7: resolveWithService 経由 terminal_handoff の build 引数検証、E-8: 明示的 apiKey + resolveWithService 非呼び出し確認 |

## 完了条件

- [ ] E-6, E-7, E-8 が追加されている
- [ ] E-6: `executeMock` が呼ばれていることを確認している
- [ ] E-7: `buildSpy` の引数に `planResult.skillSpec` と `process.cwd()` が渡されていることを確認している
- [ ] E-8: `resolveWithService` が呼ばれていないことを確認している
- [ ] 全テスト（plan/execute/improve の全ケース）が PASS
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

Phase 7（カバレッジ確認）: カバレッジ計測と基準達成の確認
