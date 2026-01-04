# electron-builder 設定リファレンス

このドキュメントはelectron-builderの主要な設定オプションを網羅的に説明します。

## 概要

electron-builderの設定は以下のいずれかで定義できます：

1. package.json の `build` セクション
2. electron-builder.yml
3. electron-builder.json
4. electron-builder.json5
5. electron-builder.toml

推奨: 小規模プロジェクトはpackage.json、大規模プロジェクトは別ファイル（electron-builder.yml）

## 共通設定

### appId

```yaml
appId: com.example.myapp
```

- **型**: string
- **必須**: はい
- **形式**: リバースドメイン（例: com.company.app）
- **用途**: アプリケーションの一意識別子

### productName

```yaml
productName: "My Application"
```

- **型**: string
- **デフォルト**: package.jsonのname
- **用途**: ユーザーに表示されるアプリケーション名

### copyright

```yaml
copyright: "Copyright © 2025 ${author}"
```

- **型**: string
- **用途**: 著作権表示
- **変数**: `${author}`, `${year}` が使用可能

### directories

```yaml
directories:
  output: dist
  buildResources: build
  app: .
```

- **output**: ビルド成果物の出力先（デフォルト: dist）
- **buildResources**: リソースファイルの配置先（デフォルト: build）
- **app**: アプリケーションルート（デフォルト: .）

### files

```yaml
files:
  - "dist/**/*"
  - "node_modules/**/*"
  - "!node_modules/*/{CHANGELOG.md,README.md,*.map}"
  - "package.json"
```

- **型**: Array<string | FilePattern>
- **デフォルト**: `["**/*"]`
- **パターン**: グロブパターン、`!` で除外
- **注意**: デフォルトは全ファイル含むため、明示的に制限推奨

### extraResources

```yaml
extraResources:
  - from: "resources/"
    to: "."
  - "assets/data.json"
```

- **型**: Array<string | FilePattern>
- **用途**: アプリケーション外部のリソース（`process.resourcesPath` でアクセス）

### extraFiles

```yaml
extraFiles:
  - from: "bin/"
    to: "."
    filter: ["*.exe"]
```

- **型**: Array<string | FilePattern>
- **用途**: アプリケーションディレクトリ内に配置するファイル

### asar

```yaml
asar: true
asarUnpack:
  - "**/*.node"
  - "resources/**"
```

- **asar**: アーカイブ化の有効/無効（デフォルト: true）
- **asarUnpack**: アーカイブから除外するパターン
- **用途**: パフォーマンス向上、ソースコード保護

## macOS 設定

### mac

```yaml
mac:
  category: public.app-category.productivity
  target:
    - dmg
    - zip
  icon: build/icon.icns
  darkModeSupport: true
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  provisioningProfile: build/embedded.provisionprofile
```

#### category

App Storeカテゴリ:

- `public.app-category.business`
- `public.app-category.developer-tools`
- `public.app-category.education`
- `public.app-category.entertainment`
- `public.app-category.finance`
- `public.app-category.graphics-design`
- `public.app-category.lifestyle`
- `public.app-category.medical`
- `public.app-category.music`
- `public.app-category.news`
- `public.app-category.photography`
- `public.app-category.productivity`
- `public.app-category.reference`
- `public.app-category.social-networking`
- `public.app-category.sports`
- `public.app-category.travel`
- `public.app-category.utilities`
- `public.app-category.video`
- `public.app-category.weather`

#### target

ビルドターゲット:

- `dmg`: ディスクイメージ（推奨）
- `pkg`: インストーラーパッケージ
- `mas`: Mac App Store用
- `zip`: ZIPアーカイブ
- `dir`: ディレクトリのみ（開発用）

#### entitlements.mac.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.network.server</key>
  <true/>
