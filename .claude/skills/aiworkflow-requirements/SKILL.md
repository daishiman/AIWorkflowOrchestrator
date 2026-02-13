---
name: aiworkflow-requirements
description: |
  AIWorkflowOrchestratorの仕様管理スキル。references/配下の全仕様を検索・参照する。

  Anchors:
  - Specification-Driven Development / 適用: 仕様書正本 / 目的: 実装との一貫性
  - Progressive Disclosure / 適用: 検索→詳細参照 / 目的: コンテキスト効率化
  - MECE原則 / 適用: トピック分類 / 目的: 漏れなく重複なく

  Trigger:
  プロジェクト仕様の検索、アーキテクチャ確認、API設計参照、セキュリティ要件確認、テスト戦略参照を行う場合に使用。
  仕様, 要件, アーキテクチャ, API, データベース, セキュリティ, UI/UX, デプロイ, Claude Code, テスト, MSW, カバレッジ, PermissionStore, 権限永続化, rememberChoice, SkillSlice, Zustand, 状態管理, skillSlice, リトライ, retry, backoff, Exponential Backoff, Jitter, RetryConfig, permissionHistory, PermissionHistoryPanel, PermissionHistorySlice, 権限履歴, 履歴トラッキング, safeArgsSnapshot, PermissionHistoryEntry, PermissionHistoryFilter, DatePreset, DateRangeFilter, dateFilterUtils, 期間フィルタ, コンポーネントテスト, Storeモック, フィクスチャ, アクセシビリティ, WCAG, userEvent, fireEvent, RTL, React Testing Library, jest-axe, ARIA, SkillStreamMessage, Discriminated Union, BaseStreamMessage, 型統合, skill-execution, ExecutionState, SkillExecutionRequest, session, refresh, token, scheduler, TokenRefreshScheduler, セッション, トークンリフレッシュ, セッション自動更新, スケジューラー, autoRefreshToken, TokenRefreshCallbacks, TokenRefreshConfig, electron-store, 型バリデーション, validateStoredSkillIds, SkillStore, SkillImportManager, 永続化, persistence, 実行時バリデーション, unknown型, 型アサーション, safeInvoke, safeOn, IPC Bridge API統一, Preload API統一, electronAPI.skill, OperationResult廃止, Agent Abort, ipcRenderer.send, ipcMain.handle, removeHandler, IPCチャネル名不整合, 型定義不一致, 横断的検証, P31, 無限ループ, useRef, Store Hook, useEffect依存配列, useAuthModeStore, 合成Store Hook, 個別セレクタ, 参照安定性, AuthMode, Setter Injection, 依存性注入, 遅延初期化, setSkillExecutor, SkillExecutor委譲, DIパターン, Constructor Injection, Factory Pattern, BrowserWindow遅延生成, テストモック大規模修正, コンポーネント移行, 再レンダー最適化, SkillCreatorService, skill-creator IPC, skillCreatorAPI
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# AIWorkflow Requirements Manager

## 概要

AIWorkflowOrchestratorプロジェクトの全仕様を管理するスキル。
**このスキルが仕様の正本**であり、references/配下のドキュメントを直接編集・参照する。

## クイックスタート

### 仕様を探す

```bash
# キーワード検索（推奨）
node scripts/search-spec.js "認証" -C 5

# または resource-map.md でタスク種別から逆引き
```

### 仕様を読む

1. **まず [resource-map.md](indexes/resource-map.md) を確認** - タスク種別に応じた読み込みファイルを特定
2. 該当ファイルを `Read` ツールで参照
3. 詳細行番号が必要な場合は [topic-map.md](indexes/topic-map.md) を参照

### 仕様を作成・更新

1. `assets/` 配下の該当テンプレートを使用
2. `references/spec-guidelines.md` の命名規則に従う
3. 編集後は `node scripts/generate-index.js` を実行

## ワークフロー

```
                    ┌→ search-spec ────┐
user-request → ┼                       ┼→ read-reference → apply-to-task
                    └→ browse-index ───┘
                              ↓
                    (仕様変更が必要な場合)
                              ↓
              ┌→ create-spec ──────────┐
              ┼                         ┼→ update-index → validate-structure
              └→ update-spec ──────────┘
```

