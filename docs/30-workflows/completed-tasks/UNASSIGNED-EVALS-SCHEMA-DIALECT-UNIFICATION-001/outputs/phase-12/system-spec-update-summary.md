# Phase 12: システム仕様更新サマリー

## Step 1-A: same-wave sync 対象

| 種別             | 更新先                                                                                             | 条件                           |
| ---------------- | -------------------------------------------------------------------------------------------------- | ------------------------------ |
| 完了記録         | `docs/30-workflows/completed-tasks/task-evals-schema-dialect-unification-001.md`                   | タスク完了時                   |
| LOGS             | `.claude/skills/aiworkflow-requirements/LOGS.md`, `.agents/skills/aiworkflow-requirements/LOGS.md` | current fact を追加する場合    |
| 索引             | `.claude/.agents/skills/aiworkflow-requirements/indexes/topic-map.md`, `keywords.json`             | 正本記述や検索語が増える場合   |
| artifacts / lane | `artifacts.json`, `outputs/artifacts.json`, `index.md`                                             | close-out 時は同一 wave で同期 |

## Step 1-B: 実装状況と関連タスク

- 本タスク完了時は `completed`
- 後続 validator タスクは `UNASSIGNED-EVALS-VALIDATOR-GUARD-001`
- `automation-30` は対象外のため関連タスクへ昇格しない

## Step 1-C: 未タスク候補

- 新規未タスクは原則 0 件
- ただし実装中に `apps/desktop` 以外の hidden consumer が見つかった場合のみ `docs/30-workflows/unassigned-task/` へ追加

## Step 2: current fact 同期

本タスクは consumer contract を変更するため、完了時には `evals-schema-spec.md` の current fact 同期を必須とする。

必須同期候補:

1. `skill-creator` の mixed dialect 実態
2. `task-specification-creator` の camelCase consumer 解消
3. `apps/desktop` fixture / test consumer の扱い
4. validator follow-up ID の相互リンク
