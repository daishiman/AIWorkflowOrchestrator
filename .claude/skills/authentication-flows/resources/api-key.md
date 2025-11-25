# API Key Authentication

## 概要

API Keyは、サービス間通信やシンプルなAPI認証に使用される
最も基本的な認証方式です。実装が容易な反面、適切な管理が必要です。

## API Key vs OAuth/JWT

| 観点 | API Key | OAuth/JWT |
|------|---------|-----------|
| 実装難易度 | 低 | 中〜高 |
| ユーザー委譲 | 不可 | 可能 |
| 有効期限 | 通常長期 | 通常短期 |
| スコープ制御 | 限定的 | 柔軟 |
| 取り消し | 即座 | 要対応 |
| 適用場面 | サービス間、開発者API | ユーザー認証、サードパーティ |

## API Key設計

### 構造設計

```typescript
interface APIKey {
  // 識別子（公開部分）
  keyId: string;        // "ak_prod_12345"

  // シークレット（秘密部分）
  keySecret: string;    // ハッシュ化して保存

  // メタデータ
  name: string;         // "Production API Key"
  description?: string;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;

  // 権限
  scopes: string[];     // ["read:users", "write:orders"]

  // 制限
  rateLimit?: number;   // リクエスト/分
  allowedIPs?: string[];
  allowedOrigins?: string[];

  // 状態
  status: 'active' | 'suspended' | 'revoked';
  revokedAt?: Date;
  revokedReason?: string;
}
```

### キー形式

```typescript
// 推奨形式: プレフィックス + 環境 + ランダム部分
// 例: sk_prod_abc123def456

interface KeyComponents {
  prefix: string;     // "sk" (secret key) or "pk" (public key)
  environment: string; // "prod", "test", "dev"
  random: string;      // 暗号学的に安全なランダム文字列
}

function generateAPIKey(env: string): { keyId: string; keySecret: string } {
  const random = crypto.randomBytes(24).toString('base64url');

  return {
    keyId: `ak_${env}_${random.substring(0, 8)}`,
    keySecret: `sk_${env}_${random}`,
  };
}

// 形式検証
function isValidKeyFormat(key: string): boolean {
  return /^[sp]k_(prod|test|dev)_[a-zA-Z0-9_-]+$/.test(key);
}
```

## 実装

### キー生成と保存

```typescript
import crypto from 'crypto';
import bcrypt from 'bcrypt';

class APIKeyService {
  /**
   * 新しいAPIキーを生成
   */
  async createKey(params: {
    name: string;
    scopes: string[];
    expiresAt?: Date;
    rateLimit?: number;
  }): Promise<{ key: APIKey; plainSecret: string }> {
    // キー生成
    const keyId = `ak_${crypto.randomBytes(8).toString('hex')}`;
    const plainSecret = `sk_${crypto.randomBytes(32).toString('base64url')}`;

    // シークレットをハッシュ化
    const hashedSecret = await bcrypt.hash(plainSecret, 12);

    const key: APIKey = {
      keyId,
      keySecret: hashedSecret,
      name: params.name,
      scopes: params.scopes,
      expiresAt: params.expiresAt,
      rateLimit: params.rateLimit,
      status: 'active',
      createdAt: new Date(),
    };

    // DBに保存（ハッシュ化されたシークレット）
    await this.saveKey(key);

    // 平文シークレットは一度だけ返す
    return { key, plainSecret };
  }

  /**
   * APIキーを検証
   */
  async validateKey(providedKey: string): Promise<APIKey | null> {
    // キーIDを抽出（プレフィックスから推測）
    const keyId = this.extractKeyId(providedKey);
    if (!keyId) return null;

    // DBからキーを取得
    const key = await this.getKeyById(keyId);
    if (!key) return null;

    // ステータスチェック
    if (key.status !== 'active') return null;

    // 有効期限チェック
    if (key.expiresAt && key.expiresAt < new Date()) return null;

    // シークレット検証
    const isValid = await bcrypt.compare(providedKey, key.keySecret);
    if (!isValid) return null;

    // 最終使用時刻を更新
    await this.updateLastUsed(keyId);

    return key;
  }

  /**
   * キーを取り消し
   */
  async revokeKey(keyId: string, reason: string): Promise<void> {
    await this.updateKey(keyId, {
      status: 'revoked',
      revokedAt: new Date(),
      revokedReason: reason,
    });
  }
}
```

### 認証ミドルウェア

```typescript
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  apiKey?: APIKey;
}

function apiKeyAuth(apiKeyService: APIKeyService) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // ヘッダーからキーを取得
    const apiKey = req.headers['x-api-key'] as string ||
                   req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        error: { code: 'MISSING_API_KEY', message: 'API key is required' },
      });
    }

    // キー検証
    const key = await apiKeyService.validateKey(apiKey);

    if (!key) {
      return res.status(401).json({
        error: { code: 'INVALID_API_KEY', message: 'Invalid or expired API key' },
      });
    }

    // IP制限チェック
    if (key.allowedIPs && key.allowedIPs.length > 0) {
      const clientIP = req.ip || req.socket.remoteAddress;
      if (!key.allowedIPs.includes(clientIP!)) {
        return res.status(403).json({
          error: { code: 'IP_NOT_ALLOWED', message: 'IP address not allowed' },
        });
      }
    }

    // リクエストにキー情報を付与
    req.apiKey = key;

    next();
  };
}

// スコープチェックミドルウェア
function requireScope(scope: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey?.scopes.includes(scope)) {
      return res.status(403).json({
        error: { code: 'INSUFFICIENT_SCOPE', message: `Scope '${scope}' required` },
      });
    }
    next();
  };
}
```

