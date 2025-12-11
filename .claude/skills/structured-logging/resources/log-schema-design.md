# ログスキーマ設計ガイド

## 基本スキーマ構造

### 必須フィールド（全ログ共通）

```typescript
interface BaseLogEntry {
  timestamp: string; // ISO8601形式: "2025-11-26T10:30:45.123Z"
  level: LogLevel; // "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL"
  message: string; // 人間可読メッセージ
  service: string; // サービス名: "api-server", "worker"
  environment: string; // "development" | "staging" | "production"
}
```

### 推奨フィールド（トレーサビリティ）

```typescript
interface TraceableLogEntry extends BaseLogEntry {
  request_id: string; // リクエスト識別子（UUID v4推奨）
  trace_id?: string; // 分散トレースID（OpenTelemetry等）
  span_id?: string; // スパンID（トレーシング使用時）
  user_id?: string; // ユーザー識別子（認証済みの場合）
  session_id?: string; // セッション識別子
  correlation_id?: string; // 相関ID（複数リクエストをグループ化）
}
```

### エラー時の追加フィールド

```typescript
interface ErrorLogEntry extends TraceableLogEntry {
  level: "ERROR" | "FATAL";
  error: {
    type: string; // エラー分類
    message: string; // エラーメッセージ
    code?: string; // エラーコード
    stack?: string; // スタックトレース
  };
  context?: Record<string, unknown>; // エラー時のコンテキスト
}
```

## フィールド設計パターン

### タイムスタンプ設計

**推奨形式**: ISO8601 with timezone

```
"timestamp": "2025-11-26T10:30:45.123Z"
```

**理由**:

- 国際標準で言語/ライブラリ間の互換性が高い
- タイムゾーン情報を含む（Zは UTC）
- ミリ秒精度で正確な順序付けが可能

**アンチパターン**:

```
// ❌ 悪い例
"timestamp": "2025-11-26 10:30:45"  // タイムゾーン不明
"timestamp": 1732618245             // Unixタイムスタンプ（可読性低）
```

### ログレベルフィールド設計

**推奨形式**: 大文字文字列

```
"level": "ERROR"
```

**レベル選択基準**:

| レベル | 使用条件               | 例                                  |
| ------ | ---------------------- | ----------------------------------- |
| DEBUG  | 開発時の詳細情報       | 変数値、関数呼び出し、内部状態      |
| INFO   | 正常動作の重要イベント | リクエスト受信、処理完了、起動/終了 |
| WARN   | 予期しないが対応可能   | リトライ、非推奨機能、設定ミス      |
| ERROR  | 機能障害               | API失敗、データエラー、処理失敗     |
| FATAL  | システム停止レベル     | 起動失敗、データベース接続不可      |

### サービス識別設計

**推奨形式**: kebab-case

```
"service": "api-server"
"service": "background-worker"
"service": "notification-service"
```

**マイクロサービスの場合**:

```
"service": "user-service"
"service": "payment-service"
"service": "email-service"
```

### 環境識別設計

**推奨値**:

```
"environment": "development"   // ローカル開発
"environment": "staging"       // ステージング環境
"environment": "production"    // 本番環境
```

## 相関ID設計パターン

### Request ID生成戦略

**UUID v4推奨**:

```typescript
import { v4 as uuidv4 } from "uuid";
const request_id = uuidv4(); // "550e8400-e29b-41d4-a716-446655440000"
```

**理由**:

- 衝突確率が極めて低い
- グローバルにユニーク
- 標準ライブラリが充実

### Trace ID伝播パターン

**HTTPヘッダー**:

```
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
X-Trace-ID: 4bf92f3577b34da6a3ce929d0e0e4736
```

**ミドルウェアでの実装**:

```typescript
// リクエスト受信時
app.use((req, res, next) => {
  req.request_id = req.headers["x-request-id"] || uuidv4();
  res.setHeader("X-Request-ID", req.request_id);
  next();
});
```

