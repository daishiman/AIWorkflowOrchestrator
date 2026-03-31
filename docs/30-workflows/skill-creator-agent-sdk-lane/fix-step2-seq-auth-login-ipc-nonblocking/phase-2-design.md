# Phase 2: 設計

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 2                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

`auth:login` IPC ハンドラーを fire-and-forget パターンへ変更する設計を定義する。OAuth 完了通知は既存の `AUTH_STATE_CHANGED` イベントに委ねる設計を確定する。

## 現在の実装（問題のある設計）

```typescript
// authHandlers.ts - 現在（問題あり）
registerValidatedAuthHandler(
  IPC_CHANNELS.AUTH_LOGIN,
  async (_event, { provider }) => {
    await authFlowOrchestrator.startOAuthFlow(provider); // ← 最大300,000ms ブロック
    return { success: true };
  },
);
```

### 問題点

- `await authFlowOrchestrator.startOAuthFlow(provider)` が OAuth フロー完了まで待機する
- OAuth フローには最大 300,000ms（5分）かかる場合がある
- `ipc-utils.ts` の `IPC_TIMEOUT_MS = 5000`（5秒）を超えると `IPC timeout` エラーが発生する
- レンダラーは 5 秒後にタイムアウトエラーを受け取り、Auth フローが中断されたと誤解する

## 修正後の設計（fire-and-forget）

```typescript
// authHandlers.ts - 修正後
registerValidatedAuthHandler(
  IPC_CHANNELS.AUTH_LOGIN,
  async (_event, { provider }) => {
    // fire-and-forget: OAuth フロー開始のみ、完了は AUTH_STATE_CHANGED で通知
    authFlowOrchestrator
      .startOAuthFlow(provider as OAuthProvider)
      .catch((error) => {
        mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
          authenticated: false,
          error: sanitizeErrorMessage(error),
        });
      });
    return { success: true }; // 即座に返す
  },
);
```

### 設計の要点

- `await` を除去し、`startOAuthFlow()` を非同期で起動する
- ハンドラーは `startOAuthFlow()` 呼び出し直後に `{ success: true }` を返す
- OAuth フロー完了（成功）は `authFlowOrchestrator` 内部から既存の `AUTH_STATE_CHANGED` イベントで通知される
- OAuth フロー失敗は `.catch()` で捕捉し、`AUTH_STATE_CHANGED` に `{ authenticated: false, error }` を送信する

## シーケンス図

### 修正前（ブロッキング）

```
Renderer           Main Process         OAuthFlow
   |                    |                    |
   |--- auth:login ---->|                    |
   |                    |-- startOAuthFlow ->|
   |                    |   (max 300,000ms)  |
   |                    |<-- completed ------|
   |<-- { success } ----|                    |
   |                    |                    |
   ↑ 5000ms 以内に返らない → タイムアウトエラー
```

### 修正後（非ブロッキング）

```
Renderer           Main Process         OAuthFlow
   |                    |                    |
   |--- auth:login ---->|                    |
   |                    |-- startOAuthFlow ->|  ← fire-and-forget
   |<-- { success } ----|                    |  ← 即座に返す
   |                    |                    |
   |                    |   (max 300,000ms)  |
   |                    |<-- completed ------|
   |<- AUTH_STATE_CHANGED|                   |  ← 既存イベントで通知
   |                    |                    |
```

## 既存の AUTH_STATE_CHANGED リスナー（変更なし）

`authSlice.ts` L395-491 に既存の `AUTH_STATE_CHANGED` リスナーが実装されており、このリスナーは変更不要。

```typescript
// authSlice.ts L395-491 (既存・変更なし)
ipcRenderer.on(IPC_CHANNELS.AUTH_STATE_CHANGED, (_, authState) => {
  // 認証状態の更新処理
  // 成功時: ユーザー情報をストアへ反映
  // 失敗時: エラー状態を設定
});
```

## エラーパス設計

| シナリオ         | 現在の挙動                                               | 修正後の挙動                                                                            |
| ---------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| OAuth 成功       | `auth:login` がレスポンスを返す（5秒超えでタイムアウト） | `auth:login` が即時 `{ success: true }` → OAuth 完了後 `AUTH_STATE_CHANGED` で成功通知  |
| OAuth 失敗       | `auth:login` がエラーをスロー（5秒超えでタイムアウト）   | `auth:login` が即時 `{ success: true }` → `.catch()` で `AUTH_STATE_CHANGED` に失敗通知 |
| IPC タイムアウト | タイムアウトエラー発生                                   | 5000ms 以内に `{ success: true }` が返るためタイムアウト発生しない                      |

## 変更スコープ

| ファイル                                    | 変更内容                                                 | 変更量      |
| ------------------------------------------- | -------------------------------------------------------- | ----------- |
| `apps/desktop/src/main/ipc/authHandlers.ts` | `auth:login` ハンドラーの `await` 削除 + `.catch()` 追加 | 小（〜5行） |

変更なしのファイル:

- `apps/desktop/src/main/ipc/ipc-utils.ts`（タイムアウト値変更不要）
- `apps/desktop/src/renderer/store/authSlice.ts`（リスナーはそのまま活用）
- `apps/desktop/src/main/auth/authFlowOrchestrator.ts`（内部ロジック変更不要）

## 参照資料

| 資料名                  | パス                                           | 説明                     |
| ----------------------- | ---------------------------------------------- | ------------------------ |
| authHandlers.ts         | `apps/desktop/src/main/ipc/authHandlers.ts`    | 修正対象                 |
| authSlice.ts            | `apps/desktop/src/renderer/store/authSlice.ts` | リスナー実装（L395-491） |
| phase-1-requirements.md | `./phase-1-requirements.md`                    | 要件                     |

## 成果物

| 成果物 | パス                | 説明       |
| ------ | ------------------- | ---------- |
| 設計書 | `phase-2-design.md` | 本ファイル |

## 完了条件

- [ ] 現在の実装（問題あり）が明記されている
- [ ] 修正後の設計（fire-and-forget）が明記されている
- [ ] シーケンス図で修正前後の違いが示されている
- [ ] エラーパスが `AUTH_STATE_CHANGED` 経由で処理されることが明記されている
- [ ] 変更スコープが `authHandlers.ts` のみであることが確認されている
- [ ] 既存 `AUTH_STATE_CHANGED` リスナーとの互換性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
