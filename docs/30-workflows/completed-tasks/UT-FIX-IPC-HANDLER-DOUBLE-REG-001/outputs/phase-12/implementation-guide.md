# UT-FIX-IPC-HANDLER-DOUBLE-REG-001 実装ガイド

## メタ情報

| 項目      | 内容                                        |
| --------- | ------------------------------------------- |
| タスク ID | UT-FIX-IPC-HANDLER-DOUBLE-REG-001           |
| Phase     | 12 - ドキュメント                           |
| 作成日    | 2026-02-14                                  |
| 関連 P5   | リスナー二重登録（06-known-pitfalls.md#P5） |

---

## Part 1: この修正は何をしたのか（やさしい説明）

### たとえ話：受付係と窓口の問題

このアプリは Electron という仕組みで動いています。Electron では「メインプロセス」と「レンダラープロセス」がメッセージをやり取りして動きます。これを日常のたとえで説明します。

#### お店の受付に例えてみる

大きなお店を想像してください。お店には「受付カウンター」がたくさんあって、それぞれの窓口に「受付係」が一人ずつ座っています。

- **受付カウンター** = IPC チャンネル（メッセージの通り道）
- **受付係** = IPC ハンドラ（メッセージを受け取って処理する担当者）
- **お客さん** = レンダラープロセス（画面側からの要求）

お店のルールとして、「1つの窓口には受付係は1人だけ」と決まっています。

#### 何が問題だったのか

このアプリは macOS で動きます。macOS では、アプリのウィンドウを全部閉じてもアプリ自体は終了しません。Dock のアイコンをクリックすると、ウィンドウが再び開きます。

ここで問題が起きていました。

1. 最初にアプリを起動すると、すべての窓口に受付係が配置されます（正常）
2. ウィンドウを全部閉じます（受付係はそのまま残っています）
3. Dock をクリックしてウィンドウを再び開きます
4. 新しい受付係を配置しようとしますが、**前の受付係がまだ座っています**
5. 「この窓口にはもう受付係がいます！」というエラーが発生します

つまり、**古い受付係を退出させずに新しい受付係を配置しようとしたため**、衝突が起きていたのです。

#### どうやって直したのか

解決方法はシンプルです。

1. 新しい受付係を配置する**前に**、すべての窓口から古い受付係を一斉退出させる
2. 窓口が空になったことを確認してから、新しい受付係を配置する

これが `unregisterAllIpcHandlers()` という関数の役割です。「全員退出！」の号令をかける機能です。

#### 修正前と修正後の比較

| 状況                         | 修正前                                   | 修正後                                    |
| ---------------------------- | ---------------------------------------- | ----------------------------------------- |
| 初回起動時                   | 受付係を配置（正常）                     | 受付係を配置（正常）                      |
| ウィンドウを閉じた時         | 受付係がそのまま残る                     | 受付係がそのまま残る                      |
| Dock クリックで再開した時    | 古い受付係と衝突してエラー               | まず全員退出 → 新しい受付係を配置（正常） |
| テーマ監視（明暗の切り替え） | 古い監視係が残ったまま新しい監視係を追加 | 古い監視係を解任 → 新しい監視係を配置     |
| 繰り返し開閉した時           | 受付係が増え続けてメモリを無駄に消費     | 毎回クリーンな状態で配置                  |

#### ポイントまとめ

- **問題**: ウィンドウ再作成時に、古いメッセージ処理担当が残っていて二重登録エラーになった
- **解決**: 新しい担当者を配置する前に、古い担当者を全員解除する仕組みを追加した
- **影響範囲**: macOS でのみ発生する問題。Windows/Linux ではウィンドウを閉じるとアプリが終了するため発生しない

---

## Part 2: 開発者向け技術詳細

### 2.1 問題の根本原因

macOS の `app.on("activate")` イベントで `BrowserWindow.getAllWindows().length === 0` の場合、新しいウィンドウを作成して `registerAllIpcHandlers()` を再実行していた。しかし、`ipcMain.handle()` は同一チャンネルに対して二重登録を許容しない（`Error: Attempted to register a second handler for 'channel-name'` を投げる）。以前のハンドラが残っている状態で再登録を試みるため、ランタイム例外が発生していた。

