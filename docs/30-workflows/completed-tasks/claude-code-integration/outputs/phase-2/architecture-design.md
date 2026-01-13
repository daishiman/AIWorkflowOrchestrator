# Claude Agent SDK統合 - アーキテクチャ設計書

## 1. 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Renderer Process                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                        AgentView (React)                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │  │
│  │  │ SkillSelect  │  │ MessageList  │  │ PermissionDialog     │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘ │  │
│  └───────────────────────────────┬───────────────────────────────┘  │
│                                  │ window.agentAPI                   │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │ IPC (contextBridge)
┌──────────────────────────────────┼──────────────────────────────────┐
│                         Main Process                                 │
│  ┌───────────────────────────────┴───────────────────────────────┐  │
│  │                    agentHandlers.ts                            │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ registerAgentExecutionHandlers()                        │  │  │
│  │  │ - AGENT_START → ExecutionManager.startExecution         │  │  │
│  │  │ - AGENT_STOP → ExecutionManager.stopExecution           │  │  │
│  │  │ - AGENT_PERMISSION_RES → ExecutionManager.resolve...    │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────┬───────────────────────────────┘  │
│  ┌───────────────────────────────┴───────────────────────────────┐  │
│  │                 services/agent/                                │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                 ExecutionManager                         │  │  │
│  │  │  - Map<executionId, AgentExecutor>                      │  │  │
│  │  │  - startExecution() / stopExecution() / resolve...()    │  │  │
│  │  └────────────────────────┬────────────────────────────────┘  │  │
│  │  ┌────────────────────────┴────────────────────────────────┐  │  │
│  │  │                  AgentExecutor                           │  │  │
│  │  │  - query() API呼び出し                                   │  │  │
│  │  │  - ストリーミング処理                                    │  │  │
│  │  │  - AbortController管理                                   │  │  │
│  │  └────────────────────────┬────────────────────────────────┘  │  │
│  │  ┌────────────────────────┴────────────────────────────────┐  │  │
│  │  │                  HooksFactory                            │  │  │
│  │  │  - PreToolUse Hook（危険コマンドブロック）              │  │  │
│  │  │  - PostToolUse Hook（ステータス通知）                   │  │  │
│  │  │  - PermissionRequest Hook（UIダイアログ連携）           │  │  │
│  │  └────────────────────────┬────────────────────────────────┘  │  │
│  │  ┌────────────────────────┴────────────────────────────────┐  │  │
│  │  │                PermissionResolver                        │  │  │
│  │  │  - Renderer応答待機                                      │  │  │
│  │  │  - Promise解決                                           │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                 PermissionRules                          │  │  │
│  │  │  - allow / deny / ask ルール                             │  │  │
│  │  │  - createPermissionOptions()                             │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ SDK API
┌──────────────────────────────────┴──────────────────────────────────┐
│                  @anthropic-ai/claude-agent-sdk                      │
│                  query() → AsyncIterator<SDKMessage>                 │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. クラス設計

### 2.1 クラス図

```
┌────────────────────────────────────────────────────────────────┐
│                      ExecutionManager                           │
├────────────────────────────────────────────────────────────────┤
│ - executions: Map<string, AgentExecutor>                       │
├────────────────────────────────────────────────────────────────┤
│ + startExecution(request, mainWindow): Promise<string>         │
│ + stopExecution(executionId): boolean                          │
│ + stopAllExecutions(): void                                    │
│ + getActiveExecutions(): string[]                              │
│ + resolvePermission(executionId, response): boolean            │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                       AgentExecutor                             │
├────────────────────────────────────────────────────────────────┤
│ - request: AgentExecutionRequest                               │
│ - mainWindow: BrowserWindow                                    │
│ - abortController: AbortController                             │
│ - conversation: Conversation | null                            │
│ - permissionResolver: PermissionResolver                       │
│ - permissionRules: PermissionRules                             │
├────────────────────────────────────────────────────────────────┤
│ + start(): Promise<void>                                       │
│ + stop(): void                                                 │
│ + resolvePermission(response): void                            │
└────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌────────────────────────────┐  ┌────────────────────────────────┐
│        HooksFactory        │  │      PermissionResolver         │
├────────────────────────────┤  ├────────────────────────────────┤
│ - mainWindow: BrowserWindow│  │ - pendingRequests: Map          │
│ - executionId: string      │  ├────────────────────────────────┤
│ - permissionResolver       │  │ + waitForResponse(): Promise    │
├────────────────────────────┤  │ + resolveRequest(response)      │
│ + createHooks(): Hooks     │  └────────────────────────────────┘
└────────────────────────────┘
```

