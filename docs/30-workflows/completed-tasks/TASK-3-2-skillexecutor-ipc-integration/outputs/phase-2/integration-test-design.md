# 統合テスト設計 - TASK-3-2 Phase 2

## メタ情報

| 項目       | 内容           |
| ---------- | -------------- |
| 作成日     | 2026-01-25     |
| Phase      | 2              |
| タスク     | 統合テスト設計 |
| ステータス | 完了           |

---

## 1. テストシナリオ

### 1.1 シナリオ一覧

| シナリオID | シナリオ名        | 検証内容                              |
| ---------- | ----------------- | ------------------------------------- |
| IT-001     | スキル実行〜完了  | execute → onStream 受信 → 完了状態    |
| IT-002     | スキル実行中断    | execute → abort → 中断状態            |
| IT-003     | エラー発生時      | execute → エラー受信 → エラー表示     |
| IT-004     | 複数実行の分離    | 複数 executionId のメッセージ分離     |
| IT-005     | コンポーネントE2E | UI コンポーネント + Hook + API の統合 |

---

## 2. シナリオ詳細

### 2.1 IT-001: スキル実行〜完了

```typescript
describe("IT-001: スキル実行〜完了", () => {
  it("execute から complete まで正常に動作する", async () => {
    // Arrange
    const mockMessages: SkillStreamMessage[] = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "処理を開始します",
        timestamp: Date.now(),
        isComplete: false,
      },
      {
        executionId: "test-exec-001",
        id: "msg-2",
        type: "text",
        content: "処理が完了しました",
        timestamp: Date.now(),
        isComplete: false,
      },
      {
        executionId: "test-exec-001",
        id: "msg-3",
        type: "complete",
        content: "",
        timestamp: Date.now(),
        isComplete: true,
      },
    ];

    // skillAPI.execute をモック
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-001",
      success: true,
    });

    // skillAPI.onStream をモック（メッセージ送信シミュレーション）
    let streamCallback: (msg: SkillStreamMessage) => void;
    mockSkillAPI.onStream.mockImplementation((cb) => {
      streamCallback = cb;
      return () => {};
    });

    // Act
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // 実行開始
    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("running");

    // メッセージ送信
    for (const msg of mockMessages) {
      act(() => {
        streamCallback(msg);
      });
    }

    // Assert
    expect(result.current.status).toBe("completed");
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[0].content).toBe("処理を開始します");
  });
});
```

### 2.2 IT-002: スキル実行中断

```typescript
describe("IT-002: スキル実行中断", () => {
  it("abort 呼び出しで実行が中断される", async () => {
    // Arrange
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-002",
      success: true,
    });

    mockSkillAPI.abort.mockResolvedValue(true);

    let streamCallback: (msg: SkillStreamMessage) => void;
    mockSkillAPI.onStream.mockImplementation((cb) => {
      streamCallback = cb;
      return () => {};
    });

    // Act
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("running");

    // 中断実行
    await act(async () => {
      await result.current.abort();
    });

    expect(result.current.isAborting).toBe(true);

    // 中断メッセージ送信
    act(() => {
      streamCallback({
        executionId: "test-exec-002",
        id: "msg-abort",
        type: "error",
        content: "Execution aborted by user",
        timestamp: Date.now(),
        isComplete: true,
      });
    });

    // Assert
    expect(result.current.status).toBe("aborted");
    expect(mockSkillAPI.abort).toHaveBeenCalledWith("test-exec-002");
  });
});
```

### 2.3 IT-003: エラー発生時

```typescript
describe("IT-003: エラー発生時", () => {
  it("エラーメッセージ受信でエラー状態になる", async () => {
    // Arrange
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-003",
      success: true,
    });

    let streamCallback: (msg: SkillStreamMessage) => void;
    mockSkillAPI.onStream.mockImplementation((cb) => {
      streamCallback = cb;
      return () => {};
    });

    // Act
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    // エラーメッセージ送信
    act(() => {
      streamCallback({
        executionId: "test-exec-003",
        id: "msg-error",
        type: "error",
        content: "Network error occurred",
        timestamp: Date.now(),
        isComplete: true,
      });
    });

    // Assert
    expect(result.current.status).toBe("error");
    expect(result.current.error).toEqual({
      code: "EXECUTION_FAILED",
      message: "Network error occurred",
    });
  });
});
```

