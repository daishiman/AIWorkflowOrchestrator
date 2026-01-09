# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 2                     |
| Phase名    | 設計                  |
| 前提Phase  | Phase 1               |
| 後続Phase  | Phase 3               |
| ステータス | 未実施                |
| 作成日     | 2026-01-08            |
| 機能名     | knowledge-graph-store |

---

## 目的

要件を実現可能な構造に落とし込む。
IKnowledgeGraphStoreインターフェース、ドメインモデル（StoredEntity, StoredRelation等）、リポジトリ設計を行う。

## 背景

Phase 1で定義した要件をもとに、SQLiteベースのKnowledge Graphストアの詳細設計を行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: domain-modeling

**パス**: `.claude/skills/domain-modeling/SKILL.md`

**Trigger条件**:
ドメインモデル（Entity, Value Object）の設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. StoredEntity, StoredRelation, GraphNode, GraphPath等を設計

**期待される成果物**:

- `outputs/phase-2/domain-model.md`

---

### スキル2: repository-pattern

**パス**: `.claude/skills/repository-pattern/SKILL.md`

**Trigger条件**:
リポジトリインターフェース・実装パターンの設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. IKnowledgeGraphStoreインターフェースを設計

**期待される成果物**:

- `outputs/phase-2/repository-interface.md`

---

### スキル3: drizzle-orm

**パス**: `.claude/skills/drizzle-orm/SKILL.md`

**Trigger条件**:
DrizzleORMスキーマ・クエリの設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. entities, graph_relationsテーブルとの連携を設計

**期待される成果物**:

- `outputs/phase-2/drizzle-queries.md`

---

## 参照資料

| 参照資料          | パス                                                                    | 内容                  |
| ----------------- | ----------------------------------------------------------------------- | --------------------- |
| 要件定義書        | `outputs/phase-1/requirements-definition.md`                            | Phase 1成果物         |
| 受け入れ基準      | `outputs/phase-1/acceptance-criteria.md`                                | Phase 1成果物         |
| RAGアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md` | Knowledge Graph型定義 |

---

## 成果物

| 成果物                     | パス                                      | 内容                 |
| -------------------------- | ----------------------------------------- | -------------------- |
| アーキテクチャ設計         | `outputs/phase-2/architecture-design.md`  | システム構造         |
| ドメインモデル             | `outputs/phase-2/domain-model.md`         | エンティティ・VO定義 |
| リポジトリインターフェース | `outputs/phase-2/repository-interface.md` | API設計              |
| Drizzleクエリ設計          | `outputs/phase-2/drizzle-queries.md`      | DB操作設計           |

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント       | 契約定義                                             |
| ------------------ | ---------------------------------------------------- |
| EntityRepository   | entities テーブルへのCRUD操作インターフェース        |
| RelationRepository | graph_relations テーブルへのCRUD操作インターフェース |
| DiskANN検索        | vector_distance_cos を使用した類似検索クエリ         |

---

## 完了条件

- [ ] StoredEntity, StoredRelation, GraphPath等のドメインモデルが定義されている
- [ ] IKnowledgeGraphStoreインターフェースが設計されている
- [ ] Drizzle ORMを使用したクエリパターンが設計されている
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 使用スキル

- domain-modeling: {{result}}
- repository-pattern: {{result}}
- drizzle-orm: {{result}}

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

`docs/30-workflows/knowledge-graph-store/phase-3-design-review.md`
