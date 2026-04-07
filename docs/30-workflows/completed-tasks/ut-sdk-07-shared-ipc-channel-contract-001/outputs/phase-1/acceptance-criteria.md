# Phase 1 成果物: 受入基準

## タスクID: UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

## 受入基準 AC-1〜AC-7

| AC   | 基準                                                                                                          | 充足状況    |
| ---- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| AC-1 | `SKILL_CREATOR_PROGRESS` が `packages/shared/src/ipc/channels.ts` に定義されている                            | ✅ 確認済み |
| AC-2 | `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が `packages/shared/src/ipc/channels.ts` に定義されている              | ✅ 確認済み |
| AC-3 | `SKILL_CREATOR_ADAPTER_STATUS_CHANGED` が `packages/shared/src/ipc/channels.ts` に定義されている              | ✅ 確認済み |
| AC-4 | `apps/desktop/src/preload/channels.ts` が 3 チャンネルを `@repo/shared/src/ipc/channels` から import している | ✅ 確認済み |
| AC-5 | cross-layer parity テストが全 3 チャンネルで pass する                                                        | ✅ 確認済み |
| AC-6 | 既存の IPC handler / preload API / ALLOWED_ON_CHANNELS に破壊的変更がない                                     | ✅ 確認済み |
| AC-7 | `packages/shared/src/ipc/channels.ts` の `IPC_CHANNELS` に 3 チャンネルが含まれている                         | ✅ 確認済み |

## タスク分類

- **分類**: code task（NON_VISUAL）
- **理由**: UI 変更なし。channel 定義の移行は型安全性・文字列値・import パスの変更のみ。renderer 側の表示コンポーネントや UI レイアウトには一切変更がない。
- **Phase 11 対応**: NON_VISUAL 証跡として vitest / typecheck / lint / parity テストを使用する。

## Artifact 命名 canonical 一覧

| Artifact                     | パス                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| shared channels（修正済み）  | `packages/shared/src/ipc/channels.ts`                                        |
| preload channels（修正済み） | `apps/desktop/src/preload/channels.ts`                                       |
| shared channels テスト       | `packages/shared/src/ipc/__tests__/channels.test.ts`                         |
| preload channels テスト      | `apps/desktop/src/preload/channels.test.ts`                                  |
| cross-layer parity テスト    | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` |
