# Phase 5 — 実装指示

## メタ情報

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| ドキュメントID | UT-FIX-IPC-MAIN-HANDLER-IMPL-001-PH5 |
| フェーズ       | Phase 5（実装）                      |
| ステータス     | completed                            |
| 前フェーズ     | Phase 4（テスト作成）                |
| 次フェーズ     | Phase 6（テスト拡張）                |

---

## 1. 実装前の必須確認手順

実装を開始する前に、以下のコマンドを実行して既存実装の状態と重複ハンドラがないことを確認すること。

```bash
# 対象8チャネルの既存ハンドラ有無を確認（出力ゼロが期待値）
grep -rn "auth:start-oauth-flow\|auth:test-callback\|settings:get\|settings:update\|agent:get-skills\|agent:get-skill-detail\|agent:execute\|agent:permission-respond" apps/desktop/src/main/ --include="*.ts"

# authHandlers.ts の現在の ipcMain.handle 登録状況
grep -n "ipcMain.handle\|registerAuthHandlers" apps/desktop/src/main/ipc/authHandlers.ts

# agentHandlers.ts の現在の ipcMain.handle 登録状況
grep -n "ipcMain.handle\|register" apps/desktop/src/main/ipc/agentHandlers.ts

# storeHandlers.ts の現在の ipcMain.handle 登録状況
grep -n "ipcMain.handle\|registerStoreHandlers" apps/desktop/src/main/ipc/storeHandlers.ts
```

> **重要**: 重複ハンドラが存在する場合、`ipcMain.handle()` は同一チャネルの再登録時に例外をスローする。実装前に必ず確認すること。

---

## 2. 共通ルール

- **any型禁止**: すべての引数・戻り値に明示的な型を付与すること。`any` は使用禁止
- **IPCResponse 型**: 戻り値は `{ success: true; data?: T }` または `{ success: false; error: { code: string; message: string } }` の形式に統一すること
- **バリデーション**: すべてのハンドラで引数の型・null チェックを実施すること
- **エラーサニタイズ**: 内部エラーメッセージは `sanitizeErrorMessage()` を使用してレンダラーに漏れないようにすること

---

## 3. `authHandlers.ts` への追加実装

### 3.1 `auth:start-oauth-flow`（IPC_CHANNELS.AUTH_START_OAUTH_FLOW）

**方針**: `auth:login` がすでに `AuthFlowOrchestrator.startOAuthFlow()` を呼び出しているが、`auth:start-oauth-flow` は PKCE対応の別エントリポイントとして登録が必要。`registerAuthHandlers` 関数内の末尾に追加する。

```typescript
// auth:start-oauth-flow - PKCE対応OAuthフロー開始
registerValidatedAuthHandler(
  IPC_CHANNELS.AUTH_START_OAUTH_FLOW,
  async (
    _event,
    { provider }: { provider: string },
  ): Promise<IPCResponse<void>> => {
    if (!isValidProvider(provider)) {
      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.INVALID_PROVIDER,
          message: `Invalid provider: ${provider}. Must be one of: google, github, discord`,
        },
      };
    }

    void authFlowOrchestrator!
      .startOAuthFlow(provider as OAuthProvider)
      .catch((error: unknown) => {
        console.error(
          "[AuthHandlers] auth:start-oauth-flow failed:",
          sanitizeErrorMessage(error),
        );
      });

    return { success: true };
  },
);
```

> `auth:login` との違い: `auth:login` はレガシーエントリポイント、`auth:start-oauth-flow` はPKCEフロー専用として将来的に内部実装を分岐させる可能性がある。現時点では同一の `startOAuthFlow` に委譲する。

### 3.2 `auth:test-callback`（IPC_CHANNELS.AUTH_TEST_CALLBACK）

**方針**: 開発用チャネル。**本番環境ガード（`process.env.NODE_ENV === 'production'`、および `NODE_ENV` 未設定時のブロック）は必須**。本番環境でのアクセスは即座に FORBIDDEN エラーを返す。

