# ファイル選択機能 - IPC通信設計書

> **ドキュメントID**: CONV-01-IPC
> **作成日**: 2025-12-16
> **作成者**: .claude/agents/electron-architect.md
> **ステータス**: 承認待ち
> **関連ドキュメント**: [step02-nfr.md](./step02-nfr.md), [step03-type-design.md](./step03-type-design.md)

---

## 1. 概要

本ドキュメントは、ファイル選択機能のIPC（Inter-Process Communication）通信設計を定義する。
Electronのセキュリティベストプラクティスに従い、contextBridgeを介したセキュアな通信を実現する。

### 1.1 設計方針

| 方針               | 説明                                                   |
| ------------------ | ------------------------------------------------------ |
| 既存パターン準拠   | `apps/desktop/src/preload/` の既存パターンに従う       |
| ホワイトリスト管理 | `ALLOWED_INVOKE_CHANNELS` で許可チャネルを明示的に管理 |
| 型安全な通信       | TypeScriptの型定義とZodバリデーションを組み合わせる    |
| 最小権限原則       | Rendererには必要最小限のAPIのみを公開                  |

### 1.2 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Renderer Process                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  FileSelector.tsx                                            │    │
│  │  └─ useFileSelection() Hook                                  │    │
│  │      └─ window.electronAPI.fileSelection.openDialog()        │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ contextBridge
                                    │ (Isolated Context)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Preload Script                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  safeInvoke() - チャネルホワイトリスト検証                   │    │
│  │  └─ ALLOWED_INVOKE_CHANNELS.includes(channel)               │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ ipcRenderer.invoke()
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Main Process                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  fileSelectionHandlers.ts                                    │    │
│  │  └─ ipcMain.handle('file-selection:open-dialog', ...)       │    │
│  │      └─ Zodバリデーション                                   │    │
│  │      └─ dialog.showOpenDialog()                             │    │
│  │      └─ fs.stat() (メタ情報取得)                            │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. IPCチャネル定義

### 2.1 チャネル一覧

| チャネル名                             | 方向          | 説明                         | ハンドラ |
| -------------------------------------- | ------------- | ---------------------------- | -------- |
| `file-selection:open-dialog`           | Renderer→Main | ファイル選択ダイアログを開く | invoke   |
| `file-selection:get-metadata`          | Renderer→Main | 単一ファイルのメタ情報取得   | invoke   |
| `file-selection:get-multiple-metadata` | Renderer→Main | 複数ファイルのメタ情報取得   | invoke   |
| `file-selection:validate-path`         | Renderer→Main | ファイルパスの検証           | invoke   |

### 2.2 channels.ts への追加

```typescript
// apps/desktop/src/preload/channels.ts に追加

export const IPC_CHANNELS = {
  // ... 既存のチャネル

  // File Selection operations
  FILE_SELECTION_OPEN_DIALOG: "file-selection:open-dialog",
  FILE_SELECTION_GET_METADATA: "file-selection:get-metadata",
  FILE_SELECTION_GET_MULTIPLE_METADATA: "file-selection:get-multiple-metadata",
  FILE_SELECTION_VALIDATE_PATH: "file-selection:validate-path",
} as const;
```

### 2.3 ホワイトリストへの追加

```typescript
// apps/desktop/src/preload/channels.ts に追加

export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存のチャネル

  // File Selection channels
  IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG,
  IPC_CHANNELS.FILE_SELECTION_GET_METADATA,
  IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA,
  IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH,
];
```

### 2.4 チャネル命名規則とマイグレーションポリシー（ARCH-M2対応）

#### 命名規則

| ルール         | 説明                                                   | 例                                   |
| -------------- | ------------------------------------------------------ | ------------------------------------ |
| プレフィックス | 機能ドメインを示す（`feature-name:`形式）              | `file-selection:`                    |
| ケバブケース   | 単語はハイフンで区切る                                 | `open-dialog`, `get-metadata`        |
| アクション動詞 | 操作を明示する動詞で始める                             | `open-`, `get-`, `validate-`, `set-` |
| 定数定義       | `IPC_CHANNELS`オブジェクトに大文字スネークケースで定義 | `FILE_SELECTION_OPEN_DIALOG`         |

