# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 11                                                                       |
| Phase名    | 手動テスト検証                                                           |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | Phase 10                                                                 |
| 後続Phase  | Phase 12                                                                 |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

repo 上の実物を見て、parent pointer、child workflow、system spec、capture script、mirror root の導線が整合しているかを確認する。あわせて、user 指示に従い Workspace 04A / 04B / 04C の representative UI surface を current workflow 配下へ集約し、Apple UI/UX 観点の visual review を行う。

## 実行タスク

- Reviewer-A: parent pointer と child workflow の導線を手動で確認する
- Reviewer-B: `interfaces-*` と capture script の root 参照を手動で確認する
- Reviewer-C: `.claude` / `.agents` mirror と Phase 12 更新対象を手動で確認する
- Reviewer-D: Workspace 04A / 04B / 04C の representative screenshot を visual review board に集約し、Apple UI/UX 観点で評価する
- Lead: command transcript、manual findings、manual result、visual review を整理する

## 参照資料

| 参照資料         | パス                                           | 説明                        |
| ---------------- | ---------------------------------------------- | --------------------------- |
| Phase 1成果物    | `outputs/phase-1/spec-reference-map.md`        | 手動確認対象の一覧          |
| Phase 2成果物    | `outputs/phase-2/sweep-manifest-design.md`     | expected target root の確認 |
| Phase 5成果物    | `outputs/phase-5/diff-summary.md`              | 実装差分の確認              |
| Phase 6成果物    | `outputs/phase-6/delta-report.md`              | variation 追加結果          |
| Phase 7成果物    | `outputs/phase-7/requirements-traceability.md` | coverage の確認             |
| Phase 8成果物    | `outputs/phase-8/responsibility-map.md`        | 責務分離の確認              |
| Phase 9成果物    | `outputs/phase-9/quality-report.md`            | 品質上の注意点              |
| Phase 10         | `phase-10-final-review.md`                     | 最終レビュー結果            |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`      | 手動確認の観点              |
| 指摘一覧         | `outputs/phase-10/final-review-findings.md`    | 手動確認の観点              |
| 是正計画         | `outputs/phase-10/remediation-plan.md`         | 手動確認の観点              |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                            | 内容                      |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------- |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 台帳側の期待状態          |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | feature spec 側の期待状態 |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | evidence path 確認        |
| interfaces-chat-history  | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`  | evidence path 確認        |

## 統合テスト連携

- `rg` と `diff -qr` の機械検証結果を手動で照合する
- parent pointer と child workflow の説明文が一致するかを読む
- Phase 12 更新対象の漏れをここで洗い出す

## 成果物

| 成果物              | パス                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 手動テスト結果      | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-11/manual-test-result.md`       |
| 発見事項            | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-11/manual-findings.md`          |
| 実行証跡            | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-11/command-transcript.md`       |
| Apple UI/UX review  | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-11/apple-uiux-visual-review.md` |
| screenshot evidence | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-11/screenshots/`                |

## 完了条件

- [x] parent pointer と child workflow の導線確認結果がある
- [x] interfaces / capture script / mirror root の確認結果がある
- [x] representative UI screenshot と Apple UI/UX visual review がある
- [x] Phase 12 更新対象の最終リストがある
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 12: ドキュメント更新へ進む。
