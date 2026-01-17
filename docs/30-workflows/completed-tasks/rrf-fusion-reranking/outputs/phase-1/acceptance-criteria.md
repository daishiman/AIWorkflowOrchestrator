# RRF Fusion + Reranking - 受け入れ基準

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | CONV-07-05 |
| フェーズ   | Phase 1    |
| 作成日     | 2026-01-13 |
| ステータス | 完了       |

---

## 1. RRFFusion 受け入れ基準

### AC-001: 3つの検索戦略からの結果を正しく統合できる

**Given**: 3つの検索戦略（keyword/semantic/graph）からの結果セットがある
**When**: `RRFFusion.fuse(resultSets, weights)` を呼び出す
**Then**: 全ての結果が統合され、RRFスコア順にソートされた `FusedSearchResult[]` が返却される

**検証方法**: ユニットテスト

```typescript
it("3つの検索結果を統合する", () => {
  const fusion = new RRFFusion();
  const resultSets = new Map([
    ["keyword", createMockResults("keyword", 5)],
    ["semantic", createMockResults("semantic", 5)],
    ["graph", createMockResults("graph", 5)],
  ]);
  const weights = { keyword: 0.33, semantic: 0.33, graph: 0.34 };

  const fused = fusion.fuse(resultSets, weights);

  expect(fused.length).toBeGreaterThan(0);
  expect(fused[0].fusedScore).toBeDefined();
  // スコアが降順にソートされている
  for (let i = 1; i < fused.length; i++) {
    expect(fused[i - 1].fusedScore).toBeGreaterThanOrEqual(fused[i].fusedScore);
  }
});
```

---

### AC-002: 各戦略の重み（Query Classifierから）が正しく適用される

**Given**: 異なる重みが設定されたSearchWeightsがある
**When**: 特定の戦略に高い重みを設定してFusionを実行する
**Then**: 高い重みの戦略の上位結果がより上位に来る

**検証方法**: ユニットテスト

```typescript
it("重みが正しく適用される", () => {
  const fusion = new RRFFusion();
  const resultSets = new Map([
    ["keyword", createMockResults("keyword", 3)],
    ["semantic", createMockResults("semantic", 3)],
    ["graph", createMockResults("graph", 3)],
  ]);

  // graphを重視
  const graphHeavyWeights = { keyword: 0.1, semantic: 0.1, graph: 0.8 };
  const graphHeavyFused = fusion.fuse(resultSets, graphHeavyWeights);

  // graphの1位がトップに来やすい
  const topSource = graphHeavyFused[0].sources.find((s) => s.rank === 1);
  expect(topSource?.strategy).toBe("graph");
});
```

---

### AC-003: 重複するチャンクが1つにマージされ、全ソース情報が保持される

**Given**: 同一チャンクが複数の戦略で出現している
**When**: Fusionを実行する
**Then**: チャンクは1回のみ出現し、sources配列に全ての出現情報が含まれる

**検証方法**: ユニットテスト

```typescript
it("重複するチャンクが正しく統合される", () => {
  const fusion = new RRFFusion();
  const sharedChunk = {
    chunkId: "shared-chunk" as ChunkId,
    content: "Shared content",
    score: 0.9,
    source: "keyword" as const,
    metadata: {},
  };

  const resultSets = new Map([
    ["keyword", [sharedChunk, ...createMockResults("keyword", 2)]],
    [
      "semantic",
      [
        { ...sharedChunk, source: "semantic" as const },
        ...createMockResults("semantic", 2),
      ],
    ],
  ]);
  const weights = { keyword: 0.5, semantic: 0.5, graph: 0 };

  const fused = fusion.fuse(resultSets, weights);

  // 共有チャンクは1回だけ出現し、両方のソースが記録される
  const sharedResult = fused.find((r) => r.chunkId === "shared-chunk");
  expect(sharedResult).toBeDefined();
  expect(sharedResult!.sources.length).toBe(2);
  expect(sharedResult!.sources.map((s) => s.strategy)).toContain("keyword");
  expect(sharedResult!.sources.map((s) => s.strategy)).toContain("semantic");
});
```

---

### AC-004: fusedScoreが0-1の範囲に正規化される

**Given**: 任意の検索結果セット
**When**: Fusionを実行する
**Then**: 全ての結果のfusedScoreが0以上1以下

**検証方法**: ユニットテスト

```typescript
it("fusedScoreが0-1の範囲", () => {
  const fusion = new RRFFusion();
  const resultSets = new Map([
    ["keyword", createMockResults("keyword", 10)],
    ["semantic", createMockResults("semantic", 10)],
    ["graph", createMockResults("graph", 10)],
  ]);
  const weights = { keyword: 0.33, semantic: 0.33, graph: 0.34 };

  const fused = fusion.fuse(resultSets, weights);

  for (const result of fused) {
    expect(result.fusedScore).toBeGreaterThanOrEqual(0);
    expect(result.fusedScore).toBeLessThanOrEqual(1);
  }
});
```

