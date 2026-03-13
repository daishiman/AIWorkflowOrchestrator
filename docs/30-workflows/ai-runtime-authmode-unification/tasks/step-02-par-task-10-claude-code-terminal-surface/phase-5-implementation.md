# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| Phase名    | 実装                                      |
| タスクID   | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 |
| 前提Phase  | Phase 4（テスト作成）                     |
| 後続Phase  | Phase 6（テスト拡充）                     |
| ステータス | not_started                               |
| 作成日     | 2026-03-13                                |
| 機能名     | claude-code-terminal-surface              |

## 目的

Claude Code terminal surface と手動操作境界の整流 の実装順序と変更境界を整理する。

## 実行タスク

- DI 順序整理: SkillExecutor、AgentExecutor、SkillCreator 関連 DI 点の順序を整理する
- 設定整理: mode 切替と engine 切替の設定経路を整理する

## 参照資料

| 参照資料                    | パス                                                             | 内容                                              |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| Phase 4（テスト作成）       | `phase-4-test-creation.md`                                       | 依存する前提成果物を確認する                      |
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`          | skill execute の current path を確認する          |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`          | agent execute の current path を確認する          |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | renderer preflight の current contract を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                      | パス                                                                                 | 内容                           |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| interfaces-agent-sdk-skill    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    | skill lifecycle 契約正本       |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | execute 契約と error code 正本 |
| claude-code-agents-workflow   | `.claude/skills/aiworkflow-requirements/references/claude-code-agents-workflow.md`   | internal orchestration 正本    |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`      | permission と trust 境界の正本 |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`        | Main service DI の正本         |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Claude Code terminal surface と手動操作境界の整流 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

実装 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

execute、preflight、permission、streaming、internal orchestration の実装順序と接続点を記録する。

## 成果物

| 成果物   | パス                                     | 内容                         |
| -------- | ---------------------------------------- | ---------------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 実装順序と変更対象を整理する |

## 完了条件

- [ ] 実装順序が明確になっている
- [ ] 依存タスクとの接続点が整理されている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
