# ビルド設定ガイド

このガイドはElectronアプリケーションのビルド設定ファイルの作成と検証方法を説明します。

## 概要

electron-builderを使用したElectronアプリケーションのビルドには、適切な設定ファイルが必要です。主に以下の2つの方法で設定を管理します：

1. package.jsonの`build`セクション
2. electron-builder.yml（または.json）

## package.json 必須フィールド

### 基本情報

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "My Electron Application",
  "main": "dist/main.js",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT"
}
```

### ビルド設定セクション

```json
{
  "build": {
    "appId": "com.example.myapp",
    "productName": "My App",
    "directories": {
      "output": "dist",
      "buildResources": "build"
    },
    "files": ["dist/**/*", "node_modules/**/*", "package.json"],
    "mac": {
      "category": "public.app-category.productivity",
      "target": ["dmg", "zip"]
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Utility"
    }
  }
}
```

## electron-builder.yml 形式

package.jsonを軽量に保つため、詳細な設定は別ファイルに分離できます：

```yaml
appId: com.example.myapp
productName: My App

directories:
  output: dist
  buildResources: build

files:
  - dist/**/*
  - node_modules/**/*
  - package.json

mac:
  category: public.app-category.productivity
  target:
    - dmg
    - zip
  icon: build/icon.icns

win:
  target:
    - target: nsis
      arch:
        - x64
        - ia32
  icon: build/icon.ico

linux:
  target:
    - AppImage
    - deb
  category: Utility
  icon: build/icon.png
```

## 検証チェックリスト

### 必須フィールド

- [ ] appId: リバースドメイン形式（例: com.company.app）
- [ ] productName: アプリケーション表示名
- [ ] directories.output: ビルド出力先
- [ ] files: 含めるファイルパターン

### プラットフォーム固有設定

#### macOS

- [ ] mac.category: アプリケーションカテゴリ
- [ ] mac.target: ビルドターゲット（dmg, pkg, mas等）
- [ ] mac.icon: アイコンファイル（.icns）

#### Windows

- [ ] win.target: ビルドターゲット（nsis, portable等）
- [ ] win.icon: アイコンファイル（.ico）

#### Linux

- [ ] linux.target: ビルドターゲット（AppImage, deb, rpm等）
- [ ] linux.category: デスクトップエントリカテゴリ

## コード署名設定

### macOS

```yaml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
```

環境変数：

- `CSC_LINK`: .p12証明書ファイルのパス
- `CSC_KEY_PASSWORD`: 証明書のパスワード

### Windows

```yaml
win:
  certificateFile: path/to/cert.pfx
  certificatePassword: ${WIN_CERT_PASSWORD}
  signingHashAlgorithms:
    - sha256
  rfc3161TimeStampServer: http://timestamp.digicert.com
```

環境変数：

- `WIN_CSC_LINK`: .pfx証明書ファイルのパス
- `WIN_CSC_KEY_PASSWORD`: 証明書のパスワード

## よくある設定エラー

### appIdの形式エラー

❌ 不正:

```yaml
appId: my-app
appId: MyApp
```

✅ 正しい:

```yaml
appId: com.example.myapp
```

### ファイルパターンの誤り

❌ 不正（node_modulesが大きすぎる）:

```yaml
files:
  - "**/*"
```

✅ 正しい（必要なファイルのみ）:

```yaml
files:
  - dist/**/*
  - node_modules/**/*
  - "!node_modules/*/{CHANGELOG.md,README.md,readme.md}"
  - package.json
```

### アイコンファイルの欠落

各プラットフォームで適切な形式のアイコンを用意：

- macOS: .icns（1024x1024を含む複数サイズ）
- Windows: .ico（256x256を含む複数サイズ）
- Linux: .png（512x512推奨）

## 設定検証コマンド

```bash
# 設定ファイルの構文チェック
npx electron-builder --help

# ドライラン（実際にビルドせず設定を検証）
npx electron-builder --dir

# 特定プラットフォームの設定確認
npx electron-builder build --mac --dir
```

## 参照

- [electron-builder Configuration](https://www.electron.build/configuration/configuration)
- Level1_basics.md: 基本的なビルドワークフロー
- Level2_intermediate.md: プラットフォーム固有の設定パターン
