# 自動更新実装詳細

## electron-updater の仕組み

### 更新フロー

```
1. アプリ起動
   ↓
2. 更新サーバーに確認 (checkForUpdates)
   ↓
3. 新バージョン検出
   ↓
4. ダウンロード (downloadUpdate)
   ↓
5. インストール (quitAndInstall)
   ↓
6. アプリ再起動
```

### 更新マニフェスト

GitHub Releasesの場合、`latest.yml`（または`latest-mac.yml`、`latest-linux.yml`）が自動生成されます。

```yaml
# latest.yml (Windows)
version: 1.2.3
files:
  - url: Your-App-1.2.3-win.exe
    sha512: base64-hash
    size: 12345678
path: Your-App-1.2.3-win.exe
sha512: base64-hash
releaseDate: '2024-01-15T10:30:00.000Z'
```

## 実装パターン

### 基本的な更新サービス

```typescript
// main/services/updateService.ts
import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';
import { app, BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';

export class UpdateService {
  private mainWindow: BrowserWindow | null = null;
  private isUpdateDownloaded = false;

  constructor() {
    // ログ設定
    autoUpdater.logger = log;

    // 設定
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    this.setupEventListeners();
    this.setupIpcHandlers();
  }

  setMainWindow(win: BrowserWindow): void {
    this.mainWindow = win;
  }

  private setupEventListeners(): void {
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
      this.sendToRenderer('update:checking');
    });

    autoUpdater.on('update-available', (info: UpdateInfo) => {
      log.info('Update available:', info.version);
      this.sendToRenderer('update:available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseDate: info.releaseDate,
      });
    });

    autoUpdater.on('update-not-available', () => {
      log.info('Update not available');
      this.sendToRenderer('update:not-available');
    });

    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      log.info(`Download progress: ${progress.percent.toFixed(1)}%`);
      this.sendToRenderer('update:progress', {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      });
    });

    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      log.info('Update downloaded:', info.version);
      this.isUpdateDownloaded = true;
      this.sendToRenderer('update:downloaded', {
        version: info.version,
      });
    });

    autoUpdater.on('error', (error) => {
      log.error('Update error:', error);
      this.sendToRenderer('update:error', {
        message: error.message,
      });
    });
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('update:check', () => this.checkForUpdates());
    ipcMain.handle('update:download', () => this.downloadUpdate());
    ipcMain.handle('update:install', () => this.installUpdate());
    ipcMain.handle('update:getStatus', () => ({
      isDownloaded: this.isUpdateDownloaded,
    }));
  }

  private sendToRenderer(channel: string, data?: unknown): void {
    this.mainWindow?.webContents.send(channel, data);
  }

  async checkForUpdates(): Promise<void> {
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      log.error('Check for updates failed:', error);
    }
  }

  downloadUpdate(): void {
    autoUpdater.downloadUpdate();
  }

  installUpdate(): void {
    // アプリを終了して更新をインストール
    autoUpdater.quitAndInstall(
      false, // サイレントインストール
      true   // インストール後に起動
    );
  }
}

// シングルトンインスタンス
export const updateService = new UpdateService();
```

### Renderer側のUIコンポーネント