</dict>
</plist>
```

### dmg

```yaml
dmg:
  title: "${productName} ${version}"
  icon: build/icon.icns
  background: build/background.png
  backgroundColor: "#ffffff"
  window:
    width: 540
    height: 380
    x: 200
    y: 120
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications
```

- **title**: DMGのタイトル
- **background**: 背景画像
- **contents**: アイコンとリンクの配置

### mas (Mac App Store)

```yaml
mas:
  type: distribution
  category: public.app-category.productivity
  entitlements: build/entitlements.mas.plist
  entitlementsInherit: build/entitlements.mas.inherit.plist
  provisioningProfile: build/embedded.provisionprofile
```

## Windows 設定

### win

```yaml
win:
  target:
    - nsis
    - portable
  icon: build/icon.ico
  publisherName: "Your Company Name"
  certificateFile: path/to/cert.pfx
  certificatePassword: ${WIN_CERT_PASSWORD}
  signingHashAlgorithms:
    - sha256
  rfc3161TimeStampServer: http://timestamp.digicert.com
```

#### target

ビルドターゲット:

- `nsis`: NSIS インストーラー（推奨）
- `nsis-web`: Web インストーラー
- `portable`: ポータブル実行ファイル
- `msi`: Windows Installer
- `appx`: Microsoft Store用
- `squirrel`: Squirrel.Windows
- `dir`: ディレクトリのみ（開発用）

### nsis

```yaml
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  allowElevation: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: "${productName}"
  perMachine: false
  runAfterFinish: true
  installerIcon: build/installerIcon.ico
  uninstallerIcon: build/uninstallerIcon.ico
  installerHeader: build/installerHeader.bmp
  installerSidebar: build/installerSidebar.bmp
  uninstallerSidebar: build/uninstallerSidebar.bmp
  deleteAppDataOnUninstall: false
  include: build/installer.nsh
  script: build/installer.nsi
  language: ja-JP
```

- **oneClick**: ワンクリックインストール
- **allowToChangeInstallationDirectory**: インストール先変更可否
- **perMachine**: 全ユーザー向けインストール
- **deleteAppDataOnUninstall**: アンインストール時にユーザーデータ削除

### msi

```yaml
msi:
  createDesktopShortcut: true
  createStartMenuShortcut: true
  perMachine: true
  runAfterFinish: false
  upgradeCode: "YOUR-GUID-HERE"
```

- **upgradeCode**: アップグレード識別GUID（変更禁止）

## Linux 設定

### linux

```yaml
linux:
  target:
    - AppImage
    - deb
    - rpm
  category: Utility
  icon: build/icon.png
  synopsis: "Short description"
  description: "Long description"
  desktop:
    StartupWMClass: "${productName}"
    MimeType: "x-scheme-handler/myapp"
```

#### category

デスクトップエントリカテゴリ:

- `AudioVideo`
- `Development`
- `Education`
- `Game`
- `Graphics`
- `Network`
- `Office`
- `Science`
- `Settings`
- `System`
- `Utility`

#### target

ビルドターゲット:

- `AppImage`: AppImage（推奨）
- `deb`: Debian/Ubuntu パッケージ
- `rpm`: Fedora/Red Hat パッケージ
- `snap`: Snap パッケージ
- `pacman`: Arch Linux パッケージ
- `freebsd`: FreeBSD パッケージ
- `tar.gz`: tarball
- `dir`: ディレクトリのみ（開発用）

### appImage

```yaml
appImage:
  license: LICENSE
  category: Utility
```

### deb

```yaml
deb:
  depends:
    - gconf2
    - gconf-service
    - libnotify4
    - libappindicator1
    - libxtst6
    - libnss3
  compression: xz
  priority: optional
  afterInstall: build/deb-postinstall.sh
  afterRemove: build/deb-postrm.sh
```

### rpm

```yaml
rpm:
  depends:
    - libnotify
    - libappindicator
  compression: xz
  afterInstall: build/rpm-postinstall.sh
  afterRemove: build/rpm-postrm.sh
```

### snap

```yaml
snap:
  summary: "Short description for snap store (max 79 chars)"
  description: "Long description"
  grade: stable # または devel
  confinement: strict # または devmode, classic
  plugs:
    - home
    - network
    - desktop
    - desktop-legacy
    - x11
  stagePackages:
    - default
