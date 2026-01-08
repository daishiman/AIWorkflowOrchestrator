# ConversionLogger 実装ガイド

## 文書情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| 対象機能   | ConversionLogger（ファイル変換ログ記録サービス） |
| バージョン | 1.0.0                                            |
| 作成日     | 2026-01-07                                       |

---

# Part 1: 概念的な説明

> **対象読者**: 初学者・非技術者・このシステムを初めて触る人

## ConversionLoggerとは？

ConversionLoggerは、**ファイル変換処理の記録係**です。

### 日常的な例えで理解する

学校の図書室を想像してください。本を借りたり返したりするたびに、図書委員が「誰が」「いつ」「何の本を」「借りた/返した」と記録しますよね。

ConversionLoggerも同じです：

- 「どのファイルを」「いつ」「どんな処理をした」「成功した/失敗した」を記録します
- 後から「あのファイルはどうなった？」と調べられます
- 問題が起きたとき「何が原因？」を特定できます

```
[図書室の記録]                    [ConversionLoggerの記録]
・田中さんが本Aを借りた           ・ファイルAを変換開始
・山田さんが本Bを返した           ・ファイルAの変換完了
・佐藤さんが本Cを紛失             ・ファイルBの変換エラー
```

## バッファリングとは？

「バッファリング」は**まとめて書き込む仕組み**です。

### 日常的な例えで理解する

郵便ポストを想像してください：

- 手紙を1通書くたびに郵便局に行くのは大変ですよね
- 代わりに、手紙をためておいて、まとめて投函します

ConversionLoggerも同じです：

- ログを1件記録するたびにデータベースに書き込むのは効率が悪い
- 代わりに、ログをメモリにためておいて、まとめて書き込みます
- これにより、システム全体の処理速度が向上します

```
[非効率な方法]              [バッファリング（効率的）]
記録1 → DB書込             記録1 → メモリ
記録2 → DB書込             記録2 → メモリ
記録3 → DB書込             記録3 → メモリ
記録4 → DB書込             (100件たまった) → DB書込
                          または
                          (5秒経過) → DB書込
```

## ログレベルとは？

ログには**重要度**があります。信号機のように色分けされています：

| レベル | 色  | 意味         | 例                         |
| ------ | --- | ------------ | -------------------------- |
| INFO   | 緑  | 正常な情報   | 「変換を開始しました」     |
| WARN   | 黄  | 注意が必要   | 「ファイルサイズが大きい」 |
| ERROR  | 赤  | エラーが発生 | 「変換に失敗しました」     |

## なぜこの設計にしたのか

### 1. 効率性

バッファリングにより、データベースへの書き込み回数を減らし、システム全体の速度を向上させています。

### 2. 安全性

Result型という仕組みで、エラーが起きても**システムが止まらない**ようにしています。エラーは「失敗しました」という結果として返され、適切に処理できます。

### 3. テストしやすさ

LogRepositoryというインターフェースを使い、**実際のデータベースなしでもテストできる**ようにしています。これにより、高品質なコードを維持できます。

### 4. 拡張しやすさ

新しいログの種類（例：DEBUG、FATAL）を追加したい場合、既存のコードを壊さずに拡張できます。

---

# Part 2: 技術的な詳細

> **対象読者**: 開発者・技術者・実装担当者

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                      ConversionLogger                        │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   info()     │    │   buffer[]   │    │   flush()    │   │
│  │   warn()     │───▶│  (in-memory) │───▶│              │   │
│  │   error()    │    │              │    │              │   │
│  │   batch()    │    └──────────────┘    └──────┬───────┘   │
│  └──────────────┘                               │            │
│                                                 │            │
│         ┌───────────────────────────────────────┘            │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              ILogRepository (Interface)               │   │
│  │                                                        │   │
│  │  • bulkInsert(logs: ConversionLog[]): Result<void>    │   │
│  │  • findByFileId(fileId: string): Result<Log[]>        │   │
│  │  • findByLevel(level: LogLevel): Result<Log[]>        │   │
│  │  • findByDateRange(start, end): Result<Log[]>         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │     Database     │
                    │  (SQLite/Turso)  │
                    └──────────────────┘
