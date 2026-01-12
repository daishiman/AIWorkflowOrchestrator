# 依存性注入設計書 - HistoryService DB統合

## 文書情報

| 項目     | 内容                           |
| -------- | ------------------------------ |
| タスクID | history-service-db-integration |
| Phase    | 2                              |
| 作成日   | 2026-01-12                     |
| 状態     | 完了                           |

---

## 1. 依存関係の整理

### 1.1 shared HistoryService の依存関係

```typescript
// packages/shared/src/services/history/history-service.ts
export class HistoryService implements IHistoryService {
  constructor(
    private readonly conversionRepository: ConversionRepository,
    private readonly _fileRepository: FileRepository,
    private readonly logger: IConversionLogger,
  ) {}
}
```

| 依存名                 | インターフェース       | 責務                   |
| ---------------------- | ---------------------- | ---------------------- |
| `conversionRepository` | `ConversionRepository` | 変換データのCRUD操作   |
| `fileRepository`       | `FileRepository`       | ファイルメタデータ取得 |
| `logger`               | `IConversionLogger`    | 変換操作のログ記録     |

### 1.2 Electron HistoryService の依存関係

```typescript
// apps/desktop/src/main/services/HistoryService.ts（更新後）
export class HistoryService {
  constructor(
    private readonly sharedHistoryService: IHistoryService,
    private readonly logRepository: LogRepository, // ログ取得用
    private readonly logger: IConversionLogger,
  ) {}
}
```

| 依存名                 | インターフェース    | 責務                                  |
| ---------------------- | ------------------- | ------------------------------------- |
| `sharedHistoryService` | `IHistoryService`   | 履歴ビジネスロジック（shared実装）    |
| `logRepository`        | `LogRepository`     | 変換ログの取得（getConversionLogs用） |
| `logger`               | `IConversionLogger` | Electron側のログ記録                  |

---

## 2. 依存グラフ

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Electron Main Process                            │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Service Factory                              │   │
│  │                                                                  │   │
│  │  createHistoryService()                                          │   │
│  │    │                                                             │   │
│  │    ├─► getDatabase() ─────────────► DrizzleDatabase             │   │
│  │    │                                    │                        │   │
│  │    ├─► createConversionRepository() ◄──┘                        │   │
│  │    │                                                             │   │
│  │    ├─► createFileRepository() ◄─────────┘                       │   │
│  │    │                                                             │   │
│  │    ├─► createLogger() ───────────► ConsoleLogger                │   │
│  │    │                                                             │   │
│  │    ├─► createLogRepository() ◄──────┘                           │   │
│  │    │                                                             │   │
│  │    └─► new HistoryService(                                       │   │
│  │          new SharedHistoryService(                               │   │
│  │            conversionRepository,                                 │   │
│  │            fileRepository,                                       │   │
│  │            logger                                                │   │
│  │          ),                                                      │   │
│  │          logRepository,                                          │   │
│  │          logger                                                  │   │
│  │        )                                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. リポジトリ初期化設計

### 3.1 データベース接続

```typescript
// apps/desktop/src/main/database/connection.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle> | null = null;

export async function getDatabase() {
  if (db) return db;

  const client = createClient({
    url: process.env.DATABASE_URL || "file:./data/app.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  db = drizzle(client, { schema });
  return db;
}

export async function closeDatabase() {
  if (db) {
    // Turso/libSQL clientにはclose()がある
    db = null;
  }
}
```

### 3.2 ConversionRepository 初期化

```typescript
// apps/desktop/src/main/repositories/conversionRepository.ts
import type { ConversionRepository } from "@repo/shared/services/history/types";
import type { Database } from "../database/connection";

export function createConversionRepository(db: Database): ConversionRepository {
  return {
    async findByFileId(fileId, options) {
      // Drizzle ORM クエリ実装
    },
    async findById(conversionId) {
      // Drizzle ORM クエリ実装
    },
    async create(data) {
      // Drizzle ORM 挿入実装
    },
    async countByFileId(fileId) {
      // Drizzle ORM カウント実装
    },
  };
}
```

