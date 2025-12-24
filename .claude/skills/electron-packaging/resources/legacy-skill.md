---
name: .claude/skills/electron-packaging/SKILL.md
description: |
  Electronアプリケーションのビルド・パッケージング専門知識

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/electron-packaging/resources/electron-builder-config.md`: electron-builder詳細設定
  - `.claude/skills/electron-packaging/resources/code-signing.md`: コード署名ガイド
  - `.claude/skills/electron-packaging/resources/platform-specific.md`: プラットフォーム固有設定
  - `.claude/skills/electron-packaging/templates/electron-builder.yml`: ビルド設定テンプレート
  - `.claude/skills/electron-packaging/scripts/build.sh`: ビルドスクリプト

  専門分野:
  - パッケージング: electron-builder、electron-forge
  - コード署名: macOS/Windowsコード署名
  - アイコン生成: 各プラットフォーム用アイコン
  - インストーラー: DMG、NSIS、AppImage

  使用タイミング:
  - Electronアプリをビルドする時
  - 配布用パッケージを作成する時
  - コード署名を設定する時
  - インストーラーをカスタマイズする時

version: 1.0.0
---

# .claude/skills/electron-packaging/SKILL.md

Electronアプリケーションのビルド・パッケージング専門知識

---

## 概要

### 目的

Electronアプリケーションを各プラットフォーム向けに
ビルド・パッケージングし、配布可能な形式で出力する。

### 対象者

- Electronアプリ開発者
- DevOpsエンジニア
- リリースマネージャー

---

## ビルドツール選択

### electron-builder vs electron-forge

| 特徴           | electron-builder       | electron-forge     |
| -------------- | ---------------------- | ------------------ |
| 設定形式       | YAML/JSON              | JavaScript         |
| カスタマイズ性 | 高い                   | 非常に高い         |
| 学習曲線       | 低い                   | やや高い           |
| 自動更新統合   | 内蔵                   | プラグイン         |
| モノレポ対応   | 良好                   | 良好               |
| **推奨ケース** | シンプルなプロジェクト | 高度なカスタマイズ |

---

## electron-builder設定

### 基本設定

```yaml
# electron-builder.yml
appId: com.company.appname
productName: My Electron App
copyright: Copyright © 2024 Company

# ディレクトリ設定
directories:
  output: dist
  buildResources: build

# ファイル設定
files:
  - "dist/**/*"
  - "package.json"
  - "!**/*.{ts,tsx,map}"
  - "!**/node_modules/*/{CHANGELOG.md,README.md}"
  - "!**/node_modules/.bin"

# アイコン
icon: build/icon

# 圧縮設定
asar: true
asarUnpack:
  - "**/*.node"
  - "**/node_modules/sharp/**"

# npmRebuild
npmRebuild: true
nodeGypRebuild: false
```

### macOS設定

```yaml
# electron-builder.yml (macOS section)
mac:
  target:
    - target: dmg
      arch:
        - x64
        - arm64
    - target: zip
      arch:
        - x64
        - arm64

  category: public.app-category.developer-tools
  darkModeSupport: true
  hardenedRuntime: true
  gatekeeperAssess: false

  # エンタイトルメント
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist

  # 署名
  identity: "Developer ID Application: Company Name (TEAM_ID)"

  # ファイル関連付け
  extendInfo:
    NSDocumentsFolderUsageDescription: "ドキュメントへのアクセスが必要です"
    NSDownloadsFolderUsageDescription: "ダウンロードへのアクセスが必要です"

dmg:
  sign: false
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications
  background: build/dmg-background.png
  window:
    width: 540
    height: 380
```

### Windows設定

```yaml
# electron-builder.yml (Windows section)
win:
  target:
    - target: nsis
      arch:
        - x64
        - ia32
    - target: portable
      arch:
        - x64

  # 署名
  sign: ./scripts/sign.js
  certificateFile: ${env.WIN_CERT_FILE}
  certificatePassword: ${env.WIN_CERT_PASSWORD}

  # アイコン（256x256以上推奨）
  icon: build/icon.ico

  # ファイル関連付け
  fileAssociations:
    - ext: myext
      name: My File Type
      description: My Application File
      icon: build/file-icon.ico

nsis:
  oneClick: false
  perMachine: false
  allowToChangeInstallationDirectory: true
  installerIcon: build/installer-icon.ico
  uninstallerIcon: build/uninstaller-icon.ico
  installerHeader: build/installer-header.bmp
  installerSidebar: build/installer-sidebar.bmp
  license: LICENSE.txt
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: My Electron App
```

### Linux設定

```yaml
# electron-builder.yml (Linux section)
linux:
  target:
    - target: AppImage
      arch:
        - x64
    - target: deb
      arch:
        - x64
    - target: rpm
      arch:
        - x64

  category: Development
  maintainer: maintainer@company.com
  vendor: Company Name

  # アイコン（複数サイズ）
  icon: build/icons

  # デスクトップエントリ
  desktop:
    Name: My Electron App
    Comment: A desktop application
    Categories: Development;Utility;

appImage:
  systemIntegration: ask
  license: LICENSE.txt

deb:
  depends:
    - libnotify4
    - libappindicator3-1
  afterInstall: build/scripts/postinst.sh
  afterRemove: build/scripts/postrm.sh

snap:
  grade: stable
  confinement: classic
```

---

## コード署名

### macOS署名

```bash
# 必要な環境変数
export APPLE_ID="your@email.com"
export APPLE_ID_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAM_ID"
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate-password"
```

```plist
<!-- build/entitlements.mac.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.automation.apple-events</key>
    <true/>
