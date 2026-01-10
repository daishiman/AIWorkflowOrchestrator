# アプリストア配布ガイド

## 概要

Electronアプリケーションを各プラットフォームのアプリストア（Mac App Store、Microsoft Store、Snapcraft）に配布するためのガイド。

## Mac App Store (MAS)

### 前提条件

- Apple Developer Program メンバーシップ（年間$99）
- App Store Connect アカウント
- 有効な配布証明書

### electron-builder 設定

```json
{
  "mac": {
    "target": ["mas"],
    "category": "public.app-category.developer-tools",
    "entitlements": "build/entitlements.mas.plist",
    "entitlementsInherit": "build/entitlements.mas.inherit.plist",
    "provisioningProfile": "build/embedded.provisionprofile"
  },
  "mas": {
    "hardenedRuntime": false
  }
}
```

### entitlements.mas.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.app-sandbox</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.files.user-selected.read-write</key>
  <true/>
</dict>
</plist>
```

### サンドボックス制限事項

MASアプリは以下の制限を受ける：

- ファイルシステムアクセス制限
- ネットワークアクセス制限（entitlement必要）
- ハードウェアアクセス制限
- シェルコマンド実行不可

## Microsoft Store

### 前提条件

- Microsoft Partner Center アカウント
- 有効なコード署名証明書

### electron-builder 設定

```json
{
  "win": {
    "target": ["appx"],
    "appx": {
      "identityName": "12345YourCompany.YourApp",
      "publisher": "CN=YOUR_PUBLISHER_ID",
      "publisherDisplayName": "Your Company Name",
      "applicationId": "YourApp"
    }
  }
}
```

### APPX マニフェスト

```xml
<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10">
  <Identity Name="YourCompany.YourApp"
            Publisher="CN=YOUR_PUBLISHER_ID"
            Version="1.0.0.0"/>
  <Properties>
    <DisplayName>Your App</DisplayName>
    <PublisherDisplayName>Your Company</PublisherDisplayName>
  </Properties>
</Package>
```

## Snapcraft (Linux)

### snapcraft.yaml

```yaml
name: your-app
version: "1.0.0"
summary: Your application description
description: |
  Detailed description of your application.

base: core22
grade: stable
confinement: strict

apps:
  your-app:
    command: your-app
    extensions: [gnome]
    plugs:
      - home
      - network
      - opengl

parts:
  your-app:
    plugin: nil
    source: .
    build-packages:
      - nodejs
    override-build: |
      npm install
      npm run build
      cp -r dist/* $SNAPCRAFT_PART_INSTALL/
```

### Snap Storeへの公開

```bash
# ログイン
snapcraft login

# ビルド
snapcraft

# 公開
snapcraft upload --release=stable your-app_1.0.0_amd64.snap
```

## 共通チェックリスト

### 提出前確認

| 項目                 | MAS | MS Store | Snap |
| -------------------- | --- | -------- | ---- |
| アイコン準備         | ✓   | ✓        | ✓    |
| スクリーンショット   | ✓   | ✓        | ✓    |
| 説明文作成           | ✓   | ✓        | ✓    |
| プライバシーポリシー | ✓   | ✓        | -    |
| 年齢制限設定         | ✓   | ✓        | -    |
| カテゴリ選択         | ✓   | ✓        | ✓    |

### レビュー対策

1. **機能説明**: すべての機能が明確に説明されている
2. **テストアカウント**: レビュー用のテストアカウントを提供
3. **デモモード**: サブスクリプション機能にはデモモードを用意
4. **クラッシュフリー**: 起動から終了まで安定動作
5. **オフライン対応**: ネットワーク未接続時の挙動を確認
