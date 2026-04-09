# Phase 4: テスト作成（TDD Red フェーズ）

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase番号  | 4                                    |
| Phase名    | テスト作成（TDD Red フェーズ）       |
| 前提Phase  | Phase 3: 設計レビューゲート          |
| 後続Phase  | Phase 5: 実装（TDD Green フェーズ）  |
| ステータス | 完了                                 |
| 作成日     | 2026-04-09                           |
| 機能名     | スケジュール設定ビジュアルピッカーUI |

## 目的

TDD Red フェーズとして、実装ファイルが存在しない状態で先にテストを書き、全てのテストが「失敗する（Red）」ことを確認する。Phase 5（実装）で全テストを通過させることを目標とし、テスト仕様がそのまま実装仕様の契約となる。

## テストファイル一覧

| テストファイルパス                                                                           | 対象                         | テスト数目安 |
| -------------------------------------------------------------------------------------------- | ---------------------------- | ------------ |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`                           | `scheduleConfigValidator.ts` | 12件+        |
| `apps/desktop/src/__tests__/utils/cronConverter.test.ts`                                     | `cronConverter.ts`           | 20件+        |
| `apps/desktop/src/__tests__/utils/cronParser.test.ts`                                        | `cronParser.ts`              | 15件+        |
| `apps/desktop/src/__tests__/utils/cronHumanizer.test.ts`                                     | `cronHumanizer.ts`           | 10件+        |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | `ConversationRoundStep`      | 追加確認     |
| `apps/desktop/src/__tests__/components/schedule/WeekdaySelector.test.tsx`                    | `WeekdaySelector`            | 8件+         |
| `apps/desktop/src/__tests__/components/schedule/FrequencySelector.test.tsx`                  | `FrequencySelector`          | 6件+         |
| `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.test.tsx`                   | `VisualCronPicker`           | 15件+        |
| `apps/desktop/src/__tests__/integration/scheduleIntegration.test.tsx`                        | IPC連携統合テスト            | 5件+         |

## テスト仕様

### 1. scheduleConfigValidator テスト（`scheduleConfigValidator.test.ts`）

**対象関数**: `validateCronExpression` / `validateTimezone` / `validateSkillWizardScheduleConfig`

#### テストケース一覧

| #      | テスト名                                             | 入力                                               | 期待出力            |
| ------ | ---------------------------------------------------- | -------------------------------------------------- | ------------------- |
| SCV-01 | cronExpression が 5 フィールドなら valid             | `"0 9 * * *"`                                      | `null`              |
| SCV-02 | cronExpression が空文字なら invalid                  | `""`                                               | エラー文            |
| SCV-03 | cronExpression が 4 フィールドなら invalid           | `"0 9 * *"`                                        | エラー文            |
| SCV-04 | cronExpression が 6 フィールドなら invalid           | `"0 9 * * * *"`                                    | エラー文            |
| SCV-05 | timezone が IANA timezone なら valid                 | `"Asia/Tokyo"`                                     | `null`              |
| SCV-06 | timezone が未知文字列なら invalid                    | `"Mars/Phobos"`                                    | エラー文            |
| SCV-07 | `SkillWizardScheduleConfig` が両方 valid             | `{ cronExpression: "0 9 * * *", timezone: "UTC" }` | エラーなし          |
| SCV-08 | `SkillWizardScheduleConfig` の cron だけ invalid     | `{ cronExpression: "bad", timezone: "UTC" }`       | cron のみエラー     |
| SCV-09 | `SkillWizardScheduleConfig` の timezone だけ invalid | `{ cronExpression: "0 9 * * *", timezone: "bad" }` | timezone のみエラー |
| SCV-10 | 前後の空白は trim して判定される                     | `" 0 9 * * * "`                                    | `null`              |
| SCV-11 | semantic validation は行わない                       | `"0 9 1 * *"`                                      | `null`              |
| SCV-12 | 結果は保存前判定に使える                             | 両方 invalid の config                             | 両方エラー          |

### 2. cronConverter テスト（`cronConverter.test.ts`）

**対象関数**: `visualConfigToCron(config: VisualCronConfig): string`

#### テストケース一覧

| #     | テスト名                                                              | 入力（frequency / 補足）                                                         | 期待出力                          |
| ----- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------- |
| CC-01 | every-minute: 定数クロン式を返す                                      | `{ frequency: "every-minute", hour: 0, minute: 0, weekdays: [], dayOfMonth: 1 }` | `"* * * * *"`                     |
| CC-02 | every-hour: 分=0 のとき                                               | `{ frequency: "every-hour", minute: 0, ... }`                                    | `"0 * * * *"`                     |
| CC-03 | every-hour: 分=30 のとき                                              | `{ frequency: "every-hour", minute: 30, ... }`                                   | `"30 * * * *"`                    |
| CC-04 | every-hour: 分=59 のとき                                              | `{ frequency: "every-hour", minute: 59, ... }`                                   | `"59 * * * *"`                    |
| CC-05 | daily: 時=9, 分=0 のとき                                              | `{ frequency: "daily", hour: 9, minute: 0, ... }`                                | `"0 9 * * *"`                     |
| CC-06 | daily: 時=0, 分=0 のとき（深夜0時）                                   | `{ frequency: "daily", hour: 0, minute: 0, ... }`                                | `"0 0 * * *"`                     |
| CC-07 | daily: 時=23, 分=55 のとき（最大値）                                  | `{ frequency: "daily", hour: 23, minute: 55, ... }`                              | `"55 23 * * *"`                   |
| CC-08 | weekly: 月曜のみ                                                      | `{ frequency: "weekly", hour: 9, minute: 0, weekdays: [1], ... }`                | `"0 9 * * 1"`                     |
| CC-09 | weekly: 月・水・金（3曜日）                                           | `{ frequency: "weekly", hour: 9, minute: 0, weekdays: [1, 3, 5], ... }`          | `"0 9 * * 1,3,5"`                 |
| CC-10 | weekly: 土・日（週末）                                                | `{ frequency: "weekly", hour: 8, minute: 30, weekdays: [0, 6], ... }`            | `"30 8 * * 0,6"`                  |
| CC-11 | weekly: 全曜日                                                        | `{ frequency: "weekly", hour: 6, minute: 0, weekdays: [0,1,2,3,4,5,6], ... }`    | `"0 6 * * 0,1,2,3,4,5,6"`         |
| CC-12 | weekly: weekdays がソートされていない場合も正規化してソートされること | `{ frequency: "weekly", weekdays: [5, 1, 3], ... }`                              | weekdays部分が `1,3,5` であること |
| CC-13 | monthly: 1日, 9:00                                                    | `{ frequency: "monthly", hour: 9, minute: 0, dayOfMonth: 1, ... }`               | `"0 9 1 * *"`                     |
| CC-14 | monthly: 31日, 23:59                                                  | `{ frequency: "monthly", hour: 23, minute: 59, dayOfMonth: 31, ... }`            | `"59 23 31 * *"`                  |
| CC-15 | monthly: 15日                                                         | `{ frequency: "monthly", hour: 12, minute: 0, dayOfMonth: 15, ... }`             | `"0 12 15 * *"`                   |
| CC-16 | custom: rawCronExpression をそのまま返す（標準式）                    | `{ frequency: "custom", rawCronExpression: "5 4 * * 2" }`                        | `"5 4 * * 2"`                     |
| CC-17 | custom: rawCronExpression をそのまま返す（複雑式）                    | `{ frequency: "custom", rawCronExpression: "0 */6 * * *" }`                      | `"0 */6 * * *"`                   |
| CC-18 | custom: rawCronExpression が未定義のとき空文字列を返す                | `{ frequency: "custom" }`                                                        | `""`                              |
| CC-19 | every-minute: hour・minute フィールドの値は無視される                 | hour=5, minute=30 を渡しても                                                     | `"* * * * *"`                     |
| CC-20 | weekly: weekdays の順序が出力で常に昇順になること                     | `weekdays: [6, 0, 3]`                                                            | `"* * * * 0,3,6"`                 |
| CC-21 | daily: 時=1, 分=5 の境界値                                            | `{ frequency: "daily", hour: 1, minute: 5, ... }`                                | `"5 1 * * *"`                     |

### 3. cronParser テスト（`cronParser.test.ts`）

**対象関数**: `cronToVisualConfig(expression: string): VisualCronConfig | null`

#### テストケース一覧

| #     | テスト名                                                         | 入力               | 期待出力（frequency / 補足）                                     |
| ----- | ---------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------- |
| CP-01 | `* * * * *` → every-minute                                       | `"* * * * *"`      | `{ frequency: "every-minute" }`                                  |
| CP-02 | `0 * * * *` → every-hour, minute=0                               | `"0 * * * *"`      | `{ frequency: "every-hour", minute: 0 }`                         |
| CP-03 | `30 * * * *` → every-hour, minute=30                             | `"30 * * * *"`     | `{ frequency: "every-hour", minute: 30 }`                        |
| CP-04 | `0 9 * * *` → daily, hour=9, minute=0                            | `"0 9 * * *"`      | `{ frequency: "daily", hour: 9, minute: 0 }`                     |
| CP-05 | `55 23 * * *` → daily, hour=23, minute=55                        | `"55 23 * * *"`    | `{ frequency: "daily", hour: 23, minute: 55 }`                   |
| CP-06 | `0 9 * * 1` → weekly, weekdays=[1]                               | `"0 9 * * 1"`      | `{ frequency: "weekly", weekdays: [1] }`                         |
| CP-07 | `0 9 * * 1,3,5` → weekly, weekdays=[1,3,5]                       | `"0 9 * * 1,3,5"`  | `{ frequency: "weekly", weekdays: [1, 3, 5] }`                   |
| CP-08 | `30 8 * * 0,6` → weekly, weekdays=[0,6]                          | `"30 8 * * 0,6"`   | `{ frequency: "weekly", hour: 8, minute: 30, weekdays: [0, 6] }` |
| CP-09 | `0 9 1 * *` → monthly, dayOfMonth=1                              | `"0 9 1 * *"`      | `{ frequency: "monthly", hour: 9, minute: 0, dayOfMonth: 1 }`    |
| CP-10 | `59 23 31 * *` → monthly, dayOfMonth=31                          | `"59 23 31 * *"`   | `{ frequency: "monthly", hour: 23, minute: 59, dayOfMonth: 31 }` |
| CP-11 | 無効な式（空文字） → null を返す                                 | `""`               | `null`                                                           |
| CP-12 | 無効な式（フィールド不足） → null を返す                         | `"0 9 *"`          | `null`                                                           |
| CP-13 | 複雑なパターン（範囲指定） → custom フォールバック               | `"0 */6 * * *"`    | `{ frequency: "custom", rawCronExpression: "0 */6 * * *" }`      |
| CP-14 | 複雑なパターン（ステップ値） → custom フォールバック             | `"*/15 * * * *"`   | `{ frequency: "custom", rawCronExpression: "*/15 * * * *" }`     |
| CP-15 | 複雑なパターン（複数フィールド複雑指定） → custom フォールバック | `"0 9-18 * * 1-5"` | `{ frequency: "custom", rawCronExpression: "0 9-18 * * 1-5" }`   |
| CP-16 | weekdays の数値が正しくパースされること（文字列→数値）           | `"0 0 * * 1,2,3"`  | `weekdays` が数値配列 `[1, 2, 3]` であること                     |
| CP-17 | 日・月・曜日フィールドに `*` がある場合のみ daily と判定         | `"0 9 * * *"`      | `{ frequency: "daily" }`                                         |

### 4. cronHumanizer テスト（`cronHumanizer.test.ts`）

**対象関数**: `cronToHumanReadable(expression: string, locale: "ja" | "en"): string`

#### テストケース一覧

| #     | テスト名                            | 入力              | ロケール | 期待出力                                          |
| ----- | ----------------------------------- | ----------------- | -------- | ------------------------------------------------- |
| CH-01 | every-minute の日本語               | `"* * * * *"`     | `"ja"`   | `"毎分"`                                          |
| CH-02 | every-hour 30分の日本語             | `"30 * * * *"`    | `"ja"`   | `"毎時 30分"`                                     |
| CH-03 | daily 9:00 の日本語                 | `"0 9 * * *"`     | `"ja"`   | `"毎日 09:00"`                                    |
| CH-04 | weekly 月・水・金 9:00 の日本語     | `"0 9 * * 1,3,5"` | `"ja"`   | `"毎週 月・水・金 09:00"`                         |
| CH-05 | monthly 1日 9:00 の日本語           | `"0 9 1 * *"`     | `"ja"`   | `"毎月1日 09:00"`                                 |
| CH-06 | daily 0:00 のゼロ埋め表示           | `"0 0 * * *"`     | `"ja"`   | `"毎日 00:00"`                                    |
| CH-07 | every-hour 0分の日本語              | `"0 * * * *"`     | `"ja"`   | `"毎時 00分"`                                     |
| CH-08 | weekly 日曜のみ                     | `"0 8 * * 0"`     | `"ja"`   | `"毎週 日 08:00"`                                 |
| CH-09 | 無効な式 → フォールバックメッセージ | `"invalid"`       | `"ja"`   | `"カスタムスケジュール"` もしくは空文字でないこと |
| CH-10 | every-minute の英語                 | `"* * * * *"`     | `"en"`   | `"Every minute"`                                  |

### 5. WeekdaySelector コンポーネントテスト（`WeekdaySelector.test.tsx`）

**テスト環境**: jsdom + @testing-library/react + @testing-library/user-event

#### テストケース一覧

| #     | テスト名                                      | 操作                                 | 期待動作                                        |
| ----- | --------------------------------------------- | ------------------------------------ | ----------------------------------------------- |
| WS-01 | 初期レンダリング: 月〜日の7ボタンが表示される | レンダリング                         | `月火水木金土日` の7つのボタンが存在            |
| WS-02 | 初期選択状態が props から正しく反映される     | `value={[1, 3]}` を渡す              | 月・水ボタンが選択済み（aria-pressed=true）状態 |
| WS-03 | 曜日ボタンをクリックで選択できる              | 火曜ボタンをクリック                 | `onChange([1, 2])` が呼ばれること               |
| WS-04 | 選択済みボタンをクリックで解除できる          | 月曜ボタンをクリック（選択済み）     | `onChange([])` が呼ばれること                   |
| WS-05 | 複数曜日の選択が可能                          | 月・水・金を順番にクリック           | `onChange` が段階的に呼ばれ最終的に `[1,3,5]`   |
| WS-06 | disabled 状態ではクリックが無効               | `disabled={true}` でボタンをクリック | `onChange` が呼ばれない                         |
| WS-07 | 各ボタンに aria-label が設定されている        | レンダリング                         | `aria-label="月曜日"` 等が存在                  |
| WS-08 | キーボード操作（Enter/Space）で選択できる     | Enterキー押下                        | `onChange` が呼ばれること                       |

### 6. FrequencySelector コンポーネントテスト（`FrequencySelector.test.tsx`）

#### テストケース一覧

| #     | テスト名                                   | 操作                | 期待動作                                                                |
| ----- | ------------------------------------------ | ------------------- | ----------------------------------------------------------------------- |
| FS-01 | 全頻度オプション（6種）が表示される        | レンダリング        | `every-minute / every-hour / daily / weekly / monthly / custom` の6要素 |
| FS-02 | 初期選択が props から反映される            | `value="daily"`     | `daily` ボタンが選択状態                                                |
| FS-03 | オプションをクリックで onChange が呼ばれる | `weekly` をクリック | `onChange("weekly")` が呼ばれる                                         |
| FS-04 | 選択変更: daily → weekly                   | クリック操作        | 前の選択が解除され weekly が選択状態                                    |
| FS-05 | disabled 時はクリック無効                  | `disabled={true}`   | `onChange` が呼ばれない                                                 |
| FS-06 | 日本語ラベルが表示される                   | レンダリング        | `毎日`, `毎週`, `毎月`, `カスタム` 等が表示されること                   |

### 7. VisualCronPicker 統合コンポーネントテスト（`VisualCronPicker.test.tsx`）

#### テストケース一覧

| #     | テスト名                                               | 操作                              | 期待動作                                |
| ----- | ------------------------------------------------------ | --------------------------------- | --------------------------------------- |
| VP-01 | デフォルト表示: FrequencySelector が表示される         | レンダリング                      | FrequencySelector が存在                |
| VP-02 | デフォルト表示: TimePickerSection が表示される         | レンダリング                      | 時・分のドロップダウンが存在            |
| VP-03 | `weekly` 選択時に WeekdaySelector が表示される         | `daily` → `weekly` に切り替え     | WeekdaySelector が表示される            |
| VP-04 | `every-minute` 選択時に TimePickerSection が非表示     | `every-minute` を選択             | 時・分セレクターが非表示                |
| VP-05 | `monthly` 選択時に DayOfMonthSelector が表示される     | `monthly` を選択                  | DayOfMonthSelector が表示される         |
| VP-06 | 曜日・時刻選択後に onChange が正しいクロン式を返す     | weekly + 月水金 + 9:00 選択       | `onChange("0 9 * * 1,3,5")` が呼ばれる  |
| VP-07 | CronPreview にクロン式が表示される                     | daily + 9:00 設定                 | `"0 9 * * *"` がプレビューに表示        |
| VP-08 | CronPreview に自然言語が表示される                     | daily + 9:00 設定                 | `"毎日 09:00"` が表示される             |
| VP-09 | value prop が渡された場合に正しく初期化される          | `value="0 9 * * 1,3,5"`           | weekly + 月水金 + 9:00 の状態で初期表示 |
| VP-10 | AdvancedToggle で直接編集モードに切り替わる            | AdvancedToggle をクリック         | CronInput が表示される                  |
| VP-11 | 直接編集モードで入力したクロン式が onChange に渡される | CronInput に `"0 */2 * * *"` 入力 | `onChange("0 */2 * * *")` が呼ばれる    |
| VP-12 | 頻度切り替え時に週次→日次でWeekdaySelectorが非表示     | `weekly` → `daily`                | WeekdaySelector が非表示                |
| VP-13 | バリデーション: 毎週で曜日が0件のときエラー表示        | weekdays=[] で確定                | エラーメッセージが表示される            |
| VP-14 | 時間セレクターの選択肢が 0〜23 の24個あること          | TimePickerSection レンダリング    | option 要素が24個                       |
| VP-15 | 分セレクターの選択肢が 5分刻みで 0〜55 の12個あること  | TimePickerSection レンダリング    | option 要素が12個                       |

### 8. スケジュール統合テスト（`scheduleIntegration.test.tsx`）

| #     | テスト名                                                     | 検証内容                                                                                |
| ----- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| SI-01 | VisualCronPicker → IPC: daily 9:00 のクロン式がIPCに渡される | `window.api.skill.schedule.add` のモックが `cronExpression: "0 9 * * *"` で呼ばれること |
| SI-02 | VisualCronPicker → IPC: weekly 月水金 9:00                   | `cronExpression: "0 9 * * 1,3,5"` でIPC呼び出し                                         |
| SI-03 | 既存スケジュール読み込み: クロン式 → ビジュアルUI初期化      | `value="0 9 * * *"` でVisualCronPickerをマウントするとdaily+9:00に初期化                |
| SI-04 | バリデーションエラー時はIPCが呼ばれない                      | 無効状態で送信操作 → IPCが呼ばれないこと                                                |
| SI-05 | custom クロン式がIPCにそのまま渡される                       | AdvancedToggleで `"0 */6 * * *"` 入力 → IPCに同値が渡ること                             |

## TDD Red 確認手順

Phase 4 完了の確認として、実装ファイルが存在しない状態でテストを実行し、全テストが失敗（Red）することを確認する。

```bash
    # ユーティリティテスト（実装なし → FAIL であること）
