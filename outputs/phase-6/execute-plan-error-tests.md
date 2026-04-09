# Phase 6 タスク2: executePlan エラーパステスト

## 追加テストケース一覧

| テストID | 説明                                                                 | 結果    |
| -------- | -------------------------------------------------------------------- | ------- |
| E-3      | executePlan が失敗レスポンスを返すとき setGenerationError が呼ばれる | ✅ PASS |
| E-5      | executePlan が例外をスローするとき setGenerationError が呼ばれる     | ✅ PASS |
| E-7      | executePlan 失敗時に CompleteStep に遷移しない（新規追加）           | ✅ PASS |
| E-6      | terminal_handoff 時 command 付きエラー表示（未実装のためスキップ）   | ⏭ SKIP |

## 実装メモ

- E-3, E-5: 既存 `.skip` を除去して有効化
- E-7: Phase 6 新規追加。executePlan 失敗後に goToStep(3) が呼ばれないことを queryByTestId で確認
