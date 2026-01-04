# Windows Code Signing Guide

## Quick Reference

### 必須要件

- Code Signing Certificate (EV または OV)
- pfx ファイルまたは USB トークン
- SHA-256 ハッシュアルゴリズム
- タイムスタンプサーバー

### electron-builder 設定例

```yaml
win:
  sign: ./scripts/sign-windows.js
  certificateFile: ${env.CSC_LINK}
  certificatePassword: ${env.CSC_KEY_PASSWORD}
  signingHashAlgorithms:
    - sha256
  rfc3161TimeStampServer: http://timestamp.digicert.com
  target:
    - nsis
    - portable
```

### scripts/sign-windows.js

```javascript
exports.default = async function (configuration) {
  const { execSync } = require("child_process");

  execSync(
    `signtool sign /f "${process.env.CSC_LINK}" ` +
      `/p "${process.env.CSC_KEY_PASSWORD}" ` +
      `/tr http://timestamp.digicert.com ` +
      `/td sha256 /fd sha256 ` +
      `"${configuration.path}"`,
    { stdio: "inherit" },
  );
};
```

### 環境変数

```bash
# .env.local
CSC_LINK="C:\\path\\to\\certificate.pfx"
CSC_KEY_PASSWORD="証明書パスワード"
```

### 検証コマンド

```powershell
# PowerShell
Get-AuthenticodeSignature "MyApp Setup.exe" | Select-Object Status, SignerCertificate

# signtool
signtool verify /pa /v "MyApp Setup.exe"
```

## タイムスタンプサーバー

| プロバイダー | URL                             |
| ------------ | ------------------------------- |
| DigiCert     | http://timestamp.digicert.com   |
| Sectigo      | http://timestamp.sectigo.com    |
| GlobalSign   | http://timestamp.globalsign.com |

## SmartScreen 対策

- **EV 証明書**: 即時信頼
- **OV 証明書**: 評判の蓄積が必要（数週間〜数ヶ月）

## 詳細は Level 2, 3 を参照
