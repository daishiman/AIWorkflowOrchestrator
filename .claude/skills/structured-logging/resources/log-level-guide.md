# ログレベル使用ガイド

## ログレベル階層

### DEBUG

**目的**: 開発時の詳細な内部動作の追跡

**使用条件**:
- 変数値の出力
- 関数の呼び出しトレース
- 内部状態の確認
- デバッグ用の一時的な情報

**出力先**:
- 開発環境のみ
- 本番環境では無効化（パフォーマンスとセキュリティ）

**例**:
```typescript
logger.debug("User query parameters", { userId, filters, pagination });
logger.debug("Entering authentication middleware", { path: req.path });
logger.debug("Database query executed", { query, params, duration: 45 });
```

**注意事項**:
- 本番環境で有効化すると大量のログが生成される
- PIIを含む可能性があるため、本番では無効化推奨
- パフォーマンスへの影響が大きい

---

### INFO

**目的**: 正常動作における重要なビジネスイベントの記録

**使用条件**:
- アプリケーション起動/終了
- リクエスト受信/レスポンス送信
- 重要なビジネスイベント（ユーザー登録、注文完了等）
- 設定変更
- バックグラウンドジョブの開始/完了

**出力先**:
- 全環境（dev/staging/production）

**例**:
```typescript
logger.info("Application started", { port: 3000, environment: "production" });
logger.info("User registered", { user_id, email: maskEmail(email) });
logger.info("Order completed", { order_id, total_amount, user_id });
logger.info("Background job started", { job_type: "email-notification", batch_size: 100 });
```

**注意事項**:
- 本番環境のデフォルトレベル
- 過剰に使用するとログ量が増大
- ビジネス的に重要なイベントに限定

---

### WARN

**目的**: 予期しないが対応可能な状況の警告

**使用条件**:
- リトライ処理が発生
- 非推奨機能の使用
- 設定ミスや不適切な使用（ただし動作は継続）
- リソース使用量が閾値に近い
- 将来的に問題になる可能性がある状況

**出力先**:
- 全環境
- アラート候補（頻度に応じて）

**例**:
```typescript
logger.warn("Retrying failed API call", { attempt: 2, max_attempts: 3, api: "payment-gateway" });
logger.warn("Deprecated function used", { function: "oldAuthMethod", caller: "auth.ts:45" });
logger.warn("Memory usage high", { used_mb: 1800, total_mb: 2048, percentage: 88 });
logger.warn("Rate limit approaching", { current: 950, limit: 1000, user_id });
```

**注意事項**:
- 即座の対応は不要だが、監視が必要
- 頻発する場合はアラート設定を検討
- WARNの頻度が高い場合は根本原因を調査

---

### ERROR

**目的**: 機能障害の記録（部分的な影響）

**使用条件**:
- リクエスト処理の失敗
- 外部API呼び出しの失敗
- データ検証エラー
- ファイルI/Oエラー
- リカバリ可能なエラー

**出力先**:
- 全環境
- 必ずアラート設定
- エラートラッキングシステム（Sentry等）

**例**:
```typescript
logger.error(
  "User creation failed",
  error,
  {
    request_id,
    user_data: { email: maskEmail(email), age },
    validation_errors: ["Invalid email format"]
  }
);

logger.error(
  "External API call failed",
  error,
  {
    api: "payment-gateway",
    endpoint: "/charge",
    status_code: 503,
    retry_after: 60
  }
);
```

**必須情報**:
- スタックトレース
- エラー分類（Validation/Business/External等）
- リクエストコンテキスト
- 影響範囲（どのユーザー、どの機能）

---

### FATAL

**目的**: システム停止レベルの重大エラー

**使用条件**:
- アプリケーション起動失敗
- データベース接続不可
- 必須設定の欠如
- リカバリ不可能な状態

**出力先**:
- 全環境
- 即座にエスカレーション（PagerDuty等）
- システム監視ダッシュボード

