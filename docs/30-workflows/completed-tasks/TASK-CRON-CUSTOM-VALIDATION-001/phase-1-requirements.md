# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| Phase名    | 要件定義                        |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001 |
| 前提Phase  | -                               |
| 次Phase    | Phase 2: 設計                   |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

---

## 目的

`VisualCronPicker` の direct input モード（advanced mode 有効時）におけるバリデーション欠如の問題を正確に把握し、バリデーションルール・受け入れ基準・スコープ境界を確定する。

---

## 実行タスク

### Task 1: P50チェック（既実装コードの調査）

`VisualCronPicker.tsx` の現在の実装状態を調査し、以下を確認する:

- `handleDirectInputChange` の実装内容（入力値をそのまま `onChange` に渡しているか）
- `weeklyError` / `monthlyError` が `!isAdvancedMode` 条件で強制 false になるロジック
- `isFormValid` の計算ロジック（`directInputError` が存在しないことの確認）
- `onValidationChange` の呼び出しタイミングと引数

```bash
# 対象ファイルの確認
grep -n "handleDirectInputChange\|isAdvancedMode\|weeklyError\|monthlyError\|isFormValid\|onValidationChange" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx
```

### Task 2: バリデーションルール一覧の確定

direct input モードで適用すべきバリデーションルールを確定する:

| ルールID | ルール名             | 条件                               | エラーメッセージ                                          |
| -------- | -------------------- | ---------------------------------- | --------------------------------------------------------- |
| V-1      | 空文字チェック       | 入力値が空文字またはトリム後空文字 | 「cron式を入力してください」                              |
| V-2      | フィールド数チェック | フィールド数が5でない              | 「cron式は5つのフィールドが必要です（分 時 日 月 曜日）」 |
| V-3      | day-of-month下限     | day-of-monthが数値かつ0以下        | 「日の値は1〜31の範囲で指定してください」                 |
| V-4      | day-of-month上限     | day-of-monthが数値かつ32以上       | 「日の値は1〜31の範囲で指定してください」                 |

### Task 3: 受け入れ基準（AC）の確定

| AC番号 | 条件                                                      | 期待結果                                                                        |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| AC-1   | direct input モードで空文字入力時                         | エラーメッセージ（role="alert"）が表示され、onValidationChange(false)が呼ばれる |
| AC-2   | direct input モードでフィールド数が5でないcron式入力時    | エラーが表示され、onValidationChange(false)が呼ばれる                           |
| AC-3   | direct input モードでday-of-monthが数値かつ0の場合        | エラーが表示され、onValidationChange(false)が呼ばれる                           |
| AC-4   | direct input モードでday-of-monthが数値かつ32以上の場合   | エラーが表示され、onValidationChange(false)が呼ばれる                           |
| AC-5   | direct input モードで有効なcron式入力時                   | エラーが表示されず、onValidationChange(true)が呼ばれる                          |
| AC-6   | day-of-monthフィールドが`*`/`*/2`/`-`区間など非数値の場合 | エラーを表示しない                                                              |
| AC-7   | visual モードからdirect input モードへ切り替えた際        | バリデーション状態が正しく再計算される                                          |
| AC-8   | `onValidationChange` がundefinedの場合                    | エラーなく動作する                                                              |

### Task 4: スコープ境界の確定

**スコープ内:**

- `VisualCronPicker.tsx` の `handleDirectInputChange` へのバリデーション追加
- `directInputError` フラグの導入
- direct input モードでのエラーメッセージ表示（`role="alert"`）
- `isFormValid` への `directInputError` の組み込み
- ユニットテスト（Vitest/React Testing Library）
- Phase 11 スクリーンショット証跡

**スコープ外:**

- cronパーサーライブラリ導入（renderer環境制約）
- `cronConverter.ts` 側への変更
- visual モードのバリデーション変更（TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001で実装済み）
- E2E/Playwrightテスト

### Task 5: 前提条件の記録

- TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001（完了済み）: visual モードのバリデーションが既に実装されている
- renderer環境制約: Node.jsモジュール（`cron-parser` 等）は使用不可
- `VisualCronPicker.tsx` は既に `weeklyError` / `monthlyError` によるバリデーション機構を持つ

