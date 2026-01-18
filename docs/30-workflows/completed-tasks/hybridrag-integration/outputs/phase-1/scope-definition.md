# HybridRAG統合 - スコープ定義書

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | CONV-07-07    |
| タスク名   | HybridRAG統合 |
| Phase      | 1             |
| 作成日     | 2026-01-17    |
| ステータス | 完了          |

---

## 1. スコープ内（In Scope）

### 1.1 実装対象

| 項目             | 配置先                                                      | 説明                                 |
| ---------------- | ----------------------------------------------------------- | ------------------------------------ |
| HybridRAGEngine  | `packages/shared/src/services/search/hybrid-rag-engine.ts`  | 4ステージパイプライン統合クラス      |
| HybridRAGFactory | `packages/shared/src/services/search/hybrid-rag-factory.ts` | エンジン生成ファクトリ               |
| 型定義           | `packages/shared/src/services/search/hybrid-rag-engine.ts`  | HybridRAGResponse, HybridRAGResult等 |
| エクスポート更新 | `packages/shared/src/services/search/index.ts`              | 公開API整理                          |

### 1.2 テスト対象

| 項目             | 配置先                                                                                | 説明                       |
| ---------------- | ------------------------------------------------------------------------------------- | -------------------------- |
| ユニットテスト   | `packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts`             | HybridRAGEngine単体テスト  |
| ファクトリテスト | `packages/shared/src/services/search/__tests__/hybrid-rag-factory.test.ts`            | HybridRAGFactory単体テスト |
| 統合テスト       | `packages/shared/src/services/search/__tests__/hybrid-rag-engine.integration.test.ts` | パイプライン統合テスト     |

### 1.3 機能範囲

| 機能                   | 説明                                                  |
| ---------------------- | ----------------------------------------------------- |
| Query Classification   | QueryClassifierを使用したクエリタイプ判定・重み決定   |
| Triple Search          | Keyword/Semantic/Graph検索の並列実行                  |
| RRF Fusion             | RRFアルゴリズムによる検索結果統合                     |
| Reranking              | IRerankerを使用した再ランキング                       |
| CRAG                   | CorrectiveRAGによる関連性評価・結果補正（オプション） |
| パイプラインメトリクス | 各ステージの実行時間・件数記録                        |
| 部分失敗耐性           | 一部検索戦略の失敗を許容する仕組み                    |
| ファクトリパターン     | Full/Lite/Testing用エンジン生成                       |

---

## 2. スコープ外（Out of Scope）

### 2.1 依存コンポーネントの修正

| 項目                  | 理由                                                        |
| --------------------- | ----------------------------------------------------------- |
| QueryClassifier       | CONV-07-01で実装済み、本タスクでは使用のみ                  |
| KeywordSearchStrategy | CONV-07-02で実装済み、本タスクでは使用のみ                  |
| VectorSearchStrategy  | CONV-07-03で実装済み、本タスクでは使用のみ                  |
| GraphSearchStrategy   | CONV-07-04で実装済み、本タスクでは使用のみ                  |
| RRFFusion             | CONV-07-05で実装済み、本タスクでは使用のみ                  |
| CorrectiveRAG         | CONV-07-06で実装済み、本タスクでは使用のみ                  |
| Reranker実装          | 既存実装を使用（CohereReranker, LLMReranker, NoOpReranker） |

### 2.2 新機能の実装

| 項目                 | 理由                                          |
| -------------------- | --------------------------------------------- |
| Web検索機能          | IWebSearcherは既存の想定、新規実装は対象外    |
| 新しい検索戦略       | 既存の3戦略（Keyword/Semantic/Graph）のみ対象 |
| 新しいRerankerタイプ | 既存のReranker実装のみ使用                    |

### 2.3 UI/フロントエンド

| 項目         | 理由                         |
| ------------ | ---------------------------- |
| 検索UI       | バックエンドサービスのみ対象 |
| 検索結果表示 | バックエンドサービスのみ対象 |
| 設定画面     | バックエンドサービスのみ対象 |

### 2.4 インフラ・運用

| 項目                       | 理由                                       |
| -------------------------- | ------------------------------------------ |
| デプロイ設定               | 本タスクは実装のみ                         |
| 監視・アラート設定         | 本タスクは実装のみ                         |
| パフォーマンスチューニング | 基本実装のみ、高度なチューニングは別タスク |

---

## 3. 依存関係

### 3.1 前提条件（Prerequisites）

| 依存タスク | 成果物                | ステータス |
| ---------- | --------------------- | ---------- |
| CONV-07-01 | QueryClassifier       | 実装済み   |
| CONV-07-02 | KeywordSearchStrategy | 実装済み   |
| CONV-07-03 | VectorSearchStrategy  | 実装済み   |
| CONV-07-04 | GraphSearchStrategy   | 実装済み   |
| CONV-07-05 | RRFFusion             | 実装済み   |
| CONV-07-06 | CorrectiveRAG         | 実装済み   |

### 3.2 外部依存

| 依存       | 用途                   | バージョン |
| ---------- | ---------------------- | ---------- |
| TypeScript | 型安全な実装           | 5.x        |
| Vitest     | テストフレームワーク   | 最新       |
| pnpm       | パッケージマネージャー | 最新       |

---

## 4. 成果物一覧

### 4.1 コード成果物

| 種別         | ファイルパス                                                              |
| ------------ | ------------------------------------------------------------------------- |
| 実装         | `packages/shared/src/services/search/hybrid-rag-engine.ts`                |
| 実装         | `packages/shared/src/services/search/hybrid-rag-factory.ts`               |
| テスト       | `packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts` |
| エクスポート | `packages/shared/src/services/search/index.ts`                            |

### 4.2 ドキュメント成果物

| 種別         | ファイルパス                                            |
| ------------ | ------------------------------------------------------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md`            |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                |
| スコープ定義 | `outputs/phase-1/scope-definition.md`（本ドキュメント） |

---

## 5. 制約事項

| 制約                   | 説明                                  |
| ---------------------- | ------------------------------------- |
| レイテンシ             | CRAG無効時500ms以下、有効時1000ms以下 |
| 精度                   | MRR@10基準で90%以上                   |
| カバレッジ             | Line 80%+, Branch 60%+, Function 80%+ |
| 依存コンポーネント     | CONV-07-01〜06の既存実装を変更しない  |
| パッケージマネージャー | pnpmを使用                            |

---

## 6. リスクと軽減策

| リスク                   | 影響度 | 軽減策                                               |
| ------------------------ | ------ | ---------------------------------------------------- |
| 依存コンポーネントのバグ | 高     | 統合テストで早期発見、モック使用でユニットテスト分離 |
| レイテンシ目標未達       | 中     | 並列処理の最適化、キャッシュ活用                     |
| 精度目標未達             | 中     | 重み調整、Rerankerの選択、CRAGの活用                 |
| カバレッジ目標未達       | 低     | Phase 6のテスト拡充で対応                            |

---

## 7. 変更履歴

| 日付       | 版  | 変更内容 |
| ---------- | --- | -------- |
| 2026-01-17 | 1.0 | 初版作成 |
