# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                               |
| -------- | ------------------------------------------------ |
| タスクID | TASK-AUTH-MODE-SELECTION-001                     |
| 機能名   | auth-mode-selection                              |
| Phase    | 6 - テスト拡充                                   |
| Issue    | #750                                             |
| 作成日   | 2026-02-08                                       |
| 前Phase  | [Phase 5: 実装](./phase-5-implementation.md)     |
| 次Phase  | [Phase 7: カバレッジ確認](./phase-7-coverage.md) |

## 目的

カバレッジ目標を達成するため、以下の観点でテストを拡充する：

- エッジケースの網羅
- エラーハンドリングの検証
- 境界値テスト
- 異常系シナリオ

## 依存関係

- **前提成果物**:
  - Phase 5で実装されたすべてのソースコード
  - Phase 4で作成した基本テスト
- **参照**:
  - `.claude/rules/02-code-quality.md` - カバレッジ基準

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 現状（Phase 5完了時） |
| ----------------- | -------- | -------- | --------------------- |
| Line Coverage     | 80%      | 90%      | 測定が必要            |
| Branch Coverage   | 60%      | 70%      | 測定が必要            |
| Function Coverage | 80%      | 90%      | 測定が必要            |

## 実行タスク

### TASK-1: エッジケーステスト追加

#### AuthModeService エッジケース

| テストケース                     | 目的                     |
| -------------------------------- | ------------------------ |
| 無効なモード値の設定を試行       | バリデーションの検証     |
| electron-store破損時の動作       | フォールバック処理の検証 |
| 同時に複数回setModeを呼び出し    | 競合状態の検証           |
| 極端に長い待機後のgetCurrentMode | 永続化の整合性検証       |
| アプリ再起動後の状態復元         | 永続化動作の検証         |

```typescript
// 追加テスト例
describe("AuthModeService エッジケース", () => {
  it("無効なモード値を設定した場合、エラーをスローする", async () => {
    await expect(service.setMode("invalid" as AuthMode)).rejects.toThrow(
      ValidationError,
    );
  });

  it("ストアが破損している場合、デフォルト値を返す", () => {
    // electron-storeをモックで破損状態に
    mockStore.get.mockImplementation(() => {
      throw new Error("Corrupted store");
    });

    expect(service.getCurrentMode()).toBe("subscription");
  });

  it("並行setMode呼び出しは最後の値が有効", async () => {
    await Promise.all([
      service.setMode("subscription"),
      service.setMode("api-key"),
      service.setMode("subscription"),
    ]);

    expect(service.getCurrentMode()).toBe("subscription");
  });
});
```

#### SubscriptionAuthProvider エッジケース

| テストケース                      | 目的                   |
| --------------------------------- | ---------------------- |
| CLIがインストールされていない     | 適切なエラーメッセージ |
| CLIセッションが期限切れ           | リフレッシュ処理の検証 |
| ~/.claudeディレクトリが存在しない | フォールバック処理     |
| トークンファイルが破損            | エラーハンドリング     |
| ネットワーク切断中のトークン検証  | オフライン動作         |

---

### TASK-2: エラーハンドリングテスト追加

#### IPC Handlers エラーケース

```typescript
describe("authModeHandlers エラーハンドリング", () => {
  it("auth-mode:set - 不正なウィンドウからのリクエストを拒否", async () => {
    const result = await invoke("auth-mode:set", {
      mode: "subscription",
      _sender: { id: -1 }, // 無効な送信元
    });

    expect(result.success).toBe(false);
    expect(result.error.code).toBe(1001); // Validation Error
  });

  it("auth-mode:validate - サービスエラー時にサニタイズされたエラーを返す", async () => {
    mockAuthModeService.validateMode.mockRejectedValue(
      new Error("Internal: database connection failed at /path/to/db"),
    );

    const result = await invoke("auth-mode:validate", { mode: "subscription" });

    expect(result.success).toBe(false);
    expect(result.error.message).not.toContain("/path/to/db");
    expect(result.error.message).toBe("認証方式の検証に失敗しました");
  });
});
```

#### Store エラーケース

