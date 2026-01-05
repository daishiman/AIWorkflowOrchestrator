# チャット履歴エクスポート機能 - Electron IPC設計書

---

title: Electron IPCエクスポート設計書
version: 1.0.0
author: .claude/agents/electron-architect.md
created: 2025-12-22
status: draft
parent_task: T-01-4

---

## 1. 概要

### 1.1 目的

チャット履歴エクスポート機能で必要なElectron IPCハンドラーを設計し、レンダラープロセスからファイル保存ダイアログとファイル書き込みを安全に実行できるようにする。

### 1.2 スコープ

- **ファイル保存ダイアログ**: `dialog.showSaveDialog`のラッパー
- **ファイル書き込み**: `fs.writeFile`の安全なラッパー
- **エラーハンドリング**: ファイルシステムエラーの適切な処理
- **セキュリティ**: パストラバーサル攻撃の防止

### 1.3 設計原則

- **最小権限の原則**: レンダラーは必要最小限のファイルシステムアクセスのみ
- **型安全性**: TypeScriptによる厳密な型定義
- **エラーの明確化**: エラーコードとメッセージの標準化

---

## 2. IPC API仕様

### 2.1 ファイル保存ダイアログ

#### 2.1.1 チャネル名

```typescript
const CHANNEL_SHOW_SAVE_DIALOG = "dialog:showSaveDialog";
```

#### 2.1.2 リクエスト型

```typescript
interface ShowSaveDialogOptions {
  /** ダイアログのタイトル */
  title?: string;
  /** デフォルトのファイル名（パス含む） */
  defaultPath?: string;
  /** ボタンラベル（macOS） */
  buttonLabel?: string;
  /** ファイルフィルター */
  filters?: FileFilter[];
  /** メッセージ（macOS） */
  message?: string;
  /** 名前フィールドラベル（macOS） */
  nameFieldLabel?: string;
  /** 拡張子を表示するか（macOS） */
  showsTagField?: boolean;
  /** プロパティ */
  properties?: Array<
    | "showHiddenFiles"
    | "createDirectory"
    | "treatPackageAsDirectory"
    | "showOverwriteConfirmation"
  >;
}

interface FileFilter {
  /** フィルター名（例: "Markdown"） */
  name: string;
  /** 拡張子リスト（例: ["md"]） */
  extensions: string[];
}
```

#### 2.1.3 レスポンス型

```typescript
interface ShowSaveDialogResult {
  /** ダイアログがキャンセルされたか */
  canceled: boolean;
  /** 選択されたファイルパス（キャンセル時はundefined） */
  filePath?: string;
  /** Bookmarkデータ（macOSのみ） */
  bookmark?: string;
}
```

#### 2.1.4 使用例

```typescript
// レンダラープロセス
const result = await window.electron.dialog.showSaveDialog({
  title: "エクスポート",
  defaultPath: "React開発についての質問.md",
  filters: [
    { name: "Markdown", extensions: ["md"] },
    { name: "すべてのファイル", extensions: ["*"] },
  ],
  properties: ["showOverwriteConfirmation", "createDirectory"],
});

if (!result.canceled && result.filePath) {
  console.log("保存先:", result.filePath);
}
```

### 2.2 ファイル書き込み

#### 2.2.1 チャネル名

```typescript
const CHANNEL_WRITE_FILE = "fs:writeFile";
```

#### 2.2.2 リクエスト型

```typescript
interface WriteFileOptions {
  /** ファイルパス（絶対パス） */
  filePath: string;
  /** 書き込むコンテンツ */
  content: string;
  /** エンコーディング */
  encoding?: BufferEncoding;
}
```

#### 2.2.3 レスポンス型

```typescript
interface WriteFileResult {
  /** 成功したか */
  success: boolean;
  /** 書き込んだバイト数 */
  bytesWritten: number;
  /** エラー（失敗時） */
  error?: FileSystemError;
}

interface FileSystemError {
  /** エラーコード（例: "EACCES", "ENOSPC"） */
  code: string;
  /** エラーメッセージ */
  message: string;
  /** ファイルパス */
  path: string;
}
```

#### 2.2.4 使用例

```typescript
// レンダラープロセス
const result = await window.electron.fs.writeFile({
  filePath: "/Users/john/Documents/React開発についての質問.md",
  content: "# React開発についての質問\n\n...",
  encoding: "utf-8",
});

if (result.success) {
  console.log(`${result.bytesWritten} バイト書き込み成功`);
} else {
  console.error("書き込み失敗:", result.error?.message);
}
```

---

## 3. Preloadスクリプト実装

### 3.1 型定義 (`apps/desktop/src/preload/types.ts`)

