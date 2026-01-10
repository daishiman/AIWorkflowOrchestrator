/**
 * PKCE (Proof Key for Code Exchange) Implementation Template
 *
 * このテンプレートは、OAuth 2.0 Authorization Code Flow + PKCE の
 * 実装パターンを提供します。SPA、モバイルアプリ向けです。
 *
 * 使用方法:
 * 1. ブラウザ環境またはNode.js環境に応じてcrypto APIを使用
 * 2. Code VerifierとCode Challengeを生成
 * 3. 認可リクエストにPKCEパラメータを追加
 * 4. トークン交換時にCode Verifierを送信
 */

// ========================================
// 型定義
// ========================================

interface PKCEParams {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: "S256";
}

interface PKCEOAuthProvider {
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string;
}

// ========================================
// PKCE Helper Functions
// ========================================

/**
 * Code Verifier生成（ブラウザ環境）
 * 43-128文字のランダムな文字列を生成
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32); // 32バイト = 約43文字（Base64URL）
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Code Challenge生成（S256方式）
 * SHA-256ハッシュを適用してBase64URLエンコード
 */
export async function generateCodeChallenge(
  codeVerifier: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Base64 URL Encode
 * RFC 7636に準拠したエンコーディング
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...Array.from(buffer)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * PKCEパラメータセット生成
 */
export async function generatePKCEParams(): Promise<PKCEParams> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: "S256",
  };
}

// ========================================
// Step 1: 認可リクエスト（PKCE付き）
// ========================================

/**
 * PKCE付きOAuth 2.0認可フローを開始
 */
export async function initiateOAuthFlowWithPKCE(
  provider: PKCEOAuthProvider,
): Promise<void> {
  // PKCEパラメータ生成
  const pkce = await generatePKCEParams();

  // Code Verifierを保存（トークン交換時に使用）
  sessionStorage.setItem("pkce_code_verifier", pkce.codeVerifier);

  // State生成（CSRF対策）
  const state = generateSecureRandomString(32);
  sessionStorage.setItem(`oauth_state_${provider.name}`, state);

  // 認可URLパラメータ構築（PKCE追加）
  const params = new URLSearchParams({
    response_type: "code",
    client_id: provider.clientId,
    redirect_uri: provider.redirectUri,
    scope: provider.scope,
    state: state,
    code_challenge: pkce.codeChallenge,
    code_challenge_method: pkce.codeChallengeMethod,
  });

  // 認可サーバーへリダイレクト
  window.location.href = `${provider.authorizeUrl}?${params.toString()}`;
}

// ========================================
// Step 2: コールバック処理（PKCE対応）
// ========================================

/**
 * PKCE対応コールバック処理
 */
export async function handlePKCECallback(
  request: Request,
  provider: PKCEOAuthProvider,
): Promise<TokenResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // エラーチェック
  if (error) {
    const errorDescription = url.searchParams.get("error_description");
    throw new OAuthAuthorizationError(error, errorDescription);
  }

  // 認可コード検証
  if (!code) {
    throw new Error("Authorization code missing from callback");
  }

  // State検証
  const savedState = sessionStorage.getItem(`oauth_state_${provider.name}`);
  if (!savedState || state !== savedState) {
    throw new Error("State mismatch - potential CSRF attack");
  }

  // State削除
  sessionStorage.removeItem(`oauth_state_${provider.name}`);

  // PKCE対応トークン交換
  return await exchangeCodeWithPKCE(code, provider);
}

// ========================================
// Step 3: トークン交換（PKCE対応）
// ========================================

/**
 * Code Verifierを使用してトークン交換
 */
async function exchangeCodeWithPKCE(
  code: string,
  provider: PKCEOAuthProvider,
): Promise<TokenResponse> {
  // Code Verifierを取得
  const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
  if (!codeVerifier) {
    throw new Error("Code verifier missing - PKCE flow broken");
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    client_id: provider.clientId,
    redirect_uri: provider.redirectUri,
    code_verifier: codeVerifier, // PKCE検証用
    // 注意: client_secretは不要（PKCEが代替）
  });

  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  // Code Verifier削除（一度のみ使用）
  sessionStorage.removeItem("pkce_code_verifier");

  if (!response.ok) {
    const error = await response.json();
    throw new OAuthTokenError(error.error, error.error_description);
  }

  const tokens: TokenResponse = await response.json();
  validateTokenResponse(tokens);

  return tokens;
}

// ========================================
// セキュリティヘルパー
// ========================================

function generateSecureRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function validateTokenResponse(tokens: TokenResponse): void {
  if (!tokens.access_token) {
    throw new Error("Access token missing");
  }
  if (tokens.token_type !== "Bearer") {
    throw new Error(`Unsupported token type: ${tokens.token_type}`);
  }
  if (!tokens.expires_in || tokens.expires_in <= 0) {
    throw new Error("Invalid expiration");
  }
}

// ========================================
// React Hook使用例
// ========================================

/**
 * React Hook: PKCE付きOAuth 2.0ログイン
 */
export function useOAuthWithPKCE(provider: PKCEOAuthProvider) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await initiateOAuthFlowWithPKCE(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}

/**
 * 使用例:
 *
 * function LoginButton() {
 *   const { login, isLoading, error } = useOAuthWithPKCE({
 *     name: 'google',
 *     authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
 *     tokenUrl: 'https://oauth2.googleapis.com/token',
 *     clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
 *     redirectUri: `${window.location.origin}/api/auth/callback`,
 *     scope: 'openid email profile',
 *   });
 *
 *   return (
 *     <button onClick={login} disabled={isLoading}>
 *       {isLoading ? 'Logging in...' : 'Login with Google'}
 *     </button>
 *   );
 * }
 */

// ========================================
// Node.js環境向け実装（サーバーサイド）
// ========================================

/**
 * Node.js環境でのCode Verifier生成
 */
export function generateCodeVerifierNode(): string {
  const crypto = require("crypto");
  const buffer = crypto.randomBytes(32);
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Node.js環境でのCode Challenge生成
 */
export function generateCodeChallengeNode(codeVerifier: string): string {
  const crypto = require("crypto");
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  return hash
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// ========================================
// エラークラス定義
// ========================================

interface OAuthError {
  error: string;
  error_description?: string | null;
}

interface TokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

class OAuthAuthorizationError extends Error {
  constructor(
    public error: string,
    public description?: string | null,
  ) {
    super(
      `OAuth Authorization Error: ${error}${description ? ` - ${description}` : ""}`,
    );
    this.name = "OAuthAuthorizationError";
  }
}

class OAuthTokenError extends Error {
  constructor(
    public error: string,
    public description?: string | null,
  ) {
    super(
      `OAuth Token Error: ${error}${description ? ` - ${description}` : ""}`,
    );
    this.name = "OAuthTokenError";
  }
}