---

### AC-005: RRF kパラメータがコンストラクタで設定可能

**Given**: カスタムkパラメータ（例: 30）
**When**: `new RRFFusion(30)` でインスタンスを作成
**Then**: k=30でRRFスコアが計算される

**検証方法**: ユニットテスト

```typescript
it("kパラメータがカスタマイズ可能", () => {
  const fusion30 = new RRFFusion(30);
  const fusion60 = new RRFFusion(60);

  const resultSets = new Map([["keyword", createMockResults("keyword", 5)]]);
  const weights = { keyword: 1, semantic: 0, graph: 0 };

  const fused30 = fusion30.fuse(resultSets, weights);
  const fused60 = fusion60.fuse(resultSets, weights);

  // k=30の方がランキング差の影響が大きい（スコア差が大きくなる）
  expect(fused30[0].fusedScore).not.toBe(fused60[0].fusedScore);
});
```

---

## 2. WeightedScoreFusion 受け入れ基準

### AC-006: 各スコアに重みを適用した加重平均が計算される

**Given**: 各戦略のスコアと重み
**When**: WeightedScoreFusion.fuse() を実行
**Then**: fusedScore = Σ(score_i \* weight_i) / Σ(weight_i) で計算される

**検証方法**: ユニットテスト

```typescript
it("加重平均スコアが正しく計算される", () => {
  const fusion = new WeightedScoreFusion();
  const resultSets = new Map([
    [
      "keyword",
      [{ chunkId: "a" as ChunkId, content: "A", score: 1.0, metadata: {} }],
    ],
    [
      "semantic",
      [{ chunkId: "b" as ChunkId, content: "B", score: 0.5, metadata: {} }],
    ],
  ]);
  const weights = { keyword: 0.6, semantic: 0.4, graph: 0 };

  const fused = fusion.fuse(resultSets, weights);

  // chunk "a": score = 1.0 * 0.6 / 0.6 = 1.0
  // chunk "b": score = 0.5 * 0.4 / 0.4 = 0.5
  const resultA = fused.find((r) => r.chunkId === "a");
  const resultB = fused.find((r) => r.chunkId === "b");
  expect(resultA?.fusedScore).toBeCloseTo(1.0);
  expect(resultB?.fusedScore).toBeCloseTo(0.5);
});
```

---

### AC-007: 重複チャンクのスコアが正しく統合される

**Given**: 同一チャンクが複数戦略で異なるスコアを持つ
**When**: WeightedScoreFusion.fuse() を実行
**Then**: 重み付き平均が計算される

**検証方法**: ユニットテスト

```typescript
it("重複チャンクのスコアが統合される", () => {
  const fusion = new WeightedScoreFusion();
  const sharedChunk = {
    chunkId: "shared" as ChunkId,
    content: "Shared",
    metadata: {},
  };

  const resultSets = new Map([
    ["keyword", [{ ...sharedChunk, score: 0.8 }]],
    ["semantic", [{ ...sharedChunk, score: 0.6 }]],
  ]);
  const weights = { keyword: 0.5, semantic: 0.5, graph: 0 };

  const fused = fusion.fuse(resultSets, weights);

  const shared = fused.find((r) => r.chunkId === "shared");
  // (0.8 * 0.5 + 0.6 * 0.5) / (0.5 + 0.5) = 0.7
  expect(shared?.fusedScore).toBeCloseTo(0.7);
});
```

---

## 3. IReranker / 各実装 受け入れ基準

### AC-008: IRerankerインターフェースが定義されている

**Given**: IRerankerインターフェース
**When**: 型定義を確認
**Then**: `rerank(query: string, candidates: FusedSearchResult[], limit: number): Promise<Result<FusedSearchResult[], Error>>` が定義されている

**検証方法**: TypeScriptコンパイル

---

### AC-009: LLMRerankerがバッチでスコアリングできる

**Given**: 10件以上の候補とバッチサイズ5
**When**: LLMReranker.rerank() を実行
**Then**: LLMが複数回呼び出され、全候補がスコアリングされる

**検証方法**: ユニットテスト（LLM呼び出しをモック）

```typescript
it("バッチでスコアリングする", async () => {
  const mockLLM = {
    complete: vi.fn().mockResolvedValue(ok("8,7,9,6,5")),
  };
  const reranker = new LLMReranker(mockLLM as any, { batchSize: 5 });
  const candidates = createMockFusedResults(10);

  const result = await reranker.rerank("test query", candidates, 5);

  expect(result.success).toBe(true);
  // バッチサイズ5で10件なので2回呼び出し
  expect(mockLLM.complete).toHaveBeenCalledTimes(2);
});
```

---

### AC-010: CohereRerankerがCohere Rerank APIを呼び出せる

**Given**: 有効なCohereAPIキーと候補リスト
**When**: CohereReranker.rerank() を実行
**Then**: Cohere APIが呼び出され、リランキング結果が返却される

