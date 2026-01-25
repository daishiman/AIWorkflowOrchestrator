# Hooks システム リファレンス

## イベント一覧

| イベント名         | タイミング             | 用途                       |
| ------------------ | ---------------------- | -------------------------- |
| PreToolUse         | ツール実行前           | バリデーション、承認フロー |
| PostToolUse        | ツール実行後           | ロギング、副作用処理       |
| PostToolUseFailure | ツール実行失敗後       | エラーハンドリング         |
| Notification       | 通知発生時             | ユーザー通知               |
| UserPromptSubmit   | プロンプト送信時       | 入力バリデーション         |
| SessionStart       | セッション開始時       | 初期化処理                 |
| SessionEnd         | セッション終了時       | クリーンアップ             |
| Stop               | 停止要求時             | 終了処理                   |
| SubagentStart      | サブエージェント起動時 | サブエージェント管理       |
| SubagentStop       | サブエージェント停止時 | サブエージェント管理       |
| PreCompact         | コンパクト処理前       | コンテキスト管理           |
| PermissionRequest  | 権限要求時             | 動的権限制御               |

---

## Hook コールバック型

```typescript
type HookCallback = (
  input: HookInput,
  toolUseID: string | undefined,
  options: { signal: AbortSignal },
) => Promise<HookJSONOutput>;

interface HookJSONOutput {
  proceed?: boolean;     // 処理続行フラグ
  message?: string;      // フィードバックメッセージ
  error?: string;        // エラーメッセージ
  data?: Record<string, unknown>;  // 追加データ
}
```

---

## 実装パターン

### PreToolUse: 危険コマンドのブロック

```typescript
const options: Options = {
  hooks: {
    PreToolUse: async (input, toolUseID, { signal }) => {
      // 危険なBashコマンドをブロック
      if (input.toolName === "Bash") {
        const dangerousPatterns = ["rm -rf", "sudo", "chmod 777", "dd if="];
        const command = input.args.command as string;

        for (const pattern of dangerousPatterns) {
          if (command.includes(pattern)) {
            return {
              proceed: false,
              message: `危険なコマンド "${pattern}" は許可されていません`,
            };
          }
        }
      }
      return { proceed: true };
    },
  },
};
```

### PostToolUse: ロギングとステータス更新

```typescript
const options: Options = {
  hooks: {
    PostToolUse: async (input, toolUseID, { signal }) => {
      // ツール使用をログに記録
      console.log(`[${new Date().toISOString()}] Tool: ${input.toolName}`);

      // 統計情報を更新
      toolUsageStats[input.toolName] = (toolUsageStats[input.toolName] || 0) + 1;

      return {};
    },
  },
};
```

### PermissionRequest: UI確認フロー

```typescript
const options: Options = {
  hooks: {
    PermissionRequest: async (input, toolUseID, { signal }) => {
      // UIダイアログを表示して承認を待つ
      const approved = await showPermissionDialog({
        toolName: input.toolName,
        args: input.args,
      });

      return { proceed: approved };
    },
  },
};
```

### SessionStart/SessionEnd: ライフサイクル管理

```typescript
const options: Options = {
  hooks: {
    SessionStart: async (input, toolUseID, { signal }) => {
      console.log("Session started:", input.sessionId);
      await initializeSession(input.sessionId);
      return {};
    },

    SessionEnd: async (input, toolUseID, { signal }) => {
      console.log("Session ended:", input.sessionId);
      await cleanupSession(input.sessionId);
      return {};
    },
  },
};
```

### PostToolUseFailure: エラーハンドリング

```typescript
const options: Options = {
  hooks: {
    PostToolUseFailure: async (input, toolUseID, { signal }) => {
      console.error(`Tool ${input.toolName} failed:`, input.error);

      // エラーメトリクスを記録
      await recordMetric("tool_failure", {
        toolName: input.toolName,
        error: input.error?.message,
      });

      return {};
    },
  },
};
```

### Notification: ユーザー通知

