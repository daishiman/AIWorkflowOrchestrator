# Validation Path - Phase 2

## SEP-01〜SEP-09 の対象・所属マップ

実態ベース（4メソッド）に適応した再マッピング。

### `LateChunkingService` 単体テスト (SEP-01〜SEP-07)

| テスト ID | 対象メソッド                                     | 入力条件                                                       | 期待動作                                                                            | テストファイル                                                                               |
| --------- | ------------------------------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| SEP-01    | `LateChunkingService.applyLateChunking()`        | 単一チャンク、`pooling="mean"`、`embeddingClient.embed` モック | 返り値 `chunks[0].metadata.lateChunking.applied === true`、`embeddingDimension > 0` | `packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts` |
| SEP-02    | `LateChunkingService.applyLateChunking()`        | 複数チャンク、`pooling="cls"`                                  | 各チャンクで `applied=true` かつ `embeddingDimension > 0`                           | 同上                                                                                         |
| SEP-03    | `LateChunkingService.determineChunkBoundaries()` | `chunks[0].position.end=10`, `chunks[1].position.end=20`       | `[10, 20]` を返す                                                                   | 同上                                                                                         |
| SEP-04    | `LateChunkingService.determineChunkBoundaries()` | 空配列                                                         | `[]` を返す                                                                         | 同上                                                                                         |
| SEP-05    | `LateChunkingService.poolTokenEmbeddings()`      | `strategy="mean"`、埋め込み3件                                 | 戦略別ロジックを通過して埋め込み配列を返す（現状の簡略化実装を維持）                | 同上                                                                                         |
| SEP-06    | `LateChunkingService.poolTokenEmbeddings()`      | `strategy="cls"`                                               | 戦略別ロジックを通過                                                                | 同上                                                                                         |
| SEP-07    | `LateChunkingService.poolTokenEmbeddings()`      | `strategy="attention"`                                         | 戦略別ロジックを通過                                                                | 同上                                                                                         |

### `ChunkingService` 委譲確認テスト (SEP-08〜SEP-09)

| テスト ID | 対象                      | 入力条件                                                                                   | 期待動作                                                    | テストファイル                                                                         |
| --------- | ------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| SEP-08    | `ChunkingService.chunk()` | `input.advanced.lateChunking.enabled=true`、DI 注入した mock の `applyLateChunking` が存在 | `mockLateChunkingService.applyLateChunking` が 1 回呼ばれる | `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` |
| SEP-09    | `ChunkingService.chunk()` | `input.advanced.lateChunking.enabled=false`                                                | `mockLateChunkingService.applyLateChunking` が呼ばれない    | 同上                                                                                   |

## モック実装雛型