```typescript
describe("authModeSlice エラーハンドリング", () => {
  it("IPC呼び出し失敗時にエラー状態を設定", async () => {
    mockIpc.invoke.mockRejectedValue(new Error("IPC failed"));

    const { result } = renderHook(() => useAuthModeStore());

    await act(async () => {
      await result.current.setAuthMode("api-key");
    });

    expect(result.current.error).toBe("認証方式の変更に失敗しました");
    expect(result.current.isLoading).toBe(false);
  });

  it("タイムアウト時に適切なエラーメッセージを表示", async () => {
    mockIpc.invoke.mockImplementation(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 10000),
        ),
    );

    // タイムアウト処理のテスト
  });
});
```

---

### TASK-3: 境界値テスト

```typescript
describe('境界値テスト', () => {
  describe('AuthModeService', () => {
    it('モード切替直後のgetCurrentModeは新しい値を返す', async () => {
      await service.setMode('api-key');
      expect(service.getCurrentMode()).toBe('api-key');
    });

    it('lastValidatedがnullの場合、statusは未検証状態', () => {
      const status = service.getStatus();
      expect(status.lastValidated).toBeNull();
      expect(status.isValid).toBe(false);
    });
  });

  describe('UI境界値', () => {
    it('高速連続クリックでも1回のみ切替ダイアログ表示', async () => {
      const { getByTestId } = render(<AuthModeSelector />);
      const segment = getByTestId('auth-mode-api-key');

      // 高速3連続クリック
      await userEvent.click(segment);
      await userEvent.click(segment);
      await userEvent.click(segment);

      expect(screen.getAllByRole('dialog')).toHaveLength(1);
    });
  });
});
```

---

### TASK-4: E2Eテストシナリオ実装

**対象ファイル**: `apps/desktop/e2e/auth-mode-selection.spec.ts`

```typescript
import { test, expect } from "@playwright/test";
import { _electron as electron } from "playwright";

test.describe("認証方式選択 E2E", () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeEach(async () => {
    electronApp = await electron.launch({ args: ["./dist/main.js"] });
    window = await electronApp.firstWindow();
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test("サブスクリプション → BYOK → サブスクリプション の切替フロー", async () => {
    // 設定画面を開く
    await window.click('[data-testid="settings-button"]');

    // 初期状態確認（サブスクリプション）
    await expect(
      window.locator('[data-testid="auth-mode-subscription"]'),
    ).toHaveAttribute("aria-checked", "true");

    // BYOK選択
    await window.click('[data-testid="auth-mode-api-key"]');

    // 確認ダイアログ表示
    await expect(window.locator('[role="dialog"]')).toBeVisible();

    // 確認
    await window.click('[data-testid="confirm-change"]');

    // BYOK状態確認
    await expect(
      window.locator('[data-testid="auth-mode-api-key"]'),
    ).toHaveAttribute("aria-checked", "true");

    // サブスクリプションに戻す
    await window.click('[data-testid="auth-mode-subscription"]');
    await window.click('[data-testid="confirm-change"]');

    // サブスクリプション状態確認
    await expect(
      window.locator('[data-testid="auth-mode-subscription"]'),
    ).toHaveAttribute("aria-checked", "true");
  });

  test("アプリ再起動後も選択状態が維持される", async () => {
    // BYOK選択
    await window.click('[data-testid="settings-button"]');
    await window.click('[data-testid="auth-mode-api-key"]');
    await window.click('[data-testid="confirm-change"]');

    // アプリ再起動
    await electronApp.close();
    electronApp = await electron.launch({ args: ["./dist/main.js"] });
    window = await electronApp.firstWindow();

    // 状態確認
    await window.click('[data-testid="settings-button"]');
    await expect(
      window.locator('[data-testid="auth-mode-api-key"]'),
    ).toHaveAttribute("aria-checked", "true");
  });

  test("認証失敗時のエラー表示", async () => {
    // BYOKモードでAPIキー未設定の状態
    await window.click('[data-testid="settings-button"]');
    await window.click('[data-testid="auth-mode-api-key"]');
    await window.click('[data-testid="confirm-change"]');

    // スキル実行を試行
    await window.click('[data-testid="execute-skill"]');

    // エラーメッセージ確認
    await expect(window.locator('[data-testid="error-message"]')).toContainText(
      "APIキーが設定されていません",
    );
  });
});
```

