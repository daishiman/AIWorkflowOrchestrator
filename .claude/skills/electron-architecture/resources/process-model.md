# Electronプロセスモデル詳細

## プロセスアーキテクチャ

### Main Process（メインプロセス）

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                           │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   app module    │  │ BrowserWindow   │                  │
│  │  • ready        │  │  • create       │                  │
│  │  • quit         │  │  • manage       │                  │
│  │  • activate     │  │  • destroy      │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   ipcMain       │  │  Native APIs    │                  │
│  │  • handle       │  │  • dialog       │                  │
│  │  • on           │  │  • menu         │                  │
│  └─────────────────┘  │  • notification │                  │
│                       │  • tray         │                  │
│                       │  • shell        │                  │
│                       └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Renderer Process（レンダラープロセス）

各BrowserWindowは独自のRendererプロセスを持つ。

```typescript
// 複数ウィンドウの管理
const windows: Map<number, BrowserWindow> = new Map();

function createWindow(id: string): BrowserWindow {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  windows.set(win.id, win);

  win.on('closed', () => {
    windows.delete(win.id);
  });

  return win;
}
```

### Preload Script（プリロードスクリプト）

```
┌─────────────────────────────────────────────────────────────┐
│                    Preload Context                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │             contextBridge API                           ││
│  │  • 安全なAPIの公開                                      ││
│  │  • Main ⇄ Renderer間の橋渡し                           ││
│  │  • 制限されたNode.jsアクセス                            ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  アクセス可能:                                              │
│  • ipcRenderer.send/invoke                                  │
│  • contextBridge.exposeInMainWorld                          │
│  • 一部のElectron API                                       │
│                                                             │
│  アクセス不可（sandbox: true時）:                           │
│  • require                                                  │
│  • fs, path等のNode.jsモジュール                            │
│  • process（一部のみ）                                      │
└─────────────────────────────────────────────────────────────┘
```

## プロセス間の責務分離

### Main Process の責務

```typescript
// main/index.ts
import { app, BrowserWindow, ipcMain, Menu, Tray, Notification } from 'electron';
import { fileService } from './services/file';
import { updateService } from './services/update';

// アプリケーションライフサイクル
app.whenReady().then(() => {
  createMainWindow();
  createMenu();
  createTray();
});

// システムAPI呼び出し
ipcMain.handle('file:read', async (_, path) => {
  return fileService.readFile(path);
});

// ネイティブ機能
ipcMain.handle('notification:show', (_, options) => {
  new Notification(options).show();
});
```

### Renderer Process の責務

```typescript
// renderer/App.tsx - UIのみに専念
function App() {
  const [content, setContent] = useState('');

  const handleOpen = async () => {
    // Main側のAPIを呼び出し
    const result = await window.electronAPI.openFile();
    if (result) setContent(result);
  };

  return (
    <div>
      <button onClick={handleOpen}>ファイルを開く</button>
      <pre>{content}</pre>
    </div>
  );
}
```

### Preload Script の責務

```typescript
// preload/index.ts - 最小限のAPI橋渡し
import { contextBridge, ipcRenderer } from 'electron';

// 公開するAPI定義
const api = {
  // ファイル操作
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  readFile: (path: string) => ipcRenderer.invoke('file:read', path),
  saveFile: (path: string, content: string) =>
    ipcRenderer.invoke('file:write', path, content),

  // イベントリスナー
  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_: any, action: string) => callback(action);
    ipcRenderer.on('menu:action', handler);
    return () => ipcRenderer.removeListener('menu:action', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
```

## プロセス分離の理由

### セキュリティ

| リスク | Main | Renderer |
|--------|------|----------|
| XSS攻撃 | 低 | 高 |
| RCE | 高 | 低（分離時） |
| ファイルアクセス | 可 | 不可（分離時） |

### 安定性

- Rendererがクラッシュ → そのウィンドウのみ影響
- Mainがクラッシュ → アプリ全体終了

```typescript
// クラッシュ時のハンドリング
win.webContents.on('render-process-gone', (event, details) => {
  console.error('Renderer crashed:', details);
  // ウィンドウを再作成
  win.reload();
});
```

### パフォーマンス

- Main: シングルスレッド、軽量処理向け
- Renderer: 各ウィンドウで独立、UI処理特化

```typescript
// 重い処理はWorkerで実行
const worker = new Worker('./heavy-task.js');
worker.postMessage({ data });
worker.onmessage = (e) => {
  // 結果をRendererに送信
  win.webContents.send('task:complete', e.data);
};
```

## ベストプラクティス

### DO ✅

1. **Main**: システムAPI、ファイル操作、ネイティブ機能
2. **Preload**: 最小限のAPI公開、入力バリデーション
3. **Renderer**: UI描画、ユーザー入力処理

### DON'T ❌

1. Rendererでファイル操作を直接行う
2. Preloadで複雑なロジックを実装する
3. Mainで重いUI処理を行う
