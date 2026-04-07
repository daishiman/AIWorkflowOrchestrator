# Phase 1 成果物: スコープ定義

## タスクID: UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

## スコープ（含む）

- `packages/shared/src/ipc/channels.ts` への `SKILL_CREATOR_RUNTIME_CHANNELS` 定義追加
- `apps/desktop/src/preload/channels.ts` の import 切り替え（直書き → shared import）
- shared channel のユニットテスト
- cross-layer parity テスト（shared ↔ preload 文字列一致検証）
- Phase 1〜12 の成果物出力

## 非スコープ（含まない）

- IPC handler ロジックの変更
- preload API の機能追加
- 新規チャンネルの設計（既存 3 チャンネルの parity 修正のみ）
- renderer 側の消費コード変更
- commit / PR 作成 / push（Phase 13 で user approval があるまで実行しない）

## 後方互換性要件

| 要件                         | 説明                                                             |
| ---------------------------- | ---------------------------------------------------------------- |
| 既存テスト影響ゼロ           | 既存の approval / execution handler テストが全て PASS すること   |
| IPC handler 影響ゼロ         | `approvalHandlers`・`executionHandlers` に変更を加えないこと     |
| ALLOWED_ON_CHANNELS 影響ゼロ | 3 チャンネルへの参照が引き続き同じ文字列値で機能すること         |
| 文字列値変更禁止             | 移行後も `"skill-creator:progress"` 等の文字列値が変わらないこと |
