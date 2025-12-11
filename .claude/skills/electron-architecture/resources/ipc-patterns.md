# IPC通信パターン集

## 基本パターン

### 1. Request-Response（同期的なデータ取得）

```typescript
// Main
ipcMain.handle("user:get", async (event, userId: string) => {
  const user = await database.getUser(userId);
  return user;
});

// Preload
contextBridge.exposeInMainWorld("api", {
  getUser: (userId: string) => ipcRenderer.invoke("user:get", userId),
});

// Renderer
const user = await window.api.getUser("123");
```

### 2. Fire-and-Forget（通知のみ）

```typescript
// Main
ipcMain.on("analytics:track", (event, eventName: string, data: any) => {
  analyticsService.track(eventName, data);
  // 戻り値なし
});

// Preload
contextBridge.exposeInMainWorld("api", {
  trackEvent: (name: string, data: any) =>
    ipcRenderer.send("analytics:track", name, data),
});

// Renderer
window.api.trackEvent("button_click", { buttonId: "save" });
```

### 3. Push Notification（Main → Renderer）

```typescript
// Main
function notifyProgress(win: BrowserWindow, progress: number) {
  win.webContents.send("download:progress", progress);
}

// Preload
contextBridge.exposeInMainWorld("api", {
  onDownloadProgress: (callback: (progress: number) => void) => {
    const handler = (_: any, progress: number) => callback(progress);
    ipcRenderer.on("download:progress", handler);
    return () => ipcRenderer.removeListener("download:progress", handler);
  },
});

// Renderer
useEffect(() => {
  return window.api.onDownloadProgress((progress) => {
    setProgress(progress);
  });
}, []);
```

### 4. Bidirectional Stream（双方向通信）

```typescript
// Main
ipcMain.handle("chat:connect", async (event) => {
  const sessionId = crypto.randomUUID();
  const win = BrowserWindow.fromWebContents(event.sender);

  chatService.onMessage(sessionId, (message) => {
    win?.webContents.send("chat:message", message);
  });

  return sessionId;
});

ipcMain.on("chat:send", (event, sessionId: string, message: string) => {
  chatService.sendMessage(sessionId, message);
});
```

## 高度なパターン

### 5. Typed IPC（型安全なIPC）

```typescript
// shared/ipc-types.ts
export interface IpcChannels {
  "file:read": {
    request: { path: string };
    response: { content: string } | { error: string };
  };
  "file:write": {
    request: { path: string; content: string };
    response: { success: boolean };
  };
}

// preload/typed-ipc.ts
type TypedInvoke = <K extends keyof IpcChannels>(
  channel: K,
  args: IpcChannels[K]["request"],
) => Promise<IpcChannels[K]["response"]>;

const typedInvoke: TypedInvoke = (channel, args) =>
  ipcRenderer.invoke(channel, args);

contextBridge.exposeInMainWorld("api", {
  readFile: (path: string) => typedInvoke("file:read", { path }),
  writeFile: (path: string, content: string) =>
    typedInvoke("file:write", { path, content }),
});
```

### 6. Batch Operations（バッチ処理）

```typescript
// Main
ipcMain.handle("files:batch-read", async (event, paths: string[]) => {
  const results = await Promise.all(
    paths.map(async (path) => {
      try {
        const content = await fs.promises.readFile(path, "utf-8");
        return { path, success: true, content };
      } catch (error) {
        return { path, success: false, error: error.message };
      }
    }),
  );
  return results;
});
```

### 7. Progress Reporting（進捗報告）

```typescript
// Main
ipcMain.handle("file:copy-large", async (event, src: string, dest: string) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const stat = await fs.promises.stat(src);
  let copied = 0;

  const readStream = fs.createReadStream(src);
  const writeStream = fs.createWriteStream(dest);

  readStream.on("data", (chunk: Buffer) => {
    copied += chunk.length;
    const progress = Math.round((copied / stat.size) * 100);
    win?.webContents.send("file:copy-progress", progress);
  });

  return new Promise((resolve, reject) => {
    readStream.pipe(writeStream);
    writeStream.on("finish", () => resolve({ success: true }));
    writeStream.on("error", reject);
  });
});
```

### 8. Cancellable Operations（キャンセル可能な操作）

```typescript
// Main
const runningTasks = new Map<string, AbortController>();

ipcMain.handle("task:start", async (event, taskId: string, params: any) => {
  const controller = new AbortController();
  runningTasks.set(taskId, controller);

  try {
    const result = await longRunningTask(params, controller.signal);
    return { success: true, result };
  } catch (error) {
    if (error.name === "AbortError") {
      return { success: false, cancelled: true };
    }
    throw error;
  } finally {
    runningTasks.delete(taskId);
  }
});

ipcMain.on("task:cancel", (event, taskId: string) => {
  const controller = runningTasks.get(taskId);
  controller?.abort();
});
```

## エラーハンドリング

### 統一エラー形式

```typescript
// shared/ipc-error.ts
export interface IpcError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type IpcResult<T> =
  | { success: true; data: T }
  | { success: false; error: IpcError };

// Main
ipcMain.handle(
  "file:read",
  async (event, path: string): Promise<IpcResult<string>> => {
    try {
      const content = await fs.promises.readFile(path, "utf-8");
      return { success: true, data: content };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || "UNKNOWN",
          message: error.message,
        },
      };
    }
  },
);

// Renderer
const result = await window.api.readFile("/path/to/file");
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.message);
}
```

## セキュリティ考慮事項

### 入力バリデーション

```typescript
// Main
import { z } from "zod";

const FileReadSchema = z.object({
  path: z
    .string()
    .min(1)
    .refine((p) => !p.includes(".."), "Path traversal not allowed"),
});

ipcMain.handle("file:read", async (event, args: unknown) => {
  const result = FileReadSchema.safeParse(args);
  if (!result.success) {
    return { success: false, error: "Invalid input" };
  }

  // 安全に処理
  const { path } = result.data;
  // ...
});
```

### 送信元検証

```typescript
// Main
ipcMain.handle("sensitive:action", async (event, data: any) => {
  const win = BrowserWindow.fromWebContents(event.sender);

  // メインウィンドウからのみ許可
  if (win?.id !== mainWindow.id) {
    return { success: false, error: "Unauthorized" };
  }

  // 処理を実行
});
```
