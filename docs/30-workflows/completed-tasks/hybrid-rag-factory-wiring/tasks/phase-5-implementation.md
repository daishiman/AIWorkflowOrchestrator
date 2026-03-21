# Phase 5: 実装 - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目          | 値                                                          |
| ------------- | ----------------------------------------------------------- |
| タスクID      | UT-RAG-08-002                                               |
| Phase         | 5 - 実装                                                    |
| 前提Phase     | Phase 4: テスト作成                                         |
| 次Phase       | Phase 6: テスト拡充                                         |
| 対象ファイル  | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日        | 2026-03-20                                                  |
| 前Phase成果物 | `outputs/phase-4/test-matrix.md`                            |

## 目的

Phase 2 設計に従い、`hybrid-rag-factory.ts` のプレースホルダー型を実型に置換し、`createFull()` / `createLite()` のスタブ throw を実配線に置き換える。Phase 4 の Red テストを Green にする。

## 実行タスク

- プレースホルダー削除: L23-L63 の5つのプレースホルダー型定義を削除し、実型 import に置換する
- Config 型更新: FullHybridRAGConfig / LiteHybridRAGConfig のプロパティ型を実型に更新する
- createFull() 実装: スタブ throw を除去し、6引数の Engine 組み立てロジックを実装する
- createLite() 実装: スタブ throw を除去し、軽量版 Engine 組み立てロジックを実装する
- createReranker() 抽出: Reranker 選択ロジックを private static メソッドに抽出する
- バリデーション追加: P62/P42 準拠の入力バリデーションを実装する
- 回帰保護: createForTesting() の既存動作を維持する

## 実装前確認事項

Phase 5 開始時に以下を必ず確認する:

### KeywordSearchStrategy コンストラクタ確認

パーミッション制限で Phase 1-3 で未確認。以下のコマンドで確認する:

```bash
grep -A 5 "constructor" packages/shared/src/services/search/keyword-search-strategy.ts
```

確認結果に基づき、createFull() / createLite() の KeywordSearchStrategy 生成コードを調整する。

### ILLMClient 型互換性の最終確認

Phase 3 レビューで MAJOR 指摘された ILLMClient の2系統を最終確認する:

```bash
# llm/types.ts の ILLMClient シグネチャ
grep -A 10 "export interface ILLMClient" packages/shared/src/services/llm/types.ts

# crag/types.ts の ILLMClient シグネチャ
grep -A 10 "export interface ILLMClient" packages/shared/src/services/search/crag/types.ts

# RelevanceEvaluator の import 元
head -20 packages/shared/src/services/search/crag/relevance-evaluator.ts
```

確認結果に基づき DT-01 の選択肢（A: Config に cragLlmClient 追加 / B: ILLMClient 統一）を確定する。

## 実装手順

### Step 1: プレースホルダー型の削除と import 置換

**削除対象**: L23-L63 の以下5つ

```typescript
// 削除: interface IEmbeddingProvider { ... }
// 削除: interface IKnowledgeGraphStore { ... }
// 削除: interface ILLMClient { ... }
// 削除: type DrizzleClient = unknown;
// 削除: interface IWebSearcher { ... }
```

**追加する import 文**:

```typescript
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { IEmbeddingProvider } from "../../embedding/providers/interfaces";
import type { IKnowledgeGraphStore } from "../../graph/knowledge-graph-store";
import type { ILLMClient } from "../../llm/types";
import type { ILLMProvider } from "../../extraction/interfaces";
import type { IWebSearcher, CRAGOptions } from "./crag/types";
```

追加 import（具象クラス）:

```typescript
import { RuleBasedQueryClassifier } from "./rule-based-query-classifier";
import { LLMQueryClassifier } from "./llm-query-classifier";
import { KeywordSearchStrategy } from "./keyword-search-strategy";
import { VectorSearchStrategy } from "./strategies/vector-search-strategy";
import { GraphSearchStrategy } from "./strategies/graph-search-strategy";
import {
  CohereReranker,
  VoyageReranker,
  LLMReranker,
} from "./reranking/cross-encoder-reranker";
import { CorrectiveRAG } from "./crag/corrective-rag";
import { RelevanceEvaluator } from "./crag/relevance-evaluator";
```

### Step 2: Config 型更新

**FullHybridRAGConfig 変更点**:

- `db: DrizzleClient` → `db: LibSQLDatabase<Record<string, never>>`
- `llmProvider: ILLMProvider` を追加（DT-01 選択肢A の場合）
- その他プロパティは型名は同じだが、import 元が実型に変わる

**LiteHybridRAGConfig 変更点**:

- `db: DrizzleClient` → `db: LibSQLDatabase<Record<string, never>>`
- その他プロパティは型名は同じだが、import 元が実型に変わる

### Step 3: バリデーション実装

createFull() の先頭に以下のバリデーションを追加する:

```typescript
static createFull(config: FullHybridRAGConfig): HybridRAGEngine {
  // P62 準拠: 必須パラメータのバリデーション（暗黙 fallback 禁止）
  if (config.rerankerType === "cohere" && !config.cohereApiKey?.trim()) {
    throw new Error(
      "HybridRAGFactory.createFull(): CohereReranker requires a non-empty cohereApiKey in config",
    );
  }
  if (config.rerankerType === "voyage" && !config.voyageApiKey?.trim()) {
    throw new Error(
      "HybridRAGFactory.createFull(): VoyageReranker requires a non-empty voyageApiKey in config",
    );
  }
  // ... 以下 llmProvider バリデーション等（DT-01 選択肢に依存）
```

### Step 4: createFull() 実装

```typescript
static createFull(config: FullHybridRAGConfig): HybridRAGEngine {
  // Step 3 のバリデーション後...

  // 1. QueryClassifier
  const fallback = new RuleBasedQueryClassifier();
  const classifier = new LLMQueryClassifier(config.llmProvider, fallback);

  // 2. SearchStrategies
  const keyword = new KeywordSearchStrategy(config.db); // コンストラクタ要確認
  const semantic = new VectorSearchStrategy(config.db, config.embeddingProvider);
  const graph = new GraphSearchStrategy(config.graphStore, config.embeddingProvider);

  // 3. Fusion
  const fusion = new RRFFusion(config.rrfK ?? 60);

  // 4. Reranker
  const reranker = HybridRAGFactory.createReranker(config);

  // 5. CRAG
  const crag = config.enableCRAG
    ? HybridRAGFactory.createCRAG(config)
    : null;

  // 6. Engine
  return new HybridRAGEngine(
    classifier,
    { keyword, semantic, graph },
    fusion,
    reranker,
    crag,
  );
}
```

### Step 5: createLite() 実装

```typescript
static createLite(config: LiteHybridRAGConfig): HybridRAGEngine {
  const classifier = new RuleBasedQueryClassifier();

  const keyword = new KeywordSearchStrategy(config.db); // コンストラクタ要確認
  const semantic = new VectorSearchStrategy(config.db, config.embeddingProvider);
  const graph = new GraphSearchStrategy(config.graphStore, config.embeddingProvider);

  const fusion = new RRFFusion();
  const reranker = new NoOpReranker();

  return new HybridRAGEngine(
    classifier,
    { keyword, semantic, graph },
    fusion,
    reranker,
    null,
  );
}
```

### Step 6: createReranker() private static メソッド抽出

```typescript
private static createReranker(config: FullHybridRAGConfig): IReranker {
  switch (config.rerankerType) {
    case "cohere":
      return new CohereReranker(config.cohereApiKey!, {
        model: config.cohereModel,
      });
    case "voyage":
      return new VoyageReranker(config.voyageApiKey!);
    case "llm":
      return new LLMReranker(config.llmClient, {
        batchSize: config.rerankerBatchSize,
      });
    case "none":
      return new NoOpReranker();
  }
}
```

### Step 7: createCRAG() private static メソッド抽出

```typescript
private static createCRAG(config: FullHybridRAGConfig): ICorrectiveRAG {
  const evaluator = new RelevanceEvaluator(config.llmClient, {
    maxEvaluate: config.cragMaxEvaluate,
    correctThreshold: config.cragCorrectThreshold,
    incorrectThreshold: config.cragIncorrectThreshold,
  });

  const cragOptions: CRAGOptions = {
    enableWebSearch: config.enableWebSearch,
    enableRefinement: config.enableRefinement,
    ambiguousFilterThreshold: config.ambiguousFilterThreshold,
  };

  return new CorrectiveRAG(
    evaluator,
    config.webSearcher ?? null,
    cragOptions,
  );
}
```

**注意**: RelevanceEvaluator は `crag/types.ts` の `ILLMClient` を要求するが、Config の `llmClient` は `llm/types.ts` の `ILLMClient`。DT-01 選択肢に基づき、アダプタまたは別プロパティで対応する。

