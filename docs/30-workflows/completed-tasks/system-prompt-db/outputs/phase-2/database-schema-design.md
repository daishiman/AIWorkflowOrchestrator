# データベーススキーマ設計書

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 機能名   | システムプロンプトのデータベース永続化 |
| 作成日   | 2026-01-22                             |
| Phase    | 2                                      |
| タスクID | TASK-CHAT-SYSPROMPT-DB-001             |

---

## 1. テーブル設計

### 1.1 system_prompt_templates テーブル

システムプロンプトテンプレートを管理するテーブル。

| カラム     | 型      | NULL | デフォルト   | 説明                       |
| ---------- | ------- | ---- | ------------ | -------------------------- |
| id         | TEXT    | NO   | UUID自動生成 | 主キー（UUID v4）          |
| user_id    | TEXT    | NO   | -            | ユーザーID（外部キー）     |
| name       | TEXT    | NO   | -            | テンプレート名（1-50文字） |
| content    | TEXT    | NO   | -            | 内容（1-4000文字）         |
| is_preset  | INTEGER | NO   | 0            | プリセットフラグ（0/1）    |
| created_at | INTEGER | NO   | 現在時刻     | 作成日時（UNIX時刻）       |
| updated_at | INTEGER | NO   | 現在時刻     | 更新日時（UNIX時刻）       |

### 1.2 Drizzle ORMスキーマ定義

```typescript
// packages/shared/src/db/schema/systemPrompt.ts

import {
  sqliteTable,
  text,
  integer,
  index,
  unique,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/**
 * システムプロンプトテンプレートテーブル
 *
 * ユーザーがカスタマイズしたシステムプロンプトテンプレートを管理する。
 * プリセットテンプレートと ユーザー作成テンプレートの両方を格納。
 */
export const systemPromptTemplates = sqliteTable(
  "system_prompt_templates",
  {
    /**
     * テンプレート一意識別子（UUID v4）
     * プリセットは固定ID（"preset-*"形式）
     */
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    /**
     * ユーザーID
     * プリセットテンプレートは "__SYSTEM__" を使用
     * カスタムテンプレートは実際のユーザーIDを使用
     */
    userId: text("user_id").notNull(),

    /**
     * テンプレート名（1〜50文字）
     * ユーザー内で一意である必要がある
     */
    name: text("name").notNull(),

    /**
     * テンプレート内容（1〜4000文字）
     * システムプロンプトとして使用されるテキスト
     */
    content: text("content").notNull(),

    /**
     * プリセットフラグ（0: false, 1: true）
     * true の場合、編集・削除不可
     */
    isPreset: integer("is_preset", { mode: "boolean" })
      .notNull()
      .default(false),

    /**
     * 作成日時（UNIX時刻、ミリ秒）
     */
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),

    /**
     * 更新日時（UNIX時刻、ミリ秒）
     */
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    // ユーザーIDでの検索最適化
    index("system_prompt_templates_user_id_idx").on(table.userId),

    // 名前での検索最適化
    index("system_prompt_templates_name_idx").on(table.name),

    // プリセットフィルタリング最適化
    index("system_prompt_templates_is_preset_idx").on(table.isPreset),

    // ユーザー内での名前一意制約
    unique("system_prompt_templates_user_name_unq").on(
      table.userId,
      table.name,
    ),
  ],
);

/**
 * テンプレートレコード型（SELECT結果）
 */
export type SystemPromptTemplateRecord =
  typeof systemPromptTemplates.$inferSelect;

/**
 * 新規テンプレートレコード型（INSERT用）
 */
export type NewSystemPromptTemplateRecord =
  typeof systemPromptTemplates.$inferInsert;
```

---

## 2. インデックス設計

### 2.1 インデックス一覧

| インデックス名                          | カラム        | 用途               |
| --------------------------------------- | ------------- | ------------------ |
| `system_prompt_templates_user_id_idx`   | user_id       | ユーザー別一覧取得 |
| `system_prompt_templates_name_idx`      | name          | 名前検索           |
| `system_prompt_templates_is_preset_idx` | is_preset     | プリセットフィルタ |
| `system_prompt_templates_user_name_unq` | user_id, name | 重複防止（UNIQUE） |

### 2.2 インデックス選定理由

| インデックス  | クエリパターン            | 選定理由                     |
| ------------- | ------------------------- | ---------------------------- |
| user_id_idx   | `WHERE user_id = ?`       | ユーザー別一覧取得が主要操作 |
| name_idx      | `WHERE name LIKE ?`       | 名前検索機能用（将来拡張）   |
| is_preset_idx | `WHERE is_preset = 1`     | プリセット一覧取得           |
| user_name_unq | `INSERT` 時の重複チェック | ビジネスルール：名前重複防止 |

---

## 3. 制約設計

### 3.1 主キー制約

- `id` カラムがPRIMARY KEY
- UUID v4形式を使用

### 3.2 外部キー制約

```sql
-- 現時点では外部キー制約は設定しない
-- 理由: プリセットテンプレートは "__SYSTEM__" ユーザーIDを使用するため
-- 将来的にusersテーブルとの連携時に追加を検討
```

### 3.3 ユニーク制約

```sql
-- ユーザー内での名前一意性
UNIQUE (user_id, name)
```

### 3.4 CHECK制約（アプリケーションレベル）

