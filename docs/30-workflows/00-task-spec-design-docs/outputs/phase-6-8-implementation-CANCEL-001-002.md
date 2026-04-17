# TASK-SW-CANCEL-001/002 実装成果物

## 実施日

2026-04-16

## 変更ファイル一覧

### 1. `packages/shared/src/ipc/channels.ts`

**変更箇所**: `SKILL_CREATOR_RUNTIME_CHANNELS` オブジェクト（195行付近）

**追加したチャンネル**:

```typescript
SKILL_CREATOR_CANCEL: "skill-creator:cancel",
```

変更後:

```typescript
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
  SKILL_CREATOR_CANCEL: "skill-creator:cancel",
} as const;
```

---

### 2. `apps/desktop/src/preload/skill-creator-api.ts`

**変更箇所1**: `SkillCreatorAPI` インターフェース末尾（392-396行）

追加したメソッド定義:

```typescript
/**
 * 生成中のスキル作成をキャンセルする
 * @returns キャンセル結果
 */
cancelGeneration: () => Promise<IpcResult<void>>;
```

**変更箇所2**: `skillCreatorAPI` 実装オブジェクト末尾（725-726行）

追加した実装:

```typescript
cancelGeneration: (): Promise<IpcResult<void>> =>
  safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL),
```

**実装方針**: 既存の `safeInvoke` パターン（`invokeWithTimeout` のラッパー）を踏襲し、`ALLOWED_INVOKE_CHANNELS` を通じてホワイトリスト検証を経由して Main プロセスへ invoke する。

---

### 3. `apps/desktop/src/preload/channels.ts`

**変更箇所**: `ALLOWED_INVOKE_CHANNELS` 配列（695-697行）

既存の SKILL_CREATOR 系チャンネル群（`SKILL_CREATOR_GET_GOVERNANCE_STATE`）の直後に追加:

```typescript
// Skill Creator cancel (TASK-SW-CANCEL-001)
IPC_CHANNELS.SKILL_CREATOR_CANCEL,
```

---

## 追加したチャンネル文字列

| キー                   | 値                       |
| ---------------------- | ------------------------ |
| `SKILL_CREATOR_CANCEL` | `"skill-creator:cancel"` |

## ALLOWED_INVOKE_CHANNELS への追加確認

`ALLOWED_INVOKE_CHANNELS` 配列の697行目に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` を追加済み。
`SKILL_CREATOR_RUNTIME_CHANNELS` に追加されたため、`IPC_CHANNELS` オブジェクト内の `...SKILL_CREATOR_RUNTIME_CHANNELS` スプレッドにより自動的に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` として参照可能。

## 変更サマリー

| ファイル                                        | 変更種別 | 内容                                                                                                               |
| ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `packages/shared/src/ipc/channels.ts`           | 追加     | `SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL` エントリ追加                                            |
| `apps/desktop/src/preload/skill-creator-api.ts` | 追加     | `SkillCreatorAPI` インターフェースに `cancelGeneration` 定義追加、`skillCreatorAPI` 実装に `cancelGeneration` 追加 |
| `apps/desktop/src/preload/channels.ts`          | 追加     | `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` 追加                                              |
