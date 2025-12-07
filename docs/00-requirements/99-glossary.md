# 用語集 (Glossary)

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

---

## システム用語

| 用語        | 定義                                                                          |
| ----------- | ----------------------------------------------------------------------------- |
| Workflow    | システムが実行する一連の処理単位。入力を受け取り、処理を行い、出力を返す      |
| Executor    | Workflow を実行するクラス。IWorkflowExecutor インターフェースを実装           |
| Registry    | type 文字列と Executor クラスの対応表。ワークフロータイプから実行クラスを取得 |
| Local Agent | PC上で動作するファイル監視・同期プログラム。Chokidar + PM2 で構成             |
| Plugin      | 機能を拡張するためのモジュール。Executor として実装                           |

## アーキテクチャ用語

| 用語                       | 定義                                                                           |
| -------------------------- | ------------------------------------------------------------------------------ |
| モノレポ                   | 複数のパッケージ/アプリを1つのリポジトリで管理する構造。pnpm workspaces を使用 |
| ハイブリッドアーキテクチャ | 共通インフラ（shared）と機能プラグイン（features）を組み合わせた構造           |
| Clean Architecture         | 依存関係を外側から内側へ制御する設計パターン。コアは外部に依存しない           |
| 垂直スライス               | 機能ごとに必要な全要素（UI、ロジック、テスト）を1フォルダに集約する設計手法    |
| Offline-First              | ネットワーク接続がない状態でも動作することを前提とした設計                     |
| Event-driven               | イベント（ファイル追加、メッセージ受信など）をトリガーに処理を実行する設計     |

## パッケージ/ディレクトリ

| 用語            | 定義                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| packages/shared | Web/Desktop 共通コード。ui、core、infrastructure の3層で構成             |
| apps/web        | Next.js Web アプリケーション。App Router、Server Components を使用       |
| apps/desktop    | Electron デスクトップアプリケーション。Main/Preload/Renderer の3プロセス |
| features        | 機能ごとの独立したビジネスロジック層。schema、executor、テストを含む     |
| local-agent     | ローカルファイル監視エージェント。PM2 でプロセス管理                     |

## インターフェース用語

| 用語              | 定義                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| IWorkflowExecutor | すべてのプラグインが実装するインターフェース。execute メソッドがメイン処理 |
| IRepository       | データアクセスを抽象化するインターフェース。CRUD 操作を定義                |
| IAIClient         | AI プロバイダーへのアクセスを抽象化するインターフェース                    |
| IFileWatcher      | ファイルシステム監視のためのインターフェース                               |
| ExecutionContext  | Executor 実行時に渡されるコンテキスト情報。workflowId、userId、logger など |
| Result型          | 成功・失敗を明示的に表現する型。例外を使わないエラーハンドリングに使用     |

## UI/デザイン用語

| 用語          | 定義                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| Design Tokens | デザイン要素を抽象化した変数。Global、Alias、Component の3層構造                |
| Headless UI   | スタイルを持たないロジックのみの UI コンポーネント。Radix UI が代表例           |
| Atomic Design | コンポーネント階層。本システムでは Primitives/Patterns/Features/Templates の4層 |
| Apple HIG     | Apple Human Interface Guidelines。macOS アプリのデザインガイドライン            |
| shadcn/ui     | Radix UI をベースにした再利用可能なコンポーネント集                             |

## テスト用語

| 用語       | 定義                                                                |
| ---------- | ------------------------------------------------------------------- |
| RTL        | React Testing Library。ユーザー視点のコンポーネントテストライブラリ |
| Vitest     | Vite ベースの高速テストフレームワーク                               |
| Playwright | E2E テストフレームワーク。ブラウザ自動操作                          |
| axe-core   | アクセシビリティ自動テストエンジン。WCAG 2.1 AA 準拠をチェック      |
| TDD        | Test-Driven Development。テストを先に書いてから実装するサイクル     |
| MSW        | Mock Service Worker。API モックライブラリ                           |

## Electron 用語

| 用語             | 定義                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| Main Process     | Electron のメインプロセス。Node.js 環境、システム API にアクセス可能 |
| Renderer Process | Electron のレンダラープロセス。Chromium 環境、sandbox 有効           |
| Preload Scripts  | Renderer と Main 間のセキュアなブリッジ。contextBridge を使用        |
| contextBridge    | Renderer に安全に API を公開する Electron の仕組み                   |
| contextIsolation | Renderer と Preload のコンテキスト分離。セキュリティ必須設定         |
| nodeIntegration  | Renderer での Node.js API 使用設定。セキュリティ上、無効にする       |
| electron-builder | Electron アプリのビルド・パッケージング・配布ツール                  |
| electron-updater | Electron 自動更新システム。GitHub Releases/S3 対応                   |
| IPC              | Inter-Process Communication。プロセス間通信                          |

## データベース用語

