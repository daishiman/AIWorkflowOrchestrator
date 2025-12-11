# 認証セキュリティベストプラクティス

## 認証方式別セキュリティ

### API Key認証

**推奨事項:**

- ✅ HTTPSのみで送信
- ✅ ヘッダー送信（X-API-Key）を優先
- ✅ 定期的なローテーション
- ✅ 環境別に異なるキーを使用
- ❌ URLクエリパラメータに含めない（ログに残る）
- ❌ クライアントサイドコードに埋め込まない

```http
# ✅ 推奨
X-API-Key: your_api_key

# ❌ 非推奨（ログに残る）
GET /api/users?api_key=your_api_key
```

### Bearer Token認証

**推奨事項:**

- ✅ 短い有効期限（1時間以下）
- ✅ リフレッシュトークンで更新
- ✅ HTTPSのみで送信
- ✅ トークン無効化機能を実装
- ❌ JWTに機密情報を含めない

### OAuth 2.0

**推奨事項:**

- ✅ PKCEを常に使用（特にパブリッククライアント）
- ✅ stateパラメータでCSRF対策
- ✅ redirect_uriを厳密に検証
- ✅ スコープを最小限に
- ❌ Implicit Flowは使用しない

---

## PKCE実装

### なぜPKCEが必要か

```
❌ PKCEなしの脆弱性:
1. 攻撃者がredirect_uriを傍受
2. 認可コードを盗む
3. 認可コードでトークン取得
4. 被害者のアカウントにアクセス

✅ PKCEありの保護:
1. 攻撃者がredirect_uriを傍受
2. 認可コードを盗む
3. code_verifierがないためトークン取得失敗
4. 攻撃失敗
```

### 実装チェックリスト

- [ ] code_verifierは43〜128文字のランダム文字列
- [ ] code_challengeはcode_verifierのSHA-256ハッシュ
- [ ] code_challenge_methodは"S256"を使用
- [ ] code_verifierはセッションに安全に保存

---

## シークレット管理

### 環境変数

```bash
# .env（Gitにコミットしない）
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret

# .gitignore
.env
.env.local
.env.*.local
```

### シークレット管理サービス

| サービス              | プロバイダー   |
| --------------------- | -------------- |
| AWS Secrets Manager   | AWS            |
| Google Secret Manager | GCP            |
| Azure Key Vault       | Azure          |
| HashiCorp Vault       | マルチクラウド |
| 1Password/Doppler     | SaaS           |

### 実装例

```typescript
// AWS Secrets Manager
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "ap-northeast-1" });

async function getSecret(secretName: string): Promise<string> {
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName }),
  );
  return response.SecretString!;
}

const clientSecret = await getSecret("oauth/client-secret");
```

---

## CORS設定

### 推奨設定

```typescript
// Next.js middleware.ts
import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "https://app.example.com",
    "https://staging.example.com",
  ];

  if (allowedOrigins.includes(origin)) {
    return NextResponse.next({
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return NextResponse.next();
}
```

### セキュリティヘッダー

```typescript
const securityHeaders = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'",
};
```

---

## レート制限

### 認証エンドポイント向け

```typescript
// 推奨レート制限
const authRateLimits = {
  "/oauth/token": {
    windowMs: 60 * 1000, // 1分
    maxRequests: 10, // 10リクエスト/分
    blockDurationMs: 5 * 60 * 1000, // 5分ブロック
  },
  "/oauth/authorize": {
    windowMs: 60 * 1000,
    maxRequests: 30,
    blockDurationMs: 60 * 1000,
  },
  "/login": {
    windowMs: 15 * 60 * 1000, // 15分
    maxRequests: 5, // 5回失敗でロック
    blockDurationMs: 30 * 60 * 1000, // 30分ロック
  },
};
```

### レスポンスヘッダー

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1736936400
Retry-After: 60
```

---

## 監査ログ

### 記録すべきイベント

| イベント         | 重要度 | 記録内容                                  |
| ---------------- | ------ | ----------------------------------------- |
| ログイン成功     | INFO   | user_id, ip, user_agent, timestamp        |
| ログイン失敗     | WARN   | attempted_user, ip, reason, timestamp     |
| トークン発行     | INFO   | user_id, client_id, scopes, timestamp     |
| トークン無効化   | INFO   | user_id, reason, timestamp                |
| 権限変更         | WARN   | user_id, old_perms, new_perms, changed_by |
| 不正アクセス試行 | ERROR  | ip, endpoint, reason, timestamp           |

### ログ形式

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "event": "auth.login.success",
  "level": "info",
  "user_id": "usr_abc123",
  "client_id": "app_xyz789",
  "ip": "203.0.113.45",
  "user_agent": "Mozilla/5.0...",
  "request_id": "req_123456",
  "metadata": {
    "method": "oauth2",
    "scopes": ["read", "write"]
  }
}
```

---

## 脆弱性対策

### CSRF対策

```typescript
// stateパラメータの生成と検証
function generateState(): string {
  const state = crypto.randomUUID();
  sessionStorage.setItem("oauth_state", state);
  return state;
}

function verifyState(returnedState: string): boolean {
  const savedState = sessionStorage.getItem("oauth_state");
  sessionStorage.removeItem("oauth_state");
  return savedState === returnedState;
}
```

### トークン漏洩対策

```typescript
// トークンバインディング（DPoP）
// RFC 9449 - Demonstrating Proof of Possession

// 1. 秘密鍵生成（クライアント側）
const keyPair = await crypto.subtle.generateKey(
  { name: "ECDSA", namedCurve: "P-256" },
  true,
  ["sign", "verify"],
);

// 2. DPoP Proof JWT作成
const dpopProof = await createDPoPProof(keyPair.privateKey, {
  htm: "POST",
  htu: "https://auth.example.com/oauth/token",
});

// 3. トークンリクエストに含める
fetch("/oauth/token", {
  method: "POST",
  headers: {
    DPoP: dpopProof,
  },
});
```

### XSS対策

```typescript
// HttpOnly Cookieでリフレッシュトークン保存
res.setHeader("Set-Cookie", [
  `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth`,
]);

// アクセストークンはメモリのみ
let accessToken: string | null = null;
```

---

## セキュリティチェックリスト

### 認証実装

- [ ] HTTPSのみで認証エンドポイントを公開
- [ ] PKCEをすべてのクライアントで使用
- [ ] stateパラメータでCSRF対策
- [ ] redirect_uriを厳密に検証
- [ ] アクセストークン有効期限は1時間以下

### シークレット管理

- [ ] クライアントシークレットをコードに含めない
- [ ] 環境変数またはシークレット管理サービスを使用
- [ ] 定期的なシークレットローテーション
- [ ] 本番/開発環境で異なるシークレット

### トークン管理

- [ ] リフレッシュトークンをセキュアに保存
- [ ] トークン無効化機能を実装
- [ ] リフレッシュトークンローテーション
- [ ] 不審なアクティビティ時の全トークン無効化

### 監視・ログ

- [ ] 認証イベントのログ記録
- [ ] 不正アクセス試行の検出
- [ ] アラート設定（大量ログイン失敗など）
- [ ] 定期的なセキュリティ監査
