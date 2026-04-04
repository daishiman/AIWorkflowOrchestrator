# Phase 12: ドキュメント更新履歴

## Step 1-A: 完了タスクセクション追加

| 更新ファイル                                         | 更新内容                        | current/baseline |
| ---------------------------------------------------- | ------------------------------- | ---------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`     | task-ut-p0-02-001 完了ログ追記  | current          |
| `.claude/skills/task-specification-creator/LOGS.md`  | task-ut-p0-02-001 完了ログ追記  | current          |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | ImproveFeedbackHistory 学習事項 | current          |
| `.claude/skills/task-specification-creator/SKILL.md` | Phase 2 型確認改善              | current          |

## Step 1-B: task-workflow 同期

| 更新ファイル                 | 更新内容                           | current/baseline |
| ---------------------------- | ---------------------------------- | ---------------- |
| `task-workflow-backlog.md`   | task-ut-p0-02-001 を完了に移動     | current          |
| `task-workflow-completed.md` | task-ut-p0-02-001 完了エントリ追加 | current          |

## Step 1-C: index / artifacts parity

| 更新ファイル        | 更新内容                                 | current/baseline |
| ------------------- | ---------------------------------------- | ---------------- |
| `index.md`          | Phase 4-12 ステータスを completed に更新 | current          |
| `artifacts.json`    | Phase 4-12 ステータスを completed に更新 | current          |
| `generate-index.js` | --regenerate 実行                        | current          |

## Step 1-D: 実装状況テーブル更新

| 更新ファイル     | 更新内容                         | current/baseline |
| ---------------- | -------------------------------- | ---------------- |
| `index.md`       | status: spec_created → completed | current          |
| `artifacts.json` | status: spec_created → completed | current          |

## Step 1-E: 関連タスクテーブル更新

no-op（関連タスクテーブルは index.md の依存タスクに記載済み）

## Step 2: システム仕様更新

| 更新ファイル                                    | 更新内容                          | 差分概要                  | current/baseline |
| ----------------------------------------------- | --------------------------------- | ------------------------- | ---------------- |
| `arch-electron-services-details-part2.md`       | ImproveFeedbackHistory 型仕様追記 | 新セクション追加（~15行） | current          |
| `lessons-learned-phase12-workflow-lifecycle.md` | feedback memory 構造化教訓追記    | 新エントリ追加（~10行）   | current          |
