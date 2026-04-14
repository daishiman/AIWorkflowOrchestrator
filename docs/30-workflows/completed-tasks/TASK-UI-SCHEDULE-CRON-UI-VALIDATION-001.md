# TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001: VisualCronPicker UIバリデーション整理

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001                        |
| タスク名     | VisualCronPicker UIバリデーション整理                          |
| 分類         | 改善                                                           |
| 対象機能     | スケジュール設定 / VisualCronPickerコンポーネント              |
| 優先度       | **中**                                                         |
| 見積もり規模 | 中規模                                                         |
| タスク種別   | VISUAL                                                         |
| ステータス   | 参照用（正式タスクへ昇格済み）                                 |
| 発見元       | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-12                                                     |
| 依存タスク   | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001（推奨）                |

> 注記: この未タスク記録は後に正式タスク `docs/30-workflows/TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001/` として実施済み。
> ここでは発見当時のメモを残し、現行の実施状況は正式タスク側を参照する。

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001` の対応により、`cronConverter.ts`（純粋関数層）では `weekly` + 空曜日のケースで空文字 `""` を返すガード処理が追加された。
しかし、**ガードが純粋関数層のみに存在**しており、UI層での事前バリデーションおよびエラーフィードバックが不完全な状態が残っている。

現在の `VisualCronPicker.tsx` の実装を調査した結果:

- `weeklyError` フラグ（`config.frequency === "weekly" && config.weekdays.length === 0`）は定義されており、エラーメッセージ表示（`role="alert"`）は実装済み
- しかし、保存ボタンの `disabled` 制御は `VisualCronPicker` の責務外のため、親コンポーネント側での考慮が必要
- `monthly` + `dayOfMonth=0` や `dayOfMonth>31` に対するガードは `cronConverter.ts` 側に未実装であり、UI側にもエラー表示なし
- バリデーション状態（有効/無効）を外部へ伝達するインターフェース（例: `onValidationChange` コールバック）が存在しない

### 1.2 問題点・課題

| ケース                       | 現状の挙動                                                                         | 問題                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `weekly` + empty weekdays    | cronConverter が `""` を返す。UIはエラーメッセージを表示するが保存可否制御は親依存 | 親コンポーネントが `onChange("")` を受け取っても無効状態と判断できない |
| `monthly` + `dayOfMonth=0`   | cronConverter が `"0 9 0 * *"` を返す（不正なcron式）                              | UIにエラー表示なし、無効値がそのまま保存される可能性                   |
| `monthly` + `dayOfMonth>31`  | cronConverter が `"0 9 32 * *"` 等を返す（不正なcron式）                           | UIにエラー表示なし、無効値がそのまま保存される可能性                   |
| バリデーション状態の外部通知 | 存在しない                                                                         | 呼び出し元が保存ボタン disable 制御を実装できない                      |

### 1.3 放置した場合の影響

- 無効なcron式がスケジューラーに登録され、ランタイムエラーを引き起こす可能性がある
- ユーザーが無効な設定で保存ボタンを押せてしまう（UX劣化）
- `cronConverter.ts` に加えられた future guard（monthly範囲チェック等）が UI側と連動しないまま独立してしまう
- `純粋関数 → UI` の責務境界が不明瞭なまま技術的負債が蓄積する

---

## 2. 何を達成するか（What）

### 2.1 目的

`VisualCronPicker` コンポーネントにおいて、ユーザーが無効な状態で保存できないよう **UI層でバリデーションを完結させる** とともに、バリデーション状態を呼び出し元へ通知するインターフェースを整備する。

### 2.2 最終ゴール

- `weekly` + 空曜日: エラーメッセージ表示 + `onChange` への空文字通知 + `onValidationChange(false)` 通知
- `monthly` + 無効な日付（0以下 or 32以上）: エラーメッセージ表示 + `onValidationChange(false)` 通知
- 呼び出し元（親コンポーネント）が `isValid` 状態を受け取り、保存ボタンを `disabled` 制御できる
- 全バリデーションルールがテストで担保されている

### 2.3 スコープ

#### 含むもの

- `VisualCronPicker.tsx` へのバリデーション状態管理追加
- `onValidationChange?: (isValid: boolean) => void` プロップ追加
- `monthly` モードでの `dayOfMonth` 範囲バリデーション（1〜31）UIエラー表示
- バリデーション状態をカバーするユニットテスト（Vitest / React Testing Library）
- Phase 11 スクリーンショット証跡（VISUAL タスクのため必須）

#### 含まないもの

- `cronConverter.ts` への monthly ガード追加（別タスク: TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001）
- カスタムcron式（直接入力モード）のバリデーション（別タスク推奨）
- E2E / Playwright テスト（ユニット・スナップショットで充足する想定）
- デザインシステムの変更（既存の `text-red-500` スタイルを流用）

### 2.4 成果物

| 種別         | 成果物                                                       | 配置先                                                                                |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| 機能修正     | VisualCronPicker.tsx（バリデーション状態管理・プロップ追加） | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                  |
| 型定義更新   | VisualCronPickerProps（onValidationChange プロップ）         | 同上                                                                                  |
| テスト       | VisualCronPicker.validation.test.tsx                         | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx` |
| ドキュメント | 各Phase成果物                                                | `docs/30-workflows/TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001/outputs/phase-*/`          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001` が完了し、`cronConverter.ts` に空曜日ガードが実装済みであること
- `VisualCronPicker.tsx` の現行コードを把握していること（`apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`）
- React Testing Library / Vitest 環境が動作すること

### 3.2 依存タスク

| タスクID                                 | 種別 | 説明                                                         |
| ---------------------------------------- | ---- | ------------------------------------------------------------ |
| TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 | 前提 | cronConverter 空曜日ガード完了済みであること                 |
| TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001  | 推奨 | monthly ガード追加後に実施するとUI・関数層で一貫性が保たれる |

### 3.3 必要な知識

- React controlled component パターン（`useState` / `useCallback`）
- バリデーション状態の props-down / events-up 設計
- `role="alert"` による ARIA エラー通知（アクセシビリティ）
- Vitest + `@testing-library/react` でのユーザーインタラクションテスト

### 3.4 推奨アプローチ

1. `VisualCronPickerProps` に `onValidationChange?: (isValid: boolean) => void` を追加
2. コンポーネント内で `isFormValid` 状態を計算し、変化時に `onValidationChange` を呼び出す
3. `monthly` モード用の `monthlyError` フラグを `weeklyError` と同様のパターンで追加
4. `DayOfMonthSelector` の入力値が範囲外の場合にエラーメッセージを表示
5. テストは `userEvent` でインタラクションを再現し、エラーメッセージの表示/非表示とコールバックの呼び出し引数を検証

```typescript
// 追加するプロップイメージ
interface VisualCronPickerProps {
  value?: string;
  onChange: (cron: string) => void;
  onValidationChange?: (isValid: boolean) => void; // 追加
  disabled?: boolean;
  showAdvancedToggle?: boolean;
  className?: string;
}

