# Phase 5: 実装

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 5                                             |
| タスクID  | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名    | supabase-fallback-profile-avatar              |
| 作成日    | 2026-03-07                                    |
| 前提Phase | Phase 4 テスト作成（RED確認済み）             |

## 目的

Phase 2の設計とPhase 4のテストに基づき、shared error code 定義と共通 helper（`createNotConfiguredResponse()` / `registerFallbackHandlers()`）を使って `registerProfileFallbackHandlers()` と `registerAvatarFallbackHandlers()` を実装する。TDDのGreenフェーズとして、全テストをパスさせる。

## 実行タスク

- Task 1: 共通 helper と `registerProfileFallbackHandlers()` の実装: shared const と宣言的登録に統一する
- Task 2: `registerAvatarFallbackHandlers()` の実装: Avatar 3 チャンネルの fallback を追加する
- Task 3: else ブロックへの呼び出し追加: Supabase 未設定分岐に 2 関数を接続する
- Task 4: テスト実行（GREEN確認）: Phase 4 で追加した契約テストを通す

### Task 1: `registerProfileFallbackHandlers()` の実装

#### 対象ファイル

`apps/desktop/src/main/ipc/index.ts`

#### 実装内容

`registerAuthFallbackHandlers()` の近傍で、まず `createNotConfiguredResponse()` / `registerFallbackHandlers()` を抽出し、その上で以下を追加:

```typescript
/**
 * Register fallback profile handlers when Supabase is not configured
 * These handlers return appropriate "not configured" responses
 */
function registerProfileFallbackHandlers(): void {
  const notConfiguredResponse = {
    success: false,
    error: {
      code: PROFILE_ERROR_CODES.NOT_CONFIGURED,
      message:
        "Profile service is not configured. Supabase environment variables are required.",
    },
  };

  const fallbackProfileHandlers: ReadonlyArray<
    readonly [string, () => Promise<unknown>]
  > = [
    [IPC_CHANNELS.PROFILE_GET, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_UPDATE, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_DELETE, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_GET_PROVIDERS, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_LINK_PROVIDER, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_UNLINK_PROVIDER, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_UPDATE_TIMEZONE, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_UPDATE_LOCALE, async () => notConfiguredResponse],
    [
      IPC_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS,
      async () => notConfiguredResponse,
    ],
    [IPC_CHANNELS.PROFILE_EXPORT, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_IMPORT, async () => notConfiguredResponse],
  ];

  for (const [channel, handler] of fallbackProfileHandlers) {
    ipcMain.handle(channel, handler);
  }
}
```

### Task 2: `registerAvatarFallbackHandlers()` の実装

#### 対象ファイル

`apps/desktop/src/main/ipc/index.ts`

#### 実装内容

`registerProfileFallbackHandlers()` の直後に以下を追加:

```typescript
/**
 * Register fallback avatar handlers when Supabase is not configured
 * These handlers return appropriate "not configured" responses
 */
function registerAvatarFallbackHandlers(): void {
  const notConfiguredResponse = {
    success: false,
    error: {
      code: AVATAR_ERROR_CODES.NOT_CONFIGURED,
      message:
        "Avatar service is not configured. Supabase environment variables are required.",
    },
  };

  const fallbackAvatarHandlers: ReadonlyArray<
    readonly [string, () => Promise<unknown>]
  > = [
    [IPC_CHANNELS.AVATAR_UPLOAD, async () => notConfiguredResponse],
    [IPC_CHANNELS.AVATAR_USE_PROVIDER, async () => notConfiguredResponse],
    [IPC_CHANNELS.AVATAR_REMOVE, async () => notConfiguredResponse],
  ];

  for (const [channel, handler] of fallbackAvatarHandlers) {
    ipcMain.handle(channel, handler);
  }
}
```

### Task 3: else ブロックへの呼び出し追加

#### 対象ファイル

`apps/desktop/src/main/ipc/index.ts`

#### 変更箇所（line 463-469付近）

```typescript
// Before:
} else {
  console.warn(
    "[IPC] Auth, profile, and avatar handlers not registered - Supabase not configured",
  );
  registerAuthFallbackHandlers();
}

// After:
} else {
  console.warn(
    "[IPC] Auth, profile, and avatar handlers not registered - Supabase not configured",
  );
  registerAuthFallbackHandlers();
  registerProfileFallbackHandlers();
  registerAvatarFallbackHandlers();
}
```

### Task 4: テスト実行（GREEN確認）

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/fallback-handlers.test.ts
```

全テストケース（T-P1〜T-P5, T-A1〜T-A4, T-I1〜T-I2）がパスすることを確認する。

## 参照資料

| 資料名              | パス                                                                                                          | 説明         |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ------------ |
| Phase 2 設計        | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-2-design.md`        | 関数設計     |
| Phase 4 テスト      | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-4-test-creation.md` | テストケース |
| Auth フォールバック | `apps/desktop/src/main/ipc/index.ts:682-721`                                                                  | 参考パターン |

### システム仕様（aiworkflow-requirements）

- `references/error-handling.md` - エラーコード体系

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

1. `apps/desktop/src/main/ipc/index.ts` を開く
2. `registerAuthFallbackHandlers()` の直後に `registerProfileFallbackHandlers()` を実装
3. 続けて `registerAvatarFallbackHandlers()` を実装
4. `else` ブロック内に2つの関数呼び出しを追加
5. テスト実行して全件 GREEN であることを確認
6. `pnpm lint` と `pnpm typecheck` でエラーがないことを確認

## 統合テスト連携

- `ipc-double-registration.test.ts` の RED ケースを GREEN にし、通常経路と fallback 経路が同時登録されないことを確認する
- fallback 応答の代表ケースとして `profile:get` と `avatar:upload` の戻り値 shape を固定する
- Phase 11 の手動検証に備え、Supabase 未設定時でも Renderer が致命的例外を受けない前提をここで担保する

## 成果物

| 成果物     | パス                                 | 説明                                         |
| ---------- | ------------------------------------ | -------------------------------------------- |
| 実装コード | `apps/desktop/src/main/ipc/index.ts` | Profile/Avatar フォールバック関数 + 呼び出し |

## 完了条件

- [ ] `registerProfileFallbackHandlers()` が11チャンネルにフォールバックを登録
- [ ] `registerAvatarFallbackHandlers()` が3チャンネルにフォールバックを登録
- [ ] `else` ブロックから両関数が呼び出される
- [ ] 全テストケース（11件）がGREEN
- [ ] `pnpm lint` がエラーなし
- [ ] `pnpm typecheck` がエラーなし
- [ ] チャンネル名はハードコードではなく `IPC_CHANNELS` 定数を使用（P27対策）

## 次のPhase

Phase 6: テスト拡充
