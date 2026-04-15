# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 9                               |
| Phase名    | 品質保証                        |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001 |
| 前提Phase  | Phase 8: リファクタリング       |
| 次Phase    | Phase 10: 最終レビューゲート    |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

## 目的

静的解析・型チェック・lint・テストを一括実行し、品質ゲートを通過していることを確認する。renderer環境制約の遵守を検証し、Phase 10 への進行可否を判定する。

## 実行タスク

| Task     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| Task 9-1 | `pnpm --filter @repo/desktop lint` 実行               |
| Task 9-2 | `pnpm --filter @repo/desktop typecheck` 実行          |
| Task 9-3 | `pnpm --filter @repo/desktop test` 全件PASS確認       |
| Task 9-4 | renderer環境制約確認（Node.jsモジュール非使用の確認） |
| Task 9-5 | 既存テストへのリグレッション確認                      |
| Task 9-6 | Phase 10 ブロッカー確認                               |

## 参照資料

| 資料名             | パス                                                                                        | 用途                     |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 8 成果物     | `outputs/phase-8/refactoring-record.md`                                                     | リファクタリング結果確認 |
| 実装ファイル       | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                        | 最終コード確認           |
| テストファイル     | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` | テスト実行対象           |
| 既存テストファイル | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx`       | リグレッション確認       |

## 実行手順

### 1. 静的解析一括実行

```bash
# lint
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト（全件実行）
pnpm --filter @repo/desktop test
```

### 2. 品質ゲートチェックリスト

| チェック項目                                       | 基準              | 結果    |
| -------------------------------------------------- | ----------------- | ------- |
| ESLint                                             | エラー0件         | pending |
| TypeScript型チェック                               | エラー0件         | pending |
| ユニットテスト（CV-01〜CV-12）                     | 全件PASS          | pending |
| 既存テスト（VisualCronPicker.validation.test.tsx） | PASS              | pending |
| renderer環境制約                                   | Node.js only なし | pending |

### 3. renderer環境制約確認

```bash
# Node.js only モジュールのインポートがないことを確認
grep -n "require('fs')\|require('path')\|require('child_process')\|import.*from 'fs'\|import.*from 'path'\|import.*from 'child_process'" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx

# electron main process API の直接使用がないことを確認
grep -n "ipcMain\|BrowserWindow\|app\." \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx
```

期待: 該当なし（renderer環境で安全）

### 4. リグレッション確認

```bash
# 既存のバリデーションテストを個別実行
pnpm --filter @repo/desktop exec vitest run \
  src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx

# カスタムバリデーションテストを個別実行
pnpm --filter @repo/desktop exec vitest run \
  src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx
```

### 5. Phase 10 ブロッカー確認

| ブロッカー候補           | 状況    |
| ------------------------ | ------- |
| 型エラーあり             | pending |
| lint エラーあり          | pending |
| テスト失敗あり           | pending |
| renderer制約違反あり     | pending |
| 既存テストリグレッション | pending |

## 統合テスト連携

| 判定項目                 | 基準     | 結果    |
| ------------------------ | -------- | ------- |
| lint                     | 0 error  | pending |
| typecheck                | PASS     | pending |
| ユニットテスト全件       | 全件PASS | pending |
| 既存テストリグレッション | なし     | pending |
| renderer環境制約         | 違反なし | pending |
| Phase 10 ブロッカー      | なし     | pending |

## 多角的チェック観点

| 観点             | 確認内容                                                 |
| ---------------- | -------------------------------------------------------- |
| 型安全性         | `onValidationChange` のオプショナル呼び出しが型安全か    |
| テスト網羅性     | AC-1〜AC-8 の全受入条件がテストでカバーされているか      |
| 環境分離         | renderer プロセスで許可されたAPIのみを使用しているか     |
| パフォーマンス   | バリデーション関数が入力ごとに不要な再計算をしていないか |
| アクセシビリティ | `role="alert"` が正しく使用されているか                  |

## 成果物

| 成果物           | パス                                | 説明                                                |
| ---------------- | ----------------------------------- | --------------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 静的解析・テスト結果・renderer制約・Phase10進行可否 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` がエラー0件
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー0件
- [ ] `pnpm --filter @repo/desktop test` が全件PASS
- [ ] renderer環境制約を確認済み（Node.js only モジュール非使用）
- [ ] 既存テスト（VisualCronPicker.validation.test.tsx等）にリグレッションなし
- [ ] Phase 10 ブロッカーなし
- [ ] 品質保証レポート作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

→ [Phase 10: 最終レビューゲート](./phase-10-final-review.md)
