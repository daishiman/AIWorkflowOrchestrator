/**
 * ファイル選択IPCハンドラ
 *
 * ファイル選択機能のメインプロセス側ハンドラ。
 * セキュリティ対策としてパストラバーサル防止、許可ディレクトリ制限を実装。
 *
 * @see docs/30-workflows/file-selection/step04-ipc-design.md
 */

import { ipcMain, dialog, BrowserWindow, app } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  openFileDialogRequestSchema,
  getFileMetadataRequestSchema,
  getMultipleFileMetadataRequestSchema,
  validateFilePathRequestSchema,
  type FileFilterCategory,
  type DialogFileFilter,
  type SelectedFile,
} from "@repo/shared/schemas";

// =============================================================================
// Constants
// =============================================================================

/** MIMEタイプマッピング */
const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".json": "application/json",
  ".xml": "application/xml",
  ".csv": "text/csv",
  ".html": "text/html",
  ".htm": "text/html",
  ".js": "application/javascript",
  ".ts": "application/typescript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".zip": "application/zip",
  ".rar": "application/vnd.rar",
  ".7z": "application/x-7z-compressed",
};

/** 危険な拡張子リスト (SEC-M2) */
const DANGEROUS_EXTENSIONS = [
  "exe",
  "bat",
  "cmd",
  "com",
  "msi",
  "dll",
  "scr",
  "pif",
  "vbs",
  "ps1",
] as const;

/** レート制限設定 */
const RATE_LIMIT_WINDOW = 1000; // 1秒
const RATE_LIMIT_MAX = 10; // 最大10回

/** レート制限用マップ (senderId -> timestamps) */
const rateLimiter = new Map<number, number[]>();

/** フィルターカテゴリごとの拡張子 */
const FILTER_CATEGORIES: Record<FileFilterCategory, DialogFileFilter | null> = {
  all: null, // すべてのファイル
  office: {
    name: "Office Documents",
    extensions: [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "odt",
      "ods",
      "odp",
    ],
  },
  text: {
    name: "Text Files",
    extensions: ["txt", "md", "json", "xml", "csv", "html", "htm", "js", "ts"],
  },
  media: {
    name: "Media Files",
    extensions: [
      "mp3",
      "wav",
      "mp4",
      "webm",
      "avi",
      "mov",
      "png",
      "jpg",
      "jpeg",
      "gif",
    ],
  },
  image: {
    name: "Image Files",
    extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"],
  },
};

// =============================================================================
// Helpers
// =============================================================================

/**
 * 許可されたディレクトリのリストを取得
 */
function getAllowedDirectories(): string[] {
  return [
    app.getPath("home"),
    app.getPath("documents"),
    app.getPath("downloads"),
    app.getPath("pictures"),
    app.getPath("music"),
    app.getPath("videos"),
    app.getPath("desktop"),
  ];
}

/**
 * パスが許可されたディレクトリ内かチェック
 */
function isPathAllowed(filePath: string): boolean {
  const allowed = getAllowedDirectories();
  return allowed.some(
    (dir) => filePath.startsWith(dir + path.sep) || filePath === dir,
  );
}

/**
 * パストラバーサルを検出
 */
function containsPathTraversal(filePath: string): boolean {
  return filePath.includes("..") || filePath.includes("\\.\\");
}

/**
 * 送信元を検証 (SEC-M1)
 */
function validateSender(event: Electron.IpcMainInvokeEvent): boolean {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (!focusedWindow) {
    return false;
  }
  return focusedWindow.webContents.id === event.sender.id;
}

/**
 * 危険な拡張子を含むかチェック (SEC-M2)
 */
function hasDangerousExtension(filters: DialogFileFilter[]): boolean {
  return filters.some((f) =>
    f.extensions.some((ext) =>
      DANGEROUS_EXTENSIONS.includes(
        ext.toLowerCase() as (typeof DANGEROUS_EXTENSIONS)[number],
      ),
    ),
  );
}

