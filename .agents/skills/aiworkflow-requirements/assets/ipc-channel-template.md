# IPC チャンネル仕様テンプレート

> 用途: Electron IPC チャンネル、Preload API、セキュリティ要件の仕様定義
> 参考: api-endpoints.md, security-api-electron.md

---

## 概要

[機能名]のIPC通信仕様を定義する。

---

## IPC チャンネル一覧

### Main → Renderer

| チャンネル名 | 用途         | ペイロード   | セキュリティ   |
| ------------ | ------------ | ------------ | -------------- |
| `xxx:event`  | イベント通知 | `XxxPayload` | ホワイトリスト |

### Renderer → Main

| チャンネル名 | 用途           | リクエスト   | レスポンス                     |
| ------------ | -------------- | ------------ | ------------------------------ |
| `xxx:action` | アクション実行 | `XxxRequest` | `OperationResult<XxxResponse>` |

---

## 型定義

### リクエスト/レスポンス型

```typescript
// リクエスト型
export interface XxxRequest {
  id: string;
  data: unknown;
}

// レスポンス型
export interface XxxResponse {
  success: boolean;
  result?: unknown;
}

// 統一レスポンス型
export type OperationResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

### イベントペイロード型

```typescript
export interface XxxEventPayload {
  type: "created" | "updated" | "deleted";
  data: unknown;
  timestamp: number;
}
```

---

## Preload API

### window.xxxAPI

```typescript
export interface XxxAPI {
  // アクション
  action(request: XxxRequest): Promise<OperationResult<XxxResponse>>;

  // イベント購読
  onEvent(callback: (payload: XxxEventPayload) => void): () => void;

  // 状態取得
  getStatus(): Promise<XxxStatus>;
}
```

### Preload実装

```typescript
// preload.ts
contextBridge.exposeInMainWorld("xxxAPI", {
  action: (request: XxxRequest) => ipcRenderer.invoke("xxx:action", request),

  onEvent: (callback: (payload: XxxEventPayload) => void) => {
    const handler = (_: IpcRendererEvent, payload: XxxEventPayload) => {
      callback(payload);
    };
    ipcRenderer.on("xxx:event", handler);
    return () => ipcRenderer.off("xxx:event", handler);
  },
});
```

---

## Main Process Handler

```typescript
// main/handlers/xxxHandler.ts
export function registerXxxHandlers(ipcMain: IpcMain): void {
  ipcMain.handle("xxx:action", async (event, request: XxxRequest) => {
    try {
      const result = await xxxService.execute(request);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: { code: "XXX_ERROR", message: error.message },
      };
    }
  });
}
```

---

## セキュリティ要件

### チャンネルホワイトリスト

```typescript
const ALLOWED_CHANNELS = ["xxx:action", "xxx:event", "xxx:status"] as const;
```

### 入力バリデーション

```typescript
// Zodスキーマ
const XxxRequestSchema = z.object({
  id: z.string().uuid(),
  data: z.unknown(),
});

// バリデーション実行
const validated = XxxRequestSchema.parse(request);
```

### 権限チェック

| チャンネル | 必要権限 | チェック内容     |
| ---------- | -------- | ---------------- |
| xxx:action | user     | 認証済みユーザー |
| xxx:admin  | admin    | 管理者権限       |

---

## React Hook 統合

```typescript
// hooks/useXxx.ts
export function useXxx() {
  const [status, setStatus] = useState<XxxStatus | null>(null);

  useEffect(() => {
    const unsubscribe = window.xxxAPI.onEvent((payload) => {
      // イベント処理
    });
    return unsubscribe;
  }, []);

  const execute = useCallback(async (request: XxxRequest) => {
    return window.xxxAPI.action(request);
  }, []);

  return { status, execute };
}
```

---

## テスト要件

| テスト種別  | 対象         | カバレッジ目標 |
| ----------- | ------------ | -------------- |
| Handler単体 | Main Process | 90%+           |
| Hook単体    | useXxx       | 85%+           |
| 統合        | IPC往復      | 80%+           |

---

## 関連ドキュメント

| ドキュメント             | 説明                 |
| ------------------------ | -------------------- |
| api-endpoints.md         | IPC API一覧          |
| security-api-electron.md | Electronセキュリティ |
| architecture-patterns.md | IPC Handlerパターン  |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| YYYY-MM-DD | 1.0.0      | 初版作成 |
