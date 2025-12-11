# データベース設計（Turso + Drizzle ORM）

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

---

## 15.1 データベース統一アーキテクチャ

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

## 15.2 環境別接続設定

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

## 15.3 スキーマ設計

### ディレクトリ構成

```
packages/shared/infrastructure/db/
├── schema/
│   ├── index.ts          # スキーマエントリーポイント（全テーブルをre-export）
│   ├── workflows.ts      # ワークフロー関連テーブル
│   ├── users.ts          # ユーザー設定
│   ├── sync.ts           # 同期メタデータ
│   └── audit.ts          # 監査ログ
├── migrations/           # 自動生成されるSQLマイグレーション
├── seed/                 # テストデータシード
├── client.ts             # DB接続クライアント
└── types.ts              # 型エクスポート
```

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

### インデックス設計

| テーブル            | インデックス名               | カラム                 | 用途                   |
| ------------------- | ---------------------------- | ---------------------- | ---------------------- |
| workflows           | idx_workflows_status         | status                 | ステータス検索         |
| workflows           | idx_workflows_deleted_at     | deleted_at             | アクティブレコード取得 |
| workflows           | idx_workflows_status_deleted | status, deleted_at     | 複合検索の高速化       |
| workflow_steps      | idx_steps_workflow_id        | workflow_id            | 親子関係の取得         |
| workflow_steps      | idx_steps_order              | workflow_id, order     | 順序通りの取得         |
| workflow_executions | idx_executions_workflow_id   | workflow_id            | 履歴検索               |
| workflow_executions | idx_executions_status        | status                 | 実行中/失敗の検索      |
| workflow_executions | idx_executions_started_at    | started_at             | 時系列ソート           |
| user_profiles       | idx_profiles_deleted_at      | deleted_at             | 有効ユーザー取得       |
| api_keys            | idx_api_keys_user_id         | user_id                | ユーザー別キー取得     |
| audit_logs          | idx_audit_event_type         | event_type             | イベント種別検索       |
| audit_logs          | idx_audit_entity             | entity_type, entity_id | エンティティ別履歴     |
| audit_logs          | idx_audit_timestamp          | timestamp              | 時系列検索             |

---

## 15.4 型安全なクエリ実装

### Drizzle ORM使用時のベストプラクティス

1. **スキーマからの型推論を活用する**
   - `InferSelectModel`と`InferInsertModel`を使用して型を生成
   - 手動で型定義を二重管理しない

2. **リレーションを明示的に定義する**
   - `relations()`関数でテーブル間の関係を宣言
   - `with`オプションで関連データを一括取得し、N+1問題を回避

3. **JSON カラムにはZodスキーマを併用する**
   - `.$type<T>()`で型を指定しつつ、ランタイムバリデーションも行う
   - スキーマ変更時はZodスキーマも更新する

4. **クエリビルダーのメソッドチェーンを活用する**
   - `where()`, `orderBy()`, `limit()`などを適切に組み合わせる
   - 動的な条件は配列に集めて`and()`で結合

### トランザクション処理の注意点

1. **トランザクション境界を明確にする**
   - 複数テーブルへの書き込みは必ずトランザクション内で行う
   - `db.transaction()`のコールバック内で全操作を完結させる

2. **エラー時の自動ロールバック**
   - トランザクション内で例外が発生すると自動的にロールバックされる
   - catchブロックで部分的なコミットを試みない

3. **デッドロック対策**
   - 複数テーブルへのアクセス順序を統一する
   - リトライ処理を実装し、一時的な競合に対応する

### バッチ処理のベストプラクティス

1. **一括挿入を使用する**
   - ループ内での個別insertではなく、`values()`に配列を渡す
   - 大量データは1000件程度のチャンクに分割

2. **大量削除は段階的に行う**
   - `LIMIT`を使って少しずつ削除し、ロック時間を短縮
   - 本番環境では営業時間外に実行することを推奨

3. **集計クエリの最適化**
   - `sql`タグ付きテンプレートで集計関数を使用
   - カバリングインデックスを活用し、テーブルスキャンを回避

---

## 15.5 Embedded Replicas とオフライン対応

### Embedded Replicasの仕組み

