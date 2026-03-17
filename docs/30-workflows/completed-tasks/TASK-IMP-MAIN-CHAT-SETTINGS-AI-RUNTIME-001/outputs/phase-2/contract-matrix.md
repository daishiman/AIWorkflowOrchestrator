# Phase 2: 契約マトリクス - 成果物

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 2                                          |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | contract-matrix.md                         |
| 作成日   | 2026-03-17                                 |

---

## 0. 契約の正本優先順位

1. workflow 正本: `workflow-ai-runtime-authmode-unification.md`
2. child 契約: `api-ipc-system-core.md`, `llm-ipc-types.md`, `interfaces-system-prompt.md`, `interfaces-auth-history.md`
3. 境界チェック: `ipc-contract-checklist.md`, `security-electron-ipc-core.md`
4. Renderer/UI: `arch-state-management-core.md`, `ui-ux-settings-details.md`, `ui-ux-llm-selector.md`, `ui-ux-system-prompt.md`

---

## 1. IPC 契約（Main Process）

| 領域          | チャンネル（正本）                                                | 契約要点                                                               | 主な根拠仕様                                                                   | 解消対象        |
| ------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------- |
| Chat送信      | `AI_CHAT` (`ai:chat`)                                             | `message/systemPrompt/ragEnabled` + `providerId/modelId`（セット指定） | `api-ipc-system-core.md`, `llm-ipc-types.md`                                   | GAP-01/03       |
| 選択同期      | `llm:set-selected-config`                                         | Renderer の provider/model 選択を Main に同期                          | `api-ipc-system-core.md`, `llm-ipc-types.md`                                   | GAP-03          |
| Health        | `llm:check-health`                                                | health check の単一経路                                                | `llm-ipc-types.md`                                                             | GAP-02, DRIFT-4 |
| Legacy health | `AI_CHECK_CONNECTION`                                             | 互換残置の legacy。Task06 では新規利用禁止                             | `api-ipc-system-core.md`                                                       | DRIFT-4         |
| Auth mode     | `auth-mode:get/set/status/validate/changed`                       | transport DTO と event payload を統一                                  | `interfaces-auth-history.md`                                                   | DRIFT-1         |
| Auth key      | `auth-key:set/delete/exists/validate`                             | `exists.source = saved/env-fallback/not-set`                           | `api-ipc-system-core.md`, `workflow-apikey-chat-tool-integration-alignment.md` | GAP-06          |
| Provider key  | `apiKey:list/set/validate/delete`                                 | list 結果 shape と防御契約を固定                                       | `api-ipc-system-core.md`, `ui-ux-settings-details.md`                          | GAP-07, DRIFT-3 |
| System Prompt | `system-prompt:list/get/create/update/delete/migrate/get-presets` | prompt template CRUD を Main authority で管理                          | `interfaces-system-prompt.md`                                                  | Prompt同期      |

---

## 2. Preload 型/API 契約

| IPC契約                   | Preload 公開API                                                   | 型定義境界                                 | 契約チェック                   |
| ------------------------- | ----------------------------------------------------------------- | ------------------------------------------ | ------------------------------ |
| `ai:chat`                 | `window.electronAPI.ai.chat(request)`                             | `preload/types.ts` `AIChatRequest`         | P32（shared/preload同期）, P42 |
| `llm:set-selected-config` | `window.electronAPI.llm.setSelectedConfig({providerId, modelId})` | `preload/types.ts` llm API                 | P32, P44                       |
| `llm:check-health`        | `window.electronAPI.llm.checkHealth(providerId)`                  | `preload/types.ts` `HealthCheckResult`     | P32                            |
| `auth-mode:*`             | `window.electronAPI.authMode.*` / `onModeChanged`                 | `preload/types.ts` `AuthModeAPI`           | sender→P42順, P44              |
| `auth-key:*`              | `window.electronAPI.authKey.*`                                    | `preload/types.ts` `AuthKeyExistsResponse` | P42                            |
| `apiKey:*`                | `window.electronAPI.apiKey.*`                                     | `preload/types.ts` `ApiKeyListResponse`    | CC-7（配列shape防御）          |
| `system-prompt:*`         | `window.systemPromptAPI.*`                                        | `preload/types.ts` `SystemPromptAPI`       | P32, P44                       |

補足:

- `ipc-contract-checklist.md` の順序に従い、`Main handler → preload/index.ts → preload/types.ts → shared DTO` を同一ターンで更新する。
- `security-electron-ipc-core.md` に従い、公開境界は `safeInvoke/safeOn` に限定する。

---

## 3. Renderer 利用契約

