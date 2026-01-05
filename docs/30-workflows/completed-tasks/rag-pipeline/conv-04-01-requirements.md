# CONV-04-01 Drizzle ORMセットアップ 要件定義書

## メタ情報

| 項目       | 内容                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | CONV-04-01                                                                                                                             |
| タスク名   | Drizzle ORMセットアップ                                                                                                                |
| 作成日     | 2025-12-24                                                                                                                             |
| ステータス | 要件定義完了                                                                                                                           |
| 参照元     | `docs/00-requirements/15-database-design.md`, `docs/00-requirements/03-technology-stack.md`, `docs/00-requirements/05-architecture.md` |

---

## 1. 概要

### 1.1 目的

HybridRAGパイプライン構築のデータベース基盤として、Drizzle ORMを導入し、型安全で保守性の高いデータアクセス層を確立する。

### 1.2 背景

HybridRAG（GraphRAG + VectorRAG統合）パイプラインを実装するには、以下のテーブルが必要：

- `files` / `conversions` - ファイル管理
- `content_chunks` - チャンク管理（FTS5全文検索対応）
- `entities` / `relations` / `communities` - Knowledge Graph構築

これらすべてのデータベース操作の基盤となるDrizzle ORM設定が必要。

### 1.3 スコープ

#### 含むもの

- `packages/shared/src/db/` 配下へのDrizzle ORM基盤構築
- libSQL/Turso互換の接続設定
- 共通スキーマ定義（共通カラム）
- マイグレーション環境の整備
- 環境変数管理（Zodによる検証）
- ユーティリティ関数

#### 含まないもの

- 個別テーブルの定義（後続タスク CONV-04-02〜CONV-04-06）
- FTS5/DiskANN拡張設定（後続タスク CONV-04-03, CONV-04-04）
- Repositoryパターン実装（後続タスク CONV-04-06）

---

## 2. 機能要件 (FR: Functional Requirements)

### 2.1 データベース接続管理 (FR-001)

| ID        | 要件                                                           | 優先度 | 検証方法                                      |
| --------- | -------------------------------------------------------------- | ------ | --------------------------------------------- |
| FR-001-01 | ローカルファイルDB（`file:./local.db`）への接続をサポートする  | Must   | 接続成功時にSELECT 1が実行できる              |
| FR-001-02 | Tursoクラウド（`libsql://xxx.turso.io`）への接続をサポートする | Must   | 認証成功後にクエリが実行できる                |
| FR-001-03 | 環境変数（`TURSO_DATABASE_URL`）に基づいて接続先を決定する     | Must   | 環境変数設定に応じて正しいURLが選択される     |
| FR-001-04 | 接続がない場合のデフォルトをローカルファイルDBとする           | Must   | 環境変数未設定時に`file:local.db`に接続される |
| FR-001-05 | シングルトンパターンでクライアントを管理する                   | Should | 複数回呼び出しても同一インスタンスを返す      |

### 2.2 スキーマ定義 (FR-002)

| ID        | 要件                                                                   | 優先度 | 検証方法                                     |
| --------- | ---------------------------------------------------------------------- | ------ | -------------------------------------------- |
| FR-002-01 | UUID形式の主キー関数（`uuidPrimaryKey()`）を提供する                   | Must   | 新規レコード作成時にUUIDが自動生成される     |
| FR-002-02 | `created_at`, `updated_at` タイムスタンプを共通カラムとして提供する    | Must   | レコード作成・更新時に自動設定される         |
| FR-002-03 | `deleted_at` によるソフトデリートカラムを提供する                      | Must   | 論理削除後も物理データが保持される           |
| FR-002-04 | `metadata` JSONカラムを拡張用として提供する                            | Should | 任意のJSONオブジェクトが格納できる           |
| FR-002-05 | Drizzle ORMの型推論（`InferSelectModel`/`InferInsertModel`）を活用する | Must   | TypeScriptコンパイル時に型エラーが検出される |

### 2.3 トランザクション管理 (FR-003)

| ID        | 要件                                                           | 優先度 | 検証方法                                    |
| --------- | -------------------------------------------------------------- | ------ | ------------------------------------------- |
| FR-003-01 | `withTransaction()` 関数でトランザクションを実行できる         | Must   | トランザクション内の操作が全て成功/失敗する |
| FR-003-02 | トランザクション内でエラーが発生した場合、自動ロールバックする | Must   | エラー時に変更が取り消される                |

