# Phase 8: リファクタリング境界定義

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 8                                              |
| 作成日   | 2026-03-24                                     |

## 1. 本タスクで行うリファクタリング

### 1.1 Label 重複整理

| 対象ファイル                                  | 現状                                   | リファクタ内容                                      | 根拠            |
| --------------------------------------------- | -------------------------------------- | --------------------------------------------------- | --------------- |
| `HandoffBlock.tsx` L21                        | `ターミナルを開く`                     | `端末で続ける` に変更                               | Naming Contract |
| `TerminalHandoffCard/TerminalHandoffCard.tsx` | ヘッダー `ターミナル引き継ぎ`          | `端末で続ける` に変更（ヘッダー文言統一）           | Naming Contract |
| `TerminalHandoffCard/TerminalHandoffCard.tsx` | `aria-label="ターミナル引き継ぎ案内"`  | `aria-label="実行コンソール引き継ぎ案内"` に変更    | Accessibility   |
| `modelSelectionGuidance.ts` L37-40            | `TERMINAL_ACTION` / `ターミナルを開く` | `EXECUTION_CONSOLE_ACTION` / `実行コンソールを開く` | Naming Contract |
| `AppLayout/TerminalLauncher.tsx` L25          | `aria-label="ターミナルを開く"`        | `aria-label="実行コンソールを開く"` に変更          | Accessibility   |
| `AppLayout/TerminalLauncher.tsx` L33          | `Terminal` / `AI + Terminal`           | `実行コンソール` に変更                             | Naming Contract |

### 1.2 Action 重複整理

| 対象ファイル                    | 現状                                               | リファクタ内容                                   | 根拠         |
| ------------------------------- | -------------------------------------------------- | ------------------------------------------------ | ------------ |
| `ChatPanel.tsx` L127-131        | `handleTerminalSwitch` → `setCurrentView("agent")` | `openExecutionConsole()` に統合                  | CTA Contract |
| `ChatPanel.tsx` L148-150        | `handleOpenTerminal` → `setCurrentView("agent")`   | `openExecutionConsole()` に統合（handler 1本化） | CTA Contract |
| `LLMGuidanceBanner.tsx` L23-25  | `openTerminal` 未配線（dispatcher に未接続）       | `openExecutionConsole` を dispatcher に追加      | CTA Contract |
| `WorkspaceChatPanel.tsx` L33-34 | `openTerminal` 未配線（dispatcher に未接続）       | `openExecutionConsole` を dispatcher に追加      | CTA Contract |

**統合ルール**: `handleTerminalSwitch` と `handleOpenTerminal` は同一の遷移先（`executionConsole`）へ向かうため、`openExecutionConsole()` 1本に統合する。ChatPanel 内の2つの `useCallback` を削除し、`import { openExecutionConsole } from "@/renderer/actions/executionConsole"` に置換する。

### 1.3 Legacy Wording 削減

| 対象ファイル                       | 現状                                      | リファクタ内容                                  | 削減レベル |
| ---------------------------------- | ----------------------------------------- | ----------------------------------------------- | ---------- |
| `ChatPanel.tsx` L17                | JSDoc 内 `terminal surface のみ利用可能`  | `execution console surface のみ利用可能` に更新 | コメント   |
| `ChatPanel.tsx` L147               | コメント `app:open-terminal IPC は未実装` | コメント削除（handler 自体を削除するため）      | コメント   |
| `runtimeAccess.ts` L28             | `利用可能なターミナル経路がありません`    | `利用可能な実行経路がありません` に変更         | 文字列     |
| `modelSelectionGuidance.ts` L3     | `GuidanceActionType` に `"open-terminal"` | `"open-execution-console"` に変更               | 型定義     |
| `modelSelectionGuidance.ts` L38-39 | `TERMINAL_ACTION` の `ariaLabel`          | `実行コンソールを開く` に変更                   | 文字列     |

## 2. 本タスクで行わないリファクタリング

### 2.1 Session Dock 関連 (Task02 責務)

| 候補                                      | 理由                                      |
| ----------------------------------------- | ----------------------------------------- |
| `ExecutionConsoleView` 内部レイアウト設計 | stub View のみ本タスク。内部構造は Task02 |
| session state の Zustand Slice 追加       | session 管理は Task02 で定義              |
| transcript / artifact コンポーネント設計  | Task02 の Phase 2 で設計                  |

