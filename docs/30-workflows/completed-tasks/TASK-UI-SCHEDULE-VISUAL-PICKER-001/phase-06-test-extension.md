# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase番号  | 6                                    |
| Phase名    | テスト拡充                           |
| 前提Phase  | Phase 5: 実装（TDD Green フェーズ）  |
| 後続Phase  | Phase 7: コードレビューゲート        |
| ステータス | 完了                                 |
| 作成日     | 2026-04-09                           |
| 機能名     | スケジュール設定ビジュアルピッカーUI |

## 目的

Phase 4 の基本テスト（Happy Path・主要シナリオ）に加えて、fail path・エッジケース・回帰ガードのテストを追加する。本 Phase で追加するテストが全て Green になることで、Phase 7（コードレビュー）に安全に進める品質水準を確保する。

## 追加テストケース一覧

### 1. scheduleConfigValidator エッジケーステスト（`scheduleConfigValidator.test.ts` への追加）

| #         | テスト名                                     | 入力                                              | 期待動作   |
| --------- | -------------------------------------------- | ------------------------------------------------- | ---------- |
| SCV-EX-01 | timezone: 空文字                             | `""`                                              | invalid    |
| SCV-EX-02 | timezone: trim 後に空                        | `"   "`                                           | invalid    |
| SCV-EX-03 | timezone: 既知 IANA 名称                     | `"Asia/Tokyo"`                                    | valid      |
| SCV-EX-04 | timezone: 存在しない名称                     | `"Mars/Phobos"`                                   | invalid    |
| SCV-EX-05 | cronExpression: 空白を含む 5 フィールド      | `" 0 9 * * * "`                                   | valid      |
| SCV-EX-06 | cronExpression: 6 フィールド                 | `"0 9 * * * *"`                                   | invalid    |
| SCV-EX-07 | cronExpression: 5 フィールドの数値範囲外     | `"60 9 * * *"`                                    | invalid    |
| SCV-EX-08 | config 全体で cron/timezone の両方が invalid | `{ cronExpression: "", timezone: "Mars/Phobos" }` | 両方エラー |

### 2. cronConverter エッジケーステスト（`cronConverter.test.ts` への追加）

| #        | テスト名                                                | 入力                                                           | 期待動作                                                                          |
| -------- | ------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| CC-EX-01 | weekly: weekdays が空配列のとき空の曜日フィールドになる | `{ frequency: "weekly", weekdays: [], hour: 9, minute: 0 }`    | `"0 9 * * "` または空文字列ではなくエラーとならないこと（実装に応じて仕様を確定） |
| CC-EX-02 | every-hour: minute=0 のゼロ埋めなし                     | `{ frequency: "every-hour", minute: 0 }`                       | `"0 * * * *"`（`"00 * * * *"` でないこと）                                        |
| CC-EX-03 | daily: hour=23 の最大値                                 | `{ frequency: "daily", hour: 23, minute: 0 }`                  | `"0 23 * * *"`                                                                    |
| CC-EX-04 | monthly: dayOfMonth=31 の最大値                         | `{ frequency: "monthly", hour: 0, minute: 0, dayOfMonth: 31 }` | `"0 0 31 * *"`                                                                    |
| CC-EX-05 | weekly: weekdays に重複値がある場合                     | `{ frequency: "weekly", weekdays: [1, 1, 3], ... }`            | 重複が除去されて `"* * * * 1,3"` となること                                       |
| CC-EX-06 | custom: rawCronExpression が空文字                      | `{ frequency: "custom", rawCronExpression: "" }`               | `""` を返す（エラーにならない）                                                   |
| CC-EX-07 | daily: minute=0 の最小値                                | `{ frequency: "daily", hour: 9, minute: 0 }`                   | `"0 9 * * *"`                                                                     |

### 3. cronParser エッジケーステスト（`cronParser.test.ts` への追加）

