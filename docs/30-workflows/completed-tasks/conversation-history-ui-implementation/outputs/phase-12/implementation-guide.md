# 会話履歴UI 実装ガイド

> Phase 12 成果物
> タスクID: UI-CONV-HISTORY-001
> 作成日: 2026-01-24

---

## Part 1: 概念的説明（初学者・非技術者向け）

### 1.1 機能の概要

#### 会話履歴UIとは

会話履歴UIは、ユーザーがAIアシスタントとの過去の会話を管理・閲覧できる機能です。チャットアプリケーションのように、複数の会話を整理し、必要に応じて検索や編集ができます。

#### ユーザーができること

| 機能             | 説明                           |
| ---------------- | ------------------------------ |
| 会話一覧の閲覧   | 過去の会話をリスト形式で確認   |
| 会話の検索       | キーワードで会話を検索         |
| 新規会話の作成   | 新しい会話を開始               |
| 会話の削除       | 不要な会話を削除               |
| メッセージの閲覧 | 選択した会話のメッセージを表示 |
| タイトルの編集   | 会話のタイトルを変更           |
| メッセージの送信 | AIに新しいメッセージを送信     |

### 1.2 アーキテクチャの概念説明

#### コンポーネント構成の概要

```
┌─────────────────────────────────────────────────────────┐
│                   デスクトップアプリ                    │
├──────────────────┬──────────────────────────────────────┤
│   会話一覧       │           会話詳細                   │
│  ┌─────────────┐ │  ┌────────────────────────────────┐  │
│  │ 検索バー    │ │  │ タイトル（編集可能）          │  │
│  ├─────────────┤ │  ├────────────────────────────────┤  │
│  │ 新規作成    │ │  │                                │  │
│  ├─────────────┤ │  │    メッセージ一覧              │  │
│  │             │ │  │                                │  │
│  │ 会話リスト  │ │  │  ユーザー: こんにちは          │  │
│  │             │ │  │  AI: こんにちは！              │  │
│  │ - 会話1     │ │  │                                │  │
│  │ - 会話2     │ │  ├────────────────────────────────┤  │
│  │ - 会話3     │ │  │ メッセージ入力欄    [送信]    │  │
│  └─────────────┘ │  └────────────────────────────────┘  │
└──────────────────┴──────────────────────────────────────┘
```

#### データの流れ

```
ユーザー操作 → UIコンポーネント → React Hooks → IPC通信 → データベース
     ↑                                               │
     └───────────────── 画面更新 ←──────────────────┘
```

1. **ユーザー操作**: ボタンクリック、テキスト入力など
2. **UIコンポーネント**: 画面の見た目と操作を担当
3. **React Hooks**: データの取得・更新ロジック
4. **IPC通信**: RendererプロセスとMainプロセス間の通信
5. **データベース**: 会話とメッセージの永続化

---

## Part 2: 技術的詳細（開発者向け）

### 2.1 コンポーネント詳細

#### コンポーネント構成（Atomic Design）

```
components/conversation/
├── ConversationListPanel.tsx   # Organism: 会話一覧パネル
├── ConversationDetailView.tsx  # Organism: 会話詳細ビュー
├── ConversationListItem.tsx    # Molecule: 会話アイテム
├── ConversationSearch.tsx      # Molecule: 検索コンポーネント
├── ConversationHeader.tsx      # Molecule: ヘッダー（タイトル編集）
├── MessageList.tsx             # Molecule: メッセージ一覧
├── MessageBubble.tsx           # Atom: メッセージ吹き出し
├── MessageInput.tsx            # Molecule: メッセージ入力
└── NewConversationButton.tsx   # Atom: 新規作成ボタン
```

#### 各コンポーネントの責務

##### ConversationListPanel（Organism）

会話一覧パネル全体を管理する最上位コンポーネント。

```typescript
interface ConversationListPanelProps {
  conversations: ConversationSummary[];
  selectedId: string | null;
  isLoading: boolean;
  error?: Error | null;
  hasMore?: boolean;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onSearch?: (query: string) => void;
  onLoadMore?: () => void;
  onDelete?: (id: string) => void;
  onFavoriteToggle?: (id: string) => void;
  onPinToggle?: (id: string) => void;
}
```

使用例:

```tsx
<ConversationListPanel
  conversations={conversations}
  selectedId={selectedId}
  isLoading={isLoading}
  onSelect={handleSelect}
  onCreateNew={handleCreate}
  onSearch={handleSearch}
/>
```

##### ConversationDetailView（Organism）

会話詳細ビュー全体を管理するコンポーネント。

```typescript
interface ConversationDetailViewProps {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending?: boolean;
  error?: Error | null;
  onSendMessage: (content: string) => void;
  onUpdateTitle?: (title: string) => void;
  onRetry?: () => void;
}
```

##### MessageBubble（Atom）

メッセージを表示する吹き出しコンポーネント。

```typescript
interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
  isStreaming?: boolean;
  isError?: boolean;
  onCopy?: (content: string) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (id: string) => void;
  onRetry?: (message: Message) => void;
}
```

特徴:

- マークダウンレンダリング（コードブロック、太字、リンク等）
- ユーザー/アシスタントの視覚的区別
- ストリーミング表示対応
- React.memoによる最適化

##### MessageInput（Molecule）

メッセージ入力コンポーネント。

```typescript
interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  isSending?: boolean;
  maxLength?: number;
  onAttach?: (files: File[]) => void;
  onTyping?: () => void;
}
```

キーボード操作:

- **Enter**: メッセージ送信
- **Shift+Enter**: 改行

##### ConversationSearch（Molecule）

検索コンポーネント。

```typescript
interface ConversationSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number; // デフォルト: 300ms
  isSearching?: boolean;
}
```

---

### 2.2 Hooks詳細

#### useConversations

会話一覧の取得・管理を行うHook。

```typescript
function useConversations(options?: { limit?: number; autoFetch?: boolean }): {
  conversations: ConversationSummary[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;

  // Actions
  fetchConversations: () => Promise<void>;
  loadMore: () => Promise<void>;
  create: (title?: string, firstMessage?: string) => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  search: (query: string) => Promise<void>;
  refresh: () => Promise<void>;
};
```

使用例:

```tsx
const { conversations, isLoading, error, create, search } = useConversations({
  limit: 20,
  autoFetch: true,
});
```

#### useConversation

単一会話の取得・更新を行うHook。

```typescript
function useConversation(conversationId: string | null): {
  conversation: Conversation | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  fetchConversation: () => Promise<void>;
  updateTitle: (title: string) => Promise<void>;
  refresh: () => Promise<void>;
};
```

#### useMessages

メッセージの取得・追加を行うHook。

```typescript
function useMessages(conversationId: string | null): {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: Error | null;

  // Actions
  fetchMessages: () => Promise<void>;
  addMessage: (
    content: string,
    role?: "user" | "assistant",
  ) => Promise<Message>;
  refresh: () => Promise<void>;
};
```

#### usePagination（共通）

ページネーション状態管理の共通Hook。

```typescript
function usePagination(options?: { initialPage?: number; pageSize?: number }): {
  page: number;
  pageSize: number;
  offset: number;

  // Actions
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  reset: () => void;
};
```

---

### 2.3 Preload API詳細

#### IPCチャンネル一覧

| チャンネル                | 説明           | 引数                                | 戻り値                              |
| ------------------------- | -------------- | ----------------------------------- | ----------------------------------- |
| `conversation:create`     | 会話作成       | `{ title?, firstMessage? }`         | `Conversation`                      |
| `conversation:get`        | 会話取得       | `{ id }`                            | `Conversation \| null`              |
| `conversation:list`       | 会話一覧取得   | `{ limit?, offset? }`               | `{ conversations, total, hasMore }` |
| `conversation:update`     | 会話更新       | `{ id, title? }`                    | `Conversation`                      |
| `conversation:delete`     | 会話削除       | `{ id }`                            | `void`                              |
| `conversation:addMessage` | メッセージ追加 | `{ conversationId, content, role }` | `Message`                           |
| `conversation:search`     | 会話検索       | `{ query, limit? }`                 | `ConversationSummary[]`             |

#### 使用方法

```typescript
// Preload APIを通じてアクセス
const api = window.conversationAPI;

// 会話一覧取得
const { conversations, hasMore } = await api.list({ limit: 20, offset: 0 });

// 会話作成
const newConversation = await api.create({ title: "新しい会話" });

// メッセージ追加
const message = await api.addMessage({
  conversationId: "conv-123",
  content: "こんにちは",
  role: "user",
});
```