### 2.4 IT-004: 複数実行の分離

```typescript
describe("IT-004: 複数実行の分離", () => {
  it("異なる executionId のメッセージは無視される", async () => {
    // Arrange
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-004",
      success: true,
    });

    let streamCallback: (msg: SkillStreamMessage) => void;
    mockSkillAPI.onStream.mockImplementation((cb) => {
      streamCallback = cb;
      return () => {};
    });

    // Act
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    // 異なる executionId のメッセージ
    act(() => {
      streamCallback({
        executionId: "other-exec-id",
        id: "msg-other",
        type: "text",
        content: "他の実行のメッセージ",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    // Assert
    expect(result.current.messages).toHaveLength(0);

    // 正しい executionId のメッセージ
    act(() => {
      streamCallback({
        executionId: "test-exec-004",
        id: "msg-correct",
        type: "text",
        content: "正しい実行のメッセージ",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe("正しい実行のメッセージ");
  });
});
```

### 2.5 IT-005: コンポーネントE2E

```typescript
describe("IT-005: コンポーネントE2E", () => {
  it("SkillStreamDisplay が正しく動作する", async () => {
    // Arrange
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-005",
      success: true,
    });

    let streamCallback: (msg: SkillStreamMessage) => void;
    mockSkillAPI.onStream.mockImplementation((cb) => {
      streamCallback = cb;
      return () => {};
    });

    const onComplete = vi.fn();
    const onError = vi.fn();

    // Act
    render(
      <SkillStreamDisplay
        skillId="test-skill"
        initialPrompt="テストプロンプト"
        autoExecute={true}
        onComplete={onComplete}
        onError={onError}
      />
    );

    // 実行開始を待つ
    await waitFor(() => {
      expect(screen.getByText("実行中")).toBeInTheDocument();
    });

    // メッセージ送信
    act(() => {
      streamCallback({
        executionId: "test-exec-005",
        id: "msg-1",
        type: "text",
        content: "テストメッセージ",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    expect(screen.getByText("テストメッセージ")).toBeInTheDocument();

    // 完了メッセージ
    act(() => {
      streamCallback({
        executionId: "test-exec-005",
        id: "msg-complete",
        type: "complete",
        content: "",
        timestamp: Date.now(),
        isComplete: true,
      });
    });

    // Assert
    await waitFor(() => {
      expect(screen.getByText("完了")).toBeInTheDocument();
    });
    expect(onComplete).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});
```

---

## 3. テスト環境設定

### 3.1 モック設定

```typescript
// apps/desktop/src/renderer/hooks/__tests__/setup.ts

import { vi } from "vitest";

// skillAPI モック
export const mockSkillAPI = {
  execute: vi.fn(),
  onStream: vi.fn(() => () => {}),
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (window as any).skillAPI = mockSkillAPI;
});
```

### 3.2 Vitest 設定

```typescript
// apps/desktop/vitest.config.ts の setupFiles に追加
setupFiles: ["./src/renderer/hooks/__tests__/setup.ts"];
```

---

## 4. カバレッジ目標

| 対象               | ライン | ブランチ | 関数 |
| ------------------ | ------ | -------- | ---- |
| skillAPI           | 80%    | 75%      | 100% |
| useSkillExecution  | 80%    | 75%      | 100% |
| SkillStreamDisplay | 80%    | 75%      | 100% |

---

## 5. 参照

- React Hook 設計: `outputs/phase-2/react-hook-design.md`
- UI コンポーネント設計: `outputs/phase-2/ui-component-design.md`
- 受け入れ基準: `outputs/phase-1/acceptance-criteria.md`
