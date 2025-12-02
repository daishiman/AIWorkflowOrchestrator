---
description: |
  Electron自動更新システム構築（electron-updater）
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
argument-hint: [--provider github|s3|generic]
model: sonnet
---

# Electron自動更新システム構築コマンド

## 目的

electron-updaterを使用した自動更新システムを構築します。
更新サービス、IPC統合、更新通知UIまで一貫して実装します。

## 使用方法

```bash
/ai:setup-electron-updater [--provider github|s3|generic]
```

### 引数

- `--provider` (オプション): 配布先プロバイダー
  - `github`: GitHub Releases（デフォルト）
  - `s3`: AWS S3
  - `generic`: カスタムサーバー

## 実行フロー

### Phase 1: 要件確認

1. 配布先プロバイダーの確認
2. リリースチャネル設計（stable/beta/alpha）
3. 更新UIの要件確認

### Phase 2: electron-builder設定

```yaml
# electron-builder.yml
publish:
  provider: github
  owner: your-org
  repo: your-app
  releaseType: release
```

### Phase 3: UpdateService実装

```typescript
// src/main/services/updateService.ts
import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';

export class UpdateService {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    autoUpdater.on('checking-for-update', () => {
      this.sendToRenderer('update-checking');
    });

    autoUpdater.on('update-available', (info) => {
      this.sendToRenderer('update-available', info);
    });

    autoUpdater.on('update-not-available', () => {
      this.sendToRenderer('update-not-available');
    });

    autoUpdater.on('download-progress', (progress) => {
      this.sendToRenderer('update-progress', progress);
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.sendToRenderer('update-downloaded', info);
    });

    autoUpdater.on('error', (error) => {
      this.sendToRenderer('update-error', error.message);
    });
  }

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  async checkForUpdates(): Promise<void> {
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }

  async downloadUpdate(): Promise<void> {
    await autoUpdater.downloadUpdate();
  }

  quitAndInstall(): void {
    autoUpdater.quitAndInstall();
  }

  private sendToRenderer(channel: string, data?: unknown): void {
    this.mainWindow?.webContents.send(channel, data);
  }
}
```

### Phase 4: IPC統合

```typescript
// src/main/ipc/update.ts
import { ipcMain } from 'electron';
import { UpdateService } from '../services/updateService';

export function registerUpdateHandlers(updateService: UpdateService): void {
  ipcMain.handle('update:check', async () => {
    await updateService.checkForUpdates();
  });

  ipcMain.handle('update:download', async () => {
    await updateService.downloadUpdate();
  });

  ipcMain.handle('update:install', () => {
    updateService.quitAndInstall();
  });
}
```

### Phase 5: Renderer側フック

```typescript
// src/renderer/hooks/useAutoUpdate.ts
import { useState, useEffect } from 'react';

export function useAutoUpdate() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'ready'>('idle');
  const [progress, setProgress] = useState(0);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    window.electronAPI.onUpdateStatus((event, data) => {
      switch (event) {
        case 'update-checking':
          setStatus('checking');
          break;
        case 'update-available':
          setStatus('available');
          setUpdateInfo(data);
          break;
        case 'update-progress':
          setStatus('downloading');
          setProgress(data.percent);
          break;
        case 'update-downloaded':
          setStatus('ready');
          break;
      }
    });
  }, []);

  const checkForUpdates = () => window.electronAPI.checkForUpdates();
  const downloadUpdate = () => window.electronAPI.downloadUpdate();
  const installUpdate = () => window.electronAPI.installUpdate();

  return { status, progress, updateInfo, checkForUpdates, downloadUpdate, installUpdate };
}
```

## エージェント起動

Task ツールで `@electron-devops` エージェントを起動し、以下を依頼:

コンテキスト:
- プロバイダー: "$ARGUMENTS" または "github"

@electron-devops エージェントに以下を依頼:
- Phase 1: 要件確認と配布戦略設計
- Phase 2: electron-builder publish設定
- Phase 3: UpdateService実装
- Phase 4: IPC統合
- Phase 5: Renderer側フック/UI

期待される成果物:
- electron-builder.yml（publish設定追加）
- src/main/services/updateService.ts
- src/main/ipc/update.ts
- src/renderer/hooks/useAutoUpdate.ts

品質基準:
- すべてのイベントがハンドリングされている
- エラーハンドリングが実装されている
- Renderer側に状態が通知されている

## 成果物

- `electron-builder.yml` - publish設定追加
- `src/main/services/updateService.ts` - 更新サービス
- `src/main/ipc/update.ts` - IPCハンドラー
- `src/renderer/hooks/useAutoUpdate.ts` - Reactフック

## 使用例

```bash
# GitHub Releases を使用
/ai:setup-electron-updater

# S3 を使用
/ai:setup-electron-updater --provider s3

# カスタムサーバー
/ai:setup-electron-updater --provider generic
```

## 注意事項

- 署名済みビルドでテストすること
- 開発環境では自動更新は動作しない
- リリース前に必ずテストすること

## 参照

- `.claude/agents/electron-devops.md`
- `.claude/skills/electron-distribution/SKILL.md`