```

## インポート

```typescript
import {
  ConversionLogger,
  ILogRepository,
  IConversionLogger,
  ConversionLog,
  ConversionLogInput,
  LogLevel,
  LogAction,
  Result,
  ok,
  err,
  conversionLogSchema,
  conversionLogInputSchema,
} from "@repo/shared/services/logging";
```

## Zodスキーマ定義

### logLevelSchema

```typescript
export const logLevelSchema = z.enum(["info", "warn", "error"]);
// Type: "info" | "warn" | "error"
```

### logActionSchema

```typescript
export const logActionSchema = z.enum([
  "convert", // ファイル変換処理
  "restore", // 復元処理
  "delete", // 削除処理
  "chunk", // チャンク分割処理
  "embed", // 埋め込みベクトル生成処理
]);
```

### conversionLogSchema

```typescript
export const conversionLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  level: logLevelSchema,
  fileId: z.string().min(1, "fileId cannot be empty"),
  fileName: z.string().min(1, "fileName cannot be empty"),
  conversionId: z.string().optional(),
  action: logActionSchema,
  message: z.string().min(1, "message cannot be empty"),
  details: z.record(z.string(), z.unknown()).optional(),
  durationMs: z.number().nonnegative().optional(),
  errorStack: z.string().optional(),
});
```

### conversionLogInputSchema

```typescript
export const conversionLogInputSchema = z.object({
  fileId: z.string().min(1),
  fileName: z.string().min(1),
  conversionId: z.string().optional(),
  action: logActionSchema,
  message: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional(),
  durationMs: z.number().nonnegative().optional(),
});
```

## インターフェース定義

### IConversionLogger

```typescript
interface IConversionLogger {
  info(input: ConversionLogInput): Promise<Result<ConversionLog>>;
  warn(input: ConversionLogInput): Promise<Result<ConversionLog>>;
  error(
    input: ConversionLogInput,
    error?: Error,
  ): Promise<Result<ConversionLog>>;
  batch(
    logs: Array<{ level: LogLevel; input: ConversionLogInput }>,
  ): Promise<Result<ConversionLog[]>>;
  flush(): Promise<Result<void>>;
  dispose(): void;
}
```

### ILogRepository

```typescript
interface ILogRepository {
  bulkInsert(logs: ConversionLog[]): Promise<Result<void>>;
  findByFileId(fileId: string): Promise<Result<ConversionLog[]>>;
  findByLevel(level: LogLevel): Promise<Result<ConversionLog[]>>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Result<ConversionLog[]>>;
}
```

## Result型

```typescript
type Ok<T> = { success: true; data: T };
type Err<E = Error> = { success: false; error: E };
type Result<T, E = Error> = Ok<T> | Err<E>;

// ヘルパー関数
function ok<T>(data: T): Ok<T>;
function err<E = Error>(error: E): Err<E>;
```

## LogRepository実装例（Drizzle ORM）

```typescript
class DrizzleLogRepository implements ILogRepository {
  constructor(private db: DrizzleInstance) {}

