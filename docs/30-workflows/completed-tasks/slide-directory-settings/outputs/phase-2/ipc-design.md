# IPC通信インターフェース設計書 - スライド出力ディレクトリ設定

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| タスク     | T-02-2                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |
| ステータス | 完了                     |

---

## IPCチャンネル定義

### チャンネル定数（ホワイトリスト方式）

**ファイル**: `apps/desktop/src/preload/channels.ts`

```typescript
export const IPC_CHANNELS = {
  // ... 既存チャンネル ...

  // Slide Settings operations（新規追加）
  SLIDE_SETTINGS_GET_DIRECTORY: "slideSettings:getDirectory",
  SLIDE_SETTINGS_SET_DIRECTORY: "slideSettings:setDirectory",
  SLIDE_SETTINGS_SELECT_DIRECTORY: "slideSettings:selectDirectory",
  SLIDE_SETTINGS_VALIDATE_DIRECTORY: "slideSettings:validateDirectory",
  SLIDE_SETTINGS_GET_ALL: "slideSettings:getAllSettings",
} as const;
```

### ホワイトリスト追加

```typescript
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存チャンネル ...

  // Slide Settings channels
  IPC_CHANNELS.SLIDE_SETTINGS_GET_DIRECTORY,
  IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
  IPC_CHANNELS.SLIDE_SETTINGS_SELECT_DIRECTORY,
  IPC_CHANNELS.SLIDE_SETTINGS_VALIDATE_DIRECTORY,
  IPC_CHANNELS.SLIDE_SETTINGS_GET_ALL,
];
```

---

## IPC型定義

### リクエスト/レスポンス型

**ファイル**: `apps/desktop/src/preload/types.ts`

```typescript
// Result型（既存パターンに準拠）
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Slide Settings 関連型
export interface SlideSettings {
  outputDirectory: string;
  autoCreateDirectory: boolean;
  defaultTheme: "kanagawa";
  schemaVersion: number;
}

export interface ValidationResult {
  status: "valid" | "warning" | "error";
  message: string;
  details?: {
    exists: boolean;
    writable: boolean;
    isAbsolute: boolean;
  };
}

// リクエスト型
export interface SetDirectoryRequest {
  path: string;
  autoCreate?: boolean;
}

export interface ValidateDirectoryRequest {
  path: string;
}

// レスポンス型
export type GetDirectoryResponse = Result<string>;
export type SetDirectoryResponse = Result<void>;
export type SelectDirectoryResponse = Result<string | null>;
export type ValidateDirectoryResponse = Result<ValidationResult>;
export type GetAllSettingsResponse = Result<SlideSettings>;
```

---

## Preload API設計

### slideSettingsAPI インターフェース

**ファイル**: `apps/desktop/src/preload/index.ts`

```typescript
// SlideSettings API型定義
export interface SlideSettingsAPI {
  /** 現在の出力ディレクトリを取得 */
  getDirectory: () => Promise<GetDirectoryResponse>;

  /** 出力ディレクトリを設定 */
  setDirectory: (request: SetDirectoryRequest) => Promise<SetDirectoryResponse>;

  /** OS標準ダイアログでディレクトリを選択 */
  selectDirectory: () => Promise<SelectDirectoryResponse>;

  /** ディレクトリパスの有効性を検証 */
  validateDirectory: (
    request: ValidateDirectoryRequest,
  ) => Promise<ValidateDirectoryResponse>;

  /** 全設定を取得 */
  getAllSettings: () => Promise<GetAllSettingsResponse>;
}

// ElectronAPI拡張
export interface ElectronAPI {
  // ... 既存API ...

  slideSettings: SlideSettingsAPI;
}
```

### Preload実装

```typescript
// apps/desktop/src/preload/index.ts
const slideSettingsAPI: SlideSettingsAPI = {
  getDirectory: () =>
    safeInvoke<GetDirectoryResponse>(IPC_CHANNELS.SLIDE_SETTINGS_GET_DIRECTORY),

  setDirectory: (request: SetDirectoryRequest) =>
    safeInvoke<SetDirectoryResponse>(
      IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
      request,
    ),

  selectDirectory: () =>
    safeInvoke<SelectDirectoryResponse>(
      IPC_CHANNELS.SLIDE_SETTINGS_SELECT_DIRECTORY,
    ),

  validateDirectory: (request: ValidateDirectoryRequest) =>
    safeInvoke<ValidateDirectoryResponse>(
      IPC_CHANNELS.SLIDE_SETTINGS_VALIDATE_DIRECTORY,
      request,
    ),

  getAllSettings: () =>
    safeInvoke<GetAllSettingsResponse>(IPC_CHANNELS.SLIDE_SETTINGS_GET_ALL),
};

// contextBridge公開
const electronAPI: ElectronAPI = {
  // ... 既存API ...
  slideSettings: slideSettingsAPI,
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
```

