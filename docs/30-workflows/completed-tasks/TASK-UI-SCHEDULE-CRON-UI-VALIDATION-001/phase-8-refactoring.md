# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 8                                       |
| タスクID   | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| 機能名     | VisualCronPicker UIバリデーション整理   |
| 前提Phase  | Phase 7（カバレッジ確認完了）           |
| 後続Phase  | Phase 9                                 |
| 作成日     | 2026-04-13                              |
| ステータス | 完了                                    |

## 目的

Phase 5 で追加した `VisualCronPicker` のバリデーションロジックの可読性・保守性を検証し、
必要があれば改善する。特に `weeklyError` / `monthlyError` の計算ロジック重複・
`useEffect` 依存配列・`isFormValid` の計算方法・`onValidationChange` JSDoc を対象とする。
変更の有無にかかわらず、観点ごとの判断記録を残す。

## 実行タスク

1. `weeklyError` と `monthlyError` の計算ロジックに重複がないか確認し、必要であれば共通化する
2. `useEffect` の依存配列が最適化されているかを確認し、不要な再実行リスクを排除する
3. `isFormValid` の計算方法を確認し、`useMemo` 採用の是非を判断する
4. `onValidationChange` プロップに JSDoc を追加または改善する
5. 必要な場合のみリファクタリングを実施し、動作仕様は変更しない
6. リファクタリング後に回帰テストと型チェックを実行する
7. 変更の有無にかかわらず `outputs/phase-8/refactoring-result.md` に判断を記録する

## リファクタリング観点

| 観点                            | 確認内容                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| weeklyError / monthlyError 重複 | 計算ロジックが複数箇所に分散していないか（DRY 原則）。共通ヘルパー関数に切り出せるか |
| useEffect 依存配列              | 依存配列に不足・過剰がないか。不要な再実行や無限ループのリスクがないか               |
| isFormValid の計算方法          | `useMemo` を用いてメモ化することで不要な再計算を防げるか。現状の計算コストを評価する |
| onValidationChange JSDoc        | プロップの型・呼び出しタイミング・引数の説明が JSDoc に正確に記述されているか        |
| コードスタイル一致              | 既存コードの命名規則（camelCase 等）・インデント・引用符スタイルと一致しているか     |

## 対象/Before/After/理由テーブル

変更の有無にかかわらず、観点ごとに判断を記録する。

| 対象                            | Before                         | After                                | 理由・判断                                             |
| ------------------------------- | ------------------------------ | ------------------------------------ | ------------------------------------------------------ |
| weeklyError / monthlyError 計算 | （Phase 5 実装時の状態を記録） | （変更後の状態を記録、変更なしも可） | 重複排除の必要性・共通ヘルパー化の是非を評価して記録   |
| useEffect 依存配列              | （Phase 5 実装時の状態を記録） | （変更後の状態を記録、変更なしも可） | 依存漏れ・過剰依存の有無を評価して記録                 |
| isFormValid の計算方法          | （Phase 5 実装時の状態を記録） | （変更後の状態を記録、変更なしも可） | useMemo 採用の費用対効果を評価して記録                 |
| onValidationChange JSDoc        | （Phase 5 実装時の状態を記録） | （変更後の状態を記録、変更なしも可） | 型・呼び出しタイミング・引数説明の完全性を評価して記録 |

> **注意**: 「変更なし」と判断した場合も、その理由を「理由・判断」欄に記録すること。

## 実行手順

### Step 1: weeklyError / monthlyError 重複確認

`VisualCronPicker` コンポーネント内の以下を確認する。

- `weeklyError` と `monthlyError` の計算ロジックが同一パターンか
- 共通ヘルパー関数（例: `getEmptySelectionError`）に切り出すことで DRY になるか
- 切り出した場合のテストへの影響を評価する

### Step 2: useEffect 依存配列の最適化確認

```typescript
// 確認観点
// 1. onValidationChange を依存配列に含めているか
// 2. validation 状態が変化するたびに正しく呼び出されるか
// 3. 不要な無限ループが発生しないか（useCallback の有無も確認）
```

### Step 3: isFormValid の計算方法確認

```typescript
// useMemo 採用検討
// Before: const isFormValid = !weeklyError && !monthlyError && ...
// After（候補）: const isFormValid = useMemo(() => !weeklyError && !monthlyError && ..., [weeklyError, monthlyError, ...])
// 計算コストが低い場合は useMemo 不要と判断してもよい
```

### Step 4: onValidationChange JSDoc 追加・改善

