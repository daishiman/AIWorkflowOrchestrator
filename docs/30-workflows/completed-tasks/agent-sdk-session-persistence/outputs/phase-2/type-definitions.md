# Phase 2: 型定義設計書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| 文書種別   | 型定義設計書                  |
| Phase      | 2                             |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-session-persistence |
| ステータス | 完了                          |

---

## 1. 概要

セッション永続化機能に必要なTypeScript型定義とZodスキーマを設計する。

---

## 2. 配置先

```
packages/shared/src/types/agent.ts      # 型定義追加
packages/shared/src/agent/validation.ts # Zodスキーマ追加
```

---

## 3. 永続化データ型

### 3.1 PersistedSession

永続化対象のセッションメタデータ。

```typescript
/**
 * 永続化されたセッション情報
 */
export interface PersistedSession {
  /** セッションID（UUID） */
  id: string;

  /** 作成日時（Unix timestamp in ms） */
  createdAt: number;

  /** 最終アクセス日時（Unix timestamp in ms） */
  lastAccessedAt: number;

  /** アクティブ状態（最後に使用していたセッション） */
  isActive: boolean;

  /** メッセージ数（サマリー表示用） */
  messageCount: number;

  /** セッションタイトル（最初のメッセージから自動生成） */
  title?: string;
}
```

### 3.2 PersistedMessage

永続化対象のメッセージデータ。

```typescript
/**
 * 永続化されたメッセージ情報
 */
export interface PersistedMessage {
  /** メッセージID（UUID） */
  id: string;

  /** 所属セッションID */
  sessionId: string;

  /** メッセージの送信者 */
  role: "user" | "assistant";

  /** メッセージ内容 */
  content: string;

  /** 送信日時（Unix timestamp in ms） */
  timestamp: number;
}
```

### 3.3 SessionStorageSchema

electron-storeのストレージスキーマ。

```typescript
/**
 * electron-storeのストレージスキーマ
 */
export interface SessionStorageSchema {
  /** 永続化されたセッション一覧 */
  sessions: PersistedSession[];

  /** セッションIDをキーとするメッセージマップ */
  messages: Record<string, PersistedMessage[]>;

  /** ストレージメタデータ */
  metadata: StorageMetadata;
}
```

### 3.4 StorageMetadata

ストレージのメタデータ。

```typescript
/**
 * ストレージメタデータ
 */
export interface StorageMetadata {
  /** スキーマバージョン */
  version: string;

  /** 最終更新日時（Unix timestamp in ms） */
  lastUpdated: number;

  /** 概算サイズ（bytes） */
  totalSize: number;
}
```

---

## 4. 設定型

### 4.1 SessionPersistenceConfig

永続化サービスの設定。

```typescript
/**
 * セッション永続化の設定
 */
export interface SessionPersistenceConfig {
  /** 最大セッション数（デフォルト: 100） */
  maxSessions: number;

  /** 最大ストレージサイズ（bytes、デフォルト: 50MB） */
  maxStorageSize: number;

  /** 1セッションあたりの最大メッセージ数（デフォルト: 1000） */
  maxMessagesPerSession: number;

  /** 自動バックアップ有効フラグ（デフォルト: true） */
  enableAutoBackup: boolean;

  /** バックアップ保持数（デフォルト: 3） */
  backupRetentionCount: number;

  /** LRU警告閾値（デフォルト: 0.9 = 90%） */
  lruWarningThreshold: number;
}
```

### 4.2 デフォルト設定

```typescript
export const DEFAULT_PERSISTENCE_CONFIG: SessionPersistenceConfig = {
  maxSessions: 100,
  maxStorageSize: 50 * 1024 * 1024, // 50MB
  maxMessagesPerSession: 1000,
  enableAutoBackup: true,
  backupRetentionCount: 3,
  lruWarningThreshold: 0.9,
};
```

---

## 5. API型

### 5.1 StorageStats

ストレージ統計情報。

```typescript
/**
 * ストレージ統計情報
 */
export interface StorageStats {
  /** 総セッション数 */
  totalSessions: number;

  /** 総メッセージ数 */
  totalMessages: number;

  /** 使用容量（bytes） */
  usedSize: number;

  /** 最大容量（bytes） */
  maxSize: number;

  /** 使用率（0-1） */
  usageRatio: number;

  /** 最終更新日時 */
  lastUpdated: number;
}
```

### 5.2 CleanupResult

LRU削除の結果。

```typescript
/**
 * LRU削除の結果
 */
export interface CleanupResult {
  /** 削除されたセッション数 */
  deletedSessions: number;

  /** 削除されたメッセージ数 */
  deletedMessages: number;

  /** 解放された容量（bytes） */
  freedSize: number;

  /** 削除されたセッションID一覧 */
  deletedSessionIds: string[];
}
```

### 5.3 BackupInfo

バックアップ情報。

```typescript
/**
 * バックアップ情報
 */
export interface BackupInfo {
  /** バックアップファイル名 */
  filename: string;

  /** 作成日時 */
  createdAt: number;

  /** ファイルサイズ（bytes） */
  size: number;

  /** ファイルパス */
  path: string;
}
```

---

## 6. エラー型

### 6.1 SessionPersistenceError

永続化エラー基底クラス。

