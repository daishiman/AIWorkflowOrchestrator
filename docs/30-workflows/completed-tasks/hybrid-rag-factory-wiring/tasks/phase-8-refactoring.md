# Phase 8: リファクタリング - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目          | 値                                                          |
| ------------- | ----------------------------------------------------------- |
| タスクID      | `UT-RAG-08-002`                                             |
| Phase         | `8 - リファクタリング`                                      |
| 前提Phase     | `Phase 7: カバレッジ確認`                                   |
| 次Phase       | `Phase 9: 品質保証`                                         |
| 対象ファイル  | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日        | 2026-03-20                                                  |
| 前Phase成果物 | `outputs/phase-7/coverage-report.md`                        |

## 目的

Phase 5〜7 で実装した wiring を、責務境界と可読性を保ちながら整理する。振る舞いを変えずに helper / adapter / test setup の冗長を削り、Phase 9 品質確認に安定して渡せる状態にする。

## 実行タスク

- [ ] helper 整理: `validateFullConfig` / `createReranker` / `createCrag` の重複ロジックを削る
- [ ] adapter 整理: `KeywordSearchStrategyAdapter` の bridge 処理が単一責務に保たれているか確認する
- [ ] naming 整理: import alias と config プロパティ名が DT-01 設計と一致しているか確認する
- [ ] test 整理: `describe` ブロック間の重複 `beforeEach` setup を削減する
- [ ] `@placeholder` / `FACTORY_NOT_READY` 残存確認: 以下のコマンドを実行してゼロ件を確認する

```bash
grep -rn "@placeholder" packages/shared/src/services/search/hybrid-rag-factory.ts
grep -rn "FACTORY_NOT_READY" packages/shared/src/services/search/hybrid-rag-factory.ts
```

## リファクタリング観点

### RF-01: createFull() / createLite() の共通ロジック抽出

- `SearchStrategies` オブジェクト（`keyword` / `semantic` / `graph`）の生成は両メソッドで構造が共通である。
- `createKeywordStrategy(db)` / `createSemanticStrategy(db, embeddingProvider)` / `createGraphStrategy(graphStore, embeddingProvider, communitySummarizer?)` を private static helper として整理する。
- `createFull()` と `createLite()` 本体は orchestration のみに絞る。

### RF-02: private static メソッドの分割粒度

| helper                  | 引数                  | 戻り値                   | 備考                       |
| ----------------------- | --------------------- | ------------------------ | -------------------------- |
| `validateFullConfig`    | `FullHybridRAGConfig` | `void`                   | 4 条件のバリデーション集約 |
| `createKeywordStrategy` | `db`                  | `ISearchStrategy`        | adapter 生成のみ           |
| `createReranker`        | `FullHybridRAGConfig` | `IReranker`              | 4 分岐のみ                 |
| `createCrag`            | `FullHybridRAGConfig` | `ICorrectiveRAG \| null` | CRAG 条件分岐のみ          |

- 各 helper は 1 つの責務のみ持つ。
- `createFull()` のシグネチャは変えない（caller への影響なし）。

### RF-03: 命名規則の統一

- import alias は `RerankerLLMClient` / `CragLLMClient` で DT-01 と一致させる。
- config プロパティ名は `llmProvider` / `rerankerLlmClient` / `cragLlmClient` に統一する。
- `KeywordSearchStrategyAdapter` クラス名は変えない（adapter 責務を名前で示す）。

### RF-04: テスト setup の整理

- `createFullConfig()` / `createLiteConfig()` のファクトリ関数をテストヘルパーに抽出する。
- `beforeEach` での mock reset を一か所に集約する。
- integration test と unit test の `describe` 分離を維持する。

## 実行手順

1. `packages/shared/src/services/search/hybrid-rag-factory.ts` を読む
2. `@placeholder` / `FACTORY_NOT_READY` がゼロ件であることを grep で確認する
3. helper 重複を特定し、private static メソッドへ抽出する
4. `packages/shared/src/services/search/__tests__/hybrid-rag-factory.test.ts` の重複 setup を整理する
5. refactor 後にスコープテストを再実行し、振る舞い差分がないことを確認する

```bash
cd packages/shared && pnpm vitest run src/services/search/__tests__/hybrid-rag-factory.test.ts
```

6. 結果を `outputs/phase-8/refactoring-log.md` に記録する

## 統合テスト連携

- refactor 後に以下のスコープテストを再実行し、wiring 挙動が変わっていないことを確認する
- `keyword adapter + semantic + graph` の 3 strategy 接続が維持されていることを確認する
- `rerankerType` 4 分岐と `enableCRAG` 条件分岐が refactor 前後で同一挙動であることを確認する

## 参照資料

| 資料名                   | パス / 場所                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書           | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-2-design.md`                                                        |
| Phase 5 実装仕様書       | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-5-implementation.md`                                                |
| Phase 7 カバレッジ仕様書 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-7-coverage-check.md`                                                |
| Phase 1 要件成果物       | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-1/requirements.md`                                          |
| Phase 2 設計成果物       | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-2/design.md`                                                |
| Phase 5 実装成果物       | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-5/implementation-plan.md`                                   |
| Phase 7 カバレッジ成果物 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-7/coverage-report.md`                                       |
| pitfalls                 | `.claude/rules/06-known-pitfalls.md#P19`, `.claude/rules/06-known-pitfalls.md#P34`, `.claude/rules/06-known-pitfalls.md#P62` |

## 成果物

| 成果物               | パス                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| リファクタリング記録 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-8/refactoring-log.md` |

## 完了条件

- [ ] `@placeholder` と `FACTORY_NOT_READY` がゼロ件であることが確認されている
- [ ] helper / adapter / test setup の重複が削減されている
- [ ] refactor 前後でスコープテストの結果が変わっていない
- [ ] naming と import alias が DT-01 設計と一致している
- [ ] Phase 9 の品質確認観点が整理されている

## 多角的チェック観点（AIが判断）

1. helper 抽出で責務が散りすぎていないか。各 helper が 1 責務に収まっているか。
2. `KeywordSearchStrategyAdapter` が adapter 責務を超えて肥大化していないか。
3. alias 名（`RerankerLLMClient` / `CragLLMClient`）が implementation detail を漏らしていないか。
4. `createFull()` と `createLite()` の共通部分抽出が過剰な抽象化になっていないか。

## タスク100%実行確認【必須】

- [ ] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [ ] refactor の目的と範囲が振る舞い変更なしであることを確認した
- [ ] `@placeholder` / `FACTORY_NOT_READY` のゼロ件確認を実施した
- [ ] Phase 9 へ品質確認の材料が揃っていることを確認した

## 次Phase

Phase 9: 品質保証 → `phase-9-quality-assurance.md`
