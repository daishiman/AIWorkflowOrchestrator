# skill-agent-runtime-routing - タスク実行仕様書

## ユーザーからの元の指示

```text
AI 機能を `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` に分離し、すべての AI surface で切替・handoff・UI/UX・実行順序が分かるタスク仕様書を task-specification-creator と aiworkflow-requirements に従って整備する。実装は行わない。
```

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001                  |
| タスク名     | skill-agent-runtime-routing                               |
| 分類         | 設計                                                      |
| 対象機能     | Skill / Agent / Skill Creator の runtime ルーティング統一 |
| 優先度       | 高                                                        |
| 見積もり規模 | 中規模                                                    |
| ステータス   | completed                                                 |
| 作成日       | 2026-03-13                                                |

## タスク概要

### 目的

SkillExecutor、AgentExecutor、SkillCreatorService、`useAgent`、`AgentSDKPage`、`agent-handler` が `Integrated API Runtime` を共通基盤として使い、manual 操作が必要な場合は `Claude Code terminal surface` へ handoff できるようにする。

### 背景

現状の skill execution preflight は API キー前提で、SkillExecutor も direct read に寄っている。加えて Agent SDK UI / Hook / IPC / CLI automation が別系統で動いており、統合実行と manual terminal の境界が曖昧である。Skill lifecycle Task03 が参照できるよう、`自動実行は API runtime`、`Claude Code は terminal handoff` へ再整理する必要がある。

### 最終ゴール

Skill、Agent、Creator、Agent SDK UI / Hook が同じ integrated runtime policy を使い、manual 操作が必要な場面では terminal launcher / runbook / context summary を返す設計を確定する。

### 成果物一覧

| 種別               | 成果物                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 配置先                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing`                  |
| 設計成果物         | outputs/phase-_/_.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/outputs/phase-*/` |
| system spec 同期先 | workflow-ai-runtime-authmode-unification.md / ui-ux-settings.md / ui-ux-feature-components.md / interfaces-auth.md / api-ipc-system.md / legacy-ordinal-family-register.md / interfaces-agent-sdk.md / interfaces-agent-sdk-ui.md / interfaces-agent-sdk-skill.md / interfaces-agent-sdk-executor.md / interfaces-agent-sdk-integration.md / claude-code-agents-workflow.md / ui-ux-agent-execution.md / security-skill-execution.md / security-electron-ipc.md / arch-electron-services.md / arch-claude-cli.md / task-workflow.md / lessons-learned.md / task-workflow-backlog.md | `/.claude/skills/aiworkflow-requirements/references/`                                                |

## 参照ファイル

| 参照資料                             | パス                                                                                                     | 内容                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| pack parent index                    | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                             | 実行順序、依存グラフ、共通方針の正本を確認する                                    |
| pack design audit                    | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                               | 多角的監査の結論、禁止事項、依存整合を確認する                                    |
| pack UI/UX 図解                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                    | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                 |
| pack UI/UX 正本                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                 | 全 surface 共通の状態、CTA、microcopy 契約を確認する                              |
| Task01 foundation investigation      | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | access matrix / resolver / fail-fast / terminal boundary の現行調査結果を継承する |
| Task01 settings review investigation | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | 設定画面レビュー結果（TC-11-00 相当）を設計へ反映する                             |
| aiworkflow resource map              | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                         | 本タスク種別の必須抽出仕様セットを確定する                                        |
| aiworkflow quick reference           | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                      | 検索キーワードと参照順序を固定する                                                |
| ai-runtime workflow 正本             | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`          | foundation 契約、current canonical set、artifact inventory を継承する             |
| ui-ux-settings                       | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                    | Settings 3領域の UI 契約を継承する                                                |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                          | surface責務とUIコンポーネント境界を継承する                                       |
| interfaces-auth                      | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                   | capability / auth-mode 契約を継承する                                             |
| api-ipc-system                       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                    | runtime 解決と IPC 経路契約を継承する                                             |
| legacy register                      | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`                    | 旧 filename 互換管理の前提を確認する                                              |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                     | 完了記録と関連未タスクの同期先を固定する                                          |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                   | 苦戦箇所と再利用手順の同期先を固定する                                            |
| task-workflow-backlog                | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                             | follow-up未タスクの台帳状態を確認する                                             |
| follow-up 未タスク                   | `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md`                  | AI runtime/authmode の継続改善タスクを確認する                                    |
| SkillExecutor                        | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                                  | skill execute の current path を確認する                                          |
| AgentExecutor                        | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                                                  | agent execute の current path を確認する                                          |
| skillExecutionAuthPreflight          | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`                                         | renderer preflight の current contract を確認する                                 |
| AgentHandler                         | `apps/desktop/src/main/agent/agent-handler.ts`                                                           | agent IPC と SDK 実行面の current path を確認する                                 |
| shared AgentClient                   | `packages/shared/src/agent/agent-client.ts`                                                              | renderer / main をまたぐ Agent SDK 実行契約を確認する                             |
| useAgent                             | `apps/desktop/src/renderer/hooks/useAgent.ts`                                                            | Agent Hook の runtime handoff を確認する                                          |
| AgentChatInterface                   | `apps/desktop/src/renderer/components/organisms/AgentChatInterface/AgentChatInterface.tsx`               | Agent chat UI の state / streaming surface を確認する                             |
| AgentSDKPage                         | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                                                 | Agent SDK UI surface の auth / session 契約を確認する                             |
| Claude CLI IPC                       | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                                                        | terminal launcher / session handoff 契約を確認する                                |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                        | skill lifecycle 契約正本                                                          |
| interfaces-agent-sdk                 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                              | Agent SDK 基本契約と型の正本                                                      |
| interfaces-agent-sdk-ui              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                           | Agent SDK UI / Hook の正本                                                        |
| interfaces-agent-sdk-executor        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                     | execute 契約と error code 正本                                                    |
| interfaces-agent-sdk-integration     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md`                  | Claude CLI / Agent SDK 統合の正本                                                 |
| claude-code-agents-workflow          | `.claude/skills/aiworkflow-requirements/references/claude-code-agents-workflow.md`                       | internal orchestration 正本                                                       |
| ui-ux-agent-execution                | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                             | Agent surface の UI 契約                                                          |
| security-skill-execution             | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                          | permission と trust 境界の正本                                                    |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                             | IPC sender / error envelope の正本                                                |
| arch-electron-services               | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                            | Main service DI の正本                                                            |
| arch-claude-cli                      | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                                   | Claude CLI / terminal architecture の正本                                         |

