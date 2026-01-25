# Phase 2: 設計書 - 会話履歴UI実装

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| 作成日     | 2026-01-24                             |
| Phase      | 2                                      |
| 機能名     | conversation-history-ui-implementation |
| ステータス | 完了                                   |

---

## 1. コンポーネント設計

### 1.1 コンポーネント階層

```
ConversationPanel (Organism) - 会話履歴全体のコンテナ
├── ConversationListPanel (Organism) - 一覧パネル（左サイドバー）
│   ├── ConversationSearch (Molecule) - 検索入力
│   ├── NewConversationButton (Atom) - 新規作成ボタン
│   ├── ConversationListItem (Molecule) - 個別会話アイテム
│   │   └── DeleteButton (Atom) - 削除ボタン
│   ├── LoadingSkeleton (Molecule) - ローディング表示
│   ├── ErrorDisplay (Molecule) - エラー表示
│   ├── EmptyState (Molecule) - 空状態表示
│   └── LoadMoreButton (Molecule) - 追加読み込み
│
├── ConversationDetailView (Organism) - 詳細ビュー（メインエリア）
│   ├── ConversationHeader (Molecule) - ヘッダー
│   │   ├── EditableTitle (Atom) - 編集可能タイトル
│   │   └── DeleteButton (Atom) - 削除ボタン
│   ├── MessageList (Organism) - メッセージ一覧
│   │   └── MessageBubble (Molecule) - メッセージバブル
│   │       ├── Avatar (Atom) - アバター
│   │       └── MessageContent (Atom) - メッセージ内容
│   └── MessageInput (Organism) - 入力フォーム
│       ├── TextArea (Atom) - テキスト入力
│       └── SendButton (Atom) - 送信ボタン
│
└── DeleteConfirmDialog (Molecule) - 削除確認ダイアログ
```

### 1.2 ファイル構成

```
apps/desktop/src/renderer/components/conversation/
├── index.ts                     # エクスポート
├── ConversationPanel.tsx        # メインコンテナ
├── ConversationListPanel.tsx    # 一覧パネル
├── ConversationListItem.tsx     # 個別アイテム
├── ConversationSearch.tsx       # 検索
├── ConversationDetailView.tsx   # 詳細ビュー
├── ConversationHeader.tsx       # ヘッダー
├── MessageList.tsx              # メッセージ一覧
├── MessageBubble.tsx            # メッセージバブル
├── MessageInput.tsx             # 入力フォーム
├── DeleteConfirmDialog.tsx      # 削除確認
├── EmptyState.tsx               # 空状態
└── __tests__/                   # テストフォルダ
    ├── ConversationPanel.test.tsx
    ├── ConversationListPanel.test.tsx
    ├── ConversationListItem.test.tsx
    ├── ConversationDetailView.test.tsx
    ├── MessageList.test.tsx
    ├── MessageBubble.test.tsx
    └── MessageInput.test.tsx
```

### 1.3 Props定義

#### ConversationPanel

```typescript
interface ConversationPanelProps {
  userId: string;
  className?: string;
}
```

#### ConversationListPanel

```typescript
interface ConversationListPanelProps {
  userId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  className?: string;
}
```

#### ConversationListItem

```typescript
interface ConversationListItemProps {
  conversation: ConversationSummary;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}
```

#### ConversationSearch

```typescript
interface ConversationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  placeholder?: string;
}
```

#### ConversationDetailView

```typescript
interface ConversationDetailViewProps {
  conversationId: string;
  userId: string;
  onTitleUpdate: (title: string) => void;
  onClose: () => void;
  className?: string;
}
```

#### ConversationHeader

```typescript
interface ConversationHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onDelete: () => void;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
}
```

#### MessageList

```typescript
interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  className?: string;
}
```

#### MessageBubble

```typescript
interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
  showModel?: boolean;
}
```

#### MessageInput

```typescript
interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  isSending: boolean;
  disabled?: boolean;
  placeholder?: string;
}
```

#### DeleteConfirmDialog

