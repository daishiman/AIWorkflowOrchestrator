# Phase 1: Spec Extraction Map

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 1                                              |
| 作成日   | 2026-03-24                                     |

## Code Anchor と System Spec 対応

### ViewType / Route

| Code Anchor                                           | System Spec                                 | 対応内容                    |
| ----------------------------------------------------- | ------------------------------------------- | --------------------------- |
| `apps/desktop/src/renderer/store/types.ts` L4-26      | `ui-ux-navigation.md` ViewType 定義テーブル | `executionConsole` 追加     |
| `apps/desktop/src/renderer/App.tsx` L274-350          | `ui-ux-navigation.md` renderView 基盤       | `executionConsole` 分岐追加 |
| `apps/desktop/src/renderer/navigation/navContract.ts` | `ui-ux-navigation.md` navItems 配列構造     | executionConsole 項目追加   |

### Naming

| Code Anchor                          | System Spec                        | 対応内容                                    |
| ------------------------------------ | ---------------------------------- | ------------------------------------------- |
| `HandoffBlock.tsx` L21               | `ui-ux-realization.md` naming 契約 | `ターミナルを開く` → `端末で続ける`         |
| `TerminalHandoffCard/index.tsx` L130 | `ui-ux-realization.md` naming 契約 | `terminal を開く` → `端末で続ける`          |
| `modelSelectionGuidance.ts` L38      | `ui-ux-realization.md` naming 契約 | `ターミナルを開く` → `実行コンソールを開く` |

### CTA Wiring

| Code Anchor                                 | System Spec                                       | 対応内容                     |
| ------------------------------------------- | ------------------------------------------------- | ---------------------------- |
| `ChatPanel.tsx` L127 `handleTerminalSwitch` | `arch-state-management-core.md` surface ownership | `agent` → `executionConsole` |
| `ChatPanel.tsx` L148 `handleOpenTerminal`   | `arch-state-management-core.md` surface ownership | `agent` → `executionConsole` |
| `LLMGuidanceBanner.tsx` L23-25              | `ui-ux-realization.md` CTA 契約                   | secondaryAction 配線         |
| `WorkspaceChatPanel.tsx`                    | `ui-ux-realization.md` CTA 契約                   | secondaryAction 配線         |

### Launcher Helper

| Code Anchor                                               | System Spec                                  | 対応内容                           |
| --------------------------------------------------------- | -------------------------------------------- | ---------------------------------- |
| `runtimeAccess.ts` L55 `launchMainlineTerminal`           | `ui-ux-navigation.md` persistent launcher    | rename / 統合                      |
| `runtimeAccess.ts` L9 `getTerminalLauncherDisabledReason` | `ui-ux-navigation.md` mainline access matrix | rename                             |
| `AppLayout/TerminalLauncher.tsx`                          | `ui-ux-navigation.md` persistent launcher    | rename to ExecutionConsoleLauncher |

### Unassigned Task 関連

| Unassigned Task                                       | 本タスクとの関係                             |
| ----------------------------------------------------- | -------------------------------------------- |
| `ut-viewtype-terminal-addition.md`                    | 本タスクで `executionConsole` 追加により解消 |
| `UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md` | 本タスクで CTA wiring 配線により解消         |

## System Spec 更新対象（Phase 12 で実施）

| System Spec                     | 更新内容                                         |
| ------------------------------- | ------------------------------------------------ |
| `ui-ux-navigation.md`           | ViewType テーブルに `executionConsole` 追加      |
| `arch-state-management-core.md` | ExecutionConsoleView の surface ownership 追加   |
| `task-workflow.md`              | 本タスク完了記録 + 関連 unassigned task クローズ |
