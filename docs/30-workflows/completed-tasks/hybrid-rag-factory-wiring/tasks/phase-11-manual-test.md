# Phase 11: 手動テスト - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目          | 値                                                          |
| ------------- | ----------------------------------------------------------- |
| タスクID      | `UT-RAG-08-002`                                             |
| Phase         | `11 - 手動テスト`                                           |
| 前提Phase     | `Phase 10: 最終レビュー`                                    |
| 次Phase       | `Phase 12: ドキュメント`                                    |
| 対象ファイル  | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日        | 2026-03-20                                                  |
| 前Phase成果物 | `outputs/phase-10/final-review.md`                          |

## 目的

UI ではなく service wiring task として、non-visual walkthrough を実施し、実際の実行手順と確認観点を人間が追える形で固定する。Phase 12 で書く `implementation-guide.md` の材料を揃える。

## P53 準拠: NON_VISUAL 判定

本 task は `HybridRAGFactory` の service wiring であり、UI コンポーネントを持たない。CLI 環境での Electron 画面キャプチャは不要である。以下の理由から NON_VISUAL walkthrough を採用する:

- 検証対象がすべてコードレベルの contract と型整合である
- テスト結果ログがスクリーンショットと同等の証跡となる
- `pnpm vitest run` と `tsc --noEmit` の出力がエビデンスになる

## 実行タスク

- [x] command walkthrough: typecheck / test / sample invocation を実行しログを記録する
- [x] keyword adapter 動作確認: adapter を経由した keyword search の接続を確認する
- [x] reranker 4 分岐の確認: cohere / voyage / llm / none の各分岐が正しく生成されることを確認する
- [x] CRAG 条件分岐の確認: `enableCRAG === true` / `false` の両ケースを確認する
- [x] limitation walkthrough: graph queryType limitation を手順で再確認する
- [x] handoff 整理: Phase 12 の implementation guide に流用できる材料をまとめる

## 手動テスト手順

### MT-01: typecheck と lint の確認

```bash
pnpm --filter @repo/shared exec tsc --noEmit
pnpm --filter @repo/shared lint
```

確認観点:

- エラー 0 件
- lint PASS

### MT-02: factory テストのスコープ実行

```bash
cd packages/shared && pnpm vitest run src/services/search/__tests__/hybrid-rag-factory.test.ts
```

確認観点:

- 全テスト PASS
- `createFull()` の正常系・異常系が全て通過
- `createLite()` の正常系が通過
- `KeywordSearchStrategyAdapter` の単体テストが通過

### MT-03: placeholder と stub の残存確認

```bash
grep -rn "@placeholder" packages/shared/src/services/search/hybrid-rag-factory.ts
grep -rn "FACTORY_NOT_READY" packages/shared/src/services/search/hybrid-rag-factory.ts
```

確認観点: 両方ともゼロ件

### MT-04: createFull() の sample invocation 読み合わせ

以下の pseudocode が設計（DT-04）と一致することを確認する:

```
1. validateFullConfig(config) -- 4条件バリデーション
2. LLMQueryClassifier(config.llmProvider, new RuleBasedQueryClassifier())
3. KeywordSearchStrategyAdapter(new KeywordSearchStrategy(config.db))
4. VectorSearchStrategy(config.db, config.embeddingProvider)
5. GraphSearchStrategy(config.graphStore, config.embeddingProvider, config.communitySummarizer)
6. RRFFusion(config.rrfK ?? 60)
7. createReranker(config) -- cohere / voyage / llm / none の 4 分岐
8. createCrag(config) -- enableCRAG の条件分岐
9. HybridRAGEngine(classifier, { keyword, semantic, graph }, fusion, reranker, crag)
```

### MT-05: createLite() の sample invocation 読み合わせ

以下の pseudocode が設計（DT-05）と一致することを確認する:

```
1. RuleBasedQueryClassifier()
2. KeywordSearchStrategyAdapter(new KeywordSearchStrategy(config.db))
3. VectorSearchStrategy(config.db, config.embeddingProvider)
4. GraphSearchStrategy(config.graphStore, config.embeddingProvider) -- communitySummarizer なし
5. RRFFusion() -- デフォルト K=60
6. NoOpReranker()
7. null (CRAG なし)
8. HybridRAGEngine(...)
```

### MT-06: reranker 4 分岐の確認

テストログ上で以下のケースが `PASS` になっていることを確認する:

