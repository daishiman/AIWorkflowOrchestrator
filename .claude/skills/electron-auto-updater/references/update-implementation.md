# Electron Auto-Updater 実装ガイド

## 概要

electron-updaterを使用した自動更新機能の実装パターン。

## 基本セットアップ

### インストール

```bash
pnpm add electron-updater
pnpm add -D electron-builder
```

### electron-builder設定

```json
// package.json or electron-builder.yml
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "your-org",
        "repo": "your-app"
      }
    ]
  }
}
```

## メインプロセス実装

### 基本的な更新チェック

```typescript
// main/updater.ts
import { autoUpdater } from "electron-updater";
import { app, BrowserWindow } from "electron";

export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  // 開発環境ではスキップ
  if (process.env.NODE_ENV === "development") {
    return;
  }

  // ログを有効化
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // 更新チェック
  autoUpdater.checkForUpdates();

  // イベントハンドリング
  autoUpdater.on("checking-for-update", () => {
    sendToRenderer("update:checking");
  });

  autoUpdater.on("update-available", (info) => {
    sendToRenderer("update:available", info);
  });

  autoUpdater.on("update-not-available", (info) => {
    sendToRenderer("update:not-available", info);
  });

  autoUpdater.on("error", (err) => {
    sendToRenderer("update:error", err.message);
  });

  autoUpdater.on("download-progress", (progress) => {
    sendToRenderer("update:progress", progress);
  });

  autoUpdater.on("update-downloaded", (info) => {
    sendToRenderer("update:downloaded", info);
  });
}

function sendToRenderer(channel: string, data?: unknown): void {
  const wins = BrowserWindow.getAllWindows();
  wins.forEach((win) => win.webContents.send(channel, data));
}
```

### IPC経由の更新操作

```typescript
// main/ipc-handlers.ts
import { ipcMain } from "electron";
import { autoUpdater } from "electron-updater";

ipcMain.handle("updater:check", async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("updater:download", async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("updater:install", () => {
  autoUpdater.quitAndInstall();
});
```

## Preload API

```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from "electron";

const updaterAPI = {
  checkForUpdates: () => ipcRenderer.invoke("updater:check"),
  downloadUpdate: () => ipcRenderer.invoke("updater:download"),
  installUpdate: () => ipcRenderer.invoke("updater:install"),

  onUpdateAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on("update:available", (_, info) => callback(info));
    return () => ipcRenderer.removeAllListeners("update:available");
  },

  onDownloadProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on("update:progress", (_, progress) => callback(progress));
    return () => ipcRenderer.removeAllListeners("update:progress");
  },

  onUpdateDownloaded: (callback: (info: any) => void) => {
    ipcRenderer.on("update:downloaded", (_, info) => callback(info));
    return () => ipcRenderer.removeAllListeners("update:downloaded");
  },
};

contextBridge.exposeInMainWorld("updater", updaterAPI);
```

## Renderer UI

```typescript
// renderer/UpdateNotification.tsx
import { useEffect, useState } from "react";

interface UpdateInfo {
  version: string;
  releaseDate: string;
}

export function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<
    "idle" | "checking" | "downloading" | "ready"
  >("idle");

  useEffect(() => {
    const cleanup1 = window.updater.onUpdateAvailable((info) => {
      setUpdateInfo(info);
      setStatus("idle");
    });

    const cleanup2 = window.updater.onDownloadProgress((p) => {
      setProgress(p.percent);
      setStatus("downloading");
    });

    const cleanup3 = window.updater.onUpdateDownloaded(() => {
      setStatus("ready");
    });

    return () => {
      cleanup1();
      cleanup2();
      cleanup3();
    };
  }, []);

  if (!updateInfo) return null;

  return (
    <div className="update-notification">
      {status === "idle" && (
        <>
          <p>新しいバージョン {updateInfo.version} が利用可能です</p>
          <button onClick={() => window.updater.downloadUpdate()}>
            ダウンロード
          </button>
        </>
      )}
      {status === "downloading" && (
        <div>
          <p>ダウンロード中... {progress.toFixed(0)}%</p>
          <progress value={progress} max={100} />
        </div>
      )}
      {status === "ready" && (
        <>
          <p>更新の準備ができました</p>
          <button onClick={() => window.updater.installUpdate()}>
            今すぐ再起動してインストール
          </button>
        </>
      )}
    </div>
  );
}
```

## 更新配信オプション

### GitHub Releases

```yaml
# electron-builder.yml
publish:
  - provider: github
    owner: your-org
    repo: your-app
    releaseType: release
```

### S3

```yaml
publish:
  - provider: s3
    bucket: your-bucket
    region: us-east-1
    path: /updates
```

### カスタムサーバー

```yaml
publish:
  - provider: generic
    url: https://update.example.com
```

## チェックリスト

- [ ] electron-updaterがインストールされている
- [ ] electron-builder.yml/package.jsonにpublish設定がある
- [ ] 更新イベントをRendererに通知している
- [ ] ダウンロード進捗を表示している
- [ ] エラーハンドリングが実装されている
- [ ] 開発環境では更新チェックをスキップしている
