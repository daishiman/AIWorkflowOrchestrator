# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 12                                                                                                                                                                                                          |
| Phase名    | ドキュメント                                                                                                                                                                                                |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001                                                                                                                                                                    |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）                                                                                                                                                                                          |
| ステータス | completed                                                                                                                                                                                                   |
| 作成日     | 2026-03-13                                                                                                                                                                                                  |
| 機能名     | skill-agent-runtime-routing                                                                                                                                                                                 |

## 目的

Skill / Agent / Skill Creator の runtime ルーティング統一 の内容を system spec と task 台帳へ同期する。

## 実行タスク

- Task 12-1 実装ガイド: Part 1（中学生向け概念説明）と Part 2（技術者向け詳細）を作成する
- Task 12-2 システム仕様更新: Step 1-A/1-B/1-C と Step 2（条件付き）を実行し summary を作成する
- Task 12-3 変更履歴作成: documentation-changelog を出力する
- Task 12-4 未タスク検出: 0件でも検出結果を出力し、1件以上なら formalize する
- Task 12-5 スキルフィードバック: 改善点有無に関わらず記録する

## Phase 12 必須タスク

| Task | 必須 | 内容                                                           | 出力                                             |
| ---- | ---- | -------------------------------------------------------------- | ------------------------------------------------ |
| 12-1 | ✅   | implementation guide を 2部構成で作成                          | `outputs/phase-12/implementation-guide.md`       |
| 12-2 | ✅   | Step 1-A/1-B/1-C + Step 2（条件付き）を実施し要否判定を記録    | `outputs/phase-12/system-spec-update-summary.md` |
| 12-3 | ✅   | 変更ファイル、validator、current/baseline、artifacts同期を記録 | `outputs/phase-12/documentation-changelog.md`    |
| 12-4 | ✅   | 未タスク検出結果を記録（0件でも必須）                          | `outputs/phase-12/unassigned-task-detection.md`  |
| 12-5 | ✅   | スキル改善観点と next action を記録                            | `outputs/phase-12/skill-feedback-report.md`      |

### Task 12-2 実施詳細（Step 1 + Step 2）

- Step 1-A: 完了タスク記録、関連ドキュメントリンク、変更履歴、`.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` への同期を実施する
- Step 1-B: 実装状況テーブルを `not_started` / `spec_created` / `completed` の実態に合わせて更新する
- Step 1-C: 関連タスクテーブルと未タスク候補テーブルのステータスを同期する
- Step 2（条件付き）: インターフェース/設定/API/state/security/UI contract に変更がある場合のみ domain spec を更新する
- Canonical/Mirror: `.claude` を正本、`.agents` を mirror とし、必要時に `diff -qr` で同期確認する

### システム仕様同期先

- workflow-ai-runtime-authmode-unification.md
- ui-ux-settings.md
- ui-ux-feature-components.md
- interfaces-auth.md
- api-ipc-system.md
- legacy-ordinal-family-register.md
- interfaces-agent-sdk.md
- interfaces-agent-sdk-ui.md
- interfaces-agent-sdk-skill.md
- interfaces-agent-sdk-executor.md
- interfaces-agent-sdk-integration.md
- claude-code-agents-workflow.md
- ui-ux-agent-execution.md
- security-skill-execution.md
- security-electron-ipc.md
- arch-electron-services.md
- arch-claude-cli.md
- task-workflow.md
- lessons-learned.md
- task-workflow-backlog.md

## 参照資料

