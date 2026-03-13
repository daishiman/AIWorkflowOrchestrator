# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| Phase名    | 要件定義                                   |
| タスクID   | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 前提Phase  | なし                                       |
| 後続Phase  | Phase 2（設計）                            |
| ステータス | not_started                                |
| 作成日     | 2026-03-13                                 |
| 機能名     | main-chat-settings-runtime-sync            |

## 目的

Main Chat / Settings の current routing と state gap を整理し、必要要件を定義する。

## 実行タスク

- inventory 整理: ChatView、`useStreamingChat`、LLMSelectorPanel、HealthIndicator、ProviderSelector、ModelSelector、SystemPromptPanel、SettingsView、AuthModeSelector、AuthKeySection、ApiKeysSection、`AI_CHAT`、`AI_CHECK_CONNECTION`、LLM adapter の current path を整理する
- state 整理: provider / model、access capability、system prompt、API key 保存状態、health、RAG 状態の authority を列挙する
- gap 整理: in-memory default、future TODO、local-only state、display drift を整理する

## 参照資料

| 参照資料                  | パス                                                                       | 内容                                                                   |
| ------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ChatView                  | `apps/desktop/src/renderer/views/ChatView/index.tsx`                       | main chat の UI と state 利用点を確認する                              |
| useStreamingChat          | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                      | renderer streaming hook と IPC handoff を確認する                      |
| chatSlice                 | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                      | `AI_CHAT` 送信経路と selected config handoff を確認する                |
| llmSlice                  | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                       | provider / model の選択と Main 同期を確認する                          |
| LLMSelectorPanel          | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`            | selector UI と health check の現状を確認する                           |
| HealthIndicator           | `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`             | 接続状態表示と fail-fast の現状を確認する                              |
| ProviderSelector          | `apps/desktop/src/renderer/components/llm/ProviderSelector.tsx`            | provider 選択 UI の current contract を確認する                        |
| ModelSelector             | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`               | model 選択 UI の current contract を確認する                           |
| systemPromptTemplateSlice | `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts`      | template 永続化と current prompt handoff を確認する                    |
| systemPromptHandlers      | `apps/desktop/src/main/ipc/systemPromptHandlers.ts`                        | prompt template の Main 側 authority を確認する                        |
| aiHandlers                | `apps/desktop/src/main/ipc/aiHandlers.ts`                                  | `AI_CHAT` / `AI_CHECK_CONNECTION` の current path を確認する           |
| llm handlers              | `apps/desktop/src/main/handlers/llm.ts`                                    | `llm:set-selected-config` / health / streaming の authority を確認する |
| llmConfigProvider         | `apps/desktop/src/main/ipc/llmConfigProvider.ts`                           | selected config の in-memory default を確認する                        |
| LLMAdapterFactory         | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                  | provider adapter 解決と auth handoff を確認する                        |
| buildMessages             | `apps/desktop/src/main/utils/buildMessages.ts`                             | message 正規化と model handoff を確認する                              |
| SettingsView              | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   | access capability / API key / RAG 表示の現状を確認する                 |
| AuthModeSelector          | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` | access capability 切替 UI の契約を確認する                             |
| AuthKeySection            | `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`   | Anthropic auth key 保存状態の UI 契約を確認する                        |
| ApiKeysSection            | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`  | provider ごとの API key 保存状態と表示契約を確認する                   |
| authKeyHandlers           | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                             | auth key 保存 / 削除 / validate IPC の authority を確認する            |
| apiKeyHandlers            | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                              | provider API key 保存 / 一覧 / 削除 IPC の authority を確認する        |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| interfaces-auth                                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                 | auth-mode 契約と error code の正本                              |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | `AI_CHAT` / `AI_CHECK_CONNECTION` / selected config の IPC 正本 |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | LLM / chat 契約と coverage 指針                                 |
| ui-ux-llm-selector                              | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                              | selector UI と TODO の正本                                      |
| ui-ux-system-prompt                             | `.claude/skills/aiworkflow-requirements/references/ui-ux-system-prompt.md`                             | prompt UI と template 契約の正本                                |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access capability / RAG 表示契約の正本                          |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | state handoff と store 契約の正本                               |
| security-electron-ipc                           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | settings / key 管理 IPC の sender / error envelope 正本         |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | selected config / auth key 同期の既存ルール                     |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Main Chat / Settings / Selector / System Prompt の runtime 同期 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

要件定義 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

selected config、access capability、system prompt、health / RAG 状態の接続要件を要件として明文化する。

## 成果物

| 成果物       | パス                                         | 内容                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | 要件、制約、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲を明記する   |

## 完了条件

- [ ] provider / model / prompt / auth key 保存状態 / health / RAG state の authority が列挙されている
- [ ] Main Chat / Settings 間の drift 箇所が後続設計へ割り当てられている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
