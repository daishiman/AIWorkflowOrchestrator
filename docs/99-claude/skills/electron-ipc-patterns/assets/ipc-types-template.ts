/**
 * IPC型定義テンプレート
 *
 * このファイルをプロジェクトにコピーして使用してください。
 * チャネル名と型を実際の要件に合わせて修正してください。
 */

// ============================================================
// 1. チャネル定義
// ============================================================

/**
 * IPCチャネル名の定数
 * 命名規則: `app:feature:action`
 */
export const IPC_CHANNELS = {
  // ファイル操作
  FILE_READ: "app:file:read",
  FILE_WRITE: "app:file:write",
  FILE_DELETE: "app:file:delete",

  // 設定
  SETTINGS_GET: "app:settings:get",
  SETTINGS_SET: "app:settings:set",

  // 通知（Main → Renderer）
  NOTIFICATION_SHOW: "app:notification:show",

  // ウィンドウ操作
  WINDOW_MINIMIZE: "app:window:minimize",
  WINDOW_MAXIMIZE: "app:window:maximize",
  WINDOW_CLOSE: "app:window:close",
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

// ============================================================
// 2. リクエスト・レスポンス型
// ============================================================

/**
 * ファイル読み取りリクエスト
 */
export interface FileReadRequest {
  path: string;
  encoding?: BufferEncoding;
}

/**
 * ファイル読み取りレスポンス
 */
export interface FileReadResponse {
  content: string;
  size: number;
  lastModified: string;
}

/**
 * 設定取得リクエスト
 */
export interface SettingsGetRequest {
  key: string;
}

/**
 * 設定取得レスポンス
 */
export interface SettingsGetResponse<T = unknown> {
  value: T | null;
}

// ============================================================
// 3. IPC API型マッピング
// ============================================================

/**
 * IPC APIの型マッピング
 * チャネル → { request, response } の対応
 */
export interface IpcApiMap {
  [IPC_CHANNELS.FILE_READ]: {
    request: FileReadRequest;
    response: FileReadResponse;
  };
  [IPC_CHANNELS.SETTINGS_GET]: {
    request: SettingsGetRequest;
    response: SettingsGetResponse;
  };
  // 他のチャネルも同様に追加
}

// ============================================================
// 4. 型安全なinvoke関数の型
// ============================================================

/**
 * 型安全なIPC invoke関数の型
 */
export type TypedIpcInvoke = <C extends keyof IpcApiMap>(
  channel: C,
  request: IpcApiMap[C]["request"],
) => Promise<IpcApiMap[C]["response"]>;

// ============================================================
// 5. Preload公開API型
// ============================================================

/**
 * contextBridgeで公開するAPI型
 */
export interface ElectronApi {
  file: {
    read: (path: string) => Promise<FileReadResponse>;
    write: (path: string, content: string) => Promise<void>;
  };
  settings: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<void>;
  };
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
}

// グローバル型拡張
declare global {
  interface Window {
    electronApi: ElectronApi;
  }
}
