# Phase 8: 簡素化候補一覧

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 8                                              |
| 作成日   | 2026-03-24                                     |

## 簡素化候補

### S-1: ChatPanel の handler 統合

| 項目   | 内容                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 対象   | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                                                            |
| 現状   | `handleTerminalSwitch`（L127-131）と `handleOpenTerminal`（L148-150）の2つの `useCallback` が同一の `setCurrentView("agent")` を呼ぶ |
| 問題   | 2つの handler が同一ロジックを重複実装。どちらも `setCurrentView("agent")` の agent 代替パターン（禁止: CTA Contract）               |
| 簡素化 | 両方を削除し、`openExecutionConsole()` を直接 import して使用する                                                                    |
| 変更量 | -10行（2つの useCallback 定義削除）、+1行（import 追加）                                                                             |
| リスク | 低。テスト TC-01, TC-04, TC-07 の期待値修正が必要                                                                                    |

```typescript
// Before: 2つの重複 handler
const handleTerminalSwitch = useCallback(() => {
  setCurrentView("agent");
}, [setCurrentView]);

const handleOpenTerminal = useCallback(() => {
  setCurrentView("agent");
}, [setCurrentView]);

// After: shared action を直接使用
import { openExecutionConsole } from "@/renderer/actions/executionConsole";
// handleTerminalSwitch / handleOpenTerminal の定義を削除
// 呼び出し箇所を openExecutionConsole に直接置換
```

### S-2: modelSelectionGuidance.ts の定数リネーム

| 項目   | 内容                                                                                                                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象   | `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts`                                                                                                                                                        |
| 現状   | `TERMINAL_ACTION` 定数（L36-40）が `type: "open-terminal"`, `label: "ターミナルを開く"` を定義                                                                                                                        |
| 問題   | front label に `ターミナル` が露出。`GuidanceActionType` の `"open-terminal"` が Naming Contract 違反                                                                                                                 |
| 簡素化 | `EXECUTION_CONSOLE_ACTION` にリネーム。型定義 `GuidanceActionType` にも `"open-execution-console"` を追加し、`"open-terminal"` を削除                                                                                 |
| 変更量 | 定数名変更（1箇所定義、2箇所参照）、型定義変更（1行）                                                                                                                                                                 |
| リスク | 中。`GuidanceActionType` は `createGuidanceActionDispatcher` の switch 文で使用されるため、exhaustive check が影響を受ける。`GuidanceActionHandlers` の key 名も `openTerminal` → `openExecutionConsole` に変更が必要 |

```typescript
// Before
export type GuidanceActionType =
  | "open-settings"
  | "open-terminal"
  | "copy-command"
  | "retry-connection";

const TERMINAL_ACTION = Object.freeze({
  type: "open-terminal",
  label: "ターミナルを開く",
  ariaLabel: "ターミナルを開く",
} as const);

// After
export type GuidanceActionType =
  | "open-settings"
  | "open-execution-console"
  | "copy-command"
  | "retry-connection";

const EXECUTION_CONSOLE_ACTION = Object.freeze({
  type: "open-execution-console",
  label: "実行コンソールを開く",
  ariaLabel: "実行コンソールを開く",
} as const);
```

**波及変更**:

| ファイル                         | 変更箇所                                                       |
| -------------------------------- | -------------------------------------------------------------- |
| `modelSelectionGuidance.ts`      | `GuidanceActionHandlers.openTerminal` → `openExecutionConsole` |
| `modelSelectionGuidance.ts`      | `createGuidanceActionDispatcher` の switch case 変更           |
| `LLMGuidanceBanner.tsx`          | dispatcher 引数の key 変更                                     |
| `WorkspaceChatPanel.tsx`         | dispatcher 引数の key 変更                                     |
| `modelSelectionGuidance.test.ts` | テスト期待値の定数名・type 値変更                              |

### S-3: runtimeAccess.ts の terminal 系関数名統一

| 項目   | 内容                                                                                                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 対象   | `apps/desktop/src/renderer/utils/runtimeAccess.ts`                                                                                                                                                                 |
| 現状   | `getTerminalLauncherDisabledReason()`（L9-31）と `launchMainlineTerminal()`（L55-66）が terminal 系の名称                                                                                                          |
| 問題   | front 主導線の用語が `実行コンソール` に統一されたが、内部 API の関数名が旧用語のまま                                                                                                                              |
| 簡素化 | `getTerminalLauncherDisabledReason` → `getExecutionConsoleLauncherDisabledReason` にリネーム。`launchMainlineTerminal` は IPC 経由の外部 terminal 起動であり、実行コンソールの内部遷移とは責務が異なるため据え置き |
| 変更量 | 関数名変更（1箇所定義 + 呼び出し元）                                                                                                                                                                               |
| リスク | 低。この関数は `AppLayout/TerminalLauncher.tsx` からのみ呼ばれる。`launchMainlineTerminal` は IPC 層のため本タスクでは変更しない（Phase 3 M-1 指摘対応）                                                           |

