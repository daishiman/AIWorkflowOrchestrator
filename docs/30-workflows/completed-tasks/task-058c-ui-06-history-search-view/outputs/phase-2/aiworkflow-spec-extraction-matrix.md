# Phase 2 aiworkflow spec extraction matrix

| 参照仕様                                  | 適用先                 | 反映内容                                      |
| ----------------------------------------- | ---------------------- | --------------------------------------------- |
| `ui-ux-design-principles.md`              | タイトル / copy        | `あなたの記録`、短い能動表現                  |
| `master-design.md`                        | 画面位置づけ           | HistorySearchView を timeline view として扱う |
| `arch-state-management.md`                | slice                  | 個別 selector 維持、P31 を回避                |
| `api-ipc-system.md`                       | handler / preload      | invoke envelope 維持                          |
| `ui-history-design.md`                    | loading / error / aria | `role=status`, `role=alert`, list semantics   |
| `testing-accessibility.md`                | test                   | `aria-expanded`、accessible name、keyboard    |
| `architecture-implementation-patterns.md` | hook                   | IntersectionObserver のテストハーネス         |
| `quality-requirements.md`                 | coverage               | branch を timeline / slice に厚く取る         |
