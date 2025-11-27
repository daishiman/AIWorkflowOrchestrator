# 移行期間パターン

## 概要

スコット・アンブラーの『Refactoring Databases』で提唱された「移行期間（Transition Period）」は、
破壊的なスキーマ変更を安全に行うための核心概念です。
新旧スキーマを一定期間共存させることで、段階的なアプリケーション移行とリスク最小化を実現します。

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

| 段階 | 期間目安 | 内容 |
|------|----------|------|
| 準備 | 1-2日 | 新スキーマ追加、同期機構実装 |
| 並行稼働 | 1-4週間 | 新旧両方をサポート、監視 |
| 切替 | 1日 | アプリケーションを新スキーマに移行 |
| クリーンアップ | 1-2日 | 旧スキーマ削除、インデックス最適化 |

## パターン1: カラムリネーム

### シナリオ
`users.name` → `users.full_name` に変更

### 移行手順

```sql
-- Step 1: 新カラム追加（移行開始）
ALTER TABLE users ADD COLUMN full_name text;

-- Step 2: データ同期トリガー作成
CREATE OR REPLACE FUNCTION sync_user_name()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- 双方向同期
    IF NEW.name IS NOT NULL AND NEW.full_name IS NULL THEN
      NEW.full_name := NEW.name;
    ELSIF NEW.full_name IS NOT NULL AND NEW.name IS NULL THEN
      NEW.name := NEW.full_name;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_name_sync
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION sync_user_name();

-- Step 3: 既存データ移行
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- 移行期間中: 両方のカラムが同期された状態

-- Step 4: アプリケーション切替完了後、旧カラム削除
DROP TRIGGER user_name_sync ON users;
DROP FUNCTION sync_user_name();
ALTER TABLE users DROP COLUMN name;
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
-- Step 1: 新テーブル作成
CREATE TABLE user_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  bio text,
  avatar_url text,
  preferences jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: データ移行
INSERT INTO user_profiles (user_id, bio, avatar_url, preferences)
SELECT id, bio, avatar_url, preferences FROM users;

-- Step 3: 同期トリガー（users → user_profiles）
CREATE OR REPLACE FUNCTION sync_to_user_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_profiles (user_id, bio, avatar_url, preferences)
    VALUES (NEW.id, NEW.bio, NEW.avatar_url, NEW.preferences)
    ON CONFLICT (user_id) DO UPDATE SET
      bio = EXCLUDED.bio,
      avatar_url = EXCLUDED.avatar_url,
      preferences = EXCLUDED.preferences,
      updated_at = now();
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE user_profiles SET
      bio = NEW.bio,
      avatar_url = NEW.avatar_url,
      preferences = NEW.preferences,
      updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_user_to_profiles
AFTER INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION sync_to_user_profiles();

-- 移行期間中: 両方のテーブルにデータが存在

-- Step 4: 旧カラム削除
DROP TRIGGER sync_user_to_profiles ON users;
DROP FUNCTION sync_to_user_profiles();
ALTER TABLE users DROP COLUMN bio;
ALTER TABLE users DROP COLUMN avatar_url;
ALTER TABLE users DROP COLUMN preferences;
```

## パターン3: 外部キー変更

### シナリオ
`orders.user_id` → `orders.customer_id` に変更（テーブル参照先も変更）

### 移行手順

```sql
-- Step 1: 新カラムと外部キー追加
ALTER TABLE orders ADD COLUMN customer_id uuid REFERENCES customers(id);

-- Step 2: データマッピング
UPDATE orders o
SET customer_id = (
  SELECT c.id FROM customers c
  JOIN users u ON c.email = u.email
  WHERE u.id = o.user_id
);

-- Step 3: 同期トリガー
CREATE OR REPLACE FUNCTION sync_order_customer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL AND NEW.customer_id IS NULL THEN
    SELECT id INTO NEW.customer_id
    FROM customers c
    JOIN users u ON c.email = u.email
    WHERE u.id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_customer_sync
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION sync_order_customer();

-- Step 4: 完全移行後
ALTER TABLE orders ALTER COLUMN customer_id SET NOT NULL;
DROP TRIGGER order_customer_sync ON orders;
ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
ALTER TABLE orders DROP COLUMN user_id;
```

## パターン4: JSONB構造変更

### シナリオ
`metadata.settings.theme` → `metadata.preferences.ui_theme` に変更

### 移行手順

```sql
-- Step 1: 新しいパスにデータをコピー
UPDATE workflows
SET metadata = jsonb_set(
  metadata,
  '{preferences}',
  jsonb_build_object(
    'ui_theme', metadata->'settings'->'theme',
    'language', metadata->'settings'->'language'
  )
)
WHERE metadata->'settings'->'theme' IS NOT NULL;

-- Step 2: アプリケーションで両方のパスをサポート
-- read: COALESCE(metadata->'preferences'->'ui_theme', metadata->'settings'->'theme')
-- write: 新しいパスのみ

-- Step 3: 旧パス削除
UPDATE workflows
SET metadata = metadata #- '{settings}'
WHERE metadata->'preferences' IS NOT NULL;
```

## 移行期間の計画

### 期間決定の基準

| 変更の種類 | 推奨期間 | 理由 |
|-----------|----------|------|
| カラム追加（nullable） | なし | 即座に安全 |
| カラムリネーム | 1-2週間 | アプリ更新が必要 |
| テーブル分割 | 2-4週間 | 複数サービスの更新 |
| 外部キー変更 | 2-4週間 | データ整合性確認 |
| 型変更 | 1-2週間 | データ変換の検証 |

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
