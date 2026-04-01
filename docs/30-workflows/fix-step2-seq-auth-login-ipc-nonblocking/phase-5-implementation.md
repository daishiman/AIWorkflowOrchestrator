# Phase 5: 実装

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 5                                        |
| Phase名    | 実装                                     |
| 前提Phase  | Phase 4（テスト作成）                    |
| 後続Phase  | Phase 6                                  |
| ステータス | 完了                                     |
| 作成日     | 2026-04-01                               |
| 機能名     | fix-step2-seq-auth-login-ipc-nonblocking |

## 目的

Phase 2 設計書に従い `apps/desktop/src/main/ipc/authHandlers.ts` の
`auth:login` ハンドラーを fire-and-forget パターンへ変更し、
Phase 4 で作成したテストをすべて PASS させる（TDD Green）。

## 実行タスク

### タスク1: authHandlers.ts の変更

**変更ファイル**: `apps/desktop/src/main/ipc/authHandlers.ts`

**変更内容**:

変更前:

```typescript
// auth:login - OAuthログイン開始（PKCE + ローカルHTTPサーバー方式）
registerValidatedAuthHandler(
  IPC_CHANNELS.AUTH_LOGIN,
  async (_event, { provider }: { provider: string }): Promise<IPCResponse<void>> => {
    try {
      if (!isValidProvider(provider)) {
        return { success: false, error: { ... } };
      }
      await authFlowOrchestrator!.startOAuthFlow(provider as OAuthProvider);
      return { success: true };
    } catch (error) {
      return { success: false, error: { code: AUTH_ERROR_CODES.LOGIN_FAILED, ... } };
    }
  },
);
```

変更後:

```typescript
// auth:login - OAuthログイン開始（fire-and-forget方式）
registerValidatedAuthHandler(
  IPC_CHANNELS.AUTH_LOGIN,
  async (_event, { provider }: { provider: string }): Promise<IPCResponse<void>> => {
    if (!isValidProvider(provider)) {
      return { success: false, error: { ... } };
    }
    authFlowOrchestrator!
      .startOAuthFlow(provider as OAuthProvider)
      .catch((err: unknown) => {
        console.error("[authHandlers] OAuth flow error (notified via AUTH_STATE_CHANGED):", err instanceof Error ? err.message : err);
      });
    return { success: true };
  },
);
```

**変更点**:

1. `try/catch` ブロックを除去
2. `await` を除去（fire-and-forget）
3. `.catch()` を追加（unhandled rejection 防止）
4. `return { success: true }` を即座に返す

### タスク2: テスト実行・確認

```bash
CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm --filter @repo/desktop exec vitest run --reporter=verbose "src/main/ipc/authHandlers.test.ts"
```

期待結果: 54テスト PASS

## TDD サイクル確認

```bash
CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm --filter @repo/desktop exec vitest run --reporter=verbose "src/main/ipc/authHandlers.test.ts"
```

**確認項目**:

- [x] テストが成功することを確認（Green状態）: 54テスト PASS

## 参照資料

| 参照資料        | パス                                                                | 内容         |
| --------------- | ------------------------------------------------------------------- | ------------ |
| Phase 2 設計書  | `phase-2-design.md`                                                 | 変更差分設計 |
| authHandlers.ts | `apps/desktop/src/main/ipc/authHandlers.ts`                         | 実装対象     |
| auth IPC 仕様   | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md` | IPC 契約     |

## 成果物

| 成果物             | パス                                        | 内容                   |
| ------------------ | ------------------------------------------- | ---------------------- |
| 変更済みハンドラー | `apps/desktop/src/main/ipc/authHandlers.ts` | fire-and-forget 化済み |

## 統合テスト連携【必須】

- `authHandlers.ts` の fire-and-forget 実装後、54テストが PASS することを確認
- IPC 契約（チャンネル名・型・エラーコード）が変わっていないことをテストで確認

## 完了条件

- [x] `await authFlowOrchestrator.startOAuthFlow()` が `.catch()` 付き fire-and-forget に変更されている
- [x] `try/catch` ブロックが除去されている
- [x] 54テストが PASS している
- [x] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

## 次のPhase

Phase 6: テスト拡充
`docs/30-workflows/fix-step2-seq-auth-login-ipc-nonblocking/phase-6-test-expansion.md`

## Phase 5 実行記録

### 実行タスク

- タスク1（authHandlers.ts 変更）: 完了。`await` 除去 + `.catch()` 追加 + `try/catch` 除去
- タスク2（テスト実行）: 54テスト PASS 確認

### 発見事項

- 良かった点: 変更は10行未満の最小変更で済んだ
- 問題点: なし
- 改善提案: なし

### 次Phase への引き継ぎ事項

- 実装完了。Phase 6 でテスト拡充を実施
