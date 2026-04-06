# Phase 5: 実装記録

## 変更ファイル

- `apps/desktop/src/preload/ipc-utils.ts`

## 変更内容

### 追加: CHANNEL_TIMEOUTS 定数

```typescript
const CHANNEL_TIMEOUTS: Partial<Record<string, number>> = {
  "auth:login": 500,
  "auth:get-session": 10000,
  "auth:refresh": 10000,
  "skill-creator:plan": 30000,
  "skill:execute": 60000,
};
```

- 配置: `IPC_TIMEOUT_MS` 定数の直後
- モジュールプライベート（export しない）

### 追加: getChannelTimeout 関数

```typescript
export function getChannelTimeout(channel: string): number {
  return CHANNEL_TIMEOUTS[channel] ?? IPC_TIMEOUT_MS;
}
```

### 修正: invokeWithTimeout

```typescript
const timeout = getChannelTimeout(channel);
// setTimeout 第2引数: IPC_TIMEOUT_MS → timeout
// エラーメッセージ: IPC_TIMEOUT_MS → timeout
```

## 変更されていないもの

- `IPC_TIMEOUT_MS = 5000`（値・型ともに不変）
- `invokeWithTimeout` の引数・戻り値型シグネチャ
- `preload/index.ts` / `skill-api.ts` / `skill-creator-api.ts`（変更なし）

## テスト結果

- `ipc-utils.test.ts`: 18 tests PASS
- `ipc-utils.safeInvoke-timeout.test.ts`: 15 tests PASS
- 変更対象: `ipc-utils.ts` のみ（1ファイル完結）
