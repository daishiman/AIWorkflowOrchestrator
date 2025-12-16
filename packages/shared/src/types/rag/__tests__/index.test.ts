/**
 * @file バレルエクスポートのテスト
 * @description index.tsからの全エクスポートが正しく機能することを確認
 * @taskId CONV-03-01
 * @subtask T-04-6
 */

import { describe, it, expect } from "vitest";
import {
  // Result型
  ok,
  err,
  isOk,
  isErr,
  map,
  flatMap,
  mapErr,
  all,
  type Result,
  // Branded Types
  createFileId,
  createChunkId,
  createConversionId,
  createEntityId,
  createRelationId,
  createCommunityId,
  createEmbeddingId,
  generateUUID,
  generateFileId,
  generateChunkId,
  generateConversionId,
  generateEntityId,
  generateRelationId,
  generateCommunityId,
  generateEmbeddingId,
  type FileId,
  type ChunkId,
  // エラー型
  ErrorCodes,
  createRAGError,
  type RAGError,
  // インターフェース
  type Timestamped,
  type WithMetadata,
  type PaginationParams,
  type AsyncStatus,
  // Zodスキーマ
  uuidSchema,
  timestampedSchema,
  metadataSchema,
  paginationParamsSchema,
  asyncStatusSchema,
  errorCodeSchema,
  ragErrorSchema,
  type PaginationParamsSchema,
} from "../index";

describe("バレルエクスポート (index.ts)", () => {
  describe("Result型エクスポート", () => {
    it("ok, err, isOk, isErr がエクスポートされていること", () => {
      expect(ok).toBeDefined();
      expect(err).toBeDefined();
      expect(isOk).toBeDefined();
      expect(isErr).toBeDefined();
    });

    it("map, flatMap, mapErr, all がエクスポートされていること", () => {
      expect(map).toBeDefined();
      expect(flatMap).toBeDefined();
      expect(mapErr).toBeDefined();
      expect(all).toBeDefined();
    });

    it("Result型が正しく動作すること", () => {
      const success: Result<number, string> = ok(42);
      const failure: Result<number, string> = err("error");

      expect(isOk(success)).toBe(true);
      expect(isErr(failure)).toBe(true);
    });
  });

  describe("Branded Typesエクスポート", () => {
    it("create関数がエクスポートされていること", () => {
      expect(createFileId).toBeDefined();
      expect(createChunkId).toBeDefined();
      expect(createConversionId).toBeDefined();
      expect(createEntityId).toBeDefined();
      expect(createRelationId).toBeDefined();
      expect(createCommunityId).toBeDefined();
      expect(createEmbeddingId).toBeDefined();
    });

    it("generate関数がエクスポートされていること", () => {
      expect(generateUUID).toBeDefined();
      expect(generateFileId).toBeDefined();
      expect(generateChunkId).toBeDefined();
      expect(generateConversionId).toBeDefined();
      expect(generateEntityId).toBeDefined();
      expect(generateRelationId).toBeDefined();
      expect(generateCommunityId).toBeDefined();
      expect(generateEmbeddingId).toBeDefined();
    });

    it("ID型が正しく動作すること", () => {
      const fileId: FileId = createFileId("test-file-id");
      const chunkId: ChunkId = createChunkId("test-chunk-id");
      expect(fileId).toBe("test-file-id");
      expect(chunkId).toBe("test-chunk-id");
    });
  });

  describe("エラー型エクスポート", () => {
    it("ErrorCodesがエクスポートされていること", () => {
      expect(ErrorCodes).toBeDefined();
      expect(ErrorCodes.FILE_NOT_FOUND).toBe("FILE_NOT_FOUND");
    });

    it("createRAGErrorがエクスポートされていること", () => {
      expect(createRAGError).toBeDefined();
    });

    it("RAGErrorが正しく動作すること", () => {
      const error: RAGError = createRAGError(
        ErrorCodes.FILE_NOT_FOUND,
        "File not found",
      );
      expect(error.code).toBe("FILE_NOT_FOUND");
      expect(error.message).toBe("File not found");
    });
  });

  describe("インターフェースエクスポート", () => {
    it("Timestamped型が使用可能であること", () => {
      const entity: Timestamped = {
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(entity.createdAt).toBeInstanceOf(Date);
    });

    it("WithMetadata型が使用可能であること", () => {
      const entity: WithMetadata = {
        metadata: { key: "value" },
      };
      expect(entity.metadata.key).toBe("value");
    });

    it("PaginationParams型が使用可能であること", () => {
      const params: PaginationParams = {
        limit: 20,
        offset: 0,
      };
      expect(params.limit).toBe(20);
    });

    it("AsyncStatus型が使用可能であること", () => {
      const status: AsyncStatus = "processing";
      expect(status).toBe("processing");
    });
  });

  describe("Zodスキーマエクスポート", () => {
    it("スキーマがエクスポートされていること", () => {
      expect(uuidSchema).toBeDefined();
      expect(timestampedSchema).toBeDefined();
      expect(metadataSchema).toBeDefined();
      expect(paginationParamsSchema).toBeDefined();
      expect(asyncStatusSchema).toBeDefined();
      expect(errorCodeSchema).toBeDefined();
      expect(ragErrorSchema).toBeDefined();
    });

    it("スキーマが正しく動作すること", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = uuidSchema.safeParse(uuid);
      expect(result.success).toBe(true);
    });

    it("スキーマから推論された型が使用可能であること", () => {
      const params: PaginationParamsSchema = {
        limit: 10,
        offset: 0,
      };
      expect(params.limit).toBe(10);
    });
  });

  describe("統合テスト", () => {
    it("複数のエクスポートを組み合わせて使用できること", () => {
      // FileIdを生成
      const _fileId = generateFileId();

      // RAGErrorを作成
      const error = createRAGError(ErrorCodes.FILE_NOT_FOUND, "File not found");

      // Resultで包む
      const result: Result<FileId, RAGError> = err(error);

      // 検証
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe("FILE_NOT_FOUND");
      }
    });

    it("型とスキーマを組み合わせて使用できること", () => {
      // スキーマでバリデーション
      const validUUID = "550e8400-e29b-41d4-a716-446655440000";
      const parseResult = uuidSchema.safeParse(validUUID);

      if (parseResult.success) {
        // バリデーション成功後にBranded型に変換
        const fileId: FileId = createFileId(parseResult.data);
        expect(typeof fileId).toBe("string");
      }
    });
  });
});
