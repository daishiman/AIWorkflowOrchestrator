# TASK-CRON-CUSTOM-VALIDATION-001: direct input / custom cron モードへの月次バリデーション追加 - タスク指示書

## メタ情報

```yaml
issue_number: 2141
```

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | TASK-CRON-CUSTOM-VALIDATION-001                               |
| タスク名     | direct input / custom cron モードへの月次バリデーション追加   |
| 分類         | 改善                                                          |
| 対象機能     | スケジュール設定 / VisualCronPicker advanced モード           |
| 優先度       | **中**                                                        |
| 見積もり規模 | 小規模                                                        |
| タスク種別   | VISUAL                                                        |
| ステータス   | 未実施                                                        |
| 発見元       | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-13                                                    |
| 依存タスク   | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001（完了済み）           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001` では `VisualCronPicker` の **visual モード**（`isAdvancedMode=false`）に対して以下のバリデーションを追加した。

- `weekly` + 空曜日 → `weeklyError` フラグ + `role="alert"` エラーメッセージ表示
- `monthly` + 無効な `dayOfMonth`（1〜31 外） → `monthlyError` フラグ + `role="alert"` エラーメッセージ表示
- `onValidationChange` コールバックによるバリデーション状態の外部通知

しかし、`VisualCronPicker` には「高度な設定」ボタンで切り替えられる **direct input モード**（`isAdvancedMode=true`）が存在する。このモードではユーザーが `<input>` フィールドにcron式を直接入力するが、**syntax バリデーションも semantic バリデーションも未実装**のままである。

現在の `handleDirectInputChange` は入力値をそのまま `onChange(val)` で親へ渡すのみで、入力されたcron式が有効かどうかの検証を一切行わない。さらに、direct input モード中は `weeklyError` / `monthlyError` フラグが `!isAdvancedMode` 条件により強制的に `false` になるため、`isFormValid` が常に `true` となり `onValidationChange(true)` が呼ばれ続ける。

### 1.2 問題点・課題

| ケース                                                                                       | 現状の挙動                                                                     | 問題                                                                                                               |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| direct input モードで構文不正なcron式を入力（例: `"* * * *"` フィールド数不足）              | `onChange("* * * *")` がそのまま呼ばれ `onValidationChange(true)` が通知される | 無効なcron式がそのまま保存される可能性がある                                                                       |
| direct input モードで月次を意味するパターンの3番目フィールドが 1〜31 外（例: `"0 9 0 * *"`） | `onChange("0 9 0 * *")` が呼ばれ `onValidationChange(true)` が通知される       | 無効な日付指定を含むcron式が保存される                                                                             |
| direct input モードで空文字を入力                                                            | `onChange("")` が呼ばれ `onValidationChange(true)` が通知される                | 空文字（無効値）でバリデーション通過と判定される                                                                   |
| visual モードから direct input モードへ切り替えた瞬間                                        | `isFormValid` が `true` にリセットされる                                       | visual モードで `false` だった状態が advanced 切替後に `true` へ変化し、呼び出し元の保存ボタンが誤って有効化される |

### 1.3 放置した場合の影響

- ユーザーが direct input モードで無効なcron式を入力したまま保存できてしまい、スケジューラーのランタイムエラーを引き起こす
- visual モードでは保存を防ぐバリデーションが機能するのに、同じコンポーネントの direct input モードでは素通しという**安全性の非対称性**が残り続ける
- `onValidationChange` コールバックを信頼して保存ボタンを制御している親コンポーネントが、direct input モード中は誤った `true` を受け取り保存ボタンを活性化してしまう
- visual / direct input モード間のバリデーション責務の非対称性が技術的負債として蓄積する

---

## 2. 何を達成するか（What）

### 2.1 目的

`VisualCronPicker` の **direct input モード**（`isAdvancedMode=true`）においても、ユーザーが入力したcron式のバリデーションを行い、無効な式では `onValidationChange(false)` を通知することで、visual モードと同等の安全性を確保する。

### 2.2 最終ゴール

- direct input モードで入力されたcron式に対して **syntax バリデーション**（フィールド数・各フィールドの文字種チェック）を実施する
- cron式の3番目フィールド（day-of-month）が数値かつ 1〜31 外の場合に **semantic バリデーション**を適用し `directInputError` を表示する
- 入力値が空文字の場合は無効として扱い `onValidationChange(false)` を通知する
- `isFormValid` の計算に `directInputError` を含め、direct input モードでも `onValidationChange` が正確に通知される
- 全バリデーションルールがユニットテストで担保されている

### 2.3 スコープ

#### 含むもの

- `VisualCronPicker.tsx` の `handleDirectInputChange` へのバリデーション追加
- `directInputError` フラグ（空文字 / syntax 不正 / day-of-month 範囲外）の実装
- direct input モードでのエラーメッセージ表示（`role="alert"`）
- `isFormValid` への `directInputError` の組み込み
- バリデーション状態をカバーするユニットテスト（Vitest / React Testing Library）
- Phase 11 スクリーンショット証跡（VISUAL タスクのため必須）

#### 含まないもの

- cron式の完全なパーサーライブラリ導入（renderer 環境でのimport制約により禁止）
- `cronConverter.ts` 側への変更（pure function 層は別タスクで管理）
- visual モード（`isAdvancedMode=false`）のバリデーション変更（TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 で実施済み）
- E2E / Playwright テスト（ユニット・スナップショットで充足する想定）
- cron式の「次回実行日時」計算・表示機能

### 2.4 成果物

| 種別         | 成果物                                                  | 配置先                                                                                      |
| ------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 機能修正     | VisualCronPicker.tsx（direct input バリデーション追加） | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                        |
| テスト       | VisualCronPicker.customValidation.test.tsx              | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` |
| ドキュメント | 各Phase成果物                                           | `docs/30-workflows/TASK-CRON-CUSTOM-VALIDATION-001/outputs/phase-*/`                        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001` が完了し、`VisualCronPicker.tsx` に `onValidationChange` プロップと `weeklyError` / `monthlyError` が実装済みであること
- React Testing Library / Vitest 環境が動作すること
- renderer 環境では Node.js only パッケージを import しないこと（知見 W1-02b-4）

### 3.2 依存タスク

| タスクID                                | 種別             | 説明                                                                                    |
| --------------------------------------- | ---------------- | --------------------------------------------------------------------------------------- |
| TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 | 前提（完了済み） | `onValidationChange` プロップ・visual モードバリデーション実装済み                      |
| TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 | 参考             | `cronConverter.ts` 純粋関数層のガード。本タスクはUI層で独立して実装するため必須ではない |

### 3.3 必要な知識

- React controlled component パターン（`useState` / `useCallback` / `useEffect`）
- cron式の基本フォーマット（5フィールド: `minute hour day-of-month month day-of-week`）
- `role="alert"` による ARIA エラー通知（アクセシビリティ）
- Vitest + `@testing-library/react` でのユーザーインタラクションテスト（`userEvent.type`）
- renderer プロセスの import 制約（Node.js only モジュール禁止）

### 3.4 推奨アプローチ

cron式のバリデーションは**外部ライブラリを使わず純粋な文字列操作**で実装する（renderer 環境制約のため）。

```typescript
/**
 * cron式の基本的な構文バリデーション（5フィールドチェック）。
 * renderer 環境で安全に使用できる純粋関数。
 */
