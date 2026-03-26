# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 7                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

failure lifecycle 要件が追加テストで覆われていることを確認する。

## 実行タスク

- requirement と test case の対応を確認する
- targeted suite が全件 PASS したことを残す
- wider runtime suite の既存失敗を切り分けて記録する

## 参照資料

| 資料名         | パス                                                | 説明          |
| -------------- | --------------------------------------------------- | ------------- |
| Phase 1 output | `outputs/phase-1/requirements-definition.md`        | 要件          |
| Phase 6 output | `outputs/phase-6/test-expansion-result.md`          | テスト結果    |
| runtime suite  | `apps/desktop/src/main/services/runtime/__tests__/` | 関連 suite    |
| Phase 5 output | `outputs/phase-5/green-test-log.txt`                | targeted PASS |

## 統合テスト連携

- Phase 9 の品質判定はこの coverage report を参照する。
- Phase 12 の implementation guide はこの coverage 判定を要約する。

## 成果物

| 成果物         | パス                                 | 説明           |
| -------------- | ------------------------------------ | -------------- |
| カバレッジ確認 | `outputs/phase-7/coverage-report.md` | 要件との対応表 |

## 完了条件

- [x] failure lifecycle の要件とテストが対応付けられている
- [x] targeted suite の PASS が記録されている
- [x] wider suite の既存失敗が切り分けられている
- [x] **本Phase内の全タスクを100%実行完了**
