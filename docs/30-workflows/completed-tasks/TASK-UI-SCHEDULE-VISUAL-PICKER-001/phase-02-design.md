# Phase 2: 設計

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase番号  | 2                                    |
| Phase名    | 設計                                 |
| 前提Phase  | Phase 1: 要件定義                    |
| 後続Phase  | Phase 3: 設計レビューゲート          |
| ステータス | 完了                                 |
| 作成日     | 2026-04-09                           |
| 機能名     | スケジュール設定ビジュアルピッカーUI |

## 目的

コンポーネントアーキテクチャ・クロン式変換アルゴリズム・共通バリデーション・テスト戦略を設計し、Phase 4以降の実装が迷いなく進められる状態にする。

## 既存コンポーネント再利用可否の確認

| コンポーネント/ユーティリティ | 現状                              | 再利用可否     | 方針                                                            |
| ----------------------------- | --------------------------------- | -------------- | --------------------------------------------------------------- |
| `CronInput`                   | 実装済み（プリセット + 直接入力） | 部分的に再利用 | `VisualCronPicker` に置き換え、または薄いラッパーとして互換維持 |
| `ScheduleDialog`              | 実装済み                          | 再利用         | `VisualCronPicker` を差し込む形で対応                           |
| `ConversationRoundStep`       | 実装済み                          | 再利用         | 共通バリデーションを適用し issue #2000 を解消                   |
| `SkillSchedule` 型            | 完成                              | 変更なし       | `cronExpression` フィールドをそのまま使用                       |
| `SkillWizardScheduleConfig`   | 完成                              | 変更なし       | `cronExpression` / `timezone` の入力検証に使用                  |

## コンポーネントアーキテクチャ

### コンポーネントツリー

```
ScheduleManager（既存・変更なし）
└── ScheduleDialog（既存・変更なし）
    └── VisualCronPicker（新規）  ← 既存の CronInput を置き換え
        ├── FrequencySelector（新規）
        │   └── SegmentedControl（既存UIプリミティブ or 新規）
        ├── WeekdaySelector（新規）
        │   └── ToggleButton × 7（月火水木金土日）
        ├── TimePickerSection（新規）
        │   ├── HourSelect（ドロップダウン 0-23）
        │   └── MinuteSelect（ドロップダウン 0-55, 5刻み）
        ├── DayOfMonthSelector（新規・monthlyのみ表示）
        │   └── DayGrid（1-31 グリッドボタン）
        ├── CronPreview（新規）
        │   ├── HumanReadableText（自然言語表示）
        │   └── CronExpressionBadge（クロン式表示）
        └── AdvancedToggle（新規・上級者向け直接編集切替）
            └── CronInput（既存・直接入力モード）

ConversationRoundStep（既存・変更あり）
└── scheduleConfigValidator（共通ユーティリティ）
```

### 新規ファイル一覧

