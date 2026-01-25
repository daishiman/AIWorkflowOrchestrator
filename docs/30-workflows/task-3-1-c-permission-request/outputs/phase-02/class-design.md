# クラス設計書 - PermissionRequest Hook 統合

## メタ情報

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | TASK-3-1-C                  |
| Phase    | 2 - 設計                    |
| 作成日   | 2026-01-25                  |
| 機能名   | PermissionRequest Hook 統合 |

---

## 既存クラス構造（TASK-3-1-A）

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

export class SkillExecutor {
  private mainWindow: BrowserWindow;
  private activeExecutions: Map<string, ExecutionContext>;
  private readonly maxConcurrentExecutions: number;
  private readonly defaultTimeout: number;

  constructor(mainWindow: BrowserWindow);

  // Public Methods
  async execute(
    request: SkillExecutionRequest,
    skill: SkillMetadata,
  ): Promise<SkillExecutionResponse>;
  abort(executionId: string): boolean;
  getActiveExecutions(): ExecutionInfo[];
  getExecutionStatus(executionId: string): ExecutionInfo | undefined;

  // Private Methods
  private async callSDKQuery(
    prompt: string,
    options: SDKQueryOptions,
  ): Promise<{ stream: () => AsyncIterable<SDKMessage> }>;
  private async buildPrompt(
    userPrompt: string,
    skill: SkillMetadata,
  ): Promise<string>;
  private buildContextInfo(skill: SkillMetadata): string;
  private async handleStreamMessage(
    executionId: string,
    message: unknown,
  ): Promise<void>;
  private convertToStreamMessage(
    executionId: string,
    message: unknown,
  ): SkillStreamMessage | null;
  private sendStream(message: SkillStreamMessage): void;
  private updateExecutionState(
    executionId: string,
    state: ExecutionState,
  ): void;
  private handleExecutionError(
    executionId: string,
    error: unknown,
  ): SkillExecutionResponse;
  private convertToSkillError(error: unknown): SkillExecutionError;
  private logError(
    executionId: string,
    error: SkillExecutionError,
    originalError?: unknown,
  ): void;
  private cleanup(executionId: string): void;
}
```

---

## 拡張後クラス構造（TASK-3-1-C）

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

import { PermissionResolver } from "./PermissionResolver";

export class SkillExecutor {
  private mainWindow: BrowserWindow;
  private activeExecutions: Map<string, ExecutionContext>;
  private readonly maxConcurrentExecutions: number;
  private readonly defaultTimeout: number;
  private readonly permissionResolver: PermissionResolver; // 追加

  constructor(mainWindow: BrowserWindow);

  // Public Methods (既存)
  async execute(
    request: SkillExecutionRequest,
    skill: SkillMetadata,
  ): Promise<SkillExecutionResponse>;
  abort(executionId: string): boolean;
  getActiveExecutions(): ExecutionInfo[];
  getExecutionStatus(executionId: string): ExecutionInfo | undefined;

  // Public Methods (追加)
  handlePermissionResponse(
    requestId: string,
    approved: boolean,
    rememberChoice?: boolean,
    rejectReason?: string,
  ): void;

  // Private Methods (既存)
  private async callSDKQuery(...): Promise<...>;
  private async buildPrompt(...): Promise<string>;
  private buildContextInfo(...): string;
  private async handleStreamMessage(...): Promise<void>;
  private convertToStreamMessage(...): SkillStreamMessage | null;
  private sendStream(...): void;
  private updateExecutionState(...): void;
  private handleExecutionError(...): SkillExecutionResponse;
  private convertToSkillError(...): SkillExecutionError;
  private logError(...): void;
  private cleanup(...): void;

  // Private Methods (追加)
  private createHooks(executionId: string): Hooks;
  private sanitizeArgs(args: Record<string, unknown>): Record<string, unknown>;
  private getPermissionReason(
    toolName: string,
    args: Record<string, unknown>,
  ): string;
  private sendPermissionRequest(
    executionId: string,
    requestId: string,
    toolName: string,
    args: Record<string, unknown>,
    reason: string,
  ): void;
}
```

---

## 追加プロパティ

### permissionResolver

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| 型           | `PermissionResolver`                        |
| アクセス修飾 | `private readonly`                          |
| 初期化       | コンストラクタで `new PermissionResolver()` |
| 用途         | 権限リクエストの待機・解決管理              |

---

## 追加メソッド

### handlePermissionResponse (public)

Renderer からの権限応答を処理する。

```typescript
/**
 * 権限応答を処理する
 *
 * @param requestId - 権限リクエストID
 * @param approved - 承認/拒否
 * @param rememberChoice - 選択を記憶するか
 * @param rejectReason - 拒否理由
 */
public handlePermissionResponse(
  requestId: string,
  approved: boolean,
  rememberChoice?: boolean,
  rejectReason?: string,
): void {
  this.permissionResolver.resolveRequest({
    requestId,
    approved,
    rememberChoice,
    rejectReason,
  });
}
```

### createHooks (private)

SDK に渡す Hooks オブジェクトを生成する。

