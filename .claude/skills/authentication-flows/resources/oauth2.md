# OAuth 2.0

## 概要

OAuth 2.0は、サードパーティアプリケーションがユーザーの代理でリソースに
アクセスするための標準的な認可フレームワークです。

## フロー種別

| フロー                    | 用途                      | クライアントタイプ  |
| ------------------------- | ------------------------- | ------------------- |
| Authorization Code        | Webアプリ、モバイルアプリ | Confidential/Public |
| Authorization Code + PKCE | SPA、モバイルアプリ       | Public              |
| Client Credentials        | サービス間通信            | Confidential        |
| Device Code               | IoT、スマートTV           | Public              |

## Authorization Code Flow

### フロー図

```
┌──────────┐                              ┌──────────────────┐
│          │──(1) Authorization Request──▶│                  │
│  User    │                              │  Authorization   │
│  Agent   │◀──(2) Authorization Code────│  Server          │
│          │                              │                  │
└────┬─────┘                              └──────────────────┘
     │                                            ▲
     │ (3) Authorization Code                     │
     ▼                                            │
┌──────────┐                              ┌───────┴──────────┐
│          │──(4) Exchange Code──────────▶│                  │
│  Client  │                              │  Token Endpoint  │
│          │◀──(5) Access Token───────────│                  │
└──────────┘                              └──────────────────┘
```

### 実装

```typescript
import crypto from "crypto";

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  redirectUri: string;
  scopes: string[];
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

class OAuth2Client {
  constructor(private readonly config: OAuthConfig) {}

  /**
   * Step 1: 認可URLを生成
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(" "),
      state, // CSRF対策
    });

    return `${this.config.authorizationEndpoint}?${params}`;
  }

  /**
   * Step 2: 認可コードをトークンに交換
   */
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${this.getBasicAuth()}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new OAuthError(error.error, error.error_description);
    }

    return response.json();
  }

  /**
   * リフレッシュトークンで新しいアクセストークンを取得
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${this.getBasicAuth()}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new OAuthError(error.error, error.error_description);
    }

    return response.json();
  }

  private getBasicAuth(): string {
    return Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");
  }
}
```

## Authorization Code Flow with PKCE

SPAやモバイルアプリでクライアントシークレットを安全に保存できない場合に使用。

### PKCE実装

```typescript
class PKCEGenerator {
  /**
   * Code Verifierを生成（43-128文字のランダム文字列）
   */
  static generateCodeVerifier(): string {
    const buffer = crypto.randomBytes(32);
    return buffer
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  /**
   * Code Challengeを生成（S256メソッド）
   */
  static generateCodeChallenge(verifier: string): string {
    const hash = crypto.createHash("sha256").update(verifier).digest();
    return hash
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }
}

class OAuth2PKCEClient {
  constructor(private readonly config: Omit<OAuthConfig, "clientSecret">) {}

  /**
   * 認可URLを生成（PKCE付き）
   */
  getAuthorizationUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(" "),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return `${this.config.authorizationEndpoint}?${params}`;
  }

  /**
   * 認可コードをトークンに交換（PKCE検証付き）
   */
  async exchangeCodeForToken(
    code: string,
    codeVerifier: string,
  ): Promise<TokenResponse> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new OAuthError(error.error, error.error_description);
    }

    return response.json();
  }
}

// 使用例
const pkce = {
  verifier: PKCEGenerator.generateCodeVerifier(),
  challenge: "",
};
pkce.challenge = PKCEGenerator.generateCodeChallenge(pkce.verifier);

// verifierはセッションに保存（コールバックで使用）
sessionStorage.setItem("pkce_verifier", pkce.verifier);

// 認可URLにリダイレクト
const authUrl = client.getAuthorizationUrl(state, pkce.challenge);
```

## Client Credentials Flow

サービス間通信など、ユーザーコンテキストが不要な場合に使用。

```typescript
class OAuth2ClientCredentials {
  constructor(
    private readonly config: {
      clientId: string;
      clientSecret: string;
      tokenEndpoint: string;
      scopes: string[];
    },
  ) {}

  async getAccessToken(): Promise<TokenResponse> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${this.getBasicAuth()}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: this.config.scopes.join(" "),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new OAuthError(error.error, error.error_description);
    }

    return response.json();
  }

  private getBasicAuth(): string {
    return Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");
  }
}
```

