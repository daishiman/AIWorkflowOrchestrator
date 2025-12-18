# T-01-3: ユーティリティ関数設計

## メタ情報

- **タスクID**: T-01-3
- **タスク名**: ユーティリティ関数設計
- **フェーズ**: Phase 1 (設計フェーズ)
- **作成日**: 2025-01-19
- **設計対象**: Vector Operations, Base64 Conversion, Token Estimation, Default Configurations

## 1. 概要

このドキュメントでは、CONV-03-03タスクで必要となる以下のユーティリティ関数とデフォルト設定の詳細設計を記述します：

### 設計対象

1. **ベクトル演算関数** (5関数)
   - `normalizeVector`: L2正規化
   - `vectorMagnitude`: ベクトルの大きさ計算
   - `cosineSimilarity`: コサイン類似度計算
   - `euclideanDistance`: ユークリッド距離計算
   - `dotProduct`: 内積計算

2. **Base64変換関数** (2関数)
   - `vectorToBase64`: Float32Array → Base64文字列
   - `base64ToVector`: Base64文字列 → Float32Array

3. **トークン推定関数** (1関数)
   - `estimateTokenCount`: テキストのトークン数推定

4. **デフォルト設定** (2定数)
   - `defaultChunkingConfig`: デフォルトチャンキング設定
   - `defaultEmbeddingModelConfigs`: デフォルト埋め込みモデル設定

### 設計原則

- **純粋関数**: すべての関数は副作用を持たない
- **型安全性**: TypeScriptの型システムを最大限活用
- **パフォーマンス**: Float32Arrayの高速処理を活用
- **エラーハンドリング**: エッジケースを適切に処理
- **テスタビリティ**: 単体テストが容易な設計

---

## 2. ベクトル演算関数の設計

### 2.1 normalizeVector - L2正規化

#### 目的

ベクトルをL2ノルムで正規化し、単位ベクトル（長さ1のベクトル）に変換します。

#### 関数シグネチャ

````typescript
/**
 * ベクトルをL2ノルム（ユークリッドノルム）で正規化
 *
 * @param vector - 正規化するベクトル
 * @returns 正規化されたベクトル（長さ1）
 * @throws {Error} ゼロベクトルの場合（magnitude = 0）
 *
 * @example
 * ```typescript
 * const vector = new Float32Array([3, 4]);
 * const normalized = normalizeVector(vector);
 * // normalized = [0.6, 0.8] (magnitude = 5 → 3/5, 4/5)
 * ```
 */
export function normalizeVector(vector: Float32Array): Float32Array;
````

#### アルゴリズム

1. ベクトルの大きさ（magnitude）を計算: `||v|| = sqrt(v1² + v2² + ... + vn²)`
2. magnitudeがゼロの場合はエラーをスロー
3. 各要素をmagnitudeで割る: `normalized[i] = vector[i] / magnitude`

#### エッジケース処理

- **ゼロベクトル**: `magnitude = 0` の場合、`Error("Cannot normalize a zero vector")` をスロー
- **極小値**: `magnitude < Number.EPSILON` の場合もゼロベクトルとして扱う

#### 実装の考慮事項

- `vectorMagnitude` 関数を内部で使用
- 新しいFloat32Arrayを生成（immutable）
- 浮動小数点誤差を考慮（`Number.EPSILON` 使用）

---

### 2.2 vectorMagnitude - ベクトルの大きさ計算

#### 目的

ベクトルのL2ノルム（ユークリッドノルム）を計算します。

#### 関数シグネチャ

````typescript
/**
 * ベクトルのL2ノルム（ユークリッドノルム）を計算
 *
 * @param vector - 大きさを計算するベクトル
 * @returns ベクトルの大きさ（非負の実数）
 *
 * @example
 * ```typescript
 * const vector = new Float32Array([3, 4]);
 * const magnitude = vectorMagnitude(vector);
 * // magnitude = 5.0 (sqrt(3² + 4²) = sqrt(25))
 * ```
 */
export function vectorMagnitude(vector: Float32Array): number;
````

#### アルゴリズム

