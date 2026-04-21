# Unassigned Task Detection

## 判定

- 新規 unassigned task 作成: 不要
- 既存継続タスク: あり

## 継続管理する課題

- `docs/30-workflows/unassigned-task/task-ipc-handler-registration-snapshot-coverage.md`

## 理由

- Wave 1〜3 の残件は既存 unassigned task のスコープに含まれている
- 今回のレビューで新たに見つかったのは母集団漏れ (`registerChatExportHandlers`) と環境不整合だが、どちらも既存タスク内の継続課題として扱える

## 注意

- 「0件」とは記録しない
- 残件は backlog から落とさず既存タスクに集約する
