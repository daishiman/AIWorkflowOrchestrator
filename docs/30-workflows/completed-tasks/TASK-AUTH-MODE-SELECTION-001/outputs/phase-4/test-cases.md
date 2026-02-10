# テストケース一覧

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | TASK-AUTH-MODE-SELECTION-001 |
| Phase    | 4                            |
| 作成日   | 2026-02-09                   |
| 形式     | Given-When-Then              |

---

## 1. AuthModeService テストケース

### ファイル: `apps/desktop/src/main/services/auth/__tests__/auth-mode-service.test.ts`

---

### TC-AMS-001: サブスクリプション認証でのCredential取得成功

**対応受入基準**: AC-1

**Given（前提条件）**

- AuthModeService が初期化されている
- 認証モードが `subscription` に設定されている
- SubscriptionAuthProvider.getToken() が有効なトークンを返す

**When（操作）**

- `getCredential()` を呼び出す

**Then（期待結果）**

- サブスクリプショントークン (`sk-ant-oat01-...`) が返される
- AuthKeyService.getKey() は呼び出されない

**モック設定**

```typescript
mockSubscriptionAuthProvider.getToken.mockResolvedValue("sk-ant-oat01-test");
mockStore.get.mockReturnValue("subscription");
```

---

### TC-AMS-002: サブスクリプション認証で未ログイン時のエラー

**対応受入基準**: AC-2

**Given（前提条件）**

- AuthModeService が初期化されている
- 認証モードが `subscription` に設定されている
- SubscriptionAuthProvider.hasToken() が `false` を返す

**When（操作）**

- `getStatus()` を呼び出す

**Then（期待結果）**

- `isAuthenticated: false` が返される
- `error` に「Claude Code CLIでのログインが必要です」が含まれる
- `details.hasSubscriptionToken` が `false`

**モック設定**

```typescript
mockSubscriptionAuthProvider.hasToken.mockResolvedValue(false);
mockStore.get.mockReturnValue("subscription");
```

---

### TC-AMS-003: APIキー認証でのCredential取得成功

**対応受入基準**: AC-3

**Given（前提条件）**

- AuthModeService が初期化されている
- 認証モードが `api-key` に設定されている
- AuthKeyService.getKey() が有効なAPIキーを返す

**When（操作）**

- `getCredential()` を呼び出す

**Then（期待結果）**

- APIキー (`sk-ant-api03-...`) が返される
- SubscriptionAuthProvider.getToken() は呼び出されない

**モック設定**

```typescript
mockAuthKeyService.getKey.mockResolvedValue("sk-ant-api03-test-key");
mockStore.get.mockReturnValue("api-key");
```

---

### TC-AMS-004: APIキー未設定時のエラー

**対応受入基準**: AC-4

**Given（前提条件）**

- AuthModeService が初期化されている
- 認証モードが `api-key` に設定されている
- AuthKeyService.hasKey() が `false` を返す

**When（操作）**

- `getStatus()` を呼び出す

**Then（期待結果）**

- `isAuthenticated: false` が返される
- `error` に「APIキーを設定してください」が含まれる
- `details.hasApiKey` が `false`

**モック設定**

```typescript
mockAuthKeyService.hasKey.mockResolvedValue(false);
mockStore.get.mockReturnValue("api-key");
```

---

### TC-AMS-005: 認証モードの切り替え

**対応受入基準**: AC-5

**Given（前提条件）**

- AuthModeService が初期化されている
- 現在の認証モードが `subscription`
- 変更リスナーが登録されている

**When（操作）**

- `setMode("api-key")` を呼び出す

**Then（期待結果）**

- electron-store に `api-key` が保存される
- 変更リスナーが `AuthModeChangeEvent` で呼び出される
- イベントの `previousMode` が `subscription`
- イベントの `newMode` が `api-key`

**モック設定**

```typescript
mockStore.get.mockReturnValue("subscription");
const mockListener = vi.fn();
authModeService.onModeChange(mockListener);
```

---

### TC-AMS-006: 認証モードの永続化

**対応受入基準**: AC-6

**Given（前提条件）**

- AuthModeService が初期化されている
- electron-store に `api-key` が保存されている

**When（操作）**

- 新しい AuthModeService インスタンスを作成
- `getMode()` を呼び出す

**Then（期待結果）**

- `api-key` が返される
- デフォルト値の `subscription` ではない

**モック設定**

```typescript
mockStore.get.mockReturnValue("api-key");
```

