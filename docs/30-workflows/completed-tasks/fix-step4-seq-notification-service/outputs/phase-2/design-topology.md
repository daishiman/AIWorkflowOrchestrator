# Phase 2 成果物: 設計トポロジー

## 型配置決定（タスク 2-1）

**結論:** `INotificationService` は `services/notification/INotificationService.ts` に独立ファイルとして配置する。

ファイル構成:

```
apps/desktop/src/main/services/notification/
├── INotificationService.ts          # interface 定義
├── ElectronNotificationService.ts   # 本番実装
└── __tests__/
    └── ElectronNotificationService.test.ts
```

---

## 型設計（タスク 2-2）

### `INotificationService` インターフェース

```typescript
export interface INotificationService {
  notify(title: string, body: string): void;
}
```

### `ElectronNotificationService` 実装

```typescript
import { Notification } from "electron";
import type { INotificationService } from "./INotificationService";

export class ElectronNotificationService implements INotificationService {
  notify(title: string, body: string): void {
    if (!Notification.isSupported()) {
      console.warn(
        "[ElectronNotificationService] Notification is not supported on this platform",
      );
      return;
    }
    new Notification({ title, body }).show();
  }
}
```

### `MockNotificationService`（テストファイル内で定義）

```typescript
class MockNotificationService implements INotificationService {
  readonly calls: Array<{ title: string; body: string }> = [];
  notify(title: string, body: string): void {
    this.calls.push({ title, body });
  }
}
```

---

## DI 注入ポイント（タスク 2-3）

### `RuntimeSkillCreatorFacadeDeps` への追加

```typescript
interface RuntimeSkillCreatorFacadeDeps {
  // 既存フィールド（変更なし）
  skillExecutor: SkillExecutor;
  // ... 他フィールド ...
  // 追加（optional として後方互換を維持）
  notificationService?: INotificationService;
}
```

### `execute` 修正箇所（完了時・失敗時）

```typescript
// 完了時（executeResult.success が true の後）
try {
  this.notificationService?.notify("スキル作成完了", planResult.skillName);
} catch {
  // 通知の失敗はスキル生成の結果に影響しない
}

// 失敗時（catch ブロック内）
try {
  const errorSummary = error instanceof Error ? error.message : String(error);
  this.notificationService?.notify("スキル作成失敗", errorSummary);
} catch {
  // 通知の失敗はスキル生成の結果に影響しない
}
```

---

## `hasRunningExecution()` 実装設計（タスク 2-4）

```typescript
private activeExecutionCount: number = 0;

hasRunningExecution(): boolean {
  return this.activeExecutionCount > 0;
}

async execute(...) {
  this.activeExecutionCount += 1;
  try {
    // 既存の実行フロー
  } finally {
    this.activeExecutionCount = Math.max(0, this.activeExecutionCount - 1);
  }
}
```

---

## `before-quit` ガード設計（タスク 2-5）

### 実装場所

- `apps/desktop/src/main/ipc/beforeQuitGuard.ts` — ガードロジックの実装
- `apps/desktop/src/main/ipc/index.ts` — 登録と解除

### `beforeQuitGuard.ts` 実装パターン

```typescript
export const registerBeforeQuitGuard = ({ app, dialog, facade }) => {
  const handler = (event: Electron.Event) => {
    if (!facade.hasRunningExecution()) return;
    event.preventDefault();
    dialog
      .showMessageBox({
        type: "warning",
        buttons: ["中断して終了", "キャンセル"],
        message: "スキル作成が進行中です",
        detail: "スキル作成を中断してアプリを終了しますか？",
      })
      .then(({ response }) => {
        if (response === 0) app.exit(0);
      })
      .catch((error) => {
        console.warn(
          "[beforeQuitGuard] Failed to show confirmation dialog",
          error,
        );
      });
  };
  app.on("before-quit", handler);
  return () => app.removeListener("before-quit", handler);
};
```

### `ipc/index.ts` での登録（`registerSkillCreatorHandlers` 内）

```typescript
const notificationService = new ElectronNotificationService();
const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({ ..., notificationService })
  : undefined;

if (runtimeSkillCreatorService) {
  unregisterBeforeQuitGuardFn = registerBeforeQuitGuard({
    app, dialog, facade: runtimeSkillCreatorService,
  });
}
```

### `unregisterAllIpcHandlers` での解除

```typescript
if (unregisterBeforeQuitGuardFn) {
  unregisterBeforeQuitGuardFn();
  unregisterBeforeQuitGuardFn = null;
}
```

---

## macOS Notification 権限確認（タスク 2-6）

- Electron アプリは macOS でデフォルト通知権限あり（OS レベルの権限要求不要）
- `Notification.isSupported()` を先頭で呼び、未対応環境では `console.warn` のみ

---

_作成日: 2026-04-02_
