# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 8                            |
| タスクID   | TASK-RALLY-013               |
| 機能名     | Undo可能範囲の視覚的表現追加 |
| 前提Phase  | Phase 7                      |
| 後続Phase  | Phase 9                      |
| 作成日     | 2026-04-21                   |
| ステータス | pending                      |

## 目的

Phase 5 の実装をレビューし、可読性・保守性・責務境界の観点でリファクタリングが必要な箇所を特定・修正する。

## リファクタリング観点

| 観点             | 確認内容                                                                                |
| ---------------- | --------------------------------------------------------------------------------------- |
| 可読性           | `undoableStepCount` の計算式にコメントが付いているか                                    |
| 責務境界         | インジケーターの `span` が Undoボタンの `div` ラッパー内に適切に収まっているか          |
| canUndo 整合     | `!interview.canUndo` の参照が残っていないか（`undoableStepCount === 0` に統一）         |
| チェーン末尾確認 | RALLY-010〜013 の4タスクの変更が ConversationalInterview.tsx 上で矛盾なく共存しているか |

## 参照資料

| 資料名                 | パス                                              | 説明           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |

## 成果物

| 成果物         | パス                                             | 説明                     |
| -------------- | ------------------------------------------------ | ------------------------ |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | リファクタ内容と判断     |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後のテスト計画 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | 責務分離の整理           |

## 完了条件

- [ ] リファクタリング後に `pnpm test` で全件 Green であること
- [ ] `pnpm typecheck` と `pnpm lint` でエラー 0 件であること
- [ ] RALLY-010〜013 の変更が ConversationalInterview.tsx 上で矛盾なく共存していること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p13-seq-RALLY-013
```

## 次のPhase

Phase 9: 品質保証
