# skillAPI.execute テスト仕様書

## Phase 4 - タスク1: skillAPI.execute のテスト

### 作成日

2026-01-18

---

## テストファイル

**パス**: `apps/desktop/src/renderer/preload/__tests__/skillAPI.execute.test.ts`

---

## テストケース一覧

| TC-ID    | テストケース                     | 期待結果                | カテゴリ |
| -------- | -------------------------------- | ----------------------- | -------- |
| TC-4-001 | スキルIDを指定して実行できる     | success: true, data定義 | 正常系   |
| TC-4-002 | パラメータ付きで実行できる       | success: true           | 正常系   |
| TC-4-003 | 存在しないスキルIDでエラーを返す | success: false          | 異常系   |
| TC-4-004 | 空のスキルIDでエラーを返す       | success: false          | 異常系   |

---

## 詳細仕様

### TC-4-001: スキルIDを指定して実行できる

**目的**: skillAPI.execute がスキルIDを受け取り、IPCを通じて実行結果を返すことを確認

**前提条件**:

- window.electronAPI.invoke がモックされている

**テスト内容**:

```typescript
// Given: モックされた成功レスポンス
const mockResult = {
  success: true,
  data: {
    executionId: "exec-123",
    status: "success",
    output: "Skill executed successfully",
    startedAt: new Date(),
    completedAt: new Date(),
  },
};

// When: execute メソッドを呼び出す
const result = await skillAPI.execute("skill-1");

// Then: IPCが正しいチャネルと引数で呼び出される
expect(mockInvoke).toHaveBeenCalledWith("skill:execute", {
  skillId: "skill-1",
});

// Then: 成功結果が返される
expect(result.success).toBe(true);
expect(result.data.executionId).toBe("exec-123");
```

**期待結果**:

- IPC チャネル `skill:execute` が呼び出される
- 引数形式: `{ skillId: string }`
- 戻り値: `OperationResult<SkillExecutionResult>`

---

### TC-4-002: パラメータ付きで実行できる

**目的**: オプションのパラメータを渡して実行できることを確認

**テスト内容**:

```typescript
// When: パラメータ付きで execute を呼び出す
const params = { key1: "value1", key2: 123 };
await skillAPI.execute("skill-2", params);

// Then: IPCがパラメータ付きで呼び出される
expect(mockInvoke).toHaveBeenCalledWith("skill:execute", {
  skillId: "skill-2",
  params: { key1: "value1", key2: 123 },
});
```

**期待結果**:

- params がオブジェクトとして渡される
- ネストされたオブジェクトや配列も対応

---

### TC-4-003: 存在しないスキルIDでエラーを返す

**目的**: 存在しないスキルIDに対してエラーレスポンスを返すことを確認

**テスト内容**:

```typescript
// Given: エラーレスポンス
mockInvoke.mockResolvedValue({
  success: false,
  error: "スキルが見つかりません",
});

// When: 存在しないスキルIDで実行
const result = await skillAPI.execute("nonexistent-skill");

// Then: エラー結果が返される
expect(result.success).toBe(false);
expect(result.error).toBeDefined();
```

**期待結果**:

- success: false
- error にエラーメッセージが含まれる

---

### TC-4-004: 空のスキルIDでエラーを返す

**目的**: 空文字のスキルIDに対してバリデーションエラーを返すことを確認

**テスト内容**:

```typescript
// When: 空のスキルIDで実行
const result = await skillAPI.execute("");

// Then: エラー結果が返される
expect(result.success).toBe(false);
expect(result.error).toBeDefined();
```

**期待結果**:

- success: false
- バリデーションエラーが返される

---

## API シグネチャ

```typescript
interface skillAPI {
  execute(
    skillId: string,
    params?: Record<string, unknown>,
  ): Promise<OperationResult<SkillExecutionResult>>;
}
```

---

## IPC チャネル

| チャネル名    | 方向            | 引数形式             | 戻り値形式                            |
| ------------- | --------------- | -------------------- | ------------------------------------- |
| skill:execute | Renderer → Main | { skillId, params? } | OperationResult<SkillExecutionResult> |

---

## 型定義

```typescript
interface SkillExecutionResult {
  executionId: string;
  status: "success" | "failed";
  output?: string;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}

interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## 完了確認

- [x] TC-4-001 テストケース作成
- [x] TC-4-002 テストケース作成
- [x] TC-4-003 テストケース作成
- [x] TC-4-004 テストケース作成
- [x] テストファイル作成完了
