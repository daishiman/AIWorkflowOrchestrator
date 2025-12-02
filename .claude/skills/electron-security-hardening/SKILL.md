---
name: electron-security-hardening
description: |
  Electronデスクトップアプリケーションのセキュリティ強化専門知識

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/electron-security-hardening/resources/csp-configuration.md`: Content Security Policy詳細設定
  - `.claude/skills/electron-security-hardening/resources/ipc-security.md`: IPCセキュリティパターン
  - `.claude/skills/electron-security-hardening/resources/dependency-audit.md`: 依存関係セキュリティ監査
  - `.claude/skills/electron-security-hardening/templates/secure-preload.ts`: セキュアPreloadテンプレート
  - `.claude/skills/electron-security-hardening/scripts/security-audit.sh`: セキュリティ監査スクリプト

  専門分野:
  - サンドボックス: プロセス分離とサンドボックス化
  - CSP: Content Security Policy設定
  - IPC安全性: 安全なプロセス間通信
  - 依存関係: サプライチェーンセキュリティ

  使用タイミング:
  - Electronアプリのセキュリティを強化する時
  - CSP設定を実装する時
  - IPCチャネルを安全に設計する時
  - 依存関係の脆弱性を監査する時

version: 1.0.0
---

# electron-security-hardening

Electronデスクトップアプリケーションのセキュリティ強化専門知識

---

## 概要

### 目的
Electronアプリケーションに特有のセキュリティリスクを理解し、
適切な対策を実装することで、安全なデスクトップアプリを構築する。

### 対象者
- Electronアプリ開発者
- セキュリティエンジニア
- 技術リーダー

---

## Electronセキュリティの基本原則

### 脅威モデル

```
┌─────────────────────────────────────────────────────────┐
│                    脅威の種類                           │
├─────────────────────────────────────────────────────────┤
│  1. 悪意あるコンテンツのロード                          │
│     • XSS攻撃によるNode.js APIへのアクセス              │
│     • 外部コンテンツからのシステムアクセス              │
│                                                         │
│  2. リモートコード実行 (RCE)                            │
│     • 信頼できないURLのロード                           │
│     • プロトコルハンドラーの悪用                        │
│                                                         │
│  3. 権限昇格                                            │
│     • Rendererからの不正なIPC呼び出し                   │
│     • Preloadスクリプトの脆弱性                         │
│                                                         │
│  4. 情報漏洩                                            │
│     • 機密データのRenderer露出                          │
│     • ログへの認証情報出力                              │
└─────────────────────────────────────────────────────────┘
```

---

## 必須セキュリティ設定

### BrowserWindowの安全な設定

```typescript
// main/window.ts - セキュアな設定
import { BrowserWindow } from 'electron';
import path from 'path';

const win = new BrowserWindow({
  webPreferences: {
    // 🔒 必須: コンテキスト分離を有効化
    contextIsolation: true,

    // 🔒 必須: Node.js統合を無効化
    nodeIntegration: false,

    // 🔒 推奨: サンドボックスを有効化
    sandbox: true,

    // 🔒 必須: webviewタグを無効化（使用しない場合）
    webviewTag: false,

    // 🔒 必須: Preloadスクリプト
    preload: path.join(__dirname, 'preload.js'),

    // 🔒 推奨: リモートモジュールを無効化
    enableRemoteModule: false,

    // 🔒 推奨: 実験的機能を無効化
    experimentalFeatures: false,

    // 🔒 推奨: 同一オリジンポリシーを維持
    allowRunningInsecureContent: false,

    // 🔒 推奨: 画像のサブリソース整合性チェック
    images: true,

    // 🔒 スペルチェッカー（必要に応じて）
    spellcheck: false,
  },
});

// 🔒 ナビゲーション制限
win.webContents.on('will-navigate', (event, url) => {
  const allowedOrigins = [
    'https://your-app.com',
    'file://',
  ];

  const isAllowed = allowedOrigins.some(origin =>
    url.startsWith(origin)
  );

  if (!isAllowed) {
    event.preventDefault();
    console.warn(`Blocked navigation to: ${url}`);
  }
});

// 🔒 新しいウィンドウの制御
win.webContents.setWindowOpenHandler(({ url }) => {
  // 外部URLはデフォルトブラウザで開く
  if (url.startsWith('https://')) {
    shell.openExternal(url);
  }
  return { action: 'deny' };
});
```

---

## Content Security Policy (CSP)

### 推奨CSP設定

```typescript
// main/index.ts
import { session } from 'electron';

