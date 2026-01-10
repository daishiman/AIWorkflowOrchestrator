# Content Security Policy (CSP) 詳細設定

## CSPの基本

### CSPとは

Content Security Policy は、XSS攻撃やデータインジェクション攻撃を防ぐためのセキュリティレイヤーです。

### ElectronでのCSP設定方法

```typescript
// 方法1: HTMLのmetaタグ
// index.html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">

// 方法2: セッションヘッダー（推奨）
app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [buildCSP()],
      },
    });
  });
});
```

## ディレクティブ詳細

### default-src

すべてのリソースのデフォルトポリシー

```
default-src 'self'              # 同一オリジンのみ
default-src 'none'              # すべて拒否
default-src 'self' https:       # 同一オリジン + HTTPS
```

### script-src

JavaScriptの読み込み元

```
script-src 'self'                           # 同一オリジンのみ
script-src 'self' 'unsafe-inline'           # インラインスクリプト許可（非推奨）
script-src 'self' 'unsafe-eval'             # eval()許可（開発時のみ）
script-src 'self' 'nonce-{random}'          # nonce付きスクリプトのみ
script-src 'self' 'sha256-{hash}'           # ハッシュ一致のみ
```

### style-src

CSSの読み込み元

```
style-src 'self'                            # 同一オリジンのみ
style-src 'self' 'unsafe-inline'            # インラインスタイル許可
style-src 'self' https://fonts.googleapis.com
```

### img-src / font-src / media-src

メディアリソースの読み込み元

```
img-src 'self' data: https:                 # 画像: self + data URI + HTTPS
font-src 'self' data: https://fonts.gstatic.com
media-src 'self' blob:                      # 動画/音声
```

### connect-src

Fetch、XHR、WebSocketの接続先

```
connect-src 'self'                          # 同一オリジンのみ
connect-src 'self' https://api.example.com  # 特定API
connect-src 'self' wss://ws.example.com     # WebSocket
```

### frame-src / frame-ancestors

iframe関連

```
frame-src 'none'                            # iframeを許可しない
frame-ancestors 'none'                      # このページをiframeに埋め込み禁止
```

## 環境別CSP設定

### 本番環境（厳格）

```typescript
function buildProductionCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // Tailwind等のCSS-in-JS
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.example.com",
    "worker-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}
```

### 開発環境（緩和）

```typescript
function buildDevelopmentCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval'", // Hot reload
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: http:",
    "font-src 'self' data:",
    "connect-src 'self' ws://localhost:* http://localhost:* https:",
    "worker-src 'self' blob:",
  ].join("; ");
}
```

### 条件付きCSP

```typescript
function buildCSP(): string {
  const isDev = process.env.NODE_ENV === "development";
  return isDev ? buildDevelopmentCSP() : buildProductionCSP();
}
```

## CSP違反の検出

### レポート設定

```typescript
// 違反レポートを送信
const csp = [
  ...basePolicy,
  "report-uri https://your-csp-report-endpoint.com/report",
].join("; ");

// またはレポートのみモード（ブロックしない）
const cspReportOnly = csp;
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      "Content-Security-Policy-Report-Only": [cspReportOnly],
    },
  });
});
```

### Renderer側での検出

```typescript
// CSP違反イベントのリスニング
document.addEventListener("securitypolicyviolation", (e) => {
  console.error("CSP Violation:", {
    violatedDirective: e.violatedDirective,
    blockedURI: e.blockedURI,
    originalPolicy: e.originalPolicy,
  });

  // Main側に報告
  window.electronAPI.reportCSPViolation({
    directive: e.violatedDirective,
    blockedURI: e.blockedURI,
  });
});
```

## よくある問題と解決策

### インラインスクリプトエラー

```
Refused to execute inline script because it violates CSP

解決策1: nonceを使用
<script nonce="random-nonce">...</script>
script-src 'self' 'nonce-random-nonce'

解決策2: ハッシュを使用
script-src 'self' 'sha256-base64hash...'
```

### eval()エラー

```
Refused to evaluate a string as JavaScript because 'unsafe-eval' is not allowed

解決策: 開発時のみ許可するか、eval()を使わない実装に変更
```

### フォント読み込みエラー

```
Refused to load the font because it violates CSP

解決策: font-srcにソースを追加
font-src 'self' https://fonts.gstatic.com
```
