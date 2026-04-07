# Phase 2 成果物: 設計書

## タスクID: UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

## 1. shared チャンネル定義設計

### SKILL_CREATOR_RUNTIME_CHANNELS オブジェクト設計

```typescript
/**
 * スキルクリエイター runtime 系のIPCチャネル
 * preload の直書きを廃止し、shared を正本とする。
 * @see apps/desktop/src/preload/channels.ts
 */
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
} as const;
```

### キー対応表

| 定数名                                 | 文字列値                                 |
| -------------------------------------- | ---------------------------------------- |
| `SKILL_CREATOR_PROGRESS`               | `"skill-creator:progress"`               |
| `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` | `"skill-creator:workflow-state-changed"` |
| `SKILL_CREATOR_ADAPTER_STATUS_CHANGED` | `"skill-creator:adapter-status-changed"` |

### IPC_CHANNELS スプレッドへの追加

既存の `SKILL_CREATOR_SESSION_CHANNELS`・`SKILL_CREATOR_EXTERNAL_API_CHANNELS` の直後に追加:

```typescript
export const IPC_CHANNELS = {
  ...SKILL_CREATOR_SESSION_CHANNELS,
  ...SKILL_CREATOR_EXTERNAL_API_CHANNELS,
  ...SKILL_CREATOR_RUNTIME_CHANNELS, // ← 追加
  // ...
} as const;
```

### 既存命名との衝突確認

- `SKILL_CREATOR_SESSION_CHANNELS`（session 系）: 衝突なし
- `SKILL_CREATOR_EXTERNAL_API_CHANNELS`（external-api 系）: 衝突なし
- `SKILL_CREATOR_OUTPUT_READY` 等（standalone const）: 衝突なし

## 2. preload import 変更設計

### 変更前後の import

```typescript
// 変更後（実装済み）
// Skill Creator runtime 系チャンネルは shared 正本を参照（直書き禁止）
import {
  APPROVAL_CHANNELS,
  EXECUTION_CHANNELS,
  SKILL_CREATOR_EXTERNAL_API_CHANNELS,
  SKILL_CREATOR_OUTPUT_READY,
  SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED,
  SKILL_CREATOR_OPEN_SKILL,
  SKILL_CREATOR_SESSION_CHANNELS,
  SKILL_CREATOR_RUNTIME_CHANNELS, // ← 追加
} from "@repo/shared/src/ipc/channels";
```

### ALLOWED_ON_CHANNELS の参照継続

```typescript
// 変更不要: IPC_CHANNELS.SKILL_CREATOR_* 経由で引き続き参照可能
IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
```

### export 方針

- named export のみ
- root barrel への re-export なし
- `@repo/shared/src/ipc/channels` を import パスの正とする

## 3. テスト設計

### テストファイル対応

| テストファイル                                                               | テスト内容                         |
| ---------------------------------------------------------------------------- | ---------------------------------- |
| `packages/shared/src/ipc/__tests__/channels.test.ts`                         | TC-01〜TC-06（値・型・スプレッド） |
| `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | TC-07〜TC-09（cross-layer parity） |
| `apps/desktop/src/preload/channels.test.ts`                                  | ALLOWED_ON_CHANNELS 回帰テスト     |
