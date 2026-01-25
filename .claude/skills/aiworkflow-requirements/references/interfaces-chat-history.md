# チャット履歴永続化 インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

チャット履歴永続化機能は、ユーザーとアシスタント間の会話をローカルSQLiteデータベースに保存し、セッション管理、検索、エクスポート機能を提供する。

**実装ファイル**:

- `packages/shared/src/db/schema/chat-history.ts` - スキーマ定義
- `packages/shared/src/repositories/chat-session-repository.ts` - セッションリポジトリ
- `packages/shared/src/repositories/chat-message-repository.ts` - メッセージリポジトリ
- `packages/shared/src/features/chat-history/chat-history-service.ts` - 統合サービス

---

## データベーススキーマ

### chat_sessionsテーブル

| カラム      | 型      | 制約                | 説明                     |
| ----------- | ------- | ------------------- | ------------------------ |
| id          | TEXT    | PRIMARY KEY         | セッションID（UUID）     |
| user_id     | TEXT    | NOT NULL            | ユーザーID               |
| title       | TEXT    | NOT NULL            | セッションタイトル       |
| preview     | TEXT    | DEFAULT ''          | プレビュー（先頭30文字） |
| is_favorite | INTEGER | DEFAULT 0           | お気に入りフラグ         |
| is_pinned   | INTEGER | DEFAULT 0           | ピン留めフラグ           |
| created_at  | INTEGER | DEFAULT unixepoch() | 作成日時                 |
| updated_at  | INTEGER | DEFAULT unixepoch() | 更新日時                 |

**インデックス**:

- `idx_sessions_user_id`: ユーザー別一覧取得
- `idx_sessions_user_created_at`: 作成日時ソート
- `idx_sessions_user_updated_at`: 更新日時ソート
- `idx_sessions_user_pinned`: ピン留め取得
- `idx_sessions_user_favorite`: お気に入り取得
- `chat_sessions_fts`: 全文検索（FTS5）

### chat_messagesテーブル

| カラム        | 型      | 制約                           | 説明                           |
| ------------- | ------- | ------------------------------ | ------------------------------ |
| id            | TEXT    | PRIMARY KEY                    | メッセージID（UUID）           |
| session_id    | TEXT    | NOT NULL, FK→chat_sessions(id) | セッションID参照               |
| role          | TEXT    | NOT NULL                       | 'user' \| 'assistant'          |
| content       | TEXT    | NOT NULL                       | メッセージ内容                 |
| message_index | INTEGER | NOT NULL                       | セッション内の順序番号         |
| llm_model_id  | TEXT    |                                | LLMモデルID（assistant時）     |
| llm_provider  | TEXT    |                                | LLMプロバイダー（assistant時） |
| llm_metadata  | TEXT    |                                | LLMメタデータJSON              |
| created_at    | INTEGER | DEFAULT unixepoch()            | 作成日時                       |

**インデックス**:

- `idx_messages_session_id`: セッション別メッセージ取得
- `idx_messages_session_index`: メッセージ順序
- `idx_messages_created_at`: 作成日時ソート
- `chat_messages_fts`: 全文検索（FTS5）

---

## ドメインエンティティ型定義

### ChatSession

チャットセッションエンティティ型。

| フィールド | 型      | 説明                 |
| ---------- | ------- | -------------------- |
| id         | string  | セッションID（UUID） |
| userId     | string  | ユーザーID           |
| title      | string  | セッションタイトル   |
| preview    | string  | プレビュー文字列     |
| isFavorite | boolean | お気に入りフラグ     |
| isPinned   | boolean | ピン留めフラグ       |
| createdAt  | Date    | 作成日時             |
| updatedAt  | Date    | 更新日時             |

### ChatMessage

チャットメッセージエンティティ型。

| フィールド   | 型                              | 説明                           |
| ------------ | ------------------------------- | ------------------------------ |
| id           | string                          | メッセージID（UUID）           |
| sessionId    | string                          | セッションID                   |
| role         | 'user' \| 'assistant'           | メッセージ送信者               |
| content      | string                          | メッセージ内容                 |
| messageIndex | number                          | セッション内の順序番号         |
| llmModelId   | string \| null                  | LLMモデルID（assistant時）     |
| llmProvider  | string \| null                  | LLMプロバイダー（assistant時） |
| llmMetadata  | Record<string, unknown> \| null | LLMメタデータ                  |
| createdAt    | Date                            | 作成日時                       |

