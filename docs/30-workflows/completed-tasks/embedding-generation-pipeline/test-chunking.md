# チャンキングサービス テスト仕様書

## 文書情報

| 項目       | 内容                |
| ---------- | ------------------- |
| 文書ID     | TEST-CHUNKING-001   |
| バージョン | 1.0.0               |
| 作成日     | 2025-12-26          |
| ステータス | Draft               |
| 作成者     | Unit Tester         |
| 関連文書   | DESIGN-CHUNKING-001 |

---

## 1. 概要

### 1.1 目的

チャンキングサービスのユニットテストを定義する。4種類のチャンキング戦略（fixed, sentence, semantic, hierarchical）とContextual Embeddings、Late Chunkingの機能を網羅的にテストする。

### 1.2 テスト方針

- **TDD（Test-Driven Development）**: Red → Green → Refactorサイクル
- **Mock使用**: 外部依存（Tokenizer, EmbeddingClient, LLMClient）はモックを使用
- **網羅性**: 正常系、異常系、境界値、エッジケースをカバー
- **独立性**: 各テストケースは独立して実行可能
- **可読性**: describe/it構造で意図を明確に

---

## 2. テスト対象

### 2.1 クラス・インターフェース

- `IChunkingStrategy` - チャンキング戦略インターフェース
- `FixedChunkingStrategy` - 固定サイズチャンキング
- `SentenceChunkingStrategy` - 文単位チャンキング
- `SemanticChunkingStrategy` - セマンティックチャンキング
- `HierarchicalChunkingStrategy` - 階層チャンキング
- `ChunkingService` - チャンキングサービス統合

### 2.2 依存モジュール

- `ITokenizer` - トークナイザーインターフェース
- `IEmbeddingClient` - 埋め込みクライアント（セマンティック戦略用）
- `ILLMClient` - LLMクライアント（Contextual Embeddings用）

---

## 3. テストケース

### 3.1 FixedChunkingStrategy

#### 3.1.1 正常系

| テストケース名           | 入力                                       | 期待される出力                    | 検証ポイント                       |
| ------------------------ | ------------------------------------------ | --------------------------------- | ---------------------------------- |
| 正確なチャンクサイズ分割 | 500トークンのテキスト、chunkSize=100       | 5個のチャンク、各100トークン      | チャンク数、各チャンクのトークン数 |
| オーバーラップあり分割   | 500トークン、chunkSize=100, overlapSize=20 | 6個のチャンク、オーバーラップ20   | オーバーラップが正しく設定される   |
| 端数処理                 | 550トークン、chunkSize=100                 | 6個のチャンク（最後は50トークン） | 最終チャンクが短くてもOK           |

#### 3.1.2 境界値テスト

| テストケース名                     | 入力                      | 期待される出力              | 検証ポイント       |
| ---------------------------------- | ------------------------- | --------------------------- | ------------------ |
| 最小チャンクサイズ                 | 10トークン、chunkSize=10  | 1個のチャンク               | 最小サイズでも動作 |
| テキストがチャンクサイズより小さい | 50トークン、chunkSize=100 | 1個のチャンク（50トークン） | 分割不要ケース     |
| 空文字列                           | "", chunkSize=100         | 0個のチャンク               | 空文字列処理       |

#### 3.1.3 異常系

| テストケース名                         | 入力                           | 期待される動作  | エラーメッセージ                  |
| -------------------------------------- | ------------------------------ | --------------- | --------------------------------- |
| 無効なチャンクサイズ（0）              | chunkSize=0                    | ValidationError | "chunkSize must be > 0"           |
| 無効なチャンクサイズ（負数）           | chunkSize=-10                  | ValidationError | "chunkSize must be positive"      |
| オーバーラップがチャンクサイズを超える | chunkSize=100, overlapSize=150 | ValidationError | "overlapSize must be < chunkSize" |

---

### 3.2 SentenceChunkingStrategy

#### 3.2.1 正常系

| テストケース名       | 入力                                                      | 期待される出力                 | 検証ポイント           |
| -------------------- | --------------------------------------------------------- | ------------------------------ | ---------------------- |
| 文境界でチャンク分割 | "Sentence 1. Sentence 2. Sentence 3.", targetChunkSize=20 | 文境界でチャンク化             | 文の途中で分割されない |
| 段落境界を優先       | 複数段落テキスト、preserveParagraphs=true                 | 段落境界でチャンク化           | 段落が保持される       |
| 文オーバーラップ     | sentenceOverlap=1                                         | 前の文が次のチャンクに含まれる | オーバーラップが正しい |

#### 3.2.2 境界値テスト

| テストケース名   | 入力                                     | 期待される出力         | 検証ポイント   |
| ---------------- | ---------------------------------------- | ---------------------- | -------------- |
| 1文のみ          | "Single sentence."                       | 1個のチャンク          | 最小ケース     |
| 非常に長い文     | 1000トークンの単一文                     | maxChunkSizeで強制分割 | 長文の分割処理 |
| カスタム文区切り | sentenceDelimiters=['.', '!', '?', '。'] | 日本語文も正しく分割   | 多言語対応     |

