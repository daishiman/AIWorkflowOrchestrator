# Phase 5: ファイル変更スコープ

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 5                                              |
| 作成日   | 2026-03-24                                     |

## ファイル変更一覧

### 新規ファイル

| ファイルパス                                                     | 変更種別 | 行数見積 | Step | テスト影響                                 |
| ---------------------------------------------------------------- | -------- | -------- | ---- | ------------------------------------------ |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx` | 新規     | 15 行    | 2    | R-02 で描画検証                            |
| `apps/desktop/src/renderer/actions/executionConsole.ts`          | 新規     | 12 行    | 3    | Level 1 単体テスト + C-01〜C-07 の間接依存 |

### 修正ファイル

| ファイルパス                                                                    | 現行行数 | 変更種別 | 変更行数見積 | Step | テスト影響                                          |
| ------------------------------------------------------------------------------- | -------- | -------- | ------------ | ---- | --------------------------------------------------- |
| `apps/desktop/src/renderer/store/types.ts`                                      | 247      | 修正     | +1 行        | 1    | R-01 (型レベル検証)                                 |
| `apps/desktop/src/renderer/App.tsx`                                             | 643      | 修正     | +8 行        | 1, 8 | R-02, R-03; 既存 App テスト要確認                   |
| `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                       | 326      | 修正     | +2 / -4 行   | 4    | C-01, N-01; 既存 ChatPanel テスト 6 ファイルに影響  |
| `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`                | 60       | 修正     | +15 行       | 5    | C-02; 新規テスト追加                                |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`          | 112      | 修正     | +2 行        | 6    | C-03; GuidanceBlock テスト要確認                    |
| `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`                    | 25       | 修正     | +1 / -1 行   | 7    | C-04, L-01; 既存 ChatPanel.chat-wiring テスト要修正 |
| `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx`  | 147      | 修正     | +2 / -2 行   | 7    | C-05, L-02, L-04; 新規テスト追加                    |
| `apps/desktop/src/renderer/components/organisms/AppLayout/TerminalLauncher.tsx` | 36       | 修正     | +3 / -3 行   | 8    | C-06; 既存 App.mainline-shell テスト要修正          |
| `apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx`            | 110      | 修正     | +3 / -2 行   | 8    | C-06; AppLayout テスト要確認                        |
| `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts`                  | 110      | 修正     | +8 / -8 行   | 9    | C-07, L-03, N-02, N-03; GuidanceBlock テスト要修正  |

### 変更影響を受ける既存テストファイル

| テストファイルパス                                                                          | 影響種別 | 影響理由                                                         |
| ------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`                    | 修正必要 | `setCurrentView("agent")` の期待値を `"executionConsole"` に変更 |
| `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.chat-wiring.test.tsx`        | 修正必要 | handoff ボタンラベル `ターミナルを開く` の期待値変更             |
| `apps/desktop/src/renderer/__tests__/App.mainline-shell.test.tsx`                           | 修正必要 | TerminalLauncher mock の aria-label 変更                         |
| `apps/desktop/src/renderer/views/WorkspaceView/components/__tests__/GuidanceBlock.test.tsx` | 修正必要 | `ターミナルを開く` ラベルの期待値変更                            |

---

## 変更行数サマリー

| カテゴリ     | 追加行 | 削除行 | 純増行  |
| ------------ | ------ | ------ | ------- |
| 新規ファイル | 27     | 0      | +27     |
| 修正ファイル | 45     | 20     | +25     |
| **合計**     | **72** | **20** | **+52** |

---

## テスト影響サマリー

| カテゴリ               | ファイル数 | 備考                                      |
| ---------------------- | ---------- | ----------------------------------------- |
| 新規テストファイル     | 5          | test-matrix.md の配置一覧参照             |
| 修正が必要な既存テスト | 4          | ラベル・期待値の変更                      |
| 影響なし既存テスト     | 多数       | agent view テストは ViewType 変更の影響外 |

---

## リスク評価

| リスク項目                                     | 影響度 | 確率 | 対策                                                                 |
| ---------------------------------------------- | ------ | ---- | -------------------------------------------------------------------- |
| 既存 ChatPanel テスト 6 ファイルの修正漏れ     | 中     | 中   | `grep -rn "agent" __tests__/ChatPanel*.test` で網羅検索              |
| modelSelectionGuidance 定数変更の波及          | 中     | 低   | exhaustive switch の `never` チェックで未対応箇所を検出              |
| TerminalLauncher rename 見送りによる命名不整合 | 低     | 高   | 本タスクでは label + action のみ変更。ファイル名 rename は未タスク化 |
| App.tsx の lazy import パス誤り                | 低     | 低   | `pnpm --filter @repo/desktop build` で静的検証                       |

---

## MINOR 指摘 (M-1〜M-3) 対応方針

### M-1: `runtimeAccess.ts` 関数名 rename

| 項目       | 内容                                                                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象関数   | `launchMainlineTerminal()`, `getTerminalLauncherDisabledReason()`                                                                                                                                                                                                                            |
| 対応 Step  | Step 8                                                                                                                                                                                                                                                                                       |
| 対応方針   | 関数名 rename は見送り。呼び出し元の App Shell / AppLayout で `openExecutionConsole()` を使用することで、`launchMainlineTerminal` は App Shell からの呼び出しが不要になる。ただし `runtimeAccess.ts` 自体は他のコンポーネント（SlideWorkspace 等）からも参照されているため、関数削除はしない |
| 未タスク化 | `UT-RENAME-RUNTIME-ACCESS-TERMINAL-HELPERS-001` として検出                                                                                                                                                                                                                                   |

### M-2: Skill Creator CTA interface 型定義

| 項目      | 内容                                                                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対応 Step | Step 3                                                                                                                                                    |
| 対応方針  | `openExecutionConsole()` 関数を named export し、Skill Creator surface から import 可能にする。追加の型定義は不要（関数シグネチャが `() => void` で十分） |
| 検証      | `import { openExecutionConsole } from "@/renderer/actions/executionConsole"` が型チェックを通過する                                                       |

### M-3: `TerminalLauncher` rename 時の既存テスト修正

| 項目         | 内容                                                                                                                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/renderer/components/organisms/AppLayout/TerminalLauncher.tsx`                                                                                                                                                                                                                                        |
| 対応 Step    | Step 8                                                                                                                                                                                                                                                                                                                 |
| 対応方針     | ファイル名 rename (`TerminalLauncher.tsx` -> `ExecutionConsoleLauncher.tsx`) は本タスクでは実施しない。理由: import 元 3 箇所 (`AppLayout/index.tsx`, `App.tsx`, `App.mainline-shell.test.tsx`) + コンポーネント名の参照箇所修正が必要で、foundation タスクのスコープを超える。aria-label とテキストの変更のみ実施する |
| 未タスク化   | `UT-RENAME-TERMINAL-LAUNCHER-TO-EXECUTION-CONSOLE-LAUNCHER-001` として検出                                                                                                                                                                                                                                             |
| 影響分析     | rename 時の影響ファイル一覧:                                                                                                                                                                                                                                                                                           |

```
apps/desktop/src/renderer/components/organisms/AppLayout/TerminalLauncher.tsx  (rename)
apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx             (import 変更)
apps/desktop/src/renderer/App.tsx                                              (import 変更)
apps/desktop/src/renderer/__tests__/App.mainline-shell.test.tsx                (mock パス変更)
```
