# Phase 6: 統合テスト設計

## 概要

ConversionLoggerサービスの統合テスト設計。
実際のRepository実装との結合テストシナリオを定義。

## 統合テストスコープ

### テスト対象コンポーネント

```
┌─────────────────────────────────────────────────────────┐
│                    統合テスト境界                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐      ┌─────────────────┐          │
│  │ ConversionLogger│──────│  ILogRepository │          │
│  │                 │      │  (Interface)    │          │
│  └─────────────────┘      └─────────────────┘          │
│           │                        │                    │
│           ▼                        ▼                    │
│  ┌─────────────────┐      ┌─────────────────┐          │
│  │   types.ts      │      │ LogRepository   │          │
│  │  (Zod Schemas)  │      │ (実装クラス)    │          │
│  └─────────────────┘      └─────────────────┘          │
│                                    │                    │
│                                    ▼                    │
│                           ┌─────────────────┐          │
│                           │    Database     │          │
│                           │   (SQLite等)    │          │
│                           └─────────────────┘          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 統合テストシナリオ

### IT-001: Repository接続フロー

**目的**: ConversionLoggerとLogRepositoryの接続検証

```typescript
describe("統合テスト: Repository接続", () => {
  it("IT-001: 実際のRepositoryでログを永続化できる", async () => {
    // Arrange
    const db = await setupTestDatabase();
    const repository = new LogRepository(db);
    const logger = new ConversionLogger(repository, { bufferSize: 1 });

    // Act
    const result = await logger.info({
      fileId: "test-file-001",
      fileName: "test.md",
      action: "convert",
      message: "統合テスト",
    });

    // Assert
    expect(result.success).toBe(true);

    // DBから直接確認
    const logs = await repository.findByFileId("test-file-001");
    expect(logs.success).toBe(true);
    expect(logs.data).toHaveLength(1);

    // Cleanup
    await cleanupTestDatabase(db);
  });
});
```

### IT-002: データフローテスト

**目的**: ログデータの完全なフロー検証

```typescript
describe("統合テスト: データフロー", () => {
  it("IT-002: バッファリング→フラッシュ→永続化の完全フロー", async () => {
    // Arrange
    const db = await setupTestDatabase();
    const repository = new LogRepository(db);
    const logger = new ConversionLogger(repository, {
      bufferSize: 3,
      flushIntervalMs: 0, // タイマー無効
    });

    // Act: 3件のログを記録（バッファがいっぱいになりフラッシュ）
    await logger.info({
      fileId: "file-1",
      fileName: "a.md",
      action: "convert",
      message: "ログ1",
    });
    await logger.info({
      fileId: "file-2",
      fileName: "b.md",
      action: "convert",
      message: "ログ2",
    });
    await logger.info({
      fileId: "file-3",
      fileName: "c.md",
      action: "convert",
      message: "ログ3",
    });

    // Assert: DBに3件保存されている
    const infoLogs = await repository.findByLevel("info");
    expect(infoLogs.success).toBe(true);
    expect(infoLogs.data).toHaveLength(3);

    // Cleanup
    logger.dispose();
    await cleanupTestDatabase(db);
  });
});
```

### IT-003: エラーハンドリングテスト

**目的**: DB障害時のエラーハンドリング検証

```typescript
describe("統合テスト: エラーハンドリング", () => {
  it("IT-003: DB接続エラー時に適切にエラーが返される", async () => {
    // Arrange
    const corruptedDb = await setupCorruptedDatabase();
    const repository = new LogRepository(corruptedDb);
    const logger = new ConversionLogger(repository, { bufferSize: 1 });

    // Act
    const result = await logger.info({
      fileId: "file-001",
      fileName: "test.md",
      action: "convert",
      message: "エラーテスト",
    });

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);

    // Cleanup
    logger.dispose();
  });
});
```

### IT-004: 日付範囲検索テスト

**目的**: 日付範囲でのログ検索機能検証

```typescript
describe("統合テスト: 日付範囲検索", () => {
  it("IT-004: 日付範囲でログを検索できる", async () => {
    // Arrange
    const db = await setupTestDatabase();
    const repository = new LogRepository(db);
    const logger = new ConversionLogger(repository, { bufferSize: 1 });

    // 時間差でログを記録
    const startDate = new Date();
    await logger.info({
      fileId: "file-001",
      fileName: "test.md",
      action: "convert",
      message: "範囲内ログ",
    });
    const endDate = new Date();

    // Act
    const logs = await repository.findByDateRange(startDate, endDate);

    // Assert
    expect(logs.success).toBe(true);
    expect(logs.data.length).toBeGreaterThanOrEqual(1);

    // Cleanup
    logger.dispose();
    await cleanupTestDatabase(db);
  });
});
```

## テスト環境要件

### データベースセットアップ

```typescript
// テスト用DBセットアップヘルパー
async function setupTestDatabase(): Promise<Database> {
  const db = new Database(":memory:");

  // スキーマ適用
  await db.exec(`
    CREATE TABLE conversion_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      level TEXT NOT NULL,
      file_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      conversion_id TEXT,
      action TEXT NOT NULL,
      message TEXT NOT NULL,
      details TEXT,
      duration_ms INTEGER,
      error_stack TEXT
    )
  `);

  return db;
}

async function cleanupTestDatabase(db: Database): Promise<void> {
  await db.close();
}
```

### テスト実行設定

```typescript
// vitest.integration.config.ts
export default defineConfig({
  test: {
    include: ["**/*.integration.test.ts"],
    setupFiles: ["./test/integration-setup.ts"],
    testTimeout: 10000, // 統合テストは長めのタイムアウト
    hookTimeout: 5000,
    pool: "forks", // 並列実行時のDB分離
    poolOptions: {
      forks: {
        singleFork: true, // DB競合防止
      },
    },
  },
});
```

## 前提条件

### 現時点での実装状況

| コンポーネント    | 状態   | 備考                     |
| ----------------- | ------ | ------------------------ |
| ConversionLogger  | 完了   | Phase 5で実装済み        |
| ILogRepository    | 完了   | インターフェース定義済み |
| LogRepository実装 | 未実装 | 別タスクで実装予定       |
| DBスキーマ        | 未実装 | 別タスクで実装予定       |

### 統合テスト実行条件

統合テストは以下の条件が満たされた時点で実行可能:

1. LogRepository実装の完了
2. DBマイグレーションの完了
3. テスト用DBセットアップスクリプトの完了

## 今後のアクション

- [ ] LogRepository実装タスクの完了待ち
- [ ] 統合テストファイル作成 (`conversion-logger.integration.test.ts`)
- [ ] CI/CDパイプラインへの統合テスト追加

## 結論

統合テスト設計は完了。
現時点ではユニットテスト（22件）によるモックベースのテストで品質を担保。
LogRepository実装後に統合テストを追加予定。
