# Phase 1 要件定義: AI Runtime / AuthMode 基盤統一

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001                          |
| Phase      | 1 - 要件定義                                                          |
| 作成日     | 2026-03-13                                                            |
| ステータス | completed                                                             |
| 対象機能   | 全 AI surface の access capability matrix / legacy authMode migration |

---

## 1. 目的

全 AI surface の entrypoint を `Integrated API Runtime`（アプリ統合 AI）と `Claude Code Terminal Surface`（ユーザー操作ターミナル）の 2 capability に正規化し、legacy `authMode`（`subscription` / `api-key` の排他的 toggle）を廃止可能な形で移行するための要件を定義する。

本フェーズでは以下を明文化する:

1. 全 surface の現状 access 経路と目標 capability の完全な inventory
2. Capability 5 区分の厳密な定義
3. State / Cache の差分と不足契約
4. Security / Permission の差分と不足契約
5. 受入基準と制約事項

---

## 2. Surface Inventory（Access Capability Matrix 完全版）

### 2.1 Main Process Surface

| #   | Surface                          | 現状 access                                                                        | 現状 capability                                            | 目標 capability                    | Gap 概要                                                                                                               |
| --- | -------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| M1  | AuthModeService                  | `subscription` / `api-key` 排他的 toggle、electron-store 永続化、listener 変更通知 | stub/todo（subscription 側）、integrated-api（api-key 側） | legacy migration layer             | `StubSubscriptionAuthProvider` が常に `null`/`false`。subscription 側に実体なし。toggle 自体が capability 概念と不整合 |
| M2  | LLMAdapterFactory                | `SecureStorage.getApiKey(providerId)` で API key 直接取得、シングルトンキャッシュ  | integrated-api                                             | integrated-api                     | AuthMode 未参照。API key 不足時は adapter 側で throw。gap 小                                                           |
| M3  | aiHandlers - AI_CHAT             | `getSelectedLLMConfig()` で provider/model を fallback 解決 → LLMAdapterFactory    | integrated-api                                             | integrated-api + terminal-launcher | AuthMode 未参照。selected config 解決が handler 内完結。terminal fallback 導線なし                                     |
| M4  | aiHandlers - AI_CHECK_CONNECTION | TODO stub（ハードコード値返却）                                                    | stub/todo                                                  | integrated-api                     | 完全に stub。health check 実装が必要                                                                                   |
| M5  | aiHandlers - AI_INDEX            | TODO stub（simulate indexing）                                                     | stub/todo                                                  | integrated-api + guidance          | 完全に stub。RAG indexing pipeline 接続が必要                                                                          |
| M6  | SkillExecutor                    | `AuthKeyService` DI + 環境変数フォールバック、Claude Agent SDK `query()`           | integrated-api（Anthropic 限定）                           | integrated-api + terminal-handoff  | Anthropic API key 必須。terminal handoff 未定義。provider 固定                                                         |
| M7  | AgentExecutor                    | Claude Agent SDK `query()` 直接呼び出し、`@ts-expect-error` あり                   | integrated-api（Anthropic 限定）                           | integrated-api + terminal-handoff  | SDK 型不整合。terminal handoff 未定義。provider 固定                                                                   |
| M8  | chatEditHandlers                 | ファイル読み書き + LLM 連携ハンドラ                                                | stub/todo                                                  | integrated-api + terminal-handoff  | runtime 入口不明確。stub の可能性大                                                                                    |
| M9  | SkillDocGenerator                | `LLMQueryFn` を Constructor Injection で受け取り                                   | integrated-api（LLM query DI 経由）                        | integrated-api + terminal-handoff  | stubQueryFn 残存の可能性。DI 経由のため gap 小                                                                         |
| M10 | Claude CLI IPC Handler           | `ClaudeCliManager` 経由で CLI 操作、sender 検証あり                                | terminal-only（CLI automation）                            | terminal-only                      | 現状 automation。manual terminal（user-operated）未整備                                                                |
| M11 | slide skill-executor             | slide skill-executor + agent-client                                                | integrated-api                                             | integrated-api + terminal-guidance | direct SDK 残存                                                                                                        |
| M12 | slide agent-client               | legacy slide agent client の direct SDK 経路                                       | integrated-api                                             | integrated-api + terminal-guidance | direct SDK 残存。legacy 経路                                                                                           |

