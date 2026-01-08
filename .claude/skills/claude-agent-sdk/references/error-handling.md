# エラーハンドリング リファレンス

## AbortSignal 活用

### 基本パターン

```typescript
const controller = new AbortController();
const { signal } = controller;

// タイムアウト設定
setTimeout(() => controller.abort(), 30000);

const conversation = query({
  prompt: "Long running task...",
  options: {
    hooks: {
      PreToolUse: async (input, toolUseID, { signal }) => {
        // signal.aborted をチェック
        if (signal.aborted) {
          return { proceed: false, message: "Aborted" };
        }
        return { proceed: true };
      },
    },
  },
});
```

### Hook内でのシグナルチェック

```typescript
const options: Options = {
  hooks: {
    PreToolUse: async (input, toolUseID, { signal }) => {
      // 長時間処理の前にチェック
      if (signal.aborted) {
        return { proceed: false, message: "Operation cancelled" };
      }

      // 非同期処理
      const result = await someAsyncOperation();

      // 処理後にも再チェック
      if (signal.aborted) {
        return { proceed: false, message: "Operation cancelled" };
      }

      return { proceed: true, data: result };
    },
  },
};
```

---

## タイムアウト設定

### 環境変数

```bash
# MCPツールのタイムアウト設定
MCP_TOOL_TIMEOUT=60000  # 60秒
```

### Bashツール個別設定

```typescript
// Bashツールは最大600000ms（10分）まで設定可能
const bashInput = {
  command: "long-running-script.sh",
  timeout: 300000, // 5分
};
```

### カスタムタイムアウト実装

```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = "Operation timed out",
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// 使用例
const result = await withTimeout(
  someAsyncOperation(),
  30000,
  "Operation took too long",
);
```

---

## レート制限対応

### 自動リトライ

SDKは429エラー（レート制限）発生時に指数バックオフで自動リトライを行います:

```
リトライ間隔: 1s → 2s → 4s → 8s → 16s（最大5回）
```

### 手動リトライ実装

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (!error.message?.includes("429")) throw error;

      const delay = Math.min(1000 * Math.pow(2, i), 16000);
      console.log(`Rate limited, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
```

### ジッターを追加したバックオフ

```typescript
async function withRetryAndJitter<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (!error.message?.includes("429")) throw error;

      // ジッターを追加してサンダリングハード問題を回避
      const baseDelay = Math.min(1000 * Math.pow(2, i), 16000);
      const jitter = Math.random() * 1000;
      const delay = baseDelay + jitter;

      console.log(`Rate limited, retrying in ${Math.round(delay)}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
```

---

## エラーハンドリングパターン

### ストリーミングエラー処理

```typescript
try {
  for await (const message of conversation.stream()) {
    if (message.type === "error") {
      console.error("Error:", message.error);
      // エラー回復ロジック
    }
  }
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Operation was aborted");
  } else if (error.message?.includes("429")) {
    console.log("Rate limited - backing off");
    await delay(5000);
  } else {
    throw error;
  }
}
```

### Hook内エラー処理

```typescript
const options: Options = {
  hooks: {
    PostToolUseFailure: async (input, toolUseID, { signal }) => {
      console.error(`Tool ${input.toolName} failed:`, input.error);

      // エラー種別に応じた処理
      if (input.error?.message?.includes("timeout")) {
        // タイムアウトエラー
        await notifyUser("操作がタイムアウトしました");
      } else if (input.error?.message?.includes("permission")) {
        // 権限エラー
        await notifyUser("権限が不足しています");
      } else {
        // その他のエラー
        await notifyUser("エラーが発生しました");
      }

      return {};
    },
  },
};
```

### Electron IPC エラー処理

```typescript
async function processStream(mainWindow: BrowserWindow) {
  if (!currentConversation) return;

  try {
    for await (const message of currentConversation.stream()) {
      mainWindow.webContents.send("agent:stream", {
        type: message.type,
        data: sanitizeMessageForIPC(message),
        timestamp: Date.now(),
      });
    }

    mainWindow.webContents.send("agent:status", {
      type: "completed",
      timestamp: Date.now(),
    });
  } catch (error) {
    // エラーの種類を判定
    const errorType = classifyError(error);

    mainWindow.webContents.send("agent:status", {
      type: "error",
      errorType,
      error: sanitizeErrorMessage(error),
      timestamp: Date.now(),
    });
  }
}

function classifyError(error: unknown): string {
  const message = String(error);

  if (message.includes("abort")) return "aborted";
  if (message.includes("429")) return "rate_limited";
  if (message.includes("timeout")) return "timeout";
  if (message.includes("network")) return "network";
  return "unknown";
}

function sanitizeErrorMessage(error: unknown): string {
  // 機密情報を除去
  const message = String(error);
  return message.replace(/sk-ant-[a-zA-Z0-9]+/g, "[REDACTED]");
}
```

---

## エラー回復戦略

### 再接続パターン

```typescript
class AgentConnection {
  private retryCount = 0;
  private maxRetries = 3;
  private conversation: ReturnType<typeof query> | null = null;

  async connect(prompt: string, options: Options): Promise<void> {
    while (this.retryCount < this.maxRetries) {
      try {
        this.conversation = query({ prompt, options });
        this.retryCount = 0; // 成功したらリセット
        return;
      } catch (error) {
        this.retryCount++;
        console.log(`Connection failed, retry ${this.retryCount}/${this.maxRetries}`);

        if (this.retryCount >= this.maxRetries) {
          throw error;
        }

        await this.backoff();
      }
    }
  }

  private async backoff(): Promise<void> {
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 10000);
    await new Promise((r) => setTimeout(r, delay));
  }
}
```

---

## ベストプラクティス

### すべきこと

- signal.abortedを定期的にチェック
- エラーをログに記録（機密情報除去）
- ユーザーにわかりやすいエラーメッセージを表示
- 適切なタイムアウト値を設定
- リトライ時にジッターを追加

### 避けるべきこと

- エラーを握りつぶす
- 無限リトライ
- 機密情報をエラーメッセージに含める
- タイムアウトなしの無期限待機
- signal.abortedチェックの省略

---

## 関連ドキュメント

- [query-api.md](./query-api.md) - query() API
- [hooks-system.md](./hooks-system.md) - Hooksシステム
- [electron-ipc.md](./electron-ipc.md) - Electron IPC統合
