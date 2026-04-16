# Phase 7 — カバレッジ確認

## メタ情報

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| ドキュメントID | UT-FIX-IPC-MAIN-HANDLER-IMPL-001-PH7 |
| フェーズ       | Phase 7（カバレッジ確認）            |
| ステータス     | completed                            |
| 前フェーズ     | Phase 6（テスト拡張）                |
| 次フェーズ     | Phase 8（リファクタリング）          |

---

## 1. 目的

8チャネルすべてに `ipcMain.handle()` 実装が登録されており、`verify-ipc-4layer.cjs` の Rule-2 検証をパスできる状態になっているかを確認する。

---

## 2. verify-ipc-4layer.cjs による Rule-2 全通過確認

```bash
node scripts/verify-ipc-4layer.cjs 2>&1 | grep -A 30 "Rule-2"
```

期待する出力:

```
[Rule-2] preload invoke ホワイトリストのチャネルが main ハンドラに未実装: PASS
  違反チャネル数: 0
```

**FAIL が残る場合の対処手順:**

1. 出力された未実装チャネル名を確認する
2. 該当するハンドラファイルを開き、`ipcMain.handle(IPC_CHANNELS.<定数名>, ...)` の登録が正しく行われているか確認する
3. `index.ts` の `registerAllIpcHandlers` 内で登録関数が呼び出されているか確認する

---

## 3. 8チャネル個別チェックリスト

以下のコマンドで各チャネルのハンドラ登録を個別に確認する。

```bash
# auth:start-oauth-flow
grep -n "AUTH_START_OAUTH_FLOW\|auth:start-oauth-flow" apps/desktop/src/main/ipc/authHandlers.ts

# auth:test-callback
grep -n "AUTH_TEST_CALLBACK\|auth:test-callback" apps/desktop/src/main/ipc/authHandlers.ts

# settings:get
grep -n "USER_SETTINGS_GET\|settings:get" apps/desktop/src/main/ipc/storeHandlers.ts

# settings:update
grep -n "USER_SETTINGS_UPDATE\|settings:update" apps/desktop/src/main/ipc/storeHandlers.ts

# agent:get-skills
grep -n "AGENT_GET_SKILLS\|agent:get-skills" apps/desktop/src/main/ipc/agentHandlers.ts

# agent:get-skill-detail
grep -n "AGENT_GET_SKILL_DETAIL\|agent:get-skill-detail" apps/desktop/src/main/ipc/agentHandlers.ts

# agent:execute
grep -n "AGENT_EXECUTE\|agent:execute" apps/desktop/src/main/ipc/agentHandlers.ts

# agent:permission-respond
grep -n "AGENT_PERMISSION_RESPOND\|agent:permission-respond" apps/desktop/src/main/ipc/agentHandlers.ts
```

各コマンドの期待する出力: `ipcMain.handle(` を含む行が1行以上存在すること。

---

## 4. チェックリスト

| チャネル                   | ファイル           | `ipcMain.handle` 登録 | `index.ts` 登録関数呼び出し     |
| -------------------------- | ------------------ | --------------------- | ------------------------------- |
| `auth:start-oauth-flow`    | `authHandlers.ts`  | [x]                   | [x]（既存関数に追加のため不要） |
| `auth:test-callback`       | `authHandlers.ts`  | [x]                   | [x]（既存関数に追加のため不要） |
| `settings:get`             | `storeHandlers.ts` | [x]                   | [x]（不要）                     |
| `settings:update`          | `storeHandlers.ts` | [x]                   | [x]（不要）                     |
| `agent:get-skills`         | `agentHandlers.ts` | [x]                   | [x]                             |
| `agent:get-skill-detail`   | `agentHandlers.ts` | [x]                   | [x]                             |
| `agent:execute`            | `agentHandlers.ts` | [x]                   | [x]                             |
| `agent:permission-respond` | `agentHandlers.ts` | [x]                   | [x]                             |

---

## 5. `auth:test-callback` 本番環境ガード確認

このチェックはセキュリティ上重要なため、カバレッジ確認フェーズでも明示的に実施する。

```bash
# 本番環境ガードの実装が存在するか確認
grep -n "NODE_ENV.*production\|production.*NODE_ENV" apps/desktop/src/main/ipc/authHandlers.ts
```

期待する出力: `process.env.NODE_ENV === 'production'` または同等のガードが含まれる行が存在すること。

---

## 6. `index.ts` の登録確認

本タスクでは新規登録関数を追加しないため、`index.ts` の変更は不要。

---

## 7. 通過基準

このフェーズの通過基準:

- [x] `node scripts/verify-ipc-4layer.cjs` の Rule-2 違反チャネル数が **0**
- [x] 上記チェックリストの全項目にチェックが付いている
- [x] `auth:test-callback` に本番環境ガードが実装されている
- [x] `index.ts` の変更が不要であることを確認した