```typescript
const options: Options = {
  hooks: {
    Notification: async (input, toolUseID, { signal }) => {
      // デスクトップ通知を表示
      await showDesktopNotification({
        title: input.title,
        body: input.message,
      });

      return {};
    },
  },
};
```

### SubagentStart/SubagentStop: サブエージェント管理

```typescript
const options: Options = {
  hooks: {
    SubagentStart: async (input, toolUseID, { signal }) => {
      console.log(`Subagent started: ${input.subagentId}`);
      subagentRegistry.add(input.subagentId);
      return {};
    },

    SubagentStop: async (input, toolUseID, { signal }) => {
      console.log(`Subagent stopped: ${input.subagentId}`);
      subagentRegistry.delete(input.subagentId);
      return {};
    },
  },
};
```

---

## 複合Hook実装例

### Electron統合での完全なHook設定

```typescript
const options: Options = {
  hooks: {
    PreToolUse: async (input, toolUseID, { signal }) => {
      // 危険コマンドのブロック
      if (shouldBlockTool(input)) {
        return {
          proceed: false,
          message: "このツール使用は許可されていません",
        };
      }

      // UIで権限確認が必要な場合
      if (requiresUserApproval(input)) {
        const approved = await requestPermission(mainWindow, input);
        return { proceed: approved };
      }

      return { proceed: true };
    },

    PostToolUse: async (input, toolUseID) => {
      // ステータス更新
      mainWindow.webContents.send("agent:status", {
        type: "tool_completed",
        tool: input.toolName,
        timestamp: Date.now(),
      });
      return {};
    },

    PermissionRequest: async (input, toolUseID, { signal }) => {
      const approved = await requestPermission(mainWindow, input);
      return { proceed: approved };
    },

    SessionStart: async (input, toolUseID, { signal }) => {
      mainWindow.webContents.send("agent:status", {
        type: "session_started",
        sessionId: input.sessionId,
      });
      return {};
    },

    SessionEnd: async (input, toolUseID, { signal }) => {
      mainWindow.webContents.send("agent:status", {
        type: "session_ended",
      });
      return {};
    },
  },
};
```

---

## Hooks Factory パターン（TASK-3-1-B）

SkillExecutor等で再利用可能なHooks生成パターン。

### createHooks メソッド

```typescript
/** エラーカテゴリ */
type ErrorCategory =
  | "sdk_error"        // Claude Agent SDK内部エラー
  | "permission_denied" // 権限拒否（危険コマンド、保護パス）
  | "timeout"          // タイムアウト（AbortError含む）
  | "network"          // ネットワークエラー
  | "unknown";         // その他のエラー

/** Hooksストリームメッセージ（Discriminated Union） */
type HooksStreamMessage =
  | { executionId: string; type: "tool_use"; content: ToolUseContent; timestamp: number }
  | { executionId: string; type: "tool_result"; content: ToolResultContent; timestamp: number }
  | { executionId: string; type: "status"; content: StatusContent; timestamp: number }
  | { executionId: string; type: "error"; content: ErrorContent; timestamp: number };

/** PreToolUse結果 */
type PreToolUseResult = { proceed: true } | { proceed: false; message: string };

/**
 * Hooks オブジェクトを生成
 * @param executionId 実行を識別するユニークID
 * @returns PreToolUse/PostToolUse hooks
 */
function createHooks(executionId: string) {
  return {
    PreToolUse: async (
      input: HookInput,
      toolUseID: string | undefined,
      { signal }: { signal: AbortSignal }
    ): Promise<PreToolUseResult> => {
      // 1. AbortSignalチェック
      if (signal.aborted) {
        return { proceed: false, message: "実行がキャンセルされました" };
      }

      // 2. セキュリティチェック
      if (input.toolName === "Bash") {
        const command = input.args.command as string;
        if (isDangerousCommand(command)) {
          return { proceed: false, message: `危険なコマンドはブロックされました: ${command}` };
        }
      }

      if (input.toolName === "Write" || input.toolName === "Edit") {
        const path = input.args.file_path as string;
        if (isProtectedPath(path)) {
          return { proceed: false, message: `保護されたパスへの書き込みはブロックされました: ${path}` };
        }
      }

      // 3. ストリームメッセージ送信
      emitStreamMessage({
        executionId,
        type: "tool_use",
        content: { toolName: input.toolName, args: input.args },
        timestamp: Date.now(),
      });

      return { proceed: true };
    },

    PostToolUse: async (
      input: HookInput,
      toolUseID: string | undefined,
      { signal }: { signal: AbortSignal }
    ) => {
      // ツール実行完了を通知
      emitStreamMessage({
        executionId,
        type: "tool_result",
        content: { toolName: input.toolName, result: input.result },
        timestamp: Date.now(),
      });
      return {};
    },
  };
}
```

