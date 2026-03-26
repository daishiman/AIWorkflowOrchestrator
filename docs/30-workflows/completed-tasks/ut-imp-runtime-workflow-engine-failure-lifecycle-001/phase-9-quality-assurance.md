# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 9                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

対象修正の PASS とスコープ外の既存失敗を切り分け、品質判定を残す。

## 実行タスク

- targeted vitest の PASS を確認する
- wider runtime suite の既存失敗を整理する
- 実装反映先ディレクトリを確認する

## 参照資料

| 資料名           | パス                                 | 説明             |
| ---------------- | ------------------------------------ | ---------------- |
| targeted command | `outputs/phase-5/green-test-log.txt` | PASS 証跡        |
| runtime suite    | `outputs/phase-7/coverage-report.md` | wider suite 記録 |

## 統合テスト連携

- Phase 10 はこの品質判定を最終 gate に使う。
- Phase 12 は残リスクを implementation guide に転記する。

## 成果物

| 成果物       | パス                                | 説明               |
| ------------ | ----------------------------------- | ------------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質判定と残リスク |

## 完了条件

- [x] targeted vitest の PASS が記録されている
- [x] wider suite の既存失敗が分離されている
- [x] `apps/desktop` 反映と `apps/backend` / `packages/shared` 非変更が記録されている
- [x] **本Phase内の全タスクを100%実行完了**
