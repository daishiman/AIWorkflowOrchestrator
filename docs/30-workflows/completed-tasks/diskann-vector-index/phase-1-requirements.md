# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 1                    |
| Phase名    | 要件定義             |
| 前提Phase  | -                    |
| 後続Phase  | Phase 2              |
| ステータス | 完了                 |
| 作成日     | 2026-01-04           |
| 完了日     | 2026-01-04           |
| 機能名     | diskann-vector-index |

---

## 目的

DiskANNベクトルインデックス設定の機能要件・非機能要件を明確にし、受け入れ基準を定義する。

## 背景

libSQLのベクトル検索機能を活用してRAGシステムのセマンティック検索を実現するため、要件を明確化する必要がある。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**Trigger条件**: 受け入れ基準の定義が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 受け入れ基準定義書

---

### スキル2: functional-non-functional-requirements

**パス**: `.claude/skills/functional-non-functional-requirements/SKILL.md`

**Trigger条件**: 機能要件・非機能要件の定義が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 機能要件定義書
- 非機能要件定義書

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                           | 内容                           |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| データベースアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/database-architecture.md`   | DB設計方針・テーブル構成       |
| データベース実装           | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle ORM実装パターン        |
| RAGアーキテクチャ          | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`        | RAGシステム全体設計            |
| RAGインターフェース        | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`          | 埋め込み・検索インターフェース |

### タスク関連資料

| 参照資料             | パス                                                                                     | 内容                     |
| -------------------- | ---------------------------------------------------------------------------------------- | ------------------------ |
| 元タスク仕様         | `docs/30-workflows/unassigned-task/task-04-04-diskann-vector-index.md`                   | タスク詳細仕様           |
| libSQL Vector Search | [GitHub](https://github.com/libsql/libsql/blob/main/libsql-sqlite3/doc/vector_search.md) | ベクトル検索ドキュメント |
| chunks テーブル      | `packages/shared/src/db/schema/chunks.ts`                                                | 依存テーブル定義         |

---

## 成果物

| 成果物       | パス                                         | 内容                       |
| ------------ | -------------------------------------------- | -------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件の定義 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 各要件の受け入れ条件       |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲の明確化           |

---

## 完了条件

- [x] 機能要件が定義されている
  - embeddingsテーブル要件
  - ベクトルインデックス要件
  - ベクトル検索クエリ要件
  - Float32Array変換要件
  - バッチ挿入要件
- [x] 非機能要件が定義されている
  - パフォーマンス要件（検索時間目標）
  - スケーラビリティ要件
  - 信頼性要件
- [x] 受け入れ基準が定義されている
- [x] スコープ（実装範囲）が明確化されている
- [x] 依存関係（CONV-04-03）が確認されている

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2 へ進む

---

## 機能要件（参考）

元タスク仕様書から抽出した機能要件:

### 1. embeddingsテーブル

| フィールド           | 型          | 説明                     |
| -------------------- | ----------- | ------------------------ |
| id                   | UUID (TEXT) | 主キー                   |
| chunk_id             | TEXT        | chunksテーブルへのFK     |
| vector               | BLOB        | Float32Arrayベクトル     |
| model_id             | TEXT        | 埋め込みモデルID         |
| dimensions           | INTEGER     | ベクトル次元数           |
| normalized_magnitude | REAL        | 正規化済みマグニチュード |
| created_at           | INTEGER     | 作成日時                 |
| updated_at           | INTEGER     | 更新日時                 |

### 2. ベクトルインデックス

- DiskANNベースの近似最近傍探索（ANN）
- コサイン類似度メトリック
- 1536次元対応（OpenAI text-embedding-3-small）

### 3. ベクトル検索クエリ

- コサイン類似度検索（`vector_distance_cos`）
- ユークリッド距離検索（`vector_distance_l2`）
- 内積検索（`vector_dot`）

---

## 非機能要件（参考）

| カテゴリ         | 要件                                 |
| ---------------- | ------------------------------------ |
| パフォーマンス   | < 10,000件: 50ms, < 100,000件: 100ms |
| スケーラビリティ | 1,000,000件まで対応                  |
| 信頼性           | chunk削除時のカスケード削除          |
| 互換性           | libSQL/Turso対応                     |

---

## スキルフィードバック記録

Phase完了後、使用したスキルへのフィードバックを記録してください:

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill acceptance-criteria-writing --result {{success|failure|partial}} --phase 1

node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill functional-non-functional-requirements --result {{success|failure|partial}} --phase 1
```

### 記録内容

| スキル                                 | 結果    | 備考                                                         |
| -------------------------------------- | ------- | ------------------------------------------------------------ |
| acceptance-criteria-writing            | success | 30件のGiven-When-Then形式の受け入れ基準を作成                |
| functional-non-functional-requirements | success | FR 10件、NFR 10件を定義、ISO 25010品質特性に基づく分類を実施 |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/diskann-vector-index/phase-2-design.md`
