# テストケース一覧: Claude Agent SDK 認証キー管理基盤

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名     | Claude Agent SDK用認証キー管理基盤の構築 |
| 作成日       | 2026-02-08                               |
| Phase        | 4 (テスト作成)                           |
| ドキュメント | テストケース一覧                         |

---

## 1. AuthKeyService テストケース

### ファイル

`apps/desktop/src/main/services/auth/__tests__/AuthKeyService.test.ts`

### 1.1 setKey メソッド

| TC-ID      | テストケース名                                    | 前提条件                      | 実行手順                             | 期待結果                                              |
| ---------- | ------------------------------------------------- | ----------------------------- | ------------------------------------ | ----------------------------------------------------- |
| AKS-SET-01 | Anthropic APIキーを暗号化して保存できる           | safeStorage が利用可能        | `service.setKey(validApiKey)` を実行 | `safeStorage.encryptString` と `store.set` が呼ばれる |
| AKS-SET-02 | safeStorageが利用不可の場合は警告を出して保存する | `isEncryptionAvailable=false` | `service.setKey(validApiKey)` を実行 | `console.warn` が呼ばれ、平文で保存される             |
| AKS-SET-03 | 空文字のキーはバリデーションエラーを返す          | -                             | `service.setKey("")` を実行          | 例外がスローされる                                    |
| AKS-SET-04 | 無効なキー形式はバリデーションエラーを返す        | -                             | `service.setKey("invalid")` を実行   | 例外がスローされる                                    |

### 1.2 getKey メソッド

| TC-ID      | テストケース名                        | 前提条件                 | 実行手順                  | 期待結果                       |
| ---------- | ------------------------------------- | ------------------------ | ------------------------- | ------------------------------ |
| AKS-GET-01 | 保存済みのAPIキーを復号して取得できる | キーが保存済み           | `service.getKey()` を実行 | 復号されたキー文字列が返される |
| AKS-GET-02 | キーが未設定の場合はnullを返す        | キー未保存、環境変数なし | `service.getKey()` を実行 | `null` が返される              |
| AKS-GET-03 | 環境変数からフォールバックできる      | キー未保存、環境変数あり | `service.getKey()` を実行 | 環境変数の値が返される         |

### 1.3 deleteKey メソッド

| TC-ID      | テストケース名                   | 前提条件             | 実行手順                     | 期待結果                  |
| ---------- | -------------------------------- | -------------------- | ---------------------------- | ------------------------- |
| AKS-DEL-01 | 保存済みのAPIキーを削除できる    | キーが保存済み       | `service.deleteKey()` を実行 | `store.delete` が呼ばれる |
| AKS-DEL-02 | 存在しないキーの削除は何もしない | キー未保存           | `service.deleteKey()` を実行 | エラーなしで完了          |
| AKS-DEL-03 | 削除後はキャッシュもクリアされる | キーがキャッシュ済み | 削除後に `getKey()` を実行   | `null` が返される         |

### 1.4 validateKey メソッド

| TC-ID      | テストケース名                            | 前提条件             | 実行手順                                 | 期待結果           |
| ---------- | ----------------------------------------- | -------------------- | ---------------------------------------- | ------------------ |
| AKS-VAL-01 | 有効なAPIキーを検証できる                 | API が成功レスポンス | `service.validateKey(validKey)` を実行   | `true` が返される  |
| AKS-VAL-02 | 無効なキーの場合はfalseを返す             | API が 401 エラー    | `service.validateKey(invalidKey)` を実行 | `false` が返される |
| AKS-VAL-03 | ネットワークエラーの場合はfalseを返す     | ネットワーク例外発生 | `service.validateKey(key)` を実行        | `false` が返される |
| AKS-VAL-04 | APIレートリミットの場合は例外をスローする | API が 429 エラー    | `service.validateKey(key)` を実行        | 例外がスローされる |

### 1.5 hasKey メソッド

