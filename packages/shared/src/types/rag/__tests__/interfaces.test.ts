/**
 * @file インターフェースのテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @taskId CONV-03-01
 * @subtask T-03-3
 */

import { describe, it, expect } from "vitest";
import type {
  Timestamped,
  WithMetadata,
  PaginationParams,
  PaginatedResult,
  AsyncStatus,
  Repository,
  Converter,
  SearchStrategy,
} from "../interfaces";
import type { Result } from "../result";
import type { RAGError } from "../errors";
import { ok, err, isOk, isErr } from "../result";
import { createRAGError, ErrorCodes } from "../errors";

// =============================================================================
// 1. Timestamped インターフェースのテスト
// =============================================================================

describe("Timestamped", () => {
  it("createdAtとupdatedAtを持つオブジェクトを作成できること", () => {
    const now = new Date();
    const entity: Timestamped = {
      createdAt: now,
      updatedAt: now,
    };

    expect(entity.createdAt).toBe(now);
    expect(entity.updatedAt).toBe(now);
  });

  it("createdAtとupdatedAtが異なる値を持てること", () => {
    const created = new Date("2025-01-01T00:00:00Z");
    const updated = new Date("2025-12-16T12:00:00Z");
    const entity: Timestamped = {
      createdAt: created,
      updatedAt: updated,
    };

    expect(entity.createdAt.getTime()).toBeLessThan(entity.updatedAt.getTime());
  });

  it("他のプロパティと組み合わせて使用できること", () => {
    interface TimestampedEntity extends Timestamped {
      id: string;
      name: string;
    }

    const entity: TimestampedEntity = {
      id: "entity-123",
      name: "Test Entity",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(entity.id).toBe("entity-123");
    expect(entity.createdAt).toBeInstanceOf(Date);
  });
});

// =============================================================================
// 2. WithMetadata インターフェースのテスト
// =============================================================================

describe("WithMetadata", () => {
  it("metadataを持つオブジェクトを作成できること", () => {
    const entity: WithMetadata = {
      metadata: { key: "value" },
    };

    expect(entity.metadata.key).toBe("value");
  });

  it("空のmetadataを持てること", () => {
    const entity: WithMetadata = {
      metadata: {},
    };

    expect(Object.keys(entity.metadata)).toHaveLength(0);
  });

  it("任意の型の値をmetadataに格納できること", () => {
    const entity: WithMetadata = {
      metadata: {
        stringValue: "text",
        numberValue: 42,
        boolValue: true,
        arrayValue: [1, 2, 3],
        nestedValue: { inner: "value" },
        nullValue: null,
      },
    };

    expect(entity.metadata.stringValue).toBe("text");
    expect(entity.metadata.numberValue).toBe(42);
    expect(entity.metadata.arrayValue).toEqual([1, 2, 3]);
  });

  it("TimestampedとWithMetadataを組み合わせて使用できること", () => {
    interface FullEntity extends Timestamped, WithMetadata {
      id: string;
    }

    const entity: FullEntity = {
      id: "full-entity-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: { source: "test" },
    };

    expect(entity.id).toBe("full-entity-123");
    expect(entity.metadata.source).toBe("test");
    expect(entity.createdAt).toBeInstanceOf(Date);
  });
});

// =============================================================================
// 3. PaginationParams インターフェースのテスト
// =============================================================================

describe("PaginationParams", () => {
  it("limitとoffsetを持つオブジェクトを作成できること", () => {
    const params: PaginationParams = {
      limit: 20,
      offset: 0,
    };

    expect(params.limit).toBe(20);
    expect(params.offset).toBe(0);
  });

  it("最小値のパラメータを持てること", () => {
    const params: PaginationParams = {
      limit: 1,
      offset: 0,
    };

    expect(params.limit).toBe(1);
    expect(params.offset).toBe(0);
  });

  it("最大値のパラメータを持てること", () => {
    const params: PaginationParams = {
      limit: 100,
      offset: 1000,
    };

    expect(params.limit).toBe(100);
    expect(params.offset).toBe(1000);
  });

  it("ページ計算に使用できること", () => {
    const params: PaginationParams = {
      limit: 20,
      offset: 40,
    };

    const currentPage = Math.floor(params.offset / params.limit) + 1;
    expect(currentPage).toBe(3);
  });
});

// =============================================================================
// 4. PaginatedResult インターフェースのテスト
// =============================================================================

describe("PaginatedResult", () => {
  it("ページネーション結果を作成できること", () => {
    const result: PaginatedResult<{ id: string }> = {
      items: [{ id: "1" }, { id: "2" }, { id: "3" }],
      total: 100,
      limit: 20,
      offset: 0,
      hasMore: true,
    };

    expect(result.items).toHaveLength(3);
    expect(result.total).toBe(100);
    expect(result.hasMore).toBe(true);
  });

  it("空の結果を表現できること", () => {
    const result: PaginatedResult<string> = {
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
      hasMore: false,
    };

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it("最後のページを表現できること", () => {
    const result: PaginatedResult<number> = {
      items: [91, 92, 93, 94, 95],
      total: 95,
      limit: 20,
      offset: 80,
      hasMore: false,
    };

    expect(result.items).toHaveLength(5);
    expect(result.hasMore).toBe(false);
  });

  it("hasMoreが正しく計算できること", () => {
    const createResult = <T>(
      items: T[],
      total: number,
      limit: number,
      offset: number,
    ): PaginatedResult<T> => ({
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    });

    const result1 = createResult([1, 2, 3], 100, 20, 0);
    expect(result1.hasMore).toBe(true);

    const result2 = createResult([1, 2, 3], 3, 20, 0);
    expect(result2.hasMore).toBe(false);
  });

  it("複雑なオブジェクト型のitemsを持てること", () => {
    interface User {
      id: string;
      name: string;
      email: string;
    }

    const result: PaginatedResult<User> = {
      items: [
        { id: "1", name: "Alice", email: "alice@example.com" },
        { id: "2", name: "Bob", email: "bob@example.com" },
      ],
      total: 2,
      limit: 20,
      offset: 0,
      hasMore: false,
    };

    expect(result.items[0].name).toBe("Alice");
    expect(result.items[1].email).toBe("bob@example.com");
  });
});

// =============================================================================
// 5. AsyncStatus 型のテスト
// =============================================================================

describe("AsyncStatus", () => {
  it("pendingステータスを使用できること", () => {
    const status: AsyncStatus = "pending";
    expect(status).toBe("pending");
  });

  it("processingステータスを使用できること", () => {
    const status: AsyncStatus = "processing";
    expect(status).toBe("processing");
  });

  it("completedステータスを使用できること", () => {
    const status: AsyncStatus = "completed";
    expect(status).toBe("completed");
  });

  it("failedステータスを使用できること", () => {
    const status: AsyncStatus = "failed";
    expect(status).toBe("failed");
  });

  it("ステータス遷移を表現できること", () => {
    const statuses: AsyncStatus[] = ["pending", "processing", "completed"];

    expect(statuses).toHaveLength(3);
    expect(statuses[0]).toBe("pending");
    expect(statuses[2]).toBe("completed");
  });

  it("条件分岐で使用できること", () => {
    const getStatusMessage = (status: AsyncStatus): string => {
      switch (status) {
        case "pending":
          return "Waiting to start";
        case "processing":
          return "In progress";
        case "completed":
          return "Done";
        case "failed":
          return "Error occurred";
      }
    };

    expect(getStatusMessage("pending")).toBe("Waiting to start");
    expect(getStatusMessage("completed")).toBe("Done");
    expect(getStatusMessage("failed")).toBe("Error occurred");
  });
});

// =============================================================================
// 6. Repository インターフェースのテスト（モック実装）
// =============================================================================

describe("Repository", () => {
  // テスト用のエンティティ型
  interface TestEntity extends Timestamped {
    id: string;
    name: string;
  }

  // モックリポジトリの実装
  const createMockRepository = (): Repository<TestEntity, string> => {
    const storage = new Map<string, TestEntity>();
    const counter = { value: 0 };

    return {
      async findById(id: string): Promise<Result<TestEntity | null, RAGError>> {
        const entity = storage.get(id);
        return ok(entity ?? null);
      },

      async findAll(
        params?: PaginationParams,
      ): Promise<Result<PaginatedResult<TestEntity>, RAGError>> {
        const items = Array.from(storage.values());
        const limit = params?.limit ?? 20;
        const offset = params?.offset ?? 0;
        const sliced = items.slice(offset, offset + limit);

        return ok({
          items: sliced,
          total: items.length,
          limit,
          offset,
          hasMore: offset + sliced.length < items.length,
        });
      },

      async create(
        entity: Omit<TestEntity, "id" | "createdAt" | "updatedAt">,
      ): Promise<Result<TestEntity, RAGError>> {
        const now = new Date();
        counter.value++;
        const newEntity: TestEntity = {
          ...entity,
          id: `entity-${counter.value}`,
          createdAt: now,
          updatedAt: now,
        };
        storage.set(newEntity.id, newEntity);
        return ok(newEntity);
      },

      async update(
        id: string,
        entity: Partial<TestEntity>,
      ): Promise<Result<TestEntity, RAGError>> {
        const existing = storage.get(id);
        if (!existing) {
          return err(
            createRAGError(
              ErrorCodes.RECORD_NOT_FOUND,
              `Entity not found: ${id}`,
            ),
          );
        }
        const updated: TestEntity = {
          ...existing,
          ...entity,
          id: existing.id, // IDは変更不可
          createdAt: existing.createdAt, // createdAtは変更不可
          updatedAt: new Date(),
        };
        storage.set(id, updated);
        return ok(updated);
      },

      async delete(id: string): Promise<Result<void, RAGError>> {
        if (!storage.has(id)) {
          return err(
            createRAGError(
              ErrorCodes.RECORD_NOT_FOUND,
              `Entity not found: ${id}`,
            ),
          );
        }
        storage.delete(id);
        return ok(undefined);
      },
    };
  };

  describe("findById", () => {
    it("存在するエンティティを取得できること", async () => {
      const repo = createMockRepository();
      const createResult = await repo.create({ name: "Test Entity" });

      if (!isOk(createResult)) throw new Error("Create failed");
      const created = createResult.data;

      const findResult = await repo.findById(created.id);
      expect(isOk(findResult)).toBe(true);
      if (isOk(findResult)) {
        expect(findResult.data?.name).toBe("Test Entity");
      }
    });

    it("存在しないエンティティはnullを返すこと", async () => {
      const repo = createMockRepository();
      const result = await repo.findById("non-existent-id");

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe("findAll", () => {
    it("ページネーション付きで全エンティティを取得できること", async () => {
      const repo = createMockRepository();
      await repo.create({ name: "Entity 1" });
      await repo.create({ name: "Entity 2" });
      await repo.create({ name: "Entity 3" });

      const result = await repo.findAll({ limit: 2, offset: 0 });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.items).toHaveLength(2);
        expect(result.data.total).toBe(3);
        expect(result.data.hasMore).toBe(true);
      }
    });

    it("空のリポジトリでは空の結果を返すこと", async () => {
      const repo = createMockRepository();
      const result = await repo.findAll();

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.items).toHaveLength(0);
        expect(result.data.total).toBe(0);
        expect(result.data.hasMore).toBe(false);
      }
    });
  });

  describe("create", () => {
    it("新しいエンティティを作成できること", async () => {
      const repo = createMockRepository();
      const result = await repo.create({ name: "New Entity" });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.name).toBe("New Entity");
        expect(result.data.id).toBeDefined();
        expect(result.data.createdAt).toBeInstanceOf(Date);
        expect(result.data.updatedAt).toBeInstanceOf(Date);
      }
    });

    it("作成されたエンティティはfindByIdで取得できること", async () => {
      const repo = createMockRepository();
      const createResult = await repo.create({ name: "Findable Entity" });

      if (!isOk(createResult)) throw new Error("Create failed");

      const findResult = await repo.findById(createResult.data.id);
      expect(isOk(findResult)).toBe(true);
      if (isOk(findResult)) {
        expect(findResult.data?.name).toBe("Findable Entity");
      }
    });
  });

  describe("update", () => {
    it("既存のエンティティを更新できること", async () => {
      const repo = createMockRepository();
      const createResult = await repo.create({ name: "Original Name" });

      if (!isOk(createResult)) throw new Error("Create failed");

      const updateResult = await repo.update(createResult.data.id, {
        name: "Updated Name",
      });

      expect(isOk(updateResult)).toBe(true);
      if (isOk(updateResult)) {
        expect(updateResult.data.name).toBe("Updated Name");
        expect(updateResult.data.id).toBe(createResult.data.id);
      }
    });

    it("存在しないエンティティの更新はエラーを返すこと", async () => {
      const repo = createMockRepository();
      const result = await repo.update("non-existent-id", { name: "New Name" });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe("RECORD_NOT_FOUND");
      }
    });

    it("更新時にupdatedAtが更新されること", async () => {
      const repo = createMockRepository();
      const createResult = await repo.create({ name: "Entity" });

      if (!isOk(createResult)) throw new Error("Create failed");

      // 少し待ってから更新
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updateResult = await repo.update(createResult.data.id, {
        name: "Updated",
      });

      if (!isOk(updateResult)) throw new Error("Update failed");

      expect(updateResult.data.updatedAt.getTime()).toBeGreaterThanOrEqual(
        createResult.data.updatedAt.getTime(),
      );
    });
  });

  describe("delete", () => {
    it("既存のエンティティを削除できること", async () => {
      const repo = createMockRepository();
      const createResult = await repo.create({ name: "To Delete" });

      if (!isOk(createResult)) throw new Error("Create failed");

      const deleteResult = await repo.delete(createResult.data.id);
      expect(isOk(deleteResult)).toBe(true);

      const findResult = await repo.findById(createResult.data.id);
      if (isOk(findResult)) {
        expect(findResult.data).toBeNull();
      }
    });

    it("存在しないエンティティの削除はエラーを返すこと", async () => {
      const repo = createMockRepository();
      const result = await repo.delete("non-existent-id");

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe("RECORD_NOT_FOUND");
      }
    });
  });
});

