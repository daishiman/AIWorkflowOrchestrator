# Phase 2 — 設計

## メタ情報

| 項目           | 値                                    |
| -------------- | ------------------------------------- |
| ドキュメントID | UT-FIX-IPC-MAIN-HANDLER-IMPL-001-PH02 |
| フェーズ       | Phase 2（設計）                       |
| ステータス     | completed                             |
| 前フェーズ     | Phase 1（要件定義）                   |
| 次フェーズ     | Phase 3（設計レビュー）               |

---

## 1. 設計アプローチ

### 1.1 基本方針

既存ハンドラファイルへの追記を原則とする。TASK-2 では新規ファイルを作成しない。

- **auth系**: `authHandlers.ts` の `registerAuthHandlers` 関数内に追記
- **settings系**: `storeHandlers.ts` の `registerStoreHandlers` 関数内に追記し、`settingsHandlers.ts` は作成しない
- **agent系**: `agentHandlers.ts` の `registerAgentExecutionHandlers` 関数内に追記

### 1.2 セキュリティ設計の統一原則

全ハンドラで以下を必須とする。

1. `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` を呼び出す
2. validation失敗時は `throw toIPCValidationError(validation)` で即座に終了
3. `any` 型は使用しない
4. エラーは `sanitizeErrorMessage` 等でサニタイズしてからレスポンスに含める

---

## 2. 各チャネルの設計詳細

### 2.1 `auth:start-oauth-flow`

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| 追加ファイル | `apps/desktop/src/main/ipc/authHandlers.ts`                                       |
| 委譲先       | `AuthFlowOrchestrator.startOAuthFlow(provider)`                                   |
| 引数         | `provider: OAuthProvider`                                                         |
| 戻り値       | `void`（エラー時は throw）                                                        |
| セキュリティ | IPC Sender Validation 必須                                                        |
| 備考         | `AuthFlowOrchestrator` インスタンスは `registerAuthHandlers` の引数として受け取る |

**設計方針**: OAuth認証フロー開始はPKCE対応フローを統括する `AuthFlowOrchestrator` に完全委譲する。ハンドラは薄いアダプタとして機能させる。

### 2.2 `auth:test-callback`

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| 追加ファイル | `apps/desktop/src/main/ipc/authHandlers.ts`         |
| 委譲先       | 開発用コールバック処理（inline実装）                |
| 引数         | `callbackUrl: string`                               |
| 戻り値       | `{ success: boolean; error?: string }`              |
| セキュリティ | IPC Sender Validation 必須 + **本番環境ガード必須** |
| 備考         | `NODE_ENV === 'production'` の場合は即座にFORBIDDEN |

**設計方針**: 開発・テスト専用チャネル。本番環境での呼び出しを完全に遮断するガードを実装の最初に配置する。ガードをバイパスする手段を残してはならない。

### 2.3 `settings:get`

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| 追加ファイル | `apps/desktop/src/main/ipc/storeHandlers.ts`                 |
| 委譲先       | 既存 `storeHandlers.ts` 内の `getStore()` / store helper     |
| 引数         | なし（またはフィルターキー）                                 |
| 戻り値       | `UserSettings` 型オブジェクト                                |
| セキュリティ | IPC Sender Validation 必須                                   |
| 備考         | settings 専用ファイルは作らず、`storeHandlers.ts` に集約する |

**設計方針**: ユーザー設定の読み取り専用エンドポイント。`storeHandlers.ts` に集約し、settings専用ファイルや追加登録関数は作らない。

### 2.4 `settings:update`

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| 追加ファイル | `apps/desktop/src/main/ipc/storeHandlers.ts`                    |
| 委譲先       | 既存 `storeHandlers.ts` 内の `getStore()` / store helper        |
| 引数         | `updates: Partial<UserSettings>`                                |
| 戻り値       | `{ success: boolean; settings?: UserSettings; error?: string }` |
| セキュリティ | IPC Sender Validation 必須 + バリデーション                     |
| 備考         | 受け取った値のバリデーションを実施してから保存                  |

**設計方針**: ユーザー設定の書き込みエンドポイント。`storeHandlers.ts` に集約し、settings専用ファイルや追加登録関数は作らない。既存 store helper だけで完結させる。

### 2.5 `agent:get-skills`

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| 追加ファイル | `apps/desktop/src/main/ipc/agentHandlers.ts`              |
| 委譲先       | `skillHandlers.ts` の `skill:list` ハンドラロジックへ委譲 |
| 引数         | なし                                                      |
| 戻り値       | スキル一覧配列                                            |
| セキュリティ | IPC Sender Validation 必須                                |
| 備考         | `registerAgentExecutionHandlers` 関数内に追加             |

