# Phase 2: 設計

## タスクID: TASK-SW-CANCEL-001

## 設計結果

`SKILL_CREATOR_RUNTIME_CHANNELS` の `SKILL_CREATOR_PROGRESS` の直後に `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` を追加する設計を採用した。`IPC_CHANNELS` は既存のスプレッド構成のまま自動的に型伝播されるため、追加の設定変更は不要。

## 変更イメージ

```typescript
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_CANCEL: "skill-creator:cancel",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
} as const;
```

## 設計判断

- キー名は `SKILL_CREATOR_{ACTION}` 形式
- 値は `"skill-creator:{action}"` 形式
- 既存の `skill-creator:progress` と近い位置に置くことで、runtime 系チャンネルのまとまりを保つ

## 実装との整合

- `packages/shared/src/ipc/channels.ts` に実装済み
- `packages/shared/src/ipc/__tests__/channels-cancel.test.ts` で値・参照・重複を確認済み
