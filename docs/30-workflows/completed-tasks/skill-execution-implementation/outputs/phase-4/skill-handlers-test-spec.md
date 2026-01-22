# skillHandlers.execute テスト仕様書

## Phase 4 - タスク2: skillHandlers のテスト

### 作成日

2026-01-18

---

## テストファイル

**パス**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`

---

## テストケース一覧

| TC-ID    | テストケース                    | 期待結果       | カテゴリ     |
| -------- | ------------------------------- | -------------- | ------------ |
| TC-4-005 | スキルを実行して結果を返す      | 実行結果を返却 | 正常系       |
| TC-4-006 | skillIdが文字列でない場合エラー | エラーを返却   | 異常系       |
| TC-4-007 | sender検証に失敗した場合エラー  | エラーをthrow  | セキュリティ |

---

## 詳細仕様

### TC-4-005: スキルを実行して結果を返す

**目的**: skill:execute ハンドラーが SkillService.executeSkill を呼び出し、結果を返すことを確認

**前提条件**:

- SkillService がモックされている
- ハンドラーが登録されている

**テスト内容**:

```typescript
// Given: モックされた実行結果
const mockResult: SkillExecutionResult = {
  executionId: "exec-123",
  status: "success",
  output: "Skill executed",
  startedAt: new Date(),
  completedAt: new Date(),
};
mockSkillService.executeSkill.mockResolvedValue(mockResult);

// When: ハンドラーを呼び出す
const result = await handler({}, { skillId: "skill-1" });

// Then: skillService.executeSkillが呼び出される
expect(mockSkillService.executeSkill).toHaveBeenCalledWith(
  "skill-1",
  undefined,
);

// Then: OperationResult形式で結果が返される
expect(result.success).toBe(true);
expect(result.data.executionId).toBe("exec-123");
```

**期待結果**:

- SkillService.executeSkill が正しい引数で呼び出される
- OperationResult 形式で結果が返される

---

### TC-4-006: skillIdが文字列でない場合エラー

**目的**: skillId のバリデーションを確認

**テスト内容**:

```typescript
// When: skillIdが数値
const result = await handler({}, { skillId: 123 });

// Then: エラーが返される
expect(result.success).toBe(false);
expect(result.error).toBeDefined();
```

**バリデーション項目**:

| 入力                | 期待結果 |
| ------------------- | -------- |
| skillId: 123        | エラー   |
| skillId: null       | エラー   |
| skillId: undefined  | エラー   |
| skillId: ""         | エラー   |
| skillId: "valid-id" | 成功     |

---

### TC-4-007: sender検証に失敗した場合エラー

**目的**: IPC sender 検証のセキュリティを確認

**テスト内容**:

```typescript
// Given: sender検証が失敗
validateIpcSender.mockReturnValue({
  valid: false,
  errorCode: "IPC_UNAUTHORIZED",
  errorMessage: "Invalid sender",
});

// When: ハンドラーを呼び出す
const result = await handler({}, { skillId: "skill-1" });

// Then: エラーが返される（または例外がスローされる）
expect(result.success).toBe(false);
```

**期待結果**:

- validateIpcSender が呼び出される
- 検証失敗時はエラーレスポンスまたは例外

---

## ハンドラー実装パターン

```typescript
// Pattern 3: mainWindow + service
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXECUTE,
  async (
    event,
    args: { skillId: string; params?: Record<string, unknown> },
  ) => {
    // 1. sender検証
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // 2. 引数バリデーション
    if (typeof args.skillId !== "string" || args.skillId === "") {
      return { success: false, error: "スキルIDが必要です" };
    }

    // 3. サービス呼び出し
    try {
      const result = await skillService.executeSkill(args.skillId, args.params);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "スキル実行に失敗しました",
      };
    }
  },
);
```

---

## IPC チャネル定義

```typescript
// channels.ts に追加
export const IPC_CHANNELS = {
  // ... existing channels ...
  SKILL_EXECUTE: "skill:execute",
} as const;

// ALLOWED_INVOKE_CHANNELS に追加
export const ALLOWED_INVOKE_CHANNELS = [
  // ... existing channels ...
  IPC_CHANNELS.SKILL_EXECUTE,
];
```

---

## セキュリティ要件

| 項目               | 実装方法                    |
| ------------------ | --------------------------- |
| sender検証         | validateIpcSender           |
| 許可ウィンドウ     | mainWindow のみ             |
| 引数バリデーション | typeof + 空文字チェック     |
| エラーハンドリング | try-catch + OperationResult |

---

## 完了確認

- [x] TC-4-005 テストケース作成
- [x] TC-4-006 テストケース作成
- [x] TC-4-007 テストケース作成
- [x] テストファイル作成完了
