# Phase 5: 実装

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 5                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

Phase 2 の設計に従い、`authHandlers.ts` の `auth:login` ハンドラーを fire-and-forget パターンに修正する。

## 実装対象

- `apps/desktop/src/main/ipc/authHandlers.ts`

## 実装手順

### ステップ 1: authHandlers.ts の現状確認

```bash
# 現在の auth:login ハンドラーを確認
grep -n "AUTH_LOGIN\|startOAuthFlow" apps/desktop/src/main/ipc/authHandlers.ts
```

確認事項:

- `auth:login` ハンドラーの現在の実装
- `mainWindow` の参照方法
- `sanitizeErrorMessage` のインポート状況
- `OAuthProvider` 型のインポート状況

### ステップ 2: auth:login ハンドラーの修正

`await authFlowOrchestrator.startOAuthFlow(provider)` を fire-and-forget パターンに変更する。

#### 変更前

```typescript
registerValidatedAuthHandler(
  IPC_CHANNELS.AUTH_LOGIN,
  async (_event, { provider }) => {
    await authFlowOrchestrator.startOAuthFlow(provider);
    return { success: true };
  },
);
```

#### 変更後

```typescript
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

### ステップ 3: 型安全性の確認

- `provider` 引数の型が `OAuthProvider` にキャストできることを確認する
- `mainWindow` が `authHandlers.ts` スコープでアクセス可能であることを確認する
- `sanitizeErrorMessage` が正しくインポートされていることを確認する

### ステップ 4: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### ステップ 5: テスト実行（Green フェーズ）

```bash
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/authHandlers.test.ts
```

Phase 4 で定義した TC-01 〜 TC-05 が全て PASS することを確認する。

## 実装上の注意事項

| 項目                | 注意点                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mainWindow` の参照 | ハンドラー登録時のクロージャで `mainWindow` を参照しているか確認する                                                                                   |
| `void` 演算子       | fire-and-forget の明示として `void authFlowOrchestrator.startOAuthFlow(...)` の形式も検討する（ただし `.catch()` が必要なため Promise を返す形が適切） |
| エラーログ          | `.catch()` 内で `logger.error()` 等のログ出力を追加することを検討する                                                                                  |
| 既存の成功通知      | `authFlowOrchestrator` 内部が `AUTH_STATE_CHANGED` の成功通知を行っていることを確認する                                                                |

## 参照資料

| 資料名          | パス                                        | 説明                 |
| --------------- | ------------------------------------------- | -------------------- |
| 設計書          | `./phase-2-design.md`                       | fire-and-forget 設計 |
| テスト仕様      | `./phase-4-test-creation.md`                | TC-01 〜 TC-05       |
| authHandlers.ts | `apps/desktop/src/main/ipc/authHandlers.ts` | 修正対象             |

## 成果物

| 成果物       | パス                                        | 説明           |
| ------------ | ------------------------------------------- | -------------- |
| 実装仕様     | `phase-5-implementation.md`                 | 本ファイル     |
| 修正ファイル | `apps/desktop/src/main/ipc/authHandlers.ts` | 実装済みコード |

## 完了条件

- [ ] `auth:login` ハンドラーから `await` が削除されている
- [ ] `.catch()` で `AUTH_STATE_CHANGED` に失敗通知する処理が追加されている
- [ ] `return { success: true }` が即座に実行されるように変更されている
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] Phase 4 の TC-01 〜 TC-05 が全て PASS している（Green フェーズ）
- [ ] **本Phase内の全タスクを100%実行完了**
