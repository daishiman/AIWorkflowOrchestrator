# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 6                                                          |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |

## 目的

正常系だけでなく、placeholder 残存や Part 2 欠落のような fail path を確認する。

## 実行タスク

- placeholder 残存ケースを確認する
- TC-ID 欠落ケースを確認する
- implementation guide の literal 欠落ケースを確認する

## 参照資料

| 資料名                 | パス                                           | 説明           |
| ---------------------- | ---------------------------------------------- | -------------- |
| Phase 4 command matrix | `outputs/phase-4/validation-command-matrix.md` | 再実行対象     |
| Phase 4 tc coverage    | `outputs/phase-4/tc-coverage-plan.md`          | fail path 対象 |
| Phase 5 change plan    | `outputs/phase-5/change-plan.md`               | 更新順序       |

## 実行手順

1. `manual-test-result.md` に TC-ID 列がないケースを想定し validator 結果を確認する。
2. `screenshots/placeholder.png` 依存が残るケースを review 観点で確認する。
3. implementation guide から `APIシグネチャ`、`エラーハンドリング`、`設定項目と定数一覧` を欠落させた場合の validator 失敗を確認する。

## 統合テスト連携

| コマンド                                          | 目的              |
| ------------------------------------------------- | ----------------- |
| `validate-phase11-screenshot-coverage.js --json`  | evidence 不足検出 |
| `validate-phase12-implementation-guide.js --json` | guide 欠落検出    |

## 成果物

| 成果物               | パス                                      | 説明           |
| -------------------- | ----------------------------------------- | -------------- |
| regression checklist | `outputs/phase-6/regression-checklist.md` | fail path 一覧 |
| validator rerun plan | `outputs/phase-6/validator-rerun-plan.md` | 再実行順序     |

## 完了条件

- [ ] placeholder / TC-ID / guide literal 欠落の fail path を列挙済み
- [ ] validator rerun の順序を定義済み
- [ ] **本Phase内の全タスクを100%実行完了**
