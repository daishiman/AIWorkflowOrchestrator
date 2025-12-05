# 移行期間パターン (SQLite)

## 概要

スコット・アンブラーの『Refactoring Databases』で提唱された「移行期間（Transition Period）」は、
破壊的なスキーマ変更を安全に行うための核心概念です。
新旧スキーマを一定期間共存させることで、段階的なアプリケーション移行とリスク最小化を実現します。

**SQLite注意**: SQLiteの制限により、一部のパターンはテーブル再作成が必要です。

## 移行期間の原則

### 1. 新旧共存期間

```
[旧スキーマ] ──────────────────────────────────────────→
                [新スキーマ]───────────────────────────→
             ↑                    ↑                    ↑
          移行開始            両方サポート          旧スキーマ削除

時間軸: ├─── 準備 ───┼──── 移行期間 ────┼── クリーンアップ ──┤
```

### 2. 4段階の移行プロセス

| 段階           | 期間目安 | 内容                               |
| -------------- | -------- | ---------------------------------- |
| 準備           | 1-2日    | 新スキーマ追加、同期機構実装       |
| 並行稼働       | 1-4週間  | 新旧両方をサポート、監視           |
| 切替           | 1日      | アプリケーションを新スキーマに移行 |
| クリーンアップ | 1-2日    | 旧スキーマ削除、インデックス最適化 |

## パターン1: カラムリネーム

### シナリオ

`users.name` → `users.full_name` に変更

### 移行手順

```sql
-- Step 1: 新カラム追加（移行開始）
ALTER TABLE users ADD COLUMN full_name TEXT;

-- Step 2: データ同期トリガー作成（SQLite版）
CREATE TRIGGER user_name_insert_sync
AFTER INSERT ON users
BEGIN
  UPDATE users SET full_name = NEW.name WHERE id = NEW.id;
END;

CREATE TRIGGER user_name_update_sync
AFTER UPDATE OF name ON users
BEGIN
  UPDATE users SET full_name = NEW.name WHERE id = NEW.id;
END;

CREATE TRIGGER user_fullname_update_sync
AFTER UPDATE OF full_name ON users
BEGIN
  UPDATE users SET name = NEW.full_name WHERE id = NEW.id;
END;

-- Step 3: 既存データ移行
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- 移行期間中: 両方のカラムが同期された状態

-- Step 4: アプリケーション切替完了後、旧カラム削除
DROP TRIGGER IF EXISTS user_name_insert_sync;
DROP TRIGGER IF EXISTS user_name_update_sync;
DROP TRIGGER IF EXISTS user_fullname_update_sync;

-- 旧カラム削除（3.35.0+の場合）
ALTER TABLE users DROP COLUMN name;

-- または、テーブル再作成（3.35.0未満）
-- CREATE TABLE users_new (...); INSERT INTO users_new SELECT ...; など
```

### チェックリスト

- [ ] 双方向同期が機能しているか
- [ ] すべてのアプリケーションが新カラムを使用しているか
- [ ] 監視で異常がないか
- [ ] 旧カラムへのアクセスがゼロになったか

## パターン2: テーブル分割

### シナリオ

`users` テーブルから `user_profiles` を分離

### 移行手順

```sql
-- 外部キーを有効化（必須）
PRAGMA foreign_keys = ON;

-- Step 1: 新テーブル作成
CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  bio TEXT,
  avatar_url TEXT,
  preferences TEXT,  -- SQLiteではJSONを TEXT として保存
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Step 2: データ移行
INSERT INTO user_profiles (user_id, bio, avatar_url, preferences)
SELECT id, bio, avatar_url, preferences FROM users;

-- Step 3: 同期トリガー（users → user_profiles）
CREATE TRIGGER sync_user_insert_to_profiles
AFTER INSERT ON users
BEGIN
  INSERT INTO user_profiles (user_id, bio, avatar_url, preferences)
  VALUES (NEW.id, NEW.bio, NEW.avatar_url, NEW.preferences)
  ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url,
    preferences = EXCLUDED.preferences,
    updated_at = datetime('now');
END;

CREATE TRIGGER sync_user_update_to_profiles
AFTER UPDATE ON users
BEGIN
  UPDATE user_profiles SET
    bio = NEW.bio,
    avatar_url = NEW.avatar_url,
    preferences = NEW.preferences,
    updated_at = datetime('now')
  WHERE user_id = NEW.id;
END;

-- 移行期間中: 両方のテーブルにデータが存在

-- Step 4: 旧カラム削除
DROP TRIGGER IF EXISTS sync_user_insert_to_profiles;
DROP TRIGGER IF EXISTS sync_user_update_to_profiles;

-- 3.35.0+の場合
ALTER TABLE users DROP COLUMN bio;
ALTER TABLE users DROP COLUMN avatar_url;
ALTER TABLE users DROP COLUMN preferences;

-- 3.35.0未満の場合はテーブル再作成が必要
```

