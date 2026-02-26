# アーキテクチャ総論

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorプロジェクトで採用しているアーキテクチャ、設計原則、パターンの総論です。個別の詳細は各ドキュメントを参照してください。

---

## 設計思想

### 採用アーキテクチャ

| アーキテクチャ | 説明 | 適用範囲 |
|--------------|------|---------|
| **Layered Architecture** | 依存方向を外側→内側に統一した層構造 | モノレポ全体 |
| **Monorepo** | pnpm workspace による共通コード共有 | プロジェクト構造 |
| **Domain-Centric** | ドメイン層を依存ゼロで維持 | packages/shared/core/ |

**レイヤードアーキテクチャの採用理由:**

- Clean Architectureの完全な実装ではなく、個人開発規模に適した簡略化版
- 内側の層（core, types）は外部依存ゼロを維持し、テスタビリティを確保
- 複雑なDI（Dependency Injection）コンテナは使用せず、明示的な依存注入

### 設計原則

| 原則 | 説明 | 適用方法 |
|-----|------|---------|
| **単一責任の原則（SRP）** | 1つのモジュールは1つの責務のみ | サービス分割、Slice分割 |
| **依存性逆転の原則（DIP）** | 上位モジュールは下位に依存しない | インターフェース定義 |
| **関心の分離（SoC）** | UI/ロジック/データを分離 | レイヤー構成 |
| **最小権限の原則** | 必要最小限のアクセス権のみ付与 | IPC Whitelist |

---

## レイヤー構成

### 依存方向（上位→下位）

| 順序 | レイヤー | コンポーネント | 依存先 |
|-----|---------|--------------|-------|
| 1 | Application Layer | apps/web/ (Next.js) | Infrastructure Layer |
| 1 | Application Layer | apps/desktop/ (Electron) | Infrastructure Layer |
| 2 | Infrastructure Layer | packages/shared/infrastructure/ (DB, AI, Discord, 外部サービス) | Domain Layer |
| 3 | Domain Layer | shared/core/ (エンティティ) | なし |
| 3 | Domain Layer | shared/types/ (型定義, Zod) | なし |

**依存ルール**: 上位レイヤーは下位レイヤーにのみ依存可能。Domain Layerは外部依存ゼロを維持。

### レイヤー定義

