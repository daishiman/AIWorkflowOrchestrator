# Phase 1 Output: Requirements Definition

## 目的

`task-specification-creator` の over-limit Markdown を、実装可能な concern 単位へ分解するための requirement baseline を固定する。

## 背景

- source doc は `SKILL.md` 1 件だけを対象としている
- actual inventory は 6 concern へ広がっている
- `skill-creator` と `aiworkflow-requirements` は、500 行制約、直リンク、Progressive Disclosure、canonical root を要求している

## 要件

| 区分  | 要件                                                                                   |
| ----- | -------------------------------------------------------------------------------------- |
| FR-1  | `.claude/skills/task-specification-creator/` 配下の 500 行超 Markdown 6 件を対象化する |
| FR-2  | 各 concern に対し、保持責務、移設先、mirror sync 方針を定義する                        |
| FR-3  | SKILL entrypoint は 500 行以内へ収める plan を持つ                                     |
| FR-4  | LOGS と patterns と workflow guides は別 concern として扱う                            |
| FR-5  | `.claude` 正本 / `.agents` mirror の同期検証を plan に含める                           |
| NFR-1 | Phase 1-3 完了前は Phase 4 以降を開始しない                                            |
| NFR-2 | SubAgent 並列数は 3 lane 以下に制限する                                                |
| NFR-3 | line budget、直リンク、mirror parity を機械検証できる                                  |

## source からの拡張判断

| source                                           | 元スコープ          | 拡張後スコープ                       | 拡張理由                                                             |
| ------------------------------------------------ | ------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| Issue #1144                                      | `SKILL.md` 行数超過 | 6 concern の docs reform             | target directory 全体を棚卸しした結果、同一病理が 5 件追加で存在した |
| `task-imp-task-spec-skill-md-line-budget-001.md` | `SKILL.md` 再構成   | entrypoint + logs + reference family | user 指示が「全ての 500 行超 Markdown」へ拡張している                |

## 受入基準との対応

| AC   | requirement | 判定方法                          |
| ---- | ----------- | --------------------------------- |
| AC-1 | FR-1        | inventory table と `wc -l`        |
| AC-2 | FR-2        | Phase 2 split plan                |
| AC-3 | FR-3        | `quick_validate.js` と line count |
| AC-4 | FR-5        | `diff -qr` と path audit          |
| AC-5 | NFR-2       | SubAgent lane plan                |
| AC-6 | NFR-1       | artifacts status                  |
| AC-7 | NFR-3       | validation matrix                 |
