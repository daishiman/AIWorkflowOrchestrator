# 統合システム設計仕様書：Universal AI Workflow Orchestrator

**Project Name:** Universal AI Workflow Orchestrator
**Version:** Final (Comprehensive)
**Date:** 2025-11-20
**Architecture:** Hybrid / Clean Architecture / Event-Driven
**Methodology:** Specification-Driven Development (SpecDD)

---

## 1\. プロジェクト概要 (Overview)

### 1.1 システムの目的

クラウド環境（Next.js）とローカル環境（PC）をシームレスに統合し、チャットツール（Discord/LINE）やファイル操作をトリガーとして、あらゆる業務プロセス（議事録作成、動画要約、データ変換など）を自動実行する「中央司令塔」システムを構築する。

### 1.2 設計の核心概念

1.  **Hybrid Architecture (ハイブリッド構成):**
    - 重い AI 処理やデータ管理はクラウドで行う。
    - ファイル監視やローカルアプリ連携は PC 上のエージェントが行う。
2.  **Infinite Extensibility (無限の拡張性):**
    - 将来的に「未知の業務フロー」が追加されても、データベースのテーブル変更を不要にする（JSONB 活用）。
    - 機能追加は「プラグイン」のように独立したコードを追加するだけで完了する。
3.  **Specification-Driven (仕様駆動):**
    - ソースコードではなく「仕様書（Markdown）」を正本とし、AI アシスタント（Claude Code）がそれを読み込んで実装を行うフローを確立する。

---

## 2\. 開発手法とプロジェクト構造 (Methodology & Structure)

### 2.1 ディレクトリ構造 (Master Directory Map)

「仕様」「設定」「コード」を明確に分離したルート構造を採用する。

```text
root/
├── .claude/                            # 【AI Config】AI開発アシスタント設定
│   ├── memory.md                       # プロジェクトの文脈・経緯
│   ├── rules.md                        # コーディング規約 (Clean Arch遵守など)
│   └── prompts/                        # 定型タスク用プロンプト
│
├── docs/                               # 【Specs】仕様書 (Single Source of Truth)
│   ├── 00-requirements/                # 要件定義書
│   ├── 10-architecture/                # アーキテクチャ設計図
│   ├── 20-specifications/              # 詳細仕様書 (ここからコードを生成)
│   │   ├── features/                   # 各機能の仕様 (例: youtube-summary.md)
│   │   └── api/                        # API仕様
│   └── 99-adr/                         # アーキテクチャ決定記録
│
├── src/                                # 【Cloud Code】Next.js アプリケーション
│   ├── core/                           # [Domain Layer] 依存なし・純粋な定義
│   │   ├── entities/                   # 型定義 (BaseWorkflow, WorkflowStatus)
│   │   ├── interfaces/
│   │   │   ├── IWorkflowExecutor.ts    # ★全機能が実装すべきインターフェース
│   │   │   └── IRepository.ts          # DB操作の抽象定義
│   │   └── errors/                     # カスタムエラー定義
│   │
│   ├── features/                       # [Application Layer] 機能プラグイン群
│   │   ├── registry.ts                 # type文字列とExecutorの対応表 (Map)
│   │   ├── validators/                 # 共通のZodバリデーター
│   │   └── implementations/            # ★ここに機能を追加していく
│   │       ├── youtube-summary/        # 機能A
│   │       │   ├── executor.ts         # 実処理 (IWorkflowExecutor実装)
│   │       │   ├── schema.ts           # 入出力のZod定義
│   │       │   └── __tests__/          # 機能テスト
│   │       └── meeting-minutes/        # 機能B
│   │           ├── executor.ts
│   │           └── ...
│   │
│   ├── infrastructure/                 # [Infrastructure Layer] 詳細実装
│   │   ├── database/
│   │   │   ├── db.ts                   # Neon接続
│   │   │   ├── schema.ts               # Drizzleテーブル定義
│   │   │   └── repositories/           # Repository実装
│   │   ├── ai/                         # Vercel AI SDKラッパー
│   │   ├── discord/                    # Botイベントリスナー, コマンド
│   │   └── storage/                    # ファイル保存ロジック
│   │
│   └── app/                            # [Presentation Layer] Next.js
│       ├── api/
│       │   ├── webhook/                # 外部トリガー受信口
│       │   └── agent/                  # ローカルAgent連携口
│       └── page.tsx                    # ダッシュボード (Optional)
│
├── local-agent/                        # 【Local Application】
│   ├── package.json                    # Agent専用の依存関係
│   ├── ecosystem.config.js             # ★PM2設定ファイル
│   ├── src/
│   │   ├── config.ts                   # 環境設定
│   │   ├── watcher.ts                  # Chokidarによる監視
│   │   └── sync.ts                     # API通信・ファイル保存
│   └── __tests__/                      # Agentテスト
│
├── tests/                              # 【E2E】Playwrightテスト
│
├── .github/                            # 【CI/CD】GitHub Actions
│   └── workflows/
│       ├── test.yml
│       └── deploy.yml
│
├── package.json                        # 依存関係 (pnpm)
├── vitest.config.ts                    # テスト設定
└── README.md                           # プロジェクト入口
```

