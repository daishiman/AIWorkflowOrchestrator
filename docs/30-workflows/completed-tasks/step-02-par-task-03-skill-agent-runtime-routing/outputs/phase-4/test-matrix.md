# Phase 4 テストマトリクス

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001         |
| Phase      | 4                                                |
| 成果物種別 | テストマトリクス                                 |
| 作成日     | 2026-03-14                                       |
| ステータス | completed                                        |
| 前提       | Phase 2 設計サマリー / Phase 3 設計レビュー PASS |
| 後続       | Phase 5 実装計画                                 |

---

## テストカテゴリ概要

| カテゴリ | 目的                                                                    | テスト数 |
| -------- | ----------------------------------------------------------------------- | -------- |
| C1       | 実行系テスト（成功系） - integrated_api / terminal_handoff ルーティング | 5        |
| C2       | permission / trust テスト - ダイアログ / remember / abort / streaming   | 4        |
| C3       | リトライ / ストリーミングテスト - backoff / IPC 伝達                    | 2        |
| C4       | SkillCreatorService テスト - Planner / Executor / Improver 連鎖         | 3        |
| C5       | preflight テスト - auth-mode 分岐                                       | 1        |
| C6       | 回帰系テスト - permission 永続化 / 実行状態遷移                         | 2        |
| **合計** |                                                                         | **17**   |

---

## C1: 実行系テスト（成功系）

RuntimePolicyResolver の resolve() 結果に応じた SkillExecutor / AgentExecutor のルーティングを検証する。

| TC-ID   | 対象                                  | テスト内容                                                                       | 期待結果                                                                                                                             | 優先度 |
| ------- | ------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| TC-4-01 | SkillExecutor / RuntimePolicyResolver | `integrated_api` モードで API key あり → SkillExecutor が SDK query() を実行する | `RuntimeDecision.type === "integrated_api"` となり、SDK の `query()` が呼ばれる                                                      | P0     |
| TC-4-02 | SkillExecutor / RuntimePolicyResolver | `integrated_api` モードで API key なし → AUTHENTICATION_ERROR が返る             | `execute()` の戻り値が `{ success: false, error: { code: "AUTHENTICATION_ERROR" } }`                                                 | P0     |
| TC-4-03 | SkillExecutor / RuntimePolicyResolver | `claude_code` モード → エラーではなく terminal handoff bundle が返る             | `RuntimeDecision.type === "terminal_handoff"` で `TerminalHandoffBundle` が結果に含まれる                                            | P0     |
| TC-4-04 | RuntimePolicyResolver                 | `resolve(authMode, apiKey)` が auth-mode に応じた正しい `RuntimeDecision` を返す | `authMode = "integrated_api"` かつ `apiKey` 存在 → `type: "integrated_api"`, `authMode = "claude_code"` → `type: "terminal_handoff"` | P0     |
| TC-4-05 | AgentExecutor / RuntimePolicyResolver | `integrated_api` モードで API key あり → AgentExecutor が SDK query() を起動する | `start()` 内で SDK `query()` が呼ばれ、ストリーミングが開始される                                                                    | P0     |

---

## C2: permission / trust テスト

ツール許可ダイアログ、記憶、abort によるストリーミング中断を検証する。permission / streaming の authority が変質していないことを確認する。

| TC-ID    | 対象                               | テスト内容                                                                  | 期待結果                                                                                                        | 優先度 |
| -------- | ---------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------ |
| TC-4-05b | SkillExecutor / PermissionResolver | permission dialog が表示され、許可/拒否が正しく動く                         | `sendPermissionRequest()` が IPC 経由でダイアログを送信し、`handlePermissionResponse()` で Promise が解決される | P0     |
| TC-4-06  | SkillExecutor / PermissionStore    | `rememberChoice=true` でツール許可が PermissionStore に永続化される         | `permissionStore.allowTool(toolName)` が呼ばれ、次回 `isToolAllowed()` が `true` を返す                         | P0     |
| TC-4-07  | SkillExecutor                      | `abort()` によりストリーミングが中断される                                  | `abort(executionId)` 呼び出し後に AbortController がシグナルを発火し、stream loop が終了する                    | P0     |
| TC-4-08  | SkillExecutor                      | rate limit (HTTP 429) / network error 時に Exponential Backoff retry が動く | `isRetryableError()` が `{ retryable: true }` を返し、`calculateBackoffDelay()` で待機後に再試行される          | P0     |

---

## C3: リトライ / ストリーミングテスト

| TC-ID   | 対象                | テスト内容                                              | 期待結果                                                                                                   | 優先度 |
| ------- | ------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------ |
| TC-4-09 | SkillExecutor / IPC | streaming メッセージが IPC 経由で Renderer に正しく届く | `mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message)` が呼ばれ、メッセージが Renderer に届く | P0     |

---

## C4: SkillCreatorService テスト

Planner → Executor → Improver の 3 role 連鎖と、internal role 名の UI 非露出を検証する。

