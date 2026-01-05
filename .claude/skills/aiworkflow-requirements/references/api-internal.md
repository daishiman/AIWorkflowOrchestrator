# 内部API・RAG API 仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 内部サービスAPI（RAG変換システム）

### ConversionService API

RAG Conversion Systemは、HTTPエンドポイントとしてではなく、TypeScriptの内部サービスクラスとして実装されています。

**利用場所**: `packages/shared/src/services/conversion/`

**主要クラス**:

| クラス              | 責務                                       |
| ------------------- | ------------------------------------------ |
| `ConversionService` | 変換処理の統括、タイムアウト・同時実行制御 |
| `ConverterRegistry` | 利用可能なコンバーターの管理と選択         |
| `BaseConverter`     | 共通変換処理の抽象基底クラス               |

### ConversionService メソッド

#### convert()

```typescript
async convert(
  input: ConverterInput,
  options?: ConverterOptions
): Promise<Result<ConverterOutput, RAGError>>
```

**機能**:

- 単一ファイルを変換
- 同時実行数チェック（デフォルト: 最大5件）
- タイムアウト管理（デフォルト: 60秒）
- 自動コンバーター選択

**パラメータ**:

- `input.fileId`: ファイルID（Branded型）
- `input.content`: ファイルコンテンツ（文字列またはBuffer）
- `input.mimeType`: MIMEタイプ
- `input.filePath`: ファイルパス（オプション）
- `options.maxContentLength`: 最大コンテンツ長（デフォルト: 100,000文字）
- `options.timeout`: タイムアウト時間（ミリ秒）

**戻り値**:

- 成功: `{ success: true, data: ConverterOutput }`
- 失敗: `{ success: false, error: RAGError }`

#### convertBatch()

```typescript
async convertBatch(
  inputs: ConverterInput[],
  options?: ConverterOptions
): Promise<BatchConversionResult[]>
```

**機能**:

- 複数ファイルを一括変換
- チャンク単位で処理（同時実行数制限）
- Promise.allSettled()で一部失敗を許容

**戻り値**:

- 各ファイルの変換結果（成功/失敗）の配列

#### canConvert()

```typescript
canConvert(input: ConverterInput): boolean
```

**機能**:

- 変換可能性を事前確認
- コンバーター検索のみ（変換は実行しない）

#### getSupportedMimeTypes()

```typescript
getSupportedMimeTypes(): string[]
```

**機能**:

- サポートしているMIMEタイプ一覧を取得

### 使用パターン

**パターン1: グローバルインスタンス使用**

```typescript
import { globalConversionService } from "@repo/shared/services/conversion";

const result = await globalConversionService.convert(input);
```

**パターン2: カスタム設定インスタンス**

```typescript
import { createConversionService } from "@repo/shared/services/conversion";

const service = createConversionService(customRegistry, {
  defaultTimeout: 30000,
  maxConcurrentConversions: 10,
});

const result = await service.convert(input);
```

### エラーハンドリング

**エラーコード**:

| コード                | 説明               | 原因                                   |
| --------------------- | ------------------ | -------------------------------------- |
| `RESOURCE_EXHAUSTED`  | 同時実行数超過     | 最大同時実行数に到達                   |
| `TIMEOUT`             | タイムアウト       | 変換処理が指定時間内に完了しなかった   |
| `CONVERTER_NOT_FOUND` | コンバーター未検出 | 対応するコンバーターが登録されていない |
| `CONVERSION_FAILED`   | 変換失敗           | 個別コンバーターでのエラー             |

**Result型パターン**:

```typescript
const result = await service.convert(input);

if (result.success) {
  const { convertedContent, extractedMetadata } = result.data;
  // 成功時の処理
} else {
  const { code, message, context } = result.error;
  // エラー処理
  console.error(`[${code}] ${message}`, context);
}
```

### 性能特性

| 指標                       | 値     |
| -------------------------- | ------ |
| デフォルトタイムアウト     | 60秒   |
| 最大同時実行数             | 5件    |
| サポートMIMEタイプ         | 18種類 |
| 平均変換時間（小ファイル） | 3-50ms |
| 平均変換時間（Markdown）   | 400ms  |

---

## チャンク検索API（RAG全文検索）

### 概要

FTS5全文検索機能を利用したチャンク検索APIの設計。将来的にREST APIまたはElectron IPCとして実装予定。

**実装状況**: データベース層（chunks-search.ts）のみ実装済み、API層は未実装

### 検索エンドポイント（将来実装）

#### キーワード検索

**エンドポイント**: `POST /api/v1/chunks/search/keyword`

