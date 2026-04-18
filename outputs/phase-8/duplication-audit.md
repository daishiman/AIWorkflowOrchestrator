# TASK-CONFLICT-PREVENT-001: Phase 8 重複監査

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| タスクID   | TASK-CONFLICT-PREVENT-001 |
| Phase      | 8                         |
| 作成日     | 2026-04-18                |
| ステータス | completed                 |

## 目的

Phase 1〜6 のドキュメント全体で重複した記述・矛盾する wording・過剰な補助手順を洗い出し、
正本を確定して統一済みであることを記録する。

## 重複・矛盾の一覧

### DUP-01: merge policy テーブルの重複

| 項目     | 内容                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| 発生箇所 | phase-02-design.md, phase-05-implementation.md                                                             |
| 重複内容 | G1/G2/G3/G4 の merge policy テーブルが両ファイルに存在していた                                             |
| 正本     | phase-02-design.md を正本とする                                                                            |
| 処理     | phase-05-implementation.md の policy テーブルを削除し、「phase-02-design.md §merge policy 参照」に置換済み |
| 判定     | 解消済み                                                                                                   |

### DUP-02: built-in union / custom keep-ours の説明重複

| 項目     | 内容                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| 発生箇所 | phase-02-design.md, phase-03-design-review.md, phase-06-test-expansion.md            |
| 重複内容 | 「built-in の union ドライバ」と「custom keep-ours ドライバ」の説明が各 phase に散在 |
| 正本     | phase-02-design.md §driver 定義を正本とする                                          |
| 処理     | phase-03 / phase-06 は「Phase 2 設計参照」として簡略化済み                           |
| 判定     | 解消済み                                                                             |

### DUP-03: EVALS 扱いの記述ゆれ

| 項目     | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| 発生箇所 | phase-01-requirements.md, phase-04-test-creation.md                              |
| 重複内容 | 「EVALS schema は変更しない」という記述が「schema 変更を検討する」と混在していた |
| 正本     | 「本 task では schema を変更しない」に統一                                       |
| 処理     | phase-04 の条件付き記述を「schema 不変・JSON 向け merge policy のみ」に修正済み  |
| 判定     | 解消済み                                                                         |

### DUP-04: Phase 13 blocked / PR 作成の wording ゆれ

| 項目     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 発生箇所 | index.md, phase-13-pr.md, artifacts.json                                           |
| 重複内容 | 「spec_created」「blocked」「planned」が混在                                       |
| 正本     | Phase 13 は「blocked」に統一                                                       |
| 処理     | index.md のステータス列、artifacts.json の phase13 エントリを「blocked」に更新済み |
| 判定     | 解消済み                                                                           |

## 過剰手順の削除

| 対象                                 | 内容                                             | 処理                                                 |
| ------------------------------------ | ------------------------------------------------ | ---------------------------------------------------- |
| phase-06-test-expansion.md の重複 TC | TC-4-01〜05 の再掲が TC-6-xx として重複していた  | TC-6-xx を「TC-4-xx の拡張」として差分のみに整理済み |
| session-init.sh の重複 warn          | driver 未設定 warn が 2 箇所に重複記述されていた | 1 箇所に集約済み                                     |

## 統一後の wording 規則

| 概念                        | 正式表記                                   |
| --------------------------- | ------------------------------------------ |
| Git 組み込み union ドライバ | `built-in union`                           |
| カスタム keep-ours ドライバ | `custom keep-ours` / `merge=ours`          |
| 条件付き適用                | `consumer audit PASS 時のみ`               |
| EVALS の扱い                | `schema 不変・JSON 向け merge policy のみ` |
| Phase 13                    | `blocked (user approval 待ち)`             |

## 接続先

- navigation-refactor-summary.md: wording 統一と参照名 drift 確認の詳細
- Phase 9 quality-report.md: 統一後の validator 結果
