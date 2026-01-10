# macOS Code Signing Guide

## Quick Reference

### 必須要件

- Apple Developer Program ($99/year)
- Developer ID Application 証明書
- App-Specific Password
- Hardened Runtime 有効化
- 公証（Notarization）

### electron-builder 設定例

```yaml
mac:
  category: public.app-category.productivity
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  identity: "Developer ID Application: Your Name (TEAM_ID)"

afterSign: scripts/notarize.js
```

### entitlements.mac.plist

```xml
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
</dict>
</plist>
```

### scripts/notarize.js

```javascript
const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") return;

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    tool: "notarytool",
    appBundleId: "com.example.app",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });
};
```

### 環境変数

```bash
# .env.local
CSC_LINK="Developer ID Application: Your Name (TEAM_ID)"
# または
CSC_LINK="/path/to/certificate.p12"
CSC_KEY_PASSWORD="証明書パスワード"

APPLE_ID="your-apple-id@example.com"
APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
APPLE_TEAM_ID="TEAM_ID"
```

### 検証コマンド

```bash
# 署名確認
codesign --verify --deep --strict --verbose=2 "MyApp.app"

# 署名詳細
codesign --display --verbose=4 "MyApp.app"

# Gatekeeper 検証
spctl --assess --type execute --verbose "MyApp.app"

# 公証確認
stapler validate "MyApp.dmg"
```

## 詳細は Level 3, 4 を参照
