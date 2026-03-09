# Phase 7: カバレッジ確認レポート

## 実行日時

2026-03-09

## 計測対象

- **ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`
- **対象範囲**: skill:create ハンドラ (L684-732) + sanitizeErrorMessage 関数 (L62-81) + エラーパターン定数 (L44-52)
- **テストファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts` (25テスト)

## カバレッジ数値

### 対象範囲（skill:create + sanitizeErrorMessage）

| 指標              | 計測値 | 基準    | 判定 |
| ----------------- | ------ | ------- | ---- |
| Line Coverage     | 96.9%  | 80%以上 | PASS |
| Branch Coverage   | 88.9%  | 60%以上 | PASS |
| Function Coverage | 100.0% | 80%以上 | PASS |

### 詳細

- **Line/Statement**: 62/64 行カバー済み
- **Branch**: 16/18 分岐カバー済み（88.9%）
- **Function**: 2/2 関数カバー済み（sanitizeErrorMessage + getAllowedWindows）
  - P41対策: getAllowedWindowsインラインarrow functionの戻り値をTC-G01-001で明示的に検証

### skillHandlers.ts ファイル全体（参考値）

| 指標              | 計測値 | 備考                                     |
| ----------------- | ------ | ---------------------------------------- |
| Line Coverage     | 13.2%  | ファイル全体（約1400行）に対する比率     |
| Branch Coverage   | 88.9%  | 登録関数内の条件分岐が高カバー           |
| Function Coverage | 16.7%  | skill:create以外の多数のハンドラ未テスト |

ファイル全体のカバレッジが低いのは、skillHandlers.ts が約30個のIPCハンドラを含む大規模ファイルであり、本テストが skill:create ハンドラのみを対象としているためです。対象範囲のカバレッジは全基準を満たしています。

## ゲート判定

**PASS** - 全カバレッジ基準を充足。Phase 8（リファクタリング）へ進行可能。

## テスト実行時間

| 項目        | 時間      |
| ----------- | --------- |
| Transform   | 87ms      |
| Setup       | 156ms     |
| Collect     | 25ms      |
| Tests       | 101ms     |
| Environment | 179ms     |
| **Total**   | **906ms** |