| レイヤー         | 実装起点                                       | 利用契約                                         | 整合ポイント                                    |
| ---------------- | ---------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| Chat             | `store/slices/chatSlice.ts`                    | `ai.chat` に `providerId/modelId` を条件付き送信 | `llmSlice` 選択状態と同値で送信（GAP-01）       |
| Selector         | `store/slices/llmSlice.ts`                     | `setSelectedConfig` / `checkHealth` を呼び出し   | Main 選択状態と Renderer 選択を同期（GAP-03）   |
| Auth mode        | `store/slices/authModeSlice.ts`                | `authMode.get/set/status/validate/onModeChanged` | DTO語彙を UI 表示へそのまま投影（DRIFT-1）      |
| Settings/AuthKey | `components/settings/AuthKeySection`           | `authKey.exists().source` を優先表示             | saved/env-fallback/not-set の根拠表示（GAP-06） |
| Settings/ApiKeys | `components/organisms/ApiKeysSection`          | `apiKey.list()` 応答を shape 防御して描画        | malformed 要素を除外（GAP-07）                  |
| System Prompt    | `views/ChatView` + `systemPromptTemplateSlice` | `systemPromptAPI` と chat 送信を連携             | prompt は LLM切替と独立で保持                   |

---

## 4. UI 文言契約（最終段）

| 契約値                                                    | UI 表示語彙                                  | 表示箇所                      | 根拠仕様                                      |
| --------------------------------------------------------- | -------------------------------------------- | ----------------------------- | --------------------------------------------- |
| capability: `integratedRuntime/terminalSurface/both/none` | `ready/blocked/unavailable` へマッピング     | Settings Access Capability    | `workflow-ai-runtime-authmode-unification.md` |
| auth mode status DTO                                      | `message/errorCode/guidance`                 | `SettingsView` 認証方式カード | `interfaces-auth-history.md`                  |
| auth-key source                                           | `保存済み` / `環境変数で設定済み` / `未設定` | `AuthKeySection` バッジ       | `ui-ux-settings-details.md`                   |
| provider/model drift                                      | モデル再選択ガイダンス                       | Selector + Settings           | `ui-ux-llm-selector.md`                       |
| system prompt                                             | テンプレート管理と入力保持                   | ChatView prompt panel         | `ui-ux-system-prompt.md`                      |

---

## 5. GAP/DRIFT トレーサビリティ（依存順）

| ID        | IPC                                | Preload型                  | Renderer利用                   | UI文言                             |
| --------- | ---------------------------------- | -------------------------- | ------------------------------ | ---------------------------------- |
| GAP-01    | `AI_CHAT` payload 明確化           | `AIChatRequest` 同期       | chatSlice の型キャスト依存排除 | selectorと送信結果の一貫表示       |
| GAP-02    | `llm:check-health` を正本化        | `llm.checkHealth` へ集約   | HealthIndicator 呼び出し統一   | health警告文言の一貫化             |
| GAP-03    | `llm:set-selected-config` 契約固定 | setSelectedConfig 署名固定 | llmSlice から Main 同期        | model drift 表示統一               |
| GAP-04    | RAG authority 再定義               | （型追加時はP32順守）      | state配置の再整理              | Settings状態の説明整合             |
| GAP-05    | apiKey更新後 cache clear 契約      | API応答型維持              | provider切替後の初回実行整合   | 「保存済みなのに失敗」の抑止       |
| GAP-06    | `auth-key:exists.source` 契約明示  | AuthKeyExistsResponse 同期 | AuthKeySection source 優先判定 | バッジ文言の根拠一致               |
| GAP-07    | `apiKey:list` shape 契約固定       | ApiKeyListResponse 同期    | ApiKeysSection normalize 維持  | 異常時フォールバック文言           |
| DRIFT-1   | `auth-mode:*` DTO統一              | AuthModeAPI/event 同期     | authModeSlice 表示直接利用     | `ready/blocked/unavailable` へ統一 |
| DRIFT-2/3 | access card と key状態契約接続     | preloaded API境界維持      | Settings 各Sectionの連動       | 上位カードと行状態の矛盾解消       |
| DRIFT-4   | `AI_CHECK_CONNECTION` legacy 化    | health APIを `llm` に統一  | 呼び出し元の一本化             | health 表示の二重語彙解消          |

---

## 6. 矛盾解消ルール

1. Health 経路は `llm:check-health` を正本とし、`AI_CHECK_CONNECTION` は互換参照のみ扱う。
2. チャンネル名は IPC 実体（`auth-mode:*`, `system-prompt:*`, `apiKey:*`）を正とし、Renderer API 名（`authMode.*` など）は別名として併記する。
3. 親仕様は入口、契約更新の実体は child companion に限定して差分を記録する。
