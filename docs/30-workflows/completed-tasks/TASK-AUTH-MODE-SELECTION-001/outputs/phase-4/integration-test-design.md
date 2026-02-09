# 統合テスト設計書

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | TASK-AUTH-MODE-SELECTION-001 |
| Phase    | 4                            |
| 作成日   | 2026-02-09                   |
| 対象     | IPC通信・レイヤー間連携      |

---

## 統合テストの範囲

### テスト対象レイヤー

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Renderer Process                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  AuthModeSettingsSection                                         │   │
│  │       │                                                          │   │
│  │       ▼                                                          │   │
│  │  authModeSlice (Zustand)                                         │   │
│  │       │                                                          │   │
│  │       ▼                                                          │   │
│  │  window.electronAPI.authMode                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ IPC
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                           Preload Bridge                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  authModeApi (contextBridge)                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ IPC Channels
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                            Main Process                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  authModeHandlers (IPC Handlers)                                 │   │
│  │       │                                                          │   │
│  │       ▼                                                          │   │
│  │  AuthModeService                                                 │   │
│  │       │                                                          │   │
│  │       ├─────────────────────────────────────────┐                │   │
│  │       ▼                                         ▼                │   │
│  │  SubscriptionAuthProvider              AuthKeyService            │   │
│  │       │                                         │                │   │
│  │       ▼                                         ▼                │   │
│  │  Keychain (keytar)                    electron-store             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 統合テスト境界

| テストID | 開始点                | 終了点                   | 範囲                     |
| -------- | --------------------- | ------------------------ | ------------------------ |
| IT-001   | authModeSlice.setMode | AuthModeService.setMode  | Slice→IPC→Service        |
| IT-002   | IPC Handler           | SubscriptionAuthProvider | Handler→Service→Provider |
| IT-003   | UI Component          | Zustand Store            | Component→Store→IPC      |
| IT-004   | auth-mode:changed     | authModeSlice            | Main→Renderer Event      |

---

## 統合テストケース

### ファイル: `apps/desktop/src/__tests__/integration/auth-mode-integration.test.ts`

---

### IT-001: 認証モード切り替えフロー（Slice→IPC→Service）

**テスト概要**

Renderer の Zustand Slice から Main Process の AuthModeService までの一連のフローをテスト

**テストシナリオ**

```
1. authModeSlice.setMode("api-key") を呼び出す
2. window.electronAPI.authMode.set() が呼び出される
3. IPC経由で auth-mode:set ハンドラが実行される
4. AuthModeService.setMode() が呼び出される
5. electron-store に保存される
6. auth-mode:changed イベントが発行される
7. Slice の状態が更新される
```

**Given（前提条件）**

- 全レイヤーが初期化されている
- 現在の認証モードが `subscription`
- Main/Renderer 間の IPC モックが設定されている

**When（操作）**

- `authModeSlice.setMode("api-key")` を実行

**Then（期待結果）**

- AuthModeService.setMode() が "api-key" で呼び出される
- electron-store.set() が呼び出される
- auth-mode:changed イベントが発行される
- Slice の mode が "api-key" に更新される

**テストコード**

```typescript
describe("IT-001: 認証モード切り替えフロー", () => {
  let mockAuthModeService: MockedObject<IAuthModeService>;
  let mockIpcMain: MockedObject<typeof ipcMain>;
  let mockStore: MockedObject<ElectronStore<AuthModeStoreSchema>>;

  beforeEach(() => {
    // モックセットアップ
    mockAuthModeService = createMockAuthModeService();
    mockStore = createMockStore();
    mockIpcMain = createMockIpcMain();

    // IPC ハンドラ登録
    registerAuthModeHandlers(mockAuthModeService);

    // Renderer 側モック
    setupRendererMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    useStore.getState().resetAuthMode();
  });

  it("should update auth mode through entire stack", async () => {
    // Given
    mockAuthModeService.getMode.mockResolvedValue("subscription");
    mockAuthModeService.setMode.mockResolvedValue(undefined);

    // When
    await act(async () => {
      await useStore.getState().setMode("api-key");
    });

    // Then
    expect(mockAuthModeService.setMode).toHaveBeenCalledWith("api-key");
    expect(useStore.getState().mode).toBe("api-key");
  });

  it("should handle error propagation correctly", async () => {
    // Given
    mockAuthModeService.setMode.mockRejectedValue(new Error("Storage failed"));

    // When
    await act(async () => {
      await useStore.getState().setMode("api-key");
    });

    // Then
    expect(useStore.getState().error).toContain("設定に失敗しました");
    expect(useStore.getState().mode).toBe("subscription"); // 変更されない
  });
});
```

