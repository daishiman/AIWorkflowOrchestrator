# ファイル選択機能 - 型定義設計書

> **ドキュメントID**: CONV-01-TYPE
> **作成日**: 2025-12-16
> **作成者**: .claude/agents/schema-def.md
> **ステータス**: 承認待ち
> **関連ドキュメント**: [step01-requirements.md](./step01-requirements.md), [step02-nfr.md](./step02-nfr.md)

---

## 1. 概要

本ドキュメントは、ファイル選択機能で使用する型定義とZodスキーマを設計する。
既存のプロジェクトパターンに従い、Main/Renderer間で共有可能な型安全な設計を提供する。

### 1.1 設計方針

| 方針             | 説明                                                      |
| ---------------- | --------------------------------------------------------- |
| 既存パターン準拠 | `apps/desktop/src/preload/types.ts` の既存パターンに従う  |
| Zod統合          | Zodスキーマを先に定義し、`z.infer<>`で型を派生            |
| 型の共有         | `packages/shared/src/types/` に共通型を配置               |
| セキュリティ優先 | バリデーション関数は既存の `validation.ts` パターンを踏襲 |

### 1.2 配置先

```
packages/shared/src/
├── types/
│   └── file-selection.ts       # 型定義（z.inferで派生）
└── schemas/
    └── file-selection.schema.ts # Zodスキーマ

apps/desktop/src/
├── preload/
│   └── types.ts                 # 既存 + 新規型の追加
└── main/
    └── ipc/
        └── fileSelectionHandlers.ts  # IPC ハンドラ
```

---

## 2. Zodスキーマ定義

### 2.1 ファイル配置

**パス**: `packages/shared/src/schemas/file-selection.schema.ts`

### 2.2 スキーマ定義