## aiworkflow-requirements 抽出セット（resource-map準拠）

| Lane | SubAgent           | 必須仕様                                                                                                                                                                                                                                           | 目的                                                     |
| ---- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| A    | Foundation Lane    | `indexes/resource-map.md` / `indexes/quick-reference.md` / `references/workflow-ai-runtime-authmode-unification.md`                                                                                                                                | 参照順序と foundation 契約を固定する                     |
| B    | Auth/Settings Lane | `references/ui-ux-settings.md` / `references/interfaces-auth.md` / `references/api-ipc-system.md`                                                                                                                                                  | auth-mode / settings / IPC 境界を固定する                |
| C    | Runtime Lane       | `references/interfaces-agent-sdk*.md` / `references/claude-code-agents-workflow.md` / `references/ui-ux-feature-components.md` / `references/security-*.md` / `references/arch-*.md`                                                               | 実行経路・UI責務・権限・terminal handoff 契約を固定する  |
| D    | Ledger Lane        | `references/task-workflow.md` / `references/lessons-learned.md` / `references/task-workflow-backlog.md` / `references/legacy-ordinal-family-register.md` / `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md` | 台帳同期と legacy filename 互換、follow-up導線を固定する |

4レーンは並列実行し、Lead Agent が `phase-*.md` と `artifacts.json` へ統合反映する。

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名    | 責務                                             | 依存 |
| ---- | ---------- | --------------- | ------------------------------------------------ | ---- |
| T-01 | Phase 1    | 要件整理        | Skill、Agent、Creator の current path を整理する | -    |
| T-02 | Phase 2    | 設計確定        | shared runtime policy と role を設計する         | T-01 |
| T-03 | Phase 3    | レビューゲート  | trust と UI 責務の破綻がないかを判定する         | T-02 |
| T-04 | Phase 4-7  | テスト仕様化    | execute と trust のテスト仕様を定義する          | T-03 |
| T-05 | Phase 8-13 | 文書化とhandoff | spec sync と rollout 説明を整理する              | T-04 |

## SubAgent チーム編成（仕様書単位）

| Lane | SubAgent                | 担当仕様書                                                                                                                                                 | 期待出力                                  |
| ---- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| A    | Foundation Agent        | workflow-ai-runtime-authmode-unification.md / resource-map.md / quick-reference.md                                                                         | foundation 契約抽出メモ                   |
| B    | Auth-Settings Agent     | ui-ux-settings.md / interfaces-auth.md / api-ipc-system.md                                                                                                 | auth-mode / settings / IPC 契約マトリクス |
| C    | Runtime-Execution Agent | interfaces-agent-sdk*.md / claude-code-agents-workflow.md / ui-ux-feature-components.md / security-*.md / arch-\*.md                                       | runtime routing 設計サマリー              |
| D    | Ledger Agent            | task-workflow.md / lessons-learned.md / task-workflow-backlog.md / legacy-ordinal-family-register.md / task-imp-ai-runtime-test-separation-criteria-001.md | Phase 12 同期台帳とfollow-up導線          |
| Lead | Integration Agent       | Phase 1-13 / artifacts.json                                                                                                                                | lane 統合結果と gate 判定                 |

## 実行フロー

1. Phase 1-3 で前提、設計、レビューゲートを固める。
2. Phase 4-7 でテスト仕様と coverage 目標を固める。
3. Phase 8-13 で実装順序、文書同期、handoff を固める。
4. 各 Phase で Lane A〜D を並列実行し、Lead が統合結果を反映する。

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed   |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed   |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed   |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed   |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed   |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed   |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed   |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed   |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed   |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed   |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed   |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed   |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 統合テスト連携（Phase 1〜11で必須）

- integrated runtime、terminal handoff、IPC、state handoff の接続点を各 Phase で必ず扱う。
- 本タスクでは execute、preflight、permission、streaming、manual runbook、terminal launcher を統合テスト観点の中心に置く。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