### LLMMetadata

LLMメタデータ型（assistant応答時に保存）。

| フィールド       | 型     | 説明                   |
| ---------------- | ------ | ---------------------- |
| promptTokens     | number | 入力トークン数（任意） |
| completionTokens | number | 出力トークン数（任意） |
| totalTokens      | number | 合計トークン数（任意） |
| finishReason     | string | 終了理由（任意）       |
| responseTime     | number | 応答時間ms（任意）     |

---

## Repositoryインターフェース

### IChatSessionRepository

セッション管理のRepositoryインターフェース。

| メソッド            | 引数                            | 戻り値              | 説明               |
| ------------------- | ------------------------------- | ------------------- | ------------------ |
| create              | CreateSessionInput              | ChatSession         | セッション作成     |
| findById            | id: string                      | ChatSession \| null | ID検索             |
| findByUserId        | userId: string, options         | ChatSession[]       | ユーザー別一覧取得 |
| update              | id: string, UpdateSessionInput  | ChatSession         | セッション更新     |
| delete              | id: string                      | void                | セッション削除     |
| searchByKeyword     | userId: string, keyword: string | ChatSession[]       | キーワード検索     |
| getPinnedSessions   | userId: string                  | ChatSession[]       | ピン留め一覧取得   |
| countPinnedSessions | userId: string                  | number              | ピン留め数カウント |

### IChatMessageRepository

メッセージ管理のRepositoryインターフェース。

| メソッド            | 引数                             | 戻り値              | 説明               |
| ------------------- | -------------------------------- | ------------------- | ------------------ |
| create              | CreateMessageInput               | ChatMessage         | メッセージ作成     |
| findById            | id: string                       | ChatMessage \| null | ID検索             |
| findBySessionId     | sessionId: string, options       | ChatMessage[]       | セッション別取得   |
| delete              | id: string                       | void                | メッセージ削除     |
| deleteBySessionId   | sessionId: string                | void                | セッション内全削除 |
| searchByContent     | sessionId: string, query: string | ChatMessage[]       | 内容検索           |
| getNextMessageIndex | sessionId: string                | number              | 次の順序番号取得   |

---

## サービスインターフェース

### IChatHistoryService

チャット履歴統合サービス。Repository層を統合し、ビジネスロジックを提供。

| メソッド            | 引数                                                   | 戻り値                  | 説明                                     |
| ------------------- | ------------------------------------------------------ | ----------------------- | ---------------------------------------- |
| createSession       | userId: string, title?: string                         | ChatSession             | セッション作成                           |
| getSession          | sessionId: string, **requestUserId: string**           | ChatSessionWithMessages | セッション詳細取得（認可チェック付き）   |
| getSessions         | userId: string, options                                | ChatSession[]           | セッション一覧                           |
| deleteSession       | sessionId: string, **requestUserId: string**           | void                    | セッション削除（認可チェック付き）       |
| updateSession       | sessionId: string, **requestUserId: string**, data     | ChatSession             | セッション更新（認可チェック付き）       |
| addUserMessage      | sessionId: string, content: string                     | ChatMessage             | ユーザーメッセージ追加                   |
| addAssistantMessage | sessionId: string, content, metadata                   | ChatMessage             | アシスタントメッセージ追加               |
| searchSessions      | userId: string, keyword: string                        | ChatSession[]           | キーワード検索                           |
| updateSessionTitle  | sessionId: string, title: string                       | ChatSession             | タイトル更新                             |
| toggleFavorite      | sessionId: string                                      | ChatSession             | お気に入り切替                           |
| togglePinned        | sessionId: string                                      | ChatSession             | ピン留め切替                             |
| exportToMarkdown    | sessionId: string, **requestUserId: string**, options? | string                  | Markdownエクスポート（認可チェック付き） |
| exportToJson        | sessionId: string, **requestUserId: string**, options? | string                  | JSONエクスポート（認可チェック付き）     |

> **Note**: `requestUserId` パラメータは OWASP A01:2021 Broken Access Control 対策として追加。
> セッション所有者以外のアクセスは `UnauthorizedError` をスローする。

---

## 認可（Authorization）

### 認可チェック対象メソッド

以下のメソッドは `requestUserId` パラメータによる認可チェックを実施する。

