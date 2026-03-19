# GraphRAGクエリサービス インターフェース仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: .claude/skills/aiworkflow-requirements/references/

---

## 概要

### 目的

GraphRAGクエリサービスは、コミュニティ要約を活用してユーザークエリに対する包括的な回答を生成する。ICommunitySummarizer.searchSummaries()と連携し、関連するコミュニティ要約をコンテキストとしてLLMに提供することで、回答品質を向上させる。

### スコープ

| スコープ内                       | スコープ外                       |
| -------------------------------- | -------------------------------- |
| コミュニティ要約の検索・統合     | コミュニティ要約の生成           |
| クエリ分類（IQueryClassifier連携）| コミュニティ検出                |
| LLMによる回答生成                | ベクトル埋め込み生成             |
| confidence閾値フィルタリング     | リアルタイムストリーミング       |
| フォールバック処理               | キャッシング機能                 |

---

## 要件

### 機能要件

| ID     | 要件                       | 優先度 | 説明                                               |
| ------ | -------------------------- | ------ | -------------------------------------------------- |
| FR-001 | セマンティック検索統合     | 必須   | ICommunitySummarizer.searchSummaries()呼び出し     |
| FR-002 | コンテキスト統合           | 必須   | 要約をLLMプロンプトに統合                          |
| FR-003 | 階層レベルフィルタリング   | 必須   | communityLevelオプションによるフィルタ            |
| FR-004 | スコアベースランキング     | 必須   | confidence順でソート                               |
| FR-005 | confidence閾値フィルタリング | 必須 | 閾値未満の要約を除外                               |
| FR-006 | 検索結果数制限             | 必須   | limitオプションによる制限                          |
| FR-007 | フォールバック処理         | 必須   | 検索失敗時は空配列でクエリ継続し、warn + `fallbackReason` を残す |

### 非機能要件

| 項目           | 要件                     | 基準                           |
| -------------- | ------------------------ | ------------------------------ |
| パフォーマンス | 検索レイテンシ           | < 100ms（limit=10）            |
| 型安全性       | Branded Types使用        | CommunityId                    |
| エラー処理     | Result型パターン         | success/data/error による処理  |
| テストカバレッジ| Line Coverage           | 80%+                           |

---

## 設計

### アーキテクチャ

**実装場所**: `packages/shared/src/services/search/`

#### GraphRAGQueryServiceコンポーネント

GraphRAGQueryServiceはIGraphRAGQueryServiceインターフェースを実装し、以下のメソッドを提供する。

| メソッド             | 役割                           |
| -------------------- | ------------------------------ |
| query()              | メインエントリポイント         |
| validateInput()      | 入力バリデーション             |
| classifyQuery()      | クエリ分類（並列実行）         |
| searchWithFallback() | 要約検索（フォールバック対応） |
| buildPrompt()        | LLMプロンプト構築              |
| escapeForPrompt()    | ユーザー入力エスケープ         |

#### 依存サービス

GraphRAGQueryServiceは以下の4つの外部サービスに依存し、各処理を委譲する。

| サービス             | メソッド         | 役割                     |
| -------------------- | ---------------- | ------------------------ |
| IQueryClassifier     | classify()       | クエリタイプ分類         |
| ICommunitySummarizer | searchSummaries()| コミュニティ要約検索     |
| IEmbeddingProvider   | (埋め込み生成)   | ベクトル埋め込み提供     |
| ILLMProvider         | generate()       | LLMによる回答生成        |

### 処理フロー

query()メソッドは以下の順序で処理を実行する。

| ステップ | メソッド                     | 処理内容                       | 実行方式 |
| -------- | ---------------------------- | ------------------------------ | -------- |
| 1        | validateInput()              | クエリ・オプションのZodバリデーション | 同期     |
| 2a       | classifyQuery()              | クエリタイプ分類               | 並列実行 |
| 2b       | searchWithFallback()         | コミュニティ要約検索           | 並列実行 |
| 3        | filterAndTransformSummaries()| confidence閾値フィルタ         | 同期     |
| 4        | buildPrompt()                | 要約をコンテキストとして統合   | 同期     |
| 5        | ILLMProvider.generate()      | 回答生成                       | 非同期   |

ステップ2a・2bはPromise.all()により並列実行され、パフォーマンスを最適化する。

