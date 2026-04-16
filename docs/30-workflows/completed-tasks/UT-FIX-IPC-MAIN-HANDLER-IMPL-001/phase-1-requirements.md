# Phase 1 — 要件定義

## メタ情報

| 項目           | 値                                    |
| -------------- | ------------------------------------- |
| ドキュメントID | UT-FIX-IPC-MAIN-HANDLER-IMPL-001-PH01 |
| タスクID       | UT-FIX-IPC-MAIN-HANDLER-IMPL-001      |
| タスク名       | IPC mainハンドラ 未実装チャネル実装   |
| 種別           | bugfix（CI Rule-2違反解消）           |
| フェーズ       | Phase 1（要件定義）                   |
| ステータス     | completed                             |
| 次フェーズ     | Phase 2（設計）                       |

---

## 1. 背景・問題の概要

### 1.1 背景

`node scripts/verify-ipc-4layer.cjs` を実行すると、**Rule-2**（preloadの `ALLOWED_INVOKE_CHANNELS` に登録されているがmainハンドラが存在しない）が **8チャネルのFAIL** を報告している。

具体的には、`apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に以下のチャネルが定義されているにもかかわらず、`apps/desktop/src/main/` 以下に対応する `ipcMain.handle(...)` の実装が存在しない。

これはセキュリティ上のリスクでもある。preloadがチャネルを許可しているのにmainがハンドルしていない場合、レンダラーからのIPC呼び出しが無応答になり、UI側でエラーハンドリングが難しくなる。

### 1.2 CI環境での影響

- `verify-ipc-4layer.cjs` のRule-2チェックが `FAIL` → CIジョブが失敗状態
- 現在は `continue-on-error: true` で一時的に抑止しているが、根本解消が必要

---

## 2. 問題の詳細

### 2.1 未実装チャネル一覧（8チャネル）

| #   | チャネル名                 | 定数名                     | 系統       | preload登録 | mainハンドラ |
| --- | -------------------------- | -------------------------- | ---------- | :---------: | :----------: |
| 1   | `auth:start-oauth-flow`    | `AUTH_START_OAUTH_FLOW`    | auth系     |    あり     |   **なし**   |
| 2   | `auth:test-callback`       | `AUTH_TEST_CALLBACK`       | auth系     |    あり     |   **なし**   |
| 3   | `settings:get`             | `USER_SETTINGS_GET`        | settings系 |    あり     |   **なし**   |
| 4   | `settings:update`          | `USER_SETTINGS_UPDATE`     | settings系 |    あり     |   **なし**   |
| 5   | `agent:get-skills`         | `AGENT_GET_SKILLS`         | agent系    |    あり     |   **なし**   |
| 6   | `agent:get-skill-detail`   | `AGENT_GET_SKILL_DETAIL`   | agent系    |    あり     |   **なし**   |
| 7   | `agent:execute`            | `AGENT_EXECUTE`            | agent系    |    あり     |   **なし**   |
| 8   | `agent:permission-respond` | `AGENT_PERMISSION_RESPOND` | agent系    |    あり     |   **なし**   |

### 2.2 チャネルの定義箇所

```
apps/desktop/src/preload/channels.ts
  - AUTH_START_OAUTH_FLOW: "auth:start-oauth-flow"  (L72)
  - AUTH_TEST_CALLBACK:    "auth:test-callback"      (L73)
  - USER_SETTINGS_GET:     "settings:get"            (L96)
  - USER_SETTINGS_UPDATE:  "settings:update"         (L97)
  - AGENT_GET_SKILLS:      "agent:get-skills"        (L161)
  - AGENT_GET_SKILL_DETAIL:"agent:get-skill-detail"  (L162)
  - AGENT_EXECUTE:         "agent:execute"           (L163)
  - AGENT_PERMISSION_RESPOND: "agent:permission-respond" (L171)
