# Phase 1 - タスク3: Mapper分析

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 1                                 |
| タスク番号 | 3                                 |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## ChatSessionMapper 分析

**ファイルパス**: `packages/shared/src/features/chat-history/infrastructure/persistence/mappers/ChatSessionMapper.ts`

### 提供メソッド

| メソッド        | 入力                | 出力                               | 責務                              |
| --------------- | ------------------- | ---------------------------------- | --------------------------------- |
| `toDomain`      | `ChatSessionRecord` | `Result<ChatSession, DomainError>` | DBレコード → ドメインエンティティ |
| `toPersistence` | `ChatSession`       | `ChatSessionRecord`                | ドメインエンティティ → DBレコード |
| `toDTO`         | `ChatSession`       | `ChatSessionDTO`                   | ドメインエンティティ → DTO        |

### toDomain() 変換ロジック

```typescript
// 主な変換処理
- record.isFavorite === 1 → boolean (true/false)
- record.isPinned === 1 → boolean (true/false)
- new Date(record.createdAt) → ISO 8601 string → Date
- new Date(record.updatedAt) → ISO 8601 string → Date
- ChatSession.reconstitute() でエンティティ再構築
```

### toPersistence() 変換ロジック

```typescript
// 主な変換処理
- session.isFavorite → 1 : 0 (boolean → integer)
- session.isPinned → 1 : 0 (boolean → integer)
- session.createdAt.toISOString() → Date → ISO 8601 string
- session.updatedAt.toISOString() → Date → ISO 8601 string
- Value Object から .value でプリミティブ値を抽出
```

### ChatSessionRecord 型定義

```typescript
interface ChatSessionRecord {
  id: string;
  userId: string;
  title: string;
  lastMessagePreview: string | null;
  messageCount: number;
  isFavorite: number; // 0 or 1
  isPinned: number; // 0 or 1
  pinOrder: number | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

---

## ChatMessageMapper 分析

**ファイルパス**: `packages/shared/src/features/chat-history/infrastructure/persistence/mappers/ChatMessageMapper.ts`

### 提供メソッド

| メソッド        | 入力                | 出力                               | 責務                              |
| --------------- | ------------------- | ---------------------------------- | --------------------------------- |
| `toDomain`      | `ChatMessageRecord` | `Result<ChatMessage, DomainError>` | DBレコード → ドメインエンティティ |
| `toPersistence` | `ChatMessage`       | `ChatMessageRecord`                | ドメインエンティティ → DBレコード |
| `toDTO`         | `ChatMessage`       | `ChatMessageDTO`                   | ドメインエンティティ → DTO        |

### toDomain() 変換ロジック

```typescript
// LLMメタデータ変換
- JSON.parse(record.llmMetadata) でJSONパース
- フラット構造 → ネスト構造（tokenUsage）に変換
- ChatMessage.reconstitute() でエンティティ再構築
- new Date(record.timestamp) → ISO 8601 string → Date
```

### toPersistence() 変換ロジック

```typescript
// LLMメタデータ変換
- message.llmMetadata からフラット構造のJSONを構築
- JSON.stringify() でJSON文字列化
- message.createdAt.toISOString() → Date → ISO 8601 string
- Value Object から .value でプリミティブ値を抽出
```

### ChatMessageRecord 型定義

```typescript
interface ChatMessageRecord {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  messageIndex: number;
  llmModel: string | null;
  llmProvider: string | null;
  llmMetadata: string | null; // JSON string
  timestamp: string; // ISO 8601
}
```

---

## Drizzle実装での再利用可否判定

### 結論: **再利用可能**

既存のMapperはDrizzle ORM実装で**そのまま使用可能**です。

### 理由

1. **型互換性**: `ChatSessionRecord`/`ChatMessageRecord` 型は Drizzle の `$inferSelect` 型と互換性がある
2. **変換ロジックの完全性**: toDomain/toPersistence の変換ロジックが全フィールドをカバー
3. **エラーハンドリング**: Result<T, E> 型での適切なエラーハンドリング実装済み
4. **Value Object対応**: プリミティブ値からValue Objectへの変換が完備

### Drizzle実装時の使用方法

```typescript
// DrizzleChatSessionRepository での使用例
import { ChatSessionMapper } from "../mappers/ChatSessionMapper";

class DrizzleChatSessionRepository implements IChatSessionRepository {
  async findById(id: ChatSessionId): Promise<ChatSession | null> {
    const record = await this.db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, id.value))
      .limit(1);

    if (!record[0]) return null;

    // Mapper を使用して変換
    const result = ChatSessionMapper.toDomain(record[0]);
    if (!result.ok) {
      throw new Error(result.error.message);
    }
    return result.value;
  }

  async save(session: ChatSession): Promise<void> {
    // Mapper を使用して変換
    const record = ChatSessionMapper.toPersistence(session);

    await this.db.insert(chatSessions).values(record).onConflictDoUpdate({
      target: chatSessions.id,
      set: record,
    });
  }
}
```

---

## 注意事項

### DBスキーマとMapperの型の差異

| 項目           | DBスキーマ定義       | Mapper定義 | 対応方法                       |
| -------------- | -------------------- | ---------- | ------------------------------ |
| `metadata`     | 存在する             | 存在しない | Mapperに追加不要（将来拡張用） |
| `deletedAt`    | 存在する             | 存在しない | ソフトデリート時に別途対応     |
| `attachments`  | 存在する（Messages） | 存在しない | 将来対応時にMapper更新         |
| `systemPrompt` | 存在する（Messages） | 存在しない | 将来対応時にMapper更新         |

**現時点の実装では上記差異は問題にならない**。
Drizzle SELECT時に必要なカラムのみ選択するか、Mapperで未使用フィールドを無視する実装とする。

---

## 完了確認

- [x] ChatSessionMapper の toDomain/toPersistence ロジックが把握されている
- [x] ChatMessageMapper の toDomain/toPersistence ロジックが把握されている
- [x] Drizzle実装でMapperをそのまま使用可能と判定されている
- [x] 使用方法の例が記載されている