| メソッド         | 認可チェック | エラー時の動作           |
| ---------------- | ------------ | ------------------------ |
| getSession       | ✅ 必須      | UnauthorizedError スロー |
| deleteSession    | ✅ 必須      | UnauthorizedError スロー |
| updateSession    | ✅ 必須      | UnauthorizedError スロー |
| exportToMarkdown | ✅ 必須      | UnauthorizedError スロー |
| exportToJson     | ✅ 必須      | UnauthorizedError スロー |

### 認可ロジック

```typescript
// verifySessionOwnership: セッション所有者検証
private async verifySessionOwnership(
  sessionId: string,
  requestUserId: string,
): Promise<ChatSession> {
  const session = await this.sessionRepository.findById(sessionId);

  // セッションが存在しない場合も同じエラーを返す（情報漏洩防止）
  if (!session || session.userId !== requestUserId) {
    throw new UnauthorizedError(
      UNAUTHORIZED_ERROR_MESSAGE,
      RESOURCE_TYPE.SESSION,
      sessionId,
    );
  }

  return session;
}
```

### セキュリティ原則

| 原則         | 実装                                             |
| ------------ | ------------------------------------------------ |
| Fail-Secure  | 検証失敗時は必ずエラーをスロー                   |
| 情報漏洩防止 | 存在チェックと認可チェックで同一エラーメッセージ |
| 最小権限     | リソースへのアクセスは所有者のみ                 |
| 一貫性       | 全メソッドで同じ検証パターンを使用               |

### 関連エラー

- `UnauthorizedError`: 認可失敗時にスローされるエラー
- 詳細は [エラーハンドリング仕様](./error-handling.md) を参照

---

## ビジネスルール

### セッション管理

| ルールID       | 内容                                               | 検証場所     |
| -------------- | -------------------------------------------------- | ------------ |
| BR-SESSION-001 | タイトル未指定時は「新しいチャット」を自動生成     | Service層    |
| BR-SESSION-002 | ピン留めは最大10件まで                             | Service層    |
| BR-SESSION-003 | プレビューは最初のメッセージから30文字を生成       | Service層    |
| BR-SESSION-004 | タイトルは3-100文字                                | Repository層 |
| BR-SESSION-005 | セッションアクセスは所有者のみ許可（認可チェック） | Service層    |

### メッセージ管理

| ルールID       | 内容                                          | 検証場所     |
| -------------- | --------------------------------------------- | ------------ |
| BR-MESSAGE-001 | message_indexはセッション内で自動採番         | Repository層 |
| BR-MESSAGE-002 | assistant応答時はLLMメタデータ必須            | Service層    |
| BR-MESSAGE-003 | メッセージ追加時はセッションのupdatedAtを更新 | Service層    |

---

## エクスポート形式

### Markdown形式

```markdown
# {セッションタイトル}

作成日時: {createdAt}

---

## User

{ユーザーメッセージ内容}

## Assistant

{アシスタントメッセージ内容}

---
```

### JSON形式

```json
{
  "session": {
    "id": "uuid",
    "title": "タイトル",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  },
  "messages": [
    {
      "role": "user",
      "content": "内容",
      "createdAt": "ISO8601"
    },
    {
      "role": "assistant",
      "content": "内容",
      "llmModelId": "gpt-4o",
      "llmProvider": "openai",
      "createdAt": "ISO8601"
    }
  ],
  "exportedAt": "ISO8601"
}
```

---

## 品質メトリクス

| 指標             | 目標 | 達成値 |
| ---------------- | ---- | ------ |
| テストカバレッジ | ≥80% | 91.43% |
| テスト数         | -    | 81件   |
| Lint/型エラー    | 0件  | 0件    |

---

## Renderer Process用インターフェース

> 以下の型定義とAPIはRenderer Processで使用される会話履歴UI用のインターフェースです。

### Conversation型（UI用）

Renderer Processで使用される会話型。Backend側の`ChatSession`に相当。

| フィールド | 型        | 説明               |
| ---------- | --------- | ------------------ |
| id         | string    | 会話ID（UUID）     |
| title      | string    | 会話タイトル       |
| createdAt  | string    | 作成日時（ISO8601）|
| updatedAt  | string    | 更新日時（ISO8601）|

### ConversationSummary型

会話一覧用のサマリー型。

