# 統合テスト設計書 - ConversionLogger サービス

## 文書情報

| 項目     | 内容            |
| -------- | --------------- |
| タスクID | CONV-05-01      |
| 機能名   | logging-service |
| Phase    | 4               |
| 作成日   | 2026-01-07      |
| 作成者   | Claude Code     |

---

## 1. 統合テスト概要

### 1.1 目的

ConversionLoggerサービスと依存コンポーネント（LogRepository）間の連携を検証する。ユニットテストでは確認できない以下の観点を検証する:

- コンポーネント間のデータフロー
- エラーハンドリングの伝播
- 実際のDBトランザクション動作
- 非同期処理の整合性

### 1.2 統合テスト範囲

```
┌─────────────────────────────────────────────────────────┐
│                    統合テスト範囲                        │
│  ┌─────────────────┐     ┌─────────────────────────┐   │
│  │ ConversionLogger │────>│    ILogRepository      │   │
│  │   (Service)      │     │    (Interface)         │   │
│  └─────────────────┘     └─────────────────────────┘   │
│           │                         │                   │
│           v                         v                   │
│  ┌─────────────────┐     ┌─────────────────────────┐   │
│  │   Buffer[]      │     │   LogRepository        │   │
│  │   (Memory)      │     │   (Implementation)      │   │
│  └─────────────────┘     └─────────────────────────┘   │
│                                     │                   │
│                                     v                   │
│                          ┌─────────────────────────┐   │
│                          │   Database (SQLite)     │   │
│                          │   [テスト用インメモリ]    │   │
│                          └─────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 統合テストシナリオ

### 2.1 Repository接続テスト

**ファイル**: `conversion-logger.integration.test.ts`

| シナリオID | シナリオ名             | 検証内容                       |
| ---------- | ---------------------- | ------------------------------ |
| IT-001     | Repository初期化接続   | LogRepository接続確認          |
| IT-002     | 正常フラッシュ疎通     | Logger→Repository→DB保存フロー |
| IT-003     | バッチ挿入疎通         | 複数ログの一括保存             |
| IT-004     | 接続エラーハンドリング | DB接続失敗時のエラー伝播       |

```typescript
// IT-001: Repository初期化接続
describe("Repository接続テスト", () => {
  let repository: ILogRepository;
  let logger: ConversionLogger;

  beforeEach(async () => {
    // テスト用インメモリDBセットアップ
    repository = await createTestLogRepository();
    logger = new ConversionLogger(repository);
  });

  afterEach(async () => {
    logger.dispose();
    await cleanupTestRepository(repository);
  });

  it("IT-001: LogRepositoryに正常接続できる", async () => {
    // Arrange
    const input: ConversionLogInput = {
      fileId: "integration-file-001",
      fileName: "test.md",
      action: "convert",
      message: "統合テスト",
    };

    // Act
    await logger.info(input);
    await logger.flush();

    // Assert
    const result = await repository.findByFileId("integration-file-001");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].fileId).toBe("integration-file-001");
    }
  });
});
```

---

### 2.2 データフローテスト

**ファイル**: `conversion-logger.flow.test.ts`

| シナリオID | シナリオ名             | 検証内容                         |
| ---------- | ---------------------- | -------------------------------- |
| IT-010     | ログ生成→バッファ蓄積  | メモリバッファへの蓄積確認       |
| IT-011     | バッファ→フラッシュ    | バッファからのフラッシュトリガー |
| IT-012     | フラッシュ→DB保存      | Repository経由でDB永続化         |
| IT-013     | エンドツーエンドフロー | 全フローの一貫性確認             |

```typescript
// IT-013: エンドツーエンドフロー
describe("データフローテスト", () => {
  it("IT-013: ログ生成からDB保存まで完全フローが動作する", async () => {
    // Arrange
    const repository = await createTestLogRepository();
    const logger = new ConversionLogger(repository, {
      bufferSize: 3,
      flushIntervalMs: 0,
    });

    // Act: 3件のログを記録（bufferSize到達で自動フラッシュ）
    await logger.info({
      fileId: "flow-001",
      fileName: "a.md",
      action: "convert",
      message: "ステップ1",
    });
    await logger.warn({
      fileId: "flow-001",
      fileName: "a.md",
      action: "convert",
      message: "ステップ2",
    });
    await logger.error({
      fileId: "flow-001",
      fileName: "a.md",
      action: "convert",
      message: "ステップ3",
    });

    // Assert: DBに3件保存されている
    const result = await repository.findByFileId("flow-001");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(3);
      expect(result.data.map((l) => l.level)).toEqual([
        "info",
        "warn",
        "error",
      ]);
    }

    // Cleanup
    logger.dispose();
  });
});
```

---

### 2.3 エラーハンドリングテスト

**ファイル**: `conversion-logger.error.test.ts`

| シナリオID | シナリオ名                   | 検証内容                             |
| ---------- | ---------------------------- | ------------------------------------ |
| IT-020     | DB接続エラー                 | 接続失敗時のエラーメッセージ         |
| IT-021     | bulkInsert失敗時の伝播       | Repository→Logger→呼び出し元への伝播 |
| IT-022     | トランザクションロールバック | 部分失敗時のロールバック動作         |
| IT-023     | リトライ不要の確認           | エラー時にリトライしない             |

```typescript
// IT-021: bulkInsert失敗時のエラー伝播
describe("エラーハンドリングテスト", () => {
  it("IT-021: Repository障害時にエラーが正しく伝播する", async () => {
    // Arrange: 障害を起こすRepository
    const failingRepository = createFailingTestRepository();
    const logger = new ConversionLogger(failingRepository, {
      bufferSize: 1,
    });

    // Act
    const result = await logger.info({
      fileId: "error-test-001",
      fileName: "test.md",
      action: "convert",
      message: "エラーテスト",
    });

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Database");
    }

    // Cleanup
    logger.dispose();
  });
});
```

---

### 2.4 バッファリングテスト

**ファイル**: `conversion-logger.buffer.test.ts`

| シナリオID | シナリオ名                 | 検証内容                              |
| ---------- | -------------------------- | ------------------------------------- |
| IT-030     | サイズベース自動フラッシュ | bufferSize到達時の自動フラッシュ      |
| IT-031     | 時間ベース自動フラッシュ   | flushIntervalMs経過時の自動フラッシュ |
| IT-032     | 手動フラッシュとの併用     | 自動・手動フラッシュの競合なし        |
| IT-033     | dispose時の最終フラッシュ  | 終了時のデータ損失なし                |

```typescript
// IT-031: 時間ベース自動フラッシュ
describe("バッファリングテスト", () => {
  it("IT-031: 時間経過で自動フラッシュされDBに保存される", async () => {
    // Arrange
    vi.useFakeTimers();
    const repository = await createTestLogRepository();
    const logger = new ConversionLogger(repository, {
      bufferSize: 100,
      flushIntervalMs: 500,
    });

    // Act: 1件記録
    await logger.info({
      fileId: "timer-001",
      fileName: "test.md",
      action: "convert",
      message: "タイマーテスト",
    });

    // まだDBには保存されていない
    let result = await repository.findByFileId("timer-001");
    expect(result.success && result.data.length).toBe(0);

    // 500ms経過
    await vi.advanceTimersByTimeAsync(500);

    // Assert: DBに保存されている
    result = await repository.findByFileId("timer-001");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }

    // Cleanup
    logger.dispose();
    vi.useRealTimers();
  });
});
```

---

## 3. テスト環境構成

### 3.1 テスト用DB設定

```typescript
// test-utils/test-repository.ts

