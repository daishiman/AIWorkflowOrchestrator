# マイグレーション設計書 - Knowledge Graph マイグレーション

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | CONV-04-06                                 |
| 作成日   | 2026-01-13                                 |
| Phase    | 2                                          |
| 機能名   | Knowledge Graph マイグレーション生成・適用 |

---

## 1. drizzle.config.ts 確認結果

### 1.1 現在の設定

**ファイル**: `packages/shared/drizzle.config.ts`

```typescript
import { type Config } from "drizzle-kit";

export default {
  schema: "./dist/src/db/schema/*.js",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  verbose: true,
  strict: true,
} satisfies Config;
```

### 1.2 設定分析

| 設定項目 | 値                          | 分析                             |
| -------- | --------------------------- | -------------------------------- |
| schema   | `./dist/src/db/schema/*.js` | コンパイル済みJSファイルを参照   |
| out      | `./drizzle/migrations`      | マイグレーションファイルの出力先 |
| dialect  | `sqlite`                    | SQLite互換（libSQL対応）         |
| verbose  | `true`                      | 詳細ログ出力有効                 |
| strict   | `true`                      | 厳密モード有効                   |

### 1.3 重要な発見事項

1. **スキーマパターン**: `./dist/src/db/schema/*.js` はワイルドカードパターンを使用
2. **graph/ディレクトリの包含確認**:
   - `dist/src/db/schema/graph/index.js` が自動的に含まれる（`*`がサブディレクトリも含む）
   - ビルド後に `dist/` 配下にJSファイルが生成される必要あり

### 1.4 前提条件

| 条件                  | 確認方法                           | 状態   |
| --------------------- | ---------------------------------- | ------ |
| TypeScriptビルド完了  | `pnpm --filter @repo/shared build` | 必須   |
| dist/配下にJSファイル | `ls dist/src/db/schema/graph/`     | 確認要 |
| graph/index.tsの存在  | 既存ファイル確認済み               | ✅     |

---

## 2. スキーマ構造確認

### 2.1 テーブル一覧

| テーブル名         | 変数名            | 主キー                   | 外部キー依存                      |
| ------------------ | ----------------- | ------------------------ | --------------------------------- |
| entities           | entities          | id (TEXT)                | なし                              |
| relations          | graphRelations    | id (TEXT)                | entities (source_id, target_id)   |
| relation_evidence  | relationEvidence  | relation_id + chunk_id   | graphRelations, chunks            |
| communities        | communities       | id (TEXT)                | communities (parent_id, 自己参照) |
| entity_communities | entityCommunities | entity_id + community_id | entities, communities             |
| chunk_entities     | chunkEntities     | chunk_id + entity_id     | chunks, entities                  |

### 2.2 外部キー制約詳細

| テーブル           | カラム       | 参照先         | ON DELETE |
| ------------------ | ------------ | -------------- | --------- |
| relations          | source_id    | entities.id    | CASCADE   |
| relations          | target_id    | entities.id    | CASCADE   |
| relation_evidence  | relation_id  | relations.id   | CASCADE   |
| relation_evidence  | chunk_id     | chunks.id      | CASCADE   |
| communities        | parent_id    | communities.id | SET NULL  |
| entity_communities | entity_id    | entities.id    | CASCADE   |
| entity_communities | community_id | communities.id | CASCADE   |
| chunk_entities     | chunk_id     | chunks.id      | CASCADE   |
| chunk_entities     | entity_id    | entities.id    | CASCADE   |

### 2.3 外部依存テーブル

| テーブル名 | 依存元                            | 状態         |
| ---------- | --------------------------------- | ------------ |
| chunks     | relation_evidence, chunk_entities | 既存テーブル |

**注意**: `chunks` テーブルは Knowledge Graph 外部の既存テーブル。マイグレーション前に存在を確認する必要がある。

---

## 3. マイグレーション設計

### 3.1 実行手順

#### Step 1: TypeScriptビルド

```bash
# packages/shared ディレクトリでビルド実行
cd packages/shared
pnpm build
```

**目的**: drizzle.config.ts が `dist/src/db/schema/*.js` を参照するため、TypeScriptをJavaScriptにコンパイルする必要がある。

#### Step 2: マイグレーションSQL生成

```bash
# packages/shared ディレクトリで実行
pnpm drizzle-kit generate
```

**または**:

```bash
# プロジェクトルートから実行
pnpm --filter @repo/shared drizzle-kit generate
```

**出力先**: `packages/shared/drizzle/migrations/`

#### Step 3: マイグレーション適用

```bash
# 方法1: drizzle-kit push（開発環境向け、即時適用）
pnpm --filter @repo/shared drizzle-kit push

# 方法2: drizzle-kit migrate（本番環境向け、マイグレーションファイル使用）
pnpm --filter @repo/shared drizzle-kit migrate
```

**推奨**: 開発環境では `drizzle-kit push` を使用

### 3.2 コマンド実行順序