### 2.2 Renderer Surface

| #   | Surface                     | 現状 access                                               | 現状 capability             | 目標 capability                       | Gap 概要                                                                          |
| --- | --------------------------- | --------------------------------------------------------- | --------------------------- | ------------------------------------- | --------------------------------------------------------------------------------- |
| R1  | skillExecutionAuthPreflight | `window.electronAPI.authKey.exists()` で API key 存在確認 | integrated-api の preflight | integrated-api の preflight           | API 未提供環境では互換性のためスキップ。gap 小                                    |
| R2  | authModeSlice               | legacy `authMode` state 管理、IPC 経由 changed event 受信 | legacy state 管理           | capability-based state へ移行         | `@deprecated` 合成 Hook あり。個別セレクタ移行済みだが authMode 概念自体が legacy |
| R3  | ChatView / LLM Selector     | provider/model 選択 UI                                    | integrated-api 補助         | integrated-api 補助 + capability 連動 | access capability との連動なし                                                    |
| R4  | System Prompt Panel         | prompt 編集 UI                                            | integrated-api 補助         | integrated-api 補助                   | 独立。gap なし                                                                    |
| R5  | WorkspaceChatPanel          | stream + file context                                     | integrated-api              | integrated-api + terminal-handoff     | streaming と terminal launcher の両立が未整備                                     |
| R6  | ChatPanel                   | placeholder 導線                                          | stub/todo                   | integrated-api + terminal-handoff     | placeholder のまま未接続                                                          |
| R7  | Agent SDK UI / Hook         | AgentSDKPage + useAgent                                   | integrated-api              | integrated-api                        | SDK 直接呼び出し。gap 小                                                          |
| R8  | Settings / Access Card      | AuthModeSelector                                          | legacy toggle               | dual capability 管理                  | 排他的 toggle が前提のまま。capability card 未実装                                |
| R9  | SlideWorkspace              | slide renderer surface と reverse-sync 導線               | integrated-api              | integrated-api + terminal-guidance    | direct SDK 残存                                                                   |

### 2.3 Backend / Pipeline Surface

| #   | Surface           | 現状 access         | 現状 capability | 目標 capability           | Gap 概要  |
| --- | ----------------- | ------------------- | --------------- | ------------------------- | --------- |
| B1  | RAG / AI_INDEX    | aiHandlers AI_INDEX | stub/todo       | integrated-api + guidance | TODO stub |
| B2  | Embedding         | 未確認              | stub/todo       | integrated-api + guidance | TODO/mock |
| B3  | Entity Extraction | 未確認              | stub/todo       | integrated-api + guidance | TODO/mock |
| B4  | Graph Summary     | 未確認              | stub/todo       | integrated-api + guidance | TODO/mock |
| B5  | CRAG              | 未確認              | stub/todo       | integrated-api + guidance | TODO/mock |
| B6  | Reranking         | 未確認              | stub/todo       | integrated-api + guidance | TODO/mock |

---

## 3. Capability 分類定義（5 区分）

| 区分                 | 定義                                                                                                                       | 実行責任                | API key 要否                 | ユーザー操作     | 代表 surface                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------- | ---------------- | ---------------------------------------------------------- |
| **integrated-api**   | アプリがユーザー設定の API key を使い、Main Process 内で LLM を呼び出す                                                    | アプリ（Main Process）  | 必須                         | 不要（自動実行） | AI_CHAT, SkillExecutor, LLMAdapterFactory                  |
| **terminal-handoff** | アプリが Claude Code terminal を起動し、ユーザーが手動で操作する。アプリは context / prompt を渡すが、送信はユーザーが行う | ユーザー（terminal 内） | 不要（Claude Code 側の認証） | 必須（手動送信） | Skill 実行の fallback, Workspace Chat の terminal launcher |
| **terminal-only**    | terminal surface のみで動作し、アプリは起動・表示・transcript 取得のみ                                                     | ユーザー（terminal 内） | 不要                         | 必須             | Claude CLI IPC Handler                                     |
| **guidance-only**    | アプリ内で AI 実行せず、ユーザーに手動操作の案内のみ表示する                                                               | ユーザー（アプリ外）    | 不要                         | 必須（外部操作） | RAG pipeline の API key 未設定時                           |
| **stub/todo**        | 未実装または TODO stub。実体のある処理が存在しない                                                                         | なし                    | -                            | -                | AI_CHECK_CONNECTION, AI_INDEX, Embedding                   |

