# Phase 5: 実装（TDD Green フェーズ）

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase番号  | 5                                    |
| Phase名    | 実装（TDD Green フェーズ）           |
| 前提Phase  | Phase 4: テスト作成                  |
| 後続Phase  | Phase 6: テスト拡充                  |
| ステータス | 完了                                 |
| 作成日     | 2026-04-09                           |
| 機能名     | スケジュール設定ビジュアルピッカーUI |

## 目的

TDD Green フェーズとして、Phase 4 で作成した全テストをパスさせる最小限の実装を行う。過剰な実装（Gold Plating）を避け、テストの契約を満たす最小実装に集中する。全テストが Green になった時点でこの Phase は完了とする。

## 実装計画

### 新規作成ファイル一覧

| ファイルパス                                                           | 種別           | 責務                                              |
| ---------------------------------------------------------------------- | -------------- | ------------------------------------------------- | ----- |
| `apps/desktop/src/renderer/types/visualCronConfig.ts`                  | 型定義         | `VisualCronConfig`, `FrequencyType`, `Weekday` 型 |
| `apps/desktop/src/renderer/utils/cronConverter.ts`                     | ユーティリティ | `visualConfigToCron(config): string`              |
| `apps/desktop/src/renderer/utils/cronParser.ts`                        | ユーティリティ | `cronToVisualConfig(expression): VisualCronConfig | null` |
| `apps/desktop/src/renderer/utils/cronHumanizer.ts`                     | ユーティリティ | `cronToHumanReadable(expression, locale): string` |
| `apps/desktop/src/renderer/components/schedule/FrequencySelector.tsx`  | コンポーネント | 頻度選択セグメント（6種）                         |
| `apps/desktop/src/renderer/components/schedule/WeekdaySelector.tsx`    | コンポーネント | 曜日トグルボタン群（月〜日）                      |
| `apps/desktop/src/renderer/components/schedule/TimePickerSection.tsx`  | コンポーネント | 時・分ドロップダウン                              |
| `apps/desktop/src/renderer/components/schedule/DayOfMonthSelector.tsx` | コンポーネント | 日付グリッド（月次のみ）                          |
| `apps/desktop/src/renderer/components/schedule/CronPreview.tsx`        | コンポーネント | クロン式・自然言語プレビュー                      |
| `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`   | コンポーネント | ピッカー全体のオーケストレーション                |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`           | ユーティリティ | cron / timezone 共通バリデーション                |

### 修正対象ファイル一覧

| ファイルパス                                                                    | 変更内容                                      |
| ------------------------------------------------------------------------------- | --------------------------------------------- |
| `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx` | `CronInput` → `VisualCronPicker` への差し替え |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | 共通バリデーションの適用                      |

## 各ファイルの実装方針

### 型定義: `visualCronConfig.ts`

**責務**: 全コンポーネント・ユーティリティで共有する型定義の単一ソース

**主要な型**:

```typescript
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
  weekdays: Weekday[]; // weekly のみ有効
  dayOfMonth: number; // 1-31, monthly のみ有効
  rawCronExpression?: string; // custom モード用
}
```

**実装方針**: 副作用なし・pure な型定義のみ。他ファイルへの依存なし。

### ユーティリティ: `cronConverter.ts`

**責務**: `VisualCronConfig` → クロン式文字列への変換

**主要関数**:

- `visualConfigToCron(config: VisualCronConfig): string`

**実装方針**:

- `switch` 文で `frequency` ごとに変換ロジックを分岐
- `weekly` の場合: `weekdays` を `sort()` してから `join(",")` で結合
- `custom` の場合: `rawCronExpression ?? ""` をそのまま返す
- 外部ライブラリへの依存なし（純粋な文字列操作のみ）

**変換マッピング**:

| frequency      | 変換式                                                     |
| -------------- | ---------------------------------------------------------- |
| `every-minute` | `"* * * * *"`                                              |
| `every-hour`   | `` `${minute} * * * *` ``                                  |
| `daily`        | `` `${minute} ${hour} * * *` ``                            |
| `weekly`       | `` `${minute} ${hour} * * ${weekdays.sort().join(",")}` `` |
| `monthly`      | `` `${minute} ${hour} ${dayOfMonth} * *` ``                |
| `custom`       | `rawCronExpression ?? ""`                                  |

### ユーティリティ: `cronParser.ts`

**責務**: クロン式文字列 → `VisualCronConfig` への逆変換

**主要関数**:

- `cronToVisualConfig(expression: string): VisualCronConfig | null`

**実装方針**:

1. `expression` を空白で5フィールドに分割。5フィールドでない場合は `null`
2. フィールドパターンで頻度タイプを判定（下記の優先順位で判定）
3. 単純パターン以外（`*/n`, `-` 範囲など）は `custom` フォールバック
4. 5 フィールド以外や数値範囲外は `null` を返し、外部ライブラリには依存しない

**判定優先順位**:

```
1. `* * * * *`                    → every-minute
2. `X * * * *`（分のみ数値）      → every-hour
3. `X Y * * *`（分・時のみ数値）  → daily
4. `X Y * * D[,D]`（曜日指定）    → weekly
5. `X Y D * *`（日付指定）        → monthly
6. 上記以外のパターン             → custom (rawCronExpression に保存)
```

### ユーティリティ: `cronHumanizer.ts`

**責務**: クロン式文字列 → 自然言語テキストへの変換

**主要関数**:

- `cronToHumanReadable(expression: string, locale: "ja" | "en"): string`

**実装方針**:

- `cronParser` を呼び出して `VisualCronConfig` に変換してから自然言語化
- `VisualCronConfig` が `null` の場合は `locale` に応じたフォールバック文字列を返す
  - `ja`: `"カスタムスケジュール"`
  - `en`: `"Custom schedule"`
- 曜日マッピング（日本語）: `["日", "月", "火", "水", "木", "金", "土"]`
- 時刻は2桁ゼロ埋め表示: `String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0")`

