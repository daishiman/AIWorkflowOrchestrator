# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 1                     |
| Phase名    | 要件定義              |
| 前提Phase  | なし                  |
| 後続Phase  | Phase 2               |
| ステータス | 未実施                |
| 作成日     | 2026-01-08            |
| 機能名     | knowledge-graph-store |

---

## 目的

タスクの目的、スコープ、受け入れ基準を明文化する。
Knowledge Graphストアが提供すべきエンティティ・関係操作、グラフトラバーサル機能を定義する。

## 背景

GraphRAGにおいて、抽出されたエンティティと関係をSQLiteベースで永続化し、効率的なグラフ探索を可能にする必要がある。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: requirements-engineering

**パス**: `.claude/skills/requirements-engineering/SKILL.md`

**Trigger条件**:
要件抽出・仕様化が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### スキル2: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**Trigger条件**:
受け入れ基準の作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

## 参照資料

| 参照資料             | パス                                                                    | 内容                  |
| -------------------- | ----------------------------------------------------------------------- | --------------------- |
| 元タスク指示書       | `docs/30-workflows/unassigned-task/task-08-01-knowledge-graph-store.md` | 要件の元情報          |
| RAGアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md` | Knowledge Graph型定義 |
| データベーススキーマ | `.claude/skills/aiworkflow-requirements/references/database-schema.md`  | テーブル設計          |

---

## 成果物

| 成果物       | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

---

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                      |
| ---------------- | ------------------------------------------------------------- |
| DBアクセス       | SQLite/Turso経由でentities, graph_relationsテーブルへアクセス |
| リポジトリ連携   | EntityRepository, RelationRepository経由のCRUD操作            |
| ベクトル検索     | DiskANNインデックスを使用した類似エンティティ検索             |

---

## 完了条件

- [ ] Knowledge Graphストアの機能要件が定義されている（エンティティCRUD、関係CRUD、トラバーサル）
- [ ] 非機能要件（性能、スケーラビリティ）が定義されている
- [ ] 各機能に受け入れ基準がある（Given-When-Then形式）
- [ ] スコープ（含む/含まない）が明確化されている
- [ ] DB接続・リポジトリ連携要件が明記されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 使用スキル

- requirements-engineering: {{result}}
- acceptance-criteria-writing: {{result}}

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

`docs/30-workflows/knowledge-graph-store/phase-2-design.md`
