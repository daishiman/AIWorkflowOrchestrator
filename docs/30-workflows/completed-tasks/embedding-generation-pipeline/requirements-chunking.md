# チャンキング戦略要件定義書

## 文書情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| 文書ID     | REQ-CHUNKING-001     |
| バージョン | 1.0.0                |
| 作成日     | 2025-12-26           |
| 最終更新日 | 2025-12-26           |
| ステータス | Draft                |
| 作成者     | Requirements Analyst |

---

## 1. 概要

### 1.1 目的

本文書は、Embedding Generation Pipelineにおけるチャンキング戦略の要件を定義する。セマンティック、階層、固定サイズ、文単位の4つのチャンキング戦略と、Contextual Embeddings、Late Chunkingの先進的手法の要件を明確化する。

### 1.2 スコープ

- 4種類のチャンキング戦略（semantic, hierarchical, fixed, sentence）
- Contextual Embeddings（Anthropic手法）
- Late Chunking（Jina AI手法）
- ドキュメントタイプ別の最適化戦略
- 非機能要件（性能、メモリ、スケーラビリティ）

### 1.3 参考研究

| 研究                           | 発表年 | 主要な知見                                                        |
| ------------------------------ | ------ | ----------------------------------------------------------------- |
| Anthropic Contextual Retrieval | 2024   | チャンクに文書全体のコンテキストを付与することで検索精度が67%向上 |
| Jina AI Late Chunking          | 2024   | トークナイズ後にチャンキングすることでコンテキストの完全性を保持  |
| NVIDIA Chunking Benchmark      | 2024   | ドキュメントタイプ別の最適チャンクサイズを実証                    |

---

## 2. 用語定義

| 用語                 | 定義                                                         |
| -------------------- | ------------------------------------------------------------ |
| チャンク             | 文書を分割した単位テキスト。埋め込みベクトル生成の基本単位   |
| オーバーラップ       | 隣接チャンク間で重複するトークン数またはテキスト量           |
| セマンティック境界   | 意味的な区切りを示す位置（段落、セクション、文など）         |
| Contextual Embedding | チャンクに元文書のコンテキスト情報を付与した埋め込み         |
| Late Chunking        | 文書全体をトークナイズ後、埋め込み空間でチャンキングする手法 |
| トークン             | テキストを分割した最小単位。埋め込みモデルの入力単位         |

---

## 3. 機能要件

### 3.1 チャンキング戦略

#### FR-CHUNK-001: 固定サイズチャンキング（Fixed-Size Chunking）

**説明**: 指定したトークン数で均一にテキストを分割する

**パラメータ定義**:

| パラメータ        | 型     | デフォルト値 | 有効範囲      | 説明                                  |
| ----------------- | ------ | ------------ | ------------- | ------------------------------------- |
| chunkSize         | number | 512          | 128-8192      | チャンクあたりのトークン数            |
| overlapSize       | number | 64           | 0-chunkSize/2 | オーバーラップトークン数              |
| overlapPercentage | number | 12.5%        | 0-50%         | オーバーラップ率（overlapSizeの代替） |
| minChunkSize      | number | 50           | 10-chunkSize  | 最小チャンクサイズ（末尾チャンク用）  |

**受け入れ基準**:

```gherkin
Scenario: 固定サイズでチャンクを生成する
  Given 1500トークンのテキストが入力される
  And chunkSize=512, overlapSize=64が設定されている
  When 固定サイズチャンキングを実行する
  Then 4つのチャンクが生成される
  And 各チャンクは最大512トークンである
  And 連続するチャンク間に64トークンの重複がある

Scenario: 最小サイズ未満のチャンクを処理する
  Given 600トークンのテキストが入力される
  And chunkSize=512, minChunkSize=50が設定されている
  When 固定サイズチャンキングを実行する
  Then 2つのチャンクが生成される
  And 2番目のチャンクは88トークン以上である

Scenario: オーバーラップが適切に設定される
  Given overlapPercentage=20%が設定されている
  And chunkSize=500が設定されている
  When 固定サイズチャンキングを実行する
  Then overlapSizeは100トークンに設定される
```