#### 3.2.3 異常系

| テストケース名                          | 入力                                  | 期待される動作  | エラーメッセージ                          |
| --------------------------------------- | ------------------------------------- | --------------- | ----------------------------------------- |
| targetChunkSizeがmaxChunkSizeより大きい | targetChunkSize=200, maxChunkSize=100 | ValidationError | "targetChunkSize must be <= maxChunkSize" |
| 無効なsentenceOverlap                   | sentenceOverlap=-1                    | ValidationError | "sentenceOverlap must be >= 0"            |

---

### 3.3 SemanticChunkingStrategy

#### 3.3.1 正常系

| テストケース名     | 入力                                         | 期待される出力         | 検証ポイント         |
| ------------------ | -------------------------------------------- | ---------------------- | -------------------- |
| 類似度ベース分割   | 意味的に異なる3段落、similarityThreshold=0.7 | 意味境界でチャンク化   | 類似度計算が機能     |
| 強制分割マーカー   | breakPoints=["---", "###"]                   | マーカー位置で分割     | 強制分割が優先される |
| 埋め込みモデル指定 | embeddingModel="text-embedding-3-small"      | 指定モデルで類似度計算 | モデル切り替え       |

#### 3.3.2 境界値テスト

| テストケース名 | 入力                    | 期待される出力            | 検証ポイント |
| -------------- | ----------------------- | ------------------------- | ------------ |
| 類似度閾値0.0  | similarityThreshold=0.0 | すべて分割                | 最小閾値     |
| 類似度閾値1.0  | similarityThreshold=1.0 | 分割されない（1チャンク） | 最大閾値     |

#### 3.3.3 異常系

| テストケース名   | 入力                            | 期待される動作  | エラーメッセージ                              |
| ---------------- | ------------------------------- | --------------- | --------------------------------------------- |
| 埋め込み生成失敗 | EmbeddingClient.embed()がエラー | ChunkingError   | "Failed to generate embeddings"               |
| 無効な類似度閾値 | similarityThreshold=1.5         | ValidationError | "similarityThreshold must be between 0 and 1" |

---

### 3.4 HierarchicalChunkingStrategy

#### 3.4.1 正常系

| テストケース名       | 入力                        | 期待される出力               | 検証ポイント     |
| -------------------- | --------------------------- | ---------------------------- | ---------------- |
| Markdown見出し階層   | "# H1\n## H2\n### H3\n段落" | 3レベルの階層チャンク        | 階層構造が正しい |
| 親コンテキスト継承   | inheritParentContext=true   | 子チャンクが親の見出しを含む | コンテキスト継承 |
| サマリーチャンク作成 | createSummaryChunks=true    | 各親チャンクにサマリーが付与 | サマリー生成     |

#### 3.4.2 境界値テスト

| テストケース名     | 入力                        | 期待される出力      | 検証ポイント |
| ------------------ | --------------------------- | ------------------- | ------------ |
| 最大深度制限       | maxDepth=3、6レベルの見出し | 3レベルまで         | 深度制限     |
| 見出しなしテキスト | 見出しがない平文            | フラットな1チャンク | fallback動作 |

#### 3.4.3 異常系

| テストケース名         | 入力           | 期待される動作  | エラーメッセージ          |
| ---------------------- | -------------- | --------------- | ------------------------- |
| 無効なmaxDepth         | maxDepth=0     | ValidationError | "maxDepth must be >= 1"   |
| 見出しパターン解析失敗 | 不正な正規表現 | ValidationError | "Invalid heading pattern" |

---

### 3.5 ChunkingService

#### 3.5.1 戦略切り替え

| テストケース名         | 入力                    | 期待される出力                   | 検証ポイント     |
| ---------------------- | ----------------------- | -------------------------------- | ---------------- |
| fixed戦略の実行        | strategy="fixed"        | FixedStrategyが使用される        | 戦略が正しく選択 |
| sentence戦略の実行     | strategy="sentence"     | SentenceStrategyが使用される     | 戦略切り替え     |
| semantic戦略の実行     | strategy="semantic"     | SemanticStrategyが使用される     | 外部依存注入     |
| hierarchical戦略の実行 | strategy="hierarchical" | HierarchicalStrategyが使用される | 階層処理         |

#### 3.5.2 Contextual Embeddings

| テストケース名             | 入力                                                        | 期待される出力                          | 検証ポイント       |
| -------------------------- | ----------------------------------------------------------- | --------------------------------------- | ------------------ |
| コンテキスト付与（prefix） | contextualEmbeddings.enabled=true, contextPosition="prefix" | 各チャンクにコンテキストがprefixされる  | コンテキスト位置   |
| コンテキスト付与（suffix） | contextPosition="suffix"                                    | コンテキストがsuffixされる              | コンテキスト位置   |
| コンテキストキャッシュ     | cacheContext=true                                           | 同じドキュメントで2回目はキャッシュ使用 | キャッシュ動作     |
| LLM呼び出しエラー          | LLMClient.generate()がエラー                                | 警告を返しつつ元のチャンクを返す        | エラーハンドリング |

