# APIバージョニング戦略詳細ガイド

## 1. URL Path Versioning

### 構造

```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

### 実装例（Next.js App Router）

```
app/
  api/
    v1/
      users/
        route.ts
        [id]/
          route.ts
    v2/
      users/
        route.ts
        [id]/
          route.ts
```

### OpenAPI定義

```yaml
openapi: 3.1.0
info:
  title: My API
  version: 1.0.0

servers:
  - url: https://api.example.com/v1
    description: API Version 1
  - url: https://api.example.com/v2
    description: API Version 2

paths:
  /users:
    get:
      summary: ユーザー一覧
      # ...
```

### メリット

- 直感的で理解しやすい
- URLからバージョンが明確
- キャッシュが容易（URLベース）
- デバッグしやすい（ログにバージョンが残る）

### デメリット

- URLが長くなる
- REST純粋主義者からは批判される
- リソースURIが変わる（RESTの原則に反する）

---

## 2. Header Versioning

### 構造

```http
GET /users HTTP/1.1
Host: api.example.com
Accept: application/vnd.myapi.v1+json
```

または

```http
GET /users HTTP/1.1
Host: api.example.com
API-Version: 1
```

### 実装例

```typescript
// middleware.ts (Next.js)
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const version = request.headers.get('API-Version') || '1';

  // バージョンに基づいてルーティング
  const url = request.nextUrl.clone();
  url.pathname = `/api/v${version}${url.pathname.replace('/api', '')}`;

  return NextResponse.rewrite(url);
}
```

### OpenAPI定義

```yaml
openapi: 3.1.0
info:
  title: My API
  version: 1.0.0

servers:
  - url: https://api.example.com

paths:
  /users:
    get:
      summary: ユーザー一覧
      parameters:
        - name: API-Version
          in: header
          required: false
          schema:
            type: string
            enum: ['1', '2']
            default: '1'
          description: APIバージョン
```

### メリット

- URLがシンプル
- RESTfulの原則に近い
- リソースURIが変わらない

### デメリット

- 発見しにくい
- ブラウザで直接テストしにくい
- キャッシュが複雑（Varyヘッダー必要）

---

## 3. Query Parameter Versioning

### 構造

```
https://api.example.com/users?version=1
https://api.example.com/users?v=2
```

### 実装例

```typescript
// app/api/users/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version') || '1';

  if (version === '2') {
    return handleV2(request);
  }
  return handleV1(request);
}
```

### メリット

- 実装がシンプル
- テストが容易（URLにパラメータ追加するだけ）
- レガシーシステムとの互換性

### デメリット

- キャッシュ問題（クエリパラメータによる）
- URLが汚れる
- セマンティクスが不明瞭

---

## 4. Content-Type Versioning（MIME Type）

### 構造

```http
GET /users HTTP/1.1
Host: api.example.com
Accept: application/vnd.myapi.v1+json

POST /users HTTP/1.1
Host: api.example.com
Content-Type: application/vnd.myapi.v1+json
```

### カスタムMIMEタイプ

```
application/vnd.{vendor}.{version}+json
application/vnd.github.v3+json  # GitHubの例
application/vnd.myapi.v1+json
```

### メリット

- HTTP仕様に準拠
- コンテンツネゴシエーションが可能
- 同じリソースで異なる表現が可能

### デメリット

- 複雑
- ツールサポートが限定的
- 開発者の学習コストが高い

---

## 5. ハイブリッドアプローチ

### 推奨パターン

```
# メジャーバージョン: URL Path
/api/v1/users
/api/v2/users

# マイナーバージョン: Header
GET /api/v1/users
API-Minor-Version: 2

# 機能フラグ: Query Parameter
GET /api/v1/users?feature=new-pagination
```

### 実装戦略

```typescript
interface ApiVersion {
  major: number;   // URL Path から
  minor: number;   // Header から
  features: string[]; // Query から
}

function resolveVersion(request: Request): ApiVersion {
  const url = new URL(request.url);
  const majorMatch = url.pathname.match(/\/api\/v(\d+)\//);

  return {
    major: majorMatch ? parseInt(majorMatch[1]) : 1,
    minor: parseInt(request.headers.get('API-Minor-Version') || '0'),
    features: url.searchParams.getAll('feature')
  };
}
```

---

## バージョン解決ロジック

### デフォルトバージョン戦略

```typescript
const DEFAULT_VERSION = '1';
const SUPPORTED_VERSIONS = ['1', '2'];
const LATEST_VERSION = '2';

function resolveVersion(requestedVersion: string | null): string {
  // 未指定 → デフォルト
  if (!requestedVersion) {
    return DEFAULT_VERSION;
  }

  // "latest" 指定
  if (requestedVersion === 'latest') {
    return LATEST_VERSION;
  }

  // サポート対象チェック
  if (SUPPORTED_VERSIONS.includes(requestedVersion)) {
    return requestedVersion;
  }

  // 未サポートバージョン
  throw new ApiError(400, `Unsupported API version: ${requestedVersion}`);
}
```

### 廃止バージョンの処理

```typescript
const DEPRECATED_VERSIONS = ['1'];
const SUNSET_DATES: Record<string, Date> = {
  '1': new Date('2025-06-01')
};

function checkDeprecation(version: string, response: Response): void {
  if (DEPRECATED_VERSIONS.includes(version)) {
    const sunsetDate = SUNSET_DATES[version];

    response.headers.set('Deprecation', 'true');
    response.headers.set('Sunset', sunsetDate.toUTCString());
    response.headers.set(
      'Link',
      `</api/v2>; rel="successor-version"`
    );
  }
}
```

---

## バージョン比較表

| 観点 | URL Path | Header | Query | Content-Type |
|------|----------|--------|-------|--------------|
| 明確さ | ⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐ |
| REST準拠 | ⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| キャッシュ | ⭐⭐⭐ | ⭐ | ⭐ | ⭐⭐ |
| テスト容易性 | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐ |
| ツールサポート | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| 採用実績 | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐ |

**推奨**: 新規プロジェクトでは **URL Path Versioning** を採用