---

### TC-AMS-007: 無効な認証モード設定時のエラー

**対応受入基準**: -

**Given（前提条件）**

- AuthModeService が初期化されている

**When（操作）**

- `setMode("invalid-mode" as AuthMode)` を呼び出す

**Then（期待結果）**

- Error がスローされる
- エラーメッセージに「Invalid auth mode」が含まれる
- electron-store.set() は呼び出されない

**モック設定**

```typescript
// 特になし
```

---

### TC-AMS-008: デフォルト認証モードの取得

**対応受入基準**: -

**Given（前提条件）**

- AuthModeService が初期化されている
- electron-store に認証モードが保存されていない

**When（操作）**

- `getMode()` を呼び出す

**Then（期待結果）**

- デフォルト値 `subscription` が返される

**モック設定**

```typescript
mockStore.get.mockReturnValue(undefined);
```

---

### TC-AMS-009: 認証モード検証（subscription有効）

**対応受入基準**: -

**Given（前提条件）**

- AuthModeService が初期化されている
- SubscriptionAuthProvider.hasToken() が `true` を返す

**When（操作）**

- `validateMode("subscription")` を呼び出す

**Then（期待結果）**

- `true` が返される

**モック設定**

```typescript
mockSubscriptionAuthProvider.hasToken.mockResolvedValue(true);
```

---

### TC-AMS-010: 認証モード検証（api-key無効）

**対応受入基準**: -

**Given（前提条件）**

- AuthModeService が初期化されている
- AuthKeyService.hasKey() が `false` を返す

**When（操作）**

- `validateMode("api-key")` を呼び出す

**Then（期待結果）**

- `false` が返される

**モック設定**

```typescript
mockAuthKeyService.hasKey.mockResolvedValue(false);
```

---

### TC-AMS-011: リスナー解除

**対応受入基準**: -

**Given（前提条件）**

- AuthModeService が初期化されている
- 変更リスナーが登録されている

**When（操作）**

- リスナー解除関数を呼び出す
- `setMode("api-key")` を呼び出す

**Then（期待結果）**

- 解除されたリスナーは呼び出されない

**モック設定**

```typescript
const mockListener = vi.fn();
const unsubscribe = authModeService.onModeChange(mockListener);
unsubscribe();
```

---

## 2. SubscriptionAuthProvider テストケース

### ファイル: `apps/desktop/src/main/services/auth/__tests__/subscription-auth-provider.test.ts`

---

### TC-SAP-001: Keychainからトークン取得成功

**対応受入基準**: AC-1

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- Keychain に有効なトークンデータが保存されている
- キャッシュが空

**When（操作）**

- `getToken()` を呼び出す

**Then（期待結果）**

- アクセストークン (`sk-ant-oat01-...`) が返される
- Keychain.getPassword() が呼び出される
- トークンがキャッシュに保存される

**モック設定**

```typescript
mockKeychainAccess.getPassword.mockResolvedValue(
  JSON.stringify({ accessToken: "sk-ant-oat01-keychain-token" }),
);
```

---

### TC-SAP-002: トークン未保存時のnull返却

**対応受入基準**: AC-2

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- Keychain にトークンが保存されていない
- 環境変数 CLAUDE_CODE_OAUTH_TOKEN も未設定

**When（操作）**

- `getToken()` を呼び出す

**Then（期待結果）**

- `null` が返される

**モック設定**

```typescript
mockKeychainAccess.getPassword.mockResolvedValue(null);
delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
```

---

### TC-SAP-003: キャッシュからのトークン取得

**対応受入基準**: -

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- 有効なキャッシュエントリが存在する（TTL内）

**When（操作）**

- `getToken()` を2回続けて呼び出す

**Then（期待結果）**

- 2回目はキャッシュからトークンを返す
- Keychain.getPassword() は1回のみ呼び出される

**モック設定**

```typescript
mockKeychainAccess.getPassword.mockResolvedValue(
  JSON.stringify({ accessToken: "sk-ant-oat01-cached" }),
);
```

---

### TC-SAP-004: キャッシュ期限切れ後の再取得

**対応受入基準**: -

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- キャッシュ TTL（5分）が経過している

**When（操作）**

- TTL経過後に `getToken()` を呼び出す

**Then（期待結果）**

- Keychain から新たにトークンを取得
- 新しいトークンがキャッシュに保存される

**モック設定**

