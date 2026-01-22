# Drizzle Repository 実装ガイド

## 実行日時

2026-01-22

---

## Part 1: 概念的説明（初学者・非技術者向け）

### 1. Drizzle Repositoryとは何か

Drizzle Repositoryは、チャット履歴データをSQLiteデータベースに永続化するためのコンポーネントです。アプリケーションを再起動しても、ユーザーの会話履歴が失われないようにします。

**主な特徴**:

- SQLiteデータベースへのデータ保存・取得
- Drizzle ORMによる型安全なクエリ実行
- エラーハンドリングの統一

### 2. なぜDrizzle Repositoryが必要か

| シナリオ               | InMemory   | Drizzle        |
| ---------------------- | ---------- | -------------- |
| アプリ再起動後のデータ | 消失       | 保持           |
| 大量データ処理         | メモリ制限 | ディスクに保存 |
| 複数セッション共有     | 不可       | 可能           |

### 3. InMemoryRepositoryとの違い

| 観点           | InMemoryRepository         | DrizzleRepository      |
| -------------- | -------------------------- | ---------------------- |
| データ保存先   | メモリ（Map）              | SQLiteファイル         |
| 永続性         | なし（プロセス終了で消失） | あり（ファイルに保存） |
| 用途           | テスト・開発               | 本番運用               |
| パフォーマンス | 非常に高速                 | 十分高速               |

### 4. Clean Architectureでの位置づけ

```
┌─────────────────────────────────────────────────┐
│                 Domain Layer                     │
│  IChatSessionRepository, IChatMessageRepository  │
│  (インターフェース定義)                          │
└─────────────────────────────────────────────────┘
                        ▲
                        │ implements
                        │
┌─────────────────────────────────────────────────┐
│             Infrastructure Layer                 │
│  DrizzleChatSessionRepository                   │
│  DrizzleChatMessageRepository                   │
│  (具体実装)                                      │
└─────────────────────────────────────────────────┘
                        ▲
                        │ uses
                        │
┌─────────────────────────────────────────────────┐
│               External Systems                   │
│  SQLite Database (better-sqlite3)               │
└─────────────────────────────────────────────────┘
```

Domain層がインターフェースを定義し、Infrastructure層が具体実装を提供します。これにより、ビジネスロジックはデータベースの詳細を知る必要がありません。

---

## Part 2: 技術的詳細（開発者向け）

### 1. クラス構成と責務

#### DrizzleChatSessionRepository

チャットセッションのCRUD操作を担当します。

```typescript
import { DrizzleChatSessionRepository } from "@repo/shared/features/chat-history/infrastructure/persistence";

// DB接続を注入してインスタンス化
const sessionRepo = new DrizzleChatSessionRepository(db);
```

**提供メソッド**:
| メソッド | 説明 |
| -------- | ---- |
| `findById(id)` | IDでセッションを取得 |
| `findByUserId(userId, limit, offset)` | ユーザーのセッション一覧を取得 |
| `findPinned(userId)` | ピン留めセッションを取得 |
| `search(criteria)` | 条件でセッションを検索 |
| `save(session)` | セッションを保存（upsert） |
| `delete(id)` | セッションを削除 |
| `exists(id)` | セッションの存在確認 |
| `countPinned(userId)` | ピン留め数をカウント |

#### DrizzleChatMessageRepository

チャットメッセージのCRUD操作を担当します。

```typescript
import { DrizzleChatMessageRepository } from "@repo/shared/features/chat-history/infrastructure/persistence";

const messageRepo = new DrizzleChatMessageRepository(db);
```

**提供メソッド**:
| メソッド | 説明 |
| -------- | ---- |
| `findById(id)` | IDでメッセージを取得 |
| `findBySessionId(sessionId, limit, offset)` | セッションのメッセージ一覧を取得 |
| `findLatestBySessionId(sessionId)` | 最新メッセージを取得 |
| `countBySessionId(sessionId)` | メッセージ数をカウント |
| `save(message)` | メッセージを保存（upsert） |
| `saveMany(messages)` | 複数メッセージを一括保存 |
| `delete(id)` | メッセージを削除 |
| `deleteBySessionId(sessionId)` | セッションの全メッセージを削除 |

### 2. 各メソッドの使用例

#### セッション操作

