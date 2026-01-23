# 統合テスト設計書 - workspace-chat-edit

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | TASK-WS-CHAT-EDIT-001 |
| Phase    | 4                     |
| 作成日   | 2026-01-23            |

---

## 統合テスト概要

### 目的

workspace-chat-edit 機能の各コンポーネント間連携を検証し、要件定義で定めた機能が正しく動作することを確認する。

### スコープ

| カテゴリ           | 検証内容                                 |
| ------------------ | ---------------------------------------- |
| IPC接続            | Renderer→Main プロセス間通信             |
| データフロー       | ファイル添付→LLM送信→結果表示→適用の一連 |
| エラーハンドリング | 各種エラーケースでの適切な処理           |
| 状態同期           | Zustand Slice 間の連携                   |

---

## IPC接続テスト設計

### テストファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/integration/ipc.test.ts`

### テストシナリオ

#### IT-001: ファイル読み取りIPC

```typescript
describe("chat-edit:read-file IPC", () => {
  it("正常なファイルパスで内容が返される", async () => {
    // Arrange
    const filePath = "/path/to/valid/file.ts";
    const mockResponse: FileReadResult = {
      success: true,
      content: "const x = 1;",
      language: "typescript",
      fileSize: 1024,
    };

    vi.mocked(window.chatEditAPI.readFile).mockResolvedValue(mockResponse);

    // Act
    const result = await window.chatEditAPI.readFile(filePath);

    // Assert
    expect(result.success).toBe(true);
    expect(result.content).toBe("const x = 1;");
    expect(result.language).toBe("typescript");
  });
});
```

#### IT-002: ファイル書き込みIPC

```typescript
describe("chat-edit:write-file IPC", () => {
  it("正常な書き込みでsuccess: trueが返される", async () => {
    // Arrange
    const filePath = "/path/to/file.ts";
    const content = "const x: number = 1;";
    const mockResponse: FileWriteResult = {
      success: true,
      backupPath: "/path/to/file.ts.bak",
    };

    vi.mocked(window.chatEditAPI.writeFile).mockResolvedValue(mockResponse);

    // Act
    const result = await window.chatEditAPI.writeFile(filePath, content);

    // Assert
    expect(result.success).toBe(true);
    expect(result.backupPath).toBeDefined();
  });
});
```

#### IT-003: 選択範囲取得IPC

```typescript
describe("chat-edit:get-selection IPC", () => {
  it("エディタの選択範囲が返される", async () => {
    // Arrange
    const mockSelection: TextSelection = {
      startLine: 1,
      startColumn: 0,
      endLine: 5,
      endColumn: 20,
      selectedText: "selected content",
    };

    vi.mocked(window.chatEditAPI.getEditorSelection).mockResolvedValue(
      mockSelection,
    );

    // Act
    const result = await window.chatEditAPI.getEditorSelection();

    // Assert
    expect(result).toEqual(mockSelection);
    expect(result?.startLine).toBe(1);
    expect(result?.selectedText).toBe("selected content");
  });

  it("選択がない場合はnullが返される", async () => {
    // Arrange
    vi.mocked(window.chatEditAPI.getEditorSelection).mockResolvedValue(null);

    // Act
    const result = await window.chatEditAPI.getEditorSelection();

    // Assert
    expect(result).toBeNull();
  });
});
```

#### IT-004: コンテキスト付き送信IPC

```typescript
describe("chat-edit:send-with-context IPC", () => {
  it("コンテキスト付きメッセージが送信される", async () => {
    // Arrange
    const request: SendWithContextRequest = {
      contexts: [
        {
          filePath: "/path/to/file.ts",
          content: "const x = 1;",
          language: "typescript",
        },
      ],
      command: { type: "refactor", targetContextId: "ctx-1" },
      message: "リファクタリングしてください",
    };

    const mockResponse: SendWithContextResponse = {
      success: true,
      result: {
        id: "result-1",
        contextId: "ctx-1",
        originalContent: "const x = 1;",
        generatedContent: "const x: number = 1;",
        diffHunks: [],
        status: "pending",
        createdAt: new Date(),
        targetFilePath: "/path/to/file.ts",
        command: { type: "refactor", targetContextId: "ctx-1" },
      },
    };

    vi.mocked(window.chatEditAPI.sendWithContext).mockResolvedValue(
      mockResponse,
    );

    // Act
    const result = await window.chatEditAPI.sendWithContext(request);

    // Assert
    expect(result.success).toBe(true);
    expect(result.result?.generatedContent).toBe("const x: number = 1;");
  });
});
```

---

## データフローテスト設計

### テストファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/integration/dataflow.test.ts`