1. 各要素の二乗を計算: `sum = v1² + v2² + ... + vn²`
2. 平方根を取る: `magnitude = sqrt(sum)`

#### 数学的定義

```
||v|| = √(Σ(vi²))  where i = 1 to n
```

#### 実装の考慮事項

- `reduce` を使った実装も可能だが、パフォーマンスのためループを使用
- `Math.sqrt` の結果は常に非負

---

### 2.3 cosineSimilarity - コサイン類似度計算

#### 目的

2つのベクトル間のコサイン類似度を計算します。結果は-1（完全に反対）から1（完全に同じ）の範囲になります。

#### 関数シグネチャ

````typescript
/**
 * 2つのベクトル間のコサイン類似度を計算
 *
 * @param a - 1つ目のベクトル
 * @param b - 2つ目のベクトル
 * @returns コサイン類似度（-1 ≤ similarity ≤ 1）
 * @throws {Error} 次元が一致しない場合
 * @throws {Error} ゼロベクトルが含まれる場合
 *
 * @example
 * ```typescript
 * const a = new Float32Array([1, 0, 0]);
 * const b = new Float32Array([0, 1, 0]);
 * const similarity = cosineSimilarity(a, b);
 * // similarity = 0.0 (直交)
 * ```
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number;
````

#### アルゴリズム

1. 次元チェック: `a.length === b.length`
2. 内積を計算: `dotProduct = Σ(ai × bi)`
3. 各ベクトルの大きさを計算: `||a||`, `||b||`
4. コサイン類似度を計算: `similarity = dotProduct / (||a|| × ||b||)`

#### 数学的定義

```
cos(θ) = (a · b) / (||a|| × ||b||)
       = Σ(ai × bi) / (√Σ(ai²) × √Σ(bi²))
```

#### エッジケース処理

- **次元不一致**: `a.length !== b.length` の場合、`Error("Vector dimensions must match")` をスロー
- **ゼロベクトル**: どちらかがゼロベクトルの場合、`Error("Cannot compute similarity with zero vector")` をスロー
- **正規化済みベクトル**: すでに正規化されている場合は `dotProduct` のみで計算可能

#### 実装の考慮事項

- `vectorMagnitude` 関数を使用
- 浮動小数点誤差により結果が[-1, 1]をわずかに超える場合、`Math.max(-1, Math.min(1, similarity))` でクランプ

---

### 2.4 euclideanDistance - ユークリッド距離計算

#### 目的

2つのベクトル間のユークリッド距離（L2距離）を計算します。

#### 関数シグネチャ

````typescript
/**
 * 2つのベクトル間のユークリッド距離を計算
 *
 * @param a - 1つ目のベクトル
 * @param b - 2つ目のベクトル
 * @returns ユークリッド距離（非負の実数）
 * @throws {Error} 次元が一致しない場合
 *
 * @example
 * ```typescript
 * const a = new Float32Array([1, 2, 3]);
 * const b = new Float32Array([4, 5, 6]);
 * const distance = euclideanDistance(a, b);
 * // distance = √27 ≈ 5.196 (sqrt((4-1)² + (5-2)² + (6-3)²))
 * ```
 */
export function euclideanDistance(a: Float32Array, b: Float32Array): number;
````

#### アルゴリズム

1. 次元チェック: `a.length === b.length`
2. 差の二乗和を計算: `sumSquares = Σ((ai - bi)²)`
3. 平方根を取る: `distance = sqrt(sumSquares)`

#### 数学的定義

```
d(a, b) = √(Σ((ai - bi)²))  where i = 1 to n
```

#### エッジケース処理

- **次元不一致**: `a.length !== b.length` の場合、`Error("Vector dimensions must match")` をスロー
- **同一ベクトル**: 距離は0になる

#### 実装の考慮事項

- パフォーマンスのためループで実装
- 結果は常に非負

---

### 2.5 dotProduct - 内積計算

#### 目的

2つのベクトルの内積（ドット積）を計算します。正規化済みベクトルの場合、コサイン類似度と等しくなります。

#### 関数シグネチャ

