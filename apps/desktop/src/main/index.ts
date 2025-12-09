import { app, BrowserWindow, shell, session } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { registerAllIpcHandlers } from "./ipc";
import { setupCustomProtocol } from "./protocol";
import { IPC_CHANNELS } from "../preload/channels";
import { getSupabaseClient, createSecureStorage } from "./infrastructure";
import { toAuthUser } from "@repo/shared/infrastructure/auth";

// メインウィンドウの参照を保持（モジュールスコープ）
export let mainWindowRef: BrowserWindow | null = null;

// CSP設定 - 開発環境と本番環境で分離
const getCSPPolicy = (isDev: boolean): string => {
  if (isDev) {
    // 開発環境: Vite HMRのためにインラインスクリプトとWebSocketを許可
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https: ws: wss:",
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
  }
  // 本番環境: 厳格なCSP
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https:",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
};

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // CSPヘッダーを設定（開発/本番環境で分離）
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [getCSPPolicy(is.dev)],
      },
    });
  });

  window.on("ready-to-show", () => {
    window.show();
  });

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // ナビゲーションを制限
  window.webContents.on("will-navigate", (event, url) => {
    // 開発環境では許可
    if (is.dev && url.startsWith(process.env["ELECTRON_RENDERER_URL"] || "")) {
      return;
    }
    // それ以外のナビゲーションは拒否
    event.preventDefault();
  });

  // HMR for renderer in development
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    window.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    window.loadFile(join(__dirname, "../renderer/index.html"));
  }

  return window;
}

/**
 * OAuth 認証コールバックを処理
 * カスタムプロトコル aiworkflow://auth/callback からトークンを抽出して
 * Supabaseセッションを設定し、Renderer プロセスに通知する
 */
async function handleAuthCallback(url: string): Promise<void> {
  if (!mainWindowRef) {
    console.error("Main window not available for auth callback");
    return;
  }

  try {
    // URL からハッシュフラグメントを抽出
    // 形式: aiworkflow://auth/callback#access_token=xxx&refresh_token=xxx&...
    const hashIndex = url.indexOf("#");
    if (hashIndex === -1) {
      console.error("No hash fragment in auth callback URL");
      mainWindowRef.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
        authenticated: false,
        error: "認証コールバックURLが無効です：トークンが見つかりません",
      });
      return;
    }

    const hashParams = new URLSearchParams(url.substring(hashIndex + 1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      console.error("Missing tokens in auth callback URL");
      mainWindowRef.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
        authenticated: false,
        error: "認証トークンが見つかりません",
      });
      return;
    }

    // Supabaseセッションを設定
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("Supabase client not available");
      mainWindowRef.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
        authenticated: false,
        error: "Supabaseが設定されていません",
      });
      return;
    }

    // トークンでセッションを設定
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      console.error("Failed to set Supabase session:", error);
      mainWindowRef.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
        authenticated: false,
        error: error?.message ?? "セッションの設定に失敗しました",
      });
      return;
    }

    // リフレッシュトークンをSecureStorageに保存
    const secureStorage = createSecureStorage();
    await secureStorage.storeRefreshToken(refreshToken);

    // ユーザー情報を変換
    const user = toAuthUser(data.session.user);

    // Renderer に認証データを送信（ユーザー情報付き）
    mainWindowRef.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
      authenticated: true,
      user,
      tokens: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    });

    console.log("Auth callback processed successfully, user:", user?.email);
  } catch (error) {
    console.error("Error processing auth callback:", error);
    mainWindowRef.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
      authenticated: false,
      error: "認証処理に失敗しました",
    });
  }
}

// カスタムプロトコルをセットアップ（app.whenReady() より前に呼ぶ必要がある）
const gotSingleInstanceLock = setupCustomProtocol({
  getMainWindow: () => mainWindowRef,
  onAuthCallback: handleAuthCallback,
});

// シングルインスタンスロックが取得できなかった場合は終了
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    electronApp.setAppUserModelId("com.aiworkflow.orchestrator");

    // Default open or close DevTools by F12 in development
    app.on("browser-window-created", (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    mainWindowRef = createWindow();

    // Register IPC handlers
    registerAllIpcHandlers(mainWindowRef);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindowRef = createWindow();
        registerAllIpcHandlers(mainWindowRef);
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
