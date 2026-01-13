# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 1                         |
| Phase名    | 要件定義                  |
| 前提Phase  | なし                      |
| 後続Phase  | Phase 2                   |
| ステータス | 未実施                    |
| 作成日     | 2026-01-12                |
| 機能名     | knowledge-graph-migration |

---

## 目的

Knowledge Graphテーブル群のマイグレーション生成・適用に必要な要件を明確化し、受け入れ基準を定義する。

## 背景

CONV-04-05でDrizzle ORMスキーマ定義が完了しているが、実際のデータベースにテーブルを作成するためのマイグレーションファイルが未生成の状態。後続のKnowledge Graph Store実装（CONV-08-01）をアンブロックするため、マイグレーションの生成と適用が必要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件抽出

**目的**: ユーザー要求から機能要件・非機能要件を抽出する

**実行手順**:

1. 元タスク指示書（`docs/30-workflows/unassigned-task/task-knowledge-graph-migration.md`）を精読
2. Knowledge Graphテーブル群の仕様を確認（`packages/shared/src/db/schema/graph/`）
3. Drizzle Kitマイグレーション仕様を確認（`.claude/skills/aiworkflow-requirements/references/database-implementation.md`）
4. 機能要件（FR）と非機能要件（NFR）をリストアップ

**期待される成果物**:

- 機能要件リスト
- 非機能要件リスト

---

### タスク2: 受け入れ基準作成

**目的**: 各要件に対して検証可能な受け入れ基準を定義する

**実行手順**:

1. 各機能要件に対して、具体的な受け入れ基準を定義
2. 検証可能な条件（テスト可能）であることを確認
3. 優先度（必須/推奨）を設定

**期待される成果物**:

- 受け入れ基準リスト

---

### タスク3: スコープ定義

**目的**: 実装範囲を明確化する

**実行手順**:

1. 含むもの（In Scope）をリストアップ
2. 含まないもの（Out of Scope）をリストアップ
3. 前提条件を確認

**期待される成果物**:

- スコープ定義書

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料     | パス                                                                                        | 内容                                          |
| ------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| DB実装仕様   | `.claude/skills/aiworkflow-requirements/references/database-implementation.md`              | Drizzle Kit使用方法・マイグレーション運用原則 |
| スキーマ仕様 | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      | Knowledge Graphテーブル定義                   |
| RAG仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | Knowledge Graph Store インターフェース        |

---

## 成果物

| 成果物       | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

---

## 統合テスト連携【必須】

接続要件（DB接続・マイグレーション適用）を要件に明記する:

| 接続要件カテゴリ     | 記載内容                                   |
| -------------------- | ------------------------------------------ |
| DB接続               | SQLite（libSQL）への接続確認               |
| マイグレーション適用 | drizzle-kit push/migrateによるスキーマ適用 |
| 外部キー制約         | PRAGMA foreign_keys = ON の有効化          |

---

## 完了条件

- [ ] 全要件が抽出されている
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] スコープが明確に定義されている
- [ ] 接続要件（DB接続・マイグレーション適用）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/knowledge-graph-migration --phase 1
```

---

## 依存関係

- **前提**: なし（本タスクの最初のPhase）
- **後続**: Phase 2（設計）へ進む

---

## Phase実行記録（実行後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- 要件抽出: {{結果}}
- 受け入れ基準作成: {{結果}}
- スコープ定義: {{結果}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/knowledge-graph-migration/phase-2-design.md`
