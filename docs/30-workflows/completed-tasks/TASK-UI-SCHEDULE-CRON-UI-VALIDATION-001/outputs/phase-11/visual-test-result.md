# Phase 11 - 手動テスト・視覚的検証結果

## 実行日時

2026-04-13 09:53 JST

## 対象タスク種別

**VISUAL** - Phase 11 はビジュアルタスクのためスクリーンショット証跡が必要。

## 実施方法

- ハーネス: `apps/desktop/src/renderer/phase11-task-ui-schedule-visual-picker.tsx`
- 実行方式: current build + Vite + Playwright
- ベースURL: `http://127.0.0.1:5191`
- 証跡保存先: `outputs/phase-11/screenshots/`

## 検証結果

| シーン | 状態                  | 観点                    | 結果 |
| ------ | --------------------- | ----------------------- | ---- |
| SC-01  | weekly + 空曜日       | `role="alert"` の表示   | PASS |
| SC-02  | weekly + 曜日選択済み | エラー非表示 / 正常表示 | PASS |
| SC-03  | monthly + 無効日付    | `role="alert"` の表示   | PASS |
| SC-04  | monthly + 有効日付    | エラー非表示 / 正常表示 | PASS |

## 視覚確認ポイント

### monthly エラー表示

| 観点             | 確認結果              |
| ---------------- | --------------------- |
| エラーテキスト色 | PASS (`text-red-500`) |
| フォントサイズ   | PASS (`text-sm`)      |
| マージン         | PASS (`mt-1`)         |
| ARIA属性         | PASS (`role="alert"`) |

### weekly エラー表示との整合

| 観点           | weekly         | monthly        | 判定     |
| -------------- | -------------- | -------------- | -------- |
| role属性       | `role="alert"` | `role="alert"` | PASS     |
| テキスト色     | `text-red-500` | `text-red-500` | PASS     |
| フォントサイズ | `text-xs`      | `text-sm`      | 差分あり |
| マージン       | `mt-1`         | `mt-1`         | PASS     |

## 証跡

- `outputs/phase-11/screenshot-plan.json`
- `outputs/phase-11/screenshots/phase11-capture-metadata.json`
- `outputs/phase-11/screenshots/scene-01-weekly-empty-weekdays-error.png`
- `outputs/phase-11/screenshots/scene-02-weekly-valid-weekdays-ok.png`
- `outputs/phase-11/screenshots/scene-03-monthly-invalid-date-error.png`
- `outputs/phase-11/screenshots/scene-04-monthly-valid-date-ok.png`

## 判定

PASS

## 補足

- monthly の無効値はハーネスの `value` 注入で再現した。
- 直接入力モードは本タスク外のため、visual contract には含めていない。
