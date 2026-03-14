# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 2                                           |
| Phase名    | 設計                                        |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 前提Phase  | Phase 1（要件定義）                         |
| 後続Phase  | Phase 3（設計レビュー）                     |
| ステータス | completed                                   |
| 作成日     | 2026-03-13                                  |
| 機能名     | workspace-chat-edit-runtime-activation      |

## 目的

Chat Edit を共通 runtime 基盤の上に再配置する設計を確定する。

## 実行タスク

- 経路設計: selection 取得経路と LLM 実行経路を分離して設計する
- runtime 注入設計: handler 入口で resolver を注入する設計を作る
- error policy 設計: timeout、rate limit、permission denied の error mapping を定義する

## 設計方針

- selection 取得と LLM 実行は別責務として扱う
- workspacePath、path validation、sender validation は access capability に依存させない
- generated diff 契約は維持し、runtime 切替だけを追加する

## Atent Team / SubAgent 分担

| 役割                         | 主担当                               |
| ---------------------------- | ------------------------------------ |
| Main Handler Agent           | chatEditHandlers と DI 点を整理する  |
| Monaco Bridge Agent          | selection handoff 契約を整理する     |
| System Spec Extraction Agent | Chat Edit に必要な正本仕様を抽出する |

## 参照資料

| 参照資料               | パス                                                                       | 内容                                              |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| Phase 1（要件定義）    | `phase-1-requirements.md`                                                  | 依存する前提成果物を確認する                      |
| pack parent index      | `docs/30-workflows/ai-runtime-authmode-unification/index.md`               | 実行順序、依存グラフ、共通方針の正本を確認する    |
| pack design audit      | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md` | 多角的監査の結論、禁止事項、依存整合を確認する    |
| pack UI/UX 図解        | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`      | 5図セットの画面構成、状態遷移、CTA 導線を確認する |
| chatEditHandlers       | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                       | stub 実装と TODO の起点                           |
| ChatEditService        | `apps/desktop/src/main/services/chat-edit/ChatEditService.ts`              | real adapter を受ける facade                      |
| chatEdit IPC bootstrap | `apps/desktop/src/main/ipc/index.ts`                                       | stub adapter 注入の現状を確認する                 |

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
| pack UI/UX 正本                          | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                        | Chat Edit の inline action、diff preview、handoff card を確認する     |

## UI/UX リアライズ

| 観点             | 内容                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 画面構成         | editor selection action、context summary、diff preview、inline guidance block の 4 領域で構成する                          |
| Primary CTA      | `編集案を生成`                                                                                                             |
| Secondary CTA    | `terminal で続ける` `差分を確認`                                                                                           |
| 状態             | `selection-ready` `generating` `diff-ready` `handoff` `blocked` を扱う                                                     |
| マイクロコピー   | selection が無い場合は「選択範囲を決めてから続ける」、handoff 時は「この画面では自動実行せず terminal で続ける」を明示する |
| アクセシビリティ | keyboard だけで selection action、diff preview、handoff card へ移動できるようにする                                        |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Workspace Chat Edit の AI runtime 有効化 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

selection handoff、chat-edit IPC、workspacePath 制約、integrated runtime、terminal handoff の契約、state、IPC、security 境界を設計へ反映する。

## 成果物

| 成果物       | パス                                   | 内容                                                |
| ------------ | -------------------------------------- | --------------------------------------------------- |
| 設計サマリー | `outputs/phase-2/design-summary.md`    | 責務境界、依存関係、接続順序を整理する              |
| 契約一覧     | `outputs/phase-2/contract-matrix.md`   | IPC、state、runtime 契約を一覧化する                |
| UI/UX 実体化 | `outputs/phase-2/ui-ux-realization.md` | inline action、diff preview、handoff 導線を整理する |

## 完了条件

- [ ] Chat Edit の責務分離が明文化されている
- [ ] runtime 未配線部分の設計が Task01 契約に乗っている
- [ ] selection / diff / handoff の UI 状態と CTA が定義されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
