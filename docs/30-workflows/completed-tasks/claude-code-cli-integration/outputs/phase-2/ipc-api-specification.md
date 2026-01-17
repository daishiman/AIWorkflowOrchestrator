# Claude Code CLI統合 - IPC API仕様書

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| 機能名     | claude-code-cli-integration |
| バージョン | 1.0.0                       |
| 作成日     | 2026-01-17                  |
| Phase      | 2                           |

---

## 1. IPC通信概要

### 1.1 通信パターン

| パターン      | 用途                         | 実装                                        |
| ------------- | ---------------------------- | ------------------------------------------- |
| invoke/handle | 単発のリクエスト・レスポンス | `ipcRenderer.invoke()` / `ipcMain.handle()` |
| on/send       | ストリーミング・イベント通知 | `ipcRenderer.on()` / `webContents.send()`   |

### 1.2 通信フロー

```
Renderer Process                    Main Process
      │                                   │
      │  ipcRenderer.invoke(channel, args)│
      │──────────────────────────────────>│
      │                                   │ ipcMain.handle(channel)
      │                                   │─────────┐
      │                                   │<────────┘
      │              Promise<Result<T>>   │
      │<──────────────────────────────────│
      │                                   │
      │  ipcRenderer.on(channel, callback)│
      │<──────────────────────────────────│
      │                                   │ webContents.send(channel, data)
      │              StreamMessage        │
      │<──────────────────────────────────│
      │                                   │
```

---

## 2. チャンネル定義

### 2.1 チャンネルホワイトリスト

```typescript
// apps/desktop/src/main/ipc/claude-cli/channels.ts

export const CLAUDE_CLI_CHANNELS = {
  // ========================================
  // invoke/handle パターン（リクエスト・レスポンス）
  // ========================================

  /** CLIインストール状態を確認 */
  CHECK_INSTALLATION: "claude-cli:check-installation",

  /** スキル一覧を取得 */
  LIST_SKILLS: "claude-cli:list-skills",

  /** スキル詳細を取得 */
  GET_SKILL_DETAIL: "claude-cli:get-skill-detail",

  /** スクリプト実行を開始 */
  EXECUTE_SCRIPT: "claude-cli:execute-script",

  /** セッションを終了 */
  TERMINATE_SESSION: "claude-cli:terminate-session",

  /** セッション一覧を取得 */
  LIST_SESSIONS: "claude-cli:list-sessions",

  /** セッション詳細を取得 */
  GET_SESSION: "claude-cli:get-session",

  // ========================================
  // on/send パターン（ストリーミング）
  // ========================================

  /** 出力ストリーム（stdout/stderr） */
  OUTPUT_STREAM: "claude-cli:output-stream",

  /** セッション状態変更通知 */
  SESSION_STATUS: "claude-cli:session-status",

  /** 実行完了通知 */
  EXECUTION_COMPLETE: "claude-cli:execution-complete",
} as const;

/** チャンネル名の型 */
export type ClaudeCliChannel =
  (typeof CLAUDE_CLI_CHANNELS)[keyof typeof CLAUDE_CLI_CHANNELS];

/** ホワイトリストに含まれるチャンネルか検証 */
export function isValidChannel(channel: string): channel is ClaudeCliChannel {
  return Object.values(CLAUDE_CLI_CHANNELS).includes(
    channel as ClaudeCliChannel,
  );
}
```

### 2.2 チャンネル一覧

| チャンネル                      | 方向            | パターン      | 説明                   |
| ------------------------------- | --------------- | ------------- | ---------------------- |
| `claude-cli:check-installation` | Renderer → Main | invoke/handle | CLI存在確認            |
| `claude-cli:list-skills`        | Renderer → Main | invoke/handle | スキル一覧取得         |
| `claude-cli:get-skill-detail`   | Renderer → Main | invoke/handle | スキル詳細取得         |
| `claude-cli:execute-script`     | Renderer → Main | invoke/handle | スクリプト実行開始     |
| `claude-cli:terminate-session`  | Renderer → Main | invoke/handle | セッション終了         |
| `claude-cli:list-sessions`      | Renderer → Main | invoke/handle | セッション一覧取得     |
| `claude-cli:get-session`        | Renderer → Main | invoke/handle | セッション詳細取得     |
| `claude-cli:output-stream`      | Main → Renderer | on/send       | ストリーミング出力     |
| `claude-cli:session-status`     | Main → Renderer | on/send       | セッション状態変更通知 |
| `claude-cli:execution-complete` | Main → Renderer | on/send       | 実行完了通知           |

