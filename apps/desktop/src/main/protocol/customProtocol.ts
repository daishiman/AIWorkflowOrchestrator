/**
 * カスタムプロトコルハンドラー
 *
 * Electron アプリで aiworkflow:// プロトコルを処理する
 * OAuth コールバックなどの外部からのディープリンクを受け取る
 */

import { app, BrowserWindow } from "electron";

// カスタムプロトコル名
export const CUSTOM_PROTOCOL = "aiworkflow";

// コールバックパス
export const AUTH_CALLBACK_PATH = "/auth/callback";
export const AUTH_DONE_PATH = "/auth/done";

// 許可されたプロトコルパスのホワイトリスト（DEBT-SEC-003）
const ALLOWED_PATHS = [AUTH_CALLBACK_PATH, AUTH_DONE_PATH];

/**
 * プロトコル URL からトークンを抽出するコールバック関数の型
 */
export type AuthCallbackHandler = (url: string) => Promise<void>;

/**
 * カスタムプロトコルの設定オプション
 */
export interface ProtocolSetupOptions {
  /** 認証コールバックを処理する関数 */
  onAuthCallback?: AuthCallbackHandler;
  /** メインウィンドウを取得する関数 */
  getMainWindow: () => BrowserWindow | null;
}

/**
 * カスタムプロトコルをデフォルトプロトコルクライアントとして登録
 *
 * @returns 登録が成功したかどうか
 */
export function registerAsDefaultProtocolClient(): boolean {
  // 開発環境では Electron の実行パスを指定
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      return app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL, process.execPath, [
        process.argv[1],
      ]);
    }
  }
  return app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL);
}

/**
 * カスタムプロトコルURLからパス部分を抽出する
 * aiworkflow://auth/callback?code=xxx → /auth/callback
 */
function extractProtocolPath(url: string): string | null {
  const prefix = `${CUSTOM_PROTOCOL}://`;
  if (!url.startsWith(prefix)) return null;
  const rest = url.slice(prefix.length);
  // クエリパラメータとフラグメントを除去
  const pathOnly = rest.split("?")[0].split("#")[0];
  return `/${pathOnly}`;
}

/**
 * プロトコル URL が許可されたパスかどうかを検証（DEBT-SEC-003）
 */
export function isAllowedProtocolUrl(url: string): boolean {
  const path = extractProtocolPath(url);
  if (!path) return false;
  return ALLOWED_PATHS.includes(path);
}

/**
 * プロトコル URL が認証完了通知（auth/done）かどうかを判定
 */
export function isAuthDoneUrl(url: string): boolean {
  return extractProtocolPath(url) === AUTH_DONE_PATH;
}

/**
 * プロトコル URL が認証コールバックかどうかを判定
 */
export function isAuthCallbackUrl(url: string): boolean {
  return extractProtocolPath(url) === AUTH_CALLBACK_PATH;
}

/**
 * プロトコル URL を処理
 */
async function handleProtocolUrl(
  url: string,
  options: ProtocolSetupOptions,
): Promise<void> {
  const mainWindow = options.getMainWindow();

  // メインウィンドウが存在しない場合は何もしない
  if (!mainWindow) {
    console.warn("Main window not found, cannot process protocol URL");
    return;
  }

  // URLパス検証（DEBT-SEC-003: 不正パスを拒否）
  if (!isAllowedProtocolUrl(url)) {
    console.warn("[Protocol] Rejected unknown protocol path:", url);
    return;
  }

  // ウィンドウを前面に表示
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.focus();

  // 認証コールバックの場合（カスタムURLスキーム経由のフォールバック）
  if (isAuthCallbackUrl(url)) {
    if (options.onAuthCallback) {
      try {
        await options.onAuthCallback(url);
      } catch (error) {
        console.error("Error processing auth callback:", error);
      }
    }
  }
  // auth/done: ウィンドウフォーカスのみ（PKCE完了通知 — 上記で処理済み）
}

/**
 * macOS 用のプロトコルハンドラーをセットアップ
 * open-url イベントでカスタムプロトコルを処理
 */
export function setupMacOSProtocolHandler(options: ProtocolSetupOptions): void {
  app.on("open-url", async (event, url) => {
    event.preventDefault();
    await handleProtocolUrl(url, options);
  });
}

/**
 * Windows/Linux 用のプロトコルハンドラーをセットアップ
 * second-instance イベントでカスタムプロトコルを処理
 */
export function setupWindowsLinuxProtocolHandler(
  options: ProtocolSetupOptions,
): void {
  app.on("second-instance", async (_event, commandLine) => {
    // コマンドライン引数からプロトコル URL を探す
    const url = commandLine.find((arg) =>
      arg.startsWith(`${CUSTOM_PROTOCOL}://`),
    );

    if (url) {
      await handleProtocolUrl(url, options);
    }
  });
}

/**
 * 起動時のコマンドライン引数からプロトコル URL を処理
 * アプリが完全に閉じている状態からディープリンクで起動した場合
 */
export function processLaunchUrl(options: ProtocolSetupOptions): void {
  const url = process.argv.find((arg) =>
    arg.startsWith(`${CUSTOM_PROTOCOL}://`),
  );

  if (url) {
    // アプリの準備ができてから処理
    app.whenReady().then(() => {
      handleProtocolUrl(url, options);
    });
  }
}

/**
 * すべてのプロトコルハンドラーをセットアップ
 *
 * @param options プロトコル設定オプション
 * @returns シングルインスタンスロックが取得できたかどうか
 */
export function setupCustomProtocol(options: ProtocolSetupOptions): boolean {
  // シングルインスタンスロックを取得（Windows/Linux用）
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    // 別のインスタンスが既に実行中の場合は終了
    // second-instance イベントが発火して、既存のインスタンスがURLを処理する
    app.quit();
    return false;
  }

  // デフォルトプロトコルクライアントとして登録
  registerAsDefaultProtocolClient();

  // macOS のプロトコルハンドラー
  setupMacOSProtocolHandler(options);

  // Windows/Linux のプロトコルハンドラー
  setupWindowsLinuxProtocolHandler(options);

  // 起動時の URL を処理
  processLaunchUrl(options);

  return true;
}
