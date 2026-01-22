# Phase 2: 統合テスト設計

## メタ情報

| 項目   | 内容                              |
| ------ | --------------------------------- |
| Phase  | 2                                 |
| 作成日 | 2026-01-22                        |
| 機能名 | chat-history-provider-integration |
| 作成者 | Claude Code                       |

---

## テストシナリオ一覧

### IT-001: Provider初期化テスト

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | IT-001                           |
| シナリオ | Provider初期化                   |
| 前提条件 | Repositoryが正しく注入されている |
| 操作     | ChatHistoryProviderをマウント    |
| 期待結果 | isReady=trueに遷移する           |

**テストケース詳細**:

```typescript
describe("Provider初期化", () => {
  it("正常にマウントするとisReady=trueに遷移する", async () => {
    // Arrange
    const mockRepos = createMockRepositories();

    // Act
    const { result } = renderHook(() => useChatHistory(), {
      wrapper: ({ children }) => (
        <ChatHistoryProvider
          sessionRepository={mockRepos.sessionRepository}
          messageRepository={mockRepos.messageRepository}
        >
          {children}
        </ChatHistoryProvider>
      ),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
  });
});
```

---

### IT-002: Repository注入テスト

| 項目     | 内容                            |
| -------- | ------------------------------- |
| テストID | IT-002                          |
| シナリオ | Repository注入                  |
| 前提条件 | ファクトリーが初期化済み        |
| 操作     | useChatHistoryでUse Casesを取得 |
| 期待結果 | Use Casesが取得できる           |

**テストケース詳細**:

```typescript
describe("Repository注入", () => {
  it("Use Casesが正しく取得できる", async () => {
    // Arrange
    const mockRepos = createMockRepositories();

    // Act
    const { result } = renderHook(() => useChatHistory(), {
      wrapper: ({ children }) => (
        <ChatHistoryProvider
          sessionRepository={mockRepos.sessionRepository}
          messageRepository={mockRepos.messageRepository}
        >
          {children}
        </ChatHistoryProvider>
      ),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.createSession).toBeDefined();
    expect(result.current.addUserMessage).toBeDefined();
    expect(result.current.addAssistantMessage).toBeDefined();
    expect(result.current.togglePinned).toBeDefined();
    expect(result.current.searchSessions).toBeDefined();
  });
});
```

---

### IT-003: Context伝播テスト

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| テストID | IT-003                                               |
| シナリオ | Context伝播                                          |
| 前提条件 | Providerがマウント済み                               |
| 操作     | 深くネストしたコンポーネントでuseChatHistory呼び出し |
| 期待結果 | 子コンポーネントで使用可能                           |

**テストケース詳細**:

```typescript
describe("Context伝播", () => {
  it("深くネストしたコンポーネントでContextが取得できる", async () => {
    // Arrange
    const mockRepos = createMockRepositories();
    let contextValue: ChatHistoryContextValue | null = null;

    const DeepNestedComponent = () => {
      contextValue = useChatHistory();
      return <div>Nested</div>;
    };

    const WrapperComponent = () => (
      <div>
        <div>
          <div>
            <DeepNestedComponent />
          </div>
        </div>
      </div>
    );

    // Act
    render(
      <ChatHistoryProvider
        sessionRepository={mockRepos.sessionRepository}
        messageRepository={mockRepos.messageRepository}
      >
        <WrapperComponent />
      </ChatHistoryProvider>
    );

    // Assert
    await waitFor(() => {
      expect(contextValue?.isReady).toBe(true);
    });
    expect(contextValue?.createSession).toBeDefined();
  });
});
```

---

### IT-004: エラー時のフォールバックテスト

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| テストID | IT-004                             |
| シナリオ | エラー時のフォールバック           |
| 前提条件 | Providerなしでフック呼び出し       |
| 操作     | Provider外でuseChatHistory呼び出し |
| 期待結果 | エラー状態が適切に設定される       |

**テストケース詳細**:

```typescript
describe("エラーハンドリング", () => {
  it("Provider未設定時にエラーがスローされる", () => {
    // Arrange & Act & Assert
    expect(() => {
      renderHook(() => useChatHistory());
    }).toThrow("useChatHistory must be used within a ChatHistoryProvider");
  });

  it("Repository未提供時にエラーがスローされる", () => {
    // Arrange
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    // Act & Assert
    expect(() => {
      render(
        <ChatHistoryProvider>
          <div>Test</div>
        </ChatHistoryProvider>
      );
    }).toThrow("Repository must be provided");

    consoleError.mockRestore();
  });
});
```

---

### IT-005: リポジトリファクトリーテスト

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| テストID | IT-005                             |
| シナリオ | リポジトリファクトリー動作         |
| 前提条件 | DBインスタンスが利用可能           |
| 操作     | ファクトリー関数を呼び出し         |
| 期待結果 | シングルトンでリポジトリが返される |

**テストケース詳細**:

```typescript
describe("リポジトリファクトリー", () => {
  it("DrizzleSessionRepositoryを返す", () => {
    // Arrange
    const mockDb = createMockDb();

    // Act
    const repos = createChatHistoryRepositories(mockDb);

    // Assert
    expect(repos.sessionRepository).toBeInstanceOf(
      DrizzleChatSessionRepository,
    );
  });

  it("DrizzleMessageRepositoryを返す", () => {
    // Arrange
    const mockDb = createMockDb();

    // Act
    const repos = createChatHistoryRepositories(mockDb);

    // Assert
    expect(repos.messageRepository).toBeInstanceOf(
      DrizzleChatMessageRepository,
    );
  });

  it("複数回呼び出しで同一インスタンスを返す（シングルトン）", () => {
    // Arrange
    const mockDb = createMockDb();

    // Act
    const repos1 = createChatHistoryRepositories(mockDb);
    const repos2 = createChatHistoryRepositories(mockDb);

    // Assert
    expect(repos1.sessionRepository).toBe(repos2.sessionRepository);
    expect(repos1.messageRepository).toBe(repos2.messageRepository);
  });
});
```

---

## テストデータ・モック設計

### MockRepositories

```typescript
// apps/desktop/src/features/chat-history/__tests__/helpers/mockRepositories.ts

import { vi } from "vitest";
import type {
  IChatSessionRepository,
  IChatMessageRepository,
} from "@repo/shared";

export function createMockRepositories() {
  const sessionRepository: IChatSessionRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
  };

  const messageRepository: IChatMessageRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    findBySessionId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  return { sessionRepository, messageRepository };
}
```

### MockDb

```typescript
// apps/desktop/src/features/chat-history/__tests__/helpers/mockDb.ts

import { vi } from "vitest";

export function createMockDb() {
  return {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  };
}
```

---

## テストシナリオサマリー

| テストID | シナリオ             | カテゴリ | 優先度 |
| -------- | -------------------- | -------- | ------ |
| IT-001   | Provider初期化       | 正常系   | 必須   |
| IT-002   | Repository注入       | 正常系   | 必須   |
| IT-003   | Context伝播          | 正常系   | 必須   |
| IT-004   | エラーフォールバック | 異常系   | 必須   |
| IT-005   | ファクトリー動作     | 正常系   | 必須   |

---

## タスク完了状態

- [x] タスク4: 統合テスト設計 - **完了**