import { Database } from "better-sqlite3";

/**
 * テスト用インメモリDBを作成
 */
export async function createTestLogRepository(): Promise<ILogRepository> {
  const db = new Database(":memory:");

  // スキーマ作成
  db.exec(`
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

  return new LogRepository(db);
}

/**
 * 障害を起こすテスト用Repository
 */
export function createFailingTestRepository(): ILogRepository {
  return {
    bulkInsert: async () => ({
      success: false,
      error: new Error("Database connection failed"),
    }),
    findByFileId: async () => ({ success: true, data: [] }),
    findByLevel: async () => ({ success: true, data: [] }),
    findByDateRange: async () => ({ success: true, data: [] }),
  };
}

/**
 * テスト用Repositoryのクリーンアップ
 */
export async function cleanupTestRepository(
  repository: ILogRepository,
): Promise<void> {
  // インメモリDBは参照解除で自動クリーンアップ
}
```

### 3.2 テスト実行コマンド

```bash
# 統合テストのみ実行
pnpm --filter @repo/shared test:run --grep "integration"

# 全テスト実行
pnpm --filter @repo/shared test:run

# カバレッジ付き
pnpm --filter @repo/shared test:coverage
```

---

## 4. 統合テストファイル構成

```
packages/shared/src/services/logging/__tests__/
├── conversion-logger.test.ts              # ユニットテスト
├── conversion-logger.integration.test.ts  # Repository接続テスト
├── conversion-logger.flow.test.ts         # データフローテスト
├── conversion-logger.error.test.ts        # エラーハンドリングテスト
├── conversion-logger.buffer.test.ts       # バッファリングテスト
├── mocks/
│   └── log-repository.mock.ts             # モック定義
├── fixtures/
│   └── log-fixtures.ts                    # テストデータ
└── test-utils/
    └── test-repository.ts                 # テスト用Repository
```

---

## 5. 統合テストマトリクス

| テストID | カテゴリ           | 検証対象                   | 優先度 | 実装Phase |
| -------- | ------------------ | -------------------------- | ------ | --------- |
| IT-001   | Repository接続     | 初期化接続                 | Must   | Phase 6   |
| IT-002   | Repository接続     | フラッシュ疎通             | Must   | Phase 6   |
| IT-003   | Repository接続     | バッチ挿入                 | Must   | Phase 6   |
| IT-004   | Repository接続     | 接続エラー                 | Must   | Phase 6   |
| IT-010   | データフロー       | バッファ蓄積               | Must   | Phase 6   |
| IT-011   | データフロー       | フラッシュトリガー         | Must   | Phase 6   |
| IT-012   | データフロー       | DB永続化                   | Must   | Phase 6   |
| IT-013   | データフロー       | エンドツーエンド           | Must   | Phase 6   |
| IT-020   | エラーハンドリング | DB接続エラー               | Must   | Phase 6   |
| IT-021   | エラーハンドリング | エラー伝播                 | Must   | Phase 6   |
| IT-022   | エラーハンドリング | ロールバック               | Should | Phase 6   |
| IT-030   | バッファリング     | サイズベース自動フラッシュ | Must   | Phase 6   |
| IT-031   | バッファリング     | 時間ベース自動フラッシュ   | Must   | Phase 6   |
| IT-032   | バッファリング     | 手動/自動併用              | Should | Phase 6   |
| IT-033   | バッファリング     | dispose時フラッシュ        | Must   | Phase 6   |

---

## 6. Phase 4での成果物

Phase 4（現フェーズ）では統合テストの**設計**のみを行う。実際の統合テストコードはPhase 6（テスト拡充）で実装する。

### Phase 4成果物

- [x] 統合テスト設計書（本ドキュメント）
- [x] テストシナリオ定義
- [x] テスト環境構成設計

### Phase 6で実装

- [ ] 統合テストコード
- [ ] テスト用Repository実装
- [ ] テストフィクスチャ

---

## 7. 承認

| 役割         | 判定     | 日付       |
| ------------ | -------- | ---------- |
| テスト設計者 | Complete | 2026-01-07 |