```typescript
vi.useFakeTimers();
// TTL経過をシミュレート
vi.advanceTimersByTime(5 * 60 * 1000 + 1);
```

---

### TC-SAP-005: 環境変数フォールバック

**対応受入基準**: -

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- Keychain にトークンが保存されていない
- 環境変数 CLAUDE_CODE_OAUTH_TOKEN が設定されている

**When（操作）**

- `getToken()` を呼び出す

**Then（期待結果）**

- 環境変数のトークンが返される

**モック設定**

```typescript
mockKeychainAccess.getPassword.mockResolvedValue(null);
process.env.CLAUDE_CODE_OAUTH_TOKEN = "sk-ant-oat01-env-token";
```

---

### TC-SAP-006: hasToken - トークン存在確認（あり）

**対応受入基準**: -

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- getToken() が有効なトークンを返す

**When（操作）**

- `hasToken()` を呼び出す

**Then（期待結果）**

- `true` が返される

**モック設定**

```typescript
mockKeychainAccess.getPassword.mockResolvedValue(
  JSON.stringify({ accessToken: "sk-ant-oat01-exists" }),
);
```

---

### TC-SAP-007: hasToken - トークン存在確認（なし）

**対応受入基準**: -

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- getToken() が `null` を返す

**When（操作）**

- `hasToken()` を呼び出す

**Then（期待結果）**

- `false` が返される

**モック設定**

```typescript
mockKeychainAccess.getPassword.mockResolvedValue(null);
delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
```

---

### TC-SAP-008: validateToken - 有効なトークン形式

**対応受入基準**: -

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- getToken() が `sk-ant-oat01-` で始まるトークンを返す

**When（操作）**

- `validateToken()` を呼び出す

**Then（期待結果）**

- `true` が返される

**モック設定**

```typescript
mockKeychainAccess.getPassword.mockResolvedValue(
  JSON.stringify({ accessToken: "sk-ant-oat01-valid-format" }),
);
```

---

### TC-SAP-009: validateToken - 無効なトークン形式

**対応受入基準**: AC-7

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- Keychain に形式不正のトークンが保存されている

**When（操作）**

- `validateToken()` を呼び出す

**Then（期待結果）**

- `false` が返される

**モック設定**

```typescript
mockKeychainAccess.getPassword.mockResolvedValue("invalid-token-format");
```

---

### TC-SAP-010: clearCache - キャッシュクリア

**対応受入基準**: -

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- キャッシュにトークンが保存されている

**When（操作）**

- `clearCache()` を呼び出す
- `getToken()` を呼び出す

**Then（期待結果）**

- Keychain から再取得される
- Keychain.getPassword() が再度呼び出される

**モック設定**

```typescript
mockKeychainAccess.getPassword.mockResolvedValue(
  JSON.stringify({ accessToken: "sk-ant-oat01-new" }),
);
```

---

### TC-SAP-011: Keychainアクセスエラー時の処理

**対応受入基準**: AC-9

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- Keychain.getPassword() がエラーをスロー

**When（操作）**

- `getToken()` を呼び出す

**Then（期待結果）**

- `null` が返される（エラーを握りつぶさず、nullで返す）
- エラーはログに記録される

**モック設定**

```typescript
mockKeychainAccess.getPassword.mockRejectedValue(
  new Error("Keychain access denied"),
);
```

---

### TC-SAP-012: 非macOS環境での動作

**対応受入基準**: -

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- process.platform が `darwin` 以外

**When（操作）**

- `getToken()` を呼び出す

**Then（期待結果）**

- `null` が返される
- Keychain へのアクセスは試みない

**モック設定**

```typescript
Object.defineProperty(process, "platform", { value: "win32" });
```

---

### TC-SAP-013: JSONパースエラー時の直接トークン解釈

**対応受入基準**: -

**Given（前提条件）**

- SubscriptionAuthProvider が初期化されている
- Keychain に JSON ではない有効なトークン文字列が保存されている

**When（操作）**

- `getToken()` を呼び出す

**Then（期待結果）**

- トークン文字列がそのまま返される

**モック設定**

```typescript
mockKeychainAccess.getPassword.mockResolvedValue("sk-ant-oat01-direct-token");
```

---

## 3. authModeSlice テストケース

### ファイル: `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.test.ts`

---

### TC-SLICE-001: fetchMode - 認証モード取得成功

**対応受入基準**: -

**Given（前提条件）**

- authModeSlice が初期化されている
- IPC authMode.get() が成功レスポンスを返す

**When（操作）**

