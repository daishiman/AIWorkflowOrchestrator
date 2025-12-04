# 用語集 (Glossary)

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

## システム用語

| 用語 | 定義 |
|------|------|
| Workflow | システムが実行する一連の処理単位 |
| Executor | Workflow を実行するクラス |
| Registry | type文字列とExecutorクラスの対応表 |
| Local Agent | PC上で動作するファイル監視・同期プログラム |

## アーキテクチャ用語

| 用語 | 定義 |
|------|------|
| モノレポ | 複数のパッケージ/アプリを1つのリポジトリで管理する構造（pnpm workspaces使用） |
| ハイブリッドアーキテクチャ | 共通インフラ（shared）と機能プラグイン（features）を組み合わせた構造 |
| 垂直スライス | 機能ごとに必要な全要素を1フォルダに集約する設計手法 |

## パッケージ/ディレクトリ

| 用語 | 定義 |
|------|------|
| packages/shared | Web/Desktop共通コード（ui, core, infrastructure） |
| apps/web | Next.js Webアプリケーション（App Router、Server Components） |
| apps/desktop | Electronデスクトップアプリケーション（Main/Preload/Renderer） |
| features | 機能ごとの独立したビジネスロジック層 |

## UI/デザイン用語

| 用語 | 定義 |
|------|------|
| Design Tokens | デザイン要素を抽象化した変数（色、サイズ、フォント等）の3層構造 |
| Headless UI | スタイルを持たないロジックのみのUIコンポーネント（Radix UI） |
| Atomic Design | 4層コンポーネント階層（Primitives/Patterns/Features/Templates） |

## テスト用語

| 用語 | 定義 |
|------|------|
| RTL | React Testing Library、ユーザー視点のコンポーネントテスト |
| axe-core | アクセシビリティ自動テストエンジン（WCAG 2.1 AA準拠） |
| TDD | Test-Driven Development、テストを先に書いてから実装するサイクル |

## Electron用語

| 用語 | 定義 |
|------|------|
| Main Process | Electronのメインプロセス（Node.js環境、システムAPI） |
| Renderer Process | Electronのレンダラープロセス（Chromium環境、sandboxed） |
| Preload Scripts | RendererとMain間のセキュアなブリッジ（contextBridge） |
| contextBridge | Rendererに安全にAPIを公開するElectronの仕組み |
| contextIsolation | RendererとPreloadのコンテキスト分離（セキュリティ必須設定） |
| electron-builder | Electronアプリのビルド・パッケージング・配布ツール |
| electron-updater | Electron自動更新システム（GitHub Releases/S3対応） |

## データベース用語

| 用語 | 定義 |
|------|------|
| pgvector | PostgreSQL のベクトル検索拡張、AI 埋め込みベクトルの保存と類似検索 |
| JSONB | PostgreSQL の柔軟なJSON型カラム、スキーマレス設計に活用 |
| ソフトデリート | 物理削除せず deleted_at カラムで論理削除する手法 |

## インフラ用語

| 用語 | 定義 |
|------|------|
| Railway | 本システムのホスティング環境 |
| Nixpacks | Railwayのビルダー |
| 構造化ログ | JSON形式のログ、request_id/workflow_id/user_idを含む追跡可能なログ |
| 一時ストレージ | Railway の /tmp ディレクトリ、再デプロイ時に削除される |
| サーキットブレーカー | 外部API障害時に一時的に呼び出しを遮断し、システム全体を保護するパターン |

---

## 参考資料 (References)

### バックエンド

| 技術 | URL |
|------|-----|
| Next.js | https://nextjs.org/docs/app |
| Drizzle ORM | https://orm.drizzle.team |
| Vercel AI SDK | https://sdk.vercel.ai/docs |
| discord.js | https://discord.js.org |
| Railway | https://docs.railway.app |

### フロントエンド・UI

| 技術 | URL |
|------|-----|
| React | https://react.dev |
| Tailwind CSS | https://tailwindcss.com/docs |
| shadcn/ui | https://ui.shadcn.com |
| Radix UI | https://www.radix-ui.com/primitives/docs |
| Design Tokens | https://design-tokens.github.io/community-group/format/ |
| Storybook | https://storybook.js.org |

### テスト

| 技術 | URL |
|------|-----|
| Vitest | https://vitest.dev |
| React Testing Library | https://testing-library.com/react |
| Playwright | https://playwright.dev |
| axe-core | https://github.com/dequelabs/axe-core |
| Chromatic | https://www.chromatic.com/docs |
| MSW | https://mswjs.io |

### Electron

| 技術 | URL |
|------|-----|
| Electron | https://www.electronjs.org/docs/latest |
| electron-builder | https://www.electron.build |
| electron-updater | https://www.electron.build/auto-update |

---

## 関連ドキュメント

- [プロジェクト概要](./01-overview.md)
- [テクノロジースタック](./03-technology-stack.md)
- [アーキテクチャ設計](./05-architecture.md)
