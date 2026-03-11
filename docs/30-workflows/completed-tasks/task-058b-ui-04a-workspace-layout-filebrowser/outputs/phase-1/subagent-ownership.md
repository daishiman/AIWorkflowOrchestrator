# Phase 1 SubAgent 責務表

| SubAgent   | 関心                                                | 主対象                                                   |
| ---------- | --------------------------------------------------- | -------------------------------------------------------- |
| SubAgent-A | UI shell / responsive / status bar / resize         | `WorkspaceView`, layout components, Phase 11 screenshots |
| SubAgent-B | store / IPC / watcher / persist                     | selectors, hooks, Main handler, preload contract         |
| SubAgent-C | unit test / component test / coverage / QA          | Vitest, coverage, validator                              |
| SubAgent-D | workflow outputs / documentation / system spec sync | Phase 3, 10, 12 artifacts, LOGS/SKILL 同期               |

## 並列実行ポリシー

- A と B は Phase 4-6 で並列可能。
- C は A/B の契約確定後にテストを拡張する。
- D は Phase 1-3 の根拠台帳を先行更新し、Phase 12 で最終同期する。
