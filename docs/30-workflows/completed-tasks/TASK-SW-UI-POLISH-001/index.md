# TASK-SW-UI-POLISH-001: スキルウィザード UI仕上げ

## メタ情報

```yaml
task_id: TASK-SW-UI-POLISH-001
task_name: スキルウィザード UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加）
category: UI改善（VISUAL）
target_feature: スキルウィザード / SkillCreateWizard / SkillInfoStep / InterviewProgressBar
priority: low
scale: small
status: phase13_blocked
source_phase: TASK-SW-FIX-UI-001 Phase 12 改善候補
created_date: 2026-04-14
issue_number: 2157
dependencies:
  - TASK-SW-FIX-UI-001
spec_path: docs/30-workflows/TASK-SW-UI-POLISH-001/
```

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | TASK-SW-UI-POLISH-001                                                          |
| タスク名     | スキルウィザード UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加） |
| GitHub Issue | [#2157](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2157)       |
| 分類         | VISUAL タスク                                                                  |
| 優先度       | 低（`priority:low`）                                                           |
| 規模         | 小規模（`scale:small`）                                                        |
| ステータス   | phase13_blocked（Phase 13 は scope 外）                                        |
| 発見元       | TASK-SW-FIX-UI-001 Phase 12 改善候補検出（2026-04-14）                         |

---

## タスク概要

TASK-SW-FIX-UI-001（スキルウィザード UI整合性修正）の Phase 12 ドキュメント更新において、4件の改善候補が検出された。いずれも機能破壊レベルの問題ではないが、UI の一貫性・UX の洗練度を高めるための仕上げ項目である。

このタスクではコミット・push・PR 作成は scope 外とし、Phase 13 は実行しない。

### 改善候補

| 改善候補 | 内容                                   | 優先度 |
| -------- | -------------------------------------- | ------ |
| 候補1    | SkillCreateWizard 残存ハードコード確認 | 中     |
| 候補2    | カテゴリ選択上限                       | 低     |
| 候補3    | カテゴリ解除アニメーション             | 低     |
| 候補4    | ProgressBar アニメーション             | 低     |

---

## Phase 構成

| Phase | 名称             | ファイル                                                       | 状態       |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-01-requirements.md](phase-01-requirements.md)           | 未着手     |
| 2     | 設計             | [phase-02-design.md](phase-02-design.md)                       | 未着手     |
| 3     | 設計レビュー     | [phase-03-design-review.md](phase-03-design-review.md)         | 未着手     |
| 4     | テスト作成       | [phase-04-test-creation.md](phase-04-test-creation.md)         | 未着手     |
| 5     | 実装             | [phase-05-implementation.md](phase-05-implementation.md)       | 未着手     |
| 6     | テスト拡充       | [phase-06-test-expansion.md](phase-06-test-expansion.md)       | 未着手     |
| 7     | カバレッジ確認   | [phase-07-coverage.md](phase-07-coverage.md)                   | 未着手     |
| 8     | リファクタリング | [phase-08-refactoring.md](phase-08-refactoring.md)             | 未着手     |
| 9     | 品質保証         | [phase-09-quality-assurance.md](phase-09-quality-assurance.md) | 未着手     |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)           | 未着手     |
| 11    | 手動テスト       | [phase-11-manual-testing.md](phase-11-manual-testing.md)       | 完了       |
| 12    | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md)         | 完了       |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)             | スコープ外 |

---

## 成果物

| ファイル                                                                                                            | 変更種別 | 内容                               |
| ------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                                  | 修正     | CSS 変数監査・残存ハードコード修正 |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                                               | 修正     | カテゴリ上限・アニメーション追加   |
| `apps/desktop/src/renderer/components/skill/wizard/InterviewProgressBar.tsx`                                        | 修正     | ProgressBar アニメーション追加     |
| 対応するテストファイル（`SkillCreateWizard.test.tsx` / `SkillInfoStep.test.tsx` / `InterviewProgressBar.test.tsx`） | 追加     | 新規テストケース                   |

| Phase 11/12 成果物                                                                               | 内容                             |
| ------------------------------------------------------------------------------------------------ | -------------------------------- |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-11/manual-test-result.md`                 | 手動テスト結果                   |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-11/manual-test-checklist.md`              | 手動テストチェックリスト         |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-11/discovered-issues.md`                  | 検出事項                         |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-11/ui-sanity-visual-review.md`            | 視覚レビュー                     |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-11/evidence-index.md`                     | 証跡索引                         |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-11/screenshot-coverage.md`                | スクリーンショットカバレッジ     |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-11/phase11-capture-metadata.json`         | スクリーンショット取得メタデータ |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-11/screenshots/*.png`                     | UI キャプチャ画像                |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-12/implementation-guide.md`               | 実装ガイド                       |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-12/system-spec-update-summary.md`         | システム仕様更新サマリー         |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-12/documentation-changelog.md`            | ドキュメント変更履歴             |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出                     |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-12/skill-feedback-report.md`              | スキルフィードバック             |
| `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠チェック            |

---

## 参照情報

| 資料名                    | パス                                                         |
| ------------------------- | ------------------------------------------------------------ |
| TASK-SW-FIX-UI-001 仕様書 | `docs/30-workflows/unassigned-task/TASK-SW-FIX-UI-001.md`    |
| タスク指示書              | `docs/30-workflows/unassigned-task/TASK-SW-UI-POLISH-001.md` |
| バグ修正ウェーブ全体      | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`        |