function validateCronSyntax(expression: string): boolean {
  const trimmed = expression.trim();
  if (!trimmed) return false;
  const fields = trimmed.split(/\s+/);
  return fields.length === 5;
}

/**
 * cron式の day-of-month フィールド（3番目）が数値かつ 1〜31 外かどうかを検出する。
 * 数値以外（* / - など）の場合はチェックをスキップ（true を返す）。
 */
function validateCronDayOfMonth(expression: string): boolean {
  const fields = expression.trim().split(/\s+/);
  if (fields.length < 3) return false;
  const dom = fields[2];
  if (!/^\d+$/.test(dom)) return true; // 数値以外はスキップ
  const num = parseInt(dom, 10);
  return num >= 1 && num <= 31;
}
```

`isFormValid` への組み込みイメージ:

```typescript
const directInputError =
  isAdvancedMode &&
  (!validateCronSyntax(directInput) || !validateCronDayOfMonth(directInput));

const isFormValid = !weeklyError && !monthlyError && !directInputError;
```

エラーメッセージ表示は `showDirectInput && directInputError` の条件で `role="alert"` 要素を追加する。エラー種別（空文字 / syntax / day-of-month）で文言を分けることが望ましい。

---

## 4. 実行手順

| Phase | 名称                 | 主要作業                                                             | 成果物                                                    |
| ----- | -------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| 1     | 要件定義             | バリデーションルール一覧・受入基準確定・スコープ確認                 | `acceptance-criteria.md`, `scope-definition.md`           |
| 2     | 設計                 | バリデーション関数設計・エラーメッセージ文言・`isFormValid` 統合設計 | `design-decision.md`, `code-diff-preview.md`              |
| 3     | 設計レビューゲート   | renderer 環境制約の確認・後方互換性確認                              | `design-review-result.md`                                 |
| 4     | テスト作成（RED）    | RTL テストで失敗するケースを先に作成                                 | `test-matrix.md`, `red-confirmation.md`                   |
| 5     | 実装（GREEN）        | `VisualCronPicker.tsx` へのバリデーション追加                        | `implementation-result.md`, `green-confirmation.md`       |
| 6     | テスト拡充           | 境界値・空白文字・特殊フィールド（`*`, `/`, `-`）のテスト追加        | `test-expansion-result.md`                                |
| 7     | カバレッジ確認       | Line 80%以上達成確認                                                 | `coverage-report.md`                                      |
| 8     | リファクタリング     | バリデーション関数の配置・命名・重複排除                             | `refactoring-result.md`                                   |
| 9     | 品質保証             | lint / typecheck / 全テスト PASS 確認                                | `qa-result.md`                                            |
| 10    | 最終レビューゲート   | AC全件充足・マージ可否判定                                           | `final-review-result.md`, `ac-verification.md`            |
| 11    | 手動テスト（VISUAL） | ブラウザでの動作確認・スクリーンショット取得                         | `manual-test-report.md`, スクリーンショット証跡           |
| 12    | ドキュメント更新     | JSDoc更新・未タスク検出・フィードバック記録                          | `implementation-guide.md`, `unassigned-task-detection.md` |
| 13    | PR作成・CI確認       | PR作成・CI通過・マージ準備                                           | PR URL、CI通過証跡                                        |

### Phase 11（VISUAL）注意事項

このタスクは UI 実装を含むため **VISUAL タスク** として扱う。

- Phase 11 実施前に「Electron アプリを起動し、ブラウザでスケジュール設定画面の route を開く smoke test」を必ず実施すること
- スクリーンショットは以下のケースを撮影すること:
  1. 「高度な設定」ボタンを押して direct input モードに切り替えた直後（初期値 cron 式が有効な場合）
  2. direct input モードで空文字を入力した状態: エラーメッセージが表示されていること
  3. direct input モードでフィールド数不足の式（例: `"0 9 * *"`）を入力: syntax エラーが表示されていること
  4. direct input モードで day-of-month 範囲外（例: `"0 9 0 * *"`）を入力: エラーが表示されていること
  5. direct input モードで有効なcron式（例: `"0 9 15 * *"`）を入力: エラーなし正常状態
- `phase11-capture-metadata.json` に `taskType: "VISUAL"` を明記する

### Phase 4 重要ポイント（TDD RED フェーズ）

テストは実装前に RED を確認してから進める。以下のケースを優先的に記述する:

```typescript
// direct input モードで空文字入力 → onValidationChange(false)
// direct input モードでフィールド数4のcron式 → onValidationChange(false)
// direct input モードで "0 9 0 * *"（dom=0）→ onValidationChange(false) + alert表示
// direct input モードで "0 9 32 * *"（dom=32）→ onValidationChange(false) + alert表示
// direct input モードで "0 9 15 * *"（有効）→ onValidationChange(true)
// direct input モードで "* * * * *"（有効 every-minute 式）→ onValidationChange(true)
// direct input モードで "0 9 */2 * *"（dom が */2）→ syntax は valid として扱う
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] direct input モードで空文字入力時にエラーメッセージ（`role="alert"`）が表示される
- [ ] direct input モードで空文字入力時に `onValidationChange(false)` が呼ばれる
- [ ] direct input モードでフィールド数が5でないcron式（例: `"0 9 * *"`）を入力するとエラーが表示される
- [ ] direct input モードでフィールド数不正の場合に `onValidationChange(false)` が呼ばれる
- [ ] direct input モードで day-of-month フィールドが数値かつ 0 の場合にエラーが表示される
- [ ] direct input モードで day-of-month フィールドが数値かつ 32 以上の場合にエラーが表示される
- [ ] direct input モードで上記無効 day-of-month の場合に `onValidationChange(false)` が呼ばれる
- [ ] direct input モードで有効なcron式（例: `"0 9 15 * *"`）を入力するとエラーが表示されない
- [ ] direct input モードで有効なcron式を入力すると `onValidationChange(true)` が呼ばれる
- [ ] day-of-month フィールドが `*` / `*/2` / `-` 区間など非数値の場合はエラーを表示しない
- [ ] visual モードから direct input モードへ切り替えた際に、バリデーション状態が正しく再計算される
- [ ] `onValidationChange` が undefined の場合にもエラーなく動作する