## トークン管理

### キャッシュとリフレッシュ

```typescript
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt = 0;
  private refreshPromise: Promise<void> | null = null;

  constructor(private readonly client: OAuth2Client) {}

  async getAccessToken(): Promise<string> {
    // 有効期限の5分前にリフレッシュ
    const refreshThreshold = 5 * 60 * 1000;

    if (this.accessToken && Date.now() < this.expiresAt - refreshThreshold) {
      return this.accessToken;
    }

    // リフレッシュ中の重複防止
    if (this.refreshPromise) {
      await this.refreshPromise;
      return this.accessToken!;
    }

    this.refreshPromise = this.refresh();
    await this.refreshPromise;
    this.refreshPromise = null;

    return this.accessToken!;
  }

  private async refresh(): Promise<void> {
    try {
      let tokenResponse: TokenResponse;

      if (this.refreshToken) {
        tokenResponse = await this.client.refreshAccessToken(this.refreshToken);
      } else {
        throw new Error("No refresh token available");
      }

      this.updateTokens(tokenResponse);
    } catch (error) {
      // リフレッシュ失敗時はトークンをクリア
      this.accessToken = null;
      this.refreshToken = null;
      this.expiresAt = 0;
      throw error;
    }
  }

  private updateTokens(response: TokenResponse): void {
    this.accessToken = response.access_token;
    if (response.refresh_token) {
      this.refreshToken = response.refresh_token;
    }
    this.expiresAt = Date.now() + response.expires_in * 1000;
  }
}
```

## エラーハンドリング

```typescript
class OAuthError extends Error {
  constructor(
    public readonly error: string,
    public readonly description?: string,
  ) {
    super(description || error);
    this.name = "OAuthError";
  }

  get isRetryable(): boolean {
    return this.error === "temporarily_unavailable";
  }

  get requiresReauth(): boolean {
    return (
      this.error === "invalid_grant" ||
      this.error === "invalid_token" ||
      this.error === "access_denied"
    );
  }
}

// エラーハンドリング
async function handleOAuthError(error: OAuthError): Promise<void> {
  switch (error.error) {
    case "invalid_grant":
      // リフレッシュトークン無効 → 再認証が必要
      await redirectToLogin();
      break;

    case "invalid_client":
      // クライアント設定エラー → 設定確認
      console.error("Invalid client credentials");
      break;

    case "invalid_scope":
      // スコープエラー → スコープ確認
      console.error("Invalid scope requested");
      break;

    case "temporarily_unavailable":
      // 一時的エラー → リトライ
      await sleep(5000);
      break;

    default:
      throw error;
  }
}
```

## セキュリティベストプラクティス

### State パラメータ

```typescript
// CSRF対策のstateパラメータ
function generateState(): string {
  const state = crypto.randomBytes(32).toString("hex");
  sessionStorage.setItem("oauth_state", state);
  return state;
}

function validateState(returnedState: string): boolean {
  const savedState = sessionStorage.getItem("oauth_state");
  sessionStorage.removeItem("oauth_state");
  return savedState === returnedState;
}
```

### トークン保存

```typescript
// ❌ NG: localStorageに保存（XSS脆弱性）
localStorage.setItem("access_token", token);

// ✅ OK: httpOnly Cookie（サーバー設定）
// Set-Cookie: access_token=xxx; HttpOnly; Secure; SameSite=Strict

// ✅ OK: メモリ内のみ保持（SPAの場合）
class TokenStore {
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }
}
```

## チェックリスト

### 実装時

- [ ] PKCEを使用しているか（パブリッククライアントの場合）？
- [ ] stateパラメータでCSRF対策しているか？
- [ ] トークンを安全に保存しているか？

### 運用時

- [ ] トークン有効期限は適切か？
- [ ] リフレッシュトークンのローテーションがあるか？
- [ ] 認証失敗のモニタリングがあるか？

## 参考

- **RFC 6749**: The OAuth 2.0 Authorization Framework
- **RFC 7636**: Proof Key for Code Exchange (PKCE)
- **RFC 6750**: Bearer Token Usage
