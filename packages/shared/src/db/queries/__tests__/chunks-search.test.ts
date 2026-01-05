/**
 * FTS5検索クエリビルダーのテスト
 *
 * TDD Red状態: 実装前にテストを作成
 *
 * @see docs/30-workflows/rag-conversion-system/design-chunks-search.md
 */

import { describe, it, expect, vi } from "vitest";

// Note: These imports will fail until implementation is complete (TDD Red state)
import {
  escapeFts5Query,
  normalizeBm25Score,
  extractHighlights,
  searchChunksByKeyword,
  searchChunksByPhrase,
  searchChunksByNear,
  SearchOptionsSchema,
  NearSearchOptionsSchema,
  FtsSearchResultSchema,
  SearchResponseSchema,
} from "../chunks-search";

// ============================================
// 1. escapeFts5Query テスト
// ============================================

describe("escapeFts5Query", () => {
  describe("特殊文字エスケープ", () => {
    it("ダブルクォートをエスケープする", () => {
      expect(escapeFts5Query('hello "world"')).toBe('hello \\"world\\"');
    });

    it("アスタリスクをエスケープする", () => {
      expect(escapeFts5Query("prefix*")).toBe("prefix\\*");
    });

    it("キャレットをエスケープする", () => {
      expect(escapeFts5Query("column^field")).toBe("column\\^field");
    });

    it("括弧をエスケープする", () => {
      expect(escapeFts5Query("(group)")).toBe("\\(group\\)");
    });

    it("ハイフンをエスケープする", () => {
      expect(escapeFts5Query("test-value")).toBe("test\\-value");
    });

    it("プラスをエスケープする", () => {
      expect(escapeFts5Query("test+value")).toBe("test\\+value");
    });

    it("コロンをエスケープする", () => {
      expect(escapeFts5Query("field:value")).toBe("field\\:value");
    });

    it("波括弧をエスケープする", () => {
      expect(escapeFts5Query("{test}")).toBe("\\{test\\}");
    });

    it("複数の特殊文字を同時にエスケープする", () => {
      const input = 'test "query" with (parentheses) *asterisk*';
      const result = escapeFts5Query(input);
      // ダブルクォートがエスケープされている
      expect(result).toContain('\\"query\\"');
      // 括弧がエスケープされている
      expect(result).toContain("\\(parentheses\\)");
      // アスタリスクがエスケープされている
      expect(result).toContain("\\*asterisk\\*");
    });
  });

  describe("予約語クォート", () => {
    it("ANDをクォートする", () => {
      expect(escapeFts5Query("TypeScript AND React")).toBe(
        'TypeScript "AND" React',
      );
    });

    it("ORをクォートする", () => {
      expect(escapeFts5Query("Vue OR Angular")).toBe('Vue "OR" Angular');
    });

    it("NOTをクォートする", () => {
      expect(escapeFts5Query("NOT empty")).toBe('"NOT" empty');
    });

    it("NEARをクォートする", () => {
      expect(escapeFts5Query("NEAR search")).toBe('"NEAR" search');
    });

    it("小文字の予約語もクォートする", () => {
      expect(escapeFts5Query("TypeScript and React")).toBe(
        'TypeScript "and" React',
      );
      expect(escapeFts5Query("Vue or Angular")).toBe('Vue "or" Angular');
    });

    it("複数の予約語を同時にクォートする", () => {
      expect(escapeFts5Query("A AND B OR C")).toBe('A "AND" B "OR" C');
    });
  });

  describe("エッジケース", () => {
    it("空文字列を処理する", () => {
      expect(escapeFts5Query("")).toBe("");
    });

    it("特殊文字のみの文字列を処理する", () => {
      expect(escapeFts5Query('"*^')).toBe('\\"\\*\\^');
    });

    it("日本語テキストをそのまま返す", () => {
      expect(escapeFts5Query("検索クエリ")).toBe("検索クエリ");
    });

    it("日本語と英語の混在を処理する", () => {
      const input = "TypeScript AND 検索";
      const result = escapeFts5Query(input);
      expect(result).toContain('"AND"');
      expect(result).toContain("検索");
    });
  });
});

// ============================================
// 2. normalizeBm25Score テスト
// ============================================

