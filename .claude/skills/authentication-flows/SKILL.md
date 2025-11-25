# Authentication Flows スキル

## 概要

外部API認証の実装パターンを提供するスキル。
OAuth 2.0、JWT、API Key、相互TLSなど、主要な認証方式の
実装手法とセキュリティベストプラクティスを解説します。

## 対象エージェント

- @gateway-dev
- @backend-architect
- @security-engineer
- @auth-specialist

## 含まれるリソース

### 1. OAuth 2.0 (resources/oauth2.md)
- Authorization Code Flow
- Client Credentials Flow
- PKCE拡張
- トークンリフレッシュ戦略

### 2. JWT (resources/jwt.md)
- JWT構造と検証
- 署名アルゴリズム選択
- クレーム設計
- トークンローテーション

### 3. API Key (resources/api-key.md)
- API Key管理
- 安全な保存方法
- ローテーション戦略
- 使用量追跡

### 4. 相互TLS (resources/mtls.md)
- 証明書ベース認証
- 証明書管理
- 信頼チェーン構築
- 証明書ローテーション

## ワークフロー

```
1. 認証要件分析
   ├── サービス間 vs ユーザー認証の判断
   ├── セキュリティ要件の特定
   └── 既存認証基盤の確認

2. 認証方式選択
   ├── OAuth 2.0: ユーザー委譲、サードパーティ連携
   ├── JWT: ステートレス認証、マイクロサービス
   ├── API Key: シンプルなサービス間通信
   └── mTLS: 高セキュリティ要件

3. 実装
   ├── 認証フローの実装
   ├── トークン管理の実装
   └── エラーハンドリング

4. セキュリティ検証
   ├── 脆弱性テスト
   ├── トークンリーク検出
   └── 有効期限検証
```

## 認証方式選択ガイド

| シナリオ | 推奨方式 | 理由 |
|---------|---------|------|
| ユーザー代理でAPI呼び出し | OAuth 2.0 Auth Code | ユーザー同意フロー対応 |
| サービス間通信 | OAuth 2.0 Client Credentials | サービスアカウント認証 |
| SPAからのAPI呼び出し | OAuth 2.0 + PKCE | トークン漏洩対策 |
| 社内マイクロサービス | JWT | ステートレス、検証容易 |
| シンプルなAPI連携 | API Key | 実装簡易、低オーバーヘッド |
| 金融・医療等高セキュリティ | mTLS | 双方向認証、強力な暗号化 |

## ベストプラクティス

### トークン管理

```typescript
// トークンキャッシュとリフレッシュ
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;

  async getToken(): Promise<string> {
    // 有効期限の5分前にリフレッシュ
    if (this.accessToken && Date.now() < this.expiresAt - 5 * 60 * 1000) {
      return this.accessToken;
    }

    if (this.refreshToken) {
      return this.refreshAccessToken();
    }

    return this.authenticate();
  }

  private async refreshAccessToken(): Promise<string> {
    // リフレッシュトークンで新しいアクセストークン取得
  }

  private async authenticate(): Promise<string> {
    // 初回認証
  }
}
```

### シークレット管理

```typescript
// 環境変数からシークレット取得
function getSecret(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required secret: ${name}`);
  }
  return value;
}

// AWS Secrets Manager例
async function getSecretFromSecretsManager(secretId: string): Promise<string> {
  const client = new SecretsManagerClient({});
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretId })
  );
  return response.SecretString!;
}
```

### エラーハンドリング

```typescript
// 認証エラーの分類
function handleAuthError(error: unknown): never {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'invalid_token':
        // トークン無効 → 再認証
        throw new UnauthorizedError('Token is invalid or expired');

      case 'insufficient_scope':
        // スコープ不足 → 403
        throw new ForbiddenError('Insufficient permissions');

      case 'invalid_client':
        // クライアント設定エラー → 設定確認
        throw new ConfigurationError('Invalid client credentials');

      default:
        throw new AuthenticationError(error.message);
    }
  }
  throw error;
}
```

## セキュリティチェックリスト

### 設計時
- [ ] 適切な認証方式を選択したか？
- [ ] トークン有効期限を設定したか？
- [ ] シークレットの保存場所を決定したか？

### 実装時
- [ ] トークンをログに出力していないか？
- [ ] HTTPSを使用しているか？
- [ ] エラーメッセージに機密情報を含めていないか？

### 運用時
- [ ] シークレットローテーションが設定されているか？
- [ ] 認証失敗のモニタリングがあるか？
- [ ] トークン漏洩検出の仕組みがあるか？

## アンチパターン

### ❌ トークンのログ出力

```typescript
// NG: トークンをログに出力
console.log('Token:', accessToken);
logger.info({ headers: request.headers }); // Authorizationヘッダー含む

// ✅ マスキング
console.log('Token:', maskToken(accessToken));
logger.info({ headers: maskHeaders(request.headers) });
```

### ❌ ハードコードされたシークレット

```typescript
// NG: コードにシークレット埋め込み
const apiKey = 'sk-12345-secret-key';

// ✅ 環境変数使用
const apiKey = process.env.API_KEY;
```

### ❌ 無期限トークン

```typescript
// NG: 有効期限なしのJWT
const token = jwt.sign({ userId: 123 }, secret);

// ✅ 適切な有効期限
const token = jwt.sign({ userId: 123 }, secret, { expiresIn: '1h' });
```

## 参考資料

- **RFC 6749**: The OAuth 2.0 Authorization Framework
- **RFC 7519**: JSON Web Token (JWT)
- **RFC 7636**: Proof Key for Code Exchange (PKCE)
- **OWASP**: Authentication Cheat Sheet

## 関連スキル

- api-client-patterns: APIクライアント実装パターン
- http-best-practices: HTTPベストプラクティス
- rate-limiting: レート制限実装