```

---

## 3. スコープ

### 3.1 スコープに含むもの（IN）

- 上記8チャネルの `ipcMain.handle(...)` 実装
- 各ハンドラへのIPC Sender Validation（`validateIpcSender` / `withValidation` 使用）
- `auth:test-callback` への本番環境ガード（`NODE_ENV !== 'production'` チェック）
- `verify-ipc-4layer.cjs` の Rule-2 を PASS させること
- 型安全な実装（`any` 型禁止）

### 3.2 スコープに含まないもの（OUT）

- `continue-on-error: true` の削除（別タスクのスコープ）
- Rule-1（mainにあるがpreloadにない）の違反解消（別タスク: UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001）
- UIレイヤーの変更
- 新規機能の追加（既存インフラへの委譲のみ）
- E2Eテストの新規追加

---

## 4. 受け入れ条件

| #   | 条件                                                                        | 確認方法                                |
| --- | --------------------------------------------------------------------------- | --------------------------------------- |
| 1   | `node scripts/verify-ipc-4layer.cjs` の Rule-2 が **PASS** であること       | スクリプト実行結果                      |
| 2   | 8チャネル全てに `ipcMain.handle(...)` が実装されていること                  | コードレビュー                          |
| 3   | 全ハンドラで IPC Sender Validation が実施されていること                     | コードレビュー                          |
| 4   | `auth:test-callback` に本番環境ガードが実装されていること                   | コードレビュー                          |
| 5   | `any` 型を使用していないこと                                                | `pnpm --filter @repo/desktop typecheck` |
| 6   | 既存テストが全て PASS すること                                              | `pnpm --filter @repo/desktop test`      |
| 7   | 重複 `ipcMain.handle(...)` が発生していないこと（同チャネルの二重登録なし） | grep確認                                |

---

## 5. 変更対象ファイル

| ファイル                                     | 変更種別 | 内容                                                                                                   |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `apps/desktop/src/main/ipc/authHandlers.ts`  | 更新     | `auth:start-oauth-flow`, `auth:test-callback` ハンドラ追加                                             |
| `apps/desktop/src/main/ipc/storeHandlers.ts` | 更新     | `settings:get`, `settings:update` ハンドラ追加（storeHandlers.ts に集約）                              |
| `apps/desktop/src/main/ipc/agentHandlers.ts` | 更新     | `agent:get-skills`, `agent:get-skill-detail`, `agent:execute`, `agent:permission-respond` ハンドラ追加 |
| `apps/desktop/src/main/ipc/index.ts`         | 変更不要 | 新規ファイルなしのため追加登録なし                                                                     |

---

## 6. 依存関係・並列実行可能性

- **依存なし**: 本タスク（TASK-2）は `UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001`（TASK-1, Rule-1修正）と**並列実行可能**
- **親タスク**: `UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001`
- **ブロッカーなし**: 本タスク着手に前提となる完了タスクは存在しない

---

## 7. 優先度・リスク

| 項目    | 内容                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 優先度  | **高**（CIが常時失敗状態、セキュリティリスクを含む）                                                                            |
| リスク1 | 既存ハンドラとの重複登録 → 実装前にgrepで確認必須                                                                               |
| リスク2 | settings を新規ファイルへ分割すると過剰設計になる可能性 → storeHandlers.ts に集約して固定                                       |
| リスク3 | `auth:test-callback` の本番流出 → 環境ガード必須                                                                                |
| リスク4 | 依存サービス（`AuthFlowOrchestrator`, `ExecutionManager`, `SkillService`, `ApprovalGate`）のインターフェース変更 → 設計時に確認 |

---

## 8. 用語定義

| 用語                    | 定義                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Rule-2                  | `verify-ipc-4layer.cjs` のチェックルール。preloadのALLOWED_INVOKE_CHANNELSにあるがmainハンドラが未実装のチャネルを検出 |
| IPC Sender Validation   | `validateIpcSender` または `withValidation` を使った送信元検証                                                         |
| 本番環境ガード          | `process.env.NODE_ENV === 'production'` の場合にFORBIDDENを返すチェック                                                |
| ALLOWED_INVOKE_CHANNELS | preload層でrendererからinvokeを許可するチャネルのホワイトリスト                                                        |
