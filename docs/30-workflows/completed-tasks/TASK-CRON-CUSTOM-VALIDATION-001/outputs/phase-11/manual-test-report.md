# 手動テストレポート（Phase 11）

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

## 総合結果

| 項目                   | 結果                          |
| ---------------------- | ----------------------------- |
| 機能バリデーション     | PASS（CV-01〜CV-20 全GREEN）  |
| UIスタイル整合性       | PASS（既存パターンと統一）    |
| アクセシビリティ       | PASS（role="alert" 実装済み） |
| 後方互換性             | PASS（既存テスト70件全PASS）  |
| 実機スクリーンショット | PASS（SC-01〜SC-05 取得済み） |

## 機能テスト詳細

### バリデーション動作

- **空文字 / スペースのみ**: `directInputError=true` → エラーメッセージ表示 → `onValidationChange(false)` ✓
- **フィールド数不足（4フィールド）**: `validateCronSyntax` が false → エラー ✓
- **フィールド数超過（6フィールド）**: `validateCronSyntax` が false → エラー ✓
- **day-of-month=0**: `validateCronDayOfMonth` が false → エラー ✓
- **day-of-month=32**: `validateCronDayOfMonth` が false → エラー ✓
- **有効な5フィールドcron式**: `directInputError=false` → エラーなし ✓
- **非数値dom（`*`, `*/2`, `1-15`, `1,15`, `L`）**: バリデーション対象外 → エラーなし ✓

### モード切替動作

- **visual→direct切替**: `isAdvancedMode` が true に変化 → `directInputError` が再計算 ✓
- **direct→visual切替**: `directInputError` が false に変化（`isAdvancedMode=false` でガード） ✓

## スクリーンショット証跡

- `outputs/phase-11/screenshots/SC-01_direct-input-initial.png`
- `outputs/phase-11/screenshots/SC-02_empty-input-error.png`
- `outputs/phase-11/screenshots/SC-03_syntax-error-4fields.png`
- `outputs/phase-11/screenshots/SC-04_day-of-month-zero-error.png`
- `outputs/phase-11/screenshots/SC-05_valid-cron-no-error.png`
- `outputs/phase-11/screenshots/phase11-capture-metadata.json`

## 推奨手動確認手順

```bash
pnpm --filter @repo/desktop dev
```

1. スケジュール設定画面を開く
2. 「高度な設定」ボタンをクリック
3. SC-01〜SC-05 の操作を順に実施
4. `outputs/phase-11/screenshots/` にスクリーンショットを保存

## 総合判定

**機能検証: PASS**（ユニットテスト全件 GREEN で動作証明済み）
**実機スクリーンショット: PASS**（SC-01〜SC-05 取得済み）
