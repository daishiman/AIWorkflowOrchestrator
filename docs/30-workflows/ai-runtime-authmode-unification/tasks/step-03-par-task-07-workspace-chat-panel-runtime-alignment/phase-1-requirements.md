# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 1                                            |
| Phase名    | 要件定義                                     |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | なし                                         |
| 後続Phase  | Phase 2（設計）                              |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

Workspace Chat Panel の current gap を整理し、必要要件を定義する。

## 実行タスク

- inventory 整理: stream、cancel、selected files、mention、conversation 保存、selected config の current path を整理する
- authority 整理: access capability、provider / model、file context、conversation の最終判定主体を列挙する
- gap 整理: local-only state、workspace surface 固有の fail-fast、guidance 不足を整理する

## 参照資料

| 参照資料                   | パス                                                                                | 内容                                                              |
| -------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| WorkspaceChatPanel         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | workspace chat UI surface を確認する                              |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | stream / selected config / file context handoff を確認する        |
| WorkspaceView              | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                           | panel 統合位置と file preview 連携を確認する                      |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | `llm:stream-chat` / cancel / selected config authority を確認する |
| conversation repository    | `apps/desktop/src/main/repositories/conversationRepository.ts`                      | conversation 永続化の current path を確認する                     |
| buildMessages              | `apps/desktop/src/main/utils/buildMessages.ts`                                      | message 正規化と file context handoff を確認する                  |
| completed task 059a        | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md`  | 既存 UI / streaming 正本を確認する                                |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | workspace chat と conversation の正本    |
| llm-streaming                                   | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                                   | stream chat / cancel 契約の正本          |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Workspace Chat Panel UI の正本           |
| ui-ux-navigation                                | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                | workspace 導線の正本                     |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | selected files / state handoff の正本    |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | selected config と auth key の既存ルール |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Workspace Chat Panel の runtime / access capability 同期 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

要件定義 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

stream、cancel、selected files、mention、conversation、access capability、selected config の接続要件を要件として明文化する。

## 成果物

| 成果物       | パス                                         | 内容                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | 要件、制約、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲を明記する   |

## 完了条件

- [ ] stream / context / conversation / access capability の authority が列挙されている
- [ ] workspace surface 固有の drift が後続設計へ割り当てられている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
