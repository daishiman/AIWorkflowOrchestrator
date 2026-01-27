# Turso統一アーキテクチャ データベース設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| v1.0.0 | - | 初版作成 |
| v1.1.0 | 2026-01-26 | コードブロックを表形式・文章に変換（spec-guidelines.md準拠） |

---

## 採用技術と選定理由

| 技術 | 役割 | 選定理由 |
|------|------|----------|
| **Turso** | クラウドDB | SQLite互換のエッジDB、グローバル分散対応、寛大な無料枠 |
| **libSQL** | 基盤技術 | SQLiteのOSSフォーク、ローカルファイルとクラウド接続の両方に対応 |
| **@libsql/client** | 接続ライブラリ | Embedded Replicas対応、オフラインファースト設計が可能 |
| **Drizzle ORM** | ORM | 型安全なクエリ、軽量、SQLライク構文で学習コスト低、マイグレーション機能 |

## アーキテクチャ概要

本システムは4層構成で設計されており、全てのアプリケーションが統一されたデータアクセス層を共有する。

### アーキテクチャ層構成

| 層 | コンポーネント | 説明 |
|----|----------------|------|
| **アプリケーション層** | Next.js Web App | バックエンドAPIを提供 |
|  | Electron Desktop App | デスクトップクライアント |
|  | CLI Tools | コマンドラインツール群 |
| **ORM層** | Drizzle ORM | 型安全なクエリビルダー、統一スキーマ定義（packages/shared/infrastructure/db/）、マイグレーション管理を担当 |
| **クライアント層** | libSQL Client | ローカルモード（file://local.db）でオフライン動作、クラウドモード（libsql://xxx.turso.io）でオンライン同期 |
| **データベース層** | Turso Cloud DB | 本番環境のクラウドデータベース、Embedded Replicasによる自動同期 |

### データフロー

全てのアプリケーションは同一のDrizzle ORMスキーマを使用し、libSQL Clientを経由してTurso Cloud DBと通信する。Embedded Replicas機能により、ローカルとクラウド間の自動同期が実現される。

## 設計原則

1. **スキーマ統一**: Web/Desktop/CLIすべてで同一のスキーマ定義を使用する
2. **オフラインファースト**: ElectronアプリはローカルファイルDBで動作し、オンライン時に同期
3. **型安全性**: Drizzle ORMの型推論を最大限活用し、ランタイムエラーを防ぐ
4. **段階的拡張**: 最小限のテーブルから始め、必要に応じて追加する

## 環境別接続設定

### 接続URL形式

| 環境 | 接続URL形式 | 認証 | 用途 |
|------|-------------|------|------|
| ローカル開発（ファイル） | `file:./data/local.db` | 不要 | 高速な開発サイクル |
| ローカル開発（Turso接続） | `libsql://db-name.turso.io` | AUTH_TOKEN必要 | 本番相当の動作確認 |
| デスクトップアプリ | `file:${appDataPath}/app.db` | 不要 | オフライン動作 |
| バックエンドAPI（Railway） | `libsql://db-name.turso.io` | AUTH_TOKEN必要 | 本番環境 |

### 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `TURSO_DATABASE_URL` | Yes | データベース接続URL |
| `TURSO_AUTH_TOKEN` | ※ | 認証トークン（※ローカルファイルモードでは不要） |
| `LOCAL_DB_PATH` | No | ローカル開発時のDBファイルパス |

### 接続クライアント実装時の注意点

- 接続URLが`file:`で始まる場合は認証トークンを渡さない
- 本番環境では必ず環境変数からURLとトークンを取得する
- 接続エラー時のリトライ処理を実装する（最大3回、指数バックオフ）
- クライアントはシングルトンパターンで管理し、不要な接続を避ける

## ディレクトリ構成

データベース関連ファイルは `packages/shared/` 配下に配置する。

### packages/shared/src/db/ ディレクトリ