---

### 2.4 型定義

#### Conversation

```typescript
interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  isFavorite: boolean;
  isPinned: boolean;
}
```

#### ConversationSummary

```typescript
interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview?: string;
  isFavorite: boolean;
  isPinned: boolean;
}
```

#### Message

```typescript
interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  messageIndex: number;
  timestamp: string;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
}
```

#### Attachment

```typescript
interface Attachment {
  id: string;
  type: "image" | "file" | "code";
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}
```

---

### 2.5 共通コンポーネント

#### LoadingState

ローディング表示コンポーネント（4種類のバリアント）。

```typescript
type LoadingStateVariant = "list" | "detail" | "messages" | "inline";

interface LoadingStateProps {
  variant?: LoadingStateVariant;
  itemCount?: number;
  className?: string;
}
```

#### ErrorDisplay

エラー表示コンポーネント（3種類のバリアント）。

```typescript
type ErrorDisplayVariant = "inline" | "full" | "centered";

interface ErrorDisplayProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: ErrorDisplayVariant;
  className?: string;
}
```

#### EmptyState

空状態表示コンポーネント（5種類のバリアント）。

```typescript
type EmptyStateVariant =
  | "conversation"
  | "conversationList"
  | "messages"
  | "search"
  | "custom";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}
```

---

### 2.6 拡張・カスタマイズガイド

#### 新しいコンポーネントの追加

1. `components/conversation/`に新しいコンポーネントを作成
2. テストファイルを`__tests__/`に作成
3. Atomic Design原則に従ってAtom/Molecule/Organismを選択
4. アクセシビリティ属性（aria-label, role等）を追加
5. React.memoで最適化（リスト内要素の場合）

#### 新しいHookの追加

1. `hooks/`にHookを作成
2. `useMemo`で戻り値をメモ化
3. `normalizeError`でエラーを正規化
4. テストファイルを作成

#### IPCチャンネルの追加

1. `shared/types/conversation.ts`に型を追加
2. `main/ipc/conversationHandlers.ts`にハンドラを追加
3. `preload/conversationAPI.ts`にAPIを追加
4. テストを追加

---

### 2.7 テスト戦略

#### テストファイル構成

```
__tests__/
├── ConversationListPanel.test.tsx    # コンポーネントテスト
├── MessageBubble.test.tsx            # コンポーネントテスト
├── EdgeCases.test.tsx                # エッジケーステスト
└── ...

hooks/__tests__/
├── useConversations.test.ts          # Hookテスト
├── useConversation.test.ts           # Hookテスト
└── useMessages.test.ts               # Hookテスト
```

#### カバレッジ達成状況

| 指標              | 目標 | 達成値 |
| ----------------- | ---- | ------ |
| Line Coverage     | 80%+ | 98.66% |
| Branch Coverage   | 60%+ | 95.07% |
| Function Coverage | 80%+ | 100%   |

#### テスト実行

```bash
# 会話関連テストの実行
pnpm --filter @repo/desktop test -- --grep "conversation"

# 特定ファイルのテスト実行
pnpm --filter @repo/desktop test -- MessageBubble.test.tsx
```

---

## 付録

### A. ファイル一覧

| カテゴリ           | ファイルパス                                                            |
| ------------------ | ----------------------------------------------------------------------- |
| UIコンポーネント   | `apps/desktop/src/renderer/components/conversation/`                    |
| Hooks              | `apps/desktop/src/renderer/hooks/useConversation*.ts`, `useMessages.ts` |
| 共通コンポーネント | `apps/desktop/src/renderer/components/common/`                          |
| ユーティリティ     | `apps/desktop/src/renderer/utils/ipc.ts`                                |
| 型定義             | `apps/desktop/src/shared/types/conversation.ts`                         |
| テスト             | `apps/desktop/src/renderer/components/conversation/__tests__/`          |

### B. 依存関係

- React 18+
- TypeScript 5.x
- Electron IPC
- Vitest + React Testing Library

### C. アクセシビリティ対応

- WCAG 2.1 AA準拠
- キーボードナビゲーション完全対応
- スクリーンリーダー対応（aria-label, role, aria-live）
- 色コントラスト基準達成
