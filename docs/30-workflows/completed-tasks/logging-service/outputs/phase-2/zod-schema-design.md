# Zodスキーマ設計書 - ConversionLogger サービス

## 文書情報

| 項目       | 内容            |
| ---------- | --------------- |
| タスクID   | CONV-05-01      |
| 機能名     | logging-service |
| バージョン | 1.0             |
| 作成日     | 2026-01-07      |
| 作成者     | Claude Code     |

---

## 1. スキーマ概要

### 1.1 スキーマ一覧

| スキーマ名               | 種別   | 用途                       |
| ------------------------ | ------ | -------------------------- |
| logLevelSchema           | Enum   | ログレベルの定義           |
| logActionSchema          | Enum   | ログアクションの定義       |
| conversionLogSchema      | Object | ログエントリの完全な定義   |
| conversionLogInputSchema | Object | ログ記録時の入力データ定義 |

### 1.2 スキーマ依存関係

```
logLevelSchema ────────┐
                       ├──> conversionLogSchema
logActionSchema ───────┤
                       └──> conversionLogInputSchema
```

---

## 2. 列挙型スキーマ

### 2.1 logLevelSchema

**定義**: ログの重要度を表す列挙型

```typescript
import { z } from "zod";

/**
 * ログレベルスキーマ
 * @description ログの重要度を定義
 */
export const logLevelSchema = z.enum(["info", "warn", "error"]);

/**
 * ログレベル型
 */
export type LogLevel = z.infer<typeof logLevelSchema>;
```

**バリデーション例**:

```typescript
// 有効な値
logLevelSchema.parse("info"); // ✅ "info"
logLevelSchema.parse("warn"); // ✅ "warn"
logLevelSchema.parse("error"); // ✅ "error"

// 無効な値
logLevelSchema.parse("debug"); // ❌ ZodError
logLevelSchema.parse("INFO"); // ❌ ZodError (大文字不可)
logLevelSchema.parse(""); // ❌ ZodError
```

---

### 2.2 logActionSchema

**定義**: ログが記録する処理種別を表す列挙型

```typescript
/**
 * ログアクションスキーマ
 * @description ログが記録する処理種別を定義
 */
export const logActionSchema = z.enum([
  "convert",
  "restore",
  "delete",
  "chunk",
  "embed",
]);

/**
 * ログアクション型
 */
export type LogAction = z.infer<typeof logActionSchema>;
```

**バリデーション例**:

```typescript
// 有効な値
logActionSchema.parse("convert"); // ✅ "convert"
logActionSchema.parse("chunk"); // ✅ "chunk"
logActionSchema.parse("embed"); // ✅ "embed"

// 無効な値
logActionSchema.parse("process"); // ❌ ZodError
logActionSchema.parse("CONVERT"); // ❌ ZodError (大文字不可)
```

---

## 3. オブジェクトスキーマ

### 3.1 conversionLogSchema

**定義**: ログエントリの完全な構造を定義

```typescript
/**
 * 変換ログスキーマ
 * @description ファイル変換処理の単一ログエントリを定義
 */
export const conversionLogSchema = z.object({
  /**
   * 一意識別子（UUID）
   */
  id: z.string().uuid(),

  /**
   * 作成日時
   */
  timestamp: z.date(),

  /**
   * ログレベル
   */
  level: logLevelSchema,

  /**
   * 対象ファイルID
   */
  fileId: z.string().min(1, "fileId cannot be empty"),

  /**
   * 対象ファイル名
   */
  fileName: z.string().min(1, "fileName cannot be empty"),

  /**
   * 変換処理ID（オプション）
   */
  conversionId: z.string().optional(),

  /**
   * アクション種別
   */
  action: logActionSchema,

  /**
   * ログメッセージ
   */
  message: z.string().min(1, "message cannot be empty"),

  /**
   * 追加情報（オプション）
   */
  details: z.record(z.unknown()).optional(),

  /**
   * 処理時間（ミリ秒、オプション）
   */
  durationMs: z.number().nonnegative().optional(),

  /**
   * エラースタックトレース（オプション）
   */
  errorStack: z.string().optional(),
});

/**
 * 変換ログ型
 */
export type ConversionLog = z.infer<typeof conversionLogSchema>;
```

**スキーマ構造図**:

```
conversionLogSchema
├── id: string (uuid)
├── timestamp: Date
├── level: LogLevel (enum)
├── fileId: string (min: 1)
├── fileName: string (min: 1)
├── conversionId?: string
├── action: LogAction (enum)
├── message: string (min: 1)
├── details?: Record<string, unknown>
├── durationMs?: number (nonnegative)
└── errorStack?: string
```

**バリデーション例**:

```typescript
// 有効なログ
const validLog = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  timestamp: new Date(),
  level: "info",
  fileId: "file-123",
  fileName: "document.md",
  action: "convert",
  message: "変換開始",
};
conversionLogSchema.parse(validLog); // ✅

// 無効なログ（空のfileId）
const invalidLog = {
  ...validLog,
  fileId: "",
};
conversionLogSchema.parse(invalidLog); // ❌ ZodError: fileId cannot be empty

// 無効なログ（無効なUUID）
const invalidUuid = {
  ...validLog,
  id: "not-a-uuid",
};
conversionLogSchema.parse(invalidUuid); // ❌ ZodError: Invalid uuid
```

---

### 3.2 conversionLogInputSchema

**定義**: ログ記録時に外部から受け取る入力データを定義

```typescript
/**
 * 変換ログ入力スキーマ
 * @description ログ記録時の入力データを定義（id/timestamp/levelは自動付与）
 */
export const conversionLogInputSchema = z.object({
  /**
   * 対象ファイルID
   */
  fileId: z.string().min(1, "fileId cannot be empty"),

  /**
   * 対象ファイル名
   */
  fileName: z.string().min(1, "fileName cannot be empty"),

  /**
   * 変換処理ID（オプション）
   */
  conversionId: z.string().optional(),

  /**
   * アクション種別
   */
  action: logActionSchema,

  /**
   * ログメッセージ
   */
  message: z.string().min(1, "message cannot be empty"),

  /**
   * 追加情報（オプション）
   */
  details: z.record(z.unknown()).optional(),

  /**
   * 処理時間（ミリ秒、オプション）
   */
  durationMs: z.number().nonnegative().optional(),
});

/**
 * 変換ログ入力型
 */
export type ConversionLogInput = z.infer<typeof conversionLogInputSchema>;
```

**ConversionLogSchemaとの差分**:

| フィールド | conversionLogSchema | conversionLogInputSchema | 備考                       |
| ---------- | ------------------- | ------------------------ | -------------------------- |
| id         | ○                   | -                        | ConversionLoggerで自動生成 |
| timestamp  | ○                   | -                        | ConversionLoggerで自動付与 |
| level      | ○                   | -                        | メソッドに応じて自動設定   |
| errorStack | ○                   | -                        | error()メソッドで自動追加  |

---

## 4. バリデーションユーティリティ

### 4.1 safeParse使用例

```typescript
/**
 * ログ入力のバリデーション
 * @param input - バリデーション対象の入力
 * @returns バリデーション結果
 */
export function validateLogInput(
  input: unknown,
): z.SafeParseReturnType<ConversionLogInput, ConversionLogInput> {
  return conversionLogInputSchema.safeParse(input);
}

// 使用例
const result = validateLogInput({
  fileId: "file-123",
  fileName: "test.md",
  action: "convert",
  message: "変換開始",
});

if (result.success) {
  console.log("Valid input:", result.data);
} else {
  console.error("Validation errors:", result.error.issues);
}
```

### 4.2 エラーフォーマット

```typescript
/**
 * Zodエラーをフォーマットする
 * @param error - Zodエラー
 * @returns フォーマットされたエラーメッセージ
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

// 使用例
// "fileId: fileId cannot be empty; message: message cannot be empty"
```

---

## 5. 型定義エクスポート

### 5.1 完全な types.ts ファイル