| 制約           | 条件                           | 実装レベル   |
| -------------- | ------------------------------ | ------------ |
| 名前長         | 1 <= LENGTH(name) <= 50        | Repository層 |
| 内容長         | 1 <= LENGTH(content) <= 4000   | Repository層 |
| プリセット不変 | is_preset = 1 → 更新・削除禁止 | Service層    |

---

## 4. プリセットテンプレートの初期データ

### 4.1 プリセット一覧

| id                 | name               | is_preset |
| ------------------ | ------------------ | --------- |
| preset-translation | 翻訳アシスタント   | 1         |
| preset-programming | プログラミング支援 | 1         |
| preset-writing     | ライティング支援   | 1         |

### 4.2 初期データ投入

```typescript
// packages/shared/src/db/seeds/systemPromptPresets.ts

export const PRESET_TEMPLATES = [
  {
    id: "preset-translation",
    userId: "__SYSTEM__",
    name: "翻訳アシスタント",
    content: `あなたは正確で自然な翻訳を提供するアシスタントです。

## 役割
- ユーザーから提供されたテキストを指定された言語に翻訳します
- 文脈を考慮した自然な表現を心がけます
- 専門用語は適切に訳します

## ガイドライン
- 原文の意味を正確に伝えることを最優先します
- 文化的なニュアンスも考慮します
- 不明な点があれば確認してください`,
    isPreset: true,
  },
  {
    id: "preset-programming",
    userId: "__SYSTEM__",
    name: "プログラミング支援",
    content: `あなたはプログラミングの専門家です。

## 役割
- コードの作成、レビュー、デバッグを支援します
- ベストプラクティスに基づいたアドバイスを提供します
- 分かりやすい説明を心がけます

## ガイドライン
- コードは読みやすく保守しやすいものを提案します
- セキュリティとパフォーマンスを考慮します
- 必要に応じてコメントを追加します`,
    isPreset: true,
  },
  {
    id: "preset-writing",
    userId: "__SYSTEM__",
    name: "ライティング支援",
    content: `あなたは文章作成のプロフェッショナルです。

## 役割
- 記事、レポート、メールなどの文章作成を支援します
- 文章の校正と改善提案を行います
- 読者に合わせた表現を提案します

## ガイドライン
- 明確で簡潔な文章を心がけます
- 論理的な構成を意識します
- 読み手の視点を大切にします`,
    isPreset: true,
  },
];
```

---

## 5. マイグレーションSQL

### 5.1 テーブル作成

```sql
-- packages/shared/drizzle/migrations/XXXX_system_prompt_templates.sql

CREATE TABLE IF NOT EXISTS system_prompt_templates (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_preset INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS system_prompt_templates_user_id_idx
  ON system_prompt_templates(user_id);

CREATE INDEX IF NOT EXISTS system_prompt_templates_name_idx
  ON system_prompt_templates(name);

CREATE INDEX IF NOT EXISTS system_prompt_templates_is_preset_idx
  ON system_prompt_templates(is_preset);

CREATE UNIQUE INDEX IF NOT EXISTS system_prompt_templates_user_name_unq
  ON system_prompt_templates(user_id, name);
```

### 5.2 プリセットデータ投入

```sql
-- プリセットテンプレートの挿入
INSERT OR IGNORE INTO system_prompt_templates
  (id, user_id, name, content, is_preset, created_at, updated_at)
VALUES
  ('preset-translation', '__SYSTEM__', '翻訳アシスタント', '...', 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('preset-programming', '__SYSTEM__', 'プログラミング支援', '...', 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('preset-writing', '__SYSTEM__', 'ライティング支援', '...', 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);
```

---

## 6. 既存スキーマとの整合性

### 6.1 命名規則

| 規則           | 既存例                   | 本テーブル                |
| -------------- | ------------------------ | ------------------------- |
| テーブル名     | `chat_sessions`          | `system_prompt_templates` |
| カラム名       | `snake_case`             | `snake_case`              |
| インデックス名 | `idx_{table}_{column}`   | `{table}_{column}_idx`    |
| 主キー         | `id TEXT PRIMARY KEY`    | `id TEXT PRIMARY KEY`     |
| 日時カラム     | `INTEGER (timestamp_ms)` | `INTEGER (timestamp_ms)`  |

### 6.2 型選択の一貫性

| 型             | 既存での使用             | 本テーブルでの使用         |
| -------------- | ------------------------ | -------------------------- |
| TEXT           | id, user_id, content     | id, user_id, name, content |
| INTEGER        | message_count, is_pinned | is_preset                  |
| INTEGER (時刻) | created_at (ISO8601)     | created_at (timestamp_ms)  |

> **Note**: 既存の`chat_sessions`は日時にISO8601文字列を使用しているが、
> 本テーブルではパフォーマンスを考慮してUNIX時刻（ミリ秒）を使用する。
> これはDrizzle ORMの`mode: "timestamp_ms"`で自動変換される。

---

## 7. 完了条件

- [x] テーブル定義が完了している
- [x] インデックス設計が完了している
- [x] 制約設計が完了している
- [x] プリセットデータが定義されている
- [x] マイグレーションSQLが作成されている
- [x] 既存スキーマとの整合性が確認されている

---

## 8. 関連ドキュメント

| ドキュメント         | パス                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| 既存DBスキーマ       | `.claude/skills/aiworkflow-requirements/references/database-schema.md` |
| チャット履歴スキーマ | `packages/shared/src/db/schema/chat-history.ts`                        |
| 機能要件定義書       | `outputs/phase-1/requirements-functional.md`                           |
