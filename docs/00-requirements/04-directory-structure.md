# ディレクトリ構造（モノレポ）

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

---

## 4.1 設計方針

### 4.1.1 変数表記の凡例

| 表記                  | 説明                       | 例                              |
| --------------------- | -------------------------- | ------------------------------- |
| [feature-name]/       | 機能名                     | workflow-executor, log-analyzer |
| [component-name].tsx  | コンポーネント名           | Button.tsx, Card.tsx            |
| [entity-name].ts      | エンティティ・型名         | workflow.ts, user.ts            |
| [service-name].ts     | サービス名                 | ai-client.ts, db.ts             |
| [page-name]/          | ページ名                   | dashboard/, settings/           |
| [test-target].test.ts | テスト対象ファイル名に対応 | workflow.test.ts                |

### 4.1.2 モノレポ構造の採用理由

| パッケージ       | 役割                                            |
| ---------------- | ----------------------------------------------- |
| packages/shared/ | Web/Desktop共通のコード（UI、ロジック、型定義） |
| apps/web/        | Next.js Webアプリケーション                     |
| apps/desktop/    | Electronデスクトップアプリケーション            |

**メリット**:

- コード再利用: 1箇所の変更が両プラットフォームに反映
- 独立デプロイ: Web（Railway）とDesktop（GitHub Releases）を別々に管理

### 4.1.3 4つの基本原則

| 原則           | 説明                                         |
| -------------- | -------------------------------------------- |
| 機能ベース分離 | 機能ごとにフォルダを分け、関連ファイルを集約 |
| テストの同居   | 実装ファイルと同じ場所にテストを配置         |
| 階層の明確化   | 各階層の責務を明確にし、依存方向を制御       |
| 拡張容易性     | 新機能追加時は新フォルダ作成のみで完結       |

---

## 4.2 ルート構造

| パス               | 説明                                                            |
| ------------------ | --------------------------------------------------------------- |
| .claude/           | AI開発アシスタント設定（agents、commands、skills）              |
| docs/              | 仕様書（00-requirements、10-design、20-specifications、99-adr） |
| packages/shared/   | Web/Desktop共通コード                                           |
| apps/web/          | Next.js Webアプリ                                               |
| apps/desktop/      | Electronデスクトップアプリ                                      |
| local-agent/       | ローカルファイル監視エージェント                                |
| .github/workflows/ | CI/CDワークフロー                                               |
| 設定ファイル群     | package.json、tsconfig.json等                                   |

**構造の特徴**:

- packages/shared/: 4階層（core → infrastructure → ui → types）で依存方向を制御
- apps/: 各アプリは独立してデプロイ可能
- docs/: 番号プレフィックスで整理（参照しやすい）

---

## 4.3 packages/shared/ 詳細構造

### 4.3.1 core/（ビジネスルール層）

| パス                            | 役割                       |
| ------------------------------- | -------------------------- |
| entities/                       | ドメインエンティティ定義   |
| entities/[entity-name].ts       | エンティティファイル       |
| entities/[entity-name].test.ts  | エンティティテスト         |
| interfaces/                     | インターフェース定義       |
| interfaces/[repository-name].ts | リポジトリインターフェース |
| interfaces/[service-name].ts    | サービスインターフェース   |
| errors/                         | ドメインエラー             |
| errors/[error-type].ts          | カスタムエラークラス       |

**特徴**: 外部依存ゼロを維持する

### 4.3.2 infrastructure/（外部サービス接続層）

| パス                     | 役割                                      |
| ------------------------ | ----------------------------------------- |
| database/schema/         | Drizzleスキーマ定義                       |
| database/repositories/   | リポジトリ実装                            |
| database/client.ts       | DB接続クライアント                        |
| ai/providers/            | AIプロバイダー実装（OpenAI、Anthropic等） |
| ai/client.ts             | 統一AIクライアント                        |
| external/[service-name]/ | 外部サービス（Discord等）                 |
| logging/                 | ログ基盤                                  |

### 4.3.3 ui/（共通UIコンポーネント層）

| パス        | 役割                                      |
| ----------- | ----------------------------------------- |
| primitives/ | 基本コンポーネント（Button、Input等）     |
| patterns/   | 複合コンポーネント（Form、Card等）        |
| tokens/     | Design Tokens（global、alias、component） |
| hooks/      | 共通カスタムフック                        |

### 4.3.4 types/（共通型定義）

| パス                | 役割                                    |
| ------------------- | --------------------------------------- |
| [domain-name].ts    | ドメイン型                              |
| api.ts              | API型                                   |
| rag/file/           | RAGファイル・変換ドメイン型             |
| rag/file/types.ts   | 型定義・定数・インターフェース          |
| rag/file/schemas.ts | Zodスキーマ（ランタイムバリデーション） |
| rag/file/utils.ts   | ユーティリティ関数                      |
| rag/file/index.ts   | バレルエクスポート                      |
| index.ts            | エクスポート                            |