Turso の Embedded Replicas は、ローカルの SQLite ファイルとクラウドの Turso DB を自動同期する機能。デスクトップアプリのオフライン動作に最適。

### 初期化時の設定項目

| 設定項目     | 説明                   | 推奨値    |
| ------------ | ---------------------- | --------- |
| url          | ローカルDBファイルパス | file:パス |
| syncUrl      | 同期先のTurso URL      | libsql:// |
| authToken    | Turso認証トークン      | 環境変数  |
| syncInterval | 自動同期間隔（秒）     | 60        |

### 同期フロー

1. **オフライン時**: ローカルSQLiteファイルに対して読み書きを行う
2. **オンライン復帰時**: `client.sync()`を呼び出して差分をTursoに送信
3. **定期同期**: `syncInterval`で指定した間隔でバックグラウンド同期
4. **競合発生時**: 設定した競合解決戦略に従って解決

### 競合解決戦略

| 戦略            | 説明                       | 適用シーン                 |
| --------------- | -------------------------- | -------------------------- |
| last_write_wins | 最後に書き込まれた値を採用 | 設定値など、最新が正の場合 |
| manual          | ユーザーに選択を委ねる     | 重要データの競合           |
| merge           | フィールドごとにマージ     | 部分的な更新が可能な場合   |

### 同期状態の監視

- 同期の成功/失敗をUIに表示する
- 競合発生時はユーザーに通知する
- オフライン状態を明示的に表示する
- 同期エラーが続く場合は手動同期ボタンを提供する

### オフライン対応の注意点

1. **データ整合性**: オフライン中に作成されたIDが重複しないよう、UUIDを使用する
2. **タイムスタンプ**: クライアント時刻のずれに注意し、サーバー時刻での補正を検討
3. **同期順序**: 依存関係のあるデータは親→子の順序で同期する
4. **ストレージ容量**: ローカルDBのサイズを監視し、古いデータは定期的にクリーンアップ

---

## 15.6 マイグレーション管理

### Drizzle Kit の使用方法

| コマンド                      | 用途                                      |
| ----------------------------- | ----------------------------------------- |
| `pnpm drizzle-kit generate`   | スキーマ変更からマイグレーションSQLを生成 |
| `pnpm drizzle-kit push`       | マイグレーションを直接DBに適用（開発用）  |
| `pnpm drizzle-kit migrate`    | マイグレーションを順次適用（本番用）      |
| `pnpm drizzle-kit studio`     | Web UIでDBを確認・操作                    |
| `pnpm drizzle-kit introspect` | 既存DBからスキーマを逆生成                |

### マイグレーション運用原則

1. **バージョン管理必須**
   - 生成されたマイグレーションファイルは必ずGit管理する
   - マイグレーションファイルを手動編集した場合はコメントで理由を記載

2. **ロールバック可能な設計**
   - 破壊的変更（カラム削除等）は段階的に行う
   - 旧カラムを一定期間残し、移行完了後に削除

3. **データ移行とスキーマ変更の分離**
   - 大量データの移行はマイグレーションとは別のスクリプトで行う
   - 本番適用前にステージング環境で十分にテスト

4. **ダウンタイム最小化**
   - カラム追加は即時反映可能（ダウンタイムなし）
   - カラム削除・型変更は慎重に計画

### 本番デプロイ時のチェックリスト

- [ ] ステージング環境でマイグレーションをテスト済み
- [ ] ロールバック手順を確認済み
- [ ] バックアップを取得済み
- [ ] 想定実行時間を見積もり済み
- [ ] 影響範囲をチームに共有済み

---

## 15.7 テスト戦略

### ユニットテストでのDB設定

1. **インメモリDBを使用する**
   - `url: ':memory:'`でインメモリSQLiteを作成
   - テストごとにクリーンな状態から開始

2. **テスト前にマイグレーションを適用する**
   - `beforeEach`で毎回DBを初期化
   - 本番と同じスキーマでテスト

3. **テストデータはファクトリ関数で生成する**
   - 必要最小限のデータを動的に生成
   - ハードコードされたテストデータを避ける

### テストデータのシード

- 開発環境用のシードスクリプトを用意する
- 現実的なサンプルデータを生成する
- 外部APIキーなどの機密情報はダミー値を使用

### 統合テストの考慮事項

