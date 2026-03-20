# Phase 4: テスト作成 - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目           | 値                                                                         |
| -------------- | -------------------------------------------------------------------------- |
| タスクID       | UT-RAG-08-002                                                              |
| Phase          | 4 - テスト作成                                                             |
| 前提Phase      | Phase 3: 設計レビュー                                                      |
| 次Phase        | Phase 5: 実装                                                              |
| 対象ファイル   | `packages/shared/src/services/search/hybrid-rag-factory.ts`                |
| テストファイル | `packages/shared/src/services/search/__tests__/hybrid-rag-factory.test.ts` |
| 作成日         | 2026-03-20                                                                 |
| 前Phase成果物  | `outputs/phase-3/design-review.md`                                         |

## 目的

Phase 2 設計と Phase 3 レビュー結果に基づき、`createFull()` / `createLite()` の全テストケースを Red 状態で作成する。ILLMClient 型不整合（Phase 3 MAJOR）の設計判断が未確定のため、両選択肢に対応可能なテスト設計とする。

## 実行タスク

- Factory 正常系テスト作成: createFull() の rerankerType 4パターン + CRAG 有効/無効を Red テストで固定する
- Factory 異常系テスト作成: P42/P62 準拠のバリデーションエラーを Red テストで固定する
- 後方互換性テスト作成: createForTesting() の既存動作を回帰ガードとして固定する
- 型安全性テスト作成: プレースホルダー型の残存を検出するガードを追加する
- import path 確認: P63 に沿って実在パスのみを参照する

## ILLMClient 型不整合への対応方針

Phase 3 レビューで発見された MAJOR 指摘:

| モジュール         | import 元         | complete() シグネチャ                                                                                             |
| ------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| LLMReranker        | `../../llm/types` | `complete(prompt: string, options?: LLMCompletionOptions): Promise<Result<string, Error>>`                        |
| RelevanceEvaluator | `./crag/types`    | `complete(options: { prompt: string; maxTokens?: number; temperature?: number }): Promise<Result<string, Error>>` |

Phase 2 DT-01 の採用選択肢に依存するため、テストでは以下の方針を取る:

1. モックオブジェクトは Engine コンポーネントのインターフェースレベル（IQueryClassifier, ISearchStrategy, IFusionStrategy, IReranker, ICorrectiveRAG）で作成し、具象クラスのコンストラクタ引数型には依存しない
2. Config のモックヘルパーで `llmClient` と `llmProvider` を抽象化し、選択肢A（`cragLlmClient` 追加）と選択肢B（`ILLMClient` 統一）の両方で動作するテスト設計にする
3. `createFull()` / `createLite()` の返り値は `instanceof HybridRAGEngine` で検証する

## テストケース設計

### 正常系: createFull()

#### TC-01: rerankerType: "none" で HybridRAGEngine を返す

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| 目的     | 最小構成の createFull() が HybridRAGEngine を返すことを検証        |
| 入力     | 全必須プロパティを持つ FullHybridRAGConfig（rerankerType: "none"） |
| 期待結果 | HybridRAGEngine インスタンスが返される                             |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true           |

#### TC-02: rerankerType: "cohere" で HybridRAGEngine を返す

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 目的     | CohereReranker が正しく生成されることを検証                             |
| 入力     | FullHybridRAGConfig（rerankerType: "cohere", cohereApiKey: "test-key"） |
| 期待結果 | HybridRAGEngine インスタンスが返される                                  |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true                |

#### TC-03: rerankerType: "voyage" で HybridRAGEngine を返す

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 目的     | VoyageReranker が正しく生成されることを検証                             |
| 入力     | FullHybridRAGConfig（rerankerType: "voyage", voyageApiKey: "test-key"） |
| 期待結果 | HybridRAGEngine インスタンスが返される                                  |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true                |

#### TC-04: rerankerType: "llm" で HybridRAGEngine を返す

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| 目的     | LLMReranker が正しく生成されることを検証                 |
| 入力     | FullHybridRAGConfig（rerankerType: "llm"）               |
| 期待結果 | HybridRAGEngine インスタンスが返される                   |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true |

#### TC-05: enableCRAG: true で CRAG 付き Engine を返す

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| 目的     | enableCRAG: true で CorrectiveRAG が生成されることを検証    |
| 入力     | FullHybridRAGConfig（enableCRAG: true, llmClient 設定済み） |
| 期待結果 | HybridRAGEngine インスタンスが返される                      |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true    |