````typescript
/**
 * 2つのベクトルの内積（ドット積）を計算
 *
 * @param a - 1つ目のベクトル
 * @param b - 2つ目のベクトル
 * @returns 内積（実数）
 * @throws {Error} 次元が一致しない場合
 *
 * @example
 * ```typescript
 * const a = new Float32Array([1, 2, 3]);
 * const b = new Float32Array([4, 5, 6]);
 * const product = dotProduct(a, b);
 * // product = 32 (1×4 + 2×5 + 3×6 = 4 + 10 + 18)
 * ```
 */
export function dotProduct(a: Float32Array, b: Float32Array): number;
````

#### アルゴリズム

1. 次元チェック: `a.length === b.length`
2. 要素ごとの積の和を計算: `sum = Σ(ai × bi)`

#### 数学的定義

```
a · b = Σ(ai × bi)  where i = 1 to n
```

#### エッジケース処理

- **次元不一致**: `a.length !== b.length` の場合、`Error("Vector dimensions must match")` をスロー

#### 実装の考慮事項

- 最もシンプルな演算だが、他の関数の基礎として重要
- 正規化済みベクトルの場合、コサイン類似度と等価

---

## 3. Base64変換関数の設計

### 3.1 vectorToBase64 - Float32Array → Base64文字列

#### 目的

Float32Array形式のベクトルをBase64文字列に変換し、データベースやJSON形式で保存可能にします。

#### 関数シグネチャ

````typescript
/**
 * Float32Array形式のベクトルをBase64文字列に変換
 *
 * @param vector - 変換するベクトル
 * @returns Base64エンコードされた文字列
 *
 * @example
 * ```typescript
 * const vector = new Float32Array([0.5, 0.3, 0.2]);
 * const base64 = vectorToBase64(vector);
 * // base64 = "AAAAAD8AAJg+AADMPg==" (12 bytes → 16 chars)
 * ```
 */
export function vectorToBase64(vector: Float32Array): string;
````

#### アルゴリズム

1. Float32Arrayのバイトバッファを取得
2. Node.jsの`Buffer.from()`でBufferオブジェクトを作成
3. `buffer.toString('base64')`でBase64文字列に変換

#### 実装詳細

```typescript
// 実装イメージ
export function vectorToBase64(vector: Float32Array): string {
  // Float32Arrayのバイトバッファを取得
  const buffer = Buffer.from(
    vector.buffer,
    vector.byteOffset,
    vector.byteLength,
  );

  // Base64エンコード
  return buffer.toString("base64");
}
```

#### データサイズ

- Float32: 4 bytes/要素
- Base64: 元のバイト数 × 4/3（パディング含む）
- 例: 1536次元 → 6144 bytes → 8192 chars

#### 実装の考慮事項

- `Buffer.from()` は Node.js 環境のみで動作
- ブラウザ環境では `btoa()` と `Uint8Array` を使用する必要がある
- バイトオーダー（エンディアン）は実行環境に依存

---

### 3.2 base64ToVector - Base64文字列 → Float32Array

#### 目的

Base64文字列をFloat32Array形式のベクトルに復元します。

#### 関数シグネチャ

````typescript
/**
 * Base64文字列をFloat32Array形式のベクトルに変換
 *
 * @param base64 - Base64エンコードされた文字列
 * @returns 復元されたベクトル
 * @throws {Error} 不正なBase64文字列の場合
 * @throws {Error} バイト数が4の倍数でない場合（Float32の境界エラー）
 *
 * @example
 * ```typescript
 * const base64 = "AAAAAD8AAJg+AADMPg==";
 * const vector = base64ToVector(base64);
 * // vector = Float32Array([0.5, 0.3, 0.2])
 * ```
 */
export function base64ToVector(base64: string): Float32Array;
````

#### アルゴリズム

1. Base64文字列をBufferにデコード
2. バイト数が4の倍数であることを確認
3. BufferからFloat32Arrayを作成

#### 実装詳細

