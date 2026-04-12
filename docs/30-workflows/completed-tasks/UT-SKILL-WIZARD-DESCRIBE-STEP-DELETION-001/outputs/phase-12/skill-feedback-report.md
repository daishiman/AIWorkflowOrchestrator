# スキルフィードバックレポート

## タスクID: UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001

## フィードバック

| ID         | 内容                                                                                                                     | 種別     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ | -------- |
| FB-TASK-01 | DescribeStep.tsx / DescribeStep.test.tsx の同時削除は、レガシー整理の標準パターンとして扱える                            | 知見共有 |
| FB-TASK-02 | wizard-exports.test.ts の新規作成を削除前に済ませると、barrel contract の回帰を防ぎやすい                                | 改善提案 |
| FB-TASK-03 | 仕様書の「前提完了済み」が実際のコードと異なっていた（index.ts のエクスポート残存）。Phase 1 でのP50チェックが有効だった | 教訓     |
| FB-TASK-04 | type-only export は runtime test だけでは検出できないため、compile-time guard が必要                                     | 教訓     |

## スキル改善提案

| スキル                     | 改善内容                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------- |
| task-specification-creator | ファイル削除タスクの Phase 4 に「barrel contract guard の新規作成」を標準追加         |
| task-specification-creator | runtime guard と compile-time guard を別ファイルで持つ二重化パターンを標準化          |
| aiworkflow-requirements    | 2ファイル同時削除 + guard test 作成の標準フローをレガシーコード整理パターンとして記録 |