## Task仕様ナビ

| Task               | 責務           | 起動タイミング     | 入力         | 出力             |
| ------------------ | -------------- | ------------------ | ------------ | ---------------- |
| search-spec        | 仕様検索       | 仕様確認が必要な時 | キーワード   | ファイルパス一覧 |
| browse-index       | 全体像把握     | 構造理解が必要な時 | なし         | トピック構造     |
| read-reference     | 仕様参照       | 詳細確認が必要な時 | ファイルパス | 仕様内容         |
| create-spec        | 新規作成       | 新機能追加時       | 要件         | 新規仕様ファイル |
| update-spec        | 既存更新       | 仕様変更時         | 変更内容     | 更新済みファイル |
| update-index       | インデックス化 | 見出し変更後       | references/  | indexes/         |
| validate-structure | 構造検証       | 週次/リリース前    | 全体         | 検証レポート     |

## リソース参照

### 仕様ファイル一覧

See [indexes/resource-map.md](indexes/resource-map.md)（読み込み条件付き）

詳細セクション・行番号: [indexes/topic-map.md](indexes/topic-map.md)

| カテゴリ         | 主要ファイル                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| 概要・品質       | overview.md, quality-requirements.md                                                              |
| アーキテクチャ   | **architecture-overview.md**, architecture-patterns.md, arch-\*.md                                |
| インターフェース | interfaces-agent-sdk.md, llm-\*.md, rag-search-\*.md                                              |
| API設計          | api-endpoints.md, api-ipc-\*.md                                                                   |
| データベース     | database-schema.md, database-implementation.md                                                    |
| UI/UX            | ui-ux-components.md, ui-ux-design-principles.md, ui-history-\*.md                                 |
| セキュリティ     | security-principles.md, security-electron-ipc.md, csrf-state-parameter.md, security-\*.md         |
| 技術スタック     | technology-core.md, technology-frontend.md, technology-desktop.md                                 |
| Claude Code      | claude-code-overview.md, claude-code-skills-\*.md                                                 |
| デプロイ・運用   | deployment.md, deployment-electron.md, environment-variables.md                                   |
| ガイドライン     | spec-guidelines.md, development-guidelines.md, architecture-implementation-patterns.md, rag-\*.md |

**注記**: 18-skills.md（Skill層仕様書）は `skill-creator` スキルで管理。

### scripts/

| スクリプト                  | 用途               | 使用例                                       |
| --------------------------- | ------------------ | -------------------------------------------- |
| `search-spec.js`            | キーワード検索     | `node scripts/search-spec.js "認証" -C 5`    |
| `list-specs.js`             | ファイル一覧       | `node scripts/list-specs.js --topics`        |
| `generate-index.js`         | インデックス再生成 | `node scripts/generate-index.js`             |
| `validate-structure.js`     | 構造検証           | `node scripts/validate-structure.js`         |
| `select-template.js`        | テンプレート選定   | `node scripts/select-template.js "IPC仕様"`  |
| `split-reference.js`        | 大規模ファイル分割 | `node scripts/split-reference.js <file>`     |
| `remove-heading-numbers.js` | 見出し番号削除     | `node scripts/remove-heading-numbers.js`     |
| `log_usage.js`              | 使用状況記録       | `node scripts/log_usage.js --result success` |

### agents/

| エージェント       | 用途         | 対応Task           | 主な機能                         |
| ------------------ | ------------ | ------------------ | -------------------------------- |
| `create-spec.md`   | 新規仕様作成 | create-spec        | テンプレート対応、重複チェック   |
| `update-spec.md`   | 既存仕様更新 | update-spec        | テンプレート準拠、分割ガイド     |
| `validate-spec.md` | 仕様検証     | validate-structure | resource-map登録確認、サイズ検証 |

### indexes/

