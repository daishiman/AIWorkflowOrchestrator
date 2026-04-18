# Phase 12 Output: 未タスク検出

## follow-up タスク一覧

| 優先度 | 内容                                 | 理由                                                  |
| ------ | ------------------------------------ | ----------------------------------------------------- |
| HIGH   | `.agents/skills/` full sync          | 本 task で部分 sync まで反映。full parity guard が必要 |
| HIGH   | EVALS consumer audit 完全版          | schema 変更前に全 consumer を特定する必要がある       |
| MEDIUM | `references/*.md merge=union` 再評価 | structured docs への union は長期的に不整合リスクあり |
| MEDIUM | LOGS.md archive policy 詳細化        | archive threshold と archive 先が未確定               |
| LOW    | int-test-skill の mirror への追加    | canonical のみに存在するスキルを mirror へ同期        |

## 本 wave で対応不要と判断したもの

| 項目                   | 理由                                  |
| ---------------------- | ------------------------------------- |
| EVALS schema 変更      | consumer 監査完了まで変更禁止（AC-6） |
| `.agents/skills/` 廃止 | index.md スコープ外                   |

## 既存 task / issue 接続

| 内容 | 接続先 |
| --- | --- |
| dual root same-wave sync guard | `docs/30-workflows/unassigned-task/task-imp-aiworkflow-same-wave-sync-guard-001.md` |
| Phase 12 dual skill-root mirror sync guard | `docs/30-workflows/issues/issue-1150.md` |
| mirror sync CI 自動検出 | `docs/30-workflows/unassigned-task/UT-UIUX-MIRROR-SYNC-CI-001.md` |
