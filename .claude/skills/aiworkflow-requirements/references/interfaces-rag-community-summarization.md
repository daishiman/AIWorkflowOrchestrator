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

**実装場所**: `packages/shared/src/services/graph/`

```
┌────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│             (GraphRAG Query Handler)                    │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│            ICommunitySummarizer (Interface)             │
│  - summarize() 単一コミュニティ要約                     │
│  - summarizeAll() 全コミュニティ一括要約                │
│  - searchSummaries() セマンティック検索                 │
│  - updateSummary() 要約更新                             │
└────────────────────────────────────────────────────────┘
          │              │               │
    ┌─────┘              │               └─────┐
    ▼                    ▼                     ▼
┌──────────────┐  ┌────────────────┐  ┌─────────────────┐
│ ILLMProvider │  │IEmbeddingProvider│ │ICommunityRepository│
│ (LLM生成)    │  │  (埋め込み生成)   │ │  (永続化)         │
└──────────────┘  └────────────────┘  └─────────────────┘
```

### 処理フロー

```
1. summarize()
   ├─ 子コミュニティ要約取得（useChildSummaries=true時）
   ├─ プロンプト構築
   ├─ LLM呼び出し
   ├─ JSONパース・検証
   ├─ 埋め込み生成（generateEmbedding=true時）
   └─ DB保存

2. summarizeAll()
   ├─ レベル昇順でソート（子→親）
   ├─ 同レベル内は並列処理（maxConcurrency制限）
   └─ 統計情報集計

3. searchSummaries()
   ├─ クエリの埋め込み生成
   └─ リポジトリで類似検索
```

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
| EMBEDDING_FAILED         | 埋め込み生成失敗                     |
| DB_SAVE_FAILED           | データベース保存失敗                 |
| COMMUNITY_NOT_FOUND      | コミュニティが見つからない           |

---

## 使用例

### インポート方法

```typescript
// 型のインポート（推奨：バレルファイルから）
import type {
  CommunitySummary,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
} from "@repo/shared/services/graph";

// 値のインポート（エラー型、enum）
import {
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
} from "@repo/shared/services/graph";
```

### 基本的なコミュニティ要約

```typescript
import type { CommunitySummarizationResult } from "@repo/shared/services/graph";
import { CommunitySummarizer } from "@repo/shared/services/graph";

const summarizer = new CommunitySummarizer(
  llmProvider,
  embeddingProvider,
  graphStore,
  communityRepo
);

// 単一コミュニティ要約
const result = await summarizer.summarize(
  community,
  entities,
  relations,
  { summaryStyle: "concise" }
);

if (result.success) {
  console.log(result.data.summary);
  console.log(result.data.keywords);
}
```

### 全コミュニティ一括要約

```typescript
// 階層順（子→親）で一括要約
const allResult = await summarizer.summarizeAll(communityStructure, {
  maxConcurrency: 5,
  generateEmbedding: true,
});

if (allResult.success) {
  console.log(`Generated ${allResult.data.summaries.length} summaries`);
  console.log(`Tokens used: ${allResult.data.totalTokensUsed}`);
}
```

### セマンティック検索

```typescript
// クエリで関連コミュニティを検索
const searchResult = await summarizer.searchSummaries(
  "機械学習とデータ分析",
  { limit: 5 }
);

if (searchResult.success) {
  for (const summary of searchResult.data) {
    console.log(`Level ${summary.level}: ${summary.summary}`);
  }
}
```

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
| 2026-01-13 | 1.1.0      | バレルファイルからのインポート例追加（SHARED-TYPE-EXPORT-01完了） |
| 2026-01-11 | 1.0.0      | 初版作成（CONV-08-03タスク完了に伴い）                 |
