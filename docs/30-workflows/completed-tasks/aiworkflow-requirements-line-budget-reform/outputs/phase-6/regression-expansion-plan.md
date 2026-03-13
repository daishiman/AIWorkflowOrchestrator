# Phase 6 Output: Regression Expansion Plan

## 追加した再検証観点

1. parent file に `## 仕様書インデックス` があること
2. child companion に `> 親仕様書:` backlink があること
3. `quick-reference.md` / `resource-map.md` から代表 parent file 名を引けること
4. `task-workflow-backlog.md` に blocked dependency follow-up が formalize されること
5. `topic-map.md` は manual docs gate と分離して line count を記録すること

## 回帰コマンド

| コマンド                                                                                                                                | 目的                 |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------------- | -------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `rg -l '^## 仕様書インデックス$' .claude/skills/aiworkflow-requirements/references/\*.md .claude/skills/aiworkflow-requirements/LOGS.md | wc -l`               | parent count 確認    |
| `rg -l '^> 親仕様書:' .claude/skills/aiworkflow-requirements/references/\*.md                                                           | wc -l`               | child backlink count |
| `rg -n 'task-workflow\\.md                                                                                                              | lessons-learned\\.md | api-ipc-agent\\.md   | arch-state-management\\.md | ui-ux-feature-components\\.md | deployment\\.md' .claude/skills/aiworkflow-requirements/indexes/quick-reference.md .claude/skills/aiworkflow-requirements/indexes/resource-map.md` | discovery smoke |
| `wc -l .claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                                                     | G0 単独監査          |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                | mirror parity        |

## 期待値

- parent count = 34
- child backlink count >= 178
- discovery smoke で F1-F6 representative parents がヒットする
- G0 は blocked dependency として formalize される
