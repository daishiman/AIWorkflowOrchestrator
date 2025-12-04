# Electronデスクトップアプリ開発環境 - 環境構築要件書

## 1. プロジェクト概要

### 1.1 目的
Electronデスクトップアプリケーション開発のための完全な開発環境を構築し、Mac環境で即座に開発を開始できる状態にする。将来的なWindows対応を見据えたクロスプラットフォーム互換性を確保する。

### 1.2 対象ステークホルダー
- **開発者**: Electronアプリの開発を行う者
- **新規参入者**: プロジェクトに新しく参加する開発者
- **CI/CDシステム**: 自動ビルド・テストを実行するシステム

### 1.3 スコープ
- **スコープ内**: 開発環境のセットアップ、ビルドツール、テスト環境
- **スコープ外**: 本番デプロイメント環境、コード署名証明書の取得

---

## 2. 機能要件（FR: Functional Requirements）

### FR-001: Node.jsランタイム
- **説明**: JavaScriptランタイム環境の提供
- **バージョン**: Node.js 22.x LTS（Jod）または 24.x LTS（Krypton）
- **根拠**: Electron公式ドキュメントでNode.js >= 22.12.0が要件として明記されている
- **優先度**: Must Have
- **受け入れ基準**:
  - Given: 開発者がターミナルを開いている
  - When: `node --version` を実行する
  - Then: `v22.x.x` または `v24.x.x` が表示される

### FR-002: pnpmパッケージマネージャー
- **説明**: 高速で効率的なパッケージマネージャー
- **バージョン**: pnpm 10.x（最新: 10.24.x）
- **根拠**: master_system_design.mdで pnpm 9.x が指定されているが、最新の10.xも互換性あり
- **優先度**: Must Have
- **受け入れ基準**:
  - Given: Node.jsがインストールされている
  - When: `pnpm --version` を実行する
  - Then: `10.x.x` が表示される

### FR-003: Electronフレームワーク
- **説明**: クロスプラットフォームデスクトップアプリケーションフレームワーク
- **バージョン**: Electron 39.x（最新安定版）
- **根拠**: 2025年12月時点の最新安定版
- **優先度**: Must Have
- **受け入れ基準**:
  - Given: pnpmでプロジェクトがセットアップされている
  - When: `pnpm list electron` を実行する
  - Then: `electron@39.x.x` が表示される

### FR-004: electron-viteビルドツール
- **説明**: Viteベースの高速Electronビルドツール
- **バージョン**: electron-vite 2.x
- **根拠**: Vite 6対応、ESMサポート、高速HMR
- **優先度**: Must Have
- **受け入れ基準**:
  - Given: electron-viteがインストールされている
  - When: `pnpm electron-vite --version` を実行する
  - Then: `2.x.x` が表示される

### FR-005: electron-builderパッケージングツール
- **説明**: マルチプラットフォームビルド・配布ツール
- **バージョン**: electron-builder 26.x
- **根拠**: Mac/Windows両対応、コード署名サポート
- **優先度**: Must Have
- **受け入れ基準**:
  - Given: electron-builderがインストールされている
  - When: `pnpm electron-builder --version` を実行する
  - Then: `26.x.x` が表示される

### FR-006: TypeScript
- **説明**: 型安全なJavaScript
- **バージョン**: TypeScript 5.x
- **根拠**: master_system_design.mdで指定、strict mode必須
- **優先度**: Must Have
- **受け入れ基準**:
  - Given: TypeScriptがインストールされている
  - When: `pnpm tsc --version` を実行する
  - Then: `Version 5.x.x` が表示される

### FR-007: SQLiteデータベース（ローカルDB）
- **説明**: 組み込みデータベース
- **ライブラリ**: better-sqlite3
- **バージョン**: 最新版
- **根拠**: オフライン対応、ファイルベース、Electronと相性良好
- **優先度**: Must Have
- **注意**: Electronとの統合には electron-rebuild が必要
- **受け入れ基準**:
  - Given: better-sqlite3がインストールされている
  - When: Electronアプリ内でDBに接続する
  - Then: SQLiteデータベースが正常に動作する

### FR-008: Drizzle ORM
- **説明**: 型安全なSQLクエリビルダー
- **バージョン**: Drizzle 0.39.x
- **根拠**: SQLite/PostgreSQL両対応、型推論
- **優先度**: Must Have
- **受け入れ基準**:
  - Given: Drizzleがインストールされている
  - When: スキーマを定義してクエリを実行する
  - Then: 型安全なクエリが動作する

### FR-009: React
- **説明**: UIライブラリ
- **バージョン**: React 18.x
- **根拠**: Concurrent Features、Suspense対応
- **優先度**: Must Have
- **受け入れ基準**:
  - Given: Reactがインストールされている
  - When: Rendererプロセスでコンポーネントをレンダリングする
  - Then: Reactコンポーネントが正常に表示される