---

## 3. API エンドポイント詳細

### 3.1 CLIインストール確認

**チャンネル**: `claude-cli:check-installation`

**目的**: Claude Code CLIがインストールされているか確認する

**リクエスト**: なし

**レスポンス**:

```typescript
interface CliInstallationStatus {
  installed: boolean;
  version: string | null;
  path: string | null;
  error: string | null;
}

type Response = Result<CliInstallationStatus>;
```

**使用例**:

```typescript
// Renderer
const result = await window.claudeCliAPI.checkInstallation();
if (result.success) {
  console.log(`CLI version: ${result.data.version}`);
} else {
  console.error(`CLI not found: ${result.error.message}`);
}
```

---

### 3.2 スキル一覧取得

**チャンネル**: `claude-cli:list-skills`

**目的**: `.claude/skills/`配下のスキル一覧を取得する

**リクエスト**:

```typescript
interface ListSkillsRequest {
  /** フィルタリング条件（オプション） */
  filter?: {
    /** 名前による部分一致検索 */
    name?: string;
    /** タグによるフィルタリング */
    tags?: string[];
    /** キーワード検索（説明文） */
    keyword?: string;
  };
  /** 強制リフレッシュ（キャッシュ無視） */
  forceRefresh?: boolean;
}
```

**レスポンス**:

```typescript
interface SkillMetadata {
  name: string;
  path: string;
  description: string;
  tags: string[];
  triggers: string[];
  dependencies: string[];
  allowedTools: string[];
  hasScripts: boolean;
  hasReferences: boolean;
}

interface ScanResult {
  skills: SkillMetadata[];
  errors: ScanError[];
  scannedAt: number;
}

type Response = Result<ScanResult>;
```

**使用例**:

```typescript
// Renderer - 全スキル取得
const result = await window.claudeCliAPI.listSkills({});

// Renderer - タグでフィルタリング
const result = await window.claudeCliAPI.listSkills({
  filter: { tags: ["workflow", "automation"] },
});
```

---

### 3.3 スキル詳細取得

**チャンネル**: `claude-cli:get-skill-detail`

**目的**: 特定スキルの詳細情報を取得する

**リクエスト**:

```typescript
interface GetSkillDetailRequest {
  /** スキル名 */
  skillName: string;
  /** 追加情報を含める */
  includeScripts?: boolean;
  includeReferences?: boolean;
}
```

**レスポンス**:

```typescript
interface SkillDetail extends SkillMetadata {
  /** SKILL.md の本文 */
  content: string;
  /** スクリプト一覧（includeScripts=true時） */
  scripts?: ScriptInfo[];
  /** 参照ファイル一覧（includeReferences=true時） */
  references?: ReferenceInfo[];
}

interface ScriptInfo {
  name: string;
  path: string;
  type: "node" | "python" | "bash" | "typescript";
}

interface ReferenceInfo {
  name: string;
  path: string;
}

type Response = Result<SkillDetail>;
```

**使用例**:

```typescript
// Renderer
const result = await window.claudeCliAPI.getSkillDetail({
  skillName: "task-specification-creator",
  includeScripts: true,
});

if (result.success) {
  console.log(`Scripts: ${result.data.scripts?.map((s) => s.name).join(", ")}`);
}
```

---

### 3.4 スクリプト実行

**チャンネル**: `claude-cli:execute-script`

**目的**: スキル内のスクリプトを実行する

**リクエスト**:

```typescript
interface ExecuteScriptRequest {
  /** スキル名 */
  skillName: string;
  /** スクリプトファイル名 */
  scriptName: string;
  /** コマンドライン引数 */
  args?: string[];
  /** 作業ディレクトリ（オプション） */
  cwd?: string;
  /** タイムアウト（ms、オプション） */
  timeoutMs?: number;
}
```

**レスポンス**:

```typescript
interface ExecuteScriptResponse {
  /** セッションID */
  sessionId: string;
  /** 初期ステータス */
  status: SessionStatus;
}

type SessionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "terminated";

type Response = Result<ExecuteScriptResponse>;
```

