# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 7                                                   |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

transition semantics の主要分岐と regression 観点がテストでカバーされていることを可視化する。

## 実行タスク

- AC coverage の確認
- branch coverage の不足確認
- runtime 経路と engine 経路の両方の確認

## 参照資料

| 資料名                 | パス                                | 説明          |
| ---------------------- | ----------------------------------- | ------------- |
| phase 5 implementation | `outputs/phase-5/implementation.md` | 実装結果      |
| phase 6 test expansion | `outputs/phase-6/test-expansion.md` | 追加ケース    |
| coverage check         | `outputs/phase-7/coverage-check.md` | coverage 観点 |

## 実行手順

### ステップ1: AC とテストケースを対応づける

AC-1〜AC-7 が未カバーになっていないか確認する。

### ステップ2: 分岐と fallback の穴を洗う

reason / option / requestId mismatch の分岐が漏れていないか確認する。

## 統合テスト連携

- `vitest` coverage を engine と runtime の両方で確認する

## 成果物

| 成果物         | パス                                | 説明              |
| -------------- | ----------------------------------- | ----------------- |
| coverage check | `outputs/phase-7/coverage-check.md` | coverage 監査記録 |

## 完了条件

- [ ] AC coverage の抜け漏れがない
- [ ] fallback / regression が coverage 観点に含まれている
- [ ] 本Phase内の全タスクを100%実行完了