**リクエストボディ**:

| フィールド      | 型     | 必須 | 説明                                    |
| --------------- | ------ | ---- | --------------------------------------- |
| query           | string | Yes  | 検索クエリ（複数キーワードOR検索）      |
| fileId          | string | No   | ファイルIDで絞り込み（ULID形式）        |
| limit           | number | No   | 取得件数（デフォルト: 10、最大: 100）   |
| offset          | number | No   | オフセット（デフォルト: 0）             |
| highlightTags   | object | No   | ハイライトタグ（開始/終了タグ）         |
| bm25ScaleFactor | number | No   | BM25スケールファクタ（デフォルト: 0.3） |

**レスポンス**:

| フィールド            | 型      | 説明                                 |
| --------------------- | ------- | ------------------------------------ |
| results               | array   | 検索結果配列                         |
| results[].id          | string  | チャンクID                           |
| results[].content     | string  | チャンク本文                         |
| results[].highlighted | string  | ハイライト適用済み本文（オプション） |
| results[].score       | number  | 関連度スコア（0.0 - 1.0）            |
| results[].fileId      | string  | 親ファイルID                         |
| results[].chunkIndex  | number  | ファイル内の順序                     |
| totalCount            | number  | 総ヒット数                           |
| hasMore               | boolean | 次ページの有無                       |

#### フレーズ検索

**エンドポイント**: `POST /api/v1/chunks/search/phrase`

**リクエストボディ**: キーワード検索と同じ（queryは完全一致フレーズ）

**動作**: 語順を保持した完全一致検索

#### NEAR検索（近接検索）

**エンドポイント**: `POST /api/v1/chunks/search/near`

**リクエストボディ**:

| フィールド   | 型       | 必須 | 説明                                |
| ------------ | -------- | ---- | ----------------------------------- |
| terms        | string[] | Yes  | 検索キーワード配列（2個以上）       |
| nearDistance | number   | No   | 近接距離（デフォルト: 5、最大: 50） |
| fileId       | string   | No   | ファイルIDで絞り込み                |
| limit        | number   | No   | 取得件数                            |
| offset       | number   | No   | オフセット                          |

**動作**: 指定距離内にすべてのキーワードが出現するチャンクを検索

### 性能目標

| 指標               | 目標値（10,000チャンク） | 備考             |
| ------------------ | ------------------------ | ---------------- |
| キーワード検索速度 | < 100ms                  | 95パーセンタイル |
| フレーズ検索速度   | < 100ms                  | 95パーセンタイル |
| NEAR検索速度       | < 150ms                  | 95パーセンタイル |
| 並行検索（10req）  | < 100ms（平均）          | スループット維持 |

### 使用例（データベース層）

現在実装済みのデータベース層APIの使用例：

```typescript
// キーワード検索
import { searchChunksByKeyword } from "@repo/shared/db/queries/chunks-search";

const results = await searchChunksByKeyword(db, {
  query: "TypeScript JavaScript",
  limit: 10,
  offset: 0,
});

// フレーズ検索
const phraseResults = await searchChunksByPhrase(db, {
  query: "typed superset",
  limit: 10,
});

// NEAR検索
const nearResults = await searchChunksByNear(db, ["JavaScript", "library"], {
  nearDistance: 5,
  limit: 10,
});
```

### 実装ステータス

| レイヤー       | 実装状況    | 備考                       |
| -------------- | ----------- | -------------------------- |
| データベース層 | ✅ 実装済み | `queries/chunks-search.ts` |
| サービス層     | 未実装      | 将来追加予定               |
| REST API層     | 未実装      | Next.js App Router         |
| Desktop IPC層  | 未実装      | Electron IPC               |

**参照実装**: `packages/shared/src/db/queries/chunks-search.ts`

---

## Embedding Generation API

> **実装**: `packages/shared/src/services/embedding/`

### 主要インターフェース

#### ドキュメント埋め込み処理

**メソッド**: `EmbeddingPipeline.process()`

```typescript
process(
  input: PipelineInput,
  config?: PipelineConfig,
  onProgress?: (progress: PipelineProgress) => void
): Promise<PipelineOutput>
```

**入力パラメータ**:

| パラメータ                                | 型           | 説明                               |
| ----------------------------------------- | ------------ | ---------------------------------- |
| `input.documentId`                        | string       | ドキュメント識別子                 |
| `input.documentType`                      | DocumentType | markdown / code / text             |
| `input.text`                              | string       | ドキュメントテキスト               |
| `input.metadata`                          | object       | メタデータ（オプション）           |
| `config.chunking.strategy`                | string       | fixed / markdown / code / semantic |
| `config.chunking.options.chunkSize`       | number       | 512（デフォルト）                  |
| `config.embedding.modelId`                | string       | EMB-002等                          |
| `config.embedding.batchOptions.batchSize` | number       | 50（デフォルト）                   |
| `onProgress`                              | function     | 進捗コールバック                   |

**出力パラメータ**:

| フィールド              | 型         | 説明                   |
| ----------------------- | ---------- | ---------------------- |
| `documentId`            | string     | ドキュメントID         |
| `chunks`                | Chunk[]    | 生成されたチャンク配列 |
| `embeddings`            | number[][] | 埋め込みベクトル配列   |
| `chunksProcessed`       | number     | 処理されたチャンク数   |
| `embeddingsGenerated`   | number     | 生成された埋め込み数   |
| `duplicatesRemoved`     | number     | 重複排除数             |
| `cacheHits`             | number     | キャッシュヒット数     |
| `totalProcessingTimeMs` | number     | 総処理時間（ms）       |
| `stageTimings`          | object     | ステージ別処理時間     |

#### 単一埋め込み生成

**メソッド**: `EmbeddingService.embed()`

```typescript
embed(
  text: string,
  options?: EmbedOptions
): Promise<EmbeddingResult>
```

**入力パラメータ**:

| パラメータ        | 型           | 説明                 |
| ----------------- | ------------ | -------------------- |
| `text`            | string       | 埋め込み対象テキスト |
| `options.timeout` | number       | タイムアウト（ms）   |
| `options.retry`   | RetryOptions | リトライ設定         |

**出力パラメータ**:

| フィールド         | 型       | 説明             |
| ------------------ | -------- | ---------------- |
| `embedding`        | number[] | 埋め込みベクトル |
| `tokenCount`       | number   | トークン数       |
| `model`            | string   | 使用モデル       |
| `processingTimeMs` | number   | 処理時間（ms）   |

#### バッチ埋め込み生成

**メソッド**: `EmbeddingService.embedBatch()`

```typescript
embedBatch(
  texts: string[],
  options?: BatchEmbedOptions
): Promise<BatchEmbeddingResult>
```

**入力パラメータ**:

| パラメータ                    | 型       | 説明                           |
| ----------------------------- | -------- | ------------------------------ |
| `texts`                       | string[] | テキスト配列                   |
| `options.batchSize`           | number   | バッチサイズ（デフォルト: 50） |
| `options.concurrency`         | number   | 並列数（デフォルト: 2）        |
| `options.enableDeduplication` | boolean  | 重複排除（デフォルト: true）   |

**出力パラメータ**:

| フィールド         | 型         | 説明                 |
| ------------------ | ---------- | -------------------- |
| `embeddings`       | number[][] | 埋め込みベクトル配列 |
| `duplicatesRemoved | number     | 重複排除数           |
| `totalTimeMs`      | number     | 総処理時間（ms）     |

#### チャンク生成

**メソッド**: `ChunkingService.chunk()`

```typescript
chunk(
  document: Document,
  strategy: ChunkingStrategy,
  options?: ChunkingOptions
): Promise<Chunk[]>
```

**入力パラメータ**:

| パラメータ            | 型               | 説明                            |
| --------------------- | ---------------- | ------------------------------- |
| `document.id`         | string           | ドキュメントID                  |
| `document.type`       | DocumentType     | markdown / code / text          |
| `document.content`    | string           | ドキュメント本文                |
| `strategy`            | ChunkingStrategy | fixed / markdown / code / ...   |
| `options.chunkSize`   | number           | チャンクサイズ（デフォルト512） |
| `options.overlapSize` | number           | オーバーラップ（デフォルト50）  |

**出力パラメータ**:

| フィールド                | 型     | 説明                 |
| ------------------------- | ------ | -------------------- |
| `chunks[].content`        | string | チャンク本文         |
| `chunks[].metadata.index` | number | チャンクインデックス |
| `chunks[].metadata.type`  | string | チャンクタイプ       |
| `chunks[].size`           | number | サイズ（文字数）     |

### エラーコード

| エラーコード              | 説明                         | HTTPステータス |
| ------------------------- | ---------------------------- | -------------- |
| `EMB_INVALID_INPUT`       | 入力パラメータが不正         | 400            |
| `EMB_PROVIDER_ERROR`      | プロバイダAPIエラー          | 502            |
| `EMB_CIRCUIT_OPEN`        | サーキットブレーカーが開状態 | 503            |
| `EMB_RATE_LIMIT_EXCEEDED` | レート制限超過               | 429            |
| `EMB_TIMEOUT`             | タイムアウト                 | 504            |
| `EMB_CACHE_ERROR`         | キャッシュエラー             | 500            |

### 性能指標

| 指標                         | 値      |
| ---------------------------- | ------- |
| 1000チャンク処理時間         | 2.17秒  |
| メモリ使用量（1000チャンク） | 8.9MB   |
| キャッシュヒット率           | 95%以上 |
| 重複排除率                   | 10-15%  |
| 差分更新高速化               | 4.34倍  |

---

## Search Service API

> **実装**: `packages/shared/src/search/`

### 概要

テキスト検索・置換機能を提供する内部サービスAPI。ファイル内検索とワークスペース全体検索の両方をサポート。

### 主要クラス

| クラス                  | 責務                                       |
| ----------------------- | ------------------------------------------ |
| `SearchService`         | 検索・置換機能のファサード（統一API）      |
| `PatternMatcher`        | パターンマッチング（リテラル/正規表現）    |
| `FileSearchEngine`      | 単一ファイル内の検索                       |
| `ReplaceEngine`         | テキスト置換処理                           |
| `WorkspaceSearchEngine` | 複数ファイル横断検索（AsyncGenerator）     |

### SearchService メソッド

#### searchInFile()

```typescript
searchInFile(
  content: string,
  pattern: string,
  options: SearchOptions
): SearchMatch[]
```

**機能**:

- 単一ファイル（テキスト）内を検索
- 行番号・列番号を含むマッチ情報を返却
- コンテキスト行（前後の行）を取得可能

**パラメータ**:

| パラメータ              | 型      | 説明                   |
| ----------------------- | ------- | ---------------------- |
| `content`               | string  | 検索対象のテキスト     |
| `pattern`               | string  | 検索パターン           |
| `options.caseSensitive` | boolean | 大文字小文字を区別     |
| `options.wholeWord`     | boolean | 単語単位でマッチ       |
| `options.regex`         | boolean | 正規表現を使用         |

**戻り値**:

| フィールド          | 型       | 説明                 |
| ------------------- | -------- | -------------------- |
| `[].line`           | number   | 行番号（1-indexed）  |
| `[].column`         | number   | 列番号（1-indexed）  |
| `[].length`         | number   | マッチした文字列長   |
| `[].text`           | string   | マッチしたテキスト   |
| `[].lineText`       | string   | 行全体のテキスト     |
| `[].context.before` | string[] | 前の行（コンテキスト）|
| `[].context.after`  | string[] | 後の行（コンテキスト）|

#### searchInWorkspace()

```typescript
async *searchInWorkspace(
  pattern: string,
  options: WorkspaceSearchOptions & { workspacePath?: string }
): AsyncGenerator<FileSearchResult>
```

**機能**:

- ワークスペース内の複数ファイルを検索
- AsyncGeneratorによるストリーミング結果返却
- glob パターンによるファイル絞り込み
- キャンセル可能

**パラメータ**:

| パラメータ             | 型       | 説明                           |
| ---------------------- | -------- | ------------------------------ |
| `pattern`              | string   | 検索パターン                   |
| `options.workspacePath`| string   | ワークスペースパス（省略時はcwd）|
| `options.include`      | string[] | インクルードパターン（glob）   |
| `options.exclude`      | string[] | エクスクルードパターン（glob） |
| `options.maxResults`   | number   | 最大結果数                     |
| `options.contextLines` | number   | コンテキスト行数               |

**戻り値（yield）**:

| フィールド | 型            | 説明             |
| ---------- | ------------- | ---------------- |
| `filePath` | string        | ファイルパス     |
| `matches`  | SearchMatch[] | マッチ情報配列   |

#### replaceInFile()

```typescript
replaceInFile(
  content: string,
  pattern: string,
  replacement: string,
  options: SearchOptions
): ReplaceResult
```

**機能**:

- 単一ファイル内のパターンを置換
- 正規表現キャプチャグループ（$1, $2, $<name>）のサポート
- 置換位置のトラッキング

**パラメータ**:

| パラメータ    | 型            | 説明             |
| ------------- | ------------- | ---------------- |
| `content`     | string        | 置換対象テキスト |
| `pattern`     | string        | 検索パターン     |
| `replacement` | string        | 置換文字列       |
| `options`     | SearchOptions | 検索オプション   |

**戻り値**:

| フィールド               | 型            | 説明               |
| ------------------------ | ------------- | ------------------ |
| `content`                | string        | 置換後のテキスト   |
| `count`                  | number        | 置換した件数       |
| `replacements`           | Replacement[] | 置換詳細一覧       |
| `replacements[].line`    | number        | 行番号             |
| `replacements[].column`  | number        | 列番号             |
| `replacements[].originalText`  | string  | 置換前テキスト     |
| `replacements[].replacedText`  | string  | 置換後テキスト     |

#### replaceInWorkspace()

```typescript
async *replaceInWorkspace(
  pattern: string,
  replacement: string,
  options: WorkspaceSearchOptions & { workspacePath?: string }
): AsyncGenerator<WorkspaceReplaceResult>
```

**機能**:

- ワークスペース内の複数ファイルを置換
- プレビューモード（ファイル変更しない）
- ドライランモードのサポート
- AsyncGeneratorによるストリーミング

**パラメータ**:

| パラメータ        | 型      | 説明                         |
| ----------------- | ------- | ---------------------------- |
| `pattern`         | string  | 検索パターン                 |
| `replacement`     | string  | 置換文字列                   |
| `options.preview` | boolean | プレビューモード             |
| `options.dryRun`  | boolean | ドライランモード             |

**戻り値（yield）**:

| フィールド     | 型            | 説明                       |
| -------------- | ------------- | -------------------------- |
| `filePath`     | string        | ファイルパス               |
| `success`      | boolean       | 置換成功/失敗              |
| `count`        | number        | 置換件数（成功時）         |
| `error`        | string        | エラーメッセージ（失敗時） |
| `replacements` | Replacement[] | 置換詳細（プレビュー時）   |

#### cancelSearch()

```typescript
cancelSearch(): void
```

**機能**:

- 進行中のワークスペース検索をキャンセル

### エラーコード

| コード           | 説明                   | 原因                         |
| ---------------- | ---------------------- | ---------------------------- |
| `INVALID_PATTERN`| パターンが無効         | 不正な正規表現               |
| `TIMEOUT`        | タイムアウト           | ReDoS対策（5000msデフォルト）|
| `FILE_READ_ERROR`| ファイル読み取りエラー | 権限不足、ファイル不在       |
| `PATH_TRAVERSAL` | パストラバーサル検出   | 不正なパス参照               |
| `UNKNOWN`        | 不明なエラー           | その他                       |

### 使用パターン

**パターン1: ファイル内検索**

```typescript
import { SearchService } from "@repo/shared/search";

