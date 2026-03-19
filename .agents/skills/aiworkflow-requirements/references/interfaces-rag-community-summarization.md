# コミュニティ要約インターフェース仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: .claude/skills/aiworkflow-requirements/references/

---

## 概要

### 目的

コミュニティ要約サービスは、Leidenアルゴリズムで検出されたコミュニティに対してLLMを使用して要約を生成し、セマンティック検索を可能にする。GraphRAGパイプラインにおけるクエリ応答の質を向上させる。

### スコープ

| スコープ内                     | スコープ外                     |
| ------------------------------ | ------------------------------ |
| LLMによるコミュニティ要約生成   | コミュニティ検出（別モジュール）|
| 埋め込みベクトル生成            | グラフ可視化                   |
| セマンティック検索              | リアルタイム更新               |
| 階層的要約（子→親）             | 分散処理                       |
| 要約の永続化                    | 要約のバージョン管理           |

---

## 要件

### 機能要件

| ID     | 要件                       | 優先度 | 説明                                               |
| ------ | -------------------------- | ------ | -------------------------------------------------- |
| FR-001 | 単一コミュニティ要約       | 必須   | 1つのコミュニティの要約生成                        |
| FR-002 | 一括要約生成               | 必須   | 全コミュニティを階層順で要約                       |
| FR-003 | セマンティック検索         | 必須   | 埋め込みベクトルによる類似検索                     |
| FR-004 | 要約更新                   | 必須   | 既存コミュニティの要約再生成                       |
| FR-005 | 子コミュニティ要約使用     | 必須   | 親の要約生成時に子の要約を参照                     |
| FR-006 | スタイル選択               | 推奨   | concise/detailed/technicalの選択                   |
| FR-007 | 並列処理                   | 推奨   | 同レベル内での並列要約生成                         |

### 非機能要件

| 項目           | 要件                     | 基準                           |
| -------------- | ------------------------ | ------------------------------ |
| パフォーマンス | 要約生成時間             | 1コミュニティ < 5s             |
| 型安全性       | Branded Types使用        | CommunityId                    |
| エラー処理     | Result型パターン         | success/data/error による処理  |
| テストカバレッジ| Line Coverage           | 95%+                           |

---

## 設計

### アーキテクチャ

**実装場所**: packages/shared/src/services/graph/

#### レイヤー構成

| レイヤー           | コンポーネント                 | 説明                                       |
| ------------------ | ------------------------------ | ------------------------------------------ |
| Application Layer  | GraphRAG Query Handler         | クエリ処理を担当するアプリケーション層     |
| Service Layer      | ICommunitySummarizer           | コミュニティ要約の中核インターフェース     |
| Provider Layer     | ILLMProvider                   | LLMによる要約文生成                        |
| Provider Layer     | IEmbeddingProvider             | 埋め込みベクトル生成                       |
| Repository Layer   | ICommunityRepository           | 要約データの永続化                         |

#### ICommunitySummarizer メソッド一覧

| メソッド           | 説明                                               |
| ------------------ | -------------------------------------------------- |
| summarize()        | 単一コミュニティの要約生成                         |
| summarizeAll()     | 全コミュニティの一括要約                           |
| searchSummaries()  | セマンティック検索による要約取得                   |
| updateSummary()    | 既存要約の更新                                     |

### 処理フロー

#### summarize() 処理ステップ

| ステップ | 処理内容                   | 条件                              |
| -------- | -------------------------- | --------------------------------- |
| 1        | 子コミュニティ要約取得     | useChildSummaries=true の場合     |
| 2        | プロンプト構築             | 常時実行                          |
| 3        | LLM呼び出し                | 常時実行                          |
| 4        | JSONパース・検証           | 常時実行                          |
| 5        | 埋め込み生成               | generateEmbedding=true の場合。失敗時は warn のみで継続 |
| 6        | DB保存                     | 常時実行。`embedding` なしでも保存を継続 |

#### summarizeAll() 処理ステップ

| ステップ | 処理内容                   | 備考                              |
| -------- | -------------------------- | --------------------------------- |
| 1        | レベル昇順でソート         | 子→親の順で処理                   |
| 2        | 同レベル内は並列処理       | maxConcurrency制限あり            |
| 3        | 統計情報集計               | トークン数・処理時間など          |

#### searchSummaries() 処理ステップ

| ステップ | 処理内容                   | 備考                              |
| -------- | -------------------------- | --------------------------------- |
| 1        | クエリの埋め込み生成       | IEmbeddingProvider使用            |
| 2        | リポジトリで類似検索       | コサイン類似度による検索          |