---

#### FR-CHUNK-002: 文単位チャンキング（Sentence-Based Chunking）

**説明**: 文の境界を尊重してチャンクを生成する

**パラメータ定義**:

| パラメータ         | 型       | デフォルト値                      | 有効範囲             | 説明                           |
| ------------------ | -------- | --------------------------------- | -------------------- | ------------------------------ |
| targetChunkSize    | number   | 512                               | 128-4096             | 目標チャンクサイズ（トークン） |
| maxChunkSize       | number   | 768                               | targetChunkSize-8192 | 最大チャンクサイズ             |
| sentenceOverlap    | number   | 1                                 | 0-5                  | オーバーラップする文の数       |
| sentenceDelimiters | string[] | [".", "!", "?", "。", "！", "？"] | -                    | 文区切り文字                   |
| preserveParagraphs | boolean  | true                              | -                    | 段落境界を優先するか           |

**受け入れ基準**:

```gherkin
Scenario: 文境界でチャンクを分割する
  Given 10文からなるテキストが入力される
  And targetChunkSize=200が設定されている
  When 文単位チャンキングを実行する
  Then 各チャンクは完全な文のみを含む
  And 文が途中で切断されない

Scenario: 長い文を適切に処理する
  Given 単一の文が600トークンである
  And maxChunkSize=768が設定されている
  When 文単位チャンキングを実行する
  Then その文は単独で1チャンクとなる
  And 警告ログが出力される

Scenario: 文のオーバーラップを適用する
  Given sentenceOverlap=2が設定されている
  When 文単位チャンキングを実行する
  Then 連続するチャンク間に最大2文の重複がある
```

---

#### FR-CHUNK-003: セマンティックチャンキング（Semantic Chunking）

**説明**: 意味的な一貫性を保持してチャンクを生成する

**パラメータ定義**:

| パラメータ          | 型       | デフォルト値             | 有効範囲             | 説明               |
| ------------------- | -------- | ------------------------ | -------------------- | ------------------ |
| targetChunkSize     | number   | 512                      | 128-4096             | 目標チャンクサイズ |
| maxChunkSize        | number   | 1024                     | targetChunkSize-8192 | 最大チャンクサイズ |
| similarityThreshold | number   | 0.7                      | 0.0-1.0              | 文間類似度の閾値   |
| embeddingModel      | string   | "text-embedding-3-small" | -                    | 類似度計算用モデル |
| breakPoints         | string[] | ["##", "###", "---"]     | -                    | 強制分割マーカー   |

**受け入れ基準**:

```gherkin
Scenario: 意味的に関連する文をグループ化する
  Given 話題が3回変わるテキストが入力される
  And similarityThreshold=0.7が設定されている
  When セマンティックチャンキングを実行する
  Then 少なくとも3つのチャンクが生成される
  And 各チャンク内の文は意味的に関連している

Scenario: 見出しマーカーで強制分割する
  Given "## セクション1"と"## セクション2"を含むテキストがある
  And breakPoints=["##"]が設定されている
  When セマンティックチャンキングを実行する
  Then 各セクションは別のチャンクに分割される

Scenario: 類似度閾値を超えた場合に分割する
  Given 連続する2文の類似度が0.5である
  And similarityThreshold=0.7が設定されている
  When セマンティックチャンキングを実行する
  Then 2つの文は別のチャンクに分割される
```

---

#### FR-CHUNK-004: 階層チャンキング（Hierarchical Chunking）

**説明**: 文書構造（見出し、セクション）を反映したチャンクを生成する

**パラメータ定義**:

| パラメータ           | 型      | デフォルト値  | 有効範囲 | 説明                                 |
| -------------------- | ------- | ------------- | -------- | ------------------------------------ |
| targetChunkSize      | number  | 512           | 128-4096 | リーフチャンクの目標サイズ           |
| maxDepth             | number  | 3             | 1-6      | 階層の最大深度                       |
| headingPatterns      | object  | Markdown/HTML | -        | 見出し検出パターン                   |
| inheritParentContext | boolean | true          | -        | 親のコンテキストを継承するか         |
| createSummaryChunks  | boolean | false         | -        | 各階層にサマリーチャンクを作成するか |

**階層構造出力**:

```typescript
interface HierarchicalChunk {
  id: string;
  content: string;
  level: number; // 0=ルート, 1=H1, 2=H2, etc.
  parentId: string | null;
  childIds: string[];
  path: string[]; // ["Chapter 1", "Section 1.1", "Paragraph 3"]
  metadata: {
    heading: string;
    position: number;
  };
}
```

**受け入れ基準**:

```gherkin
Scenario: Markdownの見出し構造を認識する
  Given H1, H2, H3を含むMarkdownテキストがある
  When 階層チャンキングを実行する
  Then 見出しレベルに対応した階層構造が生成される
  And 各チャンクにparentIdとchildIdsが設定される

Scenario: 親のコンテキストを継承する
  Given inheritParentContext=trueが設定されている
  When 階層チャンキングを実行する
  Then 子チャンクは親の見出しをpathに含む

Scenario: 最大深度を超えた階層を処理する
  Given H1からH6までの見出しがある
  And maxDepth=3が設定されている
  When 階層チャンキングを実行する
  Then H4以下はH3のレベルとして扱われる
```

---

### 3.2 Contextual Embeddings

#### FR-CONTEXT-001: Contextual Embeddings生成

**説明**: Anthropic Contextual Retrieval手法に基づき、チャンクに文書全体のコンテキストを付与する

**パラメータ定義**:

| パラメータ            | 型                             | デフォルト値 | 有効範囲   | 説明                                       |
| --------------------- | ------------------------------ | ------------ | ---------- | ------------------------------------------ |
| enabled               | boolean                        | true         | -          | Contextual Embeddingsを有効にするか        |
| contextWindowSize     | number                         | 4096         | 1024-16384 | コンテキスト生成に使用する最大トークン数   |
| contextPromptTemplate | string                         | (後述)       | -          | コンテキスト生成用プロンプト               |
| contextPosition       | "prefix" \| "suffix" \| "both" | "prefix"     | -          | コンテキストの付与位置                     |
| cacheContext          | boolean                        | true         | -          | 文書レベルのコンテキストをキャッシュするか |

**コンテキストプロンプトテンプレート**:

```
<document>
{{WHOLE_DOCUMENT}}
</document>

Here is the chunk we want to situate within the whole document:
<chunk>
{{CHUNK_CONTENT}}
</chunk>

Please give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk. Answer only with the succinct context and nothing else.
```

**出力形式**:

```typescript
interface ContextualChunk {
  id: string;
  originalContent: string; // 元のチャンク内容
  context: string; // 生成されたコンテキスト
  contextualizedContent: string; // コンテキスト + 元の内容
  metadata: {
    documentId: string;
    contextTokenCount: number;
    originalTokenCount: number;
  };
}
```

**受け入れ基準**:

```gherkin
Scenario: チャンクにコンテキストを付与する
  Given チャンク"The pricing model has three tiers."がある
  And 元の文書が料金体系について説明している
  When Contextual Embeddings生成を実行する
  Then コンテキスト"This chunk describes the pricing structure of our SaaS product."が生成される
  And contextualizedContentに結合される

Scenario: 大規模文書でコンテキストを生成する
  Given 50,000トークンの文書がある
  And contextWindowSize=4096が設定されている
  When Contextual Embeddings生成を実行する
  Then 文書の要約と該当セクションが使用される
  And 生成コンテキストは4096トークン以内である

Scenario: コンテキストをキャッシュする
  Given 同一文書から10チャンクが生成される
  And cacheContext=trueが設定されている
  When Contextual Embeddings生成を実行する
  Then 文書レベルのコンテキストは1回だけ生成される
  And 各チャンクには同じ文書コンテキストが参照される
```