### テストシナリオ

#### IT-005: 添付→LLM→差分表示の完全フロー

```typescript
describe("Complete Data Flow", () => {
  it("ファイル添付からLLM応答、差分表示までの流れが正常に動作する", async () => {
    // Arrange
    const { result: hookResult } = renderHook(() => useChatWithContext());

    const mockFileContent = {
      success: true,
      content: "function hello() {}",
      language: "typescript",
      fileSize: 1024,
    };

    const mockLLMResponse = {
      success: true,
      result: {
        id: "result-1",
        contextId: "ctx-1",
        originalContent: "function hello() {}",
        generatedContent: 'function hello(): void { console.log("Hello"); }',
        diffHunks: [
          {
            type: "modify" as const,
            originalStartLine: 1,
            originalEndLine: 1,
            newStartLine: 1,
            newEndLine: 1,
            originalLines: ["function hello() {}"],
            newLines: ['function hello(): void { console.log("Hello"); }'],
          },
        ],
        status: "pending" as const,
        createdAt: new Date(),
        targetFilePath: "/path/to/file.ts",
        command: { type: "continue" as const, targetContextId: "ctx-1" },
      },
    };

    vi.mocked(window.chatEditAPI.readFile).mockResolvedValue(mockFileContent);
    vi.mocked(window.chatEditAPI.sendWithContext).mockResolvedValue(
      mockLLMResponse,
    );

    // Act - Step 1: ファイル添付
    await act(async () => {
      await hookResult.current.attachFile("/path/to/file.ts");
    });

    // Assert - ファイルが添付された
    expect(hookResult.current.fileContexts).toHaveLength(1);

    // Act - Step 2: LLMに送信
    await act(async () => {
      await hookResult.current.sendWithContext({
        command: { type: "continue", targetContextId: "ctx-1" },
        message: "続きを書いて",
      });
    });

    // Assert - 結果が設定された
    expect(hookResult.current.generatedResults).toHaveLength(1);
    expect(hookResult.current.generatedResults[0].status).toBe("pending");
  });
});
```

#### IT-006: 複数コンテキスト管理

```typescript
describe("Multiple Context Management", () => {
  it("複数ファイルを添付しても全て保持される", async () => {
    // Arrange
    const { result } = renderHook(() => useFileContext());

    const files = [
      { path: "/file1.ts", content: "const a = 1;" },
      { path: "/file2.ts", content: "const b = 2;" },
      { path: "/file3.ts", content: "const c = 3;" },
    ];

    vi.mocked(window.chatEditAPI.readFile).mockImplementation(
      async (filePath: string) => ({
        success: true,
        content: files.find((f) => f.path === filePath)?.content || "",
        language: "typescript",
        fileSize: 100,
      }),
    );

    // Act
    for (const file of files) {
      await act(async () => {
        await result.current.attachFile(file.path);
      });
    }

    // Assert
    expect(result.current.fileContexts).toHaveLength(3);
    expect(result.current.fileContexts.map((c) => c.filePath)).toEqual(
      files.map((f) => f.path),
    );
  });
});
```

#### IT-007: ストリーミング出力処理

```typescript
describe("Streaming Output", () => {
  it("ストリーミング出力イベントを正しく処理する", async () => {
    // Arrange
    const { result } = renderHook(() => useChatWithContext());
    const chunks: string[] = [];

    // ストリームイベントのシミュレーション
    const streamCallback = vi.fn((event: StreamOutputEvent) => {
      if (event.type === "content" && event.content) {
        chunks.push(event.content);
      }
    });

    vi.mocked(window.chatEditAPI.onStreamOutput).mockImplementation(
      (callback) => {
        // シミュレートされたストリームデータ
        setTimeout(() => callback({ type: "content", content: "const " }), 10);
        setTimeout(() => callback({ type: "content", content: "x = " }), 20);
        setTimeout(() => callback({ type: "content", content: "1;" }), 30);
        setTimeout(() => callback({ type: "done", done: true }), 40);

        return () => {};
      },
    );

    // Act
    act(() => {
      result.current.subscribeToStream(streamCallback);
    });

    // Wait for stream to complete
    await vi.waitFor(() => {
      expect(chunks.join("")).toBe("const x = 1;");
    });
  });
});
```

---

## エラーハンドリングテスト設計

### テストファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/integration/error.test.ts`

### テストシナリオ

#### IT-008: 存在しないファイル