**ストリーミング出力**（`claude-cli:output-stream`）:

```typescript
interface StreamMessage {
  sessionId: string;
  type: "stdout" | "stderr" | "exit";
  content: string;
  timestamp: number;
}
```

**使用例**:

```typescript
// Renderer
// 1. 出力ハンドラを登録
window.claudeCliAPI.onOutputStream((message) => {
  if (message.type === "stdout") {
    console.log(`[OUT] ${message.content}`);
  } else if (message.type === "stderr") {
    console.error(`[ERR] ${message.content}`);
  } else if (message.type === "exit") {
    console.log(`Process exited with code: ${message.content}`);
  }
});

// 2. スクリプト実行
const result = await window.claudeCliAPI.executeScript({
  skillName: "task-specification-creator",
  scriptName: "validate-phase-output.mjs",
  args: ["docs/30-workflows/my-feature", "--phase", "1"],
});

if (result.success) {
  console.log(`Session started: ${result.data.sessionId}`);
}
```

---

### 3.5 セッション終了

**チャンネル**: `claude-cli:terminate-session`

**目的**: 実行中のセッションを終了する

**リクエスト**:

```typescript
interface TerminateSessionRequest {
  /** セッションID */
  sessionId: string;
  /** 強制終了（SIGKILL） */
  force?: boolean;
}
```

**レスポンス**:

```typescript
interface TerminateSessionResponse {
  sessionId: string;
  terminated: boolean;
}

type Response = Result<TerminateSessionResponse>;
```

**使用例**:

```typescript
// Renderer
const result = await window.claudeCliAPI.terminateSession({
  sessionId: "abc123",
  force: false,
});
```

---

### 3.6 セッション一覧取得

**チャンネル**: `claude-cli:list-sessions`

**目的**: 全セッション一覧を取得する

**リクエスト**: なし

**レスポンス**:

```typescript
interface SessionSummary {
  id: string;
  skillName: string;
  status: SessionStatus;
  startedAt: number;
  completedAt: number | null;
}

type Response = Result<SessionSummary[]>;
```

---

### 3.7 セッション詳細取得

**チャンネル**: `claude-cli:get-session`

**目的**: 特定セッションの詳細情報を取得する

**リクエスト**:

```typescript
interface GetSessionRequest {
  sessionId: string;
}
```

**レスポンス**:

```typescript
interface SessionDetail {
  id: string;
  skillName: string;
  status: SessionStatus;
  startedAt: number;
  completedAt: number | null;
  exitCode: number | null;
  output: string[];
  error: string[];
}

type Response = Result<SessionDetail>;
```

---

## 4. preload API設計

### 4.1 contextBridge公開