| 用語              | 定義                                                               |
| ----------------- | ------------------------------------------------------------------ |
| Turso             | libSQL ベースのエッジデータベースサービス。SQLite 互換             |
| libSQL            | SQLite のフォーク。Turso のベース技術                              |
| Embedded Replicas | Turso の機能。ローカルに SQLite レプリカを保持し、オフライン対応   |
| Drizzle ORM       | TypeScript ファーストの型安全な ORM                                |
| スキーマ          | データベースのテーブル定義、カラム定義                             |
| マイグレーション  | データベーススキーマの変更を管理する仕組み                         |
| ソフトデリート    | 物理削除せず deleted_at カラムで論理削除する手法                   |
| JSON              | SQLite の JSON 型カラム。スキーマレス設計に活用（TEXT として保存） |

## 認証・認可用語

| 用語           | 定義                                                       |
| -------------- | ---------------------------------------------------------- |
| Discord OAuth2 | Discord を使用した認証フロー。Authorization Code Grant     |
| Bearer Token   | Authorization ヘッダーで送信する認証トークン               |
| API Key        | Local Agent 認証用のキー。X-Agent-Key ヘッダーで送信       |
| セッション     | ユーザーの認証状態を保持する仕組み                         |
| CSRF           | Cross-Site Request Forgery。クロスサイトリクエスト偽造攻撃 |
| XSS            | Cross-Site Scripting。クロスサイトスクリプティング攻撃     |

## エラーハンドリング用語

| 用語                 | 定義                                                |
| -------------------- | --------------------------------------------------- |
| ValidationError      | 入力バリデーション失敗時のエラー。リトライ不可      |
| BusinessError        | ビジネスルール違反のエラー。リトライ不可            |
| ExternalServiceError | AI API などの外部サービスエラー。リトライ可能       |
| InternalError        | 予期しない内部エラー。リトライ不可                  |
| リトライ             | エラー発生時に再実行を試みる処理                    |
| 指数バックオフ       | リトライ間隔を指数関数的に増加させる戦略            |
| サーキットブレーカー | 外部 API 障害時に一時的に呼び出しを遮断するパターン |

## インフラ用語

| 用語           | 定義                                                     |
| -------------- | -------------------------------------------------------- |
| Railway        | 本システムのホスティング環境。PaaS                       |
| Nixpacks       | Railway のビルダー。自動でビルド設定を検出               |
| GitHub Actions | CI/CD パイプライン。テスト、ビルド、デプロイを自動化     |
| PM2            | Node.js プロセスマネージャー。Local Agent の管理に使用   |
| 構造化ログ     | JSON 形式のログ。request_id、workflow_id、user_id を含む |
| 一時ストレージ | Railway の /tmp ディレクトリ。再デプロイ時に削除される   |
| ヘルスチェック | システムの稼働状態を確認するエンドポイント               |
| レート制限     | API の呼び出し回数を制限する仕組み                       |

## AI 用語

| 用語           | 定義                                    |
| -------------- | --------------------------------------- |
| Vercel AI SDK  | AI プロバイダーを統一的に扱うための SDK |
| LLM            | Large Language Model。大規模言語モデル  |
| プロンプト     | AI に送信する指示文                     |
| トークン       | AI が処理するテキストの最小単位         |
| ストリーミング | AI の応答を逐次的に受信する方式         |

---

## 参考資料 (References)

### バックエンド

| 技術          | URL                         |
| ------------- | --------------------------- |
| Next.js       | https://nextjs.org/docs/app |
| Drizzle ORM   | https://orm.drizzle.team    |
| Turso         | https://docs.turso.tech     |
| libSQL        | https://libsql.org          |
| Vercel AI SDK | https://sdk.vercel.ai/docs  |
| discord.js    | https://discord.js.org      |
| Railway       | https://docs.railway.app    |

### フロントエンド・UI

| 技術          | URL                                                     |
| ------------- | ------------------------------------------------------- |
| React         | https://react.dev                                       |
| Tailwind CSS  | https://tailwindcss.com/docs                            |
| shadcn/ui     | https://ui.shadcn.com                                   |
| Radix UI      | https://www.radix-ui.com/primitives/docs                |
| Design Tokens | https://design-tokens.github.io/community-group/format/ |
| Storybook     | https://storybook.js.org                                |

### テスト

| 技術                  | URL                                   |
| --------------------- | ------------------------------------- |
| Vitest                | https://vitest.dev                    |
| React Testing Library | https://testing-library.com/react     |
| Playwright            | https://playwright.dev                |
| axe-core              | https://github.com/dequelabs/axe-core |
| MSW                   | https://mswjs.io                      |

### Electron

| 技術             | URL                                                           |
| ---------------- | ------------------------------------------------------------- |
| Electron         | https://www.electronjs.org/docs/latest                        |
| electron-builder | https://www.electron.build                                    |
| electron-updater | https://www.electron.build/auto-update                        |
| Apple HIG        | https://developer.apple.com/design/human-interface-guidelines |

### セキュリティ

| 技術     | URL                                     |
| -------- | --------------------------------------- |
| OWASP    | https://owasp.org                       |
| WCAG 2.1 | https://www.w3.org/WAI/WCAG21/quickref/ |

---

## 関連ドキュメント

- [プロジェクト概要](./01-overview.md)
- [テクノロジースタック](./03-technology-stack.md)
- [アーキテクチャ設計](./05-architecture.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
