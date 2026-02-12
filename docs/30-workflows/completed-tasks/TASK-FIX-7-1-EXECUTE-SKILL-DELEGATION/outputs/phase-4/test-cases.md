# テストケース一覧

## タスク情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| Phase    | 4                                     |
| 作成日   | 2026-02-11                            |
| 状態     | 完了                                  |

## テストケース概要

| TC-ID | テストケース名           | カテゴリ | 期待動作                               |
| ----- | ------------------------ | -------- | -------------------------------------- |
| TC-1  | 正常実行                 | 正常系   | SkillExecutor に委譲して結果を返す     |
| TC-2  | SkillExecutor 未初期化   | 異常系   | エラーをスローする                     |
| TC-3  | スキル未検出             | 異常系   | エラーをスローする                     |
| TC-4  | 型変換検証               | 正常系   | Skill → SkillMetadata 変換が正しい     |
| TC-5  | SkillExecutor エラー伝播 | 異常系   | エラーを上位に伝播する                 |
| TC-6  | スキル未インポート       | 異常系   | エラーをスローする                     |
| TC-7  | オプションパラメータ     | 正常系   | timeout, sessionId, retryConfig を渡す |

---

## TC-1: 正常実行（SkillExecutor に委譲）

### 概要

- **目的**: SkillService.executeSkill() が SkillExecutor.execute() に正しく委譲することを確認
- **カテゴリ**: 正常系
- **優先度**: 高

### 前提条件

1. SkillExecutor が setSkillExecutor() で注入済み
2. スキルがキャッシュに存在する
3. スキルがインポート済み

### テストコード

```typescript
it("should delegate execution to SkillExecutor", async () => {
  // Arrange
  const skillId = "test-skill-id";
  const expectedResponse: SkillExecutionResponse = {
    executionId: "exec-123",
    success: true,
  };

  // スキルをキャッシュに追加
  mockSkillParser.parse.mockResolvedValue(testSkill);
  await skillService.scanAvailableSkills();

  // インポート状態を設定
  mockSkillImportManager.isImported.mockReturnValue(true);

  // SkillExecutor の戻り値を設定
  mockSkillExecutor.execute.mockResolvedValue(expectedResponse);

  // Act
  const result = await skillService.executeSkill(skillId, {
    prompt: "test prompt",
  });

  // Assert
  expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(1);
  expect(result).toEqual(expectedResponse);
});
```

### 期待結果

- `mockSkillExecutor.execute` が1回呼び出される
- 戻り値が `{ executionId: "exec-123", success: true }` と一致する

---

## TC-2: SkillExecutor 未初期化エラー

### 概要

- **目的**: SkillExecutor が未設定の場合にエラーをスローすることを確認
- **カテゴリ**: 異常系
- **優先度**: 高

### 前提条件

1. `setSkillExecutor()` が呼び出されていない

### テストコード

```typescript
it("should throw error when SkillExecutor is not initialized", async () => {
  // Arrange
  const newService = new SkillService(
    mockSkillScanner,
    mockSkillParser,
    mockSkillImportManager,
  );
  // setSkillExecutor を呼ばない

  // Act & Assert
  await expect(newService.executeSkill("test-skill-id")).rejects.toThrow(
    "SkillExecutor が初期化されていません",
  );
});
```

### 期待結果

- `"SkillExecutor が初期化されていません"` というエラーがスローされる

---

## TC-3: スキル未検出エラー

### 概要

- **目的**: 指定したスキルが存在しない場合にエラーをスローすることを確認
- **カテゴリ**: 異常系
- **優先度**: 高

### 前提条件

1. SkillExecutor が注入済み
2. 指定したスキル ID がキャッシュに存在しない

### テストコード

```typescript
it("should throw error when skill does not exist", async () => {
  // Arrange
  mockSkillScanner.scanDirectory.mockResolvedValue([]);
  await skillService.scanAvailableSkills();

  // Act & Assert
  await expect(skillService.executeSkill("non-existent-skill")).rejects.toThrow(
    "スキルが見つかりません",
  );
});
```

### 期待結果

- `"スキルが見つかりません"` というエラーがスローされる

---

## TC-4: 型変換検証（Skill → SkillMetadata）

### 概要

- **目的**: Skill 型から SkillMetadata 型への変換が正しく行われることを確認
- **カテゴリ**: 正常系
- **優先度**: 高

### 前提条件

1. SkillExecutor が注入済み
2. スキルがキャッシュに存在する
3. スキルがインポート済み

### テストコード

```typescript
it("should convert Skill to SkillMetadata correctly", async () => {
  // Arrange
  const testSkill: Skill = {
    id: "skill-1",
    name: "Test Skill",
    slug: "test-skill",
    description: "Test description",
    path: "/skills/test",
    triggers: ["@test"],
    anchors: [{ source: "src", application: "app", purpose: "test" }],
    allowedTools: ["Read", "Write"],
    category: "development",
    lastModified: new Date("2026-01-01"),
  };

  mockSkillParser.parse.mockResolvedValue(testSkill);
  mockSkillScanner.scanDirectory.mockResolvedValue(["/skills/test"]);
  await skillService.scanAvailableSkills();
  mockSkillImportManager.isImported.mockReturnValue(true);
  mockSkillExecutor.execute.mockResolvedValue({
    executionId: "e1",
    success: true,
  });

  // Act
  await skillService.executeSkill("skill-1", { prompt: "test" });

  // Assert
  const [request, metadata] = mockSkillExecutor.execute.mock.calls[0];

  expect(metadata).toEqual({
    id: "skill-1",
    name: "Test Skill",
    slug: "test-skill",
    description: "Test description",
    path: "/skills/test",
    triggers: ["@test"],
    anchors: [{ source: "src", application: "app", purpose: "test" }],
    allowedTools: ["Read", "Write"],
    category: "development",
  });
  // lastModified が含まれていないことを確認
  expect(metadata).not.toHaveProperty("lastModified");
});
```