#### マイグレーションポリシー

**新規チャネル追加時**:

1. `IPC_CHANNELS`オブジェクトに定数を追加
2. `ALLOWED_INVOKE_CHANNELS`にホワイトリスト登録
3. 型定義（Request/Response）を`@repo/shared/types`に追加
4. Zodスキーマを`apps/desktop/src/main/ipc/schemas/`に追加

**既存チャネル変更時**:
| 変更種別 | 対応方針 |
| ---------------- | ------------------------------------------------------------------ |
| 機能追加（後方互換） | 既存チャネル名を維持、オプショナルパラメータとして追加 |
| 破壊的変更 | 新チャネル（`:v2`サフィックス）を作成、旧チャネルは非推奨警告を追加 |
| 廃止 | 3リリース前に非推奨警告、その後ホワイトリストから削除 |

**非推奨チャネルの警告実装例**:

```typescript
// 非推奨チャネルのハンドラ
ipcMain.handle("legacy-channel", async (_event, args) => {
  console.warn(
    '[DEPRECATED] "legacy-channel" is deprecated. Use "new-channel:v2" instead.',
  );
  // 旧ロジックを実行または新ハンドラに委譲
  return handleNewChannel(args);
});
```

---

## 3. リクエスト/レスポンス仕様

### 3.1 file-selection:open-dialog

#### 目的

OSネイティブのファイル選択ダイアログを表示し、選択されたファイルパスを返す。

#### リクエスト

```typescript
interface FileSelectionOpenDialogRequest {
  /** ダイアログタイトル（オプション） */
  title?: string;
  /** 複数選択を許可（デフォルト: true） */
  multiSelections?: boolean;
  /** フィルターカテゴリ（オプション） */
  filterCategory?: "all" | "office" | "text" | "media" | "image";
  /** カスタムフィルター（filterCategoryより優先） */
  customFilters?: Array<{ name: string; extensions: string[] }>;
  /** 初期ディレクトリ（オプション） */
  defaultPath?: string;
}
```

#### レスポンス

```typescript
// 成功時
interface FileSelectionOpenDialogSuccessResponse {
  success: true;
  data: {
    /** ユーザーがキャンセルしたか */
    canceled: boolean;
    /** 選択されたファイルパスの配列 */
    filePaths: string[];
  };
}

// 失敗時
interface FileSelectionOpenDialogErrorResponse {
  success: false;
  error: string;
}

type FileSelectionOpenDialogResponse =
  | FileSelectionOpenDialogSuccessResponse
  | FileSelectionOpenDialogErrorResponse;
```

#### シーケンス図

```
Renderer          Preload              Main                    OS
   │                 │                   │                       │
   │ openDialog()    │                   │                       │
   │────────────────▶│                   │                       │
   │                 │ invoke(channel)   │                       │
   │                 │──────────────────▶│                       │
   │                 │                   │ Zodバリデーション     │
   │                 │                   │────────┐              │
   │                 │                   │◀───────┘              │
   │                 │                   │ dialog.showOpenDialog │
   │                 │                   │──────────────────────▶│
   │                 │                   │◀──────────────────────│
   │                 │                   │ filePaths             │
   │                 │◀──────────────────│                       │
   │◀────────────────│                   │                       │
   │ Response        │                   │                       │
```

---

### 3.2 file-selection:get-metadata

#### 目的

指定されたファイルパスのメタ情報を取得する。

#### リクエスト

```typescript
interface FileSelectionGetMetadataRequest {
  /** ファイルパス */
  filePath: string;
}
```

#### レスポンス

```typescript
// 成功時
interface FileSelectionGetMetadataSuccessResponse {
  success: true;
  data: {
    /** ユニークID（UUID v4） */
    id: string;
    /** ファイルの絶対パス */
    path: string;
    /** ファイル名 */
    name: string;
    /** 拡張子（.pdf形式） */
    extension: string;
    /** ファイルサイズ（バイト） */
    size: number;
    /** MIMEタイプ */
    mimeType: string;
    /** 最終更新日時（ISO文字列） */
    lastModified: string;
    /** 選択日時（ISO文字列） */
    createdAt: string;
  };
}

// 失敗時
interface FileSelectionGetMetadataErrorResponse {
  success: false;
  error: string;
}
```

