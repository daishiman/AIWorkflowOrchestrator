# テスト戦略 - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## 既存テスト構造

`SkillCreatorService.test.ts` は以下のテストグループを含む:

- SC-001〜SC-031: detectMode, createSkill, executeTasks, validateSkill など
- BC-001〜BC-005: 境界値・エラーケース
- BV-001〜BV-008: 入力バリデーション
- TC-01〜TC-07: generate_skill_md.js 引数検証
- create モード: TC-01〜TC-B06

## 追加テスト設計

### TC-SC-CONNECT-01（正常系）

**シナリオ**: `runCreateWorkflow` が `StructurePlanJson` を返した場合に `generateSkillMd` が呼ばれる

```typescript
it("TC-SC-CONNECT-01: runCreateWorkflow が StructurePlanJson を返す場合 generateSkillMd が呼ばれる", async () => {
  // Arrange: loadAgent を正常動作させ structurePlan を生成させる
  mockResourceLoader.loadAgent.mockResolvedValue("mock-agent");
  const generateSkillMdSpy = vi
    .spyOn(service as any, "generateSkillMd")
    .mockResolvedValue(undefined);
  // ...
  // Assert: generateSkillMd が1回呼ばれた
  expect(generateSkillMdSpy).toHaveBeenCalledTimes(1);
  expect(generateSkillMdSpy).toHaveBeenCalledWith(
    expect.stringContaining("test-skill"),
    expect.objectContaining({ skillName: "test-skill" }),
  );
});
```

### TC-SC-CONNECT-02（null ケース - generateSkillMd 未呼び出し）

**シナリオ**: `runCreateWorkflow` が `null` を返した場合に `generateSkillMd` が呼ばれない

```typescript
it("TC-SC-CONNECT-02: runCreateWorkflow が null を返す場合 generateSkillMd が呼ばれない", async () => {
  // Arrange: loadAgent 失敗 → runCreateWorkflow が null 返却
  mockResourceLoader.loadAgent.mockRejectedValue(new Error("Agent not found"));
  const generateSkillMdSpy = vi.spyOn(service as any, "generateSkillMd");
  // ...
  // Assert: generateSkillMd が呼ばれていない
  expect(generateSkillMdSpy).not.toHaveBeenCalled();
});
```

### TC-SC-CONNECT-03（null ケース - エラーログ）

**シナリオ**: `runCreateWorkflow` が `null` を返した場合にエラーログが出力される

```typescript
it("TC-SC-CONNECT-03: runCreateWorkflow が null を返す場合 console.error が呼ばれる", async () => {
  // Arrange: loadAgent 失敗
  mockResourceLoader.loadAgent.mockRejectedValue(new Error("Agent not found"));
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  // ...
  // Assert: console.error が適切なメッセージで呼ばれた
  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining("runCreateWorkflow returned null"),
  );
});
```

## テストダブルの方針

| 対象                | 方針                                              |
| ------------------- | ------------------------------------------------- |
| `runCreateWorkflow` | `loadAgent` モックで間接的に制御（内部実装経由）  |
| `generateSkillMd`   | `vi.spyOn` でスパイ（実装は `mockResolvedValue`） |
| `console.error`     | `vi.spyOn(console, 'error')` でスパイ             |
| `scriptExecutor`    | 既存の `mockScriptExecutor` を流用                |

## カバレッジ目標

| 指標              | 目標 |
| ----------------- | ---- |
| 接続コード行      | 100% |
| null ブランチ     | 100% |
| non-null ブランチ | 100% |
