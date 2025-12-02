---
name: electron-architecture
description: |
  Electronデスクトップアプリケーションのアーキテクチャ設計専門知識

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/electron-architecture/resources/process-model.md`: Main/Rendererプロセスモデル詳細
  - `.claude/skills/electron-architecture/resources/ipc-patterns.md`: プロセス間通信パターン集
  - `.claude/skills/electron-architecture/resources/project-structure.md`: 推奨プロジェクト構成
  - `.claude/skills/electron-architecture/templates/main-process.ts`: Mainプロセステンプレート
  - `.claude/skills/electron-architecture/templates/preload.ts`: Preloadスクリプトテンプレート

  専門分野:
  - プロセスアーキテクチャ: Main/Renderer分離設計
  - IPC設計: 安全なプロセス間通信
  - コンテキスト分離: セキュアなコンテキストブリッジ
  - ライフサイクル管理: アプリケーション状態管理

  使用タイミング:
  - Electronアプリのアーキテクチャを設計する時
  - Main/Rendererプロセスの責務を分離する時
  - IPC通信パターンを実装する時
  - セキュアなプリロード設計を行う時

version: 1.0.0
---

# electron-architecture

Electronデスクトップアプリケーションのアーキテクチャ設計専門知識

---

## 概要

### 目的
Electronアプリケーションのプロセスモデル、IPC設計、
セキュリティ境界を理解し、保守性の高いアーキテクチャを構築する。

### 対象者
- Electronアプリ開発者
- デスクトップアプリアーキテクト
- フロントエンドエンジニア

---

## Electronプロセスモデル

### 基本構造

```
┌─────────────────────────────────────────────────────────┐
│                    Electron App                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐│
│  │              Main Process (Node.js)                 ││
│  │  • アプリケーションライフサイクル管理                  ││
│  │  • ネイティブAPI（ファイル、メニュー、通知等）         ││
│  │  • BrowserWindow管理                                ││
│  │  • IPCハンドラー                                    ││
│  └─────────────────────────────────────────────────────┘│
│                         │                               │
│                    IPC Channel                          │
│                         │                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │            Preload Script (Bridge)                  ││
│  │  • contextBridge API                                ││
│  │  • 安全なAPI公開                                    ││
│  └─────────────────────────────────────────────────────┘│
│                         │                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │          Renderer Process (Chromium)                ││
│  │  • UI (React/Vue/Vanilla)                           ││
│  │  • DOM操作                                          ││
│  │  • window.electronAPI経由でMainと通信               ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### プロセス責務分離

| プロセス | 責務 | アクセス可能 |
|---------|------|-------------|
| **Main** | システムAPI、ウィンドウ管理 | Node.js全機能、OS API |
| **Preload** | API橋渡し、サニタイズ | 制限付きNode.js |
| **Renderer** | UI描画、ユーザー操作 | DOM、公開API |

---

## プロジェクト構造

### 推奨ディレクトリ構成

```
electron-app/
├── src/
│   ├── main/                    # Mainプロセス
│   │   ├── index.ts             # エントリーポイント
│   │   ├── window.ts            # ウィンドウ管理
│   │   ├── menu.ts              # メニュー定義
│   │   ├── ipc/                  # IPCハンドラー
│   │   │   ├── file.ts
│   │   │   └── system.ts
│   │   └── services/            # ネイティブサービス
│   │       ├── fileService.ts
│   │       └── updateService.ts
│   │
│   ├── preload/                 # Preloadスクリプト
│   │   ├── index.ts
│   │   └── api.ts               # 公開API定義
│   │
│   └── renderer/                # Rendererプロセス（UI）
│       ├── index.html
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       ├── hooks/
│       └── styles/
│
├── electron-builder.yml         # ビルド設定
├── forge.config.js              # または Forge設定
└── package.json
```

---

## IPC通信パターン

### 1. 一方向通信（Renderer → Main）

```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // 一方向送信（戻り値なし）
  sendNotification: (message: string) => {
    ipcRenderer.send('show-notification', message);
  },
});

// main/ipc/notification.ts
ipcMain.on('show-notification', (event, message: string) => {
  new Notification({ title: 'App', body: message }).show();
});

// renderer側使用
window.electronAPI.sendNotification('保存完了');
```

### 2. 双方向通信（invoke/handle）

