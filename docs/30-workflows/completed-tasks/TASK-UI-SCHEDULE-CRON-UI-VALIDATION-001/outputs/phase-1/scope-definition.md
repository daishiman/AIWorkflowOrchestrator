# Phase 1 - スコープ定義書

## 作成日

2026-04-13

## 変更対象ファイル

### コードファイル

| ファイル                                                             | 変更種別 | 変更内容                                                                                                  |
| -------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` | 修正     | `onValidationChange` プロップ追加、`monthlyError` フラグ追加、`isFormValid` 状態と useEffect 通知処理追加 |

### テストファイル

| ファイル                                                                              | 変更種別 | 変更内容                                              |
| ------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` | 新規     | AC-1〜AC-8 に対応するテストケース（TC-01〜TC-08）追加 |

## スコープ外（変更しない）

| ファイル                                     | 理由                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `DayOfMonthSelector.tsx`                     | バリデーション判定は `VisualCronPicker.tsx` 側で行う。UI 入力専用コンポーネントの責務を維持 |
| `cronConverter.ts`                           | 本タスクは UI バリデーション専用。cron 式変換ロジックは変更しない                           |
| IPC 関連ファイル                             | UI コンポーネントのみの修正のため影響なし                                                   |
| `VisualCronPickerProps` 以外の型定義ファイル | 変更スコープ外                                                                              |

## `isFormValid` 設計方針

### 採用方針

`useEffect` で `isFormValid` の変化を監視し `onValidationChange` を呼ぶ

```typescript
const isFormValid = !weeklyError && !monthlyError;

useEffect(() => {
  onValidationChange?.(isFormValid);
}, [isFormValid, onValidationChange]);
```

### 採用理由

- React のパターンに準拠（レンダリング後に確実に通知）
- 状態更新とコールバック呼び出しが一箇所に集約され保守性が高い
- `?.` でオプショナルチェーン → AC-8 の undefined 安全対策

### 不採用案

| 案                                      | 理由                                             |
| --------------------------------------- | ------------------------------------------------ |
| イベントハンドラ内で直接呼ぶ            | 状態更新とコールバック呼び出しが分散し保守性低下 |
| `DayOfMonthSelector` 内でバリデーション | `isFormValid` の集約が困難になる                 |

## `monthlyError` 判定条件

```typescript
const monthlyError =
  !isAdvancedMode &&
  config.frequency === "monthly" &&
  (config.dayOfMonth < 1 || config.dayOfMonth > 31);
```

- 判定範囲: `< 1`（0以下）または `> 31`（32以上）を無効とする
- `frequency !== "monthly"` のときは常に `false`
