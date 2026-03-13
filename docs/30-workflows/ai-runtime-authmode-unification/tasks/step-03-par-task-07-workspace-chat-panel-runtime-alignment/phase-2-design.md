# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 2                                            |
| Phase名    | 設計                                         |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | Phase 1（要件定義）                          |
| 後続Phase  | Phase 3（設計レビュー）                      |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

Workspace Chat Panel の authority と handoff 境界を確定する。

## 実行タスク

- authority 設計: access capability、selected config、streaming、file context、conversation の最終判定主体を定義する
- flow 設計: mention、file attach、stream、cancel、conversation 保存の順序を定義する
- error policy 設計: file read failure、stream failure、未対応 capability、cancel 時の表示方針を定義する
- transcript 受け取り設計: terminal transcript の手動共有を context chips / composer attachment として受け取る契約を定義する

## 設計方針

- streaming と file context は別責務として扱う
- workspace 文脈の組み立ては access capability 判定に依存させない
- terminal surface は別 capability として扱い、Workspace Chat Panel では launcher / guidance を返す

## Atent Team / SubAgent 分担

| 役割               | 主担当                                                     |
| ------------------ | ---------------------------------------------------------- |
| Streaming Agent    | `llm:stream-chat` / cancel / chunk 表示の契約を整理する    |
| Context Agent      | selected files / mention / file context handoff を整理する |
| Conversation Agent | conversation 保存と state handoff の契約を整理する         |

## 参照資料

| 参照資料                   | パス                                                                                | 内容                                                              |
| -------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Phase 1（要件定義）        | `phase-1-requirements.md`                                                           | 依存する前提成果物を確認する                                      |
| pack parent index          | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                        | 実行順序、依存グラフ、共通方針の正本を確認する                    |
| pack design audit          | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`          | 多角的監査の結論、禁止事項、依存整合を確認する                    |
| pack UI/UX 図解            | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`               | 5図セットの画面構成、状態遷移、CTA 導線を確認する                 |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | stream / selected config / file context handoff を確認する        |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | `llm:stream-chat` / cancel / selected config authority を確認する |
| WorkspaceView              | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                           | panel 統合位置と file preview 連携を確認する                      |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                            | 内容                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | workspace chat と conversation の正本                                        |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | stream chat / cancel 契約の正本                                              |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Workspace Chat Panel UI の正本                                               |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | workspace 導線の正本                                                         |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | selected files / state handoff の正本                                        |
| pack UI/UX 正本          | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`        | Workspace Chat Panel の zero / streaming / guidance / compact 状態を確認する |

## UI/UX リアライズ

| 観点                | 内容                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| 画面構成            | panel header、file context chips、message log、composer、guidance block の 5 領域で構成する                |
| Primary CTA         | `送信する`                                                                                                 |
| Secondary CTA       | `ファイルを追加` `mention を開く` `terminal で続ける`                                                      |
| 状態                | `zero` `streaming` `cancel` `guidance` `compact` を扱う                                                    |
| マイクロコピー      | zero state では提案バブルと capability を同時表示し、blocked 時は workspace 文脈が失われないことを明示する |
| アクセシビリティ    | compact 幅でも chips と composer action が keyboard で到達可能であることを前提にする                       |
| 常設導線            | panel header に固定 `Terminal` ボタンを置き、compact 幅でも terminal dock を開けるようにする               |
| transcript 受け取り | terminal 共有内容は file context chip と区別し、transcript provenance chip として表示する                  |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Workspace Chat Panel の runtime / access capability 同期 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

stream、cancel、selected files、mention、conversation、access capability、selected config の契約、state、IPC 境界を設計へ反映する。

## 成果物

| 成果物                  | パス                                           | 内容                                                      |
| ----------------------- | ---------------------------------------------- | --------------------------------------------------------- |
| 設計サマリー            | `outputs/phase-2/design-summary.md`            | 責務境界、依存関係、接続順序を整理する                    |
| 契約一覧                | `outputs/phase-2/contract-matrix.md`           | IPC、state、runtime 契約を一覧化する                      |
| UI/UX 実体化            | `outputs/phase-2/ui-ux-realization.md`         | zero state、context chips、streaming、guidance を整理する |
| transcript 受け取り設計 | `outputs/phase-2/transcript-ingestion-flow.md` | transcript provenance chip と composer 反映を整理する     |

## 完了条件

- [ ] streaming / context / conversation の authority 境界が明文化されている
- [ ] terminal handoff guidance 条件と fail-fast 条件が説明されている
- [ ] zero / streaming / compact / guidance の UI 状態が定義されている
- [ ] terminal transcript の手動共有と provenance chip 表示が定義されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
