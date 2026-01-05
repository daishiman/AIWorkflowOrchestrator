# HybridRAG パイプライン - マスタータスクリスト

## 概要

このドキュメントは、HybridRAGパイプライン実装の全タスクを細分化したマスターリストです。
各タスクは「実行するだけで次に進める」粒度で分解されています。

## タスクナンバリング規則

```
CONV-XX-YY-ZZ
  │    │   └── サブサブタスク番号（オプション）
  │    └────── サブタスク番号
  └────────── メインタスク番号
```

## 全タスク一覧（31タスク）

### Phase 1: 基盤構築（CONV-01〜CONV-04）

| No  | タスクID   | タスク名                           | 依存           | 規模 |
| --- | ---------- | ---------------------------------- | -------------- | ---- |
| 01  | CONV-01    | ファイル選択機能                   | なし           | 小   |
| 02  | CONV-03-01 | 基本型・共通インターフェース定義   | なし           | 小   |
| 03  | CONV-03-02 | ファイル・変換スキーマ定義         | CONV-03-01     | 小   |
| 04  | CONV-03-03 | チャンク・埋め込みスキーマ定義     | CONV-03-01     | 小   |
| 05  | CONV-03-04 | エンティティ・関係スキーマ定義     | CONV-03-01     | 小   |
| 06  | CONV-03-05 | 検索クエリ・結果スキーマ定義       | CONV-03-01     | 小   |
| 07  | CONV-02-01 | ファイル変換基盤・インターフェース | CONV-01, 03-02 | 中   |
| 08  | CONV-02-02 | テキスト系コンバーター実装         | CONV-02-01     | 中   |
| 09  | CONV-02-03 | Markdown/コードコンバーター実装    | CONV-02-01     | 中   |
| 10  | CONV-04-01 | Drizzle ORM セットアップ           | CONV-03-02     | 小   |
| 11  | CONV-04-02 | files/conversions テーブル実装     | CONV-04-01     | 中   |
| 12  | CONV-04-03 | content_chunks テーブル + FTS5     | CONV-04-01     | 中   |
| 13  | CONV-04-04 | DiskANN ベクトルインデックス設定   | CONV-04-03     | 中   |
| 14  | CONV-04-05 | Knowledge Graph テーブル群         | CONV-04-01     | 中   |
| 15  | CONV-04-06 | Repository パターン実装            | CONV-04-02〜05 | 中   |

### Phase 2: 変換・履歴機能（CONV-02, CONV-05）

| No  | タスクID   | タスク名                      | 依存          | 規模 |
| --- | ---------- | ----------------------------- | ------------- | ---- |
| 16  | CONV-05-01 | ログ記録サービス実装          | CONV-04-02    | 小   |
| 17  | CONV-05-02 | 履歴取得サービス実装          | CONV-04-02    | 小   |
| 18  | CONV-05-03 | 履歴/ログ表示UIコンポーネント | CONV-05-01,02 | 中   |

### Phase 3: 埋め込み・エンティティ抽出（CONV-06）

| No  | タスクID   | タスク名                       | 依存          | 規模 |
| --- | ---------- | ------------------------------ | ------------- | ---- |
| 19  | CONV-06-01 | チャンキング戦略実装           | CONV-04-03    | 中   |
| 20  | CONV-06-02 | 埋め込みプロバイダー抽象化     | CONV-03-03    | 中   |
| 21  | CONV-06-03 | Contextual Retrieval 実装      | CONV-06-01,02 | 中   |
| 22  | CONV-06-04 | エンティティ抽出サービス (NER) | CONV-03-04    | 中   |
| 23  | CONV-06-05 | 関係抽出サービス               | CONV-06-04    | 中   |

### Phase 4: Knowledge Graph構築（CONV-08）

| No  | タスクID   | タスク名                   | 依存       | 規模 |
| --- | ---------- | -------------------------- | ---------- | ---- |
| 24  | CONV-08-01 | Knowledge Graph ストア実装 | CONV-04-05 | 中   |
| 25  | CONV-08-02 | コミュニティ検出 (Leiden)  | CONV-08-01 | 大   |
| 26  | CONV-08-03 | コミュニティ要約生成       | CONV-08-02 | 中   |

