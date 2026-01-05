# CONV-03-03: チャンク・埋め込みスキーマ定義 - 要件定義書

**タスクID**: CONV-03-03
**作成日**: 2025-12-18
**担当エージェント**: .claude/agents/req-analyst.md
**ステータス**: 要件定義完了

---

## 1. プロジェクト概要

### 1.1 目的

HybridRAGパイプラインにおけるテキストチャンキング（分割）と埋め込みベクトル生成に関する型定義とZodスキーマを実装する。これは以下の価値を提供する：

- **型安全性**: コンパイル時に異なるID型の誤用を検出
- **データ整合性**: Zodスキーマによるランタイムバリデーションで不正データを排除
- **拡張性**: 新しいチャンキング戦略・埋め込みプロバイダーの追加が容易
- **保守性**: 明確な型定義により、CONV-06（埋め込み生成パイプライン）の実装が容易に

### 1.2 スコープ

#### 含むもの

- チャンキング戦略の型定義（7種類）
- 埋め込みプロバイダーの型定義（4種類）
- チャンクエンティティ・埋め込みエンティティの型定義
- Zodスキーマ定義（全型に対応）
- ベクトル操作ユーティリティ（正規化、類似度計算、内積計算、距離計算）
- Base64変換ユーティリティ（Float32Array ↔ Base64文字列）
- トークン数推定ユーティリティ（簡易版、英語・日本語対応）
- デフォルト設定（チャンキング・埋め込みモデル）

#### 含まないもの

- 実際のチャンキングロジック実装（CONV-06-01で実装）
- 実際の埋め込み生成ロジック実装（CONV-06-02で実装）
- データベーススキーマ定義（CONV-04-03で実装）
- 正確なトークンカウンター（tiktoken等の外部ライブラリ統合）

### 1.3 ステークホルダー

| ステークホルダー     | 関心事                                             |
| -------------------- | -------------------------------------------------- |
| **CONV-06実装者**    | チャンキング・埋め込み実装時に参照する型定義       |
| **CONV-04実装者**    | データベーススキーマ設計時に参照する型定義         |
| **今後の機能拡張者** | 新しいチャンキング戦略・埋め込みプロバイダーの追加 |

---

## 2. 機能要件（Functional Requirements）

### FR-01: チャンキング戦略のサポート

**優先度**: Must Have
**分類**: 機能要件

**説明**:
以下の7種類のチャンキング戦略を型レベルで表現する必要がある。

| 戦略ID          | 戦略名                   | 説明                           | ユースケース             |
| --------------- | ------------------------ | ------------------------------ | ------------------------ |
| FIXED_SIZE      | 固定サイズ分割           | 指定トークン数で機械的に分割   | 汎用的な文書処理         |
| SEMANTIC        | 意味的境界分割           | 意味的なまとまりで分割         | 高精度な検索が必要な場合 |
| RECURSIVE       | 再帰的文字分割           | 段落→文→単語の順で再帰的に分割 | LangChainデフォルト手法  |
| SENTENCE        | 文単位分割               | 文の区切りで分割               | 文単位での検索           |
| PARAGRAPH       | 段落単位分割             | 段落の区切りで分割             | 段落単位での検索         |
| MARKDOWN_HEADER | Markdownヘッダー基準分割 | #, ##, ### のヘッダーで分割    | Markdownドキュメント     |
| CODE_BLOCK      | コードブロック単位分割   | コードブロック単位で分割       | ソースコード・技術文書   |

**実装要件**:

- 列挙型 `ChunkingStrategies` として定義
- TypeScript型 `ChunkingStrategy` として型推論可能
- Zodスキーマ `chunkingStrategySchema` で実行時検証可能

---

### FR-02: 埋め込みプロバイダーのサポート

**優先度**: Must Have
**分類**: 機能要件

**説明**:
以下の4種類の埋め込みプロバイダーをサポートする。

