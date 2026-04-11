# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase番号  | 8                                    |
| Phase名    | リファクタリング                     |
| 前提Phase  | Phase 7: カバレッジ確認              |
| 後続Phase  | Phase 9: 品質保証                    |
| ステータス | 完了                                 |
| 作成日     | 2026-04-09                           |
| 機能名     | スケジュール設定ビジュアルピッカーUI |

## 目的

テストがグリーンになった状態（Green）を維持しながら、重複コードの削除・責務境界の明確化・可読性の向上を行う。TDD の Red-Green-**Refactor** サイクルの最終工程として、次フェーズ以降の保守性を高める。

## リファクタリング候補テーブル

| #   | 対象                                                      | Before概要                                                                                                                   | After概要                                                                                                          | 理由                                               |
| --- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| 1   | `cronConverter.ts` / `cronParser.ts` / `cronHumanizer.ts` | 各ファイルが独自に `FrequencyType` や `Weekday` を参照・定義                                                                 | 共通型 `VisualCronConfig` / `FrequencyType` / `Weekday` を一元インポートに統一                                     | 型定義の重複排除・single source of truth の徹底    |
| 2   | `WeekdaySelector.tsx`                                     | 曜日ラベル `["月", "火", "水", "木", "金", "土", "日"]` がコンポーネント内にマジックナンバー・リテラルとして埋め込まれている | 曜日定数を `constants/weekdays.ts` に抽出し、コンポーネントからインポートする                                      | マジックナンバー排除・再利用性向上・i18n対応の準備 |
| 3   | `scheduleConfigValidator.ts`                              | cron / timezone の判定が `ConversationRoundStep` と `ScheduleDialog` に散らばる                                              | 共通 validator に抽出し、wizard と dialog の両方から呼び出す                                                       | issue #2000 の解消・重複排除・文言統一             |
| 4   | `VisualCronPicker.tsx`                                    | 状態ロジック（`useState`・バリデーション・onChange ハンドラ等）がコンポーネント本体に混在                                    | カスタムHook `useVisualCronPicker` を抽出し、UIとロジックを分離する                                                | 責務分離（UI描画 vs 状態管理）・テスタビリティ向上 |
| 5   | 全コンポーネント（`FrequencySelector` 等）                | Props 型がインラインで定義されており、型の共有・再利用ができない                                                             | Props 型を `Props` インターフェースとしてコンポーネントファイル上部または `types/` に明示的に定義し、`export` する | 型の厳密化・外部からの型参照・ドキュメント化の促進 |

## リファクタリング詳細

### 1. 共通型使用の統一

```typescript
// Before: cronParser.ts 内で独自に型を使用
type FrequencyType =
  | "every-minute"
  | "every-hour"
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

// After: 共通型定義からインポート
import type {
  FrequencyType,
  VisualCronConfig,
  Weekday,
} from "../types/visualCronConfig";
```

### 2. WeekdaySelector の曜日定数抽出

```typescript
// Before: WeekdaySelector.tsx 内にマジックナンバーが混在
const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];
const WEEKDAY_VALUES = [1, 2, 3, 4, 5, 6, 0]; // 1=月...6=土, 0=日

// After: constants/weekdays.ts に抽出
export const WEEKDAY_DEFINITIONS = [
  { value: 1, label: "月", labelEn: "Mon" },
  { value: 2, label: "火", labelEn: "Tue" },
  // ...
] as const;
```

### 3. scheduleConfigValidator の共通化

```typescript
// After: utils/scheduleConfigValidator.ts
export function validateSkillWizardScheduleConfig(
  config: SkillWizardScheduleConfig,
) {
  return {
    cronExpression: validateCronExpression(config.cronExpression),
    timezone: validateTimezone(config.timezone),
  };
}
```

### 4. VisualCronPicker のカスタムHook抽出

```typescript
// After: hooks/useVisualCronPicker.ts
export function useVisualCronPicker(value: string, onChange: (cron: string) => void) {
  const [config, setConfig] = useState<VisualCronConfig>(parseOrDefault(value));
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFrequencyChange = (frequency: FrequencyType) => { ... };
  const handleWeekdayToggle = (weekday: Weekday) => { ... };
  const handleTimeChange = (hour: number, minute: number) => { ... };

  return { config, validationError, handleFrequencyChange, handleWeekdayToggle, handleTimeChange };
}
```

### 5. Props 型の厳密化

```typescript
// Before: インライン型定義（再利用不可）
function FrequencySelector({ value, onChange }: { value: FrequencyType; onChange: (v: FrequencyType) => void }) { ... }

// After: 明示的な Props インターフェース
export interface FrequencySelectorProps {
  value: FrequencyType;
  onChange: (value: FrequencyType) => void;
  disabled?: boolean;
}
export function FrequencySelector({ value, onChange, disabled = false }: FrequencySelectorProps) { ... }
```

## リファクタリング後の再テスト計画

リファクタリングはテストの振る舞いを変えないことが前提。以下の手順で再テストを実施する。

### 再テスト手順

```bash
# Step 1: リファクタリング後にテストを実行（全テストがGREENを維持すること）
pnpm vitest run

# Step 2: カバレッジが維持されていることを確認
pnpm vitest run --coverage

# Step 3: 型チェックでリグレッションがないことを確認
pnpm typecheck

# Step 4: リントで新たな警告が出ていないことを確認
pnpm lint
```

