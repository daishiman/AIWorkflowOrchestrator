# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 5                               |
| Phase名    | 実装                            |
| カテゴリ   | fix                             |
| ステータス | pending                         |
| 前提Phase  | Phase 4                         |
| 後続Phase  | Phase 6                         |

## 目的

Phase 2 の設計に基づき、`safeInvoke` にタイムアウト機構を実装する。Phase 4 のテストを全て PASS（Green）にする。

## 実行タスク

### タスク1: 現在の実装の確認

**目的**: 変更対象ファイルの現在の状態を確認する

**手順**:

1. `apps/desktop/src/preload/index.ts` を読み込み
2. L113-117 の `safeInvoke` 関数を確認
3. 周辺コード（`ALLOWED_INVOKE_CHANNELS`、`safeOn` 等）の構造を確認
4. `safeInvoke` が `contextBridge.exposeInMainWorld` でどのように公開されているかを確認

### タスク2: タイムアウト定数の追加

**目的**: `IPC_TIMEOUT_MS` 定数を定義する

**実装箇所**: `apps/desktop/src/preload/index.ts`

**実装内容**:

```typescript
/** IPC呼び出しのデフォルトタイムアウト（ミリ秒） */
const IPC_TIMEOUT_MS = 5000;
```

**配置位置**: `safeInvoke` 関数の直前（関連する定数としてまとめる）

### タスク3: `safeInvoke` の修正

**目的**: `Promise.race` パターンでタイムアウトを実装する

**実装内容**:

```typescript
const IPC_TIMEOUT_MS = 5000;

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

**変更点の要約**:

- `return ipcRenderer.invoke(...)` → `return Promise.race([ipcRenderer.invoke(...), timeoutPromise])`
- 新規追加: タイムアウト用の `new Promise<never>` を `setTimeout` で reject
- 関数シグネチャの変更なし

### タスク4: テスト実行（Green 確認）

**目的**: Phase 4 のテストが全て PASS することを確認する

**手順**:

1. 新規テスト実行: `cd apps/desktop && pnpm vitest run <テストファイルパス>`
2. 全テスト PASS を確認
3. 既存テスト実行: `cd apps/desktop && pnpm vitest run` で全テスト PASS を確認

### タスク5: 動作確認

**目的**: 実装が正しく動作することを確認する

**確認手順**:

1. TypeScript 型チェック: `cd apps/desktop && pnpm typecheck`
2. ESLint: `cd apps/desktop && pnpm lint`
3. 変更差分の確認: `git diff apps/desktop/src/preload/index.ts`

## 参照資料

| 参照資料       | パス                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| Phase 2 設計書 | `docs/30-workflows/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-2-design.md`        |
| Phase 4 テスト | `docs/30-workflows/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-4-test-creation.md` |
| 対象ファイル   | `apps/desktop/src/preload/index.ts` (L113-117)                               |

## 統合テスト連携

- Phase 4 のテストが全て PASS（Green）になることが完了条件
- Phase 6 でカバレッジ確認を行い、不足箇所にテストを追加

## 成果物

| 成果物           | パス                                |
| ---------------- | ----------------------------------- |
| 修正済みファイル | `apps/desktop/src/preload/index.ts` |

## 完了条件

- [ ] `IPC_TIMEOUT_MS` 定数を追加
- [ ] `safeInvoke` に `Promise.race` パターンを実装
- [ ] Phase 4 のテストが全て PASS（Green）
- [ ] 既存テストが全て PASS
- [ ] TypeScript 型チェック PASS
- [ ] ESLint PASS
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 6: テスト拡充へ進む。カバレッジ不足箇所のテストを追加する。
