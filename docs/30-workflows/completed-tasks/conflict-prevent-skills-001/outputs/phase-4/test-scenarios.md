# Phase 4 Output: テストシナリオ

## TC-4-01: custom merge driver keep-ours 動作確認

| 項目   | 内容                                                            |
| ------ | --------------------------------------------------------------- |
| 対象   | `git config merge.ours.driver true` 設定済みの repo             |
| 操作   | 両ブランチで indexes/\*.md を異なる内容に変更して merge         |
| 期待値 | current branch 側のファイル内容が残り、conflict marker が出ない |
| AC対応 | AC-3 (custom/built-in 整合)                                     |

## TC-4-02: LOGS.md union merge

| 項目   | 内容                                         |
| ------ | -------------------------------------------- |
| 対象   | `.claude/skills/*/LOGS.md`                   |
| 操作   | 両ブランチでそれぞれ末尾に行を追記して merge |
| 期待値 | 双方の追記行が両方残る                       |
| AC対応 | AC-2 (4分類設計)                             |

## TC-4-03: generate-index.js deterministic 出力

| 項目   | 内容                                                                    |
| ------ | ----------------------------------------------------------------------- |
| 対象   | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`      |
| 操作   | `node scripts/generate-index.js` を2回実行                              |
| 期待値 | topic-map.md に `自動生成:` 日付行がなく、`\| L[0-9]+` 行番号索引が残る |
| AC対応 | AC-5 (deterministic topic-map)                                          |

## TC-4-04: canonical / mirror parity 検出

| 項目   | 内容                                           |
| ------ | ---------------------------------------------- |
| 対象   | `.claude/skills/` vs `.agents/skills/`         |
| 操作   | `diff -qr .claude/skills .agents/skills`       |
| 期待値 | 差分一覧が検出できる（full sync は follow-up） |
| AC対応 | AC-4 (canonical/mirror 一貫)                   |

## TC-4-05: EVALS.json schema 不変ガード

| 項目   | 内容                                 |
| ------ | ------------------------------------ |
| 対象   | `.claude/skills/*/EVALS.json`        |
| 操作   | 本 task 前後の schema キー一覧を比較 |
| 期待値 | schema キーが変化していない          |
| AC対応 | AC-6 (EVALS schema 不変)             |
