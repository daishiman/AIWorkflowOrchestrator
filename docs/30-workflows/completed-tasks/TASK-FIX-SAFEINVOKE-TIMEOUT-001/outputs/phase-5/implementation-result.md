# Phase 5 成果物: 実装結果

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 5 - 実装                        |
| 作成日     | 2026-03-10                      |
| ステータス | 完了                            |

## 1. 変更概要

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| 変更ファイル | `apps/desktop/src/preload/index.ts` |
| 変更行数     | +17行 / -1行                        |
| 影響範囲     | `safeInvoke` 関数内部のみ           |
| 外部IF変更   | なし                                |

## 2. 実装差分

### IPC_TIMEOUT_MS 定数

```typescript
/** IPC呼び出しのデフォルトタイムアウト（ミリ秒） */
const IPC_TIMEOUT_MS = 5000;
```

### safeInvoke 修正後

```typescript
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return Promise.race([
    ipcRenderer.invoke(channel, ...args),
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `IPC timeout: ${channel} did not respond within ${IPC_TIMEOUT_MS}ms`,
            ),
          ),
        IPC_TIMEOUT_MS,
      ),
    ),
  ]);
}
```

## 3. テスト結果（Green確認）

| テスト           | 実行コマンド                                                                                   | 結果                      |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------------- |
| targeted timeout | `pnpm --filter @repo/desktop exec vitest run src/preload/__tests__/safeInvoke-timeout.test.ts` | 12 tests PASS             |
| preload 回帰     | `pnpm --filter @repo/desktop exec vitest run src/preload/__tests__`                            | 17 files / 510 tests PASS |

## 4. 品質確認

| チェック項目          | 結果                                           |
| --------------------- | ---------------------------------------------- |
| TypeScript 型チェック | PASS (`pnpm --filter @repo/desktop typecheck`) |
| ESLint                | targeted 実行でエラー0件                       |
| 変更差分              | 1ファイル、+17/-1行                            |

## 5. 完了条件チェックリスト

- [x] `IPC_TIMEOUT_MS` 定数を追加
- [x] `safeInvoke` に `Promise.race` パターンを実装
- [x] Phase 4 のテストが全て PASS（Green）
- [x] preload 回帰テストが全て PASS（510件）
- [x] TypeScript 型チェック PASS
- [x] ESLint PASS
- [x] 本Phase内の全タスクを100%実行完了