app.whenReady().then(() => {
  // CSPヘッダーを設定
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          [
            // 基本ポリシー
            "default-src 'self'",

            // スクリプト: self + インラインは拒否
            "script-src 'self'",

            // スタイル: self + unsafe-inline（CSS-in-JSの場合）
            "style-src 'self' 'unsafe-inline'",

            // 画像: self + data: + https:
            "img-src 'self' data: https:",

            // フォント: self + data:
            "font-src 'self' data:",

            // 接続先: 特定のAPIのみ
            "connect-src 'self' https://api.example.com",

            // Worker: self
            "worker-src 'self'",

            // フレーム: なし
            "frame-src 'none'",

            // オブジェクト: なし
            "object-src 'none'",

            // ベースURI: self
            "base-uri 'self'",

            // フォームアクション: self
            "form-action 'self'",

            // フレームの祖先: なし
            "frame-ancestors 'none'",
          ].join('; '),
        ],
      },
    });
  });
});
```

### 開発時のCSP緩和

```typescript
// 開発環境用の緩和されたCSP
const isDev = process.env.NODE_ENV === 'development';

const csp = isDev
  ? [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'", // Hot reload用
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' ws://localhost:* http://localhost:*",
    ]
  : [
      // 本番用の厳格なCSP
    ];
```

---

## 安全なIPC設計

### IPCチャネルのホワイトリスト

```typescript
// main/ipc/validator.ts
const ALLOWED_CHANNELS = new Set([
  'file:read',
  'file:write',
  'dialog:open',
  'dialog:save',
  'app:getVersion',
  'window:minimize',
  'window:maximize',
  'window:close',
]);

export function isValidChannel(channel: string): boolean {
  return ALLOWED_CHANNELS.has(channel);
}

// ipcMain.handleをラップ
export function registerSecureHandler(
  channel: string,
  handler: Parameters<typeof ipcMain.handle>[1]
): void {
  if (!isValidChannel(channel)) {
    throw new Error(`Invalid IPC channel: ${channel}`);
  }

  ipcMain.handle(channel, async (event, ...args) => {
    // 送信元の検証
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      throw new Error('Invalid sender');
    }

    return handler(event, ...args);
  });
}
```

### 入力バリデーション

```typescript
// main/ipc/file.ts
import { z } from 'zod';
import path from 'path';

// スキーマ定義
const FileReadSchema = z.object({
  path: z.string()
    .min(1)
    .refine(
      (p) => !p.includes('..'),
      'Path traversal detected'
    )
    .refine(
      (p) => path.isAbsolute(p) || isWithinAllowedDirs(p),
      'Path must be within allowed directories'
    ),
});

const ALLOWED_DIRS = [
  app.getPath('documents'),
  app.getPath('downloads'),
];

function isWithinAllowedDirs(filePath: string): boolean {
  const absolutePath = path.resolve(filePath);
  return ALLOWED_DIRS.some(dir =>
    absolutePath.startsWith(dir)
  );
}

registerSecureHandler('file:read', async (event, args: unknown) => {
  // バリデーション
  const result = FileReadSchema.safeParse(args);
  if (!result.success) {
    return {
      success: false,
      error: 'Invalid input',
      details: result.error.errors,
    };
  }

  const { path: filePath } = result.data;

  // 追加のセキュリティチェック
  if (!isWithinAllowedDirs(filePath)) {
    return { success: false, error: 'Access denied' };
  }

  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: 'Read failed' };
  }
});
```

### Preloadスクリプトの安全な実装

```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

// 🔒 公開するAPIを最小限に
const api = {
  // ファイル操作（制限付き）
  readFile: (filePath: string) => {
    // 入力のサニタイズ
    if (typeof filePath !== 'string' || filePath.includes('..')) {
      return Promise.reject(new Error('Invalid path'));
    }
    return ipcRenderer.invoke('file:read', { path: filePath });
  },

  // ダイアログ
  openFileDialog: () => ipcRenderer.invoke('dialog:open'),

  // アプリ情報（読み取り専用）
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // ウィンドウ操作
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  // イベントリスナー（制限付き）
  onUpdateAvailable: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('update-available', handler);
    return () => ipcRenderer.removeListener('update-available', handler);
  },
};

// 🔒 ipcRendererを直接公開しない
contextBridge.exposeInMainWorld('electronAPI', api);

