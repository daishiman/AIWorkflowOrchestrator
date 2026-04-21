# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 9                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 8                                |
| 後続Phase  | Phase 10                               |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

4条件・skill準拠・downstream 依存整合を同時に確認し、最終レビュー前の品質を固める。

## 実行タスク

1. 4条件を再監査する
2. validator / lint / targeted test / manual semantic check の結果を統合する
3. RALLY-010 以降への前提不足がないか確認する

## 実行手順

- 矛盾なし: 上流設計書と現コードが説明可能か
- 漏れなし: Phase 11/12/13 の canonical outputs が揃っているか
- 整合性あり: index / artifacts / phase 本文が一致しているか
- 依存関係整合: blocks / downstream chain が一致しているか

## 統合テスト連携

- machine validation と human review の両方を記録する
- Phase 12 close-out の前提不足はここで潰す

## 多角的チェック観点（AIが判断）

- システム思考: 単一 phase の修正が全体台帳を壊していないか
- KJ法: 課題を構造違反 / close-out 不足 / downstream 依存に束ねる

## サブタスク管理

| 項目  | 内容                                 |
| ----- | ------------------------------------ |
| 4条件 | 矛盾 / 漏れ / 整合 / 依存            |
| gates | validator / lint / targeted / manual |

## 参照資料

| 資料名            | パス                                 | 用途     |
| ----------------- | ------------------------------------ | -------- |
| Phase 5〜8 成果物 | `outputs/phase-5`〜`outputs/phase-8` | 品質統合 |

## 成果物

- `outputs/phase-9/quality-report.md`
- `outputs/phase-9/risk-register.md`
- `outputs/phase-9/four-conditions-audit.md`

## 完了条件

- [ ] 4条件監査を完了した
- [ ] quality gate を統合した
- [ ] downstream 前提不足を除去した

## タスク100%実行確認【必須】

- [ ] 実行タスク 1〜3 完了
- [ ] 成果物を全件定義

## 次のPhase

Phase 10: 最終レビューゲート
