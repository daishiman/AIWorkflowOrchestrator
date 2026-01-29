# 発見課題リスト: TASK-CI-FIX-001

## 手動テスト中の発見事項

### 1. coverage ディレクトリの lint 対象化（修正済み）

- **概要**: `pnpm --filter @repo/backend test:coverage` で生成される `coverage/` ディレクトリ内の JS ファイルが lint 対象になっていた
- **影響**: 3件の "Unused eslint-disable directive" warning が発生
- **対応**: `eslint.config.mjs` の ignores に `"coverage/**"` を追加して解消済み
- **ステータス**: 修正済み（本タスク内）

### 2. ルート lint の `.eslintignore` 非推奨警告（スコープ外）

- **概要**: ルートの `pnpm lint` 実行時に `The ".eslintignore" file is no longer supported` 警告が表示
- **影響**: 動作には影響なし（warning のみ）
- **対応**: 本タスクのスコープ外。`.eslintignore` → `eslint.config.js` の `ignores` に移行する別タスクが必要
- **ステータス**: 未タスク検出レポートに記録

### 3. packages/shared の `@typescript-eslint/no-explicit-any` warning（スコープ外）

- **概要**: ルートの `pnpm lint` で `packages/shared` に4件の `no-explicit-any` warning
- **影響**: 本タスクの変更とは無関係（既存の warning）
- **対応**: 本タスクのスコープ外
- **ステータス**: 既知の問題
