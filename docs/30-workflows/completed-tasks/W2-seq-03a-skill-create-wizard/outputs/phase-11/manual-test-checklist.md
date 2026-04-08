# 手動テスト チェックリスト

## 事前確認

- [x] Phase 5 実装が完了している
- [x] TypeScript 型チェックが通過している（`pnpm --filter @repo/desktop typecheck`）

## 自動テスト実行

- [x] `pnpm --filter @repo/desktop exec vitest run src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts` を実行した
- [x] 全テストが PASS した
- [x] テスト件数・実行時刻を記録した

## 受入基準確認

- [x] AC-1: `resolveHealthPolicy()` が `useMainlineExecutionAccess` 内で呼び出されている
- [x] AC-2: `buildMainlineExecutionAccessState()` に `healthPolicy` が渡されている
- [x] AC-3: `apiKeyDegraded` 独自算出ロジック（L117-120）が削除されている
- [x] AC-4: `@repo/shared/types` 経由でインポートしている
- [x] AC-5: 既存のユニットテストがすべて PASS している
- [x] AC-6: TypeScript 型チェックがエラーなく通過している

## NON_VISUAL 確認

- [x] UI コンポーネントへの変更がないことを確認した
- [x] スクリーンショット不要であることを確認した
- [x] `screenshot-plan.json` を生成しないことを確認した

## 完了確認

- [x] `manual-test-result.md` を作成・記入した
- [x] `discovered-issues.md` を作成した（0件でも作成必須）