| レイヤー | ディレクトリ | 責務 | 依存許可 |
|---------|------------|------|---------|
| ドメイン | packages/shared/core/ | エンティティ、インターフェース | なし |
| 型定義 | packages/shared/src/types/ | 型定義、Zodスキーマ | なし |
| ドメインサービス | packages/shared/src/services/ | ビジネスロジック | types/ のみ |
| インフラ | packages/shared/infrastructure/ | 外部サービス連携 | core/, types/ |
| UI | packages/shared/ui/ | 共通コンポーネント | core/ |
| Webアプリ | apps/web/ | Next.js App Router | shared/* |
| Desktopアプリ | apps/desktop/ | Electron | shared/* |

📖 詳細: [architecture-monorepo.md](./architecture-monorepo.md)

---

## デザインパターン

### 構造パターン

| パターン | 適用箇所 | 目的 | 参照 |
|---------|---------|-----|-----|
| **Facade** | EnvironmentService, SkillService, SkillCreatorService | 複雑なサブシステムへの単純なインターフェース | arch-electron-services.md |
| **Repository** | SQLite操作（better-sqlite3） | データアクセスの抽象化 | arch-ipc-persistence.md |
| **Bridge** | IPC通信（Main↔Renderer） | 実装と抽象の分離 | security-electron-ipc.md |

### 振る舞いパターン

| パターン | 適用箇所 | 目的 | 参照 |
|---------|---------|-----|-----|
| **Result Type** | 全APIレスポンス | エラーハンドリングの統一 | error-handling.md |
| **Observer** | EventEmitter（Claude CLI） | ストリーミング出力 | arch-claude-cli.md |
| **State（Slice）** | Zustand状態管理 | UI状態の分離管理 | arch-state-management.md |

### アーキテクチャパターン

| パターン | 適用箇所 | 目的 | 参照 |
|---------|---------|-----|-----|
| **Slice Pattern** | Zustand Store | 機能単位の状態分離 | arch-state-management.md |
| **IPC Handler Registration** | registerAllIpcHandlers | ハンドラの一元管理 | arch-ipc-persistence.md |
| **IPC Handler Lifecycle** | unregisterAllIpcHandlers | macOS activate時の二重登録防止 | security-electron-ipc.md |
| **Whitelist Pattern** | IPC Channel定義 | セキュアな通信 | security-electron-ipc.md |

📖 詳細: [architecture-patterns.md](./architecture-patterns.md)

---

## UI/UXアーキテクチャ

### Atomic Design

| 階層 | 説明 | 配置場所 |
|-----|------|---------|
| **Atoms** | 最小単位（Button, Input, Icon） | packages/shared/ui/atoms/ |
| **Molecules** | 機能単位（FormField, SearchBar） | packages/shared/ui/molecules/ |
| **Organisms** | セクション（Header, Sidebar） | packages/shared/ui/organisms/ |
| **Templates** | レイアウト構造 | 各アプリ内 components/templates/ |
| **Pages** | 具体的な画面 | 各アプリの app/ |

### プラットフォームガイドライン

| ガイドライン | 適用範囲 | 目的 |
|------------|---------|-----|
| **Apple HIG** | Electron Desktop | macOSネイティブな操作感 |
| **WCAG 2.1 AA** | 全UI | アクセシビリティ |

📖 詳細: [ui-ux-design-principles.md](./ui-ux-design-principles.md)

---

## セキュリティアーキテクチャ

### Electron セキュリティ設定

| 設定 | 値 | 目的 |
|-----|---|-----|
| contextIsolation | true | Preloadスクリプトの分離 |
| nodeIntegration | false | Rendererからのシステムアクセス防止 |
| sandbox | true | Chromiumサンドボックス有効化 |
| webSecurity | true | Same-Originポリシー強制 |

### セキュリティパターン

| パターン | 説明 | 参照 |
|---------|-----|-----|
| **IPC Whitelist** | 許可チャンネルのみ通信可能 | security-electron-ipc.md |
| **safeInvoke/safeOn** | 安全なIPC呼び出しラッパー | security-electron-ipc.md |
| **Sender Validation** | IPC送信元の検証 | security-electron-ipc.md |
| **Path Traversal Prevention** | パス検証（Unicode正規化含む） | security-electron-ipc.md |
| **CSP** | Content Security Policy | security-electron-ipc.md |
| **SafeStorage** | OSキーチェーン活用 | security-principles.md |

### 認証・認可

| 方式 | 用途 | 参照 |
|-----|-----|-----|
| OAuth 2.0 PKCE | Desktop ソーシャルログイン | security-principles.md |
| Supabase Auth | 認証プロバイダー | security-principles.md |
| カスタムプロトコル | OAuth コールバック受信 | security-principles.md |

📖 詳細: [security-principles.md](./security-principles.md), [security-electron-ipc.md](./security-electron-ipc.md)

---

## 状態管理アーキテクチャ

### Zustand Slice構成

| Slice | 責務 | 実装ファイル |
|------|-----|------------|
| uiSlice | UI状態（currentView等） | store/slices/uiSlice.ts |
| authSlice | 認証状態 | store/slices/authSlice.ts |
| chatSlice | チャット状態 | store/slices/chatSlice.ts |
| agentSlice | エージェント・スキル管理 | store/slices/agentSlice.ts |
| chatEditSlice | コード編集状態 | features/workspace-chat-edit/store/ |

### 状態管理原則

| 原則 | 説明 |
|-----|-----|
| **Single Source of Truth** | 状態は一箇所で管理 |
| **Immutable Updates** | 状態は不変更新 |
| **Slice Isolation** | 機能単位でSliceを分離 |
| **Type Safety** | StateCreator型による型安全性 |

📖 詳細: [arch-state-management.md](./arch-state-management.md)

---

## データフローアーキテクチャ

### Electron IPC通信フロー

| ステップ | プロセス | コンポーネント | 処理内容 |
|---------|---------|--------------|---------|
| 1 | Renderer | Components / Stores / Hooks | UIイベント発生 |
| 2 | Renderer | window.*API (Preload Bridge) | IPC呼び出しをブリッジ |
| 3 | 境界 | IPC (Whitelist Channel) | ホワイトリストチャンネルで通信 |
| 4 | Main | IPC Handlers | リクエスト受信・ルーティング |
| 5 | Main | Services (Facade) | ビジネスロジック実行 |
| 5 | Main | Repositories (SQLite) | データ永続化 |
| 5 | Main | Managers (ClaudeCLI) | 外部プロセス管理 |
| 6 | Main → Renderer | IPC Response | 結果をRendererに返却 |

**セキュリティ**: 全通信はホワイトリストチャンネル経由。Sender検証必須。

### IPC ハンドラー登録一覧

`registerAllIpcHandlers` で一元管理されるハンドラー群。各ハンドラーの登録パターンは引数の依存関係によって分類される。

| ハンドラー登録関数               | 登録パターン                 | チャンネル数 | 参照                     |
| -------------------------------- | ---------------------------- | ------------ | ------------------------ |
| registerAuthHandlers             | Pattern 1: mainWindow のみ  | -            | api-ipc-auth.md          |
| registerSkillHandlers            | Pattern 2: service のみ     | -            | api-ipc-agent.md         |
| registerChatEditHandlers         | Pattern 3: mainWindow + service | 4         | api-ipc-agent.md         |
| registerSkillCreatorHandlers     | Pattern 3: mainWindow + service | 13 (12 invoke + 1 progress) | api-ipc-agent.md |
| registerSkillFileHandlers        | Pattern 3: mainWindow + service | 6         | api-ipc-agent.md |

**Pattern 3 詳細（registerSkillFileHandlers）**:

- **引数**: `mainWindow: BrowserWindow`, `service: SkillFileManager`
- **mainWindow用途**: Sender検証（`validateIpcSender`）
- **service用途**: SkillFileManagerへのファイル操作委譲
- **対応チャンネル**: `skill:readFile`, `skill:writeFile`, `skill:createFile`, `skill:deleteFile`, `skill:listBackups`, `skill:restoreBackup`
- **セキュリティ**: 全ハンドラーでSender検証、引数バリデーション、`isKnownSkillFileError`によるエラーサニタイズ適用
- **関連タスク**: TASK-9A-B（2026-02-19完了）

**Pattern 3 詳細（registerSkillCreatorHandlers）**:

- **引数**: `mainWindow: BrowserWindow`, `service: SkillCreatorService`
- **mainWindow用途**: Sender検証（`validateIpcSender`）、進捗通知（`webContents.send`）
- **service用途**: SkillCreatorServiceへのビジネスロジック委譲
- **対応チャンネル**: `skill-creator:detect-mode`, `skill-creator:create`, `skill-creator:execute-tasks`, `skill-creator:validate`, `skill-creator:validate-schema`, `skill-creator:improve`, `skill-creator:fork`, `skill-creator:share`, `skill-creator:schedule`, `skill-creator:debug`, `skill-creator:generate-docs`, `skill-creator:stats`, `skill-creator:progress`
- **セキュリティ**: 全ハンドラーでSender検証、エラーサニタイズ適用
- **関連タスク**: TASK-9B-H-SKILL-CREATOR-IPC（2026-02-12完了）

📖 詳細: [architecture-patterns.md](./architecture-patterns.md)

---

## ディレクトリ構造

### モノレポ全体構成

| ディレクトリ | 役割 |
|------------|-----|
| apps/web/ | Next.js Webアプリ |
| apps/web/app/ | App Router |
| apps/web/features/ | 機能モジュール |
| apps/desktop/ | Electron デスクトップアプリ |
| apps/desktop/src/main/ | Main Process |
| apps/desktop/src/renderer/ | Renderer Process |
| apps/desktop/src/preload/ | Preload Script |
| packages/shared/ | 共有パッケージ |
| packages/shared/core/ | ドメイン層（依存ゼロ） |
| packages/shared/src/types/ | 型定義（依存ゼロ） |
| packages/shared/src/services/ | ドメインサービス |
| packages/shared/infrastructure/ | インフラ層 |
| packages/shared/ui/ | UIコンポーネント |
| docs/ | ドキュメント |
| .claude/skills/ | Claude Codeスキル |

### Desktop Main Process構造

| ディレクトリ | 役割 |
|------------|-----|
| apps/desktop/src/main/services/ | Facadeサービス |
| apps/desktop/src/main/services/environment/ | 環境サービス |
| apps/desktop/src/main/services/skill/ | スキルサービス |
| apps/desktop/src/main/services/skill/ | スキル作成サービス（SkillCreatorService含む） |
| apps/desktop/src/main/ipc/ | IPCハンドラ |
| apps/desktop/src/main/infrastructure/ | インフラ（DB、セキュリティ） |
| apps/desktop/src/main/infrastructure/db/ | better-sqlite3 |
| apps/desktop/src/main/infrastructure/security/ | IPC検証、CSP |
| apps/desktop/src/main/index.ts | エントリポイント |

### Desktop Renderer Process構造

| ディレクトリ | 役割 |
|------------|-----|
| apps/desktop/src/renderer/components/ | UIコンポーネント |
| apps/desktop/src/renderer/components/atoms/ | 最小単位 |
| apps/desktop/src/renderer/components/molecules/ | 機能単位 |
| apps/desktop/src/renderer/components/organisms/ | セクション |
| apps/desktop/src/renderer/features/ | 機能モジュール |
| apps/desktop/src/renderer/features/{feature}/components/ | 機能固有コンポーネント |
| apps/desktop/src/renderer/features/{feature}/hooks/ | 機能固有フック |
| apps/desktop/src/renderer/features/{feature}/store/ | 機能固有Slice |
| apps/desktop/src/renderer/store/ | グローバルStore |
| apps/desktop/src/renderer/store/slices/ | Zustand Slice |
| apps/desktop/src/renderer/hooks/ | 共通フック |
| apps/desktop/src/renderer/views/ | ビュー（ページ相当） |

📖 詳細: [directory-structure.md](./directory-structure.md)

---

## データ構造（型システム）

### 型定義の配置

| カテゴリ | 配置場所 | 用途 |
|---------|---------|-----|
| 共通型 | `packages/shared/src/types/` | Web/Desktop共通 |
| RAG型 | `packages/shared/src/types/rag/` | RAG機能 |
| スキル型 | `packages/shared/src/types/skill.ts` | スキル管理 |
| Agent SDK型 | `packages/shared/src/types/agent.ts` | Agent SDK連携 |
| IPC型 | `apps/desktop/src/renderer/types/` | IPC通信 |

### 型定義原則

| 原則 | 説明 |
|-----|-----|
| **Zod First** | ランタイムバリデーション付き型定義 |
| **Infer Type** | `z.infer<typeof schema>` で型推論 |
| **Shared Types** | Web/Desktop共通型は shared に配置 |
| **Result Pattern** | 全APIは `Result<T>` 型で統一 |

### 主要型定義ファイル

| ファイル | 内容 | 参照 |
|---------|-----|-----|
| interfaces-core.md | コア型定義 | interfaces-core.md |
| interfaces-rag.md | RAG型定義 | interfaces-rag.md |
| interfaces-agent-sdk.md | Agent SDK型定義 | interfaces-agent-sdk.md |
| interfaces-auth.md | 認証型定義 | interfaces-auth.md |

📖 詳細: [interfaces-core.md](./interfaces-core.md)

---

## 機能追加パターン

### Web機能追加（apps/web/features/）

| ステップ | 内容 | 成果物 |
|---------|-----|-------|
| 1 | Zodスキーマ定義 | `schema.ts` |
| 2 | Executor実装 | `executor.ts` |
| 3 | テスト作成 | `executor.test.ts` |
| 4 | API Route追加 | `app/api/...` |

### Desktop機能追加

| ステップ | 内容 | 成果物 |
|---------|-----|-------|
| 1 | 型定義 | `packages/shared/src/types/` |
| 2 | Main Processサービス | `main/services/{name}/` |
| 3 | IPCハンドラ | `main/ipc/{name}Handlers.ts` |
| 4 | Preload API公開 | `preload/index.ts` |
| 5 | Renderer UI | `renderer/features/{name}/` |
| 6 | Zustand Slice | `renderer/store/slices/` |

### 新規Slice追加手順

| ステップ | 内容 |
|---------|-----|
| 1 | `store/slices/{name}Slice.ts` 作成 |
| 2 | State, Actions, Slice インターフェース定義 |
| 3 | `store/index.ts` でSliceをimport・統合 |
| 4 | テスト作成 |

📖 詳細: [arch-feature-addition.md](./arch-feature-addition.md)

---

## 技術スタック

| カテゴリ | ドキュメント | 内容 |
|---------|------------|-----|
| コア | [technology-core.md](./technology-core.md) | Next.js, TypeScript, Electron |
| フロントエンド | [technology-frontend.md](./technology-frontend.md) | React, Tailwind, Zustand |
| バックエンド | [technology-backend.md](./technology-backend.md) | Drizzle, Turso, AI統合 |
| デスクトップ | [technology-desktop.md](./technology-desktop.md) | Electron, better-sqlite3 |
| DevOps | [technology-devops.md](./technology-devops.md) | CI/CD, テスト |

---

## テンプレート

新規仕様書作成時は以下のテンプレートを使用してください。

| テンプレート | 用途 | パス |
|------------|-----|-----|
| spec-template.md | 汎用仕様書 | templates/ |
| architecture-template.md | アーキテクチャ | templates/ |
| interfaces-template.md | 型定義 | templates/ |
| ipc-channel-template.md | IPC仕様 | templates/ |
| service-template.md | サービス仕様 | templates/ |
| ui-ux-template.md | UI/UX仕様 | templates/ |
| api-template.md | API仕様 | templates/ |
| react-hook-template.md | Hook仕様 | templates/ |
| database-template.md | DB仕様 | templates/ |
| security-template.md | セキュリティ | templates/ |
| testing-template.md | テスト仕様 | templates/ |

---

## 関連ドキュメント

### アーキテクチャ詳細

| ドキュメント | 内容 |
|------------|-----|
| [architecture-patterns.md](./architecture-patterns.md) | パターンインデックス |
| [architecture-monorepo.md](./architecture-monorepo.md) | モノレポ構成 |
| [arch-state-management.md](./arch-state-management.md) | 状態管理 |
| [arch-electron-services.md](./arch-electron-services.md) | Electronサービス |
| [arch-ipc-persistence.md](./arch-ipc-persistence.md) | IPC・永続化 |
| [arch-ui-components.md](./arch-ui-components.md) | UIコンポーネント |
| [arch-claude-cli.md](./arch-claude-cli.md) | Claude CLI連携 |

### セキュリティ

| ドキュメント | 内容 |
|------------|-----|
| [security-principles.md](./security-principles.md) | セキュリティ原則・認証 |
| [security-electron-ipc.md](./security-electron-ipc.md) | Electron IPC |
| [security-api.md](./security-api.md) | APIセキュリティ |
| [security-skill-execution.md](./security-skill-execution.md) | スキル実行 |

### UI/UX

| ドキュメント | 内容 |
|------------|-----|
| [ui-ux-design-principles.md](./ui-ux-design-principles.md) | デザイン原則・UX法則 |
| [ui-ux-components.md](./ui-ux-components.md) | コンポーネント概要 |

### 開発ガイドライン

| ドキュメント | 内容 |
|------------|-----|
| [development-guidelines.md](./development-guidelines.md) | ロギング・キャッシング・マイグレーション・コードレビュー・命名規則・デバッグ・リリース |
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | フロントエンド/バックエンド/デスクトップ/パフォーマンス/セキュリティ実装パターン |
| [quality-requirements.md](./quality-requirements.md) | 非機能要件・テスト戦略 |
| [error-handling.md](./error-handling.md) | エラーハンドリング仕様 |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.7.0 | 2026-02-26 | TASK-9B反映: `registerSkillCreatorHandlers` のチャンネル数を 13（12 invoke + 1 progress）へ更新。Pattern 3 詳細に拡張7チャンネルを追記し、Main Process構造の `services/skill-creator/` 誤記を `services/skill/` に修正 |
| 1.6.0 | 2026-02-12 | TASK-9B-H: SkillCreatorService追加。IPCハンドラー登録一覧セクション新設、Facadeパターン・ディレクトリ構造にskill-creator追加 |
| 1.5.0 | 2026-01-26 | 仕様ガイドライン完全準拠: ASCII図（依存方向図、IPC通信図）を表形式に変換 |
| 1.4.0 | 2026-01-26 | 仕様ガイドライン準拠: ディレクトリ構造を表形式に変換、参照名修正 |
| 1.3.0 | 2026-01-26 | 実装パターン総合ガイド参照追加 |
| 1.2.0 | 2026-01-26 | 開発ガイドライン参照追加 |
| 1.1.0 | 2026-01-26 | ディレクトリ構造、データ構造、機能追加パターン、テンプレート追加 |
| 1.0.0 | 2026-01-26 | 初版作成 - アーキテクチャ総論 |
