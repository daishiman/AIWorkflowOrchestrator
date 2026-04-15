# Phase 5: 実装（TDD GREEN）

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| Phase名    | 実装（TDD GREEN）               |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001 |
| 前提Phase  | Phase 4: テスト作成（TDD RED）  |
| 次Phase    | Phase 6: テスト拡充             |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

## 目的

`VisualCronPicker.tsx` に direct input モードのバリデーション機能を実装し、
Phase 4 で作成した CV-01〜CV-12 の全テストケースが PASS すること（TDD GREEN）を確認する。

## 実行タスク

- Task 1: 既存テスト回帰確認（baseline確認）
- Task 2: `validateCronSyntax()` 関数の実装
- Task 3: `validateCronDayOfMonth()` 関数の実装
- Task 4: `directInputError` フラグの追加と `isFormValid` への組み込み
- Task 5: `role="alert"` エラーメッセージの表示実装
- Task 6: `onValidationChange` コールバックの統合
- Task 7: Green確認 — 全テストケースがPASSすることを確認
- Task 8: 型チェック・lint確認

## 参照資料

| 資料名               | パス                                                                                        | 用途                   |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 2 設計書       | `outputs/phase-2/design.md`                                                                 | バリデーション仕様参照 |
| Phase 4 テスト       | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` | テストケース参照       |
| VisualCronPicker.tsx | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                        | 実装先ファイル         |

## 実行手順

### 0. 既存テスト回帰確認（baseline確認）【必須】

```bash
# 変更前の既存テストを実行してbaseline確認
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.validation"
# 期待: 既存テストが全PASS
```

### 1. 実装ファイルリスト

| 操作 | ファイルパス                                                         | 変更内容                                            |
| ---- | -------------------------------------------------------------------- | --------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` | バリデーション関数追加・エラー表示・isFormValid統合 |

### 2. バリデーション関数の実装

`VisualCronPicker.tsx` に以下の関数を追加:

```typescript
/**
 * cron式の構文バリデーション（フィールド数チェック）。
 * 空文字やフィールド数が5でない場合は false を返す。
 */
function validateCronSyntax(expression: string): boolean {
  const trimmed = expression.trim();
  if (!trimmed) return false;
  const fields = trimmed.split(/\s+/);
  return fields.length === 5;
}

/**
 * cron式のday-of-month範囲バリデーション。
 * day-of-monthフィールドが数値の場合、1〜31の範囲内であることを検証する。
 * `*`、`*/2`、`1-15` 等の非純粋数値パターンはバリデーション対象外（trueを返す）。
 */
function validateCronDayOfMonth(expression: string): boolean {
  const fields = expression.trim().split(/\s+/);
  if (fields.length < 3) return false;
  const dom = fields[2];
  // 純粋な数値以外（*、*/2、1-15、1,15 等）はバリデーション対象外
  if (!/^\d+$/.test(dom)) return true;
  const num = parseInt(dom, 10);
  return num >= 1 && num <= 31;
}
```

### 3. directInputError フラグの追加

コンポーネント内の `isAdvancedMode` 状態と連携し、direct input モードでのみエラー文字列を生成する:

```typescript
const directInputErrorMessage = isAdvancedMode
  ? getDirectInputErrorMessage(directInput)
  : "";
const directInputError = directInputErrorMessage !== "";

// 既存の isFormValid に組み込み
const isFormValid = !weeklyError && !monthlyError && !directInputError;
```

### 4. role="alert" エラーメッセージ表示

direct input モードでバリデーションエラー発生時に `role="alert"` でエラーを表示:

```tsx
{
  directInputError && (
    <p
      id="direct-input-error"
      role="alert"
      className="text-sm text-red-500 mt-1"
    >
      {directInputErrorMessage}
    </p>
  );
}
```

### 5. onValidationChange コールバックの統合

`isFormValid` の変更を `onValidationChange` に通知:

```typescript
useEffect(() => {
  onValidationChange?.(isFormValid);
}, [isFormValid, onValidationChange]);
```

### 6. Green確認コマンド

```bash
# テスト実行（CV-01〜CV-12が全PASSすること）
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.customValidation"

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

### 7. 既存テスト回帰確認（実装後）

```bash
# 全テスト実行（既存テストへの悪影響なし確認）
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"
```

## 統合テスト連携

| 判定項目           | 基準    | 結果    |
| ------------------ | ------- | ------- |
| CV-01〜CV-12全PASS | PASS    | pending |
| 既存テスト回帰なし | 全PASS  | pending |
| 型チェック         | PASS    | pending |
| lint               | 0 error | pending |

## 多角的チェック観点

| チェック観点           | 確認内容                                                           | 結果    |
| ---------------------- | ------------------------------------------------------------------ | ------- |
| バリデーション正確性   | validateCronSyntax / validateCronDayOfMonth が仕様通りに動作するか | pending |
| エラーメッセージ表示   | role="alert" が正しく付与されているか                              | pending |
| onValidationChange連携 | isFormValid 変更時に正しくコールバックが呼ばれるか                 | pending |
| モード切替時の再計算   | isAdvancedMode 切替時にバリデーション状態が再計算されるか          | pending |
| undefined安全性        | onValidationChange が undefined の場合にエラーが発生しないか       | pending |
| 既存機能への影響       | weeklyError / monthlyError の既存バリデーションに影響しないか      | pending |

## 成果物

| 成果物     | パス                                                                 | 説明                                            |
| ---------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| 実装コード | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` | バリデーション関数・エラー表示・isFormValid統合 |
| 実装記録   | `outputs/phase-5/implementation-record.md`                           | GREEN確認証跡・型チェック結果・lint結果         |

## 完了条件

- [ ] 既存テスト回帰確認（baseline）実施済み
- [ ] `validateCronSyntax()` 関数が実装済み
- [ ] `validateCronDayOfMonth()` 関数が実装済み
- [ ] `directInputError` フラグが `isFormValid` に組み込み済み
- [ ] `role="alert"` エラーメッセージが条件付き表示されている
- [ ] `onValidationChange` コールバックが `useEffect` で統合されている
- [ ] CV-01〜CV-12が全PASS（Green確認）
- [ ] 既存テスト（VisualCronPicker.validation.test.tsx）への悪影響なし
- [ ] 型チェック（`pnpm typecheck`）がPASS
- [ ] lint がエラーなし
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