- `fetchMode()` を呼び出す

**Then（期待結果）**

- `mode` が取得した値に更新される
- `isLoading` が `false` に設定される
- `error` が `null`

**モック設定**

```typescript
mockElectronAPI.authMode.get.mockResolvedValue({
  success: true,
  data: { mode: "api-key" },
});
```

---

### TC-SLICE-002: fetchMode - IPC未利用時のフォールバック

**対応受入基準**: -

**Given（前提条件）**

- authModeSlice が初期化されている
- window.electronAPI.authMode.get が未定義

**When（操作）**

- `fetchMode()` を呼び出す

**Then（期待結果）**

- デフォルト値 `subscription` のまま
- `isLoading` が `false`
- エラーは発生しない

**モック設定**

```typescript
window.electronAPI = {} as typeof window.electronAPI;
```

---

### TC-SLICE-003: setMode - 認証モード設定成功

**対応受入基準**: AC-5

**Given（前提条件）**

- authModeSlice が初期化されている
- IPC authMode.set() が成功レスポンスを返す

**When（操作）**

- `setMode("api-key")` を呼び出す

**Then（期待結果）**

- `mode` が `api-key` に更新される
- `isLoading` が `false`
- `isConfirmDialogOpen` が `false`
- `pendingMode` が `null`

**モック設定**

```typescript
mockElectronAPI.authMode.set.mockResolvedValue({ success: true });
```

---

### TC-SLICE-004: setMode - 設定失敗時のエラー

**対応受入基準**: -

**Given（前提条件）**

- authModeSlice が初期化されている
- IPC authMode.set() が失敗レスポンスを返す

**When（操作）**

- `setMode("api-key")` を呼び出す

**Then（期待結果）**

- `mode` は変更されない（元のまま）
- `error` にエラーメッセージが設定される
- `isLoading` が `false`

**モック設定**

```typescript
mockElectronAPI.authMode.set.mockResolvedValue({
  success: false,
  error: { message: "設定に失敗しました" },
});
```

---

### TC-SLICE-005: fetchStatus - 認証状態取得成功

**対応受入基準**: AC-8

**Given（前提条件）**

- authModeSlice が初期化されている
- IPC authMode.status() が成功レスポンスを返す

**When（操作）**

- `fetchStatus()` を呼び出す

**Then（期待結果）**

- `status` が取得した値に更新される

**モック設定**

```typescript
mockElectronAPI.authMode.getStatus.mockResolvedValue({
  success: true,
  data: {
    mode: "subscription",
    isAuthenticated: true,
    hasCredentials: true,
  },
});
```

---

### TC-SLICE-006: validate - 認証モード検証成功

**対応受入基準**: -

**Given（前提条件）**

- authModeSlice が初期化されている
- IPC authMode.validate() が有効レスポンスを返す

**When（操作）**

- `validate("subscription")` を呼び出す

**Then（期待結果）**

- `true` が返される

**モック設定**

```typescript
mockElectronAPI.authMode.validate.mockResolvedValue({
  success: true,
  data: { isValid: true },
});
```

---

### TC-SLICE-007: openConfirmDialog - ダイアログ表示

**対応受入基準**: AC-11

**Given（前提条件）**

- authModeSlice が初期化されている
- `isConfirmDialogOpen` が `false`

**When（操作）**

- `openConfirmDialog("api-key")` を呼び出す

**Then（期待結果）**

- `isConfirmDialogOpen` が `true`
- `pendingMode` が `api-key`

**モック設定**

```typescript
// 特になし
```

---

### TC-SLICE-008: closeConfirmDialog - ダイアログ非表示

**対応受入基準**: AC-11

**Given（前提条件）**

- authModeSlice が初期化されている
- `isConfirmDialogOpen` が `true`
- `pendingMode` が `api-key`

**When（操作）**

- `closeConfirmDialog()` を呼び出す

**Then（期待結果）**

- `isConfirmDialogOpen` が `false`
- `pendingMode` が `null`

**モック設定**

```typescript
// 事前に openConfirmDialog を呼び出す
```

---

### TC-SLICE-009: confirmModeChange - 切り替え確定

**対応受入基準**: AC-5

**Given（前提条件）**

- authModeSlice が初期化されている
- `pendingMode` が `api-key`
- IPC authMode.set() が成功レスポンスを返す

**When（操作）**

- `confirmModeChange()` を呼び出す

**Then（期待結果）**