```typescript
// 実装イメージ
export function base64ToVector(base64: string): Float32Array {
  // Base64デコード
  const buffer = Buffer.from(base64, "base64");

  // バイト数チェック（Float32は4バイト）
  if (buffer.length % 4 !== 0) {
    throw new Error(
      `Invalid buffer length: ${buffer.length} bytes is not divisible by 4 (Float32 size)`,
    );
  }

  // Float32Arrayに変換
  return new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
}
```

#### エッジケース処理

- **不正なBase64**: デコード失敗時はErrorをスロー
- **境界エラー**: バイト数が4の倍数でない場合はErrorをスロー
- **空文字列**: 空のFloat32Array（長さ0）を返す

#### 実装の考慮事項

- `Buffer.from(base64, 'base64')` は不正な文字列を自動的に無視する場合があるため、厳密なバリデーションが必要な場合は追加チェック
- `vectorToBase64` との往復変換で精度が保たれることを確認

---

## 4. トークン推定関数の設計

### 4.1 estimateTokenCount - トークン数推定

#### 目的

テキストのトークン数を簡易的に推定します。正確な値ではなく、チャンキング時の目安として使用します。

#### 関数シグネチャ

````typescript
/**
 * テキストのトークン数を簡易的に推定
 *
 * 推定ルール:
 * - 英語（ASCII）: 約4文字 = 1トークン
 * - 日本語（非ASCII）: 約1.5文字 = 1トークン
 * - 混在テキスト: 文字種ごとに計算して合算
 *
 * @param text - トークン数を推定するテキスト
 * @returns 推定トークン数（整数）
 *
 * @example
 * ```typescript
 * const englishText = "Hello, world!";
 * const englishTokens = estimateTokenCount(englishText);
 * // englishTokens ≈ 3 (13文字 / 4 ≈ 3.25 → 切り上げ)
 *
 * const japaneseText = "こんにちは";
 * const japaneseTokens = estimateTokenCount(japaneseText);
 * // japaneseTokens ≈ 4 (5文字 / 1.5 ≈ 3.33 → 切り上げ)
 *
 * const mixedText = "Hello世界";
 * const mixedTokens = estimateTokenCount(mixedText);
 * // mixedTokens ≈ 3 (5英字/4 + 2日本語/1.5 ≈ 1.25 + 1.33 = 2.58 → 切り上げ)
 * ```
 */
export function estimateTokenCount(text: string): number;
````

#### アルゴリズム

1. テキストを1文字ずつ走査
2. 各文字がASCII範囲（0-127）かどうかを判定
3. ASCII文字数と非ASCII文字数をカウント
4. それぞれの推定式を適用して合算
5. 結果を切り上げ（`Math.ceil`）

#### 推定式

```typescript
asciiTokens = asciiCharCount / 4.0; // 英語: 4文字 = 1トークン
nonAsciiTokens = nonAsciiCharCount / 1.5; // 日本語: 1.5文字 = 1トークン
totalTokens = Math.ceil(asciiTokens + nonAsciiTokens);
```

#### 実装詳細

```typescript
// 実装イメージ
export function estimateTokenCount(text: string): number {
  let asciiCharCount = 0;
  let nonAsciiCharCount = 0;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode < 128) {
      asciiCharCount++;
    } else {
      nonAsciiCharCount++;
    }
  }

  const asciiTokens = asciiCharCount / 4.0;
  const nonAsciiTokens = nonAsciiCharCount / 1.5;

  return Math.ceil(asciiTokens + nonAsciiTokens);
}
```

#### 精度について

- **目的**: 正確なトークン数ではなく、チャンキング時の目安
- **誤差**: ±20%程度の誤差を許容
- **実際のトークナイザー**: OpenAI tiktoken等と比較して調整可能
- **改善案**:
  - より精度が必要な場合は `tiktoken` ライブラリを使用
  - 言語検出ライブラリで言語を判定してから推定

#### エッジケース処理

- **空文字列**: 0を返す
- **絵文字・記号**: 非ASCII文字として扱う
- **サロゲートペア**: 2文字としてカウント（`text.length` の仕様）

#### 実装の考慮事項