### 品質要件

- [ ] `pnpm --filter @repo/desktop test` が全件 PASS
- [ ] TypeScript 型チェック（`pnpm --filter @repo/desktop typecheck`）が PASS
- [ ] ESLint（`pnpm --filter @repo/desktop lint`）が PASS
- [ ] 既存テスト（`VisualCronPicker.validation.test.tsx`、`cronConverter.edge.test.ts` 等）が新たに FAIL しない
- [ ] バリデーション関数が renderer 環境で安全に動作すること（Node.js only モジュールを使用しない）

### ドキュメント要件

- [ ] `directInputError` ロジックの説明コメントが実装ファイルに記載されている
- [ ] Phase 11 スクリーンショット証跡が `outputs/phase-11/` に格納されている
- [ ] `phase11-capture-metadata.json` に `taskType: "VISUAL"` が記載されている
- [ ] `unassigned-task-detection.md` で未タスクの有無が記録されている

---

## 6. 検証方法

### テストコマンド

```bash
# ユニットテスト実行（新規テストファイル）
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.customValidation"

# 既存バリデーションテストとの統合確認
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint

# カバレッジ確認
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="VisualCronPicker"
```

### 主要テストケース

| テストID | 入力 / 操作                                                         | 期待結果                                           |
| -------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| CV-01    | direct input モードで空文字を入力                                   | エラーメッセージ表示 + `onValidationChange(false)` |
| CV-02    | direct input モードで `"0 9 * *"`（4フィールド）を入力              | エラーメッセージ表示 + `onValidationChange(false)` |
| CV-03    | direct input モードで `"0 9 0 * *"`（dom=0）を入力                  | エラーメッセージ表示 + `onValidationChange(false)` |
| CV-04    | direct input モードで `"0 9 32 * *"`（dom=32）を入力                | エラーメッセージ表示 + `onValidationChange(false)` |
| CV-05    | direct input モードで `"0 9 15 * *"`（有効）を入力                  | エラーなし + `onValidationChange(true)`            |
| CV-06    | direct input モードで `"* * * * *"`（有効 every-minute）を入力      | エラーなし + `onValidationChange(true)`            |
| CV-07    | direct input モードで `"0 9 */2 * *"`（dom=`*/2`）を入力            | エラーなし + `onValidationChange(true)`            |
| CV-08    | direct input モードで `"0 9 1-15 * *"`（dom=`1-15` 区間）を入力     | エラーなし + `onValidationChange(true)`            |
| CV-09    | visual モードから direct input モードへ切り替え（初期値有効）       | `onValidationChange(true)` が呼ばれる              |
| CV-10    | visual モード（weeklyError=true）から direct input モードへ切り替え | バリデーション再計算が正しく実行される             |
| CV-11    | `onValidationChange` なしでレンダリング                             | エラーなく動作する                                 |
| CV-12    | direct input モードで半角スペースのみを入力                         | エラーメッセージ表示 + `onValidationChange(false)` |

