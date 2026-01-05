# ログ記録サービス実装 - タスク指示書

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | CONV-05-01                              |
| タスク名     | ログ記録サービス実装                    |
| 親タスク     | CONV-05 (履歴/ログ管理)                 |
| 依存タスク   | CONV-04-02 (files/conversions テーブル) |
| 規模         | 小                                      |
| 見積もり工数 | 0.5日                                   |
| ステータス   | 未実施                                  |

---

## 1. 目的

ファイル変換処理のログを構造化して記録するサービスを実装する。

---

## 2. 成果物

- `packages/shared/src/services/logging/conversion-logger.ts`
- `packages/shared/src/services/logging/types.ts`
- `packages/shared/src/services/logging/__tests__/conversion-logger.test.ts`

---

## 3. 入力

- 変換処理のイベント情報
- ファイルID、変換ID
- ログレベル（info, warn, error）
- アクションタイプ（convert, restore, delete）

---

## 4. 出力

```typescript
// packages/shared/src/services/logging/types.ts
import { z } from "zod";

export const logLevelSchema = z.enum(["info", "warn", "error"]);
export type LogLevel = z.infer<typeof logLevelSchema>;

export const logActionSchema = z.enum([
  "convert",
  "restore",
  "delete",
  "chunk",
  "embed",
]);
export type LogAction = z.infer<typeof logActionSchema>;

export const conversionLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  level: logLevelSchema,
  fileId: z.string(),
  fileName: z.string(),
  conversionId: z.string().optional(),
  action: logActionSchema,
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  durationMs: z.number().optional(),
  errorStack: z.string().optional(),
});

export type ConversionLog = z.infer<typeof conversionLogSchema>;

export interface ConversionLogInput {
  fileId: string;
  fileName: string;
  conversionId?: string;
  action: LogAction;
  message: string;
  details?: Record<string, unknown>;
  durationMs?: number;
}
```

---

## 5. 実装仕様

### 5.1 ログ記録サービスインターフェース

```typescript
// packages/shared/src/services/logging/conversion-logger.ts
import type { Result } from "@/types/result";
import type { ConversionLog, ConversionLogInput, LogLevel } from "./types";

export interface IConversionLogger {
  /**
   * INFOレベルのログを記録
   */
  info(input: ConversionLogInput): Promise<Result<ConversionLog, Error>>;

  /**
   * WARNレベルのログを記録
   */
  warn(input: ConversionLogInput): Promise<Result<ConversionLog, Error>>;

  /**
   * ERRORレベルのログを記録
   */
  error(
    input: ConversionLogInput,
    error?: Error,
  ): Promise<Result<ConversionLog, Error>>;

  /**
   * バッチログ記録（複数ログを一括保存）
   */
  batch(
    logs: Array<{ level: LogLevel; input: ConversionLogInput }>,
  ): Promise<Result<ConversionLog[], Error>>;

  /**
   * ログの永続化をフラッシュ
   */
  flush(): Promise<Result<void, Error>>;
}
```

### 5.2 実装クラス