- `String.prototype.charCodeAt()` を使用
- サロゲートペアを正確にカウントする場合は `Array.from(text)` や `for...of` を使用
- パフォーマンスと精度のトレードオフ

---

## 5. デフォルト設定の設計

### 5.1 defaultChunkingConfig - デフォルトチャンキング設定

#### 目的

チャンキング設定のデフォルト値を提供します。

#### 定義

```typescript
/**
 * デフォルトチャンキング設定
 *
 * - strategy: RECURSIVE（再帰的分割 - 最も汎用的）
 * - targetSize: 512トークン（バランスの良いサイズ）
 * - minSize: 100トークン（小さすぎる断片を防ぐ）
 * - maxSize: 1024トークン（コンテキストウィンドウ制限を考慮）
 * - overlap: 50トークン（コンテキスト連続性を保つ）
 * - respectBoundaries: true（文・段落境界を尊重）
 * - preserveFormatting: false（基本はプレーンテキスト化）
 */
export const defaultChunkingConfig: ChunkingConfig = {
  strategy: ChunkingStrategies.RECURSIVE,
  targetSize: 512,
  minSize: 100,
  maxSize: 1024,
  overlap: 50,
  respectBoundaries: true,
  preserveFormatting: false,
} as const;
```

#### 設計根拠

- **strategy: RECURSIVE**
  - 最も汎用的で、様々な文書タイプに対応
  - 段落 → 文 → 単語の順に分割を試みる

- **targetSize: 512**
  - RAG検索における標準的なチャンクサイズ
  - 検索精度とコンテキスト量のバランス

- **minSize: 100**
  - 意味のある情報を含むための最小サイズ
  - 短すぎる断片を防ぐ

- **maxSize: 1024**
  - モデルのコンテキストウィンドウ制限を考慮
  - 2倍のバッファを持たせることで柔軟性を確保

- **overlap: 50**
  - チャンク間の連続性を保つ
  - targetSizeの約10%（一般的な推奨値）

- **respectBoundaries: true**
  - 文や段落の途中で切らない
  - 読みやすさと意味の保持

- **preserveFormatting: false**
  - デフォルトはプレーンテキスト化
  - 検索精度を優先

#### 使用例

```typescript
// デフォルト設定でチャンキング
const chunks = chunkText(content, defaultChunkingConfig);

// 一部をオーバーライド
const customConfig: ChunkingConfig = {
  ...defaultChunkingConfig,
  strategy: ChunkingStrategies.SEMANTIC,
  targetSize: 256,
};
```

---

### 5.2 defaultEmbeddingModelConfigs - デフォルト埋め込みモデル設定

#### 目的

各埋め込みプロバイダーのデフォルトモデル設定を提供します。

#### 定義

```typescript
/**
 * デフォルト埋め込みモデル設定
 *
 * 各プロバイダーの推奨モデルとパラメータを定義
 */
export const defaultEmbeddingModelConfigs: Record<
  EmbeddingProvider,
  EmbeddingModelConfig
> = {
  [EmbeddingProviders.OPENAI]: {
    provider: EmbeddingProviders.OPENAI,
    modelName: "text-embedding-3-small",
    dimensions: 1536,
    batchSize: 100,
    maxTokensPerChunk: 8191,
    apiEndpoint: "https://api.openai.com/v1/embeddings",
    rateLimit: {
      requestsPerMinute: 3000,
      tokensPerMinute: 1000000,
    },
  },

  [EmbeddingProviders.COHERE]: {
    provider: EmbeddingProviders.COHERE,
    modelName: "embed-english-v3.0",
    dimensions: 1024,
    batchSize: 96,
    maxTokensPerChunk: 512,
    apiEndpoint: "https://api.cohere.ai/v1/embed",
    rateLimit: {
      requestsPerMinute: 100,
      tokensPerMinute: 10000,
    },
  },

  [EmbeddingProviders.VOYAGE]: {
    provider: EmbeddingProviders.VOYAGE,
    modelName: "voyage-2",
    dimensions: 1024,
    batchSize: 128,
    maxTokensPerChunk: 16000,
    apiEndpoint: "https://api.voyageai.com/v1/embeddings",
    rateLimit: {
      requestsPerMinute: 300,
      tokensPerMinute: 1000000,
    },
  },

  [EmbeddingProviders.LOCAL]: {
    provider: EmbeddingProviders.LOCAL,
    modelName: "all-MiniLM-L6-v2",
    dimensions: 384,
    batchSize: 32,
    maxTokensPerChunk: 256,
    apiEndpoint: "http://localhost:8000/embeddings",
    rateLimit: {
      requestsPerMinute: 1000,
      tokensPerMinute: 100000,
    },
  },
} as const;
```

