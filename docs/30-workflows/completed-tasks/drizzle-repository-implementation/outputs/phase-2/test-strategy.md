# Phase 2 - タスク5: テスト戦略設計

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| タスク番号 | 5                                 |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## テスト環境設計

### インメモリSQLite設定

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../../../../db/schema/chat-history.js";

// テスト用インメモリDBセットアップ
function createTestDatabase() {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema });

  // スキーマ作成
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
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
      metadata TEXT NOT NULL DEFAULT '{}',
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      message_index INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      llm_provider TEXT,
      llm_model TEXT,
      llm_metadata TEXT,
      attachments TEXT NOT NULL DEFAULT '[]',
      system_prompt TEXT,
      metadata TEXT NOT NULL DEFAULT '{}'
    );

    CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
    CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
    CREATE UNIQUE INDEX idx_chat_messages_session_message ON chat_messages(session_id, message_index);
  `);

  return { db, sqlite };
}
```

### テストフィクスチャ

```typescript
// テストデータファクトリ
const TestDataFactory = {
  createSession(overrides = {}) {
    return ChatSession.reconstitute({
      id: `session-${Date.now()}`,
      userId: "test-user",
      title: "テストセッション",
      messageCount: 0,
      isFavorite: false,
      isPinned: false,
      pinOrder: null,
      lastMessagePreview: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });
  },

  createMessage(sessionId: string, overrides = {}) {
    return ChatMessage.reconstitute({
      id: `message-${Date.now()}`,
      sessionId,
      role: "user",
      content: "テストメッセージ",
      messageIndex: 0,
      timestamp: new Date(),
      llmProvider: null,
      llmModel: null,
      llmMetadata: null,
      ...overrides,
    });
  },
};
```

---

## テストカテゴリ

### 1. 正常系テスト

| カテゴリ | テストケース例                       |
| -------- | ------------------------------------ |
| 作成     | save()で新規セッション作成           |
| 取得     | findById()で存在するセッション取得   |
| 更新     | save()で既存セッション更新（Upsert） |
| 削除     | delete()でセッション削除             |
| 一覧取得 | findByUserId()でページネーション取得 |
| 検索     | search()でキーワード検索             |
| カウント | countPinned()でピン留め数取得        |

### 2. 異常系テスト

| カテゴリ     | テストケース例                     |
| ------------ | ---------------------------------- |
| 存在しないID | findById()でnull返却               |
| 空結果       | findByUserId()で空配列返却         |
| 制約違反     | save()で重複messageIndex（エラー） |
| 不正データ   | 不正レコードでのマッピングエラー   |

### 3. 境界値テスト

| カテゴリ   | テストケース例                    |
| ---------- | --------------------------------- |
| 空配列     | saveMany([])で早期リターン        |
| 大量データ | findByUserId()で100件取得         |
| limit=0    | findByUserId(limit=0)             |
| 長文       | 100,000文字のメッセージ保存       |
| 特殊文字   | タイトル/コンテンツに絵文字・記号 |

### 4. トランザクションテスト

| カテゴリ | テストケース例                       |
| -------- | ------------------------------------ |
| 成功     | saveMany()で複数メッセージ保存成功   |
| 部分失敗 | saveMany()で途中エラー時ロールバック |

---

## テストファイル構成

```
packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/
├── DrizzleChatSessionRepository.test.ts
├── DrizzleChatMessageRepository.test.ts
├── DrizzleRepositoryIntegration.test.ts
├── helpers/
│   ├── testDatabase.ts          # インメモリDB設定
│   └── testDataFactory.ts       # テストデータファクトリ
```

---

## テストケース設計

### DrizzleChatSessionRepository.test.ts

