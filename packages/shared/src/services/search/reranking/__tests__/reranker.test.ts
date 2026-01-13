/**
 * @file Reranker ユニットテスト
 * @description CONV-07-05 Phase 4: TDD Red Phase
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createChunkId } from "../../../../types/rag/branded";
import { ok, err } from "../../../../types/rag/result";

// テスト対象（未実装）
import {
  LLMReranker,
  CohereReranker,
  VoyageReranker,
  NoOpReranker,
} from "../cross-encoder-reranker";
import type { FusedSearchResult } from "../types";

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * モックFusedSearchResultを生成
 */
function createMockFusedResults(count: number): FusedSearchResult[] {
  return Array.from({ length: count }, (_, i) => ({
    chunkId: createChunkId(`fused-chunk-${i}`),
    content: `Fused content ${i}`,
    fusedScore: 0.9 - i * 0.05,
    sources: [
      { strategy: "keyword" as const, rank: i + 1, score: 0.9 - i * 0.05 },
    ],
    metadata: {},
  }));
}

// =============================================================================
// IRerankerインターフェース テスト
// =============================================================================

describe("IReranker Interface", () => {
  it("AC-008: IRerankerインターフェースが定義されている", () => {
    // IRerankerを実装するクラスが全て必要なメソッドを持つことを確認
    const rerankers = [
      new LLMReranker({} as any),
      new CohereReranker("test-api-key"),
      new VoyageReranker("test-api-key"),
      new NoOpReranker(),
    ];

    for (const reranker of rerankers) {
      expect(reranker.rerank).toBeDefined();
      expect(typeof reranker.rerank).toBe("function");
    }
  });
});

// =============================================================================
// LLMReranker テスト
// =============================================================================

describe("LLMReranker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("AC-009: バッチでスコアリングする", async () => {
    // Given: モックLLMクライアントとバッチサイズ5
    const mockLLM = {
      complete: vi.fn().mockResolvedValue(ok("8,7,9,6,5")),
    };
    const reranker = new LLMReranker(mockLLM as any, { batchSize: 5 });
    const candidates = createMockFusedResults(10);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 5);

    // Then: バッチサイズ5で10件なので2回呼び出し
    expect(result.success).toBe(true);
    expect(mockLLM.complete).toHaveBeenCalledTimes(2);
  });

  it("候補数が少ない場合はスキップ可能", async () => {
    // Given: limit以下の候補数
    const mockLLM = {
      complete: vi.fn(),
    };
    const reranker = new LLMReranker(mockLLM as any, {
      skipIfBelowLimit: true,
    });
    const candidates = createMockFusedResults(3);

    // When: リランキングを実行（limit=5だが候補は3）
    const result = await reranker.rerank("test query", candidates, 5);

    // Then: LLMが呼び出されない（スキップ）
    expect(result.success).toBe(true);
    expect(mockLLM.complete).not.toHaveBeenCalled();
    expect(result.data.length).toBe(3);
  });

  it("AC-013: LLMエラー時にフォールバック", async () => {
    // Given: エラーを返すLLMクライアント
    const mockLLM = {
      complete: vi.fn().mockResolvedValue(err(new Error("API Error"))),
    };
    const reranker = new LLMReranker(mockLLM as any);
    const candidates = createMockFusedResults(10);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 5);

    // Then: フォールバックでfusedScore順
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(5);
    expect(result.data[0].chunkId).toBe(candidates[0].chunkId);
  });

  it("LLMレスポンスが不正な場合にフォールバック", async () => {
    // Given: 不正なレスポンスを返すLLMクライアント
    const mockLLM = {
      complete: vi.fn().mockResolvedValue(ok("invalid response")),
    };
    const reranker = new LLMReranker(mockLLM as any);
    const candidates = createMockFusedResults(5);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 5);

    // Then: フォールバックで成功
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// CohereReranker テスト
// =============================================================================

describe("CohereReranker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("AC-010: Cohere APIを呼び出す", async () => {
    // Given: モックfetch
    const reranker = new CohereReranker("test-api-key");
    const candidates = createMockFusedResults(5);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            { index: 2, relevance_score: 0.95 },
            { index: 0, relevance_score: 0.85 },
            { index: 1, relevance_score: 0.75 },
          ],
        }),
    } as Response);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 3);

    // Then: Cohere APIが呼び出される
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(3);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.cohere.ai/v1/rerank",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
        }),
      }),
    );
  });

  it("APIエラー時にエラーを返す", async () => {
    // Given: エラーレスポンスを返すfetch
    const reranker = new CohereReranker("test-api-key");
    const candidates = createMockFusedResults(5);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({ error: "Server error" }),
    } as Response);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 3);

    // Then: エラーが返却される
    expect(result.success).toBe(false);
  });

  it("AC-014: rerankedScoreが設定される", async () => {
    // Given: 正常なAPIレスポンス
    const reranker = new CohereReranker("test-api-key");
    const candidates = createMockFusedResults(3);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            { index: 0, relevance_score: 0.95 },
            { index: 1, relevance_score: 0.85 },
            { index: 2, relevance_score: 0.75 },
          ],
        }),
    } as Response);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 3);

    // Then: rerankedScoreが設定される
    expect(result.success).toBe(true);
    expect(result.data[0].rerankedScore).toBe(0.95);
    expect(result.data[1].rerankedScore).toBe(0.85);
    expect(result.data[2].rerankedScore).toBe(0.75);
  });

  it("タイムアウト時にエラーを返す", async () => {
    // Given: タイムアウトするfetch
    const reranker = new CohereReranker("test-api-key", { timeoutMs: 1000 });
    const candidates = createMockFusedResults(5);

    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Timeout"));

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 3);

    // Then: エラーが返却される
    expect(result.success).toBe(false);
  });

  it("レート制限（429）時にエラーを返す", async () => {
    // Given: 429レスポンス
    const reranker = new CohereReranker("test-api-key");
    const candidates = createMockFusedResults(5);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: () => Promise.resolve({ error: "Rate limited" }),
    } as Response);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 3);

    // Then: エラーが返却される
    expect(result.success).toBe(false);
  });

  it("モデル指定がリクエストに含まれる", async () => {
    // Given: カスタムモデル
    const reranker = new CohereReranker("test-api-key", {
      model: "rerank-english-v3.0",
    });
    const candidates = createMockFusedResults(3);

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [{ index: 0, relevance_score: 0.95 }],
        }),
    } as Response);

    // When: リランキングを実行
    await reranker.rerank("test query", candidates, 3);

    // Then: モデルがリクエストに含まれる
    const requestBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(requestBody.model).toBe("rerank-english-v3.0");
  });
});

