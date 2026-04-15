# Phase 2: 設計

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| Phase名    | 設計                            |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001 |
| 前提Phase  | Phase 1: 要件定義               |
| 次Phase    | Phase 3: 設計レビューゲート     |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

---

## 目的

direct input モードのバリデーション追加のための設計を確定する。バリデーション関数設計・`directInputError` フラグ設計・`isFormValid` への組み込み設計・エラーメッセージ設計の4つの設計観点を固定する。

---

## 実行タスク

### Task 1: バリデーション関数設計

renderer環境制約のため外部ライブラリ禁止。純粋な文字列操作で2つのバリデーション関数を設計する。

#### validateCronSyntax

```typescript
/**
 * cron式の構文バリデーション（空文字・フィールド数チェック）
 * @param expression - cron式文字列
 * @returns 有効なら true、無効なら false
 */
function validateCronSyntax(expression: string): boolean {
  const trimmed = expression.trim();
  if (!trimmed) return false;
  const fields = trimmed.split(/\s+/);
  return fields.length === 5;
}
```

#### validateCronDayOfMonth

```typescript
/**
 * cron式のday-of-month範囲バリデーション
 * day-of-monthフィールドが数値の場合のみ、1〜31の範囲チェックを行う。
 * 非数値（*, */2, 1-15 等）はスキップする。
 * @param expression - cron式文字列（5フィールド前提）
 * @returns 有効なら true、無効なら false
 */
function validateCronDayOfMonth(expression: string): boolean {
  const fields = expression.trim().split(/\s+/);
  if (fields.length < 3) return false;
  const dom = fields[2];
  if (!/^\d+$/.test(dom)) return true; // 非数値はスキップ
  const num = parseInt(dom, 10);
  return num >= 1 && num <= 31;
}
```

**設計判断:**

- 純粋な文字列操作のみを使用（ブラウザ安全、依存追加なし）
- `validateCronDayOfMonth` は数値の場合のみ判定し、`*`/`*/2`/`-`区間等はスキップする（AC-6対応）
- 関数はコンポーネントファイル内にプライベート関数として配置する（単一ファイル変更の原則）

### Task 2: directInputError フラグの設計

```typescript
const directInputError =
  isAdvancedMode &&
  (!validateCronSyntax(directInput) || !validateCronDayOfMonth(directInput));
```

**設計判断:**

- `isAdvancedMode` が false の場合は常に false（visual モードのバリデーションに影響しない）
- `directInput` 状態の変更に応じてリアクティブに再計算される
- 空文字・syntax不正・day-of-month範囲外の3パターンをカバーする

### Task 3: isFormValid への組み込み設計

現行:

```typescript
const isFormValid = !weeklyError && !monthlyError;
```

変更後:

```typescript
const isFormValid = !weeklyError && !monthlyError && !directInputError;
```

**設計判断:**

- `weeklyError` / `monthlyError` は `!isAdvancedMode` 条件で制御されるため、directモードでは常に false
- `directInputError` は `isAdvancedMode` 条件で制御されるため、visualモードでは常に false
- 結果として、各モードで適切なバリデーションのみが `isFormValid` に影響する

### Task 4: エラーメッセージ文言の設計

| エラー種別         | エラーメッセージ                                          | 表示条件                            |
| ------------------ | --------------------------------------------------------- | ----------------------------------- |
| 空文字             | 「cron式を入力してください」                              | directInputがトリム後空文字         |
| フィールド数不正   | 「cron式は5つのフィールドが必要です（分 時 日 月 曜日）」 | フィールド数が5でない               |
| day-of-month範囲外 | 「日の値は1〜31の範囲で指定してください」                 | day-of-monthが数値かつ1〜31の範囲外 |

**エラーメッセージ表示の設計:**

```tsx
{
  directInputError && (
    <p role="alert" className="text-sm text-red-500 mt-1">
      {getDirectInputErrorMessage(directInput)}
    </p>
  );
}
```

エラーメッセージ取得関数:

```typescript
function getDirectInputErrorMessage(expression: string): string {
  const trimmed = expression.trim();
  if (!trimmed) return "cron式を入力してください";
  const fields = trimmed.split(/\s+/);
  if (fields.length !== 5)
    return "cron式は5つのフィールドが必要です（分 時 日 月 曜日）";
  const dom = fields[2];
  if (/^\d+$/.test(dom)) {
    const num = parseInt(dom, 10);
    if (num < 1 || num > 31) return "日の値は1〜31の範囲で指定してください";
  }
  return "";
}
```

### Task 5: モード切替時のバリデーション再計算設計

visual → direct 切替時に `directInputError` が正しく計算されるようにする:

- `isAdvancedMode` が `true` に変更された時点で `directInput` の現在値に基づいてバリデーションが再計算される
- `directInputError` は computed value（`useMemo` 相当の派生状態）として設計するため、`isAdvancedMode` / `directInput` の変更に自動追従する
- `onValidationChange` への通知は `useEffect` で `isFormValid` の変更を監視して呼び出す

### Task 6: concern数と設計書構成の決定

concern数: 1（direct input モードのバリデーション追加のみ）

→ 単一の `phase-2-design.md` で設計を完結する。

---

## 参照資料

| 参照資料             | パス                                                                 | 説明                 |
| -------------------- | -------------------------------------------------------------------- | -------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                         | Phase 1 成果物       |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                             | AC-1〜AC-8           |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`                                | 既実装コード調査結果 |
| トレーサビリティ行列 | `outputs/phase-1/traceability-matrix.md`                             | Phase 1 成果物       |
| VisualCronPicker     | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` | 変更対象             |

---

## 実行手順

1. Phase 1 成果物を読み込み、要件と受け入れ基準を確認する
2. `validateCronSyntax` / `validateCronDayOfMonth` のバリデーション関数を設計する
3. `directInputError` フラグの計算ロジックを設計する
4. `isFormValid` への `directInputError` の組み込みを設計する
5. エラーメッセージ文言と表示方法（`role="alert"`）を設計する
6. モード切替時のバリデーション再計算ロジックを設計する
7. 成果物を `outputs/phase-2/` に出力する

---

## 統合テスト連携

- `validateCronSyntax` と `validateCronDayOfMonth` が連携して `directInputError` を正しく計算することを確認する
- `directInputError` が `isFormValid` に正しく組み込まれることを確認する
- `onValidationChange` が `isFormValid` の変更に応じて正しく呼ばれることを確認する
- visual モードの `weeklyError` / `monthlyError` に影響がないことを確認する
- 統合ログは `outputs/phase-2/` に保存する

---

## 多角的チェック観点

- **renderer環境制約**: 純粋な文字列操作のみで実装可能か（Node.jsモジュール禁止）
- **後方互換性**: visual モードの `weeklyError` / `monthlyError` に影響がないか
- **AC網羅性**: AC-1〜AC-8 の全てが設計でカバーされているか
- **エラーメッセージのアクセシビリティ**: `role="alert"` が正しく設定されるか
- **Optional Prop安全性**: `onValidationChange?.()` パターンが使用されるか
- **パフォーマンス**: 入力のたびにバリデーションが実行されても問題ないか

---

## 成果物

| 成果物                 | パス                                            | 説明                                        |
| ---------------------- | ----------------------------------------------- | ------------------------------------------- |
| バリデーション関数設計 | `outputs/phase-2/validation-function-design.md` | validateCronSyntax / validateCronDayOfMonth |
| directInputError設計   | `outputs/phase-2/direct-input-error-design.md`  | フラグ計算・isFormValid組み込み             |
| エラーメッセージ設計   | `outputs/phase-2/error-message-design.md`       | 種別ごとのメッセージと表示方法              |

---

## 完了条件

- [ ] `validateCronSyntax` / `validateCronDayOfMonth` の関数設計を確定した
- [ ] `directInputError` フラグの計算ロジックを設計した
- [ ] `isFormValid` への `directInputError` の組み込みを設計した
- [ ] エラーメッセージ文言（空文字/syntax不正/day-of-month範囲外）を定義した
- [ ] エラーメッセージ表示方法（`role="alert"`）を設計した
- [ ] モード切替時のバリデーション再計算ロジックを設計した
- [ ] renderer環境制約を満たす設計であることを確認した
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-CRON-CUSTOM-VALIDATION-001
```

---

## 次Phase

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