| #        | テスト名                                                     | 入力              | 期待動作                                                     |
| -------- | ------------------------------------------------------------ | ----------------- | ------------------------------------------------------------ |
| CP-EX-01 | 無効な式（null 相当の空文字） → null                         | `""`              | `null` を返す                                                |
| CP-EX-02 | 無効な式（フィールド不足: 4フィールド） → null               | `"0 9 * *"`       | `null` を返す                                                |
| CP-EX-03 | 無効な式（フィールド過多: 6フィールド） → null               | `"0 9 * * * *"`   | `null` を返す                                                |
| CP-EX-04 | 無効な式（数値範囲外: 分=60） → null                         | `"60 9 * * *"`    | `null` を返す                                                |
| CP-EX-05 | 複雑なパターン（ステップ: `*/15`） → custom フォールバック   | `"*/15 * * * *"`  | `{ frequency: "custom", rawCronExpression: "*/15 * * * *" }` |
| CP-EX-06 | 複雑なパターン（範囲: `1-5`） → custom フォールバック        | `"0 9 * * 1-5"`   | `{ frequency: "custom", rawCronExpression: "0 9 * * 1-5" }`  |
| CP-EX-07 | 複雑なパターン（複数フィールド複合） → custom フォールバック | `"0 9,18 * * *"`  | `{ frequency: "custom", rawCronExpression: "0 9,18 * * *" }` |
| CP-EX-08 | 前後の空白を含む式 → トリムして正常パース                    | `"  0 9 * * *  "` | `{ frequency: "daily", hour: 9, minute: 0 }`                 |

### 4. WeekdaySelector エッジケーステスト（`WeekdaySelector.test.tsx` への追加）

| #        | テスト名                                          | 操作                                   | 期待動作                                                                                                                                     |
| -------- | ------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| WS-EX-01 | 全曜日を選択できる                                | 月〜日の全7ボタンを順番にクリック      | 最終的に `onChange([0,1,2,3,4,5,6])` が呼ばれること                                                                                          |
| WS-EX-02 | 全曜日を解除できる                                | 全て選択済みの状態で全ボタンをクリック | 最終的に `onChange([])` が呼ばれること                                                                                                       |
| WS-EX-03 | 最後の1曜日を解除しようとしたときのバリデーション | `value={[1]}` の状態で月曜をクリック   | `onChange([])` が呼ばれる（バリデーションは親コンポーネント責務）または onChange が呼ばれないこと（WeekdaySelector が最低1件を保証する場合） |
| WS-EX-04 | 選択状態が value prop の変更に追従する            | `value` を `[1]` → `[1,3]` に変更      | 火曜ボタンが選択済みに切り替わること                                                                                                         |

### 5. VisualCronPicker エッジケーステスト（`VisualCronPicker.test.tsx` への追加）

| #        | テスト名                                                  | 操作                                         | 期待動作                                                                      |
| -------- | --------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| VP-EX-01 | 既存クロン式の読み込み（edit mode）: daily                | `value="0 9 * * *"` でマウント               | `daily` 頻度・時=9・分=0 で初期表示                                           |
| VP-EX-02 | 既存クロン式の読み込み（edit mode）: weekly               | `value="0 9 * * 1,3,5"` でマウント           | `weekly` + 月水金選択・時=9 で初期表示                                        |
| VP-EX-03 | 既存クロン式の読み込み（edit mode）: custom（パース不可） | `value="0 */6 * * *"` でマウント             | `custom` 頻度・AdvancedToggle が有効で初期表示                                |
| VP-EX-04 | 頻度切り替え時の state reset: weekly → daily              | `weekly` で月水金選択後に `daily` に切り替え | WeekdaySelector が非表示になり、onChange のクロン式が daily 形式に変わること  |
| VP-EX-05 | 頻度切り替え時の state reset: daily → monthly             | `daily` から `monthly` に切り替え            | DayOfMonthSelector が表示され、onChange のクロン式が monthly 形式に変わること |
| VP-EX-06 | 頻度切り替え時の state reset: every-minute → daily        | `every-minute` から `daily` に切り替え       | TimePickerSection が再表示されること                                          |

### 6. ConversationRoundStep 追加テスト（`ConversationRoundStep.test.tsx` への追加）