- `setMode("api-key")` が呼び出される
- `mode` が `api-key` に更新される

**モック設定**

```typescript
mockElectronAPI.authMode.set.mockResolvedValue({ success: true });
```

---

### TC-SLICE-010: confirmModeChange - pendingModeがnullの場合

**対応受入基準**: -

**Given（前提条件）**

- authModeSlice が初期化されている
- `pendingMode` が `null`

**When（操作）**

- `confirmModeChange()` を呼び出す

**Then（期待結果）**

- 何も起こらない
- `setMode` は呼び出されない

**モック設定**

```typescript
// 特になし
```

---

### TC-SLICE-011: clearError - エラークリア

**対応受入基準**: -

**Given（前提条件）**

- authModeSlice が初期化されている
- `error` にエラーメッセージが設定されている

**When（操作）**

- `clearError()` を呼び出す

**Then（期待結果）**

- `error` が `null`

**モック設定**

```typescript
// 事前にエラー状態を設定
```

---

### TC-SLICE-012: resetAuthMode - 状態リセット

**対応受入基準**: -

**Given（前提条件）**

- authModeSlice が初期化されている
- 各状態が変更されている

**When（操作）**

- `resetAuthMode()` を呼び出す

**Then（期待結果）**

- `mode` が `subscription`（デフォルト）
- `status` が `null`
- `isLoading` が `false`
- `error` が `null`
- `isConfirmDialogOpen` が `false`
- `pendingMode` が `null`

**モック設定**

```typescript
// 特になし
```

---

### TC-SLICE-013: リスナー二重登録防止

**対応受入基準**: -

**Given（前提条件）**

- authModeSlice が初期化されている
- onModeChanged リスナーが既に登録されている

**When（操作）**

- `initializeAuthModeSlice()` を再度呼び出す

**Then（期待結果）**

- onModeChanged は1回のみ呼び出される（二重登録されない）

**モック設定**

```typescript
const mockOnModeChanged = vi.fn();
mockElectronAPI.authMode.onChanged = mockOnModeChanged;
```

---

## 4. AuthModeSelector テストケース

### ファイル: `apps/desktop/src/renderer/components/molecules/AuthModeSelector/__tests__/AuthModeSelector.test.tsx`

---

### TC-UI-001: 初期表示 - サブスクリプション選択状態

**対応受入基準**: AC-8

**Given（前提条件）**

- `mode="subscription"` で AuthModeSelector をレンダリング

**When（操作）**

- コンポーネントがマウントされる

**Then（期待結果）**

- 「サブスクリプション認証」セグメントが選択状態（アクセントカラー背景）
- 「APIキー認証」セグメントが非選択状態

**モック設定**

```typescript
render(<AuthModeSelector mode="subscription" onModeChange={vi.fn()} />);
```

---

### TC-UI-002: 初期表示 - APIキー選択状態

**対応受入基準**: AC-8

**Given（前提条件）**

- `mode="api-key"` で AuthModeSelector をレンダリング

**When（操作）**

- コンポーネントがマウントされる

**Then（期待結果）**

- 「APIキー認証」セグメントが選択状態
- 「サブスクリプション認証」セグメントが非選択状態

**モック設定**

```typescript
render(<AuthModeSelector mode="api-key" onModeChange={vi.fn()} />);
```

---

### TC-UI-003: セグメントクリックでモード変更コールバック

**対応受入基準**: AC-5

**Given（前提条件）**

- `mode="subscription"` で AuthModeSelector をレンダリング
- `onModeChange` がモック関数

**When（操作）**

- 「APIキー認証」セグメントをクリック

**Then（期待結果）**

- `onModeChange("api-key")` が呼び出される

**モック設定**

```typescript
const onModeChange = vi.fn();
render(<AuthModeSelector mode="subscription" onModeChange={onModeChange} />);
await userEvent.click(screen.getByRole("radio", { name: /APIキー認証/i }));
```

---

### TC-UI-004: ローディング状態での無効化

**対応受入基準**: -

**Given（前提条件）**

- `isLoading={true}` で AuthModeSelector をレンダリング

**When（操作）**

- セグメントをクリック

**Then（期待結果）**

- セグメントが無効化されている（opacity: 0.5）
- クリックしても `onModeChange` は呼び出されない

**モック設定**

```typescript
render(<AuthModeSelector mode="subscription" onModeChange={vi.fn()} isLoading={true} />);
```

---

### TC-UI-005: キーボード操作 - 矢印キーでフォーカス移動

