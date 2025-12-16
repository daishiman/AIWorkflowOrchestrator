# CONV-03-02: ファイル・変換スキーマ定義

> **✅ 完了** - 2025-12-16
>
> 実装・テスト・ドキュメントは以下を参照:
>
> - 実装: `packages/shared/src/types/rag/file/`
> - ドキュメント: `docs/30-workflows/file-conversion-schemas/`
> - 完了報告: `docs/30-workflows/file-conversion-schemas/task-completion-report.md`

---

## 概要

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | CONV-03-02                            |
| タスク名   | ファイル・変換スキーマ定義            |
| 依存       | CONV-03-01                            |
| 規模       | 小                                    |
| 出力場所   | `packages/shared/src/types/rag/file/` |
| ステータス | ✅ 完了                               |

## 目的

ファイル選択・変換処理に関する型とZodスキーマを定義する。
CONV-01（ファイル選択）、CONV-02（変換エンジン）の基盤となる。

## 成果物

### 1. ファイルタイプ定義

```typescript
// packages/shared/src/types/rag/file/types.ts

import type { FileId, ConversionId } from "../branded";
import type { Timestamped, WithMetadata, AsyncStatus } from "../interfaces";

/**
 * サポートされるファイルタイプ
 */
export const FileTypes = {
  // テキスト系
  TEXT: "text/plain",
  MARKDOWN: "text/markdown",
  HTML: "text/html",
  CSV: "text/csv",
  TSV: "text/tab-separated-values",

  // コード系
  JAVASCRIPT: "text/javascript",
  TYPESCRIPT: "text/typescript",
  PYTHON: "application/x-python",
  JSON: "application/json",
  YAML: "application/x-yaml",
  XML: "application/xml",

  // ドキュメント系
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  PPTX: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // その他
  UNKNOWN: "application/octet-stream",
} as const;

export type FileType = (typeof FileTypes)[keyof typeof FileTypes];

/**
 * ファイルカテゴリ
 */
export const FileCategories = {
  TEXT: "text",
  CODE: "code",
  DOCUMENT: "document",
  SPREADSHEET: "spreadsheet",
  PRESENTATION: "presentation",
  OTHER: "other",
} as const;

export type FileCategory = (typeof FileCategories)[keyof typeof FileCategories];

/**
 * ファイルエンティティ
 */
export interface FileEntity extends Timestamped, WithMetadata {
  readonly id: FileId;
  readonly name: string;
  readonly path: string;
  readonly mimeType: FileType;
  readonly category: FileCategory;
  readonly size: number;
  readonly hash: string; // SHA-256 for deduplication
  readonly encoding: string;
  readonly lastModified: Date;
}

/**
 * 変換状態
 */
export interface ConversionEntity extends Timestamped {
  readonly id: ConversionId;
  readonly fileId: FileId;
  readonly status: AsyncStatus;
  readonly converterId: string;
  readonly inputHash: string;
  readonly outputHash: string | null;
  readonly duration: number | null; // ms
  readonly error: string | null;
}

/**
 * 変換結果
 */
export interface ConversionResult {
  readonly conversionId: ConversionId;
  readonly fileId: FileId;
  readonly originalContent: string;
  readonly convertedContent: string;
  readonly extractedMetadata: ExtractedMetadata;
}

/**
 * 抽出されたメタデータ
 */
export interface ExtractedMetadata {
  readonly title: string | null;
  readonly author: string | null;
  readonly language: string | null;
  readonly wordCount: number;
  readonly lineCount: number;
  readonly charCount: number;
  readonly headers: string[]; // 見出し一覧
  readonly codeBlocks: number; // コードブロック数
  readonly links: string[]; // リンクURL一覧
  readonly custom: Record<string, unknown>;
}
```

### 2. Zodスキーマ

```typescript
// packages/shared/src/types/rag/file/schemas.ts

import { z } from "zod";
import {
  uuidSchema,
  timestampedSchema,
  metadataSchema,
  asyncStatusSchema,
} from "../schemas";

/**
 * ファイルタイプスキーマ
 */
export const fileTypeSchema = z.enum([
  "text/plain",
  "text/markdown",
  "text/html",
  "text/csv",
  "text/tab-separated-values",
  "text/javascript",
  "text/typescript",
  "application/x-python",
  "application/json",
  "application/x-yaml",
  "application/xml",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/octet-stream",
]);

/**
 * ファイルカテゴリスキーマ
 */
export const fileCategorySchema = z.enum([
  "text",
  "code",
  "document",
  "spreadsheet",
  "presentation",
  "other",
]);

/**
 * ファイルエンティティスキーマ
 */
export const fileEntitySchema = z
  .object({
    id: uuidSchema,
    name: z.string().min(1).max(255),
    path: z.string().min(1),
    mimeType: fileTypeSchema,
    category: fileCategorySchema,
    size: z.number().int().min(0),
    hash: z.string().length(64), // SHA-256
    encoding: z.string().default("utf-8"),
    lastModified: z.date(),
    metadata: metadataSchema,
  })
  .merge(timestampedSchema);

/**
 * 変換エンティティスキーマ
 */
export const conversionEntitySchema = z
  .object({
    id: uuidSchema,
    fileId: uuidSchema,
    status: asyncStatusSchema,
    converterId: z.string().min(1),
    inputHash: z.string().length(64),
    outputHash: z.string().length(64).nullable(),
    duration: z.number().int().min(0).nullable(),
    error: z.string().nullable(),
  })
  .merge(timestampedSchema);

/**
 * 抽出メタデータスキーマ
 */
export const extractedMetadataSchema = z.object({
  title: z.string().nullable(),
  author: z.string().nullable(),
  language: z.string().length(2).nullable(), // ISO 639-1
  wordCount: z.number().int().min(0),
  lineCount: z.number().int().min(0),
  charCount: z.number().int().min(0),
  headers: z.array(z.string()),
  codeBlocks: z.number().int().min(0),
  links: z.array(z.string().url()),
  custom: z.record(z.unknown()),
});

/**
 * 変換結果スキーマ
 */
export const conversionResultSchema = z.object({
  conversionId: uuidSchema,
  fileId: uuidSchema,
  originalContent: z.string(),
  convertedContent: z.string(),
  extractedMetadata: extractedMetadataSchema,
});

/**
 * ファイル選択入力スキーマ
 */
export const fileSelectionInputSchema = z.object({
  paths: z.array(z.string()).min(1),
  recursive: z.boolean().default(true),
  includeHidden: z.boolean().default(false),
  maxFileSize: z
    .number()
    .int()
    .min(1)
    .default(10 * 1024 * 1024), // 10MB
  allowedTypes: z.array(fileTypeSchema).optional(),
  excludePatterns: z.array(z.string()).default([]),
});

/**
 * ファイル選択結果スキーマ
 */
export const fileSelectionResultSchema = z.object({
  selectedFiles: z.array(fileEntitySchema),
  skippedFiles: z.array(
    z.object({
      path: z.string(),
      reason: z.string(),
    }),
  ),
  totalSize: z.number().int().min(0),
});
```