関連する既知の落とし穴: **P5（リスナー二重登録）** -- React StrictMode での二重実行と同様のパターンが、Electron のライフサイクルイベントでも発生する。

### 2.2 変更ファイル一覧

| ファイル                                                              | 変更内容                                                                       |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `apps/desktop/src/main/ipc/index.ts`                                  | `unregisterAllIpcHandlers()` 関数の追加、`themeWatcherUnsubscribe` 変数の追加  |
| `apps/desktop/src/main/index.ts`                                      | `unregisterAllIpcHandlers` の import 追加、activate ハンドラ内での呼び出し追加 |
| `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` | 7 テストケースの追加                                                           |

### 2.3 追加関数のインターフェース

```typescript
/**
 * 全 IPC ハンドラを解除する
 * activate イベントで registerAllIpcHandlers() を再実行する前に呼び出す
 *
 * IPC_CHANNELS 定数から全チャンネル名を取得して removeHandler() と
 * removeAllListeners() を実行する。ipcMain.removeHandler() は
 * 未登録チャンネルでもエラーを出さないため安全に全チャンネルを走査できる。
 */
export function unregisterAllIpcHandlers(): void;
```

**パラメータ**: なし
**戻り値**: `void`
**副作用**:

- すべての IPC チャンネルの `ipcMain.handle()` ハンドラを解除
- すべての IPC チャンネルの `ipcMain.on()` リスナーを解除
- `setupThemeWatcher()` が返した unsubscribe 関数を呼び出してテーマ監視を停止

### 2.4 処理フロー

activate イベントでの処理順序は以下の通り。

```
activate イベント発火
  └─ BrowserWindow.getAllWindows().length === 0 ?
       ├─ YES
       │   ├─ 1. unregisterAllIpcHandlers()   ← 古いハンドラを全解除
       │   ├─ 2. createWindow()               ← 新しいウィンドウを作成
       │   └─ 3. registerAllIpcHandlers()      ← 新しいハンドラを登録
       └─ NO
            └─ 何もしない（既存ウィンドウにフォーカス）
```

`unregisterAllIpcHandlers()` の内部処理。

```
unregisterAllIpcHandlers()
  ├─ Object.values(IPC_CHANNELS) で全チャンネル名を取得
  ├─ 各チャンネルに対して:
  │   ├─ ipcMain.removeHandler(channel)        ← handle() 登録を解除
  │   └─ ipcMain.removeAllListeners(channel)   ← on() 登録を解除
  └─ themeWatcherUnsubscribe が存在する場合:
       ├─ themeWatcherUnsubscribe() を呼び出し   ← nativeTheme リスナー解除
       └─ themeWatcherUnsubscribe = null に設定
```

### 2.5 実装の詳細

#### 2.5.1 IPC チャンネルの一括解除

`IPC_CHANNELS` は `as const` で定義されたオブジェクトで、すべてのチャンネル名を文字列リテラル型として保持している。`Object.values(IPC_CHANNELS)` により全チャンネル名を配列として取得し、ループで解除する。

```typescript
const allChannels = Object.values(IPC_CHANNELS);
for (const channel of allChannels) {
  ipcMain.removeHandler(channel);
  ipcMain.removeAllListeners(channel);
}
```

`ipcMain.removeHandler()` はハンドラが未登録のチャンネルに対して呼び出しても例外を投げない。そのため、一部のチャンネルにのみハンドラが登録されている状態でも安全に全チャンネルを走査できる。

`ipcMain.removeAllListeners()` は `ipcMain.on()` で登録されたイベントリスナーを解除する。`ipcMain.handle()` と `ipcMain.on()` は別の仕組みであるため、両方を呼び出す必要がある。

#### 2.5.2 setupThemeWatcher の unsubscribe 管理

`setupThemeWatcher()` は `nativeTheme.on("updated", handler)` でシステムテーマの変更を監視し、変更時に全ウィンドウに通知する。この関数は unsubscribe 関数（`() => void`）を戻り値として返す。

unsubscribe 関数をモジュールスコープの変数 `themeWatcherUnsubscribe` で保持し、`unregisterAllIpcHandlers()` 呼び出し時に実行する。

