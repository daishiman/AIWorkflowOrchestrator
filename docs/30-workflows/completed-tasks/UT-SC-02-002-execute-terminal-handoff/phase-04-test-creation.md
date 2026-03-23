# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 4                                     |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

TDD の Red フェーズとして、`RuntimeSkillCreatorFacade.execute()` の terminal_handoff 分岐テストを先に記述し、実装前に失敗することを確認する。また、現行テスト L207-246 の矛盾（`terminal_handoff` 判定にも関わらず `executeMock` を呼ぶ設計）を修正し、テスト意図を明確にする。

## 実行タスク

1. 現行テスト L207-246 の問題を把握する
2. L207-246 を「integrated_api でエラーが返る場合」テストに書き直す
3. `describe("execute")` ブロックに terminal_handoff テストケースを3件追加する（Red 状態で追加）
4. テストが失敗することを `pnpm vitest run` で確認する

## 参照資料

- 実装対象: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- テスト対象: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- 型定義: `packages/shared/src/types/skillCreator.ts`
- plan() テストパターン（参考）: テストファイル L32-159
- Phase 2 設計書（前 Phase 成果物）: `docs/30-workflows/UT-SC-02-002-execute-terminal-handoff/phase-02-design.md`

## 実行手順

### Step 1: 現行テスト L207-246 の問題確認

テストファイルの L208-246 を読み取り、以下の矛盾を確認する。

- `resolve` が `terminal_handoff` を返している
- `executeMock` が呼ばれる（`await this.skillExecutor.execute(...)` が実行される）
- この設計は「terminal_handoff 時も SkillExecutor を呼ぶ」という誤った仕様を暗黙に表現している

現在の実装（`void decision;` 行）はこの矛盾を許容しているが、修正後は terminal_handoff 分岐で SkillExecutor を呼ばなくなる。

### Step 2: L208-246 を integrated_api パターンに書き直す

`describe("execute")` 内の2件目のテストを以下の内容に差し替える。

```typescript
it("SkillExecutor のエラーを message に変換し、skillName を 50 文字に切り詰める", async () => {
  vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
    type: "integrated_api",
    apiKey: "sk-test",
    permissionMode: "default",
  });
  executeMock.mockResolvedValue({
    executionId: "exec-002",
    success: false,
    error: {
      code: "EXECUTION_FAILED",
      message: "executor failed",
    },
  });
  const longSkillName =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-suffix";

  const result = await facade.execute(
    {
      planId: "plan-002",
      skillSpec: `${longSkillName}\nbody`,
      estimatedSteps: 3,
    },
    "api-key",
    "sk-test",
  );

  expect(result).toEqual({
    executeId: "exec-002",
    skillName: longSkillName.substring(0, 50),
    success: false,
    error: "executor failed",
  });
});
```

変更点: `resolve` の戻り値を `terminal_handoff` から `integrated_api` に変更する。`executeMock` が呼ばれることが自然な設計になる。

### Step 3: terminal_handoff テストケースを追加する（Red）

`describe("execute")` ブロックの末尾に以下の3件を追加する。これらは実装前なので失敗する（Red）。

#### テストケース E-3: terminal_handoff 判定時は builder の結果を返す

```typescript
it("terminal_handoff 判定時は builder の結果を返す", async () => {
  vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
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
    promptBundle: "Skill を実行してください: my-skill\nbody",
    cwd: process.cwd(),
    suggestedCommand: 'claude -p "execute"',
    manualRetryRule: "retry",
  };
  const buildSpy = vi
    .spyOn(TerminalHandoffBuilder.prototype, "build")
    .mockReturnValue(handoffBundle);

  const result = await facade.execute(
    {
      planId: "plan-003",
      skillSpec: "my-skill\nbody",
      estimatedSteps: 3,
    },
    "subscription",
    null,
  );

  expect(buildSpy).toHaveBeenCalledWith("my-skill\nbody", process.cwd());
  expect(executeMock).not.toHaveBeenCalled();
  expect(result).toEqual({
    type: "terminal_handoff",
    bundle: handoffBundle,
  });
});
```

#### テストケース E-4: apiKey 未指定の api-key モードで resolveWithService 経由の terminal_handoff

```typescript
it("apiKey 未指定の api-key モードで resolveWithService が terminal_handoff を返す場合", async () => {
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
  const buildSpy = vi
    .spyOn(TerminalHandoffBuilder.prototype, "build")
    .mockReturnValue({
      launcher: "claude",
      promptBundle: "prompt",
      cwd: process.cwd(),
      suggestedCommand: "cmd",
      manualRetryRule: "retry",
    });

  const result = await facade.execute(
    {
      planId: "plan-004",
      skillSpec: "spec",
      estimatedSteps: 3,
    },
    "api-key",
    null,
  );

  expect(buildSpy).toHaveBeenCalled();
  expect(executeMock).not.toHaveBeenCalled();
  expect(result).toHaveProperty("type", "terminal_handoff");
});
```

#### テストケース E-5: 明示的 apiKey + terminal_handoff

```typescript
it("明示的 apiKey 指定でも terminal_handoff は正しく返る", async () => {
  vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
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
    promptBundle: "spec body",
    cwd: process.cwd(),
    suggestedCommand: "cmd",
    manualRetryRule: "retry",
  };
  vi.spyOn(TerminalHandoffBuilder.prototype, "build").mockReturnValue(
    handoffBundle,
  );

  const result = await facade.execute(
    {
      planId: "plan-005",
      skillSpec: "spec body",
      estimatedSteps: 3,
    },
    "api-key",
    "explicit-key",
  );

  expect(executeMock).not.toHaveBeenCalled();
  expect(result).toEqual({
    type: "terminal_handoff",
    bundle: handoffBundle,
  });
});
```

### Step 4: Red を確認する

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260323-120152-wt-5/apps/desktop
pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

期待する結果:

- E-3, E-4, E-5 が FAIL（型エラーまたは戻り値不一致）
- E-1, E-2 (既存テスト) は PASS

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

本 Phase で追加するテストは Unit テストのみ。IPC ハンドラレベルの統合テストは Phase 6 の拡充対象外（別タスクスコープ）。

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物         | パス                                                                                             | 説明                                                                |
| -------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| テストファイル | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`（修正済み） | L208-246 を integrated_api パターンに書き直し、E-3, E-4, E-5 を追加 |

## 完了条件

- [ ] 既存テスト E-1, E-2 が PASS のまま維持される
- [ ] 追加テスト E-3, E-4, E-5 がいずれも FAIL（Red 確認）
- [ ] `executeMock.not.toHaveBeenCalled()` のアサーションが E-3, E-4, E-5 に含まれている
- [ ] L207-246 の `resolve` モックが `integrated_api` を返すように修正されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

Phase 5（実装）: `RuntimeSkillCreatorExecuteResponse` 型の追加と `execute()` の terminal_handoff 分岐実装