```typescript
/**
 * セッション永続化エラー
 */
export class SessionPersistenceError extends Error {
  constructor(
    message: string,
    public readonly code: SessionPersistenceErrorCode,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "SessionPersistenceError";
  }
}
```

### 6.2 SessionPersistenceErrorCode

エラーコード。

```typescript
/**
 * 永続化エラーコード
 */
export type SessionPersistenceErrorCode =
  | "STORAGE_READ_ERROR" // ストレージ読み込みエラー
  | "STORAGE_WRITE_ERROR" // ストレージ書き込みエラー
  | "VALIDATION_ERROR" // バリデーションエラー
  | "SESSION_NOT_FOUND" // セッション未発見
  | "STORAGE_LIMIT_EXCEEDED" // 容量超過
  | "BACKUP_ERROR" // バックアップエラー
  | "MIGRATION_ERROR"; // マイグレーションエラー
```

---

## 7. Zodスキーマ

### 7.1 PersistedSession スキーマ

```typescript
import { z } from "zod";

export const persistedSessionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.number().int().positive(),
  lastAccessedAt: z.number().int().positive(),
  isActive: z.boolean(),
  messageCount: z.number().int().nonnegative(),
  title: z.string().max(200).optional(),
});

export type PersistedSession = z.infer<typeof persistedSessionSchema>;
```

### 7.2 PersistedMessage スキーマ

```typescript
export const persistedMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  role: z.enum(["user", "assistant"]),
  content: z.string().max(100000), // 100KB制限
  timestamp: z.number().int().positive(),
});

export type PersistedMessage = z.infer<typeof persistedMessageSchema>;
```

### 7.3 StorageMetadata スキーマ

```typescript
export const storageMetadataSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/), // semver format
  lastUpdated: z.number().int().positive(),
  totalSize: z.number().int().nonnegative(),
});

export type StorageMetadata = z.infer<typeof storageMetadataSchema>;
```

### 7.4 SessionStorageSchema スキーマ

```typescript
export const sessionStorageSchemaSchema = z.object({
  sessions: z.array(persistedSessionSchema),
  messages: z.record(z.string().uuid(), z.array(persistedMessageSchema)),
  metadata: storageMetadataSchema,
});

export type SessionStorageSchema = z.infer<typeof sessionStorageSchemaSchema>;
```

### 7.5 SessionPersistenceConfig スキーマ

```typescript
export const sessionPersistenceConfigSchema = z.object({
  maxSessions: z.number().int().positive().max(1000),
  maxStorageSize: z
    .number()
    .int()
    .positive()
    .max(200 * 1024 * 1024), // max 200MB
  maxMessagesPerSession: z.number().int().positive().max(10000),
  enableAutoBackup: z.boolean(),
  backupRetentionCount: z.number().int().positive().max(10),
  lruWarningThreshold: z.number().min(0.5).max(1.0),
});

export type SessionPersistenceConfig = z.infer<
  typeof sessionPersistenceConfigSchema
>;
```

---

## 8. ユーティリティ型

### 8.1 SessionSummary

セッション一覧表示用のサマリー型。

```typescript
/**
 * セッションサマリー（一覧表示用）
 */
export interface SessionSummary {
  id: string;
  title: string;
  messageCount: number;
  lastAccessedAt: Date;
  isActive: boolean;
}
```

### 8.2 型変換ユーティリティ

```typescript
/**
 * PersistedSession → SessionSummary 変換
 */
export function toSessionSummary(session: PersistedSession): SessionSummary {
  return {
    id: session.id,
    title: session.title || `Session ${session.id.slice(0, 8)}`,
    messageCount: session.messageCount,
    lastAccessedAt: new Date(session.lastAccessedAt),
    isActive: session.isActive,
  };
}

/**
 * Session → PersistedSession 変換
 */
export function toPersistedSession(
  session: Session,
  messageCount: number,
  title?: string,
): PersistedSession {
  return {
    id: session.id,
    createdAt: session.createdAt.getTime(),
    lastAccessedAt: Date.now(),
    isActive: session.isActive,
    messageCount,
    title,
  };
}

/**
 * Message → PersistedMessage 変換
 */
export function toPersistedMessage(
  message: Message,
  sessionId: string,
): PersistedMessage {
  return {
    id: message.id,
    sessionId,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp.getTime(),
  };
}
```

---

## 9. 型エクスポート

```typescript
// packages/shared/src/types/agent.ts への追加

// Persistence types
export type {
  PersistedSession,
  PersistedMessage,
  SessionStorageSchema,
  StorageMetadata,
  SessionPersistenceConfig,
  StorageStats,
  CleanupResult,
  BackupInfo,
  SessionSummary,
  SessionPersistenceErrorCode,
};

export { SessionPersistenceError };

// Utility functions
export { toSessionSummary, toPersistedSession, toPersistedMessage };

// Default config
export { DEFAULT_PERSISTENCE_CONFIG };
```

---

## 10. 完了条件

- [x] PersistedSession型が定義されている
- [x] PersistedMessage型が定義されている
- [x] SessionStorageSchema型が定義されている
- [x] SessionPersistenceConfig型が定義されている
- [x] API関連の型（StorageStats, CleanupResult, BackupInfo）が定義されている
- [x] エラー型が定義されている
- [x] Zodスキーマが全て定義されている
- [x] 型変換ユーティリティが定義されている