```typescript
/**
 * SDK Hooks を生成する
 *
 * @param executionId - スキル実行ID
 * @returns Hooks オブジェクト
 */
private createHooks(executionId: string): Hooks {
  return {
    permissionRequest: async (
      input: { toolName: string; args: Record<string, unknown> },
      toolUseId: string,
      context: { signal: AbortSignal },
    ) => {
      const requestId = uuidv4();

      // 引数サニタイズ
      const sanitizedArgs = this.sanitizeArgs(input.args);

      // 理由生成
      const reason = this.getPermissionReason(input.toolName, input.args);

      // Renderer に権限リクエスト送信
      this.sendPermissionRequest(
        executionId,
        requestId,
        input.toolName,
        sanitizedArgs,
        reason,
      );

      try {
        // 応答待機（タイムアウト: 30秒）
        const response = await this.permissionResolver.waitForResponse(
          requestId,
          context.signal,
          30000,
        );

        if (response.approved) {
          return { behavior: "allow" };
        } else {
          return {
            behavior: "deny",
            message: response.rejectReason || "ユーザーにより拒否されました",
          };
        }
      } catch (error) {
        // タイムアウトまたはキャンセル
        return {
          behavior: "deny",
          message:
            error instanceof Error
              ? error.message
              : "権限確認がタイムアウトしました",
        };
      }
    },
  };
}
```

### sanitizeArgs (private)

機密情報を除去する。

```typescript
/**
 * ツール引数をサニタイズする
 *
 * @param args - 元の引数
 * @returns サニタイズ済み引数
 */
private sanitizeArgs(args: Record<string, unknown>): Record<string, unknown>;
```

### getPermissionReason (private)

人間可読な理由文を生成する。

```typescript
/**
 * 権限リクエスト理由を生成する
 *
 * @param toolName - ツール名
 * @param args - ツール引数
 * @returns 日本語理由文
 */
private getPermissionReason(
  toolName: string,
  args: Record<string, unknown>,
): string;
```

### sendPermissionRequest (private)

IPC 経由で Renderer に権限リクエストを送信する。

```typescript
/**
 * 権限リクエストを送信する
 *
 * @param executionId - スキル実行ID
 * @param requestId - 権限リクエストID
 * @param toolName - ツール名
 * @param args - サニタイズ済み引数
 * @param reason - 理由文
 */
private sendPermissionRequest(
  executionId: string,
  requestId: string,
  toolName: string,
  args: Record<string, unknown>,
  reason: string,
): void {
  if (this.mainWindow.isDestroyed()) {
    return;
  }

  this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_PERMISSION_REQUEST, {
    executionId,
    requestId,
    toolName,
    args,
    reason,
  });
}
```

---

## execute メソッドの変更点

```typescript
async execute(
  request: SkillExecutionRequest,
  skill: SkillMetadata,
): Promise<SkillExecutionResponse> {
  // ... 既存の前処理 ...

  try {
    const fullPrompt = await this.buildPrompt(request.prompt, skill);

    // Hooks を生成（追加）
    const hooks = this.createHooks(executionId);

    // query() に hooks を渡す（変更）
    const response = await this.callSDKQuery(fullPrompt, {
      tools: skill.allowedTools || [...DEFAULT_TOOLS],
      permissionMode: "default",
      signal: abortController.signal,
      timeout: request.timeout ?? this.defaultTimeout,
      hooks, // 追加
    });

    // ... 以降は既存と同様 ...
  }
}
```

---

## クラス図

```
┌─────────────────────────────────────────────────────────────┐
│                      SkillExecutor                          │
├─────────────────────────────────────────────────────────────┤
│ - mainWindow: BrowserWindow                                 │
│ - activeExecutions: Map<string, ExecutionContext>           │
│ - maxConcurrentExecutions: number                           │
│ - defaultTimeout: number                                    │
│ - permissionResolver: PermissionResolver  ←【追加】         │
├─────────────────────────────────────────────────────────────┤
│ + execute(request, skill): Promise<Response>                │
│ + abort(executionId): boolean                               │
│ + getActiveExecutions(): ExecutionInfo[]                    │
│ + getExecutionStatus(executionId): ExecutionInfo            │
│ + handlePermissionResponse(...)  ←【追加】                  │
├─────────────────────────────────────────────────────────────┤
│ - callSDKQuery(prompt, options): Promise<...>               │
│ - buildPrompt(userPrompt, skill): Promise<string>           │
│ - buildContextInfo(skill): string                           │
│ - handleStreamMessage(executionId, message): Promise<void>  │
│ - convertToStreamMessage(executionId, message): Message     │
│ - sendStream(message): void                                 │
│ - updateExecutionState(executionId, state): void            │
│ - handleExecutionError(executionId, error): Response        │
│ - convertToSkillError(error): SkillExecutionError           │
│ - logError(executionId, error, original?): void             │
│ - cleanup(executionId): void                                │
│ - createHooks(executionId): Hooks  ←【追加】                │
│ - sanitizeArgs(args): Record<string, unknown>  ←【追加】    │
│ - getPermissionReason(toolName, args): string  ←【追加】    │
│ - sendPermissionRequest(...)  ←【追加】                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ uses
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PermissionResolver                       │
│                     (TASK-3-2 実装)                         │
├─────────────────────────────────────────────────────────────┤
│ - pendingRequests: Map<string, PendingRequest>              │
│ - defaultTimeout: number                                    │
├─────────────────────────────────────────────────────────────┤
│ + waitForResponse(requestId, signal?, timeout?): Promise    │
│ + resolveRequest(response): void                            │
│ + cancelRequest(requestId, reason?): void                   │
│ + cancelAll(): void                                         │
│ + pendingCount: number                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
