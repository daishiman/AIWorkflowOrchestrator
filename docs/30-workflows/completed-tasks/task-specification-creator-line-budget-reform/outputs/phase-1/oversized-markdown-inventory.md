# Phase 1 Output: Oversized Markdown Inventory

## 対象一覧

| ID  | パス                                                                           | 行数 | 現状の責務混在                                             | split 方針                                           |
| --- | ------------------------------------------------------------------------------ | ---: | ---------------------------------------------------------- | ---------------------------------------------------- |
| C1  | `.claude/skills/task-specification-creator/SKILL.md`                           |  508 | quick start、Phase 12 detail、command list、history が同居 | entrypoint を短縮し detail を references へ委譲      |
| C2  | `.claude/skills/task-specification-creator/LOGS.md`                            | 6112 | 使用履歴、完了記録、旧 format 説明、古い log が同居        | rolling log と archive を分離                        |
| C3  | `.claude/skills/task-specification-creator/references/patterns.md`             | 2186 | 成功、失敗、QA、運用、Phase 12 を 1 枚へ集約               | pattern family ごとの index 構造へ分離               |
| C4  | `.claude/skills/task-specification-creator/references/phase-templates.md`      | 1818 | 共通 template、Phase 1-13 個別 template が混在             | 共通、execution、Phase 11、Phase 12、Phase 13 を分離 |
| C5  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` |  909 | Step 1、Step 2、validation matrix、examples が混在         | completion、domain sync、validation を分離           |
| C6  | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    |  586 | screenshot workflow と documentation workflow が混在       | Phase 11 guide と Phase 12 guide を分離              |

## 非対象

| パス                                                                                 |   行数 | 判断                                       |
| ------------------------------------------------------------------------------------ | -----: | ------------------------------------------ |
| `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` |    499 | 500 行未満のため本 task の実行対象から外す |
| `.agents/skills/task-specification-creator/*`                                        | mirror | canonical root 完了後に同期対象として扱う  |

## 機械検証の初期値

| コマンド                                                                          | 目的               |
| --------------------------------------------------------------------------------- | ------------------ | --------- | -------------------- |
| `find .claude/skills/task-specification-creator -maxdepth 2 -type f -name '\*.md' | xargs wc -l        | sort -nr` | over-limit inventory |
| `find .agents/skills/task-specification-creator -maxdepth 2 -type f -name '\*.md' | xargs wc -l        | sort -nr` | mirror 側 inventory  |
| `rg -n '^#{1,4} ' .claude/skills/task-specification-creator/SKILL.md`             | 見出し構造の把握   |
| `rg -n '^#{1,4} ' .claude/skills/task-specification-creator/references/*.md`      | split point の把握 |