```typescript
// apps/desktop/src/preload/claude-cli.ts

import { contextBridge, ipcRenderer } from "electron";
import { CLAUDE_CLI_CHANNELS } from "./channels";
import type {
  CliInstallationStatus,
  ListSkillsRequest,
  ScanResult,
  GetSkillDetailRequest,
  SkillDetail,
  ExecuteScriptRequest,
  ExecuteScriptResponse,
  TerminateSessionRequest,
  TerminateSessionResponse,
  SessionSummary,
  GetSessionRequest,
  SessionDetail,
  StreamMessage,
  Result,
} from "@repo/shared/claude-cli";

/**
 * 安全なinvokeラッパーを作成
 */
function createSafeInvoke<TReq, TRes>(channel: string) {
  return (request: TReq): Promise<Result<TRes>> => {
    return ipcRenderer.invoke(channel, request);
  };
}

/**
 * Claude CLI API
 */
export const claudeCliAPI = {
  // ========================================
  // CLI管理
  // ========================================

  /**
   * CLIインストール状態を確認
   */
  checkInstallation: (): Promise<Result<CliInstallationStatus>> => {
    return ipcRenderer.invoke(CLAUDE_CLI_CHANNELS.CHECK_INSTALLATION);
  },

  // ========================================
  // スキル管理
  // ========================================

  /**
   * スキル一覧を取得
   */
  listSkills: createSafeInvoke<ListSkillsRequest, ScanResult>(
    CLAUDE_CLI_CHANNELS.LIST_SKILLS,
  ),

  /**
   * スキル詳細を取得
   */
  getSkillDetail: createSafeInvoke<GetSkillDetailRequest, SkillDetail>(
    CLAUDE_CLI_CHANNELS.GET_SKILL_DETAIL,
  ),

  // ========================================
  // スクリプト実行
  // ========================================

  /**
   * スクリプトを実行
   */
  executeScript: createSafeInvoke<ExecuteScriptRequest, ExecuteScriptResponse>(
    CLAUDE_CLI_CHANNELS.EXECUTE_SCRIPT,
  ),

  /**
   * セッションを終了
   */
  terminateSession: createSafeInvoke<
    TerminateSessionRequest,
    TerminateSessionResponse
  >(CLAUDE_CLI_CHANNELS.TERMINATE_SESSION),

  // ========================================
  // セッション管理
  // ========================================

  /**
   * セッション一覧を取得
   */
  listSessions: (): Promise<Result<SessionSummary[]>> => {
    return ipcRenderer.invoke(CLAUDE_CLI_CHANNELS.LIST_SESSIONS);
  },

  /**
   * セッション詳細を取得
   */
  getSession: createSafeInvoke<GetSessionRequest, SessionDetail>(
    CLAUDE_CLI_CHANNELS.GET_SESSION,
  ),

  // ========================================
  // ストリーミング
  // ========================================

  /**
   * 出力ストリームを購読
   */
  onOutputStream: (
    callback: (message: StreamMessage) => void,
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      message: StreamMessage,
    ) => {
      callback(message);
    };
    ipcRenderer.on(CLAUDE_CLI_CHANNELS.OUTPUT_STREAM, handler);

    // クリーンアップ関数を返す
    return () => {
      ipcRenderer.removeListener(CLAUDE_CLI_CHANNELS.OUTPUT_STREAM, handler);
    };
  },

  /**
   * セッション状態変更を購読
   */
  onSessionStatus: (
    callback: (sessionId: string, status: string) => void,
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      sessionId: string,
      status: string,
    ) => {
      callback(sessionId, status);
    };
    ipcRenderer.on(CLAUDE_CLI_CHANNELS.SESSION_STATUS, handler);

    return () => {
      ipcRenderer.removeListener(CLAUDE_CLI_CHANNELS.SESSION_STATUS, handler);
    };
  },

  /**
   * 実行完了を購読
   */
  onExecutionComplete: (
    callback: (sessionId: string, exitCode: number) => void,
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      sessionId: string,
      exitCode: number,
    ) => {
      callback(sessionId, exitCode);
    };
    ipcRenderer.on(CLAUDE_CLI_CHANNELS.EXECUTION_COMPLETE, handler);

    return () => {
      ipcRenderer.removeListener(
        CLAUDE_CLI_CHANNELS.EXECUTION_COMPLETE,
        handler,
      );
    };
  },
};

// contextBridgeで公開
contextBridge.exposeInMainWorld("claudeCliAPI", claudeCliAPI);
```

### 4.2 型定義（グローバル）

```typescript
// apps/desktop/src/renderer/types/global.d.ts

import type { claudeCliAPI } from "@desktop/preload/claude-cli";

declare global {
  interface Window {
    claudeCliAPI: typeof claudeCliAPI;
  }
}

export {};
```

---

## 5. IPCハンドラー実装

### 5.1 ハンドラー登録

```typescript
// apps/desktop/src/main/ipc/claude-cli/index.ts

import { ipcMain } from "electron";
import { CLAUDE_CLI_CHANNELS } from "./channels";
import * as handlers from "./handlers";

/**
 * Claude CLI IPCハンドラーを登録
 */
export function registerClaudeCliIpcHandlers(): void {
  // invoke/handle パターン
  ipcMain.handle(
    CLAUDE_CLI_CHANNELS.CHECK_INSTALLATION,
    handlers.handleCheckInstallation,
  );
  ipcMain.handle(CLAUDE_CLI_CHANNELS.LIST_SKILLS, handlers.handleListSkills);
  ipcMain.handle(
    CLAUDE_CLI_CHANNELS.GET_SKILL_DETAIL,
    handlers.handleGetSkillDetail,
  );
  ipcMain.handle(
    CLAUDE_CLI_CHANNELS.EXECUTE_SCRIPT,
    handlers.handleExecuteScript,
  );
  ipcMain.handle(
    CLAUDE_CLI_CHANNELS.TERMINATE_SESSION,
    handlers.handleTerminateSession,
  );
  ipcMain.handle(
    CLAUDE_CLI_CHANNELS.LIST_SESSIONS,
    handlers.handleListSessions,
  );
  ipcMain.handle(CLAUDE_CLI_CHANNELS.GET_SESSION, handlers.handleGetSession);
}

/**
 * Claude CLI IPCハンドラーを登録解除
 */
export function unregisterClaudeCliIpcHandlers(): void {
  Object.values(CLAUDE_CLI_CHANNELS).forEach((channel) => {
    if (channel.startsWith("claude-cli:") && !channel.includes("stream")) {
      ipcMain.removeHandler(channel);
    }
  });
}
```

