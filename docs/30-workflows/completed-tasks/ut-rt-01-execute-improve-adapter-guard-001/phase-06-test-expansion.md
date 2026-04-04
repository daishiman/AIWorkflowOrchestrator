# Phase 6: テスト拡充 — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| Phase    | 6                                               |
| タスクID | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 |
| 機能名   | ut-rt-01-execute-improve-adapter-guard-001      |
| 作成日   | 2026-04-04                                      |
| 依存     | Phase 5 完了                                    |

## 目的

fail path・回帰ガード・edge case を追加し、テストスイートの堅牢性を高める。

## 追加テスト一覧

### execute() の追加テスト

| テストID | シナリオ                                                            | 期待動作                                                            |
| -------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| T-EX-04  | `failed` → `setLLMAdapter()` → `execute()`                          | "ready" 遷移後は正常実行に到達する（guard を通過する）              |
| T-EX-05  | `failed` + reason が null                                           | `toActionableMessage(null)` → `"LLMAdapter の初期化に失敗しました"` |
| T-EX-06  | `initializing` 時に `execute()` を呼ぶと即座に return（100ms 未満） | タイムアウトなし                                                    |

### improve() の追加テスト

| テストID | シナリオ                                     | 期待動作                                               |
| -------- | -------------------------------------------- | ------------------------------------------------------ |
| T-IM-04  | `failed` → `setLLMAdapter()` → `improve()`   | "ready" 遷移後はバリデーション・LLM 呼び出しへ到達する |
| T-IM-05  | `initializing` 中、複数回 `improve()` を呼ぶ | 全て即座にエラーを返す                                 |

### 回帰ガードテスト

| テストID | シナリオ                                   | 期待動作                                                      |
| -------- | ------------------------------------------ | ------------------------------------------------------------- |
| T-REG-01 | `status === "ready"` で `execute()` を呼ぶ | ガードをバイパスし、既存の `resolveDecision()` ロジックへ進む |
| T-REG-02 | `status === "ready"` で `improve()` を呼ぶ | ガードをバイパスし、既存のバリデーションへ進む                |

## T-EX-04 のポイント

```typescript
it("T-EX-04: failed → setLLMAdapter() → execute() でガードをバイパスする", async () => {
  const facade = new RuntimeSkillCreatorFacade({
    skillExecutor: createMockSkillExecutor(),
  });
  facade.setLLMAdapterFailed("temporary error");
  facade.setLLMAdapter(createMockLLMAdapter()); // リカバリー

  // status === "ready" なので guard をバイパスし、resolveDecision() へ進む
  // resolveDecision() が terminal_handoff を返す形にして、guard 通過を証明
  vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
    type: "terminal_handoff",
    apiKey: null,
    permissionMode: "default",
  } as never);
  vi.spyOn(
    RuntimePolicyResolver.prototype,
    "resolveWithService",
  ).mockResolvedValue({
    type: "terminal_handoff",
    apiKey: null,
    permissionMode: "default",
  } as never);

  const result = await facade.execute(
    {
      planId: "plan-1",
      skillSpec: "test",
      estimatedSteps: 1,
      skillName: "test",
      description: "test",
      agents: [],
      scripts: [],
      triggers: [],
      anchors: [],
    },
    "api-key",
    "sk-test",
  );

  // success: false を返さず terminal_handoff の形式になること
  expect(result).not.toHaveProperty("error.code", "llm_adapter_unavailable");
});
```

## タイミング回帰テスト

```typescript
it("T-EX-06: initializing 時に execute() を呼ぶと即座に return する", async () => {
  const facade = new RuntimeSkillCreatorFacade({
    skillExecutor: createMockSkillExecutor(),
  });

  const start = Date.now();
  const result = await facade.execute(
    {
      planId: "plan-1",
      skillSpec: "test",
      estimatedSteps: 1,
      skillName: "test",
      description: "test",
      agents: [],
      scripts: [],
      triggers: [],
      anchors: [],
    },
    "api-key",
    "sk-test",
  );
  const elapsed = Date.now() - start;

  expect(result).toHaveProperty("success", false);
  expect(elapsed).toBeLessThan(100); // 即座に return（100ms 未満）
});
```

## 実行コマンド

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="adapter-status" --coverage
```

## 成果物

- Phase 6 テスト拡充書（本ファイル）
- 追加テスト T-EX-04〜06、T-IM-04〜05、T-REG-01〜02

## 完了条件

- [ ] T-EX-04〜06 が追加・PASS している
- [ ] T-IM-04〜05 が追加・PASS している
- [ ] T-REG-01〜02 が追加・PASS している
- [ ] 全テストがリグレッションなし

## 次のPhase

Phase 7: カバレッジ確認
