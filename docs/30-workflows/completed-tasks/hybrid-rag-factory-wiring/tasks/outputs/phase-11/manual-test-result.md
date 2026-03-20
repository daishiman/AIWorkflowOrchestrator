# Phase 11 手動テスト結果 - UT-RAG-08-002

## タスクID: UT-RAG-08-002

## 実施日: 2026-03-21

## 判定サマリー: PASS

---

## NON_VISUAL 判定（P53 準拠）

本タスクは `HybridRAGFactory` の service wiring であり、UI コンポーネントを持たない。
CLI 環境での Electron 画面キャプチャは不要。tsc / vitest / grep の出力ログを証跡とする。

---

## MT-01: TypeScript 型チェック

| 確認項目                             | 結果 |
| ------------------------------------ | ---- |
| `pnpm exec tsc --noEmit` エラー 0 件 | PASS |

---

## MT-02: factory テストのスコープ実行

| 確認項目                                  | 結果  |
| ----------------------------------------- | ----- |
| 全テスト PASS                             | PASS  |
| テスト数                                  | 43 件 |
| `createFull()` 正常系・異常系             | PASS  |
| `createLite()` 正常系                     | PASS  |
| `KeywordSearchStrategyAdapter` 単体テスト | PASS  |

---

## MT-03: プレースホルダー残存確認

| 確認項目                   | 結果 |
| -------------------------- | ---- |
| `@placeholder` ゼロ件      | PASS |
| `FACTORY_NOT_READY` ゼロ件 | PASS |

---

## MT-04: createFull() コード読み合わせ

設計 DT-04 との一致確認（hybrid-rag-factory.ts L120-154）:

| ステップ                                                                           | 実装確認                                       | 結果 |
| ---------------------------------------------------------------------------------- | ---------------------------------------------- | ---- |
| 1. validateFullConfig(config)                                                      | L121 — 4条件バリデーション                     | PASS |
| 2. LLMQueryClassifier(llmProvider, fallback)                                       | L123-127 — RuleBasedQueryClassifier がfallback | PASS |
| 3. KeywordSearchStrategyAdapter(new KeywordSearchStrategy(db))                     | L129-131 — adapter 経由                        | PASS |
| 4. VectorSearchStrategy(db, embeddingProvider)                                     | L132-135                                       | PASS |
| 5. GraphSearchStrategy(graphStore, embeddingProvider, communitySummarizer)         | L136-140                                       | PASS |
| 6. RRFFusion(config.rrfK ?? 60)                                                    | L142 — デフォルト60                            | PASS |
| 7. createReranker(config)                                                          | L143 — 4分岐                                   | PASS |
| 8. createCRAG(config)                                                              | L144 — enableCRAG 条件分岐                     | PASS |
| 9. HybridRAGEngine(classifier, {keyword, semantic, graph}, fusion, reranker, crag) | L146-153                                       | PASS |

---

## MT-05: createLite() コード読み合わせ

設計 DT-05 との一致確認（hybrid-rag-factory.ts L159-185）:

| ステップ                                                                       | 実装確認 | 結果 |
| ------------------------------------------------------------------------------ | -------- | ---- |
| 1. RuleBasedQueryClassifier()                                                  | L160     | PASS |
| 2. KeywordSearchStrategyAdapter(new KeywordSearchStrategy(db))                 | L162-164 | PASS |
| 3. VectorSearchStrategy(db, embeddingProvider)                                 | L165-168 | PASS |
| 4. GraphSearchStrategy(graphStore, embeddingProvider) communitySummarizer なし | L169-172 | PASS |
| 5. RRFFusion() デフォルト K=60                                                 | L174     | PASS |
| 6. NoOpReranker()                                                              | L175     | PASS |
| 7. null (CRAG なし)                                                            | L181     | PASS |
| 8. HybridRAGEngine(...)                                                        | L177-184 | PASS |

---

## MT-06: reranker 4 分岐の確認