## セキュリティベストプラクティス

### 安全な保存

```typescript
// ❌ NG: 平文で保存
const key = { secret: 'sk_prod_abc123' };

// ✅ OK: ハッシュ化して保存
const hashedSecret = await bcrypt.hash(secret, 12);
const key = { secretHash: hashedSecret };

// ❌ NG: 環境変数に複数キーを列挙
API_KEYS="key1,key2,key3"

// ✅ OK: 個別に管理、またはシークレット管理サービス使用
API_KEY_1=sk_...
// または AWS Secrets Manager, HashiCorp Vault など
```

### 伝送時の保護

```typescript
// ❌ NG: URLパラメータにキーを含める（ログに残る）
GET /api/users?api_key=sk_prod_abc123

// ✅ OK: ヘッダーで伝送
GET /api/users
X-API-Key: sk_prod_abc123

// ✅ OK: Authorization ヘッダー
GET /api/users
Authorization: Bearer sk_prod_abc123
```

### キーローテーション

```typescript
class KeyRotationService {
  private readonly gracePeriod = 24 * 60 * 60 * 1000; // 24時間

  /**
   * キーをローテーション
   */
  async rotateKey(oldKeyId: string): Promise<{ newKey: APIKey; plainSecret: string }> {
    const oldKey = await this.apiKeyService.getKeyById(oldKeyId);
    if (!oldKey) throw new Error('Key not found');

    // 新しいキーを生成（同じスコープと設定）
    const { key: newKey, plainSecret } = await this.apiKeyService.createKey({
      name: `${oldKey.name} (rotated)`,
      scopes: oldKey.scopes,
      rateLimit: oldKey.rateLimit,
    });

    // 古いキーに猶予期間を設定
    await this.apiKeyService.updateKey(oldKeyId, {
      expiresAt: new Date(Date.now() + this.gracePeriod),
    });

    // ローテーション通知（オプション）
    await this.notifyKeyRotation(oldKeyId, newKey.keyId);

    return { newKey, plainSecret };
  }

  /**
   * 期限切れキーをクリーンアップ
   */
  async cleanupExpiredKeys(): Promise<number> {
    const expired = await this.apiKeyService.findExpiredKeys();

    for (const key of expired) {
      await this.apiKeyService.revokeKey(key.keyId, 'Expired');
    }

    return expired.length;
  }
}
```

## 監視とログ

### 使用量追跡

```typescript
interface APIKeyUsage {
  keyId: string;
  timestamp: Date;
  endpoint: string;
  method: string;
  responseStatus: number;
  responseTime: number;
  clientIP: string;
  userAgent: string;
}

class UsageTracker {
  async trackUsage(usage: APIKeyUsage): Promise<void> {
    // 使用量を記録
    await this.logUsage(usage);

    // 異常検出
    await this.detectAnomalies(usage);
  }

  private async detectAnomalies(usage: APIKeyUsage): Promise<void> {
    // 急激な使用量増加
    const recentCount = await this.getRecentUsageCount(usage.keyId, 60000);
    if (recentCount > 1000) {
      await this.alertHighUsage(usage.keyId, recentCount);
    }

    // 新しいIPからのアクセス
    const knownIPs = await this.getKnownIPs(usage.keyId);
    if (!knownIPs.includes(usage.clientIP)) {
      await this.alertNewIP(usage.keyId, usage.clientIP);
    }
  }
}
```

### 監査ログ

```typescript
interface AuditLog {
  timestamp: Date;
  action: 'created' | 'rotated' | 'revoked' | 'updated' | 'used';
  keyId: string;
  performedBy: string;
  details: Record<string, unknown>;
  clientIP?: string;
}

function logAuditEvent(event: AuditLog): void {
  // 重要イベントのログ
  console.log({
    type: 'api_key_audit',
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}
```

## チェックリスト

### 設計時
- [ ] キー形式が識別しやすいか？
- [ ] 有効期限ポリシーを決定したか？
- [ ] スコープ設計が完了しているか？

### 実装時
- [ ] シークレットをハッシュ化して保存しているか？
- [ ] HTTPSのみで使用しているか？
- [ ] ヘッダーで伝送しているか（URLパラメータ不可）？

### 運用時
- [ ] ローテーション手順が確立されているか？
- [ ] 使用量モニタリングがあるか？
- [ ] 異常検出アラートがあるか？

## アンチパターン

### ❌ ハードコードされたキー

```typescript
// NG: コードにキーを埋め込み
const apiKey = 'sk_prod_abc123def456';

// OK: 環境変数から取得
const apiKey = process.env.API_KEY;
```

### ❌ ログへのキー出力

```typescript
// NG: キーをログに出力
console.log('Request headers:', req.headers);

// OK: マスキング
console.log('Request headers:', maskSensitiveHeaders(req.headers));
```

### ❌ 無期限のキー

```typescript
// NG: 有効期限なし
const key = { expiresAt: null };

// OK: 適切な有効期限
const key = { expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }; // 90日
```

## 参考

- **OWASP**: API Security Top 10
- **RFC 6750**: Bearer Token Usage
