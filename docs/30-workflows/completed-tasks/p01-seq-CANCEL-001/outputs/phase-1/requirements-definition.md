# 要件定義書 - TASK-SW-CANCEL-001

## メタ情報

| 項目     | 内容                                  |
| -------- | ------------------------------------- |
| タスクID | TASK-SW-CANCEL-001                    |
| 機能名   | skill-creator-cancel-channel-constant |
| 作成日   | 2026-04-15                            |
| Phase    | 1                                     |

## 対象ファイル現状確認結果

### `packages/shared/src/ipc/channels.ts`

#### `SKILL_CREATOR_RUNTIME_CHANNELS` の現状（Phase 1 確認時点）

```typescript
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
} as const;
```

- プロパティ数: 3
- `SKILL_CREATOR_CANCEL` は **存在しない**（本タスクで追加する）
- 命名規則: `SKILL_CREATOR_{ACTION}` / 値: `"skill-creator:{action}"`

#### `IPC_CHANNELS` のスプレッド構成

```typescript
export const IPC_CHANNELS = {
  ...SKILL_CREATOR_RUNTIME_CHANNELS, // スプレッドで自動伝播
  // ...他のチャンネル群
} as const;
```

`SKILL_CREATOR_RUNTIME_CHANNELS` に追加したキーは自動的に `IPC_CHANNELS` に伝播する。

#### 既存テストへの影響確認

`packages/shared/src/ipc/__tests__/channels.test.ts:71` に以下のテストが存在する:

```typescript
it("プロパティ数が 3 である", () => {
  expect(Object.keys(SKILL_CREATOR_RUNTIME_CHANNELS)).toHaveLength(3);
});
```

`SKILL_CREATOR_CANCEL` 追加後はプロパティ数が 4 になるため、このテストも同時に `4` へ更新が必要。

## 問題の現状

| 層  | 担当                               | 現状     |
| --- | ---------------------------------- | -------- |
| 1   | 定数定義（shared channels.ts）     | **欠損** |
| 2   | ホワイトリスト（preload channels） | 欠損     |
| 3   | ハンドラー登録（main ipcMain）     | 欠損     |
| 4   | Preload API（contextBridge）       | 欠損     |
| 5   | Renderer 呼び出し（フック修正）    | 欠損     |

本タスクは層1のみを担当する。

## 機能要件

1. `SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` を追加
2. 値の文字列は既存命名規則 `"skill-creator:{action}"` に準拠
3. `IPC_CHANNELS.SKILL_CREATOR_CANCEL` として型安全に参照できる（スプレッド自動伝播）

## 非機能要件

1. 既存テストを壊さない（`channels.test.ts` のプロパティ数テストも更新する）
2. `pnpm typecheck` PASS
