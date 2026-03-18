# Phase 12: システム仕様同期計画

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 12                                         |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | system-spec-sync-plan.md                   |
| 作成日   | 2026-03-17                                 |

---

## 1. 抽出手順（Progressive Disclosure）

| 手順 | 起点                         | 実施内容                                                          | 抽出結果                                                        |
| ---- | ---------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| 1    | `indexes/resource-map.md`    | `設計同期（AI runtime/auth-mode unification）` の初期セットを特定 | workflow / auth / IPC / settings / legacy register を初期候補化 |
| 2    | `indexes/quick-reference.md` | IPC・型・ディレクトリ境界を確認                                   | IPC契約の確認導線を `ipc-contract-checklist.md` へ絞り込み      |
| 3    | `indexes/topic-map.md`       | 親仕様→child companion の実体セクションを特定                     | `api-ipc-system-core.md` など実契約を持つ child を確定          |
| 4    | `references/*`               | Task06実装と直接関係する仕様のみ精査                              | IPC / Preload / Renderer / UI 文言の4段で最小セットを確定       |

---

## 2. 実在確認済み・必要仕様セット（最小）

| No  | 依存段       | 仕様書パス                                                                                             | 実在 | なぜ必要か（解消対象）                                                                                             |
| --- | ------------ | ------------------------------------------------------------------------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Foundation   | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`        | ✅   | capability値と UI語彙（`ready/blocked/unavailable`）の正本（DRIFT-1/2/3）                                          |
| 2   | Foundation   | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | ✅   | `providerId/modelId` 同期・`auth-key:exists.source`・cache clear の既存整合（GAP-01/03/05/06）                     |
| 3   | IPC          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | ✅   | IPC親仕様の入口（child選択）                                                                                       |
| 4   | IPC          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                             | ✅   | `AI_CHAT` / `AI_CHECK_CONNECTION` / `llm:set-selected-config` / `auth-key:exists` 契約（GAP-01/02/03/06, DRIFT-4） |
| 5   | IPC          | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                   | ✅   | `providerId/modelId` セット指定・`llm:check-health`・選択同期の型契約（GAP-01/03, DRIFT-4）                        |
| 6   | IPC          | `.claude/skills/aiworkflow-requirements/references/interfaces-system-prompt.md`                        | ✅   | `system-prompt:*` のチャネル契約とエラー体系（System Prompt同期）                                                  |
| 7   | IPC          | `.claude/skills/aiworkflow-requirements/references/interfaces-auth-history.md`                         | ✅   | `auth-mode:*` transport DTO / event payload の現行契約（DRIFT-1）                                                  |
| 8   | IPC→Preload  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                          | ✅   | P32/P42/P44 に基づく「Main→Preload→Renderer」同時更新チェック（GAP系全般）                                         |
| 9   | Preload境界  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | ✅   | セキュリティ親仕様の入口（child選択）                                                                              |
| 10  | Preload境界  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                      | ✅   | `safeInvoke/safeOn` と preload公開境界、sender検証順（GAP-02/06, DRIFT-4）                                         |
| 11  | Renderer状態 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | ✅   | 状態管理親仕様の入口（child選択）                                                                                  |
| 12  | Renderer状態 | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                      | ✅   | `llmSlice` の provider/model selector再利用契約（GAP-01/03）                                                       |
| 13  | UI表示       | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | ✅   | Settings親仕様の入口（child選択）                                                                                  |
| 14  | UI表示       | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings-details.md`                          | ✅   | `ApiKeysSection` 防御・`AuthKeySection` 表示契約（GAP-06/07, DRIFT-2/3）                                           |
| 15  | UI表示       | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                              | ✅   | provider/model selector UI 契約（GAP-01/03）                                                                       |
| 16  | UI表示       | `.claude/skills/aiworkflow-requirements/references/ui-ux-system-prompt.md`                             | ✅   | promptパネルとテンプレートUI契約（System Prompt同期）                                                              |
| 17  | Drift補助    | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`                  | ✅   | 旧命名→現行命名の逆引き（パスドリフト防止）                                                                        |

---

## 3. GAP/DRIFT トレーサビリティ（何を更新し、なぜ必要か）

| ID               | 更新対象仕様（優先）                                                                   | 更新内容                                                                 | なぜ必要か                                                |
| ---------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| GAP-01           | `llm-ipc-types.md`, `api-ipc-system-core.md`                                           | `AI_CHAT` の `providerId/modelId` 契約を実装同期                         | Renderer型キャスト依存を除去し、送信契約を固定するため    |
| GAP-02 / DRIFT-4 | `api-ipc-system-core.md`, `llm-ipc-types.md`, `security-electron-ipc-core.md`          | `AI_CHECK_CONNECTION` を legacy 扱いにし `llm:check-health` を単一路線化 | health二重経路で UI 表示が割れるドリフトを止めるため      |
| GAP-03           | `llm-ipc-types.md`, `workflow-apikey-chat-tool-integration-alignment.md`               | `llm:set-selected-config` を前提とした選択同期を明文化                   | DEFAULT_CONFIG 暗黙fallbackによる誤ルーティングを防ぐため |
| GAP-04           | `arch-state-management-core.md`, `workflow-ai-runtime-authmode-unification.md`         | RAG状態の authority を Main/Renderer 境界で再定義                        | Settings ローカル状態のみで判定が閉じる欠陥を解消するため |
| GAP-05           | `workflow-apikey-chat-tool-integration-alignment.md`                                   | `apiKey:set/delete` 後の adapter cache clear 契約を再同期                | 保存済みキーと実行時 adapter の乖離を防ぐため             |
| GAP-06           | `api-ipc-system-core.md`, `ui-ux-settings-details.md`, `security-electron-ipc-core.md` | `auth-key:exists.source` を UI と同語彙で扱う                            | saved/env-fallback/not-set の表示根拠を欠落させないため   |
| GAP-07           | `ui-ux-settings-details.md`, `ipc-contract-checklist.md`                               | API key 検証呼び出しの防御方針を UI 契約へ固定                           | 過剰呼び出し時の UX 低下と契約逸脱を防ぐため              |
| DRIFT-1          | `workflow-ai-runtime-authmode-unification.md`, `interfaces-auth-history.md`            | `isValid` 中心の語彙から `ready/blocked/unavailable` へ統一              | Main Chat / Settings の状態表示を同一語彙に統合するため   |
| DRIFT-2/3        | `ui-ux-settings-details.md`, `workflow-ai-runtime-authmode-unification.md`             | AuthKey/Provider行と上位カードの連動規約を同期                           | 画面内で状態矛盾が発生する表示ドリフトを防ぐため          |

---

## 4. 依存関係整合チェック（IPC→Preload型→Renderer利用→UI文言）

| 順序 | 契約境界      | 参照仕様                                                                                                        | 判定                                                                      |
| ---- | ------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1    | IPC契約       | `api-ipc-system-core.md`, `llm-ipc-types.md`, `interfaces-system-prompt.md`, `interfaces-auth-history.md`       | ✅ 必須チャネルと payload を特定                                          |
| 2    | Preload型/API | `ipc-contract-checklist.md`, `security-electron-ipc-core.md`                                                    | ✅ `channels.ts` / `preload/types.ts` / `safeInvoke` の同時更新要件を確認 |
| 3    | Renderer利用  | `arch-state-management-core.md`, `ui-ux-settings-details.md`, `ui-ux-llm-selector.md`, `ui-ux-system-prompt.md` | ✅ store selector・Settings表示・prompt/selector利用箇所を接続            |
| 4    | UI文言        | `workflow-ai-runtime-authmode-unification.md`, `ui-ux-settings-details.md`                                      | ✅ `ready/blocked/unavailable` と `source` 表示語彙を統一                 |

---

## 5. 抽出除外（今回の直接スコープ外）

| 仕様                                      | 除外理由                                                              |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `ui-ux-feature-components*.md`            | Workspace系（04A/04B/04C）中心で Task06 直接責務外                    |
| `task-workflow.md`, `lessons-learned*.md` | 台帳/教訓用途。契約実装の直接根拠ではないため今回の最小セットから除外 |

---

## 6. 参照漏れ防止メモ

- 親仕様（`api-ipc-system.md`, `ui-ux-settings.md`, `arch-state-management.md`, `security-electron-ipc.md`, `interfaces-auth.md`）は入口として参照し、実契約は child companion で確定する。
- `AI_CHECK_CONNECTION` と `llm:check-health` が併存するため、Task06では `llm:check-health` を正とする優先順位を明示して更新する。
- `legacy-ordinal-family-register.md` を併読し、旧ファイル名引用による path drift を防止する。