| プロバイダーID | プロバイダー名       | 代表的なモデル                                 | 特徴                     |
| -------------- | -------------------- | ---------------------------------------------- | ------------------------ |
| OPENAI         | OpenAI               | text-embedding-3-small, text-embedding-3-large | 高精度、8191トークン対応 |
| COHERE         | Cohere               | embed-english-v3.0                             | 英語特化、512トークン    |
| VOYAGE         | Voyage AI            | voyage-large-2                                 | 長文対応、16000トークン  |
| LOCAL          | ローカル（Ollama等） | nomic-embed-text                               | オフライン動作可能       |

**実装要件**:

- 列挙型 `EmbeddingProviders` として定義
- TypeScript型 `EmbeddingProvider` として型推論可能
- Zodスキーマ `embeddingProviderSchema` で実行時検証可能
- 各プロバイダーの設定（dimensions、maxTokens、batchSize）を `EmbeddingModelConfig` 型で表現

---

### FR-03: チャンクエンティティの定義

**優先度**: Must Have
**分類**: 機能要件

**説明**:
チャンク（分割されたテキスト）を表現するエンティティ型を定義する。

**フィールド要件**:

| フィールド名      | 型                      | 必須 | 説明                                          |
| ----------------- | ----------------------- | ---- | --------------------------------------------- |
| id                | ChunkId                 | ✓    | チャンクの一意識別子（Branded Type）          |
| fileId            | FileId                  | ✓    | 元ファイルのID（Branded Type）                |
| content           | string                  | ✓    | チャンク本文（最小1文字以上）                 |
| contextualContent | string \| null          | ✓    | Contextual Retrieval用の文脈付きコンテンツ    |
| position          | ChunkPosition           | ✓    | チャンク位置情報（index、行番号、文字位置等） |
| strategy          | ChunkingStrategy        | ✓    | 使用したチャンキング戦略                      |
| tokenCount        | number                  | ✓    | トークン数（最小1以上）                       |
| hash              | string                  | ✓    | 重複検出用ハッシュ値（SHA-256、64文字固定）   |
| metadata          | Record<string, unknown> | ✓    | 任意のメタデータ（WithMetadataミックスイン）  |
| createdAt         | Date                    | ✓    | 作成日時（Timestampedミックスイン）           |
| updatedAt         | Date                    | ✓    | 更新日時（Timestampedミックスイン）           |

**実装要件**:

- `Timestamped` および `WithMetadata` インターフェースを継承（CONV-03-01より）
- 全フィールドに `readonly` 修飾子を適用（イミュータブル設計）
- Zodスキーマ `chunkEntitySchema` で全フィールドを検証

---

### FR-04: チャンク位置情報の定義

**優先度**: Must Have
**分類**: 機能要件

**説明**:
チャンクの元ファイル内での位置情報を表現する型を定義する。

**フィールド要件**:

| フィールド名 | 型             | 制約 | 説明                         |
| ------------ | -------------- | ---- | ---------------------------- |
| index        | number         | >= 0 | チャンクの順序（0始まり）    |
| startLine    | number         | >= 1 | 開始行番号（1始まり）        |
| endLine      | number         | >= 1 | 終了行番号（1始まり）        |
| startChar    | number         | >= 0 | 開始文字位置（0始まり）      |
| endChar      | number         | >= 0 | 終了文字位置（0始まり）      |
| parentHeader | string \| null | -    | 親見出し（Markdown等の場合） |

**実装要件**:

- Zodスキーマ `chunkPositionSchema` で各フィールドの数値範囲を検証
- endLine >= startLine、endChar >= startChar の制約をrefineで追加検討

---

### FR-05: 埋め込みエンティティの定義

**優先度**: Must Have
**分類**: 機能要件

**説明**:
チャンクから生成された埋め込みベクトルを表現するエンティティ型を定義する。

**フィールド要件**:

| フィールド名        | 型           | 制約         | 説明                                 |
| ------------------- | ------------ | ------------ | ------------------------------------ |
| id                  | EmbeddingId  | -            | 埋め込みの一意識別子（Branded Type） |
| chunkId             | ChunkId      | -            | 元チャンクのID（Branded Type）       |
| vector              | Float32Array | 64〜4096次元 | 埋め込みベクトル                     |
| modelId             | string       | 最小1文字    | 使用した埋め込みモデルのID           |
| dimensions          | number       | 64〜4096     | ベクトルの次元数                     |
| normalizedMagnitude | number       | 0.99〜1.01   | 正規化検証用（L2正規化後は約1.0）    |
| createdAt           | Date         | -            | 作成日時（Timestampedミックスイン）  |
| updatedAt           | Date         | -            | 更新日時（Timestampedミックスイン）  |

**実装要件**:

- `Timestamped` インターフェースを継承
- Zodスキーマでは `vector` を `z.array(z.number())` として扱う（Float32Arrayは直接サポートされないため）
- normalizedMagnitudeで正規化の正しさを検証可能に

---

### FR-06: チャンキング設定の定義

**優先度**: Must Have
**分類**: 機能要件

**説明**:
チャンキング実行時の設定パラメータを表現する型を定義する。

**フィールド要件**:

| フィールド名       | 型               | デフォルト値 | 制約      | 説明                           |
| ------------------ | ---------------- | ------------ | --------- | ------------------------------ |
| strategy           | ChunkingStrategy | -            | -         | チャンキング戦略               |
| targetSize         | number           | 512          | 50〜2000  | 目標トークン数                 |
| minSize            | number           | 100          | 10〜1000  | 最小トークン数                 |
| maxSize            | number           | 1024         | 100〜4000 | 最大トークン数                 |
| overlapSize        | number           | 50           | 0〜500    | オーバーラップトークン数       |
| preserveBoundaries | boolean          | true         | -         | 文/段落境界を保持するか        |
| includeContext     | boolean          | true         | -         | Contextual Retrieval使用するか |

**複合条件制約**:

- `minSize <= targetSize <= maxSize` が成立すること

**実装要件**:

- Zodスキーマ `chunkingConfigSchema` で各フィールドを検証
- `.refine()` で複合条件を検証
- デフォルト値を `.default()` で設定

---

### FR-07: ベクトル操作ユーティリティ

**優先度**: Must Have
**分類**: 機能要件

**説明**:
埋め込みベクトルの操作に必要な数学関数を提供する。

| 関数名            | 入力              | 出力           | 説明                              |
| ----------------- | ----------------- | -------------- | --------------------------------- |
| normalizeVector   | Float32Array      | Float32Array   | L2正規化（ベクトルの大きさを1に） |
| vectorMagnitude   | Float32Array      | number         | ベクトルの大きさ計算              |
| cosineSimilarity  | 2つのFloat32Array | number (-1〜1) | コサイン類似度（正規化不要）      |
| euclideanDistance | 2つのFloat32Array | number (>= 0)  | ユークリッド距離                  |
| dotProduct        | 2つのFloat32Array | number         | 内積計算（正規化済みベクトル用）  |

**エラーハンドリング要件**:

- ベクトルの次元数が異なる場合は `Error("Vector dimensions must match")` をスロー
- ゼロベクトルの正規化時は元のベクトルをそのまま返す（ゼロ除算回避）
- ゼロベクトル同士の類似度計算時は `0` を返す

**実装要件**:

- 全関数は純粋関数（副作用なし）
- Float32Array型を扱う
- 浮動小数点演算の精度を考慮

---

### FR-08: Base64変換ユーティリティ

**優先度**: Must Have
**分類**: 機能要件

**説明**:
Float32Array型の埋め込みベクトルをデータベースストレージ用にBase64文字列に変換する。

| 関数名         | 入力         | 出力         | 説明                         |
| -------------- | ------------ | ------------ | ---------------------------- |
| vectorToBase64 | Float32Array | string       | ベクトルをBase64文字列に変換 |
| base64ToVector | string       | Float32Array | Base64文字列をベクトルに変換 |

