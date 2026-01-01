# 自動更新ガイド

このガイドはElectronアプリケーションに自動更新機構を実装する方法を説明します。

## 概要

electron-updaterを使用することで、エンドユーザーが常に最新版を使用できる安全な自動更新機構を実装できます。

主な機能：

- バックグラウンドでの更新チェック
- 差分更新（Delta updates）
- 段階的ロールアウト
- 署名検証
- ロールバック対応

## 基本セットアップ

### 依存関係のインストール

```bash
pnpm add electron-updater
```

### Main Process での実装

```typescript
// main.ts
import { app, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

// ログ設定
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("index.html");

  // アプリ起動時に更新をチェック
  if (!app.isPackaged) {
    console.log("Development mode: skipping auto-update");
  } else {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 3000);
  }
}

app.whenReady().then(createWindow);

// 更新イベントハンドラー
autoUpdater.on("checking-for-update", () => {
  log.info("Checking for update...");
});

autoUpdater.on("update-available", (info) => {
  log.info("Update available:", info);
});

autoUpdater.on("update-not-available", (info) => {
  log.info("Update not available:", info);
});

autoUpdater.on("error", (err) => {
  log.error("Error in auto-updater:", err);
});

autoUpdater.on("download-progress", (progressObj) => {
  log.info(`Download speed: ${progressObj.bytesPerSecond}`);
  log.info(`Downloaded ${progressObj.percent}%`);
});

autoUpdater.on("update-downloaded", (info) => {
  log.info("Update downloaded:", info);
  // ユーザーに通知して再起動を促す
  autoUpdater.quitAndInstall();
});
```

### ユーザー通知の実装

```typescript
import { dialog } from "electron";

autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "アップデート利用可能",
    message: "新しいバージョンが利用可能です。ダウンロード中です...",
    buttons: ["OK"],
  });
});

autoUpdater.on("update-downloaded", () => {
  dialog
    .showMessageBox({
      type: "info",
      title: "アップデート準備完了",
      message: "アップデートの準備ができました。今すぐ再起動しますか？",
      buttons: ["今すぐ再起動", "後で"],
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
});
```

## 更新サーバー設定

### package.json での設定

```json
{
  "build": {
    "publish": [
      {
        "provider": "generic",
        "url": "https://updates.example.com/releases"
      }
    ]
  }
}
```

### electron-builder.yml での設定

```yaml
publish:
  - provider: generic
    url: https://updates.example.com/releases
  - provider: github
    owner: your-username
    repo: your-repo
```

### 対応プロバイダー

#### Generic（汎用HTTP）

```yaml
publish:
  provider: generic
  url: https://updates.example.com
  channel: stable
```

#### GitHub Releases

```yaml
publish:
  provider: github
  owner: your-username
  repo: your-repo
  releaseType: release # または draft, prerelease
```

#### Amazon S3

```yaml
publish:
  provider: s3
  bucket: my-bucket
  region: us-east-1
  path: releases
```

#### Spaces (DigitalOcean)

```yaml
publish:
  provider: spaces
  name: my-space
  region: nyc3
```

## 更新メタデータ

### latest.yml の生成

electron-builderは自動的に以下のメタデータファイルを生成します：

- latest.yml (Windows/Linux)
- latest-mac.yml (macOS)
- latest-linux.yml (Linux)

#### latest.yml の例

```yaml
version: 1.0.0
files:
  - url: MyApp-Setup-1.0.0.exe
    sha512: abc123...
    size: 45678901
path: MyApp-Setup-1.0.0.exe
sha512: abc123...
releaseDate: "2025-01-01T00:00:00.000Z"
```

### 手動でのメタデータ配置

```
releases/
  ├── latest.yml
  ├── latest-mac.yml
  ├── latest-linux.yml
  ├── MyApp-1.0.0.dmg
  ├── MyApp-Setup-1.0.0.exe
  └── MyApp-1.0.0.AppImage
```

## 署名検証

### macOS

Notarizationを実施することで、自動的に署名検証が有効になります。

```yaml
mac:
  hardenedRuntime: true
  gatekeeperAssess: false
  notarize:
    teamId: YOUR_TEAM_ID
```

### Windows

```yaml
win:
  publisherName: "Your Company Name"
  certificateFile: path/to/cert.pfx
  certificatePassword: ${WIN_CERT_PASSWORD}
  signingHashAlgorithms:
    - sha256
  rfc3161TimeStampServer: http://timestamp.digicert.com
```

## 段階的ロールアウト

### 設定

```typescript
// main.ts
import { autoUpdater } from "electron-updater";

// ロールアウト対象のパーセンテージを設定
autoUpdater.allowDowngrade = false;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// カスタムロジックで段階的配布
const userId = getUserId(); // ユーザー固有のID
const hash = hashCode(userId);
const percentage = hash % 100;

if (percentage < 10) {
  // 最初の10%のユーザーにのみ配信
  autoUpdater.checkForUpdatesAndNotify();
}
```

### サーバーサイドでの実装

```javascript
// Node.js Express サーバー例
app.get("/releases/latest.yml", (req, res) => {
  const userId = req.query.userId;
  const rolloutPercentage = getRolloutPercentage(); // DBから取得

  const hash = hashCode(userId);
  if (hash % 100 < rolloutPercentage) {
    res.sendFile("latest.yml");
  } else {
    res.sendFile("latest-previous.yml"); // 旧バージョン
  }
});
```

## 更新チャネル

### 複数チャネルの設定