---

### 3.3 Late Chunking

#### FR-LATE-001: Late Chunking処理

**説明**: Jina AI Late Chunking手法に基づき、トークナイズ後に埋め込み空間でチャンキングする

**パラメータ定義**:

| パラメータ        | 型                                  | デフォルト値         | 有効範囲  | 説明                         |
| ----------------- | ----------------------------------- | -------------------- | --------- | ---------------------------- |
| enabled           | boolean                             | true                 | -         | Late Chunkingを有効にするか  |
| embeddingModel    | string                              | "jina-embeddings-v3" | -         | 対応する埋め込みモデル       |
| chunkBoundaries   | "sentence" \| "token" \| "semantic" | "sentence"           | -         | チャンク境界の決定方法       |
| maxSequenceLength | number                              | 8192                 | 512-32768 | 一度にトークナイズする最大長 |
| poolingStrategy   | "mean" \| "cls" \| "attention"      | "mean"               | -         | トークン埋め込みの集約方法   |

**処理フロー**:

```
1. 文書全体をトークナイズ
2. 全トークンの埋め込みを生成（文脈を保持）
3. 境界位置を決定
4. 境界に基づきトークン埋め込みをグループ化
5. グループごとにプーリングしてチャンク埋め込みを生成
```

**受け入れ基準**:

```gherkin
Scenario: Late Chunkingで埋め込みを生成する
  Given 2000トークンの文書がある
  And chunkBoundaries="sentence"が設定されている
  When Late Chunking処理を実行する
  Then 文全体の文脈を考慮した埋め込みが生成される
  And 各チャンクの埋め込みは前後の文脈を反映している

Scenario: 長い文書を分割処理する
  Given 50,000トークンの文書がある
  And maxSequenceLength=8192が設定されている
  When Late Chunking処理を実行する
  Then 文書は複数のセグメントに分割される
  And 各セグメントは適切にオーバーラップして処理される

Scenario: 対応モデルを検証する
  Given embeddingModel="text-embedding-ada-002"が設定されている
  When Late Chunking処理を実行する
  Then エラー"Late Chunking not supported for this model"が発生する
```

---

### 3.4 ドキュメントタイプ別最適化

#### FR-DOCTYPE-001: ドキュメントタイプ別チャンキング戦略

**説明**: ドキュメントタイプに応じて最適なチャンキング戦略とパラメータを自動選択する

**推奨戦略マッピング**:

| ドキュメントタイプ | 推奨戦略         | チャンクサイズ | オーバーラップ | 理由                        |
| ------------------ | ---------------- | -------------- | -------------- | --------------------------- |
| Markdown文書       | hierarchical     | 512            | 10%            | 見出し構造を活用            |
| ソースコード       | semantic         | 256            | 20%            | 関数/クラス単位の意味的境界 |
| 技術文書（PDF）    | fixed + sentence | 1024           | 15%            | 長い説明文への対応          |
| API仕様書          | hierarchical     | 384            | 5%             | エンドポイント単位の構造    |
| 会話ログ           | sentence         | 256            | 1文            | 発話単位の区切り            |
| 法務文書           | semantic         | 768            | 25%            | 条項間の参照関係            |
| ニュース記事       | sentence         | 512            | 10%            | 段落単位の完結性            |
| 学術論文           | hierarchical     | 1024           | 15%            | セクション構造の重要性      |

**パラメータ定義**:

```typescript
interface DocumentTypeConfig {
  type: DocumentType;
  strategy: ChunkingStrategy;
  parameters: {
    chunkSize: number;
    overlapPercentage: number;
    additionalOptions?: Record<string, unknown>;
  };
  contextualEmbeddings: boolean;
  lateChunking: boolean;
}
```

