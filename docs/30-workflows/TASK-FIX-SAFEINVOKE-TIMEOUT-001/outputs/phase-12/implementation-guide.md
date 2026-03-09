# 実装ガイド - TASK-FIX-SAFEINVOKE-TIMEOUT-001

## メタ情報

| 項目     | 内容                            |
| -------- | ------------------------------- |
| タスクID | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| 作成日   | 2026-03-09                      |
| Phase    | 12                              |

---

## Part 1: やさしい解説（中学生レベル）

### 電話をかけたとき、相手が出なかったら？

#### どんな問題？

友だちに電話をかけたとき、相手がいつまでも出ないことがあります。
普通なら「30秒待っても出ないなら切ろう」と判断しますよね。

でも、これまでの `safeInvoke` は「相手が出るまで永遠に待ち続ける電話」のようなものでした。相手が出ない限り、ずっと電話を持ったまま何もできません。

#### どう直した？

「5秒待っても返事がなかったら、電話を切る」仕組みを追加しました。

**イメージ**:

1. 電話をかける（IPC呼び出し）
2. 同時に5秒のタイマーを開始
3. 相手が出たら → そのまま会話（正常応答）
4. 5秒経っても出なかったら → 電話を切って「出ませんでした」と報告（タイムアウトエラー）

#### 技術的には何をした？

`Promise.race` という「競争」の仕組みを使いました。IPC呼び出しとタイムアウトタイマーを同時にスタートさせて、先にゴールした方の結果を採用します。

```
IPC 呼び出し ──────────────────────────> 応答
タイムアウト ─────(5秒)──> タイムアウトエラー

どちらかが先にゴールしたら → その結果を使う
```

---

## Part 2: 開発者向け実装詳細

### 1. 問題の技術的説明

#### 現在のコード（問題あり）

**ファイル**: `apps/desktop/src/preload/index.ts` L113-117

```typescript
// Type-safe invoke wrapper
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
  // ↑ タイムアウト機構なし。Main Process が応答しない場合、Promise は永遠に pending
}
```

#### なぜ問題なのか

`ipcRenderer.invoke()` は Electron の IPC 機構を使って Main Process のハンドラを呼び出します。通常は即座に応答が返りますが、以下のケースでハングする可能性があります:

- Main Process のハンドラ内で外部API（Supabase等）への接続がタイムアウトした場合
- Main Process のハンドラ登録が完了する前に Renderer からの呼び出しが来た場合
- Main Process のスレッドがブロックされている場合

この場合、`safeInvoke` から返された Promise は永遠に pending のままとなり、呼び出し元の処理（例: `initializeAuth()`）も完了しません。

**影響チェーン**:

```
safeInvoke ハング
  → initializeAuth() が isLoading=true のまま完了しない
  → getAuthState({isLoading: true}) = "checking"
  → AuthGuard が <LoadingScreen /> を表示し続ける
  → Settings 画面に到達不可能
  → API キーの設定ができない
```

### 2. 修正内容

#### 修正後のコード

