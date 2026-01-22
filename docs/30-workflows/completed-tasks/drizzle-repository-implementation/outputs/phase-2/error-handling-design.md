# Phase 2 - タスク4: エラーハンドリング設計

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| タスク番号 | 4                                 |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 既存エラー体系との整合性

### 既存エラークラス階層

```
AppError (base)
├── DomainError (400 Bad Request)
│   ├── ValidationError
│   └── BusinessRuleError
├── UseCaseError (422 Unprocessable Entity)
└── InfrastructureError (500 Internal Server Error)
    ├── DatabaseError
    └── ExternalServiceError
```

### Repository層で使用するエラー

| エラークラス        | 用途                               | ステータスコード |
| ------------------- | ---------------------------------- | ---------------- |
| `DatabaseError`     | DB接続/クエリエラー                | 500              |
| `BusinessRuleError` | マッピングエラー（Mapper内で使用） | 400              |

---

## エラー種別定義

### 1. DatabaseError（既存クラスを使用）

```typescript
import { DatabaseError } from "../../../../core/errors/InfrastructureError.js";

// 使用例
throw new DatabaseError("セッションの取得に失敗しました", error as Error);
```

**用途**:

- DB接続エラー
- クエリ実行エラー
- トランザクションエラー
- 制約違反（外部キー、ユニーク制約等）

### 2. BusinessRuleError（Mapper内で使用）

```typescript
import { BusinessRuleError } from "../../../../core/errors/DomainError.js";

// Mapper内での使用例
return err(
  new BusinessRuleError(
    "MAPPING_ERROR",
    `セッションのマッピングに失敗しました: ${error.message}`,
  ),
);
```

**用途**:

- DBレコード → ドメインエンティティ変換エラー
- 不正なデータ形式

---

## エラーハンドリングパターン

### パターン1: 基本的なtry-catch

```typescript
async findById(id: ChatSessionId): Promise<ChatSession | null> {
  try {
    const record = await this.db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, id.value),
    });

    if (!record) {
      return null;
    }

    const result = ChatSessionMapper.toDomain(record);
    if (!result.ok) {
      throw new DatabaseError(`マッピングエラー: ${result.error.message}`);
    }
    return result.value;
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError("セッションの取得に失敗しました", error as Error);
  }
}
```

### パターン2: マッピングエラーのフィルター

```typescript
async findByUserId(userId: UserId): Promise<ChatSession[]> {
  try {
    const records = await this.db.query.chatSessions.findMany({
      where: eq(chatSessions.userId, userId.value),
    });

    // マッピング失敗レコードはスキップ
    return records
      .map((record) => ChatSessionMapper.toDomain(record))
      .filter((result): result is { ok: true; value: ChatSession } => result.ok)
      .map((result) => result.value);
  } catch (error) {
    throw new DatabaseError("セッション一覧の取得に失敗しました", error as Error);
  }
}
```

### パターン3: トランザクションエラー

```typescript
async saveMany(messages: ChatMessage[]): Promise<void> {
  if (messages.length === 0) return;

  try {
    await this.db.transaction(async (tx) => {
      for (const message of messages) {
        const record = ChatMessageMapper.toPersistence(message);
        await tx.insert(chatMessages).values(record).onConflictDoUpdate({...});
      }
    });
  } catch (error) {
    // トランザクションエラー時は全件ロールバック済み
    throw new DatabaseError("メッセージの一括保存に失敗しました", error as Error);
  }
}
```

---

## エラーメッセージ規約

### 日本語メッセージ

| 操作       | エラーメッセージ                 |
| ---------- | -------------------------------- |
| 取得       | `{対象}の取得に失敗しました`     |
| 保存       | `{対象}の保存に失敗しました`     |
| 削除       | `{対象}の削除に失敗しました`     |
| 一括保存   | `{対象}の一括保存に失敗しました` |
| カウント   | `{対象}のカウントに失敗しました` |
| 存在確認   | `{対象}存在確認に失敗しました`   |
| マッピング | `マッピングエラー: {詳細}`       |

### エラーコード（将来対応）

| コード                 | 意味                   |
| ---------------------- | ---------------------- |
| `DATABASE_ERROR`       | 一般的なDBエラー       |
| `CONNECTION_ERROR`     | 接続エラー             |
| `QUERY_ERROR`          | クエリ実行エラー       |
| `TRANSACTION_ERROR`    | トランザクションエラー |
| `MAPPING_ERROR`        | マッピングエラー       |
| `CONSTRAINT_VIOLATION` | 制約違反               |

---

## ログ出力方針

### エラーログ

```typescript
// 本番実装ではロガーを使用
// catch (error) {
//   logger.error('Failed to fetch session', { id: id.value, error });
//   throw new DatabaseError("セッションの取得に失敗しました", error as Error);
// }
```

### 現時点の方針

- **ログ実装はスコープ外** - ロガー統合は別タスク
- エラー原因は `DatabaseError.cause` で保持
- スタックトレースは自動結合

---

## Result型との連携

### Mapper → Repository

```typescript
// Mapperが Result<T, E> を返す
const result = ChatSessionMapper.toDomain(record);

// Repository内でResult型をアンラップ
if (!result.ok) {
  throw new DatabaseError(`マッピングエラー: ${result.error.message}`);
}
return result.value;
```

### 理由

- Repository層は `Promise<T>` を返すインターフェース
- 例外ベースのエラー伝播がインターフェース規約
- Mapper層でResult型を使用し、Repository層で変換

---

## エラーリカバリー方針

| エラー種別       | リカバリー方針                         |
| ---------------- | -------------------------------------- |
| 接続エラー       | 再試行（上位層で実装）                 |
| 一時的なエラー   | 再試行（上位層で実装）                 |
| 制約違反         | 再試行不可、ユーザーへのフィードバック |
| マッピングエラー | スキップ or 例外（ユースケースによる） |

---

## 完了確認

- [x] 既存エラー体系（DomainError, InfrastructureError）との整合性が確認されている
- [x] DatabaseErrorを使用したエラーハンドリングパターンが設計されている
- [x] エラーメッセージ規約（日本語）が定義されている
- [x] Result型との連携方針が設計されている
- [x] エラーリカバリー方針が定義されている