| ファイルパス                                                           | 種別           | 責務                                  |
| ---------------------------------------------------------------------- | -------------- | ------------------------------------- |
| `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`   | コンポーネント | ピッカー全体のオーケストレーション    |
| `apps/desktop/src/renderer/components/schedule/FrequencySelector.tsx`  | コンポーネント | 頻度選択セグメント                    |
| `apps/desktop/src/renderer/components/schedule/WeekdaySelector.tsx`    | コンポーネント | 曜日トグルボタン群                    |
| `apps/desktop/src/renderer/components/schedule/TimePickerSection.tsx`  | コンポーネント | 時・分ドロップダウン                  |
| `apps/desktop/src/renderer/components/schedule/DayOfMonthSelector.tsx` | コンポーネント | 日付グリッド（月次）                  |
| `apps/desktop/src/renderer/components/schedule/CronPreview.tsx`        | コンポーネント | クロン式・自然言語プレビュー          |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`           | ユーティリティ | cron / timezone の共通検証            |
| `apps/desktop/src/renderer/utils/cronConverter.ts`                     | ユーティリティ | VisualCronConfig → cron string 変換   |
| `apps/desktop/src/renderer/utils/cronParser.ts`                        | ユーティリティ | cron string → VisualCronConfig 逆変換 |
| `apps/desktop/src/renderer/utils/cronHumanizer.ts`                     | ユーティリティ | cron string → 自然言語変換            |

### 修正対象ファイル一覧

| ファイルパス                                                                    | 変更内容                                  |
| ------------------------------------------------------------------------------- | ----------------------------------------- |
| `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx` | CronInput → VisualCronPicker への差し替え |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | 共通バリデーション適用                    |

## 型定義設計

### `VisualCronConfig`（新規型）

```typescript
// apps/desktop/src/renderer/types/visualCronConfig.ts

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
  weekdays: Weekday[]; // 複数選択（weeklyのみ有効）
  dayOfMonth: number; // 1-31（monthlyのみ有効）
  // カスタムモード用（直接入力）
  rawCronExpression?: string;
}
```

## 変換アルゴリズム設計（cronConverter.ts）

### `visualConfigToCron(config: VisualCronConfig): string`

| frequency      | 変換ロジック                                      | 出力例          |
| -------------- | ------------------------------------------------- | --------------- |
| `every-minute` | `* * * * *`                                       | `* * * * *`     |
| `every-hour`   | `{minute} * * * *`                                | `30 * * * *`    |
| `daily`        | `{minute} {hour} * * *`                           | `0 9 * * *`     |
| `weekly`       | `{minute} {hour} * * {weekdays.sort().join(",")}` | `0 9 * * 1,3,5` |
| `monthly`      | `{minute} {hour} {dayOfMonth} * *`                | `0 9 1 * *`     |
| `custom`       | `rawCronExpression` をそのまま返す                | 任意            |

### `cronToVisualConfig(expression: string): VisualCronConfig | null`

- 5 フィールドの cron 文字列を自前で分解し、単純パターンのみを復元する
- パースできない場合は `null` を返し、直接編集モードにフォールバック
- 対応パターン（逆変換可能なケース）:
  - `* * * * *` → `every-minute`
  - `X * * * *`（分のみ固定）→ `every-hour`
  - `X Y * * *`（分・時固定）→ `daily`
  - `X Y * * D[,D...]`（曜日指定）→ `weekly`
  - `X Y D * *`（日付指定）→ `monthly`
  - その他 → `custom`（rawCronExpression に保存）

### `cronToHumanReadable(expression: string, locale: "ja" | "en"): string`

| 入力            | 出力（ja）            |
| --------------- | --------------------- |
| `0 9 * * *`     | 毎日 09:00            |
| `0 9 * * 1,3,5` | 毎週 月・水・金 09:00 |
| `30 * * * *`    | 毎時 30分             |
| `* * * * *`     | 毎分                  |
| `0 9 1 * *`     | 毎月1日 09:00         |

## 共通バリデーション設計

### `scheduleConfigValidator.ts`

**責務**: cron 式と timezone の入力可否を一元判定する

```typescript
import type { SkillWizardScheduleConfig } from "@repo/shared/types/skillCreator";

export interface ScheduleConfigValidationResult {
  cronExpression?: string;
  timezone?: string;
}

export function validateCronExpression(value: string): string | null;
export function validateTimezone(value: string): string | null;
export function validateSkillWizardScheduleConfig(
  config: SkillWizardScheduleConfig,
): ScheduleConfigValidationResult;
```

**実装方針**:

- cronExpression は 5 フィールドのシンタックスのみを検証する
- timezone は `Intl.DateTimeFormat("en-US", { timeZone })` で妥当性を確認する
- semantic validation（次回実行時刻の計算など）は行わない
- `ConversationRoundStep` と `ScheduleDialog` の両方から利用する

## 状態管理設計（ConversationRoundStep / ScheduleDialog の拡張）

```typescript
// 追加するステート
const [visualConfig, setVisualConfig] = useState<VisualCronConfig>({
  frequency: "daily",
  hour: 9,
  minute: 0,
  weekdays: [1], // デフォルト: 月曜
  dayOfMonth: 1,
});