| TC-ID   | 対象                              | テスト内容                                                               | 期待結果                                                                                                       | 優先度 |
| ------- | --------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------ |
| TC-4-10 | SkillCreatorService               | Planner → Executor → Improver 連鎖が正しく呼ばれる                       | `plan()` → `execute()` → `improve()` の順で各 role が呼ばれ、最終的に成果物 Skill が返る                       | P1     |
| TC-4-11 | SkillCreatorService               | `claude_code` モードで creator から terminal handoff bundle が返る       | Creator の `execute()` が `RuntimeDecision.type === "terminal_handoff"` を検出し、TerminalHandoffBundle を返す | P1     |
| TC-4-12 | SkillCreatorService / IPC payload | internal role 名（Planner/Executor/Improver）が IPC payload に露出しない | `creator:plan` / `creator:execute` / `creator:improve` の IPC レスポンスに `roleName` フィールドが含まれない   | P1     |

---

## C5: preflight テスト

auth-mode 分岐を追加した後の preflight の正しい動作を検証する。

| TC-ID   | 対象                                         | テスト内容                                        | 期待結果                                                                                                                                      | 優先度 |
| ------- | -------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| TC-4-13 | skillExecutionAuthPreflight / auth-mode 分岐 | preflight が auth-mode 値に応じた分岐を正しく行う | `authMode === "integrated_api"` 時は API key 確認ロジックに進み、`authMode === "claude_code"` 時は API key 確認をスキップし `ok: true` を返す | P0     |

---

## C6: 回帰系テスト

permission remember と実行状態遷移の既存動作が維持されていることを確認する。

| TC-ID   | 対象                            | テスト内容                                                                      | 期待結果                                                                                                              | 優先度 |
| ------- | ------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------ |
| TC-4-14 | SkillExecutor / PermissionStore | permission remember → 2回目の実行でダイアログがスキップされる（regression）     | `permissionStore.isToolAllowed(toolName)` が `true` を返す場合、`sendPermissionRequest()` が IPC を送らず自動許可する | P0     |
| TC-4-15 | SkillExecutor                   | streaming completion 後に execution state が `"completed"` になる（regression） | `for await (const message of stream)` の完了後に `updateExecutionState(executionId, "completed")` が呼ばれる          | P0     |

---

## IPC セキュリティテスト観点

本タスクで追加・変更する IPC チャンネルに対して以下のセキュリティ検証を Phase 6 で拡充する。

| 観点                  | 検証内容                                                                    | 対象チャンネル                                       |
| --------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------- |
| sender 検証           | `validateIpcSender` が全ハンドラで呼び出されること                          | `creator:plan`, `creator:execute`, `creator:improve` |
| P42 3段バリデーション | `typeof === "string"` + `=== ""` + `.trim() === ""` の 3 段チェック         | `creator:plan` の `skillName` 引数                   |
| credential 非送信     | `RuntimeDecision.apiKey` が Renderer 側 IPC payload に含まれないこと        | `skill:execute`, `agent:query`                       |
| error envelope        | `TerminalHandoffBundle` が内部エラーではなく guidance として返されること    | `skill:execute` (claude_code モード)                 |
| internal role 非露出  | IPC レスポンスの `type` フィールドに Planner/Executor/Improver が含まれない | `creator:plan`, `creator:execute`, `creator:improve` |
| チャンネル定数        | ハードコード文字列ではなく `IPC_CHANNELS` 定数を使用していること            | 全チャンネル                                         |

---

## テスト実行環境

| 項目           | 内容                                                      |
| -------------- | --------------------------------------------------------- |
| テストランナー | Vitest                                                    |
| テスト環境     | happy-dom (Renderer 層) / node (Main Process 層)          |
| モック         | `vi.mock` / `vi.fn` でサービス依存を DI                   |
| 注意事項 (P39) | happy-dom 環境では `fireEvent` を使用（`userEvent` 禁止） |
| 注意事項 (P40) | `cd apps/desktop && pnpm vitest run` で実行する           |
| 注意事項 (P13) | タイマーテストは `advanceTimersByTime` で 1 ステップずつ  |
| 注意事項 (P48) | `useShallow` を派生セレクタに適用（auth-mode store 参照） |
| カバレッジ基準 | Line 80% / Branch 60% / Function 80%（最低基準）          |

---

## テストファイル配置計画

| ファイルパス（apps/desktop/src/ 配下）                                  | 対象カテゴリ   |
| ----------------------------------------------------------------------- | -------------- |
| `main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`         | C1             |
| `main/services/skill/__tests__/SkillExecutor.runtime.test.ts`           | C1, C2, C3, C6 |
| `main/services/agent/__tests__/AgentExecutor.runtime.test.ts`           | C1             |
| `main/services/skill/__tests__/SkillCreatorService.test.ts`             | C4             |
| `renderer/utils/__tests__/skillExecutionAuthPreflight.authmode.test.ts` | C5             |

---

## 完了条件チェックリスト

- [x] TC-4-01 〜 TC-4-15 の全テストケースが定義されている
- [x] 成功系（C1）・permission 系（C2）・retry/streaming 系（C3）・Creator 系（C4）・preflight 系（C5）・回帰系（C6）の全カテゴリを網羅している
- [x] IPC セキュリティテスト観点が記録されている
- [x] テスト実行環境と落とし穴（P39/P40/P13/P48）が明記されている
- [x] テストファイル配置計画が記載されている
