# 実装パターン総合ガイド / reference bundle

> 親仕様書: [architecture-implementation-patterns.md](architecture-implementation-patterns.md)
> 役割: reference bundle

## AgentView Enhancement 実装パターン（TASK-UI-03 2026-03-07実装）

### S30: IPC Fallback Handler DRYヘルパーパターン（TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 2026-03-08実装）

Supabase等の外部サービスが未設定の環境で、IPCハンドラが未登録のままRendererからの呼び出しがクラッシュする問題を防止する。共通ヘルパーで複数ドメインのフォールバックを宣言的に登録する。

#### 設計原則

| 原則                         | 実装                                                                   |
| ---------------------------- | ---------------------------------------------------------------------- |
| DRY（Don't Repeat Yourself） | `createNotConfiguredResponse()` と `registerFallbackHandlers()` を共有 |
| 宣言的登録                   | `ReadonlyArray<FallbackHandler>` タプル配列で静的定義                  |
| 排他分岐（P5対策）           | `getSupabaseClient()` null チェックの if/else で通常経路と排他         |
| 型安全                       | `FallbackHandler = readonly [string, () => Promise<unknown>]`          |
| 定数参照（P27対策）          | チャンネル名は全て `IPC_CHANNELS.*` 定数経由                           |

#### コード例

```typescript
// 共通ヘルパー: apps/desktop/src/main/ipc/index.ts
type FallbackHandler = readonly [string, () => Promise<unknown>];

function createNotConfiguredResponse(code: string, message: string) {
  return { success: false, error: { code, message } };
}

function registerFallbackHandlers(
  handlers: ReadonlyArray<FallbackHandler>,
): void {
  for (const [channel, handler] of handlers) {
    ipcMain.handle(channel, handler);
  }
}

// ドメイン別フォールバック登録（Profile例）
function registerProfileFallbackHandlers(): void {
  const response = createNotConfiguredResponse(
    PROFILE_ERROR_CODES.NOT_CONFIGURED,
    "Profile service is not configured. Supabase environment variables are required.",
  );
  const handlers: ReadonlyArray<FallbackHandler> = [
    [IPC_CHANNELS.PROFILE_GET, async () => response],
    [IPC_CHANNELS.PROFILE_UPDATE, async () => response],
    // ... 残り9チャンネル
  ];
  registerFallbackHandlers(handlers);
}

// if/else 排他分岐
const supabase = getSupabaseClient();
if (supabase) {
  registerAuthHandlers(mainWindow, supabase, secureStorage);
  registerProfileHandlers(mainWindow, supabase, profileCache);
  registerAvatarHandlers(mainWindow, supabase);
} else {
  registerAuthFallbackHandlers();
  registerProfileFallbackHandlers();
  registerAvatarFallbackHandlers();
}
```

#### 適用ガイド

| Step | 内容                                                                 | 確認基準                                            |
| ---- | -------------------------------------------------------------------- | --------------------------------------------------- |
| 1    | エラーコード定数を `packages/shared/types/` に追加                   | `as const` アサーション付き                         |
| 2    | `createNotConfiguredResponse()` でレスポンス生成                     | `{ success: false, error: { code, message } }` 形式 |
| 3    | `ReadonlyArray<FallbackHandler>` でチャンネル-ハンドラ対を宣言       | `IPC_CHANNELS.*` 定数使用                           |
| 4    | `registerFallbackHandlers()` で一括登録                              | for...of ループ                                     |
| 5    | if/else 排他分岐に呼び出しを追加                                     | 通常経路とfallback経路が排他                        |
| 6    | テストで `ipcMain.handle` モックの呼び出し回数・レスポンス形式を検証 | 全チャンネル分のPASS                                |

#### テスト戦略

