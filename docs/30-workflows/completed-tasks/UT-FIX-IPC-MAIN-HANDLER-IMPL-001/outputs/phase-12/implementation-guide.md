# 実装ガイド — UT-FIX-IPC-MAIN-HANDLER-IMPL-001

## 概要

IPC 4層整合性 Rule-2 違反（preload の `ALLOWED_INVOKE_CHANNELS` に登録されているが `ipcMain.handle()` 実装がない）を解消する8チャネルの実装ガイド。

このタスクは UI/UX 変更を含まない `NON_VISUAL` 扱いのため、Phase 11 のスクリーンショット参照は不要。主証跡は `node scripts/verify-ipc-4layer.cjs`、`pnpm --filter @repo/desktop typecheck`、`pnpm --filter @repo/desktop test`。

---

## Part 1: auth チャネル（authHandlers.ts）

### auth:start-oauth-flow

```typescript
ipcMain.handle(
  IPC_CHANNELS.AUTH_START_OAUTH_FLOW,
  async (
    _event,
    args: { provider: OAuthProvider },
  ): Promise<IPCResponse<void>> => {
    if (!isValidProvider(args.provider)) {
      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.INVALID_PROVIDER,
          message: `Invalid provider: ${args.provider}. Must be one of: google, github, discord`,
        },
      };
    }

    void authFlowOrchestrator!
      .startOAuthFlow(args.provider)
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

**設計ポイント**:

- `auth:login` と同じ `startOAuthFlow` に委譲しつつ、fire-and-forget にする
- 成功・失敗の通知は `AUTH_STATE_CHANGED` イベントに集約する

### auth:test-callback

```typescript
ipcMain.handle(
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
          code: "FORBIDDEN",
          message: "auth:test-callback is not available in production",
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
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },
);
```

**設計ポイント**:

- `NODE_ENV === "production"` だけでなく `!process.env.NODE_ENV` も FORBIDDEN にする
- callbackUrl の処理は `processAuthCallback()` に集約する

---

## Part 2: store チャネル（storeHandlers.ts）

### settings:get / settings:update

```typescript
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

**設計ポイント**:

- `UserSettings = Record<string, unknown>` 型を定義（any 禁止）
- `StoreSchema` に `userSettings: UserSettings` を追加し、デフォルト値 `{}` を設定
- shallow merge（`{ ...current, ...updates }`）でネストされた設定は上書きされる点に注意
- `registerStoreHandlers(mainWindow)` で sender validation を行い、`settings:update` は `validateObject(updates)` を通す

---

## Part 3: agent チャネル（agentHandlers.ts）

### 共通ヘルパー: resolvePermissionInternal

```typescript
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

`agent:permission:res` と `agent:permission-respond` の両チャネルで共有する。

### agent:get-skills

```typescript
ipcMain.handle(IPC_CHANNELS.AGENT_GET_SKILLS, async (event) => {
  // IPC sender 検証...
  if (!skillService) return { success: true, data: [] };
  try {
    const result = await skillService.scanAvailableSkills();
    return { success: true, data: result.skills };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});
```

### agent:get-skill-detail

```typescript
ipcMain.handle(
  IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
  async (event, args: { skillId: string }) => {
    // IPC sender 検証 + skillId バリデーション...
    try {
      const skill = await skillService.getSkillByName(args.skillId);
      if (!skill)
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Skill not found: ${args.skillId}`,
          },
        };
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

### agent:execute / agent:permission-respond

`agent:start` と `agent:permission:res` への委譲パターン（`resolvePermissionInternal` 共有）。

---

## index.ts の変更点

`SkillService` インスタンスを `registerAgentExecutionHandlers` より**前**に生成し、第6引数として渡す。

```typescript
// Skill Management（agent:get-skills / agent:get-skill-detail 用）
const skillService = new SkillService(...);

registerAgentExecutionHandlers(
  mainWindow, approvalGate, undefined, runtimePolicyResolver, authModeServiceForRuntime, skillService
);
```