```typescript
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

---

## 2. Preload API設計（UI-004）

### 2.1 IPCチャンネル定義（既存確認済み）

```typescript
// apps/desktop/src/preload/channels.ts
export const IPC_CHANNELS = {
  // ... 既存チャンネル ...

  // Conversation operations
  CONVERSATION_LIST: "conversation:list",
  CONVERSATION_GET: "conversation:get",
  CONVERSATION_CREATE: "conversation:create",
  CONVERSATION_UPDATE: "conversation:update",
  CONVERSATION_DELETE: "conversation:delete",
  CONVERSATION_ADD_MESSAGE: "conversation:addMessage",
  CONVERSATION_SEARCH: "conversation:search",
} as const;
```

### 2.2 conversationAPI オブジェクト設計

```typescript
// apps/desktop/src/preload/index.ts
import {
  ConversationAPI,
  ConversationListRequest,
  ConversationGetRequest,
  ConversationCreateRequest,
  ConversationUpdateRequest,
  ConversationDeleteRequest,
  ConversationAddMessageRequest,
  ConversationSearchRequest,
} from "../shared/types/conversation";

const conversationAPI: ConversationAPI = {
  list: (request: ConversationListRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_LIST, request),

  get: (request: ConversationGetRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_GET, request),

  create: (request: ConversationCreateRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_CREATE, request),

  update: (request: ConversationUpdateRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_UPDATE, request),

  delete: (request: ConversationDeleteRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_DELETE, request),

  addMessage: (request: ConversationAddMessageRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_ADD_MESSAGE, request),

  search: (request: ConversationSearchRequest) =>
    safeInvoke(IPC_CHANNELS.CONVERSATION_SEARCH, request),
};

// contextBridge経由で公開
contextBridge.exposeInMainWorld("conversationAPI", conversationAPI);
```

### 2.3 ホワイトリスト登録（既存確認済み）

```typescript
// apps/desktop/src/preload/channels.ts
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存チャンネル ...

  // Conversation channels
  IPC_CHANNELS.CONVERSATION_LIST,
  IPC_CHANNELS.CONVERSATION_GET,
  IPC_CHANNELS.CONVERSATION_CREATE,
  IPC_CHANNELS.CONVERSATION_UPDATE,
  IPC_CHANNELS.CONVERSATION_DELETE,
  IPC_CHANNELS.CONVERSATION_ADD_MESSAGE,
  IPC_CHANNELS.CONVERSATION_SEARCH,
];
```

### 2.4 window.conversationAPI 型定義

```typescript
// apps/desktop/src/renderer/types/global.d.ts
import { ConversationAPI } from "../../shared/types/conversation";

declare global {
  interface Window {
    conversationAPI: ConversationAPI;
  }
}
```

---

## 3. Hooks設計

### 3.1 useConversations Hook

```typescript
// apps/desktop/src/renderer/hooks/useConversations.ts