### 非同期処理での伝播

**AsyncLocalStorage（Node.js）**:

```typescript
import { AsyncLocalStorage } from "async_hooks";

const asyncLocalStorage = new AsyncLocalStorage();

// コンテキスト設定
asyncLocalStorage.run({ request_id }, () => {
  // この中のすべての非同期処理でrequest_idが利用可能
  processRequest();
});

// コンテキスト取得
const context = asyncLocalStorage.getStore();
const request_id = context?.request_id;
```

## エラーコンテキスト設計

### スタックトレース記録

**完全なスタックトレース**:

```json
{
  "level": "ERROR",
  "error": {
    "type": "DatabaseError",
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n    at Database.connect (database.ts:45)\n    at UserRepository.findById (user-repository.ts:23)"
  }
}
```

### リクエストコンテキスト

**診断に有用な情報**:

```json
{
  "level": "ERROR",
  "message": "User validation failed",
  "context": {
    "request": {
      "method": "POST",
      "path": "/api/users",
      "query": {},
      "body": {
        "email": "us***@example.com", // PIIマスキング
        "age": 25
      }
    },
    "validation_errors": [{ "field": "email", "message": "Invalid format" }]
  }
}
```

### 実行環境情報

**デバッグに有用な環境情報**:

```json
{
  "level": "ERROR",
  "environment_info": {
    "node_version": "20.10.0",
    "platform": "linux",
    "memory": {
      "used": 512,
      "total": 2048
    },
    "uptime": 86400
  }
}
```

## ログ量最適化

### サンプリング戦略

**正常リクエストのサンプリング**:

```typescript
// 成功リクエストは1%のみログ
if (response.status === 200 && Math.random() > 0.01) {
  return; // ログをスキップ
}

// エラーリクエストは100%ログ
if (response.status >= 400) {
  logger.error(...);
}
```

### ログレベル動的制御

**本番環境での動的制御**:

```typescript
// 通常時はINFO以上
let logLevel = "INFO";

// 問題調査時は一時的にDEBUGに変更（環境変数経由）
if (process.env.DEBUG_MODE === "true") {
  logLevel = "DEBUG";
}
```

### 高頻度ログの集約

**同一ログの集約**:

```typescript
// 同じエラーが1分間に複数回発生した場合は集約
const errorCount = incrementErrorCount(errorType);
if (errorCount % 10 === 1) {
  // 10回ごとにログ
  logger.error(`Error occurred ${errorCount} times`, { errorType });
}
```

## 実装パターン

### JSON形式ロガーの基本実装

```typescript
interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ): void;
  fatal(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ): void;
}
```

詳細な実装は `.claude/skills/structured-logging/templates/logger-template.ts` を参照。

## ベストプラクティス

1. **一貫性**: すべてのサービスで同じログスキーマを使用
2. **機械可読性**: JSON形式で一貫した構造
3. **人間可読性**: messageフィールドは平易な言葉で記述
4. **コンテキスト充実**: 診断に必要な情報を含める
5. **プライバシー保護**: PIIを適切にマスキング
6. **パフォーマンス考慮**: ログ出力がボトルネックにならない設計
7. **コスト意識**: サンプリングで不要なログを削減

## アンチパターン

❌ **非構造化ログ**: `console.log("User 123 failed validation")`
✅ **構造化ログ**: `logger.error("User validation failed", { user_id: "123", validation_errors })`

❌ **PIIの直接出力**: `logger.info("Email sent to user@example.com")`
✅ **PIIマスキング**: `logger.info("Email sent", { email: "us***@example.com" })`

❌ **診断情報不足**: `logger.error("Error occurred")`
✅ **コンテキスト充実**: `logger.error("Database query failed", error, { query, params })`

## 参照

このスキルを使用するエージェント:

- `@sre-observer` - ロギング・監視設計者 (.claude/agents/sre-observer.md:978)