---

### IT-002: 認証状態取得フロー（Handler→Service→Provider）

**テスト概要**

IPC ハンドラから認証プロバイダーまでの認証状態取得フローをテスト

**テストシナリオ**

```
1. auth-mode:status ハンドラが呼び出される
2. AuthModeService.getStatus() が実行される
3. 現在のモードに応じたプロバイダーが呼び出される
   - subscription: SubscriptionAuthProvider.hasToken()
   - api-key: AuthKeyService.hasKey()
4. 認証状態が返される
```

**Given（前提条件）**

- 認証モードが `subscription`
- SubscriptionAuthProvider が初期化されている
- Keychain にトークンが保存されている

**When（操作）**

- `auth-mode:status` を invoke

**Then（期待結果）**

- SubscriptionAuthProvider.hasToken() が呼び出される
- `isAuthenticated: true` を含むレスポンスが返される

**テストコード**

```typescript
describe("IT-002: 認証状態取得フロー", () => {
  let authModeService: AuthModeService;
  let mockSubscriptionProvider: MockedObject<ISubscriptionAuthProvider>;
  let mockAuthKeyService: MockedObject<IAuthKeyService>;

  beforeEach(() => {
    mockSubscriptionProvider = createMockSubscriptionAuthProvider();
    mockAuthKeyService = createMockAuthKeyService();

    authModeService = new AuthModeService({
      subscriptionAuthProvider: mockSubscriptionProvider,
      authKeyService: mockAuthKeyService,
      settingsStore: createMockStore(),
    });
  });

  describe("subscription mode", () => {
    it("should call SubscriptionAuthProvider for status check", async () => {
      // Given
      mockSubscriptionProvider.hasToken.mockResolvedValue(true);

      // When
      const status = await authModeService.getStatus();

      // Then
      expect(mockSubscriptionProvider.hasToken).toHaveBeenCalled();
      expect(mockAuthKeyService.hasKey).not.toHaveBeenCalled();
      expect(status.isAuthenticated).toBe(true);
      expect(status.details?.hasSubscriptionToken).toBe(true);
    });

    it("should return error when not authenticated", async () => {
      // Given
      mockSubscriptionProvider.hasToken.mockResolvedValue(false);

      // When
      const status = await authModeService.getStatus();

      // Then
      expect(status.isAuthenticated).toBe(false);
      expect(status.error).toContain("ログイン");
    });
  });

  describe("api-key mode", () => {
    beforeEach(() => {
      // api-keyモードに切り替え
      authModeService["settingsStore"].get = vi.fn().mockReturnValue("api-key");
    });

    it("should call AuthKeyService for status check", async () => {
      // Given
      mockAuthKeyService.hasKey.mockResolvedValue(true);

      // When
      const status = await authModeService.getStatus();

      // Then
      expect(mockAuthKeyService.hasKey).toHaveBeenCalled();
      expect(mockSubscriptionProvider.hasToken).not.toHaveBeenCalled();
      expect(status.isAuthenticated).toBe(true);
      expect(status.details?.hasApiKey).toBe(true);
    });
  });
});
```

---

### IT-003: UIコンポーネント→Store→IPC連携

**テスト概要**

UIコンポーネントからのユーザー操作がZustand Store経由でIPCまで伝播することをテスト

**テストシナリオ**

```
1. AuthModeSelector コンポーネントをレンダリング
2. ユーザーが「APIキー認証」セグメントをクリック
3. 確認ダイアログが表示される
4. ユーザーが「切り替え」をクリック
5. authModeSlice.confirmModeChange() が呼び出される
6. IPC auth-mode:set が呼び出される
7. 成功後、UIが更新される
```

