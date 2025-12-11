# 認証フロー詳細ガイド

## 1. API Key認証

### 実装パターン

**ヘッダーベース（推奨）**:

```typescript
const headers = {
  Authorization: `Bearer ${apiKey}`,
  // または
  "X-API-Key": apiKey,
};
```

**環境変数管理**:

```bash
# .env ファイル
GOOGLE_API_KEY=AIza...
SLACK_BOT_TOKEN=xoxb-...
GITHUB_TOKEN=ghp_...
```

### ローテーション戦略

```
┌───────────┐    有効期限前    ┌───────────┐
│ Key A     │ ────────────────▶ │ Key B     │
│ (active)  │                   │ (pending) │
└───────────┘                   └───────────┘
      │                               │
      │ 移行期間（両方有効）          │
      ▼                               ▼
┌───────────┐                   ┌───────────┐
│ Key A     │                   │ Key B     │
│ (revoked) │                   │ (active)  │
└───────────┘                   └───────────┘
```

## 2. OAuth 2.0フロー

### Authorization Code Flow

**Step 1: 認可リクエスト**

```
GET /authorize?
  response_type=code&
  client_id={CLIENT_ID}&
  redirect_uri={REDIRECT_URI}&
  scope={SCOPES}&
  state={RANDOM_STATE}
```

**Step 2: 認可コード取得**

```
Callback URL:
{REDIRECT_URI}?code={AUTH_CODE}&state={STATE}
```

**Step 3: トークンリクエスト**

```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code={AUTH_CODE}&
redirect_uri={REDIRECT_URI}&
client_id={CLIENT_ID}&
client_secret={CLIENT_SECRET}
```

**Step 4: トークンレスポンス**

```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "abc...",
  "scope": "read write"
}
```

### PKCE拡張

**Code Verifier生成**:

```javascript
const codeVerifier = crypto.randomBytes(32).toString("base64url");
```

**Code Challenge生成**:

```javascript
const codeChallenge = crypto
  .createHash("sha256")
  .update(codeVerifier)
  .digest("base64url");
```

**認可リクエスト（PKCE付き）**:

```
GET /authorize?
  ...
  code_challenge={CODE_CHALLENGE}&
  code_challenge_method=S256
```

### リフレッシュトークンフロー

```javascript
async function refreshAccessToken(refreshToken) {
  const response = await fetch("/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  return response.json();
}
```

## 3. JWT認証

### トークン構造

```
Header.Payload.Signature

Header:
{
  "alg": "RS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user-id",
  "iat": 1622505600,
  "exp": 1622509200,
  "iss": "auth-server",
  "aud": "api-server"
}
```

### 検証手順

```javascript
function validateJWT(token) {
  // 1. トークンを分割
  const [headerB64, payloadB64, signature] = token.split(".");

  // 2. 署名検証
  const expectedSignature = sign(headerB64 + "." + payloadB64, secret);
  if (signature !== expectedSignature) {
    throw new Error("Invalid signature");
  }

  // 3. ペイロードをデコード
  const payload = JSON.parse(atob(payloadB64));

  // 4. 有効期限チェック
  if (Date.now() >= payload.exp * 1000) {
    throw new Error("Token expired");
  }

  // 5. 発行者チェック
  if (payload.iss !== EXPECTED_ISSUER) {
    throw new Error("Invalid issuer");
  }

  return payload;
}
```

## 4. サービスアカウント認証

### Google Cloud

```javascript
const { GoogleAuth } = require("google-auth-library");

const auth = new GoogleAuth({
  keyFile: "service-account.json",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const client = await auth.getClient();
const token = await client.getAccessToken();
```

### AWS Signature V4

```javascript
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});
```

## 5. セキュリティベストプラクティス

### トークン保存

| 保存場所                 | セキュリティ | 用途                   |
| ------------------------ | ------------ | ---------------------- |
| 環境変数                 | ✅ 高        | サーバーサイド         |
| Secure Cookie (httpOnly) | ✅ 高        | ブラウザ（セッション） |
| localStorage             | ❌ 低        | 非推奨                 |
| sessionStorage           | ⚠️ 中        | 一時的なトークン       |

### 安全な実装チェックリスト

- [ ] トークンはHTTPS経由でのみ送信
- [ ] state パラメータでCSRF対策
- [ ] トークンの有効期限は最小限に設定
- [ ] リフレッシュトークンは安全に保存
- [ ] トークン漏洩時の失効プロセスを定義
- [ ] ログにトークンを出力しない

## 6. エラーハンドリング

### 認証エラーコード

| コード                 | 意味                    | 対応               |
| ---------------------- | ----------------------- | ------------------ |
| invalid_request        | リクエスト形式不正      | パラメータ確認     |
| invalid_client         | クライアント認証失敗    | クレデンシャル確認 |
| invalid_grant          | 認可コード/トークン無効 | 再認証             |
| unauthorized_client    | クライアント未認可      | 権限確認           |
| unsupported_grant_type | 非対応grant_type        | 設定確認           |
| invalid_scope          | スコープ不正            | スコープ確認       |

### エラーレスポンス例

```json
{
  "error": "invalid_grant",
  "error_description": "The refresh token has expired",
  "error_uri": "https://docs.example.com/errors/invalid_grant"
}
```
