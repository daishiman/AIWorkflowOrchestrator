# 追記先ファイル記録

> Phase 5 タスク1 成果物
> 作成日: 2026-04-21

## canonical file

`.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`

## update/no-op 判定

**update（修正）**: §6 の `taskMetrics` フィールド定義が実態と乖離していたため修正。

## 修正内容

| 修正対象                       | Before                                              | After                                                  |
| ------------------------------ | --------------------------------------------------- | ------------------------------------------------------ |
| `taskMetrics.*` サブフィールド | flat構造（`createdCount`, `completedCount` 等 7件） | タスクIDキー辞書（`{TASK_ID}.completedPhases` 等 5件） |
| §6.1 運用ルール                | writer記述なし                                      | writer・更新タイミング・運用責任を追記                 |
| §8 変更履歴                    | 2026-04-19 のみ                                     | 2026-04-21 の修正記録を追加                            |

## 索引ファイル更新

| ファイル                                                            | 更新内容                               |
| ------------------------------------------------------------------- | -------------------------------------- |
| `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` | `qualityInsights` エントリを末尾に追加 |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`       | 既存エントリ（§6）が存在するため no-op |
