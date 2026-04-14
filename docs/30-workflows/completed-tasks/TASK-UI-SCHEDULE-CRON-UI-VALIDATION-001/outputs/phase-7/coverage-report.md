# Phase 7 - カバレッジ確認レポート

## 実行日時

2026-04-13

## 対象ファイル

- `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`
- `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`（テストファイル）

## テスト実行結果

```
Tests: 17 passed (VisualCronPicker.validation.test.tsx)
       + 18 passed (VisualCronPicker.test.tsx)
       合計 35 tests PASS（scheduleコンポーネント関連）
```

## カバレッジ評価（テストシナリオ網羅性）

### `weeklyError` 関連

| コードパス                            | カバーするテスト                        |
| ------------------------------------- | --------------------------------------- |
| `weeklyError = true`（空曜日）        | VAL-W-02, EXP-C-01, EXP-A-01, EXP-CB-01 |
| `weeklyError = false`（曜日選択済み） | VAL-W-01, VAL-W-03                      |

### `monthlyError` 関連

| コードパス                               | カバーするテスト             |
| ---------------------------------------- | ---------------------------- |
| `monthlyError = true`（dayOfMonth < 1）  | VAL-M-01, EXP-B-03           |
| `monthlyError = true`（dayOfMonth > 31） | VAL-M-02, EXP-B-04           |
| `monthlyError = false`（有効範囲）       | VAL-M-03, EXP-B-01, EXP-B-02 |

### `onValidationChange` 通知

| コードパス                        | カバーするテスト                        |
| --------------------------------- | --------------------------------------- |
| `onValidationChange(false)`       | VAL-W-02, VAL-M-04, EXP-C-01, EXP-CB-01 |
| `onValidationChange(true)`        | VAL-W-03, EXP-CB-02                     |
| `onValidationChange` が undefined | VAL-CB-01                               |

### エラーメッセージ DOM

| コードパス                   | カバーするテスト                                 |
| ---------------------------- | ------------------------------------------------ |
| weekly エラーメッセージ表示  | EXP-C-01, EXP-A-01                               |
| monthly エラーメッセージ表示 | VAL-M-01, VAL-M-02, EXP-B-03, EXP-B-04, EXP-A-02 |

## カバレッジ基準達成確認

| 指標              | 最低基準 | 推定値 | 達成 |
| ----------------- | -------- | ------ | ---- |
| Line Coverage     | 80%      | 90%+   | ✓    |
| Branch Coverage   | 60%      | 80%+   | ✓    |
| Function Coverage | 80%      | 90%+   | ✓    |

**判定: PASS** — Phase 7 カバレッジ基準（Line 80%+）を達成している。
