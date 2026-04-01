# Phase 5: 実装

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 5                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

`authHandlers.ts` の `auth:login` を fire-and-forget に修正し、500ms timeout を超えないようにする。

## 実行タスク

- `await` を削除して即時レスポンス化する
- handler 側の `.catch()` は logging-only にする
- `AUTH_STATE_CHANGED` の通知責務は `AuthFlowOrchestrator` に残す
- 型安全性と provider validation を維持する

## 実装対象

- `apps/desktop/src/main/ipc/authHandlers.ts`

## 実装手順

### ステップ 1: authHandlers.ts の現状確認

```bash
grep -n "AUTH_LOGIN\|startOAuthFlow" apps/desktop/src/main/ipc/authHandlers.ts
```

確認事項:

- `auth:login` ハンドラーの現在の実装
- `mainWindow` の参照方法
- `sanitizeErrorMessage` のインポート状況
- `OAuthProvider` 型のインポート状況

### ステップ 2: auth:login ハンドラーの修正

`await authFlowOrchestrator.startOAuthFlow(provider)` を fire-and-forget に変更する。

#### 変更後

```typescript
registerValidatedAuthHandler(
  IPC_CHANNELS.AUTH_LOGIN,
  async (_event, { provider }): Promise<IPCResponse<void>> => {
    if (!isValidProvider(provider)) {
      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.INVALID_PROVIDER,
          message: `Invalid provider: ${provider}. Must be one of: google, github, discord`,
        },
      };
    }

    void authFlowOrchestrator!
      .startOAuthFlow(provider as OAuthProvider)
      .catch((error) => {
        console.error(
          "[AuthHandlers] auth:login fire-and-forget failed:",
          sanitizeErrorMessage(error),
        );
      });

    return { success: true };
  },
);
```

### ステップ 3: 型安全性の確認

- `provider` 引数が `OAuthProvider` にキャストできることを確認する
- `sanitizeErrorMessage` が正しくインポートされていることを確認する
- handler 側で `AUTH_STATE_CHANGED` を再送しないことを確認する

### ステップ 4: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### ステップ 5: テスト実行（Green フェーズ）

```bash
pnpm --filter @repo/desktop exec vitest run src/main/ipc/authHandlers.test.ts
```

Phase 4 で定義した TC-01 〜 TC-05 が全て PASS することを確認する。

## 実装上の注意事項

| 項目                | 注意点                                                               |
| ------------------- | -------------------------------------------------------------------- |
| `mainWindow` の参照 | handler から `AUTH_STATE_CHANGED` を再送しないため、この実装では不要 |
| `void` 演算子       | fire-and-forget の明示として付与する                                 |
| エラーログ          | `.catch()` 内は logging-only にする                                  |
| 既存の成功通知      | `AuthFlowOrchestrator` が `AUTH_STATE_CHANGED` を送る前提を維持する  |

## 統合テスト連携

| テスト対象                                                          | 役割                                             |
| ------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/main/ipc/authHandlers.test.ts`                    | 即時応答と provider validation を確認            |
| `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts` | success / failure の `AUTH_STATE_CHANGED` を確認 |
| `apps/desktop/src/renderer/store/slices/authSlice.test.ts`          | listener 互換を確認                              |

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
- [ ] `.catch()` は logging-only になっている
- [ ] `return { success: true }` が即座に実行されている
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] Phase 4 の TC-01 〜 TC-05 が全て PASS している
- [ ] **本Phase内の全タスクを100%実行完了**
