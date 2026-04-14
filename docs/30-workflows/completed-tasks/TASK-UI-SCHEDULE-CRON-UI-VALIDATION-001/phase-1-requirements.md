# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 1                                       |
| 機能名 | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| 作成日 | 2026-04-13                              |

## 目的

`VisualCronPicker` コンポーネントに `onValidationChange` プロップを追加し、
weekly + 空曜日、および monthly + 無効 dayOfMonth（範囲外）の2パターンでバリデーション状態を
親コンポーネントへ通知できるようにする。
修正範囲・受入基準・依存関係を確定する。

---

## Step 0: P50チェック【必須】

Phase 1 開始前に、対象ファイルの実装状態を確認し、既実装コードとの重複・齟齬を防止する。

```bash
# value / onChange / weeklyError / isAdvancedMode / directInput / onValidationChange / monthlyError / isFormValid の現状確認
grep -n "value\|onChange\|weeklyError\|isAdvancedMode\|directInput\|showAdvancedToggle\|onValidationChange\|monthlyError\|isFormValid" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx

# dayOfMonth / DayOfMonthSelector の使用箇所確認
grep -n "dayOfMonth\|DayOfMonthSelector" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx
```

**確認事項**:

- [x] `VisualCronPicker.tsx` に `onValidationChange` プロップが未定義であること（追加対象）
- [x] `VisualCronPicker.tsx` が `value` ベースの制御コンポーネントであること
- [x] `weeklyError` フラグが既存実装されていること（通知処理のみ追加）
- [x] `monthlyError` フラグが未実装であること（新規追加対象）
- [x] `isFormValid` 状態が未実装であること（新規追加対象）
- [x] `DayOfMonthSelector` コンポーネントが `dayOfMonth` を扱っていること

---

## 実行タスク

- **タスク1**: P50チェック — 対象ファイルの現状実装状態を確認
- **タスク2**: `weeklyError` 既存実装の確認・onValidationChange 通知の要件定義
- **タスク3**: `monthlyError` の新規追加要件定義（判定条件・エラーメッセージ）
- **タスク4**: 受入基準（AC-1〜AC-10）の定義
- **タスク5**: `isFormValid` 状態設計とスコープ確定

---

## 参照資料

| 資料名                                        | パス                                                                                           | 説明                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| VisualCronPicker 実装                         | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                           | 修正対象コンポーネント                         |
| DayOfMonthSelector 実装                       | `apps/desktop/src/renderer/components/schedule/DayOfMonthSelector.tsx`                         | monthlyError 影響範囲の確認対象                |
| VisualCronPicker バリデーションテスト         | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`          | テスト追加対象                                 |
| TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 設計 | `docs/30-workflows/completed-tasks/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001/phase-2-design.md` | weeklyError 既存実装の参照先                   |
| TASK-UI-SCHEDULE-CRON-SEMANTIC-001 Phase 1    | `docs/30-workflows/completed-tasks/TASK-UI-SCHEDULE-CRON-SEMANTIC-001/phase-1-requirements.md` | 関連タスク（意味論的バリデーション）の要件参照 |

---

## 実行手順

### ステップ1: 問題の現状確認

```bash
# 1. VisualCronPicker コンポーネント全体の確認
cat apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx

# 2. DayOfMonthSelector コンポーネントの確認
cat apps/desktop/src/renderer/components/schedule/DayOfMonthSelector.tsx

# 3. 既存テストファイルの確認（存在する場合）
ls apps/desktop/src/__tests__/components/schedule/
```

**確認すべき事実**:

- `VisualCronPicker` が `value?: string` と `onChange: (cron: string) => void` を持つ制御コンポーネントであること
- `VisualCronPickerProps` インターフェースに `onValidationChange` が未定義であること
- `weeklyError` フラグが weekly + 空曜日のとき `true` になること（既存実装）
- `weeklyError` が `true` のとき `role="alert"` を持つエラーメッセージが表示されること（既存実装）
- `monthly` ケースで `dayOfMonth` の範囲チェックが未実装であること

### ステップ2: 問題の根本原因分析

**現状の課題**:

```
課題1: onValidationChange プロップが存在しない
  → 親コンポーネントがバリデーション状態を受け取れない
  → フォームの送信ボタン等の制御ができない

