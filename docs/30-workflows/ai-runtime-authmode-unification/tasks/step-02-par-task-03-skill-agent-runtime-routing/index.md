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
| ステータス   | spec_created                                              |
| 作成日       | 2026-03-13                                                |

## タスク概要

### 目的

SkillExecutor、AgentExecutor、SkillCreatorService、`useAgent`、`AgentSDKPage`、`agent-handler` が `Integrated API Runtime` を共通基盤として使い、manual 操作が必要な場合は `Claude Code terminal surface` へ handoff できるようにする。

### 背景

現状の skill execution preflight は API キー前提で、SkillExecutor も direct read に寄っている。加えて Agent SDK UI / Hook / IPC / CLI automation が別系統で動いており、統合実行と manual terminal の境界が曖昧である。Skill lifecycle Task03 が参照できるよう、`自動実行は API runtime`、`Claude Code は terminal handoff` へ再整理する必要がある。

### 最終ゴール

Skill、Agent、Creator、Agent SDK UI / Hook が同じ integrated runtime policy を使い、manual 操作が必要な場面では terminal launcher / runbook / context summary を返す設計を確定する。

### 成果物一覧

| 種別               | 成果物                                                                                                                                                                                                                                                                                                                                                                      | 配置先                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                                                                                                                                                                                                                                                                     | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-02-par-task-03-skill-agent-runtime-routing`                  |
| 設計成果物         | outputs/phase-_/_.md                                                                                                                                                                                                                                                                                                                                                        | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-02-par-task-03-skill-agent-runtime-routing/outputs/phase-*/` |
| system spec 同期先 | interfaces-agent-sdk.md / interfaces-agent-sdk-ui.md / interfaces-agent-sdk-skill.md / interfaces-agent-sdk-executor.md / interfaces-agent-sdk-integration.md / claude-code-agents-workflow.md / ui-ux-agent-execution.md / security-skill-execution.md / security-electron-ipc.md / arch-electron-services.md / arch-claude-cli.md / task-workflow.md / lessons-learned.md | `/.claude/skills/aiworkflow-requirements/references/`                                                                      |

## 参照ファイル

| 参照資料                         | パス                                                                                                                                                                                  | 内容                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| pack parent index                | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                                                                                          | 実行順序、依存グラフ、共通方針の正本を確認する                                                  |
| pack design audit                | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                                                                                            | 多角的監査の結論、禁止事項、依存整合を確認する                                                  |
| pack UI/UX 図解                  | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                                                                                                 | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                               |
| pack UI/UX 正本                  | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                                                                                              | 全 surface 共通の状態、CTA、microcopy 契約を確認する                                            |
| Task01 foundation outputs        | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-2/design-summary.md`                                        | access matrix / resolver / fail-fast / terminal boundary の共通契約を継承する                   |
| Task01 settings review           | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-11/screenshots/TC-11-00-settings-authmode-review-board.png` | 設定画面（認証方式カード・Claude Agent SDK APIキー・APIキー設定一覧）の改善要求を設計へ反映する |
| SkillExecutor                    | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                                                                                                               | skill execute の current path を確認する                                                        |
| AgentExecutor                    | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                                                                                                                               | agent execute の current path を確認する                                                        |
| skillExecutionAuthPreflight      | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`                                                                                                                      | renderer preflight の current contract を確認する                                               |
| AgentHandler                     | `apps/desktop/src/main/agent/agent-handler.ts`                                                                                                                                        | agent IPC と SDK 実行面の current path を確認する                                               |
| shared AgentClient               | `packages/shared/src/agent/agent-client.ts`                                                                                                                                           | renderer / main をまたぐ Agent SDK 実行契約を確認する                                           |
| useAgent                         | `apps/desktop/src/renderer/hooks/useAgent.ts`                                                                                                                                         | Agent Hook の runtime handoff を確認する                                                        |
| AgentChatInterface               | `apps/desktop/src/renderer/components/organisms/AgentChatInterface/AgentChatInterface.tsx`                                                                                            | Agent chat UI の state / streaming surface を確認する                                           |
| AgentSDKPage                     | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                                                                                                                              | Agent SDK UI surface の auth / session 契約を確認する                                           |
| Claude CLI IPC                   | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                                                                                                                                     | terminal launcher / session handoff 契約を確認する                                              |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                                                     | skill lifecycle 契約正本                                                                        |
| interfaces-agent-sdk             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                                                                                                           | Agent SDK 基本契約と型の正本                                                                    |
| interfaces-agent-sdk-ui          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                                                                                                        | Agent SDK UI / Hook の正本                                                                      |
| interfaces-agent-sdk-executor    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                                                                                                  | execute 契約と error code 正本                                                                  |
| interfaces-agent-sdk-integration | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md`                                                                                               | Claude CLI / Agent SDK 統合の正本                                                               |
| claude-code-agents-workflow      | `.claude/skills/aiworkflow-requirements/references/claude-code-agents-workflow.md`                                                                                                    | internal orchestration 正本                                                                     |
| ui-ux-agent-execution            | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                                                                                          | Agent surface の UI 契約                                                                        |
| security-skill-execution         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                                                                                       | permission と trust 境界の正本                                                                  |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                                          | IPC sender / error envelope の正本                                                              |
| arch-electron-services           | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                                                                                                         | Main service DI の正本                                                                          |
| arch-claude-cli                  | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                                                                                                                | Claude CLI / terminal architecture の正本                                                       |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名    | 責務                                             | 依存 |
| ---- | ---------- | --------------- | ------------------------------------------------ | ---- |
| T-01 | Phase 1    | 要件整理        | Skill、Agent、Creator の current path を整理する | -    |
| T-02 | Phase 2    | 設計確定        | shared runtime policy と role を設計する         | T-01 |
| T-03 | Phase 3    | レビューゲート  | trust と UI 責務の破綻がないかを判定する         | T-02 |
| T-04 | Phase 4-7  | テスト仕様化    | execute と trust のテスト仕様を定義する          | T-03 |
| T-05 | Phase 8-13 | 文書化とhandoff | spec sync と rollout 説明を整理する              | T-04 |

## 実行フロー

1. Phase 1-3 で前提、設計、レビューゲートを固める。
2. Phase 4-7 でテスト仕様と coverage 目標を固める。
3. Phase 8-13 で実装順序、文書同期、handoff を固める。

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | not_started |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | not_started |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | not_started |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | not_started |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | not_started |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | not_started |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | not_started |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | not_started |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | not_started |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | not_started |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 統合テスト連携（Phase 1〜11で必須）

- integrated runtime、terminal handoff、IPC、state handoff の接続点を各 Phase で必ず扱う。
- 本タスクでは execute、preflight、permission、streaming、manual runbook、terminal launcher を統合テスト観点の中心に置く。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