### ユーティリティ: `scheduleConfigValidator.ts`

**責務**: `SkillWizardScheduleConfig` の cronExpression / timezone を保存前に検証する

**主要関数**:

- `validateCronExpression(value: string): string | null`
- `validateTimezone(value: string): string | null`
- `validateSkillWizardScheduleConfig(config: SkillWizardScheduleConfig): { cronExpression?: string; timezone?: string }`

**実装方針**:

- cronExpression は 5 フィールド構文のみを検証する
- timezone は `Intl.DateTimeFormat("en-US", { timeZone })` を試し、例外なら invalid とする
- semantic validation（next-run 計算など）は行わない
- `ConversationRoundStep` と `ScheduleDialog` の両方で同じ関数を使う

### コンポーネント: `FrequencySelector.tsx`

**責務**: 頻度選択セグメントコントロール

**Props 型**:

```typescript
interface FrequencySelectorProps {
  value: FrequencyType;
  onChange: (value: FrequencyType) => void;
  disabled?: boolean;
}
```

**実装方針**:

- `FREQUENCY_OPTIONS` 定数配列でラベルとバリューをペアで定義
- ボタン群を横並びに表示（Tailwind: `flex gap-1`）
- 選択中のボタンに選択スタイルを適用
- `disabled` 時はクリックイベントを無視

**ラベルマッピング（日本語）**:

| FrequencyType  | 表示ラベル |
| -------------- | ---------- |
| `every-minute` | 毎分       |
| `every-hour`   | 毎時       |
| `daily`        | 毎日       |
| `weekly`       | 毎週       |
| `monthly`      | 毎月       |
| `custom`       | カスタム   |

### コンポーネント: `WeekdaySelector.tsx`

**責務**: 曜日トグルボタン群（月〜日の7ボタン）

**Props 型**:

```typescript
interface WeekdaySelectorProps {
  value: Weekday[];
  onChange: (weekdays: Weekday[]) => void;
  disabled?: boolean;
}
```

**実装方針**:

- `WEEKDAY_LABELS` 定数: `["日", "月", "火", "水", "木", "金", "土"]`
- `WEEKDAY_ARIA_LABELS` 定数: `["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]`
- トグル操作: 選択中なら除去、未選択なら追加（`value.includes(day)` で判定）
- `aria-pressed` 属性で選択状態を通知
- `disabled` 時は `pointer-events-none` と `aria-disabled`

### コンポーネント: `TimePickerSection.tsx`

**責務**: 時・分ドロップダウン

**Props 型**:

```typescript
interface TimePickerSectionProps {
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
}
```

**実装方針**:

- 時: `Array.from({ length: 24 }, (_, i) => i)` で 0〜23 の 24 option
- 分: `[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]` の 12 option（5分刻み）
- `<select>` 要素を使用し、`value` と `onChange` で制御コンポーネントとして実装

### コンポーネント: `DayOfMonthSelector.tsx`

**責務**: 月次スケジュールの日付選択（1〜31）

**Props 型**:

```typescript
interface DayOfMonthSelectorProps {
  value: number;
  onChange: (day: number) => void;
}
```

**実装方針**:

- `Array.from({ length: 31 }, (_, i) => i + 1)` で 1〜31 のグリッドボタン
- 選択中の日付にハイライトスタイル適用

### コンポーネント: `CronPreview.tsx`

**責務**: クロン式と自然言語のプレビュー表示

**Props 型**:

```typescript
interface CronPreviewProps {
  cronExpression: string;
  locale?: "ja" | "en";
}
```

**実装方針**:

- `cronToHumanReadable` を呼び出して自然言語テキストを生成・表示
- クロン式は `<code>` タグで表示（等幅フォント）
- `locale` のデフォルト値は `"ja"`

### コンポーネント: `VisualCronPicker.tsx`

**責務**: ビジュアルピッカー全体のオーケストレーション（制御コンポーネント）

**Props 型**:

```typescript
interface VisualCronPickerProps {
  value?: string; // 既存クロン式（編集時の初期値）
  onChange: (cron: string) => void;
}
```

**実装方針**:

- `value` が渡された場合は `cronToVisualConfig` で初期 `VisualCronConfig` を生成
- `VisualCronConfig` を内部 state として管理（`useState`）
- `VisualCronConfig` 変更のたびに `visualConfigToCron` でクロン式を算出し `onChange` を呼ぶ
- `frequency` に応じて表示コンポーネントを切り替え（条件付きレンダリング）:
  - `weekly`: `WeekdaySelector` を表示
  - `every-minute`: `TimePickerSection` を非表示
  - `monthly`: `DayOfMonthSelector` を表示
- `AdvancedToggle` ボタンで `isAdvancedMode` を toggle し `CronInput` を表示
- バリデーション: `weekly` かつ `weekdays.length === 0` の場合にエラーメッセージを表示

## 実装順序（依存関係に基づく）

```
Step 1: 型定義
  └── visualCronConfig.ts（外部依存なし）

Step 2: ユーティリティ（型定義に依存）
  ├── cronConverter.ts（visualCronConfig.ts のみに依存）
  ├── cronParser.ts（visualCronConfig.ts に依存）
  └── cronHumanizer.ts（cronParser.ts に依存）

Step 3: 末端コンポーネント（ユーティリティに依存）
  ├── FrequencySelector.tsx（visualCronConfig.ts のみ）
  ├── WeekdaySelector.tsx（visualCronConfig.ts のみ）
  ├── TimePickerSection.tsx（依存なし）
  ├── DayOfMonthSelector.tsx（依存なし）
  └── CronPreview.tsx（cronHumanizer.ts に依存）

Step 4: オーケストレーションコンポーネント（全ユーティリティ・コンポーネントに依存）
  └── VisualCronPicker.tsx

Step 5: 既存ファイルの修正
  ├── ScheduleDialog.tsx（CronInput → VisualCronPicker 差し替え）
  └── ConversationRoundStep.tsx（共通バリデーション適用）
```

## 既存ファイルの修正箇所

### `ScheduleDialog.tsx`

**変更内容**: `CronInput` コンポーネントのインポートと使用箇所を `VisualCronPicker` に差し替える。

**変更前イメージ**:

```tsx
import { CronInput } from "./CronInput";
// ...
<CronInput value={cronExpression} onChange={setCronExpression} />;
```

**変更後イメージ**:

```tsx
import { VisualCronPicker } from "./VisualCronPicker";
// ...
<VisualCronPicker value={cronExpression} onChange={setCronExpression} />;
```

**注意**: Props インターフェース（`value: string`, `onChange: (cron: string) => void`）は `CronInput` と統一しているため、差し替えは最小限の変更にとどまる。

### `ConversationRoundStep.tsx`

**変更内容**: `SkillWizardScheduleConfig` の cronExpression / timezone 検証を共通 validator へ委譲する。

**追加する利用イメージ**:

```typescript
const validation = validateSkillWizardScheduleConfig(scheduleConfig);
const cronError = validation.cronExpression;
const timezoneError = validation.timezone;
```

**注意**: 既存の `scheduleConfig` ステートは維持する。`ConversationRoundStep` は検証結果の表示に専念し、実際の判定は共通ユーティリティに寄せる。

## 外部ライブラリのインストール

```bash
# 追加依存なし。既存の React / TypeScript / Intl で完結する
```

## TDD Green 確認手順

実装完了後、全テストが Green（PASS）になることを確認する。

```bash
# ユーティリティテスト（全件 PASS であること）
pnpm --filter @repo/desktop vitest run src/__tests__/utils/scheduleConfigValidator.test.ts
pnpm --filter @repo/desktop vitest run src/__tests__/utils/cronConverter.test.ts
pnpm --filter @repo/desktop vitest run src/__tests__/utils/cronParser.test.ts
pnpm --filter @repo/desktop vitest run src/__tests__/utils/cronHumanizer.test.ts

# コンポーネントテスト（全件 PASS であること）
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
pnpm --filter @repo/desktop vitest run src/__tests__/components/schedule/WeekdaySelector.test.tsx
pnpm --filter @repo/desktop vitest run src/__tests__/components/schedule/FrequencySelector.test.tsx
pnpm --filter @repo/desktop vitest run src/__tests__/components/schedule/VisualCronPicker.test.tsx

# 統合テスト（全件 PASS であること）
pnpm --filter @repo/desktop vitest run src/__tests__/integration/scheduleIntegration.test.tsx

# 全テスト一括確認
pnpm --filter @repo/desktop vitest run src/__tests__
```

