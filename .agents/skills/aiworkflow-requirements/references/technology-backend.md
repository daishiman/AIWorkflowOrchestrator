# バックエンド技術スタック（データベース・AI統合）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

## 概要

### 目的

本ドキュメントは、AIWorkflowOrchestratorプロジェクトで使用する技術スタックを定義し、以下を明確にする:

- **技術選定の理由**: なぜその技術を選んだのか
- **バージョン管理戦略**: 互換性とアップデート方針
- **個人開発における最適化**: コスト、学習コスト、保守性のバランス
- **依存関係の管理方針**: 肥大化防止と最小構成の維持

### 技術選定の基本原則

| 原則               | 説明                                         | 具体例                                     |
| ------------------ | -------------------------------------------- | ------------------------------------------ |
| 学習コストの最小化 | 広く使われ、ドキュメントが充実した技術を優先 | React, Next.js, TypeScript等の主流技術     |
| 無料枠の最大活用   | 無料tier内で運用可能なサービスを選定         | Vercel, Turso, Railway等                   |
| 型安全性の徹底     | コンパイル時・実行時の両方で型を検証         | TypeScript strict mode + Zodによる実行時検証 |

### アーキテクチャ概要

**モノレポ構成（pnpm）**

| レイヤー     | パス           | 説明                           |
| ------------ | -------------- | ------------------------------ |
| apps         | apps/web/      | Next.js 15 (App Router)        |
| apps         | apps/desktop/  | Electron + Next.js（将来対応） |
| packages     | packages/shared/ | 共通ロジック、型定義、ユーティリティ |

**外部サービス**

| サービス    | 説明                               | 料金                  |
| ----------- | ---------------------------------- | --------------------- |
| Turso       | 分散SQLite                         | 無料: 9GB, 500Mリクエスト |
| Railway     | ホスティング                       | 従量課金              |
| AI Provider | OpenAI / Anthropic / Google / xAI  | プロバイダ依存        |

---

## バックエンド・データベース

### Drizzle ORM

| 項目           | 値                    |
| -------------- | --------------------- |
| 推奨バージョン | `0.38.x`              |
| 最小バージョン | `0.36.0`              |
| 関連パッケージ | `drizzle-kit: 0.30.x` |

**選定理由**:

1. **型安全なクエリ**: TypeScriptとの完全な統合
2. **軽量**: Prismaの1/10のバンドルサイズ
3. **SQLファースト**: SQLを直接書く感覚
4. **Turso対応**: libSQLドライバ公式サポート

**代替案との比較**:

| 選択肢  | 利点                 | 採用しなかった理由           |
| ------- | -------------------- | ---------------------------- |
| Prisma  | 成熟度、スキーマ管理 | バンドルサイズ、Edge非対応   |
| Kysely  | 型安全SQL            | ORM機能の不足                |
| TypeORM | 機能豊富             | レガシー設計、パフォーマンス |

**Drizzle設定ファイル（drizzle.config.ts）**

| 設定項目                 | 値                          | 説明                     |
| ------------------------ | --------------------------- | ------------------------ |
| dialect                  | turso                       | データベース方言         |
| schema                   | ./src/db/schema.ts          | スキーマ定義ファイルパス |
| out                      | ./drizzle                   | マイグレーション出力先   |
| dbCredentials.url        | 環境変数 TURSO_DATABASE_URL | TursoデータベースURL     |
| dbCredentials.authToken  | 環境変数 TURSO_AUTH_TOKEN   | Turso認証トークン        |

### Turso (libSQL)

| 項目   | 値                       |
| ------ | ------------------------ |
| SDK    | `@libsql/client: 0.14.x` |
| 無料枠 | 9GB、500Mリクエスト/月   |

**選定理由**:

1. **エッジ最適化**: グローバル分散レプリカ
2. **SQLite互換**: ローカル開発が容易
3. **無料枠充実**: 個人開発に十分な容量
4. **Embedded Replicas**: オフライン対応可能

**Turso 2025年の新機能**:

| 機能              | 説明                     | 活用方法          |
| ----------------- | ------------------------ | ----------------- |
| Vector Search     | ベクトル検索対応         | AI検索に利用可能  |
| Schema Migrations | 組み込みマイグレーション | drizzle-kitと併用 |
| Multi-DB Groups   | 複数DB管理               | 環境分離          |

**データベースクライアント初期化（db/client.ts）**

データベースクライアントは以下の手順で初期化する。

| 手順 | 処理内容                    | 使用パッケージ           |
| ---- | --------------------------- | ------------------------ |
| 1    | libSQLクライアント作成      | @libsql/client           |
| 2    | 環境変数からURL・トークン取得 | TURSO_DATABASE_URL, TURSO_AUTH_TOKEN |
| 3    | Drizzle ORMインスタンス生成 | drizzle-orm/libsql       |
| 4    | スキーマ定義をバインド      | ./schema                 |

エクスポートされる`db`オブジェクトを通じて、型安全なクエリを実行する。

### SQLite FTS5（全文検索）

| 項目           | 値                                |
| -------------- | --------------------------------- |
| バージョン     | SQLite 3.45.x以降（FTS5組み込み） |
| トークナイザー | unicode61 remove_diacritics 2     |
| 実装パターン   | External Content Table            |

**選定理由**:

1. **SQLite組み込み**: 追加の検索エンジン不要、運用コスト削減
2. **BM25スコアリング**: 関連度の高い検索結果を提供
3. **日本語対応**: unicode61トークナイザーで日本語・英語混在テキストに対応
4. **高速検索**: インデックスベースの全文検索、10,000チャンクで100ms以下
5. **Turso互換**: libSQL/Tursoでそのまま利用可能

**FTS5の特徴**:

| 機能             | 説明                                         |
| ---------------- | -------------------------------------------- |
| External Content | データ重複なし、chunksテーブルを参照         |
| トリガー同期     | INSERT/UPDATE/DELETE時の自動インデックス更新 |
| 複数検索モード   | キーワード/フレーズ/NEAR（近接）検索         |
| ハイライト機能   | 検索キーワードのハイライト表示               |
| スニペット生成   | 検索結果の文脈付きプレビュー                 |

**代替案との比較**:

| 選択肢        | 利点               | 採用しなかった理由               |
| ------------- | ------------------ | -------------------------------- |
| Elasticsearch | 高機能、スケール性 | 運用コスト、個人開発に過剰       |
| Meilisearch   | タイポ許容、UI優秀 | 別プロセス必要、メモリ消費       |
| ベクトル検索  | セマンティック検索 | コスト高、FTS5との併用を将来検討 |

**使用例**:

キーワード検索の実行方法を以下に示す。

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| 関数名     | searchChunksByKeyword                                 |
| 実装場所   | @repo/shared/db/queries/chunks-search                 |
| 入力パラメータ | db（データベースインスタンス）、query（検索文字列）、limit（結果数上限） |
| 出力       | BM25スコアでランク付けされた検索結果配列              |

検索クエリにはスペース区切りで複数キーワードを指定可能（例: "TypeScript JavaScript"）。

**参照ドキュメント**:

- 設計詳細: [05-architecture.md](./05-architecture.md) - セクション5.10.5
- データベース設計: [15-database-design.md](./15-database-design.md) - chunksテーブル
- API設計: [08-api-design.md](./08-api-design.md) - セクション8.16

### Zod

| 項目           | 値       |
| -------------- | -------- |
| 推奨バージョン | `3.24.x` |
| 最小バージョン | `3.22.0` |

**選定理由**:

1. **TypeScript統合**: `z.infer`による自動型生成
2. **軽量**: 12KB gzipped
3. **エコシステム**: React Hook Form, tRPC対応
4. **学習コスト低**: 直感的なAPI

**スキーマ定義例（features/xxx/schema.ts）**

workflowInputSchemaの構造を以下に示す。