**例**:
```typescript
logger.fatal(
  "Database connection failed",
  error,
  {
    host: dbConfig.host,
    database: dbConfig.database,
    max_retries: 5,
    last_error: error.message
  }
);

logger.fatal(
  "Required environment variable missing",
  new Error("MISSING_ENV"),
  {
    variable: "DATABASE_URL",
    environment: process.env.NODE_ENV
  }
);
```

**アクション**:
- システム停止またはフェイルセーフモード移行
- 即座にオンコール担当者に通知
- 自動復旧試行（可能な場合）

## 環境別ログレベル制御

### 開発環境

**推奨設定**: DEBUG以上
```
LOG_LEVEL=DEBUG
```

**理由**:
- 詳細な動作確認が必要
- パフォーマンス影響は許容可能
- PIIも開発データなので問題なし

### ステージング環境

**推奨設定**: INFO以上
```
LOG_LEVEL=INFO
```

**理由**:
- 本番に近い状態でのテスト
- DEBUGは不要（問題時のみ一時有効化）
- ログ量とコストのバランス

### 本番環境

**推奨設定**: INFO以上（負荷に応じてWARN以上）
```
LOG_LEVEL=INFO  # 通常時
LOG_LEVEL=WARN  # 高負荷時
```

**理由**:
- ログ量とコストの最小化
- 重要イベントとエラーに集中
- 問題調査時のみDEBUG一時有効化

### 動的ログレベル変更

**ランタイム変更**:
```typescript
// 環境変数で制御
const logLevel = process.env.LOG_LEVEL || 'INFO';
logger.setLevel(logLevel);

// 管理APIで一時的に変更（本番デバッグ用）
app.post('/admin/log-level', (req, res) => {
  const { level, duration } = req.body;
  logger.setLevel(level);

  // duration秒後に元に戻す
  setTimeout(() => {
    logger.setLevel('INFO');
  }, duration * 1000);
});
```

## ビジネスイベントログ設計

### ユーザーアクション追跡

```typescript
logger.info("User action", {
  action: "login",
  user_id,
  session_id,
  ip_address: maskIP(req.ip),
  user_agent: req.headers['user-agent']
});

logger.info("User action", {
  action: "purchase",
  user_id,
  order_id,
  total_amount: 1234.56,
  currency: "USD",
  items_count: 3
});
```

### システムイベント追跡

```typescript
logger.info("System event", {
  event: "cache-invalidation",
  cache_key: "user-list",
  reason: "data-update",
  affected_records: 150
});

logger.info("System event", {
  event: "scheduled-job-completed",
  job_name: "daily-report",
  duration_ms: 3456,
  records_processed: 10000
});
```

## ログフォーマット標準化

### 単一行JSON

**推奨**:
```json
{"timestamp":"2025-11-26T10:30:45.123Z","level":"INFO","message":"User logged in","service":"api-server","request_id":"550e8400-e29b-41d4-a716-446655440000","user_id":"user_123"}
```

**理由**:
- ログ集約ツール（Elasticsearch等）でパースが容易
- 1行1ログで処理が単純
- ストリーム処理に適している

### Pretty Print（開発環境のみ）

**開発環境**:
```json
{
  "timestamp": "2025-11-26T10:30:45.123Z",
  "level": "INFO",
  "message": "User logged in",
  "user_id": "user_123"
}
```

**理由**:
- 人間が読みやすい
- デバッグ時の視認性向上

## まとめ

構造化ログ設計の核心:
1. **機械可読性**: JSON形式で一貫した構造
2. **トレーサビリティ**: 相関IDでリクエスト追跡
3. **コンテキスト充実**: 診断に必要な情報を含める
4. **プライバシー保護**: PIIマスキング
5. **レベル適切性**: 明確な基準でログレベル分類
6. **パフォーマンス考慮**: サンプリングで最適化