#### TC-06: enableCRAG 未指定で CRAG なし Engine を返す

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| 目的     | enableCRAG 省略時に CRAG が null であることを検証        |
| 入力     | FullHybridRAGConfig（enableCRAG 省略）                   |
| 期待結果 | HybridRAGEngine インスタンスが返される                   |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true |

#### TC-07: enableCRAG: true + webSearcher で Web 検索補強付き Engine を返す

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| 目的     | CRAG + WebSearcher の組み合わせが正しく構成されることを検証                                  |
| 入力     | FullHybridRAGConfig（enableCRAG: true, webSearcher: mockWebSearcher, enableWebSearch: true） |
| 期待結果 | HybridRAGEngine インスタンスが返される                                                       |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true                                     |

#### TC-08: rrfK パラメータが RRFFusion に渡される

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| 目的     | カスタム rrfK 値で Engine が生成されることを検証         |
| 入力     | FullHybridRAGConfig（rrfK: 30）                          |
| 期待結果 | HybridRAGEngine インスタンスが返される                   |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true |

### 正常系: createLite()

#### TC-09: RuleBasedQueryClassifier + NoOpReranker + crag: null

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| 目的     | createLite() が軽量版 Engine を正しく生成することを検証  |
| 入力     | LiteHybridRAGConfig（db, embeddingProvider, graphStore） |
| 期待結果 | HybridRAGEngine インスタンスが返される                   |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true |

### 後方互換性: createForTesting()

#### TC-10: 既存動作が変更されない

| 項目     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 目的     | createForTesting() のインターフェースと動作が変更されていないことを検証        |
| 入力     | TestMocks（queryClassifier, keywordStrategy, semanticStrategy, graphStrategy） |
| 期待結果 | HybridRAGEngine インスタンスが返される                                         |
| 検証方法 | `expect(engine).toBeInstanceOf(HybridRAGEngine)` が true                       |

### エラー系: createFull()

#### TC-11: rerankerType: "cohere" で cohereApiKey 未指定時にエラー

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 目的     | P62 準拠: 暗黙 fallback せずエラーを throw することを検証                   |
| 入力     | FullHybridRAGConfig（rerankerType: "cohere", cohereApiKey 省略）            |
| 期待結果 | Error が throw される                                                       |
| 検証方法 | `expect(() => HybridRAGFactory.createFull(config)).toThrow(/cohereApiKey/)` |

#### TC-12: rerankerType: "cohere" で cohereApiKey 空白のみ時にエラー（P42 準拠）

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 目的     | P42 準拠: .trim() バリデーションで空白のみの API キーを拒否することを検証   |
| 入力     | FullHybridRAGConfig（rerankerType: "cohere", cohereApiKey: " "）            |
| 期待結果 | Error が throw される                                                       |
| 検証方法 | `expect(() => HybridRAGFactory.createFull(config)).toThrow(/cohereApiKey/)` |

#### TC-13: rerankerType: "voyage" で voyageApiKey 未指定時にエラー

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 目的     | P62 準拠: 暗黙 fallback せずエラーを throw することを検証                   |
| 入力     | FullHybridRAGConfig（rerankerType: "voyage", voyageApiKey 省略）            |
| 期待結果 | Error が throw される                                                       |
| 検証方法 | `expect(() => HybridRAGFactory.createFull(config)).toThrow(/voyageApiKey/)` |

#### TC-14: rerankerType: "voyage" で voyageApiKey 空白のみ時にエラー（P42 準拠）

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 目的     | P42 準拠: .trim() バリデーションで空白のみの API キーを拒否することを検証   |
| 入力     | FullHybridRAGConfig（rerankerType: "voyage", voyageApiKey: " "）            |
| 期待結果 | Error が throw される                                                       |
| 検証方法 | `expect(() => HybridRAGFactory.createFull(config)).toThrow(/voyageApiKey/)` |

#### TC-15: llmProvider 未指定時にエラー

| 項目     | 内容                                                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 目的     | createFull() で LLMQueryClassifier に必要な llmProvider が未指定の場合にエラーを throw することを検証                                   |
| 入力     | FullHybridRAGConfig（llmProvider 省略）                                                                                                 |
| 期待結果 | Error が throw される                                                                                                                   |
| 検証方法 | `expect(() => HybridRAGFactory.createFull(config)).toThrow(/llmProvider/)` -- DT-01 選択肢に依存するため、プロパティ名は Phase 5 で確定 |

#### TC-16: createFull() - rerankerType "llm" で rerankerLlmClient 未指定時にエラー

