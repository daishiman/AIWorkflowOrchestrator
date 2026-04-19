# TASK-SW-STRUCT-LLM-002: LLM による features フィールド自動生成

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | TASK-SW-STRUCT-LLM-002                                              |
| タスク名     | LLM による features フィールド自動生成                              |
| 分類         | backend-heavy / spec sync                                           |
| 対象機能     | `SkillCreatorService` / `generate_features.js` / workflow close-out |
| 優先度       | 高                                                                  |
| 見積もり規模 | 小規模                                                              |
| ステータス   | Phase 12 completed / Phase 13 blocked                               |
| 依存タスク   | TASK-SW-LLM-PURPOSE-AUTO-EXTRACT                                    |
| 作成日       | 2026-04-18                                                          |
| 完了日       | 2026-04-19                                                          |
| GitHub Issue | #2242                                                               |

## 目的

`SkillCreatorService.runCreateWorkflow()` の `features: []` ハードコードを廃止し、`plan-structure` エージェント文面を使った LLM 生成へ置き換える。失敗時は空配列へフォールバックし、SKILL.md 生成フロー全体は止めない。

## 実装サマリー

- `SkillCreatorService.ts` に `generateFeaturesWithLlm(description, signal?)` を追加
- `parseFeaturesResponse(response)` で JSON 配列抽出と文字列配列への正規化を追加
- `.claude/skills/skill-creator/scripts/generate_features.js` を新規追加
- `SkillCreatorService.struct-001.test.ts` を LLM 統合後の仕様に追従
- `SkillCreatorService.features.test.ts` で success / fallback / parse の境界を追加

## 成果物一覧

| Phase | 成果物                                                                                                                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `outputs/phase-1/acceptance-criteria.md`                                                                                                                                                                            |
| 2     | `outputs/phase-2/requirements-analysis.md`                                                                                                                                                                          |
| 3     | `outputs/phase-3/design.md`                                                                                                                                                                                         |
| 4     | `outputs/phase-4/test-plan.md`                                                                                                                                                                                      |
| 5     | `outputs/phase-5/implementation-summary.md`                                                                                                                                                                         |
| 6     | `outputs/phase-6/test-expansion-record.md`                                                                                                                                                                          |
| 7     | `outputs/phase-7/coverage-report.md`                                                                                                                                                                                |
| 8     | `outputs/phase-8/refactoring-log.md`                                                                                                                                                                                |
| 9     | `outputs/phase-9/quality-report.md`                                                                                                                                                                                 |
| 10    | `outputs/phase-10/final-review-result.md`                                                                                                                                                                           |
| 11    | `outputs/phase-11/manual-test-result.md` / `manual-test-checklist.md` / `discovered-issues.md` / `phase11-capture-metadata.json` / `screenshot-plan.json`                                                           |
| 12    | `outputs/phase-12/implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` |
| 13    | blocked                                                                                                                                                                                                             |

## Phase一覧

| Phase | 仕様書                                                       | 状態      |
| ----- | ------------------------------------------------------------ | --------- |
| 1     | [phase-1-requirements.md](phase-1-requirements.md)           | completed |
| 2     | [phase-2-design.md](phase-2-design.md)                       | completed |
| 3     | [phase-3-design-review.md](phase-3-design-review.md)         | completed |
| 4     | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed |
| 5     | [phase-5-implementation.md](phase-5-implementation.md)       | completed |
| 6     | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed |
| 7     | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed |
| 8     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed |
| 9     | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed |
| 10    | [phase-10-final-review.md](phase-10-final-review.md)         | completed |
| 11    | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed |
| 12    | [phase-12-documentation.md](phase-12-documentation.md)       | completed |
| 13    | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked   |

## 判定

- UI 変更: なし
- Phase 11: NON_VISUAL として代替 evidence を採用
- Phase 12: 6成果物を揃えて close-out 完了
- Phase 13: ユーザー指示待ちのため blocked
