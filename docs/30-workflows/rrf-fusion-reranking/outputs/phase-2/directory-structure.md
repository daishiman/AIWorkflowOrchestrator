# RRF Fusion + Reranking - ディレクトリ構造設計

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | CONV-07-05 |
| フェーズ   | Phase 2    |
| 作成日     | 2026-01-13 |
| ステータス | 完了       |

---

## 1. ディレクトリ構造

### 1.1 全体構造

```
packages/shared/src/services/search/
├── index.ts                          # メインエクスポート
├── types.ts                          # 共通型定義（SearchWeights等）
├── fusion/
│   ├── index.ts                      # Fusionモジュールエクスポート
│   ├── types.ts                      # Fusion固有型（IFusionStrategy, FusedSearchResult）
│   ├── rrf-fusion.ts                 # RRFFusion, WeightedScoreFusion実装
│   └── __tests__/
│       └── rrf-fusion.test.ts        # Fusionテスト
├── reranking/
│   ├── index.ts                      # Rerankingモジュールエクスポート
│   ├── types.ts                      # Reranking固有型（IReranker, RerankerOptions）
│   ├── cross-encoder-reranker.ts     # 全Reranker実装
│   └── __tests__/
│       └── reranker.test.ts          # Rerankerテスト
├── strategies/                        # 既存の検索戦略
│   ├── keyword-search-strategy.ts
│   ├── vector-search-strategy.ts
│   └── graph-search-strategy.ts
└── __tests__/
    └── integration/
        └── fusion-reranking.integration.test.ts  # 統合テスト
```

### 1.2 新規追加ファイル

| ファイル                               | 種別         | 内容                               |
| -------------------------------------- | ------------ | ---------------------------------- |
| `fusion/index.ts`                      | エクスポート | Fusionモジュールの公開API          |
| `fusion/types.ts`                      | 型定義       | IFusionStrategy, FusedSearchResult |
| `fusion/rrf-fusion.ts`                 | 実装         | RRFFusion, WeightedScoreFusion     |
| `fusion/__tests__/rrf-fusion.test.ts`  | テスト       | Fusionユニットテスト               |
| `reranking/index.ts`                   | エクスポート | Rerankingモジュールの公開API       |
| `reranking/types.ts`                   | 型定義       | IReranker, RerankerOptions等       |
| `reranking/cross-encoder-reranker.ts`  | 実装         | 全Reranker実装                     |
| `reranking/__tests__/reranker.test.ts` | テスト       | Rerankerユニットテスト             |

---

## 2. ファイル詳細

### 2.1 fusion/index.ts

```typescript
/**
 * Fusion モジュールエクスポート
 */
export { RRFFusion, WeightedScoreFusion } from "./rrf-fusion";
export type { IFusionStrategy, FusedSearchResult } from "./types";
```

### 2.2 fusion/types.ts

```typescript
/**
 * Fusion固有の型定義
 */
import type { ChunkId } from "@/types/branded";
import type { SearchResult, SearchWeights } from "../types";

/**
 * 検索結果統合戦略のインターフェース
 */
export interface IFusionStrategy {
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[];
}

/**
 * 統合済み検索結果
 */
export interface FusedSearchResult {
  chunkId: ChunkId;
  content: string;
  fusedScore: number;
  rerankedScore?: number;
  sources: Array<{
    strategy: "keyword" | "semantic" | "graph";
    rank: number;
    score: number;
  }>;
  metadata: Record<string, unknown>;
}
```

### 2.3 fusion/rrf-fusion.ts

```typescript
/**
 * RRF Fusion + Weighted Score Fusion 実装
 */
import type { SearchResult, SearchWeights } from "../types";
import type { IFusionStrategy, FusedSearchResult } from "./types";

export class RRFFusion implements IFusionStrategy {
  // 実装...
}

export class WeightedScoreFusion implements IFusionStrategy {
  // 実装...
}
```

### 2.4 reranking/index.ts

```typescript
/**
 * Reranking モジュールエクスポート
 */
export {
  LLMReranker,
  CohereReranker,
  VoyageReranker,
  NoOpReranker,
} from "./cross-encoder-reranker";
export type { IReranker, RerankerOptions } from "./types";
```

### 2.5 reranking/types.ts

```typescript
/**
 * Reranking固有の型定義
 */
import type { Result } from "@/types/rag/result";
import type { FusedSearchResult } from "../fusion/types";

/**
 * リランキングインターフェース
 */
export interface IReranker {
  rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}

/**
 * リランカーオプション
 */
export interface RerankerOptions {
  alwaysRerank?: boolean;
  batchSize?: number;
}

/**
 * Cohere APIレスポンス型
 */
export interface CohereRerankResponse {
  results: Array<{
    index: number;
    relevance_score: number;
  }>;
}

/**
 * Voyage APIレスポンス型
 */
export interface VoyageRerankResponse {
  data: Array<{
    index: number;
    relevance_score: number;
  }>;
}
```

