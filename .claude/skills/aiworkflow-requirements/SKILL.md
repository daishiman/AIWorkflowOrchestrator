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
  仕様, 要件, アーキテクチャ, API, データベース, セキュリティ, UI/UX, デプロイ, Claude Code, テスト, MSW, カバレッジ, PermissionStore, 権限永続化, rememberChoice, SkillSlice, Zustand, 状態管理, skillSlice, リトライ, retry, backoff, Exponential Backoff, Jitter, RetryConfig, permissionHistory, PermissionHistoryPanel, PermissionHistorySlice, 権限履歴, 履歴トラッキング, safeArgsSnapshot, PermissionHistoryEntry, PermissionHistoryFilter, DatePreset, DateRangeFilter, dateFilterUtils, 期間フィルタ, コンポーネントテスト, Storeモック, フィクスチャ, アクセシビリティ, WCAG, userEvent, fireEvent, RTL, React Testing Library, jest-axe, ARIA, SkillStreamMessage, Discriminated Union, BaseStreamMessage, 型統合, skill-execution, ExecutionState, SkillExecutionRequest, session, refresh, token, scheduler, TokenRefreshScheduler, セッション, トークンリフレッシュ, セッション自動更新, スケジューラー, autoRefreshToken, TokenRefreshCallbacks, TokenRefreshConfig, electron-store, 型バリデーション, validateStoredSkillIds, SkillStore, SkillImportManager, 永続化, persistence, 実行時バリデーション, unknown型, 型アサーション, safeInvoke, safeOn, IPC Bridge API統一, Preload API統一, electronAPI.skill, OperationResult廃止
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

| Version    | Date           | Changes                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **8.49.0** | **2026-02-09** | **TASK-AUTH-MODE-SELECTION-001完了**: interfaces-auth.md更新（AuthMode型・AuthModeService・SubscriptionAuthProvider追加）。認証方式選択機能（サブスクリプション/APIキー切り替え）実装。86テスト全PASS |
| **8.48.0** | **2026-02-09** | **patterns.md構造最適化**: skill-creatorテンプレート準拠。目次カテゴリナビゲーション追加、成功パターン5カテゴリ（Phase 12ドキュメント/IPC・Electron/OAuth・認証/テスト・品質/ストア・永続化）、失敗パターン4カテゴリ（Phase 12漏れ/OAuth・認証エラー/テスト・型安全/その他）に再構成。見出しレベル統一（###カテゴリ/####個別パターン）。パターン件数：成功16件/失敗17件 |
| **8.47.0** | **2026-02-09** | **TASK-FIX-12-1苦戦箇所記録**: patterns.md成功/失敗パターン追加（IPCチャンネル名定数化、Phase 12 Step 1更新漏れ、未タスク検出時関連ファイル調査不足、未タスク配置ディレクトリ誤り）。architecture-implementation-patterns.md v1.16.0 IPCチャンネル名定数化パターン追加済み。06-known-pitfalls.md P23/P24追加予定 |
| **8.46.0** | **2026-02-09** | **TASK-FIX-12-1-IPC-HARDCODE-FIX完了**: SkillExecutor.ts L918/L1214 のハードコード文字列 `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` 定数参照に変更。IPC セキュリティ原則準拠。未タスク TASK-FIX-12-2 検出 |
| **8.45.0** | **2026-02-08** | **TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE完了**: security-principles.md更新（SDK認証キー管理セクション追加）、api-ipc-system.md更新（auth-key IPCチャンネル4種追加）、api-endpoints.md更新（SDK認証キーカテゴリ追加）、interfaces-agent-sdk-executor.md更新（AUTHENTICATION_ERROR追加、AuthKeyService統合）。119テスト全PASS |
| **8.44.0** | **2026-02-08** | **TASK-FIX-4-2-SKILL-STORE-PERSISTENCEパターン追加**: 06-known-pitfalls.mdにP19-P20追加（P19:型アサーションによる実行時検証バイパス、P20:テスト環境でのログ出力汚染）。skill-creator/patterns.mdにvi.doMock動的モジュール再読み込みパターン追加（electron-storeテスト分離）。成功パターン1件+失敗パターン2件記録 |
| **8.43.0** | **2026-02-08** | **TASK-FIX-4-2-SKILL-STORE-PERSISTENCE完了**: スキル永続化バグ修正完了。validateStoredSkillIds()による型バリデーション追加、SkillStore.get()戻り値をunknownに変更。87テスト全PASS、カバレッジLine 91.52%/Branch 91.17%/Function 100%。未タスク0件 |