#### 各プロバイダーの設計根拠

##### OpenAI (text-embedding-3-small)

- **モデル選択理由**:
  - コストパフォーマンスが高い（text-embedding-3-largeの1/3のコスト）
  - 十分な精度（多くのベンチマークで高スコア）
  - 高速な処理速度

- **パラメータ**:
  - `dimensions: 1536`: デフォルト次元数
  - `batchSize: 100`: APIの最大バッチサイズ
  - `maxTokensPerChunk: 8191`: モデルの最大トークン数
  - `rateLimit`: OpenAI Tier 1の制限

##### Cohere (embed-english-v3.0)

- **モデル選択理由**:
  - 英語に特化した高精度モデル
  - 検索タスクに最適化

- **パラメータ**:
  - `dimensions: 1024`: デフォルト次元数
  - `batchSize: 96`: APIの推奨バッチサイズ
  - `maxTokensPerChunk: 512`: モデルの最大トークン数
  - `rateLimit`: Cohereの無料プランの制限

##### Voyage (voyage-2)

- **モデル選択理由**:
  - RAGタスクに特化
  - 高い検索精度

- **パラメータ**:
  - `dimensions: 1024`: デフォルト次元数
  - `batchSize: 128`: APIの最大バッチサイズ
  - `maxTokensPerChunk: 16000`: 大きなコンテキストに対応
  - `rateLimit`: Voyageの標準プランの制限

##### Local (all-MiniLM-L6-v2)

- **モデル選択理由**:
  - 軽量で高速（Sentence-Transformersの人気モデル）
  - ローカル実行に適している
  - プライバシー保護

- **パラメータ**:
  - `dimensions: 384`: 軽量モデルの次元数
  - `batchSize: 32`: ローカルハードウェアを考慮
  - `maxTokensPerChunk: 256`: モデルの制限
  - `rateLimit`: ローカル実行の推定値

#### 使用例

```typescript
// OpenAIのデフォルト設定を使用
const openAiConfig = defaultEmbeddingModelConfigs[EmbeddingProviders.OPENAI];
const embeddings = await generateEmbeddings(chunks, openAiConfig);

// カスタム設定（一部オーバーライド）
const customConfig: EmbeddingModelConfig = {
  ...defaultEmbeddingModelConfigs[EmbeddingProviders.OPENAI],
  modelName: "text-embedding-3-large",
  dimensions: 3072,
};
```

#### 実装の考慮事項

- `as const` により型レベルで不変性を保証
- `Record<EmbeddingProvider, EmbeddingModelConfig>` により全プロバイダーの設定を強制
- APIエンドポイントは環境変数でオーバーライド可能にする

---

## 6. エラーハンドリング

### 6.1 共通エラーパターン

すべてのユーティリティ関数で以下のエラーハンドリングパターンを採用します：

```typescript
// エラーメッセージは日本語で記述
throw new Error("ベクトルの次元が一致しません");

// エラーに詳細情報を含める
throw new Error(
  `ベクトルの次元が一致しません（a: ${a.length}, b: ${b.length}）`,
);

// 関数名を含めることで呼び出し元での特定を容易に
throw new Error(`[cosineSimilarity] ゼロベクトルでは類似度を計算できません`);
```

### 6.2 エラーコード定義

将来的にエラーハンドリングを拡張する場合に備えて、エラーコードの定義も検討します：

