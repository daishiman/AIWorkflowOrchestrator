# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 1                                  |
| Phase名    | 要件定義                           |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| 前提Phase  | なし                               |
| 後続Phase  | Phase 2（設計）                    |
| ステータス | not_started                        |
| 作成日     | 2026-03-13                         |
| 機能名     | skill-docs-runtime-integration     |

## 目的

Skill Docs 生成の現状 stub 経路と必要要件を整理する。

## 実行タスク

- stub 現状確認: SkillDocGenerator と registerAllIpcHandlers の DI 現状を確認する
- 要件整理: provider、integrated runtime、terminal handoff guidance、timeout、retry、missing credentials の要件を整理する
- 境界整理: renderer を増やさず main runtime だけで完結する境界を確認する

## 参照資料

| 参照資料          | パス                                                                                                              | 内容                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
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

要件定義 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

queryFn、provider adapter、timeout、retry、guidance の接続要件を要件として明文化する。

## 成果物

| 成果物       | パス                                         | 内容                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | 要件、制約、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲を明記する   |

## 完了条件

- [ ] docs 生成に必要な runtime 要件が定義されている
- [ ] stub 排除の対象範囲が明確になっている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
