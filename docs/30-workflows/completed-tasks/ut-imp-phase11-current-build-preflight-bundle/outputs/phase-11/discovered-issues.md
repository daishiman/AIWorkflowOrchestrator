# Phase 11 発見事項

## current task 起因

- 新規 issue: 0 件

## baseline notes（既存 backlog）

| 区分          | 内容                                               | routing                                           |
| ------------- | -------------------------------------------------- | ------------------------------------------------- |
| baseline note | Settings/Auth の補助文が light panel 上で弱い      | `TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001` |
| baseline note | WorkspaceSearch light surface に dark slate が残る | `TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001` |

## 実装メモ

- failure simulation は shared build artifact を扱うため直列実行が必要だった。
- preflight success path は `autoServed=true` まで含めて再現できた。
- screenshot 再取得の初回は Playwright browser cache 欠落で失敗したが、これは UI regress ではなく environment preflight 不足だった。復旧手順は `pnpm --filter @repo/desktop exec playwright install chromium`。