const service = new SearchService();
const matches = service.searchInFile(content, "pattern", {
  caseSensitive: false,
  wholeWord: false,
  regex: false,
});

for (const match of matches) {
  console.log(`${match.line}:${match.column} - ${match.text}`);
}
```

**パターン2: ワークスペース検索**

```typescript
import { SearchService } from "@repo/shared/search";

const service = new SearchService();

for await (const result of service.searchInWorkspace("TODO", {
  caseSensitive: false,
  wholeWord: false,
  regex: false,
  include: ["**/*.ts"],
  exclude: ["**/node_modules/**"],
})) {
  console.log(`${result.filePath}: ${result.matches.length} matches`);
}
```

**パターン3: 置換プレビュー**

```typescript
import { SearchService } from "@repo/shared/search";

const service = new SearchService();

for await (const result of service.replaceInWorkspace("oldFunc", "newFunc", {
  caseSensitive: true,
  wholeWord: true,
  regex: false,
  preview: true,  // ファイル変更しない
})) {
  if (result.success) {
    console.log(`${result.filePath}: ${result.count} replacements`);
    result.replacements?.forEach((r) => {
      console.log(`  L${r.line}: ${r.originalText} → ${r.replacedText}`);
    });
  }
}
```

### 性能特性

| 指標                       | 値              |
| -------------------------- | --------------- |
| ReDoSタイムアウト          | 5000ms          |
| デフォルト除外パターン     | node_modules等  |
| ストリーミング             | AsyncGenerator  |
| キャンセル                 | サポート        |
| テストカバレッジ           | 83.92%          |

### デフォルト除外パターン

以下のディレクトリはデフォルトで検索から除外されます：

- `node_modules/`
- `.git/`
- `dist/`
- `build/`
- `.next/`
- `coverage/`

---

## 関連ドキュメント

- [エラーハンドリング仕様](./07-error-handling.md)
- [コアインターフェース仕様](./06-core-interfaces.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
- [デプロイメント](./12-deployment.md)
- [検索・置換パネルUI設計](./ui-ux-panels.md#検索置換パネル)
