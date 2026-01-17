# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 1                     |
| Phase名    | 要件定義              |
| 前提Phase  | なし                  |
| 後続Phase  | Phase 2               |
| ステータス | 未実施                |
| 作成日     | 2026-01-17            |
| 機能名     | hybridrag-integration |

---

## 目的

HybridRAG統合タスクの目的、スコープ、受け入れ基準を明文化し、実装の基盤となる要件を確立する。

## 背景

CONV-07-01〜06で実装された各検索コンポーネント（QueryClassifier、KeywordSearch、VectorSearch、GraphSearch、RRF Fusion、CRAG）を統合し、HybridRAG検索エンジンとして完成させる必要がある。本Phaseでは、統合に必要な機能要件・非機能要件を明確化する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件抽出

**目的**: 元タスク指示書から機能要件・非機能要件を抽出する

**実行手順**:

1. `docs/30-workflows/unassigned-task/task-07-07-hybridrag-integration.md` を読み込む
2. 機能要件（FR）を抽出する:
   - FR-01: HybridRAGEngineクラスの実装
   - FR-02: 4ステージパイプライン（Query Classification → Triple Search → RRF Fusion + Reranking → CRAG）
   - FR-03: HybridRAGFactoryによるエンジン生成（Full/Lite/Testing）
   - FR-04: 部分的な検索失敗への耐性
   - FR-05: パイプラインメトリクスの記録
3. 非機能要件（NFR）を抽出する:
   - NFR-01: レイテンシ目標（CRAG無効時500ms以下、有効時1000ms以下）
   - NFR-02: 検索精度目標（MRR@10基準で90%以上）
   - NFR-03: テストカバレッジ（Line 80%+, Branch 60%+, Function 80%+）
   - NFR-04: TypeScript型エラーなし
   - NFR-05: ESLint警告なし

**期待される成果物**:

- 機能要件リスト（FR-01〜FR-05）
- 非機能要件リスト（NFR-01〜NFR-05）

---

### タスク2: 受け入れ基準作成

**目的**: 各要件に対して検証可能な受け入れ基準を定義する

**実行手順**:

1. 各機能要件に対して受け入れ基準を定義:
   - AC-FR-01: `HybridRAGEngine.search()`メソッドが`Result<HybridRAGResponse, Error>`を返す
   - AC-FR-02: パイプラインの各ステージ（query_classification, triple_search, rrf_fusion, reranking, crag）がpipelineStagesに記録される
   - AC-FR-03: `HybridRAGFactory.createFull()`, `createLite()`, `createForTesting()`が正常に動作する
   - AC-FR-04: 1つ以上の検索戦略が成功すれば結果を返す、すべて失敗時のみエラー
   - AC-FR-05: 各ステージのduration, inputCount, outputCountが記録される
2. 各非機能要件に対して受け入れ基準を定義:
   - AC-NFR-01: `metadata.totalDuration`がCRAG無効時500ms以下、有効時1000ms以下
   - AC-NFR-02: テストデータセットでMRR@10が0.9以上
   - AC-NFR-03: `pnpm test:coverage`でLine 80%+, Branch 60%+, Function 80%+
   - AC-NFR-04: `pnpm typecheck`がエラー0
   - AC-NFR-05: `pnpm lint`が警告0

**期待される成果物**:

- 受け入れ基準リスト（AC-FR-01〜AC-FR-05, AC-NFR-01〜AC-NFR-05）

---

### タスク3: スコープ定義

**目的**: 実装スコープを明確化し、境界を設定する

**実行手順**:

1. スコープ内を定義:
   - HybridRAGEngineクラスの実装
   - HybridRAGFactoryクラスの実装
   - 型定義（HybridRAGResponse, HybridRAGResult, PipelineStageResult等）
   - ユニットテスト・統合テスト
   - エクスポート更新（index.ts）
2. スコープ外を定義:
   - 依存コンポーネント（QueryClassifier, KeywordSearchStrategy等）の修正
   - Web検索機能の新規実装（IWebSearcherは既存の想定）
   - UI/フロントエンド実装
   - パフォーマンスチューニング（基本実装のみ）

**期待される成果物**:

- スコープ定義書（スコープ内/外の明確な境界）

---

## 参照資料

| 参照資料                | パス                                                                         | 内容                        |
| ----------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| 元タスク指示書          | `docs/30-workflows/unassigned-task/task-07-07-hybridrag-integration.md`      | 実装仕様の詳細              |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | SearchQuery, SearchResult等 |
| RAGアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | パイプライン構造            |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                         | 内容                                   |
| ----------------------- | ---------------------------------------------------------------------------- | -------------------------------------- |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | SearchQuery, SearchResult, CRAGScore等 |
| RAGアーキテクチャ設計   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | HybridRAGパイプライン構造              |

---

## 成果物

| 成果物       | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

---

## 統合テスト連携【必須】

接続要件（各コンポーネントのインターフェース）を要件に明記する:

| 接続要件カテゴリ                | 記載内容                                            |
| ------------------------------- | --------------------------------------------------- |
| QueryClassifierインターフェース | `classify()`: `Result<{queryType, weights}, Error>` |
| ISearchStrategyインターフェース | `search()`: `Result<SearchResultItem[], Error>`     |
| RRFFusionインターフェース       | `fuse()`: `FusedSearchResult[]`                     |
| IRerankerインターフェース       | `rerank()`: `Result<FusedSearchResult[], Error>`    |
| CorrectiveRAGインターフェース   | `process()`: `Result<CRAGResult, Error>`            |

---

## 完了条件

- [ ] 機能要件（FR-01〜FR-05）が抽出されている
- [ ] 非機能要件（NFR-01〜NFR-05）が抽出されている
- [ ] 各要件に受け入れ基準（AC）が定義されている
- [ ] スコープ（内/外）が明確に定義されている
- [ ] 各コンポーネントの接続要件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（初期Phase）
- **後続**: Phase 2（設計）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- タスク1（要件抽出）: {{result}}
- タスク2（受け入れ基準作成）: {{result}}
- タスク3（スコープ定義）: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/hybridrag-integration/phase-2-design.md`
