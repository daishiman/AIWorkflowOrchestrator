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

| 用語                    | 定義                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| Design Tokens           | デザイン要素を抽象化した変数。Global、Alias、Component の3層構造                              |
| Headless UI             | スタイルを持たないロジックのみの UI コンポーネント。Radix UI が代表例                         |
| Atomic Design           | コンポーネント階層。本システムでは Primitives/Patterns/Features/Templates の4層               |
| Apple HIG               | Apple Human Interface Guidelines。macOS アプリのデザインガイドライン                          |
| shadcn/ui               | Radix UI をベースにした再利用可能なコンポーネント集                                           |
| React Portal            | React の`createPortal` API。DOM階層の任意の位置にコンポーネントをレンダリングする機能         |
| Stacking Context        | CSS の z-index が有効な範囲を決定するレイヤー。`backdrop-filter`, `transform`等で作成される   |
| WAI-ARIA Menu Pattern   | キーボードナビゲーション、フォーカス管理を定義したアクセシビリティパターン（role="menu"使用） |
| createPortal            | React Portal を作成する関数。`createPortal(children, domNode)` で document.body 等に描画可能  |
| getBoundingClientRect() | DOM 要素の位置・サイズを取得する API。Portal の位置計算に使用                                 |

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

## RAG 用語

### 基本概念

| 用語          | 定義                                                                         |
| ------------- | ---------------------------------------------------------------------------- |
| RAG           | Retrieval-Augmented Generation。検索拡張生成。外部知識を検索してLLMに提供    |
| GraphRAG      | Knowledge Graphを活用したRAG。エンティティと関係性を構造化して検索精度を向上 |
| チャンク      | 文書を分割した単位。通常500-2000文字程度。RAGパイプラインの基本単位          |
| チャンキング  | テキストを適切なサイズと意味のまとまりに分割する処理                         |
| 埋め込み      | テキストを高次元ベクトルに変換した表現。意味的類似度の計算に使用             |
| ベクトル検索  | 埋め込みベクトル間の類似度に基づいて関連コンテンツを検索する技術             |
| Hybrid Search | キーワード検索とベクトル検索を組み合わせた検索手法                           |

### Knowledge Graph

| 用語             | 定義                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------- |
| Knowledge Graph  | 知識をグラフ構造（ノードとエッジ）で表現したデータ。エンティティ間の関係性を保持       |
| Entity           | Knowledge Graphのノード（頂点）。人物、組織、技術、概念等を表現                        |
| Relation         | Knowledge Graphのエッジ（辺）。エンティティ間の関係性を表現                            |
| Community        | 意味的に関連するエンティティ群のクラスター。Leiden Algorithmで検出                     |
| Normalized Name  | エンティティ名を正規化した形式。重複排除・検索性向上に使用                             |
| Evidence         | 関係の証拠となるチャンク情報。出典の透明性を保証                                       |
| Self-loop        | ノードが自分自身に接続する辺。Knowledge Graphでは禁止                                  |
| Bidirectional    | 双方向の関係。related_to、concurrent_with等                                            |
| Graph Density    | グラフの密度。エッジ数と最大可能エッジ数の比率                                         |
| PageRank         | グラフのノード重要度を計算するアルゴリズム。本システムでは簡易版（接続数ベース）を使用 |
| Leiden Algorithm | コミュニティ検出アルゴリズム。階層的クラスタリングが可能                               |

### ベクトル演算・データ構造

| 用語               | 定義                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| Float32Array       | 32ビット浮動小数点数の配列。埋め込みベクトルの効率的な保存に使用      |
| コサイン類似度     | 2つのベクトル間の角度に基づく類似度指標。-1から1の範囲（1が完全一致） |
| L2正規化           | ベクトルの大きさを1に正規化する処理。コサイン類似度計算の前処理       |
| Contextual Content | チャンクに周辺文脈を付加したコンテンツ。RAGの精度向上に寄与           |
| 内積               | 2つのベクトルの対応要素の積の総和。類似度計算の基礎                   |
| ユークリッド距離   | 2つのベクトル間の直線距離。L2距離とも呼ばれる                         |
| ベクトルの大きさ   | ベクトルのL2ノルム。原点からの距離                                    |
| Base64エンコード   | バイナリデータを文字列に変換する手法。ベクトルのシリアライズに使用    |

### チャンキング戦略

| 戦略            | 定義                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| fixed_size      | 固定トークン数で機械的に分割。シンプルで予測可能                       |
| semantic        | 意味的まとまりに基づいて分割。AI活用により高品質だが計算コスト高       |
| recursive       | 再帰的に分割してバランスを取る。汎用性とバランスに優れる（デフォルト） |
| sentence        | 文単位で分割。文脈保持に優れる                                         |
| paragraph       | 段落単位で分割。長文ドキュメント向け                                   |
| markdown_header | Markdownヘッダー階層に従って分割。構造化文書に最適                     |
| code_block      | コードブロック単位で分割。プログラムコード処理に特化                   |

### 埋め込みプロバイダー

| プロバイダー | 定義                                                                  |
| ------------ | --------------------------------------------------------------------- |
| openai       | OpenAI Embeddings API。text-embedding-3-small等。1536次元、高品質     |
| cohere       | Cohere Embeddings API。embed-english-v3.0等。1024次元、多言語対応     |
| voyage       | Voyage AI Embeddings。voyage-2等。1024次元、高精度                    |
| local        | ローカル実行モデル。all-MiniLM-L6-v2等。384次元、オフライン対応、軽量 |

### ベクトル演算

| 用語             | 定義                                                               |
| ---------------- | ------------------------------------------------------------------ |
| 内積             | 2つのベクトルの対応要素の積の総和。類似度計算の基礎                |
| ユークリッド距離 | 2つのベクトル間の直線距離。L2距離とも呼ばれる                      |
| ベクトルの大きさ | ベクトルのL2ノルム。原点からの距離                                 |
| Base64エンコード | バイナリデータを文字列に変換する手法。ベクトルのシリアライズに使用 |

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
