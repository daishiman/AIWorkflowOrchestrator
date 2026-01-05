/**
 * @file Branded Types（ID型）のテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @taskId CONV-03-01
 * @subtask T-03-2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  // 型
  type Brand,
  type FileId,
  type ChunkId,
  // 型キャスト関数
  createFileId,
  createChunkId,
  createConversionId,
  createEntityId,
  createRelationId,
  createCommunityId,
  createEmbeddingId,
  // UUID生成関数
  generateUUID,
  generateFileId,
  generateChunkId,
  generateConversionId,
  generateEntityId,
  generateRelationId,
  generateCommunityId,
  generateEmbeddingId,
} from "../branded";

// =============================================================================
// 1. Brand型基盤のテスト
// =============================================================================

describe("Brand型基盤", () => {
  describe("Brand<T, B>型", () => {
    it("文字列ベースのBranded型を作成できること", () => {
      // Brand型はコンパイル時のみ存在し、実行時は基底型と同じ
      const id = "test-id" as Brand<string, "TestId">;
      expect(id).toBe("test-id");
      expect(typeof id).toBe("string");
    });

    it("数値ベースのBranded型を作成できること", () => {
      type NumericId = Brand<number, "NumericId">;
      const id = 42 as NumericId;
      expect(id).toBe(42);
      expect(typeof id).toBe("number");
    });

    it("異なるブランドを持つ型は互換性がないこと（型システムレベル）", () => {
      // このテストはコンパイル時に型チェックされる
      // 実行時は両方とも単なる文字列として扱われる
      const fileId = "id-1" as FileId;
      const chunkId = "id-2" as ChunkId;

      // 実行時は両方とも文字列
      expect(typeof fileId).toBe("string");
      expect(typeof chunkId).toBe("string");

      // 値としては異なる
      expect(fileId).not.toBe(chunkId);
    });
  });
});

// =============================================================================
// 2. ID型定義のテスト
// =============================================================================

describe("ID型定義", () => {
  describe("FileId", () => {
    it("文字列ベースの型であること", () => {
      const id = createFileId("file-123");
      expect(typeof id).toBe("string");
    });

    it("UUID形式の値を保持できること", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const id = createFileId(uuid);
      expect(id).toBe(uuid);
    });
  });

  describe("ChunkId", () => {
    it("文字列ベースの型であること", () => {
      const id = createChunkId("chunk-456");
      expect(typeof id).toBe("string");
    });
  });

  describe("ConversionId", () => {
    it("文字列ベースの型であること", () => {
      const id = createConversionId("conv-789");
      expect(typeof id).toBe("string");
    });
  });

  describe("EntityId", () => {
    it("文字列ベースの型であること", () => {
      const id = createEntityId("entity-abc");
      expect(typeof id).toBe("string");
    });
  });

  describe("RelationId", () => {
    it("文字列ベースの型であること", () => {
      const id = createRelationId("rel-def");
      expect(typeof id).toBe("string");
    });
  });

  describe("CommunityId", () => {
    it("文字列ベースの型であること", () => {
      const id = createCommunityId("comm-ghi");
      expect(typeof id).toBe("string");
    });
  });

  describe("EmbeddingId", () => {
    it("文字列ベースの型であること", () => {
      const id = createEmbeddingId("emb-jkl");
      expect(typeof id).toBe("string");
    });
  });
});

// =============================================================================
// 3. 型キャスト関数のテスト
// =============================================================================

describe("型キャスト関数", () => {
  describe("createFileId()", () => {
    it("文字列をFileIdに変換すること", () => {
      const id = createFileId("test-file-id");
      expect(id).toBe("test-file-id");
    });

    it("UUID文字列を正しく変換すること", () => {
      const uuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
      const id = createFileId(uuid);
      expect(id).toBe(uuid);
    });

    it("空文字列も変換できること", () => {
      const id = createFileId("");
      expect(id).toBe("");
    });

    it("特殊文字を含む文字列も変換できること", () => {
      const id = createFileId("file/path:name#special");
      expect(id).toBe("file/path:name#special");
    });
  });

  describe("createChunkId()", () => {
    it("文字列をChunkIdに変換すること", () => {
      const id = createChunkId("chunk-001");
      expect(id).toBe("chunk-001");
    });

    it("複数回呼び出しても同じ入力には同じ出力を返すこと", () => {
      const input = "same-id";
      const id1 = createChunkId(input);
      const id2 = createChunkId(input);
      expect(id1).toBe(id2);
    });
  });

  describe("createConversionId()", () => {
    it("文字列をConversionIdに変換すること", () => {
      const id = createConversionId("conversion-123");
      expect(id).toBe("conversion-123");
    });
  });

  describe("createEntityId()", () => {
    it("文字列をEntityIdに変換すること", () => {
      const id = createEntityId("entity-456");
      expect(id).toBe("entity-456");
    });
  });

  describe("createRelationId()", () => {
    it("文字列をRelationIdに変換すること", () => {
      const id = createRelationId("relation-789");
      expect(id).toBe("relation-789");
    });
  });

  describe("createCommunityId()", () => {
    it("文字列をCommunityIdに変換すること", () => {
      const id = createCommunityId("community-abc");
      expect(id).toBe("community-abc");
    });
  });

  describe("createEmbeddingId()", () => {
    it("文字列をEmbeddingIdに変換すること", () => {
      const id = createEmbeddingId("embedding-def");
      expect(id).toBe("embedding-def");
    });
  });
});

// =============================================================================
// 4. UUID生成関数のテスト
// =============================================================================

describe("UUID生成関数", () => {
  // UUID v4の正規表現パターン
  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  describe("generateUUID()", () => {
    it("UUID v4形式の文字列を生成すること", () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(UUID_PATTERN);
    });

    it("毎回異なるUUIDを生成すること", () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      const uuid3 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
      expect(uuid2).not.toBe(uuid3);
      expect(uuid1).not.toBe(uuid3);
    });

    it("36文字の文字列を返すこと", () => {
      const uuid = generateUUID();
      expect(uuid.length).toBe(36);
    });

    it("小文字のUUIDを返すこと", () => {
      const uuid = generateUUID();
      expect(uuid).toBe(uuid.toLowerCase());
    });
  });

  describe("generateFileId()", () => {
    it("UUID形式のFileIdを生成すること", () => {
      const id = generateFileId();
      expect(id).toMatch(UUID_PATTERN);
    });

    it("毎回異なるFileIdを生成すること", () => {
      const id1 = generateFileId();
      const id2 = generateFileId();
      expect(id1).not.toBe(id2);
    });

    it("生成されたIDは文字列型であること", () => {
      const id = generateFileId();
      expect(typeof id).toBe("string");
    });
  });

  describe("generateChunkId()", () => {
    it("UUID形式のChunkIdを生成すること", () => {
      const id = generateChunkId();
      expect(id).toMatch(UUID_PATTERN);
    });

    it("毎回異なるChunkIdを生成すること", () => {
      const id1 = generateChunkId();
      const id2 = generateChunkId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateConversionId()", () => {
    it("UUID形式のConversionIdを生成すること", () => {
      const id = generateConversionId();
      expect(id).toMatch(UUID_PATTERN);
    });

    it("毎回異なるConversionIdを生成すること", () => {
      const id1 = generateConversionId();
      const id2 = generateConversionId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateEntityId()", () => {
    it("UUID形式のEntityIdを生成すること", () => {
      const id = generateEntityId();
      expect(id).toMatch(UUID_PATTERN);
    });

    it("毎回異なるEntityIdを生成すること", () => {
      const id1 = generateEntityId();
      const id2 = generateEntityId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateRelationId()", () => {
    it("UUID形式のRelationIdを生成すること", () => {
      const id = generateRelationId();
      expect(id).toMatch(UUID_PATTERN);
    });

    it("毎回異なるRelationIdを生成すること", () => {
      const id1 = generateRelationId();
      const id2 = generateRelationId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateCommunityId()", () => {
    it("UUID形式のCommunityIdを生成すること", () => {
      const id = generateCommunityId();
      expect(id).toMatch(UUID_PATTERN);
    });

    it("毎回異なるCommunityIdを生成すること", () => {
      const id1 = generateCommunityId();
      const id2 = generateCommunityId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateEmbeddingId()", () => {
    it("UUID形式のEmbeddingIdを生成すること", () => {
      const id = generateEmbeddingId();
      expect(id).toMatch(UUID_PATTERN);
    });

    it("毎回異なるEmbeddingIdを生成すること", () => {
      const id1 = generateEmbeddingId();
      const id2 = generateEmbeddingId();
      expect(id1).not.toBe(id2);
    });
  });
});

// =============================================================================
// 5. 型安全性のテスト
// =============================================================================

describe("型安全性", () => {
  describe("異なるID型の区別", () => {
    it("異なるID型は実行時には区別できないが、TypeScriptの型システムでは区別されること", () => {
      // 実行時は両方とも単なる文字列
      const fileId = createFileId("same-uuid");
      const chunkId = createChunkId("same-uuid");

      // 実行時の値は同じ
      expect(fileId).toBe(chunkId);

      // しかし型システムでは異なる型として扱われる
      // （コンパイル時のみの検証 - このテストはドキュメントとして機能）
      type _FileIdType = typeof fileId;
      type _ChunkIdType = typeof chunkId;

      // 型レベルでは FileId ≠ ChunkId だが、実行時には検証不可
      expect(true).toBe(true); // プレースホルダー
    });

    it("生成関数で作成したIDも型として区別されること", () => {
      const fileId = generateFileId();
      const chunkId = generateChunkId();

      // 異なるUUIDが生成される
      expect(fileId).not.toBe(chunkId);

      // どちらも文字列型
      expect(typeof fileId).toBe("string");
      expect(typeof chunkId).toBe("string");
    });
  });

  describe("ID型のコレクション操作", () => {
    it("同じID型の配列を作成できること", () => {
      const fileIds: FileId[] = [
        generateFileId(),
        generateFileId(),
        generateFileId(),
      ];

      expect(fileIds).toHaveLength(3);
      expect(fileIds.every((id) => typeof id === "string")).toBe(true);
    });

    it("Setでの重複チェックが機能すること", () => {
      const id = createFileId("unique-id");
      const idSet = new Set<FileId>();

      idSet.add(id);
      idSet.add(id); // 同じIDを追加

      expect(idSet.size).toBe(1);
    });

    it("Mapのキーとして使用できること", () => {
      const fileId = generateFileId();
      const map = new Map<FileId, string>();

      map.set(fileId, "test-value");

      expect(map.get(fileId)).toBe("test-value");
      expect(map.has(fileId)).toBe(true);
    });
  });

  describe("ID型の比較", () => {
    it("同じ文字列から作成したIDは等しいこと", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const id1 = createFileId(uuid);
      const id2 = createFileId(uuid);

      expect(id1).toBe(id2);
      expect(id1 === id2).toBe(true);
    });

    it("異なる文字列から作成したIDは等しくないこと", () => {
      const id1 = createFileId("uuid-1");
      const id2 = createFileId("uuid-2");

      expect(id1).not.toBe(id2);
      expect(id1 === id2).toBe(false);
    });

    it("文字列との比較が機能すること", () => {
      const uuid = "test-uuid";
      const id = createFileId(uuid);

      // ID型は実行時には文字列なので、文字列との比較が可能
      expect(id === uuid).toBe(true);
      expect(id).toBe(uuid);
    });
  });
});

// =============================================================================
// 6. エッジケースのテスト
// =============================================================================

describe("エッジケース", () => {
  describe("特殊な入力値", () => {
    it("非常に長い文字列でもIDを作成できること", () => {
      const longString = "a".repeat(1000);
      const id = createFileId(longString);
      expect(id).toBe(longString);
      expect(id.length).toBe(1000);
    });

    it("Unicode文字を含む文字列でもIDを作成できること", () => {
      const unicodeString = "日本語ID-🎉-emoji";
      const id = createFileId(unicodeString);
      expect(id).toBe(unicodeString);
    });

    it("空白のみの文字列でもIDを作成できること", () => {
      const id = createFileId("   ");
      expect(id).toBe("   ");
    });

    it("改行を含む文字列でもIDを作成できること", () => {
      const id = createFileId("line1\nline2");
      expect(id).toBe("line1\nline2");
    });
  });

  describe("パフォーマンス関連", () => {
    it("大量のID生成が可能であること", () => {
      const count = 1000;
      const ids: FileId[] = [];

      for (let i = 0; i < count; i++) {
        ids.push(generateFileId());
      }

      expect(ids).toHaveLength(count);

      // 全てユニークであることを確認
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(count);
    });

    it("ID生成がブロッキングしないこと", () => {
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        generateFileId();
      }
      const elapsed = Date.now() - start;

      // 100個のID生成が1秒以内に完了すること
      expect(elapsed).toBeLessThan(1000);
    });
  });

  describe("型変換の一貫性", () => {
    it("create後のIDはtoString()で元の文字列を返すこと", () => {
      const original = "test-id-123";
      const id = createFileId(original);
      expect(id.toString()).toBe(original);
    });

    it("JSON.stringify()で正しくシリアライズされること", () => {
      const id = createFileId("json-test-id");
      const json = JSON.stringify({ id });
      expect(json).toBe('{"id":"json-test-id"}');
    });

    it("JSON.parse()で復元された値はcreate関数で再変換可能であること", () => {
      const originalId = generateFileId();
      const json = JSON.stringify({ id: originalId });
      const parsed = JSON.parse(json);
      const restoredId = createFileId(parsed.id);

      expect(restoredId).toBe(originalId);
    });
  });
});

// =============================================================================
// 7. モック/スパイを使用したテスト
// =============================================================================

describe("crypto.randomUUID()のモック", () => {
  let originalRandomUUID: typeof crypto.randomUUID;

  beforeEach(() => {
    // crypto.randomUUIDをモック
    originalRandomUUID = crypto.randomUUID;
  });

  afterEach(() => {
    // 元に戻す
    crypto.randomUUID = originalRandomUUID;
  });

  it("generateUUIDがcrypto.randomUUIDを使用していること", () => {
    const mockUUID = "mocked-uuid-1234-5678-9abc-def012345678";
    const mockRandomUUID = vi.fn(() => mockUUID);
    crypto.randomUUID = mockRandomUUID;

    const result = generateUUID();

    expect(mockRandomUUID).toHaveBeenCalled();
    expect(result).toBe(mockUUID);
  });

  it("各generateXxxId関数がgenerateUUIDを経由していること", () => {
    let callCount = 0;
    const mockRandomUUID = vi.fn(() => `mock-uuid-${++callCount}`);
    crypto.randomUUID = mockRandomUUID;

    const fileId = generateFileId();
    const chunkId = generateChunkId();
    const entityId = generateEntityId();

    expect(mockRandomUUID).toHaveBeenCalledTimes(3);
    expect(fileId).toBe("mock-uuid-1");
    expect(chunkId).toBe("mock-uuid-2");
    expect(entityId).toBe("mock-uuid-3");
  });
});

// =============================================================================
// 8. 型推論のテスト（コンパイル時チェック）
// =============================================================================

describe("型推論", () => {
  it("createFileIdの戻り値型がFileIdであること", () => {
    const id = createFileId("test");
    // TypeScriptコンパイラが型を検証
    // 実行時は単に値を確認
    expect(id).toBe("test");
  });

  it("generateFileIdの戻り値型がFileIdであること", () => {
    const id = generateFileId();
    expect(typeof id).toBe("string");
  });

  it("ID型は文字列メソッドを使用できること", () => {
    const id = createFileId("TEST-ID");

    expect(id.toLowerCase()).toBe("test-id");
    expect(id.toUpperCase()).toBe("TEST-ID");
    expect(id.includes("-")).toBe(true);
    expect(id.split("-")).toEqual(["TEST", "ID"]);
    expect(id.startsWith("TEST")).toBe(true);
    expect(id.endsWith("ID")).toBe(true);
  });
});