---

## 3\. テクノロジースタック (Technology Stack)

最新のトレンド、パフォーマンス、保守性を考慮した厳選スタック。`npm` は使用せず `pnpm` で統一する。

### 3.1 Package & Process Management

- **Package Manager:** **`pnpm`** (高速・ディスク効率化)
- **Process Manager:** **`PM2`** (ローカル Agent の常駐・自動再起動・ログ管理)

### 3.2 Core Framework (Cloud)

- **Framework:** `Next.js 15` (App Router / Server Actions)
- **Language:** `TypeScript` (Strict Mode)
- **Runtime:** `Node.js` (v20 LTS 以上)

### 3.3 Database & Data Integrity

- **Database:** `Neon` (Serverless PostgreSQL)
- **ORM:** `Drizzle ORM` (SQL ライク・軽量), `Drizzle Kit`
- **Validation:** `Zod` (JSONB データのスキーマ検証・型ガード)
- **Env Validation:** `@t3-oss/env-nextjs`

### 3.4 AI & Logic Modules

- **AI SDK:** `Vercel AI SDK (Core)`
- **Models:** `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`
- **Date Utils:** `date-fns`

### 3.5 External Integrations

- **Discord:** `discord.js` (Gateway Intents 対応)
- **Google:** `googleapis` (Drive/Docs API)
- **HTTP Client:** `axios` (ローカル Agent 用)

### 3.6 Quality Assurance (Testing)

- **Unit/Integration:** **`Vitest`** (Vite ベースの高速ランナー)
- **E2E Testing:** **`Playwright`** (ブラウザ操作テスト)
- **Static Analysis:** `ESLint`, `Prettier`, `eslint-plugin-boundaries` (Clean Architecture の依存ルール強制)

### 3.7 Infrastructure & DevOps

- **Hosting:** `Railway` (App Service + Cron)
- **CI/CD:** `GitHub Actions`

---

## 4\. アーキテクチャ設計詳細 (Architecture Details)

### 4.1 クリーンアーキテクチャの適用

コードの依存関係を以下の通り制御し、技術の変更がビジネスロジックを破壊しないようにする。

1.  **Entities (Core/Entities):**
    - ドメインモデル、共通の型定義（`WorkflowStatus`など）。外部依存ゼロ。
2.  **Use Cases (Core/Interfaces & Features):**
    - アプリケーション固有のビジネスルール。
    - すべての機能は `IWorkflowExecutor` インターフェースを実装する。
3.  **Interface Adapters (Infrastructure/Repositories):**
    - データを DB や外部 API に適した形に変換する層。
4.  **Frameworks & Drivers (Infrastructure/Database, App):**
    - Next.js, Drizzle, Discord API などの詳細実装。

### 4.2 データモデル（シングルテーブル継承 + JSONB）

すべての業務フローを `workflows` テーブル一つで管理する。

