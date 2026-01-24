# テスト仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | UT-LLM-HISTORY-001                   |
| 機能名     | llm-conversation-history-persistence |
| バージョン | 1.0.0                                |
| 作成日     | 2026-01-24                           |

---

## 概要

本ドキュメントは、LLM会話履歴永続化機能のテスト設計を定義する。TDDアプローチに基づき、実装前にテストを作成し、Red状態を確認する。

---

## テスト対象

| 対象                   | ファイルパス                                                   | 説明                               |
| ---------------------- | -------------------------------------------------------------- | ---------------------------------- |
| ConversationRepository | `apps/desktop/src/main/repositories/conversationRepository.ts` | Repositoryレイヤーのユニットテスト |
| conversationHandlers   | `apps/desktop/src/main/ipc/conversationHandlers.ts`            | IPCハンドラーのテスト              |
| 統合テスト             | -                                                              | End-to-End統合テスト               |

---

## テスト分類

### 1. ユニットテスト

| テスト対象             | 説明                                       | 優先度 |
| ---------------------- | ------------------------------------------ | ------ |
| ConversationRepository | DB操作のCRUD、トランザクション、エラー処理 | 高     |
| 型マッピング           | DB行からエンティティへの変換               | 中     |
| バリデーション         | 入力値の境界値テスト                       | 中     |

### 2. IPCハンドラーテスト

| テスト対象              | 説明                       | 優先度 |
| ----------------------- | -------------------------- | ------ |
| conversation:list       | 会話一覧取得のハンドラー   | 高     |
| conversation:get        | 会話詳細取得のハンドラー   | 高     |
| conversation:create     | 会話作成のハンドラー       | 高     |
| conversation:update     | 会話更新のハンドラー       | 中     |
| conversation:delete     | 会話削除のハンドラー       | 中     |
| conversation:addMessage | メッセージ追加のハンドラー | 高     |
| conversation:search     | 会話検索のハンドラー       | 中     |

### 3. 統合テスト

| テストカテゴリ     | 説明                                       | 優先度 |
| ------------------ | ------------------------------------------ | ------ |
| IPC接続テスト      | チャンネル疎通・レスポンス形式確認         | 高     |
| データフローテスト | Renderer→IPC→Repository→SQLite往復         | 高     |
| エラーハンドリング | DB接続エラー・制約違反時のエラーレスポンス | 中     |
| データ整合性テスト | messageCount更新・lastMessagePreview更新   | 中     |
| 永続化テスト       | 会話作成→DB再接続→会話復元                 | 高     |

---

## テスト環境

### テストフレームワーク

| ツール         | バージョン | 用途           |
| -------------- | ---------- | -------------- |
| Vitest         | ^3.0.0     | テストランナー |
| better-sqlite3 | ^11.0.0    | インメモリDB   |

### テストDBセットアップ

```typescript
// テスト用インメモリDBの作成
import Database from "better-sqlite3";

function createTestDB(): Database.Database {
  const db = new Database(":memory:");

  // スキーマ作成
  db.exec(`
    CREATE TABLE chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      message_count INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      pin_order INTEGER,
      last_message_preview TEXT,
      metadata JSON NOT NULL DEFAULT '{}',
      deleted_at TEXT
    );

    CREATE TABLE chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      message_index INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      llm_provider TEXT,
      llm_model TEXT,
      llm_metadata JSON,
      attachments JSON NOT NULL DEFAULT '[]',
      system_prompt TEXT,
      metadata JSON NOT NULL DEFAULT '{}',
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
    CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
    CREATE UNIQUE INDEX idx_chat_messages_session_message
      ON chat_messages(session_id, message_index);
  `);

  return db;
}
```

---

## モック戦略

### Repository層テスト

- **実DB使用**: インメモリSQLiteを使用して実際のDB操作をテスト
- **トランザクション検証**: 複数操作のアトミック性を確認

### IPCハンドラーテスト

- **Repositoryモック**: vi.mock()でRepositoryをモック化
- **ipcMainモック**: Electronモジュールをモック化

```typescript
// モック例
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

const mockRepository = {
  listConversations: vi.fn(),
  getConversation: vi.fn(),
  createConversation: vi.fn(),
  updateConversation: vi.fn(),
  deleteConversation: vi.fn(),
  addMessage: vi.fn(),
  searchConversations: vi.fn(),
};
```

---

## カバレッジ目標

| メトリクス     | 目標値 |
| -------------- | ------ |
| ステートメント | 80%    |
| ブランチ       | 80%    |
| 関数           | 90%    |
| 行             | 80%    |

---

## テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイル実行
pnpm --filter @repo/desktop test conversationRepository

# カバレッジ付き実行
pnpm --filter @repo/desktop test:coverage

# ウォッチモード
pnpm --filter @repo/desktop test:watch
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
