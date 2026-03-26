# Phase 13: PR作成

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 13                                    |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

ユーザー明示指示がある場合のみ PR preparation を行う。現在は blocked とする。

## 実行タスク

- PR に載せる変更要約を整理する
- validator 結果を添付可能な形にする
- commit / PR は指示があるまで実行しない

## 参照資料

| 資料名                  | パス                                              | 説明         |
| ----------------------- | ------------------------------------------------- | ------------ |
| Phase 2 成果物          | `outputs/phase-2/canonical-sync-target-matrix.md` | 更新順の要約 |
| Phase 5 成果物          | `outputs/phase-5/implementation-sequencing.md`    | 変更範囲     |
| Phase 6 成果物          | `outputs/phase-6/test-expansion-summary.md`       | guard        |
| Phase 7 成果物          | `outputs/phase-7/coverage-summary.md`             | coverage     |
| Phase 8 成果物          | `outputs/phase-8/refactoring-summary.md`          | 正規化点     |
| Phase 9 成果物          | `outputs/phase-9/qa-summary.md`                   | QA 結果      |
| Phase 10 成果物         | `outputs/phase-10/final-review-summary.md`        | 最終判定     |
| Phase 11 成果物         | `outputs/phase-11/manual-test-checklist.md`       | 手動確認     |
| Phase 12 ドキュメント   | `phase-12-documentation.md`                       | 成果物一覧   |
| documentation changelog | `outputs/phase-12/documentation-changelog.md`     | 変更要約     |

## 成果物

| 成果物         | パス                                 | 説明         |
| -------------- | ------------------------------------ | ------------ |
| PR 作成        | `phase-13-pr-creation.md`            | blocked 理由 |
| pr preparation | `outputs/phase-13/pr-preparation.md` | 将来用メモ   |

## 完了条件

- [ ] PR が blocked であることを明記している
- [ ] commit / PR / push を実行しない
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. blocked 条件の確認
3. 成果物の作成・配置
4. artifacts.json 同期の確認
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] commit / PR / push を実行していない
