# TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 実装ガイド

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 |
| 対象       | auth-key IPCハンドラ登録漏れ修正           |
| 作成日     | 2026-03-05                                 |
| 関連成果物 | Phase 5/6/9/10/11                          |

## Part 1: 中学生向けの説明

### 何が起きていたか

- アプリの中には「受付窓口（IPCハンドラ）」があります。
- `auth-key:exists` という窓口だけ、起動時に受付係が立っていないことがありました。
- その結果、「受付がありません（No handler registered）」というエラーで先に進めませんでした。

### どう直したか

- アプリ起動時と再起動時に、必ず `auth-key` の受付係を配置するようにしました。
- 画面を閉じて再度開くときは、前の受付係を先に片付けてから新しく配置するようにしました。

### どんな良いことがあるか

- `auth-key:exists` が安定して呼べる。
- 同じ受付係を二重に配置して壊れる問題を防げる。
- 画面側（Renderer）の処理を変えなくても、実行前チェックが正しく動く。

## Part 2: 技術者向け実装詳細

### 変更ファイル

- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`
- `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`

### 実装ポイント

1. Main統合点に auth-key 登録を接続

- `registerAllIpcHandlers(mainWindow)` 内で `AuthKeyService` 生成後に `registerAuthKeyHandlers(mainWindow, authKeyService)` を呼ぶ。

2. Main統合点に auth-key 解除を接続

- `unregisterAllIpcHandlers()` 冒頭で `unregisterAuthKeyHandlers()` を呼ぶ。

3. 既存契約の維持

- Preload公開APIとIPCチャネル名は不変更。
- `auth-key:exists` の戻り値契約 `{ exists: boolean }` を維持。

### API/シグネチャ

```ts
export function registerAuthKeyHandlers(
  mainWindow: BrowserWindow,
  authKeyService: IAuthKeyService,
): void;

export function unregisterAuthKeyHandlers(): void;
```

### エッジケース

- 二重登録: `handlersRegistered` ガードで2回目登録をスキップ。
- 未登録解除: `unregisterAuthKeyHandlers()` は未登録時に安全にreturn。
- 再登録サイクル: `register -> unregister -> register` を繰り返しても状態破綻しない。

### 設定値・環境値

| 項目                      | 用途                                   |
| ------------------------- | -------------------------------------- |
| `ANTHROPIC_API_KEY`       | `auth-key:exists` の env fallback 判定 |
| `IPC_CHANNELS.AUTH_KEY_*` | auth-key 4チャネル定義                 |

### 検証コマンド

```bash
pnpm --filter @repo/desktop test:run \
  src/main/ipc/__tests__/ipc-double-registration.test.ts \
  src/main/ipc/__tests__/authKeyHandlers.test.ts \
  src/renderer/hooks/__tests__/useSkillExecution.test.ts \
  src/renderer/stores/agent/__tests__/agentSlice.executeSkill.preflight.test.ts

pnpm --filter @repo/desktop typecheck
```

### 検証結果

- 76 tests PASS（実行ログ上は3 test files）
- typecheck PASS