| ケース                         | テスト                    | 結果 |
| ------------------------------ | ------------------------- | ---- |
| cohere + cohereApiKey 有り     | CohereReranker 生成       | PASS |
| cohere + cohereApiKey なし     | 明示エラー                | PASS |
| cohere + cohereApiKey 空白のみ | P42 準拠 .trim() チェック | PASS |
| voyage + voyageApiKey 有り     | VoyageReranker 生成       | PASS |
| voyage + voyageApiKey なし     | 明示エラー                | PASS |
| voyage + voyageApiKey 空白のみ | P42 準拠 .trim() チェック | PASS |
| llm + rerankerLlmClient 有り   | LLMReranker 生成          | PASS |
| llm + rerankerLlmClient なし   | 明示エラー                | PASS |
| none                           | NoOpReranker 生成         | PASS |

---

## MT-07: CRAG 条件分岐の確認

| ケース                                | テスト                | 結果 |
| ------------------------------------- | --------------------- | ---- |
| enableCRAG: true + cragLlmClient 有り | CorrectiveRAG 生成    | PASS |
| enableCRAG: true + cragLlmClient なし | 明示エラー            | PASS |
| enableCRAG: false 明示                | null が engine に渡る | PASS |
| enableCRAG 未定義                     | null が engine に渡る | PASS |

---

## MT-08: limitation の再確認

### KL-01: GraphSearchStrategy queryType 非伝播（既知制限）

- 状態: defect ではなく limitation として記録済み
- 回帰ガードテスト: ETC-09 が PASS → 将来の変更を検知可能
- 改善タスク: `UT-RAG-08-006` として未タスク化済み
- command-transcript.md に「graph strategy は local mode で動作する（KL-01）」を明示

### KL-02: KeywordSearchStrategyAdapter bridge 責務

- KeywordSearchStrategy（独自型）→ ISearchStrategy インターフェースへのブリッジ
- adapter が新規作成され直接依存が排除されていることを確認済み

---

## 新規ファイル確認

| ファイル                                                                            | 結果          |
| ----------------------------------------------------------------------------------- | ------------- |
| `packages/shared/src/services/search/strategies/keyword-search-strategy-adapter.ts` | 存在確認 PASS |

---

## Phase 12 実装ガイド向け材料

### Part 1（中学生レベル日常例え）

- **factory = 組み立てライン**: `createFull()` は全部品を搭載した高性能ライン、`createLite()` は標準部品だけの基本ライン
- **adapter = 変換アダプター**: `KeywordSearchStrategyAdapter` がキーワード検索を engine が理解できる形式に変換する
- **validateFullConfig = 入荷チェック**: 必要な部品（API キー等）が全部揃っているか確認してから組み立てを始める
- **3種の AI スタッフ分離**: `llmProvider`（分類担当）、`rerankerLlmClient`（並び替え担当）、`cragLlmClient`（補正担当）が独立していることで担当替えが容易

### Part 2（開発者向け）

- `FullHybridRAGConfig` の 3 LLM 系統分離の設計理由: 各 LLM の差し替えを独立して行えるため
- `KeywordSearchStrategyAdapter` の bridge 責務: `ISearchStrategy` インターフェース統一のために必要
- `validateFullConfig` の 4 条件と P62/P42 準拠: silent fallback を排除し明示的エラーを保証
- KL-01: GraphSearchStrategy は local mode で動作する（queryType 伝播は UT-RAG-08-006 で改善予定）
- KL-02: ILLMClient 型が2系統（crag/reranker）存在する（統一は UT-RAG-08-007 で改善予定）

---

## 完了条件チェック

- [x] NON_VISUAL walkthrough の理由が明記されている（P53 準拠）
- [x] MT-01〜MT-08 の確認観点が全て実施されている
- [x] 代表コマンドの実行結果ログが `command-transcript.md` に記録されている
- [x] 全テスト PASS（43件）が記録されている
- [x] `@placeholder` / `FACTORY_NOT_READY` ゼロ件が確認されている
- [x] limitation（KL-01 / KL-02）が再確認されている
- [x] Phase 12 implementation guide の材料がまとまっている