1. **テスト用DBの分離**: テストは専用のDBインスタンスを使用
2. **並列実行**: テスト間でデータが干渉しないよう設計
3. **クリーンアップ**: テスト後に作成したデータを削除

---

## 15.8 エラーハンドリング

### DB接続エラーへの対応

1. **リトライ処理を実装する**
   - 最大リトライ回数: 3回
   - 指数バックオフ: 1秒 → 2秒 → 4秒

2. **エラーの種類を分類する**
   - 接続エラー: リトライ対象
   - クエリエラー: 即座に失敗
   - タイムアウト: リトライ対象

3. **ユーザーへのフィードバック**
   - 接続エラー時は明確なメッセージを表示
   - リトライ中であることを示す

### デッドロック対応

- トランザクションの取得順序を統一する
- 競合が予想される操作にはリトライを実装
- 長時間のトランザクションを避ける

### データ整合性エラー

- 外部キー制約違反は適切にキャッチしてエラーメッセージを返す
- UNIQUE制約違反は重複チェックのロジックを見直す
- NOT NULL制約違反は入力バリデーションを強化

---

## 15.9 パフォーマンス最適化

### クエリ最適化のポイント

1. **N+1問題を回避する**
   - リレーションデータは`with`オプションで一括取得
   - ループ内でのクエリ発行を避ける

2. **必要なカラムのみ取得する**
   - `select()`で必要なカラムを明示的に指定
   - `*`による全カラム取得を避ける

3. **インデックスを活用する**
   - WHERE句で使用するカラムにはインデックスを追加
   - 複合検索には複合インデックスを検討

4. **EXPLAIN ANALYZEで実行計画を確認する**
   - 遅いクエリは実行計画を確認して改善

### バッチ処理の最適化

- 大量INSERT: 1000件程度のチャンクに分割
- 大量UPDATE: 主キーでの範囲指定を活用
- 大量DELETE: LIMITで段階的に削除

### 接続管理

- 接続はシングルトンで管理
- 不要な接続の作成を避ける
- 長時間のアイドル接続は定期的にリフレッシュ

---

## 15.10 Turso 無料枠の活用

### 無料枠の上限（2025年時点）

| 項目           | 無料枠       | 個人開発での評価   |
| -------------- | ------------ | ------------------ |
| ストレージ     | 9 GB/DB      | 十分               |
| 読み取り       | 1,000万行/月 | 十分               |
| 書き込み       | 100万行/月   | 十分               |
| データベース数 | 500個        | 環境分離に十分     |
| レプリカ       | 無制限       | グローバル展開可能 |

### 無料枠を最大限活用するコツ

1. **開発/ステージング/本番でDBを分ける**: 500個のDB枠を活用
2. **定期的に古いデータを削除**: ストレージを節約
3. **バッチ処理で書き込みを最適化**: 不要な書き込みを削減
4. **読み取りキャッシュの活用**: 同じデータの繰り返し読み取りを削減

### Turso CLI 基本操作

| コマンド                        | 説明                   |
| ------------------------------- | ---------------------- |
| `turso auth login`              | GitHubアカウントで認証 |
| `turso db create <name>`        | 新規DB作成             |
| `turso db list`                 | DB一覧表示             |
| `turso db show <name>`          | DB接続情報表示         |
| `turso db tokens create <name>` | 接続トークン生成       |
| `turso db shell <name>`         | SQLシェル起動          |
| `turso db destroy <name>`       | DB削除                 |

---

## 15.11 セキュリティベストプラクティス

### APIキーの保護

1. **平文保存の禁止**: APIキーは必ず暗号化して保存
2. **暗号化方式**: AES-256-GCM（認証付き暗号化）を推奨
3. **キー管理**: 暗号化キーは環境変数で管理し、定期的にローテーション
4. **アクセス制限**: APIキーへのアクセスは必要最小限のユーザーに限定

### SQLインジェクション対策

1. **パラメータ化クエリを常に使用する**
   - Drizzle ORMの`eq()`, `and()`, `or()`などを使用
   - 文字列結合でSQLを組み立てない

2. **動的テーブル名・カラム名に注意**
   - ユーザー入力をテーブル名/カラム名に使用しない
   - 必要な場合はホワイトリストでバリデーション

