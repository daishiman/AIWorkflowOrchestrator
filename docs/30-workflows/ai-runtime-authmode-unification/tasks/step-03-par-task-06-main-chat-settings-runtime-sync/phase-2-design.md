# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| Phase名    | 設計                                       |
| タスクID   | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 前提Phase  | Phase 1（要件定義）                        |
| 後続Phase  | Phase 3（設計レビュー）                    |
| ステータス | not_started                                |
| 作成日     | 2026-03-13                                 |
| 機能名     | main-chat-settings-runtime-sync            |

## 目的

Main Chat / Settings の authority と handoff 境界を確定する。

## 実行タスク

- authority 設計: access capability、selected config、system prompt、health / RAG 状態の最終判定主体を定義する
- flow 設計: ChatView、selector、Settings、systemPromptAPI の同期順序を定義する
- error policy 設計: 未設定、未対応 capability、provider / model drift、health failure の表示方針を定義する

## 設計方針

- access capability と provider / model 選択は別責務として扱う
- Renderer は source of intent、Main は source of truth として扱う
- terminal surface は別 capability card として表示し、未対応 surface では launcher / guidance を返す

## Atent Team / SubAgent 分担

| 役割                  | 主担当                                                             |
| --------------------- | ------------------------------------------------------------------ |
| Chat Authority Agent  | ChatView / chatSlice / `AI_CHAT` の authority を整理する           |
| Selector Sync Agent   | LLMSelectorPanel / llmSlice / selected config の同期契約を整理する |
| Prompt Settings Agent | system prompt / template / Settings 表示契約を整理する             |

## 参照資料

| 参照資料            | パス                                                                       | 内容                                                         |
| ------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Phase 1（要件定義） | `phase-1-requirements.md`                                                  | 依存する前提成果物を確認する                                 |
| pack parent index   | `docs/30-workflows/ai-runtime-authmode-unification/index.md`               | 実行順序、依存グラフ、共通方針の正本を確認する               |
| pack design audit   | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md` | 多角的監査の結論、禁止事項、依存整合を確認する               |
| pack UI/UX 図解     | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`      | 5図セットの画面構成、状態遷移、CTA 導線を確認する            |
| ChatView            | `apps/desktop/src/renderer/views/ChatView/index.tsx`                       | main chat の UI と state 利用点を確認する                    |
| chatSlice           | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                      | `AI_CHAT` 送信経路と selected config handoff を確認する      |
| llmSlice            | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                       | provider / model の選択と Main 同期を確認する                |
| aiHandlers          | `apps/desktop/src/main/ipc/aiHandlers.ts`                                  | `AI_CHAT` / `AI_CHECK_CONNECTION` の current path を確認する |
| SettingsView        | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   | access capability / API key / RAG 表示の現状を確認する       |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | `AI_CHAT` / `AI_CHECK_CONNECTION` / selected config の IPC 正本 |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | LLM / chat 契約と coverage 指針                                 |
| ui-ux-llm-selector                              | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                              | selector UI と TODO の正本                                      |
| ui-ux-system-prompt                             | `.claude/skills/aiworkflow-requirements/references/ui-ux-system-prompt.md`                             | prompt UI と template 契約の正本                                |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access capability / RAG 表示契約の正本                          |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | state handoff と store 契約の正本                               |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | selected config / auth key 同期の既存ルール                     |
| pack UI/UX 正本                                 | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                               | access card、runtime banner、guidance block を確認する          |

## UI/UX リアライズ

| 観点             | 内容                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 画面構成         | Settings では access capability card、terminal card、health row、provider / model selector、system prompt section を縦積みする |
| Primary CTA      | `API key を設定` または `この設定でチャットを使う`                                                                             |
| Secondary CTA    | `connection を確認` `terminal を開く` `system prompt を編集`                                                                   |
| 状態             | `ready` `missing-key` `health-warning` `model-drift` `terminal-available` を扱う                                               |
| マイクロコピー   | `この surface は自動実行します` と `この surface は terminal で手動実行します` をカード単位で分ける                            |
| アクセシビリティ | card heading と action button をまとめて読み上げられるようにする                                                               |
| 常設導線         | Settings header に固定 `Terminal` ボタンを置き、いつでも terminal dock を開けるようにする                                      |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Main Chat / Settings / Selector / System Prompt の runtime 同期 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

selected config、access capability、system prompt、health / RAG 状態の契約、state、IPC 境界を設計へ反映する。

## 成果物

| 成果物             | パス                                     | 内容                                                           |
| ------------------ | ---------------------------------------- | -------------------------------------------------------------- |
| 設計サマリー       | `outputs/phase-2/design-summary.md`      | 責務境界、依存関係、接続順序を整理する                         |
| 契約一覧           | `outputs/phase-2/contract-matrix.md`     | IPC、state、runtime 契約を一覧化する                           |
| UI/UX 実体化       | `outputs/phase-2/ui-ux-realization.md`   | access card、health row、selector、guidance の見せ方を整理する |
| マイクロコピー一覧 | `outputs/phase-2/microcopy-inventory.md` | capability / error / guidance の文言を整理する                 |

## 完了条件

- [ ] Main authority と Renderer state の責務境界が明文化されている
- [ ] integrated runtime の標準経路と terminal surface の launcher / guidance 条件が surface ごとに説明されている
- [ ] Settings と Main Chat の access card / health / selector UI が実体化されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
