# Phase 6: テスト拡充 - Zustand Store Hooks無限ループ修正

## メタ情報

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| タスクID  | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| Phase     | 6 - テスト拡充                       |
| 前提Phase | Phase 5（実装）                      |
| 成果物    | 拡充されたテストファイル             |
| 次Phase   | Phase 7（カバレッジ確認）            |

## 1. 目的

Phase 4 で作成した基本テストに加え、エッジケースや境界条件をカバーするテストを追加する。

## 2. 追加テストケース

### 2.1 SettingsView 追加テストケース

| テストケースID | テスト名                                     | 検証内容                        | 期待結果 |
| -------------- | -------------------------------------------- | ------------------------------- | -------- |
| TC-SV-004      | isVisible変更時に初期化が再実行されない      | コンポーネントの表示/非表示切替 | 1回のみ  |
| TC-SV-005      | authModeが変更されても初期化が再実行されない | Storeの状態変更                 | 1回のみ  |
| TC-SV-006      | エラー状態でも初期化は1回だけ                | エラーハンドリング              | 1回のみ  |
| TC-SV-007      | ローディング状態でも初期化は1回だけ          | ローディング状態                | 1回のみ  |

### 2.2 LLMSelectorPanel 追加テストケース

| テストケースID | テスト名                                              | 検証内容               | 期待結果             |
| -------------- | ----------------------------------------------------- | ---------------------- | -------------------- |
| TC-LLM-004     | プロバイダー一覧取得後の再レンダリングでループしない  | データ取得後の状態更新 | 無限ループなし       |
| TC-LLM-005     | エラー時のリトライでのみfetchProvidersが呼ばれる      | エラーリトライ         | ボタンクリック時のみ |
| TC-LLM-006     | ヘルスチェック実行後に無限ループしない                | ヘルスチェック完了後   | 無限ループなし       |
| TC-LLM-007     | 同じプロバイダーを再選択してもcheckHealthは呼ばれない | 同一プロバイダー再選択 | 呼び出しなし         |

### 2.3 統合テストケース

| テストケースID | テスト名                                                      | 検証内容        | 期待結果          |
| -------------- | ------------------------------------------------------------- | --------------- | ----------------- |
| TC-INT-001     | 複数コンポーネントが同時にマウントされても無限ループしない    | 複数Store Hooks | 各初期化1回のみ   |
| TC-INT-002     | コンポーネントのアンマウント/再マウントで初期化が再実行される | ライフサイクル  | 再マウント時に1回 |

## 3. 追加テストファイル

### 3.1 SettingsView 追加テスト

**ファイル**: `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`

```typescript
// 既存テストファイルに追加

describe("無限ループ防止（拡充テスト）", () => {
  it("authModeが変更されても初期化が再実行されない", async () => {
    const mockInitializeAuthMode = vi.fn();
    const mockSetMode = vi.fn();
    let currentMode = "subscription";

    const { useAuthModeStore } = await import("../../store");
    vi.mocked(useAuthModeStore).mockImplementation(() => ({
      mode: currentMode as "subscription" | "api-key",
      status: null,
      isLoading: false,
      setMode: mockSetMode,
      initializeAuthMode: mockInitializeAuthMode,
    }));

    const { rerender } = render(<SettingsView />);
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);

    // authMode を変更して再レンダリング
    currentMode = "api-key";
    rerender(<SettingsView />);

    // 初期化は再実行されない
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);
  });

  it("エラー状態でも初期化は1回だけ", async () => {
    const mockInitializeAuthMode = vi.fn();
    const { useAuthModeStore } = await import("../../store");

    // エラー状態を含むモック
    vi.mocked(useAuthModeStore).mockReturnValue({
      mode: "subscription" as const,
      status: { isValid: false, message: "Error" },
      isLoading: false,
      setMode: vi.fn(),
      initializeAuthMode: mockInitializeAuthMode,
    });

    const { rerender } = render(<SettingsView />);
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);

    // 再レンダリング
    rerender(<SettingsView />);
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);
  });

  it("ローディング状態でも初期化は1回だけ", async () => {
    const mockInitializeAuthMode = vi.fn();
    let isLoading = true;

    const { useAuthModeStore } = await import("../../store");
    vi.mocked(useAuthModeStore).mockImplementation(() => ({
      mode: "subscription" as const,
      status: null,
      isLoading,
      setMode: vi.fn(),
      initializeAuthMode: mockInitializeAuthMode,
    }));

    const { rerender } = render(<SettingsView />);
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);

    // ローディング完了
    isLoading = false;
    rerender(<SettingsView />);

    // 初期化は再実行されない
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);
  });
});
```

### 3.2 LLMSelectorPanel 追加テスト

**ファイル**: `apps/desktop/src/renderer/components/llm/__tests__/LLMSelectorPanel.test.tsx`