**対応受入基準**: -

**Given（前提条件）**

- AuthModeSelector をレンダリング
- 「サブスクリプション認証」にフォーカス

**When（操作）**

- 右矢印キーを押す

**Then（期待結果）**

- フォーカスが「APIキー認証」に移動

**モック設定**

```typescript
render(<AuthModeSelector mode="subscription" onModeChange={vi.fn()} />);
const subscriptionButton = screen.getByRole("radio", { name: /サブスクリプション/i });
subscriptionButton.focus();
await userEvent.keyboard("{ArrowRight}");
```

---

### TC-UI-006: キーボード操作 - Enter/Spaceで選択

**対応受入基準**: -

**Given（前提条件）**

- AuthModeSelector をレンダリング
- 「APIキー認証」にフォーカス

**When（操作）**

- Enter キーを押す

**Then（期待結果）**

- `onModeChange("api-key")` が呼び出される

**モック設定**

```typescript
const onModeChange = vi.fn();
render(<AuthModeSelector mode="subscription" onModeChange={onModeChange} />);
const apiKeyButton = screen.getByRole("radio", { name: /APIキー/i });
apiKeyButton.focus();
await userEvent.keyboard("{Enter}");
```

---

### TC-UI-007: ARIA属性の正確性

**対応受入基準**: -

**Given（前提条件）**

- `mode="subscription"` で AuthModeSelector をレンダリング

**When（操作）**

- コンポーネントがマウントされる

**Then（期待結果）**

- コンテナに `role="radiogroup"` がある
- 「サブスクリプション認証」に `aria-checked="true"`
- 「APIキー認証」に `aria-checked="false"`

**モック設定**

```typescript
render(<AuthModeSelector mode="subscription" onModeChange={vi.fn()} />);
```

---

## 5. AuthModeStatusIndicator テストケース

### ファイル: `apps/desktop/src/renderer/components/molecules/AuthModeStatusIndicator/__tests__/AuthModeStatusIndicator.test.tsx`

---

### TC-UI-008: サブスクリプション認証 - ログイン済み表示

**対応受入基準**: AC-8

**Given（前提条件）**

- `mode="subscription"`, `isValid={true}` でレンダリング

**When（操作）**

- コンポーネントがマウントされる

**Then（期待結果）**

- 緑色のインジケーター（●）が表示
- 「ログイン済み」テキストが表示
- 説明テキストが表示

**モック設定**

```typescript
render(
  <AuthModeStatusIndicator
    mode="subscription"
    status={{ mode: "subscription", isValid: true, message: "ログイン済み", lastCheckedAt: Date.now() }}
    isValid={true}
  />
);
```

---

### TC-UI-009: サブスクリプション認証 - 未ログイン表示

**対応受入基準**: AC-2

**Given（前提条件）**

- `mode="subscription"`, `isValid={false}` でレンダリング

**When（操作）**

- コンポーネントがマウントされる

**Then（期待結果）**

- 赤色のインジケーター（○）が表示
- 「未ログイン」テキストが表示
- ログイン方法のガイダンスリンクが表示

**モック設定**

```typescript
render(
  <AuthModeStatusIndicator
    mode="subscription"
    status={{ mode: "subscription", isValid: false, message: "未ログイン", errorCode: "NOT_LOGGED_IN", lastCheckedAt: Date.now() }}
    isValid={false}
  />
);
```

---

### TC-UI-010: APIキー認証 - 設定済み表示

**対応受入基準**: AC-8

**Given（前提条件）**

- `mode="api-key"`, `isValid={true}` でレンダリング

**When（操作）**

- コンポーネントがマウントされる

**Then（期待結果）**

- 緑色のインジケーター（●）が表示
- 「キー設定済み」テキストが表示
- マスクされたAPIキー表示（`sk-ant-api03-****-****`）

**モック設定**

```typescript
render(
  <AuthModeStatusIndicator
    mode="api-key"
    status={{ mode: "api-key", isValid: true, message: "キー設定済み", lastCheckedAt: Date.now() }}
    isValid={true}
  />
);
```

---

### TC-UI-011: APIキー認証 - 未設定表示

**対応受入基準**: AC-4

**Given（前提条件）**

- `mode="api-key"`, `isValid={false}` でレンダリング

**When（操作）**

- コンポーネントがマウントされる

**Then（期待結果）**

- 警告色のインジケーター（○）が表示
- 「キー未設定」テキストが表示
- APIキー設定へのリンクが表示