| TC-ID      | テストケース名                             | 前提条件                 | 実行手順                  | 期待結果           |
| ---------- | ------------------------------------------ | ------------------------ | ------------------------- | ------------------ |
| AKS-HAS-01 | キーが設定されている場合はtrueを返す       | キーが保存済み           | `service.hasKey()` を実行 | `true` が返される  |
| AKS-HAS-02 | キーが未設定の場合はfalseを返す            | キー未保存、環境変数なし | `service.hasKey()` を実行 | `false` が返される |
| AKS-HAS-03 | 環境変数のみ設定されている場合もtrueを返す | キー未保存、環境変数あり | `service.hasKey()` を実行 | `true` が返される  |

### 1.6 キャッシュ動作

| TC-ID        | テストケース名                         | 前提条件       | 実行手順                              | 期待結果                      |
| ------------ | -------------------------------------- | -------------- | ------------------------------------- | ----------------------------- |
| AKS-CACHE-01 | getKey()はキャッシュを使用する         | キーが保存済み | `getKey()` を2回実行                  | `store.get` は1回のみ呼ばれる |
| AKS-CACHE-02 | setKey()後はキャッシュが更新される     | -              | `setKey()` 後に `getKey()` を実行     | `store.get` は呼ばれない      |
| AKS-CACHE-03 | clearCache()でキャッシュをクリアできる | キャッシュ済み | `clearCache()` 後に `getKey()` を実行 | `store.get` が2回呼ばれる     |

### 1.7 セキュリティ

| TC-ID      | テストケース名               | 前提条件 | 実行手順         | 期待結果               |
| ---------- | ---------------------------- | -------- | ---------------- | ---------------------- |
| AKS-SEC-01 | 認証キーはログに出力されない | -        | 各メソッドを実行 | ログにキーが含まれない |

---

## 2. SkillExecutor 認証連携テストケース

### ファイル

`apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts`

### 2.1 AuthKeyService 連携

| TC-ID       | テストケース名                                   | 前提条件                 | 実行手順                    | 期待結果                            |
| ----------- | ------------------------------------------------ | ------------------------ | --------------------------- | ----------------------------------- |
| SKE-AUTH-01 | AuthKeyServiceからAPIキーを取得してquery()に渡す | キーが設定済み           | `executor.execute()` を実行 | `query()` に `apiKey` が設定される  |
| SKE-AUTH-02 | キー未設定時はAUTHENTICATION_ERRORを返す         | キー未設定、環境変数なし | `executor.execute()` を実行 | エラーコード `AUTHENTICATION_ERROR` |
| SKE-AUTH-03 | query()呼び出し時にapiKeyオプションが設定される  | キーが設定済み           | `executor.execute()` を実行 | `options.apiKey` が存在する         |
| SKE-AUTH-04 | 環境変数からフォールバックできる                 | キー未設定、環境変数あり | `executor.execute()` を実行 | 環境変数のキーが使用される          |
| SKE-AUTH-05 | AuthKeyService未設定時は環境変数のみ使用         | AuthKeyService なし      | `executor.execute()` を実行 | 環境変数のキーが使用される          |

### 2.2 エラーハンドリング

| TC-ID      | テストケース名                                                 | 前提条件                  | 実行手順                    | 期待結果                            |
| ---------- | -------------------------------------------------------------- | ------------------------- | --------------------------- | ----------------------------------- |
| SKE-ERR-01 | AuthKeyServiceがエラーをスローした場合は適切にハンドリングする | `getKey()` が例外を投げる | `executor.execute()` を実行 | エラーレスポンスが返される          |
| SKE-ERR-02 | 無効なAPIキーでSDKエラーが発生した場合は適切にハンドリングする | SDK が 401 エラーを返す   | `executor.execute()` を実行 | エラーコード `AUTHENTICATION_ERROR` |

### 2.3 コンストラクタ