interface UseConversationsOptions {
  userId: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseConversationsReturn {
  /** 会話一覧 */
  conversations: ConversationSummary[];
  /** ローディング中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 追加データの有無 */
  hasMore: boolean;
  /** 検索中フラグ */
  isSearching: boolean;
  /** 追加データ読み込み */
  loadMore: () => Promise<void>;
  /** キーワード検索 */
  search: (query: string) => Promise<void>;
  /** 検索クリア */
  clearSearch: () => void;
  /** 新規会話作成 */
  create: (title: string, firstMessage?: string) => Promise<Conversation>;
  /** 会話削除 */
  deleteConversation: (id: string) => Promise<void>;
  /** データ再取得 */
  refresh: () => Promise<void>;
}

function useConversations(
  options: UseConversationsOptions,
): UseConversationsReturn;
```

#### 実装詳細

```typescript
export function useConversations({
  userId,
  limit = 20,
  autoFetch = true,
}: UseConversationsOptions): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const fetchConversations = useCallback(
    async (reset = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const newOffset = reset ? 0 : offset;
        const response = await window.conversationAPI.list({
          userId,
          limit,
          offset: newOffset,
        });
        if (response.success) {
          if (reset) {
            setConversations(response.data);
          } else {
            setConversations((prev) => [...prev, ...response.data]);
          }
          setHasMore(response.data.length === limit);
          setOffset(newOffset + response.data.length);
        } else {
          throw new Error(response.error.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [userId, limit, offset],
  );

  // ... 他のメソッド実装
}
```

### 3.2 useConversation Hook

```typescript
// apps/desktop/src/renderer/hooks/useConversation.ts

interface UseConversationOptions {
  conversationId: string;
  autoFetch?: boolean;
}

interface UseConversationReturn {
  /** 会話詳細 */
  conversation: Conversation | null;
  /** ローディング中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** タイトル更新 */
  updateTitle: (title: string) => Promise<void>;
  /** データ再取得 */
  refresh: () => Promise<void>;
}

function useConversation(
  options: UseConversationOptions,
): UseConversationReturn;
```

### 3.3 useMessages Hook

```typescript
// apps/desktop/src/renderer/hooks/useMessages.ts

interface UseMessagesOptions {
  conversationId: string;
  userId: string;
}

interface UseMessagesReturn {
  /** メッセージ一覧 */
  messages: Message[];
  /** ローディング中フラグ */
  isLoading: boolean;
  /** 送信中フラグ */
  isSending: boolean;
  /** エラー情報 */
  error: Error | null;
  /** メッセージ追加 */
  addMessage: (
    content: string,
    role?: "user" | "assistant",
  ) => Promise<Message>;
  /** ローカルにメッセージ追加（楽観的更新用） */
  appendMessageOptimistic: (message: Message) => void;
}

function useMessages(options: UseMessagesOptions): UseMessagesReturn;
```

---

## 4. 状態管理設計

### 4.1 状態管理方針

会話履歴UIの状態管理は、以下の方針で設計する：

| 状態種別         | 管理方法         | 理由                         |
| ---------------- | ---------------- | ---------------------------- |
| 会話一覧データ   | useConversations | API応答をローカル管理        |
| 会話詳細データ   | useConversation  | 単一会話のライフサイクル管理 |
| メッセージデータ | useMessages      | 送信状態との連携必須         |
| 選択中会話ID     | React State      | コンポーネントローカル状態   |
| 検索クエリ       | useConversations | 一覧取得と連動               |
| UI表示状態       | React State      | コンポーネントローカル状態   |

### 4.2 既存chatSliceとの統合方針

既存のchatSliceは、LLMチャット機能の状態管理を担当している。会話履歴UIは、chatSliceとは独立して動作する新規機能として実装する：

```typescript
// 独立した設計（chatSliceに依存しない）
// 理由：
// 1. chatSliceはリアルタイムチャット用、会話履歴は過去データ閲覧用
// 2. 責務が異なるため分離
// 3. 将来的な統合は別タスクで検討
```

### 4.3 コンポーネント間の状態共有

```typescript
// ConversationPanel内での状態管理
function ConversationPanel({ userId }: ConversationPanelProps) {
  // 選択状態はローカルで管理
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 一覧データはHookで管理
  const {
    conversations,
    isLoading,
    create,
    deleteConversation,
    // ...
  } = useConversations({ userId });

  return (
    <div className="flex">
      <ConversationListPanel
        userId={userId}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDelete={deleteConversation}
        onCreate={handleCreate}
      />
      {selectedId && (
        <ConversationDetailView
          conversationId={selectedId}
          userId={userId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
```

---

## 5. データフロー設計

### 5.1 会話一覧→詳細のデータフロー

```
1. ユーザーがConversationListItemをクリック
   ↓
2. onSelect(id)がConversationPanelに伝播
   ↓
3. setSelectedId(id)で選択状態更新
   ↓
4. ConversationDetailViewがレンダリング
   ↓
5. useConversation(id)がconversation:getを呼び出し
   ↓
6. IPC経由でMain ProcessのconversationHandlersへ
   ↓
7. ConversationRepositoryがDBからデータ取得
   ↓
8. レスポンスがRenderer Processに返却
   ↓
9. ConversationDetailViewが会話詳細を表示
```

### 5.2 メッセージ送信→表示更新のデータフロー

```
1. ユーザーがMessageInputで送信
   ↓
2. useMessages.addMessage(content)呼び出し
   ↓
3. 楽観的更新：appendMessageOptimistic(newMessage)
   ↓
4. IPC: conversation:addMessage
   ↓
5. Main Process: conversationHandlers.addMessage
   ↓
6. ConversationRepository.addMessage(SQLite書き込み)
   ↓
7. レスポンス返却
   ↓
8. 成功：楽観的更新を確定
   失敗：楽観的更新をロールバック、エラー表示
```

### 5.3 エラーハンドリングフロー

```typescript
// 統一エラーハンドリングパターン
interface ConversationError {
  code: string;
  message: string;
}

// エラー種別と表示メッセージ
const ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: "会話が見つかりません",
  NETWORK_ERROR: "通信エラーが発生しました",
  VALIDATION_ERROR: "入力内容を確認してください",
  UNKNOWN: "予期しないエラーが発生しました",
};

// Hook内でのエラーハンドリング
try {
  const response = await window.conversationAPI.list(request);
  if (!response.success) {
    throw new Error(response.error.message);
  }
  // 成功処理
} catch (err) {
  setError(err instanceof Error ? err : new Error("Unknown error"));
  // オプション：トースト通知
}
```

### 5.4 ローディング状態管理フロー

```typescript
// ローディング状態の種類
interface LoadingStates {
  isLoading: boolean; // 初期読み込み
  isLoadingMore: boolean; // 追加読み込み
  isSending: boolean; // メッセージ送信中
  isSearching: boolean; // 検索中
  isDeleting: boolean; // 削除中
}

// UI表示パターン
// isLoading=true → LoadingSkeleton表示
// isLoadingMore=true → リスト末尾にスピナー
// isSending=true → MessageInput無効化+スピナー
// isSearching=true → 検索入力横にスピナー
// isDeleting=true → DeleteConfirmDialog内スピナー
```

---

## 6. 統合テスト連携

### 6.1 IPC通信モック方針

```typescript
// テスト用モックの設計
// apps/desktop/src/renderer/__tests__/mocks/conversationAPI.ts

export const mockConversationAPI: ConversationAPI = {
  list: vi.fn().mockResolvedValue({
    success: true,
    data: mockConversationSummaries,
  }),
  get: vi.fn().mockResolvedValue({
    success: true,
    data: mockConversation,
  }),
  create: vi.fn().mockResolvedValue({
    success: true,
    data: mockNewConversation,
  }),
  update: vi.fn().mockResolvedValue({
    success: true,
    data: mockUpdatedConversation,
  }),
  delete: vi.fn().mockResolvedValue({
    success: true,
    data: { deleted: true },
  }),
  addMessage: vi.fn().mockResolvedValue({
    success: true,
    data: mockNewMessage,
  }),
  search: vi.fn().mockResolvedValue({
    success: true,
    data: mockSearchResults,
  }),
};

// テストセットアップ
beforeEach(() => {
  vi.stubGlobal("conversationAPI", mockConversationAPI);
});
```

### 6.2 統合テストシナリオ

| シナリオ | テスト内容                             |
| -------- | -------------------------------------- |
| E2E-001  | 会話一覧表示→会話選択→詳細表示         |
| E2E-002  | 新規会話作成→メッセージ送信→一覧に反映 |
| E2E-003  | 会話検索→結果表示→検索クリア           |
| E2E-004  | 会話削除→確認ダイアログ→一覧から削除   |
| E2E-005  | ページネーション→追加読み込み→表示更新 |

---

## 7. アクセシビリティ設計

### 7.1 キーボードナビゲーション

| キー         | 動作                            |
| ------------ | ------------------------------- |
| Tab          | フォーカス移動                  |
| Enter        | 項目選択/ボタン実行             |
| Space        | チェックボックス/ボタン実行     |
| Escape       | ダイアログ閉じる/編集キャンセル |
| ArrowUp/Down | リスト内移動                    |

### 7.2 ARIA属性実装

```tsx
// ConversationListPanel
<nav
  role="navigation"
  aria-label="会話一覧"
>
  <ul role="listbox" aria-label="会話リスト">
    {conversations.map((conv) => (
      <li
        key={conv.id}
        role="option"
        aria-selected={selectedId === conv.id}
        tabIndex={0}
      >
        ...
      </li>
    ))}
  </ul>
</nav>

// MessageList
<div
  role="log"
  aria-live="polite"
  aria-label="メッセージ一覧"
>
  {messages.map((msg) => (
    <article
      key={msg.id}
      aria-label={`${msg.role}のメッセージ`}
    >
      ...
    </article>
  ))}
</div>

// MessageInput
<textarea
  role="textbox"
  aria-label="メッセージ入力"
  aria-describedby="input-hint"
/>
<span id="input-hint" className="sr-only">
  Enterで送信、Shift+Enterで改行
</span>
```

---

## 完了条件チェックリスト

- [x] コンポーネント設計（Props定義含む）完了
- [x] Preload API設計（7チャンネル）完了
- [x] Hooks設計（useConversations, useConversation, useMessages）完了
- [x] 状態管理設計完了
- [x] データフロー設計完了
- [x] `outputs/phase-2/design-document.md` 作成完了

---

## Phase末端アクション

- [x] 本Phase内の全タスク（タスク1〜5）を100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