| ファイル             | 内容                                       | 用途                  |
| -------------------- | ------------------------------------------ | --------------------- |
| `quick-reference.md` | キー情報の即時アクセス（推奨・最初に読む） | パターン/型/IPC早見表 |
| `resource-map.md`    | リソースマップ（読み込み条件付き）         | タスク種別→ファイル   |
| `topic-map.md`       | トピック別マップ（セクション・行番号詳細） | セクション直接参照    |
| `keywords.json`      | キーワード索引（自動生成）                 | スクリプト検索用      |

> **Progressive Disclosure**: まずresource-map.mdでタスクに必要なファイルを特定し、必要なファイルのみを読み込む。

### templates/

新規仕様書作成時のテンプレート。`node scripts/select-template.js` で自動選定可能。

| ファイル                    | 用途                 | 対象カテゴリ     |
| --------------------------- | -------------------- | ---------------- |
| `spec-template.md`          | 汎用仕様テンプレート | 概要・品質       |
| `interfaces-template.md`    | インターフェース仕様 | インターフェース |
| `architecture-template.md`  | アーキテクチャ仕様   | アーキテクチャ   |
| `api-template.md`           | API設計              | API設計          |
| `ipc-channel-template.md`   | Electron IPC         | IPC通信          |
| `react-hook-template.md`    | React Hook           | カスタムフック   |
| `react-context-template.md` | React Context        | 状態管理         |
| `service-template.md`       | サービス層           | ビジネスロジック |
| `database-template.md`      | データベース仕様     | データベース     |
| `ui-ux-template.md`         | UI/UX仕様            | UI/UX            |
| `security-template.md`      | セキュリティ仕様     | セキュリティ     |
| `testing-template.md`       | テスト仕様           | テスト戦略       |

> **注記**: 詳細はtemplates/配下を直接参照。追加テンプレートが必要な場合は `agents/create-spec.md` を参照。

### references/（ガイドライン）

| ファイル                       | 内容                           |
| ------------------------------ | ------------------------------ |
| `spec-guidelines.md`           | 命名規則・記述ガイドライン     |
| `spec-splitting-guidelines.md` | 大規模ファイル分割ガイドライン |

### 連携スキル

| スキル                       | 用途                                                   |
| ---------------------------- | ------------------------------------------------------ |
| `task-specification-creator` | タスク仕様書作成、Phase 12での仕様更新ワークフロー管理 |

**Phase 12 仕様更新時**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

### 運用ファイル

| ファイル     | 用途                         |
| ------------ | ---------------------------- |
| `EVALS.json` | スキルレベル・メトリクス管理 |
| `LOGS.md`    | 使用履歴・フィードバック記録 |

## ベストプラクティス

### すべきこと

- キーワード検索で情報を素早く特定
- 編集後は `node scripts/generate-index.js` を実行
- 500行超過時はインデックス+サブファイル形式に手動分割

### 避けるべきこと

- references/以外に仕様情報を分散
- インデックス更新を忘れる
- 詳細ルールをSKILL.mdに追加（→ spec-guidelines.md へ）

**詳細ルール**: See [references/spec-guidelines.md](references/spec-guidelines.md)

## 変更履歴