```tsx
// renderer/components/UpdateManager.tsx
import { useEffect, useState, useCallback } from 'react';

interface UpdateStatus {
  checking: boolean;
  available: boolean;
  downloading: boolean;
  downloaded: boolean;
  error: string | null;
  version: string | null;
  progress: number;
}

export function UpdateManager() {
  const [status, setStatus] = useState<UpdateStatus>({
    checking: false,
    available: false,
    downloading: false,
    downloaded: false,
    error: null,
    version: null,
    progress: 0,
  });

  useEffect(() => {
    // イベントリスナーを設定
    const cleanups = [
      window.electronAPI.onUpdateChecking(() => {
        setStatus(s => ({ ...s, checking: true }));
      }),

      window.electronAPI.onUpdateAvailable((info) => {
        setStatus(s => ({
          ...s,
          checking: false,
          available: true,
          version: info.version,
        }));
      }),

      window.electronAPI.onUpdateNotAvailable(() => {
        setStatus(s => ({ ...s, checking: false, available: false }));
      }),

      window.electronAPI.onUpdateProgress((info) => {
        setStatus(s => ({
          ...s,
          downloading: true,
          progress: info.percent,
        }));
      }),

      window.electronAPI.onUpdateDownloaded((info) => {
        setStatus(s => ({
          ...s,
          downloading: false,
          downloaded: true,
          version: info.version,
        }));
      }),

      window.electronAPI.onUpdateError((info) => {
        setStatus(s => ({
          ...s,
          checking: false,
          downloading: false,
          error: info.message,
        }));
      }),
    ];

    // 起動時に更新チェック
    setTimeout(() => {
      window.electronAPI.checkForUpdates();
    }, 3000);

    return () => cleanups.forEach(cleanup => cleanup());
  }, []);

  const handleDownload = useCallback(() => {
    window.electronAPI.downloadUpdate();
  }, []);

  const handleInstall = useCallback(() => {
    window.electronAPI.installUpdate();
  }, []);

  // 更新がない場合は何も表示しない
  if (!status.available && !status.downloaded && !status.error) {
    return null;
  }

  return (
    <div className="update-banner">
      {status.available && !status.downloading && !status.downloaded && (
        <div className="update-available">
          <span>バージョン {status.version} が利用可能です</span>
          <button onClick={handleDownload}>ダウンロード</button>
        </div>
      )}

      {status.downloading && (
        <div className="update-downloading">
          <span>ダウンロード中: {status.progress.toFixed(0)}%</span>
          <progress value={status.progress} max={100} />
        </div>
      )}

      {status.downloaded && (
        <div className="update-ready">
          <span>更新の準備完了</span>
          <button onClick={handleInstall}>再起動してインストール</button>
        </div>
      )}

      {status.error && (
        <div className="update-error">
          <span>更新エラー: {status.error}</span>
        </div>
      )}
    </div>
  );
}
```

## リリースチャネル

### チャネル設定

```typescript
// 安定版チャネル
autoUpdater.channel = 'stable';
autoUpdater.allowPrerelease = false;

// ベータチャネル
autoUpdater.channel = 'beta';
autoUpdater.allowPrerelease = true;

// アルファチャネル
autoUpdater.channel = 'alpha';
autoUpdater.allowPrerelease = true;
```

### バージョニング

```
stable: 1.0.0, 1.0.1, 1.1.0
beta:   1.1.0-beta.1, 1.1.0-beta.2
alpha:  1.1.0-alpha.1, 2.0.0-alpha.1
```

### ユーザー設定との連携

```typescript
import Store from 'electron-store';

const store = new Store<{ updateChannel: string }>();

function setUpdateChannel(channel: 'stable' | 'beta' | 'alpha'): void {
  store.set('updateChannel', channel);
  autoUpdater.channel = channel;
  autoUpdater.allowPrerelease = channel !== 'stable';
}

// 起動時に設定を読み込み
const savedChannel = store.get('updateChannel', 'stable');
setUpdateChannel(savedChannel as 'stable' | 'beta' | 'alpha');
```

## ロールバック戦略

### バージョン履歴の保持

```typescript
// 前のバージョンを保持
const store = new Store<{ previousVersion: string }>();

autoUpdater.on('update-downloaded', (info) => {
  store.set('previousVersion', app.getVersion());
});

// ロールバック機能
async function rollback(): Promise<void> {
  const previousVersion = store.get('previousVersion');
  if (previousVersion) {
    // 前のバージョンをダウンロード・インストール
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'owner',
      repo: 'repo',
      // 特定バージョンを指定
    });
  }
}
```

## トラブルシューティング

### よくある問題

| 問題 | 原因 | 解決策 |
|------|------|--------|
| 更新が検出されない | キャッシュ | `autoUpdater.forceDevUpdateConfig = true` |
| 署名エラー | 証明書の問題 | 署名設定を確認 |
| ダウンロードが遅い | サーバー帯域 | CDN使用を検討 |
| インストール失敗 | 権限不足 | 管理者権限で実行 |
