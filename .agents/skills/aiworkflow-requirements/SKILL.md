---
name: aiworkflow-requirements
description: |
  AIWorkflowOrchestrator の正本仕様を `references/` から検索・参照・更新するスキル。`resource-map` / `quick-reference` / `topic-map` / `keywords` を起点に必要最小限だけ読む。用途は要件確認、設計・API・IPC 契約確認、UI/状態管理/セキュリティ判断、`task-workflow` / `lessons-learned` / 未タスク同期。主要対象は safeInvoke timeout、settings bypass、skill lifecycle、global nav、Skill Center / Workspace / Agent / Skill Creator 導線再編。Anchors: Specification-Driven Development, Progressive Disclosure。Trigger: 仕様確認、仕様更新、task-workflow同期、lessons-learned同期、API/IPC契約確認、セキュリティ要件確認、safeInvoke、timeout、settings bypass、skill lifecycle、Skill Center、Workspace、Agent、Skill Creator、line budget reform、spec splitting、family split、ToolRiskLevel、SafetyGatePort、AllowedToolEntryV2、processPermissionFallback、executeAbortFlow、executeSkipFlow、DefaultSafetyGate、evaluateSafety、skill:evaluate-safety、ViewType、renderView、ビュー分岐、画面ルーティング、ApprovalGate、Consumer Auth Guard、isConsumerToken、sanitizeForApiKeys、approval:respond、approval:request、SessionDisclosureBanner、AdvancedConsolePanel、AdapterStatusBadge、RetryButton、LLMAdapterStatus、adapter status badge、リトライ導線、ApiKeysSection、health check、refreshAdapterStatuses、PROVIDER_CONFIGS、provider-registry、gpt-5.4、claude-sonnet-4-6、gemini-3-flash-preview、grok-4-1-fast-non-reasoning、system_instruction、inferProviderId、ProviderModelEntry、OpenAICompatibleAdapter、OpenRouter、isAvailable、LLMModel、SdkOutputMessageBase、SkillExecutorStreamMessage、SkillExecutorStreamMessageType、型統合、出力型統合、SKILL_CREATOR_GET_ADAPTER_STATUS、SKILL_CREATOR_ADAPTER_STATUS_CHANGED、result-panel、SkillLifecyclePanel、SkillCreationResultPanel、orchestration wrapper、ui-result-panel-pattern、state owner、persist surface、verify retry surface、executeAsync、snapshot ?? null、variadic IPC、onWorkflowStateSnapshot、errorMessage propagation、multi-arg event、structured error path、catch path、SKILL_CREATOR_RUNTIME_CHANNELS、shared-ipc-channel SSoT、packages/shared/src/ipc/channels、cross-layer parity、governance-bundle.test、SkillInfoFormData、SkillCategory（wizard）、SkillWizardScheduleConfig、ConversationAnswers、SmartDefaultResult、SkeletonQualityFeedback、wizard-shared-contracts、subpath export、@repo/shared/types/skillCreator、UT-SKILL-WIZARD、skill-wizard-redesign-lane、UT-SKILL-WIZARD-W1-par-02d、onOpenSkillWizard、SkillLifecyclePanel ウィザード遷移ボタン化、W3-seq-04、UT-SKILL-WIZARD-W3、trackEvent、skill_wizard_started、skill_wizard_step1_completed、skill_wizard_generation_completed、skill_skeleton_quality_feedback、skill_wizard_next_action、usage tracking、計装、NON_VISUAL、SKILL_CATEGORY_LABELS、getSkillCategoryLabel、UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING、selectedOptions（QuestionAnswer複数選択）、satisfiesパターン（カテゴリラベル型安全性）、UT-SKILL-WIZARD-CATEGORY-UI-ICON-001、SkillInfoStep category icon、screenshot-coverage.md、native title tooltip、overlay capture、ValidateCronOptions、cron-parser、semantic（cronバリデーション）、validateCronExpression、意味論的バリデーション、到達可能性チェック、cron-parser@5.5.0、TASK-UI-SCHEDULE-CRON-SEMANTIC-001、SkillCreateWizard、W2-seq-03a、UT-SKILL-WIZARD-W2-seq-03a、inferSmartDefaults（wizard/utils分離）、generationLockRef（再入防止）、CompleteStep（skillPath / onRetry 接続）、handleRetry（formData保持）、hasExternalIntegration、externalToolName、STEPS配列（スキル情報入力・詳細設定・生成・完了）。
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

1. **まず [resource-map.md](indexes/resource-map.md) を確認** - タスク種別と current canonical set を特定
2. 該当ファイルを `Read` ツールで参照
3. 今回差分の完全ファイル一覧、旧 ordinal filename から current semantic filename への対応、エレガンス監査が必要な場合は [workflow-aiworkflow-requirements-line-budget-reform-artifact-inventory.md](references/workflow-aiworkflow-requirements-line-budget-reform-artifact-inventory.md), [legacy-ordinal-family-register.md](references/legacy-ordinal-family-register.md), [spec-elegance-consistency-audit.md](references/spec-elegance-consistency-audit.md) を参照
4. 詳細行番号や完全ファイル一覧が必要な場合は [topic-map.md](indexes/topic-map.md) と `node scripts/list-specs.js --topics` を参照

### 仕様を作成・更新

1. `assets/` 配下の該当テンプレートを使用
2. `references/spec-guidelines.md` と `references/spec-splitting-guidelines.md` を見て、classification-first で更新する
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

| エージェント                                | 用途         | 対応Task           | 主な機能                         |
| ------------------------------------------- | ------------ | ------------------ | -------------------------------- |
| [create-spec.md](agents/create-spec.md)     | 新規仕様作成 | create-spec        | テンプレート対応、重複チェック   |
| [update-spec.md](agents/update-spec.md)     | 既存仕様更新 | update-spec        | テンプレート準拠、分割ガイド     |
| [validate-spec.md](agents/validate-spec.md) | 仕様検証     | validate-structure | resource-map登録確認、サイズ検証 |

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

| ファイル                                         | 内容                                                                                                                                                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `spec-guidelines.md`                             | 命名規則・記述ガイドライン                                                                                                                                                                                               |
| `spec-splitting-guidelines.md`                   | 大規模ファイル分割ガイドライン                                                                                                                                                                                           |
| `ui-result-panel-pattern.md`                     | ResultPanel コンポーネント設計パターン（ErrorBanner/DetailPanel/react.memo/local state 判断基準）— TASK-RT-03 確立                                                                                                       |
| `lessons-learned-skill-wizard-redesign.md`       | Skill Wizard Redesign（W2-seq-03a / W3-seq-04）実装知見・SkillCreateWizard オーケストレーション・inferSmartDefaults・再入防止パターン・trackEvent 計装（skill_wizard_started 等 5 イベント）・NON_VISUAL 証跡パターン    |
| `lessons-learned-skill-wizard-llm-connection.md` | TASK-SC-07 SkillCreateWizard LLM Connection 実装知見（L-SC07-001〜008: generationMode管理・skillSpec必須化・対称クリア・request-idガード・snapshot再読込・smartDefaults分離・deprecated管理・generationLockRef排他制御） |

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
- 500行超過時は classification-first で parent / child / history / archive / discovery を同一 wave で分割

### 避けるべきこと

- references/以外に仕様情報を分散
- インデックス更新を忘れる
- 詳細ルールをSKILL.mdに追加（→ spec-guidelines.md へ）
- `outputs/phase-12/` に canonical 成果物と補助ファイルを混在させる（命名規約を一本化して検証コストを下げる）

**詳細ルール**: See [references/spec-guidelines.md](references/spec-guidelines.md)
