/**
 * Electron Preloadスクリプトのテンプレート
 *
 * 使用方法:
 * このファイルをプロジェクトの src/preload/index.ts にコピーして使用
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

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

type MenuCallback = (action: string) => void;
type ProgressCallback = (progress: number) => void;
type CleanupFunction = () => void;

// =====================================
// API定義
// =====================================

const electronAPI = {
  // ---------------------------------
  // ファイル操作
  // ---------------------------------

  /**
   * ファイルを読み込む
   * @param filePath ファイルパス
   * @returns 読み込み結果
   */
  readFile: (filePath: string): Promise<FileResult> => {
    // 入力バリデーション
    if (typeof filePath !== 'string' || filePath.length === 0) {
      return Promise.resolve({
        success: false,
        error: 'Invalid file path',
      });
    }

    // パストラバーサル防止
    if (filePath.includes('..')) {
      return Promise.resolve({
        success: false,
        error: 'Path traversal not allowed',
      });
    }

    return ipcRenderer.invoke('file:read', filePath);
  },

  /**
   * ファイルを書き込む
   * @param filePath ファイルパス
   * @param content 書き込む内容
   * @returns 書き込み結果
   */
  writeFile: (filePath: string, content: string): Promise<WriteResult> => {
    if (typeof filePath !== 'string' || filePath.length === 0) {
      return Promise.resolve({
        success: false,
        error: 'Invalid file path',
      });
    }

    if (typeof content !== 'string') {
      return Promise.resolve({
        success: false,
        error: 'Content must be a string',
      });
    }

    return ipcRenderer.invoke('file:write', filePath, content);
  },

  // ---------------------------------
  // アプリケーション情報
  // ---------------------------------

  /**
   * アプリバージョンを取得
   */
  getVersion: (): Promise<string> => {
    return ipcRenderer.invoke('app:getVersion');
  },

  // ---------------------------------
  // ウィンドウ操作
  // ---------------------------------

  /**
   * ウィンドウを最小化
   */
  minimize: (): Promise<void> => {
    return ipcRenderer.invoke('window:minimize');
  },

  /**
   * ウィンドウを最大化/元に戻す
   */
  maximize: (): Promise<void> => {
    return ipcRenderer.invoke('window:maximize');
  },

  /**
   * ウィンドウを閉じる
   */
  close: (): Promise<void> => {
    return ipcRenderer.invoke('window:close');
  },

  // ---------------------------------
  // イベントリスナー
  // ---------------------------------

  /**
   * メニューアクションを受け取る
   * @param callback コールバック関数
   * @returns クリーンアップ関数
   */
  onMenuAction: (callback: MenuCallback): CleanupFunction => {
    const handler = (_event: IpcRendererEvent, action: string) => {
      callback(action);
    };
    ipcRenderer.on('menu:action', handler);
    return () => {
      ipcRenderer.removeListener('menu:action', handler);
    };
  },

  /**
   * ダウンロード進捗を受け取る
   * @param callback コールバック関数
   * @returns クリーンアップ関数
   */
  onDownloadProgress: (callback: ProgressCallback): CleanupFunction => {
    const handler = (_event: IpcRendererEvent, progress: number) => {
      callback(progress);
    };
    ipcRenderer.on('download:progress', handler);
    return () => {
      ipcRenderer.removeListener('download:progress', handler);
    };
  },

  /**
   * 更新が利用可能になった時
   * @param callback コールバック関数
   * @returns クリーンアップ関数
   */
  onUpdateAvailable: (callback: () => void): CleanupFunction => {
    const handler = () => callback();
    ipcRenderer.on('update:available', handler);
    return () => {
      ipcRenderer.removeListener('update:available', handler);
    };
  },
};

// =====================================
// APIを安全に公開
// =====================================

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// =====================================
// 型エクスポート（Renderer側で使用）
// =====================================

export type ElectronAPI = typeof electronAPI;

// =====================================
// 注意事項
// =====================================

/*
セキュリティ上、以下は絶対に行わないこと:

❌ ipcRendererを直接公開
  contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

❌ requireを公開
  contextBridge.exposeInMainWorld('require', require);

❌ processを公開
  contextBridge.exposeInMainWorld('process', process);

❌ evalを許可する機能
  任意のコードを実行できるAPIは公開しない
*/