```
1. pnpm --filter @repo/shared build
           ↓
2. pnpm --filter @repo/shared drizzle-kit generate
           ↓
3. pnpm --filter @repo/shared drizzle-kit push
           ↓
4. 検証コマンド実行
```

---

## 4. 検証手順

### 4.1 テーブル存在確認

```bash
# SQLiteデータベースに接続してテーブル一覧を確認
sqlite3 <db-path> ".tables"
```

**期待される出力**（6テーブルが追加）:

```
chunk_entities     communities        entities
entity_communities relation_evidence  relations
```

### 4.2 個別テーブル構造確認

```sql
-- 各テーブルのカラム情報を確認
PRAGMA table_info(entities);
PRAGMA table_info(relations);
PRAGMA table_info(relation_evidence);
PRAGMA table_info(communities);
PRAGMA table_info(entity_communities);
PRAGMA table_info(chunk_entities);
```

### 4.3 外部キー制約確認

```sql
-- 外部キー制約が有効か確認
PRAGMA foreign_keys;
-- 期待値: 1

-- 各テーブルの外部キー一覧
PRAGMA foreign_key_list(relations);
PRAGMA foreign_key_list(relation_evidence);
PRAGMA foreign_key_list(communities);
PRAGMA foreign_key_list(entity_communities);
PRAGMA foreign_key_list(chunk_entities);
```

### 4.4 インデックス確認

```sql
-- 各テーブルのインデックス一覧
PRAGMA index_list(entities);
PRAGMA index_list(relations);
PRAGMA index_list(relation_evidence);
PRAGMA index_list(communities);
PRAGMA index_list(entity_communities);
PRAGMA index_list(chunk_entities);
```

### 4.5 検証スクリプト

```bash
#!/bin/bash
# verify-migration.sh

DB_PATH="${1:-./data/aiworkflow.db}"

echo "=== Knowledge Graph Migration Verification ==="

echo -e "\n1. Table existence check:"
sqlite3 "$DB_PATH" ".tables" | grep -E "entities|relations|communities"

echo -e "\n2. Foreign key status:"
sqlite3 "$DB_PATH" "PRAGMA foreign_keys;"

echo -e "\n3. Table count verification:"
for table in entities relations relation_evidence communities entity_communities chunk_entities; do
  count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='$table';")
  echo "  $table: $count (expected: 1)"
done

echo -e "\n=== Verification Complete ==="
```

---

## 5. ロールバック手順

### 5.1 ロールバック方針

| 状況                     | 対応                                   |
| ------------------------ | -------------------------------------- |
| マイグレーション失敗     | 自動ロールバック（トランザクション内） |
| 適用後の不具合発見       | 手動DROP TABLE実行                     |
| 本番環境でのロールバック | マイグレーションファイルの逆順実行     |

### 5.2 手動ロールバックSQL

```sql
-- 依存関係の逆順でDROP（外部キー制約考慮）
-- ⚠️ データは完全に失われる

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS relation_evidence;
DROP TABLE IF EXISTS chunk_entities;
DROP TABLE IF EXISTS entity_communities;
DROP TABLE IF EXISTS relations;
DROP TABLE IF EXISTS communities;
DROP TABLE IF EXISTS entities;

PRAGMA foreign_keys = ON;
```

### 5.3 ロールバック時の注意事項

| 注意点             | 説明                             |
| ------------------ | -------------------------------- |
| foreign_keys無効化 | DROP前に外部キー制約を一時無効化 |
| 依存順序           | 子テーブル→親テーブルの順でDROP  |
| データ損失         | ロールバック後はデータ復旧不可   |
| chunksテーブル     | 外部テーブルのためDROP対象外     |

---

## 6. 統合ポイント/契約

### 6.1 契約定義

| 統合ポイント           | 契約                                           | 検証方法             |
| ---------------------- | ---------------------------------------------- | -------------------- |
| スキーマパス           | `packages/shared/src/db/schema/graph/index.ts` | ファイル存在確認     |
| マイグレーション出力先 | `packages/shared/drizzle/migrations/`          | ディレクトリ存在確認 |
| DB接続                 | SQLite（libSQL）via Drizzle ORM                | 接続テスト           |
| 外部キー有効化         | `PRAGMA foreign_keys = ON`                     | PRAGMA確認           |

### 6.2 chunksテーブル依存

```
relation_evidence.chunk_id → chunks.id
chunk_entities.chunk_id → chunks.id
```

**契約**: `chunks` テーブルが存在し、`id` カラム（TEXT型）を持つこと

---

## 7. リスク評価と対策

| リスク               | 影響度 | 対策                                  |
| -------------------- | ------ | ------------------------------------- |
| chunksテーブル未存在 | 高     | マイグレーション前に存在確認          |
| ビルド未実行         | 中     | 手順1でビルド必須を明記               |
| 外部キー制約エラー   | 中     | PRAGMA foreign_keys確認を検証に含める |
| 既存データとの競合   | 低     | 新規テーブルのため影響なし            |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