| カラム名             | データ型  | 説明                                             |
| :------------------- | :-------- | :----------------------------------------------- |
| `id`                 | UUID      | 一意な ID                                        |
| `type`               | Varchar   | **処理識別子** (例: `YOUTUBE_SUMMARIZE`)         |
| `user_id`            | Varchar   | 実行ユーザー ID                                  |
| `status`             | Enum      | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`   |
| **`input_payload`**  | **JSONB** | **柔軟な入力データ** (Zod スキーマで検証)        |
| **`output_payload`** | **JSONB** | **柔軟な出力データ** (AI 生成結果、ファイルパス) |
| `error_log`          | Text      | エラー詳細                                       |
| `created_at`         | Timestamp | 作成日時                                         |

---

## 5\. アプリケーションロジック (Application Logic)

### 5.1 Strategy Pattern (戦略パターン)

多種多様な業務フローを統一的に扱うための仕組み。

1.  **Registry:** `features/registry.ts` にて、文字列キー（`type`）と実行クラスのマッピングを保持する。
2.  **Executor:** 各機能（`features/implementations/xxx/executor.ts`）は、以下の共通メソッドを持つ。
    - `execute(input: InputSchema): Promise<OutputSchema>`
3.  **Flow:**
    - リクエスト受信 → `type` 判定 → Registry からクラス取得 → `execute()` 実行 → 結果を JSONB に保存。

### 5.2 機能追加フロー (Feature Plugin)

新しい機能（例：CSV 分析）を追加する場合：

1.  `docs/20-specifications/features/csv-analysis.md` を作成。
2.  AI に指示し、`src/features/implementations/csv-analysis/` を生成。
    - `schema.ts`: 入出力の Zod 定義。
    - `executor.ts`: 処理ロジック。
3.  `registry.ts` に 1 行追加。**（DB 変更は不要）**

---

## 6\. ローカル Agent 仕様 (Local Agent Specification)

PC 上でバックグラウンド動作し、クラウドの手足となるエージェント。

### 6.1 構成要素

- **Watcher (`chokidar`):** 指定フォルダ(`InputBox`)を監視。ファイル追加(`add`)イベントを検知。
- **Sync (`axios`):**
  - **Upload:** 検知したファイルを `FormData` でクラウド API へ POST。
  - **Download:** 定期的にクラウド API をポーリングし、完了ステータスのタスクがあれば成果物をダウンロードして `OutputBox` へ保存。

### 6.2 運用管理 (PM2)

`local-agent/ecosystem.config.js` によりプロセス管理を行う。

```javascript
module.exports = {
  apps: [
    {
      name: "ai-workflow-agent",
      script: "./dist/watcher.js", // TSビルド後のファイル
      instances: 1,
      autorestart: true, // クラッシュ時自動再起動
      watch: false,
      env: {
        NODE_ENV: "production",
        API_ENDPOINT: "https://...",
        AGENT_SECRET: "...",
      },
    },
  ],
};
```

---

## 7\. 外部インターフェース (External Interfaces)

### 7.1 Discord Bot

- **Message Listener:** メンションまたは特定チャンネルの投稿を監視。
- **Router:** 投稿内容（URL、ファイル、自然言語）を解析し、適切なワークフローの `type` を推定して起動する。
- **Notification:** 処理完了時、スレッドに返信またはファイルをアップロードする。

### 7.2 Webhook API

- **Endpoint:** `POST /api/webhook/generic`
- **Role:** Google Forms, n8n, Zapier 等からの汎用的な入り口。JSON ペイロードを受け取りワークフローを起動する。

---

## 8\. CI/CD & 品質保証 (CI/CD Pipeline)

GitHub Actions を使用し、自動化された品質ゲートを設ける。

### 8.1 `test.yml` (Pull Request 時)

1.  **Setup:** `pnpm` 環境セットアップ。
2.  **Lint:** `pnpm lint` (ESLint + Prettier) でコード規約違反をブロック。
3.  **Type Check:** `tsc --noEmit` で型エラーをブロック。
4.  **Test:** `pnpm test` (Vitest) で単体・結合テストを実行。

### 8.2 `deploy.yml` (Main Merge 時)

1.  **Verify:** テストを再実行。
2.  **Deploy:** `railwayapp/cli` を使用して Railway 本番環境へデプロイ。

---

## 9\. 環境変数管理 (Environment Variables)

セキュリティのため、以下の変数は `.env` で管理し、リポジトリにはコミットしない。

```env
# --- Cloud (Next.js) ---
DATABASE_URL="postgresql://user:pass@neondb..."
OPENAI_API_KEY="sk-..."
DISCORD_TOKEN="M..."
AGENT_SECRET_KEY="random-string-shared-secret" # Agent認証用

# --- Local Agent ---
API_BASE_URL="https://my-app.railway.app"
AGENT_SECRET_KEY="random-string-shared-secret" # 上記と同じもの
WATCH_DIR="./InputBox"
OUTPUT_DIR="./OutputBox"
```

---

以上が、すべての要件を網羅した統合システム設計書となります。このドキュメントに基づき、仕様書作成と AI による実装を開始してください。
