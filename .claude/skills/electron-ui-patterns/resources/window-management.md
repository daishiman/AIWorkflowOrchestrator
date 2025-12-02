# BrowserWindow管理詳細

## ウィンドウ設定オプション

### サイズ・位置

```typescript
const win = new BrowserWindow({
  // サイズ
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  maxWidth: undefined,  // 無制限
  maxHeight: undefined,

  // 位置
  x: undefined,  // 自動配置
  y: undefined,
  center: true,

  // リサイズ
  resizable: true,
  movable: true,
  minimizable: true,
  maximizable: true,
  closable: true,
});
```

### 外観設定

```typescript
const win = new BrowserWindow({
  // フレーム
  frame: true,  // false でカスタムタイトルバー
  titleBarStyle: 'default', // 'hidden' | 'hiddenInset' | 'customButtonsOnHover'
  titleBarOverlay: {
    color: '#ffffff',
    symbolColor: '#000000',
    height: 32,
  },

  // 背景
  backgroundColor: '#ffffff',
  transparent: false,
  opacity: 1.0,

  // アイコン
  icon: path.join(__dirname, 'icon.png'),

  // 表示
  show: true,
  paintWhenInitiallyHidden: true,

  // 効果
  vibrancy: undefined,  // macOS: 'appearance-based' | 'light' | 'dark' | ...
  visualEffectState: 'followWindow',
});
```

### プラットフォーム固有

```typescript
// macOS
if (process.platform === 'darwin') {
  win.setWindowButtonVisibility(true);
  win.setVibrancy('sidebar');
}

// Windows
if (process.platform === 'win32') {
  win.setOverlayIcon(icon, 'Description');
  win.setThumbarButtons([...]);
}
```

## ウィンドウ状態管理

### 状態の保存と復元

```typescript
// store/windowState.ts
import Store from 'electron-store';
import { screen, BrowserWindow } from 'electron';

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullScreen: boolean;
  displayId?: number;
}

const store = new Store<{ windowState: WindowState }>();

export class WindowStateManager {
  private win: BrowserWindow;
  private state: WindowState;
  private stateChangeTimer: NodeJS.Timeout | null = null;

  constructor(win: BrowserWindow, defaultState: Partial<WindowState> = {}) {
    this.win = win;
    this.state = {
      width: defaultState.width ?? 1200,
      height: defaultState.height ?? 800,
      isMaximized: false,
      isFullScreen: false,
      ...store.get('windowState'),
    };

    this.restore();
    this.setupListeners();
  }

  private restore(): void {
    // ディスプレイ内に収まるか確認
    if (this.isStateValid()) {
      this.win.setBounds({
        x: this.state.x,
        y: this.state.y,
        width: this.state.width,
        height: this.state.height,
      });
    }

    if (this.state.isMaximized) {
      this.win.maximize();
    }
    if (this.state.isFullScreen) {
      this.win.setFullScreen(true);
    }
  }

  private isStateValid(): boolean {
    if (this.state.x === undefined || this.state.y === undefined) {
      return false;
    }

    const displays = screen.getAllDisplays();
    return displays.some(display => {
      const { x, y, width, height } = display.bounds;
      return (
        this.state.x! >= x &&
        this.state.x! < x + width &&
        this.state.y! >= y &&
        this.state.y! < y + height
      );
    });
  }

  private setupListeners(): void {
    const events = ['resize', 'move', 'maximize', 'unmaximize', 'enter-full-screen', 'leave-full-screen'];

    events.forEach(event => {
      this.win.on(event as any, () => this.scheduleStateSave());
    });

    this.win.on('close', () => this.saveState());
  }

  private scheduleStateSave(): void {
    if (this.stateChangeTimer) {
      clearTimeout(this.stateChangeTimer);
    }
    this.stateChangeTimer = setTimeout(() => this.saveState(), 500);
  }

  private saveState(): void {
    if (!this.win.isMaximized() && !this.win.isMinimized() && !this.win.isFullScreen()) {
      const bounds = this.win.getBounds();
      this.state.x = bounds.x;
      this.state.y = bounds.y;
      this.state.width = bounds.width;
      this.state.height = bounds.height;
    }

    this.state.isMaximized = this.win.isMaximized();
    this.state.isFullScreen = this.win.isFullScreen();

    store.set('windowState', this.state);
  }
}
```

## マルチウィンドウ管理

```typescript
// services/windowManager.ts
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

interface WindowConfig {
  type: 'main' | 'settings' | 'about' | 'dialog';
  options?: Partial<BrowserWindowConstructorOptions>;
}

class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map();

  create(id: string, config: WindowConfig): BrowserWindow {
    if (this.windows.has(id)) {
      const existing = this.windows.get(id)!;
      existing.focus();
      return existing;
    }

    const defaults = this.getDefaultOptions(config.type);
    const win = new BrowserWindow({
      ...defaults,
      ...config.options,
    });

    this.windows.set(id, win);

    win.on('closed', () => {
      this.windows.delete(id);
    });

    return win;
  }

  get(id: string): BrowserWindow | undefined {
    return this.windows.get(id);
  }

  getAll(): BrowserWindow[] {
    return Array.from(this.windows.values());
  }

  closeAll(): void {
    this.windows.forEach(win => win.close());
  }

  private getDefaultOptions(type: WindowConfig['type']): BrowserWindowConstructorOptions {
    const preload = path.join(__dirname, '../preload/index.js');

    const common: BrowserWindowConstructorOptions = {
      webPreferences: {
        preload,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    };

    switch (type) {
      case 'main':
        return { ...common, width: 1200, height: 800 };
      case 'settings':
        return { ...common, width: 600, height: 500, resizable: false };
      case 'about':
        return { ...common, width: 400, height: 300, resizable: false };
      case 'dialog':
        return { ...common, width: 500, height: 400, modal: true };
      default:
        return common;
    }
  }
}

export const windowManager = new WindowManager();
```

## ウィンドウ間通信

```typescript
// Main → 特定ウィンドウ
windowManager.get('main')?.webContents.send('event', data);

// Main → 全ウィンドウ
windowManager.getAll().forEach(win => {
  win.webContents.send('broadcast', data);
});

// Renderer → Main → 他のRenderer
ipcMain.on('relay', (event, targetId: string, data: any) => {
  const targetWin = windowManager.get(targetId);
  targetWin?.webContents.send('relayed', data);
});
```