---

### 3.3 file-selection:get-multiple-metadata

#### 目的

複数ファイルのメタ情報を並列で取得する。

#### リクエスト

```typescript
interface FileSelectionGetMultipleMetadataRequest {
  /** ファイルパスの配列（最大100件） */
  filePaths: string[];
}
```

#### レスポンス

```typescript
// 成功時
interface FileSelectionGetMultipleMetadataSuccessResponse {
  success: true;
  data: {
    /** 成功したファイルのメタ情報 */
    files: Array<{
      id: string;
      path: string;
      name: string;
      extension: string;
      size: number;
      mimeType: string;
      lastModified: string;
      createdAt: string;
    }>;
    /** 失敗したファイル */
    errors: Array<{
      filePath: string;
      error: string;
    }>;
  };
}

// 全体失敗時
interface FileSelectionGetMultipleMetadataErrorResponse {
  success: false;
  error: string;
}
```

#### 処理フロー

```typescript
// Mainプロセスでの処理イメージ
async function handleGetMultipleMetadata(request: GetMultipleMetadataRequest) {
  const results = await Promise.allSettled(
    request.filePaths.map(async (filePath) => {
      // パス検証
      const validation = await validatePath(filePath);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      // メタ情報取得
      return getFileMetadata(filePath);
    }),
  );

  const files: SelectedFile[] = [];
  const errors: Array<{ filePath: string; error: string }> = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      files.push(result.value);
    } else {
      errors.push({
        filePath: request.filePaths[index],
        error: result.reason.message,
      });
    }
  });

  return { success: true, data: { files, errors } };
}
```

---

### 3.4 file-selection:validate-path

#### 目的

ファイルパスの検証（存在確認、アクセス権確認）を行う。

#### リクエスト

```typescript
interface FileSelectionValidatePathRequest {
  /** 検証するファイルパス */
  filePath: string;
}
```

#### レスポンス

```typescript
// 成功時
interface FileSelectionValidatePathSuccessResponse {
  success: true;
  data: {
    /** パスが有効か */
    valid: boolean;
    /** ファイル/ディレクトリが存在するか */
    exists: boolean;
    /** ファイルか（ディレクトリではない） */
    isFile: boolean;
    /** ディレクトリか */
    isDirectory: boolean;
    /** エラーメッセージ（invalidの場合） */
    error?: string;
  };
}
```

---

## 4. contextBridge API設計

### 4.1 preload/index.ts への追加

```typescript
// apps/desktop/src/preload/index.ts に追加

import type {
  FileSelectionOpenDialogRequest,
  FileSelectionOpenDialogResponse,
  FileSelectionGetMetadataRequest,
  FileSelectionGetMetadataResponse,
  FileSelectionGetMultipleMetadataRequest,
  FileSelectionGetMultipleMetadataResponse,
  FileSelectionValidatePathRequest,
  FileSelectionValidatePathResponse,
} from "./types";

const electronAPI: ElectronAPI = {
  // ... 既存のAPI

  fileSelection: {
    /**
     * ファイル選択ダイアログを開く
     */
    openDialog: (
      request: FileSelectionOpenDialogRequest,
    ): Promise<FileSelectionOpenDialogResponse> =>
      safeInvoke(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG, request),

    /**
     * ファイルメタ情報を取得
     */
    getMetadata: (
      request: FileSelectionGetMetadataRequest,
    ): Promise<FileSelectionGetMetadataResponse> =>
      safeInvoke(IPC_CHANNELS.FILE_SELECTION_GET_METADATA, request),

    /**
     * 複数ファイルのメタ情報を取得
     */
    getMultipleMetadata: (
      request: FileSelectionGetMultipleMetadataRequest,
    ): Promise<FileSelectionGetMultipleMetadataResponse> =>
      safeInvoke(IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA, request),

    /**
     * パスを検証
     */
    validatePath: (
      request: FileSelectionValidatePathRequest,
    ): Promise<FileSelectionValidatePathResponse> =>
      safeInvoke(IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH, request),
  },
};
```