| ケース                      | 確認条件                                      |
| --------------------------- | --------------------------------------------- |
| `rerankerType === "cohere"` | `cohereApiKey` 有り → `CohereReranker` 生成   |
| `rerankerType === "cohere"` | `cohereApiKey` なし → 明示エラー              |
| `rerankerType === "voyage"` | `voyageApiKey` 有り → `VoyageReranker` 生成   |
| `rerankerType === "voyage"` | `voyageApiKey` なし → 明示エラー              |
| `rerankerType === "llm"`    | `rerankerLlmClient` 有り → `LLMReranker` 生成 |
| `rerankerType === "llm"`    | `rerankerLlmClient` なし → 明示エラー         |
| `rerankerType === "none"`   | `NoOpReranker` 生成                           |

### MT-07: CRAG 条件分岐の確認

テストログ上で以下のケースが `PASS` になっていることを確認する:

| ケース                                          | 確認条件                |
| ----------------------------------------------- | ----------------------- |
| `enableCRAG === true` かつ `cragLlmClient` 有り | `CorrectiveRAG` 生成    |
| `enableCRAG === true` かつ `cragLlmClient` なし | 明示エラー              |
| `enableCRAG === false`                          | `null` が engine に渡る |
| `enableCRAG` 未定義                             | `null` が engine に渡る |

### MT-08: limitation の再確認

- `GraphSearchStrategy` が `queryType` を engine から受け取らない制約を再確認する。
- これは defect ではなく limitation として記録する。
- `command-transcript.md` に「graph strategy は local mode で動作する（KL-01）」と明示する。

## 統合テスト連携

- manual walkthrough では `createFull()` / `createLite()` の sample invocation を通じて、factory から engine までの組み立て順序を追う。
- typecheck / vitest / grep の 3 種の証跡で、実装・テスト・既知制約の整合を確認する。
- NON_VISUAL task のため、画面キャプチャの代わりに checklist と transcript を統合証跡として保持する。

## implementation guide 向け材料

Phase 12 の Part 1（中学生レベル）で使う説明素材:

- factory を「工場の組み立てライン」として説明できる: `createFull()` は全部品を搭載した高性能ライン、`createLite()` は標準部品だけの基本ライン
- adapter を「変換アダプター」として説明できる: キーワード検索を engine が理解できる形式に変換する
- バリデーションを「入荷チェック」として説明できる: 必要な部品が全部揃っているか確認してから組み立てを始める

Phase 12 の Part 2（開発者向け）で使う説明素材:

- `FullHybridRAGConfig` の 3 LLM 系統分離の設計理由
- `KeywordSearchStrategyAdapter` の bridge 責務の説明
- `validateFullConfig` の 4 条件と P62 / P42 準拠の説明
- 既知制約（KL-01 / KL-02）の詳細

## 参照資料

| 資料名                    | パス / 場所                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| Phase 2 設計成果物        | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-2/design.md`              |
| Phase 5 実装成果物        | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-5/implementation-plan.md` |
| Phase 9 品質レポート      | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-9/quality-report.md`      |
| Phase 10 最終レビュー結果 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-10/final-review.md`       |
| pitfalls P53              | `.claude/rules/06-known-pitfalls.md#P53`                                                   |

## 成果物

| 成果物         | パス                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| 手動テスト結果 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-11/manual-test-result.md` |
| コマンド記録   | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-11/command-transcript.md` |

## 完了条件

- [x] NON_VISUAL walkthrough の理由が明記されている（P53 準拠）
- [x] MT-01〜MT-08 の確認観点が全て実施されている
- [x] 代表コマンドの実行結果ログが `command-transcript.md` に記録されている
- [x] 全テスト PASS が `manual-test-result.md` に記録されている
- [x] `@placeholder` / `FACTORY_NOT_READY` ゼロ件が確認されている
- [x] limitation（KL-01 / KL-02）が再確認されている
- [x] Phase 12 implementation guide の材料がまとまっている

## 多角的チェック観点（AIが判断）

1. NON_VISUAL が許容される理由として十分な説明がされているか。
2. sample invocation の pseudocode が実装コードと一致しているか。
3. reranker 4 分岐のテストログがすべて PASS になっているか。
4. Phase 12 の Part 1 説明素材が「日常の例え」として中学生レベルになっているか。

## タスク100%実行確認【必須】

- [x] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [x] MT-01〜MT-08 の全手順を実施した
- [x] handoff 材料が Phase 12 に渡せることを確認した
- [x] NON_VISUAL 判定の根拠が記録されていることを確認した

## 次Phase

Phase 12: ドキュメント → `phase-12-documentation.md`