### 手動検証手順

1. `pnpm --filter @repo/desktop dev` でアプリを起動する
2. スケジュール設定画面を開く
3. 「高度な設定」ボタンをクリックして direct input モードへ切り替える
4. 入力フィールドを空にする → エラーメッセージが表示されることを確認する
5. `"0 9 * *"`（4フィールド）を入力する → syntax エラーが表示されることを確認する
6. `"0 9 0 * *"` を入力する → day-of-month エラーが表示されることを確認する
7. `"0 9 15 * *"` を入力する → エラーが消えることを確認する
8. スクリーンショットを撮影し `outputs/phase-11/` に格納する

---

## 7. リスクと対策

| リスク                                                                                      | 影響度 | 発生確率 | 対策                                                                                                            |
| ------------------------------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| renderer 環境で Node.js only パッケージ（`cronstrue` 等）を import してランタイムエラー発生 | 高     | 中       | バリデーション関数は純粋な文字列操作のみで実装する（知見 W1-02b-4 参照）。外部cronライブラリは絶対に使用しない  |
| `validateCronSyntax` が複雑なcron記法（`@reboot`, `@daily` 等）を誤って無効判定する         | 中     | 中       | 本タスクのスコープは「5フィールド標準形式」のみとし、特殊記法は別タスクで対応する旨を JSDoc に明記する          |
| direct input モードへの切り替えタイミングで `isFormValid` の計算が一瞬不安定になる          | 中     | 中       | `useEffect` で `isFormValid` の変化を監視し、安定したタイミングで `onValidationChange` を呼び出す               |
| `directInputError` の文言が `weeklyError` / `monthlyError` と統一されていない               | 低     | 高       | Phase 2 設計時にエラー文言一覧を確定し、既存エラー文言との表記揺れをチェックリストで管理する                    |
| Phase 11 smoke test 前に Electron 起動に失敗する（esbuild mismatch 等）                     | 高     | 低       | `pnpm install` を実行してから再試行する。詳細は知見 W1-02b-4 を参照                                             |
| visual モード → direct input モード切り替え後に `onValidationChange` が通知されない         | 中     | 中       | `isAdvancedMode` の変化を `useEffect` の依存配列に含め、モード切替時にも `isFormValid` が再計算されるようにする |