```typescript
// Before
export function getTerminalLauncherDisabledReason(
  capability: AccessCapability,
  isAuthenticated: boolean,
  isLoading: boolean,
): string | undefined { ... }

// After
export function getExecutionConsoleLauncherDisabledReason(
  capability: AccessCapability,
  isAuthenticated: boolean,
  isLoading: boolean,
): string | undefined { ... }
```

**据え置き判断**: `launchMainlineTerminal()` は `window.electronAPI.terminal.open` IPC を呼び出す関数であり、外部 terminal プロセスの起動を行う。`openExecutionConsole()` は Zustand Store 経由の画面内遷移であり責務が異なる。rename は IPC channel 名と合わせて後続タスク（Task03）で実施する。

### S-4: TerminalLauncher のラベル・ARIA 統一

| 項目   | 内容                                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 対象   | `apps/desktop/src/renderer/components/organisms/AppLayout/TerminalLauncher.tsx`                                                            |
| 現状   | `aria-label="ターミナルを開く"`（L25）、表示ラベル `Terminal` / `AI + Terminal`（L33）                                                     |
| 問題   | front label が Naming Contract に違反                                                                                                      |
| 簡素化 | label / aria-label を `実行コンソール` に統一。`capability` による分岐表示（`AI + Terminal` vs `Terminal`）を `実行コンソール` 1本に簡素化 |
| 変更量 | 文字列変更 2箇所、条件分岐削除 1箇所                                                                                                       |
| リスク | 低。表示テキストの変更のみ。data-testid は変更なし（テスト互換維持）                                                                       |

```typescript
// Before
<Button aria-label="ターミナルを開く" data-testid="app-layout-terminal-launcher">
  <span>{capability === "both" ? "AI + Terminal" : "Terminal"}</span>
</Button>

// After
<Button aria-label="実行コンソールを開く" data-testid="app-layout-terminal-launcher">
  <span>実行コンソール</span>
</Button>
```

### S-5: TerminalHandoffCard のヘッダー文言統一

| 項目   | 内容                                                                                                  |
| ------ | ----------------------------------------------------------------------------------------------------- |
| 対象   | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/TerminalHandoffCard.tsx`          |
| 現状   | ヘッダー `ターミナル引き継ぎ`（L101）、`aria-label="ターミナル引き継ぎ案内"`（L72）                   |
| 問題   | front label が Naming Contract に違反。terminal アイコンの SVG コメント `Terminal icon` も legacy     |
| 簡素化 | ヘッダーを `端末で続ける` に変更。aria-label を `実行コンソール引き継ぎ案内` に変更                   |
| 変更量 | 文字列変更 2箇所、コメント変更 1箇所                                                                  |
| リスク | 低。既存ユーザーがヘッダー文言で操作を判断している場合の混乱リスクはあるが、UX 統一の方が優先度が高い |

```typescript
// Before
<div role="alert" aria-label="ターミナル引き継ぎ案内">
  ...
  <span className="text-sm font-semibold">ターミナル引き継ぎ</span>

// After
<div role="alert" aria-label="実行コンソール引き継ぎ案内">
  ...
  <span className="text-sm font-semibold">端末で続ける</span>
```

## 簡素化候補サマリー

| ID  | 対象                         | 種別           | 変更量 | リスク | 優先度 |
| --- | ---------------------------- | -------------- | ------ | ------ | ------ |
| S-1 | ChatPanel handler 統合       | action 重複    | -10行  | 低     | 高     |
| S-2 | modelSelectionGuidance 定数  | label 重複     | ~15行  | 中     | 高     |
| S-3 | runtimeAccess 関数名         | legacy wording | ~2行   | 低     | 中     |
| S-4 | TerminalLauncher ラベル      | label 重複     | ~3行   | 低     | 高     |
| S-5 | TerminalHandoffCard ヘッダー | label 重複     | ~3行   | 低     | 高     |

## 実施判断

| ID  | 判断     | 理由                                                                                               |
| --- | -------- | -------------------------------------------------------------------------------------------------- |
| S-1 | 実施する | Phase 5 で handler 統合を行う前提で設計済み。テストカバー範囲内                                    |
| S-2 | 実施する | `GuidanceActionType` の変更は波及範囲が明確。exhaustive check で漏れを検出可能                     |
| S-3 | 一部実施 | `getTerminalLauncherDisabledReason` のみリネーム。`launchMainlineTerminal` は IPC 層のため据え置き |
| S-4 | 実施する | 表示テキスト変更のみ。ファイル名変更は据え置き                                                     |
| S-5 | 実施する | 表示テキスト変更のみ。コンポーネント名変更は据え置き                                               |