> 古い履歴（v8.31.0以前）は [LOGS.md](LOGS.md#変更履歴アーカイブ) に移動しました。

| Version     | Date           | Changes                                                                                                                                                                           |
| ----------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v1.29.0** | **2026-02-13** | **TASK-FIX-13-1未タスク仕様書作成（UT-TYPE-DATETIME-DOC-001追加、task-workflow.md更新）** |
| **v1.28.0** | **2026-02-13** | **TASK-FIX-13-1再検証教訓追記**: lessons-learned.md v1.8.0更新（ドキュメント偏重による実装検証省略、並列エージェント品質保証の教訓2件追加）。skill-creatorのpatterns.mdにdeprecatedプロパティ移行パターンを追加 |
| **v1.27.0** | **2026-02-13** | **TASK-FIX-13-1教訓追記**: interfaces-agent-sdk-skill.md v1.19.0（苦戦箇所・再発防止策を追加）、task-workflow.md v1.36.0（完了タスク節に苦戦箇所テーブル追加）、lessons-learned.md v1.7.0（教訓3件追加） |
| **v1.26.0** | **2026-02-13** | **TASK-FIX-13-1完了反映 + 未タスク登録**: interfaces-agent-sdk-skill.md v1.18.0更新（deprecated型プロパティ削除を反映、Skill型にlastModified明記）、task-workflow.md v1.35.0更新（完了タスク追加 + UT-PERF-001未タスク登録） |
| **v1.25.0** | **2026-02-13** | **TASK-FIX-11-1スキル改善（技術詳細）**: lessons-learned.md v1.7.0（Vitestモック管理3サブセクション追加: clearAllMocks限界・mockRejectedValueOnce・モジュールモックタイムアウト）。architecture-implementation-patterns.md v1.18.0（2パターン追加: リセット戦略・タイムアウトテスト） |
| **v1.25.0** | **2026-02-12** | **完了タスク移動を反映**: UT-FIX-AGENTVIEW-INFINITE-LOOP-001を`docs/30-workflows/completed-tasks/`へ移動し、task-workflow.md v1.32.0で関連未タスク4件の参照先を`completed-tasks/`へ同期 |
| **v1.24.0** | **2026-02-13** | **TASK-FIX-11-1-SDK-TEST-ENABLEMENT 教訓追記**: lessons-learned.md v1.6.0追加（Phase 12 Step 1-A/1-D誤判定、未タスクraw誤検知、Vitestモック再初期化）。interfaces-agent-sdk-executor.md v1.7.1に「実装上の課題と教訓」を追記 |
| **v1.24.0** | **2026-02-13** | **テスト環境教訓体系化**: lessons-learned.md v1.6.0更新（happy-dom/userEvent非互換、テスト実行ディレクトリ依存、jsdom切替副作用）。architecture-implementation-patterns.md v1.18.0更新（fireEvent vs userEvent使い分けパターン追加）。06-known-pitfalls.md P39/P40追加 |
| **v1.23.0** | **2026-02-13** | **TASK-FIX-11-1-SDK-TEST-ENABLEMENT Phase 12是正**: Step 1-A/1-D誤判定を修正。interfaces-agent-sdk-executor.md v1.7.0、testing-component-patterns.md v1.4.0、task-workflow.md v1.31.0 更新。LOGS.md 2ファイル・SKILL.md 2ファイル更新、topic-map再生成を実施 |
| v1.23.0 | 2026-02-13 | UT-9B-H-003セキュリティ教訓追加: lessons-learned.md v1.6.0（苦戦箇所5件）、architecture-implementation-patterns.md v1.21.0（IPC L3ドメイン検証パターン） |
| **v1.23.0** | **2026-02-12** | **未タスク参照整合を是正**: task-workflow.md v1.31.0更新。完了済みタスクの参照先を `completed-tasks/` に正規化し、未実施タスク（UT-STORE-HOOKS-REFACTOR-002/003, UT-FIX-APP-INITAUTH-CHECK-001）の `unassigned-task/` 配置を反映 |
| **v1.22.2** | **2026-02-12** | **UT-9B-H-003 Phase 12再監査**: lessons-learned.md v1.5.2に苦戦箇所を追記（返却仕様文言不整合、完了済み未タスク残置、artifacts整合）。task-workflow.md v1.30.2 / interfaces-agent-sdk-skill.mdで完了済み指示書の参照パスを completed-tasks 側へ更新。skill-feedback-report.md追加 |
| **v1.22.1** | **2026-02-12** | **UT-9B-H-003追補**: 仕様整合性修正。security-electron-ipc.md v1.3.1（エラー返却仕様を実装準拠化）、api-ipc-agent.md v1.7.0（セキュリティ強化仕様追記）、interfaces-agent-sdk-skill.md v1.16.1 / task-workflow.md v1.30.1（UT-9B-H-003を未タスク表から完了反映） |
| **v1.22.0** | **2026-02-12** | **UT-FIX-AGENTVIEW-INFINITE-LOOP-001完了**: arch-state-management.md v1.16.0更新（AgentViewのP31適用拡張、個別セレクタ15個追加記録）、task-workflow.md v1.30.0更新（完了タスク追加）、interfaces-agent-sdk-skill.md v1.17.0更新（完了記録追加） |
| **v1.22.0** | **2026-02-12** | **UT-9B-H-003完了**: SkillCreator IPCセキュリティ強化。security-electron-ipc.md v1.3.0更新、interfaces-agent-sdk-skill.md完了記録更新、task-workflow.md完了記録更新。validatePath/sanitizeErrorMessage/ALLOWED_SCHEMA_NAMES追加。116テスト全PASS |
| **v1.22.0** | **2026-02-12** | **UT-STORE-HOOKS-TEST-REFACTOR-001完了**: arch-state-management.md更新（完了タスクセクション追加）。agentSlice.selectors.test.tsのgetState()→renderHookパターン移行、114テスト全PASS |
| **v1.21.0** | **2026-02-12** | **TASK-9B-I-SDK-FORMAL-INTEGRATION完了**: Claude Agent SDK型安全正式統合。SkillExecutor.ts `as any` 除去、SDK実型（@anthropic-ai/claude-agent-sdk@0.2.30）に基づく型安全な callSDKQuery 実装。apiKey → env.ANTHROPIC_API_KEY、signal → abortController、conversation直接利用。テスト278件全PASS |
| **v1.20.0** | **2026-02-12** | **UT-STORE-HOOKS-COMPONENT-MIGRATION-001テンプレート準拠最適化**: lessons-learned.md ファイルパス修正、patterns.md P31セクション重複削減（Progressive Disclosure準拠） |
| **v1.19.0** | **2026-02-12** | **UT-STORE-HOOKS-COMPONENT-MIGRATION-001完了**: arch-state-management.md更新（P31対策セクションに個別セレクタ実装完了記録、関連タスクステータス更新）、task-workflow.md更新（完了タスク追加）、06-known-pitfalls.md P31解決策更新。30個の個別セレクタHook、3コンポーネント移行、71テスト全PASS |
| **v1.18.0** | **2026-02-12** | **スキル改善**: UT-STORE-HOOKS-REFACTOR-001教訓反映。patterns.mdに「Zustand個別セレクタベース再設計パターン」追加（設計方針・命名規則・移行ガイド・参照安定性チェックリスト）。P31対策の長期解決策をパターン化 |
| **v1.17.0** | **2026-02-12** | **スキル最適化（TASK-FIX-7-1事後）**: Triggerキーワード網羅性確認（不足なし）、変更履歴整理。task-specification-creatorのcoverage-standards.md・unassigned-task-guidelines.md・phase-templates.mdフォーマット最適化と連動 |
| **v1.16.0** | **2026-02-12** | **TASK-FIX-7-1スキル改善(2)**: Triggerキーワードに「DIパターン, Constructor Injection, Factory Pattern, BrowserWindow遅延生成, テストモック大規模修正」を追加。DI関連の検索性をさらに向上 |
| **v1.15.1** | **2026-02-12** | **TASK-9B-H-SKILL-CREATOR-IPC完了**: SkillCreatorService IPC登録。security-skill-ipc.md v1.5.0、interfaces-agent-sdk-skill.md v1.14.0、arch-ipc-persistence.md v1.2.0更新。85テスト全PASS |
| **v1.15.0** | **2026-02-11** | **UT-STORE-HOOKS-REFACTOR-001完了**: 個別セレクタ53個追加（AuthMode 12個, LLM 16個, Agent 25個）、181テスト全PASS、カバレッジLine 88.51%/Branch 89.79%/Function 92.53%達成。arch-state-management.md関連タスク更新、03-state-management.mdにP31参照リンク追加、未タスク2件検出（002: JSDoc追加, 003: 合成Hook移行）|
| **v1.14.0** | **2026-02-11** | **TASK-FIX-7-1スキル改善**: Triggerキーワードに「Setter Injection, 依存性注入, 遅延初期化, setSkillExecutor, SkillExecutor委譲」を追加。検索性向上 |
| **v1.13.0** | **2026-02-11** | **TASK-FIX-7-1システム仕様書更新**: arch-electron-services.md v1.11.0更新（SkillService API追加、SkillService統合セクション追加）、interfaces-agent-sdk-executor.md v1.4.0更新（SkillService統合セクション新設）、architecture-implementation-patterns.md v1.17.0更新（Setter Injectionパターン追加）。LOGS.md 2ファイル・SKILL.md 2ファイル更新 |
| **v1.12.0** | **2026-02-11** | **TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION完了**: SkillService.executeSkill()をSkillExecutorに委譲するTDD実装。Phase 1-12全工程完了、統合テスト7件・ユニットテスト12件全PASS、未タスク0件。スキル更新（LOGS.md 2ファイル、SKILL.md 2ファイル） |
| **v1.11.0** | **2026-02-10** | **TASK-FIX-6-1知見によるスキル改善**: patterns.md成功パターン3件追加（Slice統合、Race Condition対策、Phase 12チェックリスト）、arch-state-management.md v1.10.0（skillSlice統合記録）、06-known-pitfalls.md P25-P28追加、topic-map.md再生成実施 |
| **v1.10.0** | **2026-02-10** | **TASK-FIX-6-1-STATE-CENTRALIZATION完了**: arch-state-management.md更新（skillSlice統合記録、agentSlice拡張）、テスト70件PASS、Branch Coverage 89.09%達成 |
| **8.54.0** | **2026-02-10** | **SKILL.md最適化**: skill-creatorテンプレート準拠。変更履歴を最新20件に圧縮（古い19件をLOGS.mdに移動）。500行以内維持 |
| **8.53.0** | **2026-02-10** | **P31対策スキル改善**: topic-map.md再生成、quick-reference.mdにP31対策早見パターン追加、SKILL.md Triggerキーワード追加、keywords.json再生成 |
| **8.52.0** | **2026-02-10** | **UT-FIX-STORE-HOOKS-INFINITE-LOOP-001完了**: 06-known-pitfalls.md P31追加（Zustand Store Hooks無限ループ）。useRefガード実装 |
| **8.51.0** | **2026-02-10** | **UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH完了**: AgentSDKAPI abort()型定義修正。`abort(): void` → `abort(): Promise<void>`に変更（2箇所: shared/types.ts, preload/types.ts）。P23パターン準拠。実装（safeInvoke）と型定義の整合性確保。24テストPASS、未タスク0件 |
| **8.50.0** | **2026-02-10** | **UT-FIX-5-3-PRELOAD-AGENT-ABORT完了**: Agent Abort IPCセキュリティ修正。preload/index.ts `ipcRenderer.send` → `safeInvoke(IPC_CHANNELS.AGENT_ABORT)` 変更、agent-handler.ts `ipcMain.on` → `ipcMain.handle` 変更、dispose()に`removeHandler`追加。04-electron-security.md IPC原則準拠。21テストPASS、未タスク0件 |
| **8.49.0** | **2026-02-09** | **TASK-AUTH-MODE-SELECTION-001完了**: interfaces-auth.md更新（AuthMode型・AuthModeService・SubscriptionAuthProvider追加）。認証方式選択機能（サブスクリプション/APIキー切り替え）実装。86テスト全PASS |
| **8.48.0** | **2026-02-09** | **patterns.md構造最適化**: skill-creatorテンプレート準拠。目次カテゴリナビゲーション追加、成功パターン5カテゴリ（Phase 12ドキュメント/IPC・Electron/OAuth・認証/テスト・品質/ストア・永続化）、失敗パターン4カテゴリ（Phase 12漏れ/OAuth・認証エラー/テスト・型安全/その他）に再構成。見出しレベル統一（###カテゴリ/####個別パターン）。パターン件数：成功16件/失敗17件 |
| **8.47.0** | **2026-02-09** | **TASK-FIX-12-1苦戦箇所記録**: patterns.md成功/失敗パターン追加（IPCチャンネル名定数化、Phase 12 Step 1更新漏れ、未タスク検出時関連ファイル調査不足、未タスク配置ディレクトリ誤り）。architecture-implementation-patterns.md v1.16.0 IPCチャンネル名定数化パターン追加済み。06-known-pitfalls.md P23/P24追加予定 |
| **8.46.0** | **2026-02-09** | **TASK-FIX-12-1-IPC-HARDCODE-FIX完了**: SkillExecutor.ts L918/L1214 のハードコード文字列 `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` 定数参照に変更。IPC セキュリティ原則準拠。未タスク TASK-FIX-12-2 検出 |
| **8.45.0** | **2026-02-08** | **TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE完了**: security-principles.md更新（SDK認証キー管理セクション追加）、api-ipc-system.md更新（auth-key IPCチャンネル4種追加）、api-endpoints.md更新（SDK認証キーカテゴリ追加）、interfaces-agent-sdk-executor.md更新（AUTHENTICATION_ERROR追加、AuthKeyService統合）。119テスト全PASS |
| **8.44.0** | **2026-02-08** | **TASK-FIX-4-2パターン追加**: 06-known-pitfalls.mdにP19-P20追加（型アサーション検証バイパス・テストログ出力汚染）。interfaces-agent-sdk-executor.md型バリデーションパターン記載 |
| **8.43.0** | **2026-02-08** | **TASK-FIX-4-2-SKILL-STORE-PERSISTENCE完了**: interfaces-skill-execution.md更新（validateStoredSkillIds詳細ロジック追加）、security-principles.md更新（ストレージ整合性検証セクション追加）。87テスト全PASS |
| **8.42.0** | **2026-02-06** | **DEBT-SEC-001仕様構造最適化**: csrf-state-parameter.md新規作成（OAuth CSRF/State詳細を分離）、security-principles.md軽量化（参照リンク追加）、patterns.md拡充（OAuth成功/失敗パターン10件追加） |
| **8.41.1** | **2026-02-06** | **DEBT-SEC-001完了**: security-principles.md更新（CSRF対策セクション）、architecture-auth-security.md更新（PKCE実装詳細）、api-ipc-auth.md更新（認証IPC Channel仕様） |
| **8.41.0** | **2026-02-06** | **TASK-FIX-5-1最適化**: architecture-implementation-patterns.md更新（S1-S4パターン追加、既知パターンテーブル拡充）、06-known-pitfalls.md P11追加（Claude Code Hooks Edit失敗） |
| **8.40.1** | **2026-02-06** | **TASK-FIX-5-1-SKILL-API-UNIFICATION完了**: security-electron-ipc.md更新（safeInvoke/safeOnパターン、API統合アーキテクチャ図追加）、interfaces-skill-execution.md更新（ImportedSkill型統一）。Preload API統一（window.skillAPI→window.electronAPI.skill）。210テスト全PASS |
| **8.40.0** | **2026-02-06** | **TASK-AUTH-SESSION-REFRESH-001完了**: architecture-auth-security.md v1.10.0更新（TokenRefreshScheduler仕様追加）、interfaces-auth.md更新（TokenRefreshCallbacks/TokenRefreshConfig追加）、api-ipc-auth.md更新（session:scheduleRefreshチャンネル追加）。26テスト全PASS |
| **8.39.0** | **2026-02-05** | **ENV-INFRA-001苦戦箇所記録**: patterns.md更新（ネイティブモジュールNODE_MODULE_VERSION不一致解決パターン追加） |
| **8.38.0** | **2026-02-05** | **TASK-FIX-4-1-IPC-CONSOLIDATION完了**: api-ipc-system.md更新（統合チャンネル一覧）、security-electron-ipc.md更新（IPCチャンネルホワイトリスト更新）、architecture-patterns.md更新（Preload Bridge Pattern詳細）。42テスト全PASS |
| **8.37.0** | **2026-02-04** | **AUTH-UI-001完了**: architecture-implementation-patterns.md更新（React Portal/Supabase認証状態即時更新パターン追加）、ui-ux-auth-flow.md v1.3.0更新（Googleログインボタン仕様追加） |
| **8.36.0** | **2026-02-04** | **スキル最適化**: spec-update-workflow.mdファイル名修正（kebab-case統一）、topic-map.md再生成（新規ファイル反映） |
| **8.35.1** | **2026-02-04** | **task-imp-search-ui-001完了**: ui-ux-search-panel.md v1.2.0更新（E2Eテスト17件追加、グローバルショートカット統合完了） |
