# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 10                                             |
| Phase名    | 最終レビュー                                   |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 1-9                                      |
| 後続Phase  | Phase 11（手動テスト）                         |
| ステータス | spec_created                                   |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

AC-1〜AC-4 の fulfillment と実装 readiness を判定する。

## 実行タスク

- AC review
- dependency review
- gate decision

## 参照資料

| 参照資料 | パス                           | 内容     |
| -------- | ------------------------------ | -------- |
| Phase 1  | `phase-1-requirements.md`      | 要件定義 |
| Phase 2  | `phase-2-design.md`            | 設計契約 |
| Phase 5  | `phase-5-implementation.md`    | 実装計画 |
| Phase 9  | `phase-9-quality-assurance.md` | 品質確認 |

## 実行手順

### ステップ1: AC-1〜AC-4 の充足を判定する

各受入基準の verification evidence を Phase 1-9 の成果物から収集し、PASS/FAIL を判定する。

### ステップ2: downstream 依存を確認する

Task02 / Task03 へ引き渡す前提条件（route owner, shared action, naming contract）が確定しているかを確認する。

### ステップ3: gate decision を出す

PASS / MINOR / MAJOR / CRITICAL を判定し、MINOR の場合は未タスク仕様書に変換する。

## 統合テスト連携

AC-1〜AC-4 の fulfillment 判定結果と、downstream Task02/03 への前提条件を Phase 11 の手動テストに引き継ぐ。

## 成果物

| 成果物           | パス                                      | 説明                 |
| ---------------- | ----------------------------------------- | -------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md` | AC 判定              |
| 最終 gate        | `outputs/phase-10/final-gate-decision.md` | PASS / MINOR / MAJOR |

## 完了条件

- [ ] AC-1〜AC-4 の判定がある
- [ ] downstream Task02 へ渡す前提条件が記録されている
- [ ] gate decision が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md)