```typescript
/**
 * Electron APIの型定義
 */
export interface ElectronAPI {
  dialog: {
    showSaveDialog: (
      options: ShowSaveDialogOptions,
    ) => Promise<ShowSaveDialogResult>;
  };
  fs: {
    writeFile: (options: WriteFileOptions) => Promise<WriteFileResult>;
  };
}

// Window型の拡張
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
```

### 3.2 Preload実装 (`apps/desktop/src/preload/index.ts`)

```typescript
import { contextBridge, ipcRenderer } from "electron";
import type {
  ElectronAPI,
  ShowSaveDialogOptions,
  ShowSaveDialogResult,
  WriteFileOptions,
  WriteFileResult,
} from "./types";

const electronAPI: ElectronAPI = {
  dialog: {
    showSaveDialog: async (
      options: ShowSaveDialogOptions,
    ): Promise<ShowSaveDialogResult> => {
      return await ipcRenderer.invoke("dialog:showSaveDialog", options);
    },
  },
  fs: {
    writeFile: async (options: WriteFileOptions): Promise<WriteFileResult> => {
      return await ipcRenderer.invoke("fs:writeFile", options);
    },
  },
};

// レンダラープロセスにAPIを公開
contextBridge.exposeInMainWorld("electron", electronAPI);
```

---

## 4. メインプロセス実装

### 4.1 IPCハンドラーの登録 (`apps/desktop/src/main/ipc/handlers.ts`)

```typescript
import { ipcMain, dialog, BrowserWindow } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import type {
  ShowSaveDialogOptions,
  ShowSaveDialogResult,
  WriteFileOptions,
  WriteFileResult,
  FileSystemError,
} from "../../preload/types";

/**
 * IPCハンドラーの初期化
 */
export function initializeIpcHandlers(): void {
  registerDialogHandlers();
  registerFileSystemHandlers();
}

/**
 * ダイアログハンドラーの登録
 */
function registerDialogHandlers(): void {
  ipcMain.handle(
    "dialog:showSaveDialog",
    async (
      event,
      options: ShowSaveDialogOptions,
    ): Promise<ShowSaveDialogResult> => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) {
        throw new Error("BrowserWindow not found");
      }

      // Electron APIを呼び出し
      const result = await dialog.showSaveDialog(window, {
        title: options.title,
        defaultPath: options.defaultPath,
        buttonLabel: options.buttonLabel,
        filters: options.filters,
        message: options.message,
        nameFieldLabel: options.nameFieldLabel,
        showsTagField: options.showsTagField,
        properties: options.properties,
      });

      return {
        canceled: result.canceled,
        filePath: result.filePath,
        bookmark: result.bookmark,
      };
    },
  );
}

/**
 * ファイルシステムハンドラーの登録
 */
function registerFileSystemHandlers(): void {
  ipcMain.handle(
    "fs:writeFile",
    async (event, options: WriteFileOptions): Promise<WriteFileResult> => {
      try {
        // セキュリティ検証
        validateFilePath(options.filePath);

        // ファイル書き込み
        const encoding = options.encoding ?? "utf-8";
        await fs.writeFile(options.filePath, options.content, { encoding });

        // 書き込んだバイト数を取得
        const stats = await fs.stat(options.filePath);

        return {
          success: true,
          bytesWritten: stats.size,
        };
      } catch (error) {
        const fsError = error as NodeJS.ErrnoException;
        return {
          success: false,
          bytesWritten: 0,
          error: {
            code: fsError.code ?? "UNKNOWN",
            message: fsError.message,
            path: options.filePath,
          },
        };
      }
    },
  );
}

/**
 * ファイルパスのセキュリティ検証
 * パストラバーサル攻撃を防ぐ
 */
function validateFilePath(filePath: string): void {
  // 絶対パスでない場合はエラー
  if (!path.isAbsolute(filePath)) {
    throw new Error("Relative paths are not allowed");
  }

  // パストラバーサルパターンのチェック
  const normalizedPath = path.normalize(filePath);
  if (normalizedPath !== filePath) {
    throw new Error("Path traversal detected");
  }

  // 禁止ディレクトリへのアクセスをブロック（例: システムディレクトリ）
  const forbiddenPaths = [
    "/System",
    "/Library",
    "C:\\Windows",
    "C:\\Program Files",
  ];

  for (const forbidden of forbiddenPaths) {
    if (normalizedPath.startsWith(forbidden)) {
      throw new Error(`Access to ${forbidden} is forbidden`);
    }
  }
}
```

### 4.2 アプリ初期化時の登録 (`apps/desktop/src/main/index.ts`)

