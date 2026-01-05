# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 1                          |
| Phase名    | 要件定義                   |
| 前提Phase  | -                          |
| 後続Phase  | Phase 2                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-04                 |
| 機能名     | Knowledge Graph テーブル群 |

---

## 目的

Knowledge Graph（エンティティ、関係、コミュニティ）を永続化するためのテーブル群の要件を定義する。

## 背景

GraphRAGの基盤として、以下の機能が必要:

1. **エンティティ管理**: 文書から抽出されたエンティティ（人物、組織、場所、概念等）の永続化
2. **関係管理**: エンティティ間の関係（エッジ）の永続化
3. **コミュニティ管理**: Leidenアルゴリズムで検出されたコミュニティの永続化
4. **トレーサビリティ**: 各関係の出典チャンクへの追跡可能性

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: database-normalization

**パス**: `.claude/skills/database-normalization/SKILL.md`

**Trigger条件**: データベース設計時に正規化戦略を決定する必要がある場合

**実行方法**:

1. SKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. Knowledge Graphテーブルの正規化レベルを決定

**期待される成果物**:

- 正規化レベルの決定と根拠
- 非正規化が必要な箇所の特定

---

### スキル2: foreign-key-constraints

**パス**: `.claude/skills/foreign-key-constraints/SKILL.md`

**Trigger条件**: テーブル間の参照整合性を設計する必要がある場合

**実行方法**:

1. SKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 外部キー制約とCASCADE動作を定義

**期待される成果物**:

- 外部キー制約の一覧
- CASCADE動作の定義

---

## 参照資料

| 参照資料     | パス                                                                     | 内容                     |
| ------------ | ------------------------------------------------------------------------ | ------------------------ |
| 元タスク仕様 | `docs/30-workflows/unassigned-task/task-04-05-knowledge-graph-tables.md` | 成果物の詳細定義         |
| CONV-04-01   | 依存タスク                                                               | Drizzle ORM セットアップ |
| GraphRAG論文 | 外部参照                                                                 | Knowledge Graph設計指針  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                  | 内容                 |
| ---------------- | --------------------------------------------------------------------- | -------------------- |
| データベース設計 | `.claude/skills/aiworkflow-requirements/references/` 内の関連ファイル | 既存スキーマとの整合 |

---

## 成果物

| 成果物       | パス                                         | 内容                     |
| ------------ | -------------------------------------------- | ------------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件     |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 各テーブルの受け入れ条件 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲と除外範囲       |

---

## 完了条件

- [ ] 各テーブル（entities, relations, relationEvidence, communities, entityCommunities, chunkEntities）の機能要件が定義されている
- [ ] 非機能要件（パフォーマンス、スケーラビリティ）が定義されている
- [ ] 正規化レベルが決定されている
- [ ] 外部キー制約とCASCADE動作が定義されている
- [ ] 受け入れ基準が明確に定義されている
- [ ] スコープ（実装範囲と除外範囲）が明確化されている

---

## 依存関係

- **前提**: CONV-04-01（Drizzle ORM セットアップ）が完了していること
- **後続**: Phase 2（設計）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 使用スキル

- database-normalization: (結果を記入)
- foreign-key-constraints: (結果を記入)

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

`docs/30-workflows/conv-04-05-knowledge-graph-tables/phase-2-design.md`
