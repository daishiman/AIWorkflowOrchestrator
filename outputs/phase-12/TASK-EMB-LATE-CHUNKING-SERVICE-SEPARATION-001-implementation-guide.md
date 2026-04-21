# Phase 12 実装ガイド

## タスクID: TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001

---

## Part 1: 中学生レベルの解説

### Late Chunking とは何か？

長い文章を検索・AI処理しやすくするため「チャンク（塊）」に分割するのがチャンキングです。
Late Chunking は「文章全体をまず一度AIに読ませてから、その後でチャンクに分割する」技術です。

通常のチャンキングは「先に分割 → 各チャンクをAIに渡す」順番ですが、Late Chunking では「全体をAIに渡す → 後からチャンクごとの情報を取り出す」順番になります。このため各チャンクが「前後の文脈を知っている」状態になり、検索精度が上がります。

### なぜ分離が必要だったか？

もともと `ChunkingService` という1つのクラスが「チャンク分割の指揮」と「Late Chunking の数学的計算」の両方を担当していました。1人の人間に「司令官」と「計算係」を同時にやらせているようなもので、役割が混ざると管理が難しくなります。

このタスクでは「計算係」の仕事だけを `ChunkingLateChunkingAdapter` という専用クラスに移しました。`ChunkingService` は「この計算はアダプタに頼む」と指示するだけになります。

### Adapter（アダプタ）という名前の理由

もともとの仕様書では `LateChunkingService` という名前が提案されていましたが、すでに同じディレクトリに `LateChunkingService` という別のクラスが存在していました（token-level 処理を担当）。名前の衝突を避けるため、「2つをつなぐ変換器」を意味する「Adapter」という名前にしました。

---

## Part 2: 技術詳細

### 1. クラス構造概要（ChunkingLateChunkingAdapter と ChunkingService の委譲関係）

```
ChunkingService
  ├── (コンストラクタ) ITokenizer, IEmbeddingClient, ILLMClient, ChunkingLateChunkingAdapter?
  ├── chunk() ─────────────────────────────────────→ [戦略ファサード（変更なし）]
  └── applyLateChunking() ─────────────────────────→ lateChunkingAdapter.applyLateChunking()
                                                                  ↓
                                               ChunkingLateChunkingAdapter
                                                 ├── applyLateChunking()      [public]
                                                 ├── determineChunkBoundaries() [public]
                                                 ├── poolTokenEmbeddings()    [public]
                                                 ├── getTokenEmbeddings()     [private]
                                                 ├── poolEmbeddingsByBoundaries() [private]
                                                 ├── buildChunkRanges()       [private]
                                                 ├── buildSegmentRanges()     [private]
                                                 ├── calculateOverlapUnits()  [private]
                                                 ├── findNearestSegmentIndex() [private]
                                                 └── averageEmbeddings()      [private]
```

`ChunkingService` はコンストラクタで `ChunkingLateChunkingAdapter` インスタンスを受け取る（DI）か、自動生成する。`applyLateChunking()` の実処理はアダプタに完全委譲される。

### 2. メソッド一覧（public / private 分類と各メソッドの責務）

#### Public メソッド（テスト可能・外部呼び出し可）

| メソッド名                 | シグネチャ                                              | 責務                                                                                                                           |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `applyLateChunking`        | `(text, chunks, options) => Promise<Chunk[]>`           | Late Chunking の統括エントリーポイント。文書トークナイズ → 埋め込み生成 → 境界特定 → プーリング → チャンク付与の全フローを制御 |
| `determineChunkBoundaries` | `(chunks) => number[]`                                  | チャンク配列から各チャンクの終端位置（`chunk.position.end`）を抽出し境界配列を返す                                             |
| `poolTokenEmbeddings`      | `(tokenEmbeddings, boundaries, strategy) => number[][]` | トークン埋め込み配列を境界位置で分割し、指定戦略でプーリングした埋め込み配列を返す                                             |

#### Private メソッド（内部処理）

| メソッド名                   | 責務                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `getTokenEmbeddings`         | トークン配列を `maxSequenceLength` 単位で分割し、各セグメントのテキスト埋め込みを `IEmbeddingClient` から取得 |
| `poolEmbeddingsByBoundaries` | チャンク範囲とセグメント範囲のオーバーラップを計算し、戦略に応じてプーリングを実行                            |
| `buildChunkRanges`           | 境界配列 `[b1, b2, b3]` を `[{start:0, end:b1}, {start:b1, end:b2}, ...]` の形式に変換                        |
| `buildSegmentRanges`         | セグメント数と総単位数から各セグメントの範囲を等分割で計算                                                    |
| `calculateOverlapUnits`      | チャンク範囲とセグメント範囲のオーバーラップ量（単位数）を計算                                                |
| `findNearestSegmentIndex`    | オーバーラップなしのチャンクに対し、中心点距離が最小のセグメントインデックスを返す                            |
| `averageEmbeddings`          | 複数の埋め込みベクトルを加重平均（重みなし時は均等平均）で合成                                                |

