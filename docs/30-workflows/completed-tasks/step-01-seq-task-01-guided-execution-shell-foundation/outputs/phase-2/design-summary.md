# Phase 2: 設計サマリー

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 2                                              |
| 作成日   | 2026-03-24                                     |

## 設計結論

### 概要

`実行コンソール` を source of truth として、全 surface が同一の route / label / shared action で遷移する foundation を定義する。

### 3 つの contract

1. **Naming Contract**: front label の語彙を固定する
2. **Route Contract**: `ViewType` / `renderView` / `openExecutionConsole()` の所有者を固定する
3. **CTA Contract**: 4 surface の開放ボタンを同一 dispatcher に束ねる

## 1. Naming Contract

### Label 階層

| 階層      | label            | 用途                                   | 使用場面                |
| --------- | ---------------- | -------------------------------------- | ----------------------- |
| primary   | `実行コンソール` | guided execution の主 surface 入口     | nav item / CTA / header |
| handoff   | `端末で続ける`   | manual terminal lane への handoff      | handoff 状態のみ        |
| advanced  | `高度な表示`     | raw terminal / 詳細ログ / 低レベル操作 | secondary/tertiary CTA  |
| summary   | `実行サマリー`   | AI の実行要約                          | done/running 状態       |
| artifacts | `成果物`         | 生成ファイル / 差分 / 次アクション     | done 状態               |

### 退避ルール

- `terminal` / `ターミナル` を front の主導線ラベルにしない
- `terminal を開く` / `ターミナルを開く` → **禁止**（primary label で使用不可）
- raw command 操作は `高度な表示` 内でのみ許可

## 2. Route Contract

詳細は [route-and-action-contract.md](./route-and-action-contract.md) を参照。

### ViewType 追加

```typescript
// apps/desktop/src/renderer/store/types.ts
export type ViewType =
  // ... 既存
  "executionConsole"; // NEW: guided execution の主ルート
```

### renderView 分岐追加

```typescript
// apps/desktop/src/renderer/App.tsx renderView()
case "executionConsole":
  return <ExecutionConsoleView />;
```

### Shared Action Owner

```typescript
// apps/desktop/src/renderer/actions/executionConsole.ts (新規)
export function openExecutionConsole(): void {
  useAppStore.getState().setCurrentView("executionConsole");
}
```

### navContract 追加（任意）

```typescript
// apps/desktop/src/renderer/navigation/navContract.ts
{
  id: "executionConsole",
  icon: "play-circle",
  label: "実行コンソール",
  mobileLabel: "実行",
  shortcut: "", // 後続タスクで割当
  isMobilePrimary: false, // 初期は secondary
}
```

## 3. CTA Contract

詳細は [cta-mapping.md](./cta-mapping.md) を参照。

### 統一 Dispatcher

全 surface は `openExecutionConsole()` を唯一のエントリとして使用する。

```
App Shell (TerminalLauncher) → openExecutionConsole()
ChatPanel (handleOpenTerminal) → openExecutionConsole()
LLMGuidanceBanner (secondaryAction) → openExecutionConsole()
WorkspaceChatPanel (secondaryAction) → openExecutionConsole()
HandoffBlock (onOpenTerminal) → openExecutionConsole()
TerminalHandoffCard (onOpen) → openExecutionConsole()
Skill Creator → openExecutionConsole()
```

### Agent 代替除去

| 変更箇所             | Before                         | After                    |
| -------------------- | ------------------------------ | ------------------------ |
| `ChatPanel.tsx` L127 | `setCurrentView("agent")`      | `openExecutionConsole()` |
| `ChatPanel.tsx` L148 | `setCurrentView("agent")`      | `openExecutionConsole()` |
| `HandoffBlock.tsx`   | `setCurrentView("agent")` 相当 | `openExecutionConsole()` |

## 4. Stub View 設計

```typescript
// apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx (新規)
import React from "react";

export const ExecutionConsoleView: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-secondary">
        実行コンソール — Task02/03 で内部コンポーネントを実装
      </p>
    </div>
  );
};

export default ExecutionConsoleView;
```

## 5. 変更影響範囲

| 変更種別 | ファイル数 | リスク |
| -------- | ---------- | ------ |
| 新規     | 2          | 低     |
| 修正     | 7          | 中     |
| 削除     | 0          | -      |

低リスク: 新規ファイルは stub のみ、既存テストへの影響は限定的。
中リスク: 既存 CTA handler の rename + wiring 変更により、テスト修正が必要。