```typescript
// packages/shared/src/schemas/file-selection.schema.ts
import { z } from "zod";

// ============================================================
// 基本スキーマ
// ============================================================

/**
 * ファイル拡張子パターン
 * - "."で始まる
 * - 英数字とハイフンのみ許可
 * - 最大10文字
 */
export const fileExtensionSchema = z
  .string()
  .regex(/^\.[a-zA-Z0-9-]+$/, {
    message: "拡張子は「.」で始まり、英数字とハイフンのみ使用可能です",
  })
  .max(10, { message: "拡張子は10文字以内です" });

/**
 * ファイルパススキーマ
 * - 空文字を許可しない
 * - 最大1000文字（クロスプラットフォーム対応）
 * - パストラバーサル（..）を含まない
 */
export const filePathSchema = z
  .string()
  .min(1, { message: "ファイルパスは必須です" })
  .max(1000, { message: "ファイルパスは1000文字以内です" })
  .refine((path) => !path.includes(".."), {
    message: "不正なパスです（ディレクトリトラバーサルは許可されていません）",
  });

/**
 * MIMEタイプスキーマ
 */
export const mimeTypeSchema = z.string().regex(/^[\w-]+\/[\w+.-]+$/, {
  message: "不正なMIMEタイプ形式です",
});

// ============================================================
// ファイルフィルター
// ============================================================

/**
 * ファイルフィルターカテゴリ
 */
export const fileFilterCategorySchema = z.enum([
  "all",
  "office",
  "text",
  "media",
  "image",
]);

/**
 * カスタムファイルフィルター
 * Electron dialog.showOpenDialog の filters に対応
 */
export const dialogFileFilterSchema = z.object({
  /** フィルター名（表示用） */
  name: z.string().max(50, { message: "フィルター名は50文字以内です" }),
  /** 拡張子リスト（"."なし） */
  extensions: z
    .array(z.string().max(10))
    .max(20, { message: "拡張子は20個までです" }),
});

// ============================================================
// 選択されたファイル情報
// ============================================================

/**
 * 選択されたファイルのメタ情報
 */
export const selectedFileSchema = z.object({
  /** ユニークID（UUID v4） */
  id: z.string().uuid({ message: "不正なIDフォーマットです" }),
  /** ファイルの絶対パス */
  path: filePathSchema,
  /** ファイル名（拡張子含む） */
  name: z.string().min(1).max(255),
  /** 拡張子（.pdf形式、小文字に正規化） */
  extension: fileExtensionSchema,
  /** ファイルサイズ（バイト） */
  size: z.number().int().nonnegative(),
  /** MIMEタイプ */
  mimeType: mimeTypeSchema,
  /** ファイルの最終更新日時（ISO文字列） */
  lastModified: z.string().datetime(),
  /** 選択日時（ISO文字列） */
  createdAt: z.string().datetime(),
});

// ============================================================
// IPC通信スキーマ
// ============================================================

/**
 * ファイル選択ダイアログリクエスト
 */
export const openFileDialogRequestSchema = z.object({
  /** ダイアログタイトル */
  title: z.string().max(100).optional(),
  /** 複数選択を許可 */
  multiSelections: z.boolean().optional().default(true),
  /** プリセットフィルターカテゴリ */
  filterCategory: fileFilterCategorySchema.optional(),
  /** カスタムフィルター（filterCategoryより優先） */
  customFilters: z.array(dialogFileFilterSchema).max(10).optional(),
  /** 初期ディレクトリ */
  defaultPath: filePathSchema.optional(),
});

/**
 * ファイル選択ダイアログレスポンス
 */
export const openFileDialogResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.object({
      /** キャンセルされたか */
      canceled: z.boolean(),
      /** 選択されたファイルパスの配列 */
      filePaths: z.array(filePathSchema),
    }),
  })
  .or(
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  );

/**
 * ファイルメタ情報取得リクエスト
 */
export const getFileMetadataRequestSchema = z.object({
  /** ファイルパス */
  filePath: filePathSchema,
});

/**
 * ファイルメタ情報取得レスポンス（成功）
 */
export const getFileMetadataResponseSchema = z
  .object({
    success: z.literal(true),
    data: selectedFileSchema,
  })
  .or(
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  );

/**
 * 複数ファイルメタ情報取得リクエスト
 */
export const getMultipleFileMetadataRequestSchema = z.object({
  /** ファイルパスの配列 */
  filePaths: z.array(filePathSchema).max(100, {
    message: "一度に取得できるファイルは100件までです",
  }),
});

/**
 * 複数ファイルメタ情報取得レスポンス
 */
export const getMultipleFileMetadataResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.object({
      /** 成功したファイル */
      files: z.array(selectedFileSchema),
      /** 失敗したファイル */
      errors: z.array(
        z.object({
          filePath: filePathSchema,
          error: z.string(),
        }),
      ),
    }),
  })
  .or(
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  );

/**
 * パス検証リクエスト
 */
export const validateFilePathRequestSchema = z.object({
  /** 検証するファイルパス */
  filePath: filePathSchema,
});

/**
 * パス検証レスポンス
 */
export const validateFilePathResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.object({
      valid: z.boolean(),
      exists: z.boolean().optional(),
      isFile: z.boolean().optional(),
      isDirectory: z.boolean().optional(),
      error: z.string().optional(),
    }),
  })
  .or(
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  );

// ============================================================
// 状態管理スキーマ
// ============================================================

/**
 * ファイル選択状態
 */
export const fileSelectionStateSchema = z.object({
  /** 選択されたファイルリスト */
  files: z.array(selectedFileSchema),
  /** 現在のフィルターカテゴリ */
  filterCategory: fileFilterCategorySchema,
  /** ドラッグ中かどうか */
  isDragging: z.boolean(),
  /** ローディング状態 */
  isLoading: z.boolean(),
  /** エラー情報（null = エラーなし） */
  error: z.string().nullable(),
});
```

---

## 3. TypeScript型定義

### 3.1 ファイル配置

**パス**: `packages/shared/src/types/file-selection.ts`

### 3.2 型定義

