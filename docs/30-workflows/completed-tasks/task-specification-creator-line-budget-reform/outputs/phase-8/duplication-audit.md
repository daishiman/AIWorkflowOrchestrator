# Phase 8 Output: Duplication Audit

## 削減した重複

| 対象                                     | 旧状態                                  | 現状態                                                        | 効果                                            |
| ---------------------------------------- | --------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| `SKILL.md` の Phase 12 詳細              | entrypoint 内に長い Phase 12 説明が混在 | `phase-12-documentation-guide.md` と `spec-update*.md` に分離 | quick start と detail の責務を分離              |
| `LOGS.md` の全履歴保持                   | 1 ファイルに全文履歴を集約              | rolling log + archive index + 月次 archive                    | 再利用情報だけを先頭へ残せる                    |
| `patterns.md` の mixed concerns          | workflow / audit / Phase 12 が同居      | 3 family file に分割                                          | 問題種別ごとの探索が短くなる                    |
| `phase-templates.md` の 1 枚運用         | Phase 1-13 template が混在              | core / execution / phase11 / phase12 / phase13 に分割         | phase 別の読み込み量を削減                      |
| `spec-update-workflow.md` の mixed steps | Step 1 / Step 2 / validation が同居     | step / decision / matrix を分離                               | Phase 12 の誤更新を減らす                       |
| `phase-11-12-guide.md` の mixed guide    | screenshot と docs guide が同居         | Phase 11 と 12 の guide を分離                                | docs-only task で screenshot 手順を読まずに済む |

## 残した要約の範囲

| 親 file            | 残した内容                         | detail へ逃がした内容                              |
| ------------------ | ---------------------------------- | -------------------------------------------------- |
| `SKILL.md`         | モード判定、phase 概要、導線一覧   | template detail、spec update detail、Phase 12 実務 |
| `LOGS.md`          | 直近 log、archive 導線、運用ルール | 月次履歴、旧 version 詳細                          |
| family index files | family 概要、読み込み条件、リンク  | 実行パターンや checklist の詳細                    |

## 判定

重複は「入口の要約」と「detail の実務説明」を混ぜない粒度まで削減できている。Phase 9 では validator がこの構造を壊していないかを再確認する。
