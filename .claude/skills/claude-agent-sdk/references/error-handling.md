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

### SDKの自動リトライ

SDKは429エラー（レート制限）発生時に指数バックオフで自動リトライを行う。

### SkillExecutorのリトライ機構

SkillExecutorでは`executeWithRetry()`によるExponential Backoff with Jitterリトライを実装済み。レート制限を含む一時的エラーに対して自動リトライを行う。

| パラメータ     | デフォルト値 | 説明                   |
| -------------- | ------------ | ---------------------- |
| maxRetries     | 3            | 最大リトライ回数       |
| baseDelayMs    | 1000         | 基本待機時間（ms）     |
| maxDelayMs     | 30000        | 最大待機時間（ms）     |
| jitterFactor   | 0.2          | Jitter範囲（±20%）     |

詳細: [retry-patterns.md](./retry-patterns.md)

---

## 認証エラー (AUTHENTICATION_ERROR)

### エラーコード

| コード | 名称             | 説明                         | リトライ |
| ------ | ---------------- | ---------------------------- | -------- |
| 3001   | AUTH_KEY_NOT_SET | APIキーが設定されていない    | 不可     |
| 3002   | AUTH_KEY_INVALID | APIキーが無効                | 不可     |
| 3003   | AUTH_KEY_EXPIRED | APIキーの有効期限切れ        | 不可     |

### エラーハンドリングパターン

```typescript
import { AuthenticationError } from "@/types/errors";

try {
  const result = await skillExecutor.execute("hearing", projectPath);
} catch (error) {
  if (error instanceof AuthenticationError) {
    switch (error.code) {
      case 3001:
        // キー未設定 → 設定画面へ誘導
        showApiKeySettingsDialog();
        break;
      case 3002:
        // キー無効 → 再入力を促す
        showInvalidKeyError("APIキーが無効です。正しいキーを入力してください。");
        break;
      case 3003:
        // キー期限切れ → 再発行を促す
        showExpiredKeyError("APIキーの有効期限が切れています。");
        break;
    }
    return; // リトライ不可
  }
  throw error;
}
```

### HTTP ステータスコードとの対応

| HTTP Status | 認証エラー種別    | 対処                     |
| ----------- | ----------------- | ------------------------ |
| 401         | AUTH_KEY_INVALID  | キー再入力を促す         |
| 403         | AUTH_KEY_INVALID  | 権限不足、キー確認を促す |

**重要**: 認証エラーはリトライ不可。ユーザーに対してキーの再設定を促す。

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
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
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
- リトライ時にジッターを追加（Thundering Herd回避）
- リトライ対象/非対象を正しく分類

### 避けるべきこと

- エラーを握りつぶす
- 無限リトライ
- 機密情報をエラーメッセージに含める
- タイムアウトなしの無期限待機
- signal.abortedチェックの省略
- 認証エラーやバリデーションエラーにリトライを実行

---

## 関連ドキュメント

- [retry-patterns.md](./retry-patterns.md) - リトライパターン詳細（Exponential Backoff, Jitter, エラー分類）
- [query-api.md](./query-api.md) - query() API
- [hooks-system.md](./hooks-system.md) - Hooksシステム
- [electron-ipc.md](./electron-ipc.md) - Electron IPC統合
