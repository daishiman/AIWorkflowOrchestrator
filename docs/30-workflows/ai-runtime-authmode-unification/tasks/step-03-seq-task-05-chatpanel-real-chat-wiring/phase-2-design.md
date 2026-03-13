# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 2                                   |
| Phase名    | 設計                                |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 前提Phase  | Phase 1（要件定義）                 |
| 後続Phase  | Phase 3（設計レビュー）             |
| ステータス | not_started                         |
| 作成日     | 2026-03-13                          |
| 機能名     | chatpanel-real-chat-wiring          |

## 目的

ChatPanel を real chat 契約へ接続する設計を確定する。

## 実行タスク

- state 設計: message、input、model selection の state 責務を設計する
- runtime 境界設計: main chat runtime と renderer state の境界を設計する
- UX 設計: access capability 切替、loading、error、empty state の挙動を設計する
- transcript 受け取り設計: terminal transcript の手動共有を composer / attachment で受け取る契約を設計する

## 設計方針

- runtime 解決は main、表示状態は renderer の責務とする
- ChatPanel と Chat Edit は context を共有しても command surface は分ける
- placeholder を local mock で延命せず real contract へ置き換える

## Atent Team / SubAgent 分担

| 役割                    | 主担当                                                     |
| ----------------------- | ---------------------------------------------------------- |
| Chat Surface Agent      | message、input、selection state を整理する                 |
| Main Chat Runtime Agent | AI_CHAT、selected config、access capability 経路を整理する |
| UX Agent                | loading、error、empty state を整理する                     |

## 参照資料

| 参照資料            | パス                                                                       | 内容                                                  |
| ------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                                                  | 依存する前提成果物を確認する                          |
| pack parent index   | `docs/30-workflows/ai-runtime-authmode-unification/index.md`               | 実行順序、依存グラフ、共通方針の正本を確認する        |
| pack design audit   | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md` | 多角的監査の結論、禁止事項、依存整合を確認する        |
| pack UI/UX 図解     | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`      | 5図セットの画面構成、状態遷移、CTA 導線を確認する     |
| ChatPanel           | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                  | placeholder UI の現状を確認する                       |
| ai handlers         | `apps/desktop/src/main/ipc/index.ts`                                       | AI_CHAT と selected config の current path を確認する |
| ChatPanel tests     | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`   | 既存 UI 契約を確認する                                |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | LLM と chat contract の正本                             |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT と selected config の IPC 正本                  |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Workspace Chat Panel と ChatPanel 関連 UI 正本          |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access capability と settings 表示契約                  |
| ui-ux-panels                                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`                                    | ChatPanel 統合パターンの正本                            |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | selected config と auth key の既存ルール                |
| pack UI/UX 正本                                 | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                               | ChatPanel の empty / streaming / handoff 状態を確認する |

## UI/UX リアライズ

| 観点                | 内容                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| 画面構成            | header 下に capability banner、中央に message list、下部に composer、その補助として handoff block を置く |
| Primary CTA         | `送信する`                                                                                               |
| Secondary CTA       | `terminal で続ける` `設定を開く`                                                                         |
| 状態                | `empty` `streaming` `cancelled` `handoff` `blocked` を扱う                                               |
| マイクロコピー      | empty state は「まず質問を書く」ではなく、「この画面で自動実行できるか」を先に示す                       |
| アクセシビリティ    | capability banner と error guidance は message list より先に読める順序にする                             |
| 常設導線            | panel header または composer 近傍に固定 `Terminal` ボタンを置き、dock を即座に開けるようにする           |
| transcript 受け取り | terminal から来た内容は attachment chip や provenance label で出所を明示する                             |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、ChatPanel の実 AI チャット配線 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AI_CHAT、selected config、access capability、workspace context、streaming UX の契約、state、IPC、security 境界を設計へ反映する。

## 成果物

| 成果物                  | パス                                           | 内容                                                     |
| ----------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| 設計サマリー            | `outputs/phase-2/design-summary.md`            | 責務境界、依存関係、接続順序を整理する                   |
| 契約一覧                | `outputs/phase-2/contract-matrix.md`           | IPC、state、runtime 契約を一覧化する                     |
| UI/UX 実体化            | `outputs/phase-2/ui-ux-realization.md`         | banner、message list、composer、handoff を整理する       |
| transcript 受け取り設計 | `outputs/phase-2/transcript-ingestion-flow.md` | terminal transcript の手動添付と composer 反映を整理する |

## 完了条件

- [ ] ChatPanel の state と runtime 境界が定義されている
- [ ] Chat Edit と責務重複しない設計になっている
- [ ] empty / streaming / handoff / blocked の見せ方が定義されている
- [ ] terminal transcript の手動添付と provenance 表示が定義されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
