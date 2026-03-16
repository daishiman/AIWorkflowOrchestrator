# TASK-SKILL-LIFECYCLE-08: スキル共有・公開・互換性統合

## 概要

作成済みスキルをローカル再利用にとどめず、共有、公開、インポート、互換性保証まで扱う補助レイヤタスク。Skill Center を資産流通の場として成立させる。

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| タスクID     | TASK-SKILL-LIFECYCLE-08         |
| タスク種別   | 設計                            |
| 優先度       | 中                              |
| ステータス   | not_started                     |
| 依存タスク   | TASK-SKILL-LIFECYCLE-05, 06, 07 |
| ブロック対象 | なし                            |
| 作成日       | 2026-03-11                      |
| 更新日       | 2026-03-16                      |

## 受入基準

| ID   | 基準                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| AC-1 | local/team/public の3レベルが定義され、遷移条件と権限マトリクスがある         |
| AC-2 | semver/schema/依存バージョンの互換性チェックロジックが定義されている          |
| AC-3 | Task06 の安全性ゲートと Task07 の観測指標が公開判定マトリクスに接続されている |
| AC-4 | Skill Center の登録・更新・公開停止フローと配布操作の責務境界がある           |

## 設計対象サマリー

| 関心ごと            | 主要型/インターフェース                            | Phase 2 設計書                                      |
| ------------------- | -------------------------------------------------- | --------------------------------------------------- |
| 公開レベル          | `SkillVisibility`, `SkillPublishingMetadata`       | `outputs/phase-2/publishing-metadata-design.md`     |
| 互換性チェック      | `CompatibilityCheckResult`, `CompatibilityChecker` | `outputs/phase-2/compatibility-check-design.md`     |
| Skill Center フロー | `SkillRegistryService`                             | `outputs/phase-2/skill-center-flow-design.md`       |
| 配布操作            | `SkillDistributionService`                         | `outputs/phase-2/distribution-operations-design.md` |
| 公開判定            | `PublishReadiness`, `PublishReadinessChecker`      | `outputs/phase-2/publish-readiness-design.md`       |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | not_started |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | not_started |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | not_started |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | not_started |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | not_started |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | not_started |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | not_started |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | not_started |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | not_started |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | not_started |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 依存関係

```
TASK-SKILL-LIFECYCLE-05 (利用導線)  ─┐
TASK-SKILL-LIFECYCLE-06 (安全性)    ─┼── TASK-SKILL-LIFECYCLE-08 (公開・互換性)
TASK-SKILL-LIFECYCLE-07 (観測指標)  ─┘
```