```typescript
// 既存テストファイルに追加

describe("無限ループ防止（拡充テスト）", () => {
  it("プロバイダー一覧取得後の再レンダリングでループしない", async () => {
    let providers: Provider[] = [];
    const mockFetchProviders = vi.fn().mockImplementation(() => {
      providers = [
        { id: "openai", name: "OpenAI", models: [] },
        { id: "anthropic", name: "Anthropic", models: [] },
      ];
    });

    const { useLLMStore } = await import("@/renderer/store");
    vi.mocked(useLLMStore).mockImplementation(() => ({
      providers,
      selectedProviderId: null,
      selectedModelId: null,
      isLoading: false,
      error: null,
      healthStatus: {},
      fetchProviders: mockFetchProviders,
      selectProvider: vi.fn(),
      selectModel: vi.fn(),
      checkHealth: vi.fn(),
    }));

    const { rerender } = render(<LLMSelectorPanel />);
    expect(mockFetchProviders).toHaveBeenCalledTimes(1);

    // データ取得後に再レンダリング
    rerender(<LLMSelectorPanel />);
    rerender(<LLMSelectorPanel />);

    // 無限ループしない
    expect(mockFetchProviders).toHaveBeenCalledTimes(1);
  });

  it("エラー時のリトライでのみfetchProvidersが呼ばれる", async () => {
    const mockFetchProviders = vi.fn();

    const { useLLMStore } = await import("@/renderer/store");
    vi.mocked(useLLMStore).mockReturnValue({
      providers: [],
      selectedProviderId: null,
      selectedModelId: null,
      isLoading: false,
      error: { message: "Network Error", retryable: true },
      healthStatus: {},
      fetchProviders: mockFetchProviders,
      selectProvider: vi.fn(),
      selectModel: vi.fn(),
      checkHealth: vi.fn(),
    });

    render(<LLMSelectorPanel />);

    // 初回の呼び出し
    expect(mockFetchProviders).toHaveBeenCalledTimes(1);

    // リトライボタンをクリック
    const retryButton = screen.getByText("リトライ");
    fireEvent.click(retryButton);

    // リトライで呼ばれる
    expect(mockFetchProviders).toHaveBeenCalledTimes(2);
  });

  it("同じプロバイダーを再選択してもcheckHealthは再呼び出しされない", async () => {
    const mockCheckHealth = vi.fn();
    const selectedProviderId = "openai";

    const { useLLMStore } = await import("@/renderer/store");
    vi.mocked(useLLMStore).mockReturnValue({
      providers: [{ id: "openai", name: "OpenAI", models: [] }],
      selectedProviderId,
      selectedModelId: null,
      isLoading: false,
      error: null,
      healthStatus: {},
      fetchProviders: vi.fn(),
      selectProvider: vi.fn(),
      selectModel: vi.fn(),
      checkHealth: mockCheckHealth,
    });

    const { rerender } = render(<LLMSelectorPanel />);

    // 初回のヘルスチェック
    const initialCalls = mockCheckHealth.mock.calls.length;

    // 同じプロバイダーで再レンダリング
    rerender(<LLMSelectorPanel />);
    rerender(<LLMSelectorPanel />);

    // 追加呼び出しなし
    expect(mockCheckHealth).toHaveBeenCalledTimes(initialCalls);
  });
});
```

### 3.3 ライフサイクルテスト

**ファイル**: `apps/desktop/src/renderer/views/SettingsView/SettingsView.lifecycle.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsView } from "./index";

// モック設定（省略）

describe("SettingsView ライフサイクルテスト", () => {
  const mockInitializeAuthMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // モック設定
  });

  it("コンポーネントのアンマウント/再マウントで初期化が再実行される", () => {
    const { unmount } = render(<SettingsView />);
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);

    // アンマウント
    unmount();

    // 再マウント
    render(<SettingsView />);

    // 再マウント時に初期化が実行される
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(2);
  });

  it("条件付きレンダリングでの表示/非表示切替", () => {
    const { rerender, unmount } = render(
      <div>{true && <SettingsView />}</div>
    );
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);

    // 非表示（実際はアンマウント）
    rerender(<div>{false && <SettingsView />}</div>);

    // 再表示（再マウント）
    rerender(<div>{true && <SettingsView />}</div>);

    // 再マウント時に初期化が実行される
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(2);
  });
});
```

## 4. テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- --run

# 特定のテストファイル
pnpm --filter @repo/desktop test -- --run SettingsView
pnpm --filter @repo/desktop test -- --run LLMSelectorPanel

# カバレッジ付き
pnpm --filter @repo/desktop test -- --run --coverage
```

## 5. 完了条件

- [ ] SettingsView の追加テストケースが追加されている
- [ ] LLMSelectorPanel の追加テストケースが追加されている
- [ ] ライフサイクルテストが追加されている
- [ ] すべてのテストがパス

## 6. 次Phase

Phase 7（カバレッジ確認）へ進む。