---

## Main Process ハンドラー設計

### ファイル構成

```
apps/desktop/src/main/ipc/
└── slideSettingsHandlers.ts    # スライド設定IPCハンドラー
```

### ハンドラー実装パターン

**ファイル**: `apps/desktop/src/main/ipc/slideSettingsHandlers.ts`

```typescript
import { ipcMain, dialog, BrowserWindow } from "electron";
import * as path from "path";
import * as fs from "fs";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  SetDirectoryRequest,
  ValidateDirectoryRequest,
  GetDirectoryResponse,
  SetDirectoryResponse,
  SelectDirectoryResponse,
  ValidateDirectoryResponse,
  GetAllSettingsResponse,
} from "../../preload/types";
import { getSlideSettingsStore } from "../settings/slideSettingsStore";
import {
  validateDirectoryPath,
  createValidationErrorResponse,
} from "./validation";

export function registerSlideSettingsHandlers(mainWindow: BrowserWindow): void {
  // slideSettings:getDirectory
  ipcMain.handle(
    IPC_CHANNELS.SLIDE_SETTINGS_GET_DIRECTORY,
    async (): Promise<GetDirectoryResponse> => {
      try {
        const store = getSlideSettingsStore();
        const directory = store.get("outputDirectory");
        return { success: true, data: directory };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // slideSettings:setDirectory
  ipcMain.handle(
    IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
    async (
      _event,
      request: SetDirectoryRequest,
    ): Promise<SetDirectoryResponse> => {
      try {
        // パスバリデーション
        const validation = validateDirectoryPath(request.path);
        if (!validation.valid) {
          return createValidationErrorResponse(validation.error!);
        }

        const store = getSlideSettingsStore();

        // 自動作成オプション有効時、ディレクトリを作成
        if (request.autoCreate !== false) {
          const expandedPath = expandHomePath(request.path);
          if (!fs.existsSync(expandedPath)) {
            fs.mkdirSync(expandedPath, { recursive: true });
          }
        }

        store.set("outputDirectory", request.path);
        if (request.autoCreate !== undefined) {
          store.set("autoCreateDirectory", request.autoCreate);
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // slideSettings:selectDirectory
  ipcMain.handle(
    IPC_CHANNELS.SLIDE_SETTINGS_SELECT_DIRECTORY,
    async (): Promise<SelectDirectoryResponse> => {
      try {
        const result = await dialog.showOpenDialog(mainWindow, {
          title: "スライド出力ディレクトリを選択",
          properties: ["openDirectory", "createDirectory"],
        });

        if (result.canceled || result.filePaths.length === 0) {
          return { success: true, data: null };
        }

        return { success: true, data: result.filePaths[0] };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // slideSettings:validateDirectory
  ipcMain.handle(
    IPC_CHANNELS.SLIDE_SETTINGS_VALIDATE_DIRECTORY,
    async (
      _event,
      request: ValidateDirectoryRequest,
    ): Promise<ValidateDirectoryResponse> => {
      try {
        const result = await validateDirectoryForSettings(request.path);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // slideSettings:getAllSettings
  ipcMain.handle(
    IPC_CHANNELS.SLIDE_SETTINGS_GET_ALL,
    async (): Promise<GetAllSettingsResponse> => {
      try {
        const store = getSlideSettingsStore();
        const settings = store.store;
        return { success: true, data: settings };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}

// ヘルパー関数
function expandHomePath(inputPath: string): string {
  if (inputPath.startsWith("~")) {
    return path.join(os.homedir(), inputPath.slice(1));
  }
  return inputPath;
}
```

---

## セキュリティ設計

### 1. ホワイトリスト方式

すべてのIPCチャンネルは `ALLOWED_INVOKE_CHANNELS` に登録されている必要があります。

```typescript
// Preload側のsafeInvoke関数による検証
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

### 2. パストラバーサル攻撃防止

**ファイル**: `apps/desktop/src/main/ipc/validation.ts` (拡張)

```typescript
/**
 * スライド設定用ディレクトリパス検証
 */