// =============================================================================
// 7. Converter インターフェースのテスト（モック実装）
// =============================================================================

describe("Converter", () => {
  // テスト用のコンバーター
  interface TextInput {
    content: string;
    encoding: string;
  }

  interface TextOutput {
    text: string;
    wordCount: number;
  }

  const createMockConverter = (): Converter<TextInput, TextOutput> => ({
    supportedTypes: ["txt", "md", "text"] as const,

    canConvert(input: TextInput): boolean {
      return input.encoding === "utf-8" && input.content.length > 0;
    },

    async convert(input: TextInput): Promise<Result<TextOutput, RAGError>> {
      if (!this.canConvert(input)) {
        return err(
          createRAGError(ErrorCodes.CONVERSION_FAILED, "Cannot convert input"),
        );
      }

      const words = input.content.trim().split(/\s+/);
      return ok({
        text: input.content,
        wordCount: words.length,
      });
    },
  });

  describe("supportedTypes", () => {
    it("サポートするファイル拡張子のリストを返すこと", () => {
      const converter = createMockConverter();
      expect(converter.supportedTypes).toContain("txt");
      expect(converter.supportedTypes).toContain("md");
    });

    it("読み取り専用であること", () => {
      const converter = createMockConverter();
      expect(Array.isArray(converter.supportedTypes)).toBe(true);
    });
  });

  describe("canConvert", () => {
    it("変換可能な入力にtrueを返すこと", () => {
      const converter = createMockConverter();
      const input: TextInput = { content: "Hello", encoding: "utf-8" };
      expect(converter.canConvert(input)).toBe(true);
    });

    it("変換不可能な入力にfalseを返すこと", () => {
      const converter = createMockConverter();

      // 空のcontent
      expect(converter.canConvert({ content: "", encoding: "utf-8" })).toBe(
        false,
      );

      // 非対応のencoding
      expect(
        converter.canConvert({ content: "Hello", encoding: "latin1" }),
      ).toBe(false);
    });
  });

  describe("convert", () => {
    it("正常に変換できること", async () => {
      const converter = createMockConverter();
      const result = await converter.convert({
        content: "Hello World",
        encoding: "utf-8",
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.text).toBe("Hello World");
        expect(result.data.wordCount).toBe(2);
      }
    });

    it("変換失敗時にエラーを返すこと", async () => {
      const converter = createMockConverter();
      const result = await converter.convert({
        content: "",
        encoding: "utf-8",
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe("CONVERSION_FAILED");
      }
    });
  });
});

// =============================================================================
// 8. SearchStrategy インターフェースのテスト（モック実装）
// =============================================================================

describe("SearchStrategy", () => {
  // テスト用の検索戦略
  interface SearchQuery {
    text: string;
    limit: number;
  }

  interface SearchResult {
    id: string;
    score: number;
    content: string;
  }

  const createMockSearchStrategy = (
    documents: { id: string; content: string }[],
  ): SearchStrategy<SearchQuery, SearchResult> => ({
    name: "simple-text-search",

    async search(
      query: SearchQuery,
    ): Promise<Result<SearchResult[], RAGError>> {
      if (!query.text) {
        return err(
          createRAGError(
            ErrorCodes.QUERY_PARSE_ERROR,
            "Query text is required",
          ),
        );
      }

      const results = documents
        .filter((doc) =>
          doc.content.toLowerCase().includes(query.text.toLowerCase()),
        )
        .map((doc) => ({
          id: doc.id,
          score: 1.0,
          content: doc.content,
        }))
        .slice(0, query.limit);

      return ok(results);
    },
  });

  describe("name", () => {
    it("検索戦略の名前を持つこと", () => {
      const strategy = createMockSearchStrategy([]);
      expect(strategy.name).toBe("simple-text-search");
    });
  });

  describe("search", () => {
    it("マッチする結果を返すこと", async () => {
      const documents = [
        { id: "1", content: "Hello World" },
        { id: "2", content: "Hello Universe" },
        { id: "3", content: "Goodbye World" },
      ];
      const strategy = createMockSearchStrategy(documents);

      const result = await strategy.search({ text: "Hello", limit: 10 });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(2);
        expect(result.data.map((r) => r.id)).toContain("1");
        expect(result.data.map((r) => r.id)).toContain("2");
      }
    });

    it("マッチしない場合は空の結果を返すこと", async () => {
      const documents = [{ id: "1", content: "Hello World" }];
      const strategy = createMockSearchStrategy(documents);

      const result = await strategy.search({ text: "Nonexistent", limit: 10 });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(0);
      }
    });

    it("検索エラー時にエラーを返すこと", async () => {
      const strategy = createMockSearchStrategy([]);
      const result = await strategy.search({ text: "", limit: 10 });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe("QUERY_PARSE_ERROR");
      }
    });

    it("limitに従って結果を制限すること", async () => {
      const documents = [
        { id: "1", content: "Test document 1" },
        { id: "2", content: "Test document 2" },
        { id: "3", content: "Test document 3" },
        { id: "4", content: "Test document 4" },
        { id: "5", content: "Test document 5" },
      ];
      const strategy = createMockSearchStrategy(documents);

      const result = await strategy.search({ text: "Test", limit: 3 });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(3);
      }
    });
  });
});

