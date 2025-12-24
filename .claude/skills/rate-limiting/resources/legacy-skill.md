---
name: .claude/skills/rate-limiting/SKILL.md
description: |
  Rate Limitingとクォータ管理のベストプラクティスを提供します。
  外部APIのレート制限を適切に処理し、サーバー側・クライアント側両方の
  観点からRate Limitingを実装するためのパターンを提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/rate-limiting/resources/algorithms.md`: Rate Limiting Algorithms（レート制限アルゴリズム）
  - `.claude/skills/rate-limiting/resources/client-handling.md`: Client-Side Rate Limit Handling（クライアント側のレート制限対応）
  - `.claude/skills/rate-limiting/resources/quota-management.md`: Quota Management（クォータ管理）
  - `.claude/skills/rate-limiting/resources/server-implementation.md`: Server-Side Rate Limiting（サーバー側レート制限）
  - `.claude/skills/rate-limiting/scripts/simulate-rate-limit.mjs`: Rate Limit Simulation Tool
  - `.claude/skills/rate-limiting/templates/rate-limiter-template.ts`: Rate Limiter Template

  専門分野:
  - レート制限アルゴリズム: Token Bucket、Leaky Bucket、Sliding Window
  - クライアント側対応: 429レスポンス処理、Retry-After、バックオフ戦略
  - サーバー側実装: ミドルウェア設計、分散レート制限、Redis実装
  - クォータ管理: 使用量追跡、クォータアラート、階層型制限

  使用タイミング:
  - APIのRate Limiting設計時
  - DoS/DDoS攻撃対策の実装時
  - 外部APIクライアントの実装時
  - クォータ管理システムの設計時

  Use proactively when designing API rate limiting, implementing DoS protection,
  or building external API clients that need to handle rate limits.
version: 1.1.0
related_skills:
  - .claude/skills/retry-strategies/SKILL.md
  - .claude/skills/http-best-practices/SKILL.md
  - .claude/skills/api-client-patterns/SKILL.md
---

# Rate Limiting

## 概要

このスキルは、Rate Limiting とクォータ管理のベストプラクティスを提供します。
外部 API のレート制限を適切に処理し、サーバー側・クライアント側両方の観点から
Rate Limiting を実装するためのパターンを提供します。

**主要な価値**:

- DoS/DDoS 攻撃からの保護
- サービス品質の維持
- リソースの公平な配分
- コスト管理と予測可能性

**対象ユーザー**:

- .claude/agents/sec-auditor.md: セキュリティ監査時の Rate Limiting 評価
- .claude/agents/gateway-dev.md: API ゲートウェイの Rate Limiting 設計
- @backend-architect: バックエンドサービスの Rate Limiting 実装

## リソース構造

```
rate-limiting/
├── SKILL.md                              # 本ファイル（概要とワークフロー）
├── resources/
│   ├── algorithms.md                     # レート制限アルゴリズム詳細
│   ├── client-handling.md                # クライアント側対応パターン
│   ├── server-implementation.md          # サーバー側実装パターン
│   └── quota-management.md               # クォータ管理詳細
├── scripts/
│   └── simulate-rate-limit.mjs           # レート制限シミュレーションスクリプト
└── templates/
    └── rate-limiter-template.ts          # Rate Limiterテンプレート
```

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# レート制限アルゴリズム詳細
cat .claude/skills/rate-limiting/resources/algorithms.md

# クライアント側対応パターン
cat .claude/skills/rate-limiting/resources/client-handling.md

# サーバー側実装パターン
cat .claude/skills/rate-limiting/resources/server-implementation.md

# クォータ管理詳細
cat .claude/skills/rate-limiting/resources/quota-management.md
```

### スクリプト実行

```bash
# レート制限シミュレーション
node .claude/skills/rate-limiting/scripts/simulate-rate-limit.mjs <config-file>
```

### テンプレート参照

```bash
# Rate Limiterテンプレート
cat .claude/skills/rate-limiting/templates/rate-limiter-template.ts
```

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

| アルゴリズム           | 特徴                   | 適用場面       |
| ---------------------- | ---------------------- | -------------- |
| Token Bucket           | バースト許容、柔軟     | 一般的な API   |
| Leaky Bucket           | 均一なレート、シンプル | ストリーム処理 |
| Fixed Window           | 実装が簡単             | 低トラフィック |
| Sliding Window Log     | 正確、メモリ大         | 厳密な制限     |
| Sliding Window Counter | バランス良い           | スケーラブル   |

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
    const retryAfter = response.headers.get("Retry-After");
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
function rateLimit(options: { windowMs: number; max: number }) {
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
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        error: { code: "RATE_LIMIT_EXCEEDED", retryAfter },
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
- **『Building Microservices』** Sam Newman 著

## 関連スキル

- `.claude/skills/retry-strategies/SKILL.md`: リトライ・サーキットブレーカー
- `.claude/skills/http-best-practices/SKILL.md`: HTTP ベストプラクティス
- `.claude/skills/api-client-patterns/SKILL.md`: API クライアント実装パターン
