# Phase 4 テスト仕様書（TDD Red フェーズ）

作成日: 2026-04-09
タスク: TASK-UI-SCHEDULE-VISUAL-PICKER-001

## 作成テストファイル一覧

| テストファイル                                                 | テスト数 | 対象モジュール          |
| -------------------------------------------------------------- | -------- | ----------------------- |
| `src/__tests__/utils/scheduleConfigValidator.test.ts`          | 17       | scheduleConfigValidator |
| `src/__tests__/utils/cronConverter.test.ts`                    | 21       | cronConverter           |
| `src/__tests__/utils/cronParser.test.ts`                       | 17       | cronParser              |
| `src/__tests__/utils/cronHumanizer.test.ts`                    | 15       | cronHumanizer           |
| `src/__tests__/components/schedule/WeekdaySelector.test.tsx`   | 8        | WeekdaySelector         |
| `src/__tests__/components/schedule/FrequencySelector.test.tsx` | 6        | FrequencySelector       |
| `src/__tests__/components/schedule/VisualCronPicker.test.tsx`  | 14       | VisualCronPicker        |
| `src/__tests__/integration/scheduleIntegration.test.tsx`       | 5        | IPC統合                 |
| 合計                                                           | **103**  | -                       |

## テスト仕様要約

### scheduleConfigValidator（SCV-01〜SCV-12 + edge cases）

- `validateCronExpression`: 5フィールド構文チェック + 値域チェック
- `validateTimezone`: `Intl.DateTimeFormat` によるIANAタイムゾーン検証
- `validateSkillWizardScheduleConfig`: 両フィールドの統合バリデーション

### cronConverter（CC-01〜CC-21）

- 全6頻度タイプ（every-minute / every-hour / daily / weekly / monthly / custom）の変換
- weekdays の昇順ソート・重複除去
- 境界値: hour=0/23, minute=0/55, dayOfMonth=1/31

### cronParser（CP-01〜CP-17）

- every-minute / every-hour / daily / weekly / monthly の逆変換
- 複雑パターン（ステップ値・範囲）は custom フォールバック
- 無効入力は null 返却

### cronHumanizer（CH-01〜CH-10 + 英語ロケール）

- ja/en 両ロケール対応
- 全頻度タイプの自然言語出力

### コンポーネントテスト（WS / FS / VP）

- aria-pressed による選択状態の確認
- fireEvent によるインタラクション（happy-dom 環境）
- aria-label によるアクセシビリティ検証

### 統合テスト（SI-01〜SI-05）

- `Object.defineProperty` による window.api モック（vi.stubGlobal 不使用）
- IPC呼び出し引数の cronExpression 検証

## P39準拠事項

- happy-dom 環境のため `userEvent` 不使用、`fireEvent` のみ使用
- `vi.stubGlobal("window", ...)` 不使用（React 内部の HTMLElement チェックを破壊するため）

## Red フェーズ確認

テストは実装ファイル作成前に全て Red（失敗）であることを確認済み。
Phase 5 で全テストが Green になることを目標とする。