### フォールバック戦略

| 失敗ケース             | フォールバック動作                 | 理由                           |
| ---------------------- | ---------------------------------- | ------------------------------ |
| クエリ分類失敗         | hybrid型として処理継続             | クエリ処理を継続可能にするため |
| コミュニティ検索失敗   | 空配列で処理継続 + warn log + `fallbackReason` | 要約なしでも回答生成は可能     |
| LLM生成失敗            | エラー返却（処理停止）             | 回答生成は必須のため           |

---

## インターフェース定義

### IGraphRAGQueryService

GraphRAGクエリサービスのメインインターフェース。

| メソッド                                    | 戻り値                                          | 説明                           |
| ------------------------------------------- | ----------------------------------------------- | ------------------------------ |
| query(query, options?)                      | Result<GraphRAGQueryResponse, GraphRAGQueryError> | クエリ実行・回答生成         |

### GraphRAGQueryServiceDependencies

サービス初期化時の依存関係。

| プロパティ          | 型                   | 説明                           |
| ------------------- | -------------------- | ------------------------------ |
| queryClassifier     | IQueryClassifier     | クエリ分類器                   |
| communitySummarizer | ICommunitySummarizer | コミュニティ要約サービス       |
| embeddingProvider   | IEmbeddingProvider   | 埋め込みプロバイダー           |
| llmProvider         | ILLMProvider         | LLMプロバイダー                |

---

## 型定義

### GraphRAGQueryOptions型

| プロパティ             | 型            | デフォルト | 説明                           |
| ---------------------- | ------------- | ---------- | ------------------------------ |
| limit                  | number        | 10         | 最大検索結果数（1-20）         |
| communityLevel         | number?       | -          | コミュニティ階層レベル（0-5）  |
| confidenceThreshold    | number        | 0.5        | confidence閾値（0-1）          |
| searchWeights          | SearchWeights?| -          | 検索戦略の重み                 |
| enableCommunitySummary | boolean       | true       | コミュニティ要約検索を有効化   |

### GraphRAGQueryResponse型

| プロパティ         | 型                             | 説明                           |
| ------------------ | ------------------------------ | ------------------------------ |
| answer             | string                         | 生成された回答テキスト         |
| communitySummaries | CommunitySummaryReference[]    | 参照したコミュニティ要約       |
| chunks             | ChunkReference[]               | 参照したチャンク（将来拡張用） |
| entities           | EntityReference[]              | 参照したエンティティ（将来拡張用） |
| metadata           | QueryMetadata                  | 処理メタデータ                 |

### CommunitySummaryReference型

| プロパティ      | 型          | 説明                           |
| --------------- | ----------- | ------------------------------ |
| communityId     | CommunityId | コミュニティID                 |
| level           | number      | 階層レベル                     |
| summary         | string      | 要約テキスト                   |
| confidence      | number      | 要約の信頼度（0-1）            |
| relevanceScore  | number      | クエリとの関連度スコア         |

### QueryMetadata型

| プロパティ                    | 型             | 説明                           |
| ----------------------------- | -------------- | ------------------------------ |
| queryType                     | QueryType      | 判定されたクエリタイプ         |
| processingTimeMs              | number         | 処理時間（ミリ秒）             |
| searchStrategy                | SearchStrategy | 使用された検索戦略             |
| communitySummarySearchExecuted| boolean        | コミュニティ要約検索が実行されたか |
| fallbackOccurred              | boolean        | コミュニティ検索 fallback が発生したか |
| fallbackReason                | string?        | fallback 発生理由（error.message） |

### current runtime behavior（2026-03-19）

| ケース | current behavior |
| --- | --- |
| `enableCommunitySummary=false` | `summaries=[]`、`fallbackOccurred=false` で継続 |
| community search failure | warn を出し、`summaries=[]`、`fallbackOccurred=true`、`fallbackReason=error.message` |
| query classification failure | hybrid として継続 |

---

## エラー型

### GraphRAGQueryError

| コード                  | 説明                                 |
| ----------------------- | ------------------------------------ |
| INVALID_QUERY           | 無効なクエリ（空文字、文字数超過）   |
| CLASSIFICATION_FAILED   | クエリ分類失敗                       |
| COMMUNITY_SEARCH_FAILED | コミュニティ要約検索失敗             |
| LLM_GENERATION_FAILED   | LLM回答生成失敗                      |

