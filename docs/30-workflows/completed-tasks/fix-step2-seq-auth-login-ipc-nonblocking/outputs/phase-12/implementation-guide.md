# Implementation Guide

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 12                                         |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

---

## Part 1: なぜ非ブロッキング化が必要か

### 問題の背景

`auth:login` IPC チャンネルには、`apps/desktop/src/preload/ipc-utils.ts` の `CHANNEL_TIMEOUTS` によって **500ms のタイムアウト制約** が設けられている。

変更前の実装は次のとおりだった。

```typescript
// 変更前（ブロッキング）
registerValidatedAuthHandler(
  IPC_CHANNELS.AUTH_LOGIN,
  async (_event, { provider }) => {
    await authFlowOrchestrator.startOAuthFlow(provider); // OAuth 完了まで待機
    return { success: true };
  },
);
```

`startOAuthFlow()` は OAuth ブラウザリダイレクト → コールバック待機 → トークン検証という一連の処理を含むため、500ms 以内に完了することはない。結果として Renderer は次のエラーを受け取っていた。

```
[AuthSlice] Login error: Error: IPC timeout: auth:login did not respond within 500ms
```

### 何をするか（設計方針）

**fire-and-forget パターン** に切り替え、`auth:login` は OAuth フローの「開始だけ」を行い、即時レスポンスを返す。成功・失敗の最終通知は `AuthFlowOrchestrator` が `AUTH_STATE_CHANGED` イベントで担う。

### 例え話

受付窓口で番号札を受け取る場面を想像してほしい。

- **変更前**: 窓口の担当者がそのまま奥で作業を全部終わらせてから「完成しました」と返事する。他のお客さんは長い間待たされる。
- **変更後**: 担当者は「番号札をお渡ししました。準備ができたら呼び出しスピーカーでお知らせします」とすぐ伝えて、次のお客さんの対応に移る。準備完了の案内は「呼び出しスピーカー（`AUTH_STATE_CHANGED`）」が行う。

`auth:login` が「すぐ返事をする窓口担当者」となり、`AuthFlowOrchestrator` が「呼び出しスピーカー」の役割を持つ。

---

## Part 2: 何が変わったか（コントラクト整理）

### `auth:login` の public contract

| 項目           | current contract（変更後）                                                           | baseline（変更前）                       |
| -------------- | ------------------------------------------------------------------------------------ | ---------------------------------------- |
| 呼び出し側     | Renderer → `ipcRenderer.invoke("auth:login")`                                        | 同左                                     |
| 引数           | `{ provider: "google" \| "github" \| "discord" }`                                    | 同左                                     |
| 即時レスポンス | `{ success: true }` （OAuth 開始直後）                                               | OAuth フロー完了後に `{ success: true }` |
| エラー応答     | invalid provider のみ `{ success: false, error: { code: "auth/invalid-provider" } }` | 同左                                     |
| OAuth 結果通知 | `AUTH_STATE_CHANGED` イベントで別途通知                                              | `auth:login` のレスポンスに含まれていた  |

**target delta**: `auth:login` は OAuth フローの「開始通知（成功 or 失敗の確定ではない）」を返す。完了/失敗の通知は `AUTH_STATE_CHANGED` に一本化した。

### `AUTH_STATE_CHANGED` の state ownership

`AUTH_STATE_CHANGED` の送信責務は `AuthFlowOrchestrator` に固定する。

- OAuth 成功時: `AuthFlowOrchestrator` が `{ authenticated: true, user, expiresAt }` を送信する
- OAuth 失敗時: `AuthFlowOrchestrator` が `{ authenticated: false }` を送信する
- `authHandlers.ts` 側では `AUTH_STATE_CHANGED` を **送信しない**（二重送信の禁止）

```typescript
// authHandlers.ts - 変更後
void authFlowOrchestrator!
  .startOAuthFlow(provider as OAuthProvider)
  .catch((error) => {
    // logging-only。AUTH_STATE_CHANGED は送らない。
    console.error(
      "[AuthHandlers] auth:login fire-and-forget failed:",
      sanitizeErrorMessage(error),
    );
  });

return { success: true }; // 即時返却
```

### 500ms timeout 前提

`CHANNEL_TIMEOUTS["auth:login"] = 500`（`apps/desktop/src/preload/ipc-utils.ts`）は **変更しない**。設計をタイムアウト値に合わせる方針とした。

理由: タイムアウト値を延ばすと他のチャンネルとの一貫性が崩れる。最小変更で最大の UX 改善を得るために、handler 側の実装を合わせた。

### preload の変更なし

`apps/desktop/src/preload/ipc-utils.ts` および `apps/desktop/src/preload/channels.ts` は **変更していない**。

- `auth:login` チャンネル名・引数型・レスポンス型の public interface は変わらない
- Renderer 側のコード（`authSlice.ts`）も変更不要
- `AUTH_STATE_CHANGED` リスナーはそのまま活用できる

preload を変えないことで、Renderer 側の影響ゼロを保証している。

### 変更スコープ一覧

| ファイル                                         | 変更内容                                              |
| ------------------------------------------------ | ----------------------------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.ts`      | `await` 削除 → `void ... .catch()` の fire-and-forget |
| `apps/desktop/src/main/ipc/authHandlers.test.ts` | 即時応答・fire-and-forget・非送信を検証するテスト追加 |

| ファイル                                              | 変更なし（理由）                             |
| ----------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/preload/ipc-utils.ts`               | タイムアウト値・チャンネル定義は維持         |
| `apps/desktop/src/preload/channels.ts`                | チャンネル名は変わらない                     |
| `apps/desktop/src/renderer/store/slices/authSlice.ts` | `AUTH_STATE_CHANGED` listener はそのまま活用 |
| `apps/desktop/src/main/auth/authFlowOrchestrator.ts`  | 通知責務を維持・変更不要                     |

---

## 参照資料

| 資料名          | パス                                        | 説明                             |
| --------------- | ------------------------------------------- | -------------------------------- |
| 要件定義        | `../../../phase-1-requirements.md`          | FR / NFR / AC の定義             |
| 設計書          | `../../../phase-2-design.md`                | fire-and-forget 設計と代替案比較 |
| 実装            | `../../../phase-5-implementation.md`        | handler 修正手順                 |
| 品質保証        | `../../../phase-9-quality-assurance.md`     | 回帰テスト確認                   |
| 手動テスト      | `../phase-11/manual-test-result.md`         | NON_VISUAL 手動確認結果          |
| authHandlers.ts | `apps/desktop/src/main/ipc/authHandlers.ts` | 変更済み実装                     |
