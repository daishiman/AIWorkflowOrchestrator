# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 11                                                                                                                                                                                  |
| Phase名    | 手動テスト                                                                                                                                                                          |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                                                                                                                                         |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー） |
| 後続Phase  | Phase 12（ドキュメント）                                                                                                                                                            |
| ステータス | completed                                                                                                                                                                           |
| 作成日     | 2026-03-13                                                                                                                                                                          |
| 機能名     | workspace-chat-edit-runtime-activation                                                                                                                                              |

## 目的

Workspace Chat Edit の AI runtime 有効化 の代表シナリオを手動で確認する。

## 実行タスク

- 代表操作確認: selection ありと selection なしで suggestion 取得シナリオを確認する
- access 確認: integrated runtime success と terminal handoff guidance を確認する
- diff preview 確認: suggestion 後の diff preview と apply 前導線を確認する

## テストケース

| テストケース | 目的                     | 期待結果                                                  |
| ------------ | ------------------------ | --------------------------------------------------------- |
| TC-11-01     | selection-ready 状態確認 | selection chip と context 表示が確認できる                |
| TC-11-02     | generating 状態確認      | 生成中表示（stream in-flight）が確認できる                |
| TC-11-03     | diff-ready 状態確認      | diff preview と apply 前導線が確認できる                  |
| TC-11-04     | handoff 状態確認         | `CAPABILITY_UNAVAILABLE` と handoff guidance が確認できる |
| TC-11-05     | blocked 状態確認         | `CREDENTIAL_MISSING` と設定誘導メッセージが確認できる     |

## 画面カバレッジマトリクス

| テストケース | 対象画面            | 状態            | 証跡計画                            |
| ------------ | ------------------- | --------------- | ----------------------------------- |
| TC-11-01     | Workspace Chat Edit | selection-ready | TC-11-01-chat-edit-selection.png    |
| TC-11-02     | Workspace Chat Edit | generating      | TC-11-02-chat-edit-generating.png   |
| TC-11-03     | Workspace Chat Edit | diff-ready      | TC-11-03-chat-edit-diff-preview.png |
| TC-11-04     | Workspace Chat Edit | handoff         | TC-11-04-chat-edit-handoff.png      |
| TC-11-05     | Workspace Chat Edit | blocked         | TC-11-05-chat-edit-blocked.png      |

## 参照資料

| 参照資料                    | パス                                                          | 内容                              |
| --------------------------- | ------------------------------------------------------------- | --------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                     | 依存する前提成果物を確認する      |
| Phase 2（設計）             | `phase-2-design.md`                                           | 依存する前提成果物を確認する      |
| Phase 5（実装）             | `phase-5-implementation.md`                                   | 依存する前提成果物を確認する      |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                   | 依存する前提成果物を確認する      |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                   | 依存する前提成果物を確認する      |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                      | 依存する前提成果物を確認する      |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                | 依存する前提成果物を確認する      |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                    | 依存する前提成果物を確認する      |
| chatEditHandlers            | `apps/desktop/src/main/handlers/chatEditHandlers.ts`          | stub 実装と TODO の起点           |
| ChatEditService             | `apps/desktop/src/main/services/chat-edit/ChatEditService.ts` | real adapter を受ける facade      |
| chatEdit IPC bootstrap      | `apps/desktop/src/main/ipc/index.ts`                          | stub adapter 注入の現状を確認する |

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
| pack UI/UX 正本                          | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                        | Chat Edit の selection / diff / handoff 状態を確認する                |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Workspace Chat Edit の AI runtime 有効化 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

手動テスト の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

selection handoff、chat-edit IPC、workspacePath 制約、runtime resolution の代表シナリオを手動で確認する。

## 成果物

| 成果物         | パス                                     | 内容                                  |
| -------------- | ---------------------------------------- | ------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 代表シナリオの結果を記録する          |
| 撮影計画       | `outputs/phase-11/screenshot-plan.json`  | 代表画面の撮影対象と TC-ID を整理する |

## 完了条件

- [x] 代表シナリオが PASS している
- [x] selection-ready / generating / diff-ready / handoff / blocked の 5 状態が screenshot 証跡に残っている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