### 2.4 ヘルスチェック (FR-004)

| ID        | 要件                                                 | 優先度 | 検証方法                              |
| --------- | ---------------------------------------------------- | ------ | ------------------------------------- |
| FR-004-01 | `checkDatabaseHealth()` 関数でDB接続状態を確認できる | Must   | 接続成功時にtrue、失敗時にfalseを返す |
| FR-004-02 | 接続クローズ関数（`closeDatabase()`）を提供する      | Must   | クライアントが正常にクローズされる    |

### 2.5 マイグレーション管理 (FR-005)

| ID        | 要件                                                    | 優先度 | 検証方法                            |
| --------- | ------------------------------------------------------- | ------ | ----------------------------------- |
| FR-005-01 | `drizzle.config.ts` でマイグレーション設定を定義する    | Must   | Drizzle Kitコマンドが正常に動作する |
| FR-005-02 | `pnpm db:generate` でマイグレーションファイルを生成する | Must   | SQLファイルが`drizzle/`に出力される |
| FR-005-03 | `pnpm db:migrate` でマイグレーションを適用する          | Must   | スキーマ変更がDBに反映される        |
| FR-005-04 | `pnpm db:push` で開発時の即時適用をサポートする         | Should | 開発DBに変更が即反映される          |
| FR-005-05 | `pnpm db:studio` でDrizzle Studioを起動できる           | Should | ブラウザでDBを確認・操作できる      |

### 2.6 環境変数管理 (FR-006)

| ID        | 要件                                                         | 優先度 | 検証方法                       |
| --------- | ------------------------------------------------------------ | ------ | ------------------------------ |
| FR-006-01 | Zodスキーマで環境変数を検証する                              | Must   | 不正な値でエラーが発生する     |
| FR-006-02 | `DATABASE_URL` または `TURSO_DATABASE_URL` を受け付ける      | Must   | どちらの環境変数でも接続できる |
| FR-006-03 | `DATABASE_AUTH_TOKEN` または `TURSO_AUTH_TOKEN` を受け付ける | Must   | どちらの環境変数でも認証できる |
| FR-006-04 | `getDatabaseEnv()` 関数で型安全に環境変数を取得できる        | Must   | 返り値が型付けされている       |

### 2.7 ユーティリティ関数 (FR-007)

| ID        | 要件                                                       | 優先度 | 検証方法                     |
| --------- | ---------------------------------------------------------- | ------ | ---------------------------- |
| FR-007-01 | `paginate(limit, offset)` 関数でページネーションを実装する | Should | 正しいlimit/offsetが返される |
| FR-007-02 | `batchProcess()` 関数でバッチ処理を実装する                | Should | 大量データを分割処理できる   |
| FR-007-03 | `coalesce()` SQL関数をヘルパーとして提供する               | Should | COALESCE SQLが生成される     |
| FR-007-04 | `currentTimestamp()` SQL関数をヘルパーとして提供する       | Should | 現在時刻のSQLが生成される    |

---

## 3. 非機能要件 (NFR: Non-Functional Requirements)

### 3.1 パフォーマンス (NFR-001)

| ID         | 要件                       | 測定基準      | 目標値                             |
| ---------- | -------------------------- | ------------- | ---------------------------------- |
| NFR-001-01 | 単一レコード取得の応答時間 | P95レイテンシ | < 50ms (ローカル), < 100ms (Turso) |
| NFR-001-02 | バッチ挿入スループット     | レコード/秒   | >= 1000 records/sec (ローカル)     |
| NFR-001-03 | 接続確立時間               | 初回接続      | < 500ms                            |

### 3.2 信頼性 (NFR-002)

| ID         | 要件                   | 測定基準                | 目標値                   |
| ---------- | ---------------------- | ----------------------- | ------------------------ |
| NFR-002-01 | 接続リトライ機能       | 自動リトライ回数        | 3回（指数バックオフ）    |
| NFR-002-02 | トランザクション整合性 | ACID準拠                | 100%                     |
| NFR-002-03 | データ永続性           | Turso Embedded Replicas | ローカルレプリカ同期対応 |

### 3.3 保守性 (NFR-003)

| ID         | 要件                     | 測定基準               | 目標値         |
| ---------- | ------------------------ | ---------------------- | -------------- |
| NFR-003-01 | 型カバレッジ             | TypeScript strict mode | 100%適合       |
| NFR-003-02 | スキーマ変更の追跡可能性 | マイグレーションログ   | 全変更履歴保持 |
| NFR-003-03 | テストカバレッジ         | Vitestカバレッジ       | >= 80%         |

