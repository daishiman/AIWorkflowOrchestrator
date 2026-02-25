# Phase 1 要件定義

## SubAgent実行結果

| SubAgent   | 担当         | 実施結果                                                                    |
| ---------- | ------------ | --------------------------------------------------------------------------- |
| SubAgent-A | 現行仕様分析 | `audit-unassigned-tasks.js` の既存挙動は全体監査のみ（scope指定不可）と確認 |
| SubAgent-B | 判定基準定義 | current/baseline 分離、current基準 exit code を定義                         |
| Lead       | 統合         | 要件・制約・受入基準を Phase 2 入力として固定                               |

## 機能要件

| ID   | 要件                                                                     |
| ---- | ------------------------------------------------------------------------ |
| FR-1 | `--target-file` で監査対象を明示指定できる                               |
| FR-2 | `--diff-from` で差分ファイルを current 対象として抽出できる              |
| FR-3 | 監査結果を `currentViolations` / `baselineViolations` に分離して出力する |
| FR-4 | scoped実行時は current 違反のみで exit code を決定する                   |
| FR-5 | scope未指定時は既存互換（全体違反で exit 1）を維持する                   |

## 非機能要件

| ID    | 要件                                                                                        |
| ----- | ------------------------------------------------------------------------------------------- |
| NFR-1 | 既存JSONフィールド（`totals`/`formatViolations`/`namingViolations`/`misplacedFiles`）を維持 |
| NFR-2 | invalid option / invalid path は明示エラー + exit code 2                                    |
| NFR-3 | 再現性あるCLIテストで current/baseline 分離を検証可能にする                                 |
| NFR-4 | Phase 12運用で「対象監査→全体監査」の判定順を適用可能にする                                 |

## スコープ

- 含む: `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`、関連テスト、運用ガイド更新
- 含まない: 既存67件フォーマット違反そのものの一括修正

## 引き継ぎ

- Phase 2 では CLI契約（入力制約、出力スキーマ、exit code）を表で固定する。
- Phase 4 では Red証跡として「scope指定しても全体FAILになる現状」を残す。