// ❌ 絶対にやってはいけない
// contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);
// contextBridge.exposeInMainWorld('require', require);
```

---

## プロトコルハンドラーのセキュリティ

### カスタムプロトコルの安全な登録

```typescript
// main/protocol.ts
import { protocol, net } from 'electron';
import path from 'path';
import fs from 'fs';

// セキュアなファイルプロトコル
protocol.registerFileProtocol('app', (request, callback) => {
  const url = request.url.substring('app://'.length);

  // パストラバーサル防止
  const normalizedPath = path.normalize(url);
  if (normalizedPath.includes('..')) {
    callback({ error: -6 }); // NET_ERROR_FILE_NOT_FOUND
    return;
  }

  // 許可されたディレクトリ内のみ
  const filePath = path.join(app.getAppPath(), 'dist', normalizedPath);
  const distPath = path.join(app.getAppPath(), 'dist');

  if (!filePath.startsWith(distPath)) {
    callback({ error: -6 });
    return;
  }

  callback({ path: filePath });
});

// 特権スキームの設定
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
]);
```

---

## 依存関係のセキュリティ

### npm監査の自動化

```bash
#!/bin/bash
# scripts/security-audit.sh

echo "🔍 Running security audit..."

# npm監査
npm audit --json > audit-report.json

# 高・重大な脆弱性があればエラー
HIGH_VULN=$(cat audit-report.json | jq '.metadata.vulnerabilities.high')
CRITICAL_VULN=$(cat audit-report.json | jq '.metadata.vulnerabilities.critical')

if [ "$HIGH_VULN" -gt 0 ] || [ "$CRITICAL_VULN" -gt 0 ]; then
  echo "❌ Security vulnerabilities found!"
  echo "High: $HIGH_VULN, Critical: $CRITICAL_VULN"
  npm audit
  exit 1
fi

# Electronの既知の脆弱性チェック
npx @electron/security-checklist

echo "✅ Security audit passed"
```

### package.jsonのセキュリティ設定

```json
{
  "scripts": {
    "preinstall": "npx npm-force-resolutions",
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix"
  },
  "resolutions": {
    "ansi-regex": "^5.0.1"
  },
  "overrides": {
    "semver": "^7.5.4"
  }
}
```

---

## 機密情報の保護

### 認証情報の安全な保存

```typescript
// main/services/credentials.ts
import { safeStorage } from 'electron';
import Store from 'electron-store';

const store = new Store<{ encryptedCredentials: string }>();

export async function saveCredentials(credentials: {
  token: string;
  refreshToken?: string;
}): Promise<void> {
  // electron-safeStorageで暗号化
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(
      JSON.stringify(credentials)
    );
    store.set('encryptedCredentials', encrypted.toString('base64'));
  } else {
    throw new Error('Encryption not available');
  }
}

export async function loadCredentials(): Promise<{
  token: string;
  refreshToken?: string;
} | null> {
  const encrypted = store.get('encryptedCredentials');
  if (!encrypted) return null;

  try {
    const decrypted = safeStorage.decryptString(
      Buffer.from(encrypted, 'base64')
    );
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export async function clearCredentials(): Promise<void> {
  store.delete('encryptedCredentials');
}
```

---

## セキュリティチェックリスト

### ✅ 必須対策

| 項目 | 設定 | 重要度 |
|------|------|--------|
| contextIsolation | `true` | 🔴 Critical |
| nodeIntegration | `false` | 🔴 Critical |
| sandbox | `true` | 🟡 High |
| webSecurity | `true` | 🔴 Critical |
| allowRunningInsecureContent | `false` | 🟡 High |
| CSP設定 | 厳格に設定 | 🟡 High |
| IPCバリデーション | 入力検証 | 🔴 Critical |
| ナビゲーション制限 | ホワイトリスト | 🟡 High |

### ❌ 禁止事項

1. **ipcRendererの直接公開** - RCEの危険
2. **requireの公開** - 任意モジュール実行
3. **nodeIntegration: true** - XSSからシステムアクセス
4. **remote使用** - 非推奨、セキュリティリスク
5. **eval()の使用** - コードインジェクション

---

## 関連リソース

### 詳細ドキュメント
- `resources/csp-configuration.md` - CSP詳細設定
- `resources/ipc-security.md` - IPCセキュリティ
- `resources/dependency-audit.md` - 依存関係監査

### テンプレート・スクリプト
- `templates/secure-preload.ts` - セキュアPreload
- `scripts/security-audit.sh` - セキュリティ監査
