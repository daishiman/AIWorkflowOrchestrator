# Phase 2: 設計

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 2                                       |
| 機能名 | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| 作成日 | 2026-04-13                              |

## 目的

`VisualCronPickerProps` への `onValidationChange` プロップ追加、
`monthlyError` フラグの新規追加、および `isFormValid` 状態の計算ロジックを設計する。
`useEffect` を使った onValidationChange 通知パターンを確定し、
`VisualCronPicker.tsx` の変更前/後の差分を設計する。

---

## 実行タスク

- **タスク1**: `VisualCronPickerProps` への `onValidationChange` プロップ追加設計
- **タスク2**: `monthlyError` 判定条件の設計（value から生成した内部 config.dayOfMonth < 1 || config.dayOfMonth > 31）
- **タスク3**: `isFormValid` 状態計算ロジックの設計（weeklyError + monthlyError の合成）
- **タスク4**: `useEffect` による `onValidationChange` 通知パターンの設計
- **タスク5**: `DayOfMonthSelector` の現状確認と責務分担の明確化

---

## 参照資料

| 資料名                                | パス                                                                                  | 説明                       |
| ------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 受入基準                      | `outputs/phase-1/acceptance-criteria.md`                                              | AC-1〜AC-10                |
| Phase 1 スコープ定義                  | `outputs/phase-1/scope-definition.md`                                                 | isFormValid 設計方針の確認 |
| VisualCronPicker 実装                 | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                  | 修正対象コンポーネント     |
| DayOfMonthSelector 実装               | `apps/desktop/src/renderer/components/schedule/DayOfMonthSelector.tsx`                | 責務分担の確認対象         |
| VisualCronPicker バリデーションテスト | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` | テスト追加対象             |

---

## 実行手順（設計内容）

### ステップ1: `onValidationChange` プロップ設計

**型定義の変更前/後**:

変更前（現状）:

```typescript
interface VisualCronPickerProps {
  value?: string;
  onChange: (cron: string) => void;
  disabled?: boolean;
  showAdvancedToggle?: boolean;
  className?: string;
  // onValidationChange は存在しない
}
```

変更後（採用方針）:

```typescript
interface VisualCronPickerProps {
  value?: string;
  onChange: (cron: string) => void;
  disabled?: boolean;
  showAdvancedToggle?: boolean;
  className?: string;
  /** バリデーション状態が変化したときに呼ばれるコールバック（省略可能） */
  onValidationChange?: (isValid: boolean) => void;
}
```

**設計根拠**:

- `onValidationChange` を Optional（`?`）にすることで、既存の呼び出し元を一切変更せず後方互換性を維持する
- コールバック型は `(isValid: boolean) => void` の最小インターフェースとし、将来の拡張（エラー詳細の伝達）は別 Issue で対応する

### ステップ2: `monthlyError` 判定条件設計

**判定条件**:

```typescript
const monthlyError =
  config.frequency === "monthly" &&
  (config.dayOfMonth < 1 || config.dayOfMonth > 31);
