# Phase 2 Output: SubAgent Lane Plan

## lane definition

| lane   | owner concern                          | 入力                                        | 出力                               | 依存          |
| ------ | -------------------------------------- | ------------------------------------------- | ---------------------------------- | ------------- |
| Lane A | C1, C2                                 | current `SKILL.md`, `LOGS.md`, skill rules  | slim `SKILL.md` plan、archive plan | Phase 1 完了  |
| Lane B | C3, C4                                 | current `patterns.md`, `phase-templates.md` | reference family split plan        | Phase 1 完了  |
| Lane C | C5, C6                                 | current workflow guides                     | guide split plan                   | Phase 1 完了  |
| Lane V | link audit、mirror parity、line budget | Lane A-C outputs                            | validation result                  | Lane A-C 完了 |

## 実行順序

1. Phase 1 完了後に Lane A-C を開始する。
2. Lane A-C の設計成果物を揃えてから Lane V を開始する。
3. Lane V 完了後に Phase 3 review を確定する。

## 並列制約

| 制約                     | 理由                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| 並列数は 3 lane 上限     | `task-specification-creator` patterns の rate limit 教訓を反映する |
| Lane V は直列            | mirror diff と validation は final state を対象にする              |
| root decision は共有前提 | `.claude` 正本を lane 間で統一する                                 |

## Codex handoff 単位

| handoff | 対象                                                       |
| ------- | ---------------------------------------------------------- |
| Codex-A | `SKILL.md` と `LOGS.md` の再編                             |
| Codex-B | `patterns.md` と `phase-templates.md` の分割               |
| Codex-C | `spec-update-workflow.md` と `phase-11-12-guide.md` の分割 |
| Codex-V | validation、mirror sync、line budget 再計測                |