export function validateDirectoryPath(dirPath: string): {
  valid: boolean;
  error?: string;
} {
  if (!dirPath || typeof dirPath !== "string") {
    return { valid: false, error: "Invalid path: must be a non-empty string" };
  }

  // 空文字チェック
  if (dirPath.trim().length === 0) {
    return { valid: false, error: "Path cannot be empty" };
  }

  // 最大長チェック
  if (dirPath.length > 1000) {
    return { valid: false, error: "Path is too long (max 1000 characters)" };
  }

  // パストラバーサル検出（../ および ..\）
  if (dirPath.includes("..")) {
    return {
      valid: false,
      error: "Invalid path: directory traversal not allowed",
    };
  }

  // URLエンコードされたトラバーサル検出
  if (dirPath.includes("%2e%2e") || dirPath.includes("%2E%2E")) {
    return {
      valid: false,
      error: "Invalid path: encoded traversal not allowed",
    };
  }

  // null文字検出
  if (dirPath.includes("\0")) {
    return {
      valid: false,
      error: "Invalid path: null characters not allowed",
    };
  }

  return { valid: true };
}

/**
 * ディレクトリの詳細検証（存在確認・書き込み権限）
 */
export async function validateDirectoryForSettings(
  dirPath: string,
): Promise<ValidationResult> {
  const pathValidation = validateDirectoryPath(dirPath);
  if (!pathValidation.valid) {
    return {
      status: "error",
      message: pathValidation.error!,
      details: { exists: false, writable: false, isAbsolute: false },
    };
  }

  const expandedPath = expandHomePath(dirPath);
  const isAbsolute = path.isAbsolute(expandedPath);

  if (!isAbsolute && !dirPath.startsWith("~")) {
    return {
      status: "error",
      message: "絶対パスを指定してください",
      details: { exists: false, writable: false, isAbsolute: false },
    };
  }

  const exists = fs.existsSync(expandedPath);

  if (!exists) {
    return {
      status: "warning",
      message: "ディレクトリが存在しません。保存時に作成されます",
      details: { exists: false, writable: true, isAbsolute },
    };
  }

  // 書き込み権限チェック
  try {
    fs.accessSync(expandedPath, fs.constants.W_OK);
    return {
      status: "valid",
      message: "有効なディレクトリです",
      details: { exists: true, writable: true, isAbsolute },
    };
  } catch {
    return {
      status: "error",
      message: "書き込み権限がありません",
      details: { exists: true, writable: false, isAbsolute },
    };
  }
}
```

### 3. Sender検証

```typescript
// Main Process側でのsender検証（必要に応じて追加）
import { validateIpcSender } from "../infrastructure/security/ipc-validator";

ipcMain.handle(
  IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
  async (event, request: SetDirectoryRequest) => {
    // Sender検証
    const senderValidation = validateIpcSender(event);
    if (!senderValidation.valid) {
      return { success: false, error: "Unauthorized sender" };
    }

    // 通常処理...
  },
);
```

### 4. contextIsolation設定

**確認**: `apps/desktop/src/main/index.ts` での BrowserWindow 設定

```typescript
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true, // 必須: true
    nodeIntegration: false, // 必須: false
    sandbox: true, // 推奨: true
    preload: path.join(__dirname, "../preload/index.js"),
  },
});
```

---

## エラーハンドリング

### エラー応答パターン

```typescript
// 成功時
return { success: true, data: result };

// エラー時（バリデーションエラー）
return {
  success: false,
  error: "Validation error: directory traversal not allowed",
};

// エラー時（システムエラー）
return {
  success: false,
  error: error instanceof Error ? error.message : "Unknown error",
};
```

### Renderer側でのエラー処理

```typescript
// useSlideSettings.ts内
const saveSettings = async (settings: Partial<SlideSettings>) => {
  setIsSaving(true);
  setError(null);

  try {
    const result = await window.electronAPI.slideSettings.setDirectory({
      path: settings.outputDirectory!,
      autoCreate: settings.autoCreateDirectory,
    });

    if (!result.success) {
      setError(result.error || "保存に失敗しました");
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "不明なエラー";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setIsSaving(false);
  }
};
```

---

## Window型定義拡張

**ファイル**: `apps/desktop/src/renderer/types/global.d.ts`

```typescript
import type { ElectronAPI, SlideSettingsAPI } from "../../preload/types";

declare global {
  interface Window {
    electronAPI: ElectronAPI & {
      slideSettings: SlideSettingsAPI;
    };
  }
}
```

---

## 完了確認

- [x] IPCチャンネル定義が完了している
- [x] ホワイトリストへの追加が設計されている
- [x] Preload API設計が完了している
- [x] Main Processハンドラー設計が完了している
- [x] セキュリティ要件（ホワイトリスト、パストラバーサル防止、sender検証）が設計に反映されている
- [x] エラーハンドリングパターンが定義されている
- [x] 型定義が完了している
