# インフラストラクチャ層設計書

## 概要

本文書は、チャット履歴機能のインフラストラクチャ層（リポジトリ実装、マッパー）設計を定義する。

**作成日**: 2026-01-18
**配置場所**: `packages/shared/src/infrastructure/persistence/`

---

## 1. ディレクトリ構成

```
packages/shared/src/infrastructure/
└── persistence/
    ├── drizzle/
    │   ├── DrizzleChatSessionRepository.ts
    │   └── DrizzleChatMessageRepository.ts
    └── mappers/
        ├── ChatSessionMapper.ts
        └── ChatMessageMapper.ts
```

---

## 2. ChatSessionMapper

### 2.1 責務

- Domain Entity ↔ DTO ↔ Persistence型の相互変換
- スネークケース（DB）⇔ キャメルケース（アプリ）の変換

### 2.2 設計

```typescript
// packages/shared/src/infrastructure/persistence/mappers/ChatSessionMapper.ts

import { ChatSession } from "../../../features/chat-history/domain/entities/ChatSession.js";
import type { ChatSessionDTO } from "../../../features/chat-history/application/dto/ChatSessionDTO.js";
import type {
  ChatSessionRecord,
  NewChatSessionRecord,
} from "../../../db/schema/chat-history.js";

/**
 * チャットセッションマッパー
 *
 * Domain Entity ↔ DTO ↔ Persistence型の変換を担当する。
 */
export class ChatSessionMapper {
  /**
   * DBレコードからDomainエンティティに変換する
   *
   * @param record DBレコード
   * @returns ChatSession
   */
  static toDomain(record: ChatSessionRecord): ChatSession {
    return ChatSession.reconstitute({
      id: record.id,
      userId: record.userId,
      title: record.title,
      messageCount: record.messageCount,
      isFavorite: record.isFavorite === 1,
      isPinned: record.isPinned === 1,
      pinOrder: record.pinOrder,
      lastMessagePreview: record.lastMessagePreview,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    });
  }

  /**
   * DomainエンティティからDTOに変換する
   *
   * @param entity Domainエンティティ
   * @returns ChatSessionDTO
   */
  static toDTO(entity: ChatSession): ChatSessionDTO {
    return {
      id: entity.id.value,
      userId: entity.userId.value,
      title: entity.title.value,
      messageCount: entity.messageCount,
      isFavorite: entity.isFavorite,
      isPinned: entity.isPinned,
      pinOrder: entity.pinOrder,
      lastMessagePreview: entity.lastMessagePreview,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  /**
   * DomainエンティティからPersistence型（INSERT用）に変換する
   *
   * @param entity Domainエンティティ
   * @returns NewChatSessionRecord
   */
  static toPersistence(entity: ChatSession): NewChatSessionRecord {
    return {
      id: entity.id.value,
      userId: entity.userId.value,
      title: entity.title.value,
      messageCount: entity.messageCount,
      isFavorite: entity.isFavorite ? 1 : 0,
      isPinned: entity.isPinned ? 1 : 0,
      pinOrder: entity.pinOrder,
      lastMessagePreview: entity.lastMessagePreview,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      metadata: "{}",
      deletedAt: null,
    };
  }
}
```

---

## 3. ChatMessageMapper

### 3.1 責務

- Domain Entity ↔ DTO ↔ Persistence型の相互変換
- LLMメタデータのJSON変換

### 3.2 設計