| フィールド   | 型        | 説明                     |
| ------------ | --------- | ------------------------ |
| id           | string    | 会話ID（UUID）           |
| title        | string    | 会話タイトル             |
| preview      | string    | プレビュー（先頭30文字） |
| lastModified | string    | 最終更新日時（ISO8601）  |
| messageCount | number    | メッセージ数             |

### Message型（UI用）

Renderer Processで使用されるメッセージ型。Backend側の`ChatMessage`に相当。

| フィールド  | 型                    | 説明                   |
| ----------- | --------------------- | ---------------------- |
| id          | string                | メッセージID（UUID）   |
| role        | 'user' \| 'assistant' | メッセージ送信者       |
| content     | string                | メッセージ内容         |
| timestamp   | string                | 作成日時（ISO8601）    |
| attachments | Attachment[] \| null  | 添付ファイル（将来用） |

### Attachment型

メッセージ添付ファイル型（将来拡張用）。

| フィールド | 型     | 説明               |
| ---------- | ------ | ------------------ |
| id         | string | 添付ファイルID     |
| name       | string | ファイル名         |
| type       | string | MIMEタイプ         |
| size       | number | ファイルサイズ     |
| url        | string | ファイルURL/パス   |

---

## Preload API（conversationAPI）

Renderer ProcessからMain ProcessへのIPC通信用API。`contextBridge`経由で`window.conversationAPI`として公開。

### ConversationAPI インターフェース

| メソッド   | 引数                           | 戻り値                         | 説明               |
| ---------- | ------------------------------ | ------------------------------ | ------------------ |
| list       | ListConversationsRequest       | Promise<PaginatedResponse<ConversationSummary>> | 一覧取得           |
| get        | GetConversationRequest         | Promise<Conversation>          | 詳細取得           |
| create     | CreateConversationRequest      | Promise<Conversation>          | 新規作成           |
| update     | UpdateConversationRequest      | Promise<Conversation>          | 更新               |
| delete     | DeleteConversationRequest      | Promise<void>                  | 削除               |
| addMessage | AddMessageRequest              | Promise<Message>               | メッセージ追加     |
| search     | SearchConversationsRequest     | Promise<ConversationSummary[]> | キーワード検索     |

### IPCチャンネル一覧

| チャンネル名               | 用途             | 実装ファイル                                     |
| -------------------------- | ---------------- | ------------------------------------------------ |
| `conversation:list`        | 会話一覧取得     | `apps/desktop/src/main/ipc/conversationHandlers.ts` |
| `conversation:get`         | 会話詳細取得     | `apps/desktop/src/main/ipc/conversationHandlers.ts` |
| `conversation:create`      | 会話新規作成     | `apps/desktop/src/main/ipc/conversationHandlers.ts` |
| `conversation:update`      | 会話更新         | `apps/desktop/src/main/ipc/conversationHandlers.ts` |
| `conversation:delete`      | 会話削除         | `apps/desktop/src/main/ipc/conversationHandlers.ts` |
| `conversation:addMessage`  | メッセージ追加   | `apps/desktop/src/main/ipc/conversationHandlers.ts` |
| `conversation:search`      | キーワード検索   | `apps/desktop/src/main/ipc/conversationHandlers.ts` |

### 実装パターン

```typescript
// Preload API定義（apps/desktop/src/preload/index.ts）
const conversationAPI: ConversationAPI = {
  list: (request) => safeInvoke(IPC_CHANNELS.CONVERSATION_LIST, request),
  get: (request) => safeInvoke(IPC_CHANNELS.CONVERSATION_GET, request),
  create: (request) => safeInvoke(IPC_CHANNELS.CONVERSATION_CREATE, request),
  update: (request) => safeInvoke(IPC_CHANNELS.CONVERSATION_UPDATE, request),
  delete: (request) => safeInvoke(IPC_CHANNELS.CONVERSATION_DELETE, request),
  addMessage: (request) => safeInvoke(IPC_CHANNELS.CONVERSATION_ADD_MESSAGE, request),
  search: (request) => safeInvoke(IPC_CHANNELS.CONVERSATION_SEARCH, request),
};

contextBridge.exposeInMainWorld('conversationAPI', conversationAPI);
```

---

## React Hooks

会話履歴UIコンポーネントで使用するカスタムHooks。