### Task 6: トレーサビリティ行列の作成

| AC番号 | バリデーションルール               | 対象コード箇所                                      | テストケース           |
| ------ | ---------------------------------- | --------------------------------------------------- | ---------------------- |
| AC-1   | V-1（空文字チェック）              | `handleDirectInputChange` + `directInputError` 計算 | 空文字入力テスト       |
| AC-2   | V-2（フィールド数チェック）        | `validateCronSyntax` 関数                           | フィールド数不足テスト |
| AC-3   | V-3（day-of-month下限）            | `validateCronDayOfMonth` 関数                       | day-of-month=0テスト   |
| AC-4   | V-4（day-of-month上限）            | `validateCronDayOfMonth` 関数                       | day-of-month=32テスト  |
| AC-5   | 全ルールPASS                       | `directInputError` が false                         | 有効cron式テスト       |
| AC-6   | V-3/V-4（非数値スキップ）          | `validateCronDayOfMonth` 数値判定                   | `*`/`*/2` テスト       |
| AC-7   | モード切替時再計算                 | `isAdvancedMode` 変更時の `useEffect`               | モード切替テスト       |
| AC-8   | `onValidationChange` undefined安全 | optional chaining                                   | undefined propテスト   |

---

## 参照資料

| 資料名           | パス                                                                         | 用途                            |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------------- |
| VisualCronPicker | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`         | 変更対象・現行実装の確認        |
| 依存タスク仕様書 | `docs/30-workflows/completed-tasks/TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001/` | visual モードバリデーション参照 |
| cronConverter    | `apps/desktop/src/renderer/utils/cronConverter.ts`                           | スコープ外確認                  |

---

## 実行手順

1. P50チェック: `VisualCronPicker.tsx` を読み込み、`handleDirectInputChange` / `isFormValid` / `onValidationChange` の現行動作を文書化する
2. バリデーションルール V-1〜V-4 を定義し、各ルールのエラーメッセージを確定する
3. AC-1〜AC-8 を検証可能な形式で定義する
4. スコープ境界（含む/含まない）を明確化する
5. 前提条件（依存タスク完了済み、renderer環境制約）を記録する
6. トレーサビリティ行列を作成し、AC・ルール・コード・テストの対応を明示する
7. 成果物を `outputs/phase-1/` に出力する

---

## 統合テスト連携

- `directInputError` フラグが `isFormValid` に正しく組み込まれることを確認する
- `onValidationChange` がバリデーション結果に応じて正しく呼ばれることを確認する
- visual モードのバリデーション（`weeklyError` / `monthlyError`）に影響がないことを確認する
- 統合ログは `outputs/phase-1/` に保存する

---

## 多角的チェック観点

- **後方互換性**: visual モードのバリデーションに影響がないか
- **renderer環境制約**: Node.jsモジュールを使用していないか
- **アクセシビリティ**: エラーメッセージに `role="alert"` が設定されるか
- **Optional Prop安全性**: `onValidationChange` が undefined でも動作するか
- **モード切替時の状態遷移**: visual → direct 切替時にバリデーション状態が不整合にならないか

---

## 成果物

| 成果物               | パス                                         | 説明                             |
| -------------------- | -------------------------------------------- | -------------------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | 機能要件と非機能要件             |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-8の詳細定義             |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`        | 既実装コード調査結果             |
| トレーサビリティ行列 | `outputs/phase-1/traceability-matrix.md`     | AC・ルール・コード・テスト対応表 |

---

## 完了条件

- [ ] P50チェックを実施し、`VisualCronPicker.tsx` の現行動作を文書化した
- [ ] バリデーションルール V-1〜V-4 を定義した
- [ ] AC-1〜AC-8 を定義し、全て検証可能な形式で記述した
- [ ] スコープ境界（含む/含まない）を明確化した
- [ ] 前提条件（依存タスク完了済み、renderer環境制約）を記録した
- [ ] トレーサビリティ行列を作成した
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

→ [Phase 2: 設計](./phase-2-design.md)