### 再テスト確認観点

| 確認項目                                          | 期待結果                                          |
| ------------------------------------------------- | ------------------------------------------------- |
| 全テストがPASSすること                            | Phase 6 時点と同じテスト結果                      |
| カバレッジが目標値以上を維持すること              | Phase 7 時点のカバレッジ以上                      |
| TypeScript エラーが発生しないこと                 | 型変更によるコンパイルエラーがゼロ                |
| ESLint 警告が増加していないこと                   | リファクタリング前と同等以下の警告数              |
| `useVisualCronPicker` Hook のテストがPASSすること | Hook の抽出によってロジックの振る舞いが変わらない |

## 責務境界マップ

| ファイル                            | 責務                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `types/visualCronConfig.ts`         | ドメイン型定義（`VisualCronConfig`・`FrequencyType`・`Weekday`）の単一管理     |
| `constants/weekdays.ts`             | 曜日定数（ラベル・値・i18nキー）の単一管理                                     |
| `utils/cronConverter.ts`            | `VisualCronConfig` → cron文字列 への変換（副作用なし・純粋関数）               |
| `utils/cronParser.ts`               | cron文字列 → `VisualCronConfig` への逆変換（副作用なし・純粋関数）             |
| `utils/cronHumanizer.ts`            | cron文字列 → 自然言語テキスト への変換（副作用なし・純粋関数）                 |
| `hooks/useVisualCronPicker.ts`      | `VisualCronPicker` の状態管理・onChange ハンドラ                               |
| `components/VisualCronPicker.tsx`   | UIレイアウト・子コンポーネントのオーケストレーション（ロジックは Hook に委譲） |
| `components/FrequencySelector.tsx`  | 頻度選択UIの描画（セグメントコントロール）                                     |
| `components/WeekdaySelector.tsx`    | 曜日トグルボタン群の描画・バリデーション表示                                   |
| `components/TimePickerSection.tsx`  | 時・分ドロップダウンの描画                                                     |
| `components/DayOfMonthSelector.tsx` | 日付グリッドの描画（月次のみ）                                                 |
| `components/CronPreview.tsx`        | クロン式・自然言語テキストの表示・上級者向け編集モード切替                     |
| `utils/scheduleConfigValidator.ts`  | cron / timezone の共通検証                                                     |

## 統合テスト連携

| テスト対象                        | リファクタリング影響確認ポイント                                  |
| --------------------------------- | ----------------------------------------------------------------- |
| `scheduleIntegration.test.tsx`    | Hook 抽出後も IPC 連携の振る舞いが変わらないことを確認            |
| `VisualCronPicker.test.tsx`       | Hook 抽出後もコンポーネントのインタラクションテストがPASSすること |
| `cronConverter.test.ts`           | 型インポートの変更後も変換ロジックのテストが全件PASSすること      |
| `scheduleConfigValidator.test.ts` | validator 抽出後も cron/timezone 判定が全件PASSすること           |

## 多角的チェック観点

| 思考法       | 確認内容                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------- |
| 逆説思考     | リファクタリングによってテストが失敗する箇所はないか（振る舞いの保全が最優先）                |
| システム思考 | 型と validator の一元管理により、将来の変更が全ファイルに自動的に反映される構造になっているか |
| 制約思考     | カスタムHookと共通 validator の抽出がElectronのレンダラープロセス制約に影響しないか           |
| 水平思考     | React の公式パターン（Custom Hooks）に従ったリファクタリングになっているか                    |
| 垂直思考     | 責務境界マップの全ファイルが単一責務原則（SRP）を満たしているか                               |

## 成果物

| 成果物                 | パス                                                     | 説明                                                   |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| 本仕様書               | `phase-08-refactoring.md`                                | リファクタリングフェーズ仕様書                         |
| リファクタリング計画書 | `artifacts/refactoring-plan.md`                          | 候補・優先度・実施順序の詳細記録                       |
| 再テスト結果           | `artifacts/retest-result.md`                             | リファクタリング後のテスト・カバレッジ・型チェック結果 |
| カスタムHook           | `apps/desktop/src/renderer/hooks/useVisualCronPicker.ts` | VisualCronPicker から抽出したロジックHook              |
| 曜日定数ファイル       | `apps/desktop/src/renderer/constants/weekdays.ts`        | 曜日ラベル・値の定数定義                               |

## 完了条件

- [ ] リファクタリング候補1〜4が全て実施されていること
- [ ] リファクタリング後に `pnpm vitest run` が全件PASSすること
- [ ] リファクタリング後のカバレッジが Phase 7 時点の目標値を維持していること
- [ ] `pnpm typecheck` でエラーがゼロであること
- [ ] `pnpm lint` で新たな警告が増加していないこと
- [ ] 責務境界マップの全ファイルが単一責務原則を満たしていること
- [ ] `artifacts/refactoring-plan.md` と `artifacts/retest-result.md` が作成されていること
- [ ] `artifacts.json` の Phase 8 ステータスを `"completed"` に更新

## 次のPhase

[Phase 9: 品質保証 →](./phase-09-quality-assurance.md)
