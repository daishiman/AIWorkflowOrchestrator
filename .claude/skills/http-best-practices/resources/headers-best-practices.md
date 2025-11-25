# Headers Best Practices（ヘッダー設計）

## 概要

HTTPヘッダーは、リクエストとレスポンスに関するメタデータを伝達する重要な仕組みです。
適切なヘッダー設計により、キャッシュ効率、セキュリティ、相互運用性が向上します。

## 主要ヘッダーカテゴリ

| カテゴリ | 用途 | 例 |
|---------|------|-----|
| コンテンツ | データ形式の指定 | Content-Type, Content-Length |
| 認証 | 認証情報の伝達 | Authorization, WWW-Authenticate |
| キャッシュ | キャッシュ制御 | Cache-Control, ETag |
| コンテンツ交渉 | 形式の交渉 | Accept, Accept-Language |
| セキュリティ | セキュリティポリシー | X-Content-Type-Options, CSP |
| カスタム | アプリ固有情報 | X-Request-ID, X-Correlation-ID |

## コンテンツヘッダー

### Content-Type

```typescript
// リクエスト
const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: JSON.stringify({ name: 'John' }),
});

// レスポンス
res.setHeader('Content-Type', 'application/json; charset=utf-8');
res.json({ id: 123, name: 'John' });
```

### Content-Type一覧

| Content-Type | 用途 |
|--------------|------|
| `application/json` | JSONデータ（最も一般的） |
| `application/x-www-form-urlencoded` | フォームデータ |
| `multipart/form-data` | ファイルアップロード |
| `text/plain` | プレーンテキスト |
| `application/octet-stream` | バイナリデータ |
| `application/xml` | XMLデータ |

### Content-Length と Transfer-Encoding

```typescript
// 固定長（Content-Length）
res.setHeader('Content-Length', Buffer.byteLength(body));
res.end(body);

// ストリーミング（chunked）
res.setHeader('Transfer-Encoding', 'chunked');
stream.pipe(res);
```

## コンテンツ交渉

### Accept ヘッダー

```typescript
// クライアント側
const response = await fetch('/api/data', {
  headers: {
    'Accept': 'application/json, application/xml;q=0.9, */*;q=0.1',
    'Accept-Language': 'ja, en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
  },
});

// サーバー側
function negotiateContentType(req: Request): string {
  const accept = req.headers.accept || '*/*';

  if (accept.includes('application/json')) {
    return 'application/json';
  }
  if (accept.includes('application/xml')) {
    return 'application/xml';
  }
  return 'application/json'; // デフォルト
}
```

### Vary ヘッダー

キャッシュがどのリクエストヘッダーで分岐するか指定。

```typescript
// コンテンツ交渉を使用する場合
res.setHeader('Vary', 'Accept, Accept-Language, Accept-Encoding');
```

## キャッシュ制御

### Cache-Control

```typescript
// キャッシュ禁止（API応答）
res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

// プライベートキャッシュ（ユーザー固有）
res.setHeader('Cache-Control', 'private, max-age=3600');

// 公開キャッシュ（静的リソース）
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

// 条件付きキャッシュ
res.setHeader('Cache-Control', 'no-cache'); // 必ず再検証
```

### Cache-Controlディレクティブ

| ディレクティブ | 説明 |
|---------------|------|
| `no-store` | キャッシュ完全禁止 |
| `no-cache` | キャッシュ可、必ず再検証 |
| `private` | ブラウザのみキャッシュ可 |
| `public` | CDN等でもキャッシュ可 |
| `max-age=N` | N秒間有効 |
| `s-maxage=N` | 共有キャッシュでN秒間有効 |
| `immutable` | 変更されないリソース |
| `stale-while-revalidate=N` | 古いキャッシュを使いながら裏で更新 |

### ETag と条件付きリクエスト

```typescript
// ETag生成
import crypto from 'crypto';

function generateETag(content: string | Buffer): string {
  const hash = crypto.createHash('md5').update(content).digest('hex');
  return `"${hash}"`;
}

// レスポンス
const content = JSON.stringify(data);
const etag = generateETag(content);

res.setHeader('ETag', etag);
res.setHeader('Cache-Control', 'no-cache');

// クライアント側（条件付きリクエスト）
const response = await fetch('/api/data', {
  headers: {
    'If-None-Match': '"cached-etag-value"',
  },
});

if (response.status === 304) {
  // キャッシュを使用
}

// サーバー側（条件チェック）
const ifNoneMatch = req.headers['if-none-match'];
if (ifNoneMatch === currentETag) {
  res.status(304).end();
  return;
}
```

### Last-Modified

```typescript
// レスポンス
res.setHeader('Last-Modified', new Date(resource.updatedAt).toUTCString());

// 条件付きリクエスト
const ifModifiedSince = req.headers['if-modified-since'];
if (ifModifiedSince) {
  const clientDate = new Date(ifModifiedSince);
  const resourceDate = new Date(resource.updatedAt);

  if (resourceDate <= clientDate) {
    res.status(304).end();
    return;
  }
}
```

