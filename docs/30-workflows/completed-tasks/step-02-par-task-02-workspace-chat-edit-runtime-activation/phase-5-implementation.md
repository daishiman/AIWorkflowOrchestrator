# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 5                                           |
| Phase名    | 実装                                        |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 前提Phase  | Phase 4（テスト作成）                       |
| 後続Phase  | Phase 6（テスト拡充）                       |
| ステータス | completed                                   |
| 作成日     | 2026-03-13                                  |
| 機能名     | workspace-chat-edit-runtime-activation      |

## 目的

Workspace Chat Edit の AI runtime 有効化 の実装順序と変更境界を整理する。

## 実行タスク

- adapter 置換順序: real LLM adapter を resolver 経由で注入する順序を整理する
- bridge 実装順序: Monaco selection 取得経路を本実装へ置き換える順序を整理する

## 参照資料

| 参照資料               | パス                                                          | 内容                              |
| ---------------------- | ------------------------------------------------------------- | --------------------------------- |
| Phase 4（テスト作成）  | `phase-4-test-creation.md`                                    | 依存する前提成果物を確認する      |
| chatEditHandlers       | `apps/desktop/src/main/handlers/chatEditHandlers.ts`          | stub 実装と TODO の起点           |
| ChatEditService        | `apps/desktop/src/main/services/chat-edit/ChatEditService.ts` | real adapter を受ける facade      |
| chatEdit IPC bootstrap | `apps/desktop/src/main/ipc/index.ts`                          | stub adapter 注入の現状を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                 | パス                                                                                            | 内容                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| api-ipc-agent                            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                            | Chat Edit IPC 正本                                                    |
| llm-workspace-chat-edit                  | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | Chat Edit service interface 正本                                      |
| interfaces-llm                           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                           | LLM 契約と coverage 指針                                              |
| security-electron-ipc                    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                    | sender、masking、error envelope の正本                                |
| ui-ux-feature-components                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | Workspace Chat Edit の UI component 正本                              |
| workflow-ai-runtime-authmode-unification | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | Task01 foundation 契約と後続タスク反映順の正本                        |
| interfaces-auth                          | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | access capability 型契約（integratedRuntime / terminalSurface）の正本 |
| api-ipc-system                           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | runtime resolver / selected config / settings 反映の IPC 契約の正本   |
| llm-streaming                            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                            | stream / cancel 契約とエラー分類の正本                                |
| ui-ux-settings                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                           | settings access card / guidance 語彙の正本                            |
| arch-state-management                    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                    | chatEdit state ownership / handoff 境界の正本                         |
| task-workflow                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                            | 完了台帳、関連タスク、未タスク導線の正本                              |
| lessons-learned                          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                          | 苦戦箇所と再発防止手順の正本                                          |
| legacy-ordinal-family-register           | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | 旧成果物命名（例: qa-checklist）との互換管理の正本                    |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Workspace Chat Edit の AI runtime 有効化 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

実装 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

selection handoff、chat-edit IPC、workspacePath 制約、runtime resolution の実装順序と接続点を記録する。

## 成果物

| 成果物   | パス                                     | 内容                         |
| -------- | ---------------------------------------- | ---------------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 実装順序と変更対象を整理する |

## 完了条件

- [ ] 実装順序が明確になっている
- [ ] stub 除去手順が整理されている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