**Given（前提条件）**

- AuthModeSettingsSection がレンダリングされている
- 現在の認証モードが `subscription`
- IPC モックが設定されている

**When（操作）**

- 「APIキー認証」をクリック
- 確認ダイアログで「切り替え」をクリック

**Then（期待結果）**

- IPC auth-mode:set が `{ mode: "api-key" }` で呼び出される
- UIの選択状態が「APIキー認証」に更新される
- 確認ダイアログが閉じる

**テストコード**

```typescript
describe("IT-003: UIコンポーネント→Store→IPC連携", () => {
  let mockElectronAPI: MockedElectronAPI;

  beforeEach(() => {
    mockElectronAPI = createMockElectronAPI();
    Object.defineProperty(window, "electronAPI", {
      value: mockElectronAPI,
      writable: true,
    });

    // 初期状態設定
    mockElectronAPI.authMode.get.mockResolvedValue({
      success: true,
      data: { mode: "subscription" },
    });
    mockElectronAPI.authMode.set.mockResolvedValue({ success: true });
    mockElectronAPI.authMode.getStatus.mockResolvedValue({
      success: true,
      data: {
        mode: "subscription",
        isAuthenticated: true,
        hasCredentials: true,
      },
    });
  });

  afterEach(() => {
    cleanup();
    useStore.getState().resetAuthMode();
  });

  it("should complete mode change flow through UI interaction", async () => {
    // Given
    render(<AuthModeSettingsSection />);

    // Store初期化を待つ
    await act(async () => {
      await useStore.getState().fetchMode();
    });

    // When: APIキー認証をクリック
    const apiKeyButton = screen.getByRole("radio", { name: /APIキー認証/i });
    await userEvent.click(apiKeyButton);

    // 確認ダイアログが表示される
    expect(screen.getByText(/認証方式を変更しますか/)).toBeInTheDocument();

    // 切り替えをクリック
    const confirmButton = screen.getByText("切り替え");
    await userEvent.click(confirmButton);

    // Then
    await waitFor(() => {
      expect(mockElectronAPI.authMode.set).toHaveBeenCalledWith({
        mode: "api-key",
      });
    });

    // UIが更新されている
    await waitFor(() => {
      expect(useStore.getState().mode).toBe("api-key");
    });

    // ダイアログが閉じている
    expect(screen.queryByText(/認証方式を変更しますか/)).not.toBeInTheDocument();
  });

  it("should handle cancel without IPC call", async () => {
    // Given
    render(<AuthModeSettingsSection />);
    await act(async () => {
      await useStore.getState().fetchMode();
    });

    // When: APIキー認証をクリック
    const apiKeyButton = screen.getByRole("radio", { name: /APIキー認証/i });
    await userEvent.click(apiKeyButton);

    // キャンセルをクリック
    const cancelButton = screen.getByText("キャンセル");
    await userEvent.click(cancelButton);

    // Then: IPCは呼び出されない
    expect(mockElectronAPI.authMode.set).not.toHaveBeenCalled();

    // モードは変更されない
    expect(useStore.getState().mode).toBe("subscription");
  });
});
```

---

### IT-004: Main→Renderer イベント通知

**テスト概要**

Main Process から発行された auth-mode:changed イベントが Renderer の Slice に反映されることをテスト

**テストシナリオ**

```
1. Renderer でイベントリスナーが登録されている
2. Main Process で認証モードが変更される
3. auth-mode:changed イベントが発行される
4. Renderer のリスナーが呼び出される
5. authModeSlice の状態が更新される
```

**Given（前提条件）**

- authModeSlice が初期化されている
- onModeChanged リスナーが登録されている

**When（操作）**

- Main Process から auth-mode:changed イベントを発行

**Then（期待結果）**

- Slice の mode が更新される
- Slice の status が更新される

**テストコード**