3. **生SQLの使用を最小限に**
   - `sql`タグ付きテンプレートを使用する場合もプレースホルダーを活用

### 監査ログの要件

1. **記録すべきイベント**
   - ユーザー認証（成功/失敗）
   - 重要データの作成/更新/削除
   - APIキーの操作
   - 権限変更

2. **保持期間**: 最低1年間を推奨
3. **改ざん検知**: 重要な環境ではハッシュチェーンの導入を検討

---

## 15.12 運用・メンテナンス

### 定期メンテナンスタスク

| タスク             | 頻度   | 目的                   |
| ------------------ | ------ | ---------------------- |
| 古い実行履歴の削除 | 週次   | ストレージ節約         |
| VACUUM実行         | 月次   | DBファイルの圧縮       |
| ANALYZE実行        | 月次   | クエリプランナー最適化 |
| バックアップ       | 日次   | 障害復旧               |
| インデックス確認   | 四半期 | パフォーマンス維持     |

### モニタリング項目

1. **DBサイズ**: 無料枠の上限に近づいていないか
2. **クエリ遅延**: 遅いクエリがないか
3. **エラー率**: 接続エラーや実行エラーの頻度
4. **同期状態**: Embedded Replicasの同期が正常か

### バックアップ戦略

1. **Turso CLI でのダンプ**: `turso db dump <name> > backup.sql`
2. **定期実行**: cronやGitHub Actionsで日次実行
3. **リストア手順の確認**: 定期的にリストアテストを実施

---

## 15.13 Electron ローカルストレージ

デスクトップアプリではクラウドDBとは別に、端末固有の機密情報を保存するローカルストレージを使用する。

### ストレージ種類と用途

| ストレージ種別   | 技術                 | 用途                   | セキュリティレベル         |
| ---------------- | -------------------- | ---------------------- | -------------------------- |
| 暗号化ストレージ | Electron safeStorage | APIキー、認証トークン  | 最高（OSキーチェーン連携） |
| 設定ストレージ   | electron-store       | ユーザー設定、UI状態   | 中（ファイル暗号化なし）   |
| キャッシュ       | ファイルシステム     | 一時データ、プレビュー | 低                         |

### AIプロバイダーAPIキーストレージ

**保存場所**: `{userData}/api-keys.json`（electron-store経由）

**データ構造**:

| フィールド      | 型   | 説明                              |
| --------------- | ---- | --------------------------------- |
| provider        | TEXT | openai / anthropic / google / xai |
| encryptedKey    | TEXT | safeStorage暗号化後のBase64文字列 |
| registeredAt    | TEXT | 登録日時（ISO8601）               |
| lastValidatedAt | TEXT | 最終検証日時（ISO8601）           |

**暗号化フロー**:

1. 平文APIキー → `safeStorage.encryptString()` → Buffer
2. Buffer → Base64エンコード → electron-storeに保存

**復号化フロー**:

1. electron-store → Base64文字列取得
2. Base64デコード → Buffer
3. Buffer → `safeStorage.decryptString()` → 平文APIキー

**セキュリティ制約**:

- `apiKey:get` チャネルはMain Process内部専用（Renderer非公開）
- APIキー値はログ出力禁止
- メモリ上の平文APIキーは使用後速やかに破棄

### 認証トークンストレージ

**保存場所**: Electron safeStorage（OSキーチェーン直接）

| キー名               | 内容                          | 有効期限 |
| -------------------- | ----------------------------- | -------- |
| `auth_access_token`  | Supabase アクセストークン     | 1時間    |
| `auth_refresh_token` | Supabase リフレッシュトークン | 30日     |

### ストレージ初期化タイミング

| イベント               | 処理                                  |
| ---------------------- | ------------------------------------- |
| アプリ初回起動         | 空のストレージファイル作成            |
| ログイン成功           | 認証トークン保存                      |
| APIキー登録            | 暗号化して保存                        |
| ログアウト             | 認証トークンのみ削除（APIキーは保持） |
| アプリアンインストール | OSがキーチェーンエントリ削除          |

---

## 関連ドキュメント

- [テクノロジースタック](./03-technology-stack.md)
- [アーキテクチャ設計](./05-architecture.md)
- [環境変数](./13-environment-variables.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
