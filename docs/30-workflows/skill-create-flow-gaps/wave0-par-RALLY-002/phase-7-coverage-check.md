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
| ステータス | pending                                |

## 目的

追加した useEffect のクリアロジックがテストでカバーされていることを確認する。

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