| TC-ID      | テストケース名                                   | 前提条件 | 実行手順                              | 期待結果                 |
| ---------- | ------------------------------------------------ | -------- | ------------------------------------- | ------------------------ |
| SKE-CON-01 | AuthKeyServiceはオプショナル引数として受け取れる | -        | 3引数コンストラクタでインスタンス作成 | インスタンスが作成される |
| SKE-CON-02 | 後方互換性: 既存の2引数コンストラクタが動作する  | -        | 2引数コンストラクタでインスタンス作成 | インスタンスが作成される |

### 2.4 セキュリティ

| TC-ID      | テストケース名                  | 前提条件       | 実行手順                    | 期待結果               |
| ---------- | ------------------------------- | -------------- | --------------------------- | ---------------------- |
| SKE-SEC-01 | APIキーはログに出力されない     | キーが設定済み | `executor.execute()` を実行 | ログにキーが含まれない |
| SKE-SEC-02 | APIキーはRendererに送信されない | キーが設定済み | `executor.execute()` を実行 | IPC にキーが含まれない |

---

## 3. authKeyHandlers テストケース

### ファイル

`apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`

### 3.1 AUTH_KEY_SET (auth-key:set)

| TC-ID      | テストケース名                               | 前提条件               | 実行手順             | 期待結果                                    |
| ---------- | -------------------------------------------- | ---------------------- | -------------------- | ------------------------------------------- |
| AKH-SET-01 | APIキーを保存できる                          | sender 検証成功        | ハンドラーを呼び出し | `{ success: true }`                         |
| AKH-SET-02 | バリデーションエラー時は失敗レスポンスを返す | 空キー                 | ハンドラーを呼び出し | `{ success: false, error: "..." }`          |
| AKH-SET-03 | 無効なキー形式はバリデーションエラーを返す   | 不正なキー形式         | ハンドラーを呼び出し | `{ success: false, error: "..." }`          |
| AKH-SET-04 | sender検証失敗時はUnauthorizedを返す         | sender 検証失敗        | ハンドラーを呼び出し | `{ success: false, error: "Unauthorized" }` |
| AKH-SET-05 | サービスエラー時はエラーメッセージを返す     | サービスが例外を投げる | ハンドラーを呼び出し | `{ success: false, error: "..." }`          |

### 3.2 AUTH_KEY_VALIDATE (auth-key:validate)

| TC-ID      | テストケース名                                              | 前提条件        | 実行手順             | 期待結果                         |
| ---------- | ----------------------------------------------------------- | --------------- | -------------------- | -------------------------------- |
| AKH-VAL-01 | 保存済みキーを検証できる                                    | 有効なキー      | ハンドラーを呼び出し | `{ valid: true }`                |
| AKH-VAL-02 | 無効なキーの場合はvalid=falseを返す                         | 無効なキー      | ハンドラーを呼び出し | `{ valid: false }`               |
| AKH-VAL-03 | sender検証失敗時は例外をスローする                          | sender 検証失敗 | ハンドラーを呼び出し | 例外がスローされる               |
| AKH-VAL-04 | バリデーションエラー時はvalid=falseとエラーメッセージを返す | 空キー          | ハンドラーを呼び出し | `{ valid: false, error: "..." }` |

### 3.3 AUTH_KEY_DELETE (auth-key:delete)

| TC-ID      | テストケース名                           | 前提条件               | 実行手順             | 期待結果                           |
| ---------- | ---------------------------------------- | ---------------------- | -------------------- | ---------------------------------- |
| AKH-DEL-01 | 保存済みキーを削除できる                 | sender 検証成功        | ハンドラーを呼び出し | `{ success: true }`                |
| AKH-DEL-02 | sender検証失敗時は例外をスローする       | sender 検証失敗        | ハンドラーを呼び出し | 例外がスローされる                 |
| AKH-DEL-03 | サービスエラー時はエラーメッセージを返す | サービスが例外を投げる | ハンドラーを呼び出し | `{ success: false, error: "..." }` |

### 3.4 AUTH_KEY_EXISTS (auth-key:exists)

