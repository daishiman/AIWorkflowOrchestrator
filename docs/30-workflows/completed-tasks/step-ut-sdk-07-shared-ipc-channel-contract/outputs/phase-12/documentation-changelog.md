# Phase 12: ドキュメント変更ログ

## タスク情報

- **タスクID**: TASK-UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001
- **実施日**: 2026-03-29

## 変更一覧

| ファイル                                                                     | 変更種別          | 理由                                               |
| ---------------------------------------------------------------------------- | ----------------- | -------------------------------------------------- |
| `packages/shared/src/ipc/channels.ts`                                        | Modified (add)    | `APPROVAL_CHANNELS`, `EXECUTION_CHANNELS` 定義追加 |
| `apps/desktop/src/preload/channels.ts`                                       | Modified (change) | import追加、3チャネルのリテラル→shared import置換  |
| `packages/shared/src/ipc/__tests__/channels.test.ts`                         | New               | shared定義値テスト、チャネル分離テスト、形式テスト |
| `apps/desktop/src/preload/channels.test.ts`                                  | Modified (add)    | allowlist分類テスト3件追加                         |
| `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | Modified (add)    | cross-layer parityテスト追加                       |
