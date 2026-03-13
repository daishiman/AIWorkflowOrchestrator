# チャット履歴永続化 インターフェース仕様 / detail specification

> 親仕様書: [interfaces-chat-history.md](interfaces-chat-history.md)
> 役割: detail specification

## React Hooks

### useConversations

会話一覧管理Hook。

| 戻り値             | 型                                        | 説明             |
| ------------------ | ----------------------------------------- | ---------------- |
| conversations      | ConversationSummary[]                     | 会話サマリー配列 |
| isLoading          | boolean                                   | ローディング状態 |
| error              | Error \| null                             | エラー状態       |
| hasMore            | boolean                                   | 追加データ有無   |
| loadMore           | () => Promise<void>                       | 追加読み込み     |
| refresh            | () => Promise<void>                       | リフレッシュ     |
| createConversation | (title?: string) => Promise<Conversation> | 新規作成         |
| deleteConversation | (id: string) => Promise<void>             | 削除             |

### useConversation

会話詳細管理Hook。

| 戻り値       | 型                               | 説明             |
| ------------ | -------------------------------- | ---------------- |
| conversation | Conversation \| null             | 会話詳細         |
| isLoading    | boolean                          | ローディング状態 |
| error        | Error \| null                    | エラー状態       |
| updateTitle  | (title: string) => Promise<void> | タイトル更新     |
| refresh      | () => Promise<void>              | リフレッシュ     |

### useMessages

メッセージ管理Hook。

| 戻り値      | 型                                 | 説明             |
| ----------- | ---------------------------------- | ---------------- |
| messages    | Message[]                          | メッセージ配列   |
| isLoading   | boolean                            | ローディング状態 |
| isSending   | boolean                            | 送信中状態       |
| error       | Error \| null                      | エラー状態       |
| sendMessage | (content: string) => Promise<void> | メッセージ送信   |
| hasMore     | boolean                            | 追加データ有無   |
| loadMore    | () => Promise<void>                | 追加読み込み     |

---

## UIコンポーネント構成（Atomic Design）

### Organisms（organisms）

| コンポーネント         | 責務                         | 主要Props                        |
| ---------------------- | ---------------------------- | -------------------------------- |
| ConversationListPanel  | 会話一覧パネル（サイドバー） | onSelectConversation, selectedId |
| ConversationDetailView | 会話詳細ビュー全体           | conversationId                   |

### Molecules（molecules）

| コンポーネント       | 責務                         | 主要Props                         |
| -------------------- | ---------------------------- | --------------------------------- |
| ConversationListItem | 個別会話アイテム             | conversation, isSelected, onClick |
| ConversationHeader   | 会話ヘッダー（タイトル編集） | title, onTitleChange              |
| ConversationSearch   | 検索入力                     | value, onChange, onSearch         |
| MessageList          | メッセージ一覧               | messages, isLoading               |
| MessageBubble        | 個別メッセージ吹き出し       | message                           |
| MessageInput         | メッセージ入力フォーム       | onSend, disabled, isLoading       |

### Atoms（atoms）

| コンポーネント        | 責務             | 主要Props                  |
| --------------------- | ---------------- | -------------------------- |
| NewConversationButton | 新規作成ボタン   | onClick, disabled          |
| LoadingState          | ローディング表示 | message                    |
| ErrorDisplay          | エラー表示       | error, onRetry             |
| EmptyState            | 空状態表示       | title, description, action |

---

## アクセシビリティ対応

| 対応項目                 | 状況        | 実装詳細                        |
| ------------------------ | ----------- | ------------------------------- |
| キーボードナビゲーション | 完全対応    | Tab/Enter/Escape/Arrow keys     |
| スクリーンリーダー       | 完全対応    | aria-label, aria-live, role属性 |
| 色コントラスト           | WCAG AA準拠 | 4.5:1以上のコントラスト比       |
| フォーカス管理           | 完全対応    | visible focus indicators        |

---