**受け入れ基準**:

```gherkin
Scenario: ドキュメントタイプを自動検出する
  Given ".md"拡張子のファイルが入力される
  When ドキュメントタイプ判定を実行する
  Then DocumentType.MARKDOWNが返される
  And hierarchical戦略が推奨される

Scenario: ソースコードを適切にチャンキングする
  Given TypeScriptファイルが入力される
  When 自動チャンキングを実行する
  Then 関数やクラス単位でチャンクが分割される
  And importステートメントは適切に処理される

Scenario: カスタム設定でオーバーライドする
  Given Markdownファイルが入力される
  And カスタムでfixed戦略が指定されている
  When チャンキングを実行する
  Then fixed戦略が適用される（自動推奨より優先）
```

---

## 4. 非機能要件

### 4.1 性能要件（Performance）

#### NFR-PERF-001: チャンキング処理速度

| メトリクス        | 目標値      | 測定条件                   |
| ----------------- | ----------- | -------------------------- |
| スループット      | >= 100KB/秒 | 固定サイズチャンキング     |
| スループット      | >= 50KB/秒  | セマンティックチャンキング |
| レイテンシ（P95） | < 500ms     | 10KBテキストの処理         |
| レイテンシ（P99） | < 2秒       | 100KBテキストの処理        |

**受け入れ基準**:

```gherkin
Scenario: 大量テキストを高速処理する
  Given 1MBのテキストファイルがある
  When 固定サイズチャンキングを実行する
  Then 処理時間は10秒以内である
  And メモリ使用量は処理中500MB以下である

Scenario: 複数ファイルを並列処理する
  Given 100個の10KBファイルがある
  When 並列チャンキング（並列度4）を実行する
  Then 総処理時間は50秒以内である
```

#### NFR-PERF-002: Contextual Embeddings生成速度

| メトリクス         | 目標値            | 測定条件             |
| ------------------ | ----------------- | -------------------- |
| コンテキスト生成   | >= 10チャンク/秒  | LLM API呼び出し含む  |
| キャッシュヒット時 | >= 100チャンク/秒 | コンテキスト再利用時 |

---

### 4.2 メモリ要件（Memory）

#### NFR-MEM-001: メモリ使用量制限

| メトリクス   | 目標値  | 測定条件               |
| ------------ | ------- | ---------------------- |
| ベースメモリ | < 100MB | アイドル時             |
| ピークメモリ | < 500MB | 1MBファイル処理時      |
| メモリリーク | 0       | 1000ファイル連続処理後 |

**受け入れ基準**:

```gherkin
Scenario: 大規模ファイルでメモリを制限する
  Given 10MBのテキストファイルがある
  When ストリーミングモードでチャンキングを実行する
  Then メモリ使用量は1GB以下を維持する
  And 全チャンクが正しく生成される

Scenario: 長時間運用でメモリリークがない
  Given 1000ファイルの連続処理を行う
  When 各ファイル処理後にメモリ使用量を計測する
  Then 処理開始時と終了時のメモリ差は10%以内である
```

#### NFR-MEM-002: ストリーミング処理

| 要件               | 説明                                      |
| ------------------ | ----------------------------------------- |
| 大規模ファイル対応 | 10MB以上のファイルはストリーミング処理    |
| チャンク出力       | イテレータ/ジェネレータ形式で逐次出力可能 |
| バックプレッシャー | 下流処理の遅延に応じた流量制御            |

---

### 4.3 スケーラビリティ要件（Scalability）

#### NFR-SCALE-001: 水平スケーリング

| メトリクス   | 目標値         | 測定条件                    |
| ------------ | -------------- | --------------------------- |
| 並列処理効率 | >= 80%         | 4並列時のスループット向上率 |
| ワーカー数   | 1-16           | CPU数に応じた自動調整       |
| キュー容量   | 10,000ファイル | 処理待ちキューの最大サイズ  |

