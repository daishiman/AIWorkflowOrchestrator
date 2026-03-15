# Phase 2 成果物: 契約マトリクス

## インターフェース契約対照表

### 1. RuntimeResolver

| 項目            | 変更前（chat-edit 専用）                                                             | 変更後（共通サービス）                                          |
| --------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| 配置            | `services/chat-edit/RuntimeResolver.ts`                                              | `services/runtime/RuntimeResolver.ts`                           |
| DI              | `IAuthKeyService`, `IAuthModeService`                                                | `IAuthKeyService`, `IAuthModeService`（変更なし）               |
| メソッド        | `resolve(): Promise<RuntimeResolution>`                                              | `resolve(): Promise<RuntimeResolution>`（変更なし）             |
| 戻り値型        | `{ type: "integrated"; adapter: LLMAdapter } \| { type: "handoff"; reason: string }` | `{ type: "integrated" } \| { type: "handoff"; reason: string }` |
| LLMAdapter 依存 | あり（`AnthropicLLMAdapter` を直接生成）                                             | なし（adapter 生成は chat-edit 側に委譲）                       |

### 2. skillHandlers - registerSkillHandlers

| 項目               | 変更前                                        | 変更後                                                          |
| ------------------ | --------------------------------------------- | --------------------------------------------------------------- |
| シグネチャ         | `(mainWindow, skillService, authKeyService?)` | `(mainWindow, skillService, authKeyService?, runtimeResolver?)` |
| skill:execute 応答 | `SkillExecutionResponse`                      | `SkillExecutionResponse \| HandoffResponse`                     |
| 新規応答形式       | -                                             | `{ success: false, handoff: true, guidance: HandoffGuidance }`  |

### 3. agentHandlers - registerAgentExecutionHandlers

| 項目             | 変更前                       | 変更後                                                         |
| ---------------- | ---------------------------- | -------------------------------------------------------------- |
| シグネチャ       | `(mainWindow, customRules?)` | `(mainWindow, customRules?, runtimeResolver?)`                 |
| agent:start 応答 | `AgentStartResponse`         | `AgentStartResponse \| HandoffResponse`                        |
| 新規応答形式     | -                            | `{ success: false, handoff: true, guidance: HandoffGuidance }` |

### 4. chatEditHandlers - registerChatEditHandlers

| 項目                 | 変更前                                                          | 変更後                                              |
| -------------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| RuntimeResolver 参照 | `RuntimeResolver`（chat-edit 専用）                             | `ChatEditRuntimeResolver`（共通 resolver をラップ） |
| import パス          | `../services/chat-edit/RuntimeResolver`                         | `../services/chat-edit/ChatEditRuntimeResolver`     |
| 動作                 | 変更なし（ChatEditRuntimeResolver が既存の adapter 生成を維持） | 変更なし                                            |

### 5. composition root (ipc/index.ts)

| 項目                 | 変更前                            | 変更後                                                  |
| -------------------- | --------------------------------- | ------------------------------------------------------- |
| RuntimeResolver 生成 | chatEditHandlers 内のみ（L834）   | composition root で1回生成、skill/agent/chatEdit に注入 |
| authModeService 生成 | chatEditHandlers 内（L833）       | composition root で1回生成                              |
| P5 準拠              | 部分的（chatEdit 内に閉じている） | 完全準拠（composition root で一元管理）                 |

### 6. agentSlice（Zustand Store）

| 項目         | 変更前                           | 変更後                                                                              |
| ------------ | -------------------------------- | ----------------------------------------------------------------------------------- |
| AgentState   | `handoffGuidance` フィールドなし | `handoffGuidance: HandoffGuidance \| null` 追加                                     |
| AgentActions | -                                | `setHandoffGuidance(guidance)`, `clearHandoffGuidance()` 追加                       |
| 個別セレクタ | -                                | `useHandoffGuidance()`, `useSetHandoffGuidance()`, `useClearHandoffGuidance()` 追加 |
| 初期値       | -                                | `handoffGuidance: null`                                                             |

### 7. useSkillExecution Hook

| 項目          | 変更前      | 変更後                                                                      |
| ------------- | ----------- | --------------------------------------------------------------------------- |
| authMode 参照 | なし        | `useAuthMode()` 個別セレクタで取得                                          |
| handoff 処理  | なし        | IPC 応答に `handoff: true` 含む場合、`setHandoffGuidance()` で Store に設定 |
| preflight     | 常に実行    | `api-key` モードの場合のみ実行                                              |
| 依存配列      | `[skillId]` | `[authMode, skillId, setHandoffGuidance]`                                   |

### 8. useAgent Hook

| 項目          | 変更前                        | 変更後                                                                      |
| ------------- | ----------------------------- | --------------------------------------------------------------------------- |
| authMode 参照 | なし                          | `useAuthMode()` 個別セレクタで取得                                          |
| handoff 処理  | なし                          | IPC 応答に `handoff: true` 含む場合、`setHandoffGuidance()` で Store に設定 |
| 依存配列      | `[defaultTimeout, sessionId]` | `[authMode, defaultTimeout, sessionId, setHandoffGuidance]`                 |

## 既存保証維持マトリクス

| 保証名                    | 影響有無 | 維持方法                                                                           |
| ------------------------- | -------- | ---------------------------------------------------------------------------------- |
| API Key Preflight         | 影響なし | RuntimeResolver は preflight の後に呼ばれる。preflight 失敗時は routing に進まない |
| Permission Dialog         | 影響なし | integrated パスでは既存の permission フローがそのまま動作する                      |
| Permission Resolver       | 影響なし | handoff パスでは permission は発生しない                                           |
| Streaming Completion      | 影響なし | integrated パスでは既存の streaming フローが維持される。handoff パスでは単一応答   |
| IPC Sender Validation     | 影響なし | 既存の `validateIpcSender()` は変更しない                                          |
| Workspace Path Validation | 影響なし | chatEditHandlers の `isAllowedPath()` は変更しない                                 |
| API Key Non-Exposure      | 維持     | HandoffGuidance.terminalCommand に API key を含めない設計                          |

## HandoffResponse 型（新規）

```typescript
interface HandoffResponse {
  success: false;
  handoff: true;
  guidance: {
    terminalCommand: string;
    contextSummary: string;
    reason: string;
  };
}
```

## データフロー図

```
[Renderer]                    [Preload]         [Main Process]
    |                             |                    |
    | execute(prompt)             |                    |
    |--- useSkillExecution ------>|                    |
    |    (authMode check)         |                    |
    |                             |-- IPC invoke ----->|
    |                             |                    | RuntimeResolver.resolve()
    |                             |                    |   |
    |                             |                    |   +--> "integrated" --> 既存 execute
    |                             |                    |   |
    |                             |                    |   +--> "handoff" --> HandoffGuidance
    |                             |<-- IPC response ---|
    |<--- result/guidance --------|                    |
    |                             |                    |
    | (if handoff)                |                    |
    | setHandoffGuidance(g)       |                    |
    | --> TerminalHandoffCard     |                    |
```