**設計方針**: `skillHandlers.ts` に既実装の `skill:list` のロジックへ委譲することで重複実装を避ける。`getSkillExecutorInstance()` を活用する。

### 2.6 `agent:get-skill-detail`

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| 追加ファイル | `apps/desktop/src/main/ipc/agentHandlers.ts` |
| 委譲先       | SkillService の詳細取得メソッド              |
| 引数         | `skillId: string`                            |
| 戻り値       | スキル詳細オブジェクト                       |
| セキュリティ | IPC Sender Validation 必須                   |
| 備考         | `skillId` の型・長さバリデーション必須       |

**設計方針**: スキルIDに対応する詳細情報を返す。IDの検証を実施してから検索処理を呼び出す。

### 2.7 `agent:execute`

| 項目         | 内容                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| 追加ファイル | `apps/desktop/src/main/ipc/agentHandlers.ts`                                                      |
| 委譲先       | `ExecutionManager`（既存インスタンス `executionManager`）                                         |
| 引数         | `AgentExecutionRequest`                                                                           |
| 戻り値       | `AgentStartResult`                                                                                |
| セキュリティ | IPC Sender Validation 必須                                                                        |
| 備考         | 既存の `AGENT_EXECUTION_START` (`agent:start`) ハンドラの実装を参考にする。重複にならないよう注意 |

**設計方針**: `ExecutionManager` に処理を委譲する薄いアダプタ。既存の `agent:start` ハンドラとの差分を確認してから実装する。

### 2.8 `agent:permission-respond`

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| 追加ファイル | `apps/desktop/src/main/ipc/agentHandlers.ts`                  |
| 委譲先       | `ApprovalGate`（既存 `approvalGate` パラメータ）              |
| 引数         | `PermissionResponse`                                          |
| 戻り値       | `void`（エラー時は throw）                                    |
| セキュリティ | IPC Sender Validation 必須                                    |
| 備考         | `registerAgentExecutionHandlers` の `approvalGate` 引数を使用 |

**設計方針**: レンダラーからの権限承認/拒否応答を `ApprovalGate` に渡す。`resolvePermission` に委譲する。

---

## 3. 事前確認コマンド（実装前に必ず実行）

### 3.1 重複ハンドラ確認

```bash
# auth系チャネルの重複確認
grep -rn "auth:start-oauth-flow\|auth:test-callback" \
  apps/desktop/src/main/

# settings系チャネルの重複確認
grep -rn "settings:get\|settings:update" \
  apps/desktop/src/main/

# agent系チャネルの重複確認
grep -rn "agent:get-skills\|agent:get-skill-detail\|agent:execute\|agent:permission-respond" \
  apps/desktop/src/main/
```

### 3.2 依存サービスの存在確認

```bash
# settings は既存 storeHandlers.ts に集約するため追加サービス確認は不要

# AuthFlowOrchestratorのstartOAuthFlowシグネチャ確認
grep -n "startOAuthFlow" apps/desktop/src/main/auth/authFlowOrchestrator.ts

# ApprovalGateのインターフェース確認
grep -n "resolvePermission\|respond" apps/desktop/src/main/services/runtime/ApprovalGate.ts
```

### 3.3 Rule-2違反チャネルの事前確認

```bash
node scripts/verify-ipc-4layer.cjs 2>&1 | grep -A 50 "Rule-2"
```

---

## 4. TypeScript コードスニペット（各ハンドラのシグネチャ）

### 4.1 auth:start-oauth-flow

```typescript
ipcMain.handle(
  IPC_CHANNELS.AUTH_START_OAUTH_FLOW,
  async (event: IpcMainInvokeEvent, provider: OAuthProvider): Promise<void> => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.AUTH_START_OAUTH_FLOW,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    if (!isValidProvider(provider)) {
      throw { code: "VALIDATION_ERROR", message: "Invalid OAuth provider" };
    }

    await authFlowOrchestrator.startOAuthFlow(provider);
  },
);
```

### 4.2 auth:test-callback

