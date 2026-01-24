# UI設計書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | UT-LLM-HISTORY-001                   |
| 機能名     | llm-conversation-history-persistence |
| バージョン | 1.0.0                                |
| 作成日     | 2026-01-24                           |

---

## 概要

会話履歴の一覧表示・選択・管理を行うUIコンポーネント群の設計。既存のチャットUIと連携して動作する。

---

## コンポーネント構成

```
src/renderer/components/chat/
├── ConversationListPanel/
│   ├── index.tsx
│   ├── ConversationListPanel.tsx
│   ├── ConversationListHeader.tsx
│   ├── ConversationList.tsx
│   ├── ConversationItem.tsx
│   ├── ConversationItemMenu.tsx
│   ├── SearchInput.tsx
│   ├── EmptyState.tsx
│   └── styles.css
└── ChatPanel/
    └── (既存、変更なし)
```

---

## コンポーネント詳細

### 1. ConversationListPanel

会話一覧パネル全体を管理するコンテナコンポーネント。

```typescript
// ConversationListPanel.tsx

interface ConversationListPanelProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function ConversationListPanel({ isOpen, onClose }: ConversationListPanelProps) {
  const { conversations, isLoading, error } = useConversationState();
  const { loadConversations, searchConversations } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchConversations(query);
    } else {
      loadConversations();
    }
  }, [searchConversations, loadConversations]);

  return (
    <div className={`conversation-list-panel ${isOpen ? 'open' : ''}`}>
      <ConversationListHeader onClose={onClose} />
      <SearchInput value={searchQuery} onChange={handleSearch} />
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} />
      ) : conversations.length === 0 ? (
        <EmptyState />
      ) : (
        <ConversationList conversations={conversations} />
      )}
    </div>
  );
}
```

### 2. ConversationListHeader

パネルヘッダー（タイトルと新規作成ボタン）。

```typescript
// ConversationListHeader.tsx

interface ConversationListHeaderProps {
  onClose?: () => void;
}

export function ConversationListHeader({ onClose }: ConversationListHeaderProps) {
  const { createNewConversation } = useConversations();

  return (
    <div className="conversation-list-header">
      <h2>会話履歴</h2>
      <div className="header-actions">
        <button
          className="new-conversation-btn"
          onClick={createNewConversation}
          title="新しい会話"
        >
          <PlusIcon />
        </button>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        )}
      </div>
    </div>
  );
}
```

### 3. SearchInput

会話検索入力フィールド。

```typescript
// SearchInput.tsx

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = '会話を検索...'
}: SearchInputProps) {
  return (
    <div className="search-input-container">
      <SearchIcon />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button className="clear-btn" onClick={() => onChange('')}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
```

### 4. ConversationList

会話一覧のリスト表示。

```typescript
// ConversationList.tsx

interface ConversationListProps {
  conversations: ConversationSummary[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  // ピン留め会話と通常会話を分離
  const pinnedConversations = conversations.filter(c => c.isPinned);
  const regularConversations = conversations.filter(c => !c.isPinned);

  return (
    <div className="conversation-list">
      {pinnedConversations.length > 0 && (
        <>
          <div className="list-section-header">ピン留め</div>
          {pinnedConversations.map(conv => (
            <ConversationItem key={conv.id} conversation={conv} />
          ))}
        </>
      )}
      {regularConversations.length > 0 && (
        <>
          {pinnedConversations.length > 0 && (
            <div className="list-section-header">最近</div>
          )}
          {regularConversations.map(conv => (
            <ConversationItem key={conv.id} conversation={conv} />
          ))}
        </>
      )}
    </div>
  );
}
```

### 5. ConversationItem

個別の会話アイテム表示。

