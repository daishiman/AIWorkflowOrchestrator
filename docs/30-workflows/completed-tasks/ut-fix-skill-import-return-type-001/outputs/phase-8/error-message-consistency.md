# Phase 8 タスク2: エラーメッセージ一貫性確認

## タスクID: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001

## 実行日: 2026-02-21

## skill:import エラーフォーマット

| エラー種別     | エラーコード     | メッセージ形式                         | 一貫性              |
| -------------- | ---------------- | -------------------------------------- | ------------------- |
| 型チェック     | VALIDATION_ERROR | `skillName must be a non-empty string` | skill:remove と同一 |
| 空文字列       | VALIDATION_ERROR | `skillName must be a non-empty string` | skill:remove と同一 |
| トリム空文字列 | VALIDATION_ERROR | `skillName must be a non-empty string` | skill:remove と同一 |
| インポート失敗 | IMPORT_ERROR     | `result.errors.join(", ")`             | サニタイズ済み      |
| スキル未取得   | IMPORT_ERROR     | `Failed to import skill: ${skillName}` | 明確                |

## 他ハンドラとの比較

| ハンドラ     | バリデーションエラー形式    | 一貫性 |
| ------------ | --------------------------- | ------ |
| skill:import | `throw { code, message }`   | 基準   |
| skill:remove | `throw { code, message }`   | 同一   |
| skill:list   | `validateIpcSender` → throw | 同一   |
| skill:scan   | `validateIpcSender` → throw | 同一   |

## 結論

エラーフォーマットは全ハンドラで一貫しており、修正不要。
