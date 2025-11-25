/**
 * OAuth 2.0 Client Template
 *
 * OAuth 2.0認証フローの実装テンプレート
 * 使用方法: このテンプレートをコピーし、プレースホルダーを実装してください
 *
 * 含まれる機能:
 * - Authorization Code Flow (+ PKCE)
 * - Client Credentials Flow
 * - トークン管理とリフレッシュ
 * - セキュリティベストプラクティス
 */

import crypto from "crypto";

// ============================================
// 1. 型定義
// ============================================

export interface OAuth2Config {
  /** クライアントID */
  clientId: string;

  /** クライアントシークレット（Confidentialクライアントのみ） */
  clientSecret?: string;

  /** 認可エンドポイント */
  authorizationEndpoint: string;

  /** トークンエンドポイント */
  tokenEndpoint: string;

  /** リダイレクトURI */
  redirectUri: string;

  /** スコープ */
  scopes: string[];

  /** PKCEを使用するか */
  usePKCE?: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
  scopes: string[];
}

// ============================================
// 2. エラー型定義
// ============================================

export class OAuth2Error extends Error {
  constructor(
    public readonly error: string,
    public readonly errorDescription?: string,
    public readonly errorUri?: string
  ) {
    super(errorDescription || error);
    this.name = "OAuth2Error";
  }

  static fromResponse(data: {
    error: string;
    error_description?: string;
    error_uri?: string;
  }): OAuth2Error {
    return new OAuth2Error(data.error, data.error_description, data.error_uri);
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

// ============================================
// 3. PKCE ユーティリティ
// ============================================

export class PKCEUtil {
  /**
   * Code Verifier を生成
   */
  static generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString("base64url");
  }

  /**
   * Code Challenge を生成（S256）
   */
  static generateCodeChallenge(verifier: string): string {
    return crypto.createHash("sha256").update(verifier).digest("base64url");
  }

  /**
   * PKCE ペアを生成
   */
  static generatePKCE(): { verifier: string; challenge: string } {
    const verifier = this.generateCodeVerifier();
    const challenge = this.generateCodeChallenge(verifier);
    return { verifier, challenge };
  }
}

// ============================================
// 4. State 管理
// ============================================

export class StateManager {
  private readonly states: Map<string, { createdAt: number; data?: unknown }> =
    new Map();
  private readonly ttl = 10 * 60 * 1000; // 10分

  /**
   * 新しい state を生成
   */
  generate(data?: unknown): string {
    const state = crypto.randomBytes(32).toString("hex");
    this.states.set(state, { createdAt: Date.now(), data });
    return state;
  }

  /**
   * state を検証して消費
   */
  validate(state: string): { valid: boolean; data?: unknown } {
    const entry = this.states.get(state);

    if (!entry) {
      return { valid: false };
    }

    // 使用済みとしてマーク（再利用防止）
    this.states.delete(state);

    // 有効期限チェック
    if (Date.now() - entry.createdAt > this.ttl) {
      return { valid: false };
    }

    return { valid: true, data: entry.data };
  }

  /**
   * 期限切れエントリをクリーンアップ
   */
  cleanup(): void {
    const now = Date.now();
    for (const [state, entry] of this.states) {
      if (now - entry.createdAt > this.ttl) {
        this.states.delete(state);
      }
    }
  }
}

// ============================================
// 5. OAuth 2.0 クライアント
// ============================================

export class OAuth2Client {
  private readonly config: Required<OAuth2Config>;
  private readonly stateManager = new StateManager();

  constructor(config: OAuth2Config) {
    this.config = {
      usePKCE: false,
      clientSecret: "",
      ...config,
    };
  }

  // --------------------------------------------
  // Authorization Code Flow
  // --------------------------------------------

  /**
   * 認可URLを生成
   */
  getAuthorizationUrl(options: {
    state?: string;
    pkce?: { verifier: string; challenge: string };
    additionalParams?: Record<string, string>;
  } = {}): { url: string; state: string; pkceVerifier?: string } {
    const state = options.state || this.stateManager.generate();

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(" "),
      state,
      ...options.additionalParams,
    });

    // PKCE
    let pkceVerifier: string | undefined;
    if (this.config.usePKCE) {
      const pkce = options.pkce || PKCEUtil.generatePKCE();
      pkceVerifier = pkce.verifier;
      params.set("code_challenge", pkce.challenge);
      params.set("code_challenge_method", "S256");
    }