---

### TASK-5: モック/スタブの改善

#### 共通モックファクトリの作成

**対象ファイル**: `apps/desktop/src/__mocks__/authModeTestUtils.ts`

```typescript
import { vi } from "vitest";
import type { AuthMode, AuthModeConfig } from "@repo/shared";

export const createMockAuthModeService = (
  overrides?: Partial<AuthModeService>,
) => ({
  getCurrentMode: vi.fn().mockReturnValue("subscription" as AuthMode),
  setMode: vi.fn().mockResolvedValue(undefined),
  getStatus: vi.fn().mockReturnValue({
    mode: "subscription",
    isValid: true,
    lastValidated: new Date().toISOString(),
  } as AuthModeConfig),
  validateMode: vi.fn().mockResolvedValue(true),
  onModeChange: vi.fn().mockReturnValue(() => {}),
  ...overrides,
});

export const createMockSubscriptionAuthProvider = (
  overrides?: Partial<SubscriptionAuthProvider>,
) => ({
  getToken: vi.fn().mockResolvedValue("mock-subscription-token"),
  validateToken: vi.fn().mockResolvedValue(true),
  refreshToken: vi.fn().mockResolvedValue("mock-refreshed-token"),
  clearCache: vi.fn(),
  ...overrides,
});

export const createMockElectronStore = (
  initialData: Record<string, unknown> = {},
) => {
  let store = { ...initialData };
  return {
    get: vi.fn(
      (key: string, defaultValue?: unknown) => store[key] ?? defaultValue,
    ),
    set: vi.fn((key: string, value: unknown) => {
      store[key] = value;
    }),
    delete: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    _getStore: () => store, // テスト用
    _setStore: (newStore: Record<string, unknown>) => {
      store = newStore;
    },
  };
};
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                                                  | 目標 |
| ------------------ | --------------------------------------------------------- | ---- |
| IPC接続テスト      | auth-mode:\* チャンネルの疎通・レスポンス形式             | 100% |
| データフローテスト | Renderer → Main → electron-store → Main → Renderer の往復 | 100% |
| エラーハンドリング | IPC障害時・サービスエラー時のRenderer表示・リトライ       | 80%+ |
| 認証連携テスト     | CLI トークン取得・APIキー取得・期限切れ処理               | 100% |
| 状態同期テスト     | 認証方式変更時のUIリアルタイム反映・ロールバック          | 100% |

### 統合テスト追加実装

```typescript
// apps/desktop/src/main/ipc/__tests__/authModeHandlers.integration.test.ts
describe("authModeHandlers 統合テスト", () => {
  it("Renderer → Main → Store → Main → Renderer の完全フロー", async () => {
    // Phase 6で実装
  });
});
```

## 成果物

| ファイルパス                                                                          | 説明                     |
| ------------------------------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/main/services/auth/__tests__/AuthModeService.edge.test.ts`          | エッジケーステスト       |
| `apps/desktop/src/main/services/auth/__tests__/SubscriptionAuthProvider.edge.test.ts` | エッジケーステスト       |
| `apps/desktop/src/main/ipc/__tests__/authModeHandlers.error.test.ts`                  | エラーハンドリングテスト |
| `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.error.test.ts`        | エラーハンドリングテスト |
| `apps/desktop/e2e/auth-mode-selection.spec.ts`                                        | E2Eテスト                |
| `apps/desktop/src/__mocks__/authModeTestUtils.ts`                                     | 共通モックユーティリティ |

## 完了条件

- [ ] すべてのエッジケーステストが追加されている
- [ ] すべてのエラーハンドリングテストが追加されている
- [ ] 境界値テストが追加されている
- [ ] E2Eテストシナリオが実装されている
- [ ] 共通モックファクトリが作成されている
- [ ] すべてのテストがGreen

## 次のPhase

Phase 7: カバレッジ確認へ進む

- カバレッジ測定実行
- 基準達成判定
