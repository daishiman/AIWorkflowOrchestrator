---
name: electron-ui-patterns
description: |
  ElectronデスクトップアプリケーションのUI実装パターンと設計知識

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/electron-ui-patterns/resources/window-management.md`: BrowserWindow管理詳細
  - `.claude/skills/electron-ui-patterns/resources/native-ui.md`: ネイティブUI要素（メニュー、ダイアログ、通知）
  - `.claude/skills/electron-ui-patterns/resources/multi-window.md`: マルチウィンドウアプリ設計
  - `.claude/skills/electron-ui-patterns/templates/frameless-window.ts`: フレームレスウィンドウテンプレート
  - `.claude/skills/electron-ui-patterns/templates/tray-app.ts`: システムトレイアプリテンプレート

  専門分野:
  - ウィンドウ管理: BrowserWindow設定と制御
  - ネイティブUI: メニュー、ダイアログ、通知
  - カスタムタイトルバー: フレームレスウィンドウ
  - システムトレイ: Trayアプリケーション

  使用タイミング:
  - BrowserWindowを作成・設定する時
  - ネイティブメニューを実装する時
  - カスタムタイトルバーを設計する時
  - システムトレイアプリを作成する時

version: 1.0.0
---

# electron-ui-patterns

ElectronデスクトップアプリケーションのUI実装パターンと設計知識

---

## 概要

### 目的
Electronアプリケーションに特有のUI要素（ウィンドウ、メニュー、
ダイアログ、通知、トレイ）の実装パターンを提供する。

### 対象者
- Electronアプリ開発者
- デスクトップUIエンジニア
- フロントエンド開発者

---

## BrowserWindow管理

### 基本的なウィンドウ作成

```typescript
// main/window.ts
import { BrowserWindow, screen } from 'electron';
import path from 'path';

export function createMainWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    // サイズ
    width: Math.min(1200, width * 0.8),
    height: Math.min(800, height * 0.8),
    minWidth: 800,
    minHeight: 600,

    // 位置（中央）
    center: true,

    // 外観
    title: 'My Electron App',
    icon: path.join(__dirname, '../assets/icon.png'),
    backgroundColor: '#ffffff',

    // ウィンドウフレーム
    frame: true,              // false でカスタムタイトルバー
    titleBarStyle: 'default', // 'hidden' | 'hiddenInset' | 'customButtonsOnHover'

    // セキュリティ設定（必須）
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // 開発時はDevTools
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }

  // ロードするコンテンツ
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
}
```

### ウィンドウ状態の永続化

```typescript
// main/services/windowState.ts
import { BrowserWindow, screen } from 'electron';
import Store from 'electron-store';

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const store = new Store<{ windowState: WindowState }>();

export function loadWindowState(): WindowState {
  const defaultState: WindowState = {
    width: 1200,
    height: 800,
    isMaximized: false,
  };

  return store.get('windowState', defaultState);
}

export function saveWindowState(win: BrowserWindow): void {
  const isMaximized = win.isMaximized();
  const bounds = win.getBounds();

  store.set('windowState', {
    ...bounds,
    isMaximized,
  });
}

export function applyWindowState(win: BrowserWindow): void {
  const state = loadWindowState();

  // 位置がディスプレイ内にあるか確認
  const displays = screen.getAllDisplays();
  const isVisible = displays.some(display => {
    const { x, y, width, height } = display.bounds;
    return (
      state.x !== undefined &&
      state.y !== undefined &&
      state.x >= x &&
      state.x < x + width &&
      state.y >= y &&
      state.y < y + height
    );
  });

  if (isVisible && state.x !== undefined && state.y !== undefined) {
    win.setBounds({
      x: state.x,
      y: state.y,
      width: state.width,
      height: state.height,
    });
  }

  if (state.isMaximized) {
    win.maximize();
  }
}
```

---

## カスタムタイトルバー

### フレームレスウィンドウ

```typescript
// main/window.ts
const win = new BrowserWindow({
  frame: false,
  titleBarStyle: 'hidden',
  trafficLightPosition: { x: 15, y: 10 }, // macOS用
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
  },
});
```

### カスタムタイトルバーコンポーネント（React）

```tsx
// renderer/components/TitleBar.tsx
import { FC } from 'react';
import './TitleBar.css';