### 2.2 クラス責務

| クラス             | 責務                                               |
| ------------------ | -------------------------------------------------- |
| ExecutionManager   | 複数実行の管理、エグゼキュータのライフサイクル管理 |
| AgentExecutor      | 単一実行の制御、SDK統合、ストリーミング処理        |
| HooksFactory       | Hooksオブジェクトの生成、IPC連携                   |
| PermissionResolver | Permission応答のPromise管理                        |
| PermissionRules    | 宣言的権限ルールの定義・変換                       |

## 3. コンポーネント詳細設計

### 3.1 ExecutionManager

**責務**: 複数のエージェント実行を管理するシングルトン的なマネージャ

```typescript
class ExecutionManager {
  // 状態
  private executions: Map<string, AgentExecutor>;

  // ライフサイクル管理
  startExecution(request, mainWindow): Promise<string>;
  stopExecution(executionId): boolean;
  stopAllExecutions(): void;

  // クエリ
  getActiveExecutions(): string[];

  // Permission連携
  resolvePermission(executionId, response): boolean;
}
```

**設計決定**:

- Mapで実行を管理し、executionIdをキーにする
- startExecution()は非同期で開始後、即座にexecutionIdを返す
- 実行完了時に自動的にMapから削除される

### 3.2 AgentExecutor

**責務**: 単一のエージェント実行を制御

```typescript
class AgentExecutor {
  constructor(
    request: AgentExecutionRequest,
    mainWindow: BrowserWindow,
    permissionRules?: PermissionRules,
  );

  // 実行制御
  start(): Promise<void>; // ストリーミング処理をawait
  stop(): void; // AbortController.abort()

  // Permission連携
  resolvePermission(response: PermissionResponse): void;
}
```

**設計決定**:

- AbortControllerで実行のキャンセルを制御
- PermissionResolverへの参照を保持してPermission応答を解決
- ストリーミング処理中のエラーは適切にIPC経由で通知

### 3.3 HooksFactory

**責務**: SDK Hooksオブジェクトを生成

```typescript
class HooksFactory {
  constructor(
    mainWindow: BrowserWindow,
    executionId: string,
    permissionResolver: PermissionResolver,
  );

  createHooks(): Options["hooks"];
}
```

**生成するHooks**:

| Hook              | 処理内容                            |
| ----------------- | ----------------------------------- |
| PreToolUse        | 危険コマンド検出、ブロック          |
| PostToolUse       | agent:statusでツール完了を通知      |
| PermissionRequest | agent:permissionを送信、応答をawait |

### 3.4 PermissionResolver

**責務**: Renderer ProcessからのPermission応答をPromiseで管理

```typescript
class PermissionResolver {
  private pendingRequests: Map<string, { resolve; reject }>;

  waitForResponse(requestId, signal): Promise<PermissionResponse>;
  resolveRequest(response: PermissionResponse): void;
}
```

**設計決定**:

- requestIdで応答を一意に識別
- signal.abortedでキャンセルを検出してreject
- タイムアウトは上位（AgentExecutor）で管理

### 3.5 PermissionRules

**責務**: 宣言的権限ルールの定義と変換