```typescript
ipcMain.handle(
  IPC_CHANNELS.AUTH_TEST_CALLBACK,
  async (
    event: IpcMainInvokeEvent,
    callbackUrl: string,
  ): Promise<{ success: boolean; error?: string }> => {
    // 本番環境ガード（最優先チェック）
    if (process.env.NODE_ENV === "production") {
      throw {
        code: "FORBIDDEN",
        message: "auth:test-callback is not available in production",
      };
    }

    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.AUTH_TEST_CALLBACK,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    if (typeof callbackUrl !== "string" || !callbackUrl.startsWith("http")) {
      return { success: false, error: "Invalid callback URL" };
    }

    // コールバックURL処理（開発用）
    // ... 実装詳細はPhase 5で確定
    return { success: true };
  },
);
```

### 4.3 settings:get

```typescript
ipcMain.handle(
  IPC_CHANNELS.USER_SETTINGS_GET,
  async (event: IpcMainInvokeEvent): Promise<UserSettings> => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.USER_SETTINGS_GET,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    return getStore().get("userSettings") as UserSettings;
  },
);
```

### 4.4 settings:update

```typescript
ipcMain.handle(
  IPC_CHANNELS.USER_SETTINGS_UPDATE,
  async (
    event: IpcMainInvokeEvent,
    updates: Partial<UserSettings>,
  ): Promise<{ success: boolean; settings?: UserSettings; error?: string }> => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.USER_SETTINGS_UPDATE,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    if (!updates || typeof updates !== "object") {
      return { success: false, error: "Invalid settings payload" };
    }

    const current = getStore().get("userSettings") as UserSettings;
    const updated = { ...current, ...updates } as UserSettings;
    getStore().set("userSettings", updated);
    return { success: true, settings: updated };
  },
);
```

### 4.5 agent:get-skills

```typescript
ipcMain.handle(
  IPC_CHANNELS.AGENT_GET_SKILLS,
  async (event: IpcMainInvokeEvent) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.AGENT_GET_SKILLS, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // skillHandlers の skill:list ロジックへ委譲
    const skillExecutor = getSkillExecutorInstance();
    return skillExecutor?.listSkills() ?? [];
  },
);
```

### 4.6 agent:get-skill-detail

```typescript
ipcMain.handle(
  IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
  async (event: IpcMainInvokeEvent, skillId: string) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    if (typeof skillId !== "string" || skillId.length === 0) {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillId must be a non-empty string",
      };
    }

    const skillExecutor = getSkillExecutorInstance();
    return skillExecutor?.getSkillDetail(skillId) ?? null;
  },
);
```

### 4.7 agent:execute

```typescript
ipcMain.handle(
  IPC_CHANNELS.AGENT_EXECUTE,
  async (
    event: IpcMainInvokeEvent,
    request: AgentExecutionRequest,
  ): Promise<AgentStartResult> => {
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
        code: "INTERNAL_ERROR",
        message: "ExecutionManager not initialized",
      };
    }

    return executionManager.execute(request);
  },
);
```

### 4.8 agent:permission-respond

```typescript
ipcMain.handle(
  IPC_CHANNELS.AGENT_PERMISSION_RESPOND,
  async (
    event: IpcMainInvokeEvent,
    response: PermissionResponse,
  ): Promise<void> => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.AGENT_PERMISSION_RESPOND,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    if (!response || typeof response.approved !== "boolean") {
      throw {
        code: "VALIDATION_ERROR",
        message: "Invalid permission response",
      };
    }

    approvalGate.resolvePermission(response);
  },
);
```

---

## 5. リスク一覧と対策

| #   | リスク                                      | 深刻度 | 対策                                                                             |
| --- | ------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| 1   | **重複ハンドラ登録**                        | 高     | 実装前にgrepで既存登録を確認。同チャネルへの二重登録はElectronが例外を発生させる |
| 2   | **settings の責務分散**                     | 中     | `storeHandlers.ts` に集約し、settings専用ファイルと追加登録関数を作らない        |
| 3   | **auth:test-callback の本番流出**           | 高     | 本番環境ガードをハンドラの最初に配置し、他のどのチェックより先に実行させる       |
| 4   | **any型の混入**                             | 中     | TypeScriptの厳格モード + typecheck CIで検出。コードスニペットに型を明記          |
| 5   | **agent:execute と agent:start の役割混同** | 中     | 実装前に両チャネルの仕様差分を確認。引数・戻り値・ユースケースを明確に区別する   |
| 6   | **ApprovalGate.resolvePermission 未実装**   | 中     | Phase 4前にインターフェース確認。未存在の場合はメソッド名を調査して修正          |
| 7   | **index.ts の追加変更が不要なのに触る**     | 低     | 新規ファイルを作らないため index.ts は変更しない                                 |
