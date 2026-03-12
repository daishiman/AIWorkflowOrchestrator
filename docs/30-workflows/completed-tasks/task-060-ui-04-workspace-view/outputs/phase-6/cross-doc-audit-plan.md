# Phase 6 Cross-Doc Audit Plan

## 監査面

| 面            | 対象ファイル                                         | 監査内容                                          |
| ------------- | ---------------------------------------------------- | ------------------------------------------------- |
| parent        | `task-060-ui-04-workspace-view.md`                   | child 送客導線が completed-task に向いているか    |
| orchestration | `task-000-master-index.md`                           | Step 6 の child / parent 順序が正規化されているか |
| system spec   | `task-workflow.md`, `ui-ux-feature-components.md`    | current/completed の path drift がないか          |
| evidence      | child workflow 3本の `outputs/phase-11/screenshots/` | 8 / 8 / 11 の png が実在するか                    |

## 実行順

1. parent pointer
2. master index
3. child evidence 実体
4. system spec drift

## fail policy

- parent / master index の fail は Phase 5 へ戻す
- system spec の fail は Phase 12 同期対象に登録し、QA リスクへ昇格する
- child evidence 実体 fail は Phase 11 の blocked 扱いにする
