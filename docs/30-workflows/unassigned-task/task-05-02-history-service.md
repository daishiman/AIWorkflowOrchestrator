# 履歴取得サービス実装 - タスク指示書

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | CONV-05-02                              |
| タスク名     | 履歴取得サービス実装                    |
| 親タスク     | CONV-05 (履歴/ログ管理)                 |
| 依存タスク   | CONV-04-02 (files/conversions テーブル) |
| 規模         | 小                                      |
| 見積もり工数 | 0.5日                                   |
| ステータス   | 未実施                                  |

---

## 1. 目的

ファイルごとのバージョン履歴を取得し、特定バージョンへの復元機能を提供するサービスを実装する。

---

## 2. 成果物

- `packages/shared/src/services/history/history-service.ts`
- `packages/shared/src/services/history/types.ts`
- `packages/shared/src/services/history/__tests__/history-service.test.ts`

---

## 3. 入力

- ファイルID
- 変換ID（復元時）
- フィルタ条件（日付範囲、アクションタイプ）
- ページネーションオプション

---

## 4. 出力

```typescript
// packages/shared/src/services/history/types.ts
import { z } from "zod";

export const versionHistoryItemSchema = z.object({
  conversionId: z.string(),
  fileId: z.string(),
  fileName: z.string(),
  version: z.number(),
  createdAt: z.date(),
  mimeType: z.string(),
  contentHash: z.string(),
  sizeBytes: z.number(),
  metadata: z.record(z.unknown()).optional(),
  isCurrentVersion: z.boolean(),
});

export type VersionHistoryItem = z.infer<typeof versionHistoryItemSchema>;

export const historyFilterSchema = z.object({
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  mimeTypes: z.array(z.string()).optional(),
});

export type HistoryFilter = z.infer<typeof historyFilterSchema>;

export const paginationOptionsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type PaginationOptions = z.infer<typeof paginationOptionsSchema>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
```

---

## 5. 実装仕様

### 5.1 履歴サービスインターフェース

```typescript
// packages/shared/src/services/history/history-service.ts
import type { Result } from "@/types/result";
import type {
  VersionHistoryItem,
  HistoryFilter,
  PaginationOptions,
  PaginatedResult,
} from "./types";

export interface IHistoryService {
  /**
   * ファイルのバージョン履歴一覧を取得
   */
  getFileHistory(
    fileId: string,
    options?: {
      filter?: HistoryFilter;
      pagination?: PaginationOptions;
    },
  ): Promise<Result<PaginatedResult<VersionHistoryItem>, Error>>;

  /**
   * 特定バージョンの詳細を取得
   */
  getVersionDetail(
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>>;

  /**
   * 2つのバージョン間の差分情報を取得
   */
  getVersionDiff(
    conversionIdA: string,
    conversionIdB: string,
  ): Promise<Result<VersionDiff, Error>>;

  /**
   * 特定バージョンに復元
   */
  restoreToVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>>;

  /**
   * 最新バージョンを取得
   */
  getLatestVersion(
    fileId: string,
  ): Promise<Result<VersionHistoryItem | null, Error>>;

  /**
   * バージョン数を取得
   */
  getVersionCount(fileId: string): Promise<Result<number, Error>>;
}
```

### 5.2 差分情報型定義

```typescript
export interface VersionDiff {
  conversionIdA: string;
  conversionIdB: string;
  sizeChange: number;
  metadataChanges: MetadataChange[];
  contentChanged: boolean;
}

export interface MetadataChange {
  key: string;
  oldValue: unknown;
  newValue: unknown;
}
```

### 5.3 実装クラス