**依存方向**: types ← core ← infrastructure ← ui（逆方向禁止）

---

## 4.4 apps/web/ 詳細構造（Next.js）

### 4.4.1 features/（機能ベース分離）

| パス                            | 役割                         |
| ------------------------------- | ---------------------------- |
| [feature-name]/schema.ts        | 入出力スキーマ（Zod）        |
| [feature-name]/executor.ts      | ビジネスロジック             |
| [feature-name]/executor.test.ts | ユニットテスト               |
| [feature-name]/api.ts           | API Routesハンドラー         |
| [feature-name]/hooks/           | 機能固有フック（オプション） |
| [feature-name]/components/      | 機能固有UI（オプション）     |

### 4.4.2 app/（Next.js App Router）

| パス                            | 役割                           |
| ------------------------------- | ------------------------------ |
| layout.tsx                      | ルートレイアウト               |
| page.tsx                        | ホームページ                   |
| globals.css                     | グローバルスタイル             |
| api/v1/[resource-name]/route.ts | APIエンドポイント              |
| api/v1/health/route.ts          | ヘルスチェック                 |
| ([route-group])/                | Route Groups（レイアウト共有） |
| [page-name]/page.tsx            | 個別ページ（Server Component） |
| [page-name]/loading.tsx         | ローディングUI                 |

### 4.4.3 components/（Web固有コンポーネント）

| パス    | 役割                                |
| ------- | ----------------------------------- |
| server/ | Server Components専用               |
| client/ | Client Components専用（use client） |

### 4.4.4 lib/（Web固有ユーティリティ）

- ユーティリティ関数
- ヘルパー関数

---

## 4.5 apps/desktop/ 詳細構造（Electron）

### 4.5.1 main/（Main Process）

| パス                  | 役割                      |
| --------------------- | ------------------------- |
| index.ts              | エントリーポイント        |
| ipc/channels.ts       | IPCチャネル定義（型定義） |
| ipc/handlers/         | ハンドラー実装            |
| ipc/workspaceHandlers | ワークスペースIPC         |
| ipc/validation.ts     | 入力バリデーション        |
| services/             | バックグラウンドサービス  |
| windows/              | ウィンドウ管理            |
| config/               | 設定（security、app）     |

### 4.5.2 preload/（セキュリティ境界）

| パス        | 役割                          |
| ----------- | ----------------------------- |
| index.ts    | contextBridge設定             |
| api.ts      | Renderer公開API定義           |
| channels.ts | 許可IPCチャネルホワイトリスト |
| types.d.ts  | 型定義（window.electronAPI）  |

### 4.5.3 renderer/（React UI）

| パス        | 役割                        |
| ----------- | --------------------------- |
| App.tsx     | アプリルート                |
| main.tsx    | エントリーポイント          |
| views/      | 画面コンポーネント          |
| components/ | Atomic Designコンポーネント |
| hooks/      | IPC通信フック               |
| store/      | 状態管理（Zustand）         |
| styles/     | CSS/Design Tokens           |
| utils/      | ユーティリティ関数          |

### 4.5.4 renderer/components/（Atomic Design）

| パス       | 役割                                         |
| ---------- | -------------------------------------------- |
| atoms/     | 基本UI要素（Button、Input、Icon、Badge等）   |
| molecules/ | 複合要素（Tooltip、NavIcon、FileTreeItem等） |
| organisms/ | 機能単位（AppDock、Sidebar、GlassPanel等）   |

### 4.5.5 renderer/views/（画面構成）

| パス           | 役割                                   |
| -------------- | -------------------------------------- |
| DashboardView/ | ダッシュボード（統計・アクティビティ） |
| EditorView/    | エディタ（ファイルツリー・編集）       |
| ChatView/      | AIチャット                             |
| GraphView/     | ナレッジグラフ                         |
| SettingsView/  | 設定画面                               |

### 4.5.6 renderer/store/（Zustand状態管理）

| パス                  | 役割                                   |
| --------------------- | -------------------------------------- |
| index.ts              | 統合ストア（createAppStore）           |
| slices/               | 機能別スライス                         |
| slices/uiSlice        | UI状態（ビュー、ウィンドウサイズ）     |
| slices/editorSlice    | エディタ状態（ファイル、フォルダ）     |
| slices/chatSlice      | チャット状態（メッセージ、入力）       |
| slices/workspaceSlice | ワークスペース状態（複数フォルダ管理） |
| types/workspace.ts    | Workspace型定義（Branded Types）       |

### 4.5.7 Electron 3プロセスモデル

| プロセス | 環境                      | 役割             |
| -------- | ------------------------- | ---------------- |
| Main     | Node.js全API使用可        | システム操作担当 |
| Preload  | contextBridge経由         | 安全なAPI公開    |
| Renderer | Chromium環境、sandbox有効 | UIのみ担当       |

