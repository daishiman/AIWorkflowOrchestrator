# テクノロジースタック (Technology Stack)

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

## 3.1 選定基準

各技術は以下の基準で選定：

| 基準         | 説明                                            |
| ------------ | ----------------------------------------------- |
| 成熟度       | プロダクション実績があること                    |
| エコシステム | ドキュメント・コミュニティが充実していること    |
| 保守性       | 長期サポートが期待できること                    |
| AI親和性     | AI（Claude Code）による実装支援が容易であること |

## 3.2 Package & Process Management

| 技術 | バージョン | 採用理由                                       |
| ---- | ---------- | ---------------------------------------------- |
| pnpm | 9.x        | ディスク効率、高速インストール、厳格な依存解決 |
| PM2  | 5.x        | プロセス常駐、自動再起動、ログ管理が統合       |

## 3.3 Core Framework (Cloud)

| 技術       | バージョン | 採用理由                                                  |
| ---------- | ---------- | --------------------------------------------------------- |
| Next.js    | 15.x       | App Router、Server Actions、RSCによるパフォーマンス最適化 |
| TypeScript | 5.x        | Strict Mode による型安全性確保                            |
| Node.js    | 22.x LTS   | 最新ESM対応、パフォーマンス向上                           |

## 3.4 Database & Data Integrity

| 技術             | バージョン | 採用理由                                                                 |
| ---------------- | ---------- | ------------------------------------------------------------------------ |
| Turso (Cloud)    | -          | libSQL（SQLite互換）ベースのエッジDB、オフライン同期対応、無料枠充実     |
| libSQL           | 最新       | SQLiteのオープンソースフォーク、Tursoのベース技術、ローカル/クラウド統一 |
| SQLite (Desktop) | 3.x        | libSQL互換、オフライン対応、ファイルベース、軽量、Electronと相性良好     |
| @libsql/client   | 最新       | Turso/libSQL公式クライアント、ローカルファイル・リモートDB両対応         |
| Drizzle ORM      | 0.39.x     | SQLライク構文、軽量、型推論が優秀、libSQL/SQLite完全対応                 |
| Zod              | 3.x        | TypeScript型との一体化、軽量、エラーメッセージ優秀                       |

### データベース統一戦略（Turso + libSQL）

