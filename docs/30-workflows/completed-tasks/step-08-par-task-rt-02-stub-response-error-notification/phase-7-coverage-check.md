# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 7                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

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

## 実行手順

### concern coverage

| concern                        | 対象層            | 必須 |
| ------------------------------ | ----------------- | ---- |
| false-success 排除             | facade            | ✅   |
| explicit error union           | shared types      | ✅   |
| transport / logical error 境界 | ipc               | ✅   |
| execute 抑止                   | renderer          | ✅   |
| 正常系 / handoff 回帰          | facade + renderer | ✅   |

## 統合テスト連携

- Phase 9 の QA でカバレッジ不足がないことを再確認する

## 成果物

| 成果物             | パス                                 | 説明             |
| ------------------ | ------------------------------------ | ---------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | concern coverage |

## 完了条件

- [ ] AC-1〜AC-7 にテストが割り当てられている
- [ ] facade / ipc / renderer の3層がカバーされている
- [ ] 後続タスクへの引き継ぎ点が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
