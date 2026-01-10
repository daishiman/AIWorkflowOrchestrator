# インストーラー生成ガイド

このガイドは各プラットフォーム用のElectronアプリケーションインストーラーの生成方法を説明します。

## 概要

electron-builderは各プラットフォームに最適化されたインストーラー形式を生成できます：

- macOS: DMG, PKG, MAS (Mac App Store)
- Windows: NSIS, MSI, AppX (Microsoft Store), Portable
- Linux: AppImage, snap, deb, rpm

## macOS インストーラー

### DMG（推奨）

DMGはmacOSで最も一般的なインストーラー形式です。

#### 基本設定

```yaml
mac:
  target:
    - dmg
  icon: build/icon.icns

dmg:
  title: "${productName} ${version}"
  icon: build/icon.icns
  background: build/background.png
  window:
    width: 540
    height: 380
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications
```

#### カスタム背景とレイアウト

1. 背景画像を作成（推奨サイズ: 540x380 @2x = 1080x760）
2. build/background.png として配置
3. アイコンとApplicationsフォルダへのリンクを配置

```yaml
dmg:
  background: build/background@2x.png
  window:
    width: 540
    height: 380
  contents:
    # アプリアイコンの位置
    - x: 130
      y: 220
    # Applicationsフォルダリンクの位置
    - x: 410
      y: 220
      type: link
      path: /Applications
```

### PKG

企業配布やMDM（モバイルデバイス管理）向けに使用します。

```yaml
mac:
  target:
    - pkg

pkg:
  installLocation: /Applications
  allowAnywhere: true
  allowCurrentUserHome: true
  allowRootDirectory: false
  scripts: build/pkg-scripts
```

### Mac App Store (MAS)

```yaml
mac:
  target:
    - mas

mas:
  type: distribution
  category: public.app-category.productivity
  entitlements: build/entitlements.mas.plist
  entitlementsInherit: build/entitlements.mas.inherit.plist
  provisioningProfile: build/embedded.provisionprofile
```

## Windows インストーラー

### NSIS（推奨）

NSISは最も広く使用されているWindowsインストーラーです。

#### 基本設定

```yaml
win:
  target:
    - nsis
  icon: build/icon.ico

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: "${productName}"
  installerIcon: build/installerIcon.ico
  uninstallerIcon: build/uninstallerIcon.ico
  installerHeader: build/installerHeader.bmp
  installerSidebar: build/installerSidebar.bmp
  uninstallerSidebar: build/uninstallerSidebar.bmp
```

#### カスタムスクリプト

```yaml
nsis:
  include: build/installer.nsh
  script: build/installer.nsi
```

installer.nsh の例:

```nsis
!macro customInit
  ; カスタム初期化処理
!macroend

!macro customInstall
  ; カスタムインストール処理
!macroend

!macro customUnInstall
  ; カスタムアンインストール処理
!macroend
```

#### 言語設定

```yaml
nsis:
  language: ja-JP
  # または複数言語
  # language: ["en-US", "ja-JP", "zh-CN"]
```

### MSI

企業環境での配布に適しています。

```yaml
win:
  target:
    - msi

msi:
  createDesktopShortcut: true
  createStartMenuShortcut: true
  perMachine: true
  runAfterFinish: false
```

### Portable

インストール不要の実行ファイルを生成します。

```yaml
win:
  target:
    - portable

portable:
  artifactName: "${productName}-${version}-portable.exe"
```

## Linux インストーラー

### AppImage（推奨）

AppImageは依存関係を含む単一の実行可能ファイルです。

```yaml
linux:
  target:
    - AppImage
  icon: build/icon.png
  category: Utility

appImage:
  artifactName: "${productName}-${version}.AppImage"
```

### deb（Debian/Ubuntu）

```yaml
linux:
  target:
    - deb
  category: Utility

deb:
  depends:
    - gconf2
    - gconf-service
    - libnotify4
    - libappindicator1
    - libxtst6
    - libnss3
  afterInstall: build/deb-postinstall.sh
  afterRemove: build/deb-postrm.sh
```

