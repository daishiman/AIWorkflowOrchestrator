# Phase 5: 実装（GREEN）

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 5                                       |
| 機能名 | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| 作成日 | 2026-04-13                              |

## 目的

TDD の GREEN 段階として、Phase 4 で RED 確認したテストを PASS させる最小限の実装を行う。
`VisualCronPicker` コンポーネントに以下を追加する:

- `onValidationChange?: (isValid: boolean) => void` プロップ
- `monthlyError` フラグ（`weeklyError` と同様のパターン）
- `useEffect` による `isFormValid` 変化の通知

> **TDD パターンの明確化**:
> Phase 4 で RED 確認済みのテストを GREEN に変えることのみに集中する。
> 過剰な実装（テスト対象外の機能追加）は行わない。

---

## 実行タスク

### 新規作成・修正ファイルパス一覧

| 種別 | ファイルパス                                                         | 内容                                                  |
| ---- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` | プロップ追加・monthlyError フラグ追加・useEffect 追加 |

> **注意**: コード成果物は `outputs/` 配下ではなく、上記の実際のファイルパスに直接配置する。

---

## 参照資料

| 資料名                      | パス                                                                                                   | 説明                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------- |
| Phase 4 テストコード        | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`                  | GREEN にすべきテスト群       |
| Phase 4 RED 確認結果        | `outputs/phase-4/red-confirmation.md`                                                                  | 失敗しているテストの詳細     |
| VisualCronPicker 現状実装   | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                                   | 修正対象ファイル             |
| Phase 2 設計                | `phase-2-design.md`                                                                                    | 設計仕様・インタフェース定義 |
| WEEKDAYS-GUARD Phase 5 参照 | `docs/30-workflows/completed-tasks/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001/phase-5-implementation.md` | 実装フェーズの構造参考       |

---

## 実行手順

### ステップ0: Phase 5 事前確認【必須】

```bash
# 1. Phase 4 RED 確認結果の確認（GREEN にすべきテストを把握）
cat outputs/phase-4/red-confirmation.md

# 2. 修正対象ファイルの現状把握
grep -n "interface\|Props\|weeklyError\|isFormValid\|useEffect\|onValidation" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx

# 3. weeklyError の現状実装パターン確認
grep -n -A 5 "weeklyError" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx
```

### ステップ1: `VisualCronPickerProps` への `onValidationChange` プロップ追加

`VisualCronPickerProps` インタフェースに以下を追加する:

```typescript
// 追加箇所: VisualCronPickerProps インタフェース
onValidationChange?: (isValid: boolean) => void;
```

**実装指針**:

- `weeklyError`（既存）と同様のオプショナルプロップとして定義
- `undefined` の場合は呼び出しをスキップする実装とする

### ステップ2: `monthlyError` フラグの追加

`weeklyError` の算出ロジックと同様のパターンで `monthlyError` を追加する:

```typescript
// 追加箇所: weeklyError の算出ロジック近傍
const monthlyError =
  frequency === "monthly" && (dayOfMonth < 1 || dayOfMonth > 31);
```

**実装指針**:

- `dayOfMonth` が `1` 未満または `31` 超の場合に `true`
- `frequency !== "monthly"` の場合は常に `false`
- `weeklyError` と全く同じパターンで実装し、命名規則を統一する

### ステップ3: `isFormValid` の算出ロジック更新

既存の `isFormValid` 算出に `monthlyError` を含める:

```typescript
// 修正箇所: isFormValid 算出
const isFormValid = !weeklyError && !monthlyError;
```

**実装指針**:

- 既存の `weeklyError` チェックに `&& !monthlyError` を追加するのみ
- 他の validation ロジックには触れない

### ステップ4: `useEffect` による `onValidationChange` 通知の追加

`isFormValid` の変化を `onValidationChange` コールバックで通知する `useEffect` を追加する:

```typescript
// 追加箇所: コンポーネント本体内（既存 useEffect の近傍）
useEffect(() => {
  onValidationChange?.(isFormValid);
}, [isFormValid, onValidationChange]);
```

**実装指針**:

- オプショナルチェーン（`?.`）で `onValidationChange` が `undefined` の場合は呼び出しをスキップ
- 依存配列に `isFormValid` と `onValidationChange` を含める
- 初回レンダリング時にも呼び出されること（初期状態の通知）

### ステップ5: エラーメッセージ DOM への追加

`monthlyError` が `true` のとき、エラーメッセージを DOM に表示する:

```tsx
// 追加箇所: monthly 日付入力フォームの近傍（weeklyError のエラー表示と同様のパターン）
{
  monthlyError && (
    <p role="alert" className="text-red-500 text-sm mt-1">
      日付は1〜31の範囲で入力してください
    </p>
  );
}
```

**実装指針**:

- `weeklyError` 用エラーメッセージの表示パターンと同じ JSX 構造にする
- `role="alert"` 属性を付与してアクセシビリティに対応する
- エラーメッセージ文言はテストコードの `getByText` クエリと完全一致させる

### ステップ6: GREEN 確認