// バリデーション状態計算イメージ
const weeklyError =
  !isAdvancedMode &&
  config.frequency === "weekly" &&
  config.weekdays.length === 0;

const monthlyError =
  !isAdvancedMode &&
  config.frequency === "monthly" &&
  (config.dayOfMonth < 1 || config.dayOfMonth > 31);

const isFormValid = !weeklyError && !monthlyError;
```

---

## 4. 実行手順 (Phase 1-13)

| Phase | 名称                 | 主要作業                                             | 成果物                                                    |
| ----- | -------------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| 1     | 要件定義             | バリデーションルール一覧・受入基準確定・スコープ確認 | `acceptance-criteria.md`, `scope-definition.md`           |
| 2     | 設計                 | プロップ設計・バリデーション状態設計・エラー表示設計 | `design-decision.md`, `code-diff-preview.md`              |
| 3     | 設計レビューゲート   | 設計の後方互換性確認・破壊的変更有無の判断           | `design-review-result.md`                                 |
| 4     | テスト作成 (RED)     | RTL テストで失敗するケースを先に作成                 | `test-matrix.md`, `red-confirmation.md`                   |
| 5     | 実装 (GREEN)         | `VisualCronPicker.tsx` へのバリデーション追加        | `implementation-result.md`, `green-confirmation.md`       |
| 6     | テスト拡充           | 境界値・複合ケース・アクセシビリティ検証の追加       | `test-expansion-result.md`                                |
| 7     | カバレッジ確認       | Line 80%以上達成確認                                 | `coverage-report.md`                                      |
| 8     | リファクタリング     | コード品質改善・重複排除                             | `refactoring-result.md`                                   |
| 9     | 品質保証             | lint / typecheck / 全テスト PASS 確認                | `qa-result.md`                                            |
| 10    | 最終レビューゲート   | AC全件充足・マージ可否判定                           | `final-review-result.md`, `ac-verification.md`            |
| 11    | 手動テスト（VISUAL） | ブラウザでの動作確認・スクリーンショット取得         | `manual-test-report.md`, スクリーンショット証跡           |
| 12    | ドキュメント更新     | JSDoc更新・未タスク検出・フィードバック記録          | `implementation-guide.md`, `unassigned-task-detection.md` |
| 13    | PR作成・CI確認       | PR作成・CI通過・マージ準備                           | PR URL、CI通過証跡                                        |

### Phase 11 (VISUAL) 注意事項

このタスクは UI 実装を含むため **VISUAL タスク** として扱う。

- Phase 11 実施前に「Electron アプリを起動し、ブラウザで schedule 設定画面の route を開く smoke test」を必ず実施すること
- スクリーンショットは以下のケースを撮影すること:
  1. `weekly` + 空曜日: エラーメッセージが表示されている状態
  2. `weekly` + 曜日選択済み: 正常状態
  3. `monthly` + 無効日付（0 または 32）: エラーメッセージが表示されている状態
  4. `monthly` + 有効日付: 正常状態
- `phase11-capture-metadata.json` に `taskType: "VISUAL"` を明記する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `weekly` + 空曜日でエラーメッセージ（`role="alert"`）が表示される
- [ ] `weekly` + 空曜日で `onValidationChange(false)` が呼ばれる
- [ ] `weekly` + 曜日選択時に `onValidationChange(true)` が呼ばれる
- [ ] `monthly` + `dayOfMonth < 1` でエラーメッセージが表示される
- [ ] `monthly` + `dayOfMonth > 31` でエラーメッセージが表示される
- [ ] `monthly` + `dayOfMonth < 1` または `> 31` で `onValidationChange(false)` が呼ばれる
- [ ] `monthly` + 有効な日付（1〜31）で `onValidationChange(true)` が呼ばれる
- [ ] `onValidationChange` が undefined の場合にもエラーなく動作する（省略可能なプロップ）

### 品質要件

- [ ] `pnpm --filter @repo/desktop test` が全件 PASS
- [ ] TypeScript 型チェック（`pnpm --filter @repo/desktop typecheck`）が PASS
- [ ] ESLint（`pnpm --filter @repo/desktop lint`）が PASS
- [ ] 既存テストが新たに FAIL しない

### ドキュメント要件

- [ ] `VisualCronPickerProps` の JSDoc に `onValidationChange` の説明が記載されている
- [ ] Phase 11 スクリーンショット証跡が `outputs/phase-11/` に格納されている
- [ ] `phase11-capture-metadata.json` に `taskType: "VISUAL"` が記載されている
- [ ] `unassigned-task-detection.md` で未タスクの有無が記録されている

---

## 6. 検証方法

### テストコマンド

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.validation"

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint

# カバレッジ確認
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="VisualCronPicker"
```

