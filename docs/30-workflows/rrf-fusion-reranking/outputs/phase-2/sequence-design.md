# RRF Fusion + Reranking - シーケンス設計

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | CONV-07-05 |
| フェーズ   | Phase 2    |
| 作成日     | 2026-01-13 |
| ステータス | 完了       |

---

## 1. 正常系シーケンス

### 1.1 RRF Fusionシーケンス

```mermaid
sequenceDiagram
    participant HS as HybridRAGSearcher
    participant KS as KeywordStrategy
    participant VS as VectorStrategy
    participant GS as GraphStrategy
    participant RF as RRFFusion
    participant RR as IReranker

    Note over HS: 検索開始
    HS->>KS: search(query)
    HS->>VS: search(query)
    HS->>GS: search(query)

    Note over KS,GS: 並列実行

    KS-->>HS: SearchResult[] (keyword)
    VS-->>HS: SearchResult[] (semantic)
    GS-->>HS: SearchResult[] (graph)

    Note over HS: 結果セット構築
    HS->>HS: resultSets = Map([["keyword", kRes], ["semantic", vRes], ["graph", gRes]])

    HS->>RF: fuse(resultSets, weights)

    Note over RF: Fusion処理
    RF->>RF: 各戦略の結果を走査
    RF->>RF: RRFスコア計算
    RF->>RF: 重複チャンクをマージ
    RF->>RF: メタデータをマージ
    RF->>RF: スコアを0-1に正規化
    RF->>RF: fusedScoreでソート

    RF-->>HS: FusedSearchResult[]

    HS->>RR: rerank(query, candidates, limit)

    Note over RR: Reranking処理
    RR->>RR: スコアリング実行
    RR->>RR: rerankedScoreでソート
    RR->>RR: limit件に切り詰め

    RR-->>HS: Result.ok(FusedSearchResult[])

    Note over HS: 検索完了
```

### 1.2 RRFスコア計算詳細

```mermaid
sequenceDiagram
    participant RF as RRFFusion
    participant SM as ScoreMap

    Note over RF: fuse() 開始

    loop 各戦略の結果を処理
        RF->>RF: strategy = "keyword" | "semantic" | "graph"
        RF->>RF: weight = getWeight(strategy, weights)

        loop 各結果を処理
            RF->>RF: rank = index + 1
            RF->>RF: rrfContribution = weight / (k + rank)

            alt チャンクが既存
                RF->>SM: existing = get(chunkId)
                RF->>SM: existing.rrfScore += rrfContribution
                RF->>SM: existing.sources.push({strategy, rank, score})
                RF->>SM: existing.metadata = merge(metadata)
            else チャンクが新規
                RF->>SM: set(chunkId, {chunkId, content, rrfScore, sources, metadata})
            end
        end
    end

    RF->>RF: results = Array.from(scoreMap.values())
    RF->>RF: results.sort((a, b) => b.rrfScore - a.rrfScore)
    RF->>RF: results.map(normalizeScore)

    Note over RF: fuse() 完了
```

---

## 2. Reranker別シーケンス

### 2.1 LLMRerankerシーケンス

```mermaid
sequenceDiagram
    participant HS as HybridSearcher
    participant LR as LLMReranker
    participant LLM as ILLMClient

    HS->>LR: rerank(query, candidates, limit)

    alt candidates.length === 0
        LR-->>HS: ok([])
    else candidates.length <= limit && !alwaysRerank
        LR-->>HS: ok(candidates.slice(0, limit))
    else
        Note over LR: バッチ処理開始

        loop バッチごとに処理
            LR->>LR: batch = candidates.slice(i, i + batchSize)
            LR->>LR: prompt = buildScoringPrompt(query, batch)

            LR->>LLM: complete({prompt, maxTokens: 100, temperature: 0})

            alt LLM成功
                LLM-->>LR: ok(responseText)
                LR->>LR: scores = parseScores(responseText)
                LR->>LR: scoredCandidates.push(...batch with scores)
            else LLM失敗
                LLM-->>LR: err(error)
                Note over LR: フォールバック
                LR-->>HS: ok(candidates.slice(0, limit))
            end
        end

        LR->>LR: scoredCandidates.sort((a, b) => b.rerankScore - a.rerankScore)
        LR->>LR: results = scoredCandidates.slice(0, limit)
        LR->>LR: results.map(c => ({...c, rerankedScore: c.rerankScore}))

        LR-->>HS: ok(results)
    end
```

### 2.2 CohereRerankerシーケンス

```mermaid
sequenceDiagram
    participant HS as HybridSearcher
    participant CR as CohereReranker
    participant API as Cohere API

    HS->>CR: rerank(query, candidates, limit)

    alt candidates.length === 0
        CR-->>HS: ok([])
    else
        CR->>API: POST /v1/rerank
        Note right of API: {model, query, documents, top_n, return_documents}

        alt API成功 (200 OK)
            API-->>CR: {results: [{index, relevance_score}, ...]}

            CR->>CR: reranked = results.map(r => ({...candidates[r.index], rerankedScore: r.relevance_score}))

            CR-->>HS: ok(reranked)
        else API失敗
            API-->>CR: Error (4xx/5xx)
            CR-->>HS: err(new Error("Cohere API error: " + status))
        end
    end
```

### 2.3 VoyageRerankerシーケンス

