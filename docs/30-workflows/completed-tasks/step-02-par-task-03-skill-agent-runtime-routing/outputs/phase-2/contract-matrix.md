# Phase 2 設計 - 契約一覧（Contract Matrix）

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase      | 2                                        |
| 作成日     | 2026-03-14                               |
| ステータス | completed                                |

---

## 1. IPC 契約マトリクス

### 1.1 Skill 実行系 IPC

| チャンネル                  | 方向 | 引数                                                 | 戻り値                    | 変更点   |
| --------------------------- | ---- | ---------------------------------------------------- | ------------------------- | -------- |
| `skill:execute`             | R→M  | `{ skillName: string, prompt: string }`              | `{ executionId: string }` | 変更なし |
| `skill:abort`               | R→M  | `{ executionId: string }`                            | `{ success: boolean }`    | 変更なし |
| `skill:permission-response` | R→M  | `{ requestId, approved, rememberChoice, toolName? }` | void                      | 変更なし |
| `SKILL_STREAM`              | M→R  | `SkillStreamMessage`                                 | -                         | 変更なし |
| `SKILL_PERMISSION_REQUEST`  | M→R  | `{ executionId, requestId, toolName, args, reason }` | -                         | 変更なし |
| `skill:handoff`             | M→R  | `TerminalHandoffBundle`                              | -                         | **新規** |

### 1.2 Agent 実行系 IPC

| チャンネル               | 方向 | 引数                                         | 戻り値                  | 変更点   |
| ------------------------ | ---- | -------------------------------------------- | ----------------------- | -------- |
| `agent:query`            | R→M  | `{ prompt: string, options?: QueryOptions }` | void                    | 変更なし |
| `agent:abort`            | R→M  | void                                         | void                    | 変更なし |
| `agent:getStatus`        | R→M  | void                                         | `AgentStatus`           | 変更なし |
| `agent:createSession`    | R→M  | void                                         | `{ sessionId: string }` | 変更なし |
| `agent:destroySession`   | R→M  | `{ sessionId: string }`                      | void                    | 変更なし |
| `agent:message`          | M→R  | `AgentStreamMessage`                         | -                       | 変更なし |
| `AGENT_EXECUTION_STATUS` | M→R  | `AgentExecutionStatus`                       | -                       | 変更なし |
| `AGENT_EXECUTION_STREAM` | M→R  | `AgentStreamMessage`                         | -                       | 変更なし |
| `agent:handoff`          | M→R  | `TerminalHandoffBundle`                      | -                       | **新規** |

### 1.3 Skill Creator 系 IPC（新規設計）

| チャンネル        | 方向 | 引数                                         | 戻り値                    | 備考                                |
| ----------------- | ---- | -------------------------------------------- | ------------------------- | ----------------------------------- |
| `creator:plan`    | R→M  | `{ skillSpec: string }`                      | `{ planId: string }`      | Planner role                        |
| `creator:execute` | R→M  | `{ planId: string, skillName: string }`      | `{ executionId: string }` | Executor role（SkillExecutor 委譲） |
| `creator:improve` | R→M  | `{ executionId: string, feedback?: string }` | `{ improveId: string }`   | Improver role                       |
| `creator:stream`  | M→R  | `CreatorStreamMessage`                       | -                         | 全 role streaming                   |
| `creator:handoff` | M→R  | `TerminalHandoffBundle`                      | -                         | terminal handoff                    |

### 1.4 Claude CLI / Terminal 系 IPC

| チャンネル                     | 方向 | 引数                           | 戻り値                  | 変更点   |
| ------------------------------ | ---- | ------------------------------ | ----------------------- | -------- |
| `claude-cli:execute-script`    | R→M  | `ExecuteScriptRequest`         | `ExecuteScriptResponse` | 変更なし |
| `claude-cli:list-skills`       | R→M  | `ListSkillsRequest`            | `ListSkillsResponse`    | 変更なし |
| `claude-cli:terminate-session` | R→M  | `TerminateSessionRequest`      | void                    | 変更なし |
| `claude-cli:session-output`    | M→R  | `{ sessionId, type, content }` | -                       | 変更なし |
| `claude-cli:session-status`    | M→R  | `{ sessionId, newStatus }`     | -                       | 変更なし |

---

## 2. state 契約マトリクス

### 2.1 Zustand Store（Renderer）

| State                                            | Slice                     | 変更点           |
| ------------------------------------------------ | ------------------------- | ---------------- |
| `authMode: "integrated_api" \| "claude_code"`    | `authModeSlice`           | 変更なし（既存） |
| `isLoading: boolean`                             | `authModeSlice`           | 変更なし         |
| `skillExecutionState`                            | `skillSlice`              | 変更なし         |
| `agentStatus: AgentStatus \| null`               | `agentSlice`              | 変更なし         |
| `terminalHandoff: TerminalHandoffBundle \| null` | `skillSlice / agentSlice` | **新規追加**     |

### 2.2 Main Process State

