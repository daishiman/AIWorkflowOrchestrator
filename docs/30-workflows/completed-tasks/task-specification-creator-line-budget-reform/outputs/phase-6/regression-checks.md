# Phase 6 Output: Regression Checks

## 回帰チェック一覧

| 項目                | 想定退行                                                      | 検出方法                                | 初回判定       |
| ------------------- | ------------------------------------------------------------- | --------------------------------------- | -------------- | -------- |
| entrypoint rebloat  | `SKILL.md` が再び詳細説明を抱え込む                           | `wc -l`、`rg -n "references/" SKILL.md` | 問題なし       |
| archive isolation   | `LOGS.md` から archive へ到達できない                         | `rg -n "logs-archive-index" LOGS.md`    | 問題なし       |
| family orphan       | index が child file を持たない                                | dependency grep                         | 問題なし       |
| naming drift        | `phase-template-*` などの命名が崩れる                         | `find` / `rg`                           | 問題なし       |
| mirror drift        | `.claude` と `.agents` の file set がずれる                   | `diff -qr`、`find                       | sort`          | 問題なし |
| root drift          | workflow 側で `.agents` を正本として参照する                  | root drift grep                         | 問題なし       |
| TODO false positive | 検出 script 自身の `FIXME` / `HACK` コメントが raw 検出される | `detect-unassigned-tasks.js`            | 要精査メモあり |

## 要精査メモ

| ID    | 内容                                                                               | Phase 7/12 での扱い                      |
| ----- | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| R6-01 | `detect-unassigned-tasks.js` が自分自身の `FIXME` / `HACK` コメントを raw 検出する | raw 件数と精査後件数を分離記録する       |
| R6-02 | root drift grep は no-hit で exit code 1 を返す                                    | コマンドログに「hit 0 = PASS」と明記する |

## 判定

blocking な回帰は検出されなかった。Phase 7 では coverage matrix で concern と dependency edge の取りこぼしを確認する。
