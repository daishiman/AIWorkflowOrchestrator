# Phase 13: PR作成・CI確認

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 13                              |
| Phase名    | PR作成・CI確認                  |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001 |
| 前提Phase  | Phase 12: ドキュメント更新      |
| 次Phase    | -（本タスクでは実行しない）     |
| ステータス | blocked                         |
| 作成日     | 2026-04-14                      |

## 重要: 実行制約（CONST_002 準拠）

**Phase 13 はユーザー指示があるまで実行禁止です。**

commit / push / PR 作成は本タスクのスコープ外とする。ユーザーが明示的に承認した場合のみ、別途実施する。

## 目的

ローカルでの最終品質確認結果を記録し、PR作成に必要な情報を整理する。実際の commit / push / PR 作成はユーザー承認後にのみ実行する。

## 実行タスク

| Task      | 内容                                                    |
| --------- | ------------------------------------------------------- |
| Task 13-1 | ローカル確認チェックリスト（build/test/typecheck/lint） |
| Task 13-2 | 変更サマリ（PR本文のための内容）                        |
| Task 13-3 | CI通過確認手順の整理                                    |
| Task 13-4 | PR作成ゲート保持（blocked状態の記録）                   |

## 実行手順

### 1. ローカル確認チェックリスト

```bash
# ビルド確認
pnpm --filter @repo/desktop build

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint

# テスト
pnpm --filter @repo/desktop test
```

| チェック項目 | コマンド                                | 期待結果 | 判定    |
| ------------ | --------------------------------------- | -------- | ------- |
| ビルド       | `pnpm --filter @repo/desktop build`     | 成功     | pending |
| 型チェック   | `pnpm --filter @repo/desktop typecheck` | PASS     | pending |
| lint         | `pnpm --filter @repo/desktop lint`      | 0 error  | pending |
| テスト       | `pnpm --filter @repo/desktop test`      | 全PASS   | pending |

### 2. 変更サマリ

**変更概要**: direct input / custom cron モードへの月次バリデーション追加

**変更ファイル**:

| ファイル                                                                                    | 変更内容                                                                                                                       |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                        | direct input モードのバリデーションロジック追加（`validateCronSyntax`, `validateCronDayOfMonth`, `directInputError` 状態管理） |
| `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` | カスタムバリデーションテスト（CV-01〜CV-12）                                                                                   |

**PR本文テンプレート**:

```markdown
## Summary

- direct input（高度な設定）モードでcron式入力時のバリデーション機能を追加
- 空文字、フィールド数不正、day-of-month範囲外（0, 32以上）のエラー検出
- `onValidationChange` コールバックによるバリデーション状態の外部通知

## Changes

- `VisualCronPicker.tsx`: `validateCronSyntax` / `validateCronDayOfMonth` 関数追加、`directInputError` 状態管理
- `VisualCronPicker.customValidation.test.tsx`: 12テストケース（CV-01〜CV-12）

## Acceptance Criteria

- [x] AC-1: 空文字入力時エラー表示 + onValidationChange(false)
- [x] AC-2: フィールド数≠5でエラー + onValidationChange(false)
- [x] AC-3: day-of-month=0でエラー + onValidationChange(false)
- [x] AC-4: day-of-month≧32でエラー + onValidationChange(false)
- [x] AC-5: 有効cron式で正常 + onValidationChange(true)
- [x] AC-6: 非数値day-of-monthはエラー非表示
- [x] AC-7: visual→direct切替時にバリデーション再計算
- [x] AC-8: onValidationChange未定義でもエラーなし

## Test Plan

- 12 unit tests (CV-01〜CV-12) all passing
- Manual testing with Electron app (SC-01〜SC-05 screenshots)
- No regression in existing VisualCronPicker tests
```

### 3. ブランチ名（推奨）

```
feat/task-cron-custom-validation-001
```

### 4. CI通過確認手順

PR作成後、以下のCI項目の通過を確認する:

| CI項目    | 期待結果 |
| --------- | -------- |
| typecheck | PASS     |
| lint      | PASS     |
| test      | 全件PASS |
| build     | PASS     |

### 5. PR作成方法

ユーザー承認後、以下のコマンドで PR を作成する:

```bash
# /ai:diff-to-pr を使用
```

## 禁止事項

- [ ] commit を実行していない
- [ ] push を実行していない
- [ ] PR 作成を実行していない

**上記はユーザーの明示的な承認があるまで実行禁止です。**

## 参照資料

| 資料名             | パス                                          | 説明           |
| ------------------ | --------------------------------------------- | -------------- |
| 最終レビュー       | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト         | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| スクリーンショット | `outputs/phase-11/screenshots/`               | Phase 11証跡   |
| ドキュメント       | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`    | Phase 12成果物 |

## 成果物

| 成果物           | パス                                     | 説明                                 |
| ---------------- | ---------------------------------------- | ------------------------------------ |
| 変更サマリ       | `outputs/phase-13/change-summary.md`     | PR本文用の変更内容サマリ             |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | build/test/typecheck/lint の結果記録 |

## 完了条件

- [ ] ローカル確認結果を記録した（build/test/typecheck/lint）
- [ ] 変更サマリを記録した
- [ ] CI通過確認手順を整理した
- [ ] commit / push / PR を実行していない
- [ ] blocked 状態を記録した
- [ ] 本Phase内の全タスクを100%実行完了（blocked gate）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ユーザーの許可なしに commit / push / PR を実行していない
- [ ] 実行記録を残した

## タスク完了

Phase 13 は **blocked**。ユーザー承認後にのみ `/ai:diff-to-pr` を使用して PR 作成へ進む。