## パターン3: 外部キー変更

### シナリオ

`orders.user_id` → `orders.customer_id` に変更（テーブル参照先も変更）

### 移行手順

**SQLite注意**: 外部キー追加にはテーブル再作成が必要ですが、
移行期間中は新カラムのみ追加し、最終段階でテーブル再作成を行います。

```sql
-- Step 1: 新カラム追加（外部キーなし）
ALTER TABLE orders ADD COLUMN customer_id TEXT;

-- Step 2: データマッピング
UPDATE orders
SET customer_id = (
  SELECT c.id FROM customers c
  JOIN users u ON c.email = u.email
  WHERE u.id = orders.user_id
);

-- Step 3: 同期トリガー
CREATE TRIGGER order_customer_insert_sync
AFTER INSERT ON orders
BEGIN
  UPDATE orders SET customer_id = (
    SELECT c.id FROM customers c
    JOIN users u ON c.email = u.email
    WHERE u.id = NEW.user_id
  )
  WHERE id = NEW.id;
END;

CREATE TRIGGER order_customer_update_sync
AFTER UPDATE OF user_id ON orders
BEGIN
  UPDATE orders SET customer_id = (
    SELECT c.id FROM customers c
    JOIN users u ON c.email = u.email
    WHERE u.id = NEW.user_id
  )
  WHERE id = NEW.id;
END;

-- Step 4: 完全移行後、テーブル再作成で外部キー追加
DROP TRIGGER IF EXISTS order_customer_insert_sync;
DROP TRIGGER IF EXISTS order_customer_update_sync;

-- テーブル再作成
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE orders_new (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  total REAL NOT NULL
  -- user_id は含めない
);

INSERT INTO orders_new SELECT id, customer_id, total FROM orders;
DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;

COMMIT;
PRAGMA foreign_keys = ON;
```

## パターン4: JSON構造変更

### シナリオ

`metadata.settings.theme` → `metadata.preferences.ui_theme` に変更

**SQLite注意**: SQLiteではJSON操作に `json_extract()`, `json_set()`, `json_remove()` を使用します。

### 移行手順

```sql
-- Step 1: 新しいパスにデータをコピー
UPDATE workflows
SET metadata = json_set(
  metadata,
  '$.preferences.ui_theme', json_extract(metadata, '$.settings.theme'),
  '$.preferences.language', json_extract(metadata, '$.settings.language')
)
WHERE json_extract(metadata, '$.settings.theme') IS NOT NULL;

-- Step 2: アプリケーションで両方のパスをサポート
-- read: COALESCE(json_extract(metadata, '$.preferences.ui_theme'),
--                json_extract(metadata, '$.settings.theme'))
-- write: 新しいパスのみ

-- Step 3: 旧パス削除
UPDATE workflows
SET metadata = json_remove(metadata, '$.settings')
WHERE json_extract(metadata, '$.preferences') IS NOT NULL;
```

## 移行期間の計画

### 期間決定の基準

| 変更の種類             | 推奨期間 | 理由               |
| ---------------------- | -------- | ------------------ |
| カラム追加（nullable） | なし     | 即座に安全         |
| カラムリネーム         | 1-2週間  | アプリ更新が必要   |
| テーブル分割           | 2-4週間  | 複数サービスの更新 |
| 外部キー変更           | 2-4週間  | データ整合性確認   |
| 型変更                 | 1-2週間  | データ変換の検証   |

### 監視項目

```yaml
移行期間中の監視:
  - 新スキーマへのアクセス率: 目標100%
  - 旧スキーマへのアクセス: 減少傾向確認
  - エラー率: 増加なし
  - パフォーマンス: 劣化なし
  - 同期トリガー実行時間: 許容範囲内
```

### クリーンアップ判断基準

- [ ] 旧スキーマへのアクセスが0になった
- [ ] すべてのアプリケーションが新スキーマを使用
- [ ] 1週間以上エラーなし
- [ ] パフォーマンス目標を達成
- [ ] バックアップが完了

## 判断基準チェックリスト

### 移行期間設計時

- [ ] 新旧スキーマの共存方法が定義されているか？
- [ ] 同期機構（トリガー/アプリロジック）が設計されているか？
- [ ] 移行期間の長さが決定されているか？
- [ ] ロールバック手順が準備されているか？

### 移行中

- [ ] 両スキーマのデータが同期されているか？
- [ ] アプリケーションの切替が進んでいるか？
- [ ] 監視でエラーがないか？

### クリーンアップ前

- [ ] 旧スキーマへのアクセスがゼロか？
- [ ] すべてのアプリケーションが更新済みか？
- [ ] バックアップが完了しているか？

## 参考文献

- **『Refactoring Databases』** Scott W. Ambler & Pramod J. Sadalage著
  - Chapter 5: Database Refactoring Strategies
  - Appendix: Database Refactoring Catalog
