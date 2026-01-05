# Turso統一アーキテクチャ データベース設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## データベース統一アーキテクチャ

### 採用技術と選定理由

| 技術               | 役割           | 選定理由                                                                |
| ------------------ | -------------- | ----------------------------------------------------------------------- |
| **Turso**          | クラウドDB     | SQLite互換のエッジDB、グローバル分散対応、寛大な無料枠                  |
| **libSQL**         | 基盤技術       | SQLiteのOSSフォーク、ローカルファイルとクラウド接続の両方に対応         |
| **@libsql/client** | 接続ライブラリ | Embedded Replicas対応、オフラインファースト設計が可能                   |
| **Drizzle ORM**    | ORM            | 型安全なクエリ、軽量、SQLライク構文で学習コスト低、マイグレーション機能 |

### アーキテクチャ概要

```
アプリケーション層
├── Next.js Web App（バックエンドAPI）
├── Electron Desktop App
└── CLI Tools

↓ すべて同一のDrizzle ORMスキーマを使用

Drizzle ORM Layer
├── 型安全なクエリビルダー
├── 統一スキーマ定義（packages/shared/infrastructure/db/）
└── マイグレーション管理

↓

libSQL Client
├── ローカルモード: file://local.db（オフライン動作）
└── クラウドモード: libsql://xxx.turso.io（オンライン同期）

↓ Embedded Replicas で自動同期

Turso Cloud DB（本番環境）
```

### 設計原則

1. **スキーマ統一**: Web/Desktop/CLIすべてで同一のスキーマ定義を使用する
2. **オフラインファースト**: ElectronアプリはローカルファイルDBで動作し、オンライン時に同期
3. **型安全性**: Drizzle ORMの型推論を最大限活用し、ランタイムエラーを防ぐ
4. **段階的拡張**: 最小限のテーブルから始め、必要に応じて追加する

---

## 環境別接続設定

### 接続URL形式

| 環境                       | 接続URL形式                  | 認証           | 用途               |
| -------------------------- | ---------------------------- | -------------- | ------------------ |
| ローカル開発（ファイル）   | `file:./data/local.db`       | 不要           | 高速な開発サイクル |
| ローカル開発（Turso接続）  | `libsql://db-name.turso.io`  | AUTH_TOKEN必要 | 本番相当の動作確認 |
| デスクトップアプリ         | `file:${appDataPath}/app.db` | 不要           | オフライン動作     |
| バックエンドAPI（Railway） | `libsql://db-name.turso.io`  | AUTH_TOKEN必要 | 本番環境           |

### 環境変数

| 変数名               | 必須 | 説明                                            |
| -------------------- | ---- | ----------------------------------------------- |
| `TURSO_DATABASE_URL` | Yes  | データベース接続URL                             |
| `TURSO_AUTH_TOKEN`   | ※    | 認証トークン（※ローカルファイルモードでは不要） |
| `LOCAL_DB_PATH`      | No   | ローカル開発時のDBファイルパス（オプション）    |

### 接続クライアント実装時の注意点

- 接続URLが`file:`で始まる場合は認証トークンを渡さない
- 本番環境では必ず環境変数からURLとトークンを取得する
- 接続エラー時のリトライ処理を実装する（最大3回、指数バックオフ）
- クライアントはシングルトンパターンで管理し、不要な接続を避ける

---

## スキーマ設計

### ディレクトリ構成

```
packages/shared/
├── src/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── index.ts          # スキーマエントリーポイント（全テーブルをre-export）✅ 実装済み
│   │   │   └── chat-history.ts   # チャット履歴スキーマ（chat_sessions, chat_messages）✅ 実装済み
│   │   ├── env.ts                # 環境変数管理（Zod検証）✅ 実装済み
│   │   ├── migrate.ts            # マイグレーション実行スクリプト ✅ 実装済み
│   │   ├── utils.ts              # データベースユーティリティ関数 ✅ 実装済み
│   │   └── index.ts              # データベースクライアントエクスポート ✅ 実装済み
│   ├── repositories/                         # チャット履歴用Repository
│   │   ├── chat-session-repository.ts        # セッションリポジトリ
│   │   └── chat-message-repository.ts        # メッセージリポジトリ
│   ├── db/
│   │   ├── repositories/                     # RAG用Repository（Result型パターン）
│   │   │   ├── index.ts                      # ファクトリ関数・エクスポート
│   │   │   ├── base.repository.ts            # 基底Repository（CRUD抽象化）
│   │   │   ├── file.repository.ts            # FileRepository
│   │   │   ├── chunk.repository.ts           # ChunkRepository
│   │   │   ├── entity.repository.ts          # EntityRepository
│   │   │   └── __tests__/                    # 単体テスト
│   ├── features/
│   │   └── chat-history/
│   │       ├── chat-history-service.ts # チャット履歴サービス
│   │       ├── constants.ts            # 定数定義
│   │       └── date-formatter.ts       # 日付フォーマッタ
│   ├── types/
│   │   ├── chat-session.ts       # セッション型定義
│   │   ├── chat-message.ts       # メッセージ型定義
│   │   └── llm-metadata.ts       # LLMメタデータ型定義
│   └── ipc/
│       └── channels.ts           # IPCチャネル定義
├── drizzle/
│   └── migrations/
│       ├── 0000_complete_rictor.sql      # 初期マイグレーション
│       ├── 0001_nice_unicorn.sql         # チャット履歴テーブル + インデックス ✅ 生成済み
│       └── meta/
│           ├── _journal.json             # マイグレーション履歴
│           ├── 0000_snapshot.json        # スナップショット（初期）
│           └── 0001_snapshot.json        # スナップショット（チャット履歴）
└── drizzle.config.ts             # Drizzle設定 ✅ 実装済み
```

