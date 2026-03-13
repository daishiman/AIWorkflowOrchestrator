# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 9                               |
| Phase名    | 品質保証                        |
| タスクID   | TASK-SKILL-LIFECYCLE-04         |
| 前提Phase  | Phase 5（実装）                 |
| 後続Phase  | Phase 10（最終レビューゲート）  |
| ステータス | completed                       |
| 作成日     | 2026-03-12                      |
| 機能名     | skill-lifecycle-evaluation-gate |

## 目的

gate 判定が再現可能で、理由文が説明可能で、Task03 / Task05 の両方で同じ判断を返すことを保証する。

## 実行タスク

- 判定再現性検証: 同一入力で同一 gate decision が返ることを検証する
- 理由文検証: summary と blockingIssues が score と hard block に一致することを検証する
- UI整合検証: Task03 / Task05 の warning と recommended 表示が一致することを検証する
- セキュリティ検証: hard block が UI 操作で解除できないことを検証する
- release ready 判定: Phase 10 に渡す品質レポートを作成する

## 参照資料

| 参照資料                 | パス                                       | 説明                  |
| ------------------------ | ------------------------------------------ | --------------------- |
| Phase 5 実装             | `phase-5-implementation.md`                | 検証対象実装          |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                | 境界値と failure path |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                   | 集約後の責務          |
| coverage gap 分析        | `outputs/phase-7/coverage-gap-analysis.md` | 残課題                |
| refactor plan            | `outputs/phase-8/refactor-plan.md`         | 品質保証前提          |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                    |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------- |
| quality-requirements     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | 品質目標                |
| security-skill-execution | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | hard block と UI 非露出 |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | surface ごとの表示責務  |

## 実行手順

### ステップ1: 判定再現性を確認する

同一 input fixture に対して同一 gate decision が返ることを確認する。

### ステップ2: 理由文と score の整合を確認する

summary、blockingIssues、badge 表示が score と block 条件と一致することを確認する。

### ステップ3: cross-surface 整合を確認する

Task03 と Task05 が同一スキルに対して同一 gate decision を表示することを確認する。

### ステップ4: 品質レポートを作成する

残課題、許容リスク、Phase 10 へ渡す判定を整理する。

## 統合テスト連携

| 観点        | 確認内容                      |
| ----------- | ----------------------------- |
| unit        | gate decision の再現性        |
| integration | Task03 / Task05 の同一判定    |
| UI          | badge、理由文、warning の一致 |
| security    | hard block の bypass 不可     |

## 成果物

| 成果物              | パス                                     | 内容             |
| ------------------- | ---------------------------------------- | ---------------- |
| QA checklist        | `outputs/phase-9/qa-checklist.md`        | 品質確認一覧     |
| quality gate report | `outputs/phase-9/quality-gate-report.md` | PASS / FAIL 判定 |

## 完了条件

- [x] 同一入力の再現性が確認されている
- [x] 理由文と score の不整合がない
- [x] Task03 / Task05 の cross-surface 表示差がない
- [x] hard block の bypass 手段がない
- [x] Phase 10 へ渡す品質レポートが作成されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 10: 最終レビューゲート](./phase-10-final-review.md) に進む