```typescript
import { app } from "electron";
import { initializeIpcHandlers } from "./ipc/handlers";

app.whenReady().then(() => {
  // IPCハンドラーの初期化
  initializeIpcHandlers();

  // その他の初期化処理...
});
```

---

## 5. エラーハンドリング

### 5.1 エラーコード一覧

| エラーコード | 説明                              | 原因                                       | 対処方法               |
| ------------ | --------------------------------- | ------------------------------------------ | ---------------------- |
| `EACCES`     | 権限エラー                        | ファイルへの書き込み権限がない             | 保存先を変更           |
| `ENOSPC`     | ディスク容量不足                  | ディスクの空き容量が不足                   | 空き容量を確保         |
| `ENOENT`     | ファイル/ディレクトリが存在しない | 親ディレクトリが存在しない                 | ディレクトリを作成     |
| `EISDIR`     | ディレクトリに書き込もうとした    | filePathがディレクトリ                     | ファイルパスを修正     |
| `EROFS`      | 読み取り専用ファイルシステム      | 読み取り専用のボリュームに書き込もうとした | 保存先を変更           |
| `UNKNOWN`    | 不明なエラー                      | その他のエラー                             | エラーメッセージを確認 |

### 5.2 エラーメッセージのローカライゼーション

```typescript
/**
 * エラーコードから人間が読めるメッセージを生成
 */
export function getErrorMessage(error: FileSystemError): string {
  switch (error.code) {
    case "EACCES":
      return `ファイル '${error.path}' への書き込み権限がありません。保存先を変更してください。`;
    case "ENOSPC":
      return "ディスク容量が不足しています。空き容量を確保してから再度お試しください。";
    case "ENOENT":
      return `保存先のディレクトリが存在しません。ディレクトリを作成してから再度お試しください。`;
    case "EISDIR":
      return `指定されたパス '${error.path}' はディレクトリです。ファイル名を指定してください。`;
    case "EROFS":
      return "読み取り専用のボリュームです。別の場所に保存してください。";
    default:
      return `ファイルの保存に失敗しました: ${error.message}`;
  }
}
```

---

## 6. セキュリティ考慮事項

### 6.1 脅威モデル

| 脅威                      | リスク                   | 対策                         |
| ------------------------- | ------------------------ | ---------------------------- |
| パストラバーサル攻撃      | システムファイルの上書き | `validateFilePath`による検証 |
| 任意のファイル読み取り    | 機密情報の漏洩           | 読み取りAPIは提供しない      |
| XSSによるファイル書き込み | 任意のファイル作成       | CSP設定、サンドボックス化    |
| コード実行                | 実行ファイルの作成       | 拡張子の制限（オプション）   |

### 6.2 セキュリティ設定

#### 6.2.1 BrowserWindowのセキュリティ設定

```typescript
// apps/desktop/src/main/window.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, "../preload/index.js"),
    contextIsolation: true, // ✅ コンテキスト分離有効
    nodeIntegration: false, // ✅ Node.js統合無効
    sandbox: true, // ✅ サンドボックス有効
  },
});
```

#### 6.2.2 CSP (Content Security Policy)

```typescript
// apps/desktop/src/main/window.ts
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      "Content-Security-Policy": [
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
      ],
    },
  });
});
```

---

## 7. テスト戦略

### 7.1 単体テスト (Vitest)

```typescript
// apps/desktop/src/main/ipc/handlers.test.ts
import { describe, it, expect, vi } from "vitest";
import * as fs from "fs/promises";
import { validateFilePath } from "./handlers";

describe("validateFilePath", () => {
  it("絶対パスは許可される", () => {
    expect(() => validateFilePath("/Users/john/test.md")).not.toThrow();
  });

  it("相対パスは拒否される", () => {
    expect(() => validateFilePath("../test.md")).toThrow(
      "Relative paths are not allowed",
    );
  });

  it("パストラバーサルは拒否される", () => {
    expect(() => validateFilePath("/Users/john/../../../etc/passwd")).toThrow(
      "Path traversal detected",
    );
  });

  it("システムディレクトリへのアクセスは拒否される", () => {
    expect(() => validateFilePath("/System/Library/test.md")).toThrow(
      "Access to /System is forbidden",
    );
  });
});

describe("fs:writeFile handler", () => {
  it("ファイル書き込みが成功する", async () => {
    const mockWriteFile = vi
      .spyOn(fs, "writeFile")
      .mockResolvedValue(undefined);
    const mockStat = vi
      .spyOn(fs, "stat")
      .mockResolvedValue({ size: 1234 } as any);

    // ... handler呼び出しのテスト

    expect(mockWriteFile).toHaveBeenCalledWith(
      "/Users/john/test.md",
      "content",
      { encoding: "utf-8" },
    );
    expect(mockStat).toHaveBeenCalledWith("/Users/john/test.md");
  });
});
```