```typescript
// preload/index.ts - 推奨パターン
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (path: string) => ipcRenderer.invoke('file:read', path),
  writeFile: (path: string, content: string) =>
    ipcRenderer.invoke('file:write', path, content),
});

// main/ipc/file.ts
ipcMain.handle('file:read', async (event, path: string) => {
  try {
    const content = await fs.promises.readFile(path, 'utf-8');
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// renderer側使用
const result = await window.electronAPI.readFile('/path/to/file');
if (result.success) {
  console.log(result.data);
}
```

### 3. Main → Renderer 通知

```typescript
// main/window.ts
function sendToRenderer(channel: string, data: unknown) {
  const win = BrowserWindow.getFocusedWindow();
  win?.webContents.send(channel, data);
}

// preload/index.ts
contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateProgress: (callback: (progress: number) => void) => {
    const handler = (_event: IpcRendererEvent, progress: number) => {
      callback(progress);
    };
    ipcRenderer.on('update-progress', handler);
    // クリーンアップ関数を返す
    return () => ipcRenderer.removeListener('update-progress', handler);
  },
});

// renderer側使用
useEffect(() => {
  const cleanup = window.electronAPI.onUpdateProgress((progress) => {
    setProgress(progress);
  });
  return cleanup;
}, []);
```

---

## 型安全なIPC設計

### 共通型定義

```typescript
// src/shared/ipc-types.ts
export interface IpcChannels {
  'file:read': {
    request: { path: string };
    response: { success: true; data: string } | { success: false; error: string };
  };
  'file:write': {
    request: { path: string; content: string };
    response: { success: boolean; error?: string };
  };
  'app:quit': {
    request: void;
    response: void;
  };
}

export type IpcChannel = keyof IpcChannels;
```

### 型付きPreload API

```typescript
// preload/index.ts
import type { IpcChannels } from '../shared/ipc-types';

type TypedInvoke = <K extends keyof IpcChannels>(
  channel: K,
  args: IpcChannels[K]['request']
) => Promise<IpcChannels[K]['response']>;

const typedInvoke: TypedInvoke = (channel, args) =>
  ipcRenderer.invoke(channel, args);

contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (path: string) => typedInvoke('file:read', { path }),
  writeFile: (path: string, content: string) =>
    typedInvoke('file:write', { path, content }),
});
```

### Renderer側型定義

```typescript
// src/renderer/types/electron.d.ts
interface ElectronAPI {
  readFile: (path: string) => Promise<
    { success: true; data: string } | { success: false; error: string }
  >;
  writeFile: (path: string, content: string) => Promise<
    { success: boolean; error?: string }
  >;
  onUpdateProgress: (callback: (progress: number) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

---

## ライフサイクル管理

### アプリケーション状態

```typescript
// main/index.ts
import { app, BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

// 初期化完了時
app.whenReady().then(async () => {
  // 環境設定読み込み
  await loadConfig();

  // メインウィンドウ作成
  mainWindow = createMainWindow();

  // macOS: Dockクリックで再表示
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
    }
  });
});

// 全ウィンドウ閉じた時（macOS以外で終了）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 終了前クリーンアップ
app.on('before-quit', async (event) => {
  event.preventDefault();
  await cleanup();
  app.exit(0);
});
```

---

## アーキテクチャパターン

### Clean Architecture適用

```
┌─────────────────────────────────────────────────────────┐
│                     Renderer                            │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Presentation (React Components)                     ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │ Application (Hooks, State Management)               ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                         │
                    Preload API
                         │
┌─────────────────────────────────────────────────────────┐
│                      Main                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Interface Adapters (IPC Handlers)                   ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │ Application (Use Cases)                             ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │ Domain (Entities, Business Logic)                   ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │ Infrastructure (File System, OS APIs, Network)      ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## ベストプラクティス

### ✅ 推奨事項

1. **contextIsolation: true** - 常に有効化
2. **nodeIntegration: false** - Rendererでは無効化
3. **sandbox: true** - 可能な限り有効化
4. **Preloadで最小限のAPI公開** - 必要なものだけ
5. **IPCチャネル名の名前空間化** - `file:read`、`app:quit`

### ❌ 避けるべきこと

1. **remote モジュールの使用** - 非推奨、セキュリティリスク
2. **nodeIntegration: true** - XSS攻撃リスク
3. **すべてをRendererで実行** - プロセス分離の意味がない
4. **同期IPCの多用** - パフォーマンス劣化

---

## 関連リソース

### 詳細ドキュメント
- `resources/process-model.md` - プロセスモデル詳細
- `resources/ipc-patterns.md` - IPCパターン集
- `resources/project-structure.md` - プロジェクト構成詳細

### テンプレート
- `templates/main-process.ts` - Mainプロセス雛形
- `templates/preload.ts` - Preloadスクリプト雛形