| ファイル/ディレクトリ | 説明 | 実装状態 |
|----------------------|------|----------|
| schema/index.ts | スキーマエントリーポイント | 実装済 |
| schema/chat-history.ts | チャット履歴スキーマ | 実装済 |
| env.ts | 環境変数管理（Zod検証） | 実装済 |
| migrate.ts | マイグレーション実行スクリプト | 実装済 |
| utils.ts | データベースユーティリティ関数 | 実装済 |
| index.ts | クライアントエクスポート | 実装済 |

### packages/shared/src/ その他ディレクトリ

| ディレクトリ | 説明 |
|--------------|------|
| repositories/ | リポジトリ層 |
| features/ | 機能別サービス |
| types/ | 型定義 |

### packages/shared/ ルートレベル

| ファイル/ディレクトリ | 説明 | 実装状態 |
|----------------------|------|----------|
| drizzle/migrations/ | マイグレーションファイル格納先 | - |
| drizzle.config.ts | Drizzle設定 | 実装済 |

## 基盤モジュール

### env.ts - 環境変数管理

| 関数名 | 説明 | 戻り値 |
|--------|------|--------|
| `getDatabaseEnv()` | 環境変数を取得し、Zodスキーマで検証 | `DatabaseEnv` |
| `getDatabaseUrl()` | 接続URL取得（TURSO_DATABASE_URL優先） | `string` |
| `isCloudMode()` | クラウドモード判定（libsql://で始まるURL） | `boolean` |
| `validateDatabaseEnv()` | 環境変数の妥当性検証 | `SafeParseResult` |

### migrate.ts - マイグレーション実行

| 関数名 | 説明 | 戻り値 |
|--------|------|--------|
| `runMigrations()` | マイグレーションフォルダ内のSQLを順次実行 | `Promise<void>` |

**マイグレーションフォルダパス**: `packages/shared/drizzle/migrations/`

### utils.ts - ユーティリティ関数

| 関数名 | 説明 | 戻り値 |
|--------|------|--------|
| `initializeClient()` | libSQLクライアントの初期化 | `Client` |
| `getConnectionUrl()` | 環境に応じた接続URL取得 | `string` |
| `isOnline()` | ネットワーク接続状態の確認（将来実装） | `Promise<boolean>` |

### drizzle.config.ts - Drizzle Kit設定

| 設定項目 | 値 | 説明 |
|----------|------|------|
| `schema` | `./dist/src/db/schema/*.js` | コンパイル後のスキーマパス |
| `out` | `./drizzle/migrations` | マイグレーション出力先 |
| `dialect` | `sqlite` | データベース方言 |
| `verbose` | `true` | 詳細ログ出力 |
| `strict` | `true` | 厳密モード |

### 関連npmスクリプト

| スクリプト名 | 実行コマンド | 説明 |
|-------------|-------------|------|
| db:generate | drizzle-kit generate | マイグレーションファイル生成 |
| db:migrate | tsx src/db/migrate.ts | マイグレーション実行 |
| db:studio | drizzle-kit studio | Drizzle Studio起動（DBビューア） |

## 使用例

データベースクライアントは `@repo/shared/db` からインポートして使用する。

### 基本的なクエリ実行

| 操作 | 説明 |
|------|------|
| インポート | `@repo/shared/db` から `db`, `chatSessions`, `chatMessages` 等をインポート |
| セッション一覧取得 | `db.select().from(chatSessions)` でチャットセッション一覧を取得 |

Drizzle ORMのクエリビルダーを使用し、型安全にデータベース操作を行う。詳細な実装パターンについては、[データベース実装](./database-implementation.md)を参照。

---

## 関連ドキュメント

- [データベーススキーマ設計](./database-schema.md) - テーブル定義・インデックス設計
- [データベース実装](./database-implementation.md) - リポジトリ・サービス実装
- [コアインターフェース](./interfaces-converter.md) - 型定義