```typescript
describe("Error Handling - File Not Found", () => {
  it("存在しないファイルでFILE_NOT_FOUNDエラーが返される", async () => {
    // Arrange
    vi.mocked(window.chatEditAPI.readFile).mockResolvedValue({
      success: false,
      error: {
        code: "FILE_NOT_FOUND",
        message: "File not found: /nonexistent/file.ts",
      },
    });

    const { result } = renderHook(() => useFileContext());

    // Act & Assert
    await expect(
      act(async () => {
        await result.current.attachFile("/nonexistent/file.ts");
      }),
    ).rejects.toThrow("File not found");

    // エラー状態が設定されていることを確認
    expect(result.current.error).toBe("FILE_NOT_FOUND");
  });
});
```

#### IT-009: 権限なしファイル

```typescript
describe("Error Handling - Permission Denied", () => {
  it("権限なしファイルでPERMISSION_DENIEDエラーが返される", async () => {
    // Arrange
    vi.mocked(window.chatEditAPI.readFile).mockResolvedValue({
      success: false,
      error: {
        code: "PERMISSION_DENIED",
        message: "Access to this file is not allowed",
      },
    });

    const { result } = renderHook(() => useFileContext());

    // Act & Assert
    await expect(
      act(async () => {
        await result.current.attachFile("/restricted/file.ts");
      }),
    ).rejects.toThrow();

    expect(result.current.error).toBe("PERMISSION_DENIED");
  });
});
```

#### IT-010: サイズ超過ファイル

```typescript
describe("Error Handling - File Too Large", () => {
  it("10MB超過ファイルでTOO_LARGEエラーが返される", async () => {
    // Arrange
    vi.mocked(window.chatEditAPI.readFile).mockResolvedValue({
      success: false,
      error: {
        code: "TOO_LARGE",
        message: "File size exceeds 10MB limit",
      },
    });

    const { result } = renderHook(() => useFileContext());

    // Act & Assert
    await expect(
      act(async () => {
        await result.current.attachFile("/large/file.ts");
      }),
    ).rejects.toThrow();

    expect(result.current.error).toBe("TOO_LARGE");
  });
});
```

#### IT-011: LLMエラー

```typescript
describe("Error Handling - LLM Error", () => {
  it("LLM APIエラーでLLM_ERRORが返される", async () => {
    // Arrange
    vi.mocked(window.chatEditAPI.sendWithContext).mockResolvedValue({
      success: false,
      error: {
        code: "LLM_ERROR",
        message: "Failed to communicate with LLM",
        retryable: true,
      },
    });

    const { result } = renderHook(() => useChatWithContext());

    // Act
    await act(async () => {
      await result.current.sendWithContext({
        command: { type: "continue", targetContextId: "ctx-1" },
        message: "続きを書いて",
      });
    });

    // Assert
    expect(result.current.error).toBe("LLM_ERROR");
    expect(result.current.isRetryable).toBe(true);
  });
});
```

#### IT-012: タイムアウト

```typescript
describe("Error Handling - Timeout", () => {
  it("タイムアウトでTIMEOUTエラーが返される", async () => {
    // Arrange
    vi.mocked(window.chatEditAPI.sendWithContext).mockResolvedValue({
      success: false,
      error: {
        code: "TIMEOUT",
        message: "Request timed out",
        retryable: true,
        retryAfterMs: 5000,
      },
    });

    const { result } = renderHook(() => useChatWithContext());

    // Act
    await act(async () => {
      await result.current.sendWithContext({
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "リファクタリング",
      });
    });

    // Assert
    expect(result.current.error).toBe("TIMEOUT");
  });
});
```

---

## 状態同期テスト設計

### テストファイル

`apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/integration/state-sync.test.ts`

### テストシナリオ

#### IT-013: chatEditSlice状態同期

```typescript
describe("State Sync - chatEditSlice", () => {
  it("fileContextsの変更がUIに即座に反映される", async () => {
    // Arrange
    const TestComponent = () => {
      const { fileContexts, addFileContext } = useChatEditStore();
      return (
        <div>
          <span data-testid="count">{fileContexts.length}</span>
          <button
            onClick={() =>
              addFileContext({
                filePath: "/test.ts",
                fileName: "test.ts",
                content: "test",
                language: "typescript",
                fileSize: 100,
              })
            }
          >
            Add
          </button>
        </div>
      );
    };

    const { getByTestId, getByText } = render(<TestComponent />);

    // Assert - 初期状態
    expect(getByTestId("count").textContent).toBe("0");

    // Act
    fireEvent.click(getByText("Add"));

    // Assert - 状態が更新された
    expect(getByTestId("count").textContent).toBe("1");
  });
});
```

#### IT-014: workspaceSlice連携