```typescript
export class ConversionLogger implements IConversionLogger {
  private buffer: ConversionLog[] = [];
  private readonly bufferSize: number = 100;
  private readonly flushIntervalMs: number = 5000;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly logRepository: LogRepository,
    options?: {
      bufferSize?: number;
      flushIntervalMs?: number;
    },
  ) {
    this.bufferSize = options?.bufferSize ?? 100;
    this.flushIntervalMs = options?.flushIntervalMs ?? 5000;
    this.startAutoFlush();
  }

  async info(input: ConversionLogInput): Promise<Result<ConversionLog, Error>> {
    return this.log("info", input);
  }

  async warn(input: ConversionLogInput): Promise<Result<ConversionLog, Error>> {
    return this.log("warn", input);
  }

  async error(
    input: ConversionLogInput,
    error?: Error,
  ): Promise<Result<ConversionLog, Error>> {
    return this.log("error", {
      ...input,
      details: {
        ...input.details,
        errorMessage: error?.message,
        errorStack: error?.stack,
      },
    });
  }

  private async log(
    level: LogLevel,
    input: ConversionLogInput,
  ): Promise<Result<ConversionLog, Error>> {
    const log: ConversionLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      fileId: input.fileId,
      fileName: input.fileName,
      conversionId: input.conversionId,
      action: input.action,
      message: input.message,
      details: input.details,
      durationMs: input.durationMs,
    };

    this.buffer.push(log);

    if (this.buffer.length >= this.bufferSize) {
      await this.flush();
    }

    return ok(log);
  }

  async batch(
    logs: Array<{ level: LogLevel; input: ConversionLogInput }>,
  ): Promise<Result<ConversionLog[], Error>> {
    const results: ConversionLog[] = [];
    for (const { level, input } of logs) {
      const result = await this.log(level, input);
      if (result.success) {
        results.push(result.data);
      }
    }
    return ok(results);
  }

  async flush(): Promise<Result<void, Error>> {
    if (this.buffer.length === 0) {
      return ok(undefined);
    }

    const logsToFlush = [...this.buffer];
    this.buffer = [];

    return this.logRepository.bulkInsert(logsToFlush);
  }

  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);
  }

  dispose(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}
```

### 5.3 ログリポジトリ

```typescript
// packages/shared/src/repositories/log-repository.ts
export interface LogRepository {
  bulkInsert(logs: ConversionLog[]): Promise<Result<void, Error>>;
  findByFileId(
    fileId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Result<ConversionLog[], Error>>;
  findByLevel(
    level: LogLevel,
    options?: { limit?: number; offset?: number },
  ): Promise<Result<ConversionLog[], Error>>;
  findByDateRange(
    from: Date,
    to: Date,
    options?: { limit?: number; offset?: number },
  ): Promise<Result<ConversionLog[], Error>>;
}
```

---

## 6. テストケース

```typescript
describe("ConversionLogger", () => {
  it("INFOログを正常に記録できる", async () => {
    const logger = new ConversionLogger(mockRepository);
    const result = await logger.info({
      fileId: "file-123",
      fileName: "test.md",
      action: "convert",
      message: "変換開始",
    });
    expect(result.success).toBe(true);
    expect(result.data.level).toBe("info");
  });

  it("ERRORログにスタックトレースを含められる", async () => {
    const logger = new ConversionLogger(mockRepository);
    const error = new Error("テストエラー");
    const result = await logger.error(
      {
        fileId: "file-123",
        fileName: "test.md",
        action: "convert",
        message: "変換失敗",
      },
      error,
    );
    expect(result.success).toBe(true);
    expect(result.data.details?.errorStack).toBeDefined();
  });

  it("バッファが満杯になると自動フラッシュされる", async () => {
    const logger = new ConversionLogger(mockRepository, { bufferSize: 2 });
    await logger.info({
      fileId: "1",
      fileName: "a.md",
      action: "convert",
      message: "1",
    });
    await logger.info({
      fileId: "2",
      fileName: "b.md",
      action: "convert",
      message: "2",
    });
    expect(mockRepository.bulkInsert).toHaveBeenCalled();
  });

  it("バッチログ記録が動作する", async () => {
    const logger = new ConversionLogger(mockRepository);
    const result = await logger.batch([
      {
        level: "info",
        input: {
          fileId: "1",
          fileName: "a.md",
          action: "convert",
          message: "1",
        },
      },
      {
        level: "warn",
        input: {
          fileId: "2",
          fileName: "b.md",
          action: "convert",
          message: "2",
        },
      },
    ]);
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(2);
  });
});
```

---

## 7. 完了条件

- [ ] `ConversionLogger`クラスが実装済み
- [ ] INFOログ記録が動作する
- [ ] WARNログ記録が動作する
- [ ] ERRORログ記録が動作（スタックトレース含む）
- [ ] バッファリング＆自動フラッシュが動作する
- [ ] バッチログ記録が動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-05-02: 履歴取得サービス実装

---

## 9. 参照情報

- CONV-04-02: files/conversions テーブル
- CONV-05: 履歴/ログ管理（親タスク）
