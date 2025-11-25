/**
 * JWT Service Template
 *
 * JWTの生成・検証サービスの実装テンプレート
 * 使用方法: このテンプレートをコピーし、プレースホルダーを実装してください
 *
 * 含まれる機能:
 * - JWT生成と検証
 * - アクセストークン/リフレッシュトークン管理
 * - トークン無効化（ブラックリスト）
 * - セキュリティベストプラクティス
 */

import crypto from "crypto";

// ============================================
// 1. 型定義
// ============================================

export interface JWTConfig {
  /** 署名シークレット（HS256用） */
  secret?: string;

  /** 秘密鍵（RS256/ES256用） */
  privateKey?: string;

  /** 公開鍵（RS256/ES256用、検証のみ） */
  publicKey?: string;

  /** 署名アルゴリズム */
  algorithm: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512" | "ES256" | "ES384" | "ES512";

  /** 発行者 */
  issuer: string;

  /** 対象者 */
  audience: string | string[];

  /** アクセストークン有効期限 */
  accessTokenExpiry: string | number;

  /** リフレッシュトークン有効期限 */
  refreshTokenExpiry: string | number;
}

export interface JWTPayload {
  /** サブジェクト（ユーザーID） */
  sub: string;

  /** 発行者 */
  iss?: string;

  /** 対象者 */
  aud?: string | string[];

  /** 有効期限（Unix時間） */
  exp?: number;

  /** 発行時刻（Unix時間） */
  iat?: number;

  /** 有効開始時刻（Unix時間） */
  nbf?: number;

  /** JWT ID */
  jti?: string;

  /** カスタムクレーム */
  [key: string]: unknown;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

// ============================================
// 2. エラー型定義
// ============================================

export class JWTError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "JWTError";
  }
}

export class TokenExpiredError extends JWTError {
  constructor(message = "Token has expired") {
    super(message, "TOKEN_EXPIRED");
    this.name = "TokenExpiredError";
  }
}

export class InvalidTokenError extends JWTError {
  constructor(message = "Invalid token") {
    super(message, "INVALID_TOKEN");
    this.name = "InvalidTokenError";
  }
}

export class TokenRevokedError extends JWTError {
  constructor(message = "Token has been revoked") {
    super(message, "TOKEN_REVOKED");
    this.name = "TokenRevokedError";
  }
}

// ============================================
// 3. JWT ユーティリティ
// ============================================

