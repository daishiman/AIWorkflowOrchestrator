# UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001                                                 |
| タスク名     | IPC 4層整合 CI 自動検証スクリプト実装                                              |
| 種別         | improvement                                                                        |
| 優先度       | medium                                                                             |
| スケール     | small                                                                              |
| 対象機能     | IPC 4層（shared/preload/main/renderer）整合性CI自動検証                            |
| 前タスク     | UT-SKILL-WIZARD-W4-ANALYTICS-BACKEND-001（IPC接続実装・完了）                      |
| 類似タスク   | UT-IPC-PRELOAD-SYNC-GUARDIAN-IMPL-001（旧パス検出スクリプト）                      |
| 後続タスク   | UT-IMP-ANALYTICS-BACKEND-REAL-001                                                  |
| GitHub Issue | [#2117](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2117)（CLOSED） |
| 作成日       | 2026-04-14                                                                         |
| ステータス   | spec_created                                                                       |
| 総Phase数    | 13                                                                                 |

## 概要

IPC 4層（shared channels / preload whitelist / main handler / renderer sink）の整合性を自動検証する CI スクリプトを実装し、`ALLOWED_INVOKE_CHANNELS` 追記漏れ（FB-SC-13-1）の再発を防止する。

## 背景

UT-SKILL-WIZARD-W4-ANALYTICS-BACKEND-001 の実装で `analytics:trackEvent` チャネルを追加した際、4ファイルの手動同期が必要だった。現状は手動チェックのみで CI 自動検証がない。

## 最終ゴール

`scripts/verify-ipc-4layer.js` が GitHub Actions CI で自動実行され、4層間のチャネル定義不整合を検出してCI失敗させる状態。

## 対象ファイル（成果物）

| ファイル                                      | 種別         | 説明                            |
| --------------------------------------------- | ------------ | ------------------------------- |
| `scripts/verify-ipc-4layer.js`                | スクリプト   | IPC 4層整合性検証スクリプト本体 |
| `scripts/__tests__/verify-ipc-4layer.test.ts` | テスト       | 検証スクリプトのユニットテスト  |
| `.github/workflows/` 配下                     | CI           | GitHub Actions ワークフロー定義 |
| `outputs/phase-*/` 配下                       | ドキュメント | 各Phase出力成果物               |

---

## Phase一覧

| Phase | 名称               | 仕様書                                                       | ステータス |
| ----- | ------------------ | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義           | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計               | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成         | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装               | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充         | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認     | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング   | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証           | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト         | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新   | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR作成             | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | outputs/phase-1/asset-inventory.md, outputs/phase-1/requirements-definition.md, outputs/phase-1/acceptance-criteria.md, outputs/phase-1/spec-extraction-map.md, outputs/phase-1/traceability-matrix.md                                                                                  |
| 2     | outputs/phase-2/architecture-design.md, outputs/phase-2/validation-algorithm-design.md, outputs/phase-2/ci-integration-design.md, outputs/phase-2/test-strategy.md, outputs/phase-2/dependency-consistency-matrix.md                                                                    |
| 3     | outputs/phase-3/design-review-result.md, outputs/phase-3/gate-decision.md, outputs/phase-3/contradiction-checklist.md                                                                                                                                                                   |
| 4     | outputs/phase-4/test-specification.md, outputs/phase-4/red-test-result.md, outputs/phase-4/integration-test-plan.md                                                                                                                                                                     |
| 5     | outputs/phase-5/implementation-summary.md, outputs/phase-5/changed-files.md, outputs/phase-5/contract-diff.md                                                                                                                                                                           |
| 6     | outputs/phase-6/expanded-test-cases.md, outputs/phase-6/regression-test-result.md, outputs/phase-6/edge-case-result.md                                                                                                                                                                  |
| 7     | outputs/phase-7/coverage-plan.md, outputs/phase-7/uncovered-analysis-plan.md, outputs/phase-7/traceability-coverage-report.md                                                                                                                                                           |
| 8     | outputs/phase-8/refactoring-plan.md, outputs/phase-8/post-refactor-test-plan.md, outputs/phase-8/responsibility-boundary-map.md                                                                                                                                                         |
| 9     | outputs/phase-9/quality-report.md, outputs/phase-9/risk-register.md, outputs/phase-9/causal-loop-check.md                                                                                                                                                                               |
| 10    | outputs/phase-10/final-review-result.md, outputs/phase-10/corrective-action-plan.md, outputs/phase-10/release-readiness-checklist.md                                                                                                                                                    |
| 11    | outputs/phase-11/manual-test-result.md, outputs/phase-11/evidence-index.md                                                                                                                                                                                                              |
| 12    | outputs/phase-12/implementation-guide.md, outputs/phase-12/system-spec-update-summary.md, outputs/phase-12/documentation-changelog.md, outputs/phase-12/unassigned-task-detection.md, outputs/phase-12/skill-feedback-report.md, outputs/phase-12/phase12-task-spec-compliance-check.md |
| 13    | outputs/phase-13/pr-info.md                                                                                                                                                                                                                                                             |

---

## 関連タスク

| 関係     | タスクID                                 | ステータス | 説明                                |
| -------- | ---------------------------------------- | ---------- | ----------------------------------- |
| 前タスク | UT-SKILL-WIZARD-W4-ANALYTICS-BACKEND-001 | completed  | IPC接続実装（analytics:trackEvent） |
| 類似     | UT-IPC-PRELOAD-SYNC-GUARDIAN-IMPL-001    | -          | 旧パス検出スクリプト                |
| 後続     | UT-IMP-ANALYTICS-BACKEND-REAL-001        | unassigned | Analytics バックエンド実装          |

---

_このファイルは手動で作成されました。_
_最終更新: 2026-04-14_