### 期待結果

- `SkillMetadata` に `lastModified` が含まれていない
- その他のフィールドが正しく変換されている

---

## TC-5: SkillExecutor エラー時の伝播

### 概要

- **目的**: SkillExecutor.execute() がエラーをスローした場合、そのエラーが上位に伝播することを確認
- **カテゴリ**: 異常系
- **優先度**: 中

### 前提条件

1. SkillExecutor が注入済み
2. スキルが存在しインポート済み
3. SkillExecutor.execute() がエラーをスローする

### テストコード

```typescript
it("should propagate SkillExecutor errors", async () => {
  // Arrange
  mockSkillParser.parse.mockResolvedValue(testSkill);
  mockSkillScanner.scanDirectory.mockResolvedValue(["/skills/test"]);
  await skillService.scanAvailableSkills();
  mockSkillImportManager.isImported.mockReturnValue(true);

  const sdkError = new Error("SDK API call failed");
  mockSkillExecutor.execute.mockRejectedValue(sdkError);

  // Act & Assert
  await expect(
    skillService.executeSkill("test-skill-id", { prompt: "test" }),
  ).rejects.toThrow("SDK API call failed");
});
```

### 期待結果

- SkillExecutor からのエラーがそのまま上位に伝播する

---

## TC-6: スキル未インポートエラー

### 概要

- **目的**: スキルが存在するがインポートされていない場合にエラーをスローすることを確認
- **カテゴリ**: 異常系
- **優先度**: 中

### 前提条件

1. SkillExecutor が注入済み
2. スキルがキャッシュに存在する
3. スキルがインポートされていない（isImported = false）

### テストコード

```typescript
it("should throw error when skill is not imported", async () => {
  // Arrange
  mockSkillParser.parse.mockResolvedValue(testSkill);
  mockSkillScanner.scanDirectory.mockResolvedValue(["/skills/test"]);
  await skillService.scanAvailableSkills();

  // インポートされていない状態
  mockSkillImportManager.isImported.mockReturnValue(false);

  // Act & Assert
  await expect(skillService.executeSkill("test-skill-id")).rejects.toThrow(
    "スキルがインポートされていません",
  );
});
```

### 期待結果

- `"スキルがインポートされていません"` というエラーがスローされる

---

## TC-7: オプションパラメータの受け渡し

### 概要

- **目的**: timeout, sessionId, retryConfig などのオプションパラメータが正しく SkillExecutor に渡されることを確認
- **カテゴリ**: 正常系
- **優先度**: 中

### 前提条件

1. SkillExecutor が注入済み
2. スキルが存在しインポート済み

### テストコード

```typescript
it("should pass optional parameters to SkillExecutor", async () => {
  // Arrange
  mockSkillParser.parse.mockResolvedValue(testSkill);
  mockSkillScanner.scanDirectory.mockResolvedValue(["/skills/test"]);
  await skillService.scanAvailableSkills();
  mockSkillImportManager.isImported.mockReturnValue(true);
  mockSkillExecutor.execute.mockResolvedValue({
    executionId: "e1",
    success: true,
  });

  const params = {
    prompt: "test prompt",
    timeout: 60000,
    sessionId: "session-123",
    retryConfig: { maxRetries: 5 },
  };

  // Act
  await skillService.executeSkill("test-skill-id", params);

  // Assert
  const [request] = mockSkillExecutor.execute.mock.calls[0];

  expect(request).toEqual({
    prompt: "test prompt",
    skillId: "test-skill-id",
    timeout: 60000,
    sessionId: "session-123",
    retryConfig: { maxRetries: 5 },
  });
});
```

### 期待結果

- `SkillExecutionRequest` にすべてのオプションパラメータが含まれる

---

## テストマトリクス

| TC-ID | 初期化状態 | スキル存在 | インポート状態 | Executor 動作 | 期待結果           |
| ----- | ---------- | ---------- | -------------- | ------------- | ------------------ |
| TC-1  | 済         | 有         | 済             | 正常          | 成功レスポンス     |
| TC-2  | 未         | -          | -              | -             | 初期化エラー       |
| TC-3  | 済         | 無         | -              | -             | 未検出エラー       |
| TC-4  | 済         | 有         | 済             | 正常          | 型変換成功         |
| TC-5  | 済         | 有         | 済             | エラー        | エラー伝播         |
| TC-6  | 済         | 有         | 未             | -             | 未インポートエラー |
| TC-7  | 済         | 有         | 済             | 正常          | パラメータ受渡し   |

## 統合テストシナリオ

### 委譲フロー統合テスト

```typescript
describe("SkillService → SkillExecutor Integration", () => {
  it("should execute full delegation flow", async () => {
    // 1. スキルをスキャン
    // 2. スキルをインポート
    // 3. executeSkill を呼び出し
    // 4. SkillExecutor.execute が呼び出されることを確認
    // 5. レスポンスが正しく返されることを確認
  });
});
```