```typescript
// packages/shared/src/types/file-selection.ts
import { z } from "zod";
import {
  fileExtensionSchema,
  filePathSchema,
  mimeTypeSchema,
  fileFilterCategorySchema,
  dialogFileFilterSchema,
  selectedFileSchema,
  openFileDialogRequestSchema,
  openFileDialogResponseSchema,
  getFileMetadataRequestSchema,
  getFileMetadataResponseSchema,
  getMultipleFileMetadataRequestSchema,
  getMultipleFileMetadataResponseSchema,
  validateFilePathRequestSchema,
  validateFilePathResponseSchema,
  fileSelectionStateSchema,
} from "../schemas/file-selection.schema";

// ============================================================
// 基本型（Zodから派生）
// ============================================================

/** ファイル拡張子 */
export type FileExtension = z.infer<typeof fileExtensionSchema>;

/** ファイルパス */
export type FilePath = z.infer<typeof filePathSchema>;

/** MIMEタイプ */
export type MimeType = z.infer<typeof mimeTypeSchema>;

/** ファイルフィルターカテゴリ */
export type FileFilterCategory = z.infer<typeof fileFilterCategorySchema>;

/** ダイアログファイルフィルター */
export type DialogFileFilter = z.infer<typeof dialogFileFilterSchema>;

/** 選択されたファイル */
export type SelectedFile = z.infer<typeof selectedFileSchema>;

// ============================================================
// IPC通信型（Zodから派生）
// ============================================================

/** ファイル選択ダイアログリクエスト */
export type OpenFileDialogRequest = z.infer<typeof openFileDialogRequestSchema>;

/** ファイル選択ダイアログレスポンス */
export type OpenFileDialogResponse = z.infer<
  typeof openFileDialogResponseSchema
>;

/** ファイルメタ情報取得リクエスト */
export type GetFileMetadataRequest = z.infer<
  typeof getFileMetadataRequestSchema
>;

/** ファイルメタ情報取得レスポンス */
export type GetFileMetadataResponse = z.infer<
  typeof getFileMetadataResponseSchema
>;

/** 複数ファイルメタ情報取得リクエスト */
export type GetMultipleFileMetadataRequest = z.infer<
  typeof getMultipleFileMetadataRequestSchema
>;

/** 複数ファイルメタ情報取得レスポンス */
export type GetMultipleFileMetadataResponse = z.infer<
  typeof getMultipleFileMetadataResponseSchema
>;

/** パス検証リクエスト */
export type ValidateFilePathRequest = z.infer<
  typeof validateFilePathRequestSchema
>;

/** パス検証レスポンス */
export type ValidateFilePathResponse = z.infer<
  typeof validateFilePathResponseSchema
>;

// ============================================================
// 状態管理型（Zodから派生）
// ============================================================

/** ファイル選択状態 */
export type FileSelectionState = z.infer<typeof fileSelectionStateSchema>;

// ============================================================
// Zustandストア用のアクション型
// ============================================================

/** ファイル選択ストアのアクション */
export interface FileSelectionActions {
  /** ファイルを追加 */
  addFiles: (files: SelectedFile[]) => void;
  /** ファイルを削除 */
  removeFile: (fileId: string) => void;
  /** すべてのファイルをクリア */
  clearFiles: () => void;
  /** フィルターカテゴリを設定 */
  setFilterCategory: (category: FileFilterCategory) => void;
  /** ドラッグ状態を設定 */
  setIsDragging: (isDragging: boolean) => void;
  /** ローディング状態を設定 */
  setIsLoading: (isLoading: boolean) => void;
  /** エラーを設定 */
  setError: (error: string | null) => void;
  /** 状態をリセット */
  reset: () => void;
}

/** ファイル選択ストア全体の型 */
export type FileSelectionStore = FileSelectionState & FileSelectionActions;
```

---

## 4. 定数定義

### 4.1 ファイル配置

**パス**: `packages/shared/src/constants/file-selection.ts`

### 4.2 定数定義