```typescript
// auth:test-callback - 開発用: コールバックURLを手動送信（本番環境ガード付き）
registerValidatedAuthHandler(
  IPC_CHANNELS.AUTH_TEST_CALLBACK,
  async (
    _event,
    { callbackUrl }: { callbackUrl: string },
  ): Promise<IPCResponse<void>> => {
    // 本番環境ガード（必須）
    if (process.env.NODE_ENV === "production" || !process.env.NODE_ENV) {
      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.FORBIDDEN ?? "FORBIDDEN",
          message: "auth:test-callback is not available in production",
        },
      };
    }

    if (typeof callbackUrl !== "string" || callbackUrl.trim() === "") {
      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.INVALID_PROVIDER,
          message: "callbackUrl must be a non-empty string",
        },
      };
    }

    try {
      await processAuthCallback(
        callbackUrl,
        mainWindow,
        supabase,
        secureStorage,
      );
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: {
          code: "CALLBACK_FAILED",
          message: sanitizeErrorMessage(error),
        },
      };
    }
  },
);
```

> `AUTH_ERROR_CODES.FORBIDDEN` が未定義の場合は `'FORBIDDEN'` リテラルを使用する。実装時に `@repo/shared/types/auth` の `AUTH_ERROR_CODES` を確認すること。

---

## 4. `storeHandlers.ts` への追加実装

### 4.1 配置方針

`settings:get` / `settings:update` は `storeHandlers.ts` の `registerStoreHandlers()` に集約する。`settingsHandlers.ts` は作成しない。

### 4.2 `settings:get` / `settings:update`

```typescript
// settings:get / settings:update - storeHandlers.ts に集約
// registerStoreHandlers(mainWindow) で sender validation を通し、settings:update は object validation も追加する
export function registerStoreHandlers(mainWindow: BrowserWindow): void {
  const validationOptions = { getAllowedWindows: () => [mainWindow] };

  const rejectInvalidStoreSender = (
    event: IpcMainInvokeEvent,
    channel: string,
  ): { success: false; error: string } | null => {
    const validation = validateIpcSender(event, channel, validationOptions);
    if (!validation.valid) {
      return createValidationErrorResponse(
        validation.errorMessage ?? "Unauthorized IPC call",
      );
    }
    return null;
  };

  ipcMain.handle(IPC_CHANNELS.USER_SETTINGS_GET, async (event) => {
    const senderError = rejectInvalidStoreSender(
      event,
      IPC_CHANNELS.USER_SETTINGS_GET,
    );
    if (senderError) {
      return senderError;
    }

    const storedSettings = getStore().get("userSettings");
    const storedSettingsValidation = validateObject(storedSettings);
    const settings = storedSettingsValidation.valid
      ? (storedSettings as UserSettings)
      : {};
    return { success: true, data: settings };
  });

  ipcMain.handle(
    IPC_CHANNELS.USER_SETTINGS_UPDATE,
    async (event, updates: Partial<UserSettings>) => {
      const senderError = rejectInvalidStoreSender(
        event,
        IPC_CHANNELS.USER_SETTINGS_UPDATE,
      );
      if (senderError) {
        return senderError;
      }

      const updatesValidation = validateObject(updates);
      if (!updatesValidation.valid) {
        return createValidationErrorResponse(updatesValidation.error!);
      }

      const currentSettings = getStore().get("userSettings");
      const currentSettingsValidation = validateObject(currentSettings);
      const current = currentSettingsValidation.valid
        ? (currentSettings as UserSettings)
        : {};
      const updated: UserSettings = { ...current, ...updates };
      getStore().set("userSettings", updated);
      return { success: true, settings: updated };
    },
  );
}
```

> settings 専用ファイルは作らない。`index.ts` の新規登録追加も不要。

---

## 5. `agentHandlers.ts` への追加実装

### 5.1 配置方針

既存の `registerAgentExecutionHandlers()` に追記する。新しい登録関数は作らない。

### 5.2 `agent:get-skills`（IPC_CHANNELS.AGENT_GET_SKILLS）

**方針**: 内部で既存の `skill:list` ロジックへ委譲する。`agentHandlers.ts` は既存の `SkillService` をそのまま使う。

