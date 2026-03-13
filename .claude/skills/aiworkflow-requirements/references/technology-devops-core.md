# DevOps技術スタック（パッケージ管理・CI/CD） / core specification

> 親仕様書: [technology-devops.md](technology-devops.md)
> 役割: core specification

## 概要

### 目的

本ドキュメントは、AIWorkflowOrchestratorプロジェクトで使用する技術スタックを定義し、以下を明確にする:

- **技術選定の理由**: なぜその技術を選んだのか
- **バージョン管理戦略**: 互換性とアップデート方針
- **個人開発における最適化**: コスト、学習コスト、保守性のバランス
- **依存関係の管理方針**: 肥大化防止と最小構成の維持

### 技術選定の基本原則

個人開発における技術選定の3原則を以下に示す。

| 原則 | 説明 | 具体例 |
| ---- | ---- | ------ |
| 学習コストの最小化 | 広く使われ、ドキュメントが充実した技術を優先 | React, Next.js, TypeScript |
| 無料枠の最大活用 | 無料tier内で運用可能なサービスを選択 | Vercel, Turso, Railway |
| 型安全性の徹底 | 静的型検査と実行時検証を組み合わせる | TypeScript strict mode + Zod |

### アーキテクチャ概要

本プロジェクトはpnpm Monorepo構成を採用している。

**アプリケーション層（apps/）**:

| ディレクトリ | 技術 | 説明 |
| ------------ | ---- | ---- |
| apps/web | Next.js 15 (App Router) | Webアプリケーション |
| apps/desktop | Electron + Next.js | デスクトップアプリケーション（将来対応） |

**共有パッケージ層（packages/）**:

| ディレクトリ | 説明 |
| ------------ | ---- |
| packages/shared | 共通ロジック、型定義、ユーティリティ |

**外部サービス**:

| サービス | 用途 | 無料枠 |
| -------- | ---- | ------ |
| Turso | 分散SQLite | 9GB、500Mリクエスト/月 |
| Railway | ホスティング | 従量課金 |
| AI Provider | LLM統合 | OpenAI / Anthropic / Google / xAI |

---

## パッケージ構成詳細

### apps/web (Next.js Webアプリ)

パッケージ名: @repo/web

**本番依存関係（dependencies）**:

| カテゴリ | パッケージ | バージョン | 用途 |
| -------- | ---------- | ---------- | ---- |
| フレームワーク | next | ^15.1.0 | App Router対応 |
| フレームワーク | react | ^19.0.0 | UIライブラリ |
| フレームワーク | react-dom | ^19.0.0 | DOM描画 |
| データベース | @libsql/client | ^0.14.0 | Tursoクライアント |
| データベース | drizzle-orm | ^0.38.0 | ORMライブラリ |
| AI | ai | ^4.1.0 | Vercel AI SDK |
| AI | @ai-sdk/openai | ^1.1.0 | OpenAI統合 |
| AI | @ai-sdk/anthropic | ^1.1.0 | Anthropic統合 |
| AI | @ai-sdk/google | ^1.1.0 | Google AI統合 |
| バリデーション | zod | ^3.24.0 | スキーマ検証 |
| UI | class-variance-authority | ^0.7.0 | バリアントスタイル |
| UI | clsx | ^2.1.0 | クラス名結合 |
| UI | tailwind-merge | ^2.6.0 | Tailwindマージ |
| 内部 | @repo/shared | workspace:* | 共有パッケージ |

**開発依存関係（devDependencies）**:

| カテゴリ | パッケージ | バージョン | 用途 |
| -------- | ---------- | ---------- | ---- |
| 型定義 | typescript | ^5.7.0 | 言語 |
| 型定義 | @types/node | ^22.0.0 | Node.js型 |
| 型定義 | @types/react | ^19.0.0 | React型 |
| ビルド | drizzle-kit | ^0.30.0 | マイグレーション |
| テスト | vitest | ^2.1.0 | テストフレームワーク |
| テスト | @testing-library/react | ^16.0.0 | コンポーネントテスト |
| スタイル | tailwindcss | ^3.4.0 | CSSフレームワーク |
| スタイル | postcss | ^8.4.0 | CSS処理 |
| スタイル | autoprefixer | ^10.4.0 | ベンダープレフィックス |

### apps/desktop (Electron)

デスクトップアプリケーションでは、Electronフレームワークを使用し、Reactで構築されたUIとNode.jsバックエンドを統合する。

**主要依存関係**:

| パッケージ       | バージョン | 用途                                       |
| ---------------- | ---------- | ------------------------------------------ |
| electron         | ^33.0.0    | デスクトップアプリケーションフレームワーク |
| electron-builder | ^25.0.0    | ビルド・パッケージング                     |
| zustand          | ^5.0.2     | クライアント状態管理（認証、チャット、UI） |
| react            | ^19.0.0    | UIライブラリ                               |
| react-router-dom | ^7.1.1     | ページルーティング                         |
| @repo/shared     | workspace  | 共有ライブラリ                             |