### 2.2 Advanced Console 関連 (Task03 責務)

| 候補                                  | 理由                                   |
| ------------------------------------- | -------------------------------------- |
| raw terminal 表示コンポーネント       | `高度な表示` label の内部実装は Task03 |
| approval sheet / manual boundary      | Task03 の Phase 1 で要件定義           |
| `terminal.open` IPC channel の rename | IPC 層の変更は本タスクスコープ外       |

### 2.3 Navigation ショートカット実装

| 候補                                          | 理由                                                                                                                              |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `navContract.ts` への `executionConsole` 追加 | `DockViewType` の拡張が必要であり、既存の Cmd+1-8 との衝突検証が必要。設計のみ本タスクで定義済み（design-summary.md）、実装は後続 |
| `NAV_SHORTCUT_TO_VIEW` マッピング追加         | navContract 追加と同時に行う必要がある                                                                                            |

### 2.4 TerminalLauncher コンポーネント名 rename

| 候補                                                                   | 理由                                                                                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `TerminalLauncher.tsx` → `ExecutionConsoleLauncher.tsx` ファイル名変更 | label / aria-label の変更は本タスクで実施するが、ファイル名の物理的変更は import パスの大規模変更を伴うため、Phase 5 の実装計画で判断 |

## 3. 安全な変更範囲（テストカバー済み）

### 3.1 テストが直接カバーする変更

| 変更対象                         | 関連テスト                                | カバー内容                       |
| -------------------------------- | ----------------------------------------- | -------------------------------- |
| `ChatPanel.tsx` handler 統合     | `ChatPanel.test.tsx` TC-01, TC-04, TC-07  | terminal switch / open handler   |
| `HandoffBlock.tsx` label 変更    | `ChatPanel.test.tsx` TC-04                | handoff block 表示               |
| `TerminalHandoffCard` label 変更 | `TerminalHandoffCard.test.tsx` 全テスト   | card 表示 / copy / dismiss       |
| `modelSelectionGuidance.ts` 定数 | `modelSelectionGuidance.test.ts` 全テスト | guidance config / dispatcher     |
| `LLMGuidanceBanner.tsx` 配線     | `LLMGuidanceBanner.test.tsx`              | banner 表示 / action dispatch    |
| `WorkspaceChatPanel.tsx` 配線    | `WorkspaceChatPanel.guidance.test.tsx`    | guidance block / action dispatch |

### 3.2 テスト修正が必要な箇所

| テストファイル                         | 修正内容                                                                      | リスク |
| -------------------------------------- | ----------------------------------------------------------------------------- | ------ |
| `ChatPanel.test.tsx` TC-01             | `setCurrentView("agent")` → `setCurrentView("executionConsole")` 期待値変更   | 低     |
| `ChatPanel.test.tsx` TC-04, TC-07      | 同上                                                                          | 低     |
| `TerminalHandoffCard.test.tsx`         | `ターミナル引き継ぎ案内` → `実行コンソール引き継ぎ案内` aria-label 期待値変更 | 低     |
| `modelSelectionGuidance.test.ts`       | `TERMINAL_ACTION` → `EXECUTION_CONSOLE_ACTION` 定数名変更                     | 低     |
| `LLMGuidanceBanner.test.tsx`           | `openTerminal` dispatcher key の追加検証                                      | 低     |
| `WorkspaceChatPanel.guidance.test.tsx` | `openTerminal` dispatcher key の追加検証                                      | 低     |

### 3.3 変更しない安全な境界

| ファイル / レイヤー              | 理由                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `runtimeAccess.ts` の IPC 呼出し | `launchMainlineTerminal()` は内部 API であり front 露出ではない。IPC 層の変更はスコープ外 |
| `navContract.ts` の items 配列   | 既存の 9 項目に影響を与えない。追加は後続タスク                                           |
| `useStreamingChat` hook          | chat 機能の内部ロジックに変更なし                                                         |
| Zustand Store Slice 構造         | `setCurrentView` の呼び出し先変更のみ。Slice 定義は不変                                   |
