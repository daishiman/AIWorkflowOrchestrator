# Phase 2 - MockProvider設計

## 確認日時

2026-01-22

---

## 1. MockChatHistoryProvider設計

### 1.1 Props型定義

```typescript
import type { ReactNode } from "react";
import type { ChatHistoryContextValue } from "../ChatHistoryContext";

/**
 * MockChatHistoryProvider Props
 */
export interface MockChatHistoryProviderProps {
  /**
   * 子コンポーネント
   */
  children: ReactNode;

  /**
   * Context値のオーバーライド
   * 部分的な上書きが可能
   */
  overrides?: Partial<ChatHistoryContextValue>;
}
```

### 1.2 設計根拠

| Props     | 必須 | 説明                            |
| --------- | ---- | ------------------------------- |
| children  | ✅   | Reactの子コンポーネント         |
| overrides | -    | 個別のUse Casesをモックで上書き |

---

## 2. MockProvider実装

### 2.1 コンポーネント実装

```typescript
import { type ReactNode, useMemo } from "react";
import { vi } from "vitest";
import { ChatHistoryContext, type ChatHistoryContextValue } from "../ChatHistoryContext";
import type {
  CreateChatSessionUseCase,
  AddUserMessageUseCase,
  AddAssistantMessageUseCase,
  TogglePinnedUseCase,
  SearchSessionsUseCase,
} from "@repo/shared";

// デフォルトモックセッション
const mockSession = {
  id: "mock-session-1",
  userId: "mock-user-1",
  title: "Mock Session",
  messageCount: 0,
  isPinned: false,
  isFavorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// デフォルトモックメッセージ
const mockMessage = {
  id: "mock-message-1",
  sessionId: "mock-session-1",
  role: "user" as const,
  content: "Mock message content",
  messageIndex: 0,
  createdAt: new Date().toISOString(),
};

/**
 * デフォルトモック値を生成
 */
function createDefaultMockValue(): ChatHistoryContextValue {
  return {
    createSession: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: { session: mockSession },
      }),
    } as unknown as CreateChatSessionUseCase,

    addUserMessage: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: {
          message: mockMessage,
          updatedSession: {
            lastMessagePreview: mockMessage.content,
            messageCount: 1,
            updatedAt: new Date().toISOString(),
          },
        },
      }),
    } as unknown as AddUserMessageUseCase,

    addAssistantMessage: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: {
          message: { ...mockMessage, id: "mock-message-2", role: "assistant" },
          updatedSession: {
            lastMessagePreview: "AI response",
            messageCount: 2,
            updatedAt: new Date().toISOString(),
          },
        },
      }),
    } as unknown as AddAssistantMessageUseCase,

    togglePinned: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: {
          session: { ...mockSession, isPinned: true },
          isPinned: true,
        },
      }),
    } as unknown as TogglePinnedUseCase,

    searchSessions: {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: {
          sessions: [mockSession],
          total: 1,
        },
      }),
    } as unknown as SearchSessionsUseCase,

    isReady: true,
  };
}

/**
 * テスト用MockProvider
 */
export function MockChatHistoryProvider({
  children,
  overrides,
}: MockChatHistoryProviderProps): JSX.Element {
  const mockValue = useMemo<ChatHistoryContextValue>(() => {
    const defaultValue = createDefaultMockValue();

    if (!overrides) {
      return defaultValue;
    }

    return {
      ...defaultValue,
      ...overrides,
    };
  }, [overrides]);

  return (
    <ChatHistoryContext.Provider value={mockValue}>
      {children}
    </ChatHistoryContext.Provider>
  );
}
```

---

## 3. 使用例

### 3.1 基本的な使用（デフォルトモック）

```tsx
import { render, screen } from "@testing-library/react";
import { MockChatHistoryProvider } from "@/features/chat-history/context/__mocks__";
import { ChatComponent } from "./ChatComponent";

describe("ChatComponent", () => {
  it("should render with default mocks", () => {
    render(
      <MockChatHistoryProvider>
        <ChatComponent />
      </MockChatHistoryProvider>,
    );

    expect(screen.getByText("Mock Session")).toBeInTheDocument();
  });
});
```

