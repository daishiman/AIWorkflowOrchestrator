# 型変換設計書 - HistoryService DB統合

## 文書情報

| 項目     | 内容                           |
| -------- | ------------------------------ |
| タスクID | history-service-db-integration |
| Phase    | 2                              |
| 作成日   | 2026-01-12                     |
| 状態     | 完了                           |

---

## 1. 型マッピング詳細

### 1.1 VersionHistoryItem

#### shared型（packages/shared/src/services/history/types.ts）

```typescript
interface VersionHistoryItem {
  conversionId: string;
  fileId: string;
  fileName: string; // ← Rendererに存在しない
  version: number;
  createdAt: Date; // ← Date型
  mimeType: string;
  contentHash: string; // ← Rendererでは "hash"
  sizeBytes: number; // ← Rendererでは "size"
  metadata?: Record<string, unknown>;
  isCurrentVersion: boolean; // ← Rendererでは "isLatest"
}
```

#### Renderer型（apps/desktop/src/renderer/components/history/types.ts）

```typescript
interface VersionHistoryItem {
  conversionId: string;
  fileId: string;
  version: number;
  createdAt: string; // ← ISO 8601文字列
  size: number; // ← sharedでは "sizeBytes"
  mimeType: string;
  hash: string; // ← sharedでは "contentHash"
  isLatest: boolean; // ← sharedでは "isCurrentVersion"
  metadata?: Record<string, unknown>;
}
```

#### 変換マッピング表

| shared型フィールド | Renderer型フィールド | 変換ロジック             |
| ------------------ | -------------------- | ------------------------ |
| `conversionId`     | `conversionId`       | そのまま                 |
| `fileId`           | `fileId`             | そのまま                 |
| `fileName`         | ー                   | 削除（Rendererには不要） |
| `version`          | `version`            | そのまま                 |
| `createdAt`        | `createdAt`          | `Date.toISOString()`     |
| `mimeType`         | `mimeType`           | そのまま                 |
| `contentHash`      | `hash`               | リネーム                 |
| `sizeBytes`        | `size`               | リネーム                 |
| `metadata`         | `metadata`           | そのまま                 |
| `isCurrentVersion` | `isLatest`           | リネーム                 |

---

### 1.2 ConversionLog

#### shared型からの変換

shared HistoryServiceには`getConversionLogs`メソッドが存在しないため、ログはDBから直接取得する。DBスキーマからRenderer型への変換を設計する。

#### DBスキーマ（推定）

```typescript
// conversion_logs テーブル
interface ConversionLogRecord {
  id: string;
  conversionId: string;
  timestamp: Date; // ← ISO文字列に変換
  level: "info" | "warn" | "error" | "debug";
  message: string;
  details?: string; // ← JSON文字列、Record型にパース
}
```

#### Renderer型

```typescript
interface ConversionLog {
  timestamp: string; // ISO 8601形式
  level: LogLevel; // "info" | "warn" | "error" | "debug"
  message: string;
  details?: Record<string, unknown>;
}
```

#### 変換マッピング表

| DBフィールド   | Renderer型フィールド | 変換ロジック                          |
| -------------- | -------------------- | ------------------------------------- |
| `id`           | ー                   | 削除（内部用）                        |
| `conversionId` | ー                   | 削除（クエリパラメータで使用）        |
| `timestamp`    | `timestamp`          | `Date.toISOString()`                  |
| `level`        | `level`              | そのまま                              |
| `message`      | `message`            | そのまま                              |
| `details`      | `details`            | `JSON.parse()`（nullの場合undefined） |

---

### 1.3 PaginatedResult

shared型とRenderer型で構造は同一。変換不要。

```typescript
interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
```

---

### 1.4 Result型

#### shared型（packages/shared/src/types/rag/result.ts）

```typescript
type Result<T, E extends Error = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

#### Renderer型（apps/desktop/src/renderer/components/history/types.ts）

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: Error };
```

#### 変換

構造は同一のため、変換不要。sharedのResult型をそのままRendererに返却可能。

---

## 2. 変換関数設計

### 2.1 toRendererVersionHistoryItem

```typescript
/**
 * shared VersionHistoryItem を Renderer VersionHistoryItem に変換
 */
function toRendererVersionHistoryItem(
  item: SharedVersionHistoryItem,
): RendererVersionHistoryItem {
  return {
    conversionId: item.conversionId,
    fileId: item.fileId,
    version: item.version,
    createdAt: item.createdAt.toISOString(),
    size: item.sizeBytes,
    mimeType: item.mimeType,
    hash: item.contentHash,
    isLatest: item.isCurrentVersion,
    metadata: item.metadata,
  };
}
```