**実装要件**:

- Node.js `Buffer` APIを使用
- バイトオーダー（エンディアン）を考慮
- 往復変換（vectorToBase64 → base64ToVector）でデータ損失なし

---

### FR-09: トークン数推定ユーティリティ

**優先度**: Should Have
**分類**: 機能要件

**説明**:
テキストのトークン数を簡易的に推定する関数を提供する。

**推定ロジック要件**:

- 英語: 約4文字 = 1トークン
- 日本語: 約1.5文字 = 1トークン
- 混在テキスト: 英語文字と非英語文字を分離して計算

**実装要件**:

- 関数名: `estimateTokenCount`
- 入力: `string`
- 出力: `number`（推定トークン数）
- 注記: 正確なカウントには `tiktoken` 等の外部ライブラリが必要であることをコメントで明示

---

### FR-10: デフォルト設定の提供

**優先度**: Must Have
**分類**: 機能要件

**説明**:
開発者がすぐに使える合理的なデフォルト設定を提供する。

**defaultChunkingConfig要件**:

```typescript
{
  strategy: ChunkingStrategies.RECURSIVE,  // LangChainと同様の手法
  targetSize: 512,                          // 標準的なチャンクサイズ
  minSize: 100,                             // 小さすぎるチャンクを防止
  maxSize: 1024,                            // 大きすぎるチャンクを防止
  overlapSize: 50,                          // 文脈の連続性を保持
  preserveBoundaries: true,                 // 文/段落の途中で分割しない
  includeContext: true,                     // Contextual Retrieval有効
}
```

**defaultEmbeddingModelConfigs要件**:

主要な埋め込みモデルのデフォルト設定を提供する。

| モデルID               | プロバイダー | 次元数 | maxTokens | batchSize |
| ---------------------- | ------------ | ------ | --------- | --------- |
| text-embedding-3-small | OpenAI       | 1536   | 8191      | 100       |
| text-embedding-3-large | OpenAI       | 3072   | 8191      | 100       |
| embed-english-v3.0     | Cohere       | 1024   | 512       | 96        |
| voyage-large-2         | Voyage AI    | 1536   | 16000     | 128       |

---

### FR-11: Contextual Retrieval対応

**優先度**: Must Have
**分類**: 機能要件

**説明**:
Anthropicの Contextual Retrieval 手法に対応するため、チャンクに文脈情報を付与できる。

**要件**:

- `ChunkEntity` に `contextualContent: string | null` フィールドを含める
- `null` の場合は通常のチャンク（文脈なし）
- 文字列の場合は、元文書の前後文脈を含めたコンテンツ
- `ChunkingConfig` に `includeContext: boolean` フィールドを含める

**背景**:
Contextual Retrieval は、チャンク単体では意味が不明瞭になる問題を解決するため、元文書の文脈情報を含めることで検索精度を向上させる手法。

---

### FR-12: チャンク間の関係（オーバーラップ）の表現

**優先度**: Should Have
**分類**: 機能要件

**説明**:
連続するチャンク間のオーバーラップ（重複）関係を表現する型を定義する。

**フィールド要件**:

| フィールド名  | 型              | 説明                                     |
| ------------- | --------------- | ---------------------------------------- |
| prevChunkId   | ChunkId \| null | 前のチャンクのID（最初のチャンクはnull） |
| nextChunkId   | ChunkId \| null | 次のチャンクのID（最後のチャンクはnull） |
| overlapTokens | number          | オーバーラップトークン数（>= 0）         |

**実装要件**:

- `ChunkOverlap` インターフェースとして定義
- Zodスキーマ `chunkOverlapSchema` で検証可能

---

### FR-13: バッチ埋め込み入力の定義

**優先度**: Must Have
**分類**: 機能要件

**説明**:
複数のチャンクを一括で埋め込み生成するためのバッチ入力型を定義する。

**フィールド要件**:

| フィールド名 | 型                                    | 制約     | 説明                         |
| ------------ | ------------------------------------- | -------- | ---------------------------- |
| chunks       | Array<{id: ChunkId, content: string}> | 1〜100件 | バッチ処理対象のチャンク     |
| modelConfig  | EmbeddingModelConfig                  | -        | 使用する埋め込みモデルの設定 |

**実装要件**:

- Zodスキーマ `batchEmbeddingInputSchema` で検証
- バッチサイズは1〜100件に制限（プロバイダーのレート制限を考慮）

---

## 3. 非機能要件（Non-Functional Requirements）

### NFR-01: 型安全性

**優先度**: Must Have
**分類**: 品質要件

**要件**:

- 全ID型は Branded Types を使用し、異なるID型の誤用をコンパイル時に検出
- 全エンティティ型は `readonly` 修飾子を使用し、イミュータブル設計を保証
- Zodスキーマから型推論可能（`z.infer<typeof schema>`）

**検証方法**:

- TypeScript型チェック（`tsc --noEmit`）でエラーがないこと
- 誤ったID型の代入時にコンパイルエラーが発生すること

---

### NFR-02: ランタイムバリデーション

**優先度**: Must Have
**分類**: 品質要件

**要件**:

- 全型に対応するZodスキーマを定義
- スキーマバリデーションエラー時に、ユーザーフレンドリーなエラーメッセージを返す
- 複合条件（minSize <= targetSize <= maxSize等）はrefineで検証

**検証方法**:

- 正常値でバリデーション成功
- 異常値でバリデーションエラー（明確なエラーメッセージ付き）

---

### NFR-03: パフォーマンス

**優先度**: Should Have
**分類**: パフォーマンス要件

**要件**:

- ベクトル操作関数は高速に動作（1000次元ベクトルの類似度計算 < 1ms）
- Base64変換は大量ベクトルでも効率的（1000ベクトルの変換 < 100ms）
- Zodスキーマバリデーションのオーバーヘッドは最小限

**検証方法**:

- パフォーマンステスト（単体テスト内で実行時間を計測）

---

### NFR-04: 保守性

**優先度**: Must Have
**分類**: 保守性要件

**要件**:

- 型定義は自己文書化されている（JSDocコメント付き）
- ユビキタス言語を使用（ChunkEntity、EmbeddingEntity等）
- 新しいチャンキング戦略・埋め込みプロバイダーの追加が容易

**検証方法**:

- コードレビューで命名の明確性を確認
- 新規戦略追加のシミュレーション（enum要素の追加のみで対応可能）

---

### NFR-05: テスト容易性

**優先度**: Must Have
**分類**: テスト要件

**要件**:

- 全関数は純粋関数（副作用なし）
- ベクトル操作関数は決定的（同じ入力で必ず同じ出力）
- テストカバレッジ80%以上

**検証方法**:

- Vitestカバレッジレポート（`pnpm --filter @repo/shared test:coverage`）

---

## 4. ユースケース

### UC-01: チャンク生成後の型安全な保存

**アクター**: チャンキング実装者（CONV-06-01）

**基本フロー**:

1. テキストをチャンキング戦略に基づいて分割
2. 各チャンクに対して `ChunkEntity` 型のオブジェクトを生成
3. `chunkEntitySchema.parse()` でバリデーション
4. データベースに保存

**代替フロー**:

- 3でバリデーションエラー → エラーメッセージをログ出力、当該チャンクをスキップ

---

### UC-02: 埋め込み生成時の設定検証

**アクター**: 埋め込み生成実装者（CONV-06-02）

**基本フロー**:

1. `EmbeddingModelConfig` 型で設定を定義
2. `embeddingModelConfigSchema.parse()` でバリデーション
3. バリデーション成功後、埋め込みAPIを呼び出し

**代替フロー**:

- 2でバリデーションエラー → エラーを上位層に伝播

---

### UC-03: ベクトル類似度計算

**アクター**: 検索実装者（CONV-07）

**基本フロー**:

1. クエリベクトルと候補チャンクのベクトルを取得
2. `cosineSimilarity(queryVector, candidateVector)` で類似度を計算
3. 類似度でソートして上位N件を返却

**例外フロー**:

- 2で次元数不一致 → Error("Vector dimensions must match") をスロー

---

## 5. 受け入れ基準（Acceptance Criteria）

受け入れ基準の詳細は別ドキュメント `task-step00-01-acceptance-criteria.md` を参照。

**サマリー**:

- [ ] 7種類のチャンキング戦略が型として定義されている
- [ ] 4種類の埋め込みプロバイダーが型として定義されている
- [ ] ChunkEntity、EmbeddingEntity等の主要型が定義されている
- [ ] 全型に対応するZodスキーマが定義されている
- [ ] ベクトル操作関数（5種類）が実装されている
- [ ] Base64変換関数（往復変換）が実装されている
- [ ] トークン推定関数が実装されている
- [ ] デフォルト設定が提供されている
- [ ] 単体テストカバレッジ80%以上
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし

---

## 6. 制約条件

### 6.1 技術制約

| 制約項目             | 内容                                                |
| -------------------- | --------------------------------------------------- |
| TypeScriptバージョン | 5.x以上                                             |
| Zodバージョン        | 3.x以上                                             |
| Node.jsバージョン    | 20.x以上（crypto.randomUUID使用）                   |
| Float32Array         | Node.js環境でのみ動作（ブラウザ環境は別実装が必要） |
| トークン推定         | 簡易版のみ（正確なカウントはtiktoken等が必要）      |

### 6.2 アーキテクチャ制約

| 制約項目           | 内容                                   |
| ------------------ | -------------------------------------- |
| 依存関係           | CONV-03-01（基本型）にのみ依存         |
| 配置場所           | `packages/shared/src/types/rag/chunk/` |
| レイヤー           | Domain層（外部依存なし）               |
| イミュータブル設計 | 全フィールドに `readonly` 修飾子       |
| Branded Types      | 全ID型に適用（ChunkId、EmbeddingId）   |

### 6.3 品質制約

| 制約項目             | 基準                                              |
| -------------------- | ------------------------------------------------- |
| テストカバレッジ     | 80%以上（Statements、Branches、Functions、Lines） |
| TypeScript厳格モード | strict: true                                      |
| ESLintルール         | @typescript-eslint/recommended                    |
| コードフォーマット   | Prettier適用                                      |

---

## 7. 依存関係

### 7.1 このタスクが依存するもの

| タスクID   | タスク名                         | 提供される成果物                                                    |
| ---------- | -------------------------------- | ------------------------------------------------------------------- |
| CONV-03-01 | 基本型・共通インターフェース定義 | Result型、Branded Types、Timestamped、WithMetadata、共通Zodスキーマ |

### 7.2 このタスクに依存するもの

| タスクID   | タスク名                       | 本タスクの成果物の使用方法            |
| ---------- | ------------------------------ | ------------------------------------- |
| CONV-04-03 | content_chunks テーブル + FTS5 | ChunkEntity型をテーブルスキーマに反映 |
| CONV-06-01 | チャンキング戦略実装           | ChunkingStrategy型を実装クラスで使用  |
| CONV-06-02 | 埋め込みプロバイダー抽象化     | EmbeddingProvider型を実装クラスで使用 |

---

## 8. リスク分析

### 8.1 技術リスク

| リスクID | リスク内容                                | 影響度 | 発生確率 | 対策                                                           |
| -------- | ----------------------------------------- | ------ | -------- | -------------------------------------------------------------- |
| RISK-01  | Zod refineロジックが複雑化し保守性が低下  | 中     | 低       | refineロジックを別関数として分離、テストを充実                 |
| RISK-02  | Float32Array型がZodで直接サポートされない | 中     | 低       | 配列として扱い、要素数チェックで次元数を検証                   |
| RISK-03  | ベクトル操作の浮動小数点演算誤差          | 中     | 中       | テストでtoBeCloseTo等の許容範囲付きアサーションを使用          |
| RISK-04  | Base64変換のエンディアン問題              | 低     | 低       | Node.js Buffer APIを使用し、クロスプラットフォーム互換性を確保 |
| RISK-05  | トークン推定の精度不足                    | 低     | 中       | 簡易版であることをドキュメントに明記、将来tiktoken統合を検討   |

