# Phase 13: PR作成

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 13                                                   |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

ユーザーの明示指示があった場合のみ PR 準備へ進めるよう、blocked 状態のまま必要情報だけ整理する。

## 実行タスク

- local check result の記録フォーマットを残す
- change summary の記録フォーマットを残す
- PR / commit / push を自動実行しないことを明記する

## 参照資料

| 資料名   | パス                        | 説明         |
| -------- | --------------------------- | ------------ |
| Phase 10 | `phase-10-final-review.md`  | 最終判定     |
| Phase 12 | `phase-12-documentation.md` | 添付資料整理 |

## 成果物

| 成果物             | パス                                     | 説明                         |
| ------------------ | ---------------------------------------- | ---------------------------- |
| local check result | `outputs/phase-13/local-check-result.md` | ローカル検証記録テンプレート |
| change summary     | `outputs/phase-13/change-summary.md`     | PR 要約テンプレート          |

### 添付前提の成果物

- Phase 2: `outputs/phase-2/failure-transition-matrix.md`
- Phase 5: `phase-5-implementation.md`
- Phase 6: `phase-6-test-expansion.md`
- Phase 7: `phase-7-coverage-check.md`
- Phase 8: `phase-8-refactoring.md`
- Phase 9: `phase-9-quality-assurance.md`
- Phase 11: `outputs/phase-11/manual-test-result.md`

## 完了条件

- [ ] blocked 条件が明記されている
- [ ] PR / commit / push を自動実行しない方針が明記されている
- [ ] 必要な添付情報の整理先が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