### 4.2 ElectronAPI型定義への追加

```typescript
// apps/desktop/src/preload/types.ts に追加

export interface ElectronAPI {
  // ... 既存のAPI

  fileSelection: {
    openDialog: (
      request: FileSelectionOpenDialogRequest,
    ) => Promise<FileSelectionOpenDialogResponse>;
    getMetadata: (
      request: FileSelectionGetMetadataRequest,
    ) => Promise<FileSelectionGetMetadataResponse>;
    getMultipleMetadata: (
      request: FileSelectionGetMultipleMetadataRequest,
    ) => Promise<FileSelectionGetMultipleMetadataResponse>;
    validatePath: (
      request: FileSelectionValidatePathRequest,
    ) => Promise<FileSelectionValidatePathResponse>;
  };
}
```

---

## 5. Mainプロセスハンドラ設計

### 5.1 ファイル構成

```
apps/desktop/src/main/ipc/
├── index.ts                        # ハンドラ登録のエントリーポイント
├── fileSelectionHandlers.ts        # 新規作成
└── fileSelectionHandlers.test.ts   # テストファイル
```

### 5.2 fileSelectionHandlers.ts 設計

```typescript
// apps/desktop/src/main/ipc/fileSelectionHandlers.ts
import { ipcMain, dialog, BrowserWindow } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  openFileDialogRequestSchema,
  getFileMetadataRequestSchema,
  getMultipleFileMetadataRequestSchema,
  validateFilePathRequestSchema,
} from "@repo/shared/schemas";
import { FILE_FILTERS, EXTENSION_TO_MIME } from "@repo/shared/constants";
import { validatePath } from "./validation";

/**
 * ファイル選択関連のIPCハンドラを登録
 */
export function registerFileSelectionHandlers(): void {
  // ファイル選択ダイアログ
  ipcMain.handle(
    IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG,
    async (_event, request: unknown) => {
      // Zodバリデーション
      const result = openFileDialogRequestSchema.safeParse(request);
      if (!result.success) {
        return {
          success: false,
          error: result.error.errors[0]?.message ?? "バリデーションエラー",
        };
      }

      const validated = result.data;

      try {
        // フィルター設定
        const filters =
          validated.customFilters ??
          (validated.filterCategory
            ? [FILE_FILTERS[validated.filterCategory]]
            : undefined);

        // ダイアログオプション
        const dialogOptions: Electron.OpenDialogOptions = {
          title: validated.title ?? "ファイルを選択",
          properties: validated.multiSelections
            ? ["openFile", "multiSelections"]
            : ["openFile"],
          filters,
          defaultPath: validated.defaultPath,
        };

        // ダイアログを表示
        const window = BrowserWindow.getFocusedWindow();
        const dialogResult = window
          ? await dialog.showOpenDialog(window, dialogOptions)
          : await dialog.showOpenDialog(dialogOptions);

        return {
          success: true,
          data: {
            canceled: dialogResult.canceled,
            filePaths: dialogResult.filePaths,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "不明なエラー",
        };
      }
    },
  );

  // 単一ファイルメタ情報取得
  ipcMain.handle(
    IPC_CHANNELS.FILE_SELECTION_GET_METADATA,
    async (_event, request: unknown) => {
      const result = getFileMetadataRequestSchema.safeParse(request);
      if (!result.success) {
        return {
          success: false,
          error: result.error.errors[0]?.message ?? "バリデーションエラー",
        };
      }

      const { filePath } = result.data;

      // パス検証
      const pathValidation = validatePath(filePath);
      if (!pathValidation.valid) {
        return { success: false, error: pathValidation.error };
      }

      try {
        const metadata = await getFileMetadata(filePath);
        return { success: true, data: metadata };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "メタ情報取得エラー",
        };
      }
    },
  );

  // 複数ファイルメタ情報取得
  ipcMain.handle(
    IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA,
    async (_event, request: unknown) => {
      const result = getMultipleFileMetadataRequestSchema.safeParse(request);
      if (!result.success) {
        return {
          success: false,
          error: result.error.errors[0]?.message ?? "バリデーションエラー",
        };
      }

      const { filePaths } = result.data;

      // 並列処理でメタ情報取得
      const results = await Promise.allSettled(
        filePaths.map(async (filePath) => {
          const pathValidation = validatePath(filePath);
          if (!pathValidation.valid) {
            throw new Error(pathValidation.error);
          }
          return getFileMetadata(filePath);
        }),
      );

      const files: SelectedFile[] = [];
      const errors: Array<{ filePath: string; error: string }> = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          files.push(result.value);
        } else {
          errors.push({
            filePath: filePaths[index],
            error: result.reason.message,
          });
        }
      });

      return { success: true, data: { files, errors } };
    },
  );

  // パス検証
  ipcMain.handle(
    IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH,
    async (_event, request: unknown) => {
      const result = validateFilePathRequestSchema.safeParse(request);
      if (!result.success) {
        return {
          success: false,
          error: result.error.errors[0]?.message ?? "バリデーションエラー",
        };
      }

      const { filePath } = result.data;
      const pathValidation = validatePath(filePath);

      if (!pathValidation.valid) {
        return {
          success: true,
          data: {
            valid: false,
            exists: false,
            isFile: false,
            isDirectory: false,
            error: pathValidation.error,
          },
        };
      }

      try {
        const stats = await fs.stat(filePath);
        return {
          success: true,
          data: {
            valid: true,
            exists: true,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
          },
        };
      } catch (error) {
        return {
          success: true,
          data: {
            valid: true,
            exists: false,
            isFile: false,
            isDirectory: false,
          },
        };
      }
    },
  );
}

/**
 * ファイルメタ情報を取得するヘルパー関数
 */
async function getFileMetadata(filePath: string): Promise<SelectedFile> {
  const stats = await fs.stat(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType =
    EXTENSION_TO_MIME[ext.slice(1)] ?? "application/octet-stream";

  return {
    id: uuidv4(),
    path: filePath,
    name: path.basename(filePath),
    extension: ext,
    size: stats.size,
    mimeType,
    lastModified: stats.mtime.toISOString(),
    createdAt: new Date().toISOString(),
  };
}
```

