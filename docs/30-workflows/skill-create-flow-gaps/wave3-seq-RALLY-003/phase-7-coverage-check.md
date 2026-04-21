# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 7                        |
| タスクID   | TASK-RALLY-003           |
| 機能名     | undo-server-rollback-api |
| 前提Phase  | Phase 6                  |
| 後続Phase  | Phase 8                  |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

追加した IPC ハンドラ・Facade メソッド・handleUndo 更新のカバレッジを確認する。

## カバレッジ確認方針

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test -- --coverage --reporter=verbose
pnpm --filter @repo/shared test -- --coverage --reporter=verbose
```

## 確認ポイント

| 確認項目                                  | 期待値         | 確認方法              |
| ----------------------------------------- | -------------- | --------------------- |
| rollbackLastInput メソッドのカバレッジ    | 90%以上        | coverage レポート確認 |
| IPC ハンドラ（undoUserInput）のカバレッジ | 90%以上        | coverage レポート確認 |
| handleUndo 更新部分のカバレッジ           | 90%以上        | coverage レポート確認 |
| 全体カバレッジ                            | 維持または向上 | coverage レポート確認 |

## 参照資料

| 資料名           | パス                                        | 用途           |
| ---------------- | ------------------------------------------- | -------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | Phase 6 成果物 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |

## 成果物

| 成果物                 | パス                                              | 説明                               |
| ---------------------- | ------------------------------------------------- | ---------------------------------- |
| カバレッジ確認結果     | `outputs/phase-7/coverage-check-result.md`        | カバレッジレポートのサマリー       |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | AC-1〜AC-6とテストの対応表         |
| 未到達分析             | `outputs/phase-7/uncovered-analysis.md`           | カバレッジ未達箇所の分析（あれば） |

## 完了条件

- [ ] カバレッジレポートを確認した
- [ ] 主要な追加コードが90%以上カバーされていることを確認した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 8: リファクタリング
