# Phase 5: 実装

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 5                           |
| 機能名 | fix-ipc-timeout-per-channel |
| 作成日 | 2026-04-01                  |

## 目的

Phase 4 で定義した RED を GREEN にする。
`ipc-utils.ts` に `CHANNEL_TIMEOUTS` マップと `getChannelTimeout` 関数を追加し、`invokeWithTimeout` を修正する。

## 実行タスク

- `apps/desktop/src/preload/ipc-utils.ts` に `CHANNEL_TIMEOUTS` 定数を追加する
- `getChannelTimeout(channel: string): number` 関数を追加する
- `invokeWithTimeout` のタイムアウト取得を `getChannelTimeout(channel)` に変更する
- `ipc-utils.test.ts` にテストケース T-001 〜 T-012 を実装する

## 更新すべきファイルのリスト

| ファイル                                               | 変更内容                                                                    |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `apps/desktop/src/preload/ipc-utils.ts`                | `CHANNEL_TIMEOUTS` 追加・`getChannelTimeout` 追加・`invokeWithTimeout` 修正 |
| `apps/desktop/src/preload/__tests__/ipc-utils.test.ts` | テストケース T-001 〜 T-012 の実装                                          |

## 実装手順

### ステップ1: CHANNEL_TIMEOUTS マップを追加する

1. `IPC_TIMEOUT_MS` 定数の直後に `CHANNEL_TIMEOUTS` を配置する
2. 型は `Partial<Record<string, number>>` とする
3. `auth:login: 500` / `auth:get-session: 10000` / `auth:refresh: 10000` / `skill-creator:plan: 30000` / `skill:execute: 60000` を設定する

### ステップ2: getChannelTimeout 関数を追加する

1. `CHANNEL_TIMEOUTS` の直後に `getChannelTimeout` を配置する
2. `export function getChannelTimeout(channel: string): number` とする
3. 本体は `return CHANNEL_TIMEOUTS[channel] ?? IPC_TIMEOUT_MS;` の 1 行で書く
4. JSDoc コメントを追加する

### ステップ3: invokeWithTimeout を修正する

1. 関数冒頭で `const timeout = getChannelTimeout(channel);` を取得する
2. `setTimeout` の第 2 引数を `timeout` に変更する
3. タイムアウトエラーメッセージ中の `IPC_TIMEOUT_MS` を `timeout` に変更する
4. それ以外の実装は変更しない

### ステップ4: テストを実装する

1. `ipc-utils.test.ts` に `describe("getChannelTimeout", ...)` ブロックを追加する
2. T-001 〜 T-008 の `getChannelTimeout` テストを実装する
3. T-009 〜 T-012 の `invokeWithTimeout` タイムアウト動作テストを実装する
4. `pnpm --filter @repo/desktop vitest run` で GREEN を確認する

## 参照資料

| 資料名         | パス                                    | 参照理由         |
| -------------- | --------------------------------------- | ---------------- |
| Phase 2 設計   | `phase-2-design.md`                     | 実装方針の正本   |
| Phase 4 テスト | `phase-4-test-creation.md`              | テスト仕様の正本 |
| ipc-utils      | `apps/desktop/src/preload/ipc-utils.ts` | 実装対象         |

## 実装後のコード（期待形）

```typescript
/** IPC呼び出しのデフォルトタイムアウト（ミリ秒） */
export const IPC_TIMEOUT_MS = 5000;

/** チャンネル別タイムアウト（ミリ秒）。未定義チャンネルは IPC_TIMEOUT_MS にフォールバック */
const CHANNEL_TIMEOUTS: Partial<Record<string, number>> = {
  "auth:login": 500, // fire-and-forgetなので短くてよい（起動確認のみ）
  "auth:get-session": 10000, // セッション取得: 10秒
  "auth:refresh": 10000, // トークンリフレッシュ: 10秒
  "skill-creator:plan": 30000, // スキル生成計画: 30秒
  "skill:execute": 60000, // スキル実行: 60秒
};

/**
 * チャンネル別タイムアウト値を返す
 *
 * @param channel - IPC チャンネル名
 * @returns タイムアウト値（ミリ秒）
 */
export function getChannelTimeout(channel: string): number {
  return CHANNEL_TIMEOUTS[channel] ?? IPC_TIMEOUT_MS;
}
```

## 成果物

| 成果物       | パス                                                   | 説明                 |
| ------------ | ------------------------------------------------------ | -------------------- |
| 実装記録     | `phase-5-implementation.md`                            | 実装手順と結果の固定 |
| 実装ファイル | `apps/desktop/src/preload/ipc-utils.ts`                | 修正済み実装         |
| テスト       | `apps/desktop/src/preload/__tests__/ipc-utils.test.ts` | GREEN になったテスト |

## 完了条件

- [ ] `CHANNEL_TIMEOUTS` が `ipc-utils.ts` に追加されている
- [ ] `getChannelTimeout` が `export` されている
- [ ] `invokeWithTimeout` が `getChannelTimeout(channel)` を使っている
- [ ] テストケース T-001 〜 T-012 が全て GREEN である
- [ ] 既存テストが引き続き pass する

## サブタスク管理

1. `CHANNEL_TIMEOUTS` 追加
2. `getChannelTimeout` 追加
3. `invokeWithTimeout` 修正
4. テスト実装と GREEN 確認

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] `ipc-utils.ts` 以外のファイルが変更されていない
- [ ] Phase 6 へ渡せる GREEN 状態になっている