### Drizzle ORM基盤モジュール

データベース操作の基盤となるモジュール群の実装詳細。

#### env.ts - 環境変数管理

**目的**: データベース接続に必要な環境変数の取得とバリデーション

**主要機能**:

| 関数名                  | 説明                                       | 戻り値            |
| ----------------------- | ------------------------------------------ | ----------------- |
| `getDatabaseEnv()`      | 環境変数を取得し、Zodスキーマで検証        | `DatabaseEnv`     |
| `getDatabaseUrl()`      | 接続URL取得（TURSO_DATABASE_URL優先）      | `string`          |
| `isCloudMode()`         | クラウドモード判定（libsql://で始まるURL） | `boolean`         |
| `validateDatabaseEnv()` | 環境変数の妥当性検証                       | `SafeParseResult` |

**Zodスキーマ定義**:

```typescript
export const databaseEnvSchema = z
  .object({
    TURSO_DATABASE_URL: z.string().optional(),
    TURSO_AUTH_TOKEN: z.string().optional(),
    LOCAL_DB_PATH: z.string().optional(),
    DATABASE_MODE: z.enum(["local", "cloud"]).optional().default("local"),
  })
  .refine(
    (data) => {
      // クラウドモードの場合、AUTH_TOKENが必須
      if (data.DATABASE_MODE === "cloud") {
        return !!data.TURSO_AUTH_TOKEN;
      }
      if (data.TURSO_DATABASE_URL?.startsWith("libsql://")) {
        return !!data.TURSO_AUTH_TOKEN;
      }
      return true;
    },
    {
      message: "TURSO_AUTH_TOKEN is required for cloud mode",
      path: ["TURSO_AUTH_TOKEN"],
    },
  );
```

**実装状況**: ✅ 完了（T-04-1）

#### migrate.ts - マイグレーション実行

**目的**: Drizzle Kitで生成されたマイグレーションファイルの実行

**主要機能**:

| 関数名            | 説明                                      | 戻り値          |
| ----------------- | ----------------------------------------- | --------------- |
| `runMigrations()` | マイグレーションフォルダ内のSQLを順次実行 | `Promise<void>` |

**実装例**:

```typescript
export async function runMigrations(): Promise<void> {
  const libsqlClient = initializeClient();
  const db = drizzle(libsqlClient);

  try {
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}
```

**マイグレーションフォルダパス**: `packages/shared/drizzle/migrations/`

**実装状況**: ✅ 完了（T-04-1）

#### utils.ts - ユーティリティ関数

**目的**: データベース操作の共通ユーティリティ提供

**主要機能**:

| 関数名               | 説明                                   | 戻り値             |
| -------------------- | -------------------------------------- | ------------------ |
| `initializeClient()` | libSQLクライアントの初期化             | `Client`           |
| `getConnectionUrl()` | 環境に応じた接続URL取得                | `string`           |
| `isOnline()`         | ネットワーク接続状態の確認（将来実装） | `Promise<boolean>` |

**クライアント初期化ロジック**:

- ローカルモード (`file:`): 認証トークン不要
- クラウドモード (`libsql://`): 認証トークン必須
- エラー時の自動リトライ（最大3回、指数バックオフ）

**実装状況**: ✅ 完了（T-04-1）

#### index.ts - データベースクライアントエクスポート

**目的**: データベースクライアントとスキーマの一元管理

**エクスポート内容**:

```typescript
// クライアント
export { db } from "./client";

// スキーマ
export * from "./schema";

// ユーティリティ
export { initializeClient, getConnectionUrl } from "./utils";
export { runMigrations } from "./migrate";
export { getDatabaseEnv, getDatabaseUrl, isCloudMode } from "./env";
```

**使用例**:

```typescript
import { db, chatSessions, chatMessages } from "@repo/shared/db";

// クエリ実行
const sessions = await db.select().from(chatSessions);
```

**実装状況**: ✅ 完了（T-04-1）

#### drizzle.config.ts - Drizzle Kit設定

**目的**: マイグレーション生成とDrizzle Studioの設定

**設定内容**:

| 設定項目  | 値                          | 説明                         |
| --------- | --------------------------- | ---------------------------- |
| `schema`  | `./dist/src/db/schema/*.js` | コンパイル後のスキーマパス   |
| `out`     | `./drizzle/migrations`      | マイグレーション出力先       |
| `dialect` | `sqlite`                    | データベース方言             |
| `verbose` | `true`                      | 詳細ログ出力                 |
| `strict`  | `true`                      | 厳密モード（型チェック強化） |

