# Phase 4: テスト作成

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| Phase     | 4                                               |
| タスクID  | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 |
| 前提Phase | Phase 3                                         |
| 後続Phase | Phase 5                                         |
| 作成日    | 2026-04-21                                      |

## 目的

silent break を検出する最小テストセットを設計し、Phase 5 実装前に期待結果を固定する。

## 実行タスク

1. 正常系、方言ミスマッチ系、desktop consumer 回帰、parity 系のテストシナリオを定義する
2. grep / diff / test の command suite を固定する
3. TC と実ファイル上のテスト名対応を記録する

## 参照資料

| 資料                      | パス                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| Phase 2 validation matrix | `outputs/phase-2/validation-matrix.md`                                             |
| execution template        | `.claude/skills/task-specification-creator/references/phase-template-execution.md` |

## 実行手順

- TC-01: writer が `snake_case` で書き込む
- TC-02: fixture / `apps/desktop` test fixture が `snake_case` 契約で読む
- TC-03: reader が `snake_case` で読む
- TC-04: 対象ファイル限定の旧方言残存 grep が 0 件
- TC-05: `.claude` / `.agents` parity が成立
- TC-06: 方言ミスマッチ負例を grep / fixture で検出できる

## 統合テスト連携

| 判定項目       | 基準              | 結果 |
| -------------- | ----------------- | ---- |
| test scenarios | 主要5シナリオ定義 | TBD  |
| command suite  | 再実行可能        | TBD  |

## 多角的チェック観点（AIが判断）

- 演繹思考: 正本方言が fixed なら旧方言残存は FAIL
- if思考: 先行タスク未完了なら実装テストではなく設計確認に留める

## サブタスク管理

1. シナリオ定義
2. command 定義
3. TC 対応表作成

## 成果物

| 成果物         | パス                                | 説明               |
| -------------- | ----------------------------------- | ------------------ |
| テストシナリオ | `outputs/phase-4/test-scenarios.md` | TC-01〜05          |
| command suite  | `outputs/phase-4/command-suite.md`  | grep / diff / test |

## 完了条件

- [ ] シナリオが方言・parity・残存確認をカバーした
- [ ] command suite を固定した
- [ ] テスト対象と期待結果を明文化した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを完了
- [ ] 成果物2件を定義
- [ ] 4条件を確認

## 次Phase

Phase 5: 実装
