# React Context DI 実装ガイド

## 実行日時

2026-01-22

---

## Part 1: 概念的説明（初学者・非技術者向け）

### 1.1 React Context DIとは

**React Context DI（依存性注入）** は、アプリケーション内でデータや機能を効率的に共有するためのパターンです。

簡単に言うと、「必要な道具を必要な場所に届ける仕組み」です。

#### 従来の方法の問題点

従来のReactでは、データを親から子へ「props」として手渡しで渡していました。

```
App → Page → Section → Card → Button
          ↓     ↓        ↓       ↓
        (props) (props) (props) (props)
```

この方法には問題があります：

- **プロップドリリング**: 途中のコンポーネントがデータを使わなくても、子に渡すためだけに受け取る必要がある
- **保守性の低下**: コンポーネント階層が深くなると、変更が困難になる

#### Context DIによる解決

Context DIでは、「Provider（提供者）」がデータを用意し、必要なコンポーネントが直接「Hook」で取得できます。

```
        ┌─────────────┐
        │   Provider  │  ← データと機能を用意
        │  (提供者)   │
        └─────────────┘
              │
    ┌─────────┴─────────┐
    ↓         ↓         ↓
  Page     Section    Button
    ↓                   ↓
   Card           (useChatHistory)
                        ↓
                   「データ取得！」
```

### 1.2 なぜDI（依存性注入）が必要か

**依存性注入**は、以下のメリットを提供します：

| メリット     | 説明                                       |
| ------------ | ------------------------------------------ |
| テスト容易性 | 本物のデータベースを使わずにテストができる |
| 柔軟性       | 環境に応じて異なる実装を差し替えられる     |
| 疎結合       | コンポーネントが具体的な実装に依存しない   |
| 再利用性     | 同じロジックを異なる文脈で再利用できる     |

例えば、チャット履歴機能をテストする際：

- **本番環境**: 実際のSQLiteデータベースを使用
- **テスト環境**: メモリ上のモックを使用

DIにより、コードを変更せずに切り替えが可能です。

### 1.3 Context / Provider / Hook の関係

```
┌──────────────────────────────────────────────────┐
│                    Context                        │
│   「何を共有するか」の定義（型定義）              │
│   例: セッション作成機能、メッセージ追加機能     │
└───────────────────────┬──────────────────────────┘
                        │
                        ↓
┌──────────────────────────────────────────────────┐
│                    Provider                       │
│   「どうやって共有するか」の実装                  │
│   例: 実際のデータベース接続、機能の提供         │
└───────────────────────┬──────────────────────────┘
                        │
                        ↓
┌──────────────────────────────────────────────────┐
│                      Hook                         │
│   「どうやって使うか」のインターフェース          │
│   例: useChatHistory() で機能を取得              │
└──────────────────────────────────────────────────┘
```

### 1.4 使用シナリオ

#### シナリオ1: 通常のアプリケーション使用

```jsx
// アプリ起動時にProviderでラップ
<ChatHistoryProvider sessionRepository={...} messageRepository={...}>
  <App />
</ChatHistoryProvider>
```

#### シナリオ2: テスト時のモック使用

```jsx
// テスト時はMockProviderを使用
<MockChatHistoryProvider>
  <ComponentToTest />
</MockChatHistoryProvider>
```

---

## Part 2: 技術的詳細（開発者向け）

### 2.1 型定義の詳細

#### ChatHistoryContextValue

```typescript
// apps/desktop/src/features/chat-history/context/ChatHistoryContext.tsx

export interface ChatHistoryContextValue {
  // 5種のUse Cases
  createSession: CreateChatSessionUseCase;
  addUserMessage: AddUserMessageUseCase;
  addAssistantMessage: AddAssistantMessageUseCase;
  togglePinned: TogglePinnedUseCase;
  searchSessions: SearchSessionsUseCase;

  // 初期化状態
  isReady: boolean;
}
```

| プロパティ          | 型                         | 説明                     |
| ------------------- | -------------------------- | ------------------------ |
| createSession       | CreateChatSessionUseCase   | セッション作成Use Case   |
| addUserMessage      | AddUserMessageUseCase      | ユーザーメッセージ追加   |
| addAssistantMessage | AddAssistantMessageUseCase | AIメッセージ追加         |
| togglePinned        | TogglePinnedUseCase        | ピン留めトグル           |
| searchSessions      | SearchSessionsUseCase      | セッション検索           |
| isReady             | boolean                    | Provider初期化完了フラグ |

#### Context作成

```typescript
export const ChatHistoryContext = createContext<ChatHistoryContextValue | null>(
  null,
);
```

**設計ポイント**: 初期値を`null`にすることで、Provider外での使用を検出可能にする。

### 2.2 Provider実装の詳細

#### ChatHistoryProviderProps

```typescript
export interface ChatHistoryProviderProps {
  children: React.ReactNode;
  sessionRepository: IChatSessionRepository;
  messageRepository: IChatMessageRepository;
}
```

#### Provider実装

