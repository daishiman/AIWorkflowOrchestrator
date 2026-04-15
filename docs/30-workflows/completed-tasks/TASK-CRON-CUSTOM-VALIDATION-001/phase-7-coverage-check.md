# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 7                               |
| Phase名    | カバレッジ確認                  |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001 |
| 前提Phase  | Phase 6: テスト拡充             |
| 次Phase    | Phase 8: リファクタリング       |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

## 目的

`VisualCronPicker.tsx` のバリデーション実装に対するカバレッジを計測し、
Line 80%以上の目標を達成していることを確認する。
未カバー箇所がある場合は記録し、既存テストのリグレッションがないことも確認する。

## 実行タスク

- Task 1: カバレッジ計測 — `VisualCronPicker.tsx` の変更ブロックを対象に計測
- Task 2: 未到達コード分析 — Line/Branch/Function カバレッジの確認
- Task 3: カバレッジ目標との照合 — Line 80%以上の充足確認
- Task 4: 既存テストリグレッション確認 — `VisualCronPicker.validation.test.tsx` の全PASS確認
- Task 5: カバレッジレポート作成

## 参照資料

| 資料名                       | パス                                                                                        | 用途               |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| 実装ファイル                 | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                        | カバレッジ対象     |
| カスタムバリデーションテスト | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` | テスト件数確認     |
| 既存バリデーションテスト     | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`       | リグレッション確認 |

## 実行手順

### 1. カバレッジ計測コマンド

```bash
# VisualCronPicker 全テスト + カバレッジ計測
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="VisualCronPicker"
```

### 2. カバレッジ目標

> カバレッジ対象は `VisualCronPicker.tsx` 全体。
> 特に変更した関数/ブロック（`validateCronSyntax` + `validateCronDayOfMonth` + `directInputError` 判定 + エラー表示）に注目。

| 計測対象                        | Line | Branch | Function |
| ------------------------------- | ---- | ------ | -------- |
| `validateCronSyntax()` 関数     | 100% | 100%   | 100%     |
| `validateCronDayOfMonth()` 関数 | 100% | 100%   | 100%     |
| エラー表示ブロック              | 100% | 100%   | N/A      |
| `VisualCronPicker.tsx` 全体     | 80%+ | 60%+   | 80%+     |

### 3. 計測結果記録（実行時に記入）

| 計測対象                        | Line | Branch | Function | 判定    |
| ------------------------------- | ---- | ------ | -------- | ------- |
| `validateCronSyntax()` 関数     | -    | -      | -        | pending |
| `validateCronDayOfMonth()` 関数 | -    | -      | -        | pending |
| エラー表示ブロック              | -    | -      | -        | pending |
| `VisualCronPicker.tsx` 全体     | -    | -      | -        | pending |

### 4. 未到達コード分析

```bash
# テキスト形式でカバレッジレポート出力
pnpm --filter @repo/desktop test -- \
  --coverage \
  --coverage.reporter=text \
  --testPathPattern="VisualCronPicker" 2>&1 | grep -A 10 "VisualCronPicker.tsx"
```

期待: `validateCronSyntax` / `validateCronDayOfMonth` / エラー表示ブロックの行が全て covered

### 5. 既存テストリグレッション確認

```bash
# 既存バリデーションテストの回帰確認
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker.validation"
# 期待: 全PASS

# VisualCronPicker 関連テスト全体の確認
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"
# 期待: 全PASS（CV-01〜CV-20 + 既存テスト全件）
```

### 6. カバレッジ不足時の対応

80%未満の場合は以下を実施:

1. 未到達行の特定
2. 追加テストケースの検討
3. Phase 6 に戻ってテスト追加（必要に応じて）
4. 再計測して目標達成を確認

## 統合テスト連携

| 判定項目                                        | 基準   | 結果    |
| ----------------------------------------------- | ------ | ------- |
| VisualCronPicker.tsx Line カバレッジ            | 80%+   | pending |
| validateCronSyntax Line カバレッジ              | 100%   | pending |
| validateCronDayOfMonth Line カバレッジ          | 100%   | pending |
| 既存テスト（validation.test.tsx）リグレッション | 全PASS | pending |

## 多角的チェック観点

| チェック観点           | 確認内容                                                             | 結果    |
| ---------------------- | -------------------------------------------------------------------- | ------- |
| カバレッジ目標達成     | Line 80%以上を達成しているか                                         | pending |
| バリデーション関数100% | validateCronSyntax / validateCronDayOfMonth が100%カバーされているか | pending |
| 分岐カバレッジ         | 空文字・フィールド数不足・dom範囲外の各分岐がカバーされているか      | pending |
| リグレッション         | 既存テストが全てPASSしているか                                       | pending |
| 未到達コードの妥当性   | 未到達コードがある場合、それが本タスクの変更範囲外であるか           | pending |

## 成果物

| 成果物             | パス                                 | 説明                                           |
| ------------------ | ------------------------------------ | ---------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・未到達コード分析・リグレッション判定 |

## 完了条件

- [ ] カバレッジ計測が完了している
- [ ] `VisualCronPicker.tsx` の Line カバレッジが80%以上
- [ ] `validateCronSyntax()` が Line/Branch/Function 100% 達成
- [ ] `validateCronDayOfMonth()` が Line/Branch/Function 100% 達成
- [ ] 未到達コードがない（または未到達がある場合は理由を記録）
- [ ] 既存テスト（VisualCronPicker.validation.test.tsx）のリグレッションなし
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
