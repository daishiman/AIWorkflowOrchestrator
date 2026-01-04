# 更新サーバーガイド

## 概要

Electron自動更新の配信インフラストラクチャの構築パターン。

## 配信オプション比較

| オプション       | 費用       | 複雑さ | スケーラビリティ |
| ---------------- | ---------- | ------ | ---------------- |
| GitHub Releases  | 無料       | 低     | 高               |
| S3 + CloudFront  | 従量課金   | 中     | 高               |
| カスタムサーバー | サーバー費 | 高     | 可変             |

## GitHub Releases

### 設定

```yaml
# electron-builder.yml
publish:
  - provider: github
    owner: your-org
    repo: your-app
    releaseType: release
    private: false
```

### リリースプロセス

```bash
# バージョンをバンプ
pnpm version patch

# ビルドと公開
pnpm run build
pnpm run publish
```

### GitHub Actions

```yaml
# .github/workflows/release.yml
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
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Build and publish
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
        run: pnpm run publish
```

## S3 + CloudFront

### 設定

```yaml
# electron-builder.yml
publish:
  - provider: s3
    bucket: my-app-updates
    region: us-east-1
    path: /releases
    acl: public-read
```

### バケットポリシー

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-app-updates/releases/*"
    }
  ]
}
```

### CloudFront設定

```typescript
// CDK例
const distribution = new cloudfront.Distribution(this, "UpdateDistribution", {
  defaultBehavior: {
    origin: new origins.S3Origin(updateBucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
  },
});
```

## カスタムサーバー

### 更新マニフェスト

```json
// latest.json
{
  "version": "1.2.0",
  "releaseDate": "2024-01-01",
  "files": [
    {
      "url": "https://update.example.com/my-app-1.2.0.exe",
      "sha512": "..."
    }
  ],
  "path": "my-app-1.2.0.exe",
  "sha512": "..."
}
```

### Express.jsサーバー

```typescript
// update-server.ts
import express from "express";
import path from "path";

const app = express();
const RELEASES_DIR = "./releases";

// マニフェストを返す
app.get("/update/:platform/latest.json", (req, res) => {
  const { platform } = req.params;
  const manifestPath = path.join(RELEASES_DIR, platform, "latest.json");
  res.sendFile(manifestPath);
});

// ファイルをダウンロード
app.get("/download/:file", (req, res) => {
  const { file } = req.params;
  const filePath = path.join(RELEASES_DIR, file);
  res.download(filePath);
});

app.listen(3000, () => {
  console.log("Update server running on port 3000");
});
```

## 段階的ロールアウト

### 実装例

```typescript
// main/updater.ts
import { autoUpdater } from "electron-updater";
import { machineId } from "node-machine-id";

async function shouldReceiveUpdate(version: string): Promise<boolean> {
  const id = await machineId();
  const hash = hashString(id + version);
  const rolloutPercent = await fetchRolloutPercent(version);

  // ハッシュを使って決定論的にロールアウト対象を決定
  return hash % 100 < rolloutPercent;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
```

### ロールアウト設定

```json
// rollout-config.json
{
  "1.2.0": {
    "percent": 10,
    "startDate": "2024-01-01",
    "schedule": [
      { "date": "2024-01-02", "percent": 25 },
      { "date": "2024-01-05", "percent": 50 },
      { "date": "2024-01-10", "percent": 100 }
    ]
  }
}
```

## モニタリング

### 更新メトリクス

```typescript
// 更新成功を記録
autoUpdater.on("update-downloaded", async (info) => {
  await trackEvent("update_downloaded", {
    version: info.version,
    previousVersion: app.getVersion(),
  });
});

// 更新エラーを記録
autoUpdater.on("error", async (err) => {
  await trackEvent("update_error", {
    error: err.message,
    version: app.getVersion(),
  });
});
```

## チェックリスト

- [ ] HTTPSでの配信が設定されている
- [ ] 適切なキャッシュ設定がある
- [ ] ロールバック手順が文書化されている
- [ ] モニタリングが設定されている
- [ ] 段階的ロールアウトの戦略がある