```

**エラーメッセージ**:

```tsx
{
  monthlyError && (
    <p role="alert" className="text-red-500 text-sm mt-1">
      日付は1〜31の範囲で入力してください
    </p>
  );
}
```

**設計根拠**:

- 判定条件は `< 1 || > 31` とし、0以下および32以上を無効とする
- `frequency !== "monthly"` のときは `monthlyError` は必ず `false`（AC-9 の全テスト PASS に影響しない）
- DayOfMonthSelector が UI 側で入力範囲を制限している場合でも、VisualCronPicker がガードとして独立して判定する

### ステップ3: `isFormValid` 状態計算ロジック設計

**isFormValid の計算**:

```typescript
const isFormValid = !weeklyError && !monthlyError;
```

**設計根拠**:

- `weeklyError` と `monthlyError` は排他的（weekly と monthly は同時に true にならない）だが、
  `isFormValid` は両フラグの否定 AND で表現することで将来のバリデーション追加にも対応できる
- `daily` / `every-hour` / `custom` 等の他の frequency では `weeklyError = false` かつ `monthlyError = false` となるため、
  `isFormValid = true` が確実に通知される

### ステップ4: `useEffect` による通知パターン設計

**変更後（採用方針）**:

```typescript
useEffect(() => {
  onValidationChange?.(isFormValid);
}, [isFormValid, onValidationChange]);
```

**設計根拠**:

| 設計判断項目                   | 選択                                | 理由                                                                        |
| ------------------------------ | ----------------------------------- | --------------------------------------------------------------------------- |
| 通知タイミング                 | `useEffect`（レンダリング後）       | React のパターンに準拠。状態と通知が一貫して扱われる                        |
| 依存配列                       | `[isFormValid, onValidationChange]` | `isFormValid` が変化したときのみ通知。`onValidationChange` の参照変化も追跡 |
| Optional チェーン              | `onValidationChange?.()` を使用     | `undefined` 時の呼び出しによるランタイムエラーを防ぐ（AC-8 対応）           |
| イベントハンドラ内での呼び出し | 不採用                              | 状態更新とコールバック呼び出しが分散し保守性が低下するため                  |

### ステップ5: `DayOfMonthSelector` の現状確認と責務分担

**責務分担の設計方針**:

| コンポーネント       | 責務                                                             |
| -------------------- | ---------------------------------------------------------------- |
| `DayOfMonthSelector` | `dayOfMonth` の入力 UI 提供（値の変更を親に通知するのみ）        |
| `VisualCronPicker`   | `dayOfMonth` の範囲チェック（`monthlyError` フラグを保有・管理） |

**根拠**: バリデーション状態の集約点を `VisualCronPicker` に統一することで、
`isFormValid` の計算と `onValidationChange` 通知が単一コンポーネント内で完結する。
`DayOfMonthSelector` 内でバリデーションを行うと、状態の所有権が分散し `isFormValid` の集約が困難になる。

---

## 変更ファイル一覧テーブル（Before/After）

| ファイル                                                                              | 変更種別 | Before                                                                     | After                                                                                           |
| ------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                  | 修正     | `onValidationChange` プロップなし、`monthlyError` なし、`isFormValid` なし | `onValidationChange?` プロップ追加、`monthlyError` フラグ追加、`isFormValid` + `useEffect` 追加 |
| `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` | 新規     | ファイル未存在                                                             | AC-1〜AC-8 対応の TC-01〜TC-08 を追加                                                           |

**IPC 関連**: なし（UI コンポーネントのみの変更。IPC ハンドラへの影響なし）

---

## 設計判断記録

| 決定事項                       | 選択                                          | 理由                                                           |
| ------------------------------ | --------------------------------------------- | -------------------------------------------------------------- |
| onValidationChange の必須/任意 | Optional（`?`）                               | 後方互換性の確保。既存の呼び出し元を変更しない                 |
| monthlyError の判定場所        | `VisualCronPicker.tsx` 内                     | バリデーション状態の集約。DayOfMonthSelector は UI に専念      |
| isFormValid の計算式           | `!weeklyError && !monthlyError`               | 両エラーフラグの否定 AND。将来のバリデーション追加に対応できる |
| 通知タイミング                 | `useEffect`（`isFormValid` 変化後）           | React の推奨パターン。状態と通知の一貫性を確保                 |
| undefined 安全対策             | Optional チェーン（`onValidationChange?.()`） | AC-8 対応。ランタイムエラーを防ぐ最小コスト実装                |
| DayOfMonthSelector の変更      | なし                                          | 責務分担の明確化。バリデーションは VisualCronPicker が所有     |

---

## 統合テスト連携

- `VisualCronPicker` は UI コンポーネントのため、IPC 統合テスト不要（単体テストのみ）
- `isFormValid` 計算式（`!weeklyError && !monthlyError`）の契約を Phase 4 テスト作成に引き継ぐ
- テストシナリオ（TC-01〜TC-08）を Phase 4 テスト作成に引き継ぐ

---

## 多角的チェック観点（AIが判断）

### コンポーネント設計原則

- `onValidationChange` は制御の逆転（IoC）パターン。親が通知を受け取るかどうかを選択できる
- `isFormValid` は派生状態（`weeklyError` と `monthlyError` から導出）であり、`useState` ではなく直接計算するアプローチも検討できるが、`useEffect` での通知のために状態として保持する設計を採用

### 後方互換性の確認

- `onValidationChange` を Optional にすることで、既存の `<VisualCronPicker value={...} onChange={...} />` の呼び出しは全て変更不要
- `monthlyError` の追加により `monthly` ケースの既存動作に変化はない（エラー表示が追加されるのみ）

### concern 数による設計書分割基準

本タスクは 2 concerns（`onValidationChange` 追加 + `monthlyError` 追加）だが、
同一コンポーネント内の変更として密結合しているため、単一 `phase-2-design.md` に全記述（分割不要）

---

## サブタスク管理

| ID     | タスク名                                         | ステータス |
| ------ | ------------------------------------------------ | ---------- |
| T-02-1 | onValidationChange プロップ追加設計              | 完了       |
| T-02-2 | monthlyError 判定条件設計                        | 完了       |
| T-02-3 | isFormValid 状態計算ロジック設計                 | 完了       |
| T-02-4 | useEffect による onValidationChange 通知パターン | 完了       |
| T-02-5 | DayOfMonthSelector の責務分担確認と記録          | 完了       |

---

## 成果物

| 成果物                 | 配置先                                 | 形式     |
| ---------------------- | -------------------------------------- | -------- |
| 設計決定記録           | `outputs/phase-2/design-decision.md`   | Markdown |
| コード変更差分イメージ | `outputs/phase-2/code-diff-preview.md` | Markdown |

---

## 完了条件

- [x] `onValidationChange` プロップの型定義（Optional・コールバック型）が確定していること
- [x] `monthlyError` の判定条件（`< 1 || > 31`）が確定していること
- [x] `isFormValid` の計算式（`!weeklyError && !monthlyError`）が確定していること
- [x] `useEffect` による通知パターンと依存配列が確定していること
- [x] `DayOfMonthSelector` の責務分担が記録されていること
- [x] 変更ファイル一覧テーブル（Before/After）が記録されていること
- [x] `outputs/phase-2/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [x] T-02-1: onValidationChange プロップ設計を `outputs/phase-2/design-decision.md` に記録済み
- [x] T-02-2: monthlyError 判定条件を記録済み
- [x] T-02-3: isFormValid 計算ロジックを記録済み
- [x] T-02-4: useEffect 通知パターンと依存配列を記録済み
- [x] T-02-5: DayOfMonthSelector 責務分担を `outputs/phase-2/design-decision.md` に記録済み
- [x] コード変更差分イメージを `outputs/phase-2/code-diff-preview.md` に記録済み

---

## 次Phase

**Phase 3: 設計レビューゲート** — `onValidationChange` の後方互換性・`useEffect` 通知タイミング・
`DayOfMonthSelector` との責務分担の整合性をレビューし、PASS/MINOR/MAJOR を判定して Phase 4 への進行可否を決定する。

**ゲート条件**: Phase 1-2 の全完了条件を満たさない場合、Phase 3 へ進まないこと。