export const TitleBar: FC<{ title: string }> = ({ title }) => {
  const handleMinimize = () => window.electronAPI.minimize();
  const handleMaximize = () => window.electronAPI.maximize();
  const handleClose = () => window.electronAPI.close();

  return (
    <div className="titlebar">
      {/* ドラッグ可能領域 */}
      <div className="titlebar-drag-region">
        <span className="title">{title}</span>
      </div>

      {/* ウィンドウコントロール */}
      <div className="titlebar-controls">
        <button
          className="titlebar-button minimize"
          onClick={handleMinimize}
          aria-label="最小化"
        >
          <MinimizeIcon />
        </button>
        <button
          className="titlebar-button maximize"
          onClick={handleMaximize}
          aria-label="最大化"
        >
          <MaximizeIcon />
        </button>
        <button
          className="titlebar-button close"
          onClick={handleClose}
          aria-label="閉じる"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};
```

```css
/* renderer/components/TitleBar.css */
.titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  background: var(--titlebar-bg);
  user-select: none;
}

.titlebar-drag-region {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 12px;
  -webkit-app-region: drag; /* ドラッグ可能に */
}

.titlebar-controls {
  display: flex;
  -webkit-app-region: no-drag; /* ボタンはドラッグ不可 */
}

.titlebar-button {
  width: 46px;
  height: 32px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.titlebar-button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.titlebar-button.close:hover {
  background: #e81123;
  color: white;
}
```

---

## ネイティブメニュー

### アプリケーションメニュー

```typescript
// main/menu.ts
import { Menu, shell, app, BrowserWindow } from 'electron';

export function createApplicationMenu(win: BrowserWindow): Menu {
  const isMac = process.platform === 'darwin';

  const template: Electron.MenuItemConstructorOptions[] = [
    // macOSのアプリメニュー
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const },
      ],
    }] : []),

    // ファイルメニュー
    {
      label: 'ファイル',
      submenu: [
        {
          label: '新規作成',
          accelerator: 'CmdOrCtrl+N',
          click: () => win.webContents.send('menu:new-file'),
        },
        {
          label: '開く...',
          accelerator: 'CmdOrCtrl+O',
          click: () => win.webContents.send('menu:open-file'),
        },
        { type: 'separator' },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => win.webContents.send('menu:save-file'),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },

    // 編集メニュー
    {
      label: '編集',
      submenu: [
        { role: 'undo', label: '元に戻す' },
        { role: 'redo', label: 'やり直す' },
        { type: 'separator' },
        { role: 'cut', label: '切り取り' },
        { role: 'copy', label: 'コピー' },
        { role: 'paste', label: '貼り付け' },
        { role: 'selectAll', label: 'すべて選択' },
      ],
    },

    // 表示メニュー
    {
      label: '表示',
      submenu: [
        { role: 'reload', label: '再読み込み' },
        { role: 'forceReload', label: '強制再読み込み' },
        { role: 'toggleDevTools', label: '開発者ツール' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'ズームをリセット' },
        { role: 'zoomIn', label: 'ズームイン' },
        { role: 'zoomOut', label: 'ズームアウト' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'フルスクリーン' },
      ],
    },

    // ヘルプメニュー
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'ドキュメント',
          click: () => shell.openExternal('https://example.com/docs'),
        },
        {
          label: '問題を報告',
          click: () => shell.openExternal('https://github.com/user/repo/issues'),
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
```

### コンテキストメニュー

```typescript
// main/contextMenu.ts
import { Menu, BrowserWindow } from 'electron';

export function showContextMenu(
  win: BrowserWindow,
  options: { hasSelection: boolean }
): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(options.hasSelection ? [
      { role: 'copy' as const, label: 'コピー' },
      { role: 'cut' as const, label: '切り取り' },
      { type: 'separator' as const },
    ] : []),
    { role: 'paste' as const, label: '貼り付け' },
    { type: 'separator' as const },
    { role: 'selectAll' as const, label: 'すべて選択' },
  ];

  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: win });
}

// IPC経由で呼び出し
ipcMain.on('show-context-menu', (event, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    showContextMenu(win, options);
  }
});
```

---

## ダイアログ

### ファイルダイアログ

```typescript
// main/ipc/dialog.ts
import { dialog, BrowserWindow } from 'electron';

