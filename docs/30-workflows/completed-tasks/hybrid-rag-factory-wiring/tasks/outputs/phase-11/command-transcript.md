# Command Transcript - Phase 11 手動テスト

## タスクID: UT-RAG-08-002

## 実施日: 2026-03-21

## 判定: NON_VISUAL walkthrough（P53 準拠）

### 根拠

本タスクは `HybridRAGFactory` の service wiring であり、UI コンポーネントを持たない。
tsc / vitest / grep の出力ログがスクリーンショットと同等の証跡となる。

---

## MT-01: TypeScript 型チェック

```
$ cd packages/shared && pnpm exec tsc --noEmit
```

**出力**: （無出力）
**判定**: PASS — エラー 0 件

---

## MT-02: factory テストのスコープ実行

```
$ cd packages/shared && pnpm vitest run src/services/search/__tests__/hybrid-rag-factory.test.ts --reporter=verbose
```

**出力**:

```
 RUN  v2.1.9 /.../.worktrees/task-20260320-140329-wt-5/packages/shared

 ✓ HybridRAGFactory > createFull() > rerankerType バリエーション > rerankerType: 'none' で NoOpReranker を使用する
 ✓ HybridRAGFactory > createFull() > rerankerType バリエーション > rerankerType: 'cohere' で CohereReranker を使用する
 ✓ HybridRAGFactory > createFull() > rerankerType バリエーション > rerankerType: 'voyage' で VoyageReranker を使用する
 ✓ HybridRAGFactory > createFull() > rerankerType バリエーション > rerankerType: 'llm' で LLMReranker を使用する
 ✓ HybridRAGFactory > createFull() > CRAG設定 > enableCRAG: true で CorrectiveRAG を生成する
 ✓ HybridRAGFactory > createFull() > CRAG設定 > enableCRAG: false (デフォルト) で CRAG を null にする
 ✓ HybridRAGFactory > createFull() > コンポーネント組み立て > LLMQueryClassifier + RuleBasedQueryClassifier(fallback) を生成する
 ✓ HybridRAGFactory > createFull() > コンポーネント組み立て > VectorSearchStrategy と GraphSearchStrategy を生成する
 ✓ HybridRAGFactory > createFull() > コンポーネント組み立て > RRFFusion を生成する
 ✓ HybridRAGFactory > createFull() > コンポーネント組み立て > HybridRAGEngine に全コンポーネントを渡す
 ✓ HybridRAGFactory > createFull() バリデーション > rerankerType: 'cohere' で cohereApiKey 未指定はエラー
 ✓ HybridRAGFactory > createFull() バリデーション > rerankerType: 'cohere' で cohereApiKey が空白のみはエラー (P42)
 ✓ HybridRAGFactory > createFull() バリデーション > rerankerType: 'voyage' で voyageApiKey 未指定はエラー
 ✓ HybridRAGFactory > createFull() バリデーション > rerankerType: 'voyage' で voyageApiKey が空白のみはエラー (P42)
 ✓ HybridRAGFactory > createFull() バリデーション > rerankerType: 'llm' で rerankerLlmClient 未指定はエラー
 ✓ HybridRAGFactory > createFull() バリデーション > enableCRAG: true で cragLlmClient 未指定はエラー
 ✓ HybridRAGFactory > createLite() > RuleBasedQueryClassifier を使用する
 ✓ HybridRAGFactory > createLite() > NoOpReranker を使用する
 ✓ HybridRAGFactory > createLite() > CRAG は null で渡す
 ✓ HybridRAGFactory > createLite() > VectorSearchStrategy と GraphSearchStrategy を生成する
 ✓ HybridRAGFactory > createForTesting() > モックを注入してHybridRAGEngineを生成する (後方互換)
 ✓ HybridRAGFactory > createForTesting() > オプション省略時にデフォルトのfusion/rerankerを使用する
 ✓ HybridRAGFactory > createFull() -- 拡充 > ETC-01: CRAGオプションがCorrectiveRAGに渡される
 ✓ HybridRAGFactory > createFull() -- 拡充 > ETC-02: enableCRAG: false 明示指定でCRAGなし
 ✓ HybridRAGFactory > createFull() -- 拡充 > ETC-03: cohereModel が CohereReranker に渡される
 ✓ HybridRAGFactory > createFull() -- 拡充 > ETC-04: rerankerBatchSize が LLMReranker に渡される
 ✓ HybridRAGFactory > createFull() -- 拡充 > ETC-05: バリデーション優先順序 - cohereApiKeyエラーが先に検出される
 ✓ HybridRAGFactory > createFull() -- 拡充 > ETC-05b: バリデーション優先順序 - voyageApiKeyがcragLlmClientより先
 ✓ HybridRAGFactory > createFull() -- 拡充 > ETC-05c: バリデーション優先順序 - rerankerLlmClientがcragLlmClientより先
 ✓ HybridRAGFactory > createFull() -- 拡充 > CRAG enableCRAG未指定(undefined)でCRAGなし
 ✓ HybridRAGFactory > createFull() -- 拡充 > webSearcher が指定された場合 CorrectiveRAG に渡される
 ✓ HybridRAGFactory > createFull() -- 拡充 > communitySummarizer が GraphSearchStrategy に渡される
 ✓ HybridRAGFactory > createFull() -- 拡充 > rrfK 未指定時にデフォルト値60が使用される
 ✓ HybridRAGFactory > createFull() -- 拡充 > cohere cohereModel 未指定時に undefined が渡される
 ✓ HybridRAGFactory > createFull() -- 拡充 > llm rerankerBatchSize 未指定時に undefined が渡される
 ✓ HybridRAGFactory > createLite() -- 拡充 > ETC-06: LLM関連コンポーネントを使用しない
 ✓ HybridRAGFactory > createLite() -- 拡充 > createLite() は RRFFusion をデフォルト引数で生成する
 ✓ HybridRAGFactory > createLite() -- 拡充 > createLite() は GraphSearchStrategy に communitySummarizer を渡さない
 ✓ HybridRAGFactory > createForTesting() -- 拡充 > ETC-07: オプション省略時にRRFFusion(デフォルト) + NoOpReranker + crag:null + options:{} で生成される
 ✓ HybridRAGFactory > createForTesting() -- 拡充 > ETC-08: カスタム fusion / reranker / crag が全て渡される
 ✓ HybridRAGFactory > limitation 回帰ガード > ETC-09: GraphSearchStrategy は queryType を受け取らない (既知制限の回帰ガード)
 ✓ HybridRAGFactory > adapter > ETC-10: createFull() が KeywordSearchStrategyAdapter を使用する
 ✓ HybridRAGFactory > adapter > ETC-10b: createLite() も KeywordSearchStrategyAdapter を使用する

 Test Files  1 passed (1)
      Tests  43 passed (43)
   Start at  01:20:23
   Duration  491ms
```

