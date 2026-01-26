# IPC通信設計書

## メタ情報

| 項目   | 内容                            |
| ------ | ------------------------------- |
| Phase  | 2                               |
| 作成日 | 2026-01-25                      |
| 機能名 | TASK-3-1-D-permission-dialog-ui |

---

## 1. 設計方針

### 1.1 採用方式

**オプションB: 専用チャネル方式を採用**

| 方式        | メリット                   | デメリット                   | 採用 |
| ----------- | -------------------------- | ---------------------------- | ---- |
| オプションA | 既存チャネル活用、追加不要 | メッセージ分岐が複雑         | ❌   |
| オプションB | 明確な責務分離             | チャネル追加・許可リスト更新 | ✅   |

**採用理由**:

- SKILL_STREAMチャネルの複雑化を回避
- agentAPIとskillAPIの責務を明確に分離
- TASK-3-1-Cで既にチャネル定義が`packages/shared/src/ipc/channels.ts`に存在

---

## 2. IPCチャネル定義

### 2.1 使用するチャネル

| チャネル名                 | 値                         | 方向            | 用途               |
| -------------------------- | -------------------------- | --------------- | ------------------ |
| `SKILL_PERMISSION_REQUEST` | `skill:permission:request` | Main → Renderer | 権限リクエスト送信 |
| `SKILL_PERMISSION_RESPOND` | `skill:permission:respond` | Renderer → Main | 権限応答送信       |

### 2.2 既存定義（packages/shared/src/ipc/channels.ts）

```typescript
export const SKILL_CHANNELS = {
  // ... 既存チャネル
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",
};
```

**注意**: 既存定義では`SKILL_PERMISSION_RESPONSE`となっているが、本設計では`SKILL_PERMISSION_RESPOND`で統一する。必要に応じて定義を確認・調整する。

### 2.3 preload/channels.ts への追加

```typescript
// IPC_CHANNELS への追加
export const IPC_CHANNELS = {
  // ... 既存チャネル
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  SKILL_PERMISSION_RESPOND: "skill:permission:respond",
} as const;

// ALLOWED_ON_CHANNELS への追加（Main → Renderer 受信用）
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // ... 既存チャネル
  IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
];

// ALLOWED_INVOKE_CHANNELS への追加（Renderer → Main 送信用）
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存チャネル
  IPC_CHANNELS.SKILL_PERMISSION_RESPOND,
];
```

---

## 3. 通信シーケンス

### 3.1 正常フロー

```
Main Process (SkillExecutor)              Renderer Process (SkillStreamDisplay)
        |                                              |
        | [1] sendPermissionRequest()                  |
        |                                              |
        | ----------- skill:permission:request ------->|
        |   {                                          |
        |     executionId: "exec-xxx",                 |
        |     requestId: "req-xxx",                    |
        |     toolName: "Bash",                        |
        |     args: { command: "echo test" },          |
        |     reason: "コマンドを実行: echo test"       |
        |   }                                          |
        |                                              | [2] onPermission() callback
        |                                              |
        |                                              | [3] ダイアログ表示
        |                                              |
        |                                              | [4] ユーザー選択
        |                                              |
        |<---------- skill:permission:respond ---------|
        |   {                                          | [5] respondPermission()
        |     requestId: "req-xxx",                    |
        |     approved: true/false,                    |
        |     rememberChoice: true/false               |
        |   }                                          |
        |                                              |
        | [6] handlePermissionResponse()               |
        | [7] PermissionResolver.resolveRequest()      |
        |                                              |
```

### 3.2 タイムアウトフロー

```
Main Process                              Renderer Process
        |                                              |
        | ----------- skill:permission:request ------->|
        |                                              |
        | [タイムアウト待機]                             |
        |                                              | (応答なし)
        |                                              |
        | [PermissionResolver タイムアウト]              |
        | → approved: false で自動解決                  |
        |                                              |
```

---

## 4. メッセージフォーマット

### 4.1 権限リクエスト（Main → Renderer）

```typescript
interface SkillPermissionRequestMessage {
  /** リクエストID */
  requestId: string;
  /** 実行ID */
  executionId: string;
  /** ツール名 */
  toolName: string;
  /** サニタイズ済み引数 */
  args: Record<string, unknown>;
  /** 理由説明（日本語） */
  reason: string;
}
```

**例**:

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "executionId": "abc12345-6789-def0-1234-567890abcdef",
  "toolName": "Bash",
  "args": {
    "command": "echo hello"
  },
  "reason": "コマンドを実行: echo hello"
}
```

### 4.2 権限応答（Renderer → Main）

```typescript
interface SkillPermissionResponseMessage {
  /** リクエストID */
  requestId: string;
  /** 許可/拒否 */
  approved: boolean;
  /** 選択を記憶 */
  rememberChoice?: boolean;
}
```

**例（許可）**:

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "approved": true,
  "rememberChoice": false
}
```