```typescript
// errors.ts に追加する可能性のあるエラーコード
export const ErrorCodes = {
  // ... 既存のエラーコード ...

  // ベクトル演算エラー
  VECTOR_DIMENSION_MISMATCH: "VECTOR_DIMENSION_MISMATCH",
  ZERO_VECTOR_ERROR: "ZERO_VECTOR_ERROR",
  INVALID_VECTOR_DATA: "INVALID_VECTOR_DATA",

  // Base64変換エラー
  INVALID_BASE64_STRING: "INVALID_BASE64_STRING",
  BUFFER_SIZE_MISMATCH: "BUFFER_SIZE_MISMATCH",
} as const;
```

---

## 7. パフォーマンス考慮事項

### 7.1 Float32Array の使用

- **メモリ効率**: Float64Array（8 bytes/要素）に比べて半分のメモリ
- **処理速度**: 多くの環境でSIMD最適化が効く
- **精度**: ほとんどの用途で十分（約7桁の有効数字）

### 7.2 ループ vs. 関数型メソッド

```typescript
// パフォーマンス重視: forループ
let sum = 0;
for (let i = 0; i < vector.length; i++) {
  sum += vector[i] * vector[i];
}

// 可読性重視: reduce（やや低速）
const sum = vector.reduce((acc, val) => acc + val * val, 0);
```

- ベクトル演算では**forループを推奨**（パフォーマンス優先）
- 小さな配列（< 100要素）では差はほぼない

### 7.3 メモ化の検討

```typescript
// 同じベクトルの大きさを何度も計算する場合
const magnitudeCache = new WeakMap<Float32Array, number>();

function vectorMagnitudeWithCache(vector: Float32Array): number {
  if (magnitudeCache.has(vector)) {
    return magnitudeCache.get(vector)!;
  }
  const magnitude = vectorMagnitude(vector);
  magnitudeCache.set(vector, magnitude);
  return magnitude;
}
```

- 大量のベクトルを扱う場合は検討
- 初期実装では不要（YAGNI原則）

---

## 8. テスト戦略

### 8.1 単体テストのカバレッジ

各関数について以下のテストケースを作成します：

#### normalizeVector

- 正常系: 標準的なベクトルの正規化
- エッジケース: ゼロベクトル、極小値
- 境界値: 単位ベクトル（すでに正規化済み）

#### vectorMagnitude

- 正常系: 3D, 2D, 1Dベクトル
- エッジケース: ゼロベクトル、単位ベクトル
- 境界値: 非常に大きな値、非常に小さな値

#### cosineSimilarity

- 正常系: 同じ方向、直交、反対方向
- エッジケース: ゼロベクトル、次元不一致
- 境界値: -1, 0, 1

#### euclideanDistance

- 正常系: 通常のベクトル
- エッジケース: 同一ベクトル、次元不一致
- 境界値: 距離が0、非常に大きな距離

#### dotProduct

- 正常系: 正の内積、負の内積
- エッジケース: ゼロベクトル、直交ベクトル
- 境界値: 次元不一致

#### vectorToBase64 / base64ToVector

- 正常系: 往復変換で値が保持される
- エッジケース: 空ベクトル、大きなベクトル
- 境界値: 不正なBase64文字列

#### estimateTokenCount

- 正常系: 英語のみ、日本語のみ、混在
- エッジケース: 空文字列、記号のみ
- 境界値: 非常に長いテキスト

### 8.2 プロパティベーステスト

数学的性質を検証するプロパティベーステストも有効です：

```typescript
// normalizeVector の性質
test("normalized vector has magnitude 1", () => {
  fc.assert(
    fc.property(fc.float32Array({ minLength: 1, maxLength: 100 }), (vector) => {
      // ゼロベクトルを除外
      if (vectorMagnitude(vector) < Number.EPSILON) return true;

      const normalized = normalizeVector(vector);
      const magnitude = vectorMagnitude(normalized);
      expect(magnitude).toBeCloseTo(1.0, 5);
    }),
  );
});

// cosineSimilarity の対称性
test("cosine similarity is symmetric", () => {
  fc.assert(
    fc.property(
      fc.float32Array({ minLength: 10, maxLength: 10 }),
      fc.float32Array({ minLength: 10, maxLength: 10 }),
      (a, b) => {
        // ゼロベクトルを除外
        if (
          vectorMagnitude(a) < Number.EPSILON ||
          vectorMagnitude(b) < Number.EPSILON
        ) {
          return true;
        }

        const sim1 = cosineSimilarity(a, b);
        const sim2 = cosineSimilarity(b, a);
        expect(sim1).toBeCloseTo(sim2, 5);
      },
    ),
  );
});
```