| **8.42.0** | **2026-02-06** | **DEBT-SEC-001仕様構造最適化**: csrf-state-parameter.md新規作成（StateManager API仕様・型定義・セキュリティ設計根拠・苦戦箇所）、patterns.md拡充（8成功/8失敗/4ガイドライン）、architecture-auth-security.mdクロスリファレンス追加、SKILL.mdセキュリティカテゴリ更新 |
| **8.41.1** | **2026-02-06** | **DEBT-SEC-001完了**: security-principles.md v1.2.0更新（State parameter実装済み、CSRF対策済み）、architecture-auth-security.md v1.4.0更新（完了タスクセクション追加、StateManager実装ファイル・認証フローCSRF対策ステップ追加）、api-ipc-auth.md v1.3.0更新（CSRF_VALIDATION_FAILEDエラーコード・既知errorCode値テーブル追加）、security-operations.md v1.2.0更新（CSRF検証失敗ログ要件追記）、task-workflow.md v1.19.0更新（DEBT-SEC-001完了記録） |
| **8.41.0** | **2026-02-06** | **TASK-FIX-5-1最適化**: architecture-implementation-patterns.md v1.15.0更新（S1-S5リファクタリング: S2/S3/S5をskill-creator/patterns.mdへ委譲し重複排除）、06-known-pitfalls.md P11追加（PostToolUseフックEdit失敗）、クロスリファレンス体系整備 |
| **8.40.1** | **2026-02-06** | **TASK-FIX-5-1-SKILL-API-UNIFICATION完了**: interfaces-agent-sdk-skill.md v1.13.0更新（Preload API統一: window.skillAPI→window.electronAPI.skill、13メソッド定義更新、OperationResult廃止）、security-skill-ipc.md v1.5.0更新（contextBridge参照修正）、architecture-implementation-patterns.md更新（テストモック表修正）、quality-requirements.md更新（skillAPIモック参照修正）、210テスト全PASS |
| **8.40.0** | **2026-02-06** | **TASK-AUTH-SESSION-REFRESH-001完了**: api-ipc-auth.md v1.3.0更新（TokenRefreshScheduler統合・auth:state-changedにexpiresAt追加）、arch-state-management.md v1.9.0更新（authSliceにsessionExpiresAt/isRefreshing追加）、architecture-auth-security.md v1.4.0更新（セッション自動リフレッシュアーキテクチャ追加）、task-workflow.md v1.19.0更新（未タスク3件登録）。26テスト全PASS・カバレッジ96.15% |
| **8.39.0** | **2026-02-05** | **ENV-INFRA-001苦戦箇所記録**: task-workflow.md v1.18.0更新（UT-ENV-001残課題登録）、patterns.md更新（ネイティブモジュールNODE_MODULE_VERSION不一致解決パターン追加）                                                                                                                       |
| **8.38.0** | **2026-02-05** | **TASK-FIX-4-1-IPC-CONSOLIDATION完了**: security-skill-ipc.md v1.4.0更新（IPCチャンネル統合: SKILL_LIST_AVAILABLE→SKILL_LIST、SKILL_LIST_IMPORTED→SKILL_GET_IMPORTED、Single Source of Truth）、苦戦箇所3項目記録（ハードコード発見・重複定義整理・ホワイトリスト更新）、42テスト全PASS |
| **8.38.0** | **2026-02-04** | **ENV-INFRA-001完了**: technology-devops.md更新（完了タスクテーブルにbetter-sqlite3バージョン不一致修正追加）、CONTRIBUTING.md新規作成                                                                                                                                                    |
| **8.37.0** | **2026-02-04** | **AUTH-UI-001完了**: architecture-implementation-patterns.md v1.12.0更新（React Portal オーバーレイUI、Supabase認証状態即時更新パターン追加）                                                                                                                                                                                    |
| **8.36.0** | **2026-02-04** | **スキル最適化**: spec-update-workflow.mdのgenerate-index.mjs→generate-index.js修正（ファイル名誤認パターン解消）、topic-map.md再生成 |
| **8.35.1** | **2026-02-04** | **task-imp-search-ui-001完了**: ui-ux-search-panel.md v1.1.0更新（完了タスク記録追加、E2Eテスト17件・グローバルショートカット統合・IPCプロバイダ実装）、topic-map.md再生成                                                                                                                                                                                                                        |
| **8.35.0** | **2026-02-04** | **AUTH-UI-004知見追加**: architecture-implementation-patterns.md v1.11.0更新（外部APIデータ正規化パターン：プロバイダー別フォールバック）、interfaces-auth.md完了タスクセクション追加（苦戦箇所・教訓記録）、topic-map.md再生成                                                                                                                                                                  |
| **8.34.1** | **2026-02-04** | **TASK-FIX-1-1-TYPE-ALIGNMENT完了**: interfaces-agent-sdk-skill.md v1.12.0更新（完了タスクセクション追加、実装課題4項目記録: パッケージエクスポート更新漏れ/型カバレッジ/Discriminated Union DRY/import一括置換）、skill-execution.ts削除・6型+1定数統合、BaseStreamMessage抽出、49テスト全PASS                                                                                                 |
| **8.34.0** | **2026-02-04** | **AUTH-UI-004完了**: interfaces-auth.md更新（SupabaseIdentity型にpictureプロパティ追加、プロバイダー別アバターURLキー名対応：Google=picture, GitHub/Discord=avatar_url）                                                                                                                                                                                                                         |
| **8.33.0** | **2026-02-03** | **TASK-9C実装詳細追加**: architecture-implementation-patterns.md v1.7.0更新（SDK連携パターン: Graceful Fallback, queryFn DI, スキル名バリデーション）、interfaces-agent-sdk-skill.md更新（実装課題と解決策テーブル追加）、topic-map.md再生成                                                                                                                                                     |
| **8.32.0** | **2026-02-03** | **TASK-9A-A完了**: interfaces-agent-sdk-skill.md v1.9.0更新（SkillFileManagerセクション追加：型定義、API 7メソッド、エラークラス5種、バックアップ形式、セキュリティ対策、137テスト）、topic-map.md再生成                                                                                                                                                                                         |
| **8.31.0** | **2026-02-02** | **TASK-8C-C実装パターン追記**: architecture-implementation-patterns.md v1.5.0（E2Eテストパターン6種追加）、quality-e2e-testing.md v1.4.0（テストケース詳細表追加）、topic-map.md再生成                                                                                                                                                                                                           |
| **8.30.0** | **2026-02-02** | **TASK-8C-C完了**: quality-e2e-testing.md v1.3.0更新、task-workflow.md v1.12.0更新（未タスク4件追加）、topic-map.md再生成                                                                                                                                                                                                                                                                        |
| **8.29.0** | **2026-02-02** | **TASK-8C-B完了**: quality-e2e-testing.md v1.2.0更新（スキル選択フローE2Eテスト8件実装完了記録、ARIA属性ベースセレクタ、キーボード操作・アクセシビリティ検証、完了タスクセクション追加）                                                                                                                                                                                                         |
| **8.28.0** | **2026-02-02** | **両ブランチ統合マージ**: task-imp-permission-date-filter + TASK-8C-A/TASK-8A/TASK-8B完了統合                                                                                                                                                                                                                                                                                                    |
| **8.27.0** | **2026-02-02** | **実装詳細拡充**: arch-state-management.md（dateFilterUtils.ts追加、フィルタリングパイプライン仕様追加）、ui-ux-settings.md（3ドロップダウン化）、72テスト反映                                                                                                                                                                                                                                   |
| **8.26.0** | **2026-02-02** | **TASK-8C-Aシステム仕様書パターン記述**: architecture-implementation-patterns.md更新（IPC通信テストパターン4種追加）、interfaces-agent-sdk-skill.md更新（テストアーキテクチャセクション追加）                                                                                                                                                                                                    |
| **8.25.0** | **2026-02-02** | **未タスク検出・配置（detect-unassigned）**: コードベースTODO/FIXMEスキャン（51件）+ システム仕様ギャップ分析（14件）実施。既存270件と照合し重複なし新規4件作成                                                                                                                                                                                                                                  |
| **8.24.0** | **2026-02-02** | **task-imp-permission-date-filter完了**: interfaces-agent-sdk-history.md更新、DateRangeFilter/DatePreset型追加、72テスト全PASS                                                                                                                                                                                                                                                                   |
| 8.23.0     | 2026-02-02     | TASK-8Aシステム仕様最適化: error-handling.md v1.3.0更新（SkillExecutor実行エラーコード6種の正式仕様追加）                                                                                                                                                                                                                                                                                        |
| 8.22.0     | 2026-02-02     | TASK-8A補完: topic-map.md再生成、未タスク1件正式配置                                                                                                                                                                                                                                                                                                                                             |
| **8.21.0** | **2026-02-02** | **TASK-8A + TASK-8B完了**: スキル管理モジュール単体テスト231テスト + コンポーネントテスト280テスト全PASS                                                                                                                                                                                                                                                                                         |
| **8.20.0** | **2026-02-01** | **TASK-8C-G完了**: quality-e2e-testing.md v1.1.0更新（skill-creatorフィクスチャ境界値テスト拡充記録追加、96テストPASS）、claude-code-skills-overview.md更新（skill-fixture-runnerセクション追加、TASK-8C-Gテスト拡充記録）、topic-map.md再生成                                                                                                                                                   |
| **8.19.0** | **2026-02-01** | **task-imp-permission-history-001完了**: arch-state-management.md v1.5.0更新（permissionHistorySliceセクション追加）、ui-ux-settings.md v1.2.0更新（権限要求履歴パネルUI仕様追加）、interfaces-agent-sdk-history.md v6.35.0更新（完了タスク・品質基準・テスト結果記録）、resource-map.md v1.7.0更新（権限履歴参照先追加）、topic-map.md更新（3ファイル行番号同期）。63テスト・100%カバレッジ達成 |
| **8.18.0** | **2026-01-31** | **TASK-SKILL-RETRY-001完了**: interfaces-agent-sdk-executor.md v1.2.0更新（リトライ型定義・API・定数追加、完了タスクセクション）、error-handling.md v1.2.0更新（SkillExecutorリトライ戦略セクション追加）、interfaces-agent-sdk-history.md更新（残課題テーブル完了反映）。72テスト・全210テストGREEN                                                                                             |
| **8.17.0** | **2026-01-31** | **permissionDescriptionsモジュール仕様追加**: ui-ux-agent-execution.md v1.5.0更新（getDescription API仕様、12種ツールテンプレート一覧、safeStringセキュリティ対策、PermissionDialog統合記述追加）、topic-map.md更新（6セクション追加）                                                                                                                                                           |
| **8.16.0** | **2026-01-31** | **task-imp-permission-readable-ui-001詳細完了記録**: ui-ux-agent-execution.md v1.4.0更新（テスト結果サマリー表・成果物表追加、spec-update-workflow.mdの詳細テンプレート準拠）                                                                                                                                                                                                                    |
| **8.15.0** | **2026-01-30** | **task-imp-permission-readable-ui-001完了**: ui-ux-agent-execution.md v1.3.0更新（permissionDescriptions統合、人間可読説明文・詳細展開ボタン追加）、ui-ux-components.md v2.4.0更新（完了タスク追加）、arch-state-management.md v1.4.0更新（関連タスク追加）、topic-map.md更新。53テスト・100%カバレッジ達成                                                                                      |
| **8.14.0** | **2026-01-30** | **TASK-7C完了**: ui-ux-agent-execution.md v1.2.0更新（PermissionDialog 3ボタンパターン、Store-direct実装）、interfaces-agent-sdk-ui.md v1.2.0更新、interfaces-agent-sdk-history.md v6.33.0更新（完了タスク追加）。40テスト・100%カバレッジ達成                                                                                                                                                   |
| **8.13.0** | **2026-01-30** | **TASK-3-2-F完了**: quality-requirements.md v1.2.0（テスト環境設定パターン: jsdom/happy-dom選択、グローバルAPIモック、vi.stubGlobalパターン、act()警告対処）、architecture-implementation-patterns.md v1.2.0（テスト環境設定パターン追加）                                                                                                                                                       |
| 8.12.0     | 2026-01-28     | TASK-3-2-D完了: ui-ux-feature-components.md更新（コピー履歴機能: CopyHistoryContext/Panel/useCopyHistory Hook）、5件の未タスク仕様書作成（TASK-3-2-D-01〜05）                                                                                                                                                                                                                                    |
| 8.11.0     | 2026-01-28     | **構造最適化**: ui-ux-feature-components.md分割（826行→400行）、ui-ux-feature-skill-stream.md新規作成（SkillStreamDisplay完全仕様）、resource-map.md v1.5.0更新                                                                                                                                                                                                                                  |
| 8.10.0     | 2026-01-28     | TASK-3-2-B完了: ui-ux-feature-components.md v1.4.0更新（i18n対応セクション追加、formatRelativeTime locale引数、翻訳テーブル）、topic-map.md自動更新。74テスト・100%カバレッジ達成                                                                                                                                                                                                                |
| 8.9.0      | 2026-01-28     | TASK-6-1完了: arch-state-management.md v1.2.0更新（skillSliceセクション追加）、interfaces-agent-sdk-skill.md v1.2.0更新（SkillSlice型定義追加）、resource-map.md v1.4.0更新。113テスト・100%カバレッジ達成                                                                                                                                                                                       |
| 8.8.0      | 2026-01-27     | TASK-3-2-A完了: ui-ux-feature-components.md v1.1.0更新（UX改善機能: R1ローディングアニメーション、R2タイムスタンプ表示、R3クリップボードコピー）、resource-map.md v1.3.0更新、topic-map.md自動更新。88テスト・96.9%カバレッジ達成                                                                                                                                                                |
| 8.7.0      | 2026-01-27     | TASK-5-1完了: security-skill-ipc.md v1.2.0更新（SkillAPI Preload実装記録、IPCチャネル6種、セキュリティ実装）、interfaces-agent-sdk-history.md更新（完了タスク追加）、topic-map.md更新。67テスト・95%+カバレッジ達成                                                                                                                                                                              |
| 8.6.0      | 2026-01-26     | **仕様ガイドライン完全準拠**: 全134ファイル（133ファイルコードブロック除去完了、spec-guidelines.md除く）のspec-guidelines.md準拠修正。82参照ファイルのTypeScript/JSON/SQL/ASCIIダイアグラムを表形式・文章に変換                                                                                                                                                                                  |
| 8.5.0      | 2026-01-26     | **仕様ガイドライン準拠修正**: architecture-overview.md/technology-desktop.md（ディレクトリ構造を表形式化）、development-guidelines.md/architecture-implementation-patterns.md（コード例を表形式・文章に変換）、templates全11種（コード例を表形式に変換）                                                                                                                                         |
| 8.4.0      | 2026-01-26     | **実装パターン総合ガイド追加**: architecture-implementation-patterns.md新規作成（フロントエンド/バックエンド/デスクトップ/パフォーマンス/セキュリティ/テスト/アクセシビリティ実装パターン網羅）                                                                                                                                                                                                  |
| 8.3.0      | 2026-01-26     | **開発ガイドライン拡充**: development-guidelines.md v1.1.0（命名規則、デバッグガイド、リリースプロセス、バックアップ・リカバリ、環境構築ガイド追加）                                                                                                                                                                                                                                             |
| 8.2.0      | 2026-01-26     | **UX法則・開発ガイドライン追加**: ui-ux-design-principles.mdにUXデザイン法則（Fitts, Hick, Jakob, Miller, Gestalt, Progressive Disclosure等）追加、development-guidelines.md新規作成（ロギング、キャッシング、マイグレーション、コードレビュー、i18n）                                                                                                                                           |
| 8.1.0      | 2026-01-26     | **アーキテクチャ総論追加**: architecture-overview.md新規作成、technology-frontend.md/technology-desktop.md追加、templates/ディレクトリ新設（テンプレート11種）                                                                                                                                                                                                                                   |
| 8.0.0      | 2026-01-26     | **大規模リファクタリング**: 94→129ファイル拡張（+35分割ファイル）、resource-map.md全ファイル網羅（v1.2.0）、エージェント3件v2.1.0更新、Progressive Disclosure原則に基づくインデックス最適化                                                                                                                                                                                                      |
| 7.2.0      | 2026-01-26     | **エージェント改善**: create-spec/update-spec/validate-spec v2.0.0更新（16テンプレート対応、select-template.js統合、quick-reference.md/resource-map.md参照追加、テンプレート準拠検証ワークフロー追加）                                                                                                                                                                                           |
| 7.1.0      | 2026-01-26     | **追加最適化**: 16種テンプレート（ipc-channel, react-hook, service, error-handling, testing追加）、quick-reference.md新設、indexes/セクション強化                                                                                                                                                                                                                                                |
| 7.0.0      | 2026-01-26     | **スキルリファクタリング**: 11種テンプレート追加、interfaces-agent-sdk.md分割（6ファイル）、resource-map.md新設（読み込み条件付き）、spec-splitting-guidelines.md追加、SKILL.mdクイックスタート追加。94ファイル・11カテゴリ構成に拡張                                                                                                                                                            |
| 6.31.0     | 2026-01-26     | TASK-3-1-E完了: security-skill-execution.mdにPermission Storeセクション追加、ui-ux-settings.mdにPermissionSettings UI追加、interfaces-agent-sdk.md更新。159テスト・96%カバレッジ達成                                                                                                                                                                                                             |
| 6.30.0     | 2026-01-26     | TASK-4-2完了: interfaces-agent-sdk.md v2.2.0更新（PermissionResolver IPC Handlers完了記録、IPCチャンネル2種、Preload API、usePermissionDialog Hook、PermissionDialog）、security-api-electron.md更新（Permission IPCセキュリティ）。93テスト・94.67%カバレッジ                                                                                                                                   |
| 6.29.0     | 2026-01-26     | TASK-3-1-D完了: interfaces-agent-sdk.md v2.3.0更新（skillAPI.onPermission/respondPermission、useSkillPermission Hook、型定義）、security-api-electron.md更新（IPC channels、テストカバレッジ）。124テスト・100%カバレッジ                                                                                                                                                                        |
| 6.28.0     | 2026-01-25     | TASK-3-2完了: security-api-electron.mdにSkill Execution Preload APIセキュリティセクション追加（IPCチャンネル4種、ホワイトリスト、ストリーミングセキュリティ、React Hook統合）。138テスト・100%カバレッジ                                                                                                                                                                                         |
| 6.27.0     | 2026-01-25     | UI-CONV-HISTORY-001完了: interfaces-chat-history.md v1.2.0更新（Renderer Process型定義、Preload API、React Hooks、UIコンポーネント構成、アクセシビリティ対応）。280テスト・98.66%カバレッジ達成                                                                                                                                                                                                  |
| 6.26.0     | 2026-01-24     | UT-LLM-HISTORY-001完了: interfaces-llm.md（Conversation/Message型、IPC契約7種）、architecture-patterns.md（会話履歴永続化パターン〜100行）追加。114テスト・100%カバレッジ達成                                                                                                                                                                                                                    |
| 6.25.0     | 2026-01-24     | TASK-2B SkillImportStore追加: interfaces-agent-sdk.mdに「SkillImportStore（TASK-2B）」セクション新設（スキーマ・API・セキュリティ・テスト仕様詳細約230行）、SkillImportManagerとの差分表追加                                                                                                                                                                                                     |
| 6.24.0     | 2026-01-24     | スキル実行セキュリティ追加（TASK-2C完了）: security-skill-execution.md新規作成（危険コマンド24パターン、保護パス25、許可ツール11）、security-implementation.mdにリンク追加、91ファイル構成                                                                                                                                                                                                       |
| 6.23.0     | 2026-01-24     | SkillScanner将来改善ロードマップ追加: architecture-patterns.md（3件の未タスク仕様書記録：キャッシュ/増分スキャン/ページネーション、想定追加型定義）                                                                                                                                                                                                                                              |
| 6.22.0     | 2026-01-24     | TASK-2A（SkillScanner実装）完了: interfaces-agent-sdk.md（ScannedSkillMetadata/SkillScannerOptions型、完了記録）、architecture-patterns.md（SkillScannerサブセクション追加：API/定数/セキュリティ/データフロー）                                                                                                                                                                                 |
| 6.21.0     | 2026-01-23     | Workspace Chat Edit追加: interfaces-llm.md（FileContext/EditCommand/GeneratedResult型）、architecture-patterns.md（chatEditSliceパターン）、api-endpoints.md（chat-edit IPCチャネル4種）追加、89ファイル構成                                                                                                                                                                                     |
| 6.20.0     | 2026-01-23     | TASK-1-1型定義追加: interfaces-agent-sdk.mdに「Skill Import Agent System 型定義（TASK-1-1）」セクション新設（16型詳細仕様）、連携スキル参照追加、88ファイル構成に拡張                                                                                                                                                                                                                            |
| 6.19.0     | 2026-01-22     | React Context DI追加（UT-006完了）: architecture-chat-history.mdにUI Layerセクション追加（ChatHistoryContext/Provider/useChatHistory/MockProvider）、topic-map.md更新、8アーキテクチャファイル構成                                                                                                                                                                                               |
| 6.18.0     | 2026-01-22     | Drizzle Repository実装追加: architecture-chat-history.md更新（DrizzleChatSessionRepository/DrizzleChatMessageRepository、エラーハンドリング、テスト構成）                                                                                                                                                                                                                                        |
| 6.17.0     | 2026-01-21     | スキル管理IPC整合性修正: interfaces-agent-sdk.mdのIPCチャンネル名を実装に合わせて更新（`skill:list`→`skill:list-imported`等）、戻り値型を`OperationResult`に統一                                                                                                                                                                                                                                 |
| 6.16.0     | 2026-01-21     | 統計更新: ファイル数85、行数約20,000行に更新。CONV-06-04（NER）/CONV-07-02（FTS5）完了反映                                                                                                                                                                                                                                                                                                       |
| 6.15.0     | 2026-01-19     | NER仕様独立化&FTS5詳細化: interfaces-rag-entity-extraction.md新規作成、interfaces-rag-search.md FTS5/BM25詳細追加（テーブル構造、クエリパターン、データフロー）、85ファイル構成に拡張                                                                                                                                                                                                            |
| 6.14.0     | 2026-01-19     | スキル実行機能追加: interfaces-agent-sdk.mdに`skill:execute`IPC/`skillAPI.execute`/`SkillRunResult`型/`OperationResult`型追加、関連ドキュメントリンク追加                                                                                                                                                                                                                                        |
| 6.13.0     | 2026-01-19     | CONV-06-04完了: エンティティ抽出サービス(NER) Phase 12完了。interfaces-rag.md/architecture-rag.md更新（224テスト、97.1%カバレッジ、96.8%品質スコア）                                                                                                                                                                                                                                             |
| 6.12.0     | 2026-01-18     | SECURITY-001完了: interfaces-chat-history.md v2.0.0更新（認可セクション追加、requestUserIdパラメータ、BR-SESSION-005）、error-handling.md更新（ERR_2006 UNAUTHORIZED、UnauthorizedErrorクラス詳細）                                                                                                                                                                                              |
| 6.11.0     | 2026-01-17     | architecture-patterns.md更新: IPC Handler Registration Pattern追加（SKILL-IPC-001完了記録、登録パターン3種の文書化、セキュリティ要件）                                                                                                                                                                                                                                                           |
| 6.10.0     | 2026-01-14     | ui-ux-settings.md新規追加: スライド出力ディレクトリ設定機能のUI/UX仕様・IPC API仕様・セキュリティ要件（slideSettingsAPI）                                                                                                                                                                                                                                                                        |
| 6.9.0      | 2026-01-13     | Knowledge Graph Store実装完了: interfaces-rag-knowledge-graph-store.md v1.0.1更新、実装詳細追加（Entity/Relation CRUD、グラフ探索、バッチ操作）、カバレッジ86.98%達成                                                                                                                                                                                                                            |
| 6.8.0      | 2026-01-13     | AgentSDKPage Postrelease Testing仕様追加: interfaces-agent-sdk.mdに約150行追加（AGENT-005-POST）                                                                                                                                                                                                                                                                                                 |
| 6.7.0      | 2026-01-12     | 未タスク指示書3件作成（renderer-build-fix、history-gui-manual-test、error-i18n-support）、ui-ux-history-panel.md v1.6.0更新                                                                                                                                                                                                                                                                      |
| 6.6.1      | 2026-01-12     | history-service-db-integration実装内容追加: architecture-file-conversion.md、api-internal-conversion.mdにElectron統合セクション追加                                                                                                                                                                                                                                                              |
| 6.6.0      | 2026-01-12     | VectorSearchStrategy仕様追加: interfaces-rag-search.mdにISearchStrategy実装一覧/Result型/フィルタ対応表/CachedVectorSearchStrategy追加、architecture-rag.mdにVectorSearchStrategyセクション追加                                                                                                                                                                                                  |
| 6.5.0      | 2026-01-12     | Agent Execution UI仕様追加（AGENT-004）: interfaces-agent-sdk.md/ui-ux-components.mdに約550行追加、topic-map.md更新                                                                                                                                                                                                                                                                              |
| 6.4.0      | 2026-01-12     | GraphRAGクエリサービス仕様追加: interfaces-rag-graphraph-query.md新規、architecture-rag.md更新、topic-map.md更新                                                                                                                                                                                                                                                                                 |
| 6.3.0      | 2026-01-11     | コミュニティ要約仕様追加: interfaces-rag-community-summarization.md新規、interfaces-rag-community-detection.md更新（v1.1.0）、topic-map.md更新                                                                                                                                                                                                                                                   |
| 6.2.0      | 2026-01-10     | コミュニティ検出（Leiden）仕様追加: interfaces-rag-community-detection.md新規、interfaces-rag.md/architecture-rag.md/topic-map.md更新                                                                                                                                                                                                                                                            |
| 6.1.0      | 2026-01-06     | 500行超過ファイル分割（9ファイル→インデックス化）、70ファイル構成に拡張                                                                                                                                                                                                                                                                                                                          |
| 6.0.0      | 2026-01-06     | skill-creator準拠: agents/をTask仕様書テンプレート化、EVALS.json/LOGS.md/log_usage.js追加                                                                                                                                                                                                                                                                                                        |
| 5.0.0      | 2026-01-04     | SKILL.md軽量化、詳細をindexes/references/へ分離                                                                                                                                                                                                                                                                                                                                                  |
| 4.0.0      | 2026-01-03     | kebab-case化、大ファイル分割、47ファイル構成                                                                                                                                                                                                                                                                                                                                                     |
| 3.0.0      | 2026-01-03     | 仕様正本化、検索中心に再設計                                                                                                                                                                                                                                                                                                                                                                     |
