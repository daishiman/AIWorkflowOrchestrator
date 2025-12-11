# トークン管理ガイド

## トークン種別

| トークン種別  | 有効期限             | 用途                 | 保存場所                  |
| ------------- | -------------------- | -------------------- | ------------------------- |
| Access Token  | 短期（1時間程度）    | APIアクセス          | メモリ/セキュアストレージ |
| Refresh Token | 長期（30日〜無期限） | Access Token更新     | セキュアストレージのみ    |
| ID Token      | 短期                 | ユーザー情報（OIDC） | メモリ                    |

---

## アクセストークン取得

### 初回取得（認可コードフロー）

```bash
curl -X POST "https://auth.example.com/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "redirect_uri=https://yourapp.com/callback" \
  -d "client_id=your_client_id" \
  -d "client_secret=your_client_secret"
```

### レスポンス

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfYWJjMTIzIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmV4YW1wbGUuY29tIiwiYXVkIjoieW91cl9jbGllbnRfaWQiLCJleHAiOjE3MzY5Mzk0MDAsImlhdCI6MTczNjkzNTgwMCwic2NvcGUiOiJyZWFkIHdyaXRlIn0.signature",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4uLi4",
  "scope": "read write"
}
```

### トークン使用

```bash
curl -X GET "https://api.example.com/v1/users" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

## リフレッシュトークン

### 概要

アクセストークンの期限切れ時に、ユーザー再認証なしで
新しいアクセストークンを取得するためのトークン。

### トークン更新フロー

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Server
    participant R as Resource Server

    C->>R: 1. APIリクエスト（期限切れトークン）
    R->>C: 2. 401 Unauthorized
    C->>A: 3. リフレッシュリクエスト
    A->>C: 4. 新しいアクセストークン
    C->>R: 5. APIリクエスト（新トークン）
    R->>C: 6. 成功レスポンス
```

### リフレッシュリクエスト

```bash
curl -X POST "https://auth.example.com/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4uLi4" \
  -d "client_id=your_client_id" \
  -d "client_secret=your_client_secret"
```

### レスポンス

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...(新しいトークン)",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "bmV3IHJlZnJlc2ggdG9rZW4uLi4",
  "scope": "read write"
}
```

> ⚠️ **重要**: 新しいリフレッシュトークンが発行された場合、
> 古いリフレッシュトークンは無効になります（ローテーション）。

---

## トークン有効期限管理

### 期限切れ前の更新（推奨）

```typescript
class TokenManager {
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: Date;

  async getValidToken(): Promise<string> {
    // 期限切れ5分前に更新
    const bufferTime = 5 * 60 * 1000; // 5分

    if (new Date().getTime() > this.expiresAt.getTime() - bufferTime) {
      await this.refresh();
    }

    return this.accessToken;
  }

  private async refresh(): Promise<void> {
    const response = await fetch("/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: CLIENT_ID,
      }),
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresAt = new Date(Date.now() + data.expires_in * 1000);
  }
}
```

### 401エラー時の更新（フォールバック）

```typescript
async function apiRequest(url: string, options: RequestInit) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${tokenManager.accessToken}`,
    },
  });

  // トークン期限切れ
  if (response.status === 401) {
    await tokenManager.refresh();

    // 再試行
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${tokenManager.accessToken}`,
      },
    });
  }

  return response;
}
```

---

## トークン無効化（Revoke）

### アクセストークン無効化

```bash
curl -X POST "https://auth.example.com/oauth/revoke" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=eyJhbGciOiJSUzI1NiIs..." \
  -d "token_type_hint=access_token" \
  -d "client_id=your_client_id" \
  -d "client_secret=your_client_secret"
```

### リフレッシュトークン無効化（ログアウト）

```bash
curl -X POST "https://auth.example.com/oauth/revoke" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4uLi4" \
  -d "token_type_hint=refresh_token" \
  -d "client_id=your_client_id" \
  -d "client_secret=your_client_secret"
```

### 成功レスポンス

```http
HTTP/1.1 200 OK
```

> トークンが存在しない場合も200を返します（RFC 7009）。

---

## JWT構造

### ヘッダー

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id-123"
}
```

### ペイロード（Claims）

```json
{
  "iss": "https://auth.example.com",
  "sub": "usr_abc123",
  "aud": "your_client_id",
  "exp": 1736939400,
  "iat": 1736935800,
  "nbf": 1736935800,
  "jti": "unique-token-id",
  "scope": "read write",
  "email": "user@example.com",
  "name": "山田太郎"
}
```

### 標準クレーム

| クレーム | 説明                 | 必須 |
| -------- | -------------------- | ---- |
| iss      | 発行者URL            | ✅   |
| sub      | ユーザー識別子       | ✅   |
| aud      | 対象クライアント     | ✅   |
| exp      | 有効期限（Unix時間） | ✅   |
| iat      | 発行日時（Unix時間） | ✅   |
| nbf      | 有効開始日時         | ❌   |
| jti      | トークン一意識別子   | ❌   |

---

## トークン検証

### サーバーサイド検証

```typescript
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: "https://auth.example.com/.well-known/jwks.json",
});

async function verifyToken(token: string): Promise<JwtPayload> {
  const decoded = jwt.decode(token, { complete: true });
  const key = await client.getSigningKey(decoded.header.kid);

  return jwt.verify(token, key.getPublicKey(), {
    issuer: "https://auth.example.com",
    audience: "your_client_id",
  });
}
```

### 検証チェックリスト

- [ ] 署名が有効か
- [ ] 有効期限（exp）が過ぎていないか
- [ ] 発行者（iss）が正しいか
- [ ] 対象者（aud）が自分のclient_idか
- [ ] nbfより後か（指定されている場合）

---

## セキュアストレージ

### ブラウザ（SPA）

```typescript
// ❌ 危険: localStorage（XSS脆弱）
localStorage.setItem("access_token", token);

// ⚠️ 限定的: sessionStorage（タブ間共有不可）
sessionStorage.setItem("access_token", token);

// ✅ 推奨: HttpOnly Cookie（サーバー設定）
// または メモリ内保持 + リフレッシュトークンをHttpOnly Cookieに
```

### Node.js（サーバー）

```typescript
// 環境変数から読み込み
const clientSecret = process.env.OAUTH_CLIENT_SECRET;

// ファイルシステム（暗号化推奨）
import { readFileSync } from "fs";
const token = readFileSync("/secure/path/token.enc", "utf8");

// シークレット管理サービス
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
const client = new SecretManagerServiceClient();
const [secret] = await client.accessSecretVersion({
  name: "projects/.../secrets/api-token/versions/latest",
});
```

### モバイル

| プラットフォーム | 推奨ストレージ                         |
| ---------------- | -------------------------------------- |
| iOS              | Keychain                               |
| Android          | Encrypted SharedPreferences / Keystore |
| React Native     | react-native-keychain                  |
| Flutter          | flutter_secure_storage                 |

---

## トラブルシューティング

### よくあるエラー

| エラー             | 原因                         | 対処                   |
| ------------------ | ---------------------------- | ---------------------- |
| invalid_grant      | リフレッシュトークン期限切れ | 再ログインを促す       |
| invalid_token      | トークン形式不正             | トークン取得処理を確認 |
| token_expired      | アクセストークン期限切れ     | リフレッシュを実行     |
| insufficient_scope | スコープ不足                 | 必要なスコープで再認証 |
