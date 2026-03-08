# Phase 2: 設計

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 2                                             |
| タスクID  | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名    | supabase-fallback-profile-avatar              |
| 作成日    | 2026-03-07                                    |
| 前提Phase | Phase 1 要件定義                              |

## 目的

Phase 1で定義した要件に基づき、Profile/Avatarフォールバックハンドラの具体的な設計を行う。既存の `registerAuthFallbackHandlers()` パターンとの一貫性を維持しつつ、14チャンネル分のフォールバックを実装するための設計を確定する。

## 実行タスク

- Task 1: アーキテクチャ設計: `registerAuthFallbackHandlers()` と整合する Profile / Avatar fallback 構成を決める
- Task 2: インターフェース設計: not configured 応答の envelope とエラーコード方針を定義する
- Task 3: 関数詳細設計: 14 チャンネルを `ReadonlyArray` で宣言的に登録する形へ落とし込む
- Task 4: 影響範囲分析: 変更対象と非対象を分け、通常経路との境界を固定する
- Task 5: P5（二重登録）対策: if/else 排他と `unregisterAllIpcHandlers()` 前提を設計に含める

### Task 1: アーキテクチャ設計

#### 関数設計

```
registerAuthFallbackHandlers()    ← 既存（5チャンネル）
registerProfileFallbackHandlers() ← 新設（11チャンネル）
registerAvatarFallbackHandlers()  ← 新設（3チャンネル）
```

#### 呼び出し箇所

`apps/desktop/src/main/ipc/index.ts` の `else` ブロック（line 463-468）内:

```typescript
} else {
  console.warn(
    "[IPC] Auth, profile, and avatar handlers not registered - Supabase not configured",
  );
  registerAuthFallbackHandlers();
  registerProfileFallbackHandlers();  // 追加
  registerAvatarFallbackHandlers();   // 追加
}
```

### Task 2: インターフェース設計

#### Profile フォールバックレスポンス

```typescript
const profileNotConfiguredResponse = {
  success: false,
  error: {
    code: PROFILE_ERROR_CODES.NOT_CONFIGURED,
    message:
      "Profile service is not configured. Supabase environment variables are required.",
  },
};
```

#### Avatar フォールバックレスポンス

```typescript
const avatarNotConfiguredResponse = {
  success: false,
  error: {
    code: AVATAR_ERROR_CODES.NOT_CONFIGURED,
    message:
      "Avatar service is not configured. Supabase environment variables are required.",
  },
};
```

#### レスポンス形式の根拠

- 既存の `registerAuthFallbackHandlers()` と同一構造（`{ success, error: { code, message } }`）
- エラーコードは shared 定義を正本とし、`AUTH_ERROR_CODES.AUTH_NOT_CONFIGURED` (`auth/not-configured`) に揃えて `PROFILE_ERROR_CODES.NOT_CONFIGURED` (`profile/not-configured`) / `AVATAR_ERROR_CODES.NOT_CONFIGURED` (`avatar/not-configured`) を追加する
- メッセージは英語（Renderer側でi18n変換する前提）
- 重複を避けるため `createNotConfiguredResponse()` / `registerFallbackHandlers()` を抽出し、各ドメインはチャンネル配列だけを持つ

### Task 3: 関数詳細設計

#### `registerProfileFallbackHandlers()`

```typescript
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

#### `registerAvatarFallbackHandlers()`

```typescript
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

### Task 4: 影響範囲分析

#### 変更ファイル

| ファイル                             | 変更内容                               | リスク                 |
| ------------------------------------ | -------------------------------------- | ---------------------- |
| `apps/desktop/src/main/ipc/index.ts` | 2関数追加 + elseブロックに呼び出し追加 | 低: 既存パターンの複製 |

#### 変更しないファイル

| ファイル                                       | 理由                             |
| ---------------------------------------------- | -------------------------------- |
| `apps/desktop/src/preload/channels.ts`         | チャンネル定数は既存のものを使用 |
| `apps/desktop/src/main/ipc/profileHandlers.ts` | 通常ハンドラは変更不要           |
| `apps/desktop/src/main/ipc/avatarHandlers.ts`  | 通常ハンドラは変更不要           |

### Task 5: P5（リスナー二重登録）対策

`ipcMain.handle()` は同一チャンネルへの二重登録で例外を送出する。フォールバックハンドラは `getSupabaseClient()` が null の場合のみ登録されるため、通常ハンドラとの競合は発生しない。ただし、以下を確認する:

1. `registerAllIpcHandlers()` の `if/else` 分岐で、Profile/Avatarの通常登録とフォールバック登録が排他的であること
2. `registerAllIpcHandlers()` が複数回呼ばれる場合（macOS `activate` イベント等）の安全性は、既存の `unregisterAllIpcHandlers()` で担保されていること

## 参照資料

| 資料名                  | パス                                                                                                         | 説明             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------- |
| Phase 1 要件定義        | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-1-requirements.md` | 要件・受入基準   |
| Auth フォールバック実装 | `apps/desktop/src/main/ipc/index.ts:682-721`                                                                 | 参考パターン     |
| IPCチャンネル定数       | `apps/desktop/src/preload/channels.ts:58-75`                                                                 | チャンネル名定義 |

### システム仕様（aiworkflow-requirements）

- `references/api-ipc-auth.md` - Profile / Avatar を含む IPC チャネル一覧と fallback 仕様
- `references/architecture-auth-security.md` - Supabase 依存ドメインの責務分離
- `references/security-electron-ipc.md` - `ipcMain.handle` の登録 / 解除ルール
- `references/ipc-contract-checklist.md` - fallback 経路を含む契約同期チェック
- `references/error-handling.md` - not configured 応答の整理先

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

1. 既存の `registerAuthFallbackHandlers()` のコードパターンを確認
2. `registerProfileFallbackHandlers()` の関数シグネチャとレスポンス構造を設計
3. `registerAvatarFallbackHandlers()` の関数シグネチャとレスポンス構造を設計
4. `else` ブロックへの呼び出し追加箇所を特定
5. 影響範囲を分析し、変更ファイルを確定
6. P5（二重登録）対策の設計確認

## 統合テスト連携

- Phase 4 の RED テストで検証できるよう、各チャンネルの request / response 形を設計段階で固定する
- Phase 6 の回帰テストに向けて、Profile 11 / Avatar 3 の件数検証と `getSupabaseClient()` 分岐の排他性をテスト観点へ落とし込む
- Phase 11 の手動テストでは、設計した fallback メッセージと UI 側のクラッシュ非発生を対応付ける

## 成果物

| 成果物 | パス                                                                                                   | 説明           |
| ------ | ------------------------------------------------------------------------------------------------------ | -------------- |
| 設計書 | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-2-design.md` | 本ドキュメント |

## 完了条件

- [ ] `registerProfileFallbackHandlers()` の関数設計が完了
- [ ] `registerAvatarFallbackHandlers()` の関数設計が完了
- [ ] レスポンス構造が既存パターンと一致することを確認
- [ ] 呼び出し箇所（elseブロック）の変更内容が明確
- [ ] 影響範囲分析で変更ファイルが1ファイルに限定されることを確認
- [ ] P5（二重登録）対策が設計に含まれている

## 次のPhase

Phase 3: 設計レビュー