### 5.3 ハンドラ登録

```typescript
// apps/desktop/src/main/ipc/index.ts に追加
import { registerFileSelectionHandlers } from "./fileSelectionHandlers";

export function registerAllHandlers(): void {
  // ... 既存のハンドラ登録
  registerFileSelectionHandlers();
}
```

---

## 6. エラーハンドリング

### 6.1 エラーコード体系

| エラーコード           | 説明                  | 対処                       |
| ---------------------- | --------------------- | -------------------------- |
| `VALIDATION_ERROR`     | Zodバリデーション失敗 | リクエストパラメータを確認 |
| `PATH_TRAVERSAL_ERROR` | パストラバーサル検出  | 不正なパスを拒否           |
| `ACCESS_DENIED`        | アクセス権限なし      | 許可ディレクトリ外         |
| `FILE_NOT_FOUND`       | ファイルが存在しない  | パスを再確認               |
| `DIALOG_CANCELED`      | ユーザーがキャンセル  | 正常終了として扱う         |
| `UNKNOWN_ERROR`        | 予期しないエラー      | ログ記録・再試行           |

### 6.2 エラーレスポンス形式

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code?: string; // オプション：エラーコード
  details?: unknown; // オプション：詳細情報
}
```

---

## 7. セキュリティ考慮事項

### 7.1 contextBridgeの設定

```typescript
// BrowserWindow設定
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false, // 必須: Node.js APIを無効化
    contextIsolation: true, // 必須: コンテキスト分離
    sandbox: true, // 推奨: サンドボックス化
    preload: path.join(__dirname, "preload.js"),
  },
});
```

### 7.2 入力検証

| 項目               | 検証内容                                       |
| ------------------ | ---------------------------------------------- |
| パス文字列         | 空文字禁止、最大1000文字、パストラバーサル検出 |
| フィルターカテゴリ | 列挙値のみ許可                                 |
| ファイルパス配列   | 最大100件まで                                  |
| カスタムフィルター | 最大10件、各フィルターの拡張子最大20件         |

### 7.3 許可ディレクトリ

```typescript
// 既存のvalidation.tsパターンを使用
const allowedPaths = [
  app.getPath("documents"),
  app.getPath("downloads"),
  app.getPath("pictures"),
  app.getPath("music"),
  app.getPath("videos"),
  app.getPath("home"),
];
```

### 7.4 パストラバーサル対策（CRITICAL）

> ⚠️ **レビュー指摘対応**: SEC-MAJOR-1

ファイルパスに対するパストラバーサル攻撃を防止する。

#### 実装要件

```typescript
// apps/desktop/src/main/ipc/utils/path-validator.ts
import * as path from "path";
import * as fs from "fs/promises";
import { app } from "electron";

