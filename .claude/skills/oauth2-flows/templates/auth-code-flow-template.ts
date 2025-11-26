/**
 * Authorization Code Flow Implementation Template
 *
 * このテンプレートは、OAuth 2.0 Authorization Code Flowの
 * 標準的な実装パターンを提供します。
 *
 * 使用方法:
 * 1. プロバイダー固有の設定を環境変数に設定
 * 2. generateSecureRandomString()を実装
 * 3. エラーハンドリングをプロジェクトの戦略に合わせてカスタマイズ
 */

// ========================================
// 型定義
// ========================================

interface OAuthProvider {
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface OAuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

// ========================================
// Step 1: 認可リクエストの開始
// ========================================

/**
 * OAuth 2.0認可フローを開始
 * ユーザーを認可サーバーのログイン画面にリダイレクトします
 */
export function initiateOAuthFlow(provider: OAuthProvider): void {
  // State生成（CSRF対策）
  const state = generateSecureRandomString(32);

  // Stateを保存（コールバック時に検証）
  sessionStorage.setItem(`oauth_state_${provider.name}`, state);

  // 認可URLパラメータ構築
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: provider.clientId,
    redirect_uri: provider.redirectUri,
    scope: provider.scope,
    state: state,
  });

  // 認可サーバーへリダイレクト
  const authorizationUrl = `${provider.authorizeUrl}?${params.toString()}`;
  window.location.href = authorizationUrl;
}

// ========================================
// Step 2: コールバック処理
// ========================================

/**
 * OAuth 2.0コールバックを処理
 * 認可コードとstateパラメータを検証します
 */
export async function handleOAuthCallback(
  request: Request,
  provider: OAuthProvider
): Promise<TokenResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // エラーチェック
  if (error) {
    const errorDescription = url.searchParams.get('error_description');
    throw new OAuthAuthorizationError(error, errorDescription);
  }

  // 認可コード検証
  if (!code) {
    throw new Error('Authorization code missing from callback');
  }

  // State検証（CSRF対策）
  const savedState = sessionStorage.getItem(`oauth_state_${provider.name}`);
  if (!savedState || state !== savedState) {
    throw new Error('State mismatch - potential CSRF attack');
  }

  // State削除（一度のみ使用）
  sessionStorage.removeItem(`oauth_state_${provider.name}`);

  // トークン交換
  return await exchangeCodeForToken(code, provider);
}

// ========================================
// Step 3: トークン交換
// ========================================

/**
 * 認可コードをアクセストークンに交換
 */
async function exchangeCodeForToken(
  code: string,
  provider: OAuthProvider
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    redirect_uri: provider.redirectUri,
  });

  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error: OAuthError = await response.json();
    throw new OAuthTokenError(error.error, error.error_description);
  }

  const tokens: TokenResponse = await response.json();

  // トークン検証
  validateTokenResponse(tokens);

  return tokens;
}

// ========================================
// Step 4: トークン使用
// ========================================

/**
 * アクセストークンを使用してAPIを呼び出し
 */
export async function fetchProtectedResource<T>(
  url: string,
  accessToken: string
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (response.status === 401) {
    throw new TokenExpiredError('Access token expired or invalid');
  }

  if (!response.ok) {
    throw new APIError(`API request failed: ${response.statusText}`);
  }

  return await response.json();
}

// ========================================
// ヘルパー関数
// ========================================

/**
 * 暗号学的に安全なランダム文字列を生成
 */
function generateSecureRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Base64 URL Encode
 */
function base64URLEncode(buffer: Uint8Array | Buffer): string {
  const base64 = Buffer.from(buffer).toString('base64');
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * トークンレスポンスの検証
 */
function validateTokenResponse(tokens: TokenResponse): void {
  if (!tokens.access_token) {
    throw new Error('Access token missing from response');
  }

  if (tokens.token_type !== 'Bearer') {
    throw new Error(`Unsupported token type: ${tokens.token_type}`);
  }

  if (!tokens.expires_in || tokens.expires_in <= 0) {
    throw new Error('Invalid token expiration');
  }
}

// ========================================
// エラークラス
// ========================================

class OAuthAuthorizationError extends Error {
  constructor(
    public error: string,
    public description?: string | null
  ) {
    super(`OAuth Authorization Error: ${error}${description ? ` - ${description}` : ''}`);
    this.name = 'OAuthAuthorizationError';
  }
}

class OAuthTokenError extends Error {
  constructor(
    public error: string,
    public description?: string | null
  ) {
    super(`OAuth Token Error: ${error}${description ? ` - ${description}` : ''}`);
    this.name = 'OAuthTokenError';
  }
}

class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// ========================================
// Next.js App Router向け実装例
// ========================================

/**
 * Next.js API Route: /api/auth/callback
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const provider: OAuthProvider = {
      name: 'google',
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI!,
      scope: 'openid email profile',
    };

    const tokens = await handleOAuthCallback(request, provider);

    // トークンをHttpOnly Cookieに保存
    const response = Response.redirect('/dashboard');
    response.headers.append(
      'Set-Cookie',
      `access_token=${tokens.access_token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${tokens.expires_in}; Path=/`
    );

    if (tokens.refresh_token) {
      response.headers.append(
        'Set-Cookie',
        `refresh_token=${tokens.refresh_token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 3600}; Path=/api/auth/refresh`
      );
    }

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return Response.redirect('/login?error=auth_failed');
  }
}

// ========================================
// 使用例
// ========================================

/**
 * クライアント側: ログインボタンクリック時
 */
function onLoginButtonClick(): void {
  const provider: OAuthProvider = {
    name: 'google',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: '', // クライアント側では不要
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    clientSecret: '', // クライアント側では不要
    redirectUri: `${window.location.origin}/api/auth/callback`,
    scope: 'openid email profile',
  };

  initiateOAuthFlow(provider);
}

/**
 * サーバー側: 保護されたAPIルート
 */
export async function getUserProfile(request: Request): Promise<UserProfile> {
  // Cookie からアクセストークン取得
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const accessToken = cookies.access_token;

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  // Google User Info APIを呼び出し
  return await fetchProtectedResource<UserProfile>(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    accessToken
  );
}

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [key, value] = cookie.trim().split('=');
      return [key, value];
    })
  );
}