class JWTUtil {
  /**
   * 有効期限文字列を秒に変換
   */
  static parseExpiry(expiry: string | number): number {
    if (typeof expiry === "number") return expiry;

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid expiry format: ${expiry}`);

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return value * multipliers[unit];
  }

  /**
   * Base64URL エンコード
   */
  static base64UrlEncode(data: string | Buffer): string {
    const buffer = typeof data === "string" ? Buffer.from(data) : data;
    return buffer.toString("base64url");
  }

  /**
   * Base64URL デコード
   */
  static base64UrlDecode(data: string): string {
    return Buffer.from(data, "base64url").toString("utf-8");
  }

  /**
   * HMAC署名
   */
  static hmacSign(data: string, secret: string, algorithm: string): string {
    const alg = algorithm.replace("HS", "sha");
    return crypto.createHmac(alg, secret).update(data).digest("base64url");
  }

  /**
   * HMAC検証
   */
  static hmacVerify(data: string, signature: string, secret: string, algorithm: string): boolean {
    const expected = this.hmacSign(data, secret, algorithm);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }
}

// ============================================
// 4. JWT サービス
// ============================================

export class JWTService {
  private readonly config: JWTConfig;

  constructor(config: JWTConfig) {
    this.config = config;
    this.validateConfig();
  }

  private validateConfig(): void {
    const { algorithm, secret, privateKey } = this.config;

    if (algorithm.startsWith("HS") && !secret) {
      throw new Error("Secret is required for HMAC algorithms");
    }

    if ((algorithm.startsWith("RS") || algorithm.startsWith("ES")) && !privateKey) {
      throw new Error("Private key is required for RSA/ECDSA algorithms");
    }

    // シークレットの強度チェック
    if (secret && secret.length < 32) {
      console.warn("Warning: JWT secret should be at least 32 characters");
    }
  }

  /**
   * JWT を生成
   */
  sign(payload: Omit<JWTPayload, "iss" | "aud" | "iat" | "exp" | "jti">, options: {
    expiresIn?: string | number;
    jti?: string;
  } = {}): string {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = options.expiresIn
      ? JWTUtil.parseExpiry(options.expiresIn)
      : JWTUtil.parseExpiry(this.config.accessTokenExpiry);

    const fullPayload: JWTPayload = {
      ...payload,
      iss: this.config.issuer,
      aud: this.config.audience,
      iat: now,
      exp: now + expiresIn,
      jti: options.jti || crypto.randomUUID(),
    };

    return this.encode(fullPayload);
  }

  /**
   * JWT を検証
   */
  verify(token: string): JWTPayload {
    const payload = this.decode(token);

    // 有効期限チェック
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new TokenExpiredError();
    }

    // 有効開始時刻チェック
    if (payload.nbf && payload.nbf > now) {
      throw new InvalidTokenError("Token not yet valid");
    }

    // 発行者チェック
    if (payload.iss !== this.config.issuer) {
      throw new InvalidTokenError("Invalid issuer");
    }

    // 対象者チェック
    if (!this.validateAudience(payload.aud)) {
      throw new InvalidTokenError("Invalid audience");
    }

    return payload;
  }

  /**
   * JWT をデコード（検証なし）
   */
  decode(token: string): JWTPayload {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new InvalidTokenError("Invalid token format");
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // ヘッダー検証
    const header = JSON.parse(JWTUtil.base64UrlDecode(headerB64));
    if (header.alg !== this.config.algorithm) {
      throw new InvalidTokenError(`Invalid algorithm: expected ${this.config.algorithm}`);
    }

    // 署名検証
    const data = `${headerB64}.${payloadB64}`;
    if (!this.verifySignature(data, signatureB64)) {
      throw new InvalidTokenError("Invalid signature");
    }

    return JSON.parse(JWTUtil.base64UrlDecode(payloadB64));
  }

  private encode(payload: JWTPayload): string {
    const header = {
      alg: this.config.algorithm,
      typ: "JWT",
    };

    const headerB64 = JWTUtil.base64UrlEncode(JSON.stringify(header));
    const payloadB64 = JWTUtil.base64UrlEncode(JSON.stringify(payload));
    const data = `${headerB64}.${payloadB64}`;
    const signature = this.createSignature(data);

    return `${data}.${signature}`;
  }

  private createSignature(data: string): string {
    const { algorithm, secret, privateKey } = this.config;

    if (algorithm.startsWith("HS")) {
      return JWTUtil.hmacSign(data, secret!, algorithm);
    }

    // RSA/ECDSA署名（node:crypto使用）
    const alg = algorithm.replace("RS", "RSA-SHA").replace("ES", "ECDSA-SHA");
    const sign = crypto.createSign(alg);
    sign.update(data);
    return sign.sign(privateKey!, "base64url");
  }

  private verifySignature(data: string, signature: string): boolean {
    const { algorithm, secret, publicKey, privateKey } = this.config;

    if (algorithm.startsWith("HS")) {
      return JWTUtil.hmacVerify(data, signature, secret!, algorithm);
    }

    // RSA/ECDSA検証
    const key = publicKey || privateKey;
    const alg = algorithm.replace("RS", "RSA-SHA").replace("ES", "ECDSA-SHA");
    const verify = crypto.createVerify(alg);
    verify.update(data);
    return verify.verify(key!, signature, "base64url");
  }

  private validateAudience(aud: string | string[] | undefined): boolean {
    if (!aud) return false;

    const configAud = Array.isArray(this.config.audience)
      ? this.config.audience
      : [this.config.audience];
    const tokenAud = Array.isArray(aud) ? aud : [aud];

    return tokenAud.some((a) => configAud.includes(a));
  }
}

// ============================================
// 5. トークンペアサービス
// ============================================

export class TokenPairService {
  private readonly jwtService: JWTService;
  private readonly config: JWTConfig;

  constructor(config: JWTConfig) {
    this.config = config;
    this.jwtService = new JWTService(config);
  }

  /**
   * アクセストークンとリフレッシュトークンのペアを生成
   */
  generateTokenPair(userId: string, claims: Record<string, unknown> = {}): TokenPair {
    const now = Date.now();
    const accessExpiry = JWTUtil.parseExpiry(this.config.accessTokenExpiry) * 1000;
    const refreshExpiry = JWTUtil.parseExpiry(this.config.refreshTokenExpiry) * 1000;

    // アクセストークン
    const accessToken = this.jwtService.sign(
      { sub: userId, type: "access", ...claims },
      { expiresIn: this.config.accessTokenExpiry }
    );

    // リフレッシュトークン
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: "refresh" },
      { expiresIn: this.config.refreshTokenExpiry }
    );

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: now + accessExpiry,
      refreshTokenExpiresAt: now + refreshExpiry,
    };
  }

  /**
   * アクセストークンを検証
   */
  verifyAccessToken(token: string): JWTPayload {
    const payload = this.jwtService.verify(token);

    if (payload.type !== "access") {
      throw new InvalidTokenError("Not an access token");
    }

    return payload;
  }

  /**
   * リフレッシュトークンを検証
   */
  verifyRefreshToken(token: string): JWTPayload {
    const payload = this.jwtService.verify(token);

    if (payload.type !== "refresh") {
      throw new InvalidTokenError("Not a refresh token");
    }

    return payload;
  }

  /**
   * リフレッシュトークンから新しいトークンペアを生成
   */
  refreshTokenPair(refreshToken: string, claims: Record<string, unknown> = {}): TokenPair {
    const payload = this.verifyRefreshToken(refreshToken);
    return this.generateTokenPair(payload.sub, claims);
  }
}

// ============================================
// 6. トークンブラックリスト
// ============================================

export class TokenBlacklist {
  private readonly blacklist: Map<string, number> = new Map();

  /**
   * トークンを無効化
   */
  revoke(jti: string, exp: number): void {
    this.blacklist.set(jti, exp);
  }

  /**
   * トークンが無効化されているか確認
   */
  isRevoked(jti: string): boolean {
    return this.blacklist.has(jti);
  }

  /**
   * 期限切れエントリをクリーンアップ
   */
  cleanup(): number {
    const now = Math.floor(Date.now() / 1000);
    let cleaned = 0;

    for (const [jti, exp] of this.blacklist) {
      if (exp < now) {
        this.blacklist.delete(jti);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * ブラックリストのサイズ
   */
  get size(): number {
    return this.blacklist.size;
  }
}

// ============================================
// 7. 使用例
// ============================================

/*
// JWTサービスの初期化
const jwtService = new JWTService({
  secret: process.env.JWT_SECRET!,
  algorithm: 'HS256',
  issuer: 'https://api.example.com',
  audience: 'https://app.example.com',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
});

// トークン生成
const token = jwtService.sign({
  sub: 'user-123',
  roles: ['user', 'admin'],
});

// トークン検証
try {
  const payload = jwtService.verify(token);
  console.log('User ID:', payload.sub);
  console.log('Roles:', payload.roles);
} catch (error) {
  if (error instanceof TokenExpiredError) {
    // トークン期限切れ
  } else if (error instanceof InvalidTokenError) {
    // 不正なトークン
  }
}

// トークンペアサービスの使用
const tokenPairService = new TokenPairService({
  secret: process.env.JWT_SECRET!,
  algorithm: 'HS256',
  issuer: 'https://api.example.com',
  audience: 'https://app.example.com',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
});

// ログイン時
const { accessToken, refreshToken } = tokenPairService.generateTokenPair('user-123', {
  roles: ['user'],
});

// トークンリフレッシュ
const newTokens = tokenPairService.refreshTokenPair(refreshToken, {
  roles: ['user'],
});

// ブラックリスト使用
const blacklist = new TokenBlacklist();

// ログアウト時
const payload = jwtService.decode(accessToken);
blacklist.revoke(payload.jti!, payload.exp!);

// 検証時
const verifiedPayload = jwtService.verify(accessToken);
if (blacklist.isRevoked(verifiedPayload.jti!)) {
  throw new TokenRevokedError();
}
*/