| TC-ID      | テストケース名                      | 前提条件        | 実行手順             | 期待結果               |
| ---------- | ----------------------------------- | --------------- | -------------------- | ---------------------- |
| AKH-EXS-01 | キー設定状態を確認できる - 設定あり | キーが設定済み  | ハンドラーを呼び出し | `{ exists: true }`     |
| AKH-EXS-02 | キー設定状態を確認できる - 設定なし | キー未設定      | ハンドラーを呼び出し | `{ exists: false }`    |
| AKH-EXS-03 | sender検証失敗時は例外をスローする  | sender 検証失敗 | ハンドラーを呼び出し | 例外がスローされる     |
| AKH-EXS-04 | レスポンスにキーの値は含まれない    | キーが設定済み  | ハンドラーを呼び出し | `key` フィールドがない |

### 3.5 ハンドラー登録/解除

| TC-ID      | テストケース名                                       | 前提条件 | 実行手順                                 | 期待結果                              |
| ---------- | ---------------------------------------------------- | -------- | ---------------------------------------- | ------------------------------------- |
| AKH-REG-01 | registerAuthKeyHandlersで4つのハンドラーが登録される | -        | `registerAuthKeyHandlers()` を呼び出し   | `ipcMain.handle` が4回呼ばれる        |
| AKH-REG-02 | unregisterAuthKeyHandlersで全ハンドラーが解除される  | 登録済み | `unregisterAuthKeyHandlers()` を呼び出し | `ipcMain.removeHandler` が4回呼ばれる |

### 3.6 セキュリティ

| TC-ID      | テストケース名                                | 前提条件         | 実行手順               | 期待結果                          |
| ---------- | --------------------------------------------- | ---------------- | ---------------------- | --------------------------------- |
| AKH-SEC-01 | エラーメッセージからAPIキーがサニタイズされる | キーを含むエラー | ハンドラーを呼び出し   | エラーに `[REDACTED]` が含まれる  |
| AKH-SEC-02 | 全ハンドラーでvalidateIpcSenderが呼ばれる     | -                | 各ハンドラーを呼び出し | `validateIpcSender` が4回呼ばれる |

---

## 4. テストケース数サマリー

| コンポーネント  | テストケース数 |
| --------------- | -------------- |
| AuthKeyService  | 16             |
| SkillExecutor   | 9              |
| authKeyHandlers | 17             |
| **合計**        | **42**         |

---

## 5. Red Phase 確認手順

### 5.1 テスト実行コマンド

```bash
# 全テストを実行（失敗を確認）
pnpm --filter @repo/desktop test src/main/services/auth/__tests__/AuthKeyService.test.ts
pnpm --filter @repo/desktop test src/main/services/skill/__tests__/SkillExecutor.auth.test.ts
pnpm --filter @repo/desktop test src/main/ipc/__tests__/authKeyHandlers.test.ts
```

### 5.2 期待される出力

```
FAIL  src/main/services/auth/__tests__/AuthKeyService.test.ts
  ✕ AuthKeyService.setKey() is not implemented yet - TDD Red Phase
  ✕ AuthKeyService.getKey() is not implemented yet - TDD Red Phase
  ...

FAIL  src/main/services/skill/__tests__/SkillExecutor.auth.test.ts
  ✕ SkillExecutor AuthKeyService integration is not implemented yet - TDD Red Phase
  ...

FAIL  src/main/ipc/__tests__/authKeyHandlers.test.ts
  ✕ registerAuthKeyHandlers is not implemented yet - TDD Red Phase
  ...
```

---

## 6. Phase 5 への引き継ぎ

### 6.1 実装優先順位

1. **AuthKeyService** - サービス層（他コンポーネントの依存先）
2. **authKeyHandlers** - IPC 層（Renderer からのアクセス）
3. **SkillExecutor 統合** - 既存クラスへの変更

### 6.2 テスト修正手順

1. `expect.fail()` を削除
2. コメントアウトされた実装コードを有効化
3. テストを実行して Green を確認
4. 必要に応じてエッジケースを追加
