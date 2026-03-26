# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| タスクID   | TASK-SDK-01      |
| Phase      | 7                |
| Phase名    | カバレッジ確認   |
| ステータス | spec_created     |
| 前提Phase  | Phase 5, Phase 6 |
| 後続Phase  | Phase 8          |
| 作成日     | 2026-03-26       |

## 目的

AC、schema field、loader boundary、cache invalidation の4観点で未網羅項目を洗い出し、Task02 以降へ持ち越してはいけない穴を塞ぐ。

## 実行タスク

- AC traceability 作成: AC-1 から AC-4 を test case へ結び付ける
- field coverage 確認: schema の必須 field と禁止 field の網羅を確認する
- loader coverage 確認: read、validate、normalize、cache の各境界を確認する
- uncovered item 整理: Phase 8 か unassigned-task へ回す項目を分離する

## 参照資料

| 資料名              | パス                                     | 説明           |
| ------------------- | ---------------------------------------- | -------------- |
| Phase 4             | `phase-4-test-creation.md`               | 初回ケース     |
| Phase 5             | `phase-5-implementation.md`              | 実装対象       |
| Phase 6             | `phase-6-test-expansion.md`              | 追加ケース     |
| acceptance-criteria | `outputs/phase-1/acceptance-criteria.md` | AC トレース元  |
| edge-case-matrix    | `outputs/phase-6/edge-case-matrix.md`    | edge case 入力 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容              |
| -------------------------- | --------------------------------------------------------------------------------- | ----------------- |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage 観点     |
| architecture-overview-core | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md` | SRP coverage      |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | Phase 12 同期準備 |

## 実行手順

1. AC-1 から AC-4 を表の行に置き、対応する test case を列へ置く。
2. schema の field 一覧と test case を照合し、空欄を uncovered item として抽出する。
3. loader の4境界に対し、正常系と異常系が最低1件ずつあるかを確認する。
4. uncovered item を `Phase 8 で解消 / unassigned-task 化` の二択で整理する。

## 統合テスト連携

- Phase 8 は uncovered item のうち schema slimming と naming 修正を扱う。
- Phase 9 は uncovered item が残っていないかを再確認する。
- Phase 10 は AC traceability の最終判定を行う。

## 成果物

| 成果物                    | パス                                           | 説明                      |
| ------------------------- | ---------------------------------------------- | ------------------------- |
| requirements-traceability | `outputs/phase-7/requirements-traceability.md` | AC と test case の対応表  |
| coverage-report           | `outputs/phase-7/coverage-report.md`           | field / boundary coverage |
| uncovered-items           | `outputs/phase-7/uncovered-items.md`           | 未網羅一覧                |

## 完了条件

- [ ] AC-1 から AC-4 が全て traceability 表に存在する
- [ ] schema の必須 field と禁止 field の coverage が記録されている
- [ ] loader の4境界それぞれに正常系と異常系がある
- [ ] uncovered item が `Phase 8 / unassigned-task` の二択で整理されている
- [ ] **本Phase内の全タスクを100%実行完了**
