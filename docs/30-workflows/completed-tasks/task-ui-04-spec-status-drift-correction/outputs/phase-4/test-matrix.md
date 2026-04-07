# Phase 4 成果物: テストマトリクス

## メタ情報

| 項目     | 内容           |
| -------- | -------------- |
| 作成日   | 2026-04-07     |
| Phase    | 4 - テスト作成 |
| タスクID | TASK-UI-04     |

## テスト戦略

本タスクはドキュメント修正のみのため、自動テスト（unit/integration）は対象外。
検証は手動レビューによるチェックリストで実施する。

## 検証チェックリスト

### A. artifacts.json ステータス検証

| チェック項目                                          | 期待値      | 検証方法                           |
| ----------------------------------------------------- | ----------- | ---------------------------------- |
| TASK-P0-01 artifacts.json の status                   | `completed` | `jq '.status' artifacts.json`      |
| TASK-P0-02 artifacts.json の status                   | `completed` | `jq '.status' artifacts.json`      |
| TASK-P0-04 artifacts.json の status                   | `completed` | `jq '.status' artifacts.json`      |
| TASK-P0-05 artifacts.json の status                   | `completed` | `jq '.status' artifacts.json`      |
| TASK-P0-06 artifacts.json の status                   | `completed` | `jq '.status' artifacts.json`      |
| TASK-P0-07 artifacts.json の status                   | `completed` | `jq '.status' artifacts.json`      |
| TASK-P0-08 artifacts.json の status                   | `completed` | `jq '.status' artifacts.json`      |
| TASK-P0-09 artifacts.json の status                   | `completed` | `jq '.status' artifacts.json`      |
| 全 artifacts.json の lastUpdated が `2026-04-07` 以降 | ✓           | `jq '.lastUpdated' artifacts.json` |

### B. index.md ステータス検証

| チェック項目                         | 期待値                                             | 検証方法                     |
| ------------------------------------ | -------------------------------------------------- | ---------------------------- |
| 全 P0 タスクの index.md ステータス行 | `completed`                                        | `grep "ステータス" index.md` |
| TASK-P0-07 の index.md ステータス行  | `completed`（旧: Phase 1-12 complete... ではない） | `grep "ステータス" index.md` |

### C. skill-creator-agent-sdk-lane/index.md 検証

| チェック項目                              | 期待値                        | 検証方法 |
| ----------------------------------------- | ----------------------------- | -------- |
| P0 タスクのリンクが正しいパスを指している | `../completed-tasks/step-...` | 手動確認 |

### D. executor-guide.md 検証

| チェック項目                          | 期待値               | 検証方法 |
| ------------------------------------- | -------------------- | -------- |
| P0 タスク群の完了状態が記載されている | completed の記載あり | 手動確認 |

## 受入条件（AC）との対応

| AC   | テスト項目                       | 対応チェック                 |
| ---- | -------------------------------- | ---------------------------- |
| AC-1 | artifacts.json status 一致       | チェックリスト A             |
| AC-2 | completed-tasks/ への移動        | 移動済みを確認（Phase 1 済） |
| AC-3 | 部分完了タスクの残作業記録       | 全タスク完了のため N/A       |
| AC-4 | 親 index.md のステータス反映     | チェックリスト C             |
| AC-5 | executor-guide.md ステータス更新 | チェックリスト D             |
