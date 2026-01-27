# エンティティ抽出サービス（NER）インターフェース

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [interfaces-rag.md](./interfaces-rag.md)

Named Entity Recognition（NER）サービスのインターフェース仕様。Knowledge Graph構築のためのエンティティ抽出を提供。

**実装場所**: `packages/shared/src/services/extraction/`

---

## 主要インターフェース

### IEntityExtractor

エンティティ抽出の Strategy Pattern インターフェース。

| メソッド        | 引数                                          | 戻り値                                        | 説明                                |
| --------------- | --------------------------------------------- | --------------------------------------------- | ----------------------------------- |
| extract()       | chunk: Chunk, options?: EntityExtractionOptionsInput | Promise<Result<ExtractionResult, Error>>      | 単一チャンクからエンティティ抽出    |
| extractBatch()  | chunks: Chunk[], options?: EntityExtractionOptionsInput | Promise<Result<BatchExtractionResult, Error>> | 複数チャンクをバッチ抽出（1-100件） |
| mergeEntities() | results: ExtractionResult[]                   | ExtractedEntity[]                             | 正規化名で重複排除・マージ          |

### ILLMProvider

LLM通信の抽象化インターフェース（DI用）。

**ILLMProviderメンバー**:

| メンバー   | 種別       | 型・引数                                    | 戻り値                                  | 説明              |
| ---------- | ---------- | ------------------------------------------- | --------------------------------------- | ----------------- |
| modelId    | プロパティ | string (読み取り専用)                       | -                                       | モデル識別子      |
| generate() | メソッド   | prompt: string, options?: LLMGenerateOptions | Promise<Result<LLMGenerateResult, Error>> | プロンプト生成処理 |

**LLMGenerateOptions型**:

| プロパティ     | 型                 | 説明                          |
| -------------- | ------------------ | ----------------------------- |
| maxTokens      | number?            | 最大トークン数                |
| temperature    | number?            | 温度パラメータ                |
| responseFormat | "text" \| "json"?  | レスポンス形式（テキストまたはJSON） |

---

## 実装クラス

### ISearchStrategy実装一覧

| 実装クラス               | 用途               | 外部依存    | 特徴                         |
| ------------------------ | ------------------ | ----------- | ---------------------------- |
| LLMEntityExtractor       | 高精度抽出         | LLMProvider | 文脈理解、説明生成、52タイプ |
| RuleBasedEntityExtractor | 高速フォールバック | なし        | オフライン可、ミリ秒処理     |

### LLMEntityExtractor

LLMベースの高精度エンティティ抽出。

**インスタンス生成**:

| 項目              | 内容                                               |
| ----------------- | -------------------------------------------------- |
| コンストラクタ引数1 | llmProvider: ILLMProvider                          |
| コンストラクタ引数2 | options: { fallbackExtractor?: IEntityExtractor }  |
| 推奨設定          | fallbackExtractorにRuleBasedEntityExtractorを指定  |

**extractメソッド呼び出し例**:

| オプション           | 設定例 | 説明                     |
| -------------------- | ------ | ------------------------ |
| minConfidence        | 0.7    | 信頼度0.7以上のみ抽出    |
| generateDescriptions | true   | 説明文を自動生成         |

**特徴**:

- 52種類のエンティティタイプ分類
- コンテキスト理解に基づく抽出
- 説明文・エイリアス自動生成
- 指数バックオフによる自動リトライ
- RuleBasedExtractorへのフォールバック対応

### RuleBasedEntityExtractor

パターンマッチングによる高速抽出。

**インスタンス生成**: 引数なしでコンストラクタを呼び出す。extractメソッドにchunkを渡して抽出を実行する。

**特徴**:

- 外部API依存なし（オフライン動作可能）
- ミリ秒単位の処理速度
- 決定論的結果（テスト容易）
- LLM失敗時のフォールバック用

---

## 型定義（Zodスキーマ）

### ExtractedEntity

抽出されたエンティティ。

| プロパティ     | 型                       | 説明                         |
| -------------- | ------------------------ | ---------------------------- |
| name           | string                   | エンティティ名（原形）       |
| normalizedName | string                   | 正規化名（重複検出用）       |
| type           | EntityType               | エンティティタイプ（52種類） |
| confidence     | number                   | 信頼度（0.0-1.0）            |
| description    | string?                  | 説明文（LLM生成時のみ）      |
| aliases        | string[]                 | 別名・エイリアス             |
| mentions       | Mention[]                | テキスト内出現情報           |
| attributes     | Record<string, unknown>? | 追加属性                     |

### EntityExtractionOptions

抽出オプション。

| プロパティ           | 型           | デフォルト | 説明                          |
| -------------------- | ------------ | ---------- | ----------------------------- |
| types                | EntityType[] | 全52タイプ | 抽出対象タイプ                |
| minConfidence        | number       | 0.5        | 最小信頼度閾値（0-1）         |
| maxEntitiesPerChunk  | number       | 20         | チャンクあたり最大抽出数      |
| minNameLength        | number       | 2          | 最小エンティティ名長          |
| generateDescriptions | boolean      | true       | 説明生成フラグ（LLMのみ有効） |
| useLLM               | boolean      | true       | LLM使用フラグ                 |
| maxRetries           | number       | 3          | リトライ回数                  |

### ExtractionResult

単一チャンクの抽出結果。

| プロパティ       | 型                | 説明                   |
| ---------------- | ----------------- | ---------------------- |
| entities         | ExtractedEntity[] | 抽出されたエンティティ |
| chunkId          | string            | ソースチャンクID       |
| processingTimeMs | number            | 処理時間（ミリ秒）     |
| modelUsed        | string            | 使用モデル名           |

