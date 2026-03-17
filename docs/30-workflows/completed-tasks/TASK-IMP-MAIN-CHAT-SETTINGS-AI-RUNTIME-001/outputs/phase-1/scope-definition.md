# Phase 1: スコープ定義 - 成果物

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 1                                          |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | scope-definition.md                        |
| 作成日   | 2026-03-17                                 |

---

## 1. 対象範囲

### 1.1 対象 Surface

| Surface              | 対象範囲                                                                  |
| -------------------- | ------------------------------------------------------------------------- |
| Main Chat (ChatView) | AI_CHAT 送信経路、selected config handoff、streaming、provider/model 選択 |
| Settings             | access capability card、authMode selector、API key 管理、health 表示      |
| LLM Selector         | provider/model 選択、health indicator、Main 同期                          |
| System Prompt        | テンプレート CRUD、current prompt handoff、Main authority                 |

### 1.2 対象レイヤー

| レイヤー | 対象ファイル群                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------- |
| Renderer | ChatView, LLMSelectorPanel, SettingsView, AuthModeSelector, AuthKeySection, ApiKeysSection         |
| Store    | chatSlice, llmSlice, authModeSlice, systemPromptTemplateSlice                                      |
| Main IPC | aiHandlers, llm handlers, llmConfigProvider, systemPromptHandlers, authKeyHandlers, apiKeyHandlers |
| Adapter  | LLMAdapterFactory, buildMessages                                                                   |

### 1.3 対象 IPC チャンネル

| チャンネル                          | 対象操作                |
| ----------------------------------- | ----------------------- |
| AI_CHAT                             | メッセージ送信          |
| AI_CHECK_CONNECTION                 | 接続確認（ダミー実装）  |
| llm:set-selected-config             | provider/model 設定同期 |
| llm:check-health                    | health check            |
| llm:get-providers                   | provider 一覧取得       |
| llm:stream-chat                     | streaming chat          |
| authMode.get/set/status/validate    | 認証方式管理            |
| auth-key:set/delete/exists/validate | Anthropic APIキー管理   |
| api-key:list/set/validate/delete    | Provider APIキー管理    |
| systemPrompt:\*                     | テンプレート CRUD       |

---

## 2. 除外範囲

### 2.1 明示的除外

| 除外項目                                                                        | 理由                                                          |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Terminal Surface の実装                                                         | Task02 の責務。本タスクは terminal launcher の導線のみ        |
| Workspace Chat Edit                                                             | Task03 の責務                                                 |
| Skill / Agent / Creator                                                         | Task04 の責務                                                 |
| Skill Docs                                                                      | Task05 の責務                                                 |
| ChatPanel（単発チャット）                                                       | Task07 の責務                                                 |
| Workspace Chat Panel                                                            | Task08 の責務                                                 |
| RAG / Embedding / Extraction                                                    | Task09 の責務                                                 |
| Access Matrix Foundation                                                        | Task01 の責務。本タスクは Task01 が定義した matrix を消費する |
| consumer subscription token 取得                                                | 親パック制約。アプリが取得・保存しない                        |
| terminal 自動コマンド送信                                                       | 親パック制約。ユーザー操作に限定                              |
| Conversation IPC 7チャンネル（list/get/create/update/delete/addMessage/search） | Task08 の責務。api-ipc-system-core.md L150-177 参照           |

### 2.2 境界条件

| 境界                                  | 本タスクの責務                                | 他タスクの責務                        |
| ------------------------------------- | --------------------------------------------- | ------------------------------------- |
| access matrix の定義                  | matrix を消費して UI に反映する               | Task01 が matrix を定義する           |
| terminal launcher の配置              | Settings header に terminal ボタンを置く      | Task02 が terminal dock を実装する    |
| capability card の共通 UI パターン    | Settings / Main Chat で共通パターンを消費する | 親パック ui-ux-realization が定義する |
| Provider APIキー変更時の Adapter 更新 | 変更時の clearInstance 経路を設計する         | LLMAdapterFactory の実装は既存        |

---

## 3. 設計方針（Phase 2 への引き継ぎ）

### 3.1 Authority 方針

| 原則                                         | 適用                                         |
| -------------------------------------------- | -------------------------------------------- |
| Renderer = source of intent                  | ユーザーの選択意図を収集する                 |
| Main = source of truth                       | runtime 判定、config 保持、fail-fast を行う  |
| access capability と provider/model は別責務 | authMode と selected config を別軸で管理する |
| local 判定禁止                               | surface ごとの独自 mode 判定を持たない       |
| silent fallback 禁止                         | 見かけ成功を許容しない                       |

### 3.2 UI/UX 方針（ui-ux-realization.md 準拠）

| UI 要素                      | Task06 での適用                                 |
| ---------------------------- | ----------------------------------------------- |
| Access Capability Card       | Settings で integrated API の利用可否を表示する |
| Runtime Banner               | Main Chat で実行経路を示す                      |
| Guidance Block               | API key 不足時の説明と次アクションを示す        |
| Persistent Terminal Launcher | Settings header に Terminal ボタンを常設する    |
| Health Row                   | Settings に health / RAG 状態を表示する         |

### 3.3 設定画面改善要求（2026-03-13 レビュー反映）

| 改善領域                           | 受入条件                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| 認証方式カード                     | トグル変更時にカード表示が遅延なく更新され、状態語彙 `ready/blocked/unavailable` に統一される |
| Claude Agent SDK APIキーセクション | 保存成功/失敗と次アクションが同一ブロックで表示され、上位カードと矛盾しない                   |
| APIキー設定一覧（Provider rows）   | 欠落キーが一目で特定でき、上位カードが ready の時に未登録 Provider が残らない                 |

---

## 4. 前提条件

| 前提                                               | 依存先   |
| -------------------------------------------------- | -------- |
| Task01 が access matrix を定義済みであること       | Task01   |
| 親パック ui-ux-realization.md が確定していること   | 親パック |
| 親パック design-audit-matrix.md が確定していること | 親パック |
| P31/P48 対策が Zustand Store に適用済みであること  | 既存実装 |
| P5 リスナー二重登録対策が適用済みであること        | 既存実装 |

---

## 5. 成功指標

| 指標                                                                   | 測定方法                                  |
| ---------------------------------------------------------------------- | ----------------------------------------- |
| Main Chat と Settings 間で provider/model 選択が矛盾しない             | selected config の同期テスト              |
| access capability card が authMode toggle と同期更新される             | UI 状態遷移テスト                         |
| API key 保存/削除後に capability card と Provider 一覧が一致更新される | IPC 経路の end-to-end テスト              |
| health 表示が単一経路（llm:check-health）に統一される                  | AI_CHECK_CONNECTION ダミー廃止の設計      |
| Settings header から terminal dock を即座に開ける                      | Persistent Terminal Launcher の導線テスト |