// =============================================================================
// 9. インターフェースの組み合わせテスト
// =============================================================================

describe("インターフェースの組み合わせ", () => {
  it("RepositoryとConverterを連携して使用できること", async () => {
    // エンティティ型
    interface Document extends Timestamped {
      id: string;
      name: string;
      content: string;
    }

    // モックリポジトリ（簡略版）
    const mockRepo: Pick<Repository<Document, string>, "findById"> = {
      async findById(_id: string) {
        return ok<Document | null, RAGError>({
          id: "doc-1",
          name: "test.txt",
          content: "Hello World",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      },
    };

    // モックコンバーター（簡略版）
    const mockConverter: Pick<Converter<string, number>, "convert"> = {
      async convert(input: string) {
        return ok<number, RAGError>(input.length);
      },
    };

    // 連携処理
    const docResult = await mockRepo.findById("doc-1");
    expect(isOk(docResult)).toBe(true);

    if (isOk(docResult) && docResult.data) {
      const convertResult = await mockConverter.convert(docResult.data.content);
      expect(isOk(convertResult)).toBe(true);
      if (isOk(convertResult)) {
        expect(convertResult.data).toBe(11); // "Hello World".length
      }
    }
  });

  it("SearchStrategyとPaginatedResultを組み合わせて使用できること", () => {
    interface SearchHit {
      id: string;
      score: number;
    }

    const searchResults: SearchHit[] = [
      { id: "1", score: 0.95 },
      { id: "2", score: 0.9 },
      { id: "3", score: 0.85 },
    ];

    const paginatedResult: PaginatedResult<SearchHit> = {
      items: searchResults.slice(0, 2),
      total: searchResults.length,
      limit: 2,
      offset: 0,
      hasMore: true,
    };

    expect(paginatedResult.items).toHaveLength(2);
    expect(paginatedResult.total).toBe(3);
    expect(paginatedResult.hasMore).toBe(true);
  });
});

// =============================================================================
// 10. 型推論のテスト
// =============================================================================

describe("型推論", () => {
  it("ジェネリック型パラメータが正しく推論されること", () => {
    const result: PaginatedResult<string> = {
      items: ["a", "b", "c"],
      total: 3,
      limit: 10,
      offset: 0,
      hasMore: false,
    };

    // 型推論によりitemsの要素がstring型
    expect(result.items[0].toUpperCase()).toBe("A");
  });

  it("AsyncStatusがunion型として正しく動作すること", () => {
    const statuses: AsyncStatus[] = [
      "pending",
      "processing",
      "completed",
      "failed",
    ];
    expect(statuses).toHaveLength(4);
  });

  it("Repositoryのジェネリック型が正しく推論されること", async () => {
    // 型テスト用のダミー実装
    interface TestEntity {
      id: number;
      value: string;
    }

    const dummyRepo: Pick<Repository<TestEntity, number>, "findById"> = {
      async findById(_id: number) {
        return ok<TestEntity | null, RAGError>({ id: 1, value: "test" });
      },
    };

    const result = await dummyRepo.findById(1);
    expect(isOk(result)).toBe(true);
  });
});