```typescript
export class HistoryService implements IHistoryService {
  constructor(
    private readonly conversionRepository: ConversionRepository,
    private readonly fileRepository: FileRepository,
    private readonly logger: IConversionLogger,
  ) {}

  async getFileHistory(
    fileId: string,
    options?: {
      filter?: HistoryFilter;
      pagination?: PaginationOptions;
    },
  ): Promise<Result<PaginatedResult<VersionHistoryItem>, Error>> {
    const pagination = options?.pagination ?? { limit: 20, offset: 0 };

    // バージョン履歴を取得（新しい順）
    const conversionsResult = await this.conversionRepository.findByFileId(
      fileId,
      {
        orderBy: "createdAt",
        orderDirection: "desc",
        limit: pagination.limit + 1, // hasMore判定用に+1
        offset: pagination.offset,
        filter: options?.filter,
      },
    );

    if (!conversionsResult.success) {
      return err(conversionsResult.error);
    }

    const conversions = conversionsResult.data;
    const hasMore = conversions.length > pagination.limit;
    const items = conversions.slice(0, pagination.limit);

    // 最新バージョンを特定
    const latestResult = await this.getLatestVersion(fileId);
    const latestId = latestResult.success
      ? latestResult.data?.conversionId
      : null;

    const historyItems: VersionHistoryItem[] = items.map((conv, index) => ({
      conversionId: conv.id,
      fileId: conv.fileId,
      fileName: conv.fileName,
      version: conversions.length - pagination.offset - index,
      createdAt: conv.createdAt,
      mimeType: conv.mimeType,
      contentHash: conv.contentHash,
      sizeBytes: conv.sizeBytes,
      metadata: conv.metadata,
      isCurrentVersion: conv.id === latestId,
    }));

    // 総件数取得
    const countResult = await this.getVersionCount(fileId);
    const total = countResult.success ? countResult.data : 0;

    return ok({
      items: historyItems,
      total,
      hasMore,
    });
  }

  async getVersionDetail(
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>> {
    const conversionResult =
      await this.conversionRepository.findById(conversionId);

    if (!conversionResult.success) {
      return err(conversionResult.error);
    }

    if (!conversionResult.data) {
      return err(new Error(`Conversion not found: ${conversionId}`));
    }

    const conv = conversionResult.data;
    const latestResult = await this.getLatestVersion(conv.fileId);
    const latestId = latestResult.success
      ? latestResult.data?.conversionId
      : null;

    return ok({
      conversionId: conv.id,
      fileId: conv.fileId,
      fileName: conv.fileName,
      version: 0, // 個別取得時はバージョン番号は計算しない
      createdAt: conv.createdAt,
      mimeType: conv.mimeType,
      contentHash: conv.contentHash,
      sizeBytes: conv.sizeBytes,
      metadata: conv.metadata,
      isCurrentVersion: conv.id === latestId,
    });
  }

  async getVersionDiff(
    conversionIdA: string,
    conversionIdB: string,
  ): Promise<Result<VersionDiff, Error>> {
    const [resultA, resultB] = await Promise.all([
      this.conversionRepository.findById(conversionIdA),
      this.conversionRepository.findById(conversionIdB),
    ]);

    if (!resultA.success || !resultA.data) {
      return err(new Error(`Conversion A not found: ${conversionIdA}`));
    }
    if (!resultB.success || !resultB.data) {
      return err(new Error(`Conversion B not found: ${conversionIdB}`));
    }

    const convA = resultA.data;
    const convB = resultB.data;

    const metadataChanges: MetadataChange[] = [];
    const allKeys = new Set([
      ...Object.keys(convA.metadata ?? {}),
      ...Object.keys(convB.metadata ?? {}),
    ]);

    for (const key of allKeys) {
      const oldValue = convA.metadata?.[key];
      const newValue = convB.metadata?.[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        metadataChanges.push({ key, oldValue, newValue });
      }
    }

    return ok({
      conversionIdA,
      conversionIdB,
      sizeChange: convB.sizeBytes - convA.sizeBytes,
      metadataChanges,
      contentChanged: convA.contentHash !== convB.contentHash,
    });
  }

  async restoreToVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>> {
    // 復元対象のバージョンを取得
    const targetResult = await this.conversionRepository.findById(conversionId);

    if (!targetResult.success || !targetResult.data) {
      return err(new Error(`Conversion not found: ${conversionId}`));
    }

    const target = targetResult.data;

    if (target.fileId !== fileId) {
      return err(
        new Error(
          `Conversion ${conversionId} does not belong to file ${fileId}`,
        ),
      );
    }

    // 新しいバージョンとして復元（コピー作成）
    const newConversionResult = await this.conversionRepository.create({
      fileId,
      fileName: target.fileName,
      mimeType: target.mimeType,
      content: target.content,
      metadata: {
        ...target.metadata,
        restoredFrom: conversionId,
        restoredAt: new Date().toISOString(),
      },
    });

    if (!newConversionResult.success) {
      return err(newConversionResult.error);
    }

    // ログ記録
    await this.logger.info({
      fileId,
      fileName: target.fileName,
      conversionId: newConversionResult.data.id,
      action: "restore",
      message: `Restored to version ${conversionId}`,
      details: { restoredFromId: conversionId },
    });

    return this.getVersionDetail(newConversionResult.data.id);
  }

  async getLatestVersion(
    fileId: string,
  ): Promise<Result<VersionHistoryItem | null, Error>> {
    const result = await this.conversionRepository.findByFileId(fileId, {
      orderBy: "createdAt",
      orderDirection: "desc",
      limit: 1,
    });

    if (!result.success) {
      return err(result.error);
    }

    if (result.data.length === 0) {
      return ok(null);
    }

    const conv = result.data[0];
    return ok({
      conversionId: conv.id,
      fileId: conv.fileId,
      fileName: conv.fileName,
      version: 1,
      createdAt: conv.createdAt,
      mimeType: conv.mimeType,
      contentHash: conv.contentHash,
      sizeBytes: conv.sizeBytes,
      metadata: conv.metadata,
      isCurrentVersion: true,
    });
  }

  async getVersionCount(fileId: string): Promise<Result<number, Error>> {
    return this.conversionRepository.countByFileId(fileId);
  }
}
```