**モック設定**

```typescript
render(
  <AuthModeStatusIndicator
    mode="api-key"
    status={{ mode: "api-key", isValid: false, message: "キー未設定", errorCode: "API_KEY_NOT_SET", lastCheckedAt: Date.now() }}
    isValid={false}
  />
);
```

---

### TC-UI-012: ローディング状態の表示

**対応受入基準**: -

**Given（前提条件）**

- `isLoading={true}` でレンダリング

**When（操作）**

- コンポーネントがマウントされる

**Then（期待結果）**

- スピナーアニメーションが表示
- 「認証状態を確認中...」テキストが表示

**モック設定**

```typescript
render(
  <AuthModeStatusIndicator
    mode="subscription"
    status={null}
    isValid={false}
    isLoading={true}
  />
);
```

---

### TC-UI-013: アクションボタンクリック

**対応受入基準**: -

**Given（前提条件）**

- `isValid={false}`, `onActionClick` がモック関数でレンダリング

**When（操作）**

- アクションボタン（「ログイン方法を確認」等）をクリック

**Then（期待結果）**

- `onActionClick` が呼び出される

**モック設定**

```typescript
const onActionClick = vi.fn();
render(
  <AuthModeStatusIndicator
    mode="subscription"
    status={{ mode: "subscription", isValid: false, message: "未ログイン", lastCheckedAt: Date.now() }}
    isValid={false}
    onActionClick={onActionClick}
  />
);
await userEvent.click(screen.getByText(/ログイン方法を確認/i));
```

---

### TC-UI-014: aria-live属性の確認

**対応受入基準**: -

**Given（前提条件）**

- AuthModeStatusIndicator をレンダリング

**When（操作）**

- コンポーネントがマウントされる

**Then（期待結果）**

- コンテナに `role="status"` がある
- `aria-live="polite"` が設定されている

**モック設定**

```typescript
render(<AuthModeStatusIndicator mode="subscription" status={...} isValid={true} />);
expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
```

---

## 6. IPCハンドラ テストケース

### ファイル: `apps/desktop/src/main/ipc/__tests__/auth-mode-handlers.test.ts`

---

### TC-IPC-001: auth-mode:get - 正常取得

**対応受入基準**: -

**Given（前提条件）**

- IPCハンドラが登録されている
- AuthModeService.getMode() が `subscription` を返す

**When（操作）**

- `auth-mode:get` チャンネルを invoke

**Then（期待結果）**

- `{ success: true, data: "subscription" }` が返される

**モック設定**

```typescript
mockAuthModeService.getMode.mockResolvedValue("subscription");
```

---

### TC-IPC-002: auth-mode:set - 正常設定

**対応受入基準**: AC-5

**Given（前提条件）**

- IPCハンドラが登録されている
- AuthModeService.setMode() が成功

**When（操作）**

- `auth-mode:set` チャンネルを `{ mode: "api-key" }` で invoke

**Then（期待結果）**

- `{ success: true }` が返される
- AuthModeService.setMode("api-key") が呼び出される

**モック設定**

```typescript
mockAuthModeService.setMode.mockResolvedValue(undefined);
```

---

### TC-IPC-003: auth-mode:set - 無効なモード

**対応受入基準**: -

**Given（前提条件）**

- IPCハンドラが登録されている

**When（操作）**

- `auth-mode:set` チャンネルを `{ mode: "invalid" }` で invoke

**Then（期待結果）**

- `{ success: false, error: { code: "auth-mode/invalid-mode", ... } }` が返される

**モック設定**

```typescript
// バリデーション失敗
```

---

### TC-IPC-004: auth-mode:status - 状態取得

**対応受入基準**: AC-8

**Given（前提条件）**

- IPCハンドラが登録されている
- AuthModeService.getStatus() が認証済み状態を返す

**When（操作）**

- `auth-mode:status` チャンネルを invoke

**Then（期待結果）**

- `{ success: true, data: AuthModeStatus }` が返される

**モック設定**

```typescript
mockAuthModeService.getStatus.mockResolvedValue({
  mode: "subscription",
  isAuthenticated: true,
  details: { hasSubscriptionToken: true },
});
```

---

### TC-IPC-005: auth-mode:validate - バリデーション成功

**対応受入基準**: -

**Given（前提条件）**

- IPCハンドラが登録されている
- AuthModeService.validateMode() が `true` を返す

**When（操作）**