```bash
# バリデーションテスト全件実行（全テストが PASS することを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.validation"
```

**期待される GREEN 状態**:

- VAL-W-01〜VAL-W-03: 全 PASS
- VAL-M-01〜VAL-M-04: 全 PASS
- VAL-CB-01: PASS

### ステップ7: 既存テスト影響確認

```bash
# 既存テスト全件実行（既存が RED に変化していないことを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 統合テスト連携

- `VisualCronPicker` は UI コンポーネントのため IPC 統合テスト不要
- 実装コードは直接 `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` に配置する
- 実装結果を `outputs/phase-5/implementation-result.md` に記録し、Phase 6 テスト拡充のインプットとする

---

## 多角的チェック観点

| 観点                   | 確認内容                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------- |
| 最小実装原則           | テストを GREEN にするための最小限の変更のみを行うこと（過剰実装をしないこと）          |
| 型安全性               | `onValidationChange?: (isValid: boolean) => void` が型エラーなく定義されていること     |
| パターン統一性         | `monthlyError` が `weeklyError` と完全に同じ命名・算出パターンであること               |
| useEffect 依存配列     | `isFormValid` と `onValidationChange` の両方が依存配列に含まれていること               |
| オプショナル安全性     | `onValidationChange` が `undefined` のとき、`?.` でクラッシュしないこと                |
| エラーメッセージ整合性 | テストコードの `getByText` クエリ文字列と DOM のエラーメッセージ文言が完全一致すること |
| アクセシビリティ       | エラーメッセージに `role="alert"` が付与されていること                                 |
| 既存テストへの影響     | 既存の `weeklyError` ロジックが変更されていないこと                                    |

---

## サブタスク管理

| ID     | タスク名                                               | ステータス |
| ------ | ------------------------------------------------------ | ---------- |
| T-05-1 | 事前確認（RED 確認結果・修正対象ファイル把握）         | 完了       |
| T-05-2 | `VisualCronPickerProps` への `onValidationChange` 追加 | 完了       |
| T-05-3 | `monthlyError` フラグの追加                            | 完了       |
| T-05-4 | `isFormValid` 算出ロジック更新                         | 完了       |
| T-05-5 | `useEffect` による `onValidationChange` 通知追加       | 完了       |
| T-05-6 | `monthlyError` エラーメッセージ DOM への追加           | 完了       |
| T-05-7 | GREEN 確認・既存テスト影響確認・型チェック             | 完了       |
| T-05-8 | 実装結果ドキュメントの記録                             | 完了       |

---

## 成果物

### ドキュメント成果物

| 成果物         | 配置先                                     | 形式     |
| -------------- | ------------------------------------------ | -------- |
| 実装結果       | `outputs/phase-5/implementation-result.md` | Markdown |
| GREEN 確認結果 | `outputs/phase-5/green-confirmation.md`    | Markdown |

### コード成果物（codeArtifacts）

| 成果物                       | 配置先                                                                           | 形式       |
| ---------------------------- | -------------------------------------------------------------------------------- | ---------- |
| VisualCronPicker（修正済み） | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`（直接修正） | TypeScript |

---

## 完了条件

- [x] 事前確認（RED 確認結果・修正対象ファイル把握）が完了していること
- [x] `VisualCronPickerProps` に `onValidationChange?: (isValid: boolean) => void` が追加されていること
- [x] `monthlyError` フラグが `weeklyError` と同様のパターンで追加されていること
- [x] `isFormValid` 算出に `monthlyError` が含まれていること
- [x] `useEffect` で `onValidationChange` が通知されていること
- [x] `monthlyError` のエラーメッセージが DOM に表示されていること
- [x] VAL-W-01〜VAL-CB-01 の全テストが GREEN（PASS）であること
- [x] 既存テストが RED に変化していないこと
- [x] 型チェックがエラーなく通過すること
- [x] `outputs/phase-5/` に全ドキュメント成果物が生成されていること

---

## タスク100%実行確認【必須】

- [x] T-05-1: 事前確認（RED 確認結果・修正対象ファイル把握）を実行済み
- [x] T-05-2: `VisualCronPickerProps` への `onValidationChange` 追加完了
- [x] T-05-3: `monthlyError` フラグ追加完了
- [x] T-05-4: `isFormValid` 算出ロジック更新完了
- [x] T-05-5: `useEffect` による通知追加完了
- [x] T-05-6: `monthlyError` エラーメッセージ DOM 追加完了
- [x] T-05-7: GREEN 確認・既存テスト影響確認・型チェック実行済み
- [x] T-05-8: `outputs/phase-5/implementation-result.md` および `outputs/phase-5/green-confirmation.md` に記録済み

---

## 次Phase

**Phase 6: テスト拡充** — GREEN を維持しながら、境界値・複合ケース・アクセシビリティ観点のテストを追加する。
`VisualCronPicker.validation.test.tsx` にテストケースを追記し、実装の堅牢性を高める。

**Phase 6 開始条件**: Phase 5 の全完了条件を満たし、VAL-W-01〜VAL-CB-01 が全て GREEN であること。
