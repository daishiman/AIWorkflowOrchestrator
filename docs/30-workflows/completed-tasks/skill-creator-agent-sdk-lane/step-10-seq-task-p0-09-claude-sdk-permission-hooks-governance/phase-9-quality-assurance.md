# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 9                                      |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

governance が dynamic skill-creator 実行を阻害せず、監査可能性を向上させているかを確認する。

## 実行タスク

- tool policy の過剰制約確認
- audit 欠落確認
- dynamic skill-creator 主線維持確認

## 実行手順

### ステップ1: tool policy の過剰制約を確認する

- plan / execute / verify / improve の境界が狭すぎないか確認する

### ステップ2: audit 欠落を確認する

- provenance / denial / tool result が欠けていないか確認する

### ステップ3: dynamic skill-creator 主線の維持を確認する

- 静的埋め込みや fixed prompt へ寄っていないか確認する

### ステップ4: quality gate を束ねる

- lint / typecheck / coverage / link / validator の結果をまとめる

## 品質ゲート

| 項目      | 確認内容                                      |
| --------- | --------------------------------------------- |
| lint      | 余計な warning / error がないか               |
| typecheck | 共有型と SDK 契約が整合するか                 |
| coverage  | phase ごとの責務がテストで覆われているか      |
| link      | canonical path が壊れていないか               |
| validator | task-specification-creator の出力検証に通るか |

## 参照資料

| 資料名  | パス                        | 説明     |
| ------- | --------------------------- | -------- |
| Phase 5 | `phase-5-implementation.md` | 実装結果 |

## 成果物

| 成果物         | パス                                | 説明    |
| -------------- | ----------------------------------- | ------- |
| quality report | `outputs/phase-9/quality-report.md` | QA 結果 |

## 完了条件

- [x] quality gate が確認されている
- [x] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- Phase 7 の coverage 結果を品質ゲートへ接続する
- Phase 10 の最終判定へ quality の根拠を渡す

## 多角的チェック観点（AIが判断）

- gate が主観ではなく検証可能な指標で書かれているか
- dynamic skill-creator の主線が品質確認で壊れていないか
- 参照リンクと validator の結果が一致しているか

## サブタスク管理

| SubAgent   | 責務                        |
| ---------- | --------------------------- |
| SubAgent-A | lint / typecheck            |
| SubAgent-B | coverage / link             |
| SubAgent-C | validator / quality summary |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

Phase 10: 最終レビュー