describe("normalizeBm25Score", () => {
  describe("基本的な正規化", () => {
    it("負のスコアを0-1に正規化する", () => {
      expect(normalizeBm25Score(-2.5, 0.5)).toBeCloseTo(0.7773, 4);
      expect(normalizeBm25Score(-5, 0.5)).toBeCloseTo(0.9241, 4);
      expect(normalizeBm25Score(-10, 0.5)).toBeCloseTo(0.9933, 4);
    });

    it("0は0.5になる", () => {
      expect(normalizeBm25Score(0, 0.5)).toBe(0.5);
    });

    it("正のスコアは0.5未満になる", () => {
      expect(normalizeBm25Score(1, 0.5)).toBeLessThan(0.5);
    });
  });

  describe("スケールファクター", () => {
    it("スケールファクターで調整できる", () => {
      expect(normalizeBm25Score(-2.5, 1.0)).toBeCloseTo(0.9241, 4);
      // -2.5 * 0.25 = -0.625, sigmoid = 1/(1+e^0.625) ≈ 0.6514
      expect(normalizeBm25Score(-2.5, 0.25)).toBeCloseTo(0.6514, 4);
    });

    it("デフォルトスケールファクターは0.5", () => {
      expect(normalizeBm25Score(-2.5)).toBeCloseTo(0.7773, 4);
    });
  });

  describe("境界値", () => {
    it("非常に小さいスコアは1に近づく", () => {
      const result = normalizeBm25Score(-100, 0.5);
      expect(result).toBeGreaterThan(0.99);
      expect(result).toBeLessThanOrEqual(1);
    });

    it("非常に大きいスコアは0に近づく", () => {
      const result = normalizeBm25Score(100, 0.5);
      expect(result).toBeLessThan(0.01);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe("精度", () => {
    it("小数点4桁で丸められる", () => {
      const result = normalizeBm25Score(-1.23456789, 0.5);
      const decimalPlaces = result.toString().split(".")[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(4);
    });
  });
});

// ============================================
// 3. extractHighlights テスト
// ============================================

describe("extractHighlights", () => {
  it("デフォルトタグでハイライトSQL生成", () => {
    const result = extractHighlights(["<mark>", "</mark>"]);
    expect(result).toContain("highlight");
    expect(result).toContain("chunks_fts");
    expect(result).toContain("<mark>");
    expect(result).toContain("</mark>");
  });

  it("カスタムタグでハイライトSQL生成", () => {
    const result = extractHighlights(["<em>", "</em>"]);
    expect(result).toContain("<em>");
    expect(result).toContain("</em>");
  });

  it("HTML以外のタグも使用可能", () => {
    const result = extractHighlights(["[[", "]]"]);
    expect(result).toContain("[[");
    expect(result).toContain("]]");
  });
});

// ============================================
// 4. Zod スキーマ テスト
// ============================================

describe("Zod Schemas", () => {
  describe("SearchOptionsSchema", () => {
    it("有効な入力を受け入れる", () => {
      const result = SearchOptionsSchema.parse({
        query: "test",
        limit: 10,
        offset: 0,
      });
      expect(result.query).toBe("test");
      expect(result.limit).toBe(10);
    });

    it("デフォルト値が適用される", () => {
      const result = SearchOptionsSchema.parse({ query: "test" });
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
      expect(result.highlightTags).toEqual(["<mark>", "</mark>"]);
      expect(result.bm25ScaleFactor).toBe(0.5);
    });

    it("空のクエリを拒否する", () => {
      expect(() => SearchOptionsSchema.parse({ query: "" })).toThrow();
    });

    it("無効なlimitを拒否する", () => {
      expect(() =>
        SearchOptionsSchema.parse({ query: "test", limit: 0 }),
      ).toThrow();
      expect(() =>
        SearchOptionsSchema.parse({ query: "test", limit: 101 }),
      ).toThrow();
    });

    it("無効なfileIdを拒否する", () => {
      expect(() =>
        SearchOptionsSchema.parse({ query: "test", fileId: "invalid" }),
      ).toThrow();
    });

    it("有効なUUID形式のfileIdを受け入れる", () => {
      const result = SearchOptionsSchema.parse({
        query: "test",
        fileId: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result.fileId).toBe("123e4567-e89b-12d3-a456-426614174000");
    });
  });

  describe("NearSearchOptionsSchema", () => {
    it("nearDistanceのデフォルトは5", () => {
      const result = NearSearchOptionsSchema.parse({ query: "test" });
      expect(result.nearDistance).toBe(5);
    });

    it("nearDistanceの範囲を検証", () => {
      expect(() =>
        NearSearchOptionsSchema.parse({ query: "test", nearDistance: 0 }),
      ).toThrow();
      expect(() =>
        NearSearchOptionsSchema.parse({ query: "test", nearDistance: 51 }),
      ).toThrow();
    });
  });

  describe("FtsSearchResultSchema", () => {
    it("有効な検索結果を受け入れる", () => {
      const result = FtsSearchResultSchema.parse({
        id: "123e4567-e89b-12d3-a456-426614174000",
        fileId: "123e4567-e89b-12d3-a456-426614174001",
        content: "test content",
        contextualContent: null,
        parentHeader: null,
        score: 0.85,
        highlightedContent: "<mark>test</mark> content",
        chunkIndex: 0,
      });
      expect(result.score).toBe(0.85);
    });

    it("スコアは0-1の範囲", () => {
      expect(() =>
        FtsSearchResultSchema.parse({
          id: "123e4567-e89b-12d3-a456-426614174000",
          fileId: "123e4567-e89b-12d3-a456-426614174001",
          content: "test",
          contextualContent: null,
          parentHeader: null,
          score: 1.5,
          highlightedContent: "test",
          chunkIndex: 0,
        }),
      ).toThrow();
    });
  });

  describe("SearchResponseSchema", () => {
    it("有効なレスポンスを受け入れる", () => {
      const result = SearchResponseSchema.parse({
        results: [],
        totalCount: 0,
        query: "test",
        pagination: {
          limit: 10,
          offset: 0,
          hasMore: false,
        },
      });
      expect(result.totalCount).toBe(0);
    });
  });
});

// ============================================
// 5. searchChunksByKeyword テスト
// ============================================

describe("searchChunksByKeyword", () => {
  // モックDB作成ヘルパー
  const createMockDb = (countResult: number, searchResults: any[]) => {
    let callCount = 0;
    return {
      all: vi.fn().mockImplementation(() => {
        callCount++;
        // 最初の呼び出しはCOUNTクエリ、2回目が実際の検索クエリ
        if (callCount === 1) {
          return Promise.resolve([{ count: countResult }]);
        }
        return Promise.resolve(searchResults);
      }),
      run: vi.fn(),
    } as any;
  };

  describe("基本的なキーワード検索", () => {
    it("単一キーワード検索が動作する", async () => {
      const mockResults = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          file_id: "123e4567-e89b-12d3-a456-426614174001",
          content: "test content",
          contextual_content: null,
          parent_header: null,
          chunk_index: 0,
          raw_score: -2.5,
          highlighted_content: "<mark>test</mark> content",
        },
      ];

      const mockDb = createMockDb(1, mockResults);

      const result = await searchChunksByKeyword(mockDb, {
        query: "test",
        limit: 10,
        offset: 0,
      });

      expect(result.results).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.results[0].id).toBe(mockResults[0].id);
    });

    it("複数キーワード（OR検索）が動作する", async () => {
      const mockDb = createMockDb(2, []);
      await searchChunksByKeyword(mockDb, {
        query: "TypeScript React",
        limit: 10,
        offset: 0,
      });
      expect(mockDb.all).toHaveBeenCalled();
    });

    it("結果にスコアが含まれる（0-1範囲）", async () => {
      const mockResults = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          file_id: "123e4567-e89b-12d3-a456-426614174001",
          content: "test",
          contextual_content: null,
          parent_header: null,
          chunk_index: 0,
          raw_score: -5.0,
          highlighted_content: "test",
        },
      ];

      const mockDb = createMockDb(1, mockResults);
      const result = await searchChunksByKeyword(mockDb, { query: "test" });

      expect(result.results[0].score).toBeGreaterThanOrEqual(0);
      expect(result.results[0].score).toBeLessThanOrEqual(1);
    });

    it("結果にハイライトが含まれる", async () => {
      const mockResults = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          file_id: "123e4567-e89b-12d3-a456-426614174001",
          content: "test content",
          contextual_content: null,
          parent_header: null,
          chunk_index: 0,
          raw_score: -2.5,
          highlighted_content: "<mark>test</mark> content",
        },
      ];

      const mockDb = createMockDb(1, mockResults);
      const result = await searchChunksByKeyword(mockDb, { query: "test" });

      expect(result.results[0].highlightedContent).toContain("<mark>");
      expect(result.results[0].highlightedContent).toContain("</mark>");
    });
  });

  describe("フィルタリング", () => {
    it("fileIdでフィルタできる", async () => {
      const fileId = "123e4567-e89b-12d3-a456-426614174001";
      const mockDb = createMockDb(0, []);

      await searchChunksByKeyword(mockDb, {
        query: "test",
        fileId,
      });

      // fileId付きクエリが実行されたことを確認
      expect(mockDb.all).toHaveBeenCalled();
    });

    it("存在しないfileIdでは空の結果を返す", async () => {
      const mockDb = createMockDb(0, []);

      const result = await searchChunksByKeyword(mockDb, {
        query: "test",
        fileId: "00000000-0000-0000-0000-000000000000", // 有効なUUID形式
      });

      expect(result.results).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe("ページネーション", () => {
    it("limitが適用される", async () => {
      const mockDb = createMockDb(100, []);

      const result = await searchChunksByKeyword(mockDb, {
        query: "test",
        limit: 5,
        offset: 0,
      });

      expect(result.pagination.limit).toBe(5);
    });

    it("offsetが適用される", async () => {
      const mockDb = createMockDb(100, []);

      const result = await searchChunksByKeyword(mockDb, {
        query: "test",
        limit: 10,
        offset: 20,
      });

      expect(result.pagination.offset).toBe(20);
    });

    it("hasMoreが正しく設定される", async () => {
      // モック結果を10件返す
      const mockResults = Array.from({ length: 10 }, (_, i) => ({
        id: `id-${i}`,
        file_id: "123e4567-e89b-12d3-a456-426614174001",
        content: `content ${i}`,
        contextual_content: null,
        parent_header: null,
        chunk_index: i,
        raw_score: -2.5,
        highlighted_content: `content ${i}`,
      }));

      const mockDb = createMockDb(100, mockResults);

      const result = await searchChunksByKeyword(mockDb, {
        query: "test",
        limit: 10,
        offset: 0,
      });

      expect(result.pagination.hasMore).toBe(true);

      // 2回目の呼び出し用に新しいmockDbを作成
      const mockDb2 = createMockDb(100, mockResults);

      const result2 = await searchChunksByKeyword(mockDb2, {
        query: "test",
        limit: 10,
        offset: 95,
      });

      expect(result2.pagination.hasMore).toBe(false);
    });

    it("totalCountが正確", async () => {
      const mockResults = Array.from({ length: 10 }, (_, i) => ({
        id: `id-${i}`,
        file_id: "123e4567-e89b-12d3-a456-426614174001",
        content: `content ${i}`,
        contextual_content: null,
        parent_header: null,
        chunk_index: i,
        raw_score: -2.5,
        highlighted_content: `content ${i}`,
      }));

      const mockDb = createMockDb(42, mockResults);

      const result = await searchChunksByKeyword(mockDb, {
        query: "test",
      });

      expect(result.totalCount).toBe(42);
    });
  });

  describe("スコアリング", () => {
    it("BM25スコアが計算される", async () => {
      const mockResults = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          file_id: "123e4567-e89b-12d3-a456-426614174001",
          content: "test",
          contextual_content: null,
          parent_header: null,
          chunk_index: 0,
          raw_score: -3.5,
          highlighted_content: "test",
        },
      ];

      const mockDb = createMockDb(1, mockResults);
      const result = await searchChunksByKeyword(mockDb, { query: "test" });

      // スコアが正規化されていることを確認
      expect(typeof result.results[0].score).toBe("number");
      expect(result.results[0].score).toBeGreaterThan(0);
      expect(result.results[0].score).toBeLessThan(1);
    });

    it("関連性の高い結果が上位に来る", async () => {
      const mockResults = [
        {
          id: "1",
          file_id: "f1",
          content: "highly relevant",
          contextual_content: null,
          parent_header: null,
          chunk_index: 0,
          raw_score: -10.0, // より小さい = より関連性が高い
          highlighted_content: "relevant",
        },
        {
          id: "2",
          file_id: "f1",
          content: "less relevant",
          contextual_content: null,
          parent_header: null,
          chunk_index: 1,
          raw_score: -2.0,
          highlighted_content: "relevant",
        },
      ];

      const mockDb = createMockDb(2, mockResults);
      const result = await searchChunksByKeyword(mockDb, { query: "test" });

      // より小さいraw_scoreがより高いスコアになる
      expect(result.results[0].score).toBeGreaterThan(result.results[1].score);
    });

    it("カスタムスケールファクターが適用される", async () => {
      const mockResults = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          file_id: "123e4567-e89b-12d3-a456-426614174001",
          content: "test",
          contextual_content: null,
          parent_header: null,
          chunk_index: 0,
          raw_score: -2.5,
          highlighted_content: "test",
        },
      ];

      const mockDb = createMockDb(1, mockResults);
      const result = await searchChunksByKeyword(mockDb, {
        query: "test",
        bm25ScaleFactor: 1.0,
      });

      // カスタムスケールファクターでスコアが計算されている
      expect(result.results[0].score).toBeDefined();
    });
  });

  describe("エラーハンドリング", () => {
    it("空のクエリでZodエラー", async () => {
      const mockDb = createMockDb(0, []);

      await expect(
        searchChunksByKeyword(mockDb, { query: "" } as any),
      ).rejects.toThrow();
    });

    it("無効なパラメータでZodエラー", async () => {
      const mockDb = createMockDb(0, []);

      await expect(
        searchChunksByKeyword(mockDb, {
          query: "test",
          limit: 0, // 無効: 1以上
        }),
      ).rejects.toThrow();
    });
  });
});

