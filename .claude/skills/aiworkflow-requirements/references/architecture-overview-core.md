# アーキテクチャ総論 / core specification

> 親仕様書: [architecture-overview.md](architecture-overview.md)
> 役割: core specification

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
| **Conversation DB Graceful Degradation** | registerConversationHandlers | DB障害時のフォールバック応答 | arch-ipc-persistence.md |
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

### Desktop Renderer レイアウト構成（TASK-UI-02）

| コンポーネント | 役割 | 実装場所 |
| --- | --- | --- |
| `AppLayout` | left rail / header / main / mobile bottom nav の統合テンプレート | `apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx` |
| `GlobalNavStrip` | desktop/tablet の global navigation | `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/index.tsx` |
| `MobileNavBar` | mobile primary 5 + More 4 の下部ナビ | `apps/desktop/src/renderer/components/organisms/MobileNavBar/index.tsx` |
| `useNavShortcuts` | global shortcut と戻る導線の統合 | `apps/desktop/src/renderer/hooks/useNavShortcuts.ts` |

`App.tsx` は feature flag により legacy `AppDock` と新構成を切り替える。Step 3 までは rollback path を維持する。

TASK-SKILL-LIFECYCLE-01 以降、`SkillCenterView` は lifecycle の primary entry surface として扱い、create / use / improve の job guide を入口で提示する。shell 側では `normalizeSkillLifecycleView()` により legacy `skill-center` alias を canonical `skillCenter` に寄せてから view 分岐する。

### Skill Advanced Views（TASK-UI-05B — 実装完了）

| ビュー | 責務 | コンポーネント数 | 配置先 |
|-------|------|--------------|-------|
| 3A: SkillChainBuilder | スキルチェーンパイプライン構築 | 7 | views/SkillChainBuilder/ |
| 3B: ScheduleManager | スケジュール管理 | 9 | views/ScheduleManager/ |
| 3C: DebugPanel | デバッグパネル | 10 | views/DebugPanel/ |
| 3D: AnalyticsDashboard | 分析ダッシュボード | 7 | views/AnalyticsDashboard/ |

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
| uiSlice | UI状態（currentView / responsiveMode / isNavExpanded / isMobileMoreOpen） | store/slices/uiSlice.ts |
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

### Conversation 永続化アーキテクチャ（TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION）

| 項目 | 内容 |
|-----|------|
| データストア | better-sqlite3（WAL mode） |
| スキーマ | chat_sessions + chat_messages（4インデックス） |
| IPC チャンネル | conversation:create/get/list/add-message/update-title/delete/search |
| 登録パターン | safeRegister + track（Section 13） |
| 障害時動作 | Graceful Degradation（ERR_4006 DB_NOT_AVAILABLE） |

📖 詳細: [arch-ipc-persistence.md](./arch-ipc-persistence.md), [database-schema.md](./database-schema.md)

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
| registerSkillHandlers            | Pattern 3: mainWindow + service | -         | api-ipc-agent.md         |
| registerChatEditHandlers         | Pattern 3: mainWindow + service | 4         | api-ipc-agent.md         |
| registerSkillCreatorHandlers     | Pattern 3: mainWindow + service + optional runtime service | 16 (15 invoke + 1 progress) | api-ipc-system-core.md |
| registerSkillFileHandlers        | Pattern 3: mainWindow + service | 6         | api-ipc-agent.md |
| registerSkillDebugHandlers       | Pattern 3: mainWindow + service | 7 (6 invoke + 1 event) | api-ipc-agent.md |
| registerSkillDocsHandlers        | Pattern 3: mainWindow + service | 4         | api-ipc-agent.md |
| registerSkillScheduleHandlers    | Pattern 4: mainWindow + service + store | 5 | api-ipc-agent.md |
| registerSkillAnalyticsHandlers   | Pattern 3: mainWindow + service | 5 | api-ipc-agent.md |
| advancedConsoleHandlers | `src/main/ipc/advancedConsoleHandlers.ts` | Advanced Console データ取得（ターミナルログ・コピーコマンド） | - |
| approvalHandlers | `src/main/ipc/approvalHandlers.ts` | 承認/拒否応答処理（P42 3段バリデーション付き） | - |
| disclosureHandlers | `src/main/ipc/disclosureHandlers.ts` | AI開示情報取得・dismiss/reopen状態管理 | - |