```typescript
// デフォルトルール
const DEFAULT_PERMISSION_RULES: PermissionRules = {
  allow: [{ tool: 'Read' }, { tool: 'Grep' }, { tool: 'Glob' }],
  deny: [
    { tool: 'Bash', commands: ['rm -rf', 'sudo', ...] },
    { tool: 'Write', paths: ['/etc/**', '/usr/**', '/var/**'] }
  ],
  ask: [{ tool: 'Write' }, { tool: 'Edit' }, { tool: 'Bash' }]
}

// SDKオプション変換
function createPermissionOptions(
  rules: PermissionRules,
  projectRoot: string
): Options['permissions']
```

## 4. IPC通信設計

### 4.1 チャネル定義

| チャネル                    | 方向            | 用途           | データ型              |
| --------------------------- | --------------- | -------------- | --------------------- |
| agent:start                 | Renderer → Main | 実行開始       | AgentExecutionRequest |
| agent:stop                  | Renderer → Main | 実行停止       | { executionId }       |
| agent:stop-all              | Renderer → Main | 全実行停止     | void                  |
| agent:get-active-executions | Renderer → Main | 実行一覧取得   | void → string[]       |
| agent:stream                | Main → Renderer | ストリーミング | AgentStreamMessage    |
| agent:status                | Main → Renderer | ステータス通知 | AgentExecutionStatus  |
| agent:permission            | Main → Renderer | 権限確認要求   | PermissionRequest     |
| agent:permission:res        | Renderer → Main | 権限確認応答   | PermissionResponse    |

### 4.2 通信パターン

**パターン1: Request-Response（invoke/handle）**

- agent:start
- agent:stop
- agent:stop-all
- agent:get-active-executions
- agent:permission:res

**パターン2: Push（send/on）**

- agent:stream
- agent:status
- agent:permission

### 4.3 preload API設計

```typescript
// window.agentAPI
interface AgentAPI {
  // invoke型（Renderer → Main）
  start(request: AgentExecutionRequest): Promise<string>;
  stop(executionId: string): Promise<boolean>;
  stopAll(): Promise<void>;
  getActiveExecutions(): Promise<string[]>;
  resolvePermission(
    executionId: string,
    response: PermissionResponse,
  ): Promise<boolean>;

  // listener型（Main → Renderer）
  onStream(callback: (message: AgentStreamMessage) => void): () => void;
  onStatus(callback: (status: AgentExecutionStatus) => void): () => void;
  onPermission(callback: (request: PermissionRequest) => void): () => void;
}
```

## 5. エラーハンドリング設計

### 5.1 エラー分類

| エラー種別           | 発生箇所              | 処理                           |
| -------------------- | --------------------- | ------------------------------ |
| SDK初期化エラー      | AgentExecutor.start() | agent:streamでerror通知        |
| ストリーミングエラー | for await             | agent:streamでerror通知        |
| キャンセル           | AbortController       | agent:statusでcancelled通知    |
| Permission拒否       | PermissionRequest     | SDKにproceed:false返却         |
| タイムアウト         | PermissionResolver    | 自動的にreject、デフォルト拒否 |

### 5.2 エラー通知フロー

```
エラー発生
    ↓
agent:stream({ type: 'error', content: { message: ... } })
    ↓
agent:status({ status: 'error', error: ... })
    ↓
ExecutionManagerからexecutorを削除
```

## 6. セキュリティ設計

### 6.1 危険コマンドブロック

PreToolUse Hookで以下のパターンを検出してブロック:

```typescript
const DANGEROUS_PATTERNS = [
  "rm -rf",
  "sudo",
  "chmod 777",
  "dd if=",
  "mkfs",
  "> /dev/",
  ":(){ :|:& };:", // fork bomb
];
```

### 6.2 システムディレクトリ保護

deny ルールで以下のパスへの書き込みを禁止:

```typescript
const PROTECTED_PATHS = [
  "/etc/**",
  "/usr/**",
  "/var/**",
  "**/.bashrc",
  "**/.zshrc",
  "**/.profile",
];
```

### 6.3 IPC検証

- sender検証: validateIpcSender()で呼び出し元を確認
- 入力バリデーション: Zodスキーマで検証

---

作成日: 2026-01-12
Phase: 2
ステータス: 完了
