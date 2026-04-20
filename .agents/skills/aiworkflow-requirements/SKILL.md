---
name: aiworkflow-requirements
description: |
  AIWorkflowOrchestrator の正本仕様を `references/` から検索・参照・更新するスキル。`resource-map` / `quick-reference` / `topic-map` / `keywords` を起点に Progressive Disclosure で必要最小限だけ読む。用途は要件確認、設計・API・IPC 契約確認、UI/状態管理/セキュリティ判断、`task-workflow` / `lessons-learned` / 未タスク同期、EVALS schema consumer 監査。Anchors: Specification-Driven Development, Progressive Disclosure。Trigger キーワード群は `indexes/keywords.json` を参照（rg / search-spec.js で検索）。
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

## 変更履歴

| Date       | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-20 | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 Phase 1-12 close-out sync: IPCハンドラー登録テスト3点契約（REG-SNAP / REG-DEDUP / REG-COUNT）を `api-ipc-system-core.md § IPC Handler Registration Testing Contract`（L461）に確立。esbuildバイナリパス問題（worktree環境でのplatform mismatch）・Wave分割実行パターン（24ファイル一括はSIGKILL）を current facts に追加。`topic-map.md` に IPC Handler Registration Testing Contract セクション（L461）追記・分割ファイル一覧 L461→L510 修正。`keywords.json` に REG-SNAP / REG-DEDUP / REG-COUNT / registration snapshot / esbuild binary path / wave split / SIGKILL を追加。`.agents/` mirror 完全同期。 |
| 2026-04-19 | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 parity guard実装: validate-closeout-parity.js新規追加、complete-phase.js/verify-all-specs.js拡張。Phase 12 close-out parity 必須ゲート化。lessons-learned-current-2026-04.md / task-workflow-completed.md / error-handling-core.md / quality-requirements.md を同波更新。 |
| 2026-04-19 | TASK-EVALS-CONSUMER-AUDIT-001 Phase-12 close-out sync: `references/evals-schema-spec.md`（新設 / EVALS スキーマ正本 / camelCase v2・snake_case v1 方言併存・qualityInsights 手動メンテ・validator=0 件 既知制約）、`references/lessons-learned-evals-consumer-audit-001.md`（新設 / L-EVALS-001〜005）、`references/claude-code-overview.md` §「Skill 作成時のチェックリスト」直下に validator=0 件 注記追加。`indexes/resource-map.md` に「EVALS schema変更前 consumer 全特定」行（5 行）＋新規リソース登録セクションを末尾に追加。`LOGS.md` / `task-workflow-completed.md` に Phase-12 close-out エントリ追加。PROPOSAL-AWR-01〜04 を `.claude/` 単独 wave で実装（`.agents/` ミラーは後続 wave 予約）。SKILL.md description は trigger キーワード群を `indexes/keywords.json` 側に移行し 200〜400 字レンジへ縮小。未タスク 7 件（EVALS_SCHEMA_DIALECT_UNIFICATION / QUALITY_INSIGHTS / SNAKE_CASE_V1 / VALIDATOR_ZERO / MIRROR_CROSS_LINK / SKILL_FIXTURE_RUNNER_EVALS_VALIDATE / SKILL_SCANNER_EVALS_VALIDATE）は `docs/30-workflows/unassigned-task/` に登録済み。|
| 2026-04-19 | TASK-LOGS-ARCHIVE-POLICY-001 docs-spec close-out: `references/logs-archive-policy.md` 新規作成（閾値300行/30KB/月次OR、パス規則 `logs-archive-YYYY-MM.md`、6ステップ手順、エスカレーション表）。`indexes/topic-map.md` に「運用・ログ管理」セクション追加。`indexes/quick-reference.md` / `indexes/resource-map.md` にアーカイブポリシー参照を追加。`LOGS.md` / `CHANGELOG.md` 同波更新。mirror 差分ゼロ確認済み。 |
| 2026-04-19 | TASK-AGENTS-SKILLS-FULL-SYNC-001 impl-spec-to-skill-sync: canonical (`.claude/skills/`) / mirror (`.agents/skills/`) 完全パリティガードを導入。`.claude/scripts/verify-skills-parity.sh`（diff -qr 検証 / exit 0=OK・SKIP / 1=NG）・`.claude/scripts/sync-skills-mirror.sh`（rsync -a --delete + index 再生成）を追加、`.husky/pre-push` 末尾と `.claude/hooks/session-init.sh` に parity gate を組込み（`CLAUDE_SKIP_HEAVY_HOOKS=1` で opt-out）。`references/spec-guidelines.md` に「Canonical/Mirror 原則」セクション新設、`references/lessons-learned-canonical-mirror-parity-guard-2026-04.md` 新規作成（pre-push gate 優先順位 / esbuild version mismatch / rsync 順序 / session-init 0.443s 実測 / worktree 並列 lock 未対応）。current facts: `verify-skills-parity.sh`、`sync-skills-mirror.sh`、`--check-only`、`CLAUDE_SKIP_HEAVY_HOOKS=1`、bootstrap skip、mirror 欠損検出、`int-test-skill` mirror 同期、session-init timing 0.228/0.384/0.443s。 |
| 2026-04-19 | TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 Phase 12 close-out sync記録追加: `references/task-workflow-active.md` 台帳エントリ追加（in_progress / Phase 12 / Issue #2229）。`LOGS.md` 同波更新。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-04-19 | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE Phase-12 close-out sync: `useStreamingProgress.ts` の `PHASE_TO_STAGE` マップ 6 mode-specific phase（`interview`/`consensus`/`loading-skill`/`analyzing`/`engine-selection`/`improving`）追加・`api.onProgress()` コールバック接続・エラーハンドリング・`resetProgress()` cleanup を current facts に追加。`system-spec-update-summary.md` の「実施した同期 / 未実施同期」テンプレート分離提案を `ベストプラクティス` に追記。`task-workflow.md` / `task-workflow-completed.md` / `LOGS.md` / `lessons-learned-current-2026-04.md` を同波更新。未タスク U-01（本番配線統合テスト）・U-02（planId 付与）を `unassigned-task/` に登録済み。 |
| 2026-04-18 | TASK-SW-STREAM-002 close-out current facts sync: workflow を「既存実装確認 + NON_VISUAL close-out」へ是正し、`task-workflow.md` / `task-workflow-completed-recent-2026-04g.md` / `lessons-learned-stream-001-progress-callback.md` / `LOGS.md` / indexes を同波更新。`TASK-SW-STREAM-001` の後続 separate task 表記を close し、残課題を `TASK-SW-STREAM-FUP-01` 系へ整理。 |
| 2026-04-18 | UT-IPC-HANDLER-CI-001 close-out sync: Step 1-D テンプレートに「未更新 / 再生成のみ / 内容変更あり」三区分を追加。NON_VISUAL task の証跡参照を task 固有パスで出力するガイドを `ベストプラクティス` に追記。`LOGS.md` 同波更新。 |
| 2026-04-18 | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 Phase-12 close-out sync: `lessons-learned-current-2026-04.md` の L-CRON-SEM-001/002 セクション内重複 CLM 行（18行）を除去。`ui-ux-feature-components-skill-analysis.md` の shared contracts に `SKILL_CATEGORY_LABELS` / `getSkillCategoryLabel` を追記。`LOGS.md` 同波更新。generate-index.js / validate-structure.js / mirror sync / diff -qr 全 PASS。           |
| 2026-04-17 | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION Phase-12 close-out sync: `SkillDocGenerator` の LLM プロバイダ連携実装（`LLMClient` / `AnthropicProvider` / stub→本番置換）・IPC error contract 強化（構造化エラーパス / `AbortError` 分岐）を current facts に追加。`lessons-learned-skill-docs-runtime-ipc-contract.md` 新規作成。`LOGS.md` 同波更新。 |
| 2026-04-17 | TASK-SW-STRUCT-002 Phase-12 close-out sync: `SkillCreatorService.createSkill()` の `create` モードで `structurePlan` → `plan` 反映・`generateSkillMd` プライベートメソッド実装・3段階フォールバック（`ensureSkillMdExists` / stub / catch）・`anchors ?? []` null 安全パターンを current facts に追加。`lessons-learned-current-2026-04.md` に L-STRUCT-002-001〜003 追加。                                       |
| 2026-04-16 | TASK-SW-CANCEL-001〜004 cancel chain impl-spec-to-skill-sync: `references/lessons-learned-skill-creator-cancel-chain.md` 新規作成（L-CANCEL-001〜004: 4層縦断パターン・abort-like error 抑制・non-visual N/A・2ファイルテスト構成）。`references/api-ipc-system-skill-creator.md` に `SKILL_CREATOR_CANCEL` cancel chain current facts を追加。`LOGS.md` 同波更新。                                               |
| 2026-04-16 | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 close-out sync: `SkillCreateWizard.llm-generation.test.tsx` 削除済み確認・残存参照 0 件・companion test 43 件 PASS を current facts に記録。`lessons-learned-test-cleanup-describe-skip-2026-04.md` 新規作成（削除済み早期検出 / 存在確認パターン / 選択肢A/B 判断基準）。`task-workflow-completed.md` / `LOGS.md` を同波更新。                                         |
| 2026-04-16 | TASK-SW-STREAM-001 Phase-12 close-out sync: `SkillCreatorService.createSkill()` オプショナルコールバック引数 `onProgress?` 追加 / 5段階進捗通知（planning/generating-skill/generating-agents/validating/done）/ `SkillCreatorProgressData` 型定義を current facts に追加 / `sendSkillCreatorProgress()` IPC統合完了（skillCreatorHandlers.ts）                                                                    |
| 2026-04-16 | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY current facts sync: `InlineModelSelector` description 表示の completed 化、Phase 11 screenshot canonical 名を `inline-model-selector-description-hidden.png` / `inline-model-selector-tooltip-visible.png` に統一、`task-workflow-backlog.md` completed 化、`task-workflow-completed.md` / `task-workflow-completed-recent-2026-04b.md` / `LOGS.md` / `SKILL.md` を同波更新 |
| 2026-04-16 | TASK-SC-LLM-PURPOSE-WIRE-001 phase 12 close-out sync: `StructurePlanJson.purpose` を LLM 推論結果へ切替え、`options.description` fallback / `ILLMClient` DI / `@repo/shared/services/llm/types` alias を current facts に記録。LOGS.md 2ファイル同波更新。                                                                                                                                                        |
| 2026-04-16 | UT-FIX-CI-IPC-CONTINUE-ON-ERROR-001 close-out sync: `references/lessons-learned-ipc-4layer-verification-2026-04.md` に L-IPC4L-CI-001（CI `.cjs` 検証スクリプトのビルド成果物依存・continue-on-error 原則禁止）を追加。`task-workflow-completed.md` に完了記録追加済み                                                                                                                                            |
| 2026-04-15 | TASK-SC-IMP-CREATE-WORKFLOW-001 phase 12 close-out sync: `references/task-workflow.md` current facts 追加、`task-workflow-completed-recent-2026-04g.md` 完了記録確認、63件 Green / 6 成果物 / `outputs/artifacts.json` parity / screenshot N/A を current facts として固定                                                                                                                                        |
| 2026-04-15 | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 close-out sync: `resolveLabelEntry()` freeText 搭載 / `resolveSemanticLabel()` 互換 wrapper / notion 特別ケース削除を current facts に追加。台帳 completed / blocked 同期                                                                                                                                                                                       |
| 2026-04-15 | TASK-CI-FUTURE-002 phase 12 close-out: `test-web シャード化` / `matrix.shard 2 並列` / `test-desktop 17→15` / `GitHub Free Tier 上限 20` / `Issue #2168` / `phase13_blocked` を current facts に追加。台帳・インデックス・LOGS を同波更新                                                                                                                                                                         |
| 2026-04-15 | TASK-SW-FIX-FEEDBACK-008 current facts sync: `refreshSkillsInBackground` / `workflowSnapshot` delayed outcome processing / `phase13_blocked` / `manual-test-result` / `phase11-capture-metadata` を追加。`.agents/` mirror、workflow root (`index.md`, `artifacts.json`, `outputs/artifacts.json`) も同波更新                                                                                                     |
| 2026-04-14 | TASK-SW-FIX-FEEDBACK-001 / TASK-SW-FIX-DATAFLOW-001 impl-spec-to-skill-sync: `resource-map` に2タスクのクイックルックアップ行追加（v1.31.0）、`.agents/` ミラー完全同期、`LOGS.md` sync 記録追加。current facts（`fetchSkills()` LLM 成功パス、`skillPath` null guard、`SkillCreationContext` / `buildSkillContext` / `buildSkillGenerationPrompt` context bridge、Phase 11 screenshot evidence）反映済み         |

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