| フィールド        | 型                                           | 制約・デフォルト                     |
| ----------------- | -------------------------------------------- | ------------------------------------ |
| type              | enum                                         | BLOG_OUTLINE, DATA_ANALYSIS, CODE_REVIEW のいずれか |
| payload           | record（任意キー・任意値）                   | 必須                                 |
| options           | object（オプショナル）                       | 省略可能                             |
| options.maxTokens | number（整数）                               | 最小100、最大4000、デフォルト1000    |
| options.temperature | number                                     | 最小0、最大2、デフォルト0.7          |

スキーマから TypeScript 型を自動生成するには z.infer を使用する。実行時検証には parse メソッドを呼び出し、不正データの場合は例外がスローされる。

---

## AI統合

### Vercel AI SDK

| 項目           | 値                                                                     |
| -------------- | ---------------------------------------------------------------------- |
| 推奨バージョン | `4.1.x`                                                                |
| 最小バージョン | `4.0.0`                                                                |
| 関連パッケージ | `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/xai` |

**選定理由**:

1. **統一API**: 複数プロバイダを同一インターフェースで
2. **ストリーミング**: Server-Sent Eventsによるリアルタイム応答
3. **型安全**: Zodスキーマによる構造化出力
4. **Next.js統合**: Server Actionsとの親和性

**対応プロバイダ**:

| プロバイダ | パッケージ          | 推奨モデル        | 無料枠          |
| ---------- | ------------------- | ----------------- | --------------- |
| OpenAI     | `@ai-sdk/openai`    | gpt-4o-mini       | $5/月 (新規)    |
| Anthropic  | `@ai-sdk/anthropic` | claude-3-5-sonnet | なし            |
| Google     | `@ai-sdk/google`    | gemini-2.0-flash  | 60リクエスト/分 |
| xAI        | `@ai-sdk/xai`       | grok-2            | なし            |

**プロバイダ統合関数（shared/infrastructure/ai/provider.ts）**

generateWithProvider関数は、複数のAIプロバイダを統一インターフェースで利用可能にする。

| パラメータ | 型                                   | 説明                                 |
| ---------- | ------------------------------------ | ------------------------------------ |
| provider   | "openai" / "anthropic" / "google" / "xai" | 使用するAIプロバイダの指定           |
| prompt     | string                               | 生成に使用するプロンプト文字列       |

**プロバイダとモデルのマッピング**

| プロバイダ | 使用モデル                    | インポート元      |
| ---------- | ----------------------------- | ----------------- |
| openai     | gpt-4o-mini                   | @ai-sdk/openai    |
| anthropic  | claude-3-5-sonnet-20241022    | @ai-sdk/anthropic |
| google     | gemini-2.0-flash-exp          | @ai-sdk/google    |
| xai        | grok-2                        | @ai-sdk/xai       |

内部では ai パッケージの generateText 関数を呼び出し、選択されたプロバイダのモデルでテキスト生成を実行する。

### Structured Output

構造化出力は、AIの応答を型安全なオブジェクトとして取得する機能である。ai パッケージの generateObject 関数と Zod スキーマを組み合わせて使用する。

**blogOutlineSchemaの構造**

| フィールド                  | 型            | 説明                         |
| --------------------------- | ------------- | ---------------------------- |
| title                       | string        | ブログのタイトル             |
| sections                    | array         | セクション配列               |
| sections[].heading          | string        | セクション見出し             |
| sections[].keyPoints        | string[]      | 主要ポイントのリスト         |
| sections[].estimatedWords   | number        | 推定ワード数                 |
| metadata                    | object        | メタデータオブジェクト       |
| metadata.targetAudience     | string        | 対象読者                     |
| metadata.tone               | enum          | formal / casual / technical  |

**generateBlogOutline関数**

| 項目       | 値                               |
| ---------- | -------------------------------- |
| 入力       | topic（トピック文字列）          |
| 使用モデル | gpt-4o-mini                      |
| 出力       | スキーマに準拠した型安全なオブジェクト |

generateObject関数はスキーマに基づいてAIの応答を検証・パースし、型安全なオブジェクトを返す。

### 埋め込みプロバイダー

