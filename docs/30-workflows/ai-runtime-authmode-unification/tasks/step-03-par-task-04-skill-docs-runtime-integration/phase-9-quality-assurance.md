# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 9                                  |
| Phase名    | 品質検証                           |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| 前提Phase  | Phase 5（実装）                    |
| 後続Phase  | Phase 10（最終レビュー）           |
| ステータス | not_started                        |
| 作成日     | 2026-03-13                         |
| 機能名     | skill-docs-runtime-integration     |

## 目的

Skill Docs 生成の AI runtime 統合 の品質を横断観点で確認する。

## 実行タスク

- 品質確認: 生成品質、guidance、secret masking を確認する
- 運用確認: 非機能要件と runtime cost を確認する

## 参照資料

| 参照資料          | パス                                                                                                              | 内容                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 5（実装）   | `phase-5-implementation.md`                                                                                       | 依存する前提成果物を確認する          |
| SkillDocGenerator | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体を確認する               |
| ipc index         | `apps/desktop/src/main/ipc/index.ts`                                                                              | queryFn DI の current path を確認する |
| task UT-9I-001    | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクを確認する        |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                              | 内容                                           |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | Skill Docs IPC 正本                            |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | registerSkillDocsHandlers の構成正本           |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill Docs 関連未タスクと public contract 正本 |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender、path validation、error envelope の正本 |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | TASK-9I の完了履歴と未タスク正本               |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Skill Docs 生成の AI runtime 統合 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

品質検証 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

queryFn、provider adapter、timeout、retry、guidance の品質観点を横断確認する。

## 成果物

| 成果物             | パス                              | 内容                                           |
| ------------------ | --------------------------------- | ---------------------------------------------- |
| 品質チェックリスト | `outputs/phase-9/qa-checklist.md` | セキュリティ、UX、契約整合の確認項目をまとめる |

## 完了条件

- [ ] 品質 blocker 0 件

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