```typescript
describe("IT-004: Main→Renderer イベント通知", () => {
  let eventHandler: (event: AuthModeChangedEvent) => void;

  beforeEach(() => {
    // onChanged のコールバックをキャプチャ
    const mockOnChanged = vi.fn((callback) => {
      eventHandler = callback;
    });

    Object.defineProperty(window, "electronAPI", {
      value: {
        authMode: {
          get: vi.fn().mockResolvedValue({
            success: true,
            data: { mode: "subscription" },
          }),
          status: vi.fn().mockResolvedValue({
            success: true,
            data: {
              mode: "subscription",
              isAuthenticated: true,
              hasCredentials: true,
            },
          }),
          onChanged: mockOnChanged,
        },
      },
      writable: true,
    });

    // Slice初期化（リスナー登録）
    initializeAuthModeSlice();
  });

  afterEach(() => {
    useStore.getState().resetAuthMode();
  });

  it("should update Slice state on auth-mode:changed event", async () => {
    // Given
    expect(useStore.getState().mode).toBe("subscription");

    // When: Main からイベント発行をシミュレート
    act(() => {
      eventHandler({
        previousMode: "subscription",
        currentMode: "api-key",
        timestamp: Date.now(),
        isAuthenticated: true,
      });
    });

    // Then
    expect(useStore.getState().mode).toBe("api-key");
  });

  it("should handle multiple consecutive events", async () => {
    // Given
    expect(useStore.getState().mode).toBe("subscription");

    // When: 連続イベント
    act(() => {
      eventHandler({
        previousMode: "subscription",
        currentMode: "api-key",
        timestamp: Date.now(),
        isAuthenticated: true,
      });
    });

    act(() => {
      eventHandler({
        previousMode: "api-key",
        currentMode: "subscription",
        timestamp: Date.now(),
        isAuthenticated: true,
      });
    });

    // Then: 最後のイベントが反映
    expect(useStore.getState().mode).toBe("subscription");
  });
});
```

---

### IT-005: エラー伝播テスト

**テスト概要**

各レイヤーで発生したエラーが適切に上位レイヤーに伝播することをテスト

**テストシナリオ**

```
1. Keychain アクセスでエラーが発生
2. SubscriptionAuthProvider がエラーをハンドリング
3. AuthModeService が適切なエラーステータスを返す
4. IPC Handler がエラーレスポンスを返す
5. authModeSlice がエラー状態を更新
6. UI にエラーメッセージが表示される
```

**テストコード**

```typescript
describe("IT-005: エラー伝播テスト", () => {
  describe("Keychain error propagation", () => {
    it("should propagate Keychain access error to UI", async () => {
      // Given: Keychain エラーを発生させる
      const mockKeychainAccess = createMockKeychainAccess();
      mockKeychainAccess.getPassword.mockRejectedValue(
        new Error("Keychain access denied"),
      );

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      const authModeService = new AuthModeService({
        subscriptionAuthProvider: provider,
        authKeyService: createMockAuthKeyService(),
        settingsStore: createMockStore(),
      });

      // When
      const status = await authModeService.getStatus();

      // Then
      expect(status.isAuthenticated).toBe(false);
      // エラーメッセージはサニタイズされている
      expect(status.error).not.toContain("denied");
    });
  });

  describe("IPC error handling", () => {
    it("should return sanitized error message to Renderer", async () => {
      // Given
      const mockAuthModeService = createMockAuthModeService();
      mockAuthModeService.setMode.mockRejectedValue(
        new Error("Internal: Token validation failed for sk-ant-oat01-secret"),
      );

      // When: IPC ハンドラを直接呼び出す
      const handler = createAuthModeSetHandler(mockAuthModeService);
      const result = await handler({ mode: "subscription" });

      // Then: 機密情報がサニタイズされている
      expect(result.success).toBe(false);
      expect(result.error?.message).not.toContain("sk-ant-oat01-secret");
    });
  });

  describe("Store error state", () => {
    it("should update error state in Slice on IPC failure", async () => {
      // Given
      Object.defineProperty(window, "electronAPI", {
        value: {
          authMode: {
            set: vi.fn().mockResolvedValue({
              success: false,
              error: {
                code: "auth-mode/storage-failed",
                message: "設定の保存に失敗しました",
              },
            }),
          },
        },
        writable: true,
      });

      // When
      await act(async () => {
        await useStore.getState().setMode("api-key");
      });

      // Then
      expect(useStore.getState().error).toBe("設定の保存に失敗しました");
      expect(useStore.getState().isLoading).toBe(false);
    });
  });
});
```