### Phase 5: HybridRAG検索エンジン（CONV-07）

| No  | タスクID   | タスク名                       | 依存           | 規模 |
| --- | ---------- | ------------------------------ | -------------- | ---- |
| 27  | CONV-07-01 | クエリ分類器実装               | CONV-03-05     | 中   |
| 28  | CONV-07-02 | キーワード検索戦略 (FTS5/BM25) | CONV-04-03     | 中   |
| 29  | CONV-07-03 | ベクトル検索戦略 (DiskANN)     | CONV-04-04     | 中   |
| 30  | CONV-07-04 | グラフ検索戦略                 | CONV-08-01〜03 | 大   |
| 31  | CONV-07-05 | RRF Fusion + リランキング      | CONV-07-02〜04 | 中   |
| 32  | CONV-07-06 | CRAG (Corrective RAG) 実装     | CONV-07-05     | 中   |
| 33  | CONV-07-07 | HybridRAG統合サービス          | CONV-07-01〜06 | 大   |

## 依存関係図

```
CONV-01 (ファイル選択)
    │
    ├──────────────────────────────────────────┐
    ▼                                          │
CONV-03-01 (基本型定義)                         │
    │                                          │
    ├─────────┬─────────┬─────────┐            │
    ▼         ▼         ▼         ▼            │
03-02     03-03     03-04     03-05           │
(ファイル)  (チャンク) (エンティティ) (検索)       │
    │         │         │         │            │
    └────┬────┴────┬────┘         │            │
         │         │              │            │
         ▼         │              │            │
    CONV-02-01 ◄───┘              │            │
    (変換基盤)                     │            │
         │                        │            │
    ┌────┴────┐                   │            │
    ▼         ▼                   │            │
02-02     02-03                   │            │
(テキスト)  (MD/Code)              │            │
                                  │            │
CONV-04-01 (Drizzle) ◄────────────┤            │
    │                             │            │
    ├────────┬────────┬──────────┐│            │
    ▼        ▼        ▼          ▼│            │
04-02    04-03    04-04       04-05            │
(files)  (chunks) (DiskANN)   (Graph)          │
    │        │        │          │             │
    │        └────────┤          │             │
    │                 │          │             │
    └─────────────────┼──────────┤             │
                      │          │             │
           ┌──────────┘          │             │
           ▼                     │             │
      CONV-04-06 ◄───────────────┘             │
      (Repository)                             │
           │                                   │
    ┌──────┴──────┐                           │
    ▼             ▼                            │
CONV-05       CONV-06-01                       │
(履歴/ログ)    (チャンキング)                    │
    │             │                            │
    │         ┌───┴───┐                       │
    │         ▼       ▼                        │
    │     06-02   06-03                       │
    │    (埋め込み) (Contextual)                │
    │         │       │                        │
    │         └───┬───┘                       │
    │             │                            │
    │         06-04 ◄──────────────────────────┘
    │        (NER)
    │             │
    │         06-05
    │        (関係抽出)
    │             │
    │             ▼
    │     CONV-08-01
    │    (Graph Store)
    │             │
    │         08-02
    │        (Leiden)
    │             │
    │         08-03
    │        (要約)
    │             │
    │             ▼
    │     CONV-07-01 (クエリ分類) ◄─── 03-05
    │             │
    │    ┌────────┼────────┐
    │    ▼        ▼        ▼
    │  07-02   07-03   07-04
    │  (BM25)  (Vector) (Graph)
    │    │        │        │
    │    └────────┼────────┘
    │             ▼
    │         07-05
    │        (RRF+Rerank)
    │             │
    │         07-06
    │        (CRAG)
    │             │
    │             ▼
    └────────▶ 07-07
            (HybridRAG統合)
```

## 実装順序（推奨）

### Week 1: 基盤構築

1. CONV-01 (ファイル選択)
2. CONV-03-01 (基本型定義)
3. CONV-03-02〜05 (各種スキーマ) - 並列実行可能
4. CONV-04-01 (Drizzle セットアップ)

### Week 2: データベース層

5. CONV-04-02 (files/conversions テーブル)
6. CONV-04-03 (chunks + FTS5)
7. CONV-04-04 (DiskANN)
8. CONV-04-05 (Graph テーブル)
9. CONV-04-06 (Repository)

