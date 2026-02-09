# IPC ドキュメント - 認証方式選択機能

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | TASK-AUTH-MODE-SELECTION-001 |
| 機能名   | auth-mode-selection          |
| 作成日   | 2026-02-09                   |

---

## IPC チャンネル一覧

### auth-mode:get

現在の認証方式を取得する。

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| チャンネル名 | `auth-mode:get`                              |
| 方向         | Renderer → Main                              |
| パラメータ   | なし                                         |
| 戻り値       | `AuthMode` (`"subscription"` \| `"api-key"`) |
| エラー       | なし（デフォルト値 `"subscription"` を返す） |

**使用例（Renderer側）**:

```typescript
const mode = await window.electronAPI.authMode.get();
console.log("現在の認証方式:", mode);
// 出力: "subscription" または "api-key"
```

**ハンドラ実装（Main側）**:

```typescript
ipcMain.handle("auth-mode:get", async (event) => {
  validateSender(event);
  return authModeService.getMode();
});
```

---

### auth-mode:set

認証方式を設定する。

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| チャンネル名 | `auth-mode:set`                    |
| 方向         | Renderer → Main                    |
| パラメータ   | `{ mode: AuthMode }`               |
| 戻り値       | `void`                             |
| エラー       | 無効な認証方式、バリデーション失敗 |

**使用例（Renderer側）**:

```typescript
try {
  await window.electronAPI.authMode.set({ mode: "api-key" });
  console.log("認証方式を切り替えました");
} catch (error) {
  console.error("切り替えに失敗しました:", error.message);
}
```

**ハンドラ実装（Main側）**:

```typescript
ipcMain.handle("auth-mode:set", async (event, { mode }) => {
  validateSender(event);

  // 入力バリデーション
  if (mode !== "subscription" && mode !== "api-key") {
    throw new Error("無効な認証方式です");
  }

  await authModeService.setMode(mode);

  // 変更通知を送信
  mainWindow.webContents.send("auth-mode:changed", { mode });
});
```

**パラメータスキーマ**:

```typescript
interface SetAuthModeParams {
  mode: AuthMode; // "subscription" | "api-key"
}
```

---

### auth-mode:status

認証状態の詳細を取得する。

| 項目         | 内容               |
| ------------ | ------------------ |
| チャンネル名 | `auth-mode:status` |
| 方向         | Renderer → Main    |
| パラメータ   | なし               |
| 戻り値       | `AuthModeStatus`   |
| エラー       | なし               |

**使用例（Renderer側）**:

```typescript
const status = await window.electronAPI.authMode.getStatus();
console.log("認証状態:", status);
// 出力例:
// {
//   mode: "subscription",
//   isValid: true,
//   lastValidated: "2026-02-09T12:00:00Z",
//   error: null
// }
```

**戻り値スキーマ**:

```typescript
interface AuthModeStatus {
  mode: AuthMode; // 現在の認証方式
  isValid: boolean; // 認証が有効かどうか
  lastValidated: string | null; // 最後に検証した日時（ISO 8601）
  error: string | null; // エラーメッセージ（サニタイズ済み）
}
```

---

### auth-mode:validate

現在の認証方式が有効かどうかを検証する。

| 項目         | 内容                   |
| ------------ | ---------------------- |
| チャンネル名 | `auth-mode:validate`   |
| 方向         | Renderer → Main        |
| パラメータ   | なし                   |
| 戻り値       | `{ isValid: boolean }` |
| エラー       | 検証中のエラー         |

**使用例（Renderer側）**:

```typescript
const { isValid } = await window.electronAPI.authMode.validate();
if (isValid) {
  console.log("認証は有効です");
} else {
  console.log("認証が必要です");
}
```

**検証ロジック**:

```typescript
// subscription モードの場合
if (mode === "subscription") {
  // Claude Code CLI のトークンが有効かどうかを確認
  const token = await subscriptionAuthProvider.getToken();
  return { isValid: token !== null };
}

// api-key モードの場合
if (mode === "api-key") {
  // AuthKeyService に有効なキーがあるかを確認
  const key = await authKeyService.getKey();
  return { isValid: key !== null && key.length > 0 };
}
```

---

### auth-mode:changed

認証方式が変更されたときに Main Process から Renderer Process に通知する。

| 項目         | 内容                 |
| ------------ | -------------------- |
| チャンネル名 | `auth-mode:changed`  |
| 方向         | Main → Renderer      |
| パラメータ   | `{ mode: AuthMode }` |
| 戻り値       | -                    |

**リスナー登録（Renderer側）**:

```typescript
// P5防止: モジュールレベルでリスナー登録をガード
let isListenerRegistered = false;

export function setupAuthModeListener(callback: (mode: AuthMode) => void) {
  if (isListenerRegistered) return;
  isListenerRegistered = true;

  window.electronAPI.authMode.onChanged((event, { mode }) => {
    callback(mode);
  });
}
```

**通知送信（Main側）**:

```typescript
// 認証方式変更時に通知を送信
authModeService.onModeChange((event) => {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send("auth-mode:changed", { mode: event.newMode });
  });
});
```

---

## セキュリティ仕様

### sender検証

すべてのIPCハンドラで送信元ウィンドウを検証する。

```typescript
function validateSender(event: IpcMainInvokeEvent): void {
  const senderFrame = event.senderFrame;

  // 信頼できるURLからのリクエストのみ許可
  if (!senderFrame?.url.startsWith("file://")) {
    throw new Error("Unauthorized sender");
  }
}
```

### エラーサニタイズ

内部エラー情報をRendererに漏洩しない。

```typescript
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // 既知のエラーメッセージのみ返す
    const knownErrors = [
      "無効な認証方式です",
      "Claude Code CLIでログインしてください",
      "APIキーが設定されていません",
    ];

    if (knownErrors.includes(error.message)) {
      return error.message;
    }
  }

  // 不明なエラーは汎用メッセージに置換
  return "認証処理中にエラーが発生しました";
}
```

### チャンネル名のホワイトリスト管理

```typescript
// apps/desktop/src/preload/channels.ts

export const AUTH_MODE_CHANNELS = {
  GET: "auth-mode:get",
  SET: "auth-mode:set",
  STATUS: "auth-mode:status",
  VALIDATE: "auth-mode:validate",
  CHANGED: "auth-mode:changed",
} as const;
```

---

## Preload Bridge API

### contextBridge での公開

```typescript
// apps/desktop/src/preload/index.ts

contextBridge.exposeInMainWorld("electronAPI", {
  authMode: {
    get: () => ipcRenderer.invoke(AUTH_MODE_CHANNELS.GET),
    set: (params: { mode: AuthMode }) =>
      ipcRenderer.invoke(AUTH_MODE_CHANNELS.SET, params),
    getStatus: () => ipcRenderer.invoke(AUTH_MODE_CHANNELS.STATUS),
    validate: () => ipcRenderer.invoke(AUTH_MODE_CHANNELS.VALIDATE),
    onChanged: (
      callback: (event: IpcRendererEvent, data: { mode: AuthMode }) => void,
    ) => ipcRenderer.on(AUTH_MODE_CHANNELS.CHANGED, callback),
  },
});
```

### 型定義

```typescript
// apps/desktop/src/preload/types.ts

interface ElectronAPI {
  authMode: {
    get(): Promise<AuthMode>;
    set(params: { mode: AuthMode }): Promise<void>;
    getStatus(): Promise<AuthModeStatus>;
    validate(): Promise<{ isValid: boolean }>;
    onChanged(
      callback: (event: IpcRendererEvent, data: { mode: AuthMode }) => void,
    ): void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```
