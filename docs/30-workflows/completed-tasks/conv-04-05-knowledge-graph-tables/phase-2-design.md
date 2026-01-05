# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 2                          |
| Phase名    | 設計                       |
| 前提Phase  | Phase 1                    |
| 後続Phase  | Phase 3                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-04                 |
| 機能名     | Knowledge Graph テーブル群 |

---

## 目的

Knowledge Graph テーブル群の詳細設計を行い、Drizzle ORMスキーマの具体的な構造を決定する。

## 背景

Phase 1で定義した要件に基づき、以下の設計を行う:

1. 各テーブルのカラム定義
2. インデックス戦略
3. 外部キー制約とリレーション
4. 型定義（TypeScript）

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: drizzle-orm

**パス**: `.claude/skills/drizzle-orm/SKILL.md`

**Trigger条件**: Drizzle ORMでテーブルスキーマを定義する場合

**実行方法**:

1. SKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 各テーブルのスキーマ定義を設計

**期待される成果物**:

- 6つのテーブル（entities, relations, relationEvidence, communities, entityCommunities, chunkEntities）のスキーマ設計
- Drizzleリレーション定義

---

### スキル2: indexing-strategies

**パス**: `.claude/skills/indexing-strategies/SKILL.md`

**Trigger条件**: SQLiteインデックス戦略を設計する場合

**実行方法**:

1. SKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 各テーブルに必要なインデックスを特定

**期待される成果物**:

- インデックス一覧と根拠
- 複合インデックスの設計
- パフォーマンス考慮点

---

### スキル3: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**: TypeScript型安全設計が必要な場合

**実行方法**:

1. SKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 推論型（$inferSelect, $inferInsert）の活用を設計

**期待される成果物**:

- 型エクスポート戦略
- JSON型カラムの型定義

---

## 参照資料

| 参照資料                 | パス                                                                     | 内容                   |
| ------------------------ | ------------------------------------------------------------------------ | ---------------------- |
| Phase 1 成果物           | `outputs/phase-1/`                                                       | 要件定義・受け入れ基準 |
| 元タスク仕様（コード例） | `docs/30-workflows/unassigned-task/task-04-05-knowledge-graph-tables.md` | 具体的なコード例       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                      | 内容                         |
| -------------- | ----------------------------------------- | ---------------------------- |
| 共通スキーマ   | `packages/shared/src/db/schema/common.ts` | uuidPrimaryKey, timestamps等 |
| chunksテーブル | `packages/shared/src/db/schema/chunks.ts` | 外部キー参照先               |

---

## 成果物

| 成果物             | パス                                     | 内容                       |
| ------------------ | ---------------------------------------- | -------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | テーブル関連図、設計方針   |
| DB設計             | `outputs/phase-2/database-schema.md`     | 各テーブルの詳細カラム定義 |
| インデックス設計   | `outputs/phase-2/index-strategy.md`      | インデックス一覧と根拠     |

---

## 設計対象テーブル

### 1. entities テーブル

エンティティ（ノード）を格納するテーブル。

| カラム           | 型          | 制約                  | 説明                   |
| ---------------- | ----------- | --------------------- | ---------------------- |
| id               | TEXT        | PK, UUID              | 主キー                 |
| name             | TEXT        | NOT NULL              | エンティティ名         |
| normalizedName   | TEXT        | NOT NULL              | 検索用正規化名         |
| type             | TEXT (enum) | NOT NULL              | エンティティタイプ     |
| description      | TEXT        | NULL                  | 説明                   |
| aliases          | TEXT (JSON) | DEFAULT []            | 別名リスト             |
| embedding        | BLOB        | NULL                  | 埋め込みベクトル       |
| embeddingModelId | TEXT        | NULL                  | 使用した埋め込みモデル |
| importance       | REAL        | NOT NULL, DEFAULT 0.5 | 重要度スコア           |
| mentionCount     | INTEGER     | NOT NULL, DEFAULT 1   | 出現回数               |
| metadata         | TEXT (JSON) | NULL                  | メタデータ             |
| createdAt        | INTEGER     | NOT NULL              | 作成日時               |
| updatedAt        | INTEGER     | NOT NULL              | 更新日時               |

### 2. relations テーブル

エンティティ間の関係（エッジ）を格納するテーブル。

### 3. relationEvidence テーブル

関係の証拠（出典チャンク）を格納するテーブル。

### 4. communities テーブル

Leidenアルゴリズムで検出されたコミュニティを格納するテーブル。

### 5. entityCommunities テーブル

エンティティとコミュニティの多対多関係を格納する中間テーブル。

### 6. chunkEntities テーブル

チャンクとエンティティの多対多関係を格納する中間テーブル。

---

## 完了条件

- [ ] 全6テーブルのカラム定義が完了している
- [ ] 各テーブルのインデックス設計が完了している
- [ ] 外部キー制約が設計されている
- [ ] Drizzleリレーション設計が完了している
- [ ] TypeScript型エクスポート戦略が決定している
- [ ] 設計書が `outputs/phase-2/` に出力されている

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

```markdown
## Phase 2 実行記録

### 使用スキル

- drizzle-orm: (結果を記入)
- indexing-strategies: (結果を記入)
- type-safety-patterns: (結果を記入)

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

`docs/30-workflows/conv-04-05-knowledge-graph-tables/phase-3-design-review.md`
