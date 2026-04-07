# Phase 11 成果物: 手動テストチェックリスト

## タスクID: UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

## タスク分類: NON_VISUAL

本タスクは UI 変更を伴わないため NON_VISUAL として分類する。
スクリーンショットは取得しない。自動テスト結果を primary evidence とする。

## テストケース一覧

| TC-ID | 分類       | 確認内容                                      | evidence                                                                            | 結果    |
| ----- | ---------- | --------------------------------------------- | ----------------------------------------------------------------------------------- | ------- |
| TC-1  | NON_VISUAL | shared vitest 全 PASS                         | `npx vitest run packages/shared/src/ipc/__tests__/channels.test.ts` → 17 tests PASS | ✅ PASS |
| TC-2  | NON_VISUAL | desktop vitest 全 PASS                        | `npx vitest run apps/desktop/src/preload/channels.test.ts` → 19 tests PASS          | ✅ PASS |
| TC-3  | NON_VISUAL | cross-layer parity テスト 3 チャンネル全 PASS | `npx vitest run governance-bundle.test.ts` → 20 tests PASS（parity 含む）           | ✅ PASS |
| TC-4  | NON_VISUAL | shared typecheck エラー 0 件                  | `pnpm --filter @repo/shared typecheck` → エラーなし                                 | ✅ PASS |
| TC-5  | NON_VISUAL | desktop typecheck エラー 0 件                 | `pnpm --filter @repo/desktop typecheck` → エラーなし                                | ✅ PASS |
| TC-6  | NON_VISUAL | shared lint エラー 0 件                       | `pnpm --filter @repo/shared lint` → エラーなし                                      | ✅ PASS |
| TC-7  | NON_VISUAL | desktop lint エラー 0 件                      | `pnpm --filter @repo/desktop lint` → 確認済み                                       | ✅ PASS |
