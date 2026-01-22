# ChatHistoryProvider App統合 - 実装ガイド

## メタ情報

| 項目   | 内容                              |
| ------ | --------------------------------- |
| Phase  | 12                                |
| 作成日 | 2026-01-22                        |
| 機能名 | chat-history-provider-integration |
| 作成者 | Claude Code                       |

---

# Part 1: 概念的説明

## 1. Provider統合の目的

### なぜProvider統合が必要か？

ChatHistoryProviderをApp.tsxに統合することで、アプリケーション全体でチャット履歴機能を利用できるようになります。

**統合前の問題点**:

- 各コンポーネントで個別にリポジトリを初期化する必要があった
- コンポーネント間でチャットデータの共有が困難
- リポジトリのライフサイクル管理が複雑

**統合後のメリット**:

- 一度の初期化でアプリ全体から利用可能
- React Contextによるデータ共有
- Clean Architectureに沿った依存関係管理

### 2. アーキテクチャ概要

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│  ┌─────────────────────────────────────────┐    │
│  │         ChatHistoryProvider              │    │
│  │  ┌───────────────────────────────────┐  │    │
│  │  │           AuthGuard               │  │    │
│  │  │  ┌─────────────────────────────┐  │  │    │
│  │  │  │         Routes              │  │  │    │
│  │  │  │   - /chat/history           │  │  │    │
│  │  │  │   - /agent                  │  │  │    │
│  │  │  │   - /*                      │  │  │    │
│  │  │  └─────────────────────────────┘  │  │    │
│  │  └───────────────────────────────────┘  │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 3. 使用シナリオ

**シナリオ1: チャットセッション作成**

```
1. ユーザーが新しいチャットを開始
2. コンポーネントが useChatHistory() でUse Casesを取得
3. createSession.execute() でセッション作成
4. セッションIDを使ってメッセージを追加
```

**シナリオ2: チャット履歴検索**

```
1. ユーザーが履歴ページを開く
2. コンポーネントが useChatHistory() でUse Casesを取得
3. searchSessions.execute() でセッション一覧取得
4. 結果を表示
```

---

# Part 2: 技術的詳細

## 1. API仕様

### useChatHistory Hook

```typescript
import { useChatHistory } from "@/features/chat-history/hooks/useChatHistory";

function MyComponent() {
  const {
    createSession,      // セッション作成Use Case
    addUserMessage,     // ユーザーメッセージ追加Use Case
    addAssistantMessage,// アシスタントメッセージ追加Use Case
    togglePinned,       // ピン留めトグルUse Case
    searchSessions,     // セッション検索Use Case
    isReady,            // 初期化完了フラグ
  } = useChatHistory();

  // isReady がtrueになるまで待機してから使用
  if (!isReady) {
    return <Loading />;
  }

  // Use Casesを使用
  const handleCreateSession = async () => {
    const result = await createSession.execute({ userId: "user-1" });
    if (result.ok) {
      console.log("Session created:", result.value.session.id);
    }
  };
}
```

### ChatHistoryProvider Props

```typescript
interface ChatHistoryProviderProps {
  children: ReactNode;
  sessionRepository?: IChatSessionRepository; // セッションリポジトリ
  messageRepository?: IChatMessageRepository; // メッセージリポジトリ
}
```

### Repository Factory

```typescript
import {
  createChatHistoryRepositories,
  getChatHistoryRepositories,
  isRepositoriesInitialized,
  resetRepositories,
} from "@/features/chat-history/repositories";

// Main Processで初期化
const repos = createChatHistoryRepositories(drizzleDb);

// Renderer Processで取得
const { sessionRepository, messageRepository } = getChatHistoryRepositories();
```

## 2. コード例

### 基本的な使用例

```typescript
// チャットコンポーネントでの使用
import React, { useEffect, useState } from "react";
import { useChatHistory } from "@/features/chat-history/hooks/useChatHistory";

export function ChatComponent() {
  const { createSession, addUserMessage, isReady } = useChatHistory();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // セッション作成
  const handleNewChat = async () => {
    const result = await createSession.execute({ userId: "current-user" });
    if (result.ok) {
      setSessionId(result.value.session.id.value);
    }
  };

  // メッセージ送信
  const handleSend = async () => {
    if (!sessionId || !message) return;

    const result = await addUserMessage.execute({
      sessionId,
      content: message,
    });

    if (result.ok) {
      setMessage("");
      // UIを更新...
    }
  };

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={handleNewChat}>New Chat</button>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

### エラーハンドリング例

```typescript
import { useChatHistory } from "@/features/chat-history/hooks/useChatHistory";

function ChatWithErrorHandling() {
  const { createSession, isReady } = useChatHistory();
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      const result = await createSession.execute({ userId: "user-1" });

      if (!result.ok) {
        // ビジネスロジックエラー
        setError(result.error.message);
        return;
      }

      // 成功処理
      console.log("Created:", result.value.session);
    } catch (e) {
      // 予期しないエラー
      setError("An unexpected error occurred");
    }
  };

  // ...
}
```

## 3. トラブルシューティング

### よくあるエラーと解決方法

#### Error: "useChatHistory must be used within a ChatHistoryProvider"

**原因**: useChatHistoryがChatHistoryProvider外で使用されている

**解決方法**:

```typescript
// ❌ 間違い
function App() {
  return (
    <div>
      <ChatComponent /> {/* Provider外で使用 */}
    </div>
  );
}

// ✅ 正しい
function App() {
  return (
    <ChatHistoryProvider
      sessionRepository={repos.sessionRepository}
      messageRepository={repos.messageRepository}
    >
      <ChatComponent /> {/* Provider内で使用 */}
    </ChatHistoryProvider>
  );
}
```

#### Error: "Chat history repositories not initialized"

**原因**: getChatHistoryRepositoriesがcreateChatHistoryRepositories前に呼ばれている

**解決方法**:

```typescript
// Main Processで先に初期化
createChatHistoryRepositories(drizzleDb);

// その後、Renderer Processで取得
const repos = getChatHistoryRepositories();
```

#### Error: "Repository must be provided"

**原因**: ChatHistoryProviderにリポジトリが渡されていない

**解決方法**:

```typescript
// ❌ 間違い
<ChatHistoryProvider>
  {children}
</ChatHistoryProvider>

// ✅ 正しい
<ChatHistoryProvider
  sessionRepository={repos.sessionRepository}
  messageRepository={repos.messageRepository}
>
  {children}
</ChatHistoryProvider>
```

## 4. 注意事項

### パフォーマンス

- Use Casesはメモ化されているため、再レンダリング時に再生成されない
- isReadyの状態変更は一度のみ（false → true）

### テスト

```typescript
// テスト用のMockProviderを使用
import { MockChatHistoryProvider } from "@/features/chat-history/context/__mocks__";

render(
  <MockChatHistoryProvider>
    <ComponentUnderTest />
  </MockChatHistoryProvider>
);
```

---

## 関連ドキュメント

- [アーキテクチャ仕様](/.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md)
- [Phase 2 詳細設計](../phase-2/detailed-design.md)
- [Phase 10 最終レビュー](../phase-10/final-gate-decision.md)
