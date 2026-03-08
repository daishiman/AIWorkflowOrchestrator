# 実装ガイド: Supabase fallback for Profile / Avatar

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| タスクID | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| Phase    | 12 - ドキュメント                             |
| 作成日   | 2026-03-08                                    |

## Part 1: なぜ必要かを先に説明する

### 例え: 受付に人がいない窓口

たとえば市役所の窓口で、担当者がいないのに案内板も置かれていなかったら、来た人は「どうしていいか分からない」状態になる。アプリでも同じで、Profile や Avatar の処理先が未登録だと、Renderer は返事をもらえず `No handler registered` で壊れる。

今回の fallback ハンドラは、この「案内板」にあたる。Supabase が無い日でも、窓口そのものは残し、「今は使えません」と安全に返答する。

### 何が変わるか

- Supabase 未設定でも `profile:*` 11 チャネルと `avatar:*` 3 チャネルが必ず応答する
- Renderer はクラッシュせず、error envelope を受け取って表示できる
- Auth と同じ fallback パターンに揃うので、実装と保守の一貫性が上がる

### どう動くか

1. アプリ起動時に `getSupabaseClient()` を確認する
2. Supabase ありなら通常 handler を登録する
3. Supabase なしなら fallback handler を登録する
4. どちらの経路でも Renderer から見れば「応答が返る」状態になる

## Part 2: 開発者向け実装詳細

### TypeScript 型定義

```ts
type FallbackHandler = readonly [
  channel: string,
  handler: () => Promise<unknown>,
];

type NotConfiguredResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};
```

### APIシグネチャ

```ts
function createNotConfiguredResponse(
  code: string,
  message: string,
): NotConfiguredResponse;

function registerFallbackHandlers(
  handlers: ReadonlyArray<FallbackHandler>,
): void;

function registerProfileFallbackHandlers(): void;

function registerAvatarFallbackHandlers(): void;

function registerAllIpcHandlers(mainWindow: BrowserWindow): Promise<void>;
```

### 実装ポイント

#### 1. 共通レスポンス生成

`createNotConfiguredResponse()` は Auth / Profile / Avatar で共通の error envelope を作る。

```ts
function createNotConfiguredResponse(code: string, message: string) {
  return {
    success: false,
    error: { code, message },
  };
}
```

#### 2. 宣言的な一括登録

`registerFallbackHandlers()` に `ReadonlyArray<FallbackHandler>` を渡し、`ipcMain.handle()` の重複記述を避ける。

```ts
function registerFallbackHandlers(
  handlers: ReadonlyArray<FallbackHandler>,
): void {
  for (const [channel, handler] of handlers) {
    ipcMain.handle(channel, handler);
  }
}
```

#### 3. Profile / Avatar 追加分

- Profile: 11 チャネル
- Avatar: 3 チャネル
- error code は shared の `PROFILE_ERROR_CODES.NOT_CONFIGURED` / `AVATAR_ERROR_CODES.NOT_CONFIGURED` を参照する

### 使用例

新しい Supabase 依存チャネルを追加する場合は、通常 handler と同じタイミングで fallback 配列にも 1 行追加する。

```ts
const fallbackProfileHandlers: ReadonlyArray<FallbackHandler> = [
  [IPC_CHANNELS.PROFILE_GET, async () => notConfiguredResponse],
  [IPC_CHANNELS.PROFILE_UPDATE, async () => notConfiguredResponse],
  [IPC_CHANNELS.PROFILE_IMPORT, async () => notConfiguredResponse],
];
```

### エラーハンドリング

- Main Process は `No handler registered` を Renderer へ漏らさない
- fallback 経路では常に `success: false` を返す
- stack trace や内部パスは返さない
- `auth:get-session` だけは例外で `success: true, data: null` を返す既存契約を維持する

### エッジケース

| ケース                                             | 対応                                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| チャネル追加後に fallback 配列更新を忘れる         | `fallback-handlers.test.ts` のチャネル網羅テストで検出                                               |
| macOS `activate` 等で再登録が走る                  | `unregisterAllIpcHandlers()` を先に実行し二重登録を防ぐ                                              |
| Renderer が transport `message` をそのまま表示する | Phase 11 で発見。未タスク `UT-IMP-PROFILE-AVATAR-FALLBACK-ERROR-LOCALIZATION-001` として切り出し済み |

### 設定と定数

| 項目                                 | 値 / 意味                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `PROFILE_ERROR_CODES.NOT_CONFIGURED` | `profile/not-configured`                                                                   |
| `AVATAR_ERROR_CODES.NOT_CONFIGURED`  | `avatar/not-configured`                                                                    |
| fallback message                     | transport 既定文言。UI では `error.code` を起点に localized message へ変換するのが望ましい |
| 判定条件                             | `getSupabaseClient()` が `null` のとき fallback 経路へ入る                                 |

### 補足

- 実画面検証は `phase11-auth-mode.html` harness で `SettingsView` を直接描画して行った
- Phase 11 では 3 枚のスクリーンショットで Settings overview / Profile fallback / Avatar fallback を確認した