**判定**: PASS — 全 43 テスト通過

---

## MT-03: プレースホルダー残存確認

```
$ grep -rn "@placeholder" packages/shared/src/services/search/hybrid-rag-factory.ts
$ grep -rn "FACTORY_NOT_READY" packages/shared/src/services/search/hybrid-rag-factory.ts
```

**出力**: （無出力）
**判定**: PASS — 両方ともゼロ件

---

## MT-04: createFull() の sample invocation 読み合わせ

実装コード（hybrid-rag-factory.ts L120-154）を参照し、設計（DT-04）との一致を確認。

```
1. validateFullConfig(config)                                   [L121]     -- 4条件バリデーション PASS
2. LLMQueryClassifier(config.llmProvider, fallbackClassifier)  [L123-127] -- RuleBasedQueryClassifier がfallback PASS
3. KeywordSearchStrategyAdapter(new KeywordSearchStrategy(db)) [L129-131] -- adapter 経由 PASS
4. VectorSearchStrategy(config.db, config.embeddingProvider)   [L132-135] -- PASS
5. GraphSearchStrategy(graphStore, embeddingProvider, communitySummarizer) [L136-140] -- PASS
6. RRFFusion(config.rrfK ?? 60)                                [L142]     -- デフォルト60 PASS
7. createReranker(config)                                      [L143]     -- 4分岐 PASS
8. createCRAG(config)                                          [L144]     -- enableCRAG 条件分岐 PASS
9. HybridRAGEngine(classifier, {keyword, semantic, graph}, fusion, reranker, crag) [L146-153] PASS
```

**判定**: PASS — 設計 DT-04 と実装が完全一致

---

## MT-05: createLite() の sample invocation 読み合わせ

実装コード（hybrid-rag-factory.ts L159-185）を参照し、設計（DT-05）との一致を確認。