---

## 6. テストケース

```typescript
describe("HistoryService", () => {
  it("ファイルの履歴一覧を取得できる", async () => {
    const service = new HistoryService(mockConvRepo, mockFileRepo, mockLogger);
    const result = await service.getFileHistory("file-123");
    expect(result.success).toBe(true);
    expect(result.data.items.length).toBeGreaterThan(0);
  });

  it("ページネーションが正しく動作する", async () => {
    const service = new HistoryService(mockConvRepo, mockFileRepo, mockLogger);
    const result = await service.getFileHistory("file-123", {
      pagination: { limit: 5, offset: 0 },
    });
    expect(result.success).toBe(true);
    expect(result.data.items.length).toBeLessThanOrEqual(5);
  });

  it("バージョン詳細を取得できる", async () => {
    const service = new HistoryService(mockConvRepo, mockFileRepo, mockLogger);
    const result = await service.getVersionDetail("conv-123");
    expect(result.success).toBe(true);
    expect(result.data.conversionId).toBe("conv-123");
  });

  it("2バージョン間の差分を取得できる", async () => {
    const service = new HistoryService(mockConvRepo, mockFileRepo, mockLogger);
    const result = await service.getVersionDiff("conv-1", "conv-2");
    expect(result.success).toBe(true);
    expect(result.data.sizeChange).toBeDefined();
  });

  it("特定バージョンに復元できる", async () => {
    const service = new HistoryService(mockConvRepo, mockFileRepo, mockLogger);
    const result = await service.restoreToVersion("file-123", "conv-old");
    expect(result.success).toBe(true);
    expect(result.data.metadata?.restoredFrom).toBe("conv-old");
  });

  it("存在しないバージョンの復元はエラー", async () => {
    const service = new HistoryService(mockConvRepo, mockFileRepo, mockLogger);
    const result = await service.restoreToVersion("file-123", "not-found");
    expect(result.success).toBe(false);
  });
});
```

---

## 7. 完了条件

- [ ] `HistoryService`クラスが実装済み
- [ ] 履歴一覧取得が動作する
- [ ] ページネーションが正しく動作する
- [ ] バージョン詳細取得が動作する
- [ ] バージョン間差分取得が動作する
- [ ] バージョン復元が動作する
- [ ] 最新バージョン取得が動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-05-03: 履歴/ログ表示UIコンポーネント

---

## 9. 参照情報

- CONV-04-02: files/conversions テーブル
- CONV-05-01: ログ記録サービス
- CONV-05: 履歴/ログ管理（親タスク）