### FR-010: Tailwind CSS
- **説明**: ユーティリティファーストCSSフレームワーク
- **バージョン**: Tailwind CSS 3.x
- **根拠**: Design Tokens統合、カスタマイズ可能
- **優先度**: Should Have
- **受け入れ基準**:
  - Given: Tailwind CSSが設定されている
  - When: ユーティリティクラスを使用する
  - Then: スタイルが正しく適用される

### FR-011: Vitest
- **説明**: 高速テストフレームワーク
- **バージョン**: Vitest 2.x
- **根拠**: Vite互換、ESM対応、Jest互換API
- **優先度**: Must Have
- **受け入れ基準**:
  - Given: テストファイルが存在する
  - When: `pnpm test` を実行する
  - Then: テストが正常に実行される

### FR-012: Playwright
- **説明**: E2Eテストフレームワーク
- **バージョン**: 最新版
- **根拠**: クロスブラウザ、Electronアプリテスト対応
- **優先度**: Should Have
- **受け入れ基準**:
  - Given: E2Eテストファイルが存在する
  - When: Playwrightテストを実行する
  - Then: Electronアプリが自動操作される

---

## 3. 非機能要件（NFR: Non-Functional Requirements）

### NFR-001: Mac環境対応
- **説明**: macOS環境での開発が可能であること
- **対象OS**: macOS 10.15 (Catalina) 以降
- **優先度**: Must Have
- **測定基準**: macOS環境でビルド・実行が成功すること

### NFR-002: Windows環境対応（将来）
- **説明**: Windows環境での開発が可能であること（将来対応）
- **対象OS**: Windows 10以降
- **優先度**: Could Have（現時点では設計のみ）
- **測定基準**: Windows環境でビルド・実行が成功すること

### NFR-003: 環境構築時間
- **説明**: 新規開発者が環境を構築するまでの時間
- **目標**: 30分以内
- **優先度**: Should Have
- **測定基準**: 自動セットアップスクリプト実行から開発開始まで30分以内

### NFR-004: ビルド時間
- **説明**: 開発ビルドの所要時間
- **目標**: 初回ビルド5分以内、インクリメンタルビルド10秒以内
- **優先度**: Should Have
- **測定基準**: electron-viteによるビルド時間

### NFR-005: ディスク容量
- **説明**: 開発環境に必要なディスク容量
- **目標**: 10GB以内
- **優先度**: Should Have
- **測定基準**: node_modules、ビルド成果物を含む合計サイズ

### NFR-006: メモリ使用量
- **説明**: 開発時のメモリ使用量
- **目標**: 4GB以内
- **優先度**: Should Have
- **測定基準**: 開発サーバー実行時のメモリ使用量

### NFR-007: オフライン開発対応
- **説明**: 依存関係のキャッシュ後はオフラインで開発可能
- **優先度**: Could Have
- **測定基準**: pnpm storeにキャッシュがある状態でオフラインビルドが成功

---

## 4. ツール要件（MoSCoW分類）

### 4.1 Must Have（必須）

| カテゴリ | ツール | バージョン | 用途 |
|---------|--------|-----------|------|
| ランタイム | Node.js | 22.x LTS | JavaScriptランタイム |
| パッケージマネージャー | pnpm | 10.x | 依存関係管理 |
| フレームワーク | Electron | 39.x | デスクトップアプリフレームワーク |
| ビルドツール | electron-vite | 2.x | 高速ビルド、HMR |
| パッケージング | electron-builder | 26.x | アプリパッケージング |
| 言語 | TypeScript | 5.x | 型安全なJavaScript |
| UI | React | 18.x | UIライブラリ |
| DB | better-sqlite3 | 最新 | ローカルデータベース |
| ORM | Drizzle | 0.39.x | 型安全なDBアクセス |
| テスト | Vitest | 2.x | ユニットテスト |

### 4.2 Should Have（推奨）

| カテゴリ | ツール | バージョン | 用途 |
|---------|--------|-----------|------|
| スタイリング | Tailwind CSS | 3.x | ユーティリティCSS |
| UIコンポーネント | shadcn/ui | 最新 | Headlessコンポーネント |
| UIプリミティブ | Radix UI | 最新 | アクセシブルコンポーネント |
| 状態管理 | Zustand | 最新 | 軽量状態管理 |
| E2Eテスト | Playwright | 最新 | E2Eテスト |
| リンター | ESLint | 9.x | コード品質 |
| フォーマッター | Prettier | 3.x | コードフォーマット |
| プロセス管理 | PM2 | 5.x | ローカルエージェント管理 |

### 4.3 Could Have（あれば望ましい）

| カテゴリ | ツール | バージョン | 用途 |
|---------|--------|-----------|------|
| ビジュアルテスト | Chromatic | 最新 | ビジュアルリグレッション |
| コンポーネントカタログ | Storybook | 8.x | コンポーネント開発 |
| グラフ | Chart.js | 4.x | データ可視化 |
| PDF生成 | jsPDF | 最新 | PDFエクスポート |
| ログ | electron-log | 最新 | アプリログ管理 |
| 設定管理 | electron-store | 最新 | ユーザー設定永続化 |

