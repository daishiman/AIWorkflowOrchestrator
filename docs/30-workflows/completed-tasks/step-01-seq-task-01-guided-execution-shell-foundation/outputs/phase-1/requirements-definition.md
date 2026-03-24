# Phase 1: 要件定義書

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 1                                              |
| 作成日   | 2026-03-24                                     |

## 1. Current Drift 棚卸し

### 1.1 Front Label Drift

| 箇所                                 | 現行ラベル                          | 種別           | 対応方針                      |
| ------------------------------------ | ----------------------------------- | -------------- | ----------------------------- |
| `HandoffBlock.tsx` L21               | `ターミナルを開く`                  | UI 露出        | `端末で続ける` に変更         |
| `TerminalHandoffCard/index.tsx` L130 | `terminal を開く`                   | UI 露出        | `端末で続ける` に変更         |
| `TerminalHandoffCard/index.tsx`      | `Terminal で続けてください`         | UI 露出        | `実行コンソール` 系に変更     |
| `ChatPanel.tsx` L17                  | JSDoc 内 `terminal`                 | コメント       | コメント更新（低優先）        |
| `ChatPanel.tsx` L127                 | `handleTerminalSwitch`              | 関数名         | `handleOpenExecutionConsole`  |
| `ChatPanel.tsx` L148                 | `handleOpenTerminal`                | 関数名         | `handleOpenExecutionConsole`  |
| `modelSelectionGuidance.ts` L38      | `ターミナルを開く`                  | 定数           | `実行コンソールを開く` に変更 |
| `runtimeAccess.ts`                   | `launchMainlineTerminal`            | 関数名         | `openExecutionConsole` に統合 |
| `runtimeAccess.ts`                   | `getTerminalLauncherDisabledReason` | 関数名         | rename 候補                   |
| `AppLayout/TerminalLauncher.tsx`     | `TerminalLauncher`                  | コンポーネント | `ExecutionConsoleLauncher`    |

### 1.2 Route Drift

| 観点                      | 現状                                   | 問題                              |
| ------------------------- | -------------------------------------- | --------------------------------- |
| `ViewType` 定義           | `terminal` / `executionConsole` 未定義 | route 先が存在しない              |
| `renderView()` in App.tsx | 16 パターン対応、terminal なし         | `setCurrentView("terminal")` 不可 |
| navContract.ts            | 9 項目、terminal/executionConsole なし | ナビゲーション到達不能            |
| ショートカット            | 未割当                                 | keyboard access 不可              |

### 1.3 CTA Drift

| Surface            | CTA                  | 配線状態   | 問題                                     |
| ------------------ | -------------------- | ---------- | ---------------------------------------- |
| ChatPanel          | handleTerminalSwitch | agent 代替 | `setCurrentView("agent")` で代替遷移     |
| ChatPanel          | handleOpenTerminal   | agent 代替 | `setCurrentView("agent")` で代替遷移     |
| LLMGuidanceBanner  | secondaryAction      | 未配線     | `open-terminal` が dispatcher に未接続   |
| WorkspaceChatPanel | secondaryAction      | 未配線     | `open-terminal` が dispatcher に未接続   |
| TerminalLauncher   | onClick              | IPC 直結   | `terminal.open` IPC で外部 terminal 起動 |
| HandoffBlock       | onOpenTerminal       | agent 代替 | `setCurrentView("agent")` で代替遷移     |

## 2. 機能要件（FR）

| ID   | 要件                                                                                      |
| ---- | ----------------------------------------------------------------------------------------- |
| FR-1 | `ViewType` に `executionConsole` を追加し、`renderView()` で専用 View を描画する          |
| FR-2 | `openExecutionConsole()` を shared action として定義し、全 surface から同一関数で遷移する |
| FR-3 | front の primary label を `実行コンソール` に統一する                                     |
| FR-4 | `terminal` を front の主導線ラベルにしない。高度な操作は `高度な表示` label で退避する    |
| FR-5 | App Shell / Chat / Workspace / Skill Creator の CTA が同一 dispatcher に収束する          |
| FR-6 | `agent` 代替遷移（`setCurrentView("agent")`）を全箇所で `executionConsole` に置換する     |
| FR-7 | 未配線 CTA（LLMGuidanceBanner / WorkspaceChatPanel の secondaryAction）を配線する         |

## 3. 非機能要件（NFR）

| ID    | 要件                                                                             |
| ----- | -------------------------------------------------------------------------------- |
| NFR-1 | 既存の `agent` view の機能に影響を与えない（`agent` は独立した view として維持） |
| NFR-2 | keyboard shortcut を navContract に追加する場合、既存ショートカットと衝突しない  |
| NFR-3 | ダークモード / ライトモード両方で label 可読性を確保する                         |
| NFR-4 | `terminal` 文字列が front に主表示されない（grep 検証可能）                      |

## 4. 受入基準（AC）

| ID   | 基準                                                                                       | 検証方法                                                                         |
| ---- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| AC-1 | front の primary label が `実行コンソール` 系へ統一されている                              | `grep -rn "ターミナルを開く\|terminal を開く" apps/desktop/src/renderer` が 0 件 |
| AC-2 | `ViewType` / route / shared action の正本が定義されている                                  | `types.ts` に `executionConsole` が存在、`renderView` に分岐あり                 |
| AC-3 | App Shell / Chat / Workspace / Skill Creator の CTA が同一ラベル・同一挙動で設計されている | 全4 surface の CTA handler が `openExecutionConsole()` を呼ぶ                    |
| AC-4 | `agent` 代替や no-op CTA の除去方針が明記されている                                        | `setCurrentView("agent")` の terminal 代替が 0 件                                |