| Hook名           | 用途                       | 実装ファイル                                          |
| ---------------- | -------------------------- | ----------------------------------------------------- |
| useConversations | 会話一覧管理               | `apps/desktop/src/renderer/hooks/useConversations.ts` |
| useConversation  | 単一会話管理               | `apps/desktop/src/renderer/hooks/useConversation.ts`  |
| useMessages      | メッセージ管理             | `apps/desktop/src/renderer/hooks/useMessages.ts`      |
| usePagination    | ページネーション管理       | `apps/desktop/src/renderer/hooks/usePagination.ts`    |

---

## UIコンポーネント構成

### Atomic Design分類

| レベル   | コンポーネント           | 責務                     |
| -------- | ------------------------ | ------------------------ |
| Organism | ConversationListPanel    | 会話一覧パネル全体       |
| Organism | ConversationDetailView   | 会話詳細ビュー全体       |
| Molecule | ConversationListItem     | 個別会話アイテム         |
| Molecule | ConversationSearch       | 検索コンポーネント       |
| Molecule | ConversationHeader       | ヘッダー（タイトル編集） |
| Molecule | MessageList              | メッセージ一覧           |
| Molecule | MessageInput             | メッセージ入力           |
| Atom     | MessageBubble            | メッセージ吹き出し       |
| Atom     | NewConversationButton    | 新規作成ボタン           |

### 実装ファイル配置

```
apps/desktop/src/renderer/components/conversation/
├── ConversationListPanel.tsx
├── ConversationListItem.tsx
├── ConversationSearch.tsx
├── NewConversationButton.tsx
├── ConversationDetailView.tsx
├── ConversationHeader.tsx
├── MessageList.tsx
├── MessageBubble.tsx
├── MessageInput.tsx
└── __tests__/
    ├── ConversationListPanel.test.tsx
    ├── ConversationListItem.test.tsx
    ├── ConversationSearch.test.tsx
    ├── NewConversationButton.test.tsx
    ├── ConversationDetailView.test.tsx
    ├── ConversationHeader.test.tsx
    ├── MessageList.test.tsx
    ├── MessageBubble.test.tsx
    ├── MessageInput.test.tsx
    └── EdgeCases.test.tsx
```

---

## 完了タスク

### タスク: conversation-history-ui-implementation（2026-01-25完了）

| 項目         | 内容                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| タスクID     | UI-CONV-HISTORY-001                                                                      |
| 完了日       | 2026-01-25                                                                               |
| ステータス   | **完了**                                                                                 |
| テスト数     | 280（自動テスト）+ 20（手動テスト項目）                                                  |
| 発見課題     | 1件（MINOR-001: DOMPurifyサニタイズ → 別タスクとして管理）                               |
| ドキュメント | `docs/30-workflows/conversation-history-ui-implementation/`                              |

#### テスト結果サマリー

| カテゴリ              | テスト数 | PASS | FAIL |
| --------------------- | -------- | ---- | ---- |
| Preload API テスト    | 22       | 22   | 0    |
| Hooks テスト          | 49       | 49   | 0    |
| コンポーネント テスト | 231      | 231  | 0    |

#### 成果物

| 成果物             | パス                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/conversation-history-ui-implementation/outputs/phase-11/manual-test-result.md`    |
| 発見課題リスト     | `docs/30-workflows/conversation-history-ui-implementation/outputs/phase-11/discovered-issues.md`     |
| 実装ガイド         | `docs/30-workflows/conversation-history-ui-implementation/outputs/phase-12/implementation-guide.md`  |

---

## 関連ドキュメント

- [LLMインターフェース仕様](./interfaces-llm.md) - ChatMessage型（リアルタイム用）
- [データベース実装](./database-implementation.md) - Drizzle ORM、トランザクション
- [アーキテクチャパターン](./architecture-patterns.md) - Repository Pattern
- [会話履歴UI実装ガイド](../../../../docs/30-workflows/conversation-history-ui-implementation/outputs/phase-12/implementation-guide.md) - UI実装詳細

---

## 変更履歴

| Version | Date       | Changes                                                                        |
| ------- | ---------- | ------------------------------------------------------------------------------ |
| 1.0.0   | 2026-01-24 | 初版作成（バックエンド仕様）                                                   |
| 1.1.0   | 2026-01-25 | UI実装完了（Renderer用型定義、IPCチャンネル、Hooks、UIコンポーネント仕様追加） |
