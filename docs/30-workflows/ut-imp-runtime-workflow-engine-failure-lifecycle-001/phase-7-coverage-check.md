# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 7                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

failure lifecycle の concern 単位でテスト被覆を確認し、正常系偏重の見落としを防ぐ。

## 実行タスク

- transition、artifact、review prompt、guard の 4 観点を coverage concern に分解する
- engine 単体と facade 経由の責務を分けて確認する

## 参照資料

| 資料名  | パス                        | 説明        |
| ------- | --------------------------- | ----------- |
| Phase 4 | `phase-4-test-creation.md`  | 基本 matrix |
| Phase 6 | `phase-6-test-expansion.md` | edge case   |

## 成果物

| 成果物           | パス                        | 説明                  |
| ---------------- | --------------------------- | --------------------- |
| coverage summary | `phase-7-coverage-check.md` | concern coverage 確認 |

## 統合テスト連携

- Phase 5 の実装変更点と Phase 6 の拡張ケースを `transition / artifact / review prompt / guard` の 4 concern に再配置して被覆を確認する。
- engine 単体レーンと facade 経由レーンで coverage の主担当を分離し、片側しか担保していない concern を残さない。
- coverage 不足は Phase 8 で構造改善するのではなく、まずテスト不足として明示する。

## 完了条件

- [ ] 4 観点の coverage concern が列挙されている
- [ ] engine と facade の責務別 coverage が確認できる
- [ ] 取りこぼしが残る場合は次Phaseへ明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
