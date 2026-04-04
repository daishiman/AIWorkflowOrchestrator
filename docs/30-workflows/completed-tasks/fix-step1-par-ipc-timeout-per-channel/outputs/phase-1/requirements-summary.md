# Phase 1: 要件定義サマリー

## current facts（確認済み）

- `apps/desktop/src/preload/ipc-utils.ts` の `IPC_TIMEOUT_MS = 5000` が全チャンネルに共通適用
- `invokeWithTimeout` が `IPC_TIMEOUT_MS` をハードコードしている（行 33, 36）
- 呼び出し元: `index.ts` / `skill-api.ts` / `skill-creator-api.ts`（いずれも引数・戻り値型の変更不要）

## 問題の本質

全チャンネル共通の 5 秒タイムアウトが、長時間処理チャンネル（`skill:execute` 等）に対して早期タイムアウトを引き起こしている。

## 後方互換性方針

- `IPC_TIMEOUT_MS = 5000` は存続させる（削除禁止）
- `CHANNEL_TIMEOUTS` 未定義チャンネルは `IPC_TIMEOUT_MS` へフォールバック
- `invokeWithTimeout` の引数・戻り値型シグネチャは変更しない

## チャンネル別タイムアウト一覧（確定）

| チャンネル           | 値（ms） | 根拠                                           |
| -------------------- | -------- | ---------------------------------------------- |
| `auth:login`         | 500      | OAuth フロー起動の fire-and-forget（確認のみ） |
| `auth:get-session`   | 10000    | セッション取得にネットワーク通信を伴う         |
| `auth:refresh`       | 10000    | トークンリフレッシュにネットワーク通信を伴う   |
| `skill-creator:plan` | 30000    | AI 生成処理を含む長時間処理                    |
| `skill:execute`      | 60000    | スキル実行処理を含む長時間処理                 |

## Phase 2 へ渡す source of truth

`ipc-utils.ts` の `invokeWithTimeout` に `CHANNEL_TIMEOUTS` マップと `getChannelTimeout` 関数を追加し、
`IPC_TIMEOUT_MS` をフォールバックとして維持する。

## 完了確認

- [x] 問題の本質が「全チャンネル共通タイムアウト」として明確に記述されている
- [x] 後方互換性維持の方針（`IPC_TIMEOUT_MS` の存続）が確定している
- [x] チャンネル別タイムアウト一覧が AC として固定されている
- [x] Phase 2 へ渡せる受入基準が確定している
