# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 8                               |
| Phase名    | リファクタリング                |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001 |
| 前提Phase  | Phase 7: テストカバレッジ確認   |
| 次Phase    | Phase 9: 品質保証               |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

## 目的

Phase 4〜7 で実装したバリデーション関数とテストコードを精査し、命名一貫性・重複排除・関数配置の最適化を行う。既存の `weeklyError` / `monthlyError` との命名統一を図り、将来の保守性を高める。

## 実行タスク

| Task     | 内容                                                                 |
| -------- | -------------------------------------------------------------------- |
| Task 8-1 | `validateCronSyntax` / `validateCronDayOfMonth` の関数配置・命名確認 |
| Task 8-2 | バリデーション関数のコンポーネント外分離の判断                       |
| Task 8-3 | `directInputError` フラグの命名一貫性確認                            |
| Task 8-4 | 既存 `weeklyError` / `monthlyError` との命名統一                     |
| Task 8-5 | テストコード整理（重複テストケースの排除・命名確認）                 |

## 参照資料

| 資料名             | パス                                                                                        | 用途                 |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------- |
| 実装ファイル       | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                        | リファクタリング対象 |
| テストファイル     | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` | テストコード確認     |
| 既存テストファイル | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`       | 命名パターン参照     |
| Phase 7 成果物     | `outputs/phase-7/coverage-report.md`                                                        | カバレッジ確認       |

## 実行手順

### 1. バリデーション関数の配置・命名レビュー

```bash
# バリデーション関数の定義箇所を確認
grep -n "validateCron\|directInputError\|weeklyError\|monthlyError" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx
```

**チェックリスト**:

| 確認項目                                        | 期待値                          | 結果    |
| ----------------------------------------------- | ------------------------------- | ------- |
| `validateCronSyntax` が camelCase               | `validateCronSyntax`            | pending |
| `validateCronDayOfMonth` が camelCase           | `validateCronDayOfMonth`        | pending |
| バリデーション関数がコンポーネント関数外に配置  | コンポーネント外 or useCallback | pending |
| `directInputError` が既存エラーフラグと命名統一 | `xxxError` パターン             | pending |
| JSDocコメントが存在する                         | `/**` から始まるコメント        | pending |

### 2. コンポーネント外分離の判断

バリデーション関数がコンポーネント内部に定義されている場合、以下の基準で分離判断を行う:

| 基準           | 分離する       | 分離しない             |
| -------------- | -------------- | ---------------------- |
| 状態への依存   | なし           | hooks / state を参照   |
| 再利用可能性   | 他で使う見込み | このコンポーネント専用 |
| テスタビリティ | 単体テスト必要 | 結合テストで十分       |
| 関数サイズ     | 10行以上       | 5行未満                |

### 3. 命名統一チェック

```bash
# 既存のエラーフラグ命名パターンを確認
grep -n "Error\b.*=" apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx

# エラーメッセージの命名パターンを確認
grep -n "error\|Error" apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx | head -30
```

**命名統一マトリクス**:

| 既存命名             | 新規命名           | 統一判定 |
| -------------------- | ------------------ | -------- |
| `weeklyError`        | `directInputError` | pending  |
| `monthlyError`       | -                  | pending  |
| エラーメッセージ形式 | -                  | pending  |

### 4. リファクタリング記録

| 対象             | Before | After | 理由 |
| ---------------- | ------ | ----- | ---- |
| （実行時に記録） | -      | -     | -    |

小規模タスクのため、リファクタリングが不要な場合は「変更なし」として記録する。

### 5. テストコード整理確認

```bash
# テストファイルの構造確認
grep -n "describe\|it(" \
  apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx
```

**確認ポイント**:

- `describe` ブロックの分類が適切か（syntax validation / day-of-month validation / mode switching）
- テスト名が英語で意味が明確か
- テストケースCV-01〜CV-12と仕様番号が対応しているか

### 6. バリデーション再実行

```bash
# リファクタ後のテスト再実行
pnpm --filter @repo/desktop test

# 型チェック再確認
pnpm --filter @repo/desktop typecheck

# lint確認
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

| 判定項目                     | 基準    | 結果    |
| ---------------------------- | ------- | ------- |
| 全テストPASS（リファクタ後） | PASS    | pending |
| 型チェック                   | PASS    | pending |
| lint                         | 0 error | pending |
| 既存テスト非破壊             | PASS    | pending |

## 多角的チェック観点

| 観点               | 確認内容                                                              |
| ------------------ | --------------------------------------------------------------------- |
| 命名一貫性         | `directInputError` が `weeklyError` / `monthlyError` と同一パターンか |
| 関数凝集度         | バリデーション関数が単一責務を維持しているか                          |
| テスタビリティ     | 分離後もテストが容易に書けるか                                        |
| 後方互換性         | visual モードのバリデーションに影響がないか                           |
| renderer環境安全性 | Node.js only モジュールを使用していないか                             |

## 成果物

| 成果物               | パス                                    | 説明                                    |
| -------------------- | --------------------------------------- | --------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | Before/After/理由テーブル・変更なし記録 |

## 完了条件

- [ ] `validateCronSyntax` / `validateCronDayOfMonth` の配置・命名レビュー完了
- [ ] コンポーネント外分離の判断を記録済み
- [ ] `directInputError` の命名一貫性を確認済み
- [ ] 既存 `weeklyError` / `monthlyError` との命名統一を確認済み
- [ ] テストコード整理確認完了
- [ ] リファクタリング記録（Before/After/理由テーブル）を作成済み
- [ ] リファクタ後のテスト・型チェック・lintが全PASS
- [ ] 既存テスト（VisualCronPicker.validation.test.tsx等）がFAILしていない
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