// 変換の責務: VisualCronPicker が onChange で cron 文字列を返す
// 画面側は共通バリデーションの結果を表示するだけに留める
```

設計原則: `VisualCronPicker` は **制御コンポーネント（Controlled Component）** として設計し、`value: string`（クロン式）と `onChange: (cron: string) => void` を Props として受け取る。`ConversationRoundStep` 側は `cronExpression` と `timezone` の検証結果を外出しせず、共通ユーティリティの戻り値だけを表示する。

## IPC契約設計

変更なし。`VisualCronPicker` が生成したクロン式文字列は、既存の `skill:schedule:add` IPC チャンネルにそのまま渡される。`ConversationRoundStep` の validation は IPC に到達する前に完了する。

```
[VisualCronPicker]
    ↓ onChange("0 9 * * 1,3,5")
[ScheduleDialog]
    ↓ window.api.skill.schedule.add({ ..., schedule: { type: "cron", cronExpression: "0 9 * * 1,3,5" } })
[IPC: skill:schedule:add]
    ↓
[SkillScheduler.addSchedule()]（変更なし）
```

## テスト戦略

### テスト構成

| テスト種別           | 対象                         | テストファイルパス                                                 | テスト数目安 |
| -------------------- | ---------------------------- | ------------------------------------------------------------------ | ------------ |
| ユニットテスト       | `scheduleConfigValidator.ts` | `__tests__/scheduleConfigValidator.test.ts`                        | 12件+        |
| ユニットテスト       | `cronConverter.ts`           | `__tests__/cronConverter.test.ts`                                  | 20件+        |
| ユニットテスト       | `cronParser.ts`              | `__tests__/cronParser.test.ts`                                     | 15件+        |
| ユニットテスト       | `cronHumanizer.ts`           | `__tests__/cronHumanizer.test.ts`                                  | 10件+        |
| コンポーネントテスト | `WeekdaySelector`            | `__tests__/WeekdaySelector.test.tsx`                               | 8件+         |
| コンポーネントテスト | `FrequencySelector`          | `__tests__/FrequencySelector.test.tsx`                             | 6件+         |
| コンポーネントテスト | `VisualCronPicker`（統合）   | `__tests__/VisualCronPicker.test.tsx`                              | 15件+        |
| コンポーネントテスト | `ConversationRoundStep`      | `components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 8件+         |
| 統合テスト           | VisualCronPicker → IPC       | `__tests__/scheduleIntegration.test.tsx`                           | 5件+         |

### テストツール

- **Vitest** + **@testing-library/react** + **@testing-library/user-event**
- コンポーネントテストは `jsdom` 環境で実行
- IPC統合テストはモック使用（`vi.mock('./preload')`）

## 依存整合マトリクス

| 依存元                       | 依存先                         | 種別        | 変更影響                           |
| ---------------------------- | ------------------------------ | ----------- | ---------------------------------- |
| `VisualCronPicker`           | `cronConverter.ts`             | import      | cronConverter変更時は再テスト必要  |
| `VisualCronPicker`           | `cronParser.ts`                | import      | 既存スケジュール読込に影響         |
| `ScheduleDialog`             | `VisualCronPicker`             | import      | Props変更時はDialog側の修正必要    |
| `ConversationRoundStep`      | `scheduleConfigValidator.ts`   | import      | validation文言変更時は再テスト必要 |
| `scheduleConfigValidator.ts` | `SkillWizardScheduleConfig` 型 | type import | 型変更時は wizard 側の修正必要     |

## 統合テスト連携

| テスト対象                            | 検証ポイント                                                   |
| ------------------------------------- | -------------------------------------------------------------- |
| `VisualCronPicker` → `ScheduleDialog` | onChange でクロン式文字列が正しく渡ること                      |
| 既存スケジュール編集時                | cronParser で VisualCronConfig に逆変換され UIに反映されること |
| `skill:schedule:add` 呼び出し         | VisualCronPicker生成のクロン式がIPCに正常に渡ること            |
| `ConversationRoundStep` → validation  | cronExpression / timezone の error が返ること                  |

## 多角的チェック観点（30思考法）

