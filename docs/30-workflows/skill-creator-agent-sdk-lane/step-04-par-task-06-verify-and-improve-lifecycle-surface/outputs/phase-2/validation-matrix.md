# Validation Matrix

| ID   | 種別        | 対象               | コマンド / 確認方法                                                  | 期待結果                                               |
| ---- | ----------- | ------------------ | -------------------------------------------------------------------- | ------------------------------------------------------ |
| V-01 | unit        | shared DTO         | `pnpm vitest packages/shared/src/types`                              | verify detail DTO が型として成立する                   |
| V-02 | unit        | panel state        | `pnpm vitest apps/desktop/src/renderer/components/skill`             | selection / apply result / re-entry state が確認できる |
| V-03 | integration | main IPC / preload | `pnpm vitest apps/desktop/src/main/ipc apps/desktop/src/preload`     | payload と response shape が一致する                   |
| V-04 | integration | runtime service    | `pnpm vitest apps/desktop/src/main/services/runtime`                 | improve / apply / provenance mapping が確認できる      |
| V-05 | audit       | IPC contract       | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` | channel drift が新規に増えない                         |
| V-06 | docs QA     | sibling boundary   | 文書レビュー                                                         | Task05 / Task07 / Task08 と責務衝突がない              |