---

## インターフェース定義

### ICommunitySummarizer

コミュニティ要約サービスのメインインターフェース。

| メソッド                                | 戻り値                                          | 説明                           |
| --------------------------------------- | ----------------------------------------------- | ------------------------------ |
| summarize(community, entities, relations, options?) | Result<CommunitySummary, Error>    | 単一コミュニティ要約           |
| summarizeAll(structure, options?)       | Result<CommunitySummarizationResult, Error>     | 全コミュニティ一括要約         |
| searchSummaries(query, options?)        | Result<CommunitySummary[], Error>               | セマンティック検索             |
| updateSummary(communityId)              | Result<CommunitySummary, Error>                 | 要約更新                       |

### ICommunityRepository 拡張

コミュニティ要約の永続化に必要なメソッド。

| メソッド                                    | 戻り値                                | 説明                           |
| ------------------------------------------- | ------------------------------------- | ------------------------------ |
| getSummary(communityId)                     | Result<CommunitySummary \| null, Error> | 要約取得                     |
| updateSummary(communityId, summary)         | Result<void, Error>                   | 要約保存/更新                  |
| searchSummariesByEmbedding(embedding, opts) | Result<CommunitySummary[], Error>     | 埋め込み検索                   |

---

## 型定義

### CommunitySummary型

| プロパティ     | 型                                       | 必須 | 説明                           |
| -------------- | ---------------------------------------- | ---- | ------------------------------ |
| communityId    | CommunityId                              | ✅   | コミュニティID                 |
| level          | number                                   | ✅   | 階層レベル                     |
| summary        | string                                   | ✅   | 要約文                         |
| keywords       | string[]                                 | ✅   | 検索用キーワード               |
| mainEntities   | string[]                                 | ✅   | 主要エンティティ名（最大5件） |
| mainRelations  | string[]                                 | ✅   | 主要関係（最大5件）           |
| sentiment      | "positive" \| "negative" \| "neutral"    | ✅   | 全体的なトーン                 |
| confidence     | number                                   | ✅   | AI自信度（0.0〜1.0）          |
| tokenCount     | number                                   | ✅   | 使用トークン数                 |
| embedding      | number[]?                                | -    | 埋め込みベクトル               |
| createdAt      | Date                                     | ✅   | 作成日時                       |

### CommunitySummarizationOptions型

| プロパティ         | 型      | デフォルト | 説明                           |
| ------------------ | ------- | ---------- | ------------------------------ |
| maxSummaryTokens   | number  | 200        | 要約の最大トークン数           |
| maxKeywords        | number  | 10         | 最大キーワード数               |
| summaryStyle       | string  | "concise"  | concise/detailed/technical     |
| generateEmbedding  | boolean | true       | 埋め込み生成有無               |
| useChildSummaries  | boolean | true       | 子コミュニティ要約使用         |
| maxConcurrency     | number  | 5          | 並列処理数                     |

### CommunitySummarizationResult型

| プロパティ         | 型                   | 説明                           |
| ------------------ | -------------------- | ------------------------------ |
| summaries          | CommunitySummary[]   | 生成された要約                 |
| failedCommunities  | CommunityId[]        | 失敗したコミュニティ           |
| totalTokensUsed    | number               | 合計使用トークン数             |
| processingTimeMs   | number               | 処理時間（ミリ秒）             |

### CommunitySummarySearchOptions型

| プロパティ | 型      | デフォルト | 説明                           |
| ---------- | ------- | ---------- | ------------------------------ |
| limit      | number  | 10         | 最大結果数                     |
| level      | number? | -          | 特定レベルのみ検索             |

---

## エラー型

| エラーコード             | 説明                                 |
| ------------------------ | ------------------------------------ |
| LLM_GENERATION_FAILED    | LLM生成失敗                          |
| JSON_PARSE_FAILED        | JSONパース失敗                       |
| EMBEDDING_FAILED         | 埋め込み生成失敗（hard fail を採る経路のみ。current summarize runtime は warn に downgrade） |
| DB_SAVE_FAILED           | データベース保存失敗                 |
| COMMUNITY_NOT_FOUND      | コミュニティが見つからない           |

### current runtime behavior（2026-03-19）

| ケース | current behavior |
| --- | --- |
| `generateEmbedding=true` かつ埋め込み生成失敗 | `console.warn` を出し、`embedding` を省略して `updateSummary()` を継続 |
| DB保存失敗 | `DB_SAVE_FAILED` として fail |
| searchSummaries 埋め込み生成失敗 | 検索系エラーとして扱う。要約保存の非致命経路とは分離 |