| State                                             | 保持場所                | 変更点                         |
| ------------------------------------------------- | ----------------------- | ------------------------------ |
| `activeExecutions: Map<string, ExecutionContext>` | `SkillExecutor`         | 変更なし                       |
| `permissionStore: IPermissionStore`               | `SkillExecutor`         | 変更なし                       |
| `sessions: Map<string, SessionInfo>`              | `SessionManager`        | 変更なし                       |
| `runtimeDecisionCache`                            | `RuntimePolicyResolver` | **新規**（TTL 付きキャッシュ） |

---

## 3. runtime 契約マトリクス

### 3.1 RuntimePolicyResolver 契約

```typescript
type AuthMode = "integrated_api" | "claude_code";

interface RuntimeDecision {
  type: "integrated_api" | "terminal_handoff";
  // integrated_api
  apiKey?: string;
  permissionMode?: "default" | "acceptEdits" | "bypassPermissions";
  // terminal_handoff
  handoff?: TerminalHandoffBundle;
}

interface TerminalHandoffBundle {
  launcher: string;
  promptBundle: string;
  cwd: string;
  suggestedCommand: string;
  manualRetryRule: string;
  runbook?: string;
}

// 解決ロジック（設計）
// integrated_api かつ apiKey あり → { type: "integrated_api", apiKey, permissionMode: "default" }
// claude_code または apiKey なし → { type: "terminal_handoff", handoff: { ... } }
```

### 3.2 preflight 契約（拡張）

```typescript
interface PreflightResult {
  ok: boolean;
  runtimeDecision?: RuntimeDecision; // 新規: 統合結果
  error?: SkillExecutionError; // 既存
}

// 拡張後の preflight フロー:
// 1. Renderer: authMode を Zustand store から取得
// 2. IPC: runtime:preflight(authMode) → Main
// 3. Main: RuntimePolicyResolver.resolve(authMode, apiKey)
// 4. integrated_api → ok=true, runtimeDecision.type="integrated_api"
// 5. terminal_handoff → ok=true, runtimeDecision.type="terminal_handoff", handoff={...}
// 6. error → ok=false, error={ code, message }
```

### 3.3 SkillExecutor 拡張契約

```typescript
// 既存の execute() シグネチャを維持しつつ runtimeDecision を受け取る
async execute(
  request: SkillExecutionRequest,
  skill: SkillMetadata,
  runtimeDecision?: RuntimeDecision,  // 新規（なければ自己解決）
): Promise<SkillExecutionResponse | TerminalHandoffResponse>
```

### 3.4 AgentExecutor 拡張契約

```typescript
// 既存の start() にruntimeDecision を追加
async start(runtimeDecision?: RuntimeDecision): Promise<void>
// terminal_handoff 時はストリームではなく handoff event を送信
```

---

## 4. security 境界

| 境界                         | ルール                                                | 実装場所                       |
| ---------------------------- | ----------------------------------------------------- | ------------------------------ |
| IPC sender 検証              | `validateIpcSender()` が全ハンドラで実行              | Main: ipc-validator.ts         |
| API key 非露出               | API key は Main Process のみ保持。Renderer に渡さない | SkillExecutor / AuthKeyService |
| handoff bundle サニタイズ    | `promptBundle` から機密情報を除去して Renderer に返す | RuntimePolicyResolver          |
| terminal launcher エスケープ | `suggestedCommand` の shell injection 対策            | TerminalHandoffBuilder         |
| error エンベロープ           | internal error message を露出しない（P55対策）        | error handler                  |

---

## 5. エラーコード契約

| エラーコード                | 意味                                  | 発生箇所                                     |
| --------------------------- | ------------------------------------- | -------------------------------------------- |
| `AUTHENTICATION_ERROR`      | API key 未設定 / 取得失敗             | SkillExecutor.getApiKey()                    |
| `RUNTIME_POLICY_ERROR`      | auth-mode 解決失敗                    | RuntimePolicyResolver                        |
| `TERMINAL_HANDOFF_REQUIRED` | terminal 実行が必要（エラーではない） | RuntimePolicyResolver（terminal_handoff 時） |
| `EXECUTION_FAILED`          | SDK query() 失敗                      | SkillExecutor / AgentExecutor                |
| `ABORTED`                   | ユーザーキャンセル                    | SkillExecutor / AgentExecutor                |
| `TIMEOUT`                   | タイムアウト                          | SkillExecutor                                |
| `MAX_CONCURRENT_EXCEEDED`   | 同時実行上限超過                      | SkillExecutor                                |
| `VALIDATION_ERROR`          | IPC 引数バリデーション失敗            | 各 IPC Handler                               |

---

## 完了確認

- [x] IPC 契約が Skill / Agent / Creator / Claude CLI まで一覧化されている
- [x] state 契約が Renderer / Main 両プロセスで整理されている
- [x] runtime 契約が RuntimePolicyResolver を中心に整理されている
- [x] security 境界が定義されている
- [x] エラーコードが整理されている