### Week 3: 変換エンジン

10. CONV-02-01 (変換基盤)
11. CONV-02-02, 02-03 (コンバーター) - 並列実行可能
12. CONV-05-01〜03 (履歴/ログ)

### Week 4: 埋め込み・エンティティ

13. CONV-06-01 (チャンキング)
14. CONV-06-02 (埋め込みプロバイダー)
15. CONV-06-03 (Contextual Retrieval)
16. CONV-06-04, 06-05 (NER, 関係抽出)

### Week 5: Knowledge Graph

17. CONV-08-01 (Graph Store)
18. CONV-08-02 (Leiden)
19. CONV-08-03 (要約生成)

### Week 6: 検索エンジン

20. CONV-07-01 (クエリ分類)
21. CONV-07-02〜04 (3検索戦略) - 並列実行可能
22. CONV-07-05 (RRF + Rerank)
23. CONV-07-06 (CRAG)
24. CONV-07-07 (HybridRAG統合)

## ファイル一覧

| ファイル名                                | タスクID   |
| ----------------------------------------- | ---------- |
| task-01-file-selection.md                 | CONV-01    |
| task-02-01-conversion-base.md             | CONV-02-01 |
| task-02-02-text-converters.md             | CONV-02-02 |
| task-02-03-markdown-code-converters.md    | CONV-02-03 |
| task-03-01-base-types.md                  | CONV-03-01 |
| task-03-02-file-conversion-schemas.md     | CONV-03-02 |
| task-03-03-chunk-embedding-schemas.md     | CONV-03-03 |
| task-03-04-entity-relation-schemas.md     | CONV-03-04 |
| task-03-05-search-query-result-schemas.md | CONV-03-05 |
| task-04-01-drizzle-setup.md               | CONV-04-01 |
| task-04-02-files-conversions-tables.md    | CONV-04-02 |
| task-04-03-chunks-fts5.md                 | CONV-04-03 |
| task-04-04-diskann-vector-index.md        | CONV-04-04 |
| task-04-05-knowledge-graph-tables.md      | CONV-04-05 |
| task-04-06-repository-pattern.md          | CONV-04-06 |
| task-05-01-logging-service.md             | CONV-05-01 |
| task-05-02-history-service.md             | CONV-05-02 |
| task-05-03-history-ui-components.md       | CONV-05-03 |
| task-06-01-chunking-strategies.md         | CONV-06-01 |
| task-06-02-embedding-providers.md         | CONV-06-02 |
| task-06-03-contextual-retrieval.md        | CONV-06-03 |
| task-06-04-entity-extraction-ner.md       | CONV-06-04 |
| task-06-05-relation-extraction.md         | CONV-06-05 |
| task-07-01-query-classifier.md            | CONV-07-01 |
| task-07-02-keyword-search-fts5.md         | CONV-07-02 |
| task-07-03-vector-search-diskann.md       | CONV-07-03 |
| task-07-04-graph-search-strategy.md       | CONV-07-04 |
| task-07-05-rrf-fusion-reranking.md        | CONV-07-05 |
| task-07-06-corrective-rag.md              | CONV-07-06 |
| task-07-07-hybridrag-integration.md       | CONV-07-07 |
| task-08-01-knowledge-graph-store.md       | CONV-08-01 |
| task-08-02-community-detection-leiden.md  | CONV-08-02 |
| task-08-03-community-summarization.md     | CONV-08-03 |

## ベンチマーク目標

| フェーズ          | 目標精度 | 備考                       |
| ----------------- | -------- | -------------------------- |
| Vector検索のみ    | 57.50%   | 基準値                     |
| +FTS5 Hybrid      | 70%      | RRF統合                    |
| +Reranking        | 80%      | Cross-Encoder              |
| +GraphRAG         | 85%      | エンティティ・コミュニティ |
| +CRAG             | 88%      | 関連性評価                 |
| **HybridRAG統合** | **90%+** | 最終目標                   |

## 更新履歴

| 日付       | 更新内容                     |
| ---------- | ---------------------------- |
| 2025-12-15 | 初版作成（31タスクに細分化） |
