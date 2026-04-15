# TASK-SW-FIX-FEEDBACK-008: `fetchSkills()` 非ブロッキング化（follow-up）

## タスク概要

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | TASK-SW-FIX-FEEDBACK-008                                                    |
| 親タスクID   | TASK-SW-FIX-FEEDBACK-001                                                    |
| タスク名     | `fetchSkills()` 非ブロッキング化（follow-up）                               |
| 分類         | バグ修正                                                                    |
| タスク種別   | `NON_VISUAL`                                                                |
| 対象機能     | `SkillLifecyclePanel.tsx` の `processWorkflowOutcome` / `handleExecutePlan` |
| 優先度       | 中                                                                          |
| 見積もり規模 | 中規模                                                                      |
| ステータス   | Phase 12 完了 / Phase 13 保留                                               |
| 実行ウェーブ | Wave C                                                                      |
| 依存タスク   | TASK-SW-FIX-FEEDBACK-001                                                    |
| 関連 Issue   | #2152                                                                       |
| 作成日       | 2026-04-15                                                                  |

## 目的

`fetchSkills()` が失敗しても `selectSkillByName` を継続実行し、スキル生成成功後の選択状態を維持する。

## current facts

- NOTE-001 により、`SkillLifecyclePanel.tsx` の 2 箇所で `fetchSkills()` 失敗時に `selectSkillByName` まで到達しないことが確認済み
- `SkillLifecyclePanel.tsx` に `refreshSkillsInBackground` と遅延 `workflowSnapshot` 再処理の effect を追加し、`selectSkillByName` と `loadVerifyDetail` の継続を保証した
- 影響範囲は Renderer 側の UI ロジックと対応テストに限定され、IPC 契約変更は不要
- 本 workflow は視覚差分を目的とせず、Phase 11 は `NON_VISUAL` 証跡で閉じる
- Phase 11 の証跡は `outputs/phase-11/manual-test-result.md` と `outputs/phase-11/phase11-capture-metadata.json` を正本とし、スクリーンショット画像は要求しない
- `artifacts.json` と `outputs/artifacts.json` は `phase13_blocked` に同期済み

## 受入条件

| AC   | 条件                                                                                    |
| ---- | --------------------------------------------------------------------------------------- |
| AC-1 | `processWorkflowOutcome` で `fetchSkills` が失敗しても `selectSkillByName` が実行される |
| AC-2 | `handleExecutePlan` で `fetchSkills` が失敗しても `selectSkillByName` が実行される      |
| AC-3 | `fetchSkills` 失敗時は `console.warn` へ記録し、`generationError` へ昇格しない          |
| AC-4 | `fetchSkills` 成功時の既存フローに回帰がない                                            |
| AC-5 | typecheck / lint / 対象テストが通る                                                     |

## フェーズ一覧

| Phase | ファイル                       | 主目的                | 主要成果物                                           | 状態      |
| ----- | ------------------------------ | --------------------- | ---------------------------------------------------- | --------- |
| 1     | `phase-1-requirements.md`      | 要件固定              | `outputs/phase-1/requirements-definition.md`         | completed |
| 2     | `phase-2-design.md`            | 実装方針固定          | `outputs/phase-2/design-document.md`                 | completed |
| 3     | `phase-3-design-review.md`     | 設計妥当性判定        | `outputs/phase-3/review-result.md`                   | completed |
| 4     | `phase-4-test-creation.md`     | fail-first テスト定義 | `outputs/phase-4/test-specifications.md`             | completed |
| 5     | `phase-5-implementation.md`    | 実装反映              | `outputs/phase-5/implementation-record.md`           | completed |
| 6     | `phase-6-test-expansion.md`    | エッジケース補強      | `outputs/phase-6/extended-test-record.md`            | completed |
| 7     | `phase-7-coverage.md`          | カバレッジ確認        | `outputs/phase-7/coverage-report.md`                 | completed |
| 8     | `phase-8-refactoring.md`       | 実装整流化            | `outputs/phase-8/refactoring-record.md`              | completed |
| 9     | `phase-9-quality-assurance.md` | 品質保証              | `outputs/phase-9/quality-report.md`                  | completed |
| 10    | `phase-10-final-review.md`     | 最終レビュー          | `outputs/phase-10/final-review-result.md`            | completed |
| 11    | `phase-11-manual-test.md`      | `NON_VISUAL` 手動確認 | `outputs/phase-11/manual-test-result.md`             | completed |
| 12    | `phase-12-documentation.md`    | 仕様同期              | `outputs/phase-12/implementation-guide.md` ほか 5 件 | completed |
| 13    | `phase-13-pr-creation.md`      | PR 準備               | `outputs/phase-13/pr-info.md`                        | blocked   |

## 依存関係

| 種別         | ID                           | 状態      | 本 workflow への影響                           |
| ------------ | ---------------------------- | --------- | ---------------------------------------------- |
| prerequisite | TASK-SW-FIX-FEEDBACK-001     | completed | NOTE-001 の根拠と current facts の引き継ぎ元   |
| parallel     | TASK-SW-FIX-STATE-DETAIL-001 | parallel  | 競合ファイルがないことを Phase 1 で確認する    |
| parallel     | TASK-SW-FIX-UI-001           | parallel  | Wave C 内の変更競合を Phase 5 着手前に確認する |

## 成果物台帳

| 区分               | パス                                                                                                                                                                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workflow root      | `index.md`, `phase-*.md`, `artifacts.json`                                                                                                                                                                                                                                                          |
| workflow outputs   | `outputs/artifacts.json`, `outputs/verification-report.md`                                                                                                                                                                                                                                          |
| phase 11 補助      | `outputs/phase-11/manual-test-checklist.md`, `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/discovered-issues.md`, `outputs/phase-11/phase11-capture-metadata.json`                                                                                                                    |
| phase 12 canonical | `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/system-spec-update-summary.md`, `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/unassigned-task-detection.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 参照資料

| 資料名                       | パス                                                                                       | 用途                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------- |
| 親 workflow の手動テスト結果 | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/outputs/phase-11/discovered-issues.md`         | NOTE-001 の一次根拠                         |
| follow-up 候補化の記録       | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/outputs/phase-12/unassigned-task-detection.md` | 本タスク切り出しの根拠                      |
| task-specification-creator   | `.claude/skills/task-specification-creator/SKILL.md`                                       | workflow 構造と Phase 12/13 規約            |
| aiworkflow-requirements      | `.claude/skills/aiworkflow-requirements/SKILL.md`                                          | `SkillLifecyclePanel` の current facts 確認 |
