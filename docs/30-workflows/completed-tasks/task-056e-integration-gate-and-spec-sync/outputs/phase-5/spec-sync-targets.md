# Phase 5 仕様同期対象一覧

## Step 1-A / 1-B / 1-C / 2 対象一覧

| 対象                                              | 区分         | Step | 更新理由                                    | 現時点の扱い       |
| ------------------------------------------------- | ------------ | ---- | ------------------------------------------- | ------------------ |
| current workflow `artifacts.json`                 | 常時更新     | 1-B  | Phase 状態の正本                            | 更新対象           |
| current workflow `index.md`                       | 常時更新     | 1-B  | 進捗導線の正本                              | 更新対象           |
| current workflow `phase-*.md`                     | 常時更新     | 1-B  | ステータスと完了条件の同期                  | 更新対象           |
| parent `task-056-ui-01-store-ipc-architecture.md` | 常時更新     | 1-C  | `tasks/completed-task/` 側へ導線を正規化    | 更新対象           |
| parent `task-0560-index.md`                       | 常時更新     | 1-C  | `tasks/completed-task/` 側へ導線を正規化    | 更新対象           |
| `task-workflow.md`                                | 常時更新     | 1-A  | `spec_created` / 完了記録 / 残課題導線      | Phase 12 で判定    |
| `lessons-learned.md`                              | 常時更新     | 1-A  | path 正規化と downstream handoff の教訓     | Phase 12 で判定    |
| aiworkflow / task-spec `LOGS.md`                  | 常時更新     | 1-A  | 実行ログ                                    | Phase 12 で判定    |
| `arch-state-management.md`                        | 条件付き更新 | 2    | 新しい state 統合ルール追加時のみ           | 初期判定: 更新不要 |
| `api-ipc-system.md`                               | 条件付き更新 | 2    | 新しい IPC 統合ルール追加時のみ             | 初期判定: 更新不要 |
| `security-api-electron.md`                        | 条件付き更新 | 2    | preload 公開境界に追加ルールがある場合のみ  | 初期判定: 更新不要 |
| `security-electron-ipc.md`                        | 条件付き更新 | 2    | sender / cleanup の新ルールがある場合のみ   | 初期判定: 更新不要 |
| `ui-ux-navigation.md`                             | 条件付き更新 | 2    | E 独自の nav handoff ルールが増える場合のみ | 初期判定: 更新不要 |
| `quality-requirements.md`                         | 条件付き更新 | 2    | docs-only gate 用の新閾値が必要な場合のみ   | 初期判定: 更新不要 |

## 更新不要メモ

- `database-*` は schema / storage の変更がないため対象外。
- `deployment-*` は CI/CD / 配布導線の変更がないため対象外。
- `ui-history-data-types.md` は DTO 追加がないため対象外。
