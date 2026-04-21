# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 6                                |
| 後続Phase  | Phase 8                                |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

RALLY-002 の契約が targeted test と手動確認で十分に覆われているかを確認する。

## 実行タスク

1. AC と test の対応表を作る
2. uncovered path が downstream リスクになるか評価する
3. coverage 結果を簡潔にまとめる

## 実行手順

```bash
pnpm --filter @repo/desktop test -- --coverage
```

## 統合テスト連携

- quantitative coverage より AC トレースを優先する
- downstream で再テストすべき箇所は uncovered-analysis に送る

## 多角的チェック観点（AIが判断）

- MECE: AC と test が 1:1 で説明できるか
- 戦略的思考: 今ここで取るべき coverage と downstream に残す coverage を分けられているか

## サブタスク管理

| 項目         | 内容                  |
| ------------ | --------------------- |
| traceability | AC と test の対応表   |
| uncovered    | downstream 影響の判定 |

## 参照資料

| 資料名         | パス                   | 用途 |
| -------------- | ---------------------- | ---- |
| Phase 6 成果物 | `outputs/phase-6/*.md` | 入力 |

## 成果物

- `outputs/phase-7/coverage-check-result.md`
- `outputs/phase-7/traceability-coverage-report.md`
- `outputs/phase-7/uncovered-analysis.md`

## 完了条件

- [ ] AC と test の対応を整理した
- [ ] uncovered の要否を判断した
- [ ] coverage を summary 化した

## タスク100%実行確認【必須】

- [ ] 実行タスク 1〜3 完了
- [ ] 成果物を全件定義

## 次のPhase

Phase 8: リファクタリング
