# Rate Limiting スキル

## 概要

外部APIのレート制限を適切に処理し、クライアント側でも
レート制限を実装するためのパターンとベストプラクティスを提供します。
サーバー側・クライアント側両方の観点をカバーします。

## 対象エージェント

- @gateway-dev
- @backend-architect
- @performance-engineer

## 含まれるリソース

### 1. レート制限アルゴリズム (resources/algorithms.md)
- Token Bucket
- Leaky Bucket
- Fixed Window
- Sliding Window Log
- Sliding Window Counter

### 2. クライアント側対応 (resources/client-handling.md)
- 429レスポンス処理
- Retry-Afterヘッダー
- バックオフ戦略
- キュー管理

### 3. サーバー側実装 (resources/server-implementation.md)
- ミドルウェア設計
- 分散レート制限
- Redisベースの実装
- グレースフルデグラデーション

### 4. クォータ管理 (resources/quota-management.md)
- 使用量追跡
- クォータアラート
- 階層型制限
- バースト許容

## ワークフロー

```
1. 要件分析
   ├── レート制限の対象特定
   ├── 制限値の決定
   └── 違反時の動作定義

2. 設計
   ├── アルゴリズム選択
   ├── ストレージ選択
   └── ヘッダー設計

3. 実装
   ├── レート制限ロジック
   ├── レスポンスヘッダー
   └── エラーハンドリング

4. 検証
   ├── 負荷テスト
   ├── エッジケース確認
   └── 分散環境テスト
```

## アルゴリズム選択ガイド

| アルゴリズム | 特徴 | 適用場面 |
|------------|------|---------|
| Token Bucket | バースト許容、柔軟 | 一般的なAPI |
| Leaky Bucket | 均一なレート、シンプル | ストリーム処理 |
| Fixed Window | 実装が簡単 | 低トラフィック |
| Sliding Window Log | 正確、メモリ大 | 厳密な制限 |
| Sliding Window Counter | バランス良い | スケーラブル |

## ベストプラクティス

### レスポンスヘッダー

```typescript
// 標準的なレート制限ヘッダー
interface RateLimitHeaders {
  'X-RateLimit-Limit': string;      // 最大リクエスト数
  'X-RateLimit-Remaining': string;  // 残りリクエスト数
  'X-RateLimit-Reset': string;      // リセット時刻（Unix時間）
  'Retry-After': string;            // リトライまでの秒数（429時）
}

// レスポンス例
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705312800
Retry-After: 60
```

### クライアント側処理

```typescript
async function fetchWithRateLimit(url: string): Promise<Response> {
  const response = await fetch(url);

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000;

    console.log(`Rate limited. Waiting ${waitTime}ms...`);
    await sleep(waitTime);

    return fetchWithRateLimit(url); // リトライ
  }

  return response;
}
```

### サーバー側実装

```typescript
// Expressミドルウェア例
function rateLimit(options: {
  windowMs: number;
  max: number;
}) {
  const store = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip;
    const now = Date.now();
    const record = store.get(key);

    if (!record || record.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + options.windowMs });
      setHeaders(res, options.max, options.max - 1, now + options.windowMs);
      return next();
    }

    if (record.count >= options.max) {
      setHeaders(res, options.max, 0, record.resetAt);
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: { code: 'RATE_LIMIT_EXCEEDED', retryAfter },
      });
    }

    record.count++;
    setHeaders(res, options.max, options.max - record.count, record.resetAt);
    next();
  };
}
```

## 品質チェックリスト

### 設計時
- [ ] 適切なアルゴリズムを選択したか？
- [ ] レート制限値は妥当か？
- [ ] バースト許容が必要か検討したか？

### 実装時
- [ ] 標準的なヘッダーを返しているか？
- [ ] 分散環境で正しく動作するか？
- [ ] エラーレスポンスが適切か？

### 運用時
- [ ] レート制限のヒット率をモニタリングしているか？
- [ ] 異常なパターンを検出できるか？
- [ ] 制限値の調整が可能か？

## アンチパターン

### ❌ クライアント側でのレート制限無視

```typescript
// NG: 429を無視してリトライ
while (true) {
  const response = await fetch(url);
  if (response.ok) break;
  // Retry-Afterを無視
}
```

### ❌ グローバルレート制限のみ

```typescript
// NG: 全ユーザー共有の制限
const globalLimit = 1000; // 全ユーザーで1000リクエスト

// ✅: ユーザー別制限
const userLimit = 100; // ユーザーあたり100リクエスト
```

### ❌ 不適切なキー設計

```typescript
// NG: IPアドレスのみ（NAT環境で問題）
const key = req.ip;

// ✅: 認証済みユーザーはユーザーID
const key = req.user?.id || req.ip;
```

## 参考資料

- **RFC 6585**: Additional HTTP Status Codes (429)
- **IETF Draft**: RateLimit Header Fields for HTTP
- **『Building Microservices』** Sam Newman著

## 関連スキル

- retry-strategies: リトライ・サーキットブレーカー
- http-best-practices: HTTPベストプラクティス
- api-client-patterns: APIクライアント実装パターン