| 参照資料                     | パス                                                                                            | 内容                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Phase 1（要件定義）          | `phase-1-requirements.md`                                                                       | 依存する前提成果物を確認する                                          |
| Phase 2（設計）              | `phase-2-design.md`                                                                             | 依存する前提成果物を確認する                                          |
| Phase 5（実装）              | `phase-5-implementation.md`                                                                     | 依存する前提成果物を確認する                                          |
| Phase 6（テスト拡充）        | `phase-6-test-expansion.md`                                                                     | 依存する前提成果物を確認する                                          |
| Phase 7（カバレッジ確認）    | `phase-7-coverage-check.md`                                                                     | 依存する前提成果物を確認する                                          |
| Phase 8（リファクタリング）  | `phase-8-refactoring.md`                                                                        | 依存する前提成果物を確認する                                          |
| Phase 9（品質検証）          | `phase-9-quality-assurance.md`                                                                  | 依存する前提成果物を確認する                                          |
| Phase 10（最終レビュー）     | `phase-10-final-review.md`                                                                      | 依存する前提成果物を確認する                                          |
| Phase 11（手動テスト）       | `phase-11-manual-test.md`                                                                       | 依存する前提成果物を確認する                                          |
| aiworkflow resource map      | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                | 本タスク種別の必須抽出仕様セットを固定する                            |
| aiworkflow quick reference   | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                             | 検索キーワードと参照順序を固定する                                    |
| workflow-ai-runtime-authmode | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | foundation 契約、current canonical set、artifact inventory を継承する |
| follow-up 未タスク           | `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md`         | AI runtime/authmode の継続改善タスクを確認する                        |
| SkillExecutor                | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                         | skill execute の current path を確認する                              |
| AgentExecutor                | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                                         | agent execute の current path を確認する                              |
| skillExecutionAuthPreflight  | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`                                | renderer preflight の current contract を確認する                     |
| AgentHandler                 | `apps/desktop/src/main/agent/agent-handler.ts`                                                  | agent IPC と SDK 実行面の current path を確認する                     |
| useAgent                     | `apps/desktop/src/renderer/hooks/useAgent.ts`                                                   | Agent Hook の runtime handoff を確認する                              |
| AgentSDKPage                 | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                                        | Agent SDK UI surface の auth / session 契約を確認する                 |
| Claude CLI IPC               | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                                               | terminal surface の session / launcher 契約を確認する                 |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                         | パス                                                                                            | 内容                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| ui-ux-settings                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                           | Settings 3領域の UI 契約を継承する                                    |
| ui-ux-feature-components         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | surface責務とUIコンポーネント境界を継承する                           |
| interfaces-auth                  | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | capability / auth-mode 契約を継承する                                 |
| api-ipc-system                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | runtime 解決と IPC 経路契約を継承する                                 |
| legacy register                  | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | 旧 filename 互換管理を確認する                                        |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`               | skill lifecycle 契約正本                                              |
| interfaces-agent-sdk             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                     | Agent SDK 基本契約と型の正本                                          |
| interfaces-agent-sdk-ui          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                  | Agent SDK UI / Hook の正本                                            |
| interfaces-agent-sdk-executor    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`            | execute 契約と error code 正本                                        |
| interfaces-agent-sdk-integration | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md`         | Claude CLI / Agent SDK 統合の正本                                     |
| claude-code-agents-workflow      | `.claude/skills/aiworkflow-requirements/references/claude-code-agents-workflow.md`              | internal orchestration 正本                                           |
| ui-ux-agent-execution            | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                    | Agent surface の UI 契約                                              |
| security-skill-execution         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                 | permission と trust 境界の正本                                        |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                    | IPC sender / error envelope の正本                                    |
| arch-electron-services           | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                   | Main service DI の正本                                                |
| arch-claude-cli                  | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                          | Claude Code terminal / session / preload architecture の正本          |
| workflow-ai-runtime-authmode     | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | foundation 契約、current canonical set、artifact inventory を継承する |
| task-workflow                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                            | 完了記録と関連未タスクの同期先を固定する                              |
| lessons-learned                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                          | 苦戦箇所と再利用手順の同期先を固定する                                |
| task-workflow-backlog            | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                    | follow-up未タスクの台帳状態を確認する                                 |
| follow-up 未タスク               | `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md`         | AI runtime/authmode の継続改善タスクを確認する                        |

### 仕様書別 SubAgent 編成（並列実行）

| Lane | SubAgent            | 担当仕様書                                                                                                                                                 | 期待成果物                                                                |
| ---- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| A    | Foundation Agent    | workflow-ai-runtime-authmode-unification.md / resource-map.md / quick-reference.md                                                                         | `outputs/phase-12/system-spec-update-summary.md` の foundation セクション |
| B    | Auth-Settings Agent | ui-ux-settings.md / interfaces-auth.md / api-ipc-system.md                                                                                                 | implementation-guide Part 2 の auth/settings/IPC 節                       |
| C    | Runtime Agent       | interfaces-agent-sdk*.md / claude-code-agents-workflow.md / ui-ux-feature-components.md / security-*.md / arch-\*.md                                       | documentation-changelog.md の runtime 契約更新差分                        |
| D    | Ledger Agent        | task-workflow.md / lessons-learned.md / task-workflow-backlog.md / legacy-ordinal-family-register.md / task-imp-ai-runtime-test-separation-criteria-001.md | `outputs/phase-12/unassigned-task-detection.md` と task-workflow 同期メモ |
| Lead | Integration Agent   | phase-12-documentation.md / artifacts.json                                                                                                                 | 4 lane 統合と完了条件判定                                                 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Skill / Agent / Skill Creator の runtime ルーティング統一 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

ドキュメント の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 成果物

| 成果物               | パス                                                     | 内容                                                                               |
| -------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 と Part 2 の 2 部構成でまとめる                                             |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/Step 2 の実施結果、更新した spec、canonical/mirror 方針、判断根拠を整理する |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | 仕様書更新履歴を残す                                                               |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 残件があれば formalize する                                                        |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善観点を記録する                                                                 |
| 準拠確認チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 と validator 合否、成果物揃いを最終確認する                        |

## 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing --phase 12
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --root docs/30-workflows
```

## 完了条件

- [x] spec sync 先が foundation / auth / settings / IPC / Skill / Agent / Creator / Agent SDK UI / Hook / CLI / ledger の正本まで定義されている
- [x] Task 2 Step 1-A / 1-B / 1-C と Step 2（条件付き）の要否判定が記録されている
- [x] `artifacts.json` の Phase 12 成果物と `phase-12-documentation.md` の成果物が一致している
- [x] `outputs/phase-12/implementation-guide.md` / `outputs/phase-12/system-spec-update-summary.md` / `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` / `outputs/phase-12/phase12-task-spec-compliance-check.md` の6ファイル定義が揃っている

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