```
1. RuleBasedQueryClassifier()                                  [L160]     -- PASS
2. KeywordSearchStrategyAdapter(new KeywordSearchStrategy(db)) [L162-164] -- PASS
3. VectorSearchStrategy(config.db, config.embeddingProvider)   [L165-168] -- PASS
4. GraphSearchStrategy(graphStore, embeddingProvider)          [L169-172] -- communitySummarizer なし PASS
5. RRFFusion()                                                 [L174]     -- デフォルト K=60 PASS
6. NoOpReranker()                                              [L175]     -- PASS
7. null (CRAG なし)                                            [L181]     -- PASS
8. HybridRAGEngine(...)                                        [L177-184] -- PASS
```

**判定**: PASS — 設計 DT-05 と実装が完全一致

---

## MT-06: reranker 4 分岐の確認（テストログ対応）

| ケース                       | テスト名                                                          | 結果 |
| ---------------------------- | ----------------------------------------------------------------- | ---- |
| cohere + cohereApiKey 有り   | `rerankerType: 'cohere' で CohereReranker を使用する`             | PASS |
| cohere + cohereApiKey なし   | `rerankerType: 'cohere' で cohereApiKey 未指定はエラー`           | PASS |
| cohere + cohereApiKey 空白   | `rerankerType: 'cohere' で cohereApiKey が空白のみはエラー (P42)` | PASS |
| voyage + voyageApiKey 有り   | `rerankerType: 'voyage' で VoyageReranker を使用する`             | PASS |
| voyage + voyageApiKey なし   | `rerankerType: 'voyage' で voyageApiKey 未指定はエラー`           | PASS |
| voyage + voyageApiKey 空白   | `rerankerType: 'voyage' で voyageApiKey が空白のみはエラー (P42)` | PASS |
| llm + rerankerLlmClient 有り | `rerankerType: 'llm' で LLMReranker を使用する`                   | PASS |
| llm + rerankerLlmClient なし | `rerankerType: 'llm' で rerankerLlmClient 未指定はエラー`         | PASS |
| none                         | `rerankerType: 'none' で NoOpReranker を使用する`                 | PASS |

**判定**: PASS — 全4分岐（cohere/voyage/llm/none）+ エラーケース全て PASS

---

## MT-07: CRAG 条件分岐の確認（テストログ対応）

| ケース                                | テスト名                                           | 結果 |
| ------------------------------------- | -------------------------------------------------- | ---- |
| enableCRAG: true + cragLlmClient 有り | `enableCRAG: true で CorrectiveRAG を生成する`     | PASS |
| enableCRAG: true + cragLlmClient なし | `enableCRAG: true で cragLlmClient 未指定はエラー` | PASS |
| enableCRAG: false 明示                | `ETC-02: enableCRAG: false 明示指定でCRAGなし`     | PASS |
| enableCRAG 未定義                     | `CRAG enableCRAG未指定(undefined)でCRAGなし`       | PASS |

**判定**: PASS — 全4ケース PASS

---

## MT-08: limitation の再確認

### KL-01: GraphSearchStrategy は queryType を engine から受け取らない

```
テスト: ETC-09: GraphSearchStrategy は queryType を受け取らない (既知制限の回帰ガード) → PASS
```

**確認**: `graph strategy は local mode で動作する（KL-01）`
`GraphSearchStrategy` は HybridRAGEngine から queryType を受け取るインターフェースを持たない。
これは defect ではなく limitation として記録・ガード済み。
将来の改善は `UT-RAG-08-006` として未タスク化済み。

### KL-02: KeywordSearchStrategyAdapter の bridge 責務

`KeywordSearchStrategyAdapter` は `ISearchStrategy` インターフェースを実装し、
`KeywordSearchStrategy`（独自型）を Engine が理解できる形式にブリッジする。
adapter が追加されたことで直接依存が排除されている（確認済み）。

**判定**: PASS — KL-01/KL-02 両方が回帰ガードおよびコード読み合わせにより確認済み

---

## 新規ファイル確認 (MT-07)

```
$ ls packages/shared/src/services/search/strategies/
```

**出力**:

```
__tests__
cached-vector-search-strategy.ts
graph-search-strategy.ts
index.ts
keyword-search-strategy-adapter.ts   ← 新規作成済み
types.ts
vector-search-strategy.ts
```

**判定**: PASS — `keyword-search-strategy-adapter.ts` が存在する