### 4.4 Won't Have（今回は対象外）

| カテゴリ | ツール | 理由 |
|---------|--------|------|
| コード署名 | Apple Developer証明書 | 開発環境セットアップのスコープ外 |
| 公証 | Apple Notarization | 配布時に対応 |
| Windows署名 | SignTool | Windows対応時に検討 |
| CI/CD | GitHub Actions | 別タスクで対応 |

---

## 5. 依存関係とインストール順序

### 5.1 インストール順序（Mac環境）

```
1. Homebrew（パッケージマネージャー）
   ↓
2. Node.js 22.x LTS（Homebrewまたはnvm経由）
   ↓
3. pnpm（corepack経由）
   ↓
4. プロジェクト依存関係（pnpm install）
   ├── Electron
   ├── electron-vite
   ├── electron-builder
   ├── React
   ├── TypeScript
   ├── better-sqlite3
   ├── Drizzle
   ├── Tailwind CSS
   ├── Vitest
   └── その他
   ↓
5. electron-rebuild（ネイティブモジュール再ビルド）
   ↓
6. 開発サーバー起動確認
```

### 5.2 依存関係グラフ

```
Node.js 22.x LTS
├── pnpm 10.x
│   └── すべてのnpmパッケージ
├── Electron 39.x
│   ├── electron-vite 2.x
│   ├── electron-builder 26.x
│   └── electron-rebuild（better-sqlite3用）
├── React 18.x
│   ├── Tailwind CSS 3.x
│   └── shadcn/ui
├── TypeScript 5.x
│   └── Drizzle 0.39.x
└── Vitest 2.x
    └── Playwright
```

---

## 6. 環境変数要件

### 6.1 開発環境変数

| 変数名 | 説明 | 例 | 必須 |
|--------|------|-----|------|
| NODE_ENV | 環境タイプ | development | Yes |
| DATABASE_PATH | SQLiteファイルパス | ./data/app.db | Yes |
| LOG_LEVEL | ログレベル | debug | No |
| CLOUD_DATABASE_URL | クラウドDB接続URL | postgresql://... | No（オフライン時） |

### 6.2 ビルド環境変数

| 変数名 | 説明 | 例 | 必須 |
|--------|------|-----|------|
| ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES | 未解決依存許可 | true | No |
| CSC_LINK | コード署名証明書パス | - | No（開発時） |
| CSC_KEY_PASSWORD | 証明書パスワード | - | No（開発時） |

---

## 7. プラットフォーム固有要件

### 7.1 macOS固有

- **Homebrew**: パッケージマネージャー（Node.jsインストールに使用）
- **Xcode Command Line Tools**: ネイティブモジュールビルドに必要
- **Rosetta 2**: M1/M2 Macでx64依存関係をビルドする場合に必要

### 7.2 Windows固有（将来対応）

- **Chocolatey or winget**: パッケージマネージャー
- **Visual Studio Build Tools**: ネイティブモジュールビルドに必要
- **Python 3**: node-gypに必要
- **Windows SDK**: Electronビルドに必要

---

## 8. 検証チェックリスト

### 8.1 環境構築完了条件

- [ ] Node.js 22.x LTSがインストールされている
- [ ] pnpm 10.xがインストールされている
- [ ] `pnpm install` が成功する
- [ ] `pnpm dev` で開発サーバーが起動する
- [ ] HMR（Hot Module Replacement）が動作する
- [ ] `pnpm build` でビルドが成功する
- [ ] `pnpm test` でテストが成功する
- [ ] SQLiteデータベースが動作する
- [ ] Electronアプリがウィンドウを表示する

### 8.2 品質ゲート

- [ ] TypeScript strict modeでエラーがない
- [ ] ESLintエラーがない
- [ ] Prettierフォーマットが適用されている
- [ ] ユニットテストカバレッジが60%以上

---

## 9. トラブルシューティング

### 9.1 よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| better-sqlite3がビルドできない | Electronとの互換性問題 | `electron-rebuild`を実行 |
| node-gypエラー | ビルドツール不足 | Xcode CLT / VS Build Toolsをインストール |
| メモリ不足 | Node.jsヒープ制限 | `NODE_OPTIONS=--max-old-space-size=4096` |
| pnpmがnot found | corepackが無効 | `corepack enable` を実行 |

---

## 10. 参考資料

- [Electron公式ドキュメント](https://www.electronjs.org/docs/latest/)
- [electron-vite公式ドキュメント](https://electron-vite.org/)
- [electron-builder公式ドキュメント](https://www.electron.build/)
- [pnpm公式ドキュメント](https://pnpm.io/)
- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [Electron Releases](https://releases.electronjs.org/)

---

## 更新履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|----------|--------|
| 1.0.0 | 2025-12-03 | 初版作成 | @req-analyst |