| #         | テスト名                                                   | 操作                                   | 期待動作                           |
| --------- | ---------------------------------------------------------- | -------------------------------------- | ---------------------------------- |
| CSW-EX-01 | 無効 timezone 初期値を持つ scheduleConfig の表示           | invalid timezone を持つ answers で描画 | timezone エラーが表示される        |
| CSW-EX-02 | cronExpression が空白のみのときのエラー                    | `cronExpression="   "`                 | cron エラーが表示される            |
| CSW-EX-03 | valid timezone へ切り替えるとエラーが消える                | timezone を `Asia/Tokyo` に変更        | エラー表示が消える                 |
| CSW-EX-04 | 定期実行から他選択肢へ切り替えると scheduleConfig が消える | 手動実行へ変更                         | scheduleConfig が undefined になる |

### 7. アクセシビリティテスト

**対象ファイル**: `apps/desktop/src/__tests__/components/schedule/accessibility.test.tsx`（新規追加）

| #       | テスト名                                                          | 対象コンポーネント  | 確認内容                                                |
| ------- | ----------------------------------------------------------------- | ------------------- | ------------------------------------------------------- |
| A11Y-01 | WeekdaySelector: キーボード（Tab）でフォーカスが移動できる        | `WeekdaySelector`   | Tab キーで各曜日ボタンにフォーカスが順番に移動すること  |
| A11Y-02 | WeekdaySelector: Enter キーで選択できる                           | `WeekdaySelector`   | フォーカス中に Enter を押すと `onChange` が呼ばれること |
| A11Y-03 | WeekdaySelector: Space キーで選択できる                           | `WeekdaySelector`   | フォーカス中に Space を押すと `onChange` が呼ばれること |
| A11Y-04 | WeekdaySelector: 各ボタンに aria-label が設定されている           | `WeekdaySelector`   | `aria-label="月曜日"` 等が全7ボタンに存在すること       |
| A11Y-05 | FrequencySelector: 各オプションに role または aria-label がある   | `FrequencySelector` | ボタンが `role="button"` かつ識別可能なラベルを持つこと |
| A11Y-06 | VisualCronPicker: フォームフィールドに label が関連付けられている | `VisualCronPicker`  | `htmlFor` / `aria-labelledby` が設定されていること      |
| A11Y-07 | TimePickerSection: select 要素に aria-label がある                | `TimePickerSection` | `aria-label="時"` / `aria-label="分"` が存在すること    |

## 回帰テスト計画

既存のスケジュール機能（TASK-9G 実装済み）に影響がないことを確認する。

### 対象: 既存スケジュール機能テスト（変更なしファイル）

| テスト対象            | テストファイル | 確認内容                                            |
| --------------------- | -------------- | --------------------------------------------------- |
| `ScheduleStore`       | 既存テスト     | Phase 5 実装後も全件 PASS であること                |
| `SkillScheduler`      | 既存テスト     | Phase 5 実装後も全件 PASS であること                |
| IPC チャンネル（5件） | 既存テスト     | Phase 5 実装後も全件 PASS であること                |
| `ScheduleDialog`      | 既存テスト     | `VisualCronPicker` 差し替え後も全件 PASS であること |

### 回帰テスト実行コマンド

```bash
# 既存スケジュール関連テスト（全件 PASS であること）
pnpm --filter @repo/desktop vitest run src/__tests__/store/ScheduleStore.test.ts
pnpm --filter @repo/desktop vitest run src/__tests__/scheduler/SkillScheduler.test.ts
pnpm --filter @repo/desktop vitest run src/__tests__/ipc/scheduleIpc.test.ts

# UI 回帰テスト（ScheduleDialog が正常動作すること）
pnpm --filter @repo/desktop vitest run src/__tests__/components/schedule/ScheduleDialog.test.tsx
```

### 後方互換性確認

| 確認項目                   | 手順                                                     | 期待結果                       |
| -------------------------- | -------------------------------------------------------- | ------------------------------ |
| 既存クロン式文字列のロード | 保存済みの `cronExpression` を `VisualCronPicker` に渡す | エラーなく表示・編集できること |
| IPC 呼び出しの引数変化なし | `scheduleIntegration.test.tsx` の SI-01〜SI-05           | 引き続き全件 PASS であること   |
| プリセット機能の維持       | `ScheduleManager` のプリセット選択                       | 従来通り動作すること           |

## 追加テストの TDD 観点

Phase 6 では、Phase 4/5 を経て実装済みの状態でテストを追加する。追加テストは以下の観点で設計する。

