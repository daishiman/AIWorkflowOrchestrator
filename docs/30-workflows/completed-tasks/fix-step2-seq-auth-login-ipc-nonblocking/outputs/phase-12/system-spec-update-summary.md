# System Spec Update Summary

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 12                                         |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

---

## Step 1: current facts と baseline facts

### baseline facts（変更前の状態）

| 観点                 | 内容                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `auth:login` 挙動    | `await authFlowOrchestrator.startOAuthFlow(provider)` で OAuth 完了まで待機していた                           |
| タイムアウト発生     | 500ms を超えると `IPC timeout: auth:login did not respond within 500ms` が発生                                |
| `AUTH_STATE_CHANGED` | `AuthFlowOrchestrator` が送信する（handler は送信しない設計だったが、await により機能が事実上封じられていた） |
| Renderer への影響    | `authSlice.ts` がタイムアウトエラーを受け取り、ログイン開始直後にエラー表示が起きた                           |
| preload              | `CHANNEL_TIMEOUTS["auth:login"] = 500` が設定済み。変更なし。                                                 |

### current facts（変更後の状態）

| 観点                 | 内容                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `auth:login` 挙動    | `void authFlowOrchestrator!.startOAuthFlow(...).catch(...)` で fire-and-forget 起動      |
| タイムアウト発生     | 発生しない。OAuth 開始直後に `{ success: true }` を返すため 500ms 制約を満たす           |
| `AUTH_STATE_CHANGED` | `AuthFlowOrchestrator` が送信する。`authHandlers.ts` は送信しない（二重送信なし）        |
| Renderer への影響    | `authSlice.ts` はタイムアウトエラーを受け取らない。`AUTH_STATE_CHANGED` で状態を受け取る |
| preload              | 変更なし。`CHANNEL_TIMEOUTS["auth:login"] = 500` はそのまま。                            |

---

## Step 2: canonical 仕様同期の判定

### 判定テーブル

| 観点            | 判定     | 同期先                                                                                 |
| --------------- | -------- | -------------------------------------------------------------------------------------- |
| public IPC      | 更新あり | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                    |
| preload         | 変更なし | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`  |
| state semantics | 更新あり | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security-core.md` |
| lessons-learned | 更新あり | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`         |
| task-workflow   | 更新あり | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   |
| topic-map       | 更新あり | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                          |

### Step 2 判定: 必要

理由を以下に明記する。

**public IPC — 更新あり**

`auth:login` の応答タイミングが変わった。変更前は OAuth 完了後にレスポンスを返していたが、変更後は OAuth 開始直後（fire-and-forget）に返す。この completion semantics の変化は public contract の変更に該当するため、`api-ipc-auth.md` に同期する。

**preload — 変更なし**

`apps/desktop/src/preload/ipc-utils.ts` と `apps/desktop/src/preload/channels.ts` は変更していない。チャンネル名・引数型・レスポンス型・タイムアウト値はすべて同一。`security-electron-ipc-advanced.md` への同期は不要。

**state semantics — 更新あり**

`AUTH_STATE_CHANGED` の state ownership が `AuthFlowOrchestrator` に明示的に固定された。handler が auth state を送信しないことが設計として確立されたため、`architecture-auth-security-core.md` に同期する。

**lessons-learned — 更新あり**

「IPC ハンドラーが長時間処理を await すると timeout を必ず超過する」「状態通知の責務を handler と orchestrator に分散させてはならない」という教訓が得られた。`lessons-learned-current.md` に記録する。

**task-workflow — 更新あり**

`TASK-FIX-AUTH-IPC-001` の完了を task ledger に記録する。Phase 1〜13 の完了日時と PR 情報を `task-workflow.md` に追記する。

**topic-map — 更新あり**

`auth:login` の fire-and-forget 設計および `AUTH_STATE_CHANGED` の state ownership に関するトピックエントリを追加・更新する。`topic-map.md` を再生成する。

---

## 更新なし / 変更なし の項目まとめ

| ファイル                                              | 判定     | 理由                                           |
| ----------------------------------------------------- | -------- | ---------------------------------------------- |
| `apps/desktop/src/preload/ipc-utils.ts`               | 変更なし | タイムアウト値・チャンネル定義は変更していない |
| `apps/desktop/src/preload/channels.ts`                | 変更なし | チャンネル名は変わらない                       |
| `apps/desktop/src/renderer/store/slices/authSlice.ts` | 変更なし | `AUTH_STATE_CHANGED` listener はそのまま活用   |
| `apps/desktop/src/main/auth/authFlowOrchestrator.ts`  | 変更なし | 通知責務を維持・実装変更なし                   |
| `security-electron-ipc-advanced.md`                   | 変更なし | preload surface と response 型は変えていない   |