```typescript
// agent:get-skills - スキル一覧取得（skill:listへ委譲）
ipcMain.handle(
  IPC_CHANNELS.AGENT_GET_SKILLS,
  async (
    event: IpcMainInvokeEvent,
  ): Promise<{ success: boolean; data?: unknown[]; error?: string }> => {
    const validation = validateIpcSender(event, IPC_CHANNELS.AGENT_GET_SKILLS, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    try {
      // SkillServiceに委譲（skill:listと同一ロジック）
      const result = await skillService.scanAvailableSkills();
      return { success: true, data: result.skills };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
);
```

### 5.3 `agent:get-skill-detail`（IPC_CHANNELS.AGENT_GET_SKILL_DETAIL）

```typescript
// agent:get-skill-detail - スキル詳細取得
ipcMain.handle(
  IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
  async (
    event: IpcMainInvokeEvent,
    args: { skillId: string },
  ): Promise<{
    success: boolean;
    data?: unknown;
    error?: { code: string; message: string };
  }> => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
      {
        getAllowedWindows: () => [mainWindow],
      },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillId must be a non-empty string",
      };
    }

    try {
      const skill = await skillService.getSkillByName(args.skillId);
      if (!skill) {
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Skill not found: ${args.skillId}`,
          },
        };
      }
      return { success: true, data: skill };
    } catch (error: unknown) {
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },
);
```

### 5.4 `agent:execute`（IPC_CHANNELS.AGENT_EXECUTE）

**方針**: `agent:start` と同じ `ExecutionManager` ベースの実行フローへ委譲する。意味の違いはチャネル名だけに留め、実装は重複させない。

```typescript
// agent:execute - エージェント実行（agent:startへ委譲）
ipcMain.handle(
  IPC_CHANNELS.AGENT_EXECUTE,
  async (
    event: IpcMainInvokeEvent,
    request: AgentExecutionRequest,
  ): Promise<{ success: boolean; executionId?: string; error?: string }> => {
    const validation = validateIpcSender(event, IPC_CHANNELS.AGENT_EXECUTE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    if (!request?.prompt || typeof request.prompt !== "string") {
      throw { code: "VALIDATION_ERROR", message: "prompt must be a string" };
    }

    if (!executionManager) {
      throw {
        code: "NOT_INITIALIZED",
        message: "ExecutionManager not initialized",
      };
    }

    // ExecutionManagerへ委譲（agent:startと同一ロジック）
    const executionId = await executionManager.startExecution(
      request,
      mainWindow,
      approvalGate,
    );

    return { success: true, executionId };
  },
);
```

### 5.5 `agent:permission-respond`（IPC_CHANNELS.AGENT_PERMISSION_RESPOND）

**方針**: `agent:permission:res` と同じ `ExecutionManager.resolvePermission()` に委譲する。

```typescript
// agent:permission-respond - Permission応答（agent:permission:resへ委譲）
ipcMain.handle(
  IPC_CHANNELS.AGENT_PERMISSION_RESPOND,
  async (
    event: IpcMainInvokeEvent,
    response: PermissionResponse,
  ): Promise<{ success: boolean }> => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.AGENT_PERMISSION_RESPOND,
      {
        getAllowedWindows: () => [mainWindow],
      },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    if (typeof response?.requestId !== "string") {
      throw { code: "VALIDATION_ERROR", message: "requestId must be a string" };
    }
    if (typeof response?.approved !== "boolean") {
      throw { code: "VALIDATION_ERROR", message: "approved must be a boolean" };
    }

    if (!executionManager) {
      throw {
        code: "NOT_INITIALIZED",
        message: "ExecutionManager not initialized",
      };
    }

    const activeExecutions = executionManager.getActiveExecutions();
    let resolved = false;
    for (const executionId of activeExecutions) {
      if (executionManager.resolvePermission(executionId, response)) {
        resolved = true;
        break;
      }
    }

    return { success: resolved };
  },
);
```

---

## 6. 実装後の確認

```bash
# 1. Rule-2 PASS確認
node scripts/verify-ipc-4layer.cjs

# 2. TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# 3. ESLint
pnpm --filter @repo/desktop lint
```