### 主要テストケース

| テストID  | 内容                                                     | 期待結果                                       |
| --------- | -------------------------------------------------------- | ---------------------------------------------- |
| VAL-W-01  | `weekly` + 空曜日でレンダリング                          | エラーメッセージが DOM に存在する              |
| VAL-W-02  | `weekly` + 空曜日で `onValidationChange` コールバック    | `false` で呼ばれる                             |
| VAL-W-03  | `weekly` + 曜日クリックで選択                            | エラーメッセージが消える + `true` コールバック |
| VAL-M-01  | `monthly` + `dayOfMonth=0` でレンダリング                | エラーメッセージが DOM に存在する              |
| VAL-M-02  | `monthly` + `dayOfMonth=32` でレンダリング               | エラーメッセージが DOM に存在する              |
| VAL-M-03  | `monthly` + 有効な日付（15）でレンダリング               | エラーメッセージが DOM に存在しない            |
| VAL-M-04  | `monthly` + 無効日付で `onValidationChange` コールバック | `false` で呼ばれる                             |
| VAL-CB-01 | `onValidationChange` なしでレンダリング                  | エラーなく動作する                             |

### 手動検証手順

1. `pnpm --filter @repo/desktop dev` でアプリを起動する
2. スケジュール設定画面を開く
3. 頻度を「毎週」に設定し、全曜日のチェックを外す → エラーメッセージが表示されることを確認
4. 曜日を1つ選択する → エラーメッセージが消えることを確認
5. 頻度を「毎月」に設定し、日付フィールドで無効値を入力する（入力可能な場合）→ エラーメッセージが表示されることを確認
6. スクリーンショットを撮影し `outputs/phase-11/` に格納する

