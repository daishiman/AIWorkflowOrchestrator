# Phase 2: IPC 設計書 - SafetyGate ハンドラ

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 2                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 1. チャンネル定義

### channels.ts への追加

```typescript
// IPC_CHANNELS オブジェクト内
SKILL_EVALUATE_SAFETY: "skill:evaluate-safety",
```

### ホワイトリスト登録

```typescript
// ALLOWED_INVOKE_CHANNELS 配列に追加
IPC_CHANNELS.SKILL_EVALUATE_SAFETY,
```

## 2. ハンドラ設計

### ファイル: `apps/desktop/src/main/ipc/safetyGateHandlers.ts`

```typescript
import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { DefaultSafetyGate } from "../permissions/default-safety-gate";

export function registerSafetyGateHandlers(
  mainWindow: BrowserWindow,
  safetyGate: DefaultSafetyGate,
): void {
  ipcMain.handle(
    IPC_CHANNELS.SKILL_EVALUATE_SAFETY,
    async (event: IpcMainInvokeEvent, skillName: unknown) => {
      // Step 1: 送信元検証
      if (event.sender !== mainWindow.webContents) {
        return {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unknown sender" },
        };
      }

      // Step 2: P42 準拠 3段バリデーション
      if (
        typeof skillName !== "string" ||
        skillName === "" ||
        skillName.trim() === ""
      ) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "skillName must be a non-empty string",
          },
        };
      }

      // Step 3: SafetyGate 実行
      try {
        const result = await safetyGate.evaluate(skillName);
        return { success: true, data: result };
      } catch (error: unknown) {
        const errorObj =
          error != null && typeof error === "object" && "code" in error
            ? (error as { code: string; message?: string })
            : { code: "INTERNAL_ERROR", message: "Safety evaluation failed" };
        return {
          success: false,
          error: {
            code: errorObj.code,
            message: errorObj.message ?? "Safety evaluation failed",
          },
        };
      }
    },
  );
}
```

### 引数・戻り値の型契約

**引数:**

| パラメータ | 型                   | バリデーション        |
| ---------- | -------------------- | --------------------- |
| skillName  | `unknown` → `string` | P42 3段バリデーション |

> **P44/P45 準拠**: 引数名は `skillName` で統一。`skillId` は使用しない。

**成功レスポンス:**

```typescript
{
  success: true,
  data: SafetyGateResult
}
```

**エラーレスポンス:**

```typescript
{
  success: false,
  error: {
    code: "UNAUTHORIZED" | "VALIDATION_ERROR" | "SKILL_NOT_FOUND" | "HISTORY_UNAVAILABLE" | "INTERNAL_ERROR",
    message: string
  }
}
```

## 3. index.ts への登録

### import 追加

```typescript
import { registerSafetyGateHandlers } from "./safetyGateHandlers";
import { DefaultSafetyGate } from "../permissions/default-safety-gate";
```

### ハンドラ登録追加（safeRegister パターン準拠）

```typescript
// Permission Store ハンドラ登録の近辺に追加
safeRegister("safetyGate", () => {
  const safetyGate = new DefaultSafetyGate({
    permissionStore,
    metadataProvider: skillMetadataProvider, // 実際のプロバイダ注入
    protectedPaths: ["/etc", "/usr/local/bin", "/System"],
  });
  registerSafetyGateHandlers(mainWindow, safetyGate);
});
```

> **注意**: `skillMetadataProvider` の具象実装は Phase 5 で確定する。プレースホルダとして SkillService 等から取得する設計とする。

## 4. 送信元検証パターン

既存の `permission-handlers.ts` パターンに準拠:

```typescript
if (event.sender !== mainWindow.webContents) {
  console.warn("[SafetyGate] IPC request from unknown sender, ignoring...");
  return {
    success: false,
    error: { code: "UNAUTHORIZED", message: "Unknown sender" },
  };
}
```

> **D-2 対応**: 仕様書の `validateIpcSender()` は存在しないため、既存パターンの直接比較を採用。

## 5. セキュリティチェックリスト

| #   | チェック項目                                  | 実装                                          |
| --- | --------------------------------------------- | --------------------------------------------- |
| 1   | チャンネル名は IPC_CHANNELS 定数で参照（P27） | `IPC_CHANNELS.SKILL_EVALUATE_SAFETY`          |
| 2   | ハードコード文字列なし（P27）                 | grep で0件を確認                              |
| 3   | 引数型チェック（P42 Step 1）                  | `typeof skillName !== "string"`               |
| 4   | 空文字列チェック（P42 Step 2）                | `skillName === ""`                            |
| 5   | トリム空文字列チェック（P42 Step 3）          | `skillName.trim() === ""`                     |
| 6   | 送信元検証                                    | `event.sender !== mainWindow.webContents`     |
| 7   | エラーサニタイズ                              | 内部情報を含まないエラーメッセージのみ返却    |
| 8   | 引数名統一（P44/P45）                         | `skillName` で Main/Preload/Renderer 全層統一 |