**実装場所**: `packages/shared/src/services/embedding/providers/`

#### OpenAI Embeddings

| 項目         | 値                     |
| ------------ | ---------------------- |
| モデル       | text-embedding-3-small |
| 次元数       | 1536                   |
| 最大トークン | 8,192トークン          |
| レート制限   | 1M tokens/分           |
| コスト       | $0.00002 / 1K tokens   |

**用途**: 高品質な意味検索、ドキュメント類似度計算

**特徴**:

- 高精度な意味表現
- 多言語対応
- 大規模なトレーニングデータ

#### Qwen3 Embeddings

| 項目         | 値               |
| ------------ | ---------------- |
| モデル       | qwen3-embedding  |
| 次元数       | 768              |
| 最大トークン | 4,096トークン    |
| レート制限   | プロバイダー依存 |
| コスト       | 変動             |

**用途**: 軽量な埋め込み生成、フォールバックオプション

**特徴**:

- OpenAIの約半分の次元数（メモリ効率）
- 高速な推論
- フォールバックチェーンの第2選択肢

#### プロバイダー選択戦略

**フォールバックチェーン**

| 優先順位 | プロバイダ      | 役割         | 遷移条件     |
| -------- | --------------- | ------------ | ------------ |
| 1        | OpenAIProvider  | 第一選択     | -            |
| 2        | Qwen3Provider   | フォールバック | エラー発生時 |

**選択基準**:

- 品質優先: OpenAI
- コスト優先: Qwen3
- 可用性優先: フォールバックチェーン有効化

### ベクトルデータベース

#### Chroma

| 項目         | 値                        |
| ------------ | ------------------------- |
| バージョン   | 最新安定版                |
| デプロイ形式 | ローカルプロセス / Docker |
| ストレージ   | ローカルファイルシステム  |

**選定理由**:

- ローカル実行可能（プライバシー保護）
- シンプルなPython/JavaScript API
- メタデータフィルタリング
- コレクション管理

**代替案**:

- Pinecone: クラウドのみ、コストが高い
- Milvus: 大規模用途向け、セットアップ複雑
- Weaviate: 機能豊富だが過剰

### 信頼性アルゴリズム

**実装場所**: `packages/shared/src/services/embedding/utils/`

#### Token Bucket（レート制限）

| パラメータ      | デフォルト値 |
| --------------- | ------------ |
| 容量            | 設定可能     |
| リフィル レート | 1M tokens/分 |
| バースト許容    | 設定可能     |

**用途**: API呼び出しレート制限の遵守

#### Circuit Breaker（サーキットブレーカー）

| 状態      | 遷移条件               |
| --------- | ---------------------- |
| CLOSED    | 正常動作中             |
| OPEN      | 失敗閾値（5回）到達    |
| HALF_OPEN | タイムアウト（60秒）後 |

**用途**: 障害サービスへの呼び出し遮断

#### Exponential Backoff（リトライ）

| パラメータ       | デフォルト値 |
| ---------------- | ------------ |
| 最大リトライ回数 | 3回          |
| 初期遅延         | 1000ms       |
| バックオフ倍率   | 2            |
| ジッター         | 有効         |

**用途**: 一時的な障害からの自動リカバリー

#### LRU Cache（キャッシング）

| パラメータ   | デフォルト値 |
| ------------ | ------------ |
| 最大エントリ | 1000         |
| TTL          | なし         |

**用途**: 埋め込み結果の再利用

#### Cosine Similarity（類似度計算）

| パラメータ     | デフォルト値 |
| -------------- | ------------ |
| 類似度閾値     | 0.95         |
| ベクトル正規化 | 有効         |

**用途**: 重複コンテンツ検出

---

## 開発ツール

### 必須ツール

| ツール     | バージョン | 用途                             |
| ---------- | ---------- | -------------------------------- |
| ESLint     | `9.x`      | コード品質チェック (Flat Config) |
| Prettier   | `3.x`      | コードフォーマット               |
| Vitest     | `2.x`      | ユニット/統合テスト              |
| Playwright | `1.49.x`   | E2Eテスト                        |