**開発依存関係**:

| パッケージ       | 用途                         |
| ---------------- | ---------------------------- |
| electron-vite    | 開発サーバー・ホットリロード |
| vitest           | ユニットテスト               |
| @testing-library | Reactコンポーネントテスト    |

**状態管理（Zustand）**:

デスクトップアプリではZustandを採用し、以下のスライスで状態を管理する。

| スライス       | 管理する状態                                                  |
| -------------- | ------------------------------------------------------------- |
| authSlice      | 認証状態（ログイン、トークン、セッション）                    |
| chatSlice      | チャット状態（メッセージ、入力、LLM選択、システムプロンプト） |
| uiSlice        | UI状態（ビュー、ウィンドウサイズ、テーマ）                    |
| editorSlice    | エディタ状態（ファイル、フォルダ）                            |
| workspaceSlice | ワークスペース状態（複数フォルダ管理）                        |

Zustandを採用した理由は、シンプルなAPI、TypeScript完全対応、React Hooksとの親和性、小規模から中規模アプリケーションに最適なパフォーマンスによる。

### packages/shared (共有ライブラリ)

パッケージ名: @repo/shared

**パッケージ設定**:

| 設定項目 | 値 | 説明 |
| -------- | -- | ---- |
| main | ./dist/index.js | メインエントリポイント |
| types | ./dist/index.d.ts | 型定義ファイル |

**エクスポート構成**:

| エクスポートパス | 実体パス |
| ---------------- | -------- |
| . | ./dist/index.js |
| ./core | ./dist/core/index.js |
| ./infrastructure | ./dist/infrastructure/index.js |
| ./utils | ./dist/utils/index.js |

**依存関係**:

| パッケージ | バージョン | 種別 | 用途 |
| ---------- | ---------- | ---- | ---- |
| zod | ^3.24.0 | 本番 | スキーマ検証 |
| typescript | ^5.7.0 | 開発 | 言語 |
| tsup | ^8.0.0 | 開発 | バンドラー |
| vitest | ^2.1.0 | 開発 | テスト |

**RAG変換システムの依存関係方針**:

- **外部ライブラリ依存ゼロ**: Markdown/Code/YAMLコンバーターは標準ライブラリのみで実装
- **正規表現ベース解析**: AST解析ライブラリ（@babel/parser, typescript等）を使わず軽量化
- **既存依存の活用**: HTMLConverter（turndown）, CSVConverter（papaparse）, JSONConverter（標準JSON.parse）

**将来の依存追加候補**:

| ライブラリ      | 用途                    | 導入タイミング           | サイズ影響 |
| --------------- | ----------------------- | ------------------------ | ---------- |
| `pdf-parse`     | PDFConverter実装時      | PlainTextConverter完了後 | +500KB     |
| `mammoth`       | DocxConverter実装時     | PDF対応後                | +200KB     |
| `xlsx`          | ExcelConverter実装時    | Docx対応後               | +800KB     |
| `@babel/parser` | AST-based解析への移行時 | CONV-DEBT-002対応時      | +1.2MB     |

---

## 依存関係管理戦略

### 依存関係の分類

**必須依存関係（production）**:

| カテゴリ | パッケージ | 用途 |
| -------- | ---------- | ---- |
| コアフレームワーク | next, react, react-dom | アプリケーション基盤 |
| データベース | drizzle-orm, @libsql/client | DB操作 |
| AI統合 | ai, @ai-sdk/* | LLM連携 |
| バリデーション | zod | スキーマ検証 |
| UI | clsx, tailwind-merge | 最小限のスタイル |

**オプション依存関係（段階的導入）**:

| パッケージ | 導入タイミング |
| ---------- | -------------- |
| @radix-ui/* | 必要なコンポーネントのみ |
| framer-motion | アニメーション必要時 |
| @tanstack/react-query | クライアントキャッシュ必要時 |
| zustand | 複雑な状態管理必要時 |

**開発依存関係（devDependencies）**:

| カテゴリ | パッケージ | 用途 |
| -------- | ---------- | ---- |
| 型システム | typescript, @types/* | 静的型付け |
| コード品質 | eslint, prettier | リント・フォーマット |
| テスト | vitest, @testing-library/* | ユニット・コンポーネントテスト |
| マイグレーション | drizzle-kit | DB変更管理 |

### pnpm 依存解決ベストプラクティス

本プロジェクトでは pnpm 厳格モード（`node-linker=isolated`）を使用しており、依存関係の宣言に注意が必要です。

**チェックリスト（新しい外部ライブラリ使用時）**:

| 確認項目 | 説明 |
| -------- | ---- |
| 依存追加 | importするパッケージのpackage.jsonに依存を追加したか |
| 複数宣言 | モノレポ内で複数パッケージが同じライブラリを使う場合、各々に宣言したか |
| バージョン統一 | バージョンは統一されているか（pnpm catalog推奨） |
| プロトコル使用 | workspace:プロトコルは内部パッケージにのみ使用しているか |

**よくある問題と解決策**:

| 問題                                    | 原因                                  | 解決策                                    |
| --------------------------------------- | ------------------------------------- | ----------------------------------------- |
| `ERR_MODULE_NOT_FOUND`                  | 幽霊依存（宣言なしの依存）            | import するパッケージに依存を追加         |
| テスト通過・実行時エラー                | vitest のモック/エイリアスでの代替    | 実際のパッケージを依存宣言               |
| `workspace:*` で外部パッケージ参照失敗 | プロトコルの誤用                      | 外部パッケージはバージョン指定に変更      |
| バージョン不一致による型エラー          | 複数パッケージで異なるバージョン      | pnpm catalog でバージョンを一元管理       |

**pnpm install 後の検証**:

| コマンド | 説明 |
| -------- | ---- |
| pnpm why パッケージ名 | 依存ツリーの確認 |
| pnpm dlx depcheck | 幽霊依存の検出 |
| pnpm install --frozen-lockfile | ロックファイルの整合性確認 |

> 参考: architecture-monorepo.md の「pnpm 依存解決ルール」セクション

### 依存関係の肥大化防止

**原則**:

1. **Just-in-Time導入**: 必要になるまで追加しない
2. **バンドルサイズ監視**: next/bundle-analyzerで定期確認
3. **Tree Shaking対応**: ESM対応パッケージを優先
4. **定期的な監査**: pnpm audit + npm-check-updates

**依存関係監査コマンド**:

| コマンド | 説明 |
| -------- | ---- |
| pnpm audit | セキュリティ監査 |
| pnpm outdated | 古い依存関係の検出 |
| ANALYZE=true pnpm --filter @repo/web build | バンドルサイズ分析 |
| pnpm dlx depcheck | 未使用依存関係の検出 |

### バージョン更新戦略

| 更新頻度 | 対象 | 対応内容 |
| -------- | ---- | -------- |
| 即時更新 | security patches、critical bug fixes | 発見次第即座に対応 |
| 週次確認 | patch versions (x.x.N) | 毎週確認して適用 |
| 月次検証 | minor versions (x.N.x) | 新機能確認後に更新 |
| 慎重な計画 | major versions (N.x.x) | breaking changes確認、テスト環境での検証必須 |

---

## 無料枠の活用ガイド

### サービス別無料枠

| サービス          | 無料枠                   | 個人開発での充足度 |
| ----------------- | ------------------------ | ------------------ |
| **Turso**         | 9GB、500Mリクエスト/月   | 十分               |
| **Railway**       | $5クレジット/月          | 小規模なら可       |
| **Cloudflare R2** | 10GB、100万リクエスト/月 | ファイル保存に最適 |
| **OpenAI**        | $5 (新規)                | 開発テスト用       |
| **Google AI**     | 60リクエスト/分          | 開発テスト用       |

### コスト最適化戦略

AI呼び出しのコストを最適化するため、環境と用途に応じてモデルを選択する。

**開発環境**:

| プロバイダー | モデル | 理由 |
| ------------ | ------ | ---- |
| Google | gemini-2.0-flash-exp | 無料枠あり |

**本番環境（用途別モデル選択）**:

| 用途 | モデル | 選定理由 |
| ---- | ------ | -------- |
| 簡単なタスク | gpt-4o-mini | コスト効率が高い |
| 複雑な推論 | gpt-4o | 高精度な応答 |
| 創造的タスク | claude-3-5-sonnet | 創造性に優れる |

---

## CI/CDツール選定

### GitHub Actions

**採用理由**:

| 理由                   | 説明                                                     |
| ---------------------- | -------------------------------------------------------- |
| GitHubとのネイティブ統合 | リポジトリと同じ画面で管理可能、PR連携がシームレス       |
| 無料枠                 | パブリックリポジトリ: 無制限、プライベート: 月2,000分    |
| YAML設定               | 宣言的に記述可能、バージョン管理が容易                   |
| 豊富な公式Action       | actions/checkout, setup-node など信頼性の高いActionが充実 |
| コミュニティ           | サードパーティActionのエコシステムが充実                 |

**代替案との比較**:

| CI/CDツール     | メリット               | デメリット                 | 判定 |
| --------------- | ---------------------- | -------------------------- | ---- |
| GitHub Actions  | GitHub統合、無料枠充実 | -                          | 採用 |
| CircleCI        | 設定が柔軟             | 無料枠が少ない             | 不採用 |
| Travis CI       | 老舗で安定             | 無料枠が縮小               | 不採用 |
| Jenkins         | 完全にカスタマイズ可能 | 自己ホスティングの運用コスト | 不採用 |

### 主要CIジョブ構成（2026-03-01更新）

| ジョブ名 | トリガー | 主な処理 | 依存関係 |
| --- | --- | --- | --- |
| `lint` | PR / `main` push | ESLint 実行 | なし |
| `build-shared` | PR / `main` push | `@repo/shared` ビルド | なし |
| `check-module-sync` | PR / `main` push | `exports` / `paths` / `alias` / `typesVersions` の4設定整合検証 | なし |
| `typecheck` | PR / `main` push | 全体型チェック | `build-shared` |
| `test-shared` | PR / `main` push | shared テスト | `build-shared` |
| `test-desktop` | PR / `main` push | desktop テスト（16 shard） | `build-shared` |
| `e2e-desktop` | PR / `main` push | desktop E2E テスト（Playwright + xvfb） | `build-shared` |
| `build` | PR / `main` push | 最終ビルド検証 | `lint`, `typecheck`, `test-shared`, `test-desktop`, `e2e-desktop`, `build-shared`, `check-module-sync` |

### Codecov

**採用理由**:

| 理由                     | 説明                                                   |
| ------------------------ | ------------------------------------------------------ |
| カバレッジ可視化のデファクトスタンダード | 多くのOSSプロジェクトで採用、実績が豊富          |
| PRコメント自動投稿       | カバレッジ差分をPRに自動コメント、レビュー効率化       |
| フラグ機能               | shared/desktopでパッケージ別レポート、モノレポ対応     |
| 無料枠                   | パブリックリポジトリ: 無制限                           |
| GitHub App統合           | PRステータスチェックとして機能、マージ制御が容易       |

**代替案との比較**:

| カバレッジツール | メリット               | デメリット                     | 判定 |
| ---------------- | ---------------------- | ------------------------------ | ---- |
| Codecov          | PR統合、可視化が優秀   | -                              | 採用 |
| Coveralls        | シンプル               | 機能がCodecovより少ない        | 不採用 |
| Code Climate     | 品質分析も可能         | 無料枠が限定的                 | 不採用 |
| 自前実装         | 完全に制御可能         | 実装・運用コストが高い         | 不採用 |

### カバレッジプロバイダー: Vitest v8

**採用理由**:

| 理由                     | 説明                                                   |
| ------------------------ | ------------------------------------------------------ |
| Vitestとのネイティブ統合 | 追加設定不要、coverage providerオプションで指定するだけ |
| lcov形式出力             | Codecov連携が容易、業界標準フォーマット                |
| 高速                     | istanbulより軽量、ビルド時間への影響が少ない           |
| ソースマップ対応         | TypeScriptコードの正確なカバレッジ計測                 |

**v8 vs istanbul**:

| プロバイダー | 速度   | 正確性 | 設定の簡単さ | 判定 |
| ------------ | ------ | ------ | ------------ | ---- |
| v8           | 高速   | 高     | シンプル     | 採用 |
| istanbul     | やや遅 | 高     | やや複雑     | 不採用 |

**設定（vitest.config.ts）**:

| 設定項目 | 値 | 説明 |
| -------- | -- | ---- |
| provider | v8 | カバレッジプロバイダー |
| reporter | text, json, html, lcov | 出力形式（lcovでCodecov連携） |
| thresholds.lines | 80 | 行カバレッジ閾値 |
| thresholds.functions | 80 | 関数カバレッジ閾値 |
| thresholds.statements | 80 | ステートメントカバレッジ閾値 |

---

## 学習リソースとコミュニティ

### 公式ドキュメント

| 技術          | ドキュメント         | 品質評価 |
| ------------- | -------------------- | -------- |
| Next.js       | nextjs.org/docs      | 優秀     |
| React         | react.dev            | 優秀     |
| Drizzle ORM   | orm.drizzle.team     | 良好     |
| Vercel AI SDK | sdk.vercel.ai/docs   | 良好     |
| Turso         | docs.turso.tech      | 良好     |
| Tailwind CSS  | tailwindcss.com/docs | 優秀     |

### コミュニティサポート

活発度ランキングを以下の表に示す。

| 順位 | 技術 | 活発度 | 主要プラットフォーム |
| ---- | ---- | ------ | -------------------- |
| 1 | React / Next.js | 非常に活発 | Stack Overflow, Discord, Reddit |
| 2 | TypeScript | 非常に活発 | GitHub Discussions |
| 3 | Tailwind CSS | 活発 | Discord |
| 4 | Drizzle ORM | 成長中 | Discord, GitHub |
| 5 | Turso | 成長中 | Discord |

---

