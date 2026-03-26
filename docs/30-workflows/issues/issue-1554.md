# [#1554] [UT-RENAME-RUNTIME-ACCESS-TERMINAL-HELPERS-001] runtimeAccess.ts terminal helper リネーム

## メタ情報

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| タスクID | UT-RENAME-RUNTIME-ACCESS-TERMINAL-HELPERS-001              |
| 優先度   | 低                                                         |
| 発見元   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 Phase 3 M-1 |

## 概要

`apps/desktop/src/renderer/utils/runtimeAccess.ts` の `launchMainlineTerminal` / `getTerminalLauncherDisabledReason` 関数名が旧命名のまま残存。
front label は `実行コンソール` に統一されたが、内部関数名に `Terminal` が残っている。

## 対応方針

1. `launchMainlineTerminal` → `launchMainlineExecutionConsole` にリネーム
2. `getTerminalLauncherDisabledReason` → `getExecutionConsoleLauncherDisabledReason` にリネーム
3. 全呼び出し元のインポートを更新
4. 関連テスト修正

## 受入基準

- [ ] `grep -rn "launchMainlineTerminal" apps/desktop/src/renderer/` が 0 件
- [ ] `grep -rn "getTerminalLauncherDisabledReason" apps/desktop/src/renderer/` が 0 件
- [ ] `pnpm --filter @repo/desktop typecheck` PASS
- [ ] 関連テスト全 PASS

## 参照

- `docs/30-workflows/unassigned-task/ut-rename-runtime-access-terminal-helpers-001.md`