```mermaid
sequenceDiagram
    participant HS as HybridSearcher
    participant VR as VoyageReranker
    participant API as Voyage API

    HS->>VR: rerank(query, candidates, limit)

    alt candidates.length === 0
        VR-->>HS: ok([])
    else
        VR->>API: POST /v1/rerank
        Note right of API: {model, query, documents, top_k}

        alt API成功 (200 OK)
            API-->>VR: {data: [{index, relevance_score}, ...]}

            VR->>VR: reranked = data.map(r => ({...candidates[r.index], rerankedScore: r.relevance_score}))

            VR-->>HS: ok(reranked)
        else API失敗
            API-->>VR: Error (4xx/5xx)
            VR-->>HS: err(new Error("Voyage API error: " + status))
        end
    end
```

### 2.4 NoOpRerankerシーケンス

```mermaid
sequenceDiagram
    participant HS as HybridSearcher
    participant NR as NoOpReranker

    HS->>NR: rerank(query, candidates, limit)

    NR->>NR: result = candidates.slice(0, limit)

    NR-->>HS: ok(result)
```

---

## 3. エラーハンドリングシーケンス

### 3.1 Reranker失敗時のフォールバック

```mermaid
sequenceDiagram
    participant HS as HybridSearcher
    participant CR as CohereReranker
    participant API as Cohere API
    participant FB as Fallback Logic

    HS->>CR: rerank(query, candidates, limit)

    CR->>API: POST /v1/rerank

    alt API タイムアウト
        API--xCR: Timeout
        CR-->>HS: err(new Error("Request timeout"))
    else API レート制限
        API-->>CR: 429 Too Many Requests
        CR-->>HS: err(new Error("Rate limit exceeded"))
    else API サーバーエラー
        API-->>CR: 500 Internal Server Error
        CR-->>HS: err(new Error("Cohere API error: 500"))
    end

    HS->>FB: 結果を確認

    alt Result.isErr()
        Note over FB: フォールバック処理
        FB->>FB: fusedScoreでソート
        FB->>FB: limit件に切り詰め
        FB-->>HS: candidates.slice(0, limit)
    end
```

### 3.2 複数Reranker切り替え

```mermaid
sequenceDiagram
    participant HS as HybridSearcher
    participant CR as CohereReranker
    participant VR as VoyageReranker
    participant NR as NoOpReranker

    HS->>CR: rerank(query, candidates, limit)
    CR-->>HS: err(error)

    Note over HS: Cohereが失敗、Voyageを試行

    HS->>VR: rerank(query, candidates, limit)
    VR-->>HS: err(error)

    Note over HS: Voyageも失敗、NoOpにフォールバック

    HS->>NR: rerank(query, candidates, limit)
    NR-->>HS: ok(candidates.slice(0, limit))

    Note over HS: 最終結果を返却
```

---

## 4. 並列処理シーケンス

### 4.1 検索戦略の並列実行

```mermaid
sequenceDiagram
    participant HS as HybridSearcher
    participant PA as Promise.all
    participant KS as KeywordStrategy
    participant VS as VectorStrategy
    participant GS as GraphStrategy

    HS->>PA: Promise.all([kSearch, vSearch, gSearch])

    par 並列実行
        PA->>KS: search(query)
        PA->>VS: search(query)
        PA->>GS: search(query)
    end

    Note over KS,GS: 各戦略が独立して実行

    KS-->>PA: SearchResult[]
    VS-->>PA: SearchResult[]
    GS-->>PA: SearchResult[]

    PA-->>HS: [keywordResults, semanticResults, graphResults]
```

---

## 5. 状態遷移

### 5.1 Fusion処理の状態遷移

```
┌─────────┐     resultSets, weights     ┌─────────────┐
│  IDLE   │ ─────────────────────────▶  │  PROCESSING │
└─────────┘                             └──────┬──────┘
                                               │
                     ┌─────────────────────────┼─────────────────────────┐
                     │                         │                         │
                     ▼                         ▼                         ▼
              ┌─────────────┐         ┌─────────────┐           ┌─────────────┐
              │  SCORING    │         │  MERGING    │           │  SORTING    │
              └──────┬──────┘         └──────┬──────┘           └──────┬──────┘
                     │                         │                         │
                     └─────────────────────────┴─────────────────────────┘
                                               │
                                               ▼
                                       ┌─────────────┐
                                       │  COMPLETED  │
                                       └─────────────┘
```

### 5.2 Reranking処理の状態遷移

```
┌─────────┐     query, candidates       ┌─────────────┐
│  IDLE   │ ─────────────────────────▶  │  VALIDATING │
└─────────┘                             └──────┬──────┘
                                               │
                         ┌─────────────────────┼─────────────────────────┐
                         │                     │                         │
                         ▼                     ▼                         ▼
                  ┌─────────────┐       ┌─────────────┐          ┌─────────────┐
                  │ EMPTY_INPUT │       │  SKIP_RERANK│          │  SCORING    │
                  │ (ok([]))    │       │ (ok(slice)) │          └──────┬──────┘
                  └─────────────┘       └─────────────┘                 │
                                                                ┌──────┴──────┐
                                                                │             │
                                                                ▼             ▼
                                                         ┌─────────┐   ┌─────────┐
                                                         │ SUCCESS │   │ FAILURE │
                                                         │ ok()    │   │ err()   │
                                                         └─────────┘   └────┬────┘
                                                                            │
                                                                            ▼
                                                                     ┌─────────────┐
                                                                     │  FALLBACK   │
                                                                     │  ok(slice)  │
                                                                     └─────────────┘
```

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-13 | 1.0.0      | 初版作成 |
