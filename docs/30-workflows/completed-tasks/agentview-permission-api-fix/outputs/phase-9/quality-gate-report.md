# Quality Gate Report

## 品質ゲート結果

| ゲート     | コマンド                                             | 結果                                 |
| ---------- | ---------------------------------------------------- | ------------------------------------ |
| TypeScript | `pnpm --filter @repo/desktop exec tsc --noEmit`      | PASS                                 |
| Vitest     | `vitest run src/renderer/views/AgentView/__tests__/` | BLOCKED（esbuild platform mismatch） |

## AC との対応

| AC    | 確認方法                                                | 結果    |
| ----- | ------------------------------------------------------- | ------- |
| AC-01 | コード確認 (`getPermissionApi()`)                       | PASS    |
| AC-02 | コード確認 (`getAllowedTools()` → `rememberedCount`)    | PASS    |
| AC-03 | コード確認 (`clearAll()`)                               | PASS    |
| AC-04 | コード確認 (`handlePermissionModeChange()` local state) | PASS    |
| AC-05 | `tsc --noEmit`                                          | PASS    |
| AC-06 | AgentView テスト全 PASS                                 | BLOCKED |