**Pattern 3 詳細（registerSkillHandlers）**:

- **引数**: `mainWindow: BrowserWindow`, `service: SkillService`
- **mainWindow用途**: Sender検証（`validateIpcSender`）、権限/進捗イベントの通知経路
- **service用途**: `SkillService` を中心に `SkillAnalyzer` / `SkillImprover` / `PromptOptimizer` / `SkillForker` / `SkillScheduler` へ処理委譲
- **対応チャネル**: `skill:list`, `skill:scan`, `skill:getImported`, `skill:import`, `skill:remove`, `skill:create`, `skill:get-detail`, `skill:update`, `skill:execute`, `skill:abort`, `skill:get-status`, `skill:analyze`, `skill:improve`, `skill:optimize`, `skill:optimize:variants`, `skill:optimize:evaluate`, `skill:fork`, `skill:schedule:*`
- **セキュリティ**: 全 invoke ハンドラーで sender 検証 + P42準拠バリデーション + エラーサニタイズを適用
- **関連タスク**: TASK-9C, TASK-9E, TASK-9G, TASK-10A-C, TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001

**Pattern 3 詳細（registerSkillFileHandlers）**:

- **引数**: `mainWindow: BrowserWindow`, `service: SkillFileManager`
- **mainWindow用途**: Sender検証（`validateIpcSender`）
- **service用途**: SkillFileManagerへのファイル操作委譲
- **対応チャンネル**: `skill:readFile`, `skill:writeFile`, `skill:createFile`, `skill:deleteFile`, `skill:listBackups`, `skill:restoreBackup`
- **セキュリティ**: 全ハンドラーでSender検証、引数バリデーション、`isKnownSkillFileError`によるエラーサニタイズ適用
- **関連タスク**: TASK-9A-B（2026-02-19完了）

**Pattern 3 詳細（registerSkillCreatorHandlers）**:

- **引数**: `mainWindow: BrowserWindow`, `skillCreatorService: SkillCreatorService`, `runtimeSkillCreatorService?: RuntimeSkillCreatorFacade`
- **mainWindow用途**: Sender検証（`validateIpcSender`）、進捗通知（`webContents.send`）
- **skillCreatorService用途**: `detect-mode` / `create` / `execute-tasks` / `validate` / `validate-schema` / `improve` / `fork` / `share` / `schedule` / `debug` / `generate-docs` / `stats` を担当
- **runtimeSkillCreatorService用途**: `skill-creator:plan` / `skill-creator:execute-plan` / `skill-creator:improve-skill` の runtime public bridge を担当し、未注入時も degraded response を返す
- **対応チャンネル**: `skill-creator:detect-mode`, `skill-creator:create`, `skill-creator:execute-tasks`, `skill-creator:validate`, `skill-creator:validate-schema`, `skill-creator:improve`, `skill-creator:fork`, `skill-creator:share`, `skill-creator:schedule`, `skill-creator:debug`, `skill-creator:generate-docs`, `skill-creator:stats`, `skill-creator:plan`, `skill-creator:execute-plan`, `skill-creator:improve-skill`, `skill-creator:progress`
- **セキュリティ**: 標準 invoke handler と runtime helper の全経路で Sender検証、P42 準拠の blank 判定、エラーサニタイズを適用
- **関連タスク**: TASK-9B-H-SKILL-CREATOR-IPC（2026-02-12完了）、UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001（2026-03-21完了）

### Skill Creator Runtime Orchestration Foundation

`registerSkillCreatorHandlers` が公開する runtime bridge の背後では、Skill Creator runtime を次の 3 層で分ける。

| 層 | コンポーネント | 役割 |
| --- | --- | --- |
| public bridge | `RuntimeSkillCreatorFacade` | `skill-creator:plan/execute-plan/improve-skill` の public response と degraded response を返す |
| workflow foundation | `ManifestLoader`, `WorkflowManifest*` | `workflow-manifest.json` の read / validate / normalize / cache と shared contract を担う |
| workflow state owner | `SkillCreatorWorkflowEngine` | `currentPhase` / `awaitingUserInput` / `verifyResult` / phase artifacts / `resumeTokenEnvelope` を保持し、source provenance snapshot を route snapshot と同一 envelope に固定する |

