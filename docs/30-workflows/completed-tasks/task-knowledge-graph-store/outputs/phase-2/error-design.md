# Knowledge Graph Store エラー設計

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 2                          |
| 機能名     | task-knowledge-graph-store |
| 作成日     | 2026-01-13                 |
| 作成者     | Claude Opus 4.5            |
| バージョン | 1.0.0                      |

---

## 1. エラー階層構造

```
KnowledgeGraphError (基底クラス)
├── EntityNotFoundError      # エンティティ未発見
├── RelationNotFoundError    # 関係未発見
├── CommunityNotFoundError   # コミュニティ未発見
├── SelfLoopError            # 自己ループ禁止違反
├── EvidenceRequiredError    # 証拠必須違反
├── DuplicateEntityError     # エンティティ重複
├── ValidationError          # バリデーションエラー
├── DatabaseConnectionError  # DB接続エラー
└── DatabaseQueryError       # DBクエリエラー
```

---

## 2. 基底エラークラス

### 2.1 KnowledgeGraphError

```typescript
class KnowledgeGraphError extends Error {
  readonly code: string;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "KnowledgeGraphError";
    this.code = code;
    this.timestamp = new Date();
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
  }
}
```

| プロパティ | 型                      | 説明                 |
| ---------- | ----------------------- | -------------------- |
| code       | string                  | エラーコード         |
| timestamp  | Date                    | エラー発生日時       |
| context    | Record<string, unknown> | 追加コンテキスト情報 |

---

## 3. Entity関連エラー

### 3.1 EntityNotFoundError

```typescript
class EntityNotFoundError extends KnowledgeGraphError {
  readonly entityId?: EntityId;
  readonly entityName?: string;

  constructor(identifier: { id?: EntityId; name?: string }) {
    const message = identifier.id
      ? `Entity not found: ${identifier.id}`
      : `Entity not found by name: ${identifier.name}`;

    super(message, "ENTITY_NOT_FOUND", { identifier });
    this.name = "EntityNotFoundError";
    this.entityId = identifier.id;
    this.entityName = identifier.name;
  }
}
```

| 発生条件                          | 例                                     |
| --------------------------------- | -------------------------------------- |
| getEntity()で存在しないID指定     | `getEntity("non-existent-id")`         |
| updateEntity()で存在しないID指定  | `updateEntity("non-existent-id", ...)` |
| deleteEntity()で存在しないID指定  | `deleteEntity("non-existent-id")`      |
| addRelation()でsourceが存在しない | sourceEntityNameが見つからない         |
| addRelation()でtargetが存在しない | targetEntityNameが見つからない         |

### 3.2 DuplicateEntityError

```typescript
class DuplicateEntityError extends KnowledgeGraphError {
  readonly existingEntityId: EntityId;
  readonly duplicateName: string;

  constructor(existingEntityId: EntityId, duplicateName: string) {
    super(
      `Entity already exists: ${duplicateName} (id: ${existingEntityId})`,
      "DUPLICATE_ENTITY",
      { existingEntityId, duplicateName },
    );
    this.name = "DuplicateEntityError";
    this.existingEntityId = existingEntityId;
    this.duplicateName = duplicateName;
  }
}
```

---

## 4. Relation関連エラー

### 4.1 RelationNotFoundError

```typescript
class RelationNotFoundError extends KnowledgeGraphError {
  readonly relationId: RelationId;

  constructor(relationId: RelationId) {
    super(`Relation not found: ${relationId}`, "RELATION_NOT_FOUND", {
      relationId,
    });
    this.name = "RelationNotFoundError";
    this.relationId = relationId;
  }
}
```

### 4.2 SelfLoopError

```typescript
class SelfLoopError extends KnowledgeGraphError {
  readonly entityId: EntityId;

  constructor(entityId: EntityId) {
    super(
      `Self-loop relations are not allowed: ${entityId}`,
      "SELF_LOOP_NOT_ALLOWED",
      { entityId },
    );
    this.name = "SelfLoopError";
    this.entityId = entityId;
  }
}
```

| 発生条件                             | 説明                   |
| ------------------------------------ | ---------------------- |
| addRelation()でsource == target      | 自己参照関係の作成試行 |
| bulkAddRelations()でsource == target | バッチ内の自己参照関係 |

### 4.3 EvidenceRequiredError

```typescript
class EvidenceRequiredError extends KnowledgeGraphError {
  readonly sourceEntityName: string;
  readonly targetEntityName: string;
  readonly relationType: string;

  constructor(relation: {
    sourceEntityName: string;
    targetEntityName: string;
    relationType: string;
  }) {
    super(
      `Evidence is required for relation: ${relation.sourceEntityName} -[${relation.relationType}]-> ${relation.targetEntityName}`,
      "EVIDENCE_REQUIRED",
      relation,
    );
    this.name = "EvidenceRequiredError";
    this.sourceEntityName = relation.sourceEntityName;
    this.targetEntityName = relation.targetEntityName;
    this.relationType = relation.relationType;
  }
}
```

| 発生条件                                  | 説明                     |
| ----------------------------------------- | ------------------------ |
| addRelation()でevidence.length === 0      | 証拠なしでの関係作成試行 |
| bulkAddRelations()でevidence.length === 0 | バッチ内の証拠なし関係   |

---

## 5. Community関連エラー

### 5.1 CommunityNotFoundError

```typescript
class CommunityNotFoundError extends KnowledgeGraphError {
  readonly communityId: CommunityId;

  constructor(communityId: CommunityId) {
    super(`Community not found: ${communityId}`, "COMMUNITY_NOT_FOUND", {
      communityId,
    });
    this.name = "CommunityNotFoundError";
    this.communityId = communityId;
  }
}
```

---

## 6. バリデーションエラー