---

### IT-006: 認証モード永続化テスト

**テスト概要**

認証モードが正しく永続化され、アプリ再起動後も維持されることをテスト

**テストシナリオ**

```
1. 認証モードを api-key に変更
2. electron-store に保存される
3. AuthModeService を再インスタンス化（再起動シミュレート）
4. getMode() で api-key が返される
```

**テストコード**

```typescript
describe("IT-006: 認証モード永続化テスト", () => {
  let mockStoreData: Record<string, unknown> = {};

  beforeEach(() => {
    mockStoreData = {};
  });

  const createMockPersistentStore = () => ({
    get: vi.fn((key: string) => mockStoreData[key]),
    set: vi.fn((key: string, value: unknown) => {
      mockStoreData[key] = value;
    }),
    delete: vi.fn((key: string) => {
      delete mockStoreData[key];
    }),
    has: vi.fn((key: string) => key in mockStoreData),
  });

  it("should persist auth mode across service instances", async () => {
    // Given: 初回インスタンス
    const store = createMockPersistentStore();
    const service1 = new AuthModeService({
      subscriptionAuthProvider: createMockSubscriptionAuthProvider(),
      authKeyService: createMockAuthKeyService(),
      settingsStore: store as unknown as ElectronStore<AuthModeStoreSchema>,
    });

    // When: モードを変更
    await service1.setMode("api-key");

    // Then: ストアに保存されている
    expect(mockStoreData["authMode"]).toBe("api-key");

    // Given: 2回目のインスタンス（再起動シミュレート）
    const service2 = new AuthModeService({
      subscriptionAuthProvider: createMockSubscriptionAuthProvider(),
      authKeyService: createMockAuthKeyService(),
      settingsStore: store as unknown as ElectronStore<AuthModeStoreSchema>,
    });

    // When/Then: 保存された値が取得できる
    const mode = await service2.getMode();
    expect(mode).toBe("api-key");
  });

  it("should return default mode when store is empty", async () => {
    // Given: 空のストア
    const store = createMockPersistentStore();
    const service = new AuthModeService({
      subscriptionAuthProvider: createMockSubscriptionAuthProvider(),
      authKeyService: createMockAuthKeyService(),
      settingsStore: store as unknown as ElectronStore<AuthModeStoreSchema>,
    });

    // When
    const mode = await service.getMode();

    // Then: デフォルト値
    expect(mode).toBe("subscription");
  });

  it("should handle corrupted store data gracefully", async () => {
    // Given: 破損したデータ
    mockStoreData["authMode"] = "invalid-mode";

    const store = createMockPersistentStore();
    const service = new AuthModeService({
      subscriptionAuthProvider: createMockSubscriptionAuthProvider(),
      authKeyService: createMockAuthKeyService(),
      settingsStore: store as unknown as ElectronStore<AuthModeStoreSchema>,
    });

    // When
    const mode = await service.getMode();

    // Then: デフォルト値にフォールバック
    expect(mode).toBe("subscription");
  });
});
```

---

## テストユーティリティ

### モックファクトリ