| 環境               | データベース      | 接続方法                     | 用途                               |
| ------------------ | ----------------- | ---------------------------- | ---------------------------------- |
| デスクトップアプリ | SQLiteファイル    | `@libsql/client` (file:)     | オフライン動作、ローカルデータ     |
| バックエンドAPI    | Turso             | `@libsql/client` (libsql://) | クラウドデータ、マルチクライアント |
| 同期               | Embedded Replicas | Turso内蔵機能                | ローカル↔クラウド自動同期          |

**統一のメリット**:

- 同一のDrizzleスキーマをデスクトップ・バックエンドで共有
- SQLite互換によりクエリコードが完全に統一
- オフライン対応とクラウド同期を両立
- App Store配布要件（オフライン動作）を満たす

## 3.5 AI & Logic Modules

| 技術              | バージョン | 採用理由                                             |
| ----------------- | ---------- | ---------------------------------------------------- |
| Vercel AI SDK     | 4.x        | 統一インターフェース、ストリーミング対応、構造化出力 |
| @ai-sdk/openai    | 最新       | GPT-4o対応、Function Calling                         |
| @ai-sdk/anthropic | 最新       | Claude 3.5対応、長文コンテキスト                     |
| @ai-sdk/google    | 最新       | Gemini対応、マルチモーダル                           |
| date-fns          | 4.x        | Tree-shakeable、軽量、イミュータブル                 |

## 3.6 External Integrations

| 技術       | バージョン | 採用理由                                  |
| ---------- | ---------- | ----------------------------------------- |
| discord.js | 14.x       | 公式推奨、Gateway Intents対応、型定義充実 |
| googleapis | 最新       | 公式SDK、全Google API対応                 |

## 3.7 Quality Assurance

| 技術                        | バージョン | 採用理由                                                |
| --------------------------- | ---------- | ------------------------------------------------------- |
| Vitest                      | 2.x        | Vite互換、ESM対応、高速、Jest互換API                    |
| @testing-library/react      | 最新       | ユーザー視点テスト、ベストプラクティス、RTL推奨パターン |
| @testing-library/user-event | 最新       | 実ユーザー操作シミュレーション                          |
| Playwright                  | 最新       | クロスブラウザ、APIテスト、自動待機、E2Eテスト          |
| @axe-core/playwright        | 最新       | WCAG 2.1 AA準拠の自動アクセシビリティテスト             |
| jest-axe                    | 最新       | Vitest統合アクセシビリティテスト                        |
| Chromatic                   | 最新       | ビジュアルリグレッションテスト（Storybook統合）         |
| MSW                         | 最新       | Mock Service Worker、型安全なAPIモック                  |
| ESLint                      | 9.x        | Flat Config、プラグイン豊富、境界チェック               |
| Prettier                    | 3.x        | デファクトスタンダード、ESLint統合                      |

## 3.8 Frontend & Desktop Stack

| 技術             | バージョン | 採用理由                                                          |
| ---------------- | ---------- | ----------------------------------------------------------------- |
| React            | 18.x       | Server Components、Suspense、Concurrent Features                  |
| Electron         | 最新       | クロスプラットフォームデスクトップアプリ                          |
| electron-builder | 最新       | マルチプラットフォームビルド、コード署名、インストーラー生成      |
| electron-updater | 最新       | 自動更新システム（stable/beta/alphaチャネル対応）                 |
| Vite             | 5.x        | 高速ビルド、HMR、ESM対応                                          |
| Tailwind CSS     | 3.x        | ユーティリティファースト、Design Tokens統合                       |
| shadcn/ui        | 最新       | Headless UIコンポーネント、アクセシビリティ対応、カスタマイズ可能 |
| Radix UI         | 最新       | Headless Primitives、ARIA対応、キーボードナビゲーション           |
| Zustand          | 最新       | 軽量状態管理、React Context補完                                   |
| Jotai            | 最新       | Atomic状態管理、React Suspense統合                                |
| Storybook        | 8.x        | コンポーネントカタログ、ビジュアルテスト、ドキュメンテーション    |

## 3.9 Desktop-Specific Libraries

| 技術           | バージョン | 採用理由                                                                            |
| -------------- | ---------- | ----------------------------------------------------------------------------------- |
| Chart.js       | 4.x        | ログデータの可視化、軽量、カスタマイズ可能、Reactコンポーネント対応                 |
| jsPDF          | 最新       | PDFレポート生成、ブラウザ環境で動作、Electronと相性良好                             |
| csv-writer     | 最新       | CSV形式エクスポート、型安全、ストリーム対応                                         |
| electron-log   | 最新       | Electronアプリ専用ログライブラリ、Main/Rendererプロセス統合、ファイルローテーション |
| electron-store | 最新       | Electron設定管理、暗号化対応、型安全、ユーザー設定永続化                            |
| chokidar       | 3.x        | ファイル監視、クロスプラットフォーム、高パフォーマンス                              |
| piscina        | 最新       | ワーカースレッドプール、重い処理の並列実行、CPU密集型タスク対応                     |

## 3.10 Infrastructure

| 技術           | 採用理由                                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Railway        | Git統合による自動デプロイ、長時間処理対応、Cron/バックグラウンドジョブ対応、環境変数グループ機能、プレビュー環境自動生成、使用量ベース課金で予測可能なコスト、CLI統合による優れた開発者体験 |
| Turso          | libSQL（SQLite互換）エッジDB、グローバル分散、Embedded Replicas同期、無料枠充実（500MB、10億読み取り/月）                                                                                   |
| GitHub Actions | GitHub統合、無料枠十分、豊富なアクション、Railway自動デプロイとの親和性                                                                                                                     |
| Railway CLI    | ローカル開発環境との統合、環境変数同期、ログストリーミング、デバッグ効率化、Railwayエコシステムの標準ツール                                                                                 |

---

## 関連ドキュメント

- [プロジェクト概要](./01-overview.md)
- [非機能要件](./02-non-functional-requirements.md)
- [ディレクトリ構造](./04-directory-structure.md)