```typescript
// モジュールスコープ変数
let themeWatcherUnsubscribe: (() => void) | null = null;

// registerAllIpcHandlers() 内で保存
themeWatcherUnsubscribe = setupThemeWatcher(nativeTheme, () =>
  BrowserWindow.getAllWindows(),
);

// unregisterAllIpcHandlers() 内で解除
if (themeWatcherUnsubscribe) {
  themeWatcherUnsubscribe();
  themeWatcherUnsubscribe = null;
}
```

#### 2.5.3 activate ハンドラの修正

```typescript
// apps/desktop/src/main/index.ts

// import に unregisterAllIpcHandlers を追加
import { registerAllIpcHandlers, unregisterAllIpcHandlers } from "./ipc";

// activate ハンドラ
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    unregisterAllIpcHandlers(); // Step 1: 古いハンドラ全解除
    mainWindowRef = createWindow(); // Step 2: 新ウィンドウ作成
    registerAllIpcHandlers(mainWindowRef); // Step 3: 新ハンドラ登録
  }
});
```

### 2.6 セキュリティ

本修正はセキュリティの 4 層防御を維持している。

| 層  | 防御内容                   | 本修正での影響                                                                                                 |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| L1  | チャンネル名ホワイトリスト | 変更なし。`IPC_CHANNELS` 定数と `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` ホワイトリストはそのまま維持 |
| L2  | 送信元ウィンドウ検証       | 変更なし。各ハンドラ内の `event.senderFrame` 検証ロジックに影響なし                                            |
| L3  | 引数バリデーション         | 変更なし。各ハンドラ内のパラメータ検証ロジックに影響なし                                                       |
| L4  | エラーサニタイズ           | 変更なし。エラーレスポンスの内容を変更していない                                                               |

`unregisterAllIpcHandlers()` 自体は `IPC_CHANNELS` に定義されたチャンネルのみを走査するため、未知のチャンネルに対して操作することはない。

### 2.7 テスト

テストファイル: `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`

| #   | テストケース                                                                            | 検証内容                                                                     |
| --- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | 全チャンネルに対して `ipcMain.removeHandler()` を呼び出す                               | `IPC_CHANNELS` の各値に対して `removeHandler` が呼ばれること                 |
| 2   | 全チャンネルに対して `ipcMain.removeAllListeners()` を呼び出す                          | `on()` リスナー用チャンネルも含めて `removeAllListeners` が呼ばれること      |
| 3   | ハンドラが未登録の状態でも例外を投げない                                                | 初回呼び出し（ハンドラ未登録状態）でエラーが発生しないこと                   |
| 4   | `unregisterAllIpcHandlers()` 後に `registerAllIpcHandlers()` を呼んでもエラーにならない | register -> unregister -> register のサイクルが正常に完了すること            |
| 5   | register -> unregister -> register の一連フローが例外なく完了する                       | activate フローのシミュレーション                                            |
| 6   | 複数回の register -> unregister サイクルでも安定動作する                                | 3 サイクル + 最終登録が正常に完了すること                                    |
| 7   | 再登録時に前回の `setupThemeWatcher` の unsubscribe が呼ばれる                          | `themeWatcherUnsubscribe` が `unregisterAllIpcHandlers()` 時に実行されること |

### 2.8 関連する既知の落とし穴

- **P5（リスナー二重登録）**: React StrictMode での `useEffect` 二重実行と同じパターン。本タスクは Main プロセス側で同様の問題が発生していたケース
- **P9（モジュールスコープ変数のテスト間リーク）**: `themeWatcherUnsubscribe` をモジュールスコープで管理するため、テスト間のリセットに `vi.clearAllMocks()` と `beforeEach` を使用

### 2.9 影響プラットフォーム

| プラットフォーム | 影響         | 理由                                                                                       |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------ |
| macOS            | 直接的に影響 | `app.on("activate")` は macOS 固有のイベント。Dock クリックでウィンドウ再作成が発生する    |
| Windows          | 影響なし     | ウィンドウを全て閉じるとアプリが終了する（`window-all-closed` で `app.quit()` が呼ばれる） |
| Linux            | 影響なし     | Windows と同様の動作                                                                       |