```typescript
// packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LateChunkingService } from "../LateChunkingService";
import type {
  ITokenizer,
  IEmbeddingClient,
} from "../../../chunking/interfaces";
import type { Chunk, LateChunkingOptions } from "../../../chunking/types";

class MockTokenizer implements ITokenizer {
  encode(text: string): number[] {
    return Array.from({ length: text.length }, (_, i) => i + 1);
  }
  decode(tokens: number[]): string {
    return tokens.map((id) => String.fromCharCode(64 + (id % 26))).join("");
  }
  countTokens(text: string): number {
    return text.length;
  }
}

class MockEmbeddingClient implements IEmbeddingClient {
  async embed(_text: string): Promise<number[]> {
    return [0.1, 0.2, 0.3];
  }
  async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map(() => [0.1, 0.2, 0.3]);
  }
}

describe("LateChunkingService", () => {
  let tokenizer: MockTokenizer;
  let embeddingClient: MockEmbeddingClient;
  let service: LateChunkingService;

  beforeEach(() => {
    tokenizer = new MockTokenizer();
    embeddingClient = new MockEmbeddingClient();
    service = new LateChunkingService(tokenizer, embeddingClient);
  });

  const baseOptions: LateChunkingOptions = {
    enabled: true,
    embeddingModel: "mock",
    chunkBoundaries: "token",
    maxSequenceLength: 512,
    poolingStrategy: "mean",
  };

  describe("applyLateChunking", () => {
    it("SEP-01: 単一チャンク・mean pooling で applied=true を返す", async () => {
      const chunks: Chunk[] = [
        {
          id: "c1",
          content: "hello",
          tokenCount: 5,
          position: { start: 0, end: 5 },
          metadata: { strategy: "fixed" },
        },
      ];
      const result = await service.applyLateChunking(
        "hello",
        chunks,
        baseOptions,
      );
      expect(result[0].metadata.lateChunking?.applied).toBe(true);
      expect(
        result[0].metadata.lateChunking?.embeddingDimension,
      ).toBeGreaterThan(0);
    });

    it("SEP-02: 複数チャンク・cls pooling で各チャンクの embeddingDimension > 0", async () => {
      const chunks: Chunk[] = [
        {
          id: "c1",
          content: "a",
          tokenCount: 1,
          position: { start: 0, end: 1 },
          metadata: { strategy: "fixed" },
        },
        {
          id: "c2",
          content: "b",
          tokenCount: 1,
          position: { start: 1, end: 2 },
          metadata: { strategy: "fixed" },
        },
      ];
      const result = await service.applyLateChunking("ab", chunks, {
        ...baseOptions,
        poolingStrategy: "cls",
      });
      expect(
        result.every(
          (c) => (c.metadata.lateChunking?.embeddingDimension ?? 0) > 0,
        ),
      ).toBe(true);
    });
  });

  describe("determineChunkBoundaries", () => {
    it("SEP-03: 複数チャンクで position.end の配列を返す", () => {
      const chunks: Chunk[] = [
        {
          id: "c1",
          content: "a",
          tokenCount: 1,
          position: { start: 0, end: 10 },
          metadata: { strategy: "fixed" },
        },
        {
          id: "c2",
          content: "b",
          tokenCount: 1,
          position: { start: 10, end: 20 },
          metadata: { strategy: "fixed" },
        },
      ];
      expect(service.determineChunkBoundaries(chunks)).toEqual([10, 20]);
    });

    it("SEP-04: 空配列で空配列を返す", () => {
      expect(service.determineChunkBoundaries([])).toEqual([]);
    });
  });

  describe("poolTokenEmbeddings", () => {
    const embeddings = [
      [0.1, 0.2],
      [0.3, 0.4],
    ];
    const boundaries = [1, 2];

    it("SEP-05: strategy=mean で配列を返す", () => {
      expect(
        service.poolTokenEmbeddings(embeddings, boundaries, "mean"),
      ).toEqual(embeddings);
    });
    it("SEP-06: strategy=cls で配列を返す", () => {
      expect(
        service.poolTokenEmbeddings(embeddings, boundaries, "cls"),
      ).toEqual(embeddings);
    });
    it("SEP-07: strategy=attention で配列を返す", () => {
      expect(
        service.poolTokenEmbeddings(embeddings, boundaries, "attention"),
      ).toEqual(embeddings);
    });
  });
});
```

## `ChunkingService` 委譲テスト雛型（SEP-08/SEP-09）

```typescript
// packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts（追加セクション）
describe("ChunkingService → LateChunkingService 委譲", () => {
  it("SEP-08: lateChunking.enabled=true で applyLateChunking が 1 回呼ばれる", async () => {
    const mockLate = {
      applyLateChunking: vi.fn().mockImplementation(async (_t, cs) => cs),
    } as unknown as LateChunkingService;
    const service = new ChunkingService(
      tokenizer,
      embeddingClient,
      undefined,
      mockLate,
    );
    await service.chunk({
      text: "hello world",
      strategy: "fixed",
      options: { chunkSize: 10 },
      advanced: { lateChunking: { ...baseLateOptions, enabled: true } },
    });
    expect(mockLate.applyLateChunking).toHaveBeenCalledTimes(1);
  });

  it("SEP-09: lateChunking.enabled=false で applyLateChunking が呼ばれない", async () => {
    const mockLate = {
      applyLateChunking: vi.fn(),
    } as unknown as LateChunkingService;
    const service = new ChunkingService(
      tokenizer,
      embeddingClient,
      undefined,
      mockLate,
    );
    await service.chunk({
      text: "hello world",
      strategy: "fixed",
      options: { chunkSize: 10 },
    });
    expect(mockLate.applyLateChunking).not.toHaveBeenCalled();
  });
});
```

## 検証導線チェック

1. `chunking-service.ts` L358-L450 の 4 メソッドを Phase 1 inventory と照合する → 完了
2. `LateChunkingService` コンストラクタの DI 契約を明示 → `constructor-signature.md`
3. `ChunkingService` コンストラクタ第 4 引数のオプショナル性を確認 → `constructor-signature.md` の既定挙動表
4. 一方向参照が成立するか → `solution-design.md` の参照方向マップ
5. SEP-01〜SEP-09 の入力条件・期待動作を command 単位で定義 → 本ファイル

## Phase 4 への引き渡し事項

- SEP-01〜SEP-09 のテストシナリオ（本ファイルの表）
- モック雛型（`MockTokenizer`、`MockEmbeddingClient`）
- `LateChunkingOptions` のベース値 (`baseOptions`)