```typescript
// ConversationItem.tsx

interface ConversationItemProps {
  conversation: ConversationSummary;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const { selectConversation, currentConversationId } = useConversations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isSelected = currentConversationId === conversation.id;

  const handleClick = () => {
    selectConversation(conversation.id);
  };

  return (
    <div
      className={`conversation-item ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="conversation-content">
        <div className="conversation-title">
          {conversation.isPinned && <PinIcon className="pin-icon" />}
          {conversation.title}
        </div>
        <div className="conversation-meta">
          <span className="message-count">
            {conversation.messageCount}件
          </span>
          <span className="timestamp">
            {formatRelativeTime(conversation.updatedAt)}
          </span>
        </div>
        {conversation.lastMessagePreview && (
          <div className="last-message-preview">
            {conversation.lastMessagePreview}
          </div>
        )}
      </div>
      <button
        className="menu-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(true);
        }}
      >
        <MoreIcon />
      </button>
      {isMenuOpen && (
        <ConversationItemMenu
          conversation={conversation}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
```

### 6. ConversationItemMenu

会話アイテムのコンテキストメニュー。

```typescript
// ConversationItemMenu.tsx

interface ConversationItemMenuProps {
  conversation: ConversationSummary;
  onClose: () => void;
}

export function ConversationItemMenu({
  conversation,
  onClose
}: ConversationItemMenuProps) {
  const {
    updateConversation,
    deleteConversation,
    renameConversation
  } = useConversations();

  const handlePin = async () => {
    await updateConversation(conversation.id, {
      isPinned: !conversation.isPinned
    });
    onClose();
  };

  const handleRename = async () => {
    const newTitle = prompt('新しいタイトル', conversation.title);
    if (newTitle && newTitle !== conversation.title) {
      await renameConversation(conversation.id, newTitle);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('この会話を削除しますか？')) {
      await deleteConversation(conversation.id);
    }
    onClose();
  };

  return (
    <div className="conversation-menu" onClick={(e) => e.stopPropagation()}>
      <button onClick={handlePin}>
        {conversation.isPinned ? 'ピン留め解除' : 'ピン留め'}
      </button>
      <button onClick={handleRename}>
        名前を変更
      </button>
      <button onClick={handleDelete} className="danger">
        削除
      </button>
    </div>
  );
}
```

### 7. EmptyState

会話がない場合の表示。

```typescript
// EmptyState.tsx

export function EmptyState() {
  const { createNewConversation } = useConversations();

  return (
    <div className="empty-state">
      <ChatIcon className="empty-icon" />
      <p>まだ会話がありません</p>
      <button onClick={createNewConversation}>
        新しい会話を始める
      </button>
    </div>
  );
}
```

---

## Redux連携

```typescript
// store/slices/llmSlice.ts

// State拡張
interface ConversationState {
  conversations: ConversationSummary[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  isLoadingConversations: boolean;
  conversationError: string | null;
}

// Actions
export const conversationActions = {
  setConversations: (state, action: PayloadAction<ConversationSummary[]>) => {
    state.conversations = action.payload;
  },
  setCurrentConversation: (
    state,
    action: PayloadAction<Conversation | null>,
  ) => {
    state.currentConversation = action.payload;
    state.currentConversationId = action.payload?.id ?? null;
    if (action.payload) {
      state.messages = action.payload.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));
    }
  },
  addConversation: (state, action: PayloadAction<ConversationSummary>) => {
    state.conversations = [action.payload, ...state.conversations];
  },
  removeConversation: (state, action: PayloadAction<string>) => {
    state.conversations = state.conversations.filter(
      (c) => c.id !== action.payload,
    );
    if (state.currentConversationId === action.payload) {
      state.currentConversationId = null;
      state.currentConversation = null;
    }
  },
  setLoadingConversations: (state, action: PayloadAction<boolean>) => {
    state.isLoadingConversations = action.payload;
  },
  setConversationError: (state, action: PayloadAction<string | null>) => {
    state.conversationError = action.payload;
  },
};
```

---

## スタイル設計

```css
/* styles.css */

.conversation-list-panel {
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
}

.conversation-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.search-input-container {
  padding: 8px 16px;
}

.search-input {
  width: 100%;
  padding: 8px 32px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color-light);
  transition: background 0.2s;
}

.conversation-item:hover {
  background: var(--bg-hover);
}

.conversation-item.selected {
  background: var(--bg-selected);
}

.conversation-title {
  font-weight: 500;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.conversation-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.last-message-preview {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  text-align: center;
  padding: 32px;
}
```

---

## 画面レイアウト

```
┌────────────────────────────────────────────────────────────────┐
│                         App Header                              │
├──────────────────┬─────────────────────────────────────────────┤
│ Conversation     │                                             │
│ List Panel       │          Chat Panel                         │
│ ┌──────────────┐ │  ┌─────────────────────────────────────────┐│
│ │ 🔍 検索...    │ │  │                                         ││
│ ├──────────────┤ │  │         メッセージ表示エリア             ││
│ │ ピン留め      │ │  │                                         ││
│ │ ├ 会話A 📌   │ │  │                                         ││
│ │ └ 会話B 📌   │ │  │                                         ││
│ ├──────────────┤ │  │                                         ││
│ │ 最近         │ │  ├─────────────────────────────────────────┤│
│ │ ├ 会話C      │ │  │         メッセージ入力エリア             ││
│ │ ├ 会話D      │ │  │  ┌─────────────────────────────┐ [送信] ││
│ │ └ 会話E      │ │  │  │ メッセージを入力...         │        ││
│ └──────────────┘ │  │  └─────────────────────────────┘        ││
│ [+ 新しい会話]   │  └─────────────────────────────────────────┘│
└──────────────────┴─────────────────────────────────────────────┘
```

---

## ユーザーインタラクション

| アクション            | 動作                                     |
| --------------------- | ---------------------------------------- |
| 会話アイテムクリック  | 会話を選択、メッセージ履歴をロード       |
| 検索入力              | リアルタイムでフィルタリング             |
| 新しい会話ボタン      | 新規会話を作成、チャットパネルをリセット |
| メニュー > ピン留め   | 会話のピン留め状態をトグル               |
| メニュー > 名前を変更 | タイトル編集ダイアログ表示               |
| メニュー > 削除       | 確認後に会話を削除（ソフトデリート）     |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
