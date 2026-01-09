# 履歴取得サービス - API仕様書

> Phase 2: 設計 成果物
> 作成日: 2026-01-09
> スキル: zod-validation

---

## 1. 概要

本ドキュメントは履歴取得サービスのAPI仕様とZodスキーマ定義を記述する。

---

## 2. Zodスキーマ定義

### 2.1 VersionHistoryItem スキーマ

```typescript
import { z } from "zod";

/**
 * バージョン履歴アイテムスキーマ
 */
export const versionHistoryItemSchema = z.object({
  /** 変換ID */
  conversionId: z.string().uuid(),

  /** ファイルID */
  fileId: z.string().uuid(),

  /** ファイル名 */
  fileName: z.string().min(1),

  /** バージョン番号 */
  version: z.number().int().min(0),

  /** 作成日時 */
  createdAt: z.date(),

  /** MIMEタイプ */
  mimeType: z.string().min(1),

  /** コンテンツハッシュ */
  contentHash: z.string().min(1),

  /** ファイルサイズ */
  sizeBytes: z.number().int().nonnegative(),

  /** メタデータ */
  metadata: z.record(z.string(), z.unknown()).optional(),

  /** 現在のバージョンか */
  isCurrentVersion: z.boolean(),
});

export type VersionHistoryItem = z.infer<typeof versionHistoryItemSchema>;
```

### 2.2 HistoryFilter スキーマ

```typescript
/**
 * 履歴フィルタスキーマ
 */
export const historyFilterSchema = z.object({
  /** 開始日 */
  dateFrom: z.date().optional(),

  /** 終了日 */
  dateTo: z.date().optional(),

  /** 対象MIMEタイプ */
  mimeTypes: z.array(z.string()).optional(),
});

export type HistoryFilter = z.infer<typeof historyFilterSchema>;
```

### 2.3 PaginationOptions スキーマ

```typescript
/**
 * ページネーションスキーマ
 */
export const paginationOptionsSchema = z.object({
  /** 取得件数 */
  limit: z.number().int().min(1).max(100).default(20),

  /** オフセット */
  offset: z.number().int().min(0).default(0),
});

export type PaginationOptions = z.infer<typeof paginationOptionsSchema>;
```

### 2.4 VersionDiff スキーマ

```typescript
/**
 * メタデータ変更スキーマ
 */
export const metadataChangeSchema = z.object({
  key: z.string(),
  oldValue: z.unknown(),
  newValue: z.unknown(),
});

export type MetadataChange = z.infer<typeof metadataChangeSchema>;

/**
 * バージョン差分スキーマ
 */
export const versionDiffSchema = z.object({
  conversionIdA: z.string().uuid(),
  conversionIdB: z.string().uuid(),
  sizeChange: z.number().int(),
  metadataChanges: z.array(metadataChangeSchema),
  contentChanged: z.boolean(),
});

export type VersionDiff = z.infer<typeof versionDiffSchema>;
```

### 2.5 PaginatedResult スキーマ

```typescript
/**
 * ページネーション結果スキーマ（ジェネリック）
 */
export const createPaginatedResultSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    hasMore: z.boolean(),
  });

export const paginatedHistoryResultSchema = createPaginatedResultSchema(
  versionHistoryItemSchema,
);

export type PaginatedHistoryResult = z.infer<
  typeof paginatedHistoryResultSchema
>;
```

---

## 3. API定義

### 3.1 getFileHistory

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| メソッド | getFileHistory                     |
| 説明     | ファイルのバージョン履歴一覧を取得 |

**シグネチャ**:

```typescript
getFileHistory(
  fileId: string,
  options?: {
    filter?: HistoryFilter;
    pagination?: PaginationOptions;
  }
): Promise<Result<PaginatedResult<VersionHistoryItem>, Error>>
```

**入力バリデーション**:

```typescript
const getFileHistoryInputSchema = z.object({
  fileId: z.string().uuid(),
  options: z
    .object({
      filter: historyFilterSchema.optional(),
      pagination: paginationOptionsSchema.optional(),
    })
    .optional(),
});
```

**出力**:

- 成功: `Result<PaginatedResult<VersionHistoryItem>, Error>`
- 失敗: Repository層のエラー

---

### 3.2 getVersionDetail

| 項目     | 内容                       |
| -------- | -------------------------- |
| メソッド | getVersionDetail           |
| 説明     | 特定バージョンの詳細を取得 |

**シグネチャ**:

```typescript
getVersionDetail(
  conversionId: string
): Promise<Result<VersionHistoryItem, Error>>
```

**入力バリデーション**:

```typescript
const getVersionDetailInputSchema = z.object({
  conversionId: z.string().uuid(),
});
```

**出力**:

- 成功: `Result<VersionHistoryItem, Error>`
- 失敗: `Error("Conversion not found: {id}")`

---

### 3.3 getVersionDiff

| 項目     | 内容                      |
| -------- | ------------------------- |
| メソッド | getVersionDiff            |
| 説明     | 2バージョン間の差分を取得 |

**シグネチャ**:

```typescript
getVersionDiff(
  conversionIdA: string,
  conversionIdB: string
): Promise<Result<VersionDiff, Error>>
```

**入力バリデーション**:

```typescript
const getVersionDiffInputSchema = z.object({
  conversionIdA: z.string().uuid(),
  conversionIdB: z.string().uuid(),
});
```

**出力**:

- 成功: `Result<VersionDiff, Error>`
- 失敗:
  - `Error("Conversion A not found: {id}")`
  - `Error("Conversion B not found: {id}")`

---

### 3.4 restoreToVersion

| 項目     | 内容                 |
| -------- | -------------------- |
| メソッド | restoreToVersion     |
| 説明     | 特定バージョンに復元 |

**シグネチャ**:

```typescript
restoreToVersion(
  fileId: string,
  conversionId: string
): Promise<Result<VersionHistoryItem, Error>>
```

**入力バリデーション**:

```typescript
const restoreToVersionInputSchema = z.object({
  fileId: z.string().uuid(),
  conversionId: z.string().uuid(),
});
```

**出力**:

- 成功: `Result<VersionHistoryItem, Error>`（復元後の新バージョン）
- 失敗:
  - `Error("Conversion not found: {id}")`
  - `Error("Conversion {id} does not belong to file {fileId}")`

**副作用**:

- 新しいバージョンがConversionRepositoryに作成される
- IConversionLoggerにログが記録される

---

### 3.5 getLatestVersion

| 項目     | 内容                 |
| -------- | -------------------- |
| メソッド | getLatestVersion     |
| 説明     | 最新バージョンを取得 |

**シグネチャ**:

```typescript
getLatestVersion(
  fileId: string
): Promise<Result<VersionHistoryItem | null, Error>>
```

**入力バリデーション**:

```typescript
const getLatestVersionInputSchema = z.object({
  fileId: z.string().uuid(),
});
```

**出力**:

- 成功: `Result<VersionHistoryItem | null, Error>`
  - 履歴がある場合: VersionHistoryItem
  - 履歴がない場合: null

---

### 3.6 getVersionCount

| 項目     | 内容               |
| -------- | ------------------ |
| メソッド | getVersionCount    |
| 説明     | バージョン数を取得 |

**シグネチャ**:

```typescript
getVersionCount(
  fileId: string
): Promise<Result<number, Error>>
```

**入力バリデーション**:

```typescript
const getVersionCountInputSchema = z.object({
  fileId: z.string().uuid(),
});
```

**出力**:

- 成功: `Result<number, Error>`

---

## 4. バリデーション戦略

### 4.1 safeParseの使用

```typescript
// 入力バリデーションの例
function validateInput<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
): Result<z.infer<T>, Error> {
  const result = schema.safeParse(data);
  if (!result.success) {
    return err(new Error(`Validation failed: ${result.error.message}`));
  }
  return ok(result.data);
}
```

### 4.2 エラーメッセージのカスタマイズ

```typescript
export const paginationOptionsSchema = z.object({
  limit: z
    .number()
    .int({ message: "limitは整数である必要があります" })
    .min(1, { message: "limitは1以上である必要があります" })
    .max(100, { message: "limitは100以下である必要があります" })
    .default(20),
  offset: z
    .number()
    .int({ message: "offsetは整数である必要があります" })
    .min(0, { message: "offsetは0以上である必要があります" })
    .default(0),
});
```

---

## 5. スキーマの再利用

### 5.1 pick/omitの活用

```typescript
// 作成時のスキーマ（ID・日時を除外）
const versionHistoryItemCreateSchema = versionHistoryItemSchema.omit({
  conversionId: true,
  createdAt: true,
  isCurrentVersion: true,
});

// 更新時のスキーマ（部分更新）
const versionHistoryItemUpdateSchema = versionHistoryItemSchema.partial().pick({
  metadata: true,
});
```

### 5.2 extend/mergeの活用

```typescript
// 復元用メタデータの拡張
const restoredMetadataSchema = z.object({
  restoredFrom: z.string().uuid(),
  restoredAt: z.string().datetime(),
});
```

---

## 6. 統合ポイントのスキーマ

### 6.1 ConversionRepository連携

```typescript
// Repository層のConversionスキーマ
const conversionSchema = z.object({
  id: z.string().uuid(),
  fileId: z.string().uuid(),
  fileName: z.string().min(1),
  createdAt: z.date(),
  mimeType: z.string().min(1),
  contentHash: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  content: z.union([z.string(), z.instanceof(Buffer)]).optional(),
});

export type Conversion = z.infer<typeof conversionSchema>;
```

---

## 7. エクスポート構成

```typescript
// packages/shared/src/services/history/types.ts

export {
  // スキーマ
  versionHistoryItemSchema,
  historyFilterSchema,
  paginationOptionsSchema,
  versionDiffSchema,
  metadataChangeSchema,
  paginatedHistoryResultSchema,
  createPaginatedResultSchema,

  // 型
  type VersionHistoryItem,
  type HistoryFilter,
  type PaginationOptions,
  type VersionDiff,
  type MetadataChange,
  type PaginatedResult,
};
```

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-09 | 1.0.0      | 初版作成 |
