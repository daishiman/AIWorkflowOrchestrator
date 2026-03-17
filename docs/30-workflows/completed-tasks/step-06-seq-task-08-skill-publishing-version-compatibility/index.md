# TASK-SKILL-LIFECYCLE-08: スキル共有・公開・互換性統合

## 概要

作成済みスキルをローカル再利用に留めず、共有・公開・配布・互換性保証まで扱う設計タスク。

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-08         |
| タスク種別 | 設計                            |
| 優先度     | 中                              |
| ステータス | phase_12_completed              |
| 依存タスク | TASK-SKILL-LIFECYCLE-05, 06, 07 |
| 作成日     | 2026-03-11                      |
| 更新日     | 2026-03-17                      |

## 受入基準

| ID   | 基準                                                         |
| ---- | ------------------------------------------------------------ |
| AC-1 | local/team/public の3レベル定義と遷移条件がある              |
| AC-2 | semver/schema/依存バージョンの互換性チェックが定義されている |
| AC-3 | Task06安全性ゲートとTask07観測指標が公開判定へ接続される     |
| AC-4 | Skill Center の登録・更新・公開停止・配布の責務境界がある    |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |

## 実施サマリー

- Phase 11: TC-11-01〜03 の screenshot 証跡を再生成し、coverage validator を PASS 化
- Phase 12: 実装ガイド 10/10 要件達成、system spec 実更新、未タスク16件補完
- 未タスク: TASK-08 follow-up 4件を `docs/30-workflows/unassigned-task/` に formalize

## 依存関係

```
TASK-SKILL-LIFECYCLE-05 (利用導線)  ─┐
TASK-SKILL-LIFECYCLE-06 (安全性)    ─┼── TASK-SKILL-LIFECYCLE-08 (公開・互換性)
TASK-SKILL-LIFECYCLE-07 (観測指標)  ─┘
```