</dict>
</plist>
```

### Windows署名

```javascript
// scripts/sign.js
exports.default = async function (configuration) {
  const signTool = require("electron-builder-lib/out/codeSign/windowsCodeSign");

  // Azure SignTool例
  if (process.env.AZURE_KEY_VAULT_URI) {
    await signTool.sign({
      path: configuration.path,
      name: "My Electron App",
      site: "https://myapp.com",
      signToolArgs: [
        "sign",
        "/fd",
        "SHA256",
        "/tr",
        "http://timestamp.digicert.com",
        "/td",
        "SHA256",
        "/kvu",
        process.env.AZURE_KEY_VAULT_URI,
        "/kvc",
        process.env.AZURE_KEY_VAULT_CERT_NAME,
        "/kvi",
        process.env.AZURE_CLIENT_ID,
        "/kvs",
        process.env.AZURE_CLIENT_SECRET,
        "/kvt",
        process.env.AZURE_TENANT_ID,
      ],
    });
  }
};
```

---

## アイコン生成

### 必要なサイズ

```
icons/
├── icon.icns          # macOS (1024x1024以上から自動生成)
├── icon.ico           # Windows (256x256以上推奨)
├── icon.png           # Linux fallback
├── 16x16.png
├── 32x32.png
├── 48x48.png
├── 64x64.png
├── 128x128.png
├── 256x256.png
├── 512x512.png
└── 1024x1024.png      # macOS Retina用
```

### アイコン生成スクリプト

```bash
#!/bin/bash
# scripts/generate-icons.sh

SOURCE="build/icon-source.png"  # 1024x1024以上の元画像

# PNG各サイズ生成
for size in 16 32 48 64 128 256 512 1024; do
  sips -z $size $size "$SOURCE" --out "build/icons/${size}x${size}.png"
done

# macOS icns生成
mkdir -p build/icon.iconset
for size in 16 32 64 128 256 512 1024; do
  sips -z $size $size "$SOURCE" --out "build/icon.iconset/icon_${size}x${size}.png"
  if [ $size -le 512 ]; then
    double=$((size * 2))
    sips -z $double $double "$SOURCE" --out "build/icon.iconset/icon_${size}x${size}@2x.png"
  fi
done
iconutil -c icns build/icon.iconset -o build/icon.icns
rm -rf build/icon.iconset

# Windows ico生成（ImageMagick使用）
convert "build/icons/256x256.png" \
  "build/icons/128x128.png" \
  "build/icons/64x64.png" \
  "build/icons/48x48.png" \
  "build/icons/32x32.png" \
  "build/icons/16x16.png" \
  build/icon.ico

echo "✅ Icons generated successfully"
```

---

## ビルドスクリプト

### package.json設定

```json
{
  "scripts": {
    "build": "npm run build:renderer && npm run build:main",
    "build:renderer": "vite build",
    "build:main": "tsc -p tsconfig.main.json",

    "package": "electron-builder --publish never",
    "package:mac": "electron-builder --mac --publish never",
    "package:win": "electron-builder --win --publish never",
    "package:linux": "electron-builder --linux --publish never",

    "publish": "electron-builder --publish always",
    "publish:mac": "electron-builder --mac --publish always",
    "publish:win": "electron-builder --win --publish always"
  }
}
```

### CI/CDビルド（GitHub Actions）

```yaml
# .github/workflows/build.yml
name: Build & Release

on:
  push:
    tags:
      - "v*"

jobs:
  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Package
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          CSC_LINK: ${{ secrets.MAC_CERTS }}
          CSC_KEY_PASSWORD: ${{ secrets.MAC_CERTS_PASSWORD }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run publish:mac

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Package
        env:
          WIN_CERT_FILE: ${{ secrets.WIN_CERT_FILE }}
          WIN_CERT_PASSWORD: ${{ secrets.WIN_CERT_PASSWORD }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run publish:win

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Package
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run publish -- --linux
```

---

## 最適化

### ビルドサイズ削減

```yaml
# electron-builder.yml
asar: true
asarUnpack:
  - "**/*.node"

# 不要ファイル除外
files:
  - "!**/*.{ts,tsx,map}"
  - "!**/*.d.ts"
  - "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}"
  - "!**/node_modules/.bin"
  - "!**/*.md"
  - "!**/LICENSE*"
  - "!**/.eslintrc*"
  - "!**/.prettier*"
```

### ネイティブモジュール処理

```json
// package.json
{
  "optionalDependencies": {
    "fsevents": "^2.3.3"
  },
  "build": {
    "npmRebuild": true,
    "nodeGypRebuild": false,
    "nativeRebuilder": "parallel"
  }
}
```

---

## トラブルシューティング

### よくある問題

| 問題                 | 原因                 | 解決策                            |
| -------------------- | -------------------- | --------------------------------- |
| 署名エラー           | 証明書の問題         | 環境変数確認、証明書更新          |
| asar読み込みエラー   | ネイティブモジュール | asarUnpackに追加                  |
| アイコン表示されない | サイズ不足           | 各プラットフォーム要件確認        |
| ビルドが遅い         | キャッシュなし       | electron-builder キャッシュ有効化 |

---

## 関連リソース

### 詳細ドキュメント

- `resources/electron-builder-config.md` - 詳細設定
- `resources/code-signing.md` - コード署名ガイド
- `resources/platform-specific.md` - プラットフォーム固有

### テンプレート・スクリプト

- `templates/electron-builder.yml` - ビルド設定
- `scripts/build.sh` - ビルドスクリプト