  async bulkInsert(logs: ConversionLog[]): Promise<Result<void>> {
    try {
      await this.db.insert(conversionLogs).values(logs);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByFileId(fileId: string): Promise<Result<ConversionLog[]>> {
    try {
      const logs = await this.db.query.conversionLogs.findMany({
        where: eq(conversionLogs.fileId, fileId),
      });
      return ok(logs);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByLevel(level: LogLevel): Promise<Result<ConversionLog[]>> {
    try {
      const logs = await this.db.query.conversionLogs.findMany({
        where: eq(conversionLogs.level, level),
      });
      return ok(logs);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Result<ConversionLog[]>> {
    try {
      const logs = await this.db.query.conversionLogs.findMany({
        where: and(
          gte(conversionLogs.timestamp, startDate),
          lte(conversionLogs.timestamp, endDate),
        ),
      });
      return ok(logs);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
```

## 使用例

### 基本的な使い方

```typescript
// 1. Repositoryをインスタンス化
const repository = new DrizzleLogRepository(db);

// 2. ConversionLoggerをインスタンス化
const logger = new ConversionLogger(repository, {
  bufferSize: 100, // 100件でフラッシュ
  flushIntervalMs: 5000, // 5秒ごとに自動フラッシュ
});

// 3. INFOログを記録
const result = await logger.info({
  fileId: "file-001",
  fileName: "document.md",
  action: "convert",
  message: "変換処理を開始しました",
  conversionId: "conv-001",
  details: { format: "markdown" },
  durationMs: 150,
});

// 4. 結果を処理
if (result.success) {
  console.log("ログ記録成功:", result.data);
} else {
  console.error("ログ記録失敗:", result.error);
}

// 5. アプリケーション終了時
await logger.flush();
logger.dispose();
```

### WARNログ

```typescript
await logger.warn({
  fileId: "file-001",
  fileName: "large-document.md",
  action: "convert",
  message: "ファイルサイズが大きいため処理に時間がかかる可能性があります",
  details: { fileSize: 10485760 }, // 10MB
});
```

### ERRORログ

```typescript
try {
  await convertFile(file);
} catch (error) {
  await logger.error(
    {
      fileId: "file-001",
      fileName: "broken.md",
      action: "convert",
      message: "変換処理に失敗しました",
    },
    error instanceof Error ? error : new Error(String(error)),
  );
}
```

### バッチログ

```typescript
const result = await logger.batch([
  {
    level: "info",
    input: {
      fileId: "file-001",
      fileName: "doc1.md",
      action: "convert",
      message: "変換開始",
    },
  },
  {
    level: "info",
    input: {
      fileId: "file-002",
      fileName: "doc2.md",
      action: "convert",
      message: "変換開始",
    },
  },
]);
```

## 設定オプション

| オプション        | 型       | デフォルト | 説明                           |
| ----------------- | -------- | ---------- | ------------------------------ |
| `bufferSize`      | `number` | 100        | この件数でバッファをフラッシュ |
| `flushIntervalMs` | `number` | 5000       | 自動フラッシュ間隔（ミリ秒）   |

### 推奨設定

| ユースケース       | bufferSize | flushIntervalMs | 理由                 |
| ------------------ | ---------- | --------------- | -------------------- |
| 高頻度ログ         | 100        | 5000            | バランスの取れた設定 |
| リアルタイム性重視 | 1          | 0               | 即座にDB反映         |
| バッチ処理         | 500        | 30000           | 大量処理に最適化     |
| 開発/デバッグ      | 1          | 0               | ログを即座に確認可能 |

## エラーハンドリング

### よくあるエラー

| エラー                       | 原因             | 対処法               |
| ---------------------------- | ---------------- | -------------------- |
| `Validation error`           | 入力データが不正 | 入力値を確認         |
| `Database connection failed` | DB接続エラー     | 接続設定を確認       |
| `fileId cannot be empty`     | fileIdが空       | 有効なfileIdを指定   |
| `fileName cannot be empty`   | fileNameが空     | 有効なfileNameを指定 |
| `message cannot be empty`    | messageが空      | 有効なmessageを指定  |

### アプリケーション終了時のクリーンアップ

```typescript
process.on("SIGTERM", async () => {
  await logger.flush();
  logger.dispose();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await logger.flush();
  logger.dispose();
  process.exit(0);
});
```

## 依存関係

| パッケージ | バージョン | 用途                   |
| ---------- | ---------- | ---------------------- |
| zod        | ^4.1.13    | スキーマバリデーション |
| TypeScript | 5.x        | 型安全性               |

## ファイル構成

```
packages/shared/src/services/logging/
├── types.ts                    # 型定義・Zodスキーマ
├── conversion-logger.ts        # メイン実装
├── index.ts                    # エクスポート
└── __tests__/
    ├── conversion-logger.test.ts  # ユニットテスト
    └── mocks/
        └── log-repository.mock.ts # テスト用モック
```

## 関連ドキュメント

- [要件定義](../phase-1/requirements-definition.md)
- [アーキテクチャ設計](../phase-2/architecture-design.md)
- [ドメインモデル](../phase-2/domain-model.md)
- [Zodスキーマ設計](../phase-2/zod-schema-design.md)
- [テスト仕様](../phase-4/test-specification.md)

## 次のステップ

| タスク            | タスクID   | 説明                      |
| ----------------- | ---------- | ------------------------- |
| LogRepository実装 | CONV-05-02 | Drizzle ORMを使用した実装 |
| DBスキーマ定義    | CONV-05-02 | conversion_logsテーブル   |
| 統合テスト        | CONV-05-02 | DB永続化フローのテスト    |