```typescript
// packages/shared/src/infrastructure/persistence/mappers/ChatMessageMapper.ts

import { ChatMessage } from "../../../features/chat-history/domain/entities/ChatMessage.js";
import type { ChatMessageDTO } from "../../../features/chat-history/application/dto/ChatMessageDTO.js";
import type {
  ChatMessageRecord,
  NewChatMessageRecord,
} from "../../../db/schema/chat-history.js";

/**
 * チャットメッセージマッパー
 */
export class ChatMessageMapper {
  /**
   * DBレコードからDomainエンティティに変換する
   *
   * @param record DBレコード
   * @returns ChatMessage
   */
  static toDomain(record: ChatMessageRecord): ChatMessage {
    return ChatMessage.reconstitute({
      id: record.id,
      sessionId: record.sessionId,
      role: record.role as "user" | "assistant",
      content: record.content,
      messageIndex: record.messageIndex,
      timestamp: new Date(record.timestamp),
      llmProvider: record.llmProvider,
      llmModel: record.llmModel,
      llmMetadata: record.llmMetadata ? JSON.parse(record.llmMetadata) : null,
    });
  }

  /**
   * DomainエンティティからDTOに変換する
   *
   * @param entity Domainエンティティ
   * @returns ChatMessageDTO
   */
  static toDTO(entity: ChatMessage): ChatMessageDTO {
    return {
      id: entity.id.value,
      sessionId: entity.sessionId.value,
      role: entity.role.value,
      content: entity.content.value,
      messageIndex: entity.messageIndex,
      timestamp: entity.timestamp.toISOString(),
      llmProvider: entity.llmMetadata?.provider ?? null,
      llmModel: entity.llmMetadata?.model ?? null,
      llmMetadata: entity.llmMetadata?.toJSON() ?? null,
    };
  }

  /**
   * DomainエンティティからPersistence型（INSERT用）に変換する
   *
   * @param entity Domainエンティティ
   * @returns NewChatMessageRecord
   */
  static toPersistence(entity: ChatMessage): NewChatMessageRecord {
    return {
      id: entity.id.value,
      sessionId: entity.sessionId.value,
      role: entity.role.value,
      content: entity.content.value,
      messageIndex: entity.messageIndex,
      timestamp: entity.timestamp.toISOString(),
      llmProvider: entity.llmMetadata?.provider ?? null,
      llmModel: entity.llmMetadata?.model ?? null,
      llmMetadata: entity.llmMetadata
        ? JSON.stringify(entity.llmMetadata.toJSON())
        : null,
      attachments: "[]",
      systemPrompt: null,
      metadata: "{}",
    };
  }
}
```

---

## 4. DrizzleChatSessionRepository

### 4.1 責務

- IChatSessionRepositoryの実装
- Drizzle ORMを使用したDB操作

### 4.2 設計

