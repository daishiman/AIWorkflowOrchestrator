/**
 * Electron IPC チャネル定数
 *
 * レンダラープロセスとメインプロセス間の通信チャネルを定義する。
 * 文字列リテラルの代わりに定数を使用することで、Typoによるランタイムエラーを防止する。
 *
 * @see apps/desktop/electron/preload/index.ts
 * @see apps/desktop/electron/main/ipc-handler.ts
 */

/**
 * チャット履歴エクスポート関連のIPCチャネル
 */
export const CHAT_EXPORT_CHANNELS = {
  /**
   * セッション履歴をMarkdown/JSON形式でエクスポート
   */
  EXPORT_SESSION: "chat:exportSession",

  /**
   * エクスポートプレビュー情報の取得
   * （推定ファイルサイズ、メッセージ数など）
   */
  PREVIEW_EXPORT: "chat:previewExport",
} as const;

/**
 * ファイルシステム操作関連のIPCチャネル
 */
export const FILE_SYSTEM_CHANNELS = {
  /**
   * ファイル保存ダイアログの表示
   */
  SHOW_SAVE_DIALOG: "dialog:showSaveDialog",

  /**
   * ファイル書き込み
   */
  WRITE_FILE: "fs:writeFile",

  /**
   * ファイル読み取り（必要に応じて実装）
   */
  READ_FILE: "fs:readFile",
} as const;

/**
 * すべてのIPCチャネル定数
 */
export const IPC_CHANNELS = {
  ...CHAT_EXPORT_CHANNELS,
  ...FILE_SYSTEM_CHANNELS,
} as const;

/**
 * IPCチャネル型（型安全性確保）
 */
export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