---

## 9. 用語集（プロジェクト固有）

| 用語                                           | 定義                                                       |
| ---------------------------------------------- | ---------------------------------------------------------- |
| **チャンク（Chunk）**                          | 元文書を分割した個々のテキスト単位                         |
| **チャンキング戦略（Chunking Strategy）**      | テキストをどのように分割するかの方針                       |
| **埋め込みベクトル（Embedding Vector）**       | テキストを数値ベクトルに変換したもの                       |
| **埋め込みプロバイダー（Embedding Provider）** | 埋め込み生成APIを提供するサービス（OpenAI、Cohere等）      |
| **Contextual Retrieval**                       | チャンクに元文書の文脈を付与して検索精度を向上させる手法   |
| **L2正規化（L2 Normalization）**               | ベクトルの大きさを1に正規化する操作                        |
| **コサイン類似度（Cosine Similarity）**        | ベクトル間の角度に基づく類似度（-1〜1）                    |
| **Branded Types**                              | プリミティブ型に型情報を付与し、異なるID型の誤用を防ぐ手法 |

---

## 10. 参考資料

| 資料名                         | URL/パス                                                                         | 用途                              |
| ------------------------------ | -------------------------------------------------------------------------------- | --------------------------------- |
| CONV-03-01実装                 | packages/shared/src/types/rag/                                                   | Branded Types、Result型の実装参照 |
| Zod公式ドキュメント            | https://zod.dev/                                                                 | Zodスキーマ定義の参照             |
| Anthropic Contextual Retrieval | https://www.anthropic.com/news/contextual-retrieval                              | Contextual Retrieval手法の理解    |
| OpenAI Embeddings              | https://platform.openai.com/docs/guides/embeddings                               | OpenAI埋め込みAPIの仕様           |
| LangChain Text Splitters       | https://python.langchain.com/docs/modules/data_connection/document_transformers/ | チャンキング戦略の参考            |

---

## 11. 変更履歴

| 日付       | バージョン | 変更内容 | 変更者       |
| ---------- | ---------- | -------- | ------------ |
| 2025-12-18 | 1.0.0      | 初版作成 | .claude/agents/req-analyst.md |

---

## 付録A: MoSCoW優先度分類

| 優先度          | 要件ID                                                   | 要件名                                          |
| --------------- | -------------------------------------------------------- | ----------------------------------------------- |
| **Must Have**   | FR-01〜06, FR-10, FR-11, NFR-01〜05                      | 基本型定義、Zodスキーマ、ベクトル操作、品質要件 |
| **Should Have** | FR-07一部（euclideanDistance、dotProduct）, FR-09, FR-12 | 追加ベクトル操作、トークン推定、チャンク関係    |
| **Could Have**  | -                                                        | （該当なし）                                    |
| **Won't Have**  | tiktoken統合、ブラウザ環境対応                           | 将来タスクとして別途実装                        |

---

## 付録B: 品質メトリクス目標値

| メトリクス                     | 目標値             | 測定方法                                      |
| ------------------------------ | ------------------ | --------------------------------------------- |
| テストカバレッジ（Statements） | >= 80%             | Vitest coverage report                        |
| テストカバレッジ（Branches）   | >= 80%             | Vitest coverage report                        |
| テストカバレッジ（Functions）  | >= 80%             | Vitest coverage report                        |
| TypeScript型エラー             | 0件                | `tsc --noEmit`                                |
| ESLintエラー                   | 0件                | `eslint packages/shared/src/types/rag/chunk/` |
| Zodスキーマカバレッジ          | 100%（全型に対応） | 手動確認                                      |
