# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 6                                |
| 後続Phase  | Phase 8                                |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

追加した useEffect のクリアロジックがテストでカバーされていることを確認する。

## 実行タスク

1. coverage と traceability の両面で網羅性を確認する
2. 未到達ケースが仕様不足かテスト不足かを切り分ける
3. Phase 8 以降へ必要な改善のみを渡す

## カバレッジ確認方針

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test -- --coverage --reporter=verbose
```

## 確認ポイント

| 確認項目                                 | 期待値         | 確認方法              |
| ---------------------------------------- | -------------- | --------------------- |
| useEffect クリアロジックのカバレッジ     | 100%           | coverage レポート確認 |
| pendingRequest 合成式のカバレッジ        | 100%           | coverage レポート確認 |
| ConversationalInterview 全体のカバレッジ | 維持または向上 | coverage レポート確認 |

## 参照資料

| 資料名           | パス                                        | 用途           |
| ---------------- | ------------------------------------------- | -------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | Phase 6 成果物 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |

## 統合テスト連携

- coverage 値だけでなく AC 対応表を Phase 7 の正本にする
- 未到達が残る場合は Phase 8 の refactor ではなく仕様・テストのどちらへ戻すか判断する

## 多角的チェック観点（AIが判断）

- 2軸思考: line coverage と acceptance coverage を混同していないか
- 論点思考: 重要なのが 100% 数値なのか、境界条件の担保なのかを区別できているか
- 価値提案思考: 後続 task が安心して再利用できる証跡になっているか

## サブタスク管理

- C-1: coverage 実測
- C-2: traceability 作成
- C-3: 未到達分析

## 成果物

| 成果物                 | パス                                              | 説明                               |
| ---------------------- | ------------------------------------------------- | ---------------------------------- |
| カバレッジ確認結果     | `outputs/phase-7/coverage-check-result.md`        | カバレッジレポートのサマリー       |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | AC-1〜AC-5とテストの対応表         |
| 未到達分析             | `outputs/phase-7/uncovered-analysis.md`           | カバレッジ未達箇所の分析（あれば） |

## 完了条件

- [ ] カバレッジレポートを確認した
- [ ] useEffect クリアロジックが100%カバーされていることを確認した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 8: リファクタリング
