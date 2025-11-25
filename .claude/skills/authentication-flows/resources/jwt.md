# JSON Web Token (JWT)

## 概要

JWTは、当事者間で情報を安全に伝送するためのコンパクトで自己完結型のトークン形式です。
マイクロサービスアーキテクチャでのステートレス認証に広く使用されています。

## JWT構造

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

┌─────────────────────────────────────────────────────────────┐
│                           Header                             │
│  {"alg": "HS256", "typ": "JWT"}                             │
├─────────────────────────────────────────────────────────────┤
│                           Payload                            │
│  {"sub": "1234567890", "name": "John Doe", "iat": 1516239022}│
├─────────────────────────────────────────────────────────────┤
│                          Signature                           │
│  HMACSHA256(base64UrlEncode(header) + "." +                 │
│             base64UrlEncode(payload), secret)                │
└─────────────────────────────────────────────────────────────┘
```

## 署名アルゴリズム

| アルゴリズム | タイプ | 推奨度 | 用途 |
|-------------|--------|--------|------|
| HS256 | 対称鍵 | △ | 内部サービス |
| HS384 | 対称鍵 | △ | 内部サービス |
| HS512 | 対称鍵 | △ | 内部サービス |
| RS256 | 非対称鍵 | ◎ | 公開検証が必要 |
| RS384 | 非対称鍵 | ◎ | 公開検証が必要 |
| RS512 | 非対称鍵 | ◎ | 公開検証が必要 |
| ES256 | 非対称鍵 | ◎ | コンパクトな署名 |
| ES384 | 非対称鍵 | ◎ | コンパクトな署名 |
| ES512 | 非対称鍵 | ◎ | コンパクトな署名 |

### アルゴリズム選択ガイド

```typescript
// 内部マイクロサービス間（対称鍵で十分）
const algorithm = 'HS256';

// 外部公開、検証者が多い（非対称鍵推奨）
const algorithm = 'RS256'; // RSA
const algorithm = 'ES256'; // 楕円曲線（コンパクト）
```

## 標準クレーム

| クレーム | 説明 | 例 |
|---------|------|-----|
| iss | 発行者 | `"https://auth.example.com"` |
| sub | 主題（ユーザーID） | `"user-123"` |
| aud | 対象者 | `"api.example.com"` |
| exp | 有効期限（Unix時間） | `1704067200` |
| nbf | 有効開始時刻 | `1704067100` |
| iat | 発行時刻 | `1704067100` |
| jti | JWT ID（一意識別子） | `"jwt-abc-123"` |

## JWT実装

### 生成

```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface JWTPayload {
  sub: string;
  email?: string;
  roles?: string[];
  [key: string]: unknown;
}

interface JWTConfig {
  secret: string;
  issuer: string;
  audience: string;
  expiresIn: string | number;
}

class JWTService {
  constructor(private readonly config: JWTConfig) {}

  /**
   * JWTを生成
   */
  sign(payload: JWTPayload): string {
    return jwt.sign(payload, this.config.secret, {
      algorithm: 'HS256',
      issuer: this.config.issuer,
      audience: this.config.audience,
      expiresIn: this.config.expiresIn,
      jwtid: crypto.randomUUID(),
    });
  }

  /**
   * JWTを検証
   */
  verify(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.config.secret, {
        algorithms: ['HS256'],
        issuer: this.config.issuer,
        audience: this.config.audience,
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenError('Invalid token');
      }
      throw error;
    }
  }

  /**
   * JWTをデコード（検証なし）
   */
  decode(token: string): JWTPayload | null {
    return jwt.decode(token) as JWTPayload | null;
  }
}
```

### RSA署名（非対称鍵）

```typescript
import fs from 'fs';

class RSAJWTService {
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(privateKeyPath: string, publicKeyPath: string) {
    this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  }

  sign(payload: JWTPayload): string {
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
    });
  }

  verify(token: string): JWTPayload {
    return jwt.verify(token, this.publicKey, {
      algorithms: ['RS256'],
    }) as JWTPayload;
  }
}

