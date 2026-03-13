# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 4                                                             |
| Phase名    | テスト作成                                                    |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                            |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）                                               |
| ステータス | not_started                                                   |
| 作成日     | 2026-03-13                                                    |
| 機能名     | skill-docs-runtime-integration                                |

## 目的

Skill Docs 生成の AI runtime 統合 に必要な成功系、異常系、回帰系テストを定義する。

## 実行タスク

- queryFn テスト定義: success、timeout、rate limit、missing credentials の queryFn テストを定義する
- IPC テスト定義: docs 生成の失敗系と guidance のテストを定義する

## 参照資料

| 参照資料                | パス                                                                                                              | 内容                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 1（要件定義）     | `phase-1-requirements.md`                                                                                         | 依存する前提成果物を確認する          |
| Phase 2（設計）         | `phase-2-design.md`                                                                                               | 依存する前提成果物を確認する          |
| Phase 3（設計レビュー） | `phase-3-design-review.md`                                                                                        | 依存する前提成果物を確認する          |
| SkillDocGenerator       | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体を確認する               |
| ipc index               | `apps/desktop/src/main/ipc/index.ts`                                                                              | queryFn DI の current path を確認する |
| task UT-9I-001          | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクを確認する        |

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

テスト作成 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

queryFn、provider adapter、timeout、retry、guidance の成功系、異常系、回帰系テストを定義する。

## 成果物

| 成果物           | パス                             | 内容                               |
| ---------------- | -------------------------------- | ---------------------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | 成功系、異常系、回帰対象を整理する |

## 完了条件

- [ ] 主要成功系と異常系のテストが定義されている

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
