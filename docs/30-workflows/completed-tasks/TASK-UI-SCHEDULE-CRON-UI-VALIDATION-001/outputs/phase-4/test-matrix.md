# Phase 4 - テストマトリクス

## 作成日

2026-04-13

## テストシナリオ一覧（VAL-W-01〜VAL-CB-01）

| テストID  | テスト名                                               | 入力・操作                              | 期待結果                                              |
| --------- | ------------------------------------------------------ | --------------------------------------- | ----------------------------------------------------- |
| VAL-W-01  | weekly + 月曜日選択済みでレンダリング                  | `value="0 9 * * 1"`                     | エラーメッセージが DOM に存在しない                   |
| VAL-W-02  | weekly + 月曜日を解除して空曜日にする                  | 月曜日ボタンをクリック                  | `onValidationChange(false)` が呼ばれる                |
| VAL-W-03  | weekly + 空曜日から月曜日を再選択する                  | 月曜日ボタンを再クリック                | エラーメッセージが消える + `onValidationChange(true)` |
| VAL-M-01  | monthly + 最小範囲外（0）でレンダリング                | `value="0 9 0 * *"`                     | エラーメッセージが DOM に存在する                     |
| VAL-M-02  | monthly + 最大範囲外（32）でレンダリング               | `value="0 9 32 * *"`                    | エラーメッセージが DOM に存在する                     |
| VAL-M-03  | monthly + 有効な日付（15）でレンダリング               | `value="0 9 15 * *"`                    | エラーメッセージが DOM に存在しない                   |
| VAL-M-04  | monthly + 無効日付で `onValidationChange` コールバック | `value="0 9 0 * *"`                     | `onValidationChange(false)` が呼ばれる                |
| VAL-CB-01 | `onValidationChange` なしでレンダリング                | `onValidationChange` プロップを渡さない | エラーなく動作する                                    |

## Phase 6 拡充テストシナリオ

| テストID  | テスト名                                      | 入力・操作                         | 期待結果                                      |
| --------- | --------------------------------------------- | ---------------------------------- | --------------------------------------------- |
| EXP-B-01  | monthly + 最小有効値（1）                     | `value="0 9 1 * *"`                | エラーメッセージが存在しない                  |
| EXP-B-02  | monthly + 最大有効値（31）                    | `value="0 9 31 * *"`               | エラーメッセージが存在しない                  |
| EXP-B-03  | monthly + 最小有効値の1つ下（0）              | `value="0 9 0 * *"`                | エラーメッセージが存在する                    |
| EXP-B-04  | monthly + 最大有効値の1つ上（32）             | `value="0 9 32 * *"`               | エラーメッセージが存在する                    |
| EXP-C-01  | weekly + 月曜日解除で空曜日エラーが再表示     | 月曜日ボタンをクリックして解除     | エラーメッセージ再表示 + `false` コールバック |
| EXP-A-01  | weekly エラー要素に `role="alert"`            | 月曜日ボタンをクリック             | `getByRole("alert")` で要素が取得できる       |
| EXP-A-02  | monthly エラー要素に `role="alert"`           | `value="0 9 0 * *"`                | `getByRole("alert")` で要素が取得できる       |
| EXP-CB-01 | 初回レンダリングで1回だけ呼ばれる             | `value="0 9 0 * *"`                | `toHaveBeenCalledTimes(1)` かつ `false`       |
| EXP-CB-02 | monthly 無効から毎日に切り替えると2回呼ばれる | `value="0 9 0 * *"` → 毎日クリック | 合計2回、最後は `true`                        |

## テストファイル配置

- `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`（新規）
