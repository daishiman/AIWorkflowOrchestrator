# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 1                                           |
| Phase名    | 要件定義                                    |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 前提Phase  | なし                                        |
| 後続Phase  | Phase 2（設計）                             |
| ステータス | not_started                                 |
| 作成日     | 2026-03-13                                  |
| 機能名     | workspace-chat-edit-runtime-activation      |

## 目的

Chat Edit の TODO と runtime 未配線箇所を整理し、必要要件を定義する。

## 実行タスク

- TODO 整理: selection 取得と send-with-context の現状ギャップを整理する
- 要件整理: Monaco selection、file context、workspacePath 制約、access capability、terminal handoff の要件を確定する
- 責務分離: renderer、main、IPC の責務境界を整理する

## 参照資料

| 参照資料               | パス                                                                            | 内容                                           |
| ---------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------- |
| chatEditHandlers       | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                            | stub 実装と TODO の起点                        |
| ChatEditService        | `apps/desktop/src/main/services/chat-edit/ChatEditService.ts`                   | real adapter を受ける facade                   |
| ContextBuilder         | `apps/desktop/src/main/services/chat-edit/ContextBuilder.ts`                    | file context の構築とサイズ制約を確認する      |
| chat-edit prompts      | `apps/desktop/src/main/services/chat-edit/prompts.ts`                           | LLM prompt 生成の current path を確認する      |
| chatEdit IPC bootstrap | `apps/desktop/src/main/ipc/index.ts`                                            | stub adapter 注入の現状を確認する              |
| preload chatEditApi    | `apps/desktop/src/preload/chatEditApi.ts`                                       | preload 契約と sender 境界を確認する           |
| chatEditSlice          | `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts` | renderer state と writeFile handoff を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                            | 内容                                     |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------- |
| api-ipc-agent            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`            | Chat Edit IPC 正本                       |
| llm-workspace-chat-edit  | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`  | Chat Edit service interface 正本         |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | LLM 契約と coverage 指針                 |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | sender、masking、error envelope の正本   |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Workspace Chat Edit の UI component 正本 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Workspace Chat Edit の AI runtime 有効化 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

要件定義 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

selection handoff、chat-edit IPC、workspacePath 制約、integrated runtime、terminal handoff の接続要件を要件として明文化する。

## 成果物

| 成果物       | パス                                         | 内容                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | 要件、制約、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲を明記する   |

## 完了条件

- [ ] selection、context、runtime の要件が分離されている
- [ ] 既存 TODO の吸収範囲が明確になっている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
