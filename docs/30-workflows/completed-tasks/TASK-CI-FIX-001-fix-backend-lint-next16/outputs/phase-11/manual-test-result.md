# 手動テスト結果レポート: TASK-CI-FIX-001

## 1. 基本動作テスト

| #   | テスト内容            | 実行コマンド                            | 期待結果      | 結果 |
| --- | --------------------- | --------------------------------------- | ------------- | ---- |
| 1   | Backend lint 正常実行 | `pnpm --filter @repo/backend lint`      | exit code 0   | PASS |
| 2   | ルート lint 正常実行  | `pnpm lint`                             | exit code 0   | PASS |
| 3   | Backend typecheck     | `pnpm --filter @repo/backend typecheck` | exit code 0   | PASS |
| 4   | Backend test          | `pnpm --filter @repo/backend test:run`  | 全テスト PASS | PASS |

## 2. 機能テスト（正常系）

| TC-ID  | 機能                    | 期待結果                    | 結果 | 備考                 |
| ------ | ----------------------- | --------------------------- | ---- | -------------------- |
| TC-001 | Backend lint 実行       | exit code 0                 | PASS |                      |
| TC-003 | ルート lint 実行        | exit code 0                 | PASS | 既存 warning のみ    |
| TC-004 | ESLint 設定構文チェック | 設定が正しく解決される      | PASS |                      |
| TC-005 | Next.js 推奨ルール適用  | `@next/next/*` ルールが存在 | PASS | 20件以上確認         |
| TC-006 | キャッシュ動作          | 2回目が高速                 | PASS | 1965ms → 1468ms      |
| TC-007 | ignores 設定            | テストファイルが対象外      | PASS | `undefined` 返却確認 |

## 3. エラーハンドリングテスト（異常系）

| TC-ID  | 状況                       | 期待結果             | 結果 | 備考               |
| ------ | -------------------------- | -------------------- | ---- | ------------------ |
| TC-002 | `<img>` without alt in TSX | warning が報告される | PASS | 2件の warning 検出 |

## 4. 手動テスト中の発見・修正事項

| 発見  | 内容                                                     | 対応                            |
| ----- | -------------------------------------------------------- | ------------------------------- |
| 発見1 | `coverage/**` が ignores に含まれておらず warning が発生 | `coverage/**` を ignores に追加 |
