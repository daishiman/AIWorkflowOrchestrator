# Phase 2: 設計

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 2                                    |
| 機能名 | llm-conversation-history-persistence |
| 作成日 | 2026-01-24                           |

## 目的

要件を実現可能な構造に落とし込む。既存のchat_sessions/chat_messagesテーブル設計を活用し、Repository層・IPC層・UI層の設計を行う。

## 実行タスク

- **DBスキーマ確認・調整**: 既存スキーマの確認と必要に応じた調整
- **Repository設計**: ConversationRepositoryクラスの設計
- **IPC設計**: IPCハンドラーの設計
- **UI設計**: 会話一覧コンポーネントの設計
- **状態管理設計**: Redux Storeとの同期設計

## 参照資料

| 資料名                   | パス                                                                         | 説明          |
| ------------------------ | ---------------------------------------------------------------------------- | ------------- |
| 要件定義書               | `outputs/phase-1/requirements-definition.md`                                 | Phase 1成果物 |
| database-schema.md       | `.claude/skills/aiworkflow-requirements/references/database-schema.md`       | 既存スキーマ  |
| architecture-database.md | `.claude/skills/aiworkflow-requirements/references/architecture-database.md` | DB設計原則    |

## 実行手順

### ステップ1: DBスキーマ確認

既存の`chat_sessions`/`chat_messages`テーブル設計を活用:

```sql
-- chat_sessions テーブル（既存設計を使用）
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY,           -- UUID v4
  user_id TEXT NOT NULL,         -- ユーザーID（ローカル固定値）
  title TEXT NOT NULL,           -- セッションタイトル（3〜100文字）
  created_at TEXT NOT NULL,      -- 作成日時（ISO 8601形式）
  updated_at TEXT NOT NULL,      -- 最終更新日時
  message_count INTEGER NOT NULL DEFAULT 0,  -- メッセージ総数
  is_favorite INTEGER NOT NULL DEFAULT 0,    -- お気に入りフラグ
  is_pinned INTEGER NOT NULL DEFAULT 0,      -- ピン留めフラグ
  pin_order INTEGER,                         -- ピン留め順序
  last_message_preview TEXT,                 -- 最終メッセージプレビュー
  metadata JSON NOT NULL DEFAULT '{}',       -- 拡張メタデータ
  deleted_at TEXT                            -- ソフトデリート
);

-- chat_messages テーブル（既存設計を使用）
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,           -- UUID v4
  session_id TEXT NOT NULL,      -- 親セッションID
  role TEXT NOT NULL,            -- user / assistant
  content TEXT NOT NULL,         -- メッセージ本文
  message_index INTEGER NOT NULL,-- セッション内順序
  timestamp TEXT NOT NULL,       -- 送信日時
  llm_provider TEXT,             -- LLMプロバイダー名
  llm_model TEXT,                -- LLMモデル名
  llm_metadata JSON,             -- トークン使用量等
  attachments JSON NOT NULL DEFAULT '[]',    -- 添付ファイル
  system_prompt TEXT,            -- システムプロンプト
  metadata JSON NOT NULL DEFAULT '{}',       -- 拡張メタデータ
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE UNIQUE INDEX idx_chat_messages_session_message ON chat_messages(session_id, message_index);
```

### ステップ2: Repository設計

```typescript
// apps/desktop/src/main/repositories/conversationRepository.ts

interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string | null;
  isFavorite: boolean;
  isPinned: boolean;
}

interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  messages: Message[];
  metadata: Record<string, unknown>;
}

interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  messageIndex: number;
  timestamp: string;
  llmProvider?: string;
  llmModel?: string;
  llmMetadata?: Record<string, unknown>;
  systemPrompt?: string;
}

class ConversationRepository {
  constructor(private db: Database);

  // 会話一覧取得（軽量）
  listConversations(userId: string, options?: ListOptions): ConversationSummary[];

  // 会話詳細取得（メッセージ含む）
  getConversation(id: string): Conversation | null;

  // 会話作成
  createConversation(data: CreateConversationInput): Conversation;

  // 会話更新（タイトル等）
  updateConversation(id: string, data: UpdateConversationInput): Conversation;

  // 会話削除（ソフトデリート）
  deleteConversation(id: string): void;

  // メッセージ追加
  addMessage(sessionId: string, message: CreateMessageInput): Message;

  // 会話検索
  searchConversations(userId: string, query: string): ConversationSummary[];
}
```

### ステップ3: IPC設計

| チャンネル              | メソッド | 入力                    | 出力                  | 説明           |
| ----------------------- | -------- | ----------------------- | --------------------- | -------------- |
| conversation:list       | invoke   | { userId, options? }    | ConversationSummary[] | 会話一覧取得   |
| conversation:get        | invoke   | { id }                  | Conversation \| null  | 会話詳細取得   |
| conversation:create     | invoke   | CreateConversationInput | Conversation          | 会話作成       |
| conversation:update     | invoke   | { id, data }            | Conversation          | 会話更新       |
| conversation:delete     | invoke   | { id }                  | { success: boolean }  | 会話削除       |
| conversation:addMessage | invoke   | { sessionId, message }  | Message               | メッセージ追加 |
| conversation:search     | invoke   | { userId, query }       | ConversationSummary[] | 会話検索       |

### ステップ4: UI設計

```
ConversationListPanel
├── ConversationListHeader
│   ├── SearchInput
│   └── NewConversationButton
├── ConversationList
│   ├── ConversationItem（繰り返し）
│   │   ├── Title
│   │   ├── LastMessagePreview
│   │   ├── Timestamp
│   │   └── ActionMenu（削除、ピン留め等）
│   └── EmptyState
└── ConversationListFooter
```

### ステップ5: 状態管理設計

```typescript
// llmSlice拡張
interface ConversationState {
  conversations: ConversationSummary[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

// Actions
- loadConversations(): 会話一覧を読み込み
- selectConversation(id): 会話を選択・詳細読み込み
- createConversation(): 新規会話作成
- deleteConversation(id): 会話削除
- addMessageToConversation(message): メッセージ追加（楽観的更新）
```

## 統合テスト連携【必須】

統合ポイント/契約（IPC・DBスキーマ）を設計に反映:

| 統合ポイント       | 契約定義                                               |
| ------------------ | ------------------------------------------------------ |
| Renderer→IPC       | conversation:\* チャンネル経由でRepository呼び出し     |
| IPC→Repository     | ConversationRepository.メソッド()                      |
| Repository→SQLite  | better-sqlite3トランザクション内でCRUD実行             |
| エラーハンドリング | IPCレスポンスで{ success: false, error: string }を返却 |

## 成果物

| 成果物         | パス                                     | 説明               |
| -------------- | ---------------------------------------- | ------------------ |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | 全体アーキテクチャ |
| DBスキーマ     | `outputs/phase-2/db-schema.md`           | テーブル設計詳細   |
| Repository設計 | `outputs/phase-2/repository-design.md`   | Repository API設計 |
| IPC設計        | `outputs/phase-2/ipc-design.md`          | IPCチャンネル設計  |
| UI設計         | `outputs/phase-2/ui-design.md`           | コンポーネント設計 |

## 完了条件

- [ ] 既存DBスキーマの確認と調整方針が決定されている
- [ ] Repository層のAPI設計が完了している
- [ ] IPC層の契約が定義されている
- [ ] UI層のコンポーネント構成が設計されている
- [ ] 状態管理（Redux）との同期方針が決定されている
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