| 観点             | 内容                                                      |
| ---------------- | --------------------------------------------------------- |
| Fail Path        | 無効入力・エラーケースで適切に処理されるか                |
| Edge Case        | 境界値（min/max）・空配列・特殊パターンで仕様通りに動くか |
| Regression Guard | 既存機能が Phase 5 の実装変更で壊れていないか             |
| Accessibility    | WCAG 2.1 AA 準拠のキーボード操作・aria 属性               |

## 統合テスト連携

| 連携ポイント               | 確認内容                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------- |
| 既存 IPC テスト            | Phase 6 追加後も `scheduleIntegration.test.tsx` が全件 PASS であること             |
| アクセシビリティテスト環境 | `accessibility.test.tsx` が `jsdom` + `@testing-library/user-event` で動作すること |
| 回帰テスト                 | TASK-9G 既存テストが Phase 5/6 の変更で壊れていないこと                            |

## 多角的チェック観点

| 観点               | 確認内容                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Fail Path 網羅性   | cronParser の null ケースが全パターン（空文字・フィールド不足・範囲外・過多）でテストされているか |
| エッジケース完全性 | 境界値（minute=0, hour=23, dayOfMonth=31, weekdays=[]）と timezone 無効値が全てテストされているか |
| アクセシビリティ   | キーボード操作（Tab・Enter・Space）と aria-label の両方が確認されているか                         |
| 回帰テスト分離     | 新規テストが既存テストファイルを改変せず、新規ファイルで追加されているか                          |
| edit mode カバー   | 既存クロン式の全パターン（daily/weekly/custom）が読み込みテストでカバーされているか               |
| state reset        | 頻度切り替え（weekly→daily, daily→monthly, every-minute→daily）が全て確認されているか             |
| バリデーション責務 | 最後の曜日解除のバリデーションが WeekdaySelector 内か親コンポーネント内かが明確になっているか     |
| テスト独立性       | 各テストケースが他のテストの状態に依存しない独立したテストになっているか                          |

## 成果物

| 成果物                                   | パス                                                                               | 説明                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 本仕様書                                 | `phase-06-test-extension.md`                                                       | テスト拡充フェーズ仕様書                                   |
| scheduleConfigValidator エッジケース追加 | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`（追加）         | cron/timezone エッジケーステスト（8件追加）                |
| cronConverter エッジケース追加           | `apps/desktop/src/__tests__/utils/cronConverter.test.ts`（追加）                   | 境界値・空配列・重複値テスト（7件追加）                    |
| cronParser エッジケース追加              | `apps/desktop/src/__tests__/utils/cronParser.test.ts`（追加）                      | 無効式・custom フォールバックテスト（8件追加）             |
| WeekdaySelector エッジケース追加         | `apps/desktop/src/__tests__/components/schedule/WeekdaySelector.test.tsx`（追加）  | 全選択・全解除・バリデーション・state追従テスト（4件追加） |
| VisualCronPicker エッジケース追加        | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.test.tsx`（追加） | edit mode・頻度切り替えテスト（6件追加）                   |
| アクセシビリティテスト                   | `apps/desktop/src/__tests__/components/schedule/accessibility.test.tsx`（新規）    | キーボード操作・aria-label テスト（7件）                   |

## 完了条件

- [ ] cronConverter テストに 7件以上のエッジケースが追加されていること
- [ ] scheduleConfigValidator テストに cron/timezone のエッジケースが追加されていること
- [ ] cronParser テストに 8件以上のエッジケースが追加されていること（無効式 null・custom フォールバックを含む）
- [ ] WeekdaySelector テストに全選択・全解除・最後の1件解除のテストが追加されていること
- [ ] VisualCronPicker テストに edit mode（daily/weekly/custom）・頻度切り替えテストが追加されていること
- [ ] `accessibility.test.tsx` が新規作成されキーボード操作・aria-label テストが含まれていること
- [ ] Phase 6 追加テストが全件 PASS（Green）であること
- [ ] 既存 TASK-9G スケジュール関連テストが引き続き全件 PASS であること（回帰テスト確認済み）
- [ ] `artifacts.json` の Phase 6 ステータスを `"completed"` に更新

## 次のPhase

[Phase 7: コードレビューゲート →](./phase-07-code-review.md)