**期待結果**: 全テストが `PASS`（Green）状態であること。

```bash
# 型チェック・Lint も合わせて確認
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

| 連携ポイント       | 確認内容                                                                    |
| ------------------ | --------------------------------------------------------------------------- |
| IPC 疎通確認       | `scheduleIntegration.test.tsx` の全5件が PASS すること                      |
| 既存機能の後方互換 | 既存の `ScheduleManager` テスト（変更なしファイル）が引き続き PASS すること |
| validator 動作確認 | Electron レンダラープロセス環境（jsdom）で共通 validator が正常動作すること |

## 多角的チェック観点

| 観点               | 確認内容                                                                    |
| ------------------ | --------------------------------------------------------------------------- |
| 最小実装原則       | テストをパスさせるために必要な実装のみ行い、過剰実装がないか                |
| 型安全性           | `any` 型を使用していないか、`VisualCronConfig` 型が厳密に使われているか     |
| 依存方向           | ユーティリティ → コンポーネントの方向のみで、逆方向の依存がないか           |
| Props 整合性       | `VisualCronPicker` の Props が `CronInput` と互換であり差し替えが最小変更か |
| バリデーション実装 | `weekly` + `weekdays=[]` のエラー表示が実装されているか                     |
| IPC 契約保持       | `ScheduleDialog` から IPC への呼び出し引数が変わっていないか                |
| Tailwind 一貫性    | 既存コンポーネントのスタイル規則（クラス命名）に合わせているか              |

## 成果物

| 成果物                  | パス                                                                             | 説明                                   |
| ----------------------- | -------------------------------------------------------------------------------- | -------------------------------------- |
| 本仕様書                | `phase-05-implementation.md`                                                     | TDD Green フェーズ実装仕様書           |
| 型定義                  | `apps/desktop/src/renderer/types/visualCronConfig.ts`                            | VisualCronConfig 型定義                |
| scheduleConfigValidator | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`                     | cron / timezone 共通バリデーション     |
| cronConverter           | `apps/desktop/src/renderer/utils/cronConverter.ts`                               | クロン式変換ユーティリティ             |
| cronParser              | `apps/desktop/src/renderer/utils/cronParser.ts`                                  | クロン式逆変換ユーティリティ           |
| cronHumanizer           | `apps/desktop/src/renderer/utils/cronHumanizer.ts`                               | 自然言語変換ユーティリティ             |
| FrequencySelector       | `apps/desktop/src/renderer/components/schedule/FrequencySelector.tsx`            | 頻度選択コンポーネント                 |
| WeekdaySelector         | `apps/desktop/src/renderer/components/schedule/WeekdaySelector.tsx`              | 曜日選択コンポーネント                 |
| TimePickerSection       | `apps/desktop/src/renderer/components/schedule/TimePickerSection.tsx`            | 時刻選択コンポーネント                 |
| DayOfMonthSelector      | `apps/desktop/src/renderer/components/schedule/DayOfMonthSelector.tsx`           | 日付選択コンポーネント                 |
| CronPreview             | `apps/desktop/src/renderer/components/schedule/CronPreview.tsx`                  | プレビューコンポーネント               |
| VisualCronPicker        | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`             | メインピッカーコンポーネント           |
| 実装サマリー            | `docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/implementation-summary.md` | 実装内容の概要（Phase 5 完了後に作成） |
| 変更ファイル一覧        | `docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/changed-files.md`          | 変更・作成ファイルの一覧と変更理由     |

## 完了条件

- [ ] 全新規ファイル（10ファイル）が作成されていること
- [ ] 全新規ファイル（11ファイル）が作成されていること
- [ ] `ScheduleDialog.tsx` の `CronInput` → `VisualCronPicker` 差し替えが完了していること
- [ ] `ConversationRoundStep.tsx` に共通 validator の適用が追加されていること
- [ ] Phase 4 の全テスト（79件+）が PASS（Green）であること
- [ ] `pnpm --filter @repo/desktop typecheck` が エラーなしで通ること
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通ること
- [ ] `implementation-summary.md` が作成されていること
- [ ] `changed-files.md` が作成されていること
- [ ] `artifacts.json` の Phase 5 ステータスを `"completed"` に更新

## 次のPhase

[Phase 6: テスト拡充 →](./phase-06-test-extension.md)