---

## 8. 参照情報

### 関連ファイル

| ファイルパス                                                                          | 用途                                                                 |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                  | 主要修正対象。`handleDirectInputChange` と `isFormValid` の計算部分  |
| `apps/desktop/src/renderer/utils/cronConverter.ts`                                    | 純粋関数層。本タスクでは変更しないが、ガード実装パターンの参考にする |
| `apps/desktop/src/renderer/types/visualCronConfig.ts`                                 | `VisualCronConfig` 型定義                                            |
| `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` | 既存バリデーションテスト（回帰確認対象）                             |
| `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`                         | 純粋関数層エッジケーステスト（参考）                                 |

### 関連タスク

| タスクID                                 | パス                                                                           | 関係                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001  | `docs/30-workflows/TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001/`                   | 発見元タスク。visual モードバリデーション実装済み                                                  |
| TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 | `docs/30-workflows/` 配下（完了済み）                                          | 空曜日ガード処理の先例。バリデーション設計のパターン源                                             |
| TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001  | `docs/30-workflows/unassigned-task/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001.md` | cronConverter 純粋関数層の monthly ガード（本タスクと相補的）                                      |
| TASK-CRON-ERROR-STYLE-UNIFICATION-001    | `docs/30-workflows/unassigned-task/task-cron-error-style-unification.md`       | エラーメッセージスタイル統一。本タスクの新規エラー表示スタイルも同タスクで統一対象となる可能性あり |

---

## 9. 備考

### 苦戦箇所【記入必須】

| 知見ID   | カテゴリ                       | 内容                                                                                                                                                                                                                                     | 対策                                                                                            |
| -------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| W1-02b-4 | renderer import 制約           | renderer UIコンポーネントで Node.js only パッケージを直接 import するとランタイムエラーが発生する。Electron の renderer プロセスはブラウザ環境として動作するため、`fs` / `path` や cronパーサーライブラリ（Node.js依存のもの）は使用不可 | バリデーション関数は正規表現と文字列操作のみで実装する                                          |
| W2-01    | Phase 11 事前 smoke test 必須  | Phase 11 capture 前に「Electron アプリを起動し、ブラウザで schedule 設定の route を実際に開く smoke test」を必ず実施すること。UI が実際に表示されることを確認しないままスクリーンショット証跡を省略すると、後続の検証で問題が発覚する    | Phase 11 の冒頭に smoke test 手順を明示し、完了チェックリストに含める                           |
| W2-02    | バリデーション責務の分離       | `cronConverter.ts`（純粋関数層）のガードと `VisualCronPicker.tsx`（UI層）のバリデーションは別責務である。本タスクは UI層のみを対象とし、純粋関数層への変更は TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 で別途対応する                      | 実装ファイルのコメントに責務分離の方針を明記し、混在を防ぐ                                      |
| W2-03    | `isFormValid` の計算タイミング | `isAdvancedMode` のトグル直後に `isFormValid` の再計算が React のバッチ処理により遅延する可能性がある。これにより `onValidationChange` の通知タイミングがずれる場合がある                                                                | `useEffect` の依存配列に `isAdvancedMode` と `directInput` を含め、確実に再計算されるようにする |
| W2-04    | TDD サイクルの厳守             | Phase 4（テスト RED）→ Phase 5（実装 GREEN）の順序を守らないと、バリデーションの抜け漏れが実装後に発覚しやすい                                                                                                                           | テストケース一覧（セクション 6 参照）を Phase 4 で先に記述し、RED を確認してから実装へ進む      |

### 補足事項

- **エラーメッセージ文言の方針**: `TASK-CRON-ERROR-STYLE-UNIFICATION-001` との整合性を保つため、エラー文言は既存の `weeklyError` / `monthlyError` と同じフォントサイズクラス（`text-sm`）を使用すること
- **cron特殊記法の扱い**: `@reboot`、`@daily` 等の非標準記法は本タスクのスコープ外とし、5フィールド形式のみを対象とする。特殊記法が入力された場合は syntax invalid として扱う（将来タスクで拡張可能）
- **発見経緯**: `TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001` の Phase 12 ドキュメント更新フェーズにて、visual モードのバリデーションが `!isAdvancedMode` ガードで direct input モード時に全て無効化されることを確認し、未タスクとして記録した
