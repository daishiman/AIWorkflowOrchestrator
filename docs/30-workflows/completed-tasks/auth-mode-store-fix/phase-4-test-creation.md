# Phase 4: テスト作成 - Zustand Store Hooks無限ループ修正

## メタ情報

| 項目      | 内容                                         |
| --------- | -------------------------------------------- |
| タスクID  | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001         |
| Phase     | 4 - テスト作成                               |
| 前提Phase | Phase 1-3（要件定義・設計・設計レビュー）    |
| 成果物    | テストファイル（無限ループ防止の検証テスト） |
| 次Phase   | Phase 5（実装）                              |

## 1. 目的

useRefパターンによる初期化が1回だけ実行されることを検証するテストケースを作成する。

### 1.1 テスト戦略の説明

#### ユニットテストで検証する内容

- 初期化関数（initializeAuthMode等）の呼び出し回数が1回のみ
- 再レンダリング時に呼び出し回数が増加しないこと
- **根拠**: useRefガードが「1回のみ実行」を強制するため、ユニットテストで呼び出し回数を確認することで、無限ループが発生していないことを間接的に検証可能

#### ユニットテストで検証できない内容（手動テストで対応）

- React StrictModeでの実際の動作（開発モード特有）
- UIのローディング表示が無限にぐるぐる回らないこと
- ブラウザの実際のレンダリングパフォーマンス

#### 検証方法の対応表

| 検証項目                 | ユニットテスト | 手動テスト（Phase 11） |
| ------------------------ | -------------- | ---------------------- |
| 関数呼び出し1回          | ✓ TC-SV-001    | -                      |
| 再レンダリング時に非実行 | ✓ TC-SV-002    | -                      |
| StrictMode対応           | ✓ TC-SV-003    | ✓ MT-08                |
| UIローディング状態正常   | ✗              | ✓ MT-01                |
| 実際の無限ループ確認     | ✗              | ✓ MT-01〜MT-07         |

## 2. テストケース設計

### 2.1 SettingsView 無限ループ防止テスト

| テストケースID | テスト名                                 | 検証内容                           | 期待結果               |
| -------------- | ---------------------------------------- | ---------------------------------- | ---------------------- |
| TC-SV-001      | initializeAuthModeが1回だけ呼ばれる      | 複数回レンダリング時の呼び出し回数 | 1回のみ                |
| TC-SV-002      | 再レンダリング時に初期化が再実行されない | stateの変更による再レンダリング    | 初期化は再実行されない |
| TC-SV-003      | StrictModeでも1回だけ呼ばれる            | React.StrictMode下での動作         | 1回のみ                |

### 2.2 LLMSelectorPanel 無限ループ防止テスト

| テストケースID | テスト名                                | 検証内容                        | 期待結果         |
| -------------- | --------------------------------------- | ------------------------------- | ---------------- |
| TC-LLM-001     | fetchProvidersが1回だけ呼ばれる         | 初回マウント時の呼び出し回数    | 1回のみ          |
| TC-LLM-002     | checkHealthが適切なタイミングで呼ばれる | プロバイダー変更時の動作        | 変更時のみ       |
| TC-LLM-003     | 再レンダリング時に無限ループしない      | propsの変更による再レンダリング | 無限呼び出しなし |

### 2.3 SkillSelector 無限ループ防止テスト

| テストケースID | テスト名                               | 検証内容                       | 期待結果           |
| -------------- | -------------------------------------- | ------------------------------ | ------------------ |
| TC-SK-001      | rescanSkillsが意図しない再実行をしない | コンポーネントの再レンダリング | 手動操作時のみ実行 |
| TC-SK-002      | selectSkillByNameがループしない        | スキル選択操作                 | 選択操作時のみ実行 |

## 3. テストファイル

### 3.1 SettingsView テスト追加

**ファイル**: `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`

```typescript
// 既存テストファイルに追加

describe("無限ループ防止", () => {
  it("initializeAuthModeが1回だけ呼ばれる", async () => {
    const mockInitializeAuthMode = vi.fn();
    const { useAuthModeStore } = await import("../../store");
    vi.mocked(useAuthModeStore).mockReturnValue({
      mode: "subscription" as const,
      status: null,
      isLoading: false,
      setMode: vi.fn(),
      initializeAuthMode: mockInitializeAuthMode,
    });

    const { rerender } = render(<SettingsView />);

    // 初回レンダリング
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);

    // 再レンダリング
    rerender(<SettingsView />);
    rerender(<SettingsView />);
    rerender(<SettingsView />);

    // 依然として1回だけ
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);
  });

  it("stateの変更で再レンダリングしても初期化は再実行されない", async () => {
    const mockInitializeAuthMode = vi.fn();
    const mockSetAutoSyncEnabled = vi.fn();

    const { useAppStore, useAuthModeStore } = await import("../../store");

    // Mock setup
    vi.mocked(useAuthModeStore).mockReturnValue({
      mode: "subscription" as const,
      status: null,
      isLoading: false,
      setMode: vi.fn(),
      initializeAuthMode: mockInitializeAuthMode,
    });

    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState({ setAutoSyncEnabled: mockSetAutoSyncEnabled }))) as never);

    render(<SettingsView />);

    // 初回の呼び出し
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);

    // 自動同期トグルを変更（stateの変更）
    const checkbox = screen.getByRole("checkbox", {
      name: /自動同期を有効にする/,
    });
    fireEvent.click(checkbox);

    // 初期化は再実行されない
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);
  });
});
```