- **目的**: P62 準拠 — rerankerType が "llm" の場合に rerankerLlmClient（または llmClient）が未指定だとエラーになることを確認
- **前提条件**: DT-01 選択肢（A or B）の確定後に調整が必要
- **入力**: `createFullConfig()` から `rerankerLlmClient` を除外、`rerankerType: "llm"`
- **期待結果**: `HybridRAGFactory.createFull(): LLMReranker requires rerankerLlmClient (or llmClient) in config` を throw
- **関連 Pitfall**: P62

#### TC-17: createFull() - enableCRAG true で cragLlmClient 未指定時にエラー

- **目的**: P62 準拠 — enableCRAG が true の場合に cragLlmClient（または llmClient）が未指定だとエラーになることを確認
- **前提条件**: DT-01 選択肢（A or B）の確定後に調整が必要
- **入力**: `createFullConfig()` から `cragLlmClient` を除外、`enableCRAG: true`
- **期待結果**: `HybridRAGFactory.createFull(): CRAG requires cragLlmClient (or llmClient) in config` を throw
- **関連 Pitfall**: P62

### 型安全性

#### TC-18: プレースホルダー型が残存していない

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 目的     | `@placeholder` タグと `DrizzleClient` 型エイリアスが残存していないことを検証 |
| 入力     | ソースファイル `hybrid-rag-factory.ts` の内容                                |
| 期待結果 | `@placeholder` が 0 件、`type DrizzleClient` が 0 件                         |
| 検証方法 | `fs.readFileSync` でソース読み込み → 正規表現マッチで検証                    |

## テストヘルパー設計

### モック Config ファクトリ

```typescript
function createFullConfig(
  overrides?: Partial<FullHybridRAGConfig>,
): FullHybridRAGConfig {
  return {
    db: mockDb,
    embeddingProvider: mockEmbeddingProvider,
    graphStore: mockGraphStore,
    llmClient: mockLlmClient,
    llmProvider: mockLlmProvider, // DT-01 選択肢A の場合
    rerankerType: "none",
    ...overrides,
  };
}

function createLiteConfig(
  overrides?: Partial<LiteHybridRAGConfig>,
): LiteHybridRAGConfig {
  return {
    db: mockDb,
    embeddingProvider: mockEmbeddingProvider,
    graphStore: mockGraphStore,
    ...overrides,
  };
}
```

### モックオブジェクト

```typescript
const mockDb = {} as LibSQLDatabase<Record<string, never>>;
const mockEmbeddingProvider = {
  modelId: "test-model" as EmbeddingModelId,
  embed: vi.fn(),
  embedBatch: vi.fn(),
} as unknown as IEmbeddingProvider;
const mockGraphStore = {
  upsertEntity: vi.fn(),
  getEntity: vi.fn(),
} as unknown as IKnowledgeGraphStore;
const mockLlmClient = {
  complete: vi.fn(),
} as unknown as ILLMClient;
const mockLlmProvider = {
  modelId: "test",
  generate: vi.fn(),
} as unknown as ILLMProvider;
const mockWebSearcher = {
  search: vi.fn(),
} as unknown as IWebSearcher;
```

## テスト構造

```
describe("HybridRAGFactory", () => {
  describe("createFull()", () => {
    describe("正常系", () => {
      it("TC-01: rerankerType: 'none' で HybridRAGEngine を返す")
      it("TC-02: rerankerType: 'cohere' で HybridRAGEngine を返す")
      it("TC-03: rerankerType: 'voyage' で HybridRAGEngine を返す")
      it("TC-04: rerankerType: 'llm' で HybridRAGEngine を返す")
      it("TC-05: enableCRAG: true で CRAG 付き Engine を返す")
      it("TC-06: enableCRAG 未指定で CRAG なし Engine を返す")
      it("TC-07: enableCRAG: true + webSearcher で Web 検索補強付き Engine を返す")
      it("TC-08: rrfK パラメータが RRFFusion に渡される")
    })
    describe("エラー系", () => {
      it("TC-11: rerankerType: 'cohere' で cohereApiKey 未指定時にエラー")
      it("TC-12: rerankerType: 'cohere' で cohereApiKey 空白のみ時にエラー（P42）")
      it("TC-13: rerankerType: 'voyage' で voyageApiKey 未指定時にエラー")
      it("TC-14: rerankerType: 'voyage' で voyageApiKey 空白のみ時にエラー（P42）")
      it("TC-15: llmProvider 未指定時にエラー")
      it("TC-16: rerankerType: 'llm' で rerankerLlmClient 未指定時にエラー（P62）")
      it("TC-17: enableCRAG: true で cragLlmClient 未指定時にエラー（P62）")
    })
  })
  describe("createLite()", () => {
    it("TC-09: 正常系 -- RuleBasedQueryClassifier + NoOpReranker + crag: null")
  })
  describe("createForTesting()", () => {
    it("TC-10: 後方互換性 -- 既存動作が変更されない")
  })
  describe("型安全性", () => {
    it("TC-16: プレースホルダー型が残存していない")
  })
})
```