**検証方法**: ユニットテスト（fetchをモック）

```typescript
it("Cohere APIを呼び出す", async () => {
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

  const result = await reranker.rerank("test query", candidates, 3);

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
```

---

### AC-011: VoyageRerankerがVoyage AI Rerank APIを呼び出せる

**Given**: 有効なVoyage AIキーと候補リスト
**When**: VoyageReranker.rerank() を実行
**Then**: Voyage APIが呼び出され、リランキング結果が返却される

**検証方法**: ユニットテスト（fetchをモック）

```typescript
it("Voyage APIを呼び出す", async () => {
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

  const result = await reranker.rerank("test query", candidates, 2);

  expect(result.success).toBe(true);
  expect(fetch).toHaveBeenCalledWith(
    "https://api.voyageai.com/v1/rerank",
    expect.objectContaining({
      method: "POST",
    }),
  );
});
```

---

### AC-012: NoOpRerankerが順序を変えずにlimitを適用する

**Given**: 10件の候補とlimit=5
**When**: NoOpReranker.rerank() を実行
**Then**: 先頭5件がそのままの順序で返却される

**検証方法**: ユニットテスト

```typescript
it("順序を変えずにlimitを適用する", async () => {
  const reranker = new NoOpReranker();
  const candidates = createMockFusedResults(10);

  const result = await reranker.rerank("test query", candidates, 5);

  expect(result.success).toBe(true);
  expect(result.data.length).toBe(5);
  // 順序が保持されている
  for (let i = 0; i < 5; i++) {
    expect(result.data[i].chunkId).toBe(candidates[i].chunkId);
  }
});
```

---

### AC-013: API失敗時にフォールバック（fusedScoreを使用）が動作する

**Given**: LLMRerankerでLLM呼び出しが失敗
**When**: rerank() を実行
**Then**: fusedScoreの順序でlimit件が返却される

**検証方法**: ユニットテスト

```typescript
it("API失敗時にフォールバック", async () => {
  const mockLLM = {
    complete: vi.fn().mockResolvedValue(err(new Error("API Error"))),
  };
  const reranker = new LLMReranker(mockLLM as any);
  const candidates = createMockFusedResults(10);

  const result = await reranker.rerank("test query", candidates, 5);

  expect(result.success).toBe(true);
  expect(result.data.length).toBe(5);
  // フォールバックでfusedScore順
  expect(result.data[0].chunkId).toBe(candidates[0].chunkId);
});
```

---

### AC-014: rerankedScoreが結果に設定される

**Given**: 正常なリランキング処理
**When**: rerank() が成功
**Then**: 各結果のrerankedScoreプロパティにリランクスコアが設定される

**検証方法**: ユニットテスト

```typescript
it("rerankedScoreが設定される", async () => {
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

  const result = await reranker.rerank("test query", candidates, 3);

  expect(result.success).toBe(true);
  expect(result.data[0].rerankedScore).toBe(0.95);
  expect(result.data[1].rerankedScore).toBe(0.85);
  expect(result.data[2].rerankedScore).toBe(0.75);
});
```

---

## 4. 受け入れ基準サマリー

| AC-ID  | カテゴリ            | 基準                                                        | 必須 |
| ------ | ------------------- | ----------------------------------------------------------- | ---- |
| AC-001 | RRFFusion           | 3つの検索戦略からの結果を正しく統合できる                   | Yes  |
| AC-002 | RRFFusion           | 各戦略の重み（Query Classifierから）が正しく適用される      | Yes  |
| AC-003 | RRFFusion           | 重複するチャンクが1つにマージされ、全ソース情報が保持される | Yes  |
| AC-004 | RRFFusion           | fusedScoreが0-1の範囲に正規化される                         | Yes  |
| AC-005 | RRFFusion           | RRF kパラメータがコンストラクタで設定可能                   | Yes  |
| AC-006 | WeightedScoreFusion | 各スコアに重みを適用した加重平均が計算される                | Yes  |
| AC-007 | WeightedScoreFusion | 重複チャンクのスコアが正しく統合される                      | Yes  |
| AC-008 | IReranker           | IRerankerインターフェースが定義されている                   | Yes  |
| AC-009 | LLMReranker         | LLMRerankerがバッチでスコアリングできる                     | Yes  |
| AC-010 | CohereReranker      | CohereRerankerがCohere Rerank APIを呼び出せる               | Yes  |
| AC-011 | VoyageReranker      | VoyageRerankerがVoyage AI Rerank APIを呼び出せる            | Yes  |
| AC-012 | NoOpReranker        | NoOpRerankerが順序を変えずにlimitを適用する                 | Yes  |
| AC-013 | フォールバック      | API失敗時にフォールバック（fusedScoreを使用）が動作する     | Yes  |
| AC-014 | 共通                | rerankedScoreが結果に設定される                             | Yes  |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-13 | 1.0.0      | 初版作成 |