### 6.1 ValidationError

```typescript
class ValidationError extends KnowledgeGraphError {
  readonly field: string;
  readonly value: unknown;
  readonly constraint: string;

  constructor(field: string, value: unknown, constraint: string) {
    super(
      `Validation failed for field "${field}": ${constraint}`,
      "VALIDATION_ERROR",
      { field, value, constraint },
    );
    this.name = "ValidationError";
    this.field = field;
    this.value = value;
    this.constraint = constraint;
  }
}
```

| 発生条件               | constraint例                     |
| ---------------------- | -------------------------------- |
| エンティティ名が空文字 | "name must not be empty"         |
| 重みが0〜1の範囲外     | "weight must be between 0 and 1" |
| 深度が負の値           | "maxDepth must be positive"      |

---

## 7. データベースエラー

### 7.1 DatabaseConnectionError

```typescript
class DatabaseConnectionError extends KnowledgeGraphError {
  readonly originalError: Error;

  constructor(originalError: Error) {
    super(
      `Database connection failed: ${originalError.message}`,
      "DATABASE_CONNECTION_ERROR",
      { originalError: originalError.message },
    );
    this.name = "DatabaseConnectionError";
    this.originalError = originalError;
  }
}
```

### 7.2 DatabaseQueryError

```typescript
class DatabaseQueryError extends KnowledgeGraphError {
  readonly query?: string;
  readonly originalError: Error;

  constructor(originalError: Error, query?: string) {
    super(
      `Database query failed: ${originalError.message}`,
      "DATABASE_QUERY_ERROR",
      { originalError: originalError.message, query },
    );
    this.name = "DatabaseQueryError";
    this.query = query;
    this.originalError = originalError;
  }
}
```

---

## 8. エラーコード一覧

| コード                    | エラークラス            | 説明                         |
| ------------------------- | ----------------------- | ---------------------------- |
| ENTITY_NOT_FOUND          | EntityNotFoundError     | エンティティが見つからない   |
| DUPLICATE_ENTITY          | DuplicateEntityError    | エンティティが重複している   |
| RELATION_NOT_FOUND        | RelationNotFoundError   | 関係が見つからない           |
| SELF_LOOP_NOT_ALLOWED     | SelfLoopError           | 自己ループは許可されていない |
| EVIDENCE_REQUIRED         | EvidenceRequiredError   | 証拠情報が必須               |
| COMMUNITY_NOT_FOUND       | CommunityNotFoundError  | コミュニティが見つからない   |
| VALIDATION_ERROR          | ValidationError         | バリデーションエラー         |
| DATABASE_CONNECTION_ERROR | DatabaseConnectionError | データベース接続エラー       |
| DATABASE_QUERY_ERROR      | DatabaseQueryError      | データベースクエリエラー     |

---

## 9. Result型パターン

### 9.1 Result型定義

```typescript
type Result<T, E extends Error = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

### 9.2 ヘルパー関数

```typescript
// 成功結果を作成
function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

// エラー結果を作成
function err<E extends Error>(error: E): Result<never, E> {
  return { success: false, error };
}

// Resultの値を取り出す（エラー時は例外をスロー）
function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

// Resultの値を取り出す（エラー時はデフォルト値を返す）
function unwrapOr<T, E extends Error>(
  result: Result<T, E>,
  defaultValue: T,
): T {
  if (result.success) {
    return result.data;
  }
  return defaultValue;
}
```

### 9.3 使用例

```typescript
// 成功ケース
const entity = await store.getEntity(entityId);
if (entity.success) {
  console.log(entity.data); // StoredEntity | null
}

// エラーケース
const result = await store.addRelation(relation);
if (!result.success) {
  if (result.error instanceof SelfLoopError) {
    console.error("Self-loop detected:", result.error.entityId);
  } else if (result.error instanceof EvidenceRequiredError) {
    console.error("Evidence required for:", result.error.relationType);
  }
}
```

---

## 10. エラーハンドリングベストプラクティス

### 10.1 推奨パターン

```typescript
// Good: Result型のパターンマッチング
const result = await store.upsertEntity(entity);
if (!result.success) {
  switch (result.error.code) {
    case "VALIDATION_ERROR":
      // バリデーションエラー処理
      break;
    case "DATABASE_QUERY_ERROR":
      // DBエラー処理
      break;
    default:
      // その他のエラー
      break;
  }
  return;
}
// 成功時の処理
const storedEntity = result.data;
```

### 10.2 非推奨パターン

```typescript
// Bad: try-catchでの例外キャッチ（Result型を使用しているため不要）
try {
  const result = await store.upsertEntity(entity);
  // ...
} catch (error) {
  // Result型を使用しているため、この分岐には到達しない
}
```

---

## 11. ログ出力フォーマット

### 11.1 エラーログ構造

```typescript
interface ErrorLog {
  level: "error" | "warn";
  timestamp: string;
  error: {
    name: string;
    code: string;
    message: string;
    context?: Record<string, unknown>;
    stack?: string;
  };
  operation: string;
  duration?: number;
}
```

### 11.2 ログ出力例

```json
{
  "level": "error",
  "timestamp": "2026-01-13T15:30:00.000Z",
  "error": {
    "name": "EntityNotFoundError",
    "code": "ENTITY_NOT_FOUND",
    "message": "Entity not found: entity-123",
    "context": {
      "identifier": {
        "id": "entity-123"
      }
    }
  },
  "operation": "getEntity",
  "duration": 15
}
```

---

## 12. 参照ドキュメント

| ドキュメント         | パス                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| システム仕様         | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` |
| インターフェース設計 | `outputs/phase-2/interface-design.md`                                                       |
| ドメインモデル       | `outputs/phase-2/domain-model.md`                                                           |