```typescript
// packages/shared/src/services/logging/types.ts

import { z } from "zod";

// ============================================================================
// Enum Schemas
// ============================================================================

/**
 * ログレベルスキーマ
 */
export const logLevelSchema = z.enum(["info", "warn", "error"]);

/**
 * ログアクションスキーマ
 */
export const logActionSchema = z.enum([
  "convert",
  "restore",
  "delete",
  "chunk",
  "embed",
]);

// ============================================================================
// Object Schemas
// ============================================================================

/**
 * 変換ログスキーマ
 */
export const conversionLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  level: logLevelSchema,
  fileId: z.string().min(1, "fileId cannot be empty"),
  fileName: z.string().min(1, "fileName cannot be empty"),
  conversionId: z.string().optional(),
  action: logActionSchema,
  message: z.string().min(1, "message cannot be empty"),
  details: z.record(z.unknown()).optional(),
  durationMs: z.number().nonnegative().optional(),
  errorStack: z.string().optional(),
});

/**
 * 変換ログ入力スキーマ
 */
export const conversionLogInputSchema = z.object({
  fileId: z.string().min(1, "fileId cannot be empty"),
  fileName: z.string().min(1, "fileName cannot be empty"),
  conversionId: z.string().optional(),
  action: logActionSchema,
  message: z.string().min(1, "message cannot be empty"),
  details: z.record(z.unknown()).optional(),
  durationMs: z.number().nonnegative().optional(),
});

// ============================================================================
// Type Inference
// ============================================================================

/**
 * ログレベル型
 */
export type LogLevel = z.infer<typeof logLevelSchema>;

/**
 * ログアクション型
 */
export type LogAction = z.infer<typeof logActionSchema>;

/**
 * 変換ログ型
 */
export type ConversionLog = z.infer<typeof conversionLogSchema>;

/**
 * 変換ログ入力型
 */
export type ConversionLogInput = z.infer<typeof conversionLogInputSchema>;

// ============================================================================
// Interfaces
// ============================================================================

/**
 * ConversionLoggerインターフェース
 */
export interface IConversionLogger {
  info(input: ConversionLogInput): Promise<Result<ConversionLog, Error>>;
  warn(input: ConversionLogInput): Promise<Result<ConversionLog, Error>>;
  error(
    input: ConversionLogInput,
    error?: Error,
  ): Promise<Result<ConversionLog, Error>>;
  batch(
    logs: Array<{ level: LogLevel; input: ConversionLogInput }>,
  ): Promise<Result<ConversionLog[], Error>>;
  flush(): Promise<Result<void, Error>>;
  dispose(): void;
}

/**
 * ConversionLoggerオプション
 */
export interface ConversionLoggerOptions {
  bufferSize?: number;
  flushIntervalMs?: number;
}
```

---

## 6. スキーマ拡張ガイド

### 6.1 新しいLogActionの追加

```typescript
// 既存
export const logActionSchema = z.enum([
  "convert",
  "restore",
  "delete",
  "chunk",
  "embed",
]);

// 拡張例: "analyze" を追加
export const logActionSchema = z.enum([
  "convert",
  "restore",
  "delete",
  "chunk",
  "embed",
  "analyze", // 新規追加
]);
```

### 6.2 新しいフィールドの追加

```typescript
// conversionLogSchemaの拡張
export const extendedConversionLogSchema = conversionLogSchema.extend({
  userId: z.string().optional(), // ユーザーID追加
  sessionId: z.string().optional(), // セッションID追加
});
```

### 6.3 部分スキーマの作成

```typescript
// 必須フィールドのみ抽出
export const requiredFieldsSchema = conversionLogInputSchema.pick({
  fileId: true,
  fileName: true,
  action: true,
  message: true,
});

// オプションフィールドのみ抽出
export const optionalFieldsSchema = conversionLogInputSchema.pick({
  conversionId: true,
  details: true,
  durationMs: true,
});
```

---

## 7. テスト用モック

### 7.1 有効なデータのファクトリ

```typescript
/**
 * テスト用の有効なConversionLogInputを生成
 */
export function createValidLogInput(
  overrides?: Partial<ConversionLogInput>,
): ConversionLogInput {
  return {
    fileId: "test-file-id",
    fileName: "test.md",
    action: "convert",
    message: "Test message",
    ...overrides,
  };
}

/**
 * テスト用の有効なConversionLogを生成
 */
export function createValidLog(
  overrides?: Partial<ConversionLog>,
): ConversionLog {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    level: "info",
    fileId: "test-file-id",
    fileName: "test.md",
    action: "convert",
    message: "Test message",
    ...overrides,
  };
}
```

---

## 8. 検証チェックリスト

- [x] すべてのスキーマがZodで定義されている
- [x] 型推論（z.infer）が使用されている
- [x] 必須フィールドにバリデーション制約がある
- [x] オプションフィールドが正しくマークされている
- [x] エラーメッセージがカスタマイズされている
- [x] スキーマがエクスポートされている
- [x] 型がエクスポートされている