課題2: monthlyError フラグが未実装
  → dayOfMonth が 0 以下または 32 以上の場合にエラー表示がない
  → 無効な月次スケジュールが保存される可能性がある
```

**根本原因**: バリデーション状態の親コンポーネントへの通知機能が未設計であること、
および monthly ケースの dayOfMonth 範囲チェックが未実装であること。

### ステップ3: 受入基準の確定

以下の受入基準を確定し、成果物として `outputs/phase-1/acceptance-criteria.md` に記録する。

**受入基準（AC-1〜AC-10）**:

| AC番号 | 基準                                                                  | 検証方法              |
| ------ | --------------------------------------------------------------------- | --------------------- |
| AC-1   | weekly + 空曜日で `role="alert"` を持つエラーメッセージが表示される   | テスト PASS           |
| AC-2   | weekly + 空曜日で `onValidationChange(false)` が呼ばれる              | テスト PASS           |
| AC-3   | weekly + 曜日選択時に `onValidationChange(true)` が呼ばれる           | テスト PASS           |
| AC-4   | monthly + `dayOfMonth < 1` でエラーメッセージが表示される             | テスト PASS           |
| AC-5   | monthly + `dayOfMonth > 31` でエラーメッセージが表示される            | テスト PASS           |
| AC-6   | monthly + 無効日付（範囲外）で `onValidationChange(false)` が呼ばれる | テスト PASS           |
| AC-7   | monthly + 有効な日付（1〜31）で `onValidationChange(true)` が呼ばれる | テスト PASS           |
| AC-8   | `onValidationChange` が `undefined` の場合にもエラーなく動作する      | テスト PASS           |
| AC-9   | `pnpm --filter @repo/desktop test` が全件 PASS であること             | `pnpm test` PASS      |
| AC-10  | TypeScript 型チェックが PASS であること                               | `pnpm typecheck` PASS |

### ステップ4: スコープ確定

**変更ファイル（コード）**:

| ファイル                                                             | 変更種別 | 変更内容                                                                                       |
| -------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` | 修正     | `onValidationChange` プロップ追加、`monthlyError` フラグ追加、`isFormValid` 状態と通知処理追加 |

**変更ファイル（テスト）**:

| ファイル                                                                              | 変更種別 | 変更内容                                              |
| ------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` | 新規     | AC-1〜AC-8 に対応するテストケース（TC-01〜TC-08）追加 |

**スコープ外（変更しない）**:

- `DayOfMonthSelector.tsx` — 責務分担を確認し、バリデーション判定は `VisualCronPicker.tsx` 側で行う
- `cronConverter.ts` — 本タスクはUIバリデーション専用。cron式変換ロジックは変更しない
- IPC 関連ファイル — UI コンポーネントのみの修正のため影響なし
- `VisualCronPickerProps` 以外の型定義ファイル

### ステップ5: アプローチ比較

| アプローチ | 内容                                                                    | メリット                                           | デメリット                                                 |
| ---------- | ----------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| 採用方針   | `useEffect` で `isFormValid` の変化を監視し `onValidationChange` を呼ぶ | レンダリング後に確実に通知。React のパターンに準拠 | useEffect のタイミングで1サイクル遅延する可能性がある      |
| 不採用案1  | イベントハンドラ内で直接 `onValidationChange` を呼ぶ                    | タイミングが即時                                   | 状態更新とコールバック呼び出しが分散し保守性が下がる       |
| 不採用案2  | `DayOfMonthSelector` 内でバリデーションし親へ通知                       | 責務がコンポーネントに局所化される                 | `isFormValid` の集約が `VisualCronPicker` からできなくなる |

**Phase 2 で設計を詳細化する**（Phase 1 では採用方針を固定し、理由を記録する）。

---

## 統合テスト連携

- `VisualCronPicker` は UI コンポーネントのため、IPC 連携なし
- `isFormValid` 状態（weeklyError + monthlyError の合成）の契約を Phase 2 設計に引き継ぐ
- テストシナリオ（TC-01〜TC-08）を Phase 4 テスト作成に引き継ぐ

---

## 多角的チェック観点（AIが判断）

### システム系

- **因果ループ**: weekly + 空曜日 / monthly + 無効dayOfMonth → `isFormValid = false` → `onValidationChange(false)` → 親コンポーネントが送信ボタンを無効化
- **責務境界**: バリデーション判定は `VisualCronPicker` が所有。`DayOfMonthSelector` は値入力UIのみに専念
- **状態所有権**: `weeklyError`・`monthlyError`・`isFormValid` の3状態は `VisualCronPicker` が所有。親コンポーネントには通知のみ

### 価値・コスト系

- **価値**: 親コンポーネントがバリデーション状態を受け取れるようになり、不正な設定の保存を防止できる
- **コスト**: 変更ファイル数は最小（1コード + 1テスト）。既存 weeklyError 実装を活用するため差分が小さい
- **トレードオフ**: `onValidationChange` を Optional にすることで後方互換性を確保するが、呼び出し元が通知を受け取らない場合のサイレントエラーリスクがある

### 問題解決系

- **優先順位**: AC-2/AC-6（onValidationChange 通知）が機能要件として最重要。AC-8（undefined 安全）は品質要件
- **リスク**: `isFormValid` の初期値設定が誤ると、AC-7 の通知タイミングがずれる可能性がある。Phase 2 で初期値を明示する

---

## サブタスク管理

| ID     | タスク名                                 | 担当 | ステータス |
| ------ | ---------------------------------------- | ---- | ---------- |
| T-01-1 | P50チェック                              | -    | 完了       |
| T-01-2 | weeklyError 既存実装の確認と通知要件定義 | -    | 完了       |
| T-01-3 | monthlyError 新規追加要件の定義          | -    | 完了       |
| T-01-4 | 受入基準定義（AC-1〜AC-10）              | -    | 完了       |
| T-01-5 | isFormValid 設計方針とスコープ確定       | -    | 完了       |

---

## 成果物

| 成果物               | 配置先                                   | 形式     |
| -------------------- | ---------------------------------------- | -------- |
| 受入基準ドキュメント | `outputs/phase-1/acceptance-criteria.md` | Markdown |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`    | Markdown |
| スコープ定義書       | `outputs/phase-1/scope-definition.md`    | Markdown |

---

## 完了条件

- [x] P50チェックを実行し、対象ファイルの現状実装状態が確認済みであること
- [x] `VisualCronPicker.tsx` に `onValidationChange` プロップが未定義であることを確認済みであること
- [x] `weeklyError` フラグが既存実装されていることを確認済みであること
- [x] `monthlyError` フラグが未実装であることを確認済みであること
- [x] 受入基準 AC-1〜AC-10 が全て定義・文書化されていること
- [x] 変更対象ファイル一覧（コード1種 + テスト1種）が確定していること
- [x] `outputs/phase-1/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認して記録すること:

- [x] T-01-1: P50チェック実行済み
- [x] T-01-2: weeklyError 既存実装の確認と通知要件を `outputs/phase-1/p50-check-result.md` に記録済み
- [x] T-01-3: monthlyError 新規追加要件を `outputs/phase-1/scope-definition.md` に記録済み
- [x] T-01-4: 受入基準 AC-1〜AC-10 を `outputs/phase-1/acceptance-criteria.md` に記録済み
- [x] T-01-5: isFormValid 設計方針を `outputs/phase-1/scope-definition.md` に記録済み

---

## 次Phase

**Phase 2: 設計** — `onValidationChange` プロップ追加・`monthlyError` フラグ・`isFormValid` 状態の詳細設計を行い、
`VisualCronPicker.tsx` の変更前/後の差分を設計する。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。
