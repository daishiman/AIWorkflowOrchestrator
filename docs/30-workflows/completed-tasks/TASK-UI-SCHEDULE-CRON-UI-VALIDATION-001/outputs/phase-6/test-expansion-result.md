# Phase 6 - テスト拡充結果

## 実行日時

2026-04-13

## 拡充内容

Phase 5 の基本テスト（VAL-W-01〜VAL-CB-01）を維持しながら以下を追加した。

### 境界値テスト（EXP-B-01〜EXP-B-04）

| テストID | テスト名                                      | 結果   |
| -------- | --------------------------------------------- | ------ |
| EXP-B-01 | monthly + 最小有効値（1）でエラーなし         | ✓ PASS |
| EXP-B-02 | monthly + 最大有効値（31）でエラーなし        | ✓ PASS |
| EXP-B-03 | monthly + 最小有効値の1つ下（0）でエラーあり  | ✓ PASS |
| EXP-B-04 | monthly + 最大有効値の1つ上（32）でエラーあり | ✓ PASS |

### 複合ケーステスト（EXP-C-01）

| テストID | テスト名                                  | 結果   |
| -------- | ----------------------------------------- | ------ |
| EXP-C-01 | weekly + 月曜日解除で空曜日エラーが再表示 | ✓ PASS |

### アクセシビリティテスト（EXP-A-01〜EXP-A-02）

| テストID | テスト名                                             | 結果   |
| -------- | ---------------------------------------------------- | ------ |
| EXP-A-01 | weekly エラー要素に `role="alert"` が付与されている  | ✓ PASS |
| EXP-A-02 | monthly エラー要素に `role="alert"` が付与されている | ✓ PASS |

### コールバック呼び出し回数テスト（EXP-CB-01〜EXP-CB-02）

| テストID  | テスト名                                  | 結果   |
| --------- | ----------------------------------------- | ------ |
| EXP-CB-01 | 初回レンダリングで1回だけ呼ばれる         | ✓ PASS |
| EXP-CB-02 | monthly 無効から毎日に切り替えると合計2回 | ✓ PASS |

## テスト調整記録

**EXP-CB-02**: 仕様書の想定シナリオ（weekly切り替え）では `weekdays: []` のため `false` になることが判明。
`value="0 9 * * *"` (daily) から "毎週" に切り替えると `weekdays = []` → `weeklyError = true` → `false` が呼ばれる。
**修正**: `value="0 9 0 * *"` (monthly invalid) から "毎日" に切り替えるシナリオに変更。

- 開始: `monthlyError = true` → `onValidationChange(false)` (1回目)
- 切替後: `monthlyError = false` → `onValidationChange(true)` (2回目)
- 結果: 期待通り `toHaveBeenCalledTimes(2)` かつ `toHaveBeenLastCalledWith(true)` ✓

## 全テスト結果サマリー

```
合計 49 tests: 全件 PASS
  - VisualCronPicker.validation.test.tsx: 17 PASS
  - VisualCronPicker.test.tsx: 18 PASS
  - WeekdaySelector.test.tsx: 8 PASS
  - FrequencySelector.test.tsx: 6 PASS
```