### 2.2 toRendererPaginatedVersionHistory

```typescript
/**
 * PaginatedResult<SharedVersionHistoryItem> を
 * PaginatedResult<RendererVersionHistoryItem> に変換
 */
function toRendererPaginatedVersionHistory(
  result: PaginatedResult<SharedVersionHistoryItem>,
): PaginatedResult<RendererVersionHistoryItem> {
  return {
    items: result.items.map(toRendererVersionHistoryItem),
    total: result.total,
    hasMore: result.hasMore,
  };
}
```

### 2.3 toRendererConversionLog

```typescript
/**
 * DB ConversionLogRecord を Renderer ConversionLog に変換
 */
function toRendererConversionLog(record: ConversionLogRecord): ConversionLog {
  return {
    timestamp: record.timestamp.toISOString(),
    level: record.level,
    message: record.message,
    details: record.details ? JSON.parse(record.details) : undefined,
  };
}
```

### 2.4 toRendererPaginatedLogs

```typescript
/**
 * PaginatedResult<ConversionLogRecord> を
 * PaginatedResult<ConversionLog> に変換
 */
function toRendererPaginatedLogs(
  result: PaginatedResult<ConversionLogRecord>,
): PaginatedResult<ConversionLog> {
  return {
    items: result.items.map(toRendererConversionLog),
    total: result.total,
    hasMore: result.hasMore,
  };
}
```

---

## 3. メソッド別変換処理

### 3.1 getFileHistory

```
入力: fileId: string, options?: PaginationOptions
      ↓
shared HistoryService.getFileHistory(fileId, { pagination: options })
      ↓
Result<PaginatedResult<SharedVersionHistoryItem>, Error>
      ↓
変換: toRendererPaginatedVersionHistory()
      ↓
出力: Result<PaginatedResult<RendererVersionHistoryItem>>
```

**変換ポイント:**

- `options`のマッピング（PaginationOptions → HistoryOptions.pagination）
- 戻り値の`items`配列を`toRendererVersionHistoryItem`で変換

### 3.2 getVersionDetail

```
入力: conversionId: string
      ↓
shared HistoryService.getVersionDetail(conversionId)
      ↓
Result<SharedVersionHistoryItem, Error>
      ↓
変換: toRendererVersionHistoryItem()
      ↓
ログ取得: LogRepository.findByConversionId(conversionId)
      ↓
変換: toRendererPaginatedLogs()
      ↓
出力: Result<VersionDetailData>
      {
        version: RendererVersionHistoryItem,
        logs: ConversionLog[]
      }
```

**変換ポイント:**

- バージョン情報を`toRendererVersionHistoryItem`で変換
- ログを`toRendererConversionLog`で変換
- 2つの結果を`VersionDetailData`に統合

### 3.3 getConversionLogs

```
入力: conversionId: string, options?: LogFilterOptions
      ↓
LogRepository.findByConversionId(conversionId, options)
      ↓
Result<PaginatedResult<ConversionLogRecord>, Error>
      ↓
変換: toRendererPaginatedLogs()
      ↓
出力: Result<PaginatedResult<ConversionLog>>
```

**変換ポイント:**

- shared HistoryServiceは使用しない（ログ専用）
- LogFilterOptionsのlevelフィルタはクエリで適用
- 戻り値をRenderer型に変換

### 3.4 restoreVersion

```
入力: fileId: string, conversionId: string
      ↓
shared HistoryService.restoreToVersion(fileId, conversionId)
      ↓
Result<SharedVersionHistoryItem, Error>
      ↓
変換: toRendererVersionHistoryItem()
      ↓
出力: Result<RendererVersionHistoryItem>
```

**変換ポイント:**

- メソッド名の違い（`restoreVersion` → `restoreToVersion`）
- 戻り値を`toRendererVersionHistoryItem`で変換

---

## 4. オプション変換

### 4.1 PaginationOptions

Renderer型とshared型で互換性あり（同一構造）。

```typescript
// 変換不要
interface PaginationOptions {
  limit?: number; // デフォルト: 20
  offset?: number; // デフォルト: 0
}
```

ただし、shared HistoryServiceは`HistoryOptions`を受け取るため、ラップが必要：

```typescript
// Electron HistoryService内
const historyOptions: HistoryOptions = {
  pagination: options, // Rendererの PaginationOptions をそのまま渡す
};
```

### 4.2 LogFilterOptions

```typescript
// Renderer型
interface LogFilterOptions extends PaginationOptions {
  level?: LogLevel; // "info" | "warn" | "error" | "debug"
}
```