```typescript
// packages/shared/src/infrastructure/persistence/drizzle/DrizzleChatSessionRepository.ts

import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import type {
  IChatSessionRepository,
  FindSessionsOptions,
  SessionSearchQuery,
} from "../../../features/chat-history/domain/repositories/IChatSessionRepository.js";
import type { ChatSession } from "../../../features/chat-history/domain/entities/ChatSession.js";
import type { ChatSessionId } from "../../../features/chat-history/domain/value-objects/ChatSessionId.js";
import type { UserId } from "../../../features/chat-history/domain/value-objects/UserId.js";
import { ChatSessionMapper } from "../mappers/ChatSessionMapper.js";

/**
 * Drizzle ORMを使用したチャットセッションリポジトリ実装
 */
export class DrizzleChatSessionRepository implements IChatSessionRepository {
  private sqlite: Database.Database;

  constructor(private readonly db: BetterSQLite3Database) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.sqlite = (db as any).$client as Database.Database;
  }

  async findById(id: ChatSessionId): Promise<ChatSession | null> {
    const row = this.db.get(sql`
      SELECT * FROM chat_sessions
      WHERE id = ${id.value} AND deleted_at IS NULL
    `) as Record<string, unknown> | undefined;

    if (!row) {
      return null;
    }

    return ChatSessionMapper.toDomain(row as any);
  }

  async findByUserId(
    userId: UserId,
    options?: FindSessionsOptions,
  ): Promise<ChatSession[]> {
    let sqlQuery = `
      SELECT * FROM chat_sessions
      WHERE user_id = ? AND deleted_at IS NULL
      ORDER BY ${options?.orderBy === "updatedAt" ? "updated_at" : "created_at"}
      ${options?.orderDirection === "asc" ? "ASC" : "DESC"}
    `;
    const params: unknown[] = [userId.value];

    if (options?.limit !== undefined) {
      sqlQuery += " LIMIT ?";
      params.push(options.limit);
    }

    if (options?.offset !== undefined) {
      sqlQuery += " OFFSET ?";
      params.push(options.offset);
    }

    const stmt = this.sqlite.prepare(sqlQuery);
    const rows = stmt.all(...params) as Record<string, unknown>[];

    return rows.map((row) => ChatSessionMapper.toDomain(row as any));
  }

  async findPinned(userId: UserId): Promise<ChatSession[]> {
    const rows = this.db.all(sql`
      SELECT * FROM chat_sessions
      WHERE user_id = ${userId.value} AND is_pinned = 1 AND deleted_at IS NULL
      ORDER BY pin_order ASC
    `) as Record<string, unknown>[];

    return rows.map((row) => ChatSessionMapper.toDomain(row as any));
  }

  async save(session: ChatSession): Promise<void> {
    const existing = await this.findById(session.id);
    const record = ChatSessionMapper.toPersistence(session);

    if (existing) {
      // UPDATE
      const stmt = this.sqlite.prepare(`
        UPDATE chat_sessions
        SET title = ?, message_count = ?, is_favorite = ?, is_pinned = ?,
            pin_order = ?, last_message_preview = ?, updated_at = ?
        WHERE id = ? AND deleted_at IS NULL
      `);
      stmt.run(
        record.title,
        record.messageCount,
        record.isFavorite,
        record.isPinned,
        record.pinOrder,
        record.lastMessagePreview,
        record.updatedAt,
        record.id,
      );
    } else {
      // INSERT
      this.db.run(sql`
        INSERT INTO chat_sessions (
          id, user_id, title, created_at, updated_at,
          message_count, is_favorite, is_pinned, pin_order,
          last_message_preview, metadata, deleted_at
        ) VALUES (
          ${record.id}, ${record.userId}, ${record.title},
          ${record.createdAt}, ${record.updatedAt}, ${record.messageCount},
          ${record.isFavorite}, ${record.isPinned}, ${record.pinOrder},
          ${record.lastMessagePreview}, ${record.metadata}, ${record.deletedAt}
        )
      `);
    }
  }

  async delete(id: ChatSessionId): Promise<void> {
    const deletedAt = new Date().toISOString();
    this.db.run(sql`
      UPDATE chat_sessions
      SET deleted_at = ${deletedAt}
      WHERE id = ${id.value} AND deleted_at IS NULL
    `);
  }

  async search(query: SessionSearchQuery): Promise<ChatSession[]> {
    let sqlQuery = `SELECT s.* FROM chat_sessions s`;
    const conditions: string[] = ["s.deleted_at IS NULL", "s.user_id = ?"];
    const params: unknown[] = [query.userId.value];

    if (query.keyword) {
      sqlQuery = `
        SELECT s.* FROM chat_sessions s
        JOIN chat_sessions_fts fts ON s.id = fts.id
      `;
      conditions.push("chat_sessions_fts MATCH ?");
      params.push(query.keyword);
    }

    if (query.isFavorite !== undefined) {
      conditions.push("s.is_favorite = ?");
      params.push(query.isFavorite ? 1 : 0);
    }

    if (query.isPinned !== undefined) {
      conditions.push("s.is_pinned = ?");
      params.push(query.isPinned ? 1 : 0);
    }

    sqlQuery += ` WHERE ${conditions.join(" AND ")}`;
    sqlQuery += " ORDER BY s.created_at DESC";

    if (query.limit !== undefined) {
      sqlQuery += " LIMIT ?";
      params.push(query.limit);
    }

    if (query.offset !== undefined) {
      sqlQuery += " OFFSET ?";
      params.push(query.offset);
    }

    const stmt = this.sqlite.prepare(sqlQuery);
    const rows = stmt.all(...params) as Record<string, unknown>[];

    return rows.map((row) => ChatSessionMapper.toDomain(row as any));
  }

  async countPinned(userId: UserId): Promise<number> {
    const row = this.db.get(sql`
      SELECT COUNT(*) as count FROM chat_sessions
      WHERE user_id = ${userId.value} AND is_pinned = 1 AND deleted_at IS NULL
    `) as { count: number };

    return row.count;
  }

  async exists(id: ChatSessionId): Promise<boolean> {
    const row = this.db.get(sql`
      SELECT 1 FROM chat_sessions
      WHERE id = ${id.value} AND deleted_at IS NULL
      LIMIT 1
    `);

    return row !== undefined;
  }
}
```

---

## 5. DrizzleChatMessageRepository

### 5.1 責務

- IChatMessageRepositoryの実装
- Drizzle ORMを使用したDB操作

### 5.2 設計

