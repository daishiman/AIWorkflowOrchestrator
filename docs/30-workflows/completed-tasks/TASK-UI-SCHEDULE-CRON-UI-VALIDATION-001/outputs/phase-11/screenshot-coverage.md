# Phase 11 - スクリーンショットカバレッジ

## カバレッジ結果

| 項目                     | カバー | 証跡                                       |
| ------------------------ | ------ | ------------------------------------------ |
| weekly + 空曜日エラー    | 100%   | `scene-01-weekly-empty-weekdays-error.png` |
| weekly + 正常状態        | 100%   | `scene-02-weekly-valid-weekdays-ok.png`    |
| monthly + 無効日付エラー | 100%   | `scene-03-monthly-invalid-date-error.png`  |
| monthly + 正常状態       | 100%   | `scene-04-monthly-valid-date-ok.png`       |

## 合計

| 指標             | 値   |
| ---------------- | ---- |
| 必須シーン数     | 4    |
| 取得済みシーン数 | 4    |
| カバレッジ       | 100% |

## N/A 判定

- 直接入力モードは本タスクの visual contract に含めないため、カバレッジ対象外。
- 追加の端末サイズ差分撮影は本タスクの必須条件ではない。
