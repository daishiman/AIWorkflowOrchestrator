# Content Security Policy Configuration Guide

## CSPディレクティブ

### default-src

すべてのリソースタイプのデフォルトポリシー

```
default-src 'self';
```

### script-src

JavaScriptの読み込み元を制限

```
script-src 'self'; # 同一オリジンのみ
script-src 'self' 'unsafe-inline'; # インラインスクリプト許可（非推奨）
script-src 'self' 'unsafe-eval'; # eval()許可（非推奨）
script-src 'self' https://cdn.example.com; # 特定CDN許可
```

### style-src

CSSの読み込み元を制限

```
style-src 'self' 'unsafe-inline';
```

### img-src

画像の読み込み元を制限

```
img-src 'self' data: https:;
```

### connect-src

fetch、XMLHttpRequest、WebSocketの接続先を制限

```
connect-src 'self' https://api.example.com;
```

### frame-ancestors

iframe埋め込みを制限

```
frame-ancestors 'none'; # 埋め込み禁止
frame-ancestors 'self'; # 同一オリジンのみ
```

## OWASP推奨設定

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

## CSP違反レポート

```
Content-Security-Policy: default-src 'self'; report-uri /api/csp-report;
```

**レポートハンドラー**:

```typescript
export async function POST(request: Request) {
  const report = await request.json();
  console.error("CSP Violation:", report);
  // ログシステムに記録
  return new Response("OK", { status: 200 });
}
```