// 鍵生成（OpenSSL）
// openssl genrsa -out private.pem 2048
// openssl rsa -in private.pem -pubout -out public.pem
```

## トークン種別

### アクセストークン vs リフレッシュトークン

```typescript
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class TokenService {
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';

  generateTokenPair(userId: string, roles: string[]): TokenPair {
    // アクセストークン（短命、頻繁に使用）
    const accessToken = jwt.sign(
      { sub: userId, roles, type: 'access' },
      this.secret,
      { expiresIn: this.accessTokenExpiry }
    );

    // リフレッシュトークン（長命、トークン更新専用）
    const refreshToken = jwt.sign(
      { sub: userId, type: 'refresh', jti: crypto.randomUUID() },
      this.refreshSecret,
      { expiresIn: this.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
  }

  refreshAccessToken(refreshToken: string): string {
    const payload = jwt.verify(refreshToken, this.refreshSecret) as JWTPayload;

    if (payload.type !== 'refresh') {
      throw new InvalidTokenError('Not a refresh token');
    }

    // TODO: リフレッシュトークンの無効化チェック（ブラックリスト）

    return jwt.sign(
      { sub: payload.sub, type: 'access' },
      this.secret,
      { expiresIn: this.accessTokenExpiry }
    );
  }
}
```

## トークンローテーション

### リフレッシュトークンローテーション

```typescript
class TokenRotationService {
  private readonly usedRefreshTokens: Set<string> = new Set();

  async rotateTokens(refreshToken: string): Promise<TokenPair> {
    const payload = jwt.verify(refreshToken, this.refreshSecret) as JWTPayload;
    const jti = payload.jti as string;

    // 再利用検出
    if (this.usedRefreshTokens.has(jti)) {
      // トークン盗難の可能性 → 全トークン無効化
      await this.revokeAllUserTokens(payload.sub);
      throw new SecurityError('Refresh token reuse detected');
    }

    // 使用済みとしてマーク
    this.usedRefreshTokens.add(jti);

    // 新しいトークンペア生成
    return this.generateTokenPair(payload.sub, payload.roles || []);
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    // ユーザーの全トークンを無効化
    // 例：DBのtokenVersionをインクリメント
  }
}
```

## クレーム設計

### カスタムクレーム

```typescript
interface CustomClaims {
  // 標準クレーム
  sub: string;    // ユーザーID
  iss: string;    // 発行者
  aud: string;    // 対象者
  exp: number;    // 有効期限
  iat: number;    // 発行時刻

  // カスタムクレーム（名前空間推奨）
  'https://example.com/roles': string[];
  'https://example.com/permissions': string[];
  'https://example.com/org_id': string;
  'https://example.com/tenant_id': string;
}

// 短縮名を使う場合（内部システム向け）
interface InternalClaims {
  sub: string;
  roles: string[];
  permissions: string[];
  orgId: string;
  tenantId: string;
}
```

### 最小限のクレーム

```typescript
// ❌ NG: 不必要な情報を含む
const payload = {
  sub: '123',
  email: 'user@example.com',
  password: 'hashed...', // 絶対にNG
  creditCard: '****1234', // 不要
  fullProfile: { ... }, // トークン肥大化
};

// ✅ OK: 必要最小限
const payload = {
  sub: '123',
  roles: ['user'],
};
// 詳細情報は必要時にAPIで取得
```

## セキュリティベストプラクティス

### アルゴリズム検証

```typescript
// ❌ NG: alg=noneを許可
jwt.verify(token, secret); // デフォルトで全アルゴリズム許可

// ✅ OK: 使用アルゴリズムを明示
jwt.verify(token, secret, { algorithms: ['HS256'] });
```

### シークレット管理

```typescript
// ❌ NG: 弱いシークレット
const secret = 'my-secret';

// ✅ OK: 十分な長さのランダムシークレット
const secret = crypto.randomBytes(64).toString('hex');

// ✅ OK: 環境変数から取得
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}
```

### トークン無効化

```typescript
class TokenBlacklist {
  private readonly blacklist: Map<string, number> = new Map();

  revoke(jti: string, exp: number): void {
    this.blacklist.set(jti, exp);
  }

  isRevoked(jti: string): boolean {
    return this.blacklist.has(jti);
  }

  // 期限切れエントリのクリーンアップ
  cleanup(): void {
    const now = Math.floor(Date.now() / 1000);
    for (const [jti, exp] of this.blacklist) {
      if (exp < now) {
        this.blacklist.delete(jti);
      }
    }
  }
}
```

## Expressミドルウェア

```typescript
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

function jwtMiddleware(jwtService: JWTService) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'MISSING_TOKEN', message: 'No token provided' },
      });
    }

    const token = authHeader.substring(7);

    try {
      const payload = jwtService.verify(token);
      req.user = payload;
      next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return res.status(401).json({
          error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
        });
      }
      return res.status(401).json({
        error: { code: 'INVALID_TOKEN', message: 'Invalid token' },
      });
    }
  };
}
```

## チェックリスト

### 設計時
- [ ] 適切なアルゴリズムを選択したか？
- [ ] トークン有効期限は適切か？
- [ ] 必要最小限のクレームか？

### 実装時
- [ ] アルゴリズムを明示的に指定しているか？
- [ ] シークレットは十分な強度か？
- [ ] トークン無効化の仕組みがあるか？

### 運用時
- [ ] シークレットのローテーションがあるか？
- [ ] トークン検証エラーをモニタリングしているか？
- [ ] ブラックリストのクリーンアップがあるか？

## 参考

- **RFC 7519**: JSON Web Token (JWT)
- **RFC 7518**: JSON Web Algorithms (JWA)
- **RFC 7517**: JSON Web Key (JWK)