```typescript
// JSDoc 追加例
/**
 * バリデーション状態が変化したときに呼び出されるコールバック。
 * @param isValid - フォーム全体のバリデーション結果（true: 有効, false: 無効）
 * @remarks
 * weekly モードで曜日が未選択の場合は false が渡される。
 * monthly モードで日付が未選択の場合は false が渡される。
 */
onValidationChange?: (isValid: boolean) => void;
```

### Step 5: リファクタリング実施（必要な場合のみ）

観点確認で改善が必要と判断した場合のみ変更を行う。変更後は以下を実行する。

```bash
# テスト全件確認（リファクタリング後の回帰チェック）
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"

# 型チェック
pnpm --filter @repo/desktop typecheck
```

### Step 6: 変更記録の作成

変更の有無にかかわらず `outputs/phase-8/refactoring-result.md` に
対象/Before/After/理由テーブルを記録する。

## 統合テスト連携

本 Phase での変更は `VisualCronPicker` コンポーネントに限定し、
既存の入力/出力仕様（props インターフェース・バリデーション挙動）は維持する。
リファクタリング後は Phase 6 のテストと Phase 7 のカバレッジ結果を前提に、回帰の有無を確認する。

## リファクタリング禁止事項

- テストケースの期待値を変更しない
- バリデーション動作仕様（AC-1〜AC-8）を変更しない
- 既存テストを削除しない
- カバレッジを低下させる変更を行わない
- `onValidationChange` の呼び出しタイミング・引数の型を変更しない

## 多角的チェック観点

| 観点               | 確認内容                                                               |
| ------------------ | ---------------------------------------------------------------------- |
| DRY 原則           | weeklyError / monthlyError の計算ロジック重複が排除されていること      |
| React Hooks ルール | useEffect 依存配列が正確で ESLint の exhaustive-deps 警告がないこと    |
| パフォーマンス     | isFormValid の計算コストに対して useMemo 採用が適切か評価されること    |
| ドキュメント品質   | onValidationChange の JSDoc が型・タイミング・引数を正確に説明すること |

## 参照資料

| 資料名                   | パス                                       | 用途                       |
| ------------------------ | ------------------------------------------ | -------------------------- |
| Phase 1 要件定義         | `phase-1-requirements.md`                  | 要件・AC・前提確認         |
| Phase 2 設計             | `phase-2-design.md`                        | バリデーション設計方針確認 |
| Phase 5 実装結果レポート | `outputs/phase-5/implementation-result.md` | 変更内容の把握             |
| Phase 7 カバレッジ報告書 | `outputs/phase-7/coverage-report.md`       | 未到達ブロックの確認       |

## サブタスク管理

| #   | サブタスク                                      | 担当   | 状態 |
| --- | ----------------------------------------------- | ------ | ---- |
| 1   | weeklyError / monthlyError 重複確認・共通化判断 | 実装者 | 完了 |
| 2   | useEffect 依存配列の最適化確認                  | 実装者 | 完了 |
| 3   | isFormValid の計算方法確認・useMemo 採用判断    | 実装者 | 完了 |
| 4   | onValidationChange JSDoc 追加・改善             | 実装者 | 完了 |
| 5   | 改善が必要な場合にリファクタリング実施          | 実装者 | 完了 |
| 6   | リファクタリング後テスト全件 PASS 確認          | 実装者 | 完了 |
| 7   | `outputs/phase-8/refactoring-result.md` 作成    | 実装者 | 完了 |

## 成果物

| 成果物                       | パス                                    | 説明                                                                 |
| ---------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| リファクタリング結果レポート | `outputs/phase-8/refactoring-result.md` | 対象/Before/After/理由テーブル形式の変更記録（変更なしの場合も記録） |

## 完了条件

- [x] weeklyError / monthlyError 重複確認の判断が記録されていること
- [x] useEffect 依存配列の最適化確認の判断が記録されていること
- [x] isFormValid の計算方法確認・useMemo 採用判断が記録されていること
- [x] onValidationChange の JSDoc が追加または「変更不要」と判断が記録されていること
- [x] 対象/Before/After/理由テーブルが `outputs/phase-8/refactoring-result.md` に記録されていること
- [x] リファクタリング後（または変更なし確認後）も全テストが Green（PASS）であること
- [x] バリデーション動作仕様（AC-1〜AC-8）が変更されていないこと
- [x] `outputs/phase-8/refactoring-result.md` が作成されていること

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを 100% 実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次Phase

Phase 9: 品質保証