    return {
      url: `${this.config.authorizationEndpoint}?${params}`,
      state,
      pkceVerifier,
    };
  }

  /**
   * 認可コールバックを処理
   */
  async handleCallback(params: {
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
  }): Promise<{ valid: boolean; code?: string; error?: OAuth2Error }> {
    // エラーチェック
    if (params.error) {
      return {
        valid: false,
        error: new OAuth2Error(params.error, params.error_description),
      };
    }

    // state 検証
    if (!params.state) {
      return {
        valid: false,
        error: new OAuth2Error("invalid_request", "Missing state parameter"),
      };
    }

    const stateResult = this.stateManager.validate(params.state);
    if (!stateResult.valid) {
      return {
        valid: false,
        error: new OAuth2Error("invalid_request", "Invalid or expired state"),
      };
    }

    // code 確認
    if (!params.code) {
      return {
        valid: false,
        error: new OAuth2Error("invalid_request", "Missing code parameter"),
      };
    }

    return { valid: true, code: params.code };
  }

  /**
   * 認可コードをトークンに交換
   */
  async exchangeCode(
    code: string,
    pkceVerifier?: string
  ): Promise<TokenSet> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
    });

    // PKCE verifier
    if (pkceVerifier) {
      body.set("code_verifier", pkceVerifier);
    }

    // クライアントシークレット（Confidentialクライアント）
    if (this.config.clientSecret) {
      body.set("client_secret", this.config.clientSecret);
    }

    return this.requestToken(body);
  }

  // --------------------------------------------
  // Client Credentials Flow
  // --------------------------------------------

  /**
   * クライアントクレデンシャルでトークンを取得
   */
  async getClientCredentialsToken(
    scopes?: string[]
  ): Promise<TokenSet> {
    if (!this.config.clientSecret) {
      throw new OAuth2Error(
        "invalid_client",
        "Client secret is required for client credentials flow"
      );
    }

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: (scopes || this.config.scopes).join(" "),
    });

    return this.requestToken(body);
  }

  // --------------------------------------------
  // Token Refresh
  // --------------------------------------------

  /**
   * リフレッシュトークンでアクセストークンを更新
   */
  async refreshToken(refreshToken: string): Promise<TokenSet> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: this.config.clientId,
    });

    if (this.config.clientSecret) {
      body.set("client_secret", this.config.clientSecret);
    }

    return this.requestToken(body);
  }

  // --------------------------------------------
  // Internal
  // --------------------------------------------

  private async requestToken(body: URLSearchParams): Promise<TokenSet> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      throw OAuth2Error.fromResponse(data);
    }

    return this.parseTokenResponse(data as TokenResponse);
  }

  private parseTokenResponse(response: TokenResponse): TokenSet {
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: Date.now() + response.expires_in * 1000,
      tokenType: response.token_type,
      scopes: response.scope?.split(" ") || this.config.scopes,
    };
  }
}

// ============================================
// 6. トークンマネージャー
// ============================================

export class TokenManager {
  private tokenSet: TokenSet | null = null;
  private refreshPromise: Promise<TokenSet> | null = null;
  private readonly refreshThreshold = 5 * 60 * 1000; // 5分前にリフレッシュ

  constructor(private readonly client: OAuth2Client) {}

  /**
   * 有効なアクセストークンを取得
   */
  async getAccessToken(): Promise<string> {
    // トークンがない
    if (!this.tokenSet) {
      throw new OAuth2Error("invalid_grant", "No token available");
    }

    // 有効期限内
    if (Date.now() < this.tokenSet.expiresAt - this.refreshThreshold) {
      return this.tokenSet.accessToken;
    }

    // リフレッシュ
    await this.refresh();
    return this.tokenSet!.accessToken;
  }

  /**
   * トークンを設定
   */
  setTokenSet(tokenSet: TokenSet): void {
    this.tokenSet = tokenSet;
  }

  /**
   * トークンをリフレッシュ
   */
  async refresh(): Promise<void> {
    if (!this.tokenSet?.refreshToken) {
      throw new OAuth2Error("invalid_grant", "No refresh token available");
    }

    // 重複リフレッシュ防止
    if (this.refreshPromise) {
      await this.refreshPromise;
      return;
    }

    try {
      this.refreshPromise = this.client.refreshToken(this.tokenSet.refreshToken);
      this.tokenSet = await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * トークンをクリア
   */
  clear(): void {
    this.tokenSet = null;
  }

  /**
   * トークンが有効か確認
   */
  get isValid(): boolean {
    return Boolean(
      this.tokenSet && Date.now() < this.tokenSet.expiresAt - this.refreshThreshold
    );
  }
}

// ============================================
// 7. 使用例
// ============================================

/*
// Authorization Code Flow (with PKCE)
const client = new OAuth2Client({
  clientId: 'my-client-id',
  authorizationEndpoint: 'https://auth.example.com/authorize',
  tokenEndpoint: 'https://auth.example.com/token',
  redirectUri: 'https://myapp.com/callback',
  scopes: ['openid', 'profile', 'email'],
  usePKCE: true,
});

// 1. 認可URLを生成
const { url, state, pkceVerifier } = client.getAuthorizationUrl();
// pkceVerifier をセッションに保存
sessionStorage.setItem('pkce_verifier', pkceVerifier!);
sessionStorage.setItem('oauth_state', state);
// url にリダイレクト

// 2. コールバック処理
const callbackParams = new URLSearchParams(window.location.search);
const result = await client.handleCallback({
  code: callbackParams.get('code') || undefined,
  state: callbackParams.get('state') || undefined,
  error: callbackParams.get('error') || undefined,
});

if (result.valid && result.code) {
  const pkceVerifier = sessionStorage.getItem('pkce_verifier');
  const tokenSet = await client.exchangeCode(result.code, pkceVerifier || undefined);

  // トークンマネージャーに設定
  const tokenManager = new TokenManager(client);
  tokenManager.setTokenSet(tokenSet);

  // APIリクエスト
  const accessToken = await tokenManager.getAccessToken();
  const response = await fetch('/api/data', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// Client Credentials Flow
const serviceClient = new OAuth2Client({
  clientId: 'service-client-id',
  clientSecret: 'service-client-secret',
  authorizationEndpoint: '', // 不要
  tokenEndpoint: 'https://auth.example.com/token',
  redirectUri: '', // 不要
  scopes: ['service:read', 'service:write'],
});

const tokenSet = await serviceClient.getClientCredentialsToken();
const response = await fetch('/api/internal', {
  headers: { Authorization: `Bearer ${tokenSet.accessToken}` },
});
*/
