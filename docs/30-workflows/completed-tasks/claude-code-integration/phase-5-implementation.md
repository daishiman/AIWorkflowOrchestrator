# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 5                       |
| 機能名 | claude-code-integration |
| 作成日 | 2026-01-12              |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。

## 実行タスク

- 型定義実装: `packages/shared/src/types/agent.ts` に型を追加
- HooksFactory実装: Hooks生成・IPC連携
- PermissionRules実装: 宣言的権限ルール
- AgentExecutor実装: SDK query() API統合
- ExecutionManager実装: 複数実行管理
- agentHandlers拡張: IPCハンドラー追加

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                         | 内容                    |
| ------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | 既存型定義・IPC仕様     |
| Electronセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC通信セキュリティ要件 |

### Phase 2成果物

| 資料名             | パス                                     | 説明          |
| ------------------ | ---------------------------------------- | ------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | Phase 2成果物 |

## 実行手順

### 1. 型定義実装

`packages/shared/src/types/agent.ts` に以下の型を追加:

```typescript
// ========================================
// Agent Execution Types (AGENT-005)
// ========================================

/**
 * SDK実行リクエスト
 */
export interface AgentExecutionRequest {
  executionId: string;
  skillId: string;
  skillPath: string;
  prompt: string;
  workingDirectory?: string;
  tools?: string[];
  permissionMode?: "auto" | "ask" | "deny" | "default";
}

/**
 * SDKメッセージ型（ストリーミング用）
 */
export interface AgentStreamMessage {
  executionId: string;
  type: "assistant" | "user" | "result" | "tool_use" | "status" | "error";
  content: unknown;
  timestamp: number;
}

/**
 * Permission Request（UIダイアログ用）
 */
export interface PermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}

/**
 * Permission Response（UIからの応答）
 */
export interface PermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
}

/**
 * 実行状態
 */
export interface AgentExecutionStatus {
  executionId: string;
  status: "running" | "completed" | "cancelled" | "error";
  startedAt: number;
  completedAt?: number;
  error?: string;
}

/**
 * Permission Rule型
 */
export interface PermissionRule {
  tool: string | string[];
  paths?: string[];
  commands?: string[];
}

export interface PermissionRules {
  allow?: PermissionRule[];
  deny?: PermissionRule[];
  ask?: PermissionRule[];
}
```

### 2. HooksFactory実装

`apps/desktop/src/main/services/agent/HooksFactory.ts`:

Phase 2設計に基づいて実装。危険コマンド検出、ステータス送信、Permission Dialog連携を実装。

### 3. PermissionRules実装

`apps/desktop/src/main/services/agent/PermissionRules.ts`:

Phase 2設計に基づいて実装。デフォルト権限ルール、プロジェクトルート置換を実装。

### 4. AgentExecutor実装

`apps/desktop/src/main/services/agent/AgentExecutor.ts`:

Phase 2設計に基づいて実装。SDK query() API呼び出し、ストリーミング処理、エラーハンドリングを実装。

### 5. ExecutionManager実装

`apps/desktop/src/main/services/agent/ExecutionManager.ts`:

Phase 2設計に基づいて実装。複数実行管理、キャンセル、Permission解決を実装。

### 6. agentHandlers拡張

`apps/desktop/src/main/ipc/agentHandlers.ts`:

Phase 2設計に基づいて実装。IPCハンドラーを追加。

### 7. IPCチャネル追加

`apps/desktop/src/preload/channels.ts`:

```typescript
export const IPC_CHANNELS = {
  // ... 既存のチャネル

  // Agent Execution (AGENT-005)
  AGENT_START: "agent:start",
  AGENT_STOP: "agent:stop",
  AGENT_STOP_ALL: "agent:stop-all",
  AGENT_GET_ACTIVE_EXECUTIONS: "agent:get-active-executions",
  AGENT_STREAM: "agent:stream",
  AGENT_STATUS: "agent:status",
  AGENT_PERMISSION: "agent:permission",
  AGENT_PERMISSION_RES: "agent:permission:res",
} as const;
```

### 8. Main Process初期化

`apps/desktop/src/main/index.ts`:

```typescript
import { ExecutionManager } from "./services/agent/ExecutionManager";
import { registerAgentExecutionHandlers } from "./ipc/agentHandlers";

// ExecutionManagerインスタンス作成
const executionManager = new ExecutionManager();

// BrowserWindow作成後にIPCハンドラー登録
registerAgentExecutionHandlers(mainWindow, executionManager);

// アプリ終了時のクリーンアップ
app.on("before-quit", () => {
  executionManager.stopAllExecutions();
});
```

## 実装ファイル一覧

| ファイル                                                   | 説明                 |
| ---------------------------------------------------------- | -------------------- |
| `packages/shared/src/types/agent.ts`                       | 型定義追加           |
| `apps/desktop/src/main/services/agent/HooksFactory.ts`     | HooksFactory実装     |
| `apps/desktop/src/main/services/agent/PermissionRules.ts`  | PermissionRules実装  |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts`    | AgentExecutor実装    |
| `apps/desktop/src/main/services/agent/ExecutionManager.ts` | ExecutionManager実装 |
| `apps/desktop/src/main/services/agent/index.ts`            | エクスポート         |
| `apps/desktop/src/main/ipc/agentHandlers.ts`               | IPCハンドラー拡張    |
| `apps/desktop/src/preload/channels.ts`                     | IPCチャネル追加      |
| `apps/desktop/src/main/index.ts`                           | 初期化処理追加       |

## 統合テスト連携【必須】

Main→Renderer IPC通信・ストリーミング処理を実装:

| 実装項目           | 内容                                                  |
| ------------------ | ----------------------------------------------------- |
| IPC接続            | agent:start/stop/stream/status/permissionチャネル実装 |
| ストリーミング     | AsyncIteratorからIPC経由でRendererへメッセージ転送    |
| Permission連携     | agent:permission送信→agent:permission:res受信→resolve |
| エラーハンドリング | SDK例外→agent:stream(error)→agent:status(error)       |

## 成果物

| 成果物           | パス                                                       | 説明          |
| ---------------- | ---------------------------------------------------------- | ------------- |
| 型定義           | `packages/shared/src/types/agent.ts`                       | 追加型定義    |
| HooksFactory     | `apps/desktop/src/main/services/agent/HooksFactory.ts`     | Hooks生成     |
| PermissionRules  | `apps/desktop/src/main/services/agent/PermissionRules.ts`  | 権限ルール    |
| AgentExecutor    | `apps/desktop/src/main/services/agent/AgentExecutor.ts`    | SDK統合       |
| ExecutionManager | `apps/desktop/src/main/services/agent/ExecutionManager.ts` | 実行管理      |
| agentHandlers    | `apps/desktop/src/main/ipc/agentHandlers.ts`               | IPCハンドラー |
| channels         | `apps/desktop/src/preload/channels.ts`                     | IPCチャネル   |

## 完了条件

- [ ] 型定義が `packages/shared/src/types/agent.ts` に追加されている
- [ ] HooksFactoryが実装されている
- [ ] PermissionRulesが実装されている
- [ ] AgentExecutorが実装されている
- [ ] ExecutionManagerが実装されている
- [ ] agentHandlersが拡張されている
- [ ] IPCチャネルが追加されている
- [ ] すべてのテストが成功状態（Green）
- [ ] Main→Renderer IPC通信が実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
