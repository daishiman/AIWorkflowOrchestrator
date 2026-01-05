# ビルドプロセスガイド

このガイドはElectronアプリケーションのビルドプロセスの実行方法と最適化手法を説明します。

## 概要

electron-builderを使用したビルドプロセスは以下の段階で実行されます：

1. ビルド前準備（依存関係のインストール、コンパイル）
2. アプリケーションのパッケージング
3. プラットフォーム固有のバイナリ生成
4. コード署名
5. インストーラー生成

## 基本的なビルドコマンド

### 開発モード

```bash
# すべてのファイルをパッケージング（インストーラーは生成しない）
npx electron-builder --dir

# 特定プラットフォームのみ
npx electron-builder --mac --dir
npx electron-builder --win --dir
npx electron-builder --linux --dir
```

### 本番ビルド

```bash
# すべてのプラットフォーム
npx electron-builder -mwl

# macOSのみ
npx electron-builder --mac

# Windowsのみ
npx electron-builder --win

# Linuxのみ
npx electron-builder --linux
```

## ビルド前の準備

### 依存関係のインストール

```bash
# pnpmを使用
pnpm install

# 本番用依存関係のみ（推奨）
pnpm install --prod
```

### TypeScriptのコンパイル

```bash
# アプリケーションコードのビルド
pnpm build

# または
tsc
```

### 環境変数の設定

```bash
# macOS署名用
export CSC_LINK=/path/to/cert.p12
export CSC_KEY_PASSWORD=your_password
export APPLE_ID=your@apple.id
export APPLE_ID_PASSWORD=app_specific_password

# Windows署名用
export WIN_CSC_LINK=/path/to/cert.pfx
export WIN_CSC_KEY_PASSWORD=your_password

# 公証（Notarization）用
export APPLE_TEAM_ID=YOUR_TEAM_ID
```

## ビルドオプション

### プラットフォーム指定

```bash
# macOS
electron-builder --mac
# または
electron-builder -m

# Windows
electron-builder --win
# または
electron-builder -w

# Linux
electron-builder --linux
# または
electron-builder -l

# 複数プラットフォーム
electron-builder -mwl
```

### ターゲット指定

```bash
# macOS: DMGとZIPを生成
electron-builder --mac dmg zip

# Windows: NSISのみ
electron-builder --win nsis

# Linux: AppImageとdeb
electron-builder --linux AppImage deb
```

### アーキテクチャ指定

```bash
# x64のみ
electron-builder --x64

# arm64のみ（macOS M1/M2）
electron-builder --arm64

# universalバイナリ（macOS）
electron-builder --mac --universal

# 複数アーキテクチャ
electron-builder --x64 --arm64
```

## ビルドプロセスの監視

### ログレベル設定

```bash
# デバッグモード（詳細ログ）
DEBUG=electron-builder electron-builder

# より詳細なログ
DEBUG=* electron-builder
```

### ビルド時間の計測

```bash
# Unixシステム
time electron-builder --mac

# Node.jsスクリプト内
const startTime = Date.now();
await build({
  targets: Platform.MAC.createTarget(),
});
const buildTime = Date.now() - startTime;
console.log(`Build completed in ${buildTime}ms`);
```

## エラーハンドリング

### よくあるエラーと対処法

#### エラー: "Application entry file not found"

原因: main フィールドが正しく設定されていない、またはファイルが存在しない

対処:

```json
{
  "main": "dist/main.js" // ビルド後のファイルパスを指定
}
```

#### エラー: "Cannot find module"

原因: 依存関係がインストールされていない、または externals 設定が必要

対処:

```bash
pnpm install

# または electron-builder.yml で externals 設定
```

```yaml
externals:
  - "sharp"
  - "sqlite3"
```

#### エラー: "Code signing failed"

原因: 証明書が無効、パスワードが間違っている、環境変数が未設定

対処:

```bash
# 証明書の確認
security find-identity -v -p codesigning  # macOS

# 環境変数の確認
echo $CSC_LINK
echo $CSC_KEY_PASSWORD
```

## ビルド最適化

### ファイルサイズの削減

#### 不要なファイルの除外

```yaml
files:
  - dist/**/*
  - node_modules/**/*
  - "!node_modules/*/{CHANGELOG.md,README.md,*.map}"
  - "!node_modules/.bin"
  - "!node_modules/*/test"
  - "!**/*.{md,markdown,txt,log}"
```

#### asar アーカイブの使用

```yaml
asar: true
asarUnpack:
  - "**/*.node" # ネイティブモジュールは解凍
```

### ビルド時間の短縮

#### キャッシュの活用

```yaml
# CI環境でキャッシュを使用
directories:
  output: dist
  cache: .cache
```

#### 並列ビルドの回避

electron-builderは内部で並列処理を行うため、複数プラットフォームを同時にビルドすると競合が発生する可能性があります。

```bash
# 推奨: 順次実行
electron-builder --mac && \
electron-builder --win && \
electron-builder --linux
```

### メモリ使用量の制限

```bash
# Node.jsヒープサイズの制限
NODE_OPTIONS="--max-old-space-size=4096" electron-builder
```

## CI/CD統合

### GitHub Actions

```yaml
name: Build Electron App

on:
  push:
    tags:
      - "v*"

jobs:
  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm build

      - name: Build macOS
        env:
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
        run: pnpm electron-builder --mac

      - uses: actions/upload-artifact@v3
        with:
          name: macos-builds
          path: dist/*.dmg

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm build

      - name: Build Windows
        env:
          WIN_CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
          WIN_CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
        run: pnpm electron-builder --win

      - uses: actions/upload-artifact@v3
        with:
          name: windows-builds
          path: dist/*.exe
```

## トラブルシューティング

### ビルドログの保存

```bash
# ログをファイルに保存
electron-builder --mac 2>&1 | tee build.log
```

### クリーンビルド

```bash
# キャッシュと出力を削除
rm -rf dist node_modules/.cache

# 再ビルド
pnpm install
pnpm build
electron-builder
```

## 参照

- [electron-builder CLI](https://www.electron.build/cli)
- build-config-guide.md: ビルド設定の詳細
- Level2_intermediate.md: 実装パターンと注意点