---

## 4.6 local-agent/ 詳細構造

| パス          | 役割                     |
| ------------- | ------------------------ |
| src/index.ts  | エントリーポイント       |
| src/watchers/ | ファイル監視実装         |
| src/sync/     | クラウド同期クライアント |
| src/config/   | 設定                     |

---

## 4.7 .github/workflows/ 詳細構造

| ファイル            | 役割                                |
| ------------------- | ----------------------------------- |
| ci.yml              | CI（テスト、lint、型チェック）      |
| deploy-web.yml      | Webデプロイ（Railway）              |
| release-desktop.yml | Electronリリース（GitHub Releases） |

---

## 4.8 ルートの設定ファイル群

| ファイル            | 役割                   |
| ------------------- | ---------------------- |
| package.json        | ワークスペースルート   |
| pnpm-workspace.yaml | pnpmワークスペース設定 |
| tsconfig.json       | TypeScript基本設定     |
| tsconfig.base.json  | 共通TypeScript設定     |
| .eslintrc.js        | ESLint設定             |
| .prettierrc         | Prettier設定           |
| vitest.config.ts    | Vitest設定             |
| .env.example        | 環境変数サンプル       |
| .gitignore          | Git無視設定            |
| README.md           | プロジェクト説明       |

---

## 4.9 機能追加の手順

### 4.9.1 新機能追加フロー

**ステップ1: フォルダ作成**

- apps/web/src/features/[feature-name]/ を作成する

**ステップ2: 必須ファイル作成**

| ファイル         | 役割                  |
| ---------------- | --------------------- |
| schema.ts        | 入出力スキーマ（Zod） |
| executor.ts      | ビジネスロジック      |
| executor.test.ts | ユニットテスト        |
| api.ts           | APIハンドラー         |

**ステップ3: オプションファイル作成**

| ファイル/フォルダ | 用途           |
| ----------------- | -------------- |
| hooks/            | 機能固有フック |
| components/       | 機能固有UI     |

**ステップ4: API登録**

- apps/web/src/app/api/v1/[feature-name]/route.ts を作成する

**影響範囲**: 新規フォルダのみ、既存コードの変更なし

---

## 4.10 構造の選択理由

### 4.10.1 機能ベース vs レイヤーベース

| 比較項目         | レイヤーベース         | 機能ベース（採用） |
| ---------------- | ---------------------- | ------------------ |
| ファイル配置     | 型別に分散             | 機能でまとめる     |
| 新機能追加       | 複数フォルダに分散     | 1フォルダで完結    |
| 機能削除         | 複数箇所から削除       | フォルダ削除のみ   |
| 関連ファイル確認 | 探し回る必要あり       | 同じ場所にある     |
| テスト管理       | テストが実装から離れる | テストが実装の隣   |
| 初心者の理解     | 難しい                 | 直感的             |

---

## 4.11 依存関係ルール

### 4.11.1 依存方向（逆方向禁止）

| 依存元                          | 依存先                          |
| ------------------------------- | ------------------------------- |
| apps/\*/                        | features/                       |
| features/                       | packages/shared/infrastructure/ |
| packages/shared/infrastructure/ | packages/shared/core/           |
| apps/\*/                        | packages/shared/ui/             |
| packages/shared/ui/             | packages/shared/core/           |

**違反検出**: ESLint eslint-plugin-boundaries で強制

### 4.11.2 各層の責務

| 層             | パス                            | 責務                                         |
| -------------- | ------------------------------- | -------------------------------------------- |
| Core           | packages/shared/core/           | ビジネスルール、エンティティ（外部依存ゼロ） |
| Infrastructure | packages/shared/infrastructure/ | 外部サービス接続（DB、AI、Discord）          |
| UI             | packages/shared/ui/             | 共通UIコンポーネント、Design Tokens          |
| Features       | apps/\*/features/               | プラットフォーム固有の機能ロジック           |
| App            | apps/web/app/                   | Next.js App Router、API Routes               |
| Desktop        | apps/desktop/src/               | Electron Main/Preload/Renderer               |

---

## 4.12 pnpm-workspace 設定

### 4.12.1 ワークスペース構成

| パッケージパス | 説明                 |
| -------------- | -------------------- |
| packages/\*    | 共有パッケージ       |
| apps/\*        | アプリケーション     |
| local-agent    | ローカルエージェント |

### 4.12.2 依存関係の指定方法

| 依存元       | 依存先       | 指定方法     |
| ------------ | ------------ | ------------ |
| apps/web     | @repo/shared | workspace:\* |
| apps/desktop | @repo/shared | workspace:\* |

---

## 関連ドキュメント

- [プロジェクト概要](./01-overview.md)
- [アーキテクチャ設計](./05-architecture.md)
- [プラグイン開発手順](./11-plugin-development.md)
