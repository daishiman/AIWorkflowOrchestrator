# Phase 7 カバレッジ確認レポート

作成日: 2026-04-09
タスク: TASK-UI-SCHEDULE-VISUAL-PICKER-001

## カバレッジ計測結果

`pnpm --filter @repo/desktop vitest run --coverage` による計測結果（対象: schedule 関連ファイル）

| ファイル                     | Line | Branch | Function | 目標 Branch | 達成 |
| ---------------------------- | ---- | ------ | -------- | ----------- | ---- |
| `cronConverter.ts`           | 100% | 100%   | 100%     | 85%         | PASS |
| `cronParser.ts`              | 100% | 93.10% | 100%     | 85%         | PASS |
| `cronHumanizer.ts`           | 100% | 96.55% | 100%     | 80%         | PASS |
| `scheduleConfigValidator.ts` | 100% | 95.83% | 100%     | 90%         | PASS |
| `WeekdaySelector.tsx`        | 100% | 100%   | 100%     | 75%         | PASS |
| `FrequencySelector.tsx`      | 100% | 100%   | 100%     | 75%         | PASS |
| `VisualCronPicker.tsx`       | 100% | 93.85% | 100%     | 75%         | PASS |
| `TimePickerSection.tsx`      | 100% | 100%   | 100%     | 70%         | PASS |
| `DayOfMonthSelector.tsx`     | 100% | 100%   | 100%     | 70%         | PASS |
| `CronPreview.tsx`            | 100% | 100%   | 100%     | 75%         | PASS |

## 全体サマリー

- **総テスト数**: 146
- **Statements**: 100%
- **Branches**: 93.85%
- **Functions**: 100%
- **Lines**: 100%

## 目標未達ファイル

なし。全ファイルが目標値を上回った。

## カバレッジ改善の経緯

1. cronHumanizer の英語ロケールブランチが未カバー → 英語テスト5件追加で 96.55% 達成
2. VisualCronPicker の一部条件分岐 → 統合テストで VP-09 (value prop)・VP-12 (weekly→daily)・VP-13 (weekdays空) を追加してカバー

## 残存する未カバー分岐

- `VisualCronPicker.tsx`: `isAdvancedMode` の directInput 変更ハンドラの一部（6.15%）
  - 直接入力モードでの onChange 呼び出しは VP-10/VP-11 でカバー
  - 残りは実装上アクセス困難なパスのため許容

## 判定

**Phase 7 完了**: 全ファイルが目標カバレッジを達成