### 3.2 特定のUse Caseをオーバーライド

```tsx
import { vi } from "vitest";

describe("ChatComponent", () => {
  it("should handle error case", async () => {
    const mockCreateSession = {
      execute: vi.fn().mockResolvedValue({
        ok: false,
        error: { code: "REPOSITORY_ERROR", message: "Database error" },
      }),
    };

    render(
      <MockChatHistoryProvider
        overrides={{
          createSession: mockCreateSession as any,
        }}
      >
        <ChatComponent />
      </MockChatHistoryProvider>,
    );

    // エラーケースのテスト
    const button = screen.getByRole("button", { name: "作成" });
    await userEvent.click(button);

    expect(screen.getByText("Database error")).toBeInTheDocument();
  });
});
```

### 3.3 isReadyをfalseに設定

```tsx
describe("ChatComponent", () => {
  it("should show loading when not ready", () => {
    render(
      <MockChatHistoryProvider overrides={{ isReady: false }}>
        <ChatComponent />
      </MockChatHistoryProvider>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
```

### 3.4 モック関数の検証

```tsx
describe("ChatComponent", () => {
  it("should call createSession with correct params", async () => {
    const mockCreateSession = {
      execute: vi.fn().mockResolvedValue({
        ok: true,
        value: { session: mockSession },
      }),
    };

    render(
      <MockChatHistoryProvider
        overrides={{ createSession: mockCreateSession as any }}
      >
        <ChatComponent userId="test-user" />
      </MockChatHistoryProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "新規作成" }));

    expect(mockCreateSession.execute).toHaveBeenCalledWith({
      userId: "test-user",
      title: expect.any(String),
    });
  });
});
```

---

## 4. ヘルパー関数

### 4.1 モック値ファクトリ

```typescript
/**
 * カスタムモックセッションを生成
 */
export function createMockSession(overrides?: Partial<typeof mockSession>) {
  return {
    ...mockSession,
    ...overrides,
  };
}

/**
 * カスタムモックメッセージを生成
 */
export function createMockMessage(overrides?: Partial<typeof mockMessage>) {
  return {
    ...mockMessage,
    ...overrides,
  };
}

/**
 * 成功レスポンスを生成
 */
export function createSuccessResult<T>(value: T) {
  return { ok: true as const, value };
}

/**
 * エラーレスポンスを生成
 */
export function createErrorResult(code: string, message: string) {
  return { ok: false as const, error: { code, message } };
}
```

### 4.2 使用例

```tsx
const mockSession = createMockSession({
  id: "custom-session",
  title: "Custom Title",
  isPinned: true,
});

const mockCreateSession = {
  execute: vi
    .fn()
    .mockResolvedValue(createSuccessResult({ session: mockSession })),
};
```

---

## 5. Export構成

### 5.1 **mocks**/index.ts

```typescript
export { MockChatHistoryProvider } from "./MockChatHistoryProvider";
export type { MockChatHistoryProviderProps } from "./MockChatHistoryProvider";

// ヘルパー関数
export {
  createMockSession,
  createMockMessage,
  createSuccessResult,
  createErrorResult,
} from "./MockChatHistoryProvider";
```

---

## 6. 設計ポイント

| ポイント           | 説明                                     |
| ------------------ | ---------------------------------------- |
| vi.fn()使用        | Vitestのモック関数で呼び出し検証可能     |
| 部分オーバーライド | 必要なUse Caseのみ上書き可能             |
| デフォルト成功値   | 基本は成功レスポンスを返す               |
| ヘルパー関数       | テスト記述を簡潔にするユーティリティ提供 |
| isReady: true      | デフォルトで初期化完了状態               |

---

## 結論

**Phase 2 タスク4: 完了**

MockChatHistoryProviderの設計が完了した。オーバーライド可能な柔軟なモック設計を実現した。
