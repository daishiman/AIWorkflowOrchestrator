# Phase 3 Output: aiworkflow-requirements Extraction Audit

## 抽出した正本

| 種別            | 参照パス                                                                            | 理由                                                 |
| --------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| split rule      | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`              | 500/700 行ルールの正本                               |
| split pattern   | `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md`    | family 別 split 設計の正本                           |
| skill overview  | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`  | skill 責務境界と Progressive Disclosure の全体像     |
| skill structure | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | canonical / mirror / references / indexes の責務境界 |
| skill resources | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md` | discovery index と参照導線の保持条件                 |
| skill process   | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`   | update-spec と generate-index の運用前提             |
| discovery       | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                 | 入口導線維持の前提                                   |
| discovery map   | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    | 逆引き導線の前提                                     |
| topic map       | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                       | G0 blocked dependency の判断対象                     |
| keywords        | `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                      | generate-index 生成物の一貫性確認                    |
| validation      | `.claude/skills/aiworkflow-requirements/agents/validate-spec.md`                    | validate-structure の品質観点                        |
| update flow     | `.claude/skills/aiworkflow-requirements/agents/update-spec.md`                      | generate-index と topic-map の扱い                   |
| phase gate      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                | `spec_created` と blocked dependency の記録先        |
| phase rule      | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`         | Phase 1-13 gate の前提                               |
| task rule       | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`          | 品質ゲートと単一責務                                 |
| lessons         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`              | rate limit、topic-map 再生成、phase ordering 教訓    |
| cross-skill     | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`         | `.claude` / `.agents` mirror 方針                    |

## 抽出が十分である理由

1. split 基準、命名規則、skill 構造、discovery 導線、phase gate、更新手順、mirror 方針、generated index、lessons の 9 系統を全て覆っている。
2. `topic-map.md` と `keywords.json` が generated artifact であることを `agents/update-spec.md` と generate-index 前提の両方で確認した。
3. `validate-structure.js` の監査穴を `agents/validate-spec.md` から読み取り、`wc -l indexes/topic-map.md` を追加した。
4. `claude-code-skills-overview.md` と `claude-code-skills-structure/resources/process.md` を加えることで、family split の設計根拠だけでなく branch-level spec sync と generated index 更新条件まで追える。

## 抽出から得た判断

- `aiworkflow-requirements` の今回 task では script を変更しないため、G0 は blocked dependency として扱うのが正しい。
- manual docs は family-wave で実装可能であり、こちらは current workflow の直接責務にできる。
- Phase 12 では `topic-map.md` と `keywords.json` を generated outputs として記録し、manual docs reform と同列に扱わない方が整合する。
- 今回の実装では `claude-code-skills-structure/resources/process.md` も必要抽出対象に含めることで、entrypoint / discovery / update 手順の根拠が workflow から欠けない状態になる。
