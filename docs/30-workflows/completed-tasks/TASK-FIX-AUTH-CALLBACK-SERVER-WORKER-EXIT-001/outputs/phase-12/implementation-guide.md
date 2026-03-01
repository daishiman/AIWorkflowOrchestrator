# Phase 12 実装ガイド

## Part 1（中学生向け）

この修正は「見張り番」と「電気を消す人」を分ける話です。

- `waitForCallback()` は「呼び鈴が鳴るのを待つ見張り番」です。
- `stop()` は「部屋の電気を消して片付ける人」です。

前は、見張り番が時間切れになると勝手に電気まで消していました。これだと、片付ける順番が崩れてエラーになりやすくなります。

今回の修正で、

- 時間切れは「待てなかった」と伝えるだけ
- 電気を消すのは `stop()` を呼ぶ側が責任を持って実行
  に変えました。

## Part 2（技術者向け）

### 変更点

- `createAuthCallbackServer().waitForCallback()`
  - timeoutハンドラ内の `instance.stop().catch(...)` を削除
  - timeout時は `reject(new Error("Callback timeout: no response received"))` のみ
- `createAuthCallbackServer().stop()`
  - `if (!server || !server.listening) { resolve(); return; }` を追加
  - `server.close((_err)=>...)` の close エラーは握りつぶし（停止済み等を許容）
- `authCallbackServer.test.ts`
  - `SRV-06` timeoutケース後に `await server.stop()` を追加

### API契約

- `waitForCallback(): Promise<AuthCallbackResult>`
  - 成功: code(+state) を resolve
  - timeout: Error("Callback timeout...") を reject
  - **副作用として stop はしない**
- `stop(): Promise<void>`
  - 未起動/停止済みでも正常解決

### エッジケース

- timeout後に `stop()` を呼び忘れるとリソースが残る可能性があるため、呼び出し側で `finally` 停止を推奨。
- closeエラーは握りつぶす設計のため、停止成否の厳密観測が必要な場合は別途メトリクス設計が必要。

### 検証

- `pnpm --filter @repo/desktop exec vitest run src/main/auth/__tests__/authCallbackServer.test.ts`
- 結果: 13 tests passed
