# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 7                  |
| タスクID   | TASK-RALLY-012     |
| 機能名     | エラー回復導線追加 |
| 前提Phase  | Phase 6            |
| 後続Phase  | Phase 8            |
| 作成日     | 2026-04-21         |
| ステータス | pending            |

## 目的

AC-1〜AC-9 のすべてがテストでカバーされていることを確認し、未到達箇所があれば追加テストを計画する。

## カバレッジ目標

| 対象ファイル                | 目標ライン    |
| --------------------------- | ------------- |
| ConversationalInterview.tsx | 変更箇所 100% |

## 参照資料

| 資料名           | パス                                     | 説明           |
| ---------------- | ---------------------------------------- | -------------- |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md` | Phase 1 成果物 |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md` | Phase 6 成果物 |

## 成果物

| 成果物                 | パス                                              | 説明                   |
| ---------------------- | ------------------------------------------------- | ---------------------- |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | カバレッジ目標と結果   |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | 未到達箇所の分析       |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | AC対テストケース対応表 |

## 完了条件

- [ ] AC-1〜AC-9 が全件テストでカバーされていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p12-seq-RALLY-012
```

## 次のPhase

Phase 8: リファクタリング
