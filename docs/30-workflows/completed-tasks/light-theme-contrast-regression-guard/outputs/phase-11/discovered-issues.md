# Phase 11 発見課題

## サマリー

| 区分             | 件数 | 備考                                     |
| ---------------- | ---- | ---------------------------------------- |
| current issue    | 0    | 今回差分としての新規 regression は未検出 |
| baseline backlog | 3    | 既存 remediation task に routing         |
| comparison note  | 1    | Dashboard dark baseline は比較用         |

## current issue

なし

## baseline backlog

| ID    | 観測                                                                             | 証跡                                              | routing                                                                                                                             |
| ----- | -------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| BL-01 | ThemeSelector の `bg-white/5` / `text-white/60` 系 utility が light shell で薄い | `screenshots/TC-11-01-settings-light.png`         | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md` |
| BL-02 | Auth helper text `text-white/60` が light panel 上で弱く見える                   | `screenshots/TC-11-03-auth-light.png`             | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md` |
| BL-03 | WorkspaceSearchPanel が light 指定でも dark slate surface を保持する             | `screenshots/TC-11-04-workspace-search-light.png` | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md` |

## routing 判断

- Guard 自体の不足ではなく、remediation 対象は shared color migration に寄せる。
- current workflow では audit / screenshot / documentation bridge を維持し、UI color replacement は行わない。
