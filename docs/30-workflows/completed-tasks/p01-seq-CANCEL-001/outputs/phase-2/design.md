# 設計書 - TASK-SW-CANCEL-001

## メタ情報

| 項目     | 内容                                  |
| -------- | ------------------------------------- |
| タスクID | TASK-SW-CANCEL-001                    |
| 機能名   | skill-creator-cancel-channel-constant |
| 作成日   | 2026-04-15                            |
| Phase    | 2                                     |

## 1. 追加対象ファイル

`packages/shared/src/ipc/channels.ts`

## 2. 追加位置

`SKILL_CREATOR_RUNTIME_CHANNELS` オブジェクト内の `SKILL_CREATOR_PROGRESS` の直後（196行目付近）。

理由: キャンセルと進捗は実行時の状態管理に関連するため、近接した位置に配置するのが可読性上望ましい。

## 3. 追加する定数

```typescript
SKILL_CREATOR_CANCEL: "skill-creator:cancel",
```

## 4. 命名規則の確認

既存パターン:

- `SKILL_CREATOR_PROGRESS: "skill-creator:progress"`
- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed"`
- `SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed"`

`"skill-creator:{action}"` 形式に準拠。`cancel` は動詞でアクションを明示しており適切。

## 5. 型伝播の確認

`IPC_CHANNELS` は `...SKILL_CREATOR_RUNTIME_CHANNELS` でスプレッドしているため、追加後は自動で `IPC_CHANNELS.SKILL_CREATOR_CANCEL` として参照可能。追加設定は不要。

## 6. 既存テスト更新方針

`channels.test.ts:71` の `プロパティ数が 3 である` テストを `4 である` へ更新する。

## 7. 設計図（差分）

```diff
 export const SKILL_CREATOR_RUNTIME_CHANNELS = {
   SKILL_CREATOR_PROGRESS: "skill-creator:progress",
+  SKILL_CREATOR_CANCEL: "skill-creator:cancel",
   SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
   SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
 } as const;
```

## 8. `preload/channels.ts` への影響

`ALLOWED_INVOKE_CHANNELS` への `SKILL_CREATOR_CANCEL` 登録は TASK-SW-CANCEL-002 のスコープ。本タスクでは変更しない。

## 9. 値の重複確認

`"skill-creator:cancel"` は既存の IPC チャンネル値に存在しないことを確認済み（Phase 1 の現状確認より）。