---

## 4. State / Cache 差分

### 4.1 現状の State 構造

| State                 | 所在                                              | 現状                                  | 目標                                                                            | 差分                                     |
| --------------------- | ------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------- |
| `authMode`            | AuthModeService (Main) + authModeSlice (Renderer) | `subscription` / `api-key` の排他的値 | `accessCapability` に置換（`integrated-api` / `terminal-enabled` の独立フラグ） | toggle 概念の廃止。migration path が必要 |
| `selectedLLMConfig`   | aiHandlers 内で `getSelectedLLMConfig()`          | provider/model の fallback 解決       | 変更なし（integrated-api surface のみ参照）                                     | gap なし                                 |
| LLM adapter cache     | LLMAdapterFactory シングルトンキャッシュ          | `clearInstance()` で invalidation     | API key 変更時の自動 invalidation                                               | 変更通知 → cache clear の連動が未整備    |
| `changed` event       | AuthModeService → authModeSlice                   | `authMode` 変更時に IPC 通知          | capability 変更時の通知に拡張                                                   | event payload の再設計が必要             |
| terminal availability | なし                                              | 未実装                                | Claude Code CLI の存在・バージョン確認結果を保持                                | 新規 state。起動時チェック + キャッシュ  |
| API key 存在フラグ    | SecureStorage + skillExecutionAuthPreflight       | provider ごとの key 存在確認          | 変更なし                                                                        | gap なし                                 |

### 4.2 Cache Invalidation 契約の不足

| 契約                                      | 現状                               | 必要な対応                                                                               |
| ----------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| API key 追加/削除時の adapter cache clear | `clearInstance()` は手動呼び出し   | API key 変更 event → LLMAdapterFactory.clearInstance() の自動連動                        |
| authMode 変更時の Renderer state 同期     | `changed` event で同期             | capability 変更 event への payload 拡張                                                  |
| terminal availability の定期更新          | 未実装                             | 起動時 + Settings 画面表示時にチェック。結果をキャッシュし、手動リフレッシュボタンを提供 |
| selected config 変更時の再起動要否        | 再起動不要（adapter は lazy 生成） | 変更なし                                                                                 |

---

## 5. Security / Permission 差分

### 5.1 Sender 検証

| 経路                                                  | 現状                        | 差分                     |
| ----------------------------------------------------- | --------------------------- | ------------------------ |
| Claude CLI IPC Handler                                | sender 検証あり             | gap なし                 |
| aiHandlers (AI_CHAT / AI_CHECK_CONNECTION / AI_INDEX) | sender 検証なし（調査必要） | sender 検証の追加が必要  |
| SkillExecutor / AgentExecutor                         | Main Process 内完結         | IPC 経由でない場合は不要 |
| chatEditHandlers                                      | sender 検証の有無が不明     | 調査 → 必要に応じて追加  |

### 5.2 Error Envelope

| 経路              | 現状                                         | 差分                                                                        |
| ----------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| LLMAdapterFactory | API key 不足時に adapter 側で throw          | エラーに capability 情報を含める（`integrated-api` が利用不可の理由を明示） |
| SkillExecutor     | AuthKeyService 経由で key 取得失敗時の error | terminal-handoff への導線を error envelope に含める                         |
| aiHandlers        | stub は固定値を返す                          | stub 実装に capability-unavailable エラーを返す仕組みが必要                 |

### 5.3 No Auto-Send 境界