#### 3.5.3 Late Chunking

| テストケース名                       | 入力                                                | 期待される出力               | 検証ポイント   |
| ------------------------------------ | --------------------------------------------------- | ---------------------------- | -------------- |
| トークンレベル埋め込み後チャンキング | lateChunking.enabled=true                           | 埋め込み→チャンク→プーリング | 処理順序       |
| mean pooling                         | poolingStrategy="mean"                              | 平均プーリング               | プーリング戦略 |
| CLS pooling                          | poolingStrategy="cls"                               | CLSトークン使用              | プーリング戦略 |
| attention pooling                    | poolingStrategy="attention"                         | Attention重み使用            | プーリング戦略 |
| maxSequenceLength超過                | 10000トークンのドキュメント、maxSequenceLength=8192 | 分割して処理                 | 長文処理       |

#### 3.5.4 統計情報

| テストケース名   | 入力                                   | 期待される出力                       | 検証ポイント |
| ---------------- | -------------------------------------- | ------------------------------------ | ------------ |
| 統計計算（正常） | 100トークンのテキスト、5チャンク       | totalChunks=5, avgChunkSize=20, etc. | 統計の正確性 |
| 処理時間計測     | 任意の入力                             | processingTimeMs > 0                 | 時間計測     |
| 警告メッセージ   | 非常に小さいチャンク（< minChunkSize） | warnings配列にメッセージ             | 警告生成     |

---

## 4. モック仕様

### 4.1 MockTokenizer

```typescript
class MockTokenizer implements ITokenizer {
  encode(text: string): number[] {
    // 簡易実装: 1文字 = 1トークン
    return Array.from({ length: text.length }, (_, i) => i);
  }

  decode(tokens: number[]): string {
    // 簡易実装
    return tokens.map((t) => String.fromCharCode(65 + (t % 26))).join("");
  }

  countTokens(text: string): number {
    return text.length; // 簡易実装
  }
}
```

### 4.2 MockEmbeddingClient

```typescript
class MockEmbeddingClient implements IEmbeddingClient {
  async embed(text: string): Promise<number[]> {
    // 固定次元（384次元）のダミーベクトル
    return Array.from({ length: 384 }, () => Math.random());
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}
```

### 4.3 MockLLMClient

```typescript
class MockLLMClient implements ILLMClient {
  async generate(prompt: string): Promise<string> {
    // ダミーコンテキスト生成
    return `Context for chunk (50 tokens)`;
  }
}
```

---

## 5. テストファイル構成

```
packages/shared/src/services/chunking/
├── __tests__/
│   ├── fixed-chunking-strategy.test.ts        # 固定サイズ戦略
│   ├── sentence-chunking-strategy.test.ts     # 文単位戦略
│   ├── semantic-chunking-strategy.test.ts     # セマンティック戦略
│   ├── hierarchical-chunking-strategy.test.ts # 階層戦略
│   ├── chunking-service.test.ts               # サービス統合
│   ├── contextual-embeddings.test.ts          # Contextual Embeddings
│   ├── late-chunking.test.ts                  # Late Chunking
│   └── mocks/
│       ├── mock-tokenizer.ts
│       ├── mock-embedding-client.ts
│       └── mock-llm-client.ts
```

---

## 6. カバレッジ目標

| カテゴリ           | 目標カバレッジ |
| ------------------ | -------------- |
| Line Coverage      | 85%以上        |
| Branch Coverage    | 80%以上        |
| Function Coverage  | 90%以上        |
| Statement Coverage | 85%以上        |

---

## 7. 実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/shared test:run

# チャンキングテストのみ実行
pnpm --filter @repo/shared test:run --  chunking

# カバレッジ測定
pnpm --filter @repo/shared test:coverage

# ウォッチモード
pnpm --filter @repo/shared test
```

---

## 8. 期待される実装順序（TDD）

1. **Red**: テストを書く（失敗することを確認）
2. **Green**: 最小限の実装でテストを通す
3. **Refactor**: コードを整理・最適化

### 実装順序

1. MockTokenizer, MockEmbeddingClient, MockLLMClient
2. FixedChunkingStrategy + テスト
3. SentenceChunkingStrategy + テスト
4. SemanticChunkingStrategy + テスト
5. HierarchicalChunkingStrategy + テスト
6. ChunkingService（戦略統合） + テスト
7. Contextual Embeddings + テスト
8. Late Chunking + テスト

---

## 9. 品質基準

### 9.1 テスト実行時間

- 全テストが**10秒以内**に完了すること
- 個別テストは**1秒以内**に完了すること

### 9.2 テストの独立性

- 各テストは他のテストに依存しないこと
- beforeEach/afterEachで状態をクリーンアップすること

### 9.3 可読性

- テストケース名は「何をテストするか」が明確
- Arrange-Act-Assert（AAA）パターンに従う
- 複雑なテストには説明コメントを追加

---

## 10. 参考資料

- [Vitest Documentation](https://vitest.dev/)
- [Testing TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Test-Driven Development (TDD) Principles](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
