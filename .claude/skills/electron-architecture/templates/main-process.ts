/**
 * Electronメインプロセスのテンプレート
 *
 * 使用方法:
 * このファイルをプロジェクトの src/main/index.ts にコピーして使用
 */

import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'path';

// 環境変数
const isDev = process.env.NODE_ENV === 'development';

// メインウィンドウの参照
let mainWindow: BrowserWindow | null = null;

/**
 * メインウィンドウを作成
 */
function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    center: true,
    title: 'My Electron App',

    // セキュリティ設定（必須）
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // コンテンツのロード
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // ウィンドウが閉じられた時
  win.on('closed', () => {
    mainWindow = null;
  });

  return win;
}

/**
 * アプリケーションメニューを作成
 */
function createApplicationMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '新規作成',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new'),
        },
        { type: 'separator' },
        { role: 'quit', label: '終了' },
      ],
    },
    {
      label: '編集',
      submenu: [
        { role: 'undo', label: '元に戻す' },
        { role: 'redo', label: 'やり直す' },
        { type: 'separator' },
        { role: 'cut', label: '切り取り' },
        { role: 'copy', label: 'コピー' },
        { role: 'paste', label: '貼り付け' },
      ],
    },
    {
      label: '表示',
      submenu: [
        { role: 'reload', label: '再読み込み' },
        { role: 'toggleDevTools', label: '開発者ツール' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'ズームをリセット' },
        { role: 'zoomIn', label: 'ズームイン' },
        { role: 'zoomOut', label: 'ズームアウト' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'フルスクリーン' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * IPCハンドラーを登録
 */
function registerIpcHandlers(): void {
  // ファイル読み込み
  ipcMain.handle('file:read', async (event, filePath: string) => {
    const fs = await import('fs/promises');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // ファイル書き込み
  ipcMain.handle('file:write', async (event, filePath: string, content: string) => {
    const fs = await import('fs/promises');
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // アプリバージョン取得
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  // ウィンドウ操作
  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });
}

// =====================================
// アプリケーションライフサイクル
// =====================================

// 準備完了
app.whenReady().then(() => {
  createApplicationMenu();
  registerIpcHandlers();
  mainWindow = createMainWindow();

  // macOS: Dockクリック時の再表示
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
    }
  });
});

// 全ウィンドウが閉じられた時
app.on('window-all-closed', () => {
  // macOS以外はアプリを終了
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 終了前のクリーンアップ
app.on('before-quit', () => {
  // 必要なクリーンアップ処理をここに記述
  console.log('App is quitting...');
});

// セキュリティ: 新しいウィンドウの制御
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // 外部URLはデフォルトブラウザで開く
    if (url.startsWith('https://')) {
      import('electron').then(({ shell }) => shell.openExternal(url));
    }
    return { action: 'deny' };
  });
});
