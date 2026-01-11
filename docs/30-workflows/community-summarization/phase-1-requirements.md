# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 1                       |
| Phase名    | 要件定義                |
| 前提Phase  | -                       |
| 後続Phase  | Phase 2（設計）         |
| ステータス | 未実施                  |
| 作成日     | 2026-01-10              |
| 機能名     | community-summarization |

---

## 目的

コミュニティ要約生成機能の目的・スコープ・受け入れ基準を明確に定義する。

## 背景

GraphRAGにおいてコミュニティ要約は、グローバルクエリ（「全体のテーマは？」等）への回答を可能にする重要な機能である。Leidenアルゴリズムで検出されたコミュニティに対してLLMで要約を生成し、セマンティック検索を可能にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能要件の定義

**目的**: コミュニティ要約生成機能に必要な機能を洗い出す

**実行手順**:

1. タスク指示書（`docs/30-workflows/unassigned-task/task-08-03-community-summarization.md`）を確認
2. 依存タスク（CONV-08-02: コミュニティ検出）の成果物を確認
3. 以下の機能要件を文書化:
   - 単一コミュニティの要約生成
   - 全コミュニティの一括要約生成（階層順）
   - 子コミュニティの要約を親コミュニティの要約生成に使用
   - 要約の埋め込み生成
   - 要約のセマンティック検索
   - 要約の更新（グラフ変更時）

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### タスク2: 非機能要件の定義

**目的**: パフォーマンス、信頼性、保守性等の非機能要件を定義

**実行手順**:

1. パフォーマンス要件を定義:
   - 1コミュニティあたりの要約生成時間目標
   - 並列処理の上限（maxConcurrency）
   - LLMトークン使用量の最適化
2. 信頼性要件を定義:
   - エラー発生時のリトライ戦略
   - 部分失敗時の継続処理
3. 保守性要件を定義:
   - Result型パターンによるエラー処理
   - DIによる依存性注入

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`（非機能要件セクション）

---

### タスク3: 接続要件の定義（統合テスト連携）

**目的**: 他モジュールとの接続要件を明確化

**実行手順**:

1. 依存モジュールの接続要件を定義:
   - `ILLMProvider`: LLM呼び出しインターフェース
   - `IEmbeddingProvider`: 埋め込み生成インターフェース
   - `IKnowledgeGraphStore`: グラフデータ取得
   - `ICommunityRepository`: コミュニティ永続化
2. データフロー要件を定義:
   - Community → エンティティ/関係取得 → プロンプト構築 → LLM呼び出し → 要約パース → 埋め込み生成 → DB保存
3. エラーハンドリング要件を定義:
   - LLM呼び出し失敗時のフォールバック
   - 埋め込み生成失敗時の動作

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`（接続要件セクション）

---

### タスク4: スコープ定義

**目的**: 実装スコープを明確化し、スコープ外を定義

**実行手順**:

1. スコープ内を定義:
   - `ICommunitySummarizer` インターフェース
   - `CommunitySummarizer` 実装クラス
   - 要約プロンプト（`buildCommunitySummaryPrompt`）
   - `CommunitySummary` 型定義
   - セマンティック検索機能
2. スコープ外を定義:
   - コミュニティ検出（CONV-08-02で実装済み）
   - LLMProvider/EmbeddingProvider実装（既存利用）
   - グラフ可視化
   - リアルタイム更新検出

**期待される成果物**:

- `outputs/phase-1/scope-definition.md`

---

### タスク5: 受け入れ基準の定義

**目的**: 機能の完了を判定する具体的な基準を定義

**実行手順**:

1. 機能ごとの受け入れ基準を定義:
   - AC-01: 単一コミュニティに対して要約が生成できること
   - AC-02: 子コミュニティの要約を使用して親コミュニティの要約が生成できること
   - AC-03: 全コミュニティの一括要約生成が階層順（子→親）で実行できること
   - AC-04: 要約の埋め込みが生成され、セマンティック検索ができること
   - AC-05: 特定レベルのコミュニティのみを検索できること
   - AC-06: コミュニティ要約の更新ができること
   - AC-07: 部分失敗時も処理が継続し、失敗したコミュニティIDが返却されること
2. 品質基準を定義:
   - テストカバレッジ: Line 80%+, Branch 60%+, Function 80%+
   - TypeScript型エラーなし
   - ESLint警告なし

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

## 参照資料

| 参照資料                  | パス                                                                                        | 内容                            |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| タスク指示書              | `docs/30-workflows/unassigned-task/task-08-03-community-summarization.md`                   | 元のタスク指示書                |
| コミュニティ検出仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md`   | Community型、CommunityStructure |
| Knowledge Graphストア仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | StoredEntity, StoredRelation    |
| RAGアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                     | GraphRAG全体設計                |

---

## 成果物

| 成果物       | パス                                         | 内容                   |
| ------------ | -------------------------------------------- | ---------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能・接続要件 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | スコープ内/外の明確化  |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 完了判定基準           |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 1での統合テスト連携アクション**:

接続要件（LLM/Embedding/DB）を要件に明記する。

- ILLMProvider との接続仕様を定義
- IEmbeddingProvider との接続仕様を定義
- ICommunityRepository との接続仕様を定義
- IKnowledgeGraphStore との接続仕様を定義

---

## 完了条件

- [ ] 機能要件が定義されている
- [ ] 非機能要件（パフォーマンス、信頼性、保守性）が定義されている
- [ ] 接続要件（LLM/Embedding/DB）が定義されている
- [ ] スコープ内/外が明確に定義されている
- [ ] 受け入れ基準が具体的に定義されている
- [ ] 全成果物が `outputs/phase-1/` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 1ステータスを更新

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-summarization/phase-2-design.md`