```typescript
import { ChatSessionId } from "@repo/shared/features/chat-history/domain/value-objects";
import { UserId } from "@repo/shared/features/chat-history/domain/value-objects";

// セッション取得
const sessionId = ChatSessionId.fromString("session-123");
const session = await sessionRepo.findById(sessionId);

if (session) {
  console.log(session.title);
}

// ユーザーのセッション一覧（ページネーション付き）
const userId = UserId.fromString("user-001");
const sessions = await sessionRepo.findByUserId(userId, 10, 0);

// セッション検索
const results = await sessionRepo.search({
  userId: userId,
  keyword: "プロジェクト",
  isFavorite: true,
  limit: 5,
});

// セッション保存
await sessionRepo.save(session);

// セッション削除
await sessionRepo.delete(sessionId);
```

#### メッセージ操作

```typescript
import { ChatMessageId } from "@repo/shared/features/chat-history/domain/value-objects";

// メッセージ取得
const messageId = ChatMessageId.fromString("msg-001");
const message = await messageRepo.findById(messageId);

// セッションのメッセージ一覧
const messages = await messageRepo.findBySessionId(sessionId);

// 最新メッセージ取得
const latest = await messageRepo.findLatestBySessionId(sessionId);

// 複数メッセージ一括保存
await messageRepo.saveMany([message1, message2, message3]);

// セッションの全メッセージ削除
await messageRepo.deleteBySessionId(sessionId);
```

### 3. エラーハンドリング方法

すべてのデータベースエラーは`DatabaseError`としてラップされます。

```typescript
import { DatabaseError } from "@repo/shared/core/errors/InfrastructureError";

try {
  const session = await sessionRepo.findById(sessionId);
} catch (error) {
  if (error instanceof DatabaseError) {
    // データベースエラーの処理
    console.error("DB Error:", error.message);
    console.error("Original:", error.cause);
  }
  throw error;
}
```

**エラーメッセージ例**:

- `"セッションの取得に失敗しました"`
- `"セッションの保存に失敗しました"`
- `"マッピングエラー: ..."`

### 4. テスト時のモック方法

インターフェースを使用してモックを作成します。

```typescript
import { vi, describe, it, expect } from "vitest";
import type { IChatSessionRepository } from "@repo/shared/features/chat-history/domain/repositories";

// モックリポジトリの作成
const mockSessionRepo: IChatSessionRepository = {
  findById: vi.fn().mockResolvedValue(null),
  findByUserId: vi.fn().mockResolvedValue([]),
  findPinned: vi.fn().mockResolvedValue([]),
  search: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  exists: vi.fn().mockResolvedValue(false),
  countPinned: vi.fn().mockResolvedValue(0),
};

// テストでの使用
describe("SomeService", () => {
  it("should use repository", async () => {
    const service = new SomeService(mockSessionRepo);
    // ...
  });
});
```

### 5. DI（依存性注入）での使用方法

```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@repo/shared/db/schema/chat-history";

// 1. データベース接続を作成
const sqlite = new Database("./data/chat.db");
const db = drizzle(sqlite, { schema });

// 2. リポジトリをインスタンス化
const sessionRepo = new DrizzleChatSessionRepository(db);
const messageRepo = new DrizzleChatMessageRepository(db);

// 3. DIコンテナに登録（例: tsyringeの場合）
container.register<IChatSessionRepository>("ChatSessionRepository", {
  useValue: sessionRepo,
});

// 4. サービスで利用
class ChatService {
  constructor(
    @inject("ChatSessionRepository")
    private readonly sessionRepo: IChatSessionRepository,
  ) {}
}
```

---

## 付録: ファイル構成

```
packages/shared/src/features/chat-history/
├── domain/
│   ├── entities/
│   │   ├── ChatSession.ts
│   │   └── ChatMessage.ts
│   ├── value-objects/
│   │   ├── ChatSessionId.ts
│   │   ├── ChatMessageId.ts
│   │   └── UserId.ts
│   └── repositories/
│       ├── IChatSessionRepository.ts
│       └── IChatMessageRepository.ts
└── infrastructure/
    └── persistence/
        ├── DrizzleChatSessionRepository.ts
        ├── DrizzleChatMessageRepository.ts
        ├── index.ts
        └── mappers/
            ├── ChatSessionMapper.ts
            └── ChatMessageMapper.ts
```