### 5.2 ハンドラー実装

```typescript
// apps/desktop/src/main/ipc/claude-cli/handlers.ts

import { BrowserWindow, IpcMainInvokeEvent } from "electron";
import { ClaudeCliManager } from "../../claude-cli/ClaudeCliManager";
import type {
  ListSkillsRequest,
  GetSkillDetailRequest,
  ExecuteScriptRequest,
  TerminateSessionRequest,
  GetSessionRequest,
  Result,
} from "@repo/shared/claude-cli";
import { CLAUDE_CLI_CHANNELS } from "./channels";

// ClaudeCliManagerのシングルトンインスタンス
let cliManager: ClaudeCliManager | null = null;

/**
 * ClaudeCliManagerを初期化
 */
export function initializeCliManager(skillsBasePath: string): void {
  cliManager = new ClaudeCliManager({
    skillsBasePath,
    maxSessions: 10,
    defaultTimeoutMs: 30 * 60 * 1000,
  });
}

/**
 * IPC sender検証
 */
function validateIpcSender(event: IpcMainInvokeEvent): void {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);

  // DevToolsからの呼び出し拒否
  if (!win) {
    throw new Error("IPC_SENDER_INVALID: No window found");
  }

  // DevToolsが開いている場合も拒否（セキュリティ強化時）
  // if (webContents.isDevToolsOpened()) {
  //   throw new Error("IPC_SENDER_INVALID: DevTools open");
  // }
}

/**
 * エラーをResult型に変換
 */
function toErrorResult<T>(error: unknown): Result<T> {
  return {
    success: false,
    error: {
      code: "UNKNOWN_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
      details: error,
    },
  };
}

// ========================================
// ハンドラー実装
// ========================================

export async function handleCheckInstallation(
  event: IpcMainInvokeEvent,
): Promise<Result<unknown>> {
  try {
    validateIpcSender(event);

    if (!cliManager) {
      throw new Error("CLI_MANAGER_NOT_INITIALIZED");
    }

    const status = await cliManager.checkInstallation();
    return { success: true, data: status };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function handleListSkills(
  event: IpcMainInvokeEvent,
  request: ListSkillsRequest,
): Promise<Result<unknown>> {
  try {
    validateIpcSender(event);

    if (!cliManager) {
      throw new Error("CLI_MANAGER_NOT_INITIALIZED");
    }

    const result = await cliManager.listSkills();

    // フィルタリング適用
    if (request?.filter) {
      const filtered = cliManager.filterSkills(request.filter);
      return {
        success: true,
        data: { ...result, skills: filtered },
      };
    }

    return { success: true, data: result };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function handleGetSkillDetail(
  event: IpcMainInvokeEvent,
  request: GetSkillDetailRequest,
): Promise<Result<unknown>> {
  try {
    validateIpcSender(event);

    if (!cliManager) {
      throw new Error("CLI_MANAGER_NOT_INITIALIZED");
    }

    // 実装は SkillScanner に委譲
    // const detail = await cliManager.getSkillDetail(request.skillName, {
    //   includeScripts: request.includeScripts,
    //   includeReferences: request.includeReferences,
    // });
    // return { success: true, data: detail };

    throw new Error("NOT_IMPLEMENTED");
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function handleExecuteScript(
  event: IpcMainInvokeEvent,
  request: ExecuteScriptRequest,
): Promise<Result<unknown>> {
  try {
    validateIpcSender(event);

    if (!cliManager) {
      throw new Error("CLI_MANAGER_NOT_INITIALIZED");
    }

    const webContents = event.sender;

    // ストリーミング出力のコールバック
    const onOutput = (message: unknown) => {
      webContents.send(CLAUDE_CLI_CHANNELS.OUTPUT_STREAM, message);
    };

    const session = await cliManager.executeScript(
      request.skillName,
      request.scriptName,
      request.args || [],
      onOutput,
    );

    return {
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
      },
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function handleTerminateSession(
  event: IpcMainInvokeEvent,
  request: TerminateSessionRequest,
): Promise<Result<unknown>> {
  try {
    validateIpcSender(event);

    if (!cliManager) {
      throw new Error("CLI_MANAGER_NOT_INITIALIZED");
    }

    await cliManager.terminateSession(request.sessionId);

    return {
      success: true,
      data: {
        sessionId: request.sessionId,
        terminated: true,
      },
    };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function handleListSessions(
  event: IpcMainInvokeEvent,
): Promise<Result<unknown>> {
  try {
    validateIpcSender(event);

    if (!cliManager) {
      throw new Error("CLI_MANAGER_NOT_INITIALIZED");
    }

    const sessions = cliManager.listSessions().map((s) => ({
      id: s.id,
      skillName: s.skillName,
      status: s.status,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
    }));

    return { success: true, data: sessions };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function handleGetSession(
  event: IpcMainInvokeEvent,
  request: GetSessionRequest,
): Promise<Result<unknown>> {
  try {
    validateIpcSender(event);

    if (!cliManager) {
      throw new Error("CLI_MANAGER_NOT_INITIALIZED");
    }

    const session = cliManager.getSession(request.sessionId);
    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    return { success: true, data: session };
  } catch (error) {
    return toErrorResult(error);
  }
}
```