### 3.4 セキュリティ (NFR-004)

| ID         | 要件                    | 測定基準           | 目標値                   |
| ---------- | ----------------------- | ------------------ | ------------------------ |
| NFR-004-01 | 認証トークン管理        | 環境変数経由       | ハードコーディング禁止   |
| NFR-004-02 | SQLインジェクション対策 | パラメータ化クエリ | 100%準拠                 |
| NFR-004-03 | 機密データログ出力禁止  | ログレベル制御     | 本番環境でクエリログ無効 |

---

## 4. 技術制約

### 4.1 バージョン制約

| パッケージ       | バージョン | 根拠                                      |
| ---------------- | ---------- | ----------------------------------------- |
| `drizzle-orm`    | ^0.38.0    | 技術スタック仕様書準拠                    |
| `drizzle-kit`    | ^0.30.0    | 技術スタック仕様書準拠（devDependencies） |
| `@libsql/client` | ^0.14.0    | Turso互換性                               |
| `zod`            | ^3.24.0    | 環境変数検証                              |
| TypeScript       | ^5.7.0     | strict mode必須                           |
| Node.js          | >= 20.x    | ESM対応                                   |

### 4.2 アーキテクチャ制約

| 制約           | 内容                                                     | 根拠                                                    |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| 配置場所       | `packages/shared/src/db/`                                | `docs/00-requirements/05-architecture.md` Section 5.1.1 |
| エクスポート   | `packages/shared/src/db/index.ts` からバレルエクスポート | モノレポ統一規約                                        |
| 依存関係       | `shared` パッケージ内で完結、外部依存最小限              | `docs/00-requirements/05-architecture.md` Section 5.1.2 |
| モジュール形式 | ESM（CommonJS禁止）                                      | `docs/00-requirements/03-technology-stack.md`           |

### 4.3 SQLite/libSQL制約

| 制約      | 内容                       | 対応方法                                 |
| --------- | -------------------------- | ---------------------------------------- |
| UUID生成  | SQLiteはUUID関数なし       | `crypto.randomUUID()` でアプリ層生成     |
| JSON型    | ネイティブJSON型なし       | `text` として格納、`$type<T>()` で型指定 |
| 日時型    | ネイティブDATETIME制約あり | `integer` (UNIX timestamp) として格納    |
| Boolean型 | ネイティブBOOLEAN型なし    | `integer` (0/1) として格納               |

---

## 5. 依存関係

### 5.1 パッケージ依存

```
packages/shared/
├── dependencies:
│   ├── drizzle-orm@^0.38.0
│   ├── @libsql/client@^0.14.0
│   └── zod@^3.24.0 (既存)
└── devDependencies:
    └── drizzle-kit@^0.30.0
```

### 5.2 モノレポ依存

```
packages/shared (このタスクで構築)
├── apps/desktop (依存元) - ローカルDB使用
└── apps/web (依存元) - Turso Cloud使用
```

### 5.3 後続タスク依存

本タスク（CONV-04-01）は以下のタスクの前提条件：

| タスクID   | タスク名                        | 本タスクへの依存            |
| ---------- | ------------------------------- | --------------------------- |
| CONV-04-02 | files/conversionsテーブル実装   | client.ts, schema/common.ts |
| CONV-04-03 | content_chunksテーブル + FTS5   | client.ts, schema/common.ts |
| CONV-04-04 | DiskANNベクトルインデックス設定 | client.ts                   |
| CONV-04-05 | Knowledge Graphテーブル群       | client.ts, schema/common.ts |
| CONV-04-06 | Repositoryパターン実装          | 全db/モジュール             |

---

## 6. 受け入れ基準

### AC-001: ローカルDB接続

```gherkin
Given 環境変数 DATABASE_URL が未設定
When データベースクライアントを初期化する
Then file:local.db に接続され、SELECT 1 が実行できる
```

### AC-002: Tursoクラウド接続

```gherkin
Given DATABASE_URL と DATABASE_AUTH_TOKEN が設定済み
When データベースクライアントを初期化する
Then Tursoエンドポイントに認証済みで接続される
```

### AC-003: ヘルスチェック

```gherkin
Given データベースクライアントが初期化済み
When checkDatabaseHealth() を呼び出す
Then 接続成功時に true、失敗時に false が返される
```