---

## 使用例

### インポート方法

型およびエラー型のインポートは、バレルファイルから行う。

| インポート種別 | インポート対象                                                                 | インポート元                          |
| -------------- | ------------------------------------------------------------------------------ | ------------------------------------- |
| 型（type）     | CommunitySummary, CommunitySummarizationOptions, CommunitySummarizationResult  | @repo/shared/services/graph           |
| 値（エラー型） | CommunitySummarizationErrorCode, CommunitySummarizationError                   | @repo/shared/services/graph           |

### 基本的なコミュニティ要約

単一コミュニティの要約生成を行うパターン。

| ステップ | 操作                                                                   | 説明                               |
| -------- | ---------------------------------------------------------------------- | ---------------------------------- |
| 1        | CommunitySummarizer インスタンス作成                                   | llmProvider, embeddingProvider, graphStore, communityRepo を注入 |
| 2        | summarize() メソッド呼び出し                                           | community, entities, relations, options を渡す |
| 3        | Result.success 判定                                                    | 成功時は data.summary, data.keywords を使用 |

**オプション指定例**: summaryStyle を "concise" / "detailed" / "technical" から選択可能。

### 全コミュニティ一括要約

階層順（子→親）で全コミュニティを一括要約するパターン。

| ステップ | 操作                                   | 説明                               |
| -------- | -------------------------------------- | ---------------------------------- |
| 1        | summarizeAll() メソッド呼び出し        | communityStructure, options を渡す |
| 2        | Result.success 判定                    | 成功時は統計情報を取得             |

**取得可能な統計情報**: summaries.length（生成数）、totalTokensUsed（使用トークン数）、processingTimeMs（処理時間）。

### セマンティック検索

クエリ文字列で関連コミュニティを検索するパターン。

| ステップ | 操作                                   | 説明                               |
| -------- | -------------------------------------- | ---------------------------------- |
| 1        | searchSummaries() メソッド呼び出し     | query（検索文字列）, options を渡す |
| 2        | Result.success 判定                    | 成功時は CommunitySummary[] を取得 |

**オプション**: limit（最大結果数）、level（特定レベルのみ検索）を指定可能。

---

## 実装ガイドライン

### コーディング規約

| 項目           | 規約                        | 理由                               |
| -------------- | --------------------------- | ---------------------------------- |
| エラー処理     | Result<T, Error>パターン    | 明示的なエラーハンドリング         |
| ID型           | Branded Types使用           | コンパイル時の型安全性確保         |
| 階層処理       | レベル昇順（子→親）         | 子の要約を親に含められる           |
| 並列処理       | maxConcurrency制限          | API制限対策                        |
| DI             | インターフェース注入        | テストとメンテナンス性向上         |

### プロンプト設計

| 制限              | 値   | 理由                               |
| ----------------- | ---- | ---------------------------------- |
| エンティティ上限  | 20件 | トークン制限内で重要情報を網羅    |
| 関係上限          | 30件 | エンティティ間の接続を十分表現    |

### テスト要件

| テスト種別 | 対象                  | カバレッジ目標 | 必須ケース                     |
| ---------- | --------------------- | -------------- | ------------------------------ |
| 単体テスト | CommunitySummarizer   | 95%+           | 正常系、エラー系、エッジケース |
| 単体テスト | プロンプト生成        | 100%           | 各スタイル、制限値             |
| 統合テスト | E2Eフロー             | -              | 生成→保存→検索                 |

**達成済みカバレッジ**: Line 95.69%, Function 100%

---

## 関連ドキュメント

| ドキュメント                           | 説明                                 |
| -------------------------------------- | ------------------------------------ |
| interfaces-rag-community-detection.md  | コミュニティ検出インターフェース仕様 |
| interfaces-rag-knowledge-graph-store.md| Knowledge Graphストア仕様            |
| architecture-rag.md                    | RAGアーキテクチャ設計                |
| database-schema.md                     | データベーススキーマ定義             |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                               |
| ---------- | ---------- | ------------------------------------------------------ |
| 2026-01-26 | 1.2.0      | 仕様ガイドライン準拠: コード例を表形式・文章に変換     |
| 2026-01-13 | 1.1.0      | バレルファイルからのインポート例追加（SHARED-TYPE-EXPORT-01完了） |
| 2026-01-11 | 1.0.0      | 初版作成（CONV-08-03タスク完了に伴い）                 |