// ============================================
// 6. searchChunksByPhrase テスト
// ============================================

describe("searchChunksByPhrase", () => {
  const createMockDb = (countResult: number, searchResults: any[]) => {
    return {
      all: vi.fn().mockImplementation((query) => {
        const queryStr = String(query);
        if (queryStr.includes("COUNT(*)")) {
          return Promise.resolve([{ count: countResult }]);
        }
        return Promise.resolve(searchResults);
      }),
      run: vi.fn(),
    } as any;
  };

  describe("フレーズ検索", () => {
    it("完全一致フレーズを検索する", async () => {
      const mockDb = createMockDb(1, [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          file_id: "123e4567-e89b-12d3-a456-426614174001",
          content: "full text search",
          contextual_content: null,
          parent_header: null,
          chunk_index: 0,
          raw_score: -3.0,
          highlighted_content: "<mark>full text search</mark>",
        },
      ]);

      const result = await searchChunksByPhrase(mockDb, {
        query: "full text search",
      });

      expect(result.results).toHaveLength(1);
      expect(result.results[0].content).toBe("full text search");
    });

    it("語順が異なる場合は一致しない", async () => {
      const mockDb = createMockDb(0, []);

      const result = await searchChunksByPhrase(mockDb, {
        query: "search text full", // 語順が異なる
      });

      expect(result.results).toHaveLength(0);
    });

    it("部分一致では一致しない", async () => {
      const mockDb = createMockDb(0, []);

      const result = await searchChunksByPhrase(mockDb, {
        query: "partial phrase",
      });

      expect(result.results).toHaveLength(0);
    });
  });

  describe("エスケープ処理", () => {
    it("ダブルクォートを含むフレーズを処理する", async () => {
      const mockDb = createMockDb(1, []);

      const result = await searchChunksByPhrase(mockDb, {
        query: 'quote "inside" phrase',
      });

      // エラーなく実行されることを確認
      expect(result).toBeDefined();
    });

    it("特殊文字を含むフレーズを処理する", async () => {
      const mockDb = createMockDb(1, []);

      const result = await searchChunksByPhrase(mockDb, {
        query: "phrase (with) special*chars",
      });

      // エラーなく実行されることを確認
      expect(result).toBeDefined();
    });
  });
});