```typescript
describe("State Sync - workspaceSlice", () => {
  it("workspaceSliceから開いているファイル一覧を参照できる", () => {
    // Arrange
    const mockWorkspaceState = {
      openFiles: [
        { path: "/file1.ts", name: "file1.ts" },
        { path: "/file2.ts", name: "file2.ts" },
      ],
    };

    // workspaceSliceをモック
    vi.mocked(useWorkspaceStore).mockReturnValue(mockWorkspaceState);

    const { result } = renderHook(() => useFileContext());

    // Act
    const availableFiles = result.current.getAvailableFiles();

    // Assert
    expect(availableFiles).toEqual(mockWorkspaceState.openFiles);
  });
});
```

#### IT-015: chatSlice連携

```typescript
describe("State Sync - chatSlice", () => {
  it("LLM応答がchatSliceのメッセージ履歴に追加される", async () => {
    // Arrange
    const addMessage = vi.fn();
    vi.mocked(useChatStore).mockReturnValue({ addMessage });

    const { result } = renderHook(() => useChatWithContext());

    vi.mocked(window.chatEditAPI.sendWithContext).mockResolvedValue({
      success: true,
      result: {
        id: "result-1",
        contextId: "ctx-1",
        originalContent: "test",
        generatedContent: "test modified",
        diffHunks: [],
        status: "pending",
        createdAt: new Date(),
        targetFilePath: "/test.ts",
        command: { type: "refactor", targetContextId: "ctx-1" },
      },
    });

    // Act
    await act(async () => {
      await result.current.sendWithContext({
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "リファクタリング",
      });
    });

    // Assert
    expect(addMessage).toHaveBeenCalled();
  });
});
```

---

## テストユーティリティ

### モックファクトリー

```typescript
// apps/desktop/src/test/factories/chatEditFactories.ts

import { v4 as uuidv4 } from "uuid";

export function createMockFileContext(
  overrides?: Partial<FileContext>,
): FileContext {
  return {
    id: uuidv4(),
    filePath: `/path/to/file-${Date.now()}.ts`,
    fileName: `file-${Date.now()}.ts`,
    content: "const x = 1;",
    language: "typescript",
    addedAt: new Date(),
    fileSize: 1024,
    ...overrides,
  };
}

export function createMockGeneratedResult(
  overrides?: Partial<GeneratedResult>,
): GeneratedResult {
  return {
    id: uuidv4(),
    contextId: uuidv4(),
    originalContent: "const x = 1;",
    generatedContent: "const x: number = 1;",
    diffHunks: [],
    status: "pending",
    createdAt: new Date(),
    targetFilePath: "/path/to/file.ts",
    command: { type: "refactor", targetContextId: "ctx-1" },
    ...overrides,
  };
}

export function createMockDiffHunk(overrides?: Partial<DiffHunk>): DiffHunk {
  return {
    type: "modify",
    originalStartLine: 1,
    originalEndLine: 1,
    newStartLine: 1,
    newEndLine: 1,
    originalLines: ["const x = 1;"],
    newLines: ["const x: number = 1;"],
    ...overrides,
  };
}
```

### カスタムレンダー

```typescript
// apps/desktop/src/test/utils/chatEditTestUtils.tsx

import { renderHook, RenderHookOptions } from "@testing-library/react";
import { ReactNode } from "react";

interface WrapperProps {
  children: ReactNode;
}

export function createChatEditWrapper(): React.FC<WrapperProps> {
  return function Wrapper({ children }: WrapperProps) {
    return <>{children}</>;
  };
}

export function renderChatEditHook<T>(
  hook: () => T,
  options?: RenderHookOptions<unknown>
) {
  return renderHook(hook, {
    wrapper: createChatEditWrapper(),
    ...options,
  });
}
```

---

## テスト実行設定

### vitest.config.ts への追加

```typescript
// テストパターン追加
test: {
  include: [
    // 既存パターン...
    'src/renderer/features/workspace-chat-edit/**/*.test.ts',
    'src/renderer/features/workspace-chat-edit/**/*.test.tsx',
  ],
  coverage: {
    // カバレッジ対象追加
    include: [
      'src/renderer/features/workspace-chat-edit/**/*.ts',
      'src/renderer/features/workspace-chat-edit/**/*.tsx',
    ],
  },
}
```

### 実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# workspace-chat-edit 関連のみ
pnpm --filter @repo/desktop test src/renderer/features/workspace-chat-edit

# カバレッジ付き
pnpm --filter @repo/desktop test --coverage
```

---

## 関連ドキュメント

- テスト仕様書: `outputs/phase-4/test-specification.md`
- テストケース一覧: `outputs/phase-4/test-cases.md`
- IPC API設計: `outputs/phase-2/ipc-api-design.md`
- ドメインモデル: `outputs/phase-2/domain-model.md`