**例（拒否）**:

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "approved": false,
  "rememberChoice": true
}
```

---

## 5. Main Process側実装（TASK-3-1-Cで実装済み）

### 5.1 送信側（SkillExecutor.sendPermissionRequest）

```typescript
async sendPermissionRequest(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<SkillPermissionResponse> {
  const requestId = uuidv4();

  // Renderer に権限リクエストを送信
  if (!this.mainWindow.isDestroyed()) {
    this.mainWindow.webContents.send(
      SKILL_CHANNELS.SKILL_PERMISSION_REQUEST,
      {
        executionId,
        requestId,
        toolName,
        args: this.sanitizeArgs(args),
        reason: this.getPermissionReason(toolName, args),
      },
    );
  }

  // 応答を待機
  return this.permissionResolver.waitForResponse(requestId, signal);
}
```

### 5.2 受信側（IPCハンドラー）

```typescript
// apps/desktop/src/main/ipc/skill-handlers.ts
import { ipcMain } from "electron";
import { SKILL_CHANNELS } from "@repo/shared/src/ipc/channels";

export function registerSkillPermissionHandlers(
  skillExecutor: SkillExecutor,
): void {
  ipcMain.on(
    SKILL_CHANNELS.SKILL_PERMISSION_RESPONSE,
    (_, response: SkillPermissionResponse) => {
      skillExecutor.handlePermissionResponse(
        response.requestId,
        response.approved,
        response.rememberChoice,
      );
    },
  );
}
```

---

## 6. Renderer Process側実装（本タスクで実装）

### 6.1 受信側（skillAPI.onPermission）

```typescript
onPermission: (
  callback: (request: SkillPermissionRequest) => void,
): (() => void) => {
  return safeOn<SkillPermissionRequest>(
    IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
    callback,
  );
},
```

### 6.2 送信側（skillAPI.respondPermission）

```typescript
respondPermission: (
  response: SkillPermissionResponse,
): Promise<boolean> => {
  return safeInvoke<boolean>(
    IPC_CHANNELS.SKILL_PERMISSION_RESPOND,
    response,
  );
},
```

---

## 7. セキュリティ考慮事項

### 7.1 チャネルホワイトリスト

| チャネル                 | 登録先                  | セキュリティ機能   |
| ------------------------ | ----------------------- | ------------------ |
| SKILL_PERMISSION_REQUEST | ALLOWED_ON_CHANNELS     | safeOn()で検証     |
| SKILL_PERMISSION_RESPOND | ALLOWED_INVOKE_CHANNELS | safeInvoke()で検証 |

### 7.2 データ検証

| 検証項目            | 実施箇所         | 内容                        |
| ------------------- | ---------------- | --------------------------- |
| requestIdの存在確認 | Main Process     | 応答受信時にMap存在チェック |
| argsのサニタイズ    | Main Process     | 機密情報除去、長文省略      |
| チャネル許可確認    | Renderer Process | safeOn/safeInvokeで自動検証 |

### 7.3 不正リクエスト対策

- Main Process以外からの`skill:permission:request`は`contextBridge`により防止
- 不正な`requestId`の応答はMain Process側で無視（ログ出力のみ）

---

## 8. エラーハンドリング

### 8.1 IPC送信エラー

| エラー         | Main側対応                 | Renderer側対応 |
| -------------- | -------------------------- | -------------- |
| ウィンドウ破棄 | 送信スキップ               | -              |
| チャネル未許可 | -                          | Promise.reject |
| 送信失敗       | ログ出力、タイムアウト待機 | Promise.reject |

### 8.2 タイムアウト

- Main Process側の`PermissionResolver`がタイムアウト管理
- デフォルトタイムアウト: 30秒
- タイムアウト時は`approved: false`として処理

---

## 9. 統合テスト観点

### 9.1 IPC通信テストシナリオ

| シナリオ                 | 検証内容                                |
| ------------------------ | --------------------------------------- |
| 正常な権限リクエスト受信 | コールバックが正しいデータで呼ばれる    |
| 正常な権限応答送信       | Main Processが正しく応答を受信する      |
| requestId紐付け          | 同一requestIdでリクエストと応答が紐付く |
| 複数リクエストの処理     | 各リクエストが独立して処理される        |
| ウィンドウ破棄時の送信   | 例外が発生しない                        |

### 9.2 モック設計

```typescript
// テスト用モック
const mockIpcRenderer = {
  on: vi.fn(),
  removeListener: vi.fn(),
  invoke: vi.fn().mockResolvedValue(true),
};
```

---

## 10. 関連ファイル

| ファイル                                                | 役割                     |
| ------------------------------------------------------- | ------------------------ |
| `packages/shared/src/ipc/channels.ts`                   | チャネル定義（共有）     |
| `apps/desktop/src/preload/channels.ts`                  | チャネル定義・許可リスト |
| `apps/desktop/src/preload/skill-api.ts`                 | Renderer側IPC実装        |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | Main側IPC実装            |