### 2.6 reranking/cross-encoder-reranker.ts

```typescript
/**
 * Cross-Encoder Reranker 実装
 */
import { ok, err, type Result } from "@/types/rag/result";
import type { ILLMClient } from "@/services/llm/types";
import type { FusedSearchResult } from "../fusion/types";
import type {
  IReranker,
  RerankerOptions,
  CohereRerankResponse,
  VoyageRerankResponse,
} from "./types";

export class LLMReranker implements IReranker {
  // 実装...
}

export class CohereReranker implements IReranker {
  // 実装...
}

export class VoyageReranker implements IReranker {
  // 実装...
}

export class NoOpReranker implements IReranker {
  // 実装...
}
```

---

## 3. インポート構成

### 3.1 内部インポート関係

```
┌─────────────────────────────────────────────────────────────┐
│                    Import Relationships                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  packages/shared/src/services/search/index.ts                │
│      ↑                                                       │
│      ├── fusion/index.ts                                     │
│      │       ↑                                               │
│      │       ├── fusion/rrf-fusion.ts                        │
│      │       │       ↑                                       │
│      │       │       └── fusion/types.ts                     │
│      │       │               ↑                               │
│      │       │               └── ../types.ts                 │
│      │       │                                               │
│      │       └── fusion/types.ts                             │
│      │                                                       │
│      └── reranking/index.ts                                  │
│              ↑                                               │
│              ├── reranking/cross-encoder-reranker.ts         │
│              │       ↑                                       │
│              │       ├── reranking/types.ts                  │
│              │       ├── fusion/types.ts                     │
│              │       └── @/types/rag/result.ts               │
│              │                                               │
│              └── reranking/types.ts                          │
│                      ↑                                       │
│                      └── fusion/types.ts                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 外部依存インポート

| インポート元           | インポート対象  |
| ---------------------- | --------------- |
| `@/types/branded`      | ChunkId         |
| `@/types/rag/result`   | Result, ok, err |
| `@/services/llm/types` | ILLMClient      |

---

## 4. エクスポート設計

### 4.1 メインエクスポート（search/index.ts）

```typescript
/**
 * Search Service メインエクスポート
 */

// Fusion
export { RRFFusion, WeightedScoreFusion } from "./fusion";
export type { IFusionStrategy, FusedSearchResult } from "./fusion";

// Reranking
export {
  LLMReranker,
  CohereReranker,
  VoyageReranker,
  NoOpReranker,
} from "./reranking";
export type { IReranker, RerankerOptions } from "./reranking";

// 既存エクスポート（省略）
```

### 4.2 公開API一覧

| カテゴリ  | エクスポート名      | 種別      |
| --------- | ------------------- | --------- |
| Fusion    | RRFFusion           | class     |
| Fusion    | WeightedScoreFusion | class     |
| Fusion    | IFusionStrategy     | interface |
| Fusion    | FusedSearchResult   | interface |
| Reranking | LLMReranker         | class     |
| Reranking | CohereReranker      | class     |
| Reranking | VoyageReranker      | class     |
| Reranking | NoOpReranker        | class     |
| Reranking | IReranker           | interface |
| Reranking | RerankerOptions     | interface |

---

## 5. テストファイル構成

### 5.1 ユニットテスト

| テストファイル                         | テスト対象                     |
| -------------------------------------- | ------------------------------ |
| `fusion/__tests__/rrf-fusion.test.ts`  | RRFFusion, WeightedScoreFusion |
| `reranking/__tests__/reranker.test.ts` | 全Reranker実装                 |

### 5.2 統合テスト

| テストファイル                                               | テスト対象                   |
| ------------------------------------------------------------ | ---------------------------- |
| `__tests__/integration/fusion-reranking.integration.test.ts` | Fusion→Rerankingパイプライン |

---

## 6. 命名規則

### 6.1 ファイル名

| パターン             | 例                      |
| -------------------- | ----------------------- |
| ケバブケース         | `rrf-fusion.ts`         |
| テストファイル       | `*.test.ts`             |
| 統合テスト           | `*.integration.test.ts` |
| 型定義ファイル       | `types.ts`              |
| エクスポートファイル | `index.ts`              |

### 6.2 クラス/インターフェース名

| パターン         | 例                           |
| ---------------- | ---------------------------- |
| クラス           | PascalCase (`RRFFusion`)     |
| インターフェース | IPascalCase (`IReranker`)    |
| 型エイリアス     | PascalCase (`SearchWeights`) |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-13 | 1.0.0      | 初版作成 |
