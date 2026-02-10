---
name: aiworkflow-requirements
description: |
  AIWorkflowOrchestratorプロジェクトの仕様管理スキル。
  仕様書を検索・参照するためのインターフェース。
  references/配下に全仕様を格納し、キーワード検索で必要な情報に素早くアクセス。

  Anchors:
  • Specification-Driven Development / 適用: 仕様書正本 / 目的: 実装との一貫性
  • Progressive Disclosure / 適用: 検索→詳細参照 / 目的: コンテキスト効率化
  • MECE原則 / 適用: トピック分類 / 目的: 漏れなく重複なく

  Trigger:
  プロジェクト仕様の検索、アーキテクチャ確認、API設計参照、セキュリティ要件確認、テスト戦略参照を行う場合に使用。
  仕様, 要件, アーキテクチャ, API, データベース, セキュリティ, UI/UX, デプロイ, Claude Code, テスト, MSW, カバレッジ, PermissionStore, 権限永続化, rememberChoice, SkillSlice, Zustand, 状態管理, skillSlice, リトライ, retry, backoff, Exponential Backoff, Jitter, RetryConfig, permissionHistory, PermissionHistoryPanel, PermissionHistorySlice, 権限履歴, 履歴トラッキング, safeArgsSnapshot, PermissionHistoryEntry, PermissionHistoryFilter, DatePreset, DateRangeFilter, dateFilterUtils, 期間フィルタ, コンポーネントテスト, Storeモック, フィクスチャ, アクセシビリティ, WCAG, userEvent, fireEvent, RTL, React Testing Library, jest-axe, ARIA, SkillStreamMessage, Discriminated Union, BaseStreamMessage, 型統合, skill-execution, ExecutionState, SkillExecutionRequest, session, refresh, token, scheduler, TokenRefreshScheduler, セッション, トークンリフレッシュ, セッション自動更新, スケジューラー, autoRefreshToken, TokenRefreshCallbacks, TokenRefreshConfig, electron-store, 型バリデーション, validateStoredSkillIds, SkillStore, SkillImportManager, 永続化, persistence, 実行時バリデーション, unknown型, 型アサーション, safeInvoke, safeOn, IPC Bridge API統一, Preload API統一, electronAPI.skill, OperationResult廃止, Agent Abort, ipcRenderer.send, ipcMain.handle, removeHandler, IPCチャネル名不整合, 型定義不一致, 横断的検証, P31, 無限ループ, useRef, Store Hook, useEffect依存配列, useAuthModeStore, 合成Store Hook, 個別セレクタ, 参照安定性, AuthMode
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

| Version    | Date           | Changes                                                                                                                                                                           |
| ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **8.52.0** | **2026-02-10** | **SKILL.md最適化**: skill-creatorテンプレート準拠。変更履歴を最新20件に圧縮（古い19件をLOGS.mdに移動）。500行以内維持 |
| **8.51.0** | **2026-02-10** | **P31対策スキル改善**: topic-map.md再生成、quick-reference.mdにP31対策早見パターン追加、SKILL.md Triggerキーワード追加、keywords.json再生成 |
| **8.50.0** | **2026-02-10** | **UT-FIX-STORE-HOOKS-INFINITE-LOOP-001完了**: 06-known-pitfalls.md P31追加（Zustand Store Hooks無限ループ）。useRefガード実装 |
| **8.49.0** | **2026-02-09** | **TASK-AUTH-MODE-SELECTION-001完了**: interfaces-auth.md更新（AuthMode型・AuthModeService追加）。86テスト全PASS |
| **8.48.0** | **2026-02-09** | **patterns.md構造最適化**: skill-creatorテンプレート準拠。カテゴリナビゲーション追加、成功16件/失敗17件 |
| **8.47.0** | **2026-02-09** | **TASK-FIX-12-1苦戦箇所記録**: patterns.md成功/失敗パターン追加、architecture-implementation-patterns.md更新 |
| **8.46.0** | **2026-02-09** | **TASK-FIX-12-1-IPC-HARDCODE-FIX完了**: SkillExecutor.ts IPCチャンネル名定数化 |
| **8.45.0** | **2026-02-08** | **TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE完了**: security-principles.md・api-ipc-system.md更新。119テスト全PASS |
| **8.44.0** | **2026-02-08** | **TASK-FIX-4-2パターン追加**: 06-known-pitfalls.mdにP19-P20追加（型アサーション検証バイパス・テストログ出力汚染） |
| **8.43.0** | **2026-02-08** | **TASK-FIX-4-2-SKILL-STORE-PERSISTENCE完了**: validateStoredSkillIds()追加。87テスト全PASS |
| **8.42.0** | **2026-02-06** | **DEBT-SEC-001仕様構造最適化**: csrf-state-parameter.md新規作成、patterns.md拡充 |
| **8.41.1** | **2026-02-06** | **DEBT-SEC-001完了**: security-principles.md・architecture-auth-security.md・api-ipc-auth.md更新 |
| **8.41.0** | **2026-02-06** | **TASK-FIX-5-1最適化**: architecture-implementation-patterns.md更新、06-known-pitfalls.md P11追加 |
| **8.40.1** | **2026-02-06** | **TASK-FIX-5-1-SKILL-API-UNIFICATION完了**: Preload API統一（window.skillAPI→window.electronAPI.skill）。210テスト全PASS |
| **8.40.0** | **2026-02-06** | **TASK-AUTH-SESSION-REFRESH-001完了**: TokenRefreshScheduler統合。26テスト全PASS |
| **8.39.0** | **2026-02-05** | **ENV-INFRA-001苦戦箇所記録**: patterns.md更新（ネイティブモジュールNODE_MODULE_VERSION不一致解決パターン） |
| **8.38.0** | **2026-02-05** | **TASK-FIX-4-1-IPC-CONSOLIDATION完了**: IPCチャンネル統合。42テスト全PASS |
| **8.37.0** | **2026-02-04** | **AUTH-UI-001完了**: architecture-implementation-patterns.md更新（React Portal、Supabase認証状態即時更新パターン） |
| **8.36.0** | **2026-02-04** | **スキル最適化**: spec-update-workflow.mdファイル名修正、topic-map.md再生成 |
| **8.35.1** | **2026-02-04** | **task-imp-search-ui-001完了**: ui-ux-search-panel.md更新（E2Eテスト17件・グローバルショートカット統合） |
