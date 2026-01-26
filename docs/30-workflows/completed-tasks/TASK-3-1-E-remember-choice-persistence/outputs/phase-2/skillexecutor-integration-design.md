# SkillExecutor連携設計

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-3-1-E                             |
| Phase    | 2                                      |
| 作成日   | 2026-01-25                             |
| 機能名   | task-3-1-e-remember-choice-persistence |

---

## 概要

SkillExecutorとPermissionStoreの連携方法を設計します。主に2つの連携ポイント:

1. **権限リクエスト前**: 許可済みツールの自動承認
2. **権限応答後**: `rememberChoice=true` の場合の永続化

---

## 依存性注入

### PermissionStoreのインジェクション

```typescript
export class SkillExecutor {
  private mainWindow: BrowserWindow;
  private activeExecutions: Map<string, ExecutionContext> = new Map();
  private permissionResolver: PermissionResolver;
  private permissionStore: IPermissionStore;  // 追加

  constructor(
    mainWindow: BrowserWindow,
    permissionStore?: IPermissionStore  // オプショナル（テスト用）
  ) {
    this.mainWindow = mainWindow;
    this.permissionResolver = new PermissionResolver();
    this.permissionStore = permissionStore ?? new PermissionStore();
  }
```

### 理由

- テスト時にモックを注入可能
- 将来的な拡張（複数ストア対応等）に対応

---

## 連携フロー

### 1. 自動許可チェック（sendPermissionRequest前）

```
sendPermissionRequest(executionId, toolName, args, signal)
    │
    ├─ permissionStore.isToolAllowed(toolName)
    │       │
    │       ├─ [true]
    │       │     └─ 自動承認レスポンスを返す（ダイアログスキップ）
    │       │
    │       └─ [false]
    │             └─ 通常の権限確認フローへ
    │
```

### 2. 永続化処理（handlePermissionResponse後）

```
handlePermissionResponse(requestId, approved, rememberChoice, rejectReason)
    │
    ├─ permissionResolver.resolveRequest(response)
    │
    └─ [rememberChoice && approved]
          └─ permissionStore.allowTool(toolName)
```

---

## コード変更

### sendPermissionRequest メソッドの変更

```typescript
/**
 * 権限リクエストを送信し、応答を待機する
 *
 * @param executionId - 実行ID
 * @param toolName - ツール名
 * @param args - ツール引数
 * @param signal - AbortSignal
 * @returns 権限応答
 */
async sendPermissionRequest(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<SkillPermissionResponse> {
  // ===== 追加: 自動許可チェック =====
  if (this.permissionStore.isToolAllowed(toolName)) {
    console.info(
      `[SkillExecutor] Tool auto-allowed: ${toolName}`
    );
    return {
      requestId: "",  // 自動許可の場合は空
      approved: true,
      rememberChoice: true,  // 既に記憶済み
    };
  }
  // ================================

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

### handlePermissionResponse メソッドの変更

```typescript
/**
 * 権限応答を処理する
 *
 * @param requestId - リクエストID
 * @param approved - 承認されたか
 * @param rememberChoice - 選択を記憶するか（オプション）
 * @param rejectReason - 拒否理由（オプション）
 * @param toolName - ツール名（永続化用、オプション）
 */
handlePermissionResponse(
  requestId: string,
  approved: boolean,
  rememberChoice?: boolean,
  rejectReason?: string,
  toolName?: string,  // 追加
): void {
  // ===== 追加: 永続化処理 =====
  if (rememberChoice && approved && toolName) {
    this.permissionStore.allowTool(toolName);
    console.info(
      `[SkillExecutor] Tool permission remembered: ${toolName}`
    );
  }
  // ============================

  this.permissionResolver.resolveRequest({
    requestId,
    approved,
    rememberChoice,
    rejectReason,
  });
}
```

---

## IPC ハンドラーの変更

### skill-handlers.ts の変更

```typescript
// apps/desktop/src/main/ipc/skill-handlers.ts

import { ipcMain } from "electron";
import { SKILL_CHANNELS } from "@repo/shared/src/ipc/channels";
import type { SkillExecutor } from "../services/skill/SkillExecutor";

export function registerSkillHandlers(skillExecutor: SkillExecutor): void {
  // 既存のハンドラー...

  // 権限応答ハンドラー（変更）
  ipcMain.on(SKILL_CHANNELS.SKILL_PERMISSION_RESPONSE, (_event, response) => {
    skillExecutor.handlePermissionResponse(
      response.requestId,
      response.approved,
      response.rememberChoice,
      response.rejectReason,
      response.toolName, // 追加: ツール名を渡す
    );
  });
}
```

### Renderer側の変更

権限応答送信時に `toolName` を含める:

```typescript
// apps/desktop/src/renderer/hooks/usePermissionDialog.ts

const handleApprove = (rememberChoice: boolean) => {
  window.electron.sendPermissionResponse({
    requestId: request.requestId,
    approved: true,
    rememberChoice,
    toolName: request.toolName, // 追加
  });
};
```

---

## PermissionStore公開メソッド

SkillExecutorから利用するため、以下のメソッドを公開:

```typescript
// SkillExecutorから利用
interface IPermissionStore {
  isToolAllowed(toolName: string): boolean; // 自動許可チェック
  allowTool(toolName: string): void; // 永続化
}
```

---

## テスト容易性

### モックの注入

```typescript
// テストコード例
describe("SkillExecutor", () => {
  let mockPermissionStore: jest.Mocked<IPermissionStore>;
  let skillExecutor: SkillExecutor;

  beforeEach(() => {
    mockPermissionStore = {
      isToolAllowed: jest.fn().mockReturnValue(false),
      allowTool: jest.fn(),
      revokeTool: jest.fn(),
      getAllowedTools: jest.fn().mockReturnValue([]),
      getAllowedToolEntries: jest.fn().mockReturnValue([]),
      clearAll: jest.fn(),
    };

    skillExecutor = new SkillExecutor(
      mockMainWindow,
      mockPermissionStore, // モックを注入
    );
  });

  it("should auto-allow tool when already permitted", async () => {
    mockPermissionStore.isToolAllowed.mockReturnValue(true);

    const response = await skillExecutor.sendPermissionRequest(
      "exec-1",
      "Read",
      { file_path: "/test.txt" },
    );

    expect(response.approved).toBe(true);
    expect(mockPermissionStore.isToolAllowed).toHaveBeenCalledWith("Read");
  });
});
```

---

## 注意事項

### セキュリティチェックとの関係

自動許可されても、PreToolUseフックのセキュリティチェック（危険コマンド、保護パス）は実行される:

```typescript
// createHooks 内のPreToolUseは変更なし
// 自動許可は「ダイアログをスキップ」するだけで、
// セキュリティチェックはバイパスしない
```

### ログ出力

| イベント | ログレベル | メッセージ例                                       |
| -------- | ---------- | -------------------------------------------------- |
| 自動許可 | info       | `[SkillExecutor] Tool auto-allowed: Read`          |
| 永続化   | info       | `[SkillExecutor] Tool permission remembered: Glob` |

---

## 関連ドキュメント

- [PermissionStore設計](./permission-store-design.md)
- [IPCチャネル設計](./ipc-channel-design.md)
- [シーケンス図](./sequence-diagrams.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