Task08 session persistence/resume contract では、この engine state を永続化の正本入力として扱う。`resumeTokenEnvelope` 自体は runtime snapshot、persisted checkpoint は別契約とし、checkpoint は phase boundary 単位、resume public surface を追加する場合は `skill-creator:*` namespace を使って `agent:resumeSession` を流用しない。

この構成では、`RuntimeSkillCreatorFacade` は state owner ではなく public bridge に留まり、`plan()` の review state 記録、`execute()` の `terminal_handoff` 早期 return、`integrated_api` 完了時の verify 遷移記録を engine へ委譲する。`success: false` と executor reject は verify pending に進めず review へ戻し、`verification_review` と失敗 snapshot を engine が保持する。`ManifestLoader` も route authority へ昇格しない。owner 分離と downstream handoff は Task02 workflow 仕様書を正本とする。

TASK-FIX-EXECUTE-PLAN-FF-001 以降、`skill-creator:execute-plan` は `{ accepted: true, planId }` の ack を返す fire-and-forget 入口として扱い、実行完了通知は `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` snapshot relay に分離する。これにより `RuntimeSkillCreatorFacade` の public bridge は受付責務のみを持ち、Engine は内部 progress hook を保持する。

**Pattern 3 詳細（registerSkillDebugHandlers）**:

- **引数**: `mainWindow: BrowserWindow`
- **mainWindow用途**: Sender検証（`validateIpcSender`）、イベント通知（`webContents.send`）
- **service用途**: `SkillDebugger` を内部生成してセッション管理・式評価を委譲
- **対応チャンネル**: `skill:debug:start`, `skill:debug:command`, `skill:debug:breakpoint:add`, `skill:debug:breakpoint:remove`, `skill:debug:inspect`, `skill:debug:evaluate`, `skill:debug:event`
- **セキュリティ**: 全 invoke ハンドラーでSender検証 + P42準拠入力検証。`evaluate` は vm サンドボックス + タイムアウト制限を適用
- **関連タスク**: TASK-9H（2026-02-27完了）

**Pattern 3 詳細（registerSkillDocsHandlers）**:

- **引数**: `mainWindow: BrowserWindow`, `skillDocGenerator: SkillDocGenerator`
- **mainWindow用途**: Sender検証（`validateIpcSender`）
- **service用途**: SkillDocGenerator へのドキュメント生成処理委譲
- **対応チャンネル**: `skill:docs:generate`, `skill:docs:preview`, `skill:docs:export`, `skill:docs:templates`
- **セキュリティ**: 全ハンドラーで sender 検証、P42準拠3段バリデーション、`export` のパストラバーサル検証、エラー正規化適用
- **関連タスク**: TASK-9I（2026-02-28完了）

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
| apps/desktop/src/main/adapters/llm/ | LLM Adapter（Anthropic/OpenAI/Google/xAI） |
| apps/desktop/src/main/adapters/handoff/ | Handoff Adapter（HandoffSource → HandoffGuidance 変換。Discriminated Union: chat-edit/agent/skill/bundle） |
| apps/desktop/src/main/ipc/ | IPCハンドラ |
| apps/desktop/src/main/infrastructure/ | インフラ（DB、セキュリティ） |
| apps/desktop/src/main/infrastructure/db/ | better-sqlite3 |
| apps/desktop/src/main/infrastructure/security/ | IPC検証、CSP |
| apps/desktop/src/main/menu.ts | アプリケーションメニュー（ズーム制御含む） |
| apps/desktop/src/main/index.ts | エントリポイント（関連未タスク: [UT-IMP-MAIN-PROCESS-MODULE-EXTRACTION-GUARD-001](../../docs/30-workflows/completed-tasks/TASK-FIX-ELECTRON-APP-MENU-ZOOM-001/unassigned-task/task-imp-main-process-module-extraction-guard-001.md) — トップレベル副作用モジュール分離ガード） |

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
| apps/desktop/src/renderer/views/SkillChainBuilder/ | スキルチェーンビルダー（3A） |
| apps/desktop/src/renderer/views/ScheduleManager/ | スケジュール管理（3B） |
| apps/desktop/src/renderer/views/DebugPanel/ | デバッグパネル（3C） |
| apps/desktop/src/renderer/views/AnalyticsDashboard/ | 分析ダッシュボード（3D） |

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
