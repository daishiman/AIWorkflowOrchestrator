# Phase 5 実装サマリー（TDD Green フェーズ）

作成日: 2026-04-09
タスク: TASK-UI-SCHEDULE-VISUAL-PICKER-001

## 実装ファイル一覧

### 新規作成

| ファイルパス                                              | 種別           | 説明                                              |
| --------------------------------------------------------- | -------------- | ------------------------------------------------- | ----- |
| `src/renderer/types/visualCronConfig.ts`                  | 型定義         | `FrequencyType`, `Weekday`, `VisualCronConfig`    |
| `src/renderer/utils/cronConverter.ts`                     | ユーティリティ | `visualConfigToCron(config): string`              |
| `src/renderer/utils/cronParser.ts`                        | ユーティリティ | `cronToVisualConfig(expression): VisualCronConfig | null` |
| `src/renderer/utils/cronHumanizer.ts`                     | ユーティリティ | `cronToHumanReadable(expression, locale): string` |
| `src/renderer/utils/scheduleConfigValidator.ts`           | ユーティリティ | cron/timezone 共通バリデーション                  |
| `src/renderer/components/schedule/FrequencySelector.tsx`  | コンポーネント | 頻度選択（6種）                                   |
| `src/renderer/components/schedule/WeekdaySelector.tsx`    | コンポーネント | 曜日トグル（7ボタン）                             |
| `src/renderer/components/schedule/TimePickerSection.tsx`  | コンポーネント | 時・分セレクター                                  |
| `src/renderer/components/schedule/DayOfMonthSelector.tsx` | コンポーネント | 日付グリッド（1-31）                              |
| `src/renderer/components/schedule/CronPreview.tsx`        | コンポーネント | クロン式・自然言語プレビュー                      |
| `src/renderer/components/schedule/VisualCronPicker.tsx`   | コンポーネント | 統合ピッカー                                      |

### 修正

| ファイルパス                                                       | 変更内容                                      |
| ------------------------------------------------------------------ | --------------------------------------------- |
| `src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx` | `CronInput` → `VisualCronPicker` 差し替え     |
| `src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | ローカル validator を shared validator に統一 |

## 実装上の判断

### cronParser.ts の JSDoc 問題

JSDoc `/** */` コメント内に `*/` が含まれると esbuild がパース失敗する。
`// 単純な数値かどうか` の形式に変更して解決。

### window.api モック戦略

`vi.stubGlobal("window", {...})` は React 内部の `instanceof HTMLElement` を破壊するため、
`Object.defineProperty(window, "api", { writable: true, configurable: true, value: {...} })` を採用。

### happy-dom 環境

プロジェクトが happy-dom を使用するため、userEvent ではなく fireEvent のみ使用。

### scheduleConfigValidator の値域チェック

ConversationRoundStep の既存テスト `"cron式の数値が不正な場合にエラーが表示される"` との後方互換のため、
フィールド数チェックに加えて値域チェック（FIELD_RANGES）を共通 validator に含める。

## テスト結果（Green フェーズ完了時）

- 全146テスト PASS
- 新規テスト103件 + 既存43件
- lint: 0 errors（warningsは既存コードのもの）
- typecheck: clean