## 参照資料

| 資料名                                        | パス / 場所                                                                                     |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Phase 2 設計書                                | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-2-design.md`                           |
| Phase 3 設計レビュー                          | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-3-design-review.md`                    |
| Phase 4 テスト仕様                            | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-4-test-creation.md`                    |
| hybrid-rag-factory.ts（現在のスタブ実装）     | `packages/shared/src/services/search/hybrid-rag-factory.ts`                                     |
| hybrid-rag-engine.ts（Engine コンストラクタ） | `packages/shared/src/services/search/hybrid-rag-engine.ts` L162-175                             |
| RRFFusion コンストラクタ                      | `packages/shared/src/services/search/fusion/rrf-fusion.ts` L33（`constructor(k: number = 60)`） |
| search strategy types                         | `packages/shared/src/services/search/strategies/types.ts`                                       |
| P19: 型キャストバイパス禁止                   | `.claude/rules/06-known-pitfalls.md#P19`                                                        |
| P34: 遅延初期化 DI パターン選択               | `.claude/rules/06-known-pitfalls.md#P34`                                                        |
| P42: .trim() バリデーション漏れ               | `.claude/rules/06-known-pitfalls.md#P42`                                                        |
| P62: DEFAULT_CONFIG fallback 禁止             | `.claude/rules/06-known-pitfalls.md#P62`                                                        |

## 成果物

| 成果物     | パス                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| 実装コード | `packages/shared/src/services/search/hybrid-rag-factory.ts`                                |
| 実装計画   | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-5/implementation-plan.md` |

## 完了条件

- [ ] プレースホルダー型（L23-L63）が全て削除され、実型 import に置換されている
- [ ] `FACTORY_NOT_READY` エラーが除去されている
- [ ] createFull() がバリデーション + 6引数 Engine 組み立てを実装している
- [ ] createLite() が RuleBasedQueryClassifier + NoOpReranker + crag: null で Engine を生成している
- [ ] createReranker() が private static メソッドとして抽出され、4パターンの switch を実装している
- [ ] createCRAG() が private static メソッドとして抽出されている
- [ ] P42 準拠: 文字列パラメータに `.trim()` バリデーションが適用されている
- [ ] P62 準拠: 必須パラメータ未指定時にエラーを throw し、暗黙 fallback をしていない
- [ ] P19 準拠: `as` キャストが使用されていない
- [ ] createForTesting() の既存動作が変更されていない（後方互換性）
- [ ] ILLMClient 型不整合の設計判断が確定し、実装に反映されている
- [ ] KeywordSearchStrategy のコンストラクタシグネチャが確認され、実装に反映されている
- [ ] Phase 4 の Red テスト（TC-01〜TC-16）が全て Green になっている
- [ ] `pnpm --filter @repo/shared exec tsc --noEmit` が 0 エラー

## 統合テスト連携

- createFull() で生成した Engine に対して `search()` が呼べる状態を Phase 6 以降へ引き継ぐ
- `rerankerType: "llm"` と `enableCRAG: true` は Phase 6 で deeper case を追加する
- KeywordSearchStrategy adapter（Phase 3 MAJOR で識別）の統合テストは Phase 6 で追加する

## 多角的チェック観点（AIが判断）

1. **adapter の配置**: ILLMClient アダプタを Factory ファイル内に内包するか、別ファイルに分離するか。Factory の責務を超えない範囲で判断する
2. **RRFFusion の k パラメータ**: `config.rrfK ?? 60` でデフォルト値を Factory 側で持つか、`new RRFFusion(config.rrfK)` で RRFFusion のデフォルト値（60）に委譲するか。P62 の「暗黙 fallback 禁止」は外部サービスの必須パラメータに適用されるため、ライブラリ内部のデフォルト値は許容する
3. **type alias と import alias の衝突**: プレースホルダー削除後に同名の型が複数の import 元から来る場合（例: `ILLMClient`）、import alias で区別する必要がある

## タスク100%実行確認【必須】

- [ ] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [ ] 実装手順（Step 1〜7）が100%実行可能であることを確認した
- [ ] 実装前確認事項（KeywordSearchStrategy, ILLMClient）が記録されていることを確認した
- [ ] 次 Phase（Phase 6: テスト拡充）への引き継ぎ情報が十分であることを確認した

## 次Phase

Phase 6: テスト拡充 → `phase-6-test-expansion.md`