**関連npmスクリプト**:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "tsx src/db/migrate.ts",
  "db:studio": "drizzle-kit studio"
}
```

**実装状況**: ✅ 完了（T-04-10）

### テーブル設計

#### workflows（ワークフロー定義）

| カラム      | 型   | NULL | 説明                                 |
| ----------- | ---- | ---- | ------------------------------------ |
| id          | TEXT | NO   | UUID主キー                           |
| name        | TEXT | NO   | ワークフロー名                       |
| description | TEXT | YES  | 説明文                               |
| config      | JSON | NO   | トリガー設定、変数などの構造化データ |
| status      | TEXT | NO   | draft / active / paused / archived   |
| created_at  | TEXT | NO   | 作成日時（ISO8601形式）              |
| updated_at  | TEXT | NO   | 更新日時（ISO8601形式）              |
| deleted_at  | TEXT | YES  | 削除日時（ソフトデリート用）         |

**設計上の注意点**:

- `config`カラムはJSON型で柔軟なスキーマを許容するが、Zodスキーマでランタイムバリデーションを行う
- `status`はENUM相当だがSQLiteではTEXT型で定義し、アプリケーション層で制約をかける
- ソフトデリートを採用し、`deleted_at`がNULLでないレコードは論理削除済みとして扱う

#### workflow_steps（ワークフローステップ）

| カラム      | 型      | NULL | 説明                                                |
| ----------- | ------- | ---- | --------------------------------------------------- |
| id          | TEXT    | NO   | UUID主キー                                          |
| workflow_id | TEXT    | NO   | 親ワークフローへの外部キー（CASCADE DELETE）        |
| name        | TEXT    | NO   | ステップ名                                          |
| type        | TEXT    | NO   | agent_task / approval / condition / loop / parallel |
| order       | INTEGER | NO   | 実行順序（1から連番）                               |
| config      | JSON    | NO   | ステップ固有の設定                                  |
| created_at  | TEXT    | NO   | 作成日時                                            |

**設計上の注意点**:

- `workflow_id`には`ON DELETE CASCADE`を設定し、親削除時に子も削除される
- `order`カラムで実行順序を管理し、並列実行時は同一orderを許容するか検討

#### workflow_executions（実行履歴）

| カラム       | 型   | NULL | 説明                                               |
| ------------ | ---- | ---- | -------------------------------------------------- |
| id           | TEXT | NO   | UUID主キー                                         |
| workflow_id  | TEXT | NO   | 実行したワークフローへの外部キー                   |
| status       | TEXT | NO   | pending / running / completed / failed / cancelled |
| started_at   | TEXT | NO   | 実行開始日時                                       |
| completed_at | TEXT | YES  | 実行完了日時                                       |
| result       | JSON | YES  | 実行結果（output または error）                    |
| context      | JSON | NO   | 実行時のコンテキスト情報                           |

#### user_settings（ユーザー設定）

| カラム      | 型   | NULL | 説明                                   |
| ----------- | ---- | ---- | -------------------------------------- |
| id          | TEXT | NO   | UUID主キー                             |
| user_id     | TEXT | NO   | 外部認証システムのユーザーID（UNIQUE） |
| preferences | JSON | NO   | テーマ、通知設定、言語などの設定       |
| created_at  | TEXT | NO   | 作成日時                               |
| updated_at  | TEXT | NO   | 更新日時                               |

#### user_profiles（ユーザープロフィール - Supabase）

Supabase Auth と連携するユーザープロフィールテーブル。

| カラム                | 型   | NULL | 説明                                   |
| --------------------- | ---- | ---- | -------------------------------------- |
| id                    | TEXT | NO   | UUID主キー（auth.users.id と同一）     |
| display_name          | TEXT | NO   | 表示名（3-30文字）                     |
| email                 | TEXT | NO   | メールアドレス                         |
| avatar_url            | TEXT | YES  | アバター画像URL                        |
| plan                  | TEXT | NO   | プラン（free/pro/enterprise）          |
| timezone              | TEXT | YES  | タイムゾーン（デフォルト: Asia/Tokyo） |
| locale                | TEXT | YES  | ロケール（デフォルト: ja）             |
| notification_settings | JSON | YES  | 通知設定（下記参照）                   |
| preferences           | JSON | YES  | ユーザー設定（拡張用）                 |
| created_at            | TEXT | NO   | 作成日時（ISO8601形式）                |
| updated_at            | TEXT | NO   | 更新日時（ISO8601形式）                |
| deleted_at            | TEXT | YES  | 削除日時（ソフトデリート用）           |

**notification_settings の構造**:

```json
{
  "email": true,
  "desktop": true,
  "sound": true,
  "workflowComplete": true,
  "workflowError": true
}
```

**マイグレーション**:

- 基本テーブル: `supabase/migrations/001_create_user_profiles.sql`
- 拡張カラム: `supabase/migrations/003_extend_user_profiles.sql`

**フォールバック設計**:

マイグレーション003が未適用の環境では、通知設定は `auth.users.user_metadata` に保存される。
アプリケーションは以下の優先順位でデータを取得する：

1. `user_profiles.notification_settings` カラム（存在する場合）
2. `auth.users.user_metadata.notification_settings`（フォールバック）
3. デフォルト値（全て有効）

**Supabase RLS ポリシー**:

- SELECT: `auth.uid() = id` （自分のプロフィールのみ閲覧可能）
- UPDATE: `auth.uid() = id` （自分のプロフィールのみ更新可能）
- INSERT: `auth.uid() = id` （認証トリガーで自動作成）

**データ同期設計**:

`user_profiles`（Primary Source of Truth）と`user_metadata`（Supabase Auth）は双方向同期される：

| 操作                         | Primary → Secondary           | Secondary → Primary           |
| ---------------------------- | ----------------------------- | ----------------------------- |
| profile:update               | user_profiles → user_metadata | -                             |
| profile:update-notifications | user_profiles → user_metadata | -                             |
| avatar:upload                | -                             | user_metadata → user_profiles |
| avatar:use-provider          | -                             | user_metadata → user_profiles |
| avatar:remove                | -                             | user_metadata → user_profiles |

同期ユーティリティ: `apps/desktop/src/main/infrastructure/profileSync.ts`

**ソフトデリート設計**:

- `deleted_at`がNULLでないレコードは論理削除済みとして扱う
- アカウント削除時は`deleted_at`にタイムスタンプを設定
- 物理削除は管理者の手動操作でのみ実行

**設計上の注意点**:

- `id` は Supabase `auth.users` テーブルの `id` と同一（外部キー参照）
- プロフィール作成は認証時のトリガーで自動実行
- `display_name` は 3-30文字、HTMLタグ不許可
- `avatar_url` は https:// のみ許可（セキュリティ要件）
- `timezone` / `locale` は将来実装予定（現在は日本固定）

#### avatars（Storage バケット - Supabase Storage）

ユーザーがアップロードしたアバター画像を保存するStorageバケット。

| 設定項目     | 値                                   |
| ------------ | ------------------------------------ |
| バケット名   | `avatars`                            |
| 公開設定     | public（全員が閲覧可能）             |
| フォルダ構造 | `{user_id}/avatar-{timestamp}.{ext}` |
| 対応形式     | jpg, jpeg, png, gif, webp            |
| 最大ファイル | 5MB                                  |

**Storage RLS ポリシー**:

- INSERT: `auth.uid()::text = (storage.foldername(name))[1]` （自分のフォルダにのみアップロード可能）
- SELECT: `bucket_id = 'avatars'` （全員が閲覧可能）
- UPDATE: `auth.uid()::text = (storage.foldername(name))[1]` （自分のアバターのみ更新可能）
- DELETE: `auth.uid()::text = (storage.foldername(name))[1]` （自分のアバターのみ削除可能）

**アバター管理の動作**:

| 操作               | Storageの動作                  |
| ------------------ | ------------------------------ |
| 新規アップロード   | 古いアバターを削除 → 新規追加  |
| プロバイダーに切替 | アップロード済みアバターを削除 |
| アバター削除       | アップロード済みアバターを削除 |

※ 容量節約のため、アバター切り替え時に古いファイルは自動削除される

**マイグレーションファイル**: `supabase/migrations/002_create_avatars_storage.sql`

#### api_keys（APIキー管理）

| カラム       | 型   | NULL | 説明                                |
| ------------ | ---- | ---- | ----------------------------------- |
| id           | TEXT | NO   | UUID主キー                          |
| user_id      | TEXT | NO   | user_settingsへの外部キー           |
| name         | TEXT | NO   | キーの用途識別名                    |
| key_hash     | TEXT | NO   | 暗号化されたAPIキー                 |
| service      | TEXT | NO   | anthropic / openai / google / other |
| scopes       | JSON | NO   | 権限スコープ配列                    |
| expires_at   | TEXT | YES  | 有効期限                            |
| last_used_at | TEXT | YES  | 最終使用日時                        |
| revoked_at   | TEXT | YES  | 無効化日時                          |
| created_at   | TEXT | NO   | 作成日時                            |

**セキュリティ上の注意点**:

- 平文のAPIキーは絶対に保存しない
- AES-256-GCMなどの認証付き暗号化を使用する
- 暗号化キーは環境変数で管理し、コードにハードコードしない
- IV（初期化ベクトル）とAuth Tagも一緒に保存する

#### audit_logs（監査ログ）

| カラム      | 型   | NULL | 説明                                  |
| ----------- | ---- | ---- | ------------------------------------- |
| id          | TEXT | NO   | UUID主キー                            |
| event_type  | TEXT | NO   | workflow.created, apikey.revoked など |
| entity_type | TEXT | NO   | 対象エンティティの種類                |
| entity_id   | TEXT | NO   | 対象エンティティのID                  |
| user_id     | TEXT | YES  | 操作者のユーザーID                    |
| ip_address  | TEXT | YES  | リクエスト元IPアドレス                |
| user_agent  | TEXT | YES  | ユーザーエージェント                  |
| changes     | JSON | YES  | 変更前後のデータ（diff形式）          |
| metadata    | JSON | YES  | 追加のメタデータ                      |
| timestamp   | TEXT | NO   | イベント発生日時                      |

**設計上の注意点**:

- 監査ログは原則として削除しない（保持期間ポリシーを別途定める）
- 改ざん検知が必要な場合はハッシュチェーンの導入を検討
- 個人情報を含む場合はマスキング処理を行う

#### sync_metadata（同期メタデータ）

| カラム              | 型   | NULL | 説明                                            |
| ------------------- | ---- | ---- | ----------------------------------------------- |
| id                  | TEXT | NO   | UUID主キー                                      |
| table_name          | TEXT | NO   | 同期対象テーブル名                              |
| last_sync_at        | TEXT | YES  | 最終同期日時                                    |
| direction           | TEXT | NO   | bidirectional / cloud_to_local / local_to_cloud |
| status              | TEXT | NO   | idle / syncing / conflict / error               |
| conflict_resolution | TEXT | NO   | last_write_wins / manual / merge                |
| last_error          | TEXT | YES  | 最後に発生したエラーメッセージ                  |

#### chat_sessions（チャットセッション）

ユーザーとAIアシスタント間の会話セッションを管理する。

| カラム               | 型      | NULL | 説明                                       |
| -------------------- | ------- | ---- | ------------------------------------------ |
| id                   | TEXT    | NO   | UUID主キー（v4）                           |
| user_id              | TEXT    | NO   | ユーザーID（将来の認証機能との連携用）     |
| title                | TEXT    | NO   | セッションタイトル（3〜100文字）           |
| created_at           | TEXT    | NO   | 作成日時（ISO 8601形式、UTC）              |
| updated_at           | TEXT    | NO   | 最終更新日時（ISO 8601形式、UTC）          |
| message_count        | INTEGER | NO   | メッセージ総数（非正規化フィールド）       |
| is_favorite          | INTEGER | NO   | お気に入りフラグ（0: false, 1: true）      |
| is_pinned            | INTEGER | NO   | ピン留めフラグ（0: false, 1: true）        |
| pin_order            | INTEGER | YES  | ピン留め時の表示順序（1〜10）              |
| last_message_preview | TEXT    | YES  | 最終メッセージのプレビュー（最大50文字）   |
| metadata             | JSON    | NO   | 拡張メタデータ（将来の拡張用）             |
| deleted_at           | TEXT    | YES  | 削除日時（ソフトデリート用、ISO 8601形式） |

**設計上の注意点**:

- `is_favorite`, `is_pinned` はSQLiteがBOOLEAN型をネイティブサポートしないため INTEGER を使用
- ピン留めは最大10件まで（ビジネスルール制約）
- `message_count`, `last_message_preview` は検索・表示最適化のための非正規化フィールド
- ソフトデリートを採用し、`deleted_at`がNULLでないレコードは論理削除済みとして扱う

#### chat_messages（チャットメッセージ）

セッション内の個別の発言（ユーザーまたはアシスタント）を管理する。

| カラム        | 型      | NULL | 説明                                                                          |
| ------------- | ------- | ---- | ----------------------------------------------------------------------------- |
| id            | TEXT    | NO   | UUID主キー（v4）                                                              |
| session_id    | TEXT    | NO   | 親セッションID（外部キー: ON DELETE CASCADE）                                 |
| role          | TEXT    | NO   | メッセージロール（user / assistant）                                          |
| content       | TEXT    | NO   | メッセージ本文（1〜100,000文字）                                              |
| message_index | INTEGER | NO   | セッション内の順序（0から連番）                                               |
| timestamp     | TEXT    | NO   | メッセージ送信日時（ISO 8601形式、UTC）                                       |
| llm_provider  | TEXT    | YES  | **LLMプロバイダー名（Phase 9で実装済み: openai / anthropic / google / xai）** |
| llm_model     | TEXT    | YES  | **LLMモデル名（Phase 9で実装済み、例: gpt-5.2-instant, claude-sonnet-4.5）**  |
| llm_metadata  | JSON    | YES  | トークン使用量、応答時間、モデルパラメータ等                                  |
| attachments   | JSON    | NO   | 添付ファイル情報（JSON配列形式）                                              |
| system_prompt | TEXT    | YES  | **システムプロンプト（Phase 9で実装済み、AI振る舞いカスタマイズ用）**         |
| metadata      | JSON    | NO   | 拡張メタデータ（将来の拡張用）                                                |

**llm_metadata の構造**:

```json
{
  "version": "20241022",
  "temperature": 0.7,
  "maxTokens": 4096,
  "tokenUsage": {
    "inputTokens": 45,
    "outputTokens": 320,
    "totalTokens": 365
  },
  "responseTimeMs": 1234
}
```

**設計上の注意点**:

- `session_id`には`ON DELETE CASCADE`を設定し、親セッション削除時にメッセージも削除
- `UNIQUE(session_id, message_index)` で一意性を保証
- `llm_provider`, `llm_model`, `llm_metadata` はアシスタント応答のみで使用
- `attachments` は将来のファイル添付機能に対応

**参照ドキュメント**:

- スキーマ実装: `packages/shared/src/db/schema/chat-history.ts` ✅
- データベース基盤モジュール:
  - 環境変数管理: `packages/shared/src/db/env.ts` ✅
  - マイグレーション実行: `packages/shared/src/db/migrate.ts` ✅
  - ユーティリティ: `packages/shared/src/db/utils.ts` ✅
  - クライアントエクスポート: `packages/shared/src/db/index.ts` ✅
- マイグレーション: `packages/shared/drizzle/migrations/0001_nice_unicorn.sql` ✅
- Drizzle設定: `packages/shared/drizzle.config.ts` ✅
- 詳細設計: `docs/30-workflows/rag-pipeline/conv-04-01-table-schema-design.md` ✅
- インデックス戦略: `docs/30-workflows/rag-pipeline/conv-04-01-index-strategy-design.md` ✅
- 設計レビュー: `docs/30-workflows/rag-pipeline/conv-07-02-p0-improvement-review.md` ✅
- 手動テスト結果: `docs/30-workflows/rag-pipeline/conv-08-01-manual-test-results.md` ✅

#### files（RAGファイルメタデータ）

RAGパイプラインに投入されるファイルのメタデータを管理する。

| カラム        | 型      | NULL | 説明                                                 |
| ------------- | ------- | ---- | ---------------------------------------------------- |
| id            | TEXT    | NO   | 主キー（ULID形式を推奨）                             |
| name          | TEXT    | NO   | ファイル名（拡張子を含む）                           |
| path          | TEXT    | NO   | ファイルの絶対パス                                   |
| mime_type     | TEXT    | NO   | MIMEタイプ（例: "text/markdown", "application/pdf"） |
| category      | TEXT    | NO   | ファイルカテゴリ（例: "document", "code", "data"）   |
| size          | INTEGER | NO   | ファイルサイズ（バイト単位）                         |
| hash          | TEXT    | NO   | SHA-256ハッシュ値（重複排除に使用）                  |
| encoding      | TEXT    | NO   | 文字エンコーディング（デフォルト: "utf-8"）          |
| last_modified | INTEGER | NO   | ファイルシステム上の最終更新日時                     |
| metadata      | JSON    | NO   | カスタムメタデータ（デフォルト: "{}"）               |
| created_at    | INTEGER | NO   | レコード作成日時（UNIX時刻）                         |
| updated_at    | INTEGER | NO   | レコード更新日時（UNIX時刻）                         |
| deleted_at    | INTEGER | YES  | 論理削除日時（ソフトデリート用）                     |

**設計上の注意点**:

- `hash`カラムで重複ファイルを検出し、同一ファイルの再登録を防止
- ソフトデリート対応により、削除されたファイルも履歴として保持可能
- 1つのファイルは複数のチャンク（chunksテーブル）を持つ（1:N関係）

#### chunks（RAGチャンク + FTS5全文検索）

ファイルを分割したチャンクを管理し、FTS5による全文検索を提供する。

| カラム             | 型      | NULL | 説明                                               |
| ------------------ | ------- | ---- | -------------------------------------------------- |
| id                 | TEXT    | NO   | UUID主キー                                         |
| file_id            | TEXT    | NO   | 親ファイルID（外部キー: ON DELETE CASCADE）        |
| content            | TEXT    | NO   | チャンク本文（FTS5インデックスに同期）             |
| contextual_content | TEXT    | YES  | コンテキスト付きテキスト（親見出し等を含む）       |
| chunk_index        | INTEGER | NO   | ファイル内のチャンク順序（0始まり）                |
| start_line         | INTEGER | YES  | 開始行番号（1始まり）                              |
| end_line           | INTEGER | YES  | 終了行番号                                         |
| start_char         | INTEGER | YES  | 開始文字位置（バイトオフセット、0始まり）          |
| end_char           | INTEGER | YES  | 終了文字位置                                       |
| parent_header      | TEXT    | YES  | 親見出しテキスト（Markdown階層構造）               |
| strategy           | TEXT    | NO   | チャンキング戦略（fixed_size/semantic/sentence等） |
| token_count        | INTEGER | YES  | トークン数（OpenAI tiktoken cl100k_base基準）      |
| hash               | TEXT    | NO   | SHA-256ハッシュ（重複検出用、UNIQUE制約）          |
| prev_chunk_id      | TEXT    | YES  | 前のチャンクID（自己参照外部キー）                 |
| next_chunk_id      | TEXT    | YES  | 次のチャンクID（自己参照外部キー）                 |
| overlap_tokens     | INTEGER | NO   | オーバーラップトークン数（デフォルト: 0）          |
| metadata           | JSON    | YES  | 拡張メタデータ（言語、関数名、重要度など）         |
| created_at         | INTEGER | NO   | 作成日時（UNIX時刻）                               |
| updated_at         | INTEGER | NO   | 更新日時（UNIX時刻）                               |

**設計上の注意点**:

- `file_id`には`ON DELETE CASCADE`を設定し、親ファイル削除時にチャンクも自動削除
- FTS5仮想テーブル（`chunks_fts`）とトリガーにより全文検索インデックスと自動同期
- `token_count`は意図的非正規化（tiktoken計算コスト削減のため）
- チャンク間の連続性を`prev_chunk_id`/`next_chunk_id`で管理

**FTS5全文検索**:

| 機能           | 説明                                               |
| -------------- | -------------------------------------------------- |
| 仮想テーブル   | `chunks_fts` - External Content Tableパターン      |
| トークナイザー | `unicode61 remove_diacritics 2` - 日本語/英語対応  |
| スコアリング   | BM25 + Sigmoid正規化（0-1スケール）                |
| 検索モード     | キーワード検索、フレーズ検索、NEAR検索（近接検索） |
| 同期方式       | INSERT/UPDATE/DELETEトリガーによる自動同期         |

**参照ドキュメント**:

- スキーマ実装:
  - `packages/shared/src/db/schema/files.ts` ✅
  - `packages/shared/src/db/schema/chunks.ts` ✅
  - `packages/shared/src/db/schema/chunks-fts.ts` ✅
- 検索クエリ: `packages/shared/src/db/queries/chunks-search.ts` ✅
- マイグレーション:
  - `packages/shared/drizzle/migrations/0002_short_norrin_radd.sql` ✅ (files/conversions/extractedMetadata)
  - `packages/shared/drizzle/migrations/0003_create_chunks_fts.sql` ✅ (chunks + FTS5)
- 詳細設計: `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md` ✅
- テスト結果: `docs/30-workflows/rag-conversion-system/manual-test-report-chunks-fts5.md` ✅
- 最終レビュー: `docs/30-workflows/rag-conversion-system/final-review-chunks-fts5.md` ✅

### インデックス設計

| テーブル            | インデックス名                      | カラム                        | 用途                                   |
| ------------------- | ----------------------------------- | ----------------------------- | -------------------------------------- |
| workflows           | idx_workflows_status                | status                        | ステータス検索                         |
| workflows           | idx_workflows_deleted_at            | deleted_at                    | アクティブレコード取得                 |
| workflows           | idx_workflows_status_deleted        | status, deleted_at            | 複合検索の高速化                       |
| workflow_steps      | idx_steps_workflow_id               | workflow_id                   | 親子関係の取得                         |
| workflow_steps      | idx_steps_order                     | workflow_id, order            | 順序通りの取得                         |
| workflow_executions | idx_executions_workflow_id          | workflow_id                   | 履歴検索                               |
| workflow_executions | idx_executions_status               | status                        | 実行中/失敗の検索                      |
| workflow_executions | idx_executions_started_at           | started_at                    | 時系列ソート                           |
| user_profiles       | idx_profiles_deleted_at             | deleted_at                    | 有効ユーザー取得                       |
| api_keys            | idx_api_keys_user_id                | user_id                       | ユーザー別キー取得                     |
| audit_logs          | idx_audit_event_type                | event_type                    | イベント種別検索                       |
| audit_logs          | idx_audit_entity                    | entity_type, entity_id        | エンティティ別履歴                     |
| audit_logs          | idx_audit_timestamp                 | timestamp                     | 時系列検索                             |
| chat_sessions       | idx_chat_sessions_user_id           | user_id                       | ユーザー別セッション取得               |
| chat_sessions       | idx_chat_sessions_created_at        | created_at                    | 作成日時降順ソート                     |
| chat_sessions       | idx_chat_sessions_is_pinned         | user_id, is_pinned, pin_order | ピン留めセッション取得                 |
| chat_sessions       | idx_chat_sessions_deleted_at        | deleted_at                    | 有効セッション取得                     |
| chat_messages       | idx_chat_messages_session_id        | session_id                    | セッション別メッセージ取得             |
| chat_messages       | idx_chat_messages_timestamp         | timestamp                     | 時系列検索                             |
| chat_messages       | idx_chat_messages_role              | role                          | ロール別フィルタリング                 |
| chat_messages       | idx_chat_messages_session_timestamp | session_id, timestamp         | カバリングインデックス（日時降順取得） |
| chat_messages       | idx_chat_messages_session_message   | session_id, message_index     | メッセージ順序の一意性保証（UNIQUE）   |
| files               | files_hash_idx                      | hash                          | 重複ファイル検出（UNIQUE）             |
| files               | files_path_idx                      | path                          | ファイルパス検索                       |
| files               | files_mime_type_idx                 | mime_type                     | MIMEタイプ別フィルタリング             |
| files               | files_category_idx                  | category                      | カテゴリ別ファイル一覧取得             |
| files               | files_created_at_idx                | created_at                    | 時系列ソート                           |
| chunks              | idx_chunks_file_id                  | file_id                       | ファイル単位の全チャンク取得           |
| chunks              | idx_chunks_hash                     | hash                          | 重複チャンク検出（UNIQUE）             |
| chunks              | idx_chunks_chunk_index              | file_id, chunk_index          | ファイル内の順序付きチャンク取得       |
| chunks              | idx_chunks_strategy                 | strategy                      | 戦略別チャンク統計                     |
| entities            | entities_normalized_name_idx        | normalized_name               | エンティティ名検索                     |
| entities            | entities_type_idx                   | type                          | タイプ別フィルタリング                 |
| entities            | entities_importance_idx             | importance                    | 重要度順ソート                         |
| entities            | entities_name_type_idx              | normalized_name, type         | 正規化名+タイプ一意性保証（UNIQUE）    |

---

## Knowledge Graph テーブル

### entities（エンティティ / Knowledge Graphノード）

Knowledge Graphのノード（エンティティ）を管理するテーブル。

| カラム             | 型      | NULL | 説明                                               |
| ------------------ | ------- | ---- | -------------------------------------------------- |
| id                 | TEXT    | NO   | 主キー（UUID）                                     |
| name               | TEXT    | NO   | エンティティ名（元の表記を保持）                   |
| normalized_name    | TEXT    | NO   | 検索用正規化名（小文字化）                         |
| type               | TEXT    | NO   | エンティティタイプ（下記参照）                     |
| description        | TEXT    | YES  | エンティティの説明文                               |
| aliases            | JSON    | NO   | 別名リスト（JSON配列、デフォルト: []）             |
| embedding          | BLOB    | YES  | 埋め込みベクトル（Float32Array）                   |
| embedding_model_id | TEXT    | YES  | ベクトル生成モデルID                               |
| importance         | REAL    | NO   | 重要度スコア（0.0-1.0、デフォルト: 0.5）           |
| mention_count      | INTEGER | NO   | ドキュメント内出現回数（デフォルト: 1）            |
| metadata           | JSON    | YES  | 拡張メタデータ（source, confidence等）             |
| created_at         | INTEGER | NO   | 作成日時（UNIX時刻）                               |
| updated_at         | INTEGER | NO   | 更新日時（UNIX時刻）                               |

**エンティティタイプ一覧**:

| タイプ       | 説明           | 例                     |
| ------------ | -------------- | ---------------------- |
| person       | 人物           | "田中太郎"             |
| organization | 組織・会社     | "Anthropic"            |
| location     | 場所・地域     | "東京"                 |
| date         | 日付・期間     | "2024年1月"            |
| event        | イベント       | "Claude発表"           |
| technology   | 技術・言語     | "TypeScript"           |
| concept      | 概念・アイデア | "マイクロサービス"     |
| product      | 製品・サービス | "Claude Code"          |
| api          | APIエンドポイント | "/api/v1/chat"      |
| function     | 関数           | "createRepository"     |
| class        | クラス         | "BaseRepository"       |
| document     | ドキュメント   | "README.md"            |
| section      | セクション     | "Getting Started"      |
| other        | その他         | -                      |

**設計上の注意点**:

- `normalized_name + type` の組み合わせでユニーク制約（同タイプ内で同名不可）
- `importance` スコアでエンティティのランキングを実現
- `embedding` でセマンティック検索をサポート（ベクトル類似度検索）
- エンティティ削除時は関連する `relations` テーブルもCASCADEで削除

**参照ドキュメント**:

- スキーマ実装: `packages/shared/src/db/schema/graph/entities.ts` ✅
- Repository実装: `packages/shared/src/db/repositories/entity.repository.ts` ✅

---

## Repository パターン設計

### 概要

RAGパイプラインのデータアクセス層はRepositoryパターンで実装されている。
データベース操作を抽象化し、型安全なCRUD操作と統一的なエラーハンドリングを提供する。

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  (サービス、ユースケース、コントローラー)                 │
└────────────────────────┬────────────────────────────────┘
                         │ 依存
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Repository Layer                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  FileRepo   │ │  ChunkRepo  │ │   EntityRepo    │   │
│  └──────┬──────┘ └──────┬──────┘ └────────┬────────┘   │
│         │               │                  │            │
│         └───────────────┼──────────────────┘            │
│                         │                               │
│              ┌──────────▼──────────┐                   │
│              │   BaseRepository    │                   │
│              │  (共通CRUD操作)      │                   │
│              └──────────┬──────────┘                   │
└─────────────────────────┼───────────────────────────────┘
                          │ 依存
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │ Drizzle ORM │ │   Schema    │ │  types/rag/*    │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### BaseRepository（基底クラス）

共通のCRUD操作を提供する抽象クラス。

**ジェネリクス型パラメータ**:

| パラメータ | 説明                           | 例                    |
| ---------- | ------------------------------ | --------------------- |
| TTable     | Drizzleテーブル型              | `typeof files`        |
| TSelect    | SELECT結果型                   | `File`                |
| TInsert    | INSERT入力型                   | `NewFile`             |
| TId        | Branded ID型                   | `FileId`              |

**提供メソッド**:

| メソッド             | 戻り値型                                     | 説明                       |
| -------------------- | -------------------------------------------- | -------------------------- |
| `findById(id)`       | `Result<TSelect \| null, RAGError>`          | IDでレコードを取得         |
| `findAll(params?)`   | `Result<PaginatedResult<TSelect>, RAGError>` | 全レコード取得（ページング）|
| `create(data)`       | `Result<TSelect, RAGError>`                  | レコード作成               |
| `createMany(data[])` | `Result<TSelect[], RAGError>`                | 一括作成                   |
| `update(id, data)`   | `Result<TSelect, RAGError>`                  | レコード更新               |
| `delete(id)`         | `Result<void, RAGError>`                     | レコード削除               |
| `exists(id)`         | `Result<boolean, RAGError>`                  | 存在確認                   |
| `count()`            | `Result<number, RAGError>`                   | 件数取得                   |

**実装場所**: `packages/shared/src/db/repositories/base.repository.ts`

### FileRepository

filesテーブル用Repository。論理削除（ソフトデリート）とハッシュ検索をサポート。

**固有メソッド**:

| メソッド                | 戻り値型                         | 説明                            |
| ----------------------- | -------------------------------- | ------------------------------- |
| `findById(id)` override | `Result<File \| null, RAGError>` | 論理削除を除外して取得          |
| `findByHash(hash)`      | `Result<File \| null, RAGError>` | SHA-256ハッシュで検索           |
| `findByPath(path)`      | `Result<File \| null, RAGError>` | ファイルパスで検索              |
| `findByCategory(cat)`   | `Result<File[], RAGError>`       | カテゴリ別一覧取得              |
| `softDelete(id)`        | `Result<void, RAGError>`         | 論理削除（deletedAt設定）       |
| `findByIds(ids[])`      | `Result<File[], RAGError>`       | 複数ID一括取得                  |

**設計判断**: `findById` をオーバーライドして `isNull(deletedAt)` 条件を自動付与。

**実装場所**: `packages/shared/src/db/repositories/file.repository.ts`

### ChunkRepository

chunksテーブル用Repository。ファイル単位の操作と隣接チャンク取得をサポート。

**固有メソッド**:

| メソッド              | 戻り値型                                              | 説明                          |
| --------------------- | ----------------------------------------------------- | ----------------------------- |
| `findByFileId(fid)`   | `Result<Chunk[], RAGError>`                           | ファイルの全チャンク（順序付き）|
| `deleteByFileId(fid)` | `Result<number, RAGError>`                            | ファイルのチャンク一括削除    |
| `findByHash(hash)`    | `Result<Chunk \| null, RAGError>`                     | ハッシュで検索                |
| `findByIds(ids[])`    | `Result<Chunk[], RAGError>`                           | 複数ID一括取得                |
| `findAdjacent(cid)`   | `Result<{prev: Chunk\|null, next: Chunk\|null}, ...>` | 前後チャンク取得              |

**設計判断**: `findByFileId` は `chunkIndex` でソート。チャンクの順序が重要なため。

**実装場所**: `packages/shared/src/db/repositories/chunk.repository.ts`

### EntityRepository

entitiesテーブル用Repository。Knowledge Graph検索とUpsertをサポート。

**固有メソッド**:

| メソッド                           | 戻り値型                           | 説明                            |
| ---------------------------------- | ---------------------------------- | ------------------------------- |
| `findByNormalizedNameAndType(n,t)` | `Result<Entity \| null, RAGError>` | 正規化名+タイプで検索           |
| `findByType(type)`                 | `Result<Entity[], RAGError>`       | タイプ別一覧取得                |
| `searchByName(query, limit?)`      | `Result<Entity[], RAGError>`       | 名前部分一致検索（重要度順）    |
| `findTopByImportance(limit?)`      | `Result<Entity[], RAGError>`       | 重要度上位取得                  |
| `upsert(data)`                     | `Result<Entity, RAGError>`         | 存在すれば更新、なければ作成   |

**設計判断**: `upsert` は `normalizedName + type` の組み合わせで既存判定。

**実装場所**: `packages/shared/src/db/repositories/entity.repository.ts`

### エラーハンドリング（Result型パターン）

全Repositoryメソッドは `Result<T, RAGError>` 型を返す。

**使用するErrorCodes**:

| コード             | 意味           | 発生ケース                      |
| ------------------ | -------------- | ------------------------------- |
| `DB_QUERY_ERROR`   | DBクエリエラー | SQL実行失敗、接続エラー等       |
| `RECORD_NOT_FOUND` | レコード未検出 | update/delete時にIDが存在しない |

**使用例**:

```typescript
const result = await fileRepository.findById(fileId);
if (!result.success) {
  // エラーハンドリング
  console.error(result.error.message);
  return;
}
const file = result.data; // 型安全にアクセス
```

### ファクトリ関数

`createRepositories(db)` で全Repositoryを一括生成。

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { createRepositories } from "@repo/shared/db/repositories";

const sqlite = new Database("./data.db");
const db = drizzle(sqlite);
const repos = createRepositories(db);

// 各Repositoryにアクセス
const fileResult = await repos.files.findById(fileId);
const chunkResult = await repos.chunks.findByFileId(fileId);
const entityResult = await repos.entities.searchByName("TypeScript");
```

**実装場所**: `packages/shared/src/db/repositories/index.ts`

---
