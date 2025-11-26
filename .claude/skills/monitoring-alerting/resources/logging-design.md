# ログ設計

## 概要

効果的なログ設計は、問題の調査とシステムの可観測性向上に不可欠です。
このドキュメントでは、構造化ログの設計パターンを説明します。

## 構造化ログ

### なぜ構造化ログか

```
非構造化ログ:
2024-01-15 10:30:45 - User 123 logged in from 192.168.1.1

構造化ログ (JSON):
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "User logged in",
  "userId": 123,
  "ip": "192.168.1.1",
  "correlationId": "abc-123-def"
}
```

**メリット**:
- 検索・フィルタリングが容易
- 自動解析が可能
- 一貫したフォーマット
- コンテキスト情報の付与

## ログレベル設計

### 標準レベル

| レベル | 用途 | 例 |
|-------|------|-----|
| ERROR | 即座の対応が必要なエラー | DB接続失敗、外部API障害 |
| WARN | 注意が必要だが動作は継続 | レート制限接近、非推奨API使用 |
| INFO | 重要な業務イベント | ユーザーログイン、注文完了 |
| DEBUG | デバッグ用詳細情報 | 関数呼び出し、変数値 |

### 環境別設定

```typescript
const LOG_LEVELS = {
  production: 'info',   // ERROR, WARN, INFO
  staging: 'info',      // ERROR, WARN, INFO
  development: 'debug', // ERROR, WARN, INFO, DEBUG
} as const;
```

### レベル選択ガイド

```
問題か？
├─ Yes
│   └─ システム停止/データ損失の可能性？
│       ├─ Yes → ERROR
│       └─ No → WARN
└─ No
    └─ ビジネスイベント？
        ├─ Yes → INFO
        └─ No → DEBUG
```

## 必須フィールド

### 基本フィールド

```typescript
interface LogEntry {
  // 必須
  timestamp: string;        // ISO 8601形式
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;          // 人間が読める説明

  // 推奨
  correlationId?: string;   // リクエスト追跡用
  service?: string;         // サービス名
  environment?: string;     // 環境名

  // コンテキスト
  userId?: string;          // ユーザー識別子
  requestId?: string;       // リクエスト識別子
  duration?: number;        // 処理時間（ms）

  // エラー固有
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}
```

### 実装例

```typescript
interface Logger {
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

function createLogger(baseContext: Record<string, unknown> = {}): Logger {
  const log = (level: string, message: string, context?: Record<string, unknown>) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...baseContext,
      ...context,
    };

    console.log(JSON.stringify(entry));
  };

  return {
    error: (msg, ctx) => log('error', msg, ctx),
    warn: (msg, ctx) => log('warn', msg, ctx),
    info: (msg, ctx) => log('info', msg, ctx),
    debug: (msg, ctx) => log('debug', msg, ctx),
  };
}
```

## 相関ID（Correlation ID）

### 概念

```
リクエスト開始
    ↓
[API Gateway] correlationId: abc-123
    ↓
[Service A] correlationId: abc-123
    ↓
[Service B] correlationId: abc-123
    ↓
[Database] correlationId: abc-123
```

### 実装

```typescript
import { randomUUID } from 'crypto';

// Express middleware
export function correlationIdMiddleware(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || randomUUID();

  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  next();
}

// ロガーに組み込み
export function createRequestLogger(req) {
  return createLogger({
    correlationId: req.correlationId,
    path: req.path,
    method: req.method,
  });
}
```

### Next.js での実装

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  const response = NextResponse.next();
  response.headers.set('x-correlation-id', correlationId);

  return response;
}
```

## ログパターン

### リクエストログ

```typescript
// リクエスト開始
logger.info('Request started', {
  method: req.method,
  path: req.path,
  userAgent: req.headers['user-agent'],
});

// リクエスト完了
logger.info('Request completed', {
  method: req.method,
  path: req.path,
  status: res.statusCode,
  duration: Date.now() - startTime,
});
```

### エラーログ

```typescript
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    operation: 'someOperation',
    input: sanitizeInput(input),  // 機密情報を除去
  });
}
```

### 業務イベントログ

```typescript
// ユーザー認証
logger.info('User authenticated', {
  userId: user.id,
  method: 'password',
  ip: req.ip,
});

// 注文完了
logger.info('Order completed', {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  items: order.items.length,
});
```

## 機密情報の取り扱い

### 絶対にログに含めない

- パスワード
- APIキー/トークン
- クレジットカード番号
- 個人識別情報（フルネーム、住所等）

### サニタイズ例

```typescript
function sanitizeForLogging(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
  const result = { ...obj };

  for (const key of Object.keys(result)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      result[key] = '[REDACTED]';
    }
  }

  return result;
}

// 使用例
logger.info('Request received', sanitizeForLogging(req.body));
```

## パフォーマンス考慮

### バッファリング

```typescript
class BufferedLogger {
  private buffer: string[] = [];
  private flushInterval = 5000; // 5秒

  constructor() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  log(entry: object) {
    this.buffer.push(JSON.stringify(entry));

    if (this.buffer.length >= 100) {
      this.flush();
    }
  }

  private flush() {
    if (this.buffer.length === 0) return;

    // バッチで送信
    console.log(this.buffer.join('\n'));
    this.buffer = [];
  }
}
```

### 条件付きログ

```typescript
// 開発環境のみ詳細ログ
if (process.env.NODE_ENV === 'development') {
  logger.debug('Detailed debug info', { largeObject });
}

// サンプリング
if (Math.random() < 0.01) { // 1%のリクエストのみ
  logger.debug('Sampled request details', { details });
}
```

## Railway/Vercel でのログ

### Railway

```bash
# リアルタイムログ
railway logs

# 過去のログ
railway logs --limit 500

# フィルタリング
railway logs | grep '"level":"error"'
```

### Vercel

```
Vercel Dashboard → Project → Logs
- Function Logs
- Edge Function Logs
- Build Logs
```

### 構造化ログの検索

```bash
# jqを使用した検索
railway logs | jq 'select(.level == "error")'

# 特定のcorrelationId
railway logs | jq 'select(.correlationId == "abc-123")'

# 時間範囲
railway logs | jq 'select(.timestamp > "2024-01-15T10:00:00")'
```

## ベストプラクティス

### すべきこと

1. **一貫したフォーマット**
   - すべてのサービスで同じ構造
   - 必須フィールドの標準化

2. **適切なコンテキスト**
   - 相関ID
   - ユーザー識別子
   - 処理時間

3. **環境別設定**
   - 本番は INFO 以上
   - 開発は DEBUG 含む

### 避けるべきこと

1. **過度なログ**
   - ❌ すべてのメソッド呼び出しをログ
   - ❌ 大きなオブジェクトをそのままログ

2. **機密情報**
   - ❌ パスワード、トークンをログ
   - ❌ 個人情報をそのままログ

3. **非構造化データ**
   - ❌ 文字列連結でログ作成
   - ❌ 一貫性のないフォーマット

## トラブルシューティング

### ログが見つからない

**確認事項**:
1. ログレベルの設定
2. バッファリングのフラッシュ
3. 出力先の設定

### ログが多すぎる

**対策**:
1. ログレベルの調整
2. サンプリングの導入
3. 不要なログの削除

### ログが役に立たない

**改善策**:
1. 相関IDの追加
2. コンテキスト情報の充実
3. エラー情報の詳細化