---

## 6. セキュリティ要件

### 6.1 チェックリスト

| 要件                     | 実装                            | 確認方法                     |
| ------------------------ | ------------------------------- | ---------------------------- |
| チャンネルホワイトリスト | `CLAUDE_CLI_CHANNELS`定数で管理 | 定義外チャンネルはエラー     |
| sender検証               | `validateIpcSender()`           | DevTools/外部からの拒否      |
| パストラバーサル防止     | `validateSkillPath()`           | 攻撃パターンテストで検証     |
| 引数サニタイズ           | Zodスキーマによるバリデーション | 不正入力テストで検証         |
| プロセス分離             | `shell: false`でspawn           | コマンドインジェクション防止 |
| 型安全性                 | Result<T>型で統一               | TypeScript型チェック         |
| サンドボックス分離       | contextBridgeで公開             | contextIsolation=true        |

### 6.2 禁止事項

- ipcRenderer全体の公開
- nodeモジュールの直接公開
- ファイルシステムへの無制限アクセス
- シェルコマンドの無制限実行
- ホワイトリスト外チャンネルの使用

---

## 7. エラーレスポンス

### 7.1 エラー形式

```typescript
interface CliError {
  code: CliErrorCode;
  message: string;
  details?: unknown;
}

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: CliError };
```

### 7.2 エラーコード一覧

| コード                    | 説明                          |
| ------------------------- | ----------------------------- |
| `CLI_NOT_INSTALLED`       | CLIがインストールされていない |
| `CLI_TIMEOUT`             | CLI実行タイムアウト           |
| `SKILL_NOT_FOUND`         | スキルが見つからない          |
| `SKILL_INVALID`           | スキルのフォーマットが不正    |
| `SESSION_NOT_FOUND`       | セッションが見つからない      |
| `SESSION_LIMIT_EXCEEDED`  | セッション数上限超過          |
| `PATH_TRAVERSAL_DETECTED` | パストラバーサル攻撃検出      |
| `IPC_SENDER_INVALID`      | 不正なIPC呼び出し元           |
| `SCRIPT_NOT_FOUND`        | スクリプトが見つからない      |
| `UNSUPPORTED_SCRIPT_TYPE` | 未サポートのスクリプト形式    |
| `PROCESS_SPAWN_FAILED`    | プロセス起動失敗              |
| `UNKNOWN_ERROR`           | 不明なエラー                  |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-17 | 1.0.0      | 初版作成 |