---

## 9. ファイル構成

### 9.1 ファイル配置

```
packages/shared/src/types/rag/
├── utils.ts                    # 本設計で定義するユーティリティ関数
├── defaults.ts                 # デフォルト設定定数
├── types.ts                    # 型定義（T-01-1で作成）
├── schemas.ts                  # Zodスキーマ（T-01-2で作成）
├── branded.ts                  # Branded Types（CONV-03-01で作成済み）
├── interfaces.ts               # 共通インターフェース（CONV-03-01で作成済み）
└── errors.ts                   # エラー定義（CONV-03-01で作成済み）
```

### 9.2 インポート構造

```typescript
// utils.ts
import {
  ChunkingConfig,
  EmbeddingModelConfig,
  EmbeddingProvider,
} from "./types";
import { ErrorCodes } from "./errors";

// defaults.ts
import { ChunkingStrategies, EmbeddingProviders } from "./types";
import type {
  ChunkingConfig,
  EmbeddingModelConfig,
  EmbeddingProvider,
} from "./types";

// 他のファイルからの利用
import {
  normalizeVector,
  cosineSimilarity,
} from "@repo/shared/types/rag/utils";
import { defaultChunkingConfig } from "@repo/shared/types/rag/defaults";
```

---

## 10. 次のステップ（T-02-1: 設計レビューゲート）

このユーティリティ関数設計が完了した後、Phase 2の設計レビューゲート（T-02-1）で以下を確認します：

### レビュー観点

1. **型定義との整合性**（T-01-1）
   - `types.ts` で定義した型とutilsの引数・戻り値が一致しているか
   - Branded Typesの使用が適切か

2. **Zodスキーマとの整合性**（T-01-2）
   - デフォルト設定がスキーマのバリデーションを通るか
   - エラーメッセージが統一されているか

3. **エッジケース処理**
   - すべての関数でエッジケースが考慮されているか
   - エラーハンドリングが一貫しているか

4. **パフォーマンス**
   - Float32Arrayの使用が適切か
   - 不要なコピーが発生していないか

5. **テスタビリティ**
   - 純粋関数として実装されているか
   - 依存関係が最小化されているか

### 承認基準

- [ ] 型定義との整合性が確認された
- [ ] Zodスキーマとの整合性が確認された
- [ ] すべてのエッジケースが処理されている
- [ ] パフォーマンス上の懸念がない
- [ ] テストが容易な設計になっている
- [ ] コードレビュー担当者の承認を得た

---

## 11. まとめ

### 設計完了項目

- ✅ ベクトル演算関数（5関数）の設計完了
- ✅ Base64変換関数（2関数）の設計完了
- ✅ トークン推定関数（1関数）の設計完了
- ✅ デフォルト設定（2定数）の設計完了
- ✅ エラーハンドリング戦略の定義
- ✅ パフォーマンス考慮事項の検討
- ✅ テスト戦略の策定

### 設計の特徴

1. **純粋関数**: すべての関数が副作用を持たない
2. **型安全性**: TypeScriptの型システムを最大限活用
3. **エッジケース処理**: ゼロベクトル、次元不一致等を適切に処理
4. **パフォーマンス**: Float32Arrayの効率的な使用
5. **テスタビリティ**: 単体テストが容易な設計

### 次のフェーズ

Phase 2（T-02-1）の設計レビューゲートで本設計をレビューし、承認後にPhase 3のテスト作成（TDD Red）に進みます。

---

**作成日**: 2025-01-19
**作成者**: Claude (AI Assistant)
**レビュー状態**: 未レビュー
**承認状態**: 未承認
