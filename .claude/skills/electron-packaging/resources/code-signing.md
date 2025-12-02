# コード署名ガイド

## なぜコード署名が必要か

1. **ユーザーの信頼** - 発行元を証明
2. **OSの警告回避** - 「不明な開発者」警告を防ぐ
3. **自動更新** - 署名がないと更新が機能しない場合がある
4. **企業配布** - 多くの企業ポリシーで署名必須

## macOS署名

### 必要なもの

1. **Apple Developer Program** ($99/年)
2. **Developer ID Application証明書**
3. **App Specific Password** (2FA有効時)
4. **Notarization** (macOS 10.15+)

### 証明書の取得

```bash
# 1. Apple Developer Programに登録
# https://developer.apple.com/programs/

# 2. Certificates, Identifiers & Profilesで証明書を作成
# - Developer ID Application (アプリ配布用)

# 3. 証明書をダウンロード・インストール

# 4. Keychainから確認
security find-identity -v -p codesigning
```

### electron-builder設定

```yaml
# electron-builder.yml
mac:
  # 署名アイデンティティ
  identity: "Developer ID Application: Your Name (TEAM_ID)"

  # ハードニングランタイム（Notarization必須）
  hardenedRuntime: true
  gatekeeperAssess: false

  # エンタイトルメント
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist

# 公証 (Notarization)
afterSign: scripts/notarize.js
```

### Notarization スクリプト

```javascript
// scripts/notarize.js
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.log('Skipping notarization: credentials not found');
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log(`Notarizing ${appName}...`);

  await notarize({
    appBundleId: 'com.yourcompany.yourapp',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });

  console.log('Notarization complete');
};
```

### エンタイトルメント

```plist
<!-- build/entitlements.mac.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- ハードニングランタイム例外 -->
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>

    <!-- ネットワークアクセス -->
    <key>com.apple.security.network.client</key>
    <true/>

    <!-- ファイルアクセス -->
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
</dict>
</plist>
```

### 環境変数（CI/CD）

```bash
# GitHub Actions Secrets
APPLE_ID=your@email.com
APPLE_ID_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App-specific password
APPLE_TEAM_ID=XXXXXXXXXX
CSC_LINK=base64-encoded-p12-certificate
CSC_KEY_PASSWORD=certificate-password
```

## Windows署名

### 必要なもの

1. **コード署名証明書** (EV証明書推奨)
2. **SignTool** (Windows SDK)

### 証明書の種類

| 種類 | SmartScreen | 価格 | 推奨 |
|------|------------|------|------|
| Standard | 評判蓄積必要 | $100-300/年 | 小規模 |
| EV (Extended Validation) | 即座に信頼 | $300-500/年 | 推奨 |

### electron-builder設定

```yaml
# electron-builder.yml
win:
  # 署名設定
  sign: ./scripts/sign.js

  # 証明書（ファイルの場合）
  certificateFile: ${env.WIN_CERT_FILE}
  certificatePassword: ${env.WIN_CERT_PASSWORD}

  # EV証明書（HSM）の場合はカスタムスクリプト使用
```

### カスタム署名スクリプト

```javascript
// scripts/sign.js
exports.default = async function(configuration) {
  // Azure Key Vaultの場合
  if (process.env.AZURE_KEY_VAULT_URI) {
    const { execSync } = require('child_process');

    execSync(`
      AzureSignTool sign
        -kvu ${process.env.AZURE_KEY_VAULT_URI}
        -kvc ${process.env.AZURE_KEY_VAULT_CERT_NAME}
        -kvi ${process.env.AZURE_CLIENT_ID}
        -kvs ${process.env.AZURE_CLIENT_SECRET}
        -kvt ${process.env.AZURE_TENANT_ID}
        -tr http://timestamp.digicert.com
        -td sha256
        "${configuration.path}"
    `, { stdio: 'inherit' });
  }
  // ローカル証明書の場合
  else if (process.env.WIN_CERT_FILE) {
    const { execSync } = require('child_process');

    execSync(`
      signtool sign
        /f "${process.env.WIN_CERT_FILE}"
        /p "${process.env.WIN_CERT_PASSWORD}"
        /tr http://timestamp.digicert.com
        /td sha256
        /fd sha256
        "${configuration.path}"
    `, { stdio: 'inherit' });
  }
};
```

### 環境変数（CI/CD）

```bash
# ローカル証明書の場合
WIN_CERT_FILE=./certificate.pfx
WIN_CERT_PASSWORD=your-password

# Azure Key Vaultの場合
AZURE_KEY_VAULT_URI=https://your-vault.vault.azure.net
AZURE_KEY_VAULT_CERT_NAME=your-cert-name
AZURE_CLIENT_ID=xxxxx
AZURE_CLIENT_SECRET=xxxxx
AZURE_TENANT_ID=xxxxx
```

## CI/CDでの署名

### GitHub Actions

```yaml
# .github/workflows/release.yml
jobs:
  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install certificate
        env:
          CSC_LINK: ${{ secrets.MAC_CERTS }}
          CSC_KEY_PASSWORD: ${{ secrets.MAC_CERTS_PASSWORD }}
        run: |
          echo $CSC_LINK | base64 --decode > certificate.p12
          security create-keychain -p "" build.keychain
          security import certificate.p12 -k build.keychain -P "$CSC_KEY_PASSWORD" -T /usr/bin/codesign
          security set-keychain-settings build.keychain
          security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain

      - name: Build and Sign
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: npm run publish:mac
```

## トラブルシューティング

### macOS: 「開発元を検証できません」

```bash
# 手動で署名確認
codesign -dv --verbose=4 /path/to/Your.app

# Notarizationステータス確認
xcrun stapler validate /path/to/Your.app
```

### Windows: SmartScreenブロック

- EV証明書を使用（即座に信頼される）
- または、多くのダウンロードで評判を蓄積