### BatchExtractionResult

バッチ抽出結果。

| プロパティ       | 型                 | 説明                 |
| ---------------- | ------------------ | -------------------- |
| results          | ExtractionResult[] | 各チャンクの抽出結果 |
| totalEntities    | number             | 総エンティティ数     |
| processingTimeMs | number             | 総処理時間（ミリ秒） |

---

## エンティティタイプ（52種類・10カテゴリ）

| カテゴリ           | タイプ                                         |
| ------------------ | ---------------------------------------------- |
| People & Orgs      | person, organization, role, team               |
| Location & Time    | location, date, event                          |
| Business           | company, product, service, brand, etc.         |
| Technology         | technology, tool, method, standard, etc.       |
| Code & Software    | programming_language, framework, library, etc. |
| Abstract Concepts  | concept, theory, principle, pattern            |
| Document Structure | document, chapter, section, etc.               |
| Document Elements  | keyword, summary, figure, table, etc.          |
| Media              | image, video, audio, diagram                   |
| Other              | other                                          |

---

## エラーハンドリング

### Result型パターン

extractメソッドはResult型を返す。isOk()メソッドで成功判定を行い、成功時はresult.value.entitiesから抽出結果を取得する。失敗時はresult.error.messageからエラー内容を取得する。

| 状態   | 判定メソッド   | アクセス方法             | 取得内容              |
| ------ | -------------- | ------------------------ | --------------------- |
| 成功時 | result.isOk()  | result.value.entities    | 抽出されたエンティティ |
| 失敗時 | result.isErr() | result.error.message     | エラーメッセージ      |

### エラーコード

| エラーコード       | 説明                    | 対処                       |
| ------------------ | ----------------------- | -------------------------- |
| LLM_TIMEOUT        | LLM呼び出しタイムアウト | リトライ→フォールバック    |
| LLM_RATE_LIMIT     | レート制限超過          | 待機後リトライ             |
| LLM_RESPONSE_PARSE | JSONパース失敗          | 空結果またはリトライ       |
| INVALID_CHUNK      | チャンク入力が不正      | バリデーションエラーを返す |

### フォールバック戦略

LLMEntityExtractorのコンストラクタでfallbackExtractorオプションにRuleBasedEntityExtractorインスタンスを指定することで、LLM呼び出し失敗時に自動的にルールベース抽出へフォールバックする。

| 設定項目          | 設定値                        | 効果                              |
| ----------------- | ----------------------------- | --------------------------------- |
| fallbackExtractor | RuleBasedEntityExtractorインスタンス | LLM失敗時に自動フォールバック     |

---

## パフォーマンス特性

### 処理速度目安

| 処理                   | RuleBased | LLM        |
| ---------------------- | --------- | ---------- |
| 単一チャンク (1KB)     | < 10ms    | 500-2000ms |
| バッチ (100チャンク)   | < 1000ms  | 5-30秒     |
| mergeEntities (1000件) | < 100ms   | < 100ms    |

### 推奨バッチサイズ

| ユースケース     | 推奨サイズ | 理由                   |
| ---------------- | ---------- | ---------------------- |
| リアルタイム処理 | 1-10       | 低レイテンシ           |
| バッチ処理       | 50-100     | スループット最大化     |
| 大量データ       | 100        | メモリ効率とのバランス |

### 非機能要件

| 項目             | 要件                       |
| ---------------- | -------------------------- |
| バッチサイズ上限 | 100チャンク                |
| タイムアウト     | LLM: 30秒、RuleBased: なし |
| リトライ         | 最大3回（指数バックオフ）  |
| メモリ使用量     | バッチ処理時監視可能       |

---

## テスト用ユーティリティ

### モックLLMプロバイダー

@repo/shared/services/extractionからcreateMockLLMProviderをインポートして使用する。

| ユーティリティ         | インポート元                           | 用途                       |
| ---------------------- | -------------------------------------- | -------------------------- |
| createMockLLMProvider  | @repo/shared/services/extraction       | モックプロバイダー生成     |

**createMockLLMProviderオプション**:

| オプション | 型                        | 説明                                   |
| ---------- | ------------------------- | -------------------------------------- |
| responses  | Map<string, string>       | プロンプトとレスポンスのマッピング     |

### フィクスチャ

@repo/shared/services/extraction/__tests__/fixturesからテスト用ユーティリティをインポートして使用する。

| ユーティリティ   | 用途                                   |
| ---------------- | -------------------------------------- |
| createTestChunk  | テスト用チャンク生成（テキストを引数に渡す） |
| SAMPLE_ENTITIES  | サンプルエンティティデータ             |

---

## テスト品質

- **224テストケース**（単体 + 統合 + E2E）
- **97.1% Line Coverage**
- **96.8% Quality Score**

**詳細参照**: `docs/30-workflows/CONV-06-04-entity-extraction-ner/outputs/phase-12/implementation-guide.md`

---

## 変更履歴

| 日付       | バージョン | 変更内容                                   |
| ---------- | ---------- | ------------------------------------------ |
| 2026-01-26 | 1.1.0      | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |
| 2026-01-19 | 1.0.0      | 初版作成（CONV-06-04完了に伴う仕様文書化） |

---

## 関連ドキュメント

- [RAG・ファイル選択インターフェース](./interfaces-rag.md)
- [検索クエリ・結果型定義](./interfaces-rag-search.md)
- [Knowledge Graph Store](./interfaces-rag-knowledge-graph-store.md)
- [RAGアーキテクチャ](./architecture-rag.md)