### AC-004: トランザクションロールバック

```gherkin
Given トランザクション内で複数の操作を実行
When 途中でエラーが発生する
Then すべての変更がロールバックされる
```

### AC-005: 共通カラム型推論

```gherkin
Given timestamps, softDelete を使用したテーブルスキーマを定義
When InferSelectModel で型を推論する
Then created_at, updated_at, deleted_at が正しい型で推論される
```

### AC-006: 環境変数検証

```gherkin
Given 不正な DATABASE_URL が設定されている
When validateDatabaseEnv() を呼び出す
Then Zodバリデーションエラーが発生する
```

### AC-007: マイグレーションコマンド

```gherkin
Given drizzle.config.ts が正しく設定されている
When pnpm db:generate を実行する
Then drizzle/ フォルダにマイグレーションファイルが生成される
```

---

## 7. ファイル構成（計画）

```
packages/shared/
├── src/
│   └── db/
│       ├── index.ts              # バレルエクスポート
│       ├── client.ts             # libSQLクライアント・Drizzle ORM初期化
│       ├── env.ts                # 環境変数Zodスキーマ・検証関数
│       ├── utils.ts              # ユーティリティ関数
│       ├── migrate.ts            # マイグレーションスクリプト
│       ├── schema/
│       │   ├── index.ts          # スキーマバレルエクスポート
│       │   └── common.ts         # 共通カラム定義
│       └── __tests__/
│           ├── client.test.ts    # クライアント接続テスト
│           ├── env.test.ts       # 環境変数検証テスト
│           └── utils.test.ts     # ユーティリティ関数テスト
├── drizzle/                      # マイグレーションファイル（Git管理）
│   └── migrations/
│       └── meta/
│           └── _journal.json
└── drizzle.config.ts             # Drizzle Kit設定
```

---

## 8. 成功基準チェックリスト

### 8.1 セットアップ完了

- [ ] `packages/shared/src/db/client.ts` が作成されている
- [ ] `packages/shared/src/db/env.ts` が作成されている
- [ ] `packages/shared/src/db/utils.ts` が作成されている
- [ ] `packages/shared/src/db/schema/common.ts` が作成されている
- [ ] `packages/shared/src/db/index.ts` でバレルエクスポートされている
- [ ] `packages/shared/drizzle.config.ts` が作成されている

### 8.2 型安全性

- [ ] TypeScript strict modeでコンパイルエラーがない
- [ ] `InferSelectModel` / `InferInsertModel` が正しく型推論できる
- [ ] Zodスキーマによる環境変数検証が動作する

### 8.3 マイグレーション

- [ ] `pnpm --filter @repo/shared db:generate` が動作する
- [ ] `pnpm --filter @repo/shared db:push` が動作する
- [ ] `pnpm --filter @repo/shared db:studio` が動作する

### 8.4 テスト

- [ ] ユニットテスト（接続、環境変数、ユーティリティ）が作成されている
- [ ] テストカバレッジ >= 80%
- [ ] 全テストがGreen状態

### 8.5 品質

- [ ] ESLintエラーなし
- [ ] Prettierフォーマット適用済み
- [ ] 型エラーなし

---

## 9. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                                        |
| -------------------- | ------ | -------- | ------------------------------------------- |
| libSQL接続互換性問題 | 高     | 低       | Drizzle公式ドキュメント参照、バージョン固定 |
| 環境変数設定ミス     | 中     | 中       | Zodによる厳格な検証、デフォルト値設定       |
| マイグレーション競合 | 中     | 低       | マイグレーションファイルのGit管理徹底       |
| 後続タスクとの整合性 | 高     | 低       | 共通カラム設計の慎重な検討                  |

---

## 10. 参照ドキュメント

- `docs/00-requirements/15-database-design.md` - データベース設計（Turso + Drizzle ORM）
- `docs/00-requirements/03-technology-stack.md` - 技術スタック仕様書
- `docs/00-requirements/05-architecture.md` - アーキテクチャ設計
- `docs/00-requirements/13-environment-variables.md` - 環境変数
- `docs/30-workflows/unassigned-task/task-04-01-drizzle-setup.md` - 元のタスク指示書

---

## 変更履歴

| バージョン | 日付       | 変更者                          | 変更内容 |
| ---------- | ---------- | ------------------------------- | -------- |
| 1.0.0      | 2025-12-24 | `.claude/agents/req-analyst.md` | 初版作成 |
