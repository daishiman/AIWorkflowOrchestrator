# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 6                                                                        |
| Phase名    | テスト拡充                                                               |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | Phase 5                                                                  |
| 後続Phase  | Phase 7                                                                  |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

実装後の guard が実運用に近い variation でも安定するよう、対象範囲と異常系を拡充する。single path success だけで終えず、legacy index、interfaces、capture script、mirror drift の境界を検証する。

## 実行タスク

- SubAgent-A: pointer / index variation を拡充する
- SubAgent-B: interfaces / capture script variation を拡充する
- SubAgent-C: mirror drift と current / baseline 分離の variation を拡充する
- Lead: false positive / false negative の差分を整理する

## 参照資料

| 参照資料     | パス                                    | 説明       |
| ------------ | --------------------------------------- | ---------- |
| Phase 5      | `phase-5-implementation.md`             | 実装内容   |
| 実装ログ     | `outputs/phase-5/implementation-log.md` | 拡充の前提 |
| 差分サマリー | `outputs/phase-5/diff-summary.md`       | 差分確認   |
| 影響分析     | `outputs/phase-5/impact-analysis.md`    | 拡充範囲   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                             | パス                                                                                        | 内容           |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------- |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 拡充テスト品質 |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発条件の補強 |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | guard 再利用性 |

## 統合テスト連携

- pointer / index / interfaces / capture script / mirror の variation を分けて検証する
- current diff と legacy baseline の分離を確認する
- Phase 7 の coverage 評価に必要な trace を残す

## 成果物

| 成果物         | パス                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| テスト拡充結果 | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-6/test-expansion-result.md` |
| 失敗ケース分析 | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-6/failure-cases.md`         |
| 差分レポート   | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-6/delta-report.md`          |

## 完了条件

- [x] 各 drift class の variation が追加されている
- [x] false positive と false negative の境界が記録されている
- [x] current / baseline 分離の確認結果が残っている
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 7: カバレッジ確認へ進む。
