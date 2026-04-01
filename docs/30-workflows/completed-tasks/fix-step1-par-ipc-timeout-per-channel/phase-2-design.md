# Phase 2: 設計

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 2                           |
| 機能名 | fix-ipc-timeout-per-channel |
| 作成日 | 2026-04-01                  |

## 目的

Phase 1 で固定した受入基準を、最小の複雑性で実装できるように設計へ落とす。
`CHANNEL_TIMEOUTS` マップと `getChannelTimeout` 関数を追加し、`invokeWithTimeout` がチャンネル別タイムアウトを使うように設計する。

## 実行タスク

- `CHANNEL_TIMEOUTS` マップの型と値を設計する
- `getChannelTimeout(channel: string): number` 関数のインターフェースを設計する
- `invokeWithTimeout` の修正方針を設計する
- 変更が `ipc-utils.ts` 内で完結することを確認する

## 参照資料

| 資料名                  | パス                                              | 参照理由                |
| ----------------------- | ------------------------------------------------- | ----------------------- |
| ipc-utils current code  | `apps/desktop/src/preload/ipc-utils.ts`           | 修正対象の current code |
| Phase 1 要件            | `phase-1-requirements.md`                         | 受入基準の正本          |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/SKILL.md` | system spec の正本      |

## 設計概要

### CHANNEL_TIMEOUTS マップ

- 型: `Partial<Record<string, number>>`
- スコープ: モジュールプライベート定数（`export` しない）
- 内容: チャンネル名をキー、タイムアウト値（ミリ秒）を値とする

### getChannelTimeout 関数

- シグネチャ: `export function getChannelTimeout(channel: string): number`
- 動作: `CHANNEL_TIMEOUTS[channel] ?? IPC_TIMEOUT_MS` を返す
- エクスポート: テスト可能にするために `export` する

### invokeWithTimeout の修正

- `IPC_TIMEOUT_MS` のハードコードを `getChannelTimeout(channel)` に置き換える
- タイムアウトエラーメッセージにも `getChannelTimeout(channel)` で取得した値を使う
- それ以外の実装は変更しない

## 設計詳細

### CHANNEL_TIMEOUTS の値

| チャンネル           | 値（ms） | 根拠                                         |
| -------------------- | -------- | -------------------------------------------- |
| `auth:login`         | 500      | OAuth フロー起動の fire-and-forget。確認のみ |
| `auth:get-session`   | 10000    | セッション取得にネットワーク通信を伴う       |
| `auth:refresh`       | 10000    | トークンリフレッシュにネットワーク通信を伴う |
| `skill-creator:plan` | 30000    | AI 生成処理を含む長時間処理                  |
| `skill:execute`      | 60000    | スキル実行処理を含む長時間処理               |

### 変更後のコード概要

```typescript
/** チャンネル別タイムアウト（ミリ秒）。未定義チャンネルは IPC_TIMEOUT_MS にフォールバック */
const CHANNEL_TIMEOUTS: Partial<Record<string, number>> = {
  "auth:login": 500,
  "auth:get-session": 10000,
  "auth:refresh": 10000,
  "skill-creator:plan": 30000,
  "skill:execute": 60000,
};

export function getChannelTimeout(channel: string): number {
  return CHANNEL_TIMEOUTS[channel] ?? IPC_TIMEOUT_MS;
}

export function invokeWithTimeout<T>(
  allowedChannels: readonly string[],
  channel: string,
  ...args: unknown[]
): Promise<T> {
  if (!allowedChannels.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }

  const timeout = getChannelTimeout(channel); // ← チャンネル別タイムアウトを使用

  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `IPC timeout: ${channel} did not respond within ${timeout}ms`,
        ),
      );
    }, timeout);

    ipcRenderer
      .invoke(channel, ...args)
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result as T);
      })
      .catch((error: unknown) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}
```

### 変更しないもの

| 要素                         | 理由                                           |
| ---------------------------- | ---------------------------------------------- |
| `IPC_TIMEOUT_MS` の値と型    | 後方互換性維持。フォールバック値として継続使用 |
| `invokeWithTimeout` の引数   | 呼び出し元への影響ゼロ                         |
| `invokeWithTimeout` の戻り値 | IPC コントラクト不変                           |
| `preload/index.ts` 他        | 呼び出し元変更不要                             |

## 成果物

| 成果物 | パス                | 説明                     |
| ------ | ------------------- | ------------------------ |
| 設計書 | `phase-2-design.md` | 実装方針と変更範囲の固定 |

## 完了条件

- [ ] `CHANNEL_TIMEOUTS` マップの型と値が確定している
- [ ] `getChannelTimeout` 関数のシグネチャが確定している
- [ ] `invokeWithTimeout` の修正箇所が最小化されている
- [ ] 変更が `ipc-utils.ts` 内で完結することが確認されている
- [ ] Phase 3 で判断可能な設計粒度になっている

## サブタスク管理

1. `CHANNEL_TIMEOUTS` マップの設計
2. `getChannelTimeout` 関数の設計
3. `invokeWithTimeout` 修正方針の設計
4. 変更範囲の確認

## 統合テスト連携

- Phase 4 のテスト作成と Phase 5 の実装へ、この設計を引き継ぐ

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] 変更が `ipc-utils.ts` 内で完結している
- [ ] Phase 5 でそのまま実装へ落とせる