| ファイル                           | 用途                 | 対象カテゴリ     |
| ---------------------------------- | -------------------- | ---------------- |
| `spec-template.md`                 | 汎用仕様テンプレート | 概要・品質       |
| `interfaces-template.md`           | インターフェース仕様 | インターフェース |
| `architecture-template.md`         | アーキテクチャ仕様   | アーキテクチャ   |
| `api-template.md`                  | API設計              | API設計          |
| `ipc-channel-template.md`          | Electron IPC         | IPC通信          |
| `react-hook-template.md`           | React Hook           | カスタムフック   |
| `assets/react-context-template.md` | React Context        | 状態管理         |
| `service-template.md`              | サービス層           | ビジネスロジック |
| `database-template.md`             | データベース仕様     | データベース     |
| `ui-ux-template.md`                | UI/UX仕様            | UI/UX            |
| `security-template.md`             | セキュリティ仕様     | セキュリティ     |
| `testing-template.md`              | テスト仕様           | テスト戦略       |

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
- Step 1-D（topic-map / keywords 再生成）は `未更新 / 再生成のみ / 内容変更あり` の3区分で記録する（UT-IPC-HANDLER-CI-001 feedback）
- NON_VISUAL task の証跡参照は branch ルートではなく task 固有パス（例: `docs/30-workflows/TASK-ID/outputs/phase-11/`）で記録する
- `system-spec-update-summary.md` の Step 1 は「実施した同期（Step 1-A）」と「実施しなかった同期・理由（Step 1-B）」を必ず両方記載する（L-SC08-003 feedback: local workflow 修正のみの場合に全て同期済みと誤解される問題を防ぐ）
- IPCハンドラー登録テスト（REG-SNAP / REG-DEDUP / REG-COUNT）の契約・検索は `references/api-ipc-system-core.md § IPC Handler Registration Testing Contract`（L461）を参照する
- vitest でのスナップショット一括実行（24ファイル以上）はSIGKILLになる。Wave分割（例: 8ファイル × 3 wave）が正本手順（TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 確立）
- NON_VISUAL + 単一クラス追加タスクでは既存コードの直接読み込みを優先し、正本参照は「コードから読み取れない情報」（エラー分類方針・デフォルト値等）に絞る（L-EMB-005-003）

### 避けるべきこと

- references/以外に仕様情報を分散
- インデックス更新を忘れる
- 詳細ルールをSKILL.mdに追加（→ spec-guidelines.md へ）
- `outputs/phase-12/` に canonical 成果物と補助ファイルを混在させる（命名規約を一本化して検証コストを下げる）

**詳細ルール**: See [references/spec-guidelines.md](references/spec-guidelines.md)