### 3. ファイルタイプユーティリティ

```typescript
// packages/shared/src/types/rag/file/utils.ts

import {
  FileTypes,
  FileCategories,
  type FileType,
  type FileCategory,
} from "./types";

/**
 * 拡張子からファイルタイプを推定
 */
export const getFileTypeFromExtension = (extension: string): FileType => {
  const ext = extension.toLowerCase().replace(".", "");

  const extensionMap: Record<string, FileType> = {
    // テキスト系
    txt: FileTypes.TEXT,
    md: FileTypes.MARKDOWN,
    markdown: FileTypes.MARKDOWN,
    html: FileTypes.HTML,
    htm: FileTypes.HTML,
    csv: FileTypes.CSV,
    tsv: FileTypes.TSV,

    // コード系
    js: FileTypes.JAVASCRIPT,
    mjs: FileTypes.JAVASCRIPT,
    cjs: FileTypes.JAVASCRIPT,
    jsx: FileTypes.JAVASCRIPT,
    ts: FileTypes.TYPESCRIPT,
    tsx: FileTypes.TYPESCRIPT,
    mts: FileTypes.TYPESCRIPT,
    cts: FileTypes.TYPESCRIPT,
    py: FileTypes.PYTHON,
    json: FileTypes.JSON,
    yaml: FileTypes.YAML,
    yml: FileTypes.YAML,
    xml: FileTypes.XML,

    // ドキュメント系
    pdf: FileTypes.PDF,
    docx: FileTypes.DOCX,
    xlsx: FileTypes.XLSX,
    pptx: FileTypes.PPTX,
  };

  return extensionMap[ext] ?? FileTypes.UNKNOWN;
};

/**
 * ファイルタイプからカテゴリを取得
 */
export const getFileCategoryFromType = (type: FileType): FileCategory => {
  const categoryMap: Record<FileType, FileCategory> = {
    [FileTypes.TEXT]: FileCategories.TEXT,
    [FileTypes.MARKDOWN]: FileCategories.TEXT,
    [FileTypes.HTML]: FileCategories.TEXT,
    [FileTypes.CSV]: FileCategories.TEXT,
    [FileTypes.TSV]: FileCategories.TEXT,

    [FileTypes.JAVASCRIPT]: FileCategories.CODE,
    [FileTypes.TYPESCRIPT]: FileCategories.CODE,
    [FileTypes.PYTHON]: FileCategories.CODE,
    [FileTypes.JSON]: FileCategories.CODE,
    [FileTypes.YAML]: FileCategories.CODE,
    [FileTypes.XML]: FileCategories.CODE,

    [FileTypes.PDF]: FileCategories.DOCUMENT,
    [FileTypes.DOCX]: FileCategories.DOCUMENT,

    [FileTypes.XLSX]: FileCategories.SPREADSHEET,

    [FileTypes.PPTX]: FileCategories.PRESENTATION,

    [FileTypes.UNKNOWN]: FileCategories.OTHER,
  };

  return categoryMap[type] ?? FileCategories.OTHER;
};

/**
 * ファイル名からハッシュを計算（SHA-256）
 */
export const calculateFileHash = async (
  content: ArrayBuffer,
): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", content);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * ファイルサイズを人間が読める形式に変換
 */
export const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex > 0 ? 2 : 0)} ${units[unitIndex]}`;
};
```

### 4. バレルエクスポート

```typescript
// packages/shared/src/types/rag/file/index.ts

export * from "./types";
export * from "./schemas";
export * from "./utils";
```

## ディレクトリ構造

```
packages/shared/src/types/rag/file/
├── index.ts      # バレルエクスポート
├── types.ts      # 型定義
├── schemas.ts    # Zodスキーマ
└── utils.ts      # ユーティリティ関数
```

## 受け入れ条件

- [ ] `FileType`, `FileCategory` 型が定義されている
- [ ] `FileEntity`, `ConversionEntity` 型が定義されている
- [ ] `ExtractedMetadata` 型が定義されている
- [ ] 全型に対応するZodスキーマが定義されている
- [ ] ファイルタイプ推定ユーティリティが実装されている
- [ ] ファイルハッシュ計算関数が実装されている
- [ ] 全エクスポートが `index.ts` でまとめられている
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-03-01: 基本型・共通インターフェース定義

### このタスクに依存するもの

- CONV-02-01: ファイル変換基盤・インターフェース
- CONV-04-02: files/conversions テーブル実装