```yaml
publish:
  - provider: generic
    url: https://updates.example.com
    channel: stable
  - provider: generic
    url: https://updates-beta.example.com
    channel: beta
```

### チャネルの切り替え

```typescript
// main.ts
import { autoUpdater } from "electron-updater";

// 環境変数またはユーザー設定から取得
const channel = process.env.UPDATE_CHANNEL || "stable";
autoUpdater.channel = channel;

autoUpdater.setFeedURL({
  provider: "generic",
  url: `https://updates.example.com/${channel}`,
});
```

## 差分更新（Delta Updates）

macOSでのみ利用可能。ファイルサイズを削減し、ダウンロード時間を短縮します。

```typescript
autoUpdater.autoDownload = true;
autoUpdater.allowPrerelease = false;

// 差分更新は自動的に適用される（macOSのみ）
```

## エラーハンドリング

### 更新失敗時のリトライ

```typescript
import { autoUpdater } from "electron-updater";
import log from "electron-log";

let retryCount = 0;
const MAX_RETRIES = 3;

autoUpdater.on("error", (error) => {
  log.error("Update error:", error);

  if (retryCount < MAX_RETRIES) {
    retryCount++;
    log.info(`Retrying update check (${retryCount}/${MAX_RETRIES})...`);

    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 60000); // 1分後にリトライ
  } else {
    log.error("Max retries reached. Giving up on auto-update.");
  }
});

autoUpdater.on("update-downloaded", () => {
  retryCount = 0; // 成功したらリセット
});
```

### ネットワークエラーのハンドリング

```typescript
import { net } from "electron";

function checkNetworkConnectivity() {
  return new Promise((resolve) => {
    const request = net.request("https://www.google.com");
    request.on("response", () => resolve(true));
    request.on("error", () => resolve(false));
    request.end();
  });
}

async function safeCheckForUpdates() {
  const isOnline = await checkNetworkConnectivity();
  if (isOnline) {
    autoUpdater.checkForUpdates();
  } else {
    log.warn("No network connectivity. Skipping update check.");
  }
}
```

## ロールバック戦略

### バージョン履歴の保持

```typescript
// 更新前にバックアップを作成
import { app } from "electron";
import * as fs from "fs";
import * as path from "path";

autoUpdater.on("update-downloaded", () => {
  const backupDir = path.join(app.getPath("userData"), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const currentVersion = app.getVersion();
  const backupPath = path.join(backupDir, `v${currentVersion}`);

  // 現在のバージョンをバックアップ
  // （実際の実装はプラットフォームごとに異なる）
});
```

### 問題発生時の自動ロールバック

```typescript
import { autoUpdater } from "electron-updater";

autoUpdater.on("update-downloaded", (info) => {
  const newVersion = info.version;

  // 更新を適用して再起動
  autoUpdater.quitAndInstall();

  // 起動後にヘルスチェック
  app.on("ready", async () => {
    const isHealthy = await performHealthCheck();

    if (!isHealthy) {
      log.error(`Version ${newVersion} failed health check. Rolling back...`);
      // ロールバック処理
      await rollbackToPreviousVersion();
    }
  });
});
```

## テスト

### 開発環境でのテスト

```typescript
// 開発モードでは本番サーバーではなくローカルサーバーを使用
if (process.env.NODE_ENV === "development") {
  autoUpdater.setFeedURL({
    provider: "generic",
    url: "http://localhost:8080/releases",
  });
  autoUpdater.forceDevUpdateConfig = true;
}
```

### 手動トリガー

```typescript
// Renderer Process
ipcRenderer.send("check-for-updates");

// Main Process
ipcMain.on("check-for-updates", () => {
  autoUpdater.checkForUpdates();
});
```

## CI/CD統合

### GitHub Actions での自動公開

```yaml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - run: pnpm install
      - run: pnpm build

      - name: Publish
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
        run: pnpm electron-builder --publish always
```

## ベストプラクティス

### 更新チェックのタイミング

- アプリ起動時（遅延を入れる）
- 定期的なバックグラウンドチェック（1時間〜24時間ごと）
- ユーザーが手動でトリガー

```typescript
// 起動時（3秒遅延）
setTimeout(() => {
  autoUpdater.checkForUpdatesAndNotify();
}, 3000);

// 定期チェック（4時間ごと）
setInterval(
  () => {
    autoUpdater.checkForUpdatesAndNotify();
  },
  4 * 60 * 60 * 1000,
);
```

### ユーザー体験の考慮

- サイレント更新を避け、常にユーザーに通知
- ダウンロード進捗を表示
- 再起動のタイミングをユーザーに選択させる
- 重要な作業中は更新を延期

### セキュリティ

- 必ずHTTPSを使用
- 署名検証を有効化
- チェックサムを検証
- 更新サーバーへのアクセスを制限

## トラブルシューティング

### 更新が検出されない

```typescript
// ログを詳細モードに
autoUpdater.logger.transports.file.level = "debug";

// 手動でフィードURLを確認
console.log("Feed URL:", autoUpdater.getFeedURL());
```

### macOS での "Update not signed" エラー

原因: Notarizationが未実施

対処: `xcrun notarytool` で公証を実施

### Windows での SmartScreen 警告

原因: EV証明書未使用またはダウンロード数が少ない

対処: EV証明書を使用し、時間経過とともに信頼度が向上するのを待つ

## 参照

- [electron-updater Documentation](https://www.electron.build/auto-update)
- code-signing.md: 署名の詳細
- Level3_advanced.md: 高度な更新戦略