### 3.3 FileRepository 初期化

```typescript
// apps/desktop/src/main/repositories/fileRepository.ts
import type { FileRepository } from "@repo/shared/services/history/types";
import type { Database } from "../database/connection";

export function createFileRepository(db: Database): FileRepository {
  return {
    async findById(fileId) {
      // Drizzle ORM クエリ実装
    },
  };
}
```

### 3.4 LogRepository 初期化（新規）

```typescript
// apps/desktop/src/main/repositories/logRepository.ts
import type { Result } from "@repo/shared/types/rag/result";
import type {
  ConversionLog,
  LogFilterOptions,
  PaginatedResult,
} from "../../renderer/components/history/types";

export interface LogRepository {
  findByConversionId(
    conversionId: string,
    options?: LogFilterOptions,
  ): Promise<Result<PaginatedResult<ConversionLog>, Error>>;
}

export function createLogRepository(db: Database): LogRepository {
  return {
    async findByConversionId(conversionId, options) {
      // Drizzle ORM クエリ実装
      // レベルフィルタ、ページネーション対応
    },
  };
}
```

### 3.5 Logger 初期化

```typescript
// apps/desktop/src/main/services/logger.ts
import type { IConversionLogger } from "@repo/shared/services/logging/types";

export function createConversionLogger(): IConversionLogger {
  return {
    async info(context) {
      console.log(`[INFO] ${context.action}: ${context.message}`, context);
    },
    async warn(context) {
      console.warn(`[WARN] ${context.action}: ${context.message}`, context);
    },
    async error(context) {
      console.error(`[ERROR] ${context.action}: ${context.message}`, context);
    },
    async debug(context) {
      console.debug(`[DEBUG] ${context.action}: ${context.message}`, context);
    },
  };
}
```

---

## 4. サービスファクトリ設計

### 4.1 ファクトリ関数

```typescript
// apps/desktop/src/main/services/factory.ts
import { HistoryService as SharedHistoryService } from "@repo/shared/services/history/history-service";
import { HistoryService } from "./HistoryService";
import { getDatabase } from "../database/connection";
import { createConversionRepository } from "../repositories/conversionRepository";
import { createFileRepository } from "../repositories/fileRepository";
import { createLogRepository } from "../repositories/logRepository";
import { createConversionLogger } from "./logger";

let historyServiceInstance: HistoryService | null = null;

export async function createHistoryService(): Promise<HistoryService> {
  if (historyServiceInstance) {
    return historyServiceInstance;
  }

  const db = await getDatabase();
  const conversionRepository = createConversionRepository(db);
  const fileRepository = createFileRepository(db);
  const logRepository = createLogRepository(db);
  const logger = createConversionLogger();

  const sharedHistoryService = new SharedHistoryService(
    conversionRepository,
    fileRepository,
    logger,
  );

  historyServiceInstance = new HistoryService(
    sharedHistoryService,
    logRepository,
    logger,
  );

  return historyServiceInstance;
}

export function resetHistoryService(): void {
  historyServiceInstance = null;
}
```

### 4.2 シングルトン管理

| 管理対象             | パターン       | ライフサイクル     |
| -------------------- | -------------- | ------------------ |
| Database Connection  | シングルトン   | アプリ起動〜終了   |
| HistoryService       | シングルトン   | アプリ起動〜終了   |
| ConversionRepository | ファクトリ生成 | HistoryService依存 |
| FileRepository       | ファクトリ生成 | HistoryService依存 |
| LogRepository        | ファクトリ生成 | HistoryService依存 |
| Logger               | ファクトリ生成 | HistoryService依存 |

---

## 5. IPCハンドラーへの統合

### 5.1 現在の実装（スタブ）