/**
 * 許可されたディレクトリのリスト
 */
const ALLOWED_DIRECTORIES = [
  app.getPath("home"),
  app.getPath("documents"),
  app.getPath("downloads"),
  app.getPath("pictures"),
  app.getPath("music"),
  app.getPath("videos"),
  app.getPath("desktop"),
];

/**
 * パストラバーサル攻撃を検出し、安全なパスかどうかを検証
 */
export async function validateFilePath(
  filePath: string,
): Promise<{ valid: boolean; error?: string; normalizedPath?: string }> {
  // 1. 空文字チェック
  if (!filePath || filePath.trim() === "") {
    return { valid: false, error: "ファイルパスが空です" };
  }

  // 2. 正規化
  const normalized = path.normalize(filePath);

  // 3. パストラバーサル検出（正規化後も ".." が含まれていないことを確認）
  if (normalized.includes("..")) {
    return {
      valid: false,
      error: "不正なパスです（ディレクトリトラバーサルは許可されていません）",
    };
  }

  // 4. 絶対パスに変換
  const absolutePath = path.resolve(normalized);

  // 5. シンボリックリンクを解決して実際のパスを取得
  let realPath: string;
  try {
    realPath = await fs.realpath(absolutePath);
  } catch (error) {
    // ファイルが存在しない場合は absolutePath をそのまま使用
    realPath = absolutePath;
  }

  // 6. 許可ディレクトリ内かチェック
  const isAllowed = ALLOWED_DIRECTORIES.some((allowedDir) =>
    realPath.startsWith(allowedDir),
  );

  if (!isAllowed) {
    return {
      valid: false,
      error: "許可されていないディレクトリへのアクセスです",
    };
  }

  return { valid: true, normalizedPath: realPath };
}

/**
 * defaultPathの検証（ダイアログ表示前）
 */
export function validateDefaultPath(defaultPath: string | undefined): boolean {
  if (!defaultPath) return true;

  const normalized = path.normalize(defaultPath);

  // パストラバーサル検出
  if (normalized.includes("..")) {
    return false;
  }

  // 許可ディレクトリ内かチェック
  const absolutePath = path.resolve(normalized);
  return ALLOWED_DIRECTORIES.some((dir) => absolutePath.startsWith(dir));
}
```

#### Zodスキーマへの統合

```typescript
// packages/shared/src/schemas/file-selection.schema.ts
import { z } from "zod";

/**
 * パストラバーサルを検出するカスタムバリデーション
 */
const pathTraversalCheck = (val: string) => {
  const normalized = val.replace(/\\/g, "/"); // Windows対応
  return !normalized.includes("..") && !normalized.includes("./");
};

export const filePathSchema = z
  .string()
  .min(1, { message: "ファイルパスは必須です" })
  .max(1000, { message: "ファイルパスは1000文字以内です" })
  .refine(pathTraversalCheck, {
    message: "不正なパスです（ディレクトリトラバーサルは許可されていません）",
  });
```

### 7.5 IPC送信元検証

> ⚠️ **レビュー指摘対応**: SEC-M1

すべてのIPCハンドラで送信元の検証を行う。

#### 実装要件

```typescript
// apps/desktop/src/main/ipc/utils/sender-validator.ts
import { IpcMainInvokeEvent } from "electron";

/**
 * 許可された送信元URLのパターン
 */
