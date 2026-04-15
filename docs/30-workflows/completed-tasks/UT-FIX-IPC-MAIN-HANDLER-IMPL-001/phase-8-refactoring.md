# Phase 8 — リファクタリング

## メタ情報

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| ドキュメントID | UT-FIX-IPC-MAIN-HANDLER-IMPL-001-PH8 |
| フェーズ       | Phase 8（リファクタリング）          |
| ステータス     | completed                            |
| 前フェーズ     | Phase 7（カバレッジ確認）            |
| 次フェーズ     | Phase 9（品質確認）                  |

---

## 1. 目的

Phase 5 で追加した実装の重複・冗長性を排除し、委譲パターンを整理する。Rule-2 の PASS を維持しつつ、コードの保守性を高める。

---

## 2. 重複実装の確認

### 2.1 `auth:start-oauth-flow` と `auth:login` の重複確認

```bash
# 両チャネルのハンドラ実装を比較
grep -A 20 "AUTH_START_OAUTH_FLOW\|AUTH_LOGIN" apps/desktop/src/main/ipc/authHandlers.ts
```

**確認ポイント:**

- `auth:login` と `auth:start-oauth-flow` が同一の `authFlowOrchestrator.startOAuthFlow()` を呼び出していること
- 将来的な差分（PKCE固有処理など）のコメントが残っていること
- バリデーションロジックが重複している場合はヘルパー関数に切り出すこと

**推奨リファクタリング（バリデーション共通化）:**

```typescript
// authHandlers.ts 内部ヘルパー
function validateOAuthProvider(
  provider: unknown,
):
  | { valid: true; provider: OAuthProvider }
  | { valid: false; error: IPCResponse<never> } {
  if (!isValidProvider(provider as string)) {
    return {
      valid: false,
      error: {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.INVALID_PROVIDER,
          message: `Invalid provider: ${String(provider)}. Must be one of: google, github, discord`,
        },
      },
    };
  }
  return { valid: true, provider: provider as OAuthProvider };
}
```

### 2.2 `agent:execute` と `agent:start` の責務整理

```bash
# 両チャネルのハンドラ実装を比較
grep -B 2 -A 30 "AGENT_EXECUTE\|AGENT_EXECUTION_START" apps/desktop/src/main/ipc/agentHandlers.ts
```

**確認ポイント:**

- `agent:execute`（`AGENT_EXECUTE`）と `agent:start`（`AGENT_EXECUTION_START`）が同一の `executionManager.startExecution()` を呼び出していること
- コメントで「`agent:execute` は `agent:start` の後継チャネル」であることを明記すること

**推奨リファクタリング（内部実行ロジック共通化）:**

```typescript
// agentHandlers.ts 内部ヘルパー
async function executeAgentInternal(
  request: AgentExecutionRequest,
  mainWindow: BrowserWindow,
  approvalGate: IApprovalGate,
): Promise<{ success: boolean; executionId?: string }> {
  if (!executionManager) {
    throw {
      code: "NOT_INITIALIZED",
      message: "ExecutionManager not initialized",
    };
  }
  const executionId = await executionManager.startExecution(
    request,
    mainWindow,
    approvalGate,
  );
  return { success: true, executionId };
}
```

### 2.3 `agent:permission-respond` と `agent:permission:res` の責務整理

```bash
# 両チャネルの実装を比較
grep -B 2 -A 25 "AGENT_PERMISSION_RESPOND\|AGENT_EXECUTION_PERMISSION_RES" apps/desktop/src/main/ipc/agentHandlers.ts
```

**確認ポイント:**

- 両ハンドラが同一の `executionManager.resolvePermission()` ループロジックを持つ場合、共通ヘルパーに切り出すこと

**推奨リファクタリング:**

```typescript
// agentHandlers.ts 内部ヘルパー
function resolvePermissionInternal(response: PermissionResponse): boolean {
  if (!executionManager) return false;
  const activeExecutions = executionManager.getActiveExecutions();
  for (const executionId of activeExecutions) {
    if (executionManager.resolvePermission(executionId, response)) {
      return true;
    }
  }
  return false;
}
```

### 2.4 `settings:get` / `settings:update` と `store:get` / `store:set` の責務コメント

```bash
# storeHandlers.ts の全ハンドラ確認
grep -n "ipcMain.handle" apps/desktop/src/main/ipc/storeHandlers.ts
```

**確認ポイント:**

- `settings:get` / `settings:update` が同一のストアインスタンス（`getStore()`）を参照していても、コメントで責務の違いを明記すること
- 将来的な UserSettings 専用スキーマへの分離に備えて、ファイル先頭に `TODO: settings:get/update は将来的に UserSettings 専用ストアへ移行予定` を記載する

---

## 3. コードスタイルの統一

### 3.1 エラーハンドラの統一

追加したハンドラのエラーレスポンス形式が、同一ファイル内の既存ハンドラと一致しているか確認する。

| ファイル           | 既存エラー形式                                                 | 新規ハンドラが一致しているか |
| ------------------ | -------------------------------------------------------------- | ---------------------------- |
| `authHandlers.ts`  | `{ success: false, error: { code: string, message: string } }` | [x]                          |
| `storeHandlers.ts` | `{ success: false, error: string }`                            | [x]                          |
| `agentHandlers.ts` | `throw { code: string, message: string }`                      | [x]                          |

> `storeHandlers.ts` の既存形式は `error` が文字列型（`{ success: false, error: string }`）であるため、`settings:get` / `settings:update` もこの形式に合わせること。

### 3.2 import の整理

不要な import が追加されていないか確認する。

```bash
pnpm --filter @repo/desktop lint -- --rule '{"no-unused-vars": "error"}'
```

---

## 4. リファクタリング後の動作確認

リファクタリング後に必ず以下を再実行する:

```bash
# Rule-2 PASS維持の確認
node scripts/verify-ipc-4layer.cjs

# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト
pnpm --filter @repo/desktop test
```

リファクタリングによって Rule-2 の PASS が崩れていないことを確認すること。
