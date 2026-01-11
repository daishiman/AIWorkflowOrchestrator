# Phase 1: 要件定義 - キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 1                   |
| Phase名    | 要件定義            |
| 前提Phase  | なし                |
| 後続Phase  | Phase 2（設計）     |
| ステータス | 未実施              |
| 作成日     | 2026-01-11          |
| 機能名     | keyword-search-fts5 |
| タスクID   | CONV-07-02          |

---

## 目的

HybridRAG検索エンジンのキーワード検索戦略の要件を明確化し、受け入れ基準を定義する。

## 背景

HybridRAGパイプラインでは、Semantic検索、Graph検索と並んでKeyword検索が重要な検索戦略の一つである。SQLite FTS5（Full-Text Search 5）とBM25アルゴリズムを活用し、高速・高精度な全文検索機能を実装する必要がある。

---

## 実行タスク

### タスク1: 機能要件の抽出

**目的**: ユーザー要求とシステム要件から機能要件を抽出する

**実行手順**:

1. マスタータスクリスト（`task-00-master-task-list.md`）からCONV-07-02の要件を確認
2. 既存のチャンク検索API仕様（`api-internal-chunk-search.md`）を確認
3. 検索インターフェース仕様（`interfaces-rag-search.md`）を確認
4. 機能要件（FR）を抽出し一覧化

**期待される成果物**:

- 機能要件一覧（FR-001〜）

---

### タスク2: 非機能要件の抽出

**目的**: 性能・セキュリティ・保守性などの非機能要件を定義する

**実行手順**:

1. 性能目標（検索速度、スループット）を定義
2. テストカバレッジ基準を定義
3. 保守性・拡張性の要件を定義
4. 非機能要件（NFR）を抽出し一覧化

**期待される成果物**:

- 非機能要件一覧（NFR-001〜）

---

### タスク3: 受け入れ基準の定義

**目的**: 各要件に対して検証可能な受け入れ基準を定義する

**実行手順**:

1. 各FRに対してGiven-When-Then形式で受け入れ基準を定義
2. 各NFRに対して測定可能な基準を定義
3. 境界値・エッジケースを特定

**期待される成果物**:

- 受け入れ基準一覧（AC-001〜）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                           |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| RAGアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`          | RAGパイプライン全体設計        |
| 検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`     | SearchQuery/SearchResult型定義 |
| チャンク検索API      | `.claude/skills/aiworkflow-requirements/references/api-internal-chunk-search.md` | FTS5検索API仕様                |
| DBスキーマ           | `.claude/skills/aiworkflow-requirements/references/database-schema.md`           | chunksテーブル + FTS5定義      |

---

## 成果物

| 成果物       | パス                                         | 内容               |
| ------------ | -------------------------------------------- | ------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR一覧         |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義             |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲・除外範囲 |

---

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ   | 記載内容                                                              |
| ------------------ | --------------------------------------------------------------------- |
| API接続            | ISearchStrategy.search() → データベース層chunks-search.ts連携         |
| データフロー       | SearchQuery → KeywordSearchStrategy → FTS5クエリ → SearchResultItem[] |
| エラーハンドリング | 無効クエリ、タイムアウト、DB接続エラーの処理                          |

---

## 完了条件

- [ ] 全機能要件（FR）が抽出・文書化されている
- [ ] 全非機能要件（NFR）が抽出・文書化されている
- [ ] 各要件に受け入れ基準（AC）が定義されている
- [ ] スコープ（含む/含まない）が明確に定義されている
- [ ] 接続要件（API/データフロー/エラーハンドリング）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonのPhase 1を更新

---

## 次のPhase

Phase 2: 設計

`docs/30-workflows/keyword-search-fts5/phase-2-design.md`
