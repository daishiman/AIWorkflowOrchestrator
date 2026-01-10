# リリースワークフロー詳細ガイド

## 概要

Electronアプリケーションのリリースワークフローは、ビルド、署名、配布の3段階で構成される。CI/CDパイプラインと統合することで、一貫した品質と効率的なリリースサイクルを実現する。

## GitHub Actions ワークフロー設計

### 基本構成

```yaml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: pnpm install

      - name: Build and Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
        run: pnpm run release
```

### コード署名設定

#### macOS

```json
{
  "mac": {
    "category": "public.app-category.developer-tools",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist",
    "notarize": {
      "teamId": "YOUR_TEAM_ID"
    }
  }
}
```

#### Windows

```json
{
  "win": {
    "target": ["nsis", "portable"],
    "sign": "./scripts/sign.js",
    "signingHashAlgorithms": ["sha256"],
    "certificateSubjectName": "Your Company Name"
  }
}
```

## バージョン管理戦略

### Semantic Versioning

- **MAJOR**: 破壊的変更（既存機能の互換性なし）
- **MINOR**: 新機能追加（後方互換性あり）
- **PATCH**: バグ修正（後方互換性あり）

### リリースチャンネル

| チャンネル | 用途               | 更新頻度  |
| ---------- | ------------------ | --------- |
| stable     | 安定版ユーザー向け | 月1回程度 |
| beta       | テスター向け       | 週1回程度 |
| alpha      | 内部テスト         | 毎日可能  |

## electron-builder 設定

### package.json 設定例

```json
{
  "build": {
    "appId": "com.example.app",
    "productName": "MyApp",
    "directories": {
      "output": "dist"
    },
    "publish": {
      "provider": "github",
      "owner": "your-org",
      "repo": "your-repo"
    }
  }
}
```

## ロールバック戦略

### 自動ロールバック条件

1. アプリ起動失敗が3回連続
2. クリティカルエラー報告が閾値を超過
3. ユーザーからの手動ロールバック要求

### ロールバック実装

```typescript
import Store from "electron-store";

const store = new Store();
const MAX_CRASH_COUNT = 3;

function checkCrashCount(): boolean {
  const crashCount = store.get("crashCount", 0) as number;
  if (crashCount >= MAX_CRASH_COUNT) {
    // ロールバックを実行
    return true;
  }
  return false;
}
```

## 品質ゲート

リリース前に以下の品質ゲートを通過する必要がある：

1. **テスト**: 全自動テスト通過
2. **署名**: コード署名の有効性検証
3. **セキュリティ**: 脆弱性スキャン通過
4. **パフォーマンス**: 起動時間が基準値以下
5. **サイズ**: パッケージサイズが上限以下