### セキュリティチェック関数

```typescript
/** 危険なコマンドパターン */
const DANGEROUS_PATTERNS = [
  /\brm\s+(-rf?|--recursive)\b/,
  /\bsudo\b/,
  /\bchmod\s+777\b/,
  /\bdd\s+if=/,
  /\bmkfs\b/,
  /\b>\s*\/dev\/sd[a-z]/,
];

/** 保護パスパターン */
const PROTECTED_PATHS = [
  /^\/etc\//,
  /^\/usr\//,
  /^\/bin\//,
  /^\/sbin\//,
  /\.env$/,
  /credentials\.(json|yaml|yml)$/,
];

/**
 * 危険なコマンドかどうかを判定
 */
function isDangerousCommand(command: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(command));
}

/**
 * 保護されたパスかどうかを判定
 */
function isProtectedPath(path: string): boolean {
  return PROTECTED_PATHS.some(pattern => pattern.test(path));
}
```

### エラーハンドリング関数

```typescript
/**
 * エラーをカテゴリに分類
 */
function categorizeError(error: unknown): ErrorCategory {
  if (error instanceof Error) {
    // AbortError → timeout
    if (error.name === "AbortError") return "timeout";

    // Network errors
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED")
    ) {
      return "network";
    }

    // Permission denied
    if (
      error.message.includes("permission") ||
      error.message.includes("blocked")
    ) {
      return "permission_denied";
    }

    // SDK errors
    if (error.message.includes("SDK") || error.message.includes("API")) {
      return "sdk_error";
    }
  }

  return "unknown";
}

/**
 * リトライ可能なエラーかどうかを判定
 */
function isRetryable(error: unknown): boolean {
  const category = categorizeError(error);
  // network と timeout のみリトライ可能
  return category === "network" || category === "timeout";
}
```

### 使用例（SkillExecutor）

```typescript
class SkillExecutor {
  async execute(phase: SkillPhase, projectPath: string): Promise<SkillExecutionResult> {
    const executionId = crypto.randomUUID();
    const hooks = this.createHooks(executionId);

    try {
      const conversation = query({
        prompt: this.buildPrompt(phase, projectPath),
        options: {
          tools: ["Read", "Edit", "Write", "Bash"],
          hooks,
          signal: this.abortController.signal,
        },
      });

      for await (const message of conversation.stream()) {
        this.handleStreamMessage(message);
      }

      return { success: true };
    } catch (error) {
      const category = this.categorizeError(error);
      const retryable = this.isRetryable(error);

      return {
        success: false,
        error: { category, message: String(error), retryable },
      };
    }
  }
}
```

📖 実装参照: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

---

## ベストプラクティス

### すべきこと

- signal.abortedを定期的にチェックする
- 非同期処理には適切なタイムアウトを設定する
- エラーは適切にログに記録する
- UIフィードバックを提供する

### 避けるべきこと

- Hookで長時間ブロッキング処理を行う
- signal.abortedのチェックを省略する
- エラーを握りつぶす
- 機密情報をログに出力する

---

## 関連ドキュメント

- [query-api.md](./query-api.md) - query() API
- [permission-control.md](./permission-control.md) - Permission Control
- [error-handling.md](./error-handling.md) - エラーハンドリング
- [electron-ipc.md](./electron-ipc.md) - Electron IPC統合
