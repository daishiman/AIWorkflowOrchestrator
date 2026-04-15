# Phase 4: テストマトリクス

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 4                                      |
| 作成日 | 2026-04-14                             |
| タスク | UT-HEALTH-POLICY-RUNTIME-INJECTION-001 |

---

## createMockHealthPolicy 定義

```typescript
function makeDegradedPolicy(): HealthPolicy {
  return {
    isConnectionAvailable: true,
    isDegraded: true,
    isRateLimited: false,
    healthStatus: "degraded",
    lastCheckedAt: new Date("2026-04-07T00:00:00Z"),
  };
}
```

（各テストファイルに独立して定義）

---

## テストマトリクス（TC-H-01〜TC-H-04）

| TC番号  | テスト名                                                                      | 対象メソッド | 期待結果                                          | 追加先ファイル                           | 実装状態  |
| ------- | ----------------------------------------------------------------------------- | ------------ | ------------------------------------------------- | ---------------------------------------- | --------- |
| TC-H-01 | `healthPolicy が degraded の場合、api-key が有効でも terminal_handoff を返す` | `execute()`  | `terminal_handoff` 型レスポンスを返す             | `RuntimeSkillCreatorFacade.test.ts`      | ✅ 実装済 |
| TC-H-02 | `healthPolicy なし（後方互換）`                                               | constructor  | インスタンス生成成功・既存動作維持                | `RuntimeSkillCreatorFacade.test.ts`      | ✅ 実装済 |
| TC-H-03 | `healthPolicy が degraded の場合、api-key が有効でも terminal_handoff になる` | `plan()`     | `terminal_handoff` 型レスポンス、LLM 呼び出しなし | `RuntimeSkillCreatorFacade.plan.test.ts` | ✅ 実装済 |
| TC-H-04 | `terminal_handoff 判定時、LLM 呼び出しが行われない`                           | `plan()`     | `mockLLMAdapter.sendChat` が呼ばれないこと        | `RuntimeSkillCreatorFacade.plan.test.ts` | ✅ 実装済 |

---

## 追加先ファイル詳細

### `RuntimeSkillCreatorFacade.test.ts`（execute テスト）

```typescript
// describe("execute") 内
it("healthPolicy が degraded の場合、api-key が有効でも terminal_handoff を返す", async () => {
  const degradedFacade = new RuntimeSkillCreatorFacade({
    skillExecutor: { execute: executeMock } as unknown as SkillExecutor,
    llmAdapter: { ... } as unknown as ILLMAdapter,
    healthPolicy: makeDegradedPolicy(),  // isDegraded: true
  });

  const result = await degradedFacade.execute({...}, "api-key", "sk-valid-key");

  expect(result).toHaveProperty("type", "terminal_handoff");
  expect(executeMock).not.toHaveBeenCalled();  // 実行されないこと
});
```

### `RuntimeSkillCreatorFacade.plan.test.ts`（plan テスト）

```typescript
// describe("terminal_handoff 経路の非破壊") 内
it("healthPolicy が degraded の場合、api-key が有効でも terminal_handoff になる", async () => {
  const degradedFacade = new RuntimeSkillCreatorFacade({
    skillExecutor: mockSkillExecutor,
    llmAdapter: mockLLMAdapter,
    resourceLoader: mockResourceLoader as never,
    healthPolicy: makeDegradedPolicy(), // isDegraded: true
  });

  const result = await degradedFacade.plan("spec", "api-key", "sk-valid-key");

  expect(result).toHaveProperty("type", "terminal_handoff");
  expect(mockResourceLoader.loadAgent).not.toHaveBeenCalled();
  expect(mockLLMAdapter.sendChat).not.toHaveBeenCalled();
});
```

---

## 事前確認結果

| 確認項目                   | 結果                                      |
| -------------------------- | ----------------------------------------- |
| 既存ユーティリティ重複検出 | なし（各ファイルで独立して定義）          |
| 既存テスト構造の把握       | beforeEach で facade 生成パターン確認済み |
| plan テストの既存ケース    | LLM Integration テスト群が存在            |
| トップレベル副作用確認     | なし（import 安全）                       |
