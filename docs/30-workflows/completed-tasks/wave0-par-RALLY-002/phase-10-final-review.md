# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 10                                     |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 9                                |
| 後続Phase  | Phase 11                               |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

RALLY-002 の verify_existing ワークフローが skill準拠・close-out 準備・downstream handoff を満たしているか最終判定する。

## 実行タスク

1. AC-1〜AC-5 を最終確認する
2. quality report と 4条件監査を突き合わせる
3. Phase 11/12/13 へ進めるか判定する

## 実行手順

- requirements / design / tests / docs の相互参照を確認する
- outputs 命名と artifacts parity を確認する
- Phase 13 が blocked 前提になっているか確認する

## 統合テスト連携

- machine validation を最終 gate の一部として扱う
- manual semantic check の不足があれば Phase 11 に戻す

## 多角的チェック観点（AIが判断）

- 演繹思考: AC を上から順に証明できるか
- 逆説思考: 今ここで未解決を残すと downstream で何が壊れるか

## サブタスク管理

| 判定  | 条件                               |
| ----- | ---------------------------------- |
| PASS  | AC・4条件・close-out 準備が揃う    |
| MINOR | wording / outputs 定義の微修正のみ |
| MAJOR | verify_existing 前提が崩れる       |

## 参照資料

| 資料名         | パス                   | 用途     |
| -------------- | ---------------------- | -------- |
| Phase 9 成果物 | `outputs/phase-9/*.md` | 判定材料 |

## 成果物

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-10/gate-decision.md`
- `outputs/phase-10/release-readiness-checklist.md`

## 完了条件

- [ ] AC-1〜AC-5 を確認した
- [ ] PASS / MINOR / MAJOR を判定した
- [ ] Phase 11/12/13 の進行条件を確認した

## タスク100%実行確認【必須】

- [ ] 実行タスク 1〜3 完了
- [ ] 成果物を全件定義

## 次のPhase

Phase 11: 手動テスト検証