pnpm --filter @repo/desktop vitest run src/__tests__/utils/scheduleConfigValidator.test.ts
pnpm --filter @repo/desktop vitest run src/__tests__/utils/cronConverter.test.ts
pnpm --filter @repo/desktop vitest run src/__tests__/utils/cronParser.test.ts
pnpm --filter @repo/desktop vitest run src/__tests__/utils/cronHumanizer.test.ts

# コンポーネントテスト（実装なし → FAIL であること）
pnpm --filter @repo/desktop vitest run src/__tests__/components/schedule/WeekdaySelector.test.tsx
pnpm --filter @repo/desktop vitest run src/__tests__/components/schedule/FrequencySelector.test.tsx
pnpm --filter @repo/desktop vitest run src/__tests__/components/schedule/VisualCronPicker.test.tsx

    # 統合テスト（実装なし → FAIL であること）
pnpm --filter @repo/desktop vitest run src/__tests__/integration/scheduleIntegration.test.tsx

# 全テスト一括確認
pnpm --filter @repo/desktop vitest run src/__tests__
```

**期待結果**: 全テストが `FAIL`（Red）状態であること。PASS しているテストがある場合は、実装が残存していないか確認する。

## 統合テスト連携

| 連携ポイント   | 確認内容                                                                |
| -------------- | ----------------------------------------------------------------------- |
| IPC モック戦略 | `vi.mock` で `window.api.skill.schedule` をモックし、呼び出し引数を検証 |
| validator 依存 | `scheduleConfigValidator` が標準 API のみで動作すること                 |
| jsdom 設定     | `vitest.config.ts` の `environment: "jsdom"` が適用されていること       |

## 多角的チェック観点

| 観点             | 確認内容                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| 網羅性           | 6種類の全 frequency タイプと scheduleConfigValidator の cron/timezone がカバーされているか     |
| 境界値           | minute=0, hour=0, hour=23, dayOfMonth=31 などの境界値がテストされているか                      |
| 逆変換完全性     | cronParser が変換できないパターンは null / custom フォールバックで処理されているか             |
| バリデーション   | 無効クロン式（空文字・フィールド不足）が null を返すテストがあるか                             |
| timezone         | unknown timezone を拒否するテストがあるか                                                      |
| UXシナリオ       | 頻度切り替え・曜日選択・時刻設定の一連のユーザー操作がコンポーネントテストでカバーされているか |
| アクセシビリティ | aria-label の存在確認テストがあるか（キーボード操作テストを含む）                              |
| IPC連携          | モックを使った IPC 統合テストが存在するか                                                      |
| Red 確認         | テスト実行が失敗（Red）であることを確認してから Phase 5 に進むか                               |

## 成果物

| 成果物                         | パス                                                                        | 説明                                      |
| ------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------- |
| 本仕様書                       | `phase-04-test-creation.md`                                                 | TDD Red フェーズ仕様書                    |
| scheduleConfigValidator テスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`          | cron / timezone バリデーションテスト      |
| cronConverter テスト           | `apps/desktop/src/__tests__/utils/cronConverter.test.ts`                    | 全頻度タイプ変換テスト（20件+）           |
| cronParser テスト              | `apps/desktop/src/__tests__/utils/cronParser.test.ts`                       | 逆変換テスト（15件+）                     |
| cronHumanizer テスト           | `apps/desktop/src/__tests__/utils/cronHumanizer.test.ts`                    | 日本語自然言語変換テスト（10件+）         |
| WeekdaySelector テスト         | `apps/desktop/src/__tests__/components/schedule/WeekdaySelector.test.tsx`   | 選択/非選択インタラクションテスト（8件+） |
| FrequencySelector テスト       | `apps/desktop/src/__tests__/components/schedule/FrequencySelector.test.tsx` | 切り替えテスト（6件+）                    |
| VisualCronPicker テスト        | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.test.tsx`  | 統合コンポーネントテスト（15件+）         |
| 統合テスト                     | `apps/desktop/src/__tests__/integration/scheduleIntegration.test.tsx`       | IPC連携統合テスト（5件+）                 |

## 完了条件

- [ ] 全7テストファイルが作成されていること
- [ ] `scheduleConfigValidator.test.ts` が作成されていること
- [ ] cronConverter テストが 20件以上あること
- [ ] cronParser テストが 15件以上あること
- [ ] 全テストが `vitest run` で失敗（Red）することを確認済みであること
- [ ] IPC 統合テストに `vi.mock` によるモック戦略が実装されていること
- [ ] アクセシビリティ（aria-label・キーボード）テストが含まれていること
- [ ] `artifacts.json` の Phase 4 ステータスを `"completed"` に更新

## 次のPhase

[Phase 5: 実装（TDD Green フェーズ）→](./phase-05-implementation.md)