| 境界                                          | 定義                                                   | 現状の遵守状況                                                                                             |
| --------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| terminal surface でのユーザー入力のみ送信     | アプリが `claude` へ自動送信しない                     | `claude-cli:execute-script` が自動送信を行っている。consumer subscription 用本線としては使わない制約を追加 |
| copy command / copy context / open cwd は許可 | context 提供は自動、送信は手動                         | 未実装（terminal handoff 自体が未整備）                                                                    |
| auto retry 禁止                               | terminal surface でのリトライはユーザー操作            | 未実装（terminal handoff 自体が未整備）                                                                    |
| hidden prompt injection 禁止                  | ユーザーが確認できない prompt を terminal に挿入しない | 未実装（terminal handoff 自体が未整備）                                                                    |

### 5.4 権限確認フロー

| Surface         | 必要な権限確認                         | 現状                                   | 差分                                        |
| --------------- | -------------------------------------- | -------------------------------------- | ------------------------------------------- |
| Skill Execution | API key 存在 + provider 一致           | skillExecutionAuthPreflight で部分実装 | capability check への拡張が必要             |
| Agent Execution | API key 存在（Anthropic 固定）         | PermissionResolver で部分実装          | provider 固定の解除 + capability check 追加 |
| Terminal Launch | Claude Code CLI 存在 + PATH 解決       | 未実装                                 | terminal availability check の新規追加      |
| RAG Pipeline    | API key 存在 + embedding provider 設定 | 未実装（stub）                         | guidance-only 時の案内 UI が必要            |

---

## 6. 受入基準

### 6.1 Surface Inventory の完全性

- [ ] Main Process surface が M1-M12 の 12 項目を網羅している
- [ ] Renderer surface が R1-R9 の 9 項目を網羅している
- [ ] Backend / Pipeline surface が B1-B6 の 6 項目を網羅している
- [ ] 各 surface に `integrated-api` / `terminal-handoff` / `terminal-only` / `guidance-only` / `stub/todo` の割り当てがある

### 6.2 Capability 分類の明確性

- [ ] 5 区分の定義に曖昧表現（「適切に」「必要に応じて」）が含まれていない
- [ ] 各区分の実行責任・API key 要否・ユーザー操作要否が明示されている
- [ ] 代表 surface が挙げられている

### 6.3 State / Cache 差分

- [ ] selected config / adapter cache / changed event / terminal availability の現状差分が列挙されている
- [ ] cache invalidation の連動契約が定義されている
- [ ] 新規 state（terminal availability）の取得・保持・更新タイミングが定義されている

### 6.4 Security / Permission 差分

- [ ] sender 検証の有無が全 IPC 経路で列挙されている
- [ ] error envelope に capability 情報を含める方針が定義されている
- [ ] `no auto-send` 境界の4項目（auto-send 禁止、copy 許可、auto retry 禁止、hidden injection 禁止）が定義されている
- [ ] 権限確認フローの差分が surface ごとに列挙されている

---

## 7. 制約事項

| #   | 制約                                                                                                   | 理由                                                     |
| --- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| C1  | consumer subscription token をアプリが取得・保存・再利用・中継しない                                   | terminal surface の実行責任をユーザーに帰属させるため    |
| C2  | integrated runtime 失敗時に terminal へ自動切り替えしない（silent fallback 禁止）                      | 実行責任と課金証跡を曖昧にしないため                     |
| C3  | `claude-cli:execute-script` の現行自動化 lane は consumer subscription 用の本線として使用しない        | auto-send 境界に違反するため                             |
| C4  | backend AI job（RAG / Embedding 等）は terminal へ逃がさず、API runtime または明示 guidance に分離する | バッチ処理の実行責任をユーザーに転嫁しないため           |
| C5  | Main Process が capability / guidance を返し、Renderer ごとの差分判定を行わない                        | UI authority の一元管理のため                            |
| C6  | legacy `authMode` の値域（`subscription` / `api-key`）を即時削除しない。migration path を経由する      | 既存ユーザー設定の破壊を防ぐため                         |
| C7  | 本タスク（Task01）では実装を行わない。要件・設計・テスト仕様の確定のみ                                 | 後続タスク（Task02-10）への正確な handoff を担保するため |
