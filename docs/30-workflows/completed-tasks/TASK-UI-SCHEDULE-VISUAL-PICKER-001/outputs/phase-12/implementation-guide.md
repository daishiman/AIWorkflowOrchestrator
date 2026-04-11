# VisualCronPicker 実装ガイド

作成日: 2026-04-09
タスク: TASK-UI-SCHEDULE-VISUAL-PICKER-001

---

## Part 1: 中学生向け概念説明（日常の例え話）

### VisualCronPicker とは何か？

「繰り返しのタイミングを決めるアラーム設定パネル」です。

たとえば、「毎週月・水・金の朝9時に自動でタスクを実行する」という約束を、
画面のボタンをクリックするだけで簡単に設定できるツールです。
時計の針を合わせる感覚で、「いつ」「何時」「何曜日」を選ぶだけで完了します。

### 各部品の役割

**FrequencySelector（「いつ？」を決める選択肢）**
「毎分」「毎時」「毎日」「毎週」「毎月」「カスタム」の6つのボタンから
タスクを実行するタイミングの種類を選びます。

**WeekdaySelector（「何曜日？」を選ぶボタン群）**
「毎週」を選んだときに表示される月・火・水・木・金・土・日の7つのボタンです。
表示順は月→日です。
複数の曜日を選ぶことができます。

**TimePickerSection（「何時？」を合わせる時計）**
時間（0〜23）と分（0/5/10/...55）をドロップダウンで選びます。
24時間制で設定します。

**CronPreview（「どんなお約束をしたか見せてくれる窓）**
設定した内容を「毎週 月・水・金 09:00」のような日本語と、
コンピューターが理解できる暗号文（`0 9 * * 1,3,5`）の両方で表示してくれます。

**AdvancedToggle（「もっと細かく設定したい人向けのスイッチ」）**
「高度な設定」ボタンを押すと、暗号文を直接打ち込める入力欄が表示されます。
詳しい人向けの設定方法です。

---

## Part 2: 技術者向けリファレンス

### 型定義

```typescript
// VisualCronConfig: VisualCronPicker の内部状態型
export type FrequencyType =
  | "every-minute"
  | "every-hour"
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=日, 1=月, ..., 6=土

export interface VisualCronConfig {
  frequency: FrequencyType;
  hour: number; // 0-23
  minute: number; // 0-59
  weekdays: Weekday[]; // weekly 時のみ使用
  dayOfMonth: number; // 1-31, monthly 時のみ使用
  rawCronExpression?: string; // advanced mode 時のみ使用
}
```

ファイル: `src/renderer/types/visualCronConfig.ts`

### Props API

```typescript
interface VisualCronPickerProps {
  value?: string; // cronExpression（例: "0 9 * * 1,3,5"）
  onChange: (cronExpression: string) => void;
  disabled?: boolean;
  showAdvancedToggle?: boolean; // デフォルト: true
  className?: string;
}
```

### 使用例

```tsx
import { VisualCronPicker } from "@/components/schedule/VisualCronPicker";

// 基本使用
<VisualCronPicker
  value={cronExpression}
  onChange={setCronExpression}
/>

// 読み取り専用
<VisualCronPicker
  value="0 9 * * 1,3,5"
  onChange={() => {}}
  disabled
/>
```

### cronConverter 使用例

```typescript
import { visualConfigToCron } from "@/utils/cronConverter";
import { cronToVisualConfig } from "@/utils/cronParser";

// VisualCronConfig → cronExpression
const cron = visualConfigToCron({
  frequency: "weekly",
  hour: 9,
  minute: 0,
  weekdays: [1, 3, 5],
  dayOfMonth: 1,
});
// => "0 9 * * 1,3,5"

// cronExpression → VisualCronConfig（逆変換）
const config = cronToVisualConfig("0 9 * * 1,3,5");
// => { frequency: "weekly", hour: 9, minute: 0, weekdays: [1, 3, 5], ... }

// 逆変換できない場合（custom フォールバック）
const config2 = cronToVisualConfig("*/5 * * * *");
// => { frequency: "custom", rawCronExpression: "*/5 * * * *", ... }

// null が返る場合（無効な式）
const config3 = cronToVisualConfig("invalid");
// => null

// weekday range も展開できる
const config4 = cronToVisualConfig("0 8 * * 1-5");
// => { frequency: "weekly", hour: 8, minute: 0, weekdays: [1, 2, 3, 4, 5], ... }
```

### cronHumanizer 使用例

```typescript
import { cronToHumanReadable } from "@/utils/cronHumanizer";

cronToHumanReadable("0 9 * * 1,3,5", "ja");
// => "毎週 月・水・金 09:00"

cronToHumanReadable("0 9 * * 1,3,5", "en");
// => "Every week on Mon, Wed, Fri at 09:00"

cronToHumanReadable("0 8 * * 1-5", "ja");
// => "毎週 月〜金 08:00"

cronToHumanReadable("invalid", "ja");
// => "カスタムスケジュール"（フォールバック）
```

### 共通バリデーション

```typescript
import {
  validateCronExpression,
  validateTimezone,
  validateSkillWizardScheduleConfig,
} from "@/utils/scheduleConfigValidator";

// cron 式の検証（null = valid）
validateCronExpression("0 9 * * *"); // => null
validateCronExpression("invalid"); // => "エラーメッセージ"
validateCronExpression("0 24 * * *"); // => "エラーメッセージ"（hour範囲外）
validateCronExpression("0 9 * * 1-5"); // => null

// タイムゾーンの検証
validateTimezone("Asia/Tokyo"); // => null
validateTimezone("Mars/Phobos"); // => "エラーメッセージ"

// 統合バリデーション
const result = validateSkillWizardScheduleConfig({
  cronExpression: "0 9 * * *",
  timezone: "Asia/Tokyo",
});
// => { cronExpression: null, timezone: null }
```

`ScheduleDialog` と `ConversationRoundStep` の両方で再利用する共通実装。

- `value` が custom / 逆変換不能な式のときは advanced mode で初期表示する
- `showAdvancedToggle=false` の場合は高度な設定ボタンを表示しない
- `disabled=true` のときは編集 UI を無効化する
- `className` はルートラッパーに追加される
- weekday range（例: `1-5`）は `cronParser` で `1,2,3,4,5` に展開される
- `0 9 * * 7` のような Sunday 指定は `0` に正規化される

### エッジケース

| ケース                     | 挙動                                                             |
| -------------------------- | ---------------------------------------------------------------- |
| 逆変換不可能な cron 式     | `frequency: "custom"` でフォールバック。AdvancedToggle が自動 ON |
| weekdays が空配列で weekly | エラーメッセージ表示（`role="alert"`）。保存不可                 |
| every-minute 選択時        | TimePickerSection が非表示（時刻は cron に不要）                 |
| `value` prop なし          | デフォルト: `daily`, hour=9, minute=0                            |
| `showAdvancedToggle=false` | 高度な設定ボタンを表示しない                                     |
| weekday range (`1-5`)      | `cronParser` が `1,2,3,4,5` に展開する                           |
| JSDoc `*/` を含むコメント  | esbuild がパース失敗するため `//` コメントを使用する             |
