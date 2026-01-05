# スコープ定義: Knowledge Graph テーブル群

## 1. 実装範囲（In Scope）

### 1.1 テーブル定義

| テーブル          | 説明                                    |
| ----------------- | --------------------------------------- |
| entities          | エンティティ（ノード）を格納            |
| relations         | エンティティ間の関係（エッジ）を格納    |
| relationEvidence  | 関係の証拠（出典チャンク）を格納        |
| communities       | Leidenコミュニティを格納                |
| entityCommunities | エンティティ-コミュニティの中間テーブル |
| chunkEntities     | チャンク-エンティティの中間テーブル     |

### 1.2 機能

- Drizzle ORMスキーマ定義
- インデックス定義
- 外部キー制約定義
- Drizzleリレーション定義
- 型エクスポート（$inferSelect, $inferInsert）
- バレルエクスポート（index.ts）

### 1.3 成果物

- `packages/shared/src/db/schema/graph/entities.ts`
- `packages/shared/src/db/schema/graph/relations.ts`
- `packages/shared/src/db/schema/graph/relation-evidence.ts`
- `packages/shared/src/db/schema/graph/communities.ts`
- `packages/shared/src/db/schema/graph/entity-communities.ts`
- `packages/shared/src/db/schema/graph/chunk-entities.ts`
- `packages/shared/src/db/schema/graph/graph-relations.ts`
- `packages/shared/src/db/schema/graph/index.ts`
- 単体テスト

---

## 2. 除外範囲（Out of Scope）

### 2.1 このタスクでは実装しないもの

| 除外項目                  | 理由           | 担当タスク |
| ------------------------- | -------------- | ---------- |
| エンティティ抽出ロジック  | 別タスクで実装 | CONV-06-04 |
| 関係抽出ロジック          | 別タスクで実装 | CONV-06-05 |
| Knowledge Graphストア実装 | 別タスクで実装 | CONV-08-01 |
| コミュニティ検出(Leiden)  | 別タスクで実装 | CONV-08-02 |
| リポジトリ層              | 別タスクで実装 | 後続タスク |
| GraphRAGクエリ実装        | 別タスクで実装 | 後続タスク |
| ベクトル検索統合          | 別タスクで実装 | 後続タスク |

### 2.2 意図的な制限

- FTS5仮想テーブルは対象外（chunksテーブルで実装済み）
- ベクトルインデックスは対象外（埋め込みカラムは用意するが検索は別タスク）

---

## 3. 前提条件

### 3.1 依存タスク

| タスクID   | タスク名                 | 状態     |
| ---------- | ------------------------ | -------- |
| CONV-04-01 | Drizzle ORM セットアップ | 完了必須 |

### 3.2 技術前提

- Drizzle ORM が正しくセットアップされている
- `packages/shared/src/db/schema/` ディレクトリが存在する
- `chunks` テーブルが定義されている（外部キー参照先）
- SQLite（libSQL/Turso）をターゲットDBとする

---

## 4. 制約条件

### 4.1 技術的制約

- SQLiteの制限（外部キー制約はENABLE必要）
- Drizzle ORMのSQLite用API使用
- JSON1拡張が有効であること

### 4.2 設計制約

- 既存スキーマ（chunks, files等）との整合性を維持
- 既存のパターン（UUID主キー、timestamp等）に従う
- 命名規則の一貫性（snake_case for columns, camelCase for JS）

---

## 5. リスク

| リスク               | 影響度 | 対策                       |
| -------------------- | ------ | -------------------------- |
| 外部キー循環参照     | 中     | 依存順序を明確化           |
| パフォーマンス劣化   | 中     | 適切なインデックス設計     |
| スキーマ変更の困難さ | 低     | metadataカラムで拡張性確保 |