### 3.2 LLMSelectorPanel テスト追加

**ファイル**: `apps/desktop/src/renderer/components/llm/__tests__/LLMSelectorPanel.test.tsx`

```typescript
// 既存テストファイルに追加、または新規作成

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, rerender } from "@testing-library/react";
import { LLMSelectorPanel } from "../LLMSelectorPanel";

// Mock store
const mockFetchProviders = vi.fn();
const mockCheckHealth = vi.fn();

vi.mock("@/renderer/store", () => ({
  useLLMStore: vi.fn(() => ({
    providers: [],
    selectedProviderId: null,
    selectedModelId: null,
    isLoading: false,
    error: null,
    healthStatus: {},
    fetchProviders: mockFetchProviders,
    selectProvider: vi.fn(),
    selectModel: vi.fn(),
    checkHealth: mockCheckHealth,
  })),
}));

describe("LLMSelectorPanel 無限ループ防止", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchProvidersが1回だけ呼ばれる", () => {
    const { rerender: rerenderComponent } = render(<LLMSelectorPanel />);

    expect(mockFetchProviders).toHaveBeenCalledTimes(1);

    // 複数回再レンダリング
    rerenderComponent(<LLMSelectorPanel />);
    rerenderComponent(<LLMSelectorPanel />);

    // 依然として1回だけ
    expect(mockFetchProviders).toHaveBeenCalledTimes(1);
  });

  it("propsの変更で再レンダリングしても無限ループしない", () => {
    const { rerender: rerenderComponent } = render(<LLMSelectorPanel compact={false} />);

    expect(mockFetchProviders).toHaveBeenCalledTimes(1);

    // props変更による再レンダリング
    rerenderComponent(<LLMSelectorPanel compact={true} />);
    rerenderComponent(<LLMSelectorPanel compact={false} />);

    // 無限ループしない
    expect(mockFetchProviders).toHaveBeenCalledTimes(1);
  });
});
```

### 3.3 SkillSelector テスト追加

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx`

```typescript
// 既存テストファイルに追加、または新規作成

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { SkillSelector } from "../SkillSelector";

// Mock store
const mockRescanSkills = vi.fn();
const mockSelectSkillByName = vi.fn();

vi.mock("../../store", () => ({
  useSkillStore: vi.fn(() => ({
    availableSkills: [],
    importedSkills: [],
    selectedSkillName: null,
    isScanning: false,
    selectSkillByName: mockSelectSkillByName,
    rescanSkills: mockRescanSkills,
  })),
}));

describe("SkillSelector 無限ループ防止", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rescanSkillsが意図しない再実行をしない", () => {
    const { rerender: rerenderComponent } = render(<SkillSelector />);

    // 自動的にrescanSkillsが呼ばれないことを確認
    expect(mockRescanSkills).not.toHaveBeenCalled();

    // 複数回再レンダリング
    rerenderComponent(<SkillSelector />);
    rerenderComponent(<SkillSelector />);

    // 依然として呼ばれない
    expect(mockRescanSkills).not.toHaveBeenCalled();
  });

  it("再スキャンボタンをクリックしたときのみrescanSkillsが呼ばれる", async () => {
    render(<SkillSelector />);

    // ドロップダウンを開く
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // 再スキャンボタンをクリック
    const rescanButton = screen.getByRole("button", { name: /再スキャン/ });
    fireEvent.click(rescanButton);

    // 1回だけ呼ばれる
    expect(mockRescanSkills).toHaveBeenCalledTimes(1);
  });
});
```

## 4. テスト実行コマンド

```bash
# SettingsView テスト
pnpm --filter @repo/desktop test -- --run SettingsView

# LLMSelectorPanel テスト
pnpm --filter @repo/desktop test -- --run LLMSelectorPanel

# SkillSelector テスト
pnpm --filter @repo/desktop test -- --run SkillSelector

# 全テスト
pnpm --filter @repo/desktop test -- --run
```

## 5. 完了条件

- [ ] SettingsView の無限ループ防止テストが追加されている
- [ ] LLMSelectorPanel の無限ループ防止テストが追加されている
- [ ] SkillSelector の無限ループ防止テストが追加されている
- [ ] テストが実行可能（ただし、現時点では FAIL することを確認 - Red フェーズ）

## 6. 次Phase

Phase 5（実装）へ進む。テストがRed（失敗）状態であることを確認後、実装を行う。