**ESLint設定（eslint.config.mjs - Flat Config形式）**

ルートの `eslint.config.js` では `typescript-eslint` を使用。`apps/backend/eslint.config.mjs` では `eslint-config-next` のネイティブ flat config をインポートしている。

| 設定項目                  | 値                                    | 説明                                      |
| ------------------------- | ------------------------------------- | ----------------------------------------- |
| ベース設定（ルート）      | eslint.configs.recommended            | ESLint推奨ルール                          |
| TypeScript設定（ルート）  | tseslint.configs.strictTypeChecked    | 型チェック付き厳格ルール                  |
| Next.js設定（backend）    | eslint-config-next/core-web-vitals    | Next.js推奨ルール（ネイティブ flat config）|
| lint コマンド（backend）  | eslint . --cache --cache-location ... | ESLint CLI 直接実行（Next.js 16対応）     |

Next.js 16 で `next lint` サブコマンドが削除されたため、`apps/backend` では ESLint CLI を直接実行する方式に移行済み（TASK-CI-FIX-001）。`eslint-config-next@16+` はネイティブ flat config をエクスポートするため、`FlatCompat` は不要。

**カスタムルール**

| ルール名                                | 設定値 | オプション                      |
| --------------------------------------- | ------ | ------------------------------- |
| @typescript-eslint/no-unused-vars       | error  | argsIgnorePattern: "^_"（_始まりの引数を許可） |
| @typescript-eslint/strict-boolean-expressions | error | -                               |

### オプションツール

| ツール    | バージョン | 用途                     | 導入タイミング |
| --------- | ---------- | ------------------------ | -------------- |
| Storybook | `8.x`      | コンポーネントカタログ   | UI安定後       |
| Sentry    | `8.x`      | エラー監視               | 本番運用開始時 |
| Chromatic | 最新       | ビジュアルリグレッション | UI安定後       |

---

## 完了タスク

### タスク: fix-backend-lint-next16（2026-01-29完了）

| 項目         | 内容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| タスクID     | TASK-CI-FIX-001                                                                         |
| 完了日       | 2026-01-29                                                                              |
| ステータス   | **完了**                                                                                |
| テスト数     | 5（自動テスト）+ 7（手動テスト項目）                                                    |
| 発見課題     | 1件（coverage/ ディレクトリの ignores 追加 → 修正済み）                                  |
| ドキュメント | `docs/30-workflows/TASK-CI-FIX-001-fix-backend-lint-next16/`                            |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| 機能テスト         | 4        | 4    | 0    |
| エラーハンドリング | 1        | 1    | 0    |
| キャッシュ検証     | 1        | 1    | 0    |
| 設定検証           | 1        | 1    | 0    |

#### 成果物

| 成果物             | パス                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/TASK-CI-FIX-001-fix-backend-lint-next16/outputs/phase-11/manual-test-result.md`        |
| 発見課題リスト     | `docs/30-workflows/TASK-CI-FIX-001-fix-backend-lint-next16/outputs/phase-11/discovered-issues.md`         |
| 実装ガイド         | `docs/30-workflows/TASK-CI-FIX-001-fix-backend-lint-next16/outputs/phase-12/implementation-guide.md`      |

---

## 関連ドキュメント

| ドキュメント              | パス                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| 実装ガイド                | `docs/30-workflows/TASK-CI-FIX-001-fix-backend-lint-next16/outputs/phase-12/implementation-guide.md` |
| apps/backend ESLint設定   | `apps/backend/eslint.config.mjs`                                                                     |
| apps/backend package.json | `apps/backend/package.json`                                                                          |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                          |
| ---------- | ---------- | --------------------------------------------------------------------------------- |
| 2026-01-29 | v1.2.0     | TASK-CI-FIX-001完了: ESLint設定をNext.js 16対応に更新、完了タスク・関連ドキュメント追加 |
| 2026-01-26 | v1.1.0     | 仕様ガイドライン準拠: コード例を表形式・文章に変換                                |