---

### 4.4 信頼性要件（Reliability）

#### NFR-REL-001: エラーハンドリング

| エラーケース         | 対応                                         |
| -------------------- | -------------------------------------------- |
| 無効なテキスト入力   | バリデーションエラーを返却                   |
| トークナイザーエラー | リトライ（最大3回）後にフォールバック        |
| LLM API タイムアウト | 60秒タイムアウト、リトライ（指数バックオフ） |
| メモリ不足           | ストリーミングモードへ自動切替               |

**受け入れ基準**:

```gherkin
Scenario: 不正な入力を適切に処理する
  Given 空文字列が入力される
  When チャンキングを実行する
  Then ValidationError("Empty input text")が発生する
  And 処理は中断されず次のファイルへ進む

Scenario: LLM APIエラーからリカバリする
  Given Contextual Embeddings生成中にAPIエラーが発生する
  When エラーハンドリングが実行される
  Then 指数バックオフで3回リトライする
  And 失敗後はコンテキストなしで継続する
  And エラーログが記録される
```

#### NFR-REL-002: 冪等性

| 要件         | 説明                               |
| ------------ | ---------------------------------- |
| 入力の再処理 | 同一入力に対して同一チャンクを生成 |
| 決定論的出力 | ランダム要素を含まない処理結果     |
| 再開可能性   | 中断後に未処理ファイルから再開可能 |

---

### 4.5 可観測性要件（Observability）

#### NFR-OBS-001: メトリクス収集

| メトリクス                | 型        | 説明                               |
| ------------------------- | --------- | ---------------------------------- |
| chunking_duration_seconds | Histogram | チャンキング処理時間               |
| chunks_created_total      | Counter   | 生成チャンク数                     |
| chunk_size_tokens         | Histogram | チャンクサイズ分布                 |
| memory_usage_bytes        | Gauge     | メモリ使用量                       |
| errors_total              | Counter   | エラー発生数（ラベル: error_type） |

#### NFR-OBS-002: ログ出力

| レベル | 内容                                 |
| ------ | ------------------------------------ |
| DEBUG  | 各チャンクの境界位置、トークン数     |
| INFO   | ファイル処理開始/完了、チャンク数    |
| WARN   | 長大なチャンク、非推奨パラメータ使用 |
| ERROR  | 処理失敗、API エラー                 |

---

## 5. インターフェース定義

### 5.1 入力インターフェース

```typescript
interface ChunkingInput {
  /** 処理対象テキスト */
  text: string;

  /** チャンキング戦略 */
  strategy: "fixed" | "sentence" | "semantic" | "hierarchical";

  /** 戦略固有のオプション */
  options: ChunkingOptions;

  /** メタデータ */
  metadata?: {
    documentId: string;
    documentType?: DocumentType;
    sourceFile?: string;
  };

  /** 拡張オプション */
  advanced?: {
    contextualEmbeddings?: boolean;
    lateChunking?: boolean;
  };
}
```

### 5.2 出力インターフェース

```typescript
interface ChunkingOutput {
  /** 生成されたチャンク */
  chunks: Chunk[];

  /** 処理統計 */
  statistics: {
    totalChunks: number;
    avgChunkSize: number;
    minChunkSize: number;
    maxChunkSize: number;
    processingTimeMs: number;
  };

  /** 警告メッセージ */
  warnings?: string[];
}

interface Chunk {
  id: string;
  content: string;
  tokenCount: number;
  position: {
    start: number;
    end: number;
  };
  metadata: {
    strategy: string;
    overlap?: {
      previous: number;
      next: number;
    };
    hierarchyPath?: string[];
    context?: string;
  };
}
```

---

## 6. 制約事項

### 6.1 技術的制約

