# Phase 2: CTA Mapping

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 2                                              |
| 作成日   | 2026-03-24                                     |

## Surface 別 CTA 契約

### 1. App Shell

| CTA 種別   | コンポーネント           | Label            | Action                   | 表示条件 |
| ---------- | ------------------------ | ---------------- | ------------------------ | -------- |
| Primary    | GlobalNavStrip item      | `実行コンソール` | `openExecutionConsole()` | 常時     |
| Persistent | ExecutionConsoleLauncher | `実行コンソール` | `openExecutionConsole()` | 常時     |

**変更点**: `TerminalLauncher` → `ExecutionConsoleLauncher` にリネーム。内部 action を `launchMainlineTerminal()` から `openExecutionConsole()` に変更。

### 2. Chat Surface

| CTA 種別  | コンポーネント      | Label                  | Action                   | 表示条件               |
| --------- | ------------------- | ---------------------- | ------------------------ | ---------------------- |
| Handoff   | ChatPanel           | `実行コンソールを開く` | `openExecutionConsole()` | handoff 状態           |
| Secondary | LLMGuidanceBanner   | `実行コンソールを開く` | `openExecutionConsole()` | NO_PROVIDER / NO_MODEL |
| Handoff   | HandoffBlock        | `端末で続ける`         | `openExecutionConsole()` | handoff block 内       |
| Handoff   | TerminalHandoffCard | `端末で続ける`         | `openExecutionConsole()` | terminal handoff       |

**変更点**:

- `handleTerminalSwitch` / `handleOpenTerminal` → 統合して `openExecutionConsole()` を呼ぶ
- `LLMGuidanceBanner` の `secondaryAction` に `openExecutionConsole` を配線
- `HandoffBlock` の label を `ターミナルを開く` → `端末で続ける` に変更
- `TerminalHandoffCard` の label を `terminal を開く` → `端末で続ける` に変更

### 3. Workspace Surface

| CTA 種別  | コンポーネント     | Label                  | Action                   | 表示条件               |
| --------- | ------------------ | ---------------------- | ------------------------ | ---------------------- |
| Secondary | WorkspaceChatPanel | `実行コンソールを開く` | `openExecutionConsole()` | NO_PROVIDER / NO_MODEL |

**変更点**:

- `secondaryAction` に `openExecutionConsole` を配線
- `createGuidanceActionDispatcher` に `openTerminal: openExecutionConsole` を追加

### 4. Skill Creator Surface

| CTA 種別 | コンポーネント     | Label                  | Action                   | 表示条件          |
| -------- | ------------------ | ---------------------- | ------------------------ | ----------------- |
| Context  | (後続タスクで定義) | `実行コンソールで実行` | `openExecutionConsole()` | plan/execute 画面 |

**備考**: Skill Creator の CTA 配置は Task02/03 で詳細化。本タスクでは action interface のみ定義。

## Dispatcher 統合設計

### createGuidanceActionDispatcher 拡張

```typescript
// 現行
const resolveAction = createGuidanceActionDispatcher({
  openSettings: onNavigateToSettings,
  // openTerminal: ← 未配線
});

// 変更後
const resolveAction = createGuidanceActionDispatcher({
  openSettings: onNavigateToSettings,
  openExecutionConsole: () => openExecutionConsole(),
});
```

### modelSelectionGuidance.ts 定数変更

```typescript
// 現行
const TERMINAL_ACTION = {
  type: "open-terminal" as const,
  label: "ターミナルを開く",
};

// 変更後
const EXECUTION_CONSOLE_ACTION = {
  type: "open-execution-console" as const,
  label: "実行コンソールを開く",
};
```

## No-op / Fallback 排除契約

### 禁止パターン

| パターン                          | 理由                       |
| --------------------------------- | -------------------------- |
| `setCurrentView("agent")` で代替  | 意図しない view への遷移   |
| CTA が no-op（handler 未接続）    | ユーザーの操作が無視される |
| `console.warn` で silent fallback | エラーが隠蔽される         |
| label と実際の遷移先が不一致      | UX の信頼性が損なわれる    |

### 許可パターン

| パターン                            | 条件                                          |
| ----------------------------------- | --------------------------------------------- |
| `openExecutionConsole()` 経由の遷移 | 全 surface 共通                               |
| unavailable 状態での disabled 表示  | disabled 理由を tooltip で表示する            |
| error boundary での fallback        | エラーメッセージを表示した上で dashboard 遷移 |
