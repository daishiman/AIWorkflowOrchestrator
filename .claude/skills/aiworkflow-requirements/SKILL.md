---
name: aiworkflow-requirements
description: |
  AIWorkflowOrchestratorのシステム仕様管理スキル。`references/` 配下の正本仕様を検索・参照・更新する。
  仕様主導開発（Specification-Driven Development）を前提に、resource-map/topic-map/keywordsを使って必要最小限の文書を段階的に読む。
  次の作業で使用: 要件確認、アーキテクチャ判断、API/IPC契約確認、セキュリティ/テスト方針確認、仕様差分反映、未タスク登録、教訓反映。
  典型キーワード: 仕様/要件/設計/API/IPC/型定義/権限/履歴/リトライ/状態管理/Zustand/認証/セッション/UI/テスト/カバレッジ/コンポーネント/アクセシビリティ/デプロイ。
  目的は、実装と仕様の整合性維持、更新漏れ防止、再発防止知見の資産化。

  Anchors:
  • Specification-Driven Development / 適用: 正本仕様同期 / 目的: 実装-仕様整合の維持
  • Progressive Disclosure / 適用: resource-map起点読込 / 目的: 必要最小限参照で漏れ防止

  Trigger:
  仕様確認, 仕様更新, task-workflow同期, UI仕様反映, IPC契約確認, セキュリティ要件確認, 未タスク登録, lessons-learned同期
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
| **9.00.0** | **2026-03-02** | **TASK-10A-A Phase 12 最終同期（Step 2完了化 + 苦戦箇所資産化）**: `arch-ui-components.md` に SkillManagementPanel アーキテクチャ節を追加し、`task-workflow.md` と `lessons-learned.md` に苦戦箇所・再利用手順を同一ターンで同期。`documentation-changelog.md` の Step 判定を実体へ是正し、`spec-update-summary.md` / `unassigned-task-detection.md` に `currentViolations=0` と baseline 分離記録を反映 |
| **8.99.0** | **2026-03-02** | **TASK-10A-A 再監査追補（機能別UI仕様の欠落是正）**: `ui-ux-feature-components.md` に SkillManagementPanel の専用セクション（実装構成・状態管理/IPC依存・画面証跡・改善反映）を追加し、完了タスク台帳へ `TASK-10A-A` を同期。重複していた `仕様書作成済みタスク` 見出しの矛盾を解消し、`task-workflow.md` / `ui-ux-components.md` / Phase 11-12 成果物との整合を再確認 |
| **8.98.0** | **2026-03-02** | **TASK-10A-A SkillManagementPanel Phase 12 仕様同期**: `task-workflow.md` に TASK-10A-A 完了記録を追加。`ui-ux-components.md` / `ui-ux-feature-components.md` に SkillManagementPanel 実装内容を反映。Phase 11 MINOR 4件を未タスク検出レポートに記録。テスト38件全PASS、カバレッジ100% |
| **8.97.0** | **2026-03-02** | **UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 を反映**: `docs/30-workflows/unassigned-task/task-imp-phase12-two-workflow-evidence-bundle-001.md` を新規作成し、`task-workflow.md` 残課題へ登録。`lessons-learned.md` に関連未タスク導線を追記し、2workflow同時監査（spec_created/completed）での証跡集約・Task 1/3/4/5 実体突合・UI画面証跡・`currentViolations=0` 判定固定を再利用可能化 |
| **8.96.0** | **2026-03-02** | **Phase 12準拠再確認（TASK-UI-05A/TASK-UI-05）を反映**: `task-workflow.md` に2workflow同時監査の検証証跡（`verify-all-specs`/`validate-phase-output`/必須成果物突合）と苦戦箇所（証跡分散、baseline/current誤読）を追記。`lessons-learned.md` に再利用4ステップを追加し、未タスク監査の合否基準を `currentViolations=0` 固定で明文化 |
| **8.95.0** | **2026-03-02** | **TASK-UI-05A 再監査（実装実体同期 + 未タスク正本化）**: `task-workflow.md` / `ui-ux-components.md` / `ui-ux-feature-components.md` の TASK-UI-05A 状態を「実装ファイル実在・統合未完了」へ是正。`docs/30-workflows/unassigned-task/` に未タスク正本3件を作成し、Phase 11再取得スクリーンショット（2026-03-02）と Phase 12 `spec-update-summary.md` / `artifacts.json` 同期を反映 |
| **8.94.0** | **2026-03-01** | **TASK-UI-05A 包括的監査・getFileTree仕様追加**: `api-ipc-agent.md` に `skill:getFileTree` チャネル仕様（FileNode型定義含む）を追加。`ui-ux-feature-components.md` SkillEditorView セクションに getFileTree 未実装注記を追記。LOGS.md 2ファイル・SKILL.md 2ファイルを同期更新 |
| **8.93.0** | **2026-03-01** | **TASK-UI-05A spec_created + 参照整合を反映**: `task-workflow.md` / `ui-ux-components.md` / `ui-ux-feature-components.md` に `TASK-UI-05A-SKILL-EDITOR-VIEW`（仕様書作成完了・実装未着手）を追加。Phase 11 画面検証証跡（Dashboard/Editorスクリーンショット、manual-test-result、discovered-issues）を同期し、`UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001` と `UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001` の参照パスを実体へ是正 |
| **8.97.0** | **2026-03-02** | **TASK-UI-05B 仕様書別SubAgent分割の最適化**: UIプロファイルを 1仕様書=1SubAgent の6責務へ再編し、`ui-ux-components.md` / `ui-ux-feature-components.md` / `arch-ui-components.md` / `arch-state-management.md` / `task-workflow.md` / `lessons-learned.md` に実装内容と苦戦箇所を同期。`task-workflow.md` の検証証跡日付を 2026-03-02 へ統一し、テンプレート再利用性を向上 |
| **8.96.0** | **2026-03-02** | **TASK-UI-05B Phase 12 再確認追補**: `task-workflow.md` の TASK-UI-05B 検証証跡を最新値（`verify-all-specs` warning=0、初回 warning=7 を是正 / `audit` current=0 baseline=75）へ同期。`ui-ux-feature-components.md` と `lessons-learned.md` に再発条件付きの苦戦箇所（Phase 12参照不足warning、画面証跡再撮影、current/baseline誤読）と簡潔解決手順を追加し、再利用可能な運用知見を固定 |
| **8.95.0** | **2026-03-02** | **TASK-UI-05B 実装完了再同期**: `spec_created` 残存を `completed` へ統一し、`ui-ux-components.md` / `ui-ux-feature-components.md` / `task-workflow.md` / `arch-*` / `quality-requirements.md` / `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` を実装実体へ再同期。Phase 11 画面証跡（TC-04〜TC-07）を追加し、`phase-12-documentation.md` の必須章不足を補正して `verify-all-specs` / `validate-phase-output` を PASS へ復帰 |
| **8.94.0** | **2026-03-01** | **TASK-UI-05B アーキテクチャ層仕様書追補**: 多角的検証（垂直思考・システム思考・改善思考）で検出した4仕様書の未反映を是正。`arch-ui-components.md` に4ビュー/33コンポーネント・状態管理方針・ファイル配置を追加。`arch-state-management.md` に4ビューの状態管理設計（useState + agentSlice個別セレクタ）を追加。`architecture-overview.md` の UI/UXアーキテクチャ・ディレクトリ構造にTASK-UI-05Bを追記。`quality-requirements.md` にパフォーマンス基準4項目と完了タスク（spec_created）を追加。P26（仕様書更新遅延）・P31（Phase 12更新漏れ）パターンの再発防止 |
| **8.93.0** | **2026-03-01** | **TASK-UI-05B spec_created 同期を反映**: `task-workflow.md` / `ui-ux-components.md` / `ui-ux-feature-components.md` に `TASK-UI-05B-SKILL-ADVANCED-VIEWS` の仕様書作成完了（spec_created）を追加。`verify-unassigned-links` で検出した未タスクリンク2件（`UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001`, `UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001`）を実在パスへ是正し、画面検証スクリーンショット導線を登録 |
| **8.92.0** | **2026-03-01** | **TASK-UI-05 completed-tasks 移管を反映**: `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` へワークフロー本体を移動し、関連未タスク7件（`task-ui-05-*.md`）を同ディレクトリ配下 `unassigned-task/` へ移管。`task-workflow.md` / `ui-ux-components.md` / `ui-ux-feature-components.md` の参照先を新パスへ同期 |
| **8.91.0** | **2026-03-01** | **UT-UI-05-007 未タスク登録を反映**: `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-phase12-ui-spec-sync-guard.md` を新規作成し、`task-workflow.md` の TASK-UI-05節/残課題テーブルへ登録。`ui-ux-components.md` と `ui-ux-feature-components.md` の SkillCenterView 関連未タスク表へ同IDを同期し、UI仕様同期ガードの運用課題を追跡可能化 |
| **8.90.0** | **2026-03-01** | **TASK-UI-05 UI仕様書追補を反映**: `ui-ux-components.md` の SkillCenterView 関連未タスクを `UT-UI-05-001`〜`006` へ拡張し、`ui-ux-feature-components.md` に実装時の苦戦箇所（型境界、DetailPanel責務集中、Phase 12同期）と4ステップ簡潔解決手順を追加。`task-workflow.md` / `lessons-learned.md` の教訓記録と整合するよう仕様導線を統一 |
| **8.89.0** | **2026-03-01** | **TASK-UI-05 教訓同期を追補**: `task-workflow.md` の TASK-UI-05 セクションへ再発条件付きの苦戦箇所（CategoryId/SkillCategory型境界、DetailPanel責務集中、Phase 12三点同期）と5ステップ簡潔手順を追加。`lessons-learned.md` に同内容を転記し、未タスク運用（UT-UI-05-001〜006）と検証証跡の再利用導線を固定 |
| **8.88.0** | **2026-03-01** | **TASK-UI-05 仕様同期完了**: `ui-ux-components.md` / `ui-ux-feature-components.md` / `arch-ui-components.md` / `arch-state-management.md` / `task-workflow.md` に SkillCenterView 実装内容を反映。未タスク `UT-UI-05-001`〜`006` を `docs/30-workflows/unassigned-task/` に登録し、残課題テーブル・参照リンクを同期 |
| **8.84.2** | **2026-02-28** | **TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 完了移管反映**: ワークフローディレクトリを `docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/` へ移動し、派生未タスク `UT-IMP-AUTH-CALLBACK-LIFECYCLE-CONTRACT-GUARD-001` を `docs/30-workflows/completed-tasks/unassigned-task/` へ移管。`task-workflow.md` の残課題行を完了表記へ更新し、関連参照パスを completed-tasks 正本へ同期 |
| **8.84.1** | **2026-02-28** | **UT-IMP-AUTH-CALLBACK-LIFECYCLE-CONTRACT-GUARD-001 未タスク登録**: `docs/30-workflows/completed-tasks/unassigned-task/task-imp-auth-callback-lifecycle-contract-guard-001.md` を新規作成し、`TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001` の苦戦箇所（wait/stop責務混在・stop冪等性・監査スクリプト所在誤認）を Section 3.5 へ転記。`task-workflow.md` 残課題テーブルと `security-implementation.md` 参照リンクを同期更新 |
| **8.84.0** | **2026-02-28** | **TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 テンプレート最適化追補**: `security-implementation.md` に再発条件付きの苦戦箇所と4ステップ手順を追加し、`task-workflow.md` の同タスク節へ「苦戦箇所と解決策（再利用用）」+「簡潔解決5ステップ」を追記。`outputs/phase-12/spec-update-summary.md` を `phase12-system-spec-retrospective-template` 準拠構造へ再編して SubAgent 分担・検証証跡を1ファイル固定化 |
| **8.83.0** | **2026-02-28** | **TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 仕様同期**: `security-implementation.md` のローカルHTTPサーバー停止契約を実装準拠（timeout時は自動停止しない/停止は呼び出し側責務）へ更新。`task-workflow.md` に完了記録と検証証跡を追加し、`lessons-learned.md` に wait/stop 責務分離の再発防止手順を追記 |
| **8.82.0** | **2026-02-27** | **TASK-9H 教訓同期を追補**: `lessons-learned.md` に TASK-9H 専用セクション（苦戦箇所3件 + 同種課題向け4ステップ）を追加。`phase-12-documentation.md` の実行状態同期を反映し、成果物実体と仕様台帳の不一致を解消 |
| **8.81.0** | **2026-02-27** | **TASK-9H Phase 12再監査の仕様同期を完了**: `api-ipc-agent.md` / `security-electron-ipc.md` / `interfaces-agent-sdk-skill.md` / `architecture-overview.md` / `task-workflow.md` を最終同期。`skillDebugHandlers` 起動配線、成果物4件（spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report）と検証証跡（13/13, error=0, ALL_LINKS_EXIST, current=0）を固定 |
| **8.87.0** | **2026-02-28** | **TASK-9I completed-tasks 移管反映**: `docs/30-workflows/TASK-9I-skill-docs/` を `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/` へ移動し、関連未タスク `UT-9I-001/002` を同ディレクトリ配下 `unassigned-task/` へ移管。`task-workflow.md` / `interfaces-agent-sdk-skill.md` / `lessons-learned.md` の参照先を新パスへ同期 |
| **8.86.0** | **2026-02-28** | **UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001 反映**: `task-workflow.md` の TASK-9I 再確認セクションに苦戦箇所（未タスクリンクのワイルドカード false fail、`current/baseline` 判定軸、証跡値ドリフト）を追記し、残課題テーブルへ新規未タスクを登録。`lessons-learned.md` に再利用用5ステップ手順を追加 |
| **8.85.0** | **2026-02-28** | **TASK-9I Phase 12記録最適化**: `task-workflow.md` の再確認テーブルを最新証跡へ同期（`verify-unassigned-links` 96/96, `audit --diff-from HEAD` 追記）。`lessons-learned.md` に「同種課題の即時実行コマンドセット」を追加し、target監査と差分監査を含む再利用手順を標準化 |
| **8.84.0** | **2026-02-28** | **TASK-9I Phase 12再確認の最終同期**: `task-workflow.md` に Phase 12再確認証跡（`verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `quick_validate` / `audit --target-file`）を追記し、`UT-9I-001` / `UT-9I-002` の配置・フォーマット検証結果（`current=0`, baseline分離）を固定化。`lessons-learned.md` に苦戦箇所3件と4ステップ簡潔解決手順を追加し、同種課題の再利用手順を標準化 |
| **8.83.0** | **2026-02-28** | **TASK-9I 再監査反映**: `api-ipc-agent.md` / `arch-electron-services.md` / `security-electron-ipc.md` / `architecture-overview.md` / `interfaces-agent-sdk-skill.md` / `task-workflow.md` の必須6仕様書を実装準拠へ同期。`UT-9I-001` / `UT-9I-002` の未タスク指示書を `docs/30-workflows/unassigned-task/` に作成し、残課題テーブルと関連未タスクリンクを同期 |
| **8.84.3** | **2026-02-28** | **TASK-9J 完了移管反映**: `docs/30-workflows/TASK-9J-skill-analytics/` を `docs/30-workflows/completed-tasks/TASK-9J-skill-analytics/` へ移動。`UT-IMP-TASK9J-PHASE12-IPC-SYNC-AUTO-VERIFY-001` も `completed-tasks/unassigned-task/` へ移管し、関連仕様書の参照を更新 |
| **8.84.2** | **2026-02-28** | **TASK-9J 未タスク同期 + 台帳整合**: `task-imp-task9j-phase12-ipc-sync-auto-verify-001.md` を新規作成し、`task-workflow.md` 残課題テーブルと `interfaces-agent-sdk-skill.md` 関連未タスクへ同期。残課題テーブルの重複行（同一IDの完了/未完了混在）を是正 |
| **8.84.1** | **2026-02-28** | **TASK-9J 仕様同期テンプレート最適化**: `task-workflow.md` の TASK-9J セクションをテンプレート準拠へ再整形（メタ情報/仕様書別SubAgent分担/再発条件付き苦戦箇所/検証証跡）。`lessons-learned.md` に5仕様書同期マトリクスを追加し、`interfaces-agent-sdk-skill.md` / `api-ipc-agent.md` / `security-electron-ipc.md` へ実装時の苦戦箇所を追補 |
| **8.84.0** | **2026-02-28** | **TASK-9J Phase 12再確認追補**: `task-workflow.md` と `lessons-learned.md` に苦戦箇所（IPC登録漏れ・責務重複・Preload API命名ドリフト）を再発条件付きで追記。`verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` による再確認証跡を同期 |
| **8.83.0** | **2026-02-28** | **TASK-9J完了**: スキル使用統計・分析機能のバックエンド実装。新規5 IPCチャンネル（skill:analytics:record/statistics/summary/trend/export）、SkillAnalytics/AnalyticsStoreサービス、共有型定義8インターフェース追加。テスト97件全PASS、カバレッジ全基準クリア |
| **8.82.0** | **2026-02-27** | **TASK-9G Step 1-E追補**: Phase 12で検出した UT-9G-001〜005 を `docs/30-workflows/unassigned-task/` に正式登録し、`task-workflow.md` 残課題テーブルと `interfaces-agent-sdk-skill.md` 関連未タスクへ同期。`outputs/phase-12/unassigned-task-detection.md` の3ステップ完了化、`spec-update-summary` / `documentation-changelog` への反映を実施 |
| **8.81.0** | **2026-02-27** | **TASK-9G Phase 12再監査反映**: `api-ipc-agent.md` / `arch-electron-services.md` / `security-electron-ipc.md` / `architecture-overview.md` / `interfaces-agent-sdk-skill.md` / `task-workflow.md` の必須6仕様書を実装準拠へ同期。`docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-7〜13` の不足成果物補完、`artifacts.json` 実装パス補正、ゴーストディレクトリ `{outputs` 削除を実施 |
| **8.80.0** | **2026-02-27** | **UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001 登録**: `task-workflow.md` v1.61.7 に未タスク（Phase 12 仕様更新の版数・手順整合ガード）を追加。`spec-update-summary` と正本仕様の版数/手順ドリフト再発防止を運用課題として固定し、関連行の参照先整合（SubAgent同期ガード行の `unassigned-task/` 正本化）を実施 |
| **8.79.0** | **2026-02-27** | **UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 テンプレート最適化**: `outputs/phase-12/spec-update-summary.md` をテンプレート準拠で追加。`task-workflow.md` v1.61.6 に仕様書別SubAgent分担を追記し、苦戦テーブルを再発条件付き形式へ最適化。`lessons-learned.md` v1.26.3 を再発条件カラム付きへ整形し、同種課題の再利用性を強化 |
| **8.78.0** | **2026-02-27** | **UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 Phase 12再監査反映**: `task-workflow.md` に苦戦箇所3件（チェックリスト同期漏れ、親タスク旧参照残存、検証スクリプト所在誤認）と5ステップ簡潔解決手順を追記。`lessons-learned.md` v1.26.2 を追加し、同種課題の再利用導線を強化 |
| **8.77.0** | **2026-02-27** | **UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001完了**: `quick_validate.js` name/description 検証にP42準拠3段バリデーション（typeof → 空文字列 → trim()）を適用。テスト21件追加、85テスト全PASS。`task-workflow.md` 完了台帳、`claude-code-skills-process.md` 検証規則、`spec-update-workflow.md` の既知課題分類を同期更新 |
| **8.77.0** | **2026-02-27** | **TASK-9F完了反映**: `api-ipc-agent.md` にスキル共有IPCチャネルセクション追加（3チャンネル、型定義10型、バリデーションルール）。`security-electron-ipc.md` にskillShareAPIセキュリティパターン追加。`interfaces-agent-sdk-skill.md` にスキル共有型定義セクション追加。`task-workflow.md` に完了タスク記録追加 |
| **8.76.0** | **2026-02-26** | **TASK-9B 再監査の知見固定化**: `task-workflow.md` に TASK-9B 完了記録（実装要点/苦戦箇所/検証証跡）を追加。`lessons-learned.md` に TASK-9B 教訓（13chドリフト、P42 create未完了、current/baseline混同）と5ステップ簡潔解決手順を追加。`interfaces-agent-sdk-skill.md` / `security-skill-ipc.md` に仕様書別SubAgent分担と再監査時の苦戦箇所を追記 |
| **8.75.0** | **2026-02-26** | **TASK-9B再監査反映（SkillCreator IPC拡張同期）**: `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` / `architecture-overview.md` / `arch-electron-services.md` / `security-skill-ipc.md` を実装準拠へ更新。SkillCreator契約を 13チャンネル（12 invoke + 1 progress）へ統一し、`task-workflow.md` の TASK-9B-H 参照を `completed-tasks/skill-creator-ipc/` に正規化 |
| **8.74.9** | **2026-02-26** | **TASK-9A Phase 12完了移管**: `docs/30-workflows/TASK-9A-skill-editor/` を `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/` へ移動。`TASK-9A-C-004` を完了化し、`task-9a-c-phase12-spec-sync-guard.md` を `completed-tasks/unassigned-task/` へ移管。関連仕様書（task-workflow / ui-ux-feature-components / interfaces-agent-sdk-skill / ui-ux-components）の参照を同期更新 |
| **8.74.8** | **2026-02-26** | **TASK-9A-C-004 未タスク登録同期**: `docs/30-workflows/unassigned-task/task-9a-c-phase12-spec-sync-guard.md` を新規作成し、`task-workflow.md` / `ui-ux-feature-components.md` / `interfaces-agent-sdk-skill.md` の関連未タスクテーブルへ同時反映。Phase 12再確認で顕在化した4課題（Part 1/2要件漏れ、監査判定誤読、メタ情報重複、3仕様書同期漏れ）を再発防止タスクとして記録 |
| **8.74.7** | **2026-02-26** | **TASK-9A Phase 12再確認追補**: `task-workflow.md` に TASK-9A の苦戦箇所3件と4ステップ再利用手順を追記。`lessons-learned.md` に同タスク専用セクション（Part 1/2要件不足、`audit-unassigned-tasks --target-file` 誤読、未タスクメタ情報重複）を追加し、再発防止手順を標準化 |
| **8.74.6** | **2026-02-26** | **TASK-9A 完了同期**: `ui-ux-feature-components.md` / `ui-ux-components.md` / `interfaces-agent-sdk-skill.md` / `architecture-implementation-patterns.md` / `testing-component-patterns.md` を `completed` 状態へ更新し、`task-workflow.md` に TASK-9A 完了記録を追加。`TASK-9A-C-002` を完了化して `completed-tasks/unassigned-task/` へ移管 |
| **8.74.5** | **2026-02-26** | **UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 完了同期**: `task-workflow.md` の完了移管リンク2件を `completed-tasks` 正本へ補正し、`verify-unassigned-links.js` の参照整合を回復。`lessons-learned.md` に検証経路統一運用（`quick_validate.js` 優先 + baseline/current 分離判定）の教訓を追記 |
| **8.74.4** | **2026-02-25** | **UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001 未タスク登録**: `docs/30-workflows/unassigned-task/task-imp-phase12-spec-sync-subagent-guard-001.md` を作成し、今回実装での苦戦箇所（4仕様書同期漏れ、current/baseline誤読、検証コマンド誤用）を Section 3.5 に記録。`task-workflow.md` 残課題と `interfaces-agent-sdk-skill.md` 検出未タスクを同期更新 |
| **8.74.3** | **2026-02-25** | **UT-FIX-SKILL-EXECUTE-INTERFACE-001 仕様同期を最適化**: `task-workflow.md` / `interfaces-agent-sdk-skill.md` / `security-skill-ipc.md` / `lessons-learned.md` に仕様書別SubAgent分担を追記し、実装内容・苦戦箇所・再利用手順を仕様書ごとに同期。`security-skill-ipc.md` に同タスク専用セクション（実装反映/苦戦箇所/4ステップ）を追加 |
| **8.74.2** | **2026-02-25** | **UT-FIX-SKILL-EXECUTE-INTERFACE-001 再確認追補**: `task-workflow.md` に Phase 12再実行証跡（`verify-all-specs` 13/13、`validate-phase-output` 28項目、`verify-unassigned-links` 91/91、`audit --diff-from HEAD` current=0/baseline=75）を追加。`lessons-learned.md` に監査解釈ミス（`--target-file`）と `validate-phase-output` 引数誤用の教訓を追記 |
| **8.74.1** | **2026-02-25** | **UT-FIX-SKILL-EXECUTE-INTERFACE-001 反映 + Phase 12参照整合是正**: `interfaces-agent-sdk-skill.md` / `security-skill-ipc.md` / `task-workflow.md` / `lessons-learned.md` に `skill:execute` 契約整合（`skillName` 正式 + `skillId` 後方互換）を反映。`task-workflow.md` の未タスク参照ドリフトを補正し、`UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001` を完了表記へ同期 |
| **8.72.6** | **2026-02-25** | **Phase 12完了移管反映（UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001）**: 実行ワークフローを `docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001/` へ移動し、関連未タスク `UT-IMP-PHASE12-VALIDATION-COMMAND-STANDARDIZATION-001` も `completed-tasks/unassigned-task/` へ移管。`task-workflow.md` の残課題行を完了化 |
| **8.72.5** | **2026-02-25** | **UT-IMP-PHASE12-VALIDATION-COMMAND-STANDARDIZATION-001 登録反映**: `task-workflow.md` 残課題へ Phase 12 検証コマンド標準化タスクを追加。`quick_validate.js` 統一・`verify-all-specs --workflow` 必須化・`*-final.log` 運用を未タスク仕様として管理開始 |
| **8.72.4** | **2026-02-25** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 最終整合**: 旧 `quick_validate` 表記を `quick_validate.js` に統一。`task-workflow.md` / `lessons-learned.md` に再検証の必須条件（`--workflow` 指定）と最新証跡同期ルールを反映 |
| **8.72.3** | **2026-02-25** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 Phase 12再確認反映**: `task-workflow.md` に再確認履歴（v1.60.1）を追加。`lessons-learned.md` に証跡同期/quick_validate経路混同の苦戦箇所と4ステップ解決手順を追記。`architecture-implementation-patterns.md` に Phase 12 準拠確認チェーンを追加 |
| **8.72.2** | **2026-02-25** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 再監査反映**: `lessons-learned.md` に scope分離運用の苦戦箇所と5ステップ解決手順を追加。`architecture-implementation-patterns.md` に未タスク監査スコープ分離パターンを追加。完了済み未タスク指示書を `completed-tasks/unassigned-task/` へ移管し、`task-workflow.md` 参照を同期更新 |
| **8.72.1** | **2026-02-25** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 完了反映**: `task-workflow.md` の残課題行を完了化し、参照先を `docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001/index.md` へ更新。未タスク監査の current/baseline 分離運用（`--target-file` / `--diff-from`）を完了タスクとして同期 |
| **8.71.0** | **2026-02-25** | **Phase 12完了済み成果物の移管反映**: `ut-skill-ipc-preload-extension-001` ワークフローを `completed-tasks/` へ移動し、対応未タスク `task-imp-ipc-preload-extension-spec-alignment-001.md` も `completed-tasks/unassigned-task/` へ移管。`task-workflow.md` の成果物・未タスク参照を新パスへ更新 |
| **8.70.0** | **2026-02-25** | **UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001未タスク登録**: `task-workflow.md` 残課題テーブルへ task-9D〜9J 仕様契約ドリフト自動検証CIガード（旧参照パス/artifacts/Date方針）を追加。親タスク `UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001` の苦戦箇所3件を未タスク指示書 Section 3.5 に反映 |
| **8.69.0** | **2026-02-25** | **UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001完了反映 + 再発防止スキル登録**: `task-workflow.md` に task-9D〜9J 仕様差分是正タスクの完了記録を追加し、残課題を完了化。`lessons-learned.md` に苦戦箇所3件と5ステップ解決手順を追加。`claude-code-skills-overview.md` に `ipc-preload-spec-sync-guardian` を登録 |
| **8.74.0** | **2026-02-25** | **UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 未タスク登録反映**: `task-workflow.md` 残課題に Phase 12 仕様更新リンク同期ガード強化タスクを追加。苦戦箇所（baseline/current混同、完了移管後リンク漏れ、通常/fallback片側修正）を未タスク指示書へ標準記録する運用を明文化 |
| **8.73.0** | **2026-02-25** | **UT-IPC-AUTH-HANDLE-DUPLICATE-001 テンプレート最適化**: `api-ipc-auth.md` にクイック解決ガイド（目的/前提/実行ステップ/検証/トラブルシューティング）を追加。`lessons-learned.md` に20分版即時実行テンプレートを追加。`architecture-implementation-patterns.md` S22に再利用テンプレート（目的/場所/検証/落とし穴対処）を追加 |
| **8.72.0** | **2026-02-25** | **UT-IPC-AUTH-HANDLE-DUPLICATE-001 パターン追補**: `architecture-implementation-patterns.md` に S22（AUTH IPC登録一元化）を追加。`lessons-learned.md` に再監査時の苦戦箇所（baseline/current混同、完了移管後リンク同期）と4ステップ解決手順を追記 |
| **8.71.0** | **2026-02-25** | **UT-IPC-AUTH-HANDLE-DUPLICATE-001 再監査補完**: `ipc-contract-checklist.md` に AUTH登録一元化（通常/fallback同時監査）を追加。`api-ipc-auth.md` の実装箇所記載を行番号依存から関数依存へ更新。`lessons-learned.md` の参照先を completed-tasks へ正規化 |
| **8.70.0** | **2026-02-25** | **UT-IPC-AUTH-HANDLE-DUPLICATE-001完了反映**: `api-ipc-auth.md` にAUTH登録一元化戦略と完了記録を追加。`security-electron-ipc.md` にAUTH登録一元化パターンを追加。`task-workflow.md` の残課題行を完了化し completed 参照へ更新。`lessons-learned.md` に苦戦箇所と3ステップ再発防止手順を追記 |
| **8.69.0** | **2026-02-25** | **UT-IPC-CHANNEL-NAMING-AUDIT-001 完了反映と未タスク分離**: `task-workflow.md` に `spec_created` 完了記録を追加し、旧 unassigned 参照を completed 参照へ更新。`UT-IPC-AUTH-HANDLE-DUPLICATE-001` を未タスク登録。`architecture-implementation-patterns.md` に監査運用パターン、`lessons-learned.md` に再発防止手順を追加 |
| **8.71.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 派生未タスク登録**: `docs/30-workflows/unassigned-task/` に未タスク2件（`UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001`, `UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001`）を追加。`task-workflow.md` 残課題テーブルと `interfaces-agent-sdk-skill.md` 関連未タスクテーブルを同期更新 |
| **8.70.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12要件再適合**: `task-workflow.md` に本タスクの苦戦箇所と4ステップ簡潔解決手順を追記。`implementation-guide.md` を task-spec の Part 1/Part 2 必須要件（中学生向け例え話 + 型/API/エッジケース明記）へ再構成し、Phase 12完了チェックリストを実完了状態に同期 |
| **8.69.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12再監査整合**: `task-workflow.md` の残課題を完了化し、完了タスクセクションへ成果物6件を追記。`interfaces-agent-sdk-skill.md` の関連未タスク表を完了化し、`skill:remove` 戻り値記述を `Promise<RemoveResult>` に同期。`spec-update-summary.md` 追加と未タスクリンク整合（`verify-unassigned-links`）を反映 |
| **8.68.2** | **2026-02-24** | **未タスク監査スコープ分離タスク登録**: `UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001` を `task-workflow.md` 残課題テーブルへ追加。未タスク監査の対象差分判定（current）と全体ベースライン監視（baseline）を分離する運用改善タスクとして管理開始 |
| **8.68.1** | **2026-02-24** | **SKILL frontmatter制約準拠化**: `SKILL.md` の YAML `description` を1024文字以内に要約し、`quick_validate.js` で `Skill is valid!` を確認。仕様管理用途（要件/設計/API・IPC契約/テスト/未タスク/教訓反映）のトリガーは維持 |
| **8.68.0** | **2026-02-24** | **UT-IPC-DATA-FLOW-TYPE-GAPS-001 Phase 12再監査是正**: `task-workflow.md` の成果物テーブルに `spec-update-summary.md` を追加。`lessons-learned.md` v1.22.0 に苦戦箇所3件（成果物不足 / artifacts二重管理非同期 / 未タスク指示書フォーマット不一致）と4ステップ簡潔解決手順を追記。Phase 12運用の再発防止ルールを明文化 |
| **8.67.0** | **2026-02-24** | **UT-IPC-DATA-FLOW-TYPE-GAPS-001完了反映**: IPCデータフロー型ギャップ6件を7仕様書上で解消（仕様書修正のみ）。Gap 1: Date→ISO 8601（14フィールド/4ファイル）、Gap 2: DebugSession.status idle追加、Gap 3-6: onExport/ExportResult/safeOn/object形式統一。累計173検証項目ALL PASS。LOGS.md 2ファイル・SKILL.md 2ファイル更新 |
| **8.66.0** | **2026-02-24** | **UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 実装パターン追加**: `architecture-implementation-patterns.md` にP42準拠バリデーション一括移行パターン（S18）追加。移行チェックリスト・引数形式別適用パターン・後方互換性注記・describe.eachマトリクステスト戦略を含む |
| **v8.65.0** | **2026-02-24** | **UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 パターン文書化**: architecture-implementation-patterns.md に IPCチャネル名競合予防パターン新設（命名規則3パターン・チャネル対応表・判断基準・実装チェックリスト・苦戦箇所3件）。lessons-learned.md に技術的教訓3件追加（チャネル命名体系化・grepベース仕様書TDD・Phase4見積もり精度） |
| **8.65.0** | **2026-02-24** | **Phase 12再監査反映（TASK-UI-00-ATOMS / UT-SKILL-IMPORT-CHANNEL-CONFLICT-001）**: `task-workflow.md` に完了タスク2件を追記。`lessons-learned.md` v1.20.0 に苦戦箇所3件（完了台帳未反映、旧参照パス残存、`{outputs` ゴーストディレクトリ）と簡潔解決手順4ステップを追加。`task-ui-00-atoms` の旧参照を `tasks/completed-task/` 正本へ統一 |
| **8.65.0** | **2026-02-24** | **UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 再監査整合**: `lessons-learned.md` に苦戦箇所3件と簡潔解決手順（4ステップ）を追加。`task-workflow.md` / `security-skill-ipc.md` の `UT-FIX-SKILL-VALIDATION-P42-001` を補完タスク実施済みとして完了同期し、重複管理を解消 |
| **8.64.2** | **2026-02-24** | **UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 Phase 12追補**: `technology-devops.md` に本タスクの完了記録を追加し、`check-module-sync` 説明を4設定整合へ補正。`lessons-learned.md` v1.20.0 を追加（再監査の苦戦箇所3件 + 5ステップ簡潔解決手順） |
| **8.64.1** | **2026-02-24** | **UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 再監査是正**: `architecture-monorepo.md` を実装実態（vite-tsconfig-paths運用）へ更新、`quality-requirements.md` の未タスク記載を完了化、`task-workflow.md` の完了行参照を `completed-tasks/task-vitest-tsconfig-paths-sync-automation.md` へ整合 |
| **8.64.0** | **2026-02-24** | **UT-SKILL-IMPORT-CHANNEL-CONFLICT-001完了反映**: skill:import IPCチャネル名競合の予防的解消（仕様書修正のみ）。task-022/task-030のチャネル名修正（skill:import→skill:importFromSource）。LOGS.md完了記録追加 |
| **8.64.0** | **2026-02-24** | **UT-FIX-SKILL-VALIDATION-CONSISTENCY-001完了反映**: skillHandlers.ts 6ハンドラP42準拠バリデーション統一。security-skill-ipc.md IPCチャネル検証テーブル更新、security-api-electron.md完了タスク追加、interfaces-agent-sdk-skill.md/task-workflow.md完了化。LOGS.md 2ファイル・SKILL.md 2ファイル更新 |
| **8.64.0.1** | **2026-02-24** | **UT-FIX-TS-VITEST-TSCONFIG-PATHS-001完了反映**: vite-tsconfig-pathsプラグイン導入で27個の手動alias削除、6つの双方向チェック+checkMapContainment汎用関数。60テスト全PASS。architecture-monorepo.md完了ステータス更新。LOGS.md完了記録追加 |
| **8.63.0** | **2026-02-23** | **TASK-UI-00-ATOMS 実装知見・苦戦箇所の仕様書体系化**: `ui-ux-atoms-patterns.md` v1.0.0 新規作成（7 Atoms実装パターン・苦戦箇所6件・テスト戦略）。`architecture-implementation-patterns.md` にS12-S17 Atoms設計パターン追加。`testing-component-patterns.md` v1.7.0（Atomsテストパターンセクション13追加）。`ui-ux-design-system.md` v1.4.0（StatusIndicatorカラー定義追加）。`ui-ux-design-principles.md`（HIG準拠パターンテーブル追加）。`06-known-pitfalls.md` にP46/P47追加。`skill-creator/patterns.md` に成功3件+失敗2件追加。topic-map.md再生成 |
| **8.62.0** | **2026-02-23** | **TASK-UI-00-ATOMS Phase 12完了反映**: `ui-ux-components.md` v2.11.0（TASK-UI-00-ATOMS完了タスク追加 + Atoms実装状況テーブル追加）、`ui-ux-design-system.md` v1.3.0（デザイントークン使用パターン追加）。LOGS.md完了記録追加 |
| **8.61.0** | **2026-02-23** | **TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 教訓追加**: lessons-learned.md に苦戦箇所4件（正規表現パース、キー変換設計、typesVersionsスキップ、process.exitCodeテスタビリティ）を追記 |
| **8.60.0** | **2026-02-22** | **TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 教訓追補**: `architecture-monorepo.md` に実装時の苦戦箇所と対処（MINOR未タスク化、Phase 12証跡同期、未タスク監査ベースライン分離）を追加。`lessons-learned.md` v1.18.3 に苦戦箇所3件と5ステップ簡潔解決手順を追記 |
| **8.59.0** | **2026-02-22** | **TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001再監査是正**: `technology-devops.md` に主要CIジョブ構成テーブルを追加し、Step 1-B の実装状況反映を仕様実体化。`SKILL.md` / `LOGS.md` の競合痕跡文字列を除去し、`generate-index.js` 再実行で `topic-map.md` / `keywords.json` を再同期 |
| **8.58.0** | **2026-02-22** | **TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001完了反映**: @repo/shared 3層整合CIガードスクリプト追加。check-module-syncジョブCI統合。43テスト全PASS。quality-requirements.md/architecture-monorepo.md/technology-devops.md更新。LOGS.md完了記録追加 |
| **8.57.0** | **2026-02-22** | **未タスク配置監査と教訓追記**: `interfaces-agent-sdk-skill.md` に UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 の苦戦箇所と4ステップ簡潔解決手順を追加。`lessons-learned.md` v1.18.2 追記。`task-workflow.md` 等の未タスク参照を `unassigned-task/` に統一し、誤配置6件移動+重複1件整理を反映 |
| **8.56.0** | **2026-02-22** | **UT-FIX-SKILL-IMPORT-ID-MISMATCH-001完了反映**: interfaces-agent-sdk-skill.md v1.28.0（関連未タスクテーブル完了化 + 完了タスクセクション追加）、task-workflow.md v1.50.0（残課題完了化 + 完了タスクセクション追加）。Renderer層のみ変更（skill.id→skill.name） |
| **8.56.0** | **2026-02-22** | **仕様準拠再監査反映**: `testing-component-patterns.md` v1.6.0（テーマ横断テストヘルパーパターン追加: `renderWithTheme`/`renderWithAllThemes`）。`task-workflow.md` 残課題の未実在参照を実在化し `verify-unassigned-links` 79/79 を確認。`topic-map.md` / `keywords.json` 再生成 |
| **8.54.0** | **2026-02-22** | **TASK-UI-00-TOKENS Phase 1-12完了反映**: `ui-ux-design-system.md` v1.2.0（Apple HIG System Colors light/darkテーマ定義、TASK-UI-00-TOKENS完了記録追加）。LOGS.md完了記録追加 |
| **8.53.0** | **2026-02-21** | **UT-FIX-SKILL-REMOVE-INTERFACE-001 Phase 1-12実行知見反映**: architecture-implementation-patterns.md にP44解決パターン追加、lessons-learned.md に実装苦戦箇所3件記録（Phase依存順序・worktree制約・カバレッジ閾値）、interfaces-agent-sdk-skill.md にskill:remove契約更新 |
| **v1.40.2** | **2026-02-21** | **未実施タスク誤配置の再是正 + 教訓追記**: `task-workflow.md` の未実施2件（`UT-FIX-TS-VITEST-TSCONFIG-PATHS-001`, `TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001`）参照を `docs/30-workflows/unassigned-task/` へ戻し、`lessons-learned.md` に「ワークツリー環境でのStep 1-A先送り誤判断」教訓を追加 |
| **v1.40.1** | **2026-02-21** | **task-workflow 未タスク参照リンク整合を是正**: `verify-unassigned-links` で検出した未実在リンク4件を実在パスに修正。`UT-FIX-TS-VITEST-TSCONFIG-PATHS-001` / `TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001` / `TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001` を `completed-tasks/unassigned-task/` へ、`UT-FIX-SKILL-IMPORT-RETURN-TYPE-001` を `skill-import-agent-system/tasks/` へ補正 |
| **v1.44.0** | **2026-02-21** | **P44/P45契約ドリフト防止強化**: security-electron-ipc.md v1.7.0（契約ドリフト防止セクション追加: ipc-contract-checklist.md参照・3段バリデーション検証テーブル）。api-ipc-agent.md skill:import完了タスク記録。interfaces-agent-sdk-skill.md リクエスト契約詳細テーブル追加 |
| **v1.43.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-INTERFACE-001完了反映**: `skill:import` IPC引数契約を `skillName: string` に統一。api-ipc-agent.md, interfaces-agent-sdk-skill.md, task-workflow.md, lessons-learned.md 更新済み。P44パターン完全解決。LOGS.md完了記録追加 |
| **v1.42.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-INTERFACE-001 再監査追補**: `lessons-learned.md` に苦戦箇所3件（Phase 12ステータス未同期、旧参照パス残存、Vitest実行ディレクトリ差異）を追加。`interfaces-agent-sdk-skill.md` に実装課題を追記し、`security-electron-ipc.md` に Skill API の `skillName` + `trim()` 検証パターンを反映 |
| **v1.41.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-INTERFACE-001 Phase 12反映**: `task-workflow.md` を完了反映（残課題→完了 + completed-task参照へ移行）。`arch-electron-services.md` / `security-skill-ipc.md` / `interfaces-agent-sdk-skill.md` / `api-ipc-agent.md` に `skill:import` 契約（`skillName: string` + P42検証）を反映 |
| **v1.42.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 スキル改善**: `architecture-implementation-patterns.md` v1.26.0 に S13 IPC戻り値型2ステップ変換パターン追加（苦戦箇所5件記録）。`ipc-type-resolution-guide.md` v1.0.0 新規作成（P23/P32/P42/P44/P45統合ガイド）。`patterns.md` に成功パターン2件追加 |
| **v1.41.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12反映**: `skill:import` IPC戻り値型修正（ImportResult→ImportedSkill）を `interfaces-agent-sdk-skill.md` / `arch-electron-services.md` / `security-skill-ipc.md` / `task-workflow.md` / `ipc-contract-checklist.md` に反映。残課題→完了タスクへ移動 |
| **v1.40.0** | **2026-02-20** | **IPC契約チェックリスト新規作成 + クロスリファレンス強化**: `ipc-contract-checklist.md` を新規作成（P23/P32/P42/P44統合チェックリスト）。`lessons-learned.md` / `security-skill-ipc.md` にチェックリスト参照を追加。`skill-creator/patterns.md` のクイックナビゲーション重複行を統合 |
| **v1.39.0** | **2026-02-20** | **未タスク配置ドリフト是正 + 実装苦戦箇所追記**: `task-workflow.md` / `api-ipc-agent.md` の未実施タスク参照を `docs/30-workflows/unassigned-task/` に統一。`lessons-learned.md` に UT-FIX-SKILL-REMOVE-INTERFACE-001 の苦戦箇所（契約ドリフト/配置ドリフト/テスト実行コンテキスト差異）を追加 |
| **v1.38.1** | **2026-02-20** | **UT-FIX-SKILL-REMOVE-INTERFACE-001 Phase 12反映**: `task-workflow.md` の未タスク参照を実ファイルに修正し、UT-FIX-SKILL-REMOVEを完了化。`interfaces-agent-sdk-skill.md` / `api-ipc-agent.md` / `arch-electron-services.md` / `security-skill-ipc.md` に `skill:remove` の `skillName` 契約を反映 |
| **v1.38.0** | **2026-02-20** | **TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 12反映**: `@repo/shared` 三層モジュール解決整合化（228件→0件）。27 paths + 26 typesVersions + 3 alias 追加、224テスト全PASS。architecture-monorepo.md / development-guidelines.md / lessons-learned.md / quality-requirements.md / task-workflow.md / patterns.md を更新。未タスク `UT-FIX-TS-VITEST-TSCONFIG-PATHS-001` 登録 |
| **v1.37.0** | **2026-02-19** | **TASK-9A-C SkillEditor UI仕様書作成反映**: references 5ファイル更新（ui-ux-feature-components/interfaces-agent-sdk-skill/architecture-implementation-patterns/testing-component-patterns/lessons-learned）。SkillEditorコンポーネント仕様・型定義・実装パターン・テストパターン・苦戦箇所を追加 |
| **v1.36.0** | **2026-02-19** | **TASK-9A-C Phase 12準拠監査反映（追補）**: ui-ux-components.md v2.9.1 / ui-ux-feature-components.md v1.8.1 に監査エビデンスを追記。lessons-learned.md v1.15.0 に苦戦箇所4件（参照混在、phase表記ゆれ、spec_created判定、未タスク実体不足）を追加 |
| **v1.35.0** | **2026-02-19** | **TASK-FIX-10-1 教訓最適化反映**: `lessons-learned.md` に実装苦戦箇所（Step 2判定、未タスク検出範囲、alias運用継続性）と「同種課題の簡潔解決手順（5ステップ）」を追加。類似課題の再現性を強化 |
| **v1.34.0** | **2026-02-19** | **TASK-FIX-10-1-VITEST-ERROR-HANDLING再監査反映**: Vitest設定修正（dangerouslyIgnoreUnhandledErrors削除 + 18個の@repo/sharedサブパスエイリアス追加）に加え、`task-workflow.md` 完了記録/残課題更新（`task-imp-vitest-alias-sync-automation-001`追加）、`quality-requirements.md` に未処理Promise拒否検知ルールとalias管理ルールを追記 |
| **v1.33.0** | **2026-02-19** | **TASK-9A-C仕様再監査反映**: ui-ux-components.md / ui-ux-feature-components.md に SkillEditor（TASK-9A-C）の「仕様書作成済み・実装未着手」状態を追記。タスク参照整合（tasks/completed-task）と Phase 12成果物リンクを更新 |
| **v1.32.0** | **2026-02-14** | **TASK-FIX-14-1 実装パターン体系化**: logging-migration-guide.md新規作成、patterns.md・development-guidelines.md・lessons-learned.md更新 |
| **v1.31.0** | **2026-02-14** | **UT-FIX-IPC-RESPONSE-UNWRAP-001実装知見追記**: lessons-learned.md 実装苦戦箇所4件、architecture-implementation-patterns.md safeInvokeUnwrap パターン、patterns.md 成功/失敗パターン追加 |
| **v1.31.0** | **2026-02-14** | **TASK-FIX-14-1 苦戦箇所の仕様化**: lessons-learned.md v1.11.0 を追加（実変更ファイル名との乖離防止、Phase 12 Step 1-A/1-C/1-D先送り誤判定防止、未タスク登録3ステップ同時完了）。task-fix-14-2 への追跡リンクを明記 |
| **v1.30.2** | **2026-02-14** | **UT-FIX-IPC-HANDLER-DOUBLE-REG-001 Phase 12再監査追補**: lessons-learned.md に苦戦箇所2件を追記（IPC_CHANNELS全走査の前提確認、IPC外リスナー解除漏れ防止）。Phase 12準拠監査結果を反映し、未タスク検出は「新規0件（rawは既存TODO）」を確認 |
| **v1.30.1** | **2026-02-14** | **UT-FIX-IPC-HANDLER-DOUBLE-REG-001 参照整合の是正**: task-workflow.md の完了タスク参照を `completed-tasks/` に正規化し、完了タスク仕様書の Issue 番号不整合（#814/#818 → #815）を修正。`generate-index.js` 再実行で topic-map/keywords を同期 |
| **v1.30.0** | **2026-02-14** | **UT-FIX-IPC-RESPONSE-UNWRAP-001完了反映**: interfaces-agent-sdk-skill.md v1.20.0更新（Preload IPCラッパー展開の完了記録、苦戦箇所追記）、task-workflow.md v1.37.0更新（完了反映 + MINOR由来未タスク2件追加）、lessons-learned.md v1.11.0更新（参照正本不一致・MINOR未タスク化漏れ・完了移管リンク不整合の教訓追加） |
| **v1.30.0** | **2026-02-14** | **UT-FIX-IPC-HANDLER-DOUBLE-REG-001完了**: IPC ハンドラ二重登録防止修正。security-electron-ipc.md v1.4.0更新（IPCハンドラライフサイクル管理セクション追加）、task-workflow.md更新（完了タスク追加）、lessons-learned.md更新（ipcMain.handle()二重登録教訓追加）。7テスト全PASS |
| **v1.30.0** | **2026-02-14** | **TASK-FIX-14-1 Phase 12反映**: task-workflow.md v1.37.0（完了タスク追加 + 未タスク TASK-FIX-14-2 登録）、interfaces-agent-sdk-history.md v6.39.0（残課題更新）、development-guidelines.md v1.7.0（Skill系Main Processログ規約追加） |
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
| **v1.15.0** | **2026-02-19** | **TASK-9A-B完了**: ファイル編集IPCハンドラー6チャンネル追加（skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup）。api-ipc-agent.md/security-electron-ipc.md/architecture-overview.md/interfaces-agent-sdk-skill.md/task-workflow.md更新 |
| **v1.14.0** | **2026-02-11** | **TASK-FIX-7-1スキル改善**: Triggerキーワードに「Setter Injection, 依存性注入, 遅延初期化, setSkillExecutor, SkillExecutor委譲」を追加。検索性向上 |
| **v1.13.0** | **2026-02-11** | **TASK-FIX-7-1システム仕様書更新**: arch-electron-services.md v1.11.0更新（SkillService API追加、SkillService統合セクション追加）、interfaces-agent-sdk-executor.md v1.4.0更新（SkillService統合セクション新設）、architecture-implementation-patterns.md v1.17.0更新（Setter Injectionパターン追加）。LOGS.md 2ファイル・SKILL.md 2ファイル更新 |
| **v1.12.0** | **2026-02-11** | **TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION完了**: SkillService.executeSkill()をSkillExecutorに委譲するTDD実装。Phase 1-12全工程完了、統合テスト7件・ユニットテスト12件全PASS、未タスク0件。スキル更新（LOGS.md 2ファイル、SKILL.md 2ファイル） |
| **v1.11.0** | **2026-02-10** | **TASK-FIX-6-1知見によるスキル改善**: patterns.md成功パターン3件追加（Slice統合、Race Condition対策、Phase 12チェックリスト）、arch-state-management.md v1.10.0（skillSlice統合記録）、06-known-pitfalls.md P25-P28追加、topic-map.md再生成実施 |
| **v1.10.0** | **2026-02-10** | **TASK-FIX-6-1-STATE-CENTRALIZATION完了**: arch-state-management.md更新（skillSlice統合記録、agentSlice拡張）、テスト70件PASS、Branch Coverage 89.09%達成 |
| **8.55.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 未タスク検出**: skillHandlers.ts全14ハンドラ調査→3件検出（IPC応答形式統一・P45引数名ドリフト・P42バリデーション統一）。task-workflow.md残課題3エントリ追加、interfaces-agent-sdk-skill.md関連テーブル追加 |
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