// ============================================
// 7. searchChunksByNear テスト
// ============================================

describe("searchChunksByNear", () => {
  const createMockDb = (countResult: number, searchResults: any[]) => {
    return {
      all: vi.fn().mockImplementation((query) => {
        const queryStr = String(query);
        if (queryStr.includes("COUNT(*)")) {
          return Promise.resolve([{ count: countResult }]);
        }
        return Promise.resolve(searchResults);
      }),
      run: vi.fn(),
    } as any;
  };

  describe("近接検索", () => {
    it("2つのキーワードが近接する結果を返す", async () => {
      const mockDb = createMockDb(1, [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          file_id: "123e4567-e89b-12d3-a456-426614174001",
          content: "TypeScript interface definition",
          contextual_content: null,
          parent_header: null,
          chunk_index: 0,
          raw_score: -4.0,
          highlighted_content:
            "<mark>TypeScript</mark> <mark>interface</mark> definition",
        },
      ]);

      const result = await searchChunksByNear(
        mockDb,
        ["TypeScript", "interface"],
        { query: "test", nearDistance: 5 },
      );

      expect(result.results).toHaveLength(1);
      expect(result.results[0].content).toContain("TypeScript");
      expect(result.results[0].content).toContain("interface");
    });

    it("3つ以上のキーワードでも動作する", async () => {
      const mockDb = createMockDb(1, []);

      const result = await searchChunksByNear(
        mockDb,
        ["React", "hooks", "useState"],
        { query: "test", nearDistance: 10 },
      );

      expect(result).toBeDefined();
      expect(mockDb.all).toHaveBeenCalled();
    });

    it("距離パラメータが適用される", async () => {
      const mockDb = createMockDb(1, []);

      const result = await searchChunksByNear(mockDb, ["word1", "word2"], {
        query: "test",
        nearDistance: 3,
      });

      expect(result).toBeDefined();
      // nearDistanceが内部クエリに反映されることを確認
      expect(mockDb.all).toHaveBeenCalled();
    });
  });

  describe("距離の影響", () => {
    it("距離が近いほどスコアが高い", async () => {
      const mockResults = [
        {
          id: "1",
          file_id: "f1",
          content: "word1 word2", // 非常に近い
          contextual_content: null,
          parent_header: null,
          chunk_index: 0,
          raw_score: -8.0,
          highlighted_content: "<mark>word1</mark> <mark>word2</mark>",
        },
        {
          id: "2",
          file_id: "f1",
          content: "word1 foo bar word2", // 遠い
          contextual_content: null,
          parent_header: null,
          chunk_index: 1,
          raw_score: -3.0,
          highlighted_content: "<mark>word1</mark> foo bar <mark>word2</mark>",
        },
      ];

      const mockDb = createMockDb(2, mockResults);
      const result = await searchChunksByNear(mockDb, ["word1", "word2"], {
        query: "test",
        nearDistance: 10,
      });

      // より小さいraw_scoreがより高いスコアになる
      expect(result.results[0].score).toBeGreaterThan(result.results[1].score);
    });

    it("距離を超えた結果は含まれない", async () => {
      const mockDb = createMockDb(0, []);

      const result = await searchChunksByNear(mockDb, ["word1", "word2"], {
        query: "test",
        nearDistance: 2, // 狭い距離
      });

      expect(result.results).toHaveLength(0);
    });
  });

  describe("バリデーション", () => {
    it("2つ未満のキーワードでエラー", async () => {
      // This test should work even in Red state as it tests validation
      await expect(
        searchChunksByNear(
          {} as any, // mock db
          ["single"],
          { query: "test", nearDistance: 5, limit: 10, offset: 0 },
        ),
      ).rejects.toThrow("2つ以上のキーワードが必要です");
    });

    it("空の配列でエラー", async () => {
      await expect(
        searchChunksByNear({} as any, [], { query: "test", nearDistance: 5 }),
      ).rejects.toThrow("2つ以上のキーワードが必要です");
    });
  });
});

// ============================================
// 8. 統合テスト（将来実装）
// ============================================

describe("Integration Tests", () => {
  describe("FTS5インデックス同期", () => {
    it.todo("新しいチャンク挿入後に検索可能");

    it.todo("チャンク更新後に更新されたコンテンツで検索可能");

    it.todo("チャンク削除後に検索結果から除外");
  });

  describe("日本語検索", () => {
    it.todo("日本語キーワード検索が動作する");

    it.todo("日本語フレーズ検索が動作する");

    it.todo("英語と日本語の混合検索が動作する");
  });
});