```typescript
// packages/shared/src/infrastructure/persistence/drizzle/DrizzleChatMessageRepository.ts

import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import type {
  IChatMessageRepository,
  FindMessagesOptions,
} from "../../../features/chat-history/domain/repositories/IChatMessageRepository.js";
import type { ChatMessage } from "../../../features/chat-history/domain/entities/ChatMessage.js";
import type { ChatMessageId } from "../../../features/chat-history/domain/value-objects/ChatMessageId.js";
import type { ChatSessionId } from "../../../features/chat-history/domain/value-objects/ChatSessionId.js";
import type { MessageRole } from "../../../features/chat-history/domain/value-objects/MessageRole.js";
import { ChatMessageMapper } from "../mappers/ChatMessageMapper.js";

/**
 * Drizzle ORMを使用したチャットメッセージリポジトリ実装
 */
export class DrizzleChatMessageRepository implements IChatMessageRepository {
  private sqlite: Database.Database;

  constructor(private readonly db: BetterSQLite3Database) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.sqlite = (db as any).$client as Database.Database;
  }

  async findById(id: ChatMessageId): Promise<ChatMessage | null> {
    const row = this.db.get(sql`
      SELECT * FROM chat_messages WHERE id = ${id.value}
    `) as Record<string, unknown> | undefined;

    if (!row) {
      return null;
    }

    return ChatMessageMapper.toDomain(row as any);
  }

  async findBySessionId(
    sessionId: ChatSessionId,
    options?: FindMessagesOptions,
  ): Promise<ChatMessage[]> {
    let sqlQuery = `
      SELECT * FROM chat_messages
      WHERE session_id = ?
      ORDER BY message_index ASC
    `;
    const params: unknown[] = [sessionId.value];

    if (options?.limit !== undefined) {
      sqlQuery += " LIMIT ?";
      params.push(options.limit);
    }

    if (options?.offset !== undefined) {
      sqlQuery += " OFFSET ?";
      params.push(options.offset);
    }

    const stmt = this.sqlite.prepare(sqlQuery);
    const rows = stmt.all(...params) as Record<string, unknown>[];

    return rows.map((row) => ChatMessageMapper.toDomain(row as any));
  }

  async findByRole(
    sessionId: ChatSessionId,
    role: MessageRole,
  ): Promise<ChatMessage[]> {
    const rows = this.db.all(sql`
      SELECT * FROM chat_messages
      WHERE session_id = ${sessionId.value} AND role = ${role.value}
      ORDER BY message_index ASC
    `) as Record<string, unknown>[];

    return rows.map((row) => ChatMessageMapper.toDomain(row as any));
  }

  async save(message: ChatMessage): Promise<void> {
    const record = ChatMessageMapper.toPersistence(message);

    this.db.run(sql`
      INSERT INTO chat_messages (
        id, session_id, role, content, message_index, timestamp,
        llm_provider, llm_model, llm_metadata, attachments,
        system_prompt, metadata
      ) VALUES (
        ${record.id}, ${record.sessionId}, ${record.role}, ${record.content},
        ${record.messageIndex}, ${record.timestamp}, ${record.llmProvider},
        ${record.llmModel}, ${record.llmMetadata}, ${record.attachments},
        ${record.systemPrompt}, ${record.metadata}
      )
    `);
  }

  async delete(id: ChatMessageId): Promise<void> {
    this.db.run(sql`
      DELETE FROM chat_messages WHERE id = ${id.value}
    `);
  }

  async deleteBySessionId(sessionId: ChatSessionId): Promise<void> {
    this.db.run(sql`
      DELETE FROM chat_messages WHERE session_id = ${sessionId.value}
    `);
  }

  async count(sessionId: ChatSessionId): Promise<number> {
    const row = this.db.get(sql`
      SELECT COUNT(*) as count FROM chat_messages
      WHERE session_id = ${sessionId.value}
    `) as { count: number };

    return row.count;
  }

  async getNextMessageIndex(sessionId: ChatSessionId): Promise<number> {
    const row = this.db.get(sql`
      SELECT MAX(message_index) as max_index
      FROM chat_messages
      WHERE session_id = ${sessionId.value}
    `) as { max_index: number | null };

    return (row.max_index ?? -1) + 1;
  }

  async exists(id: ChatMessageId): Promise<boolean> {
    const row = this.db.get(sql`
      SELECT 1 FROM chat_messages WHERE id = ${id.value} LIMIT 1
    `);

    return row !== undefined;
  }
}
```

---

## 6. 設計原則

### 6.1 マッパーの責務分離

| メソッド        | 変換方向             | 用途             |
| --------------- | -------------------- | ---------------- |
| `toDomain`      | Persistence → Domain | DBからの読み込み |
| `toDTO`         | Domain → DTO         | レイヤー間転送   |
| `toPersistence` | Domain → Persistence | DBへの書き込み   |

### 6.2 リポジトリ実装のパターン

- コンストラクタでDBインスタンスを受け取る
- ドメイン型（値オブジェクト）を引数に取る
- マッパー経由でドメインエンティティを返す
- SQL文は直接記述（Drizzle ORMのsql``タグ使用）

### 6.3 トランザクション対応（将来）

```typescript
// 将来的にUnitOfWorkパターンを導入する場合
export interface IUnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
```