ipcMain.handle('dialog:open-file', async (event, options?: {
  filters?: Electron.FileFilter[];
  multiSelections?: boolean;
}) => {
  const win = BrowserWindow.fromWebContents(event.sender);

  const result = await dialog.showOpenDialog(win!, {
    properties: [
      'openFile',
      ...(options?.multiSelections ? ['multiSelections' as const] : []),
    ],
    filters: options?.filters ?? [
      { name: 'すべてのファイル', extensions: ['*'] },
    ],
  });

  return result.canceled ? null : result.filePaths;
});

ipcMain.handle('dialog:save-file', async (event, options?: {
  defaultPath?: string;
  filters?: Electron.FileFilter[];
}) => {
  const win = BrowserWindow.fromWebContents(event.sender);

  const result = await dialog.showSaveDialog(win!, {
    defaultPath: options?.defaultPath,
    filters: options?.filters ?? [
      { name: 'すべてのファイル', extensions: ['*'] },
    ],
  });

  return result.canceled ? null : result.filePath;
});
```

### 確認ダイアログ

```typescript
ipcMain.handle('dialog:confirm', async (event, options: {
  title: string;
  message: string;
  detail?: string;
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  buttons?: string[];
}) => {
  const win = BrowserWindow.fromWebContents(event.sender);

  const result = await dialog.showMessageBox(win!, {
    type: options.type ?? 'question',
    title: options.title,
    message: options.message,
    detail: options.detail,
    buttons: options.buttons ?? ['キャンセル', 'OK'],
    defaultId: 1,
    cancelId: 0,
  });

  return result.response; // ボタンのインデックス
});
```

---

## システムトレイ

### トレイアプリケーション

```typescript
// main/tray.ts
import { Tray, Menu, app, nativeImage } from 'electron';
import path from 'path';

let tray: Tray | null = null;

export function createTray(showWindow: () => void): Tray {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../assets/tray-icon.png')
  );

  // macOSではテンプレート画像を使用
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'ウィンドウを表示',
      click: showWindow,
    },
    { type: 'separator' },
    {
      label: '設定',
      click: () => {
        // 設定画面を開く
      },
    },
    { type: 'separator' },
    {
      label: '終了',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('My Electron App');

  // ダブルクリックでウィンドウ表示
  tray.on('double-click', showWindow);

  return tray;
}

// トレイアイコンの更新
export function updateTrayIcon(status: 'normal' | 'active' | 'error'): void {
  if (!tray) return;

  const iconPath = path.join(
    __dirname,
    `../assets/tray-icon-${status}.png`
  );
  const icon = nativeImage.createFromPath(iconPath);

  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }

  tray.setImage(icon);
}
```

---

## 通知

### システム通知

```typescript
// main/ipc/notification.ts
import { Notification, nativeImage } from 'electron';

ipcMain.handle('notification:show', async (event, options: {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
  urgency?: 'normal' | 'critical' | 'low';
}) => {
  const notification = new Notification({
    title: options.title,
    body: options.body,
    icon: options.icon
      ? nativeImage.createFromPath(options.icon)
      : undefined,
    silent: options.silent,
    urgency: options.urgency,
  });

  notification.show();

  return new Promise<string>((resolve) => {
    notification.on('click', () => resolve('click'));
    notification.on('close', () => resolve('close'));
    notification.on('action', () => resolve('action'));
  });
});
```

---

## ベストプラクティス

### ✅ 推奨事項

1. **ウィンドウ状態の永続化** - サイズ、位置、最大化状態を保存
2. **プラットフォーム差異の考慮** - macOS/Windows/Linuxの違い
3. **アクセシビリティ対応** - キーボードショートカット、スクリーンリーダー
4. **ダークモード対応** - システム設定に連動
5. **適切なアイコンサイズ** - 各プラットフォーム用

### ❌ 避けるべきこと

1. **固定サイズのウィンドウ** - 異なる解像度で問題
2. **ネイティブUI無視** - プラットフォームらしさの欠如
3. **同期ダイアログ過多** - UXの悪化
4. **巨大なアイコン画像** - メモリ消費

---

## 関連リソース

### 詳細ドキュメント
- `resources/window-management.md` - ウィンドウ管理詳細
- `resources/native-ui.md` - ネイティブUI要素
- `resources/multi-window.md` - マルチウィンドウ設計

### テンプレート
- `templates/frameless-window.ts` - フレームレスウィンドウ
- `templates/tray-app.ts` - トレイアプリ