```typescript
// src/__tests__/utils/mock-factories.ts

export function createMockAuthModeService(): MockedObject<IAuthModeService> {
  return {
    getMode: vi.fn().mockResolvedValue("subscription"),
    setMode: vi.fn().mockResolvedValue(undefined),
    getStatus: vi.fn().mockResolvedValue({
      mode: "subscription",
      isAuthenticated: true,
      details: { hasSubscriptionToken: true },
    }),
    getCredential: vi.fn().mockResolvedValue("sk-ant-oat01-test"),
    onModeChange: vi.fn().mockReturnValue(() => {}),
    validateMode: vi.fn().mockResolvedValue(true),
  };
}

export function createMockSubscriptionAuthProvider(): MockedObject<ISubscriptionAuthProvider> {
  return {
    getToken: vi.fn().mockResolvedValue("sk-ant-oat01-test-token"),
    hasToken: vi.fn().mockResolvedValue(true),
    validateToken: vi.fn().mockResolvedValue(true),
    clearCache: vi.fn(),
  };
}

export function createMockAuthKeyService(): MockedObject<IAuthKeyService> {
  return {
    setKey: vi.fn().mockResolvedValue(undefined),
    getKey: vi.fn().mockResolvedValue("sk-ant-api03-test-key"),
    hasKey: vi.fn().mockResolvedValue(true),
    validateKey: vi.fn().mockResolvedValue(true),
    deleteKey: vi.fn().mockResolvedValue(undefined),
  };
}

export function createMockKeychainAccess(): MockedObject<IKeychainAccess> {
  return {
    getPassword: vi.fn().mockResolvedValue(null),
    setPassword: vi.fn().mockResolvedValue(undefined),
    deletePassword: vi.fn().mockResolvedValue(true),
  };
}

export function createMockElectronAPI(): MockedElectronAPI {
  return {
    authMode: {
      get: vi.fn().mockResolvedValue({
        success: true,
        data: { mode: "subscription" },
      }),
      set: vi.fn().mockResolvedValue({ success: true }),
      getStatus: vi.fn().mockResolvedValue({
        success: true,
        data: {
          mode: "subscription",
          isAuthenticated: true,
          hasCredentials: true,
        },
      }),
      validate: vi.fn().mockResolvedValue({
        success: true,
        data: { isValid: true, mode: "subscription", hasCredentials: true },
      }),
      onChanged: vi.fn(),
    },
  };
}

export function createMockStore<T>(): MockedObject<ElectronStore<T>> {
  const data: Record<string, unknown> = {};
  return {
    get: vi.fn((key: string) => data[key]),
    set: vi.fn((key: string, value: unknown) => {
      data[key] = value;
    }),
    delete: vi.fn((key: string) => {
      delete data[key];
    }),
    clear: vi.fn(() => {
      Object.keys(data).forEach((key) => delete data[key]);
    }),
    has: vi.fn((key: string) => key in data),
  } as unknown as MockedObject<ElectronStore<T>>;
}
```

### テストヘルパー

```typescript
// src/__tests__/utils/test-helpers.ts

/**
 * IPC レスポンスの待機ヘルパー
 */
export async function waitForIPCResponse<T>(
  promise: Promise<T>,
  timeout = 1000,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("IPC timeout")), timeout),
    ),
  ]);
}

/**
 * Store 状態変更の待機ヘルパー
 */
export async function waitForStoreState<T>(
  selector: (state: StoreState) => T,
  expected: T,
  timeout = 1000,
): Promise<void> {
  return waitFor(
    () => {
      expect(selector(useStore.getState())).toEqual(expected);
    },
    { timeout },
  );
}

/**
 * IPC ハンドラのテスト用ラッパー
 */
export function createTestableHandler<T, R>(
  handler: (event: IpcMainInvokeEvent, ...args: T[]) => Promise<R>,
) {
  return (...args: T[]) =>
    handler({ sender: { id: 1 } } as IpcMainInvokeEvent, ...args);
}
```

---

## 実行方法

### 統合テストのみ実行

```bash
# 統合テストファイルを指定して実行
pnpm --filter @repo/desktop test -- --testPathPattern="integration"

# ウォッチモード
pnpm --filter @repo/desktop test:watch -- --testPathPattern="integration"
```

### カバレッジ付き実行

```bash
pnpm --filter @repo/desktop test:coverage -- --testPathPattern="integration"
```

---

## 関連ドキュメント

| ドキュメント   | パス                                         |
| -------------- | -------------------------------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`      |
| テストケース   | `outputs/phase-4/test-cases.md`              |
| IPC仕様        | `outputs/phase-2/ipc-specification.md`       |
| 状態管理設計   | `outputs/phase-2/state-management-design.md` |
| 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md`         |