---

## 7. リスクと対策

| リスク                                                                                                 | 影響度 | 発生確率 | 対策                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------ | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onValidationChange` コールバックの呼び出しタイミングがレンダリングと競合する                          | 中     | 中       | `useEffect` で `isFormValid` の変化を監視し、安定したタイミングで呼び出す                                                                                              |
| `DayOfMonthSelector` が範囲外入力を UI レベルで拒否しているため monthlyError が発生しない              | 中     | 高       | `DayOfMonthSelector` の実装を確認し、バリデーション責務の分担を設計フェーズで確定する                                                                                  |
| `onValidationChange` 追加による呼び出し元の破壊的変更                                                  | 低     | 低       | Optional プロップ（`?`）として追加するため後方互換性は保たれる                                                                                                         |
| Phase 11 スクリーンショット取得時にレンダラーで node-only パッケージが import されランタイムエラー発生 | 高     | 低       | renderer UIコンポーネントでは node-only パッケージを直接 import しない（知見 W1-02b-4 参照）                                                                           |
| `monthly` ガードが cronConverter 側に未実装のため、テストが中途半端になる                              | 中     | 中       | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 完了後に実施することを推奨。先行実施時は UI 側のみのバリデーションとして実装し、純粋関数ガードの追加を TODO コメントで記録する |

---

## 8. 参照情報

### 関連ファイル

- `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` - 主要修正対象
- `apps/desktop/src/renderer/components/schedule/WeekdaySelector.tsx` - 曜日選択コンポーネント
- `apps/desktop/src/renderer/components/schedule/DayOfMonthSelector.tsx` - 日付選択コンポーネント
- `apps/desktop/src/renderer/utils/cronConverter.ts` - 純粋関数層（ガード処理実装済み）
- `apps/desktop/src/renderer/types/visualCronConfig.ts` - 型定義

### 関連タスク

- `docs/30-workflows/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001/` - 発見元タスク
- `docs/30-workflows/completed-tasks/TASK-UI-SCHEDULE-VISUAL-PICKER-001/` - 上位タスク
- `docs/30-workflows/unassigned-task/` - 未タスク一覧

### 関連Issue

- GitHub Issue #2075（TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 バグ報告元）

---

## 9. 苦戦箇所・知見（発見元タスクより）

発見元タスク (TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001) からの知見:

- **[知見 W1-02b-4]** renderer UIコンポーネントで node-only パッケージを直接 import しないこと。Electron の renderer プロセスは Node.js 環境ではなくブラウザ環境として動作するため、`fs` / `path` 等の Node.js モジュールを renderer で import するとランタイムエラーが発生する
- **Phase 11 事前 smoke test 必須**: Phase 11 capture 前に「Electron アプリを起動し、ブラウザで実際に schedule 設定の route を開く smoke test」を必ず実施すること。UI が実際に表示されることを確認しないままスクリーンショット証跡を省略すると、後続の検証で問題が発覚する
- **VISUAL タスク分類**: VisualCronPicker のスクリーンショットは NON_VISUAL ではなく VISUAL として扱う。本タスクは UI 実装を含むため、Phase 11 でのスクリーンショット証跡が必須
- **バリデーション責務の分離**: `cronConverter.ts`（純粋関数層）のガードと、`VisualCronPicker.tsx`（UI層）のバリデーションは別責務。純粋関数層のガードはフォールバック値を返すことで防御するが、UI層はユーザーへのエラーフィードバックと操作制御を担う。この責務境界を明確に保つことが本タスクの核心
- **`weeklyError` 実装済み**: 現行の `VisualCronPicker.tsx` には `weeklyError` フラグとエラーメッセージ表示（`role="alert"`）が既に実装されている。本タスクでは `monthlyError` の追加と、`onValidationChange` コールバックによる外部通知が主要な追加実装となる