| 制約                         | 理由                                  |
| ---------------------------- | ------------------------------------- |
| 最大入力サイズ: 100MB        | メモリ制限とタイムアウト防止          |
| 最大チャンク数: 10,000/文書  | ベクトルDB書き込み性能の制限          |
| トークナイザー: tiktoken互換 | OpenAI系モデルとの互換性              |
| Late Chunking対応モデル      | Jina Embeddings v3、一部BGEモデルのみ |

### 6.2 運用制約

| 制約               | 理由                                       |
| ------------------ | ------------------------------------------ |
| LLM API レート制限 | Contextual Embeddings生成のAPI呼び出し上限 |
| 並列処理数上限     | システムリソース保護                       |
| ストレージ容量     | チャンクキャッシュの容量上限               |

---

## 7. 既存型定義との整合性

本要件は、以下の既存型定義と整合性を保つ:

**参照**: `packages/shared/src/types/rag/chunk.ts`

```typescript
// 既存の型定義との対応
type ChunkingStrategy = "fixed" | "sentence" | "semantic" | "hierarchical";
type DocumentType = "markdown" | "text" | "html" | "pdf" | "code" | "json";

interface ChunkMetadata {
  documentId: string;
  chunkIndex: number;
  startPosition: number;
  endPosition: number;
  tokenCount: number;
  strategy: ChunkingStrategy;
  hierarchyPath?: string[];
  overlap?: { previous: number; next: number };
}
```

---

## 8. 追跡マトリクス

| 要件ID         | 要件名                     | 優先度 | ステータス | テストケースID    |
| -------------- | -------------------------- | ------ | ---------- | ----------------- |
| FR-CHUNK-001   | 固定サイズチャンキング     | Must   | Draft      | TC-CHUNK-001-\*   |
| FR-CHUNK-002   | 文単位チャンキング         | Must   | Draft      | TC-CHUNK-002-\*   |
| FR-CHUNK-003   | セマンティックチャンキング | Should | Draft      | TC-CHUNK-003-\*   |
| FR-CHUNK-004   | 階層チャンキング           | Should | Draft      | TC-CHUNK-004-\*   |
| FR-CONTEXT-001 | Contextual Embeddings      | Should | Draft      | TC-CONTEXT-001-\* |
| FR-LATE-001    | Late Chunking              | Could  | Draft      | TC-LATE-001-\*    |
| FR-DOCTYPE-001 | ドキュメントタイプ別最適化 | Should | Draft      | TC-DOCTYPE-001-\* |
| NFR-PERF-001   | 処理速度                   | Must   | Draft      | TC-PERF-001-\*    |
| NFR-PERF-002   | Contextual生成速度         | Should | Draft      | TC-PERF-002-\*    |
| NFR-MEM-001    | メモリ使用量               | Must   | Draft      | TC-MEM-001-\*     |
| NFR-MEM-002    | ストリーミング処理         | Should | Draft      | TC-MEM-002-\*     |
| NFR-SCALE-001  | 水平スケーリング           | Should | Draft      | TC-SCALE-001-\*   |
| NFR-REL-001    | エラーハンドリング         | Must   | Draft      | TC-REL-001-\*     |
| NFR-REL-002    | 冪等性                     | Must   | Draft      | TC-REL-002-\*     |
| NFR-OBS-001    | メトリクス収集             | Should | Draft      | TC-OBS-001-\*     |
| NFR-OBS-002    | ログ出力                   | Should | Draft      | TC-OBS-002-\*     |

---

## 9. 変更履歴

| バージョン | 日付       | 変更者               | 変更内容 |
| ---------- | ---------- | -------------------- | -------- |
| 1.0.0      | 2025-12-26 | Requirements Analyst | 初版作成 |

---

## 10. 承認

| 役割       | 氏名                 | 署名 | 日付       |
| ---------- | -------------------- | ---- | ---------- |
| 作成者     | Requirements Analyst | -    | 2025-12-26 |
| レビュワー | -                    | -    | -          |
| 承認者     | -                    | -    | -          |