```typescript
describe("DrizzleChatSessionRepository", () => {
  let db: ReturnType<typeof createTestDatabase>["db"];
  let repository: DrizzleChatSessionRepository;

  beforeEach(() => {
    const testDb = createTestDatabase();
    db = testDb.db;
    repository = new DrizzleChatSessionRepository(db);
  });

  describe("findById", () => {
    it("存在するセッションを取得できる", async () => { ... });
    it("存在しないIDの場合nullを返す", async () => { ... });
  });

  describe("findByUserId", () => {
    it("ユーザーのセッション一覧を取得できる", async () => { ... });
    it("ページネーションが正しく動作する", async () => { ... });
    it("updatedAt降順でソートされる", async () => { ... });
  });

  describe("findPinned", () => {
    it("ピン留めセッション一覧をpinOrder順で取得できる", async () => { ... });
    it("ピン留めなしの場合空配列を返す", async () => { ... });
  });

  describe("search", () => {
    it("キーワードでタイトル検索できる", async () => { ... });
    it("お気に入りフィルターが動作する", async () => { ... });
    it("複合条件で検索できる", async () => { ... });
  });

  describe("save", () => {
    it("新規セッションを作成できる", async () => { ... });
    it("既存セッションを更新できる（Upsert）", async () => { ... });
  });

  describe("delete", () => {
    it("セッションを削除できる", async () => { ... });
    it("存在しないIDでもエラーにならない", async () => { ... });
  });

  describe("exists", () => {
    it("存在するセッションでtrueを返す", async () => { ... });
    it("存在しないセッションでfalseを返す", async () => { ... });
  });

  describe("countPinned", () => {
    it("ピン留め数を正しくカウントする", async () => { ... });
    it("ピン留めなしの場合0を返す", async () => { ... });
  });
});
```

### DrizzleChatMessageRepository.test.ts

```typescript
describe("DrizzleChatMessageRepository", () => {
  // 同様の構成
  describe("findById", () => { ... });
  describe("findBySessionId", () => { ... });
  describe("findLatestBySessionId", () => { ... });
  describe("countBySessionId", () => { ... });
  describe("save", () => { ... });
  describe("saveMany", () => { ... });
  describe("delete", () => { ... });
  describe("deleteBySessionId", () => { ... });
});
```

---

## モック戦略

### 実DBテスト（インメモリSQLite）

- **方針**: モックではなく実DBを使用
- **理由**: クエリの正確性を保証
- **実装**: `better-sqlite3` + `:memory:` モード

### DBエラーシミュレーション

```typescript
describe("エラーハンドリング", () => {
  it("DB接続エラー時にDatabaseErrorをスローする", async () => {
    // 不正なDB接続でエラー発生をテスト
    const brokenDb = {} as LibSQLDatabase;
    const repository = new DrizzleChatSessionRepository(brokenDb);

    await expect(repository.findById(someId)).rejects.toThrow(DatabaseError);
  });
});
```

---

## 統合テスト設計

### DrizzleRepositoryIntegration.test.ts

```typescript
describe("Repository統合テスト", () => {
  describe("セッション-メッセージ連携", () => {
    it("セッション削除時に関連メッセージもCASCADE削除される", async () => {
      // セッション作成
      await sessionRepository.save(session);
      // メッセージ作成
      await messageRepository.save(message);
      // セッション削除
      await sessionRepository.delete(session.id);
      // メッセージも削除されていることを確認
      const messages = await messageRepository.findBySessionId(session.id);
      expect(messages).toHaveLength(0);
    });
  });

  describe("トランザクション", () => {
    it("saveMany中のエラーで全件ロールバックされる", async () => { ... });
  });
});
```

---

## カバレッジ目標

| 指標              | 目標値 |
| ----------------- | ------ |
| Line Coverage     | ≥ 80%  |
| Branch Coverage   | ≥ 60%  |
| Function Coverage | ≥ 80%  |

---

## 完了確認

- [x] テスト環境（インメモリSQLite）のセットアップ手順が設計されている
- [x] テストカテゴリ（正常系、異常系、境界値、トランザクション）が定義されている
- [x] テストファイル構成が設計されている
- [x] 主要テストケースが設計されている
- [x] モック戦略（実DBテスト）が設計されている
- [x] 統合テストが設計されている
