# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 3                                                                        |
| Phase名    | 設計レビューゲート                                                       |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | Phase 2                                                                  |
| 後続Phase  | Phase 4                                                                  |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

Phase 2 の設計に漏れや責務衝突がないことを判定し、Phase 4 以降のテスト仕様作成へ進めるかを決める。ここで PASS か MINOR にならない限り、Phase 4 以降へ進まない。

## 背景

Issue #1173 は docs-only parent workflow、system spec、capture script、dual root mirror が交差する。設計段階で concern を混ぜると、Phase 5 実装時に「どの drift をどの validator で閉じるか」が再び曖昧になる。したがって、Phase 3 では drift class の分離、task-060 root 解釈、Phase 12 更新順を最優先で審査する。

## 実行タスク

- Reviewer-A: manifest 設計が parent pointer と child workflow の両方を落とさず扱えているかを監査する
- Reviewer-B: drift guard 契約が path/status/mirror を混ぜずに分離しているかを監査する
- Reviewer-C: Phase 12 同期設計が `task-workflow` / `ui-ux-feature-components` / `lessons-learned` / `LOGS.md` / mirror sync まで届いているかを監査する
- Lead: PASS / MINOR / MAJOR / CRITICAL のゲート判定を行い、戻り先 Phase を決定する

### タスク1: 設計完全性レビュー

**目的**: 対象ファイル種別と source of truth が欠けていないかを確認する

**手順**:

1. manifest 項目に parent pointer、child workflow、completed-task pointer docs、legacy index、interfaces、capture script、mirror root が全て含まれるか確認する
2. task-060 current root と target explanation が矛盾していないか確認する
3. out-of-scope が UI 実装変更へにじんでいないか確認する

### タスク2: 検証可能性レビュー

**目的**: Phase 4 で red case、Phase 7 で traceability、Phase 12 で ledger sync を検証できるかを確認する

**手順**:

1. drift guard 契約に入力、期待出力、fail 条件が揃っているか確認する
2. `verify-all-specs` と `validate-phase-output` を通すための必要セクションが埋まっているか確認する
3. `verify-unassigned-links` と `audit-unassigned-tasks --diff-from HEAD --target-file` の使用条件が書かれているか確認する

### タスク3: 並列化条件レビュー

**目的**: Phase 4 以降をどこから並列化できるかを固定する

**手順**:

1. Phase 4 と 5 は manifest / guard / sync plan を共有入力とすることを確認する
2. Phase 6 と 7 は検証拡充・追跡表として並列化できることを確認する
3. Phase 12 は Phase 11 の手動確認完了前に着手しないことを確認する

## 参照資料

| 参照資料             | パス                                                                           | 説明                                 |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| Phase 1              | `phase-1-requirements.md`                                                      | 要件の照合元                         |
| Phase 2              | `phase-2-design.md`                                                            | 設計の照合元                         |
| sweep manifest 設計  | `outputs/phase-2/sweep-manifest-design.md`                                     | レビュー対象                         |
| drift guard 契約     | `outputs/phase-2/drift-guard-contract.md`                                      | レビュー対象                         |
| concern boundary map | `outputs/phase-2/concern-boundary-map.md`                                      | レビュー対象                         |
| リスク分析           | `outputs/phase-2/risk-analysis.md`                                             | レビュー対象                         |
| review criteria      | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS / MINOR / MAJOR / CRITICAL 基準 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                            | 内容                        |
| ------------------------ | ------------------------------------------------------------------------------- | --------------------------- |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 台帳同期の完全性確認        |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | feature spec 側の完全性確認 |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 教訓化の抜け漏れ確認        |
| quality-requirements     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | 検証可能性の品質基準        |
| error-handling           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | validator 失敗時の扱い      |

## 統合テスト連携

- Phase 4 は本レビューの PASS / MINOR を前提に red case を作る
- Phase 5 は本レビューで確定した manifest と guard contract から実装順を決める
- Phase 10 は本レビュー結果を再参照し、設計との差分を照合する

## 成果物

| 成果物       | パス                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| レビュー結果 | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-3/design-review-result.md` |
| 指摘一覧     | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-3/review-findings.md`      |
| 是正計画     | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-3/remediation-plan.md`     |

## 完了条件

- [x] PASS / MINOR / MAJOR / CRITICAL の判定が記録されている
- [x] 各指摘に戻り先 Phase が付いている
- [x] parent pointer / child workflow / system spec / mirror sync の concern collision が解消されている
- [x] Phase 4 以降の並列化条件が文章で固定されている
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 4: テスト作成へ進む。