| カテゴリ     | 思考法               | 今回の観点                                           |
| ------------ | -------------------- | ---------------------------------------------------- |
| 論理分析系   | 批判的思考           | 仕様の前提に飛躍や曖昧さがないか                     |
| 論理分析系   | 演繹思考             | skill定義から受入基準を導けるか                      |
| 論理分析系   | 帰納的思考           | 既存実装の共通パターンを抽出できるか                 |
| 論理分析系   | アブダクション       | issue #2000 の症状に最も自然な説明は何か             |
| 論理分析系   | 垂直思考             | 1つの論点を深掘りし、境界条件まで詰められるか        |
| 構造分解系   | 要素分解             | UI・バリデーション・保存を最小単位に分けられるか     |
| 構造分解系   | MECE                 | 漏れなく重複なく要件を整理できるか                   |
| 構造分解系   | 2軸思考              | easy cron input と validation の両軸で見られるか     |
| 構造分解系   | プロセス思考         | 入力→検証→保存の流れが明確か                         |
| メタ・抽象系 | メタ思考             | 仕様書そのものの前提は妥当か                         |
| メタ・抽象系 | 抽象化思考           | 個別UIを共通入力/共通検証へ抽象化できるか            |
| メタ・抽象系 | ダブル・ループ思考   | 要件の前提自体を見直すべきか                         |
| 発想・拡張系 | ブレインストーミング | 代替入力方法を幅広く洗い出せるか                     |
| 発想・拡張系 | 水平思考             | Google Calendar・Slack の設定UIを参考にできるか      |
| 発想・拡張系 | 逆説思考             | 上級者の直接入力を残しつつ初心者を守れるか           |
| 発想・拡張系 | 類推思考             | 他のスケジューラUIとの類似点を活かせるか             |
| 発想・拡張系 | if思考               | timezone が無効ならどうなるかを先回りできるか        |
| 発想・拡張系 | 素人思考             | cron を知らない人のつまずきを先に潰せるか            |
| システム系   | システム思考         | 既存バックエンドとの変更なし統合が保証されているか   |
| システム系   | 因果関係分析         | どの入力がどのエラーを生むか追えるか                 |
| システム系   | 因果ループ           | 検証強化が UX 改善にどう循環するか見えるか           |
| 戦略・価値系 | トレードオン思考     | 直感性と柔軟性のバランスが取れているか               |
| 戦略・価値系 | プラスサム思考       | 初心者と上級者の両方が得をするか                     |
| 戦略・価値系 | 価値提案思考         | この変更でユーザー価値が何倍になるか                 |
| 戦略・価値系 | 戦略的思考           | 今回の変更は将来の拡張にも効くか                     |
| 問題解決系   | why思考              | なぜ入力と検証を分ける必要があるのか                 |
| 問題解決系   | 改善思考             | 現在より最小の複雑性で改善できるか                   |
| 問題解決系   | 仮説思考             | 共通バリデーションで両方の課題が解消できるか         |
| 問題解決系   | 論点思考             | 「入力しやすさ」と「正しさ」の論点が分離できているか |
| 問題解決系   | KJ法                 | バラバラな入力要望をグルーピングできるか             |

## 成果物

| 成果物   | パス                 | 説明     |
| -------- | -------------------- | -------- |
| 本仕様書 | `phase-02-design.md` | 設計文書 |

## 完了条件

- [ ] コンポーネントツリーが明確に定義されていること
- [ ] 新規・修正ファイル一覧が全て列挙されていること
- [ ] `VisualCronConfig` 型定義が確定していること
- [ ] `cronConverter` の変換ロジックが全頻度タイプについて設計されていること
- [ ] `cronParser` の逆変換ロジックが設計されていること
- [ ] `scheduleConfigValidator` の cron / timezone 検証が設計されていること
- [ ] IPC 契約が変更不要であることが確認されていること
- [ ] テスト戦略（テスト種別・ファイルパス・件数目安）が定義されていること
- [ ] 依存整合マトリクスが作成されていること
- [ ] `artifacts.json` の Phase 2 ステータスを `"completed"` に更新

## 次のPhase

[Phase 3: 設計レビューゲート →](./phase-03-design-review.md)