```typescript
// apps/desktop/src/main/ipc/historyHandlers.ts（現在）
import { createHistoryService } from "../services/HistoryService";

const historyService = createHistoryService();

ipcMain.handle("history:getFileHistory", async (_, fileId, options) => {
  const result = await historyService.getFileHistory(fileId, options);
  return { success: true, data: result };
});
```

### 5.2 更新後の実装

```typescript
// apps/desktop/src/main/ipc/historyHandlers.ts（更新後）
import { createHistoryService } from "../services/factory";

let historyService: HistoryService | null = null;

async function getHistoryService(): Promise<HistoryService> {
  if (!historyService) {
    historyService = await createHistoryService();
  }
  return historyService;
}

ipcMain.handle("history:getFileHistory", async (_, fileId, options) => {
  try {
    const service = await getHistoryService();
    const result = await service.getFileHistory(fileId, options);
    return result; // Result型をそのまま返す
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
});
```

---

## 6. テスト時のDI

### 6.1 モック注入パターン

```typescript
// apps/desktop/src/main/services/__tests__/HistoryService.test.ts
import { HistoryService } from "../HistoryService";
import type { IHistoryService } from "@repo/shared/services/history/types";
import type { LogRepository } from "../../repositories/logRepository";

describe("HistoryService", () => {
  const mockSharedHistoryService: IHistoryService = {
    getFileHistory: vi.fn(),
    getVersionDetail: vi.fn(),
    // ... 他のメソッド
  };

  const mockLogRepository: LogRepository = {
    findByConversionId: vi.fn(),
  };

  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };

  const historyService = new HistoryService(
    mockSharedHistoryService,
    mockLogRepository,
    mockLogger,
  );

  it("should delegate to shared history service", async () => {
    // テスト実装
  });
});
```

### 6.2 統合テスト用のテストDB

```typescript
// apps/desktop/src/main/services/__tests__/HistoryService.integration.test.ts
import { createHistoryService, resetHistoryService } from "../factory";

describe("HistoryService Integration", () => {
  beforeEach(async () => {
    // テスト用DBをセットアップ
    await setupTestDatabase();
  });

  afterEach(async () => {
    resetHistoryService();
    await cleanupTestDatabase();
  });

  it("should retrieve file history from database", async () => {
    const service = await createHistoryService();
    const result = await service.getFileHistory("test-file-id");

    expect(result.success).toBe(true);
    // ... アサーション
  });
});
```

---

## 7. 初期化シーケンス

### 7.1 アプリ起動時

```
1. Electron Main Process 起動
2. Database接続初期化 (getDatabase())
3. IPCハンドラー登録 (registerHistoryHandlers())
4. 最初のIPC呼び出し時にHistoryService初期化（遅延初期化）
```

### 7.2 アプリ終了時

```
1. app.on('before-quit') イベント
2. closeDatabase() 呼び出し
3. 接続クローズ
```

---

## 8. エラーハンドリング

### 8.1 初期化エラー

| エラー種別             | 発生タイミング         | 対処                           |
| ---------------------- | ---------------------- | ------------------------------ |
| DB接続エラー           | getDatabase()          | エラーログ + 再試行（3回まで） |
| リポジトリ初期化エラー | createXxxRepository()  | エラーログ + フォールバック    |
| サービス初期化エラー   | createHistoryService() | エラーをIPCで伝搬              |

### 8.2 ランタイムエラー

| エラー種別    | 発生タイミング | 対処                      |
| ------------- | -------------- | ------------------------- |
| クエリエラー  | Repository操作 | Result型でエラーを返却    |
| 型変換エラー  | Adapter変換    | Result型でエラーを返却    |
| IPC通信エラー | ipcMain.handle | try-catchでキャッチし返却 |

---

## 9. 完了確認

- [x] shared HistoryServiceの依存関係が整理されている
- [x] Electron HistoryServiceの依存関係が設計されている
- [x] リポジトリ初期化方法が設計されている
- [x] サービスファクトリパターンが設計されている
- [x] シングルトン管理方法が決定されている
- [x] テスト時のDI方法が設計されている
- [x] 初期化シーケンスが定義されている