// =============================================================================
// VoyageReranker テスト
// =============================================================================

describe("VoyageReranker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("AC-011: Voyage APIを呼び出す", async () => {
    // Given: モックfetch
    const reranker = new VoyageReranker("test-api-key");
    const candidates = createMockFusedResults(5);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { index: 1, relevance_score: 0.92 },
            { index: 0, relevance_score: 0.88 },
          ],
        }),
    } as Response);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 2);

    // Then: Voyage APIが呼び出される
    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.voyageai.com/v1/rerank",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("APIエラー時にエラーを返す", async () => {
    // Given: エラーレスポンス
    const reranker = new VoyageReranker("test-api-key");
    const candidates = createMockFusedResults(5);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({ error: "Server error" }),
    } as Response);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 3);

    // Then: エラーが返却される
    expect(result.success).toBe(false);
  });

  it("rerankedScoreが設定される", async () => {
    // Given: 正常なAPIレスポンス
    const reranker = new VoyageReranker("test-api-key");
    const candidates = createMockFusedResults(2);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { index: 0, relevance_score: 0.92 },
            { index: 1, relevance_score: 0.88 },
          ],
        }),
    } as Response);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 2);

    // Then: rerankedScoreが設定される
    expect(result.success).toBe(true);
    expect(result.data[0].rerankedScore).toBeDefined();
    expect(result.data[1].rerankedScore).toBeDefined();
  });

  it("認証ヘッダーが正しく設定される", async () => {
    // Given: APIキー
    const reranker = new VoyageReranker("voyage-test-api-key");
    const candidates = createMockFusedResults(3);

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ index: 0, relevance_score: 0.9 }],
        }),
    } as Response);

    // When: リランキングを実行
    await reranker.rerank("test query", candidates, 3);

    // Then: 認証ヘッダーが設定されている
    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    expect(headers["Authorization"]).toBe("Bearer voyage-test-api-key");
  });
});

// =============================================================================
// NoOpReranker テスト
// =============================================================================

describe("NoOpReranker", () => {
  it("AC-012: 順序を変えずにlimitを適用する", async () => {
    // Given: 10件の候補
    const reranker = new NoOpReranker();
    const candidates = createMockFusedResults(10);

    // When: リランキングを実行（limit=5）
    const result = await reranker.rerank("test query", candidates, 5);

    // Then: 順序が保持されて先頭5件が返却される
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(5);
    for (let i = 0; i < 5; i++) {
      expect(result.data[i].chunkId).toBe(candidates[i].chunkId);
    }
  });

  it("空配列を処理できる", async () => {
    // Given: 空の候補
    const reranker = new NoOpReranker();
    const candidates: FusedSearchResult[] = [];

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 5);

    // Then: 空の配列が返却される
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it("候補数がlimit以下の場合は全て返却される", async () => {
    // Given: 3件の候補
    const reranker = new NoOpReranker();
    const candidates = createMockFusedResults(3);

    // When: リランキングを実行（limit=5）
    const result = await reranker.rerank("test query", candidates, 5);

    // Then: 全3件が返却される
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(3);
  });

  it("常にResult.ok()を返す", async () => {
    // Given: 任意の候補
    const reranker = new NoOpReranker();
    const candidates = createMockFusedResults(5);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 5);

    // Then: 常に成功
    expect(result.success).toBe(true);
  });

  it("fusedScoreがrerankedScoreにコピーされる", async () => {
    // Given: 候補
    const reranker = new NoOpReranker();
    const candidates = createMockFusedResults(3);

    // When: リランキングを実行
    const result = await reranker.rerank("test query", candidates, 3);

    // Then: fusedScoreがrerankedScoreにコピーされる
    expect(result.success).toBe(true);
    for (let i = 0; i < 3; i++) {
      expect(result.data[i].rerankedScore).toBe(candidates[i].fusedScore);
    }
  });
});