```typescript
// 内部関数が export されていない場合のモック戦略
// getSupabaseClient() の戻り値で分岐制御
mockGetSupabaseClient.mockReturnValue(null); // fallback経路
registerAllIpcHandlers(mockWindow);

// プレフィックスフィルタリングで対象チャンネルを抽出
const profileCalls = mockHandle.mock.calls.filter(
  ([ch]) => typeof ch === "string" && ch.startsWith("profile:"),
);
expect(profileCalls).toHaveLength(11);

// レスポンス構造の検証
const handler = profileCalls[0][1];
const result = await handler();
expect(result).toEqual({
  success: false,
  error: {
    code: PROFILE_ERROR_CODES.NOT_CONFIGURED,
    message: expect.stringContaining("not configured"),
  },
});
```

#### 関連パターン

| パターン | 関連                                                    |
| -------- | ------------------------------------------------------- |
| S22      | AUTH IPC登録一元化パターン（同一構造の先行実装）        |
| P5       | リスナー二重登録防止（排他分岐で対策）                  |
| P27      | ハードコード文字列防止（IPC_CHANNELS定数使用）          |
| P50      | 既実装防御の発見（本パターンはP50該当で検証モード適用） |

---

### S31: Electron role ベースメニュー追加パターン（TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 2026-03-16実装）

Electron の `Menu.buildFromTemplate()` で `role` プロパティを使用した OS ネイティブメニュー項目の追加パターン。ズーム操作やウィンドウ操作など、OS 標準の振る舞いを活用する場合に適用する。

#### 設計原則

| 原則                     | 実装                                                         |
| ------------------------ | ------------------------------------------------------------ |
| role 優先                | カスタム `click` ハンドラより `role` を優先（OS 標準動作保証）|
| ファイル分離             | メニュー定義を独立ファイルに分離（main.ts の肥大化防止）     |
| Platform 分岐テスト      | `vi.spyOn(process, "platform", "get")` で macOS/Windows 分岐 |
| 副作用分離               | `Menu.setApplicationMenu()` を呼び出す関数を分離しテスト容易に|

#### コード例

```typescript
// apps/desktop/src/main/menu.ts（分離されたメニュー定義）
import { Menu, type MenuItemConstructorOptions } from "electron";

export function createApplicationMenu(): Menu {
  const isMac = process.platform === "darwin";

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [{ label: "App", submenu: [{ role: "about" as const }, { role: "quit" as const }] }]
      : []),
    {
      label: "View",
      submenu: [
        { role: "zoomIn" as const },
        { role: "zoomOut" as const },
        { role: "resetZoom" as const },
        { type: "separator" as const },
        { role: "togglefullscreen" as const },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
```

#### テスト戦略

```typescript
// platform 分岐テスト
describe("createApplicationMenu", () => {
  it("macOS ではアプリメニューを含む", () => {
    vi.spyOn(process, "platform", "get").mockReturnValue("darwin");
    const menu = createApplicationMenu();
    // menu.items[0] がアプリメニュー
    expect(menu.items[0].label).toBe("App");
  });

  it("Windows ではアプリメニューを含まない", () => {
    vi.spyOn(process, "platform", "get").mockReturnValue("win32");
    const menu = createApplicationMenu();
    expect(menu.items[0].label).not.toBe("App");
  });
});
```

#### 利用可能な role 一覧（主要）

| カテゴリ   | role                                     | 説明               |
| ---------- | ---------------------------------------- | ------------------ |
| ズーム     | `zoomIn`, `zoomOut`, `resetZoom`         | 画面拡大/縮小/リセット |
| ウィンドウ | `minimize`, `close`, `togglefullscreen`  | ウィンドウ操作     |
| 編集       | `undo`, `redo`, `cut`, `copy`, `paste`   | クリップボード操作 |
| macOS専用  | `about`, `hide`, `unhide`, `quit`        | アプリ制御         |

#### 関連パターン

| パターン | 関連                                           |
| -------- | ---------------------------------------------- |
| P5       | リスナー二重登録防止（メニュー初期化の一回性） |
| Phase 4  | import 副作用チェック（main.ts 分離の動機）    |

---

