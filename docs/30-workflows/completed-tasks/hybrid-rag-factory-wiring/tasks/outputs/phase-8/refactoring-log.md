# Phase 8: リファクタリング記録

## 実行結果

| 項目                 | 結果                                              |
| -------------------- | ------------------------------------------------- |
| 実行日               | 2026-03-21                                        |
| リファクタリング対象 | hybrid-rag-factory.ts, hybrid-rag-factory.test.ts |
| テスト結果           | 43 PASS (変更なし)                                |

## プレースホルダー残存確認

```
grep -rn "@placeholder" hybrid-rag-factory.ts -> 0件
grep -rn "FACTORY_NOT_READY" hybrid-rag-factory.ts -> 0件
```

## RF-01: createFull/createLite 共通ロジック評価

### 評価結果: 現状維持 (過剰抽象化回避)

共通部分:

- `new KeywordSearchStrategyAdapter(new KeywordSearchStrategy(config.db))` -- 共通
- `new VectorSearchStrategy(config.db, config.embeddingProvider)` -- 共通
- `new GraphSearchStrategy(...)` -- 引数が異なる (communitySummarizer の有無)

差異:

- createFull: `GraphSearchStrategy(graphStore, embeddingProvider, communitySummarizer)`
- createLite: `GraphSearchStrategy(graphStore, embeddingProvider)` (communitySummarizer なし)
- createFull: RRFFusion に rrfK を渡す
- createLite: RRFFusion にデフォルト値

判断: 3行程度の共通コードに対して helper 関数を作ると、引数の増加と間接参照が増え可読性が低下する。Phase 8 仕様書の「共通部分抽出が過剰な抽象化になっていないか」の注意に従い、現状維持とする。

## RF-02: private static メソッド分割粒度

| helper             | 責務                | 状態                              |
| ------------------ | ------------------- | --------------------------------- |
| validateFullConfig | 4条件バリデーション | 適切 - 単一責務                   |
| createReranker     | 4分岐 Reranker 生成 | 適切 - switch 文で明確            |
| createCRAG         | CRAG 条件分岐       | 適切 - enableCRAG チェック + 生成 |

全 helper が単一責務に収まっている。追加の分割は不要。

## RF-03: 命名規則統一

| 項目                         | 現状                   | DT-01 準拠 |
| ---------------------------- | ---------------------- | ---------- |
| import alias (Reranker)      | `RerankerLLMClient`    | OK         |
| import alias (CRAG)          | `CragLLMClient`        | OK         |
| config.rerankerLlmClient     | `RerankerLLMClient` 型 | OK         |
| config.cragLlmClient         | `CragLLMClient` 型     | OK         |
| KeywordSearchStrategyAdapter | クラス名維持           | OK         |

## RF-04: テスト setup 整理

| 項目                   | 現状                           | 状態 |
| ---------------------- | ------------------------------ | ---- |
| createBaseFullConfig() | テストヘルパー関数             | 適切 |
| createBaseLiteConfig() | テストヘルパー関数             | 適切 |
| beforeEach mock reset  | 全体で1箇所 (vi.clearAllMocks) | 適切 |
| describe ブロック分離  | Phase 4 + Phase 6 拡充で分離   | 適切 |

## 結論

コードは既に Phase 5 時点で適切な構造化がされており、大きなリファクタリングは不要。
全テスト 43 PASS を維持。Phase 9 に進行可能。
