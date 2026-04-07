# Phase 2 成果物: トポロジー図

## タスクID: UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

## チャンネル定義の依存トポロジー

```
packages/shared/src/ipc/channels.ts
  └── SKILL_CREATOR_RUNTIME_CHANNELS（正本）
        ├── SKILL_CREATOR_PROGRESS: "skill-creator:progress"
        ├── SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed"
        └── SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed"
  └── IPC_CHANNELS（統合オブジェクト）
        └── ...SKILL_CREATOR_RUNTIME_CHANNELS（スプレッド）

apps/desktop/src/preload/channels.ts
  └── import { SKILL_CREATOR_RUNTIME_CHANNELS } from "@repo/shared/src/ipc/channels"
  └── IPC_CHANNELS（preload 統合オブジェクト）
        └── ...SKILL_CREATOR_RUNTIME_CHANNELS（スプレッド）
  └── ALLOWED_ON_CHANNELS
        ├── IPC_CHANNELS.SKILL_CREATOR_PROGRESS
        ├── IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED
        └── IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED

apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts
  └── cross-layer parity テスト
        └── shared IPC_CHANNELS ↔ preload IPC_CHANNELS 文字列一致検証
```

## 依存方向

```
shared (正本) → preload (参照) → IPC handler (利用)
                              → ALLOWED_ON_CHANNELS (セキュリティゲート)
                              → renderer (イベント受信)
```

## 変更影響範囲

| レイヤー                 | 影響 | 理由                                  |
| ------------------------ | ---- | ------------------------------------- |
| shared チャンネル定義    | あり | `SKILL_CREATOR_RUNTIME_CHANNELS` 追加 |
| preload import           | あり | 直書き → shared import に切り替え     |
| IPC handler              | なし | チャンネル文字列値は変わらない        |
| renderer（イベント受信） | なし | チャンネル文字列値は変わらない        |
| ALLOWED_ON_CHANNELS      | なし | 参照先の文字列値が変わらないため      |