```

## 署名とNotarization

### macOS 署名

```yaml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  notarize:
    teamId: YOUR_TEAM_ID
```

環境変数:

- `CSC_LINK`: .p12証明書ファイルのパス（base64エンコードも可）
- `CSC_KEY_PASSWORD`: 証明書のパスワード
- `APPLE_ID`: Apple ID
- `APPLE_ID_PASSWORD`: App固有パスワード
- `APPLE_TEAM_ID`: チームID

### Windows 署名

```yaml
win:
  certificateFile: path/to/cert.pfx
  certificatePassword: ${WIN_CERT_PASSWORD}
  signingHashAlgorithms:
    - sha256
  rfc3161TimeStampServer: http://timestamp.digicert.com
  timeStampServer: http://timestamp.digicert.com
```

環境変数:

- `WIN_CSC_LINK`: .pfx証明書ファイルのパス
- `WIN_CSC_KEY_PASSWORD`: 証明書のパスワード

## 自動更新

### publish

```yaml
publish:
  - provider: github
    owner: your-username
    repo: your-repo
    releaseType: release

  - provider: generic
    url: https://updates.example.com
    channel: stable

  - provider: s3
    bucket: my-bucket
    region: us-east-1
    path: releases
```

#### プロバイダー種類

- `github`: GitHub Releases
- `generic`: 汎用HTTP/HTTPS
- `s3`: Amazon S3
- `spaces`: DigitalOcean Spaces
- `bintray`: Bintray（非推奨）

### generateUpdatesFilesForAllChannels

```yaml
generateUpdatesFilesForAllChannels: true
```

チャネルごとに latest.yml を生成

## パフォーマンス最適化

### compression

```yaml
compression: maximum # または store, normal
```

- `store`: 圧縮なし（最速）
- `normal`: 通常圧縮（バランス）
- `maximum`: 最大圧縮（最小サイズ）

### nodeGypRebuild

```yaml
nodeGypRebuild: false
```

ネイティブモジュールの再ビルドを無効化

### buildDependenciesFromSource

```yaml
buildDependenciesFromSource: false
```

依存関係のソースからのビルドを無効化

## プラットフォーム別ビルド

### マルチターゲット

```yaml
mac:
  target:
    - target: dmg
      arch:
        - x64
        - arm64
    - target: zip
      arch: universal

win:
  target:
    - target: nsis
      arch:
        - x64
        - ia32
    - target: portable
      arch: x64

linux:
  target:
    - target: AppImage
      arch:
        - x64
        - arm64
    - target: deb
      arch: x64
```

#### アーキテクチャ

- `x64`: Intel/AMD 64-bit
- `ia32`: Intel/AMD 32-bit
- `arm64`: ARM 64-bit (Apple Silicon等)
- `armv7l`: ARM 32-bit
- `universal`: ユニバーサルバイナリ（macOSのみ）

## 環境変数の使用

```yaml
appId: com.${env.COMPANY_NAME}.myapp
copyright: "Copyright © ${year} ${env.COMPANY_NAME}"
win:
  certificatePassword: ${env.WIN_CERT_PASSWORD}
```

使用可能な変数:

- `${env.VAR_NAME}`: 環境変数
- `${author}`: package.jsonのauthor
- `${name}`: package.jsonのname
- `${version}`: package.jsonのversion
- `${productName}`: productName設定
- `${year}`: 現在の年

## デバッグとロギング

### ビルドログレベル

```bash
# 環境変数で設定
DEBUG=electron-builder electron-builder

# より詳細なログ
DEBUG=* electron-builder
```

### ビルド設定のダンプ

```bash
# 設定を確認（ビルドは実行しない）
electron-builder --help
electron-builder --dir  # ドライラン
```

## 参照

- [electron-builder Configuration](https://www.electron.build/configuration/configuration)
- [Common Configuration](https://www.electron.build/configuration/configuration)
- build-config-guide.md: 基本設定ガイド
- code-signing.md: 署名の詳細