## セキュリティヘッダー

### 推奨セキュリティヘッダー

```typescript
function setSecurityHeaders(res: Response): void {
  // XSS対策
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // クリックジャッキング対策
  res.setHeader('X-Frame-Options', 'DENY');

  // HTTPS強制
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // コンテンツセキュリティポリシー
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  // Referrer制御
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 機能ポリシー
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
}
```

### CORS ヘッダー

```typescript
function setCORSHeaders(res: Response, origin: string): void {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // preflight結果を24時間キャッシュ
}

// preflight対応
if (req.method === 'OPTIONS') {
  setCORSHeaders(res, allowedOrigin);
  res.status(204).end();
  return;
}
```

## カスタムヘッダー

### 命名規約

```typescript
// 推奨：X-プレフィックスなし（RFC 6648）
// ただし既存システムとの互換性でX-を使用することも多い

// リクエストID
'X-Request-ID': 'req-abc-123'

// 相関ID（分散トレーシング）
'X-Correlation-ID': 'corr-xyz-789'

// APIバージョン
'X-API-Version': '2024-01-15'

// クライアント情報
'X-Client-Version': '1.2.3'
'X-Platform': 'ios'

// レート制限情報
'X-RateLimit-Limit': '100'
'X-RateLimit-Remaining': '95'
'X-RateLimit-Reset': '1705312800'
```

### リクエストID伝播

```typescript
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 既存のIDを使用するか新規生成
  const requestId = req.headers['x-request-id'] as string || uuidv4();

  // リクエストに保存
  req.requestId = requestId;

  // レスポンスにも含める
  res.setHeader('X-Request-ID', requestId);

  // 外部API呼び出し時も伝播
  // fetch('/external-api', { headers: { 'X-Request-ID': requestId } })

  next();
}
```

### 分散トレーシングヘッダー

```typescript
// W3C Trace Context（標準）
'traceparent': '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01'
'tracestate': 'vendor1=abc,vendor2=def'

// OpenTelemetry形式
function extractTraceContext(req: Request): TraceContext {
  const traceparent = req.headers['traceparent'] as string;

  if (!traceparent) {
    return createNewTraceContext();
  }

  const [version, traceId, spanId, flags] = traceparent.split('-');

  return {
    traceId,
    spanId,
    sampled: (parseInt(flags, 16) & 0x01) === 1,
  };
}
```

## 圧縮

### Accept-Encoding / Content-Encoding

```typescript
import zlib from 'zlib';

// サーバー側圧縮
function compressResponse(
  req: Request,
  res: Response,
  body: string | Buffer
): void {
  const acceptEncoding = req.headers['accept-encoding'] || '';

  if (acceptEncoding.includes('br')) {
    res.setHeader('Content-Encoding', 'br');
    zlib.brotliCompress(body, (err, result) => {
      if (err) {
        res.end(body);
      } else {
        res.end(result);
      }
    });
  } else if (acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
    zlib.gzip(body, (err, result) => {
      if (err) {
        res.end(body);
      } else {
        res.end(result);
      }
    });
  } else {
    res.end(body);
  }
}
```

## チェックリスト

### 設計時
- [ ] Content-Typeが正しく設定されているか？
- [ ] キャッシュ戦略が定義されているか？
- [ ] セキュリティヘッダーが計画されているか？

### 実装時
- [ ] CORSが正しく設定されているか？
- [ ] リクエストIDが伝播されているか？
- [ ] ETagまたはLast-Modifiedが設定されているか？

### 運用時
- [ ] キャッシュヒット率をモニタリングしているか？
- [ ] セキュリティヘッダーが正しく設定されているか？
- [ ] 不要なヘッダーを削除しているか？

## アンチパターン

### ❌ 過度な情報漏洩

```typescript
// NG: サーバー情報を公開
res.setHeader('Server', 'Apache/2.4.41 (Ubuntu)');
res.setHeader('X-Powered-By', 'Express');
// → 攻撃者にヒントを与える

// ✅ 削除
app.disable('x-powered-by');
```

### ❌ 不適切なキャッシュ

```typescript
// NG: 認証情報を含むレスポンスをキャッシュ可能に
res.setHeader('Cache-Control', 'public, max-age=3600');
res.json({ userId: 123, token: 'secret' });

// ✅ キャッシュ禁止
res.setHeader('Cache-Control', 'no-store');
```

### ❌ CORS設定の誤り

```typescript
// NG: 全てのオリジンを許可
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Credentials', 'true');
// → credentialsとワイルドカードは共存不可

// ✅ 特定オリジンのみ許可
res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
```

## 参考

- **RFC 9110**: HTTP Semantics
- **RFC 9111**: HTTP Caching
- **MDN Web Docs**: HTTP headers
- **OWASP**: Secure Headers Project
