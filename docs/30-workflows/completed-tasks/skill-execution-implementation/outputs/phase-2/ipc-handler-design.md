# IPCハンドラー設計 - スキル実行機能

## Phase 2 - タスク3: IPCハンドラー設計

### 作成日

2026-01-18

---

## IPC Channel 定義

### channels.ts への追加

```typescript
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  // ... 既存のチャンネル

  // Skill management operations
  SKILL_LIST_AVAILABLE: "skill:list-available",
  SKILL_LIST_IMPORTED: "skill:list-imported",
  SKILL_IMPORT: "skill:import",
  SKILL_REMOVE: "skill:remove",
  SKILL_GET_DETAIL: "skill:get-detail",
  SKILL_EXECUTE: "skill:execute", // 【追加】
} as const;
```

### ホワイトリストへの追加

```typescript
// apps/desktop/src/preload/channels.ts

export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存のチャンネル

  // Skill management channels
  IPC_CHANNELS.SKILL_LIST_AVAILABLE,
  IPC_CHANNELS.SKILL_LIST_IMPORTED,
  IPC_CHANNELS.SKILL_IMPORT,
  IPC_CHANNELS.SKILL_REMOVE,
  IPC_CHANNELS.SKILL_GET_DETAIL,
  IPC_CHANNELS.SKILL_EXECUTE, // 【追加】
];
```

---

## skill:execute ハンドラー設計

### 処理フロー

```
┌────────────────────────────────────────────────┐
│ ipcMain.handle("skill:execute", handler)       │
└─────────────────────┬──────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────┐
│ 1. validateIpcSender(event, channel, options)  │
│    - sender検証                                │
│    - 不正な場合: throw IPCValidationError      │
└─────────────────────┬──────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────┐
│ 2. args検証                                     │
│    - skillId が string かチェック              │
│    - 不正な場合: throw ValidationError         │
└─────────────────────┬──────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────┐
│ 3. skillService.executeSkill(skillId, params)  │
│    - スキル実行                                │
│    - 成功: SkillExecutionResult を返却         │
│    - 失敗: エラーをキャッチ                    │
└─────────────────────┬──────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────┐
│ 4. 結果を返却                                  │
│    - 成功: { success: true, data: result }     │
│    - 失敗: { success: false, error: message }  │
└────────────────────────────────────────────────┘
```

---

## ハンドラー実装設計

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts

// skill:execute - スキルを実行
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXECUTE,
  async (
    event: IpcMainInvokeEvent,
    args: { skillId: string; params?: Record<string, unknown> },
  ) => {
    // 1. Sender検証
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // 2. 引数検証
    if (typeof args?.skillId !== "string") {
      return {
        success: false,
        error: "skillId must be a string",
      };
    }

    // 3. スキル実行
    try {
      const result = await skillService.executeSkill(args.skillId, args.params);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "スキル実行に失敗しました",
      };
    }
  },
);
```

---

## unregisterSkillHandlers への追加

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts

export function unregisterSkillHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_LIST_AVAILABLE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_LIST_IMPORTED);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_IMPORT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_REMOVE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_GET_DETAIL);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_EXECUTE); // 【追加】
}
```

---

## セキュリティ検証

### validateIpcSender の使用

```typescript
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";

// 検証コード
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
  getAllowedWindows: () => [mainWindow],
});

if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

### 検証項目

| 検証項目            | 説明                                   |
| ------------------- | -------------------------------------- |
| sender 検証         | event.sender が mainWindow か確認      |
| webContents 検証    | 有効な webContents か確認              |
| allowedWindows 検証 | 許可されたウィンドウリストに含まれるか |

---

## 引数バリデーション

| パラメータ | 型                        | 必須 | バリデーション             |
| ---------- | ------------------------- | ---- | -------------------------- |
| skillId    | `string`                  | Yes  | typeof === "string"        |
| params     | `Record<string, unknown>` | No   | オプション、型チェックのみ |

---

## エラーハンドリング

### エラー種別と対応

| エラー種別         | 対応                                    |
| ------------------ | --------------------------------------- |
| IPCValidationError | throw してフレームワークに処理を委譲    |
| ValidationError    | `{ success: false, error: "..." }` 返却 |
| ServiceError       | `{ success: false, error: "..." }` 返却 |
| 予期しないエラー   | `{ success: false, error: "..." }` 返却 |

---

## 完了確認

- [x] SKILL_EXECUTE チャンネル定義を設計
- [x] ALLOWED_INVOKE_CHANNELS への追加を設計
- [x] ハンドラー処理フローを設計
- [x] sender検証を含む実装を設計
- [x] 引数バリデーションを設計
- [x] エラーハンドリングを設計
- [x] unregisterSkillHandlers への追加を設計
- [x] outputs/phase-2/ipc-handler-design.md に出力