### 7.2 E2Eテスト (Playwright)

```typescript
// apps/desktop/e2e/electron-ipc.spec.ts
import { test, expect } from "@playwright/test";

test("ファイル保存ダイアログが開く", async ({ page }) => {
  // Electron APIのモック
  await page.evaluate(() => {
    window.electron = {
      dialog: {
        showSaveDialog: async (options) => ({
          canceled: false,
          filePath: "/Users/john/test.md",
        }),
      },
      fs: {
        writeFile: async (options) => ({
          success: true,
          bytesWritten: 1234,
        }),
      },
    };
  });

  // エクスポート実行
  await page.goto("/chat/history/session-id");
  await page.getByRole("button", { name: /エクスポート/i }).click();
  await page.getByRole("button", { name: /ダウンロード/i }).click();

  // 成功通知の確認
  await expect(page.getByText(/エクスポートが完了しました/i)).toBeVisible();
});
```

---

## 8. パフォーマンス最適化

### 8.1 大きなファイルの処理

**問題**: 数MBを超えるチャット履歴のエクスポート時、メモリ使用量が増加する。

**対策**: ストリーミング書き込みを使用

```typescript
import { createWriteStream } from "fs";

ipcMain.handle("fs:writeFileStream", async (event, options) => {
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(options.filePath, { encoding: "utf-8" });

    stream.on("finish", () => {
      resolve({ success: true, bytesWritten: stream.bytesWritten });
    });

    stream.on("error", (error) => {
      reject(error);
    });

    // チャンクごとに書き込み
    for (const chunk of options.chunks) {
      stream.write(chunk);
    }

    stream.end();
  });
});
```

### 8.2 バックグラウンド処理

**問題**: 大きなファイルの書き込み中、UIがフリーズする。

**対策**: Worker Threadsを使用

```typescript
import { Worker } from "worker_threads";

ipcMain.handle("fs:writeFileAsync", async (event, options) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./file-writer.worker.js", {
      workerData: options,
    });

    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
});
```

---

## 9. デバッグとロギング

### 9.1 IPCログの記録

```typescript
import { ipcMain } from "electron";
import * as log from "electron-log";

// すべてのIPCメッセージをログに記録
ipcMain.on("*", (event, ...args) => {
  log.info(`[IPC] ${event.type}:`, args);
});

// ハンドラーでのエラーログ
ipcMain.handle("fs:writeFile", async (event, options) => {
  try {
    // ... 実装
  } catch (error) {
    log.error("[IPC] fs:writeFile failed:", error);
    throw error;
  }
});
```

### 9.2 開発者ツールでのデバッグ

```typescript
// レンダラープロセス（開発環境のみ）
if (process.env.NODE_ENV === "development") {
  console.log("[Electron API] Calling showSaveDialog:", options);
  const result = await window.electron.dialog.showSaveDialog(options);
  console.log("[Electron API] showSaveDialog result:", result);
}
```

---

## 10. 実装チェックリスト

- [ ] Preloadスクリプトでの型定義追加
- [ ] `dialog:showSaveDialog` ハンドラーの実装
- [ ] `fs:writeFile` ハンドラーの実装
- [ ] `validateFilePath` セキュリティ検証の実装
- [ ] エラーメッセージのローカライゼーション
- [ ] BrowserWindowのセキュリティ設定確認
- [ ] CSP設定の適用
- [ ] 単体テストの作成
- [ ] E2Eテストの作成
- [ ] ログ記録の実装
- [ ] パフォーマンステスト（大きなファイル）

---

## 11. 依存関係

### 11.1 前提タスク

- **T-01-2**: UI/UX設計書完成
- **T-01-3**: 受け入れ基準書完成

### 11.2 後続タスク

- **T-02-1**: 設計レビュー（T-01-4を含む）
- **T-03-4**: エクスポートUI統合テスト作成
- **T-04-5**: エクスポート機能UI統合実装

---

## 12. 参照ドキュメント

- [Electron IPC Documentation](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [Node.js File System API](https://nodejs.org/api/fs.html)
- [UI統合設計書](./ui-integration-design.md)

---

## 13. 変更履歴

| バージョン | 日付       | 変更内容                        | 変更者                               |
| ---------- | ---------- | ------------------------------- | ------------------------------------ |
| 1.0.0      | 2025-12-22 | 初版作成 - T-01-4タスクの成果物 | .claude/agents/electron-architect.md |
