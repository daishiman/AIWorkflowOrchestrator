# Phase 2 - Hook設計

## 確認日時

2026-01-22

---

## 1. useChatHistory Hook

### 1.1 基本設計

```typescript
import { useContext } from "react";
import {
  ChatHistoryContext,
  type ChatHistoryContextValue,
} from "../context/ChatHistoryContext";

/**
 * ChatHistory Contextから値を取得するカスタムHook
 *
 * @throws {Error} Provider外で使用した場合
 * @returns ChatHistoryContextValue
 */
export function useChatHistory(): ChatHistoryContextValue {
  const context = useContext(ChatHistoryContext);

  if (context === null) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }

  return context;
}
```

### 1.2 設計根拠

| 項目             | 設計方針                                |
| ---------------- | --------------------------------------- |
| 戻り値型         | `ChatHistoryContextValue`（非null保証） |
| null チェック    | 必須（Provider外使用検出）              |
| エラーメッセージ | 英語で明確なガイダンス                  |

---

## 2. 使用例

### 2.1 基本的な使用

```tsx
import { useChatHistory } from "@/features/chat-history/hooks";

function ChatComponent() {
  const { createSession, addUserMessage, isReady } = useChatHistory();

  const handleCreateSession = async () => {
    const result = await createSession.execute({
      userId: "user-1",
      title: "新しいチャット",
    });

    if (result.ok) {
      console.log("Created session:", result.value.session);
    } else {
      console.error("Failed:", result.error.message);
    }
  };

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return <button onClick={handleCreateSession}>新しいセッションを作成</button>;
}
```

### 2.2 メッセージ追加

```tsx
function MessageInput({ sessionId }: { sessionId: string }) {
  const { addUserMessage, addAssistantMessage } = useChatHistory();
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    // ユーザーメッセージを追加
    const userResult = await addUserMessage.execute({
      sessionId,
      content,
    });

    if (!userResult.ok) {
      console.error(userResult.error.message);
      return;
    }

    // AIレスポンスを取得・追加（実際はAI APIを呼び出し）
    const assistantResult = await addAssistantMessage.execute({
      sessionId,
      content: "AIの応答...",
      llmModel: "claude-3-opus",
    });

    if (!assistantResult.ok) {
      console.error(assistantResult.error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={content} onChange={(e) => setContent(e.target.value)} />
      <button type="submit">送信</button>
    </form>
  );
}
```

---

## 3. 個別Use Case Hooks（オプション）

### 3.1 useCreateSession

```typescript
import { useCallback } from "react";
import { useChatHistory } from "./useChatHistory";
import type {
  CreateChatSessionInput,
  CreateChatSessionOutput,
} from "@repo/shared";
import type { Result } from "@repo/shared";
import type { ChatHistoryUseCaseError } from "@repo/shared";

/**
 * セッション作成の便利Hook
 */
export function useCreateSession() {
  const { createSession } = useChatHistory();

  return useCallback(
    (
      input: CreateChatSessionInput,
    ): Promise<Result<CreateChatSessionOutput, ChatHistoryUseCaseError>> => {
      return createSession.execute(input);
    },
    [createSession],
  );
}
```

### 3.2 useSearchSessions

```typescript
import { useCallback } from "react";
import { useChatHistory } from "./useChatHistory";
import type { SearchSessionsInput, SearchSessionsOutput } from "@repo/shared";
import type { Result } from "@repo/shared";
import type { ChatHistoryUseCaseError } from "@repo/shared";

/**
 * セッション検索の便利Hook
 */
export function useSearchSessions() {
  const { searchSessions } = useChatHistory();

  return useCallback(
    (
      input: SearchSessionsInput,
    ): Promise<Result<SearchSessionsOutput, ChatHistoryUseCaseError>> => {
      return searchSessions.execute(input);
    },
    [searchSessions],
  );
}
```

### 3.3 設計判断

| 項目                | 方針                                     |
| ------------------- | ---------------------------------------- |
| 個別Hooks実装       | オプション（Phase 5で判断）              |
| useCallback使用     | メモ化による最適化                       |
| 直接execute呼び出し | 基本はuseChatHistory().xxx.execute()推奨 |

---

## 4. isReadyの使用パターン

### 4.1 条件付きレンダリング

```tsx
function ChatApp() {
  const { isReady } = useChatHistory();

  if (!isReady) {
    return <LoadingSpinner />;
  }

  return <ChatContent />;
}
```

### 4.2 操作無効化

```tsx
function ChatActions() {
  const { isReady, createSession } = useChatHistory();

  return (
    <button
      disabled={!isReady}
      onClick={() => createSession.execute({ userId: "user-1" })}
    >
      新規作成
    </button>
  );
}
```

---

## 5. エラーハンドリングパターン

### 5.1 Result型の処理

```typescript
async function handleAction() {
  const result = await useCase.execute(input);

  if (result.ok) {
    // 成功処理
    const data = result.value;
    return data;
  } else {
    // エラー処理
    const error = result.error;

    // エラー種別による分岐
    switch (error.code) {
      case "SESSION_NOT_FOUND":
        showNotification("セッションが見つかりません");
        break;
      case "REPOSITORY_ERROR":
        showNotification("データベースエラーが発生しました");
        break;
      default:
        showNotification("エラーが発生しました");
    }

    return null;
  }
}
```

### 5.2 try-catchとの併用

```typescript
async function handleAction() {
  try {
    const result = await useCase.execute(input);

    if (!result.ok) {
      throw new Error(result.error.message);
    }

    return result.value;
  } catch (error) {
    // ネットワークエラー等のキャッチ
    console.error("Unexpected error:", error);
    throw error;
  }
}
```

---

## 6. テストでの使用

### 6.1 Hookのテスト

```tsx
import { renderHook } from "@testing-library/react";
import { useChatHistory } from "./useChatHistory";
import { MockChatHistoryProvider } from "../context/__mocks__";

describe("useChatHistory", () => {
  it("should throw error when used outside Provider", () => {
    expect(() => {
      renderHook(() => useChatHistory());
    }).toThrow("useChatHistory must be used within a ChatHistoryProvider");
  });

  it("should return context value when used within Provider", () => {
    const { result } = renderHook(() => useChatHistory(), {
      wrapper: MockChatHistoryProvider,
    });

    expect(result.current.createSession).toBeDefined();
    expect(result.current.isReady).toBe(true);
  });
});
```

---

## 結論

**Phase 2 タスク3: 完了**

useChatHistory Custom Hookの設計が完了した。個別Use Case Hooksはオプションとし、基本パターンを定義した。
