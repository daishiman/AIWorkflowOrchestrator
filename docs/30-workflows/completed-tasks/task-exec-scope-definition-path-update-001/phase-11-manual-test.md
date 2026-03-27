# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 11                                         |
| 機能名   | task-exec-scope-definition-path-update-001 |
| 作成日   | 2026-03-27                                 |
| タスクID | UT-EXEC-01                                 |

## 目的

docs-only task として、path walkthrough と human-readable review を人手で確認する。

## 実行タスク

- manual checklist を作る
- manual result を記録する
- discovered issue の有無を記録する

## 参照資料

| 資料名                | パス                                       | 説明                  |
| --------------------- | ------------------------------------------ | --------------------- |
| Phase 1               | `phase-1-requirements.md`                  | AC                    |
| target path decision  | `outputs/phase-2/target-path-decision.md`  | 到達先確認            |
| Phase 5               | `phase-5-implementation.md`                | 更新面                |
| repeatability notes   | `outputs/phase-6/repeatability-notes.md`   | 反復時の確認観点      |
| evidence traceability | `outputs/phase-7/evidence-traceability.md` | AC と evidence の対応 |
| link cleanup          | `outputs/phase-8/link-cleanup.md`          | stale path 除去結果   |
| quality checklist     | `outputs/phase-9/quality-checklist.md`     | 目視確認の品質軸      |
| Phase 10              | `phase-10-final-review.md`                 | Go 条件               |

## 成果物

| 成果物                | パス                                        | 説明              |
| --------------------- | ------------------------------------------- | ----------------- |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` | 目視確認項目      |
| manual test result    | `outputs/phase-11/manual-test-result.md`    | non-visual review |
| discovered issues     | `outputs/phase-11/discovered-issues.md`     | 違和感記録        |

## 統合テスト連携

- path を実際に辿り、actual target が 1 回で到達できるかを確認する。

## 完了条件

- [ ] manual checklist がある
- [ ] manual result がある
- [ ] discovered issues の有無が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
