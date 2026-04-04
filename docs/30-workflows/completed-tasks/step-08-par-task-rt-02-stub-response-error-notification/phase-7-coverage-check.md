# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 7                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |
| 更新日 | 2026-04-04                       |

## 目的

要件・責務境界・再発ポイントに対してテストが漏れていないかを可視化する。

## 実行タスク

- AC と TC の coverage を確認する
- concern と層の coverage を確認する
- downstream RT-03 への引き継ぎ点を確認する

## 参照資料

| 資料名             | パス                        | 説明                |
| ------------------ | --------------------------- | ------------------- |
| Phase 4 テスト     | `phase-4-test-creation.md`  | TC と AC の初期対応 |
| Phase 5 実装       | `phase-5-implementation.md` | 実際の変更対象      |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md` | 追加ケース          |

## 実装済みテストカバレッジ（2026-04-04 時点）

### 実装済み concern coverage

| concern                        | 対象層            | 必須 | テスト状態                  |
| ------------------------------ | ----------------- | ---- | --------------------------- |
| false-success 排除             | facade            | ✅   | plan/improve ガード実装済み |
| explicit error union           | shared types      | ✅   | 型定義実装済み              |
| transport / logical error 境界 | ipc               | ✅   | IPC handler 確認済み        |
| execute 抑止                   | renderer          | ✅   | UI type guard 実装済み      |
| 正常系 / handoff 回帰          | facade + renderer | ✅   | 既存テストでカバー          |
| execute() llmAdapter 未注入    | facade            | ✅   | T-01/T-02 実装済み          |

### 残カバレッジ課題

| 課題 ID | 確認観点                                                                       | 対象テストファイル               | 状態 |
| ------- | ------------------------------------------------------------------------------ | -------------------------------- | ---- |
| COV-01  | `_executeInternal()` の `!this.llmAdapter` ガードが `success:false` を返すこと | `stub-elimination.test.ts` TC-10 | [x]  |
| COV-02  | `llmAdapter` 注入済みでの execute() 正常系が壊れていないこと                   | `stub-elimination.test.ts` TC-11 | [x]  |
| COV-03  | `plan()` llmAdapter 未注入の回帰（既存ガード）                                 | `stub-elimination.test.ts` TC-12 | [x]  |
| COV-04  | `plan()` resourceLoader 未注入の回帰（既存ガード）                             | `stub-elimination.test.ts` TC-13 | [x]  |

## 実行手順

### concern coverage（stub-elimination テスト作成後に照合）

| concern                        | 対象層            | 必須 |
| ------------------------------ | ----------------- | ---- |
| false-success 排除             | facade            | ✅   |
| explicit error union           | shared types      | ✅   |
| transport / logical error 境界 | ipc               | ✅   |
| execute 抑止                   | renderer          | ✅   |
| 正常系 / handoff 回帰          | facade + renderer | ✅   |
| execute() degraded guard       | facade            | ✅   |

## 統合テスト連携

- Phase 9 の QA でカバレッジ不足がないことを再確認する

## 成果物

| 成果物             | パス                                 | 説明             |
| ------------------ | ------------------------------------ | ---------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | concern coverage |

## 完了条件

- [x] AC-1〜AC-7 にテストが割り当てられている
- [x] facade / ipc / renderer の3層がカバーされている
- [x] COV-01〜COV-04: stub-elimination.test.ts の全テストケースが PASS している
- [x] execute() degraded guard（COV-01）のカバレッジが確認されている
- [x] 後続タスクへの引き継ぎ点が明記されている
- [x] **本Phase内の全タスクを100%実行完了**
