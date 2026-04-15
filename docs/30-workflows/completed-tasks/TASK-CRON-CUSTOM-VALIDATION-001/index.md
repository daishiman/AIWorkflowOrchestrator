# TASK-CRON-CUSTOM-VALIDATION-001: direct input / custom cron モードへの月次バリデーション追加

## メタ情報

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | TASK-CRON-CUSTOM-VALIDATION-001                             |
| タスク名     | direct input / custom cron モードへの月次バリデーション追加 |
| 分類         | 改善                                                        |
| 対象機能     | スケジュール設定 / VisualCronPicker advanced モード         |
| 優先度       | 中                                                          |
| 見積もり規模 | 小規模                                                      |
| ステータス   | pending                                                     |
| 作成日       | 2026-04-14                                                  |
| 依存タスク   | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001（完了済み）         |

---

## タスク概要

`VisualCronPicker` の **direct input モード**（`isAdvancedMode=true`）で入力されたcron式にバリデーションが存在しない問題を解消する。現状、`handleDirectInputChange` は入力値をそのまま `onChange(val)` で渡すのみであり、`weeklyError`/`monthlyError` が `!isAdvancedMode` 条件により強制的に false になるため `isFormValid` が常に true となる。結果として無効なcron式でも `onValidationChange(true)` が通知され続ける。

### 目的

direct input モードでもcron式のバリデーションを行い、visual モードと同等の安全性を確保する。

### 背景・問題ケース

| ケース                              | 現状の挙動                     | 問題                       |
| ----------------------------------- | ------------------------------ | -------------------------- |
| フィールド数不足（"\* \* \* \*"）   | onValidationChange(true)が通知 | 無効なcron式が保存される   |
| day-of-month範囲外（"0 9 0 \* \*"） | onValidationChange(true)が通知 | 無効な日付指定が保存される |
| 空文字入力                          | onValidationChange(true)が通知 | 空文字でバリデーション通過 |
| visual→direct切り替え               | isFormValidがtrueにリセット    | 保存ボタンが誤って活性化   |

### スコープ

**含む:**

- `VisualCronPicker.tsx` の `handleDirectInputChange` へのバリデーション追加
- `directInputError` フラグ（空文字/syntax不正/day-of-month範囲外）
- direct input モードでのエラーメッセージ表示（`role="alert"`）
- `isFormValid` への `directInputError` の組み込み
- バリデーション状態をカバーするユニットテスト（Vitest/React Testing Library）
- Phase 11 スクリーンショット証跡（VISUALタスクのため必須）

**含まない:**

- cronパーサーライブラリ導入（renderer環境制約）
- `cronConverter.ts` 側への変更
- visual モードのバリデーション変更（既実装済み）
- E2E/Playwrightテスト

---

## 変更対象ファイル

| ファイル                                                                                    | 変更内容           | 種別 |
| ------------------------------------------------------------------------------------------- | ------------------ | ---- |
| `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                        | バリデーション追加 | 変更 |
| `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` | 新規テスト         | 新規 |

---

## Phase一覧

| Phase | 名称               | 仕様書                                                       | ステータス |
| ----- | ------------------ | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義           | [phase-1-requirements.md](phase-1-requirements.md)           | pending    |
| 2     | 設計               | [phase-2-design.md](phase-2-design.md)                       | pending    |
| 3     | 設計レビューゲート | [phase-3-design-review.md](phase-3-design-review.md)         | pending    |
| 4     | テスト作成         | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending    |
| 5     | 実装               | [phase-5-implementation.md](phase-5-implementation.md)       | pending    |
| 6     | テスト拡充         | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending    |
| 7     | カバレッジ確認     | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング   | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending    |
| 9     | 品質保証           | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビューゲート | [phase-10-final-review.md](phase-10-final-review.md)         | pending    |
| 11    | 手動テスト         | [phase-11-manual-test.md](phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新   | [phase-12-documentation.md](phase-12-documentation.md)       | pending    |
| 13    | PR作成             | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | pending    |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-CRON-CUSTOM-VALIDATION-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                          |
| ----- | ----------------------------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, P50チェック結果（既実装コード調査）, トレーサビリティ行列 |
| 2     | バリデーション関数設計, directInputError設計, エラーメッセージ設計                  |
| 3     | 設計レビュー結果, ゲート判定, 矛盾チェック表                                        |
| 4     | -                                                                                   |
| 5     | -                                                                                   |
| 6     | -                                                                                   |
| 7     | -                                                                                   |
| 8     | -                                                                                   |
| 9     | -                                                                                   |
| 10    | -                                                                                   |
| 11    | -                                                                                   |
| 12    | -                                                                                   |
| 13    | -                                                                                   |

---

_このファイルは task-specification-creator によって生成されました。_
_最終更新: 2026-04-14_