## 参照資料

| 資料名                                        | パス / 場所                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| Phase 1 要件定義書                            | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-1-requirements.md`         |
| Phase 2 設計書                                | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-2-design.md`               |
| Phase 3 設計レビュー                          | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-3-design-review.md`        |
| hybrid-rag-factory.ts（現在のスタブ実装）     | `packages/shared/src/services/search/hybrid-rag-factory.ts`                         |
| hybrid-rag-engine.ts（Engine コンストラクタ） | `packages/shared/src/services/search/hybrid-rag-engine.ts` L162-175                 |
| quality-requirements-details                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements-details.md` |
| P42: .trim() バリデーション漏れ               | `.claude/rules/06-known-pitfalls.md#P42`                                            |
| P60: IPC レスポンス形式不一致                 | `.claude/rules/06-known-pitfalls.md#P60`                                            |
| P62: DEFAULT_CONFIG fallback 禁止             | `.claude/rules/06-known-pitfalls.md#P62`                                            |
| P63: サブエージェントのインポートパス誤り     | `.claude/rules/06-known-pitfalls.md#P63`                                            |

## 成果物

| 成果物           | パス                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| テストコード     | `packages/shared/src/services/search/__tests__/hybrid-rag-factory.test.ts`         |
| テストマトリクス | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-4/test-matrix.md` |

## 完了条件

- [ ] TC-01〜TC-18 の全テストケースが Red 状態（テスト失敗）で作成されている
- [ ] テストヘルパー（createFullConfig, createLiteConfig, モックオブジェクト）が定義されている
- [ ] ILLMClient 型不整合に対して、両選択肢（A: cragLlmClient 追加 / B: ILLMClient 統一）に対応可能なモック設計になっている
- [ ] P42 準拠の空白のみバリデーションテスト（TC-12, TC-14）が含まれている
- [ ] P60 準拠: createFull() / createLite() は直接 Error を throw するため、`expect(() => ...).toThrow()` でテストしている（IPC レスポンス形式のアサーションではない）
- [ ] createForTesting() の後方互換性テスト（TC-10）が含まれている
- [ ] プレースホルダー型残存チェック（TC-18）が含まれている
- [ ] import path が実在パスで構成されている（P63 準拠）
- [ ] `cd packages/shared && pnpm vitest run src/services/search/__tests__/hybrid-rag-factory.test.ts` で全テストが実行される（失敗は Phase 5 で解消）

## 統合テスト連携

- TC-05〜TC-07 は CRAG パイプラインの統合動作を間接検証する。Phase 6 でより詳細な統合テストに拡張する
- TC-01〜TC-04 の Reranker 4パターンは、Phase 6 で各 Reranker の分岐内部まで検証するテストに拡張する
- `HybridRAGEngine.search()` を使う integration path は Phase 7 で再実行する

## 多角的チェック観点（AIが判断）

1. **P60 準拠**: createFull() / createLite() は直接 Error を throw するため、IPC レスポンス形式（`{ success: false, error: { code, message } }`）のアサーションは不要。`expect(() => ...).toThrow()` でテストする
2. **テスト実行ディレクトリ（P40 対策）**: テストは `cd packages/shared && pnpm vitest run` で実行する。プロジェクトルートからの実行では vitest.config.ts が正しく読み込まれない可能性がある
3. **error message assertion の粒度**: 全文一致ではなくキーワード一致（`/cohereApiKey/`）でテストする。エラーメッセージの文言変更に対して脆弱にならない設計
4. **KeywordSearchStrategy のモック**: パーミッション制限でコンストラクタ未確認のため、モックレベルで対応する。Phase 5 開始時にコンストラクタシグネチャを確認し、テストヘルパーを調整する

## タスク100%実行確認【必須】

- [ ] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [ ] 全テストケース（TC-01〜TC-18）が設計されていることを確認した
- [ ] 実装前に失敗させるべき観点が揃っていることを確認した
- [ ] 次 Phase（Phase 5: 実装）への引き継ぎ情報が十分であることを確認した

## 次Phase

Phase 5: 実装 → `phase-5-implementation.md`