- `auth-mode:validate` チャンネルを `{ mode: "subscription" }` で invoke

**Then（期待結果）**

- `{ success: true, data: { isValid: true, ... } }` が返される

**モック設定**

```typescript
mockAuthModeService.validateMode.mockResolvedValue(true);
```

---

### TC-IPC-006: sender検証 - 不正なsender

**対応受入基準**: -

**Given（前提条件）**

- IPCハンドラが登録されている
- 不正な sender からのリクエスト

**When（操作）**

- 不正なウィンドウから `auth-mode:get` を invoke

**Then（期待結果）**

- リクエストが拒否される
- エラーレスポンスが返される

**モック設定**

```typescript
// withValidation のモック設定
```

---

## 7. 確認ダイアログ テストケース

### ファイル: `apps/desktop/src/renderer/components/molecules/__tests__/AuthModeConfirmDialog.test.tsx`

---

### TC-DIALOG-001: ダイアログ表示

**対応受入基準**: AC-5

**Given（前提条件）**

- `isOpen={true}` でダイアログをレンダリング
- `fromMode="subscription"`, `toMode="api-key"`

**When（操作）**

- コンポーネントがマウントされる

**Then（期待結果）**

- ダイアログが表示される
- 「認証方式を変更しますか？」タイトルが表示
- 「サブスクリプション認証 → APIキー認証」が表示
- 「キャンセル」「切り替え」ボタンが表示

**モック設定**

```typescript
render(
  <AuthModeConfirmDialog
    isOpen={true}
    fromMode="subscription"
    toMode="api-key"
    onConfirm={vi.fn()}
    onCancel={vi.fn()}
  />
);
```

---

### TC-DIALOG-002: キャンセルボタンクリック

**対応受入基準**: AC-11

**Given（前提条件）**

- ダイアログが表示されている
- `onCancel` がモック関数

**When（操作）**

- 「キャンセル」ボタンをクリック

**Then（期待結果）**

- `onCancel` が呼び出される

**モック設定**

```typescript
const onCancel = vi.fn();
render(<AuthModeConfirmDialog isOpen={true} ... onCancel={onCancel} />);
await userEvent.click(screen.getByText("キャンセル"));
```

---

### TC-DIALOG-003: 切り替えボタンクリック

**対応受入基準**: AC-5

**Given（前提条件）**

- ダイアログが表示されている
- `onConfirm` がモック関数

**When（操作）**

- 「切り替え」ボタンをクリック

**Then（期待結果）**

- `onConfirm` が呼び出される

**モック設定**

```typescript
const onConfirm = vi.fn();
render(<AuthModeConfirmDialog isOpen={true} ... onConfirm={onConfirm} />);
await userEvent.click(screen.getByText("切り替え"));
```

---

### TC-DIALOG-004: Escapeキーでキャンセル

**対応受入基準**: AC-11

**Given（前提条件）**

- ダイアログが表示されている
- `onCancel` がモック関数

**When（操作）**

- Escape キーを押す

**Then（期待結果）**

- `onCancel` が呼び出される

**モック設定**

```typescript
const onCancel = vi.fn();
render(<AuthModeConfirmDialog isOpen={true} ... onCancel={onCancel} />);
await userEvent.keyboard("{Escape}");
```

---

### TC-DIALOG-005: フォーカストラップ

**対応受入基準**: -

**Given（前提条件）**

- ダイアログが表示されている

**When（操作）**

- Tab キーを繰り返し押す

**Then（期待結果）**

- フォーカスがダイアログ内の要素間のみで循環
- ダイアログ外の要素にはフォーカスが移動しない

**モック設定**

```typescript
render(<AuthModeConfirmDialog isOpen={true} ... />);
// Tab循環テスト
```

---

### TC-DIALOG-006: ローディング状態でのボタン無効化

**対応受入基準**: -

**Given（前提条件）**

- ダイアログが表示されている
- `isLoading={true}`

**When（操作）**

- 「切り替え」ボタンをクリック

**Then（期待結果）**

- ボタンが無効化されている
- `onConfirm` は呼び出されない
- スピナーが表示される

**モック設定**

```typescript
render(<AuthModeConfirmDialog isOpen={true} isLoading={true} ... />);
```

---

## 関連ドキュメント

| ドキュメント   | パス                                     |
| -------------- | ---------------------------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`  |
| 受入基準       | `outputs/phase-1/acceptance-criteria.md` |
| 設計書（各種） | `outputs/phase-2/`                       |
