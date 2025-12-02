/**
 * セキュアなPreloadスクリプトテンプレート
 *
 * セキュリティベストプラクティスに準拠した
 * Preloadスクリプトの実装例
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// =====================================
// セキュリティユーティリティ
// =====================================

/**
 * 文字列の入力を検証
 */
function validateString(value: unknown, maxLength = 10000): string | null {
  if (typeof value !== 'string') return null;
  if (value.length === 0 || value.length > maxLength) return null;
  return value;
}

/**
 * パストラバーサルを検出
 */
function containsPathTraversal(path: string): boolean {
  return path.includes('..') || path.includes('\0');
}

/**
 * 安全なファイルパスかチェック
 */
function isValidFilePath(path: string): boolean {
  const validated = validateString(path);
  if (!validated) return false;
  if (containsPathTraversal(validated)) return false;
  return true;
}

/**
 * 許可されたIPCチャネルか確認
 */
const ALLOWED_CHANNELS = new Set([
  'file:read',
  'file:write',
  'dialog:open',
  'dialog:save',
  'app:getVersion',
  'window:minimize',
  'window:maximize',
  'window:close',
  'update:check',
  'update:download',
  'update:install',
]);

function isAllowedChannel(channel: string): boolean {
  return ALLOWED_CHANNELS.has(channel);
}

// =====================================
// 型定義
// =====================================

interface FileResult {
  success: true;
  data: string;
} | {
  success: false;
  error: string;
}

interface WriteResult {
  success: boolean;
  error?: string;
}

interface DialogResult {
  canceled: boolean;
  filePaths?: string[];
  filePath?: string;
}

type CleanupFunction = () => void;

// =====================================
// 安全なIPC呼び出しラッパー
// =====================================

async function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!isAllowedChannel(channel)) {
    throw new Error(`Channel not allowed: ${channel}`);
  }
  return ipcRenderer.invoke(channel, ...args);
}

function safeOn(
  channel: string,
  callback: (...args: unknown[]) => void
): CleanupFunction {
  if (!isAllowedChannel(channel)) {
    throw new Error(`Channel not allowed: ${channel}`);
  }

  const handler = (_event: IpcRendererEvent, ...args: unknown[]) => {
    callback(...args);
  };

  ipcRenderer.on(channel, handler);

  return () => {
    ipcRenderer.removeListener(channel, handler);
  };
}

// =====================================
// 公開API（最小限の原則）
// =====================================

const api = {
  // ---------------------------------
  // ファイル操作（検証付き）
  // ---------------------------------

  readFile: async (filePath: string): Promise<FileResult> => {
    if (!isValidFilePath(filePath)) {
      return { success: false, error: 'Invalid file path' };
    }
    return safeInvoke<FileResult>('file:read', filePath);
  },

  writeFile: async (filePath: string, content: string): Promise<WriteResult> => {
    if (!isValidFilePath(filePath)) {
      return { success: false, error: 'Invalid file path' };
    }
    const validatedContent = validateString(content, 10_000_000); // 10MB制限
    if (validatedContent === null) {
      return { success: false, error: 'Invalid content' };
    }
    return safeInvoke<WriteResult>('file:write', filePath, validatedContent);
  },

  // ---------------------------------
  // ダイアログ（Mainで処理）
  // ---------------------------------

  openFileDialog: (): Promise<DialogResult> => {
    return safeInvoke<DialogResult>('dialog:open');
  },

  saveFileDialog: (): Promise<DialogResult> => {
    return safeInvoke<DialogResult>('dialog:save');
  },

  // ---------------------------------
  // アプリ情報（読み取り専用）
  // ---------------------------------

  getVersion: (): Promise<string> => {
    return safeInvoke<string>('app:getVersion');
  },

  // ---------------------------------
  // ウィンドウ操作
  // ---------------------------------

  window: {
    minimize: (): Promise<void> => safeInvoke('window:minimize'),
    maximize: (): Promise<void> => safeInvoke('window:maximize'),
    close: (): Promise<void> => safeInvoke('window:close'),
  },

  // ---------------------------------
  // 更新機能
  // ---------------------------------

  update: {
    check: (): Promise<void> => safeInvoke('update:check'),
    download: (): Promise<void> => safeInvoke('update:download'),
    install: (): Promise<void> => safeInvoke('update:install'),
  },

  // ---------------------------------
  // イベントリスナー（制限付き）
  // ---------------------------------

  onUpdateAvailable: (callback: () => void): CleanupFunction => {
    return safeOn('update:available', callback);
  },

  onUpdateProgress: (callback: (progress: number) => void): CleanupFunction => {
    return safeOn('update:progress', (progress) => {
      if (typeof progress === 'number' && progress >= 0 && progress <= 100) {
        callback(progress);
      }
    });
  },

  onUpdateDownloaded: (callback: () => void): CleanupFunction => {
    return safeOn('update:downloaded', callback);
  },
};

// =====================================
// APIを安全に公開
// =====================================

contextBridge.exposeInMainWorld('electronAPI', api);

// =====================================
// 型エクスポート
// =====================================

export type ElectronAPI = typeof api;

// =====================================
// セキュリティ警告（開発時）
// =====================================

if (process.env.NODE_ENV === 'development') {
  console.info('[Preload] Security Info:');
  console.info('- contextIsolation: enabled');
  console.info('- nodeIntegration: disabled');
  console.info('- Allowed IPC channels:', Array.from(ALLOWED_CHANNELS));
}

// =====================================
// 禁止事項（コメントとして記録）
// =====================================

/*
❌ 絶対に行ってはいけないこと:

1. ipcRendererの直接公開
   contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

2. requireの公開
   contextBridge.exposeInMainWorld('require', require);

3. processの公開
   contextBridge.exposeInMainWorld('process', process);

4. 任意のコード実行
   contextBridge.exposeInMainWorld('eval', (code) => eval(code));

5. バリデーションなしのIPC呼び出し
   readFile: (path) => ipcRenderer.invoke('file:read', path);

6. 任意のチャネルへの送信許可
   send: (channel, data) => ipcRenderer.send(channel, data);
*/
