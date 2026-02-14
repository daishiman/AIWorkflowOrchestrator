# IPC ドキュメント: unregisterAllIpcHandlers()

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスク ID    | UT-FIX-IPC-HANDLER-DOUBLE-REG-001    |
| Phase        | 12 - ドキュメント                    |
| 作成日       | 2026-02-14                           |
| 対象ファイル | `apps/desktop/src/main/ipc/index.ts` |

---

## 関数概要

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| 関数名       | `unregisterAllIpcHandlers`                    |
| エクスポート | `export function`（名前付きエクスポート）     |
| モジュール   | `apps/desktop/src/main/ipc/index.ts`          |
| 目的         | 全 IPC ハンドラとリスナーを安全に登録解除する |

---

## 関数シグネチャ

```typescript
export function unregisterAllIpcHandlers(): void;
```

## パラメータ

なし。

## 戻り値

`void` -- 戻り値はない。

## 説明

`unregisterAllIpcHandlers()` は、`IPC_CHANNELS` 定数に定義されたすべてのチャンネル名に対して、以下の 2 つの解除処理を実行する。

1. **`ipcMain.removeHandler(channel)`**: `ipcMain.handle()` で登録されたハンドラを解除する
2. **`ipcMain.removeAllListeners(channel)`**: `ipcMain.on()` で登録されたリスナーを解除する

加えて、`setupThemeWatcher()` が返した unsubscribe 関数をモジュールスコープ変数 `themeWatcherUnsubscribe` から取得して呼び出し、`nativeTheme` のテーマ変更監視リスナーも解除する。

`ipcMain.removeHandler()` は、対象チャンネルにハンドラが登録されていない場合でも例外を投げない。そのため、一部のチャンネルにのみハンドラが存在する状態でも、全チャンネルを安全に走査できる。

---

## 使用例

### 基本的な使用パターン

```typescript
import { registerAllIpcHandlers, unregisterAllIpcHandlers } from "./ipc";

// app.on("activate") 内での使用
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // Step 1: 古いハンドラを全て解除
    unregisterAllIpcHandlers();

    // Step 2: 新しいウィンドウを作成
    mainWindowRef = createWindow();

    // Step 3: 新しいハンドラを登録
    registerAllIpcHandlers(mainWindowRef);
  }
});
```

### 初回起動時（activate 以外）

初回起動時は `unregisterAllIpcHandlers()` の呼び出しは不要。ハンドラが存在しない状態から `registerAllIpcHandlers()` を呼び出すだけでよい。

```typescript
app.whenReady().then(() => {
  mainWindowRef = createWindow();

  // 初回起動時はそのまま登録
  registerAllIpcHandlers(mainWindowRef);

  // activate 時のみ unregister -> register の順序で実行
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      unregisterAllIpcHandlers();
      mainWindowRef = createWindow();
      registerAllIpcHandlers(mainWindowRef);
    }
  });
});
```

---

## 呼び出しタイミング

### 呼び出すべきタイミング

| タイミング                                                      | 説明                                                                       |
| --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `app.on("activate")` 内で `registerAllIpcHandlers()` を呼ぶ直前 | macOS でウィンドウが全て閉じた後に Dock クリックでウィンドウを再作成する際 |

### 呼び出してはいけないタイミング

| タイミング                                   | 理由                                                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 初回の `registerAllIpcHandlers()` 呼び出し前 | ハンドラが未登録なので不要（呼び出しても害はないが意味がない）                                  |
| `registerAllIpcHandlers()` の後に呼び出す    | ハンドラが全解除されてアプリが IPC 通信できなくなる                                             |
| `window-all-closed` イベント内               | macOS では `app.quit()` を呼ばないためプロセスは生存するが、activate 時に改めて解除するため不要 |

---

## 処理内容の詳細

### Step 1: IPC チャンネルの一括解除

```typescript
const allChannels = Object.values(IPC_CHANNELS);
for (const channel of allChannels) {
  ipcMain.removeHandler(channel); // handle() 登録の解除
  ipcMain.removeAllListeners(channel); // on() 登録の解除
}
```

`IPC_CHANNELS` は `apps/desktop/src/preload/channels.ts` で `as const` として定義されており、全チャンネル名を網羅している。2026-02-14 時点で約 130 チャンネルが定義されている。

### Step 2: テーマ監視リスナーの解除

```typescript
if (themeWatcherUnsubscribe) {
  themeWatcherUnsubscribe();
  themeWatcherUnsubscribe = null;
}
```

`themeWatcherUnsubscribe` はモジュールスコープ変数（`let themeWatcherUnsubscribe: (() => void) | null = null`）で、`registerAllIpcHandlers()` 内で `setupThemeWatcher()` の戻り値を保存している。

`setupThemeWatcher()` は内部で `nativeTheme.on("updated", handler)` を呼び出してシステムテーマの変更を監視する。unsubscribe 関数はこの `nativeTheme.removeListener("updated", handler)` を呼び出す。

---

## セキュリティに関する考慮事項

### チャンネルスコープの制限

`unregisterAllIpcHandlers()` は `IPC_CHANNELS` に定義されたチャンネルのみを走査する。アプリケーション外部から注入されたチャンネルや、`IPC_CHANNELS` に含まれない未知のチャンネルに対しては操作を行わない。

### ホワイトリスト機構との関係

本関数はハンドラの解除のみを担当し、ホワイトリスト（`ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS`）の変更は行わない。再登録時にホワイトリストは同一の定数を参照するため、セキュリティポリシーは維持される。

### 4 層防御の維持

| 防御層 | 内容                       | 影響     |
| ------ | -------------------------- | -------- |
| L1     | チャンネル名ホワイトリスト | 変更なし |
| L2     | 送信元ウィンドウ検証       | 変更なし |
| L3     | 引数バリデーション         | 変更なし |
| L4     | エラーサニタイズ           | 変更なし |

### 競合状態（Race Condition）に関して

`unregisterAllIpcHandlers()` と `registerAllIpcHandlers()` の呼び出しは同一の `activate` イベントハンドラ内で同期的に実行される。Electron の Main プロセスはシングルスレッドで動作するため、両関数の間に外部からの IPC メッセージが割り込むことはない。

---

## 関連 API

| 関数名                                                    | 説明                                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| `registerAllIpcHandlers(mainWindow: BrowserWindow): void` | 全 IPC ハンドラを登録する。`unregisterAllIpcHandlers()` の対となる関数 |
| `setupThemeWatcher(theme, getAllWindows): () => void`     | テーマ変更監視を設定し、unsubscribe 関数を返す                         |

---

## テストカバレッジ

テストファイル: `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`

7 テストケースで以下を検証している。

| テストケース                                           | 検証対象                  |
| ------------------------------------------------------ | ------------------------- |
| 全チャンネルに対して `removeHandler()` を呼び出す      | handle() 解除の網羅性     |
| 全チャンネルに対して `removeAllListeners()` を呼び出す | on() 解除の網羅性         |
| 未登録状態でも例外を投げない                           | 安全性                    |
| unregister 後に register が成功する                    | 再登録の正常動作          |
| register -> unregister -> register フローが完了する    | activate シミュレーション |
| 複数サイクルで安定動作する                             | 繰り返し耐性              |
| setupThemeWatcher の unsubscribe が呼ばれる            | テーマ監視の適切な解除    |