```typescript
// apps/desktop/src/features/chat-history/context/ChatHistoryProvider.tsx

export function ChatHistoryProvider({
  children,
  sessionRepository,
  messageRepository,
}: ChatHistoryProviderProps): JSX.Element {
  const [isReady, setIsReady] = useState(false);

  // Use Casesをメモ化（リポジトリが変わらない限り再生成しない）
  const useCases = useMemo(() => ({
    createSession: new CreateChatSessionUseCase(sessionRepository),
    addUserMessage: new AddUserMessageUseCase(sessionRepository, messageRepository),
    addAssistantMessage: new AddAssistantMessageUseCase(sessionRepository, messageRepository),
    togglePinned: new TogglePinnedUseCase(sessionRepository),
    searchSessions: new SearchSessionsUseCase(sessionRepository),
  }), [sessionRepository, messageRepository]);

  // 初期化完了を設定
  useEffect(() => {
    setIsReady(true);
  }, []);

  const value: ChatHistoryContextValue = useMemo(() => ({
    ...useCases,
    isReady,
  }), [useCases, isReady]);

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
}
```

**設計ポイント**:

- `useMemo`でUse Casesをメモ化し、不要な再生成を防止
- `isReady`状態で初期化完了を通知
- リポジトリを外部から注入（DI）

### 2.3 Hook使用方法

#### useChatHistory Hook

```typescript
// apps/desktop/src/features/chat-history/hooks/useChatHistory.ts

export function useChatHistory(): ChatHistoryContextValue {
  const context = useContext(ChatHistoryContext);

  if (context === null) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }

  return context;
}
```

**設計ポイント**: Provider外での使用時に明確なエラーメッセージを表示。

#### 使用例

```typescript
function ChatComponent() {
  const { createSession, addUserMessage, isReady } = useChatHistory();

  const handleCreateSession = async () => {
    const result = await createSession.execute({
      userId: "user-123",
      title: "新しいチャット",
    });

    if (result.ok) {
      console.log("Session created:", result.value);
    } else {
      console.error("Error:", result.error);
    }
  };

  if (!isReady) {
    return <Loading />;
  }

  return (
    <button onClick={handleCreateSession}>
      新しいセッションを作成
    </button>
  );
}
```

### 2.4 テストでのMockProvider使用方法

#### MockChatHistoryProvider

```typescript
// apps/desktop/src/features/chat-history/context/__mocks__/MockChatHistoryProvider.tsx

export interface MockChatHistoryProviderProps {
  children: React.ReactNode;
  overrides?: Partial<ChatHistoryContextValue>;
}

export function MockChatHistoryProvider({
  children,
  overrides,
}: MockChatHistoryProviderProps): JSX.Element {
  const value: ChatHistoryContextValue = {
    ...createDefaultMockValue(),
    ...overrides,
  };

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
}
```

#### テストでの使用例

```typescript
import { renderHook } from "@testing-library/react";
import { MockChatHistoryProvider } from "../context/__mocks__/MockChatHistoryProvider";
import { useChatHistory } from "../hooks/useChatHistory";

describe("ChatComponent", () => {
  it("should use mock context", () => {
    const mockCreateSession = {
      execute: vi.fn().mockResolvedValue({ ok: true, value: {} }),
    };

    const wrapper = ({ children }) => (
      <MockChatHistoryProvider
        overrides={{ createSession: mockCreateSession }}
      >
        {children}
      </MockChatHistoryProvider>
    );

    const { result } = renderHook(() => useChatHistory(), { wrapper });

    expect(result.current.createSession).toBe(mockCreateSession);
  });
});
```

### 2.5 アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ ChatHistoryContext│  │ChatHistoryProvider│  │ useChatHistory │ │
│  │  (型定義)         │  │  (DI実装)         │  │    (Hook)      │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                              │                                   │
│                              ↓                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Use Cases                              │ │
│  │  CreateChatSessionUseCase, AddUserMessageUseCase, etc.      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Domain Layer                               │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │   Entities      │  │  Value Objects   │  │ Repository IF  │  │
│  │ ChatSession,    │  │  ChatSessionId,  │  │IChat...Repo    │  │
│  │ ChatMessage     │  │  UserId, etc.    │  │                │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Drizzle Repositories / Mappers                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.6 ファイル構成

```
apps/desktop/src/features/chat-history/
├── context/
│   ├── ChatHistoryContext.tsx       # Context定義
│   ├── ChatHistoryProvider.tsx      # Provider実装
│   ├── index.ts                     # エクスポート
│   ├── __mocks__/
│   │   └── MockChatHistoryProvider.tsx  # テスト用Mock
│   └── __tests__/
│       └── ChatHistoryContext.test.tsx  # Context/Providerテスト
│
├── hooks/
│   ├── useChatHistory.ts            # Custom Hook
│   ├── index.ts                     # エクスポート
│   └── __tests__/
│       └── useChatHistory.test.ts   # Hookテスト
│
└── __tests__/
    └── ChatHistoryIntegration.test.tsx  # 統合テスト
```

---

## まとめ

| コンポーネント          | 責務                  | 使用場面                 |
| ----------------------- | --------------------- | ------------------------ |
| ChatHistoryContext      | 共有データの型定義    | 型安全性の保証           |
| ChatHistoryProvider     | Use Casesの生成・提供 | アプリのルートでラップ   |
| useChatHistory          | Contextの取得         | コンポーネント内での使用 |
| MockChatHistoryProvider | テスト用モック提供    | 単体テスト・統合テスト   |

この実装パターンにより、Clean Architectureの原則に従いながら、ReactのContext APIを活用した型安全なDIが実現されています。