### 3. 実際の実装と仕様書の差分

| 項目                              | 仕様書当初                                                          | 実際の実装                                                              | 変更理由                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| クラス名                          | `LateChunkingService`                                               | `ChunkingLateChunkingAdapter`                                           | 同ディレクトリに既存 `LateChunkingService`（token-level）が存在し命名衝突が発生したため                                     |
| ファイル名                        | `LateChunkingService.ts`                                            | `chunking-late-chunking-adapter.ts`                                     | kebab-case 統一 + クラス名変更に追従                                                                                        |
| `determineChunkBoundaries` の実装 | 文字位置 → トークンインデックス変換（`charPositionToTokenIndex()`） | `chunk.position.end` を直接配列化                                       | `charPositionToTokenIndex()` の近似精度問題を回避。境界はすでに `Chunk.position.end` として管理されているため変換不要と判断 |
| コンストラクタ引数                | 2引数 `(tokenizer, embeddingClient)`                                | 同じ2引数（後方互換を維持）                                             | 変更なし                                                                                                                    |
| `ChunkingService` コンストラクタ  | 3引数 `(tokenizer, embeddingClient?, llmClient?)`                   | 4引数 `(tokenizer, embeddingClient?, llmClient?, lateChunkingAdapter?)` | テスト注入のため4番目オプショナル引数を追加。既存呼び出しへの影響ゼロ                                                       |

### 4. DI パターンの使用例（コンストラクタ注入）

#### パターン1: 本番環境（自動生成）

```typescript
// embeddingClient があれば ChunkingLateChunkingAdapter を自動生成
const service = new ChunkingService(tokenizer, embeddingClient, llmClient);
// 内部で new ChunkingLateChunkingAdapter(tokenizer, embeddingClient) が実行される
```

#### パターン2: テスト環境（モック注入）

```typescript
const mockAdapter = {
  applyLateChunking: vi.fn().mockResolvedValue([...]),
};

// 4番目引数でアダプタを注入
const service = new ChunkingService(
  tokenizer,
  embeddingClient,
  llmClient,
  mockAdapter as ChunkingLateChunkingAdapter,
);

// applyLateChunking の委譲確認
await service.chunk(input);
expect(mockAdapter.applyLateChunking).toHaveBeenCalledOnce();
```

#### パターン3: アダプタ単独テスト

```typescript
// ChunkingService を経由せず直接テスト可能になった
const adapter = new ChunkingLateChunkingAdapter(
  mockTokenizer,
  mockEmbeddingClient,
);
const boundaries = adapter.determineChunkBoundaries(chunks);
const pooled = adapter.poolTokenEmbeddings(embeddings, boundaries, "mean");
```

### 5. プーリング戦略の選択ガイド（mean / cls / attention）

| 戦略        | 動作                                                       | 推奨ユースケース                                                                                  |
| ----------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `mean`      | オーバーラップするすべてのセグメント埋め込みを均等平均     | 汎用。チャンクが複数セグメントにまたがる場合に全体を代表する埋め込みが欲しいとき                  |
| `cls`       | オーバーラップするセグメントのうち最初のもの（先頭）を採用 | チャンク先頭の文脈が重要なとき。CLSトークンが文書全体を表現するモデル（BERTなど）との親和性が高い |
| `attention` | オーバーラップ量を重みとした加重平均                       | チャンクとセグメントの重なりが不均一なとき。重なりが多いセグメントほど強く反映される              |

**具体的な選択基準:**

- デフォルト: `mean`（ほとんどのケースで安定した品質）
- 文書要約・タイトル検索: `cls`（先頭文脈重視）
- 長文・スライディングウィンドウ: `attention`（重なり度に応じた重み付けが有効）

### 6. 視覚証跡

NON_VISUAL タスク（UI変更なし）のため Phase 11 スクリーンショット不要。
本タスクはリファクタリングであり、`ChunkingService.chunk()` の入出力仕様は変化していない。

---

## 変更ファイル一覧

| ファイル                                                                                                | 変更種別                                             |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `packages/shared/src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts`                | 新規作成                                             |
| `packages/shared/src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts` | 新規作成                                             |
| `packages/shared/src/services/embedding/late-chunking/index.ts`                                         | 変更（ChunkingLateChunkingAdapter エクスポート追加） |
| `packages/shared/src/services/chunking/chunking-service.ts`                                             | 変更（委譲実装 + 4番目コンストラクタ引数追加）       |
| `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`                  | 変更（SEP-08 / SEP-09 追加）                         |