```typescript
// packages/shared/src/constants/file-selection.ts

/**
 * ファイルフィルター定義
 */
export const FILE_FILTERS = {
  all: {
    name: "すべてのファイル",
    extensions: ["*"],
  },
  office: {
    name: "オフィス文書",
    extensions: ["pdf", "docx", "xlsx", "pptx", "doc", "xls", "ppt"],
  },
  text: {
    name: "テキスト/マークダウン",
    extensions: ["txt", "md", "csv", "json", "xml", "yaml", "yml"],
  },
  media: {
    name: "メディアファイル",
    extensions: ["mp3", "mp4", "wav", "webm", "ogg", "m4a"],
  },
  image: {
    name: "画像ファイル",
    extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
  },
} as const;

/**
 * MIMEタイプマッピング
 */
export const EXTENSION_TO_MIME: Record<string, string> = {
  // オフィス文書
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  // テキスト
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  json: "application/json",
  xml: "application/xml",
  yaml: "application/x-yaml",
  yml: "application/x-yaml",
  // メディア
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  wav: "audio/wav",
  webm: "video/webm",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  // 画像
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

/**
 * デフォルトのファイル選択状態
 */
export const DEFAULT_FILE_SELECTION_STATE = {
  files: [],
  filterCategory: "all" as const,
  isDragging: false,
  isLoading: false,
  error: null,
};

/**
 * IPCチャネル名
 */
export const FILE_SELECTION_IPC_CHANNELS = {
  OPEN_DIALOG: "file-selection:open-dialog",
  GET_METADATA: "file-selection:get-metadata",
  GET_MULTIPLE_METADATA: "file-selection:get-multiple-metadata",
  VALIDATE_PATH: "file-selection:validate-path",
} as const;
```

---

## 5. エクスポート設定

### 5.1 schemas/index.ts

```typescript
// packages/shared/src/schemas/index.ts
export * from "./file-selection.schema";
```

### 5.2 types/index.ts

```typescript
// packages/shared/src/types/index.ts
export * from "./file-selection";
```

### 5.3 constants/index.ts

```typescript
// packages/shared/src/constants/index.ts
export * from "./file-selection";
```

### 5.4 packages/shared/src/index.ts

```typescript
// packages/shared/src/index.ts
export * from "./types";
export * from "./schemas";
export * from "./constants";
```

---

## 6. preload/types.ts への統合

### 6.1 追加する型

```typescript
// apps/desktop/src/preload/types.ts に追加

// ===== File Selection operations =====

export interface FileSelectionOpenDialogRequest {
  title?: string;
  multiSelections?: boolean;
  filterCategory?: "all" | "office" | "text" | "media" | "image";
  customFilters?: Array<{ name: string; extensions: string[] }>;
  defaultPath?: string;
}

export interface FileSelectionOpenDialogResponse {
  success: boolean;
  data?: {
    canceled: boolean;
    filePaths: string[];
  };
  error?: string;
}

export interface FileSelectionGetMetadataRequest {
  filePath: string;
}

export interface FileSelectionSelectedFile {
  id: string;
  path: string;
  name: string;
  extension: string;
  size: number;
  mimeType: string;
  lastModified: string;
  createdAt: string;
}

export interface FileSelectionGetMetadataResponse {
  success: boolean;
  data?: FileSelectionSelectedFile;
  error?: string;
}

export interface FileSelectionGetMultipleMetadataRequest {
  filePaths: string[];
}

export interface FileSelectionGetMultipleMetadataResponse {
  success: boolean;
  data?: {
    files: FileSelectionSelectedFile[];
    errors: Array<{ filePath: string; error: string }>;
  };
  error?: string;
}
```

### 6.2 ElectronAPI への追加

```typescript
// ElectronAPI interface に追加
fileSelection: {
  openDialog: (request: FileSelectionOpenDialogRequest) =>
    Promise<FileSelectionOpenDialogResponse>;
  getMetadata: (request: FileSelectionGetMetadataRequest) =>
    Promise<FileSelectionGetMetadataResponse>;
  getMultipleMetadata: (request: FileSelectionGetMultipleMetadataRequest) =>
    Promise<FileSelectionGetMultipleMetadataResponse>;
}
```

---

## 7. 型関連図