const ALLOWED_SENDER_PATTERNS = [
  /^file:\/\//,
  /^app:\/\//,
  /^http:\/\/localhost(:\d+)?/,
];

/**
 * IPC呼び出しの送信元を検証
 */
export function validateSender(event: IpcMainInvokeEvent): {
  valid: boolean;
  error?: string;
} {
  const senderURL = event.sender.getURL();

  // 開発環境での localhost を許可
  const isAllowed = ALLOWED_SENDER_PATTERNS.some((pattern) =>
    pattern.test(senderURL),
  );

  if (!isAllowed) {
    console.error(`Unauthorized IPC call from: ${senderURL}`);
    return {
      valid: false,
      error: "Unauthorized IPC call from external source",
    };
  }

  return { valid: true };
}
```

#### ハンドラへの適用

```typescript
// apps/desktop/src/main/ipc/fileSelectionHandlers.ts
import { validateSender } from "./utils/sender-validator";

ipcMain.handle(
  IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG,
  async (event, request: unknown) => {
    // 送信元検証（全ハンドラの最初に実行）
    const senderValidation = validateSender(event);
    if (!senderValidation.valid) {
      return { success: false, error: senderValidation.error };
    }

    // 以降の処理...
  },
);
```

### 7.6 ファイル拡張子サニタイゼーション

> ⚠️ **レビュー指摘対応**: SEC-M2

危険なファイル拡張子をフィルタリングする。

#### 実装要件

```typescript
// apps/desktop/src/main/ipc/utils/extension-validator.ts

/**
 * 危険な拡張子のブラックリスト
 * 実行可能ファイルや潜在的に危険なファイル形式
 */
export const DANGEROUS_EXTENSIONS = [
  // Windows実行ファイル
  "exe",
  "bat",
  "cmd",
  "com",
  "scr",
  "pif",
  "msi",
  "msp",
  // スクリプト
  "vbs",
  "vbe",
  "js",
  "jse",
  "wsf",
  "wsh",
  "ps1",
  "psm1",
  // macOS
  "app",
  "command",
  // Linux
  "sh",
  "bash",
  "run",
  // その他
  "reg",
  "inf",
  "scf",
  "lnk",
  "deb",
  "rpm",
  "pkg",
] as const;

/**
 * 拡張子が安全かどうかを検証
 */
export function isExtensionSafe(extension: string): boolean {
  const normalized = extension.toLowerCase().replace(/^\./, "");
  return !DANGEROUS_EXTENSIONS.includes(
    normalized as (typeof DANGEROUS_EXTENSIONS)[number],
  );
}

/**
 * 拡張子フォーマットを検証（英数字のみ）
 */
export function isValidExtensionFormat(extension: string): boolean {
  const normalized = extension.replace(/^\./, "");
  return /^[a-zA-Z0-9]+$/.test(normalized);
}
```

#### Zodスキーマへの統合

```typescript
// packages/shared/src/schemas/file-selection.schema.ts

/**
 * カスタムファイルフィルター（危険な拡張子を除外）
 */
export const dialogFileFilterSchema = z.object({
  name: z.string().max(50, { message: "フィルター名は50文字以内です" }),
  extensions: z
    .array(
      z
        .string()
        .regex(/^[a-zA-Z0-9]+$/, { message: "拡張子は英数字のみです" })
        .max(10)
        .refine(
          (ext) => !DANGEROUS_EXTENSIONS.includes(ext.toLowerCase() as any),
          {
            message:
              "セキュリティ上の理由により、この拡張子は許可されていません",
          },
        ),
    )
    .max(20, { message: "拡張子は20個までです" }),
});
```

### 7.7 レート制限

> ℹ️ **レビュー推奨事項**: DoS攻撃対策

IPCハンドラへの過剰なリクエストを制限する。

#### 実装要件

```typescript
// apps/desktop/src/main/ipc/utils/rate-limiter.ts

interface RateLimitEntry {
  calls: number[];
}