```typescript
// タイムアウト定数
const IPC_TIMEOUT_MS = 5000; // 5秒

// Type-safe invoke wrapper (タイムアウト付き)
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

### 3. Promise.race パターンの解説

`Promise.race` は複数の Promise を受け取り、最初に settle（resolve または reject）した Promise の結果を返します。

```typescript
Promise.race([
  promiseA, // IPC 呼び出し
  promiseB, // タイムアウトタイマー
]);
// promiseA が先に解決 → promiseA の結果を返す
// promiseB が先に reject → タイムアウトエラーを投げる
```

### 4. IPC_TIMEOUT_MS 定数の説明

**値**: 5000ms（5秒）

**根拠**:

- 通常のIPC応答時間: 10-100ms（ローカル処理）
- 外部API呼び出し（Supabase等）: 1000-3000ms（ネットワーク遅延含む）
- 5000ms: Supabase `getSession()` の想定最大遅延（2-3秒）に余裕を持たせた値

**注意**: チャンネルごとに異なるタイムアウト値が必要な場合は、将来の未タスクとして検討（`IPC_TIMEOUT_MS` カスタマイズ）。

### 5. エラーメッセージ形式

タイムアウト発生時のエラーメッセージ:

```
IPC timeout: auth:get-session did not respond within 5000ms
```

このフォーマットにより:

- どのチャンネルでタイムアウトが発生したか特定できる
- タイムアウト時間が記録される
- ログ検索が容易

### 6. タイムアウト後の処理フロー

タイムアウトエラーは `catch` ブロックで捕捉されます:

```typescript
// authSlice.ts での処理例
try {
  response = await window.electronAPI.auth.getSession();
} catch (error) {
  // タイムアウトエラーも含むすべての例外をここで処理
  console.warn("[AuthSlice] getSession failed:", error.message);
  set({
    isAuthenticated: false,
    isLoading: false, // ← 重要: isLoading を必ず false に
  });
  return;
}
```

### 7. メモリリーク対策の判断根拠

`setTimeout` で作成したタイマーは、`Promise.race` が resolve した後もタイマーが残ることがあります（メモリリークの可能性）。

**今回の判断**: タイムアウトタイマーは `clearTimeout` で明示的にキャンセルしない。

**理由**:

- Electron アプリでは window が閉じられるとすべてのタイマーが自動クリアされる
- IPC 呼び出しは短命（通常5秒以内に完了）なため、タイマーの蓄積は無視できる程度
- 複雑なクリーンアップコードを避けることで実装の単純さを維持

より厳密なメモリ管理が必要な場合は、以下のパターンを使用:

```typescript
function safeInvokeWithCleanup<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`IPC timeout: ${channel}`)),
      IPC_TIMEOUT_MS,
    );

    ipcRenderer
      .invoke(channel, ...args)
      .then((result) => {
        clearTimeout(timer); // タイマーをキャンセル
        resolve(result as T);
      })
      .catch((error) => {
        clearTimeout(timer); // タイマーをキャンセル
        reject(error);
      });
  });
}
```

### 8. 関連する既知の落とし穴

- **P13（タイマーテストの無限ループ）**: タイムアウトのテストでは `runAllTimers` ではなく `advanceTimersByTime` を使用すること
- **P42（trim バリデーション漏れ）**: IPC ハンドラ引数の3段バリデーション標準化
- **P44（IPC 引数命名の契約ドリフト）**: ハンドラの引数名と実際の値のセマンティクスを一致させること

### 9. テスト実装のポイント

```typescript
// vitest での タイムアウトテスト例
it("should timeout after IPC_TIMEOUT_MS", async () => {
  // ipcRenderer.invoke をハング状態にモック
  vi.mocked(ipcRenderer.invoke).mockImplementation(
    () => new Promise(() => {}), // 永遠に pending
  );

  vi.useFakeTimers();

  const promise = safeInvoke("auth:get-session");

  // 5秒進める
  await vi.advanceTimersByTimeAsync(5000);

  await expect(promise).rejects.toThrow("IPC timeout: auth:get-session");

  vi.useRealTimers();
});
```

---

## 未タスク候補

| 候補                        | 説明                                                 | 優先度 |
| --------------------------- | ---------------------------------------------------- | ------ |
| safeOn タイムアウト         | safeOn にも同様のタイムアウト機構が必要か検討        | P3     |
| IPC_TIMEOUT_MS カスタマイズ | チャンネルごとに異なるタイムアウト値を設定可能にする | P4     |
| タイムアウト時のリトライ    | タイムアウト後の自動リトライ機構                     | P4     |

---

## 関連タスク

| タスク ID                                      | 関係                                                |
| ---------------------------------------------- | --------------------------------------------------- |
| TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001      | アプリ層の根本原因（本タスクの前提修正）            |
| TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 | UI 層の防御（本タスクと組み合わせて多層防御を構成） |