---

## 使用例

### 基本的なクエリ実行

GraphRAGQueryServiceのインスタンスを生成するには、GraphRAGQueryServiceDependenciesに定義された4つの依存サービス（queryClassifier, communitySummarizer, embeddingProvider, llmProvider）を注入する。インポート元は `@repo/shared/services/search` モジュール。

基本的なクエリ実行では、query()メソッドにクエリ文字列を渡す。戻り値のresult.successがtrueの場合、result.dataから以下の情報を取得できる。

| プロパティ                           | 取得内容                 |
| ------------------------------------ | ------------------------ |
| result.data.answer                   | 生成された回答テキスト   |
| result.data.communitySummaries.length| 参照した要約の件数       |
| result.data.metadata.processingTimeMs| 処理時間（ミリ秒）       |

### オプション指定

query()メソッドの第2引数にGraphRAGQueryOptionsを渡すことで、検索動作をカスタマイズできる。

**オプション指定例**

| オプション             | 設定値 | 効果                           |
| ---------------------- | ------ | ------------------------------ |
| limit                  | 5      | 最大5件の要約を取得            |
| confidenceThreshold    | 0.7    | confidence 0.7以上の要約のみ   |
| communityLevel         | 2      | 階層レベル2のコミュニティを対象|
| enableCommunitySummary | true   | コミュニティ要約検索を有効化   |

成功時、result.data.communitySummariesをイテレートして各要約のlevel、summary、confidenceを参照できる。

### エラーハンドリング

result.successがfalseの場合、result.error.codeによりエラー種別を判定する。

| エラーコード            | 推奨対応                         |
| ----------------------- | -------------------------------- |
| INVALID_QUERY           | ユーザーに入力エラーを通知       |
| LLM_GENERATION_FAILED   | 回答生成失敗をログ出力・リトライ |
| その他                  | 予期しないエラーとしてログ出力   |

いずれの場合もresult.error.messageに詳細なエラーメッセージが格納される。

---

## 実装ガイドライン

### コーディング規約

| 項目           | 規約                        | 理由                               |
| -------------- | --------------------------- | ---------------------------------- |
| エラー処理     | Result<T, Error>パターン    | 明示的なエラーハンドリング         |
| ID型           | Branded Types使用           | コンパイル時の型安全性確保         |
| 並列処理       | Promise.all使用             | パフォーマンス最適化               |
| バリデーション | Zodスキーマ使用             | ランタイム型安全性                 |
| DI             | インターフェース注入        | テストとメンテナンス性向上         |

### セキュリティ対策

| 対策項目             | 実装内容                                   |
| -------------------- | ------------------------------------------ |
| 入力バリデーション   | Zodスキーマによる厳密な型・範囲検証        |
| クエリ長制限         | MAX_QUERY_LENGTH (10000文字) による制限    |
| プロンプトエスケープ | `{{ }}` のエスケープでインジェクション防止 |
| 機密情報保護         | DIパターンによりAPIキーをコード外で管理    |

### テスト要件

| テスト種別 | 対象                  | カバレッジ目標 | 必須ケース                     |
| ---------- | --------------------- | -------------- | ------------------------------ |
| 単体テスト | GraphRAGQueryService  | 80%+           | 正常系、エラー系、エッジケース |
| 単体テスト | バリデーション        | 100%           | 各オプション、境界値           |
| 統合テスト | E2Eフロー             | -              | クエリ→検索→回答生成           |

**達成済みカバレッジ**: Line 100%, Branch 91.66%, Function 100%

---

## 関連ドキュメント

| ドキュメント                               | 説明                                 |
| ------------------------------------------ | ------------------------------------ |
| interfaces-rag-community-summarization.md  | コミュニティ要約インターフェース仕様 |
| interfaces-rag-search.md                   | 検索クエリ・結果型定義               |
| architecture-rag.md                        | RAGアーキテクチャ設計                |
| api-internal-search.md                     | Search Service API                   |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                       |
| ---------- | ---------- | ---------------------------------------------- |
| 2026-01-26 | 1.1.0      | spec-guidelines準拠: コードブロックを表形式・文章に変換 |
| 2026-01-11 | 1.0.0      | 初版作成（CONV-08-04タスク完了に伴い）         |