export class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();

  constructor(
    private maxCalls: number = 10,
    private windowMs: number = 1000,
  ) {}

  /**
   * リクエストが許可されるかどうかを判定
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key) || { calls: [] };

    // 古いエントリを削除
    entry.calls = entry.calls.filter((time) => now - time < this.windowMs);

    if (entry.calls.length >= this.maxCalls) {
      return false;
    }

    entry.calls.push(now);
    this.limits.set(key, entry);
    return true;
  }

  /**
   * 定期的なクリーンアップ
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      entry.calls = entry.calls.filter((time) => now - time < this.windowMs);
      if (entry.calls.length === 0) {
        this.limits.delete(key);
      }
    }
  }
}

// シングルトンインスタンス
export const fileSelectionRateLimiter = new RateLimiter(10, 1000);
```

#### ハンドラへの適用

```typescript
// 各ハンドラの先頭でレート制限をチェック
const rateLimitKey = `${event.sender.id}:${IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG}`;
if (!fileSelectionRateLimiter.isAllowed(rateLimitKey)) {
  return {
    success: false,
    error: "リクエストが多すぎます。しばらく待ってから再試行してください",
  };
}
```

### 7.8 セキュリティ監査ログ

> ℹ️ **レビュー推奨事項**: 監査証跡

ファイル操作の監査ログを記録する。

#### 実装要件

```typescript
// apps/desktop/src/main/ipc/utils/audit-logger.ts
import { app } from "electron";
import * as fs from "fs/promises";
import * as path from "path";

const AUDIT_LOG_PATH = path.join(app.getPath("logs"), "file-operations.log");

interface AuditEntry {
  timestamp: string;
  operation: string;
  senderId: number;
  senderURL: string;
  request: unknown;
  result: "success" | "error";
  error?: string;
}

/**
 * 監査ログを記録
 */
export async function auditLog(
  entry: Omit<AuditEntry, "timestamp">,
): Promise<void> {
  const logEntry: AuditEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  const logLine = JSON.stringify(logEntry) + "\n";

  try {
    await fs.appendFile(AUDIT_LOG_PATH, logLine, "utf8");
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
```

---

## 8. パフォーマンス考慮事項

### 8.1 並列処理

複数ファイルのメタ情報取得時は `Promise.allSettled()` で並列処理。

### 8.2 タイムアウト設定

```typescript
// 大量ファイル選択時のタイムアウト
const METADATA_TIMEOUT = 30000; // 30秒

// AbortControllerを使用したタイムアウト実装
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), METADATA_TIMEOUT);

try {
  const result = await getMultipleMetadata(request, {
    signal: controller.signal,
  });
  return result;
} finally {
  clearTimeout(timeoutId);
}
```

---

## 9. テスト設計

### 9.1 テストファイル

**パス**: `apps/desktop/src/main/ipc/fileSelectionHandlers.test.ts`

### 9.2 テストケース

| テストケース                           | 説明                           |
| -------------------------------------- | ------------------------------ |
| `正常系：ダイアログが開く`             | openDialogが正常に動作         |
| `正常系：メタ情報取得`                 | 存在するファイルのメタ情報取得 |
| `異常系：不正なパス`                   | パストラバーサルで拒否         |
| `異常系：存在しないファイル`           | FILE_NOT_FOUNDエラー           |
| `異常系：許可されていないディレクトリ` | ACCESS_DENIEDエラー            |
| `並列処理：複数ファイル`               | 一部失敗でも他は成功           |

---

## 10. 完了条件チェックリスト

- [x] IPCチャネル名が定義されている
- [x] リクエスト/レスポンス形式が定義されている
- [x] contextBridge APIが設計されている
- [x] エラーハンドリングが設計されている
- [x] セキュリティ考慮が文書化されている

---

## 11. 承認

| 役割             | 名前                | 日付       | 承認状況 |
| ---------------- | ------------------- | ---------- | -------- |
| IPC設計者        | .claude/agents/electron-architect.md | 2025-12-16 | 作成済み |
| セキュリティ確認 | .claude/agents/electron-security.md  |            | 未承認   |
| 最終承認者       |                     |            | 未承認   |

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 変更者              |
| ---------- | ---------- | -------- | ------------------- |
| 1.0        | 2025-12-16 | 初版作成 | .claude/agents/electron-architect.md |