```
┌─────────────────────────────────────────────────────────────────────┐
│                    packages/shared                                   │
│                                                                      │
│  ┌─────────────────────────┐    ┌─────────────────────────────────┐ │
│  │ schemas/                │    │ types/                          │ │
│  │ file-selection.schema.ts│───▶│ file-selection.ts               │ │
│  │                         │    │ (z.infer<> で型を派生)          │ │
│  │ - filePathSchema        │    │ - FilePath                      │ │
│  │ - selectedFileSchema    │    │ - SelectedFile                  │ │
│  │ - openFileDialogRequest │    │ - OpenFileDialogRequest         │ │
│  │   Schema                │    │                                 │ │
│  └─────────────────────────┘    └─────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────┐                                        │
│  │ constants/              │                                        │
│  │ file-selection.ts       │                                        │
│  │                         │                                        │
│  │ - FILE_FILTERS          │                                        │
│  │ - EXTENSION_TO_MIME     │                                        │
│  │ - IPC_CHANNELS          │                                        │
│  └─────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ import
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    apps/desktop                                      │
│                                                                      │
│  ┌─────────────────────────┐    ┌─────────────────────────────────┐ │
│  │ preload/types.ts        │    │ main/ipc/                       │ │
│  │                         │    │ fileSelectionHandlers.ts        │ │
│  │ IPC Request/Response型  │◀───│                                 │ │
│  │ ElectronAPI interface   │    │ Zodでバリデーション             │ │
│  └─────────────────────────┘    └─────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────┐    ┌─────────────────────────────────┐ │
│  │ renderer/store/         │    │ renderer/components/            │ │
│  │ fileSelectionStore.ts   │◀───│ FileSelector.tsx                │ │
│  │                         │    │                                 │ │
│  │ Zustand ストア          │    │ UIコンポーネント                │ │
│  └─────────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. バリデーション統合

既存の `validation.ts` パターンに加えて、Zodスキーマを使用したバリデーションを統合する。

### 8.1 IPCハンドラでの使用例

```typescript
// apps/desktop/src/main/ipc/fileSelectionHandlers.ts
import { ipcMain } from "electron";
import {
  openFileDialogRequestSchema,
  getFileMetadataRequestSchema,
} from "@repo/shared/schemas";
import { FILE_SELECTION_IPC_CHANNELS } from "@repo/shared/constants";

export function registerFileSelectionHandlers(): void {
  ipcMain.handle(
    FILE_SELECTION_IPC_CHANNELS.OPEN_DIALOG,
    async (_event, request: unknown) => {
      // Zodでバリデーション
      const result = openFileDialogRequestSchema.safeParse(request);
      if (!result.success) {
        return {
          success: false,
          error: result.error.errors[0]?.message ?? "バリデーションエラー",
        };
      }

      const validated = result.data;
      // 以降の処理...
    },
  );
}
```

---

## 9. テスト用型

```typescript
// packages/shared/src/types/__tests__/file-selection.test-d.ts
import { expectTypeOf } from "vitest";
import type {
  SelectedFile,
  FileSelectionState,
  OpenFileDialogRequest,
} from "../file-selection";

describe("型定義テスト", () => {
  it("SelectedFile型が正しい構造を持つ", () => {
    expectTypeOf<SelectedFile>().toMatchTypeOf<{
      id: string;
      path: string;
      name: string;
      extension: string;
      size: number;
      mimeType: string;
      lastModified: string;
      createdAt: string;
    }>();
  });

  it("FileSelectionState型が正しい構造を持つ", () => {
    expectTypeOf<FileSelectionState>().toHaveProperty("files");
    expectTypeOf<FileSelectionState>().toHaveProperty("filterCategory");
    expectTypeOf<FileSelectionState>().toHaveProperty("isDragging");
    expectTypeOf<FileSelectionState>().toHaveProperty("isLoading");
    expectTypeOf<FileSelectionState>().toHaveProperty("error");
  });
});
```

---

## 10. 完了条件チェックリスト

- [x] FileInfo型（SelectedFile）が設計されている
- [x] FileSelectionResult型（OpenFileDialogResponse）が設計されている
- [x] FileFilter型（FileFilterCategory, DialogFileFilter）が設計されている
- [x] Zodスキーマが設計されている
- [x] 型の共有方法が決定されている（packages/shared経由）

---

## 11. 承認

| 役割           | 名前        | 日付       | 承認状況 |
| -------------- | ----------- | ---------- | -------- |
| スキーマ設計者 | .claude/agents/schema-def.md | 2025-12-16 | 作成済み |
| 型レビュアー   |             |            | 未承認   |
| 最終承認者     |             |            | 未承認   |

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 変更者      |
| ---------- | ---------- | -------- | ----------- |
| 1.0        | 2025-12-16 | 初版作成 | .claude/agents/schema-def.md |