deb-postinstall.sh の例:

```bash
#!/bin/bash
# デスクトップデータベースを更新
update-desktop-database /usr/share/applications
```

### rpm（Fedora/Red Hat）

```yaml
linux:
  target:
    - rpm
  category: Utility

rpm:
  depends:
    - libnotify
    - libappindicator
  afterInstall: build/rpm-postinstall.sh
  afterRemove: build/rpm-postrm.sh
```

### snap

```yaml
linux:
  target:
    - snap

snap:
  summary: Short description for snap store
  grade: stable
  confinement: strict
  plugs:
    - home
    - network
    - desktop
```

## マルチプラットフォームビルド

### すべてのプラットフォーム

```bash
# すべてのプラットフォームとターゲットをビルド
electron-builder -mwl
```

### プラットフォーム別並行ビルド（CI/CD）

```yaml
# GitHub Actions
jobs:
  build-mac:
    runs-on: macos-latest
    steps:
      - run: electron-builder --mac dmg

  build-windows:
    runs-on: windows-latest
    steps:
      - run: electron-builder --win nsis portable

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - run: electron-builder --linux AppImage deb
```

## インストーラーのカスタマイズ

### アイコンと画像の準備

#### macOS

- icon.icns: 1024x1024を含む複数サイズ
- background.png: DMG背景（540x380 または 1080x760 @2x）

```bash
# .icnsファイルの生成
iconutil -c icns icon.iconset
```

#### Windows

- icon.ico: 256x256を含む複数サイズ
- installerIcon.ico: インストーラーアイコン
- installerHeader.bmp: 150x57
- installerSidebar.bmp: 164x314

#### Linux

- icon.png: 512x512（推奨）

### インストーラーのブランディング

```yaml
# 共通設定
productName: "My Application"
copyright: "Copyright © 2025 ${author}"

# Windows NSIS
nsis:
  installerHeaderIcon: build/header.ico
  deleteAppDataOnUninstall: true

# macOS DMG
dmg:
  title: "${productName} ${version} Installer"
  internetEnabled: true
```

## インストーラーの検証

### macOS

```bash
# DMGをマウント
hdiutil attach dist/MyApp-1.0.0.dmg

# 署名を検証
codesign --verify --deep --strict /Volumes/MyApp/MyApp.app
spctl --assess --verbose /Volumes/MyApp/MyApp.app

# アンマウント
hdiutil detach /Volumes/MyApp
```

### Windows

```bash
# NSIS インストーラーの署名を検証
signtool verify /pa dist/MyApp-Setup-1.0.0.exe

# インストールテスト（管理者権限で）
dist/MyApp-Setup-1.0.0.exe /S  # サイレントインストール
```

### Linux

```bash
# AppImageの実行権限を付与
chmod +x dist/MyApp-1.0.0.AppImage

# 実行テスト
./dist/MyApp-1.0.0.AppImage --appimage-extract-and-run

# debパッケージのインストールテスト
sudo dpkg -i dist/MyApp_1.0.0_amd64.deb
```

## トラブルシューティング

### インストーラーサイズが大きすぎる

```yaml
# asar圧縮を有効化
asar: true

# 不要なファイルを除外
files:
  - "!**/{.git,.vscode,test}"
  - "!**/*.{md,map,log}"
```

### インストール時のエラー

#### macOS: "App is damaged"

原因: 署名が無効またはNotarization未実施

対処:

```bash
# 再署名
codesign --force --deep --sign "Developer ID Application" MyApp.app

# Notarization
xcrun notarytool submit MyApp.dmg --keychain-profile "notarytool-profile"
```

#### Windows: "Windows protected your PC"

原因: コード署名が無いまたは信頼されていない

対処: EV証明書を使用してAuthenticode署名を適用

## 参照

- [electron-builder Target Configuration](https://www.electron.build/configuration/target)
- code-signing.md: コード署名の詳細
- Level3_advanced.md: 高度なカスタマイズ