そのままDBクエリに使用可能。変換不要。

---

## 5. エラー変換

### 5.1 エラーメッセージのローカライズ

| shared側エラーメッセージ                           | Renderer側表示                         |
| -------------------------------------------------- | -------------------------------------- |
| `Conversion not found: {id}`                       | `指定されたバージョンが見つかりません` |
| `Conversion {id} does not belong to file {fileId}` | `このファイルには復元できません`       |
| DB接続エラー                                       | `データベース接続に問題があります`     |
| 不明なエラー                                       | `予期しないエラーが発生しました`       |

### 5.2 エラー変換関数

```typescript
function toRendererError(error: Error): Error {
  const message = error.message;

  if (message.includes("Conversion not found")) {
    return new Error("指定されたバージョンが見つかりません");
  }
  if (message.includes("does not belong to file")) {
    return new Error("このファイルには復元できません");
  }
  if (message.includes("database") || message.includes("DB")) {
    return new Error("データベース接続に問題があります");
  }

  return new Error("予期しないエラーが発生しました");
}
```

---

## 6. 型定義ファイル配置

### 6.1 変換関数の配置先

```
apps/desktop/src/main/services/
├── HistoryService.ts          # メインサービス
├── historyTypeConverters.ts   # 変換関数群 ← 新規作成
└── __tests__/
    ├── HistoryService.test.ts
    └── historyTypeConverters.test.ts  # 変換関数テスト ← 新規作成
```

### 6.2 型インポート

```typescript
// apps/desktop/src/main/services/historyTypeConverters.ts
import type {
  VersionHistoryItem as SharedVersionHistoryItem,
  PaginatedResult as SharedPaginatedResult,
} from "@repo/shared/services/history/types";

import type {
  VersionHistoryItem as RendererVersionHistoryItem,
  ConversionLog,
  PaginatedResult,
  VersionDetailData,
} from "../../renderer/components/history/types";
```

---

## 7. テスト設計

### 7.1 変換関数のユニットテスト

```typescript
describe("historyTypeConverters", () => {
  describe("toRendererVersionHistoryItem", () => {
    it("should convert Date to ISO string", () => {
      const shared: SharedVersionHistoryItem = {
        conversionId: "conv-1",
        fileId: "file-1",
        fileName: "test.txt",
        version: 1,
        createdAt: new Date("2026-01-12T00:00:00Z"),
        mimeType: "text/plain",
        contentHash: "abc123",
        sizeBytes: 1024,
        isCurrentVersion: true,
      };

      const result = toRendererVersionHistoryItem(shared);

      expect(result.createdAt).toBe("2026-01-12T00:00:00.000Z");
      expect(result.size).toBe(1024);
      expect(result.hash).toBe("abc123");
      expect(result.isLatest).toBe(true);
      expect(result).not.toHaveProperty("fileName");
      expect(result).not.toHaveProperty("sizeBytes");
      expect(result).not.toHaveProperty("contentHash");
      expect(result).not.toHaveProperty("isCurrentVersion");
    });

    it("should handle optional metadata", () => {
      const shared: SharedVersionHistoryItem = {
        // ... 必須フィールド
        metadata: { key: "value" },
      };

      const result = toRendererVersionHistoryItem(shared);

      expect(result.metadata).toEqual({ key: "value" });
    });

    it("should handle undefined metadata", () => {
      const shared: SharedVersionHistoryItem = {
        // ... 必須フィールド
        metadata: undefined,
      };

      const result = toRendererVersionHistoryItem(shared);

      expect(result.metadata).toBeUndefined();
    });
  });

  describe("toRendererConversionLog", () => {
    it("should parse JSON details", () => {
      const record = {
        id: "log-1",
        conversionId: "conv-1",
        timestamp: new Date("2026-01-12T10:00:00Z"),
        level: "info" as const,
        message: "Test message",
        details: '{"key":"value"}',
      };

      const result = toRendererConversionLog(record);

      expect(result.details).toEqual({ key: "value" });
    });

    it("should handle null details", () => {
      const record = {
        // ... 必須フィールド
        details: null,
      };

      const result = toRendererConversionLog(record);

      expect(result.details).toBeUndefined();
    });
  });
});
```

---

## 8. 完了確認

- [x] VersionHistoryItem の型マッピングが定義されている
- [x] ConversionLog の型マッピングが定義されている
- [x] PaginatedResult の互換性が確認されている
- [x] Result型 の互換性が確認されている
- [x] 各メソッドの変換処理が設計されている
- [x] オプション変換が設計されている
- [x] エラー変換が設計されている
- [x] テスト設計が含まれている
