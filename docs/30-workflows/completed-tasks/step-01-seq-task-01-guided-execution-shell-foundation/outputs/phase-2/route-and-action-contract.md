# Phase 2: Route & Action Contract

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 2                                              |
| 作成日   | 2026-03-24                                     |

## Route Owner 定義

### ViewType 拡張

| ViewType           | Owner                | 分類 | 備考               |
| ------------------ | -------------------- | ---- | ------------------ |
| `executionConsole` | ExecutionConsoleView | main | 本タスクで新規追加 |
| (既存 16 ViewType) | (既存通り)           | -    | 変更なし           |

### renderView 分岐定義

```typescript
// apps/desktop/src/renderer/App.tsx
// renderView() に追加する case 文
case "executionConsole":
  return <ExecutionConsoleView />;
```

**配置ルール**:

- `case "agent":` の直後に配置
- lazy import で chunk 分離

```typescript
const ExecutionConsoleView = React.lazy(
  () => import("./views/ExecutionConsoleView"),
);
```

### Route 到達パス

| 起点                | トリガー            | 遷移先           | メカニズム               |
| ------------------- | ------------------- | ---------------- | ------------------------ |
| App Shell           | nav item click      | executionConsole | `setCurrentView()`       |
| App Shell           | TerminalLauncher    | executionConsole | `openExecutionConsole()` |
| ChatPanel           | handoff CTA         | executionConsole | `openExecutionConsole()` |
| LLMGuidanceBanner   | secondary CTA       | executionConsole | `openExecutionConsole()` |
| WorkspaceChatPanel  | secondary CTA       | executionConsole | `openExecutionConsole()` |
| HandoffBlock        | open CTA            | executionConsole | `openExecutionConsole()` |
| TerminalHandoffCard | open CTA            | executionConsole | `openExecutionConsole()` |
| Keyboard            | shortcut (後続割当) | executionConsole | `setCurrentView()`       |

## Shared Action 定義

### openExecutionConsole()

```typescript
// apps/desktop/src/renderer/actions/executionConsole.ts

import { useAppStore } from "@/renderer/store";

/**
 * 全 surface から実行コンソールを開く共有 action。
 * source of truth として唯一のエントリポイント。
 */
export function openExecutionConsole(): void {
  useAppStore.getState().setCurrentView("executionConsole");
}
```

### 呼び出し規約

1. **直接 `setCurrentView("executionConsole")` を呼ばない** — 必ず `openExecutionConsole()` 経由
2. action 内で将来的に analytics tracking / session initialization を追加可能にする
3. import パスは `@/renderer/actions/executionConsole` で統一

### 配線変更マトリクス

| ファイル                        | Before                        | After                                 |
| ------------------------------- | ----------------------------- | ------------------------------------- |
| `ChatPanel.tsx`                 | `setCurrentView("agent")` x2  | `openExecutionConsole()` x1           |
| `LLMGuidanceBanner.tsx`         | `open-terminal` 未配線        | `openExecutionConsole()`              |
| `WorkspaceChatPanel.tsx`        | `open-terminal` 未配線        | `openExecutionConsole()`              |
| `HandoffBlock.tsx`              | `onOpenTerminal` → agent 代替 | `onOpenExecutionConsole` prop         |
| `TerminalHandoffCard/index.tsx` | terminal label + handler      | label 変更 + `openExecutionConsole()` |
| `TerminalLauncher.tsx`          | `launchMainlineTerminal()`    | `openExecutionConsole()`              |
| `modelSelectionGuidance.ts`     | `TERMINAL_ACTION` 定数        | `EXECUTION_CONSOLE_ACTION` 定数       |

## State Ownership

### ExecutionConsoleView の状態配置

| 状態           | 配置先             | 理由                                    |
| -------------- | ------------------ | --------------------------------------- |
| `currentView`  | AppStore (既存)    | navigation state は全 view で共有       |
| session state  | (後続 Task02 定義) | 本タスクでは stub のため未定義          |
| terminal state | (後続 Task03 定義) | raw terminal は advanced console の責務 |

### Close / Back 遷移

```typescript
// ExecutionConsoleView を閉じるときの挙動
// viewHistory の直前 view に戻る（既存 App.tsx の戻るロジック準拠）
const handleClose = () => {
  const history = useAppStore.getState().viewHistory;
  if (history.length >= 2) {
    setCurrentView(history[history.length - 2]);
  } else {
    setCurrentView("dashboard");
  }
};
```