/**
 * レート制限チェック
 */
function checkRateLimit(senderId: number): boolean {
  const now = Date.now();
  const timestamps = rateLimiter.get(senderId) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (recent.length >= RATE_LIMIT_MAX) {
    return false;
  }

  recent.push(now);
  rateLimiter.set(senderId, recent);
  return true;
}

/**
 * MIMEタイプを取得
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * ファイルメタ情報を取得
 */
async function getFileMetadata(filePath: string): Promise<SelectedFile> {
  // パストラバーサルチェック
  if (containsPathTraversal(filePath)) {
    throw new Error("不正なパスです（パストラバーサルは許可されていません）");
  }

  // 実際のパスを解決
  const realPath = await fs.realpath(filePath);

  // 許可ディレクトリチェック
  if (!isPathAllowed(realPath)) {
    throw new Error("許可されていないディレクトリへのアクセスです");
  }

  const stats = await fs.stat(realPath);

  if (!stats.isFile()) {
    throw new Error("指定されたパスはファイルではありません");
  }

  const name = path.basename(realPath);
  const extension = path.extname(realPath).toLowerCase();

  return {
    id: uuidv4(),
    path: realPath,
    name,
    extension: extension || "",
    size: stats.size,
    mimeType: getMimeType(realPath),
    lastModified: stats.mtime.toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// =============================================================================
// Handlers
// =============================================================================

/**
 * ファイル選択ダイアログハンドラ
 */
async function handleOpenDialog(
  event: Electron.IpcMainInvokeEvent,
  request: unknown,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    // 送信元検証 (SEC-M1)
    if (!validateSender(event)) {
      return {
        success: false,
        error: "不正な送信元からのリクエストです",
      };
    }

    // レート制限チェック
    if (!checkRateLimit(event.sender.id)) {
      return {
        success: false,
        error: "リクエストが多すぎます。しばらく待ってから再試行してください",
      };
    }

    // バリデーション
    const parseResult = openFileDialogRequestSchema.safeParse(request);
    if (!parseResult.success) {
      return {
        success: false,
        error: `バリデーションエラー: ${parseResult.error.message}`,
      };
    }

    const {
      title,
      multiSelections,
      filterCategory,
      customFilters,
      defaultPath,
    } = parseResult.data;

    // 危険な拡張子チェック (SEC-M2)
    if (customFilters && hasDangerousExtension(customFilters)) {
      return {
        success: false,
        error: "セキュリティ上の理由から、指定された拡張子は許可されていません",
      };
    }

    // defaultPathのセキュリティチェック
    if (defaultPath && containsPathTraversal(defaultPath)) {
      return {
        success: false,
        error: "不正なパスです（パストラバーサルは許可されていません）",
      };
    }

    // プロパティ設定
    const properties: ("openFile" | "multiSelections")[] = ["openFile"];
    if (multiSelections) {
      properties.push("multiSelections");
    }

    // フィルター設定
    let filters: DialogFileFilter[] | undefined;
    if (customFilters && customFilters.length > 0) {
      filters = customFilters;
    } else if (filterCategory && filterCategory !== "all") {
      const categoryFilter = FILTER_CATEGORIES[filterCategory];
      if (categoryFilter) {
        filters = [categoryFilter];
      }
    }

    // ダイアログ表示
    const window = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(window!, {
      title,
      properties,
      filters,
      defaultPath,
    });

    return {
      success: true,
      data: {
        canceled: result.canceled,
        filePaths: result.filePaths,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 単一ファイルメタ情報取得ハンドラ
 */
async function handleGetMetadata(
  _event: Electron.IpcMainInvokeEvent,
  request: unknown,
): Promise<{ success: boolean; data?: SelectedFile; error?: string }> {
  try {
    // バリデーション
    const parseResult = getFileMetadataRequestSchema.safeParse(request);
    if (!parseResult.success) {
      return {
        success: false,
        error: `バリデーションエラー: ${parseResult.error.message}`,
      };
    }

    const { filePath } = parseResult.data;

    const metadata = await getFileMetadata(filePath);
    return {
      success: true,
      data: metadata,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 複数ファイルメタ情報取得ハンドラ
 */
async function handleGetMultipleMetadata(
  _event: Electron.IpcMainInvokeEvent,
  request: unknown,
): Promise<{
  success: boolean;
  data?: {
    files: SelectedFile[];
    errors: { filePath: string; error: string }[];
  };
  error?: string;
}> {
  try {
    // バリデーション
    const parseResult = getMultipleFileMetadataRequestSchema.safeParse(request);
    if (!parseResult.success) {
      return {
        success: false,
        error: `バリデーションエラー: ${parseResult.error.message}`,
      };
    }

    const { filePaths } = parseResult.data;

    if (filePaths.length === 0) {
      return {
        success: false,
        error: "ファイルパスが指定されていません",
      };
    }

    // 並列でメタ情報取得
    const results = await Promise.allSettled(
      filePaths.map(async (filePath) => ({
        filePath,
        metadata: await getFileMetadata(filePath),
      })),
    );

    const files: SelectedFile[] = [];
    const errors: { filePath: string; error: string }[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled") {
        files.push(result.value.metadata);
      } else {
        errors.push({
          filePath: filePaths[i],
          error:
            result.reason instanceof Error
              ? result.reason.message
              : "Unknown error",
        });
      }
    }

    return {
      success: true,
      data: { files, errors },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * パス検証ハンドラ
 */
async function handleValidatePath(
  _event: Electron.IpcMainInvokeEvent,
  request: unknown,
): Promise<{
  success: boolean;
  data?: {
    valid: boolean;
    exists?: boolean;
    isFile?: boolean;
    isDirectory?: boolean;
    error?: string;
  };
  error?: string;
}> {
  try {
    // バリデーション
    const parseResult = validateFilePathRequestSchema.safeParse(request);
    if (!parseResult.success) {
      return {
        success: false,
        error: `バリデーションエラー: ${parseResult.error.message}`,
      };
    }

    const { filePath } = parseResult.data;

    // パストラバーサルチェック
    if (containsPathTraversal(filePath)) {
      return {
        success: true,
        data: {
          valid: false,
          exists: false,
          isFile: false,
          isDirectory: false,
          error: "不正なパスです（パストラバーサルは許可されていません）",
        },
      };
    }

    try {
      const realPath = await fs.realpath(filePath);

      // 許可ディレクトリチェック
      if (!isPathAllowed(realPath)) {
        return {
          success: true,
          data: {
            valid: false,
            exists: false,
            isFile: false,
            isDirectory: false,
            error: "許可されていないディレクトリへのアクセスです",
          },
        };
      }

      const stats = await fs.stat(realPath);

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
      // ファイルが存在しない場合
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
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
      throw error;
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// Registration
// =============================================================================

/**
 * ファイル選択IPCハンドラを登録
 */
export function registerFileSelectionHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG, handleOpenDialog);
  ipcMain.handle(IPC_CHANNELS.FILE_SELECTION_GET_METADATA, handleGetMetadata);
  ipcMain.handle(
    IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA,
    handleGetMultipleMetadata,
  );
  ipcMain.handle(IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH, handleValidatePath);
}

/**
 * ファイル選択IPCハンドラを解除
 */
export function unregisterFileSelectionHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.FILE_SELECTION_OPEN_DIALOG);
  ipcMain.removeHandler(IPC_CHANNELS.FILE_SELECTION_GET_METADATA);
  ipcMain.removeHandler(IPC_CHANNELS.FILE_SELECTION_GET_MULTIPLE_METADATA);
  ipcMain.removeHandler(IPC_CHANNELS.FILE_SELECTION_VALIDATE_PATH);
}

/**
 * レート制限をリセット（テスト用）
 * @internal
 */
export function resetRateLimiter(): void {
  rateLimiter.clear();
}
