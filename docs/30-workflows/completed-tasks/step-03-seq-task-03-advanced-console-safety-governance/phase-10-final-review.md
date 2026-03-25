# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 10                                              |
| Phase名    | 最終レビュー                                    |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 1-9                                       |
| 後続Phase  | Phase 11（手動テスト）                          |
| ステータス | completed                                       |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

AC-1〜AC-4 と規約整合、manual boundary 整合を最終判定する。

## 実行タスク

- AC review
- compliance review
- gate decision

## 参照資料

| 参照資料      | パス                           | 内容         |
| ------------- | ------------------------------ | ------------ |
| 依存Phase     | Phase 1, Phase 2, Phase 5      | 前提成果物   |
| task 要件     | `phase-1-requirements.md`      | 受入基準定義 |
| task 設計     | `phase-2-design.md`            | 設計成果物   |
| task 実装計画 | `phase-5-implementation.md`    | 実装成果物   |
| task 品質確認 | `phase-9-quality-assurance.md` | 品質検証結果 |

## 実行手順

### ステップ1: AC-1〜AC-4 の充足判定を行う

Phase 1で定義した受入基準を Phase 2-9 の成果物と照合し、各ACのPASS/FAIL を判定する。

### ステップ2: compliance 観点の最終レビューを実施する

DENY-1〜10、MUST-1〜10 の設計適合を確認する。

### ステップ3: gate decision を記録する

PASS/MINOR/MAJOR/CRITICAL の判定基準に基づき最終判定を下す。

### 判定基準

| 判定     | 対応                                           |
| -------- | ---------------------------------------------- |
| PASS     | Phase 11 へ                                    |
| MINOR    | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | Phase 1 へ戻り要件再確認                       |

## 統合テスト連携

approval 表示、AI 開示、外部送信開示、advanced console opt-in の4観点について Phase 9 テスト結果との整合を確認する。

## 多角的チェック観点

- AC-1〜AC-4 の全基準が充足されているか
- DENY 条項（no auto-send / no hidden parsing / no consumer auth embedding）の設計反映
- manual boundary が実装と整合しているか
- Phase 3 設計レビュー指摘事項の全解消確認

## サブタスク管理

| サブタスク        | 担当 | ステータス |
| ----------------- | ---- | ---------- |
| AC review         | -    | -          |
| compliance review | -    | -          |
| gate decision     | -    | -          |

## 成果物

| 成果物           | パス                                      | 説明                 |
| ---------------- | ----------------------------------------- | -------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md` | AC / compliance 判定 |
| 最終 gate        | `outputs/phase-10/final-gate-decision.md` | PASS / MINOR / MAJOR |

## 完了条件

- [ ] AC-1〜AC-4 の判定がある
- [ ] compliance 観点の判定がある
- [ ] gate decision が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認

- [ ] AC review 完了
- [ ] compliance review 完了
- [ ] gate decision 記録完了

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md)
