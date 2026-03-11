# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 6                                                        |
| Phase名    | テスト拡充                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                  |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤               |
| 前提Phase  | [phase-5-implementation.md](./phase-5-implementation.md) |
| 後続Phase  | [phase-7-coverage-check.md](./phase-7-coverage-check.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-11                                               |

## 目的

導線変更による route 回帰、表示崩れ、責務逸脱、advanced 導線逆流を検出するテストを追加する。

## 実行タスク

- 正常系テスト追加: 主要導線の happy path を追加する
- 異常系テスト追加: 入口不整合や hidden fallback 逆流を検出する
- state ownership テスト追加: nav/state/view の責務逸脱を検出する
- 後続依存テスト追加: Task02-05 の入口整合を検証する

## 参照資料

| 参照資料           | パス                                            | 内容               |
| ------------------ | ----------------------------------------------- | ------------------ |
| 実装ログ           | `outputs/phase-5/implementation-log.md`         | 実装内容           |
| test cases         | `outputs/phase-4/test-cases.md`                 | 追加対象 TC        |
| route contract     | `outputs/phase-4/route-contract-test-matrix.md` | route 観点         |
| change file matrix | `outputs/phase-5/change-file-matrix.md`         | テスト対象ファイル |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                              | 内容            |
| --------------------- | --------------------------------------------------------------------------------- | --------------- |
| quality requirements  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage 基準   |
| component testing     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | UI テスト粒度   |
| accessibility testing | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | a11y 回帰       |
| state management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | state ownership |

## 実行手順

1. Phase 4 で定義した TC-ID に実装結果を紐付ける。
2. 正常系、異常系、state ownership、依存契約の 4 系統で不足テストを追加する。
3. 主要 route と advanced fallback の回帰テストを増やす。
4. Phase 7 で使う coverage 分析向けにテスト分類を明記する。

## 統合テスト連携

| 観点                | 連携内容                                                 |
| ------------------- | -------------------------------------------------------- |
| route 回帰          | shell / nav / view の結線を通しで検証する                |
| state ownership     | `navigationSlice` `uiSlice` local state の責務を検証する |
| downstream contract | Task02-05 の入口整合を将来テストへ引き継ぐ               |

## 成果物

| 成果物             | パス                                           | 説明                 |
| ------------------ | ---------------------------------------------- | -------------------- |
| 追加テスト結果     | `outputs/phase-6/test-expansion-result.md`     | 追加分の要約         |
| 回帰ケース一覧     | `outputs/phase-6/regression-case-matrix.md`    | route/advanced/state |
| 依存契約テスト一覧 | `outputs/phase-6/downstream-contract-tests.md` | Task02-05 入口整合   |

## 完了条件

- [x] 主要導線の正常系テストが追加されている
- [x] advanced 導線の回帰テストが追加されている
- [x] state ownership テストが追加されている
- [x] Task02-05 依存契約テストが追加されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-5-implementation.md](./phase-5-implementation.md)
- 後続: [phase-7-coverage-check.md](./phase-7-coverage-check.md)

## サブタスク管理

- [x] 参照資料確認
- [x] 正常系テスト追加
- [x] 異常系/advanced テスト追加
- [x] state ownership テスト追加
- [x] 成果物作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 追加テストが Phase 7 の分類に接続されている
- [x] downstream contract 観点が残っている

## 次のPhase

Phase 7: [phase-7-coverage-check.md](./phase-7-coverage-check.md)
