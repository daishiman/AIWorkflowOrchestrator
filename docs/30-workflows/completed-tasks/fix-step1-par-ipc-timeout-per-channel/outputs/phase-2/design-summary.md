# Phase 2: 設計サマリー

## 設計概要

`ipc-utils.ts` 内の変更のみで完結する最小変更設計。

## 追加する要素

### CHANNEL_TIMEOUTS マップ

```typescript
const CHANNEL_TIMEOUTS: Partial<Record<string, number>> = {
  "auth:login": 500,
  "auth:get-session": 10000,
  "auth:refresh": 10000,
  "skill-creator:plan": 30000,
  "skill:execute": 60000,
};
```

- 型: `Partial<Record<string, number>>`（モジュールプライベート、export しない）
- 配置: `IPC_TIMEOUT_MS` 定数の直後

### getChannelTimeout 関数

```typescript
export function getChannelTimeout(channel: string): number {
  return CHANNEL_TIMEOUTS[channel] ?? IPC_TIMEOUT_MS;
}
```

- export: テスト可能にするため export する
- 本体: 1行のフォールバック式

### invokeWithTimeout の修正

```typescript
const timeout = getChannelTimeout(channel);
// setTimeout の第2引数を timeout に変更
// エラーメッセージ中の IPC_TIMEOUT_MS を timeout に変更
```

## 変更しないもの

| 要素                         | 理由                                           |
| ---------------------------- | ---------------------------------------------- |
| `IPC_TIMEOUT_MS` の値と型    | 後方互換性維持。フォールバック値として継続使用 |
| `invokeWithTimeout` の引数   | 呼び出し元への影響ゼロ                         |
| `invokeWithTimeout` の戻り値 | IPC コントラクト不変                           |
| `preload/index.ts` 他        | 呼び出し元変更不要                             |

## 完了確認

- [x] `CHANNEL_TIMEOUTS` マップの型と値が確定している
- [x] `getChannelTimeout` 関数のシグネチャが確定している
- [x] `invokeWithTimeout` の修正箇所が最小化されている
- [x] 変更が `ipc-utils.ts` 内で完結することが確認されている
- [x] Phase 3 で判断可能な設計粒度になっている
