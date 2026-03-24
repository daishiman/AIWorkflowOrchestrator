# Phase 4: Mock 戦略

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 4                                              |
| 作成日   | 2026-03-24                                     |

## 1. テスト環境

### 環境設定

| 項目                   | 設定値                                           | 根拠                                              |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------- |
| テスト環境             | happy-dom                                        | P39 準拠: jsdom ではなく happy-dom                |
| イベント発火           | fireEvent                                        | P39 準拠: userEvent 禁止（happy-dom 非互換）      |
| 非同期ハンドラ         | `await act(async () => { fireEvent.click(el) })` | P39 準拠: act() でラップ                          |
| テスト実行ディレクトリ | `apps/desktop/`                                  | P40 準拠: vitest.config.ts の環境設定が適用される |

### 実行コマンド (P40 準拠)

```bash
# 正しい: apps/desktop/ ディレクトリから実行
cd apps/desktop && pnpm vitest run src/renderer/__tests__/executionConsole.route.test.tsx

# 間違い: プロジェクトルートから実行 (happy-dom 設定が適用されない)
# pnpm vitest run apps/desktop/src/renderer/__tests__/executionConsole.route.test.tsx
```

---

## 2. useAppStore Mock

### 基本戦略

既存テスト (`ChatPanel.test.tsx`) のパターンに準拠し、selector-based mock を使用する。

```typescript
// 共通パターン: state object + selector 関数呼び出し
const mockSetCurrentView = vi.fn();

let mockStoreState: Record<string, unknown> = {};

vi.mock("../../store", () => ({
  useAppStore: Object.assign(
    vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
      return selector(mockStoreState);
    }),
    {
      // openExecutionConsole() が useAppStore.getState() を呼ぶため
      getState: vi.fn(() => mockStoreState),
    },
  ),
  useSetCurrentView: vi.fn(() => mockSetCurrentView),
  useCurrentView: vi.fn(() => mockStoreState.currentView ?? "dashboard"),
  useResponsiveMode: vi.fn(() => "desktop"),
  // 必要に応じて追加
  useSelectedProviderId: vi.fn(() => mockStoreState.selectedProviderId ?? null),
  useSelectedModelId: vi.fn(() => mockStoreState.selectedModelId ?? null),
  useSelectProvider: vi.fn(() => vi.fn()),
  useSelectModel: vi.fn(() => vi.fn()),
  useIsSkillExecuting: vi.fn(() => false),
  useDynamicIsland: vi.fn(() => ({
    visible: false,
    status: "completed",
    message: "",
  })),
}));
```

### State 切り替えパターン

テストケースごとに `mockStoreState` を書き換えて状態を制御する。

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  mockStoreState = {
    currentView: "dashboard",
    setCurrentView: mockSetCurrentView,
    // ChatPanel 用
    chatPanelStatus: "idle",
    resolvedCapability: "integratedRuntime",
    chatMessages: [],
    chatInput: "",
    setChatInput: vi.fn(),
    selectedProviderId: "anthropic",
    selectedModelId: "claude-3-opus",
    providers: [],
    handoffGuidance: null,
    selectedSkillName: null,
    streamingMessages: [],
    skillExecutionStatus: "idle",
    fetchSkills: vi.fn(),
  };
});
```

### handoff 状態の再現 (C-01, N-01)

```typescript
// handoff 状態: chatPanelStatus + handoffGuidance を設定
mockStoreState = {
  ...mockStoreState,
  chatPanelStatus: "handoff",
  handoffGuidance: {
    contextSummary: "テスト用 handoff ガイダンス",
    terminalCommand: "claude --continue",
  },
};
```

---

## 3. openExecutionConsole Action Mock

### 戦略: モジュール mock

`openExecutionConsole()` は `useAppStore.getState().setCurrentView("executionConsole")` を内部で呼ぶため、2 つのレベルで検証する。

#### Level 1: Action 単体テスト

```typescript
// actions/executionConsole.test.ts
import { openExecutionConsole } from "../actions/executionConsole";
import { useAppStore } from "../store";

vi.mock("../store", () => ({
  useAppStore: {
    getState: vi.fn(() => ({
      setCurrentView: vi.fn(),
    })),
  },
}));

it("openExecutionConsole が setCurrentView('executionConsole') を呼ぶ", () => {
  const mockSetCurrentView = vi.fn();
  vi.mocked(useAppStore.getState).mockReturnValue({
    setCurrentView: mockSetCurrentView,
  } as unknown as ReturnType<typeof useAppStore.getState>);

  openExecutionConsole();

  expect(mockSetCurrentView).toHaveBeenCalledWith("executionConsole");
});
```

#### Level 2: CTA 統合テスト

CTA テスト群では `openExecutionConsole` をモジュール mock する。

```typescript
const mockOpenExecutionConsole = vi.fn();

vi.mock("../../actions/executionConsole", () => ({
  openExecutionConsole: (...args: unknown[]) =>
    mockOpenExecutionConsole(...args),
}));
```

---

## 4. createGuidanceActionDispatcher Mock

### 戦略: 実モジュール使用 + handler spy

`modelSelectionGuidance.ts` の定数テスト (C-07, L-03, N-02, N-03) は実モジュールを import して検証する。Mock は不要。

```typescript
// guidance/__tests__/modelSelectionGuidance.test.ts
import {
  MODEL_SELECTION_BLOCKED_GUIDANCE_MAP,
  createGuidanceActionDispatcher,
  type GuidanceActionHandlers,
} from "../modelSelectionGuidance";

describe("MODEL_SELECTION_BLOCKED_GUIDANCE_MAP", () => {
  it("C-07: secondaryAction.type が open-execution-console である", () => {
    expect(
      MODEL_SELECTION_BLOCKED_GUIDANCE_MAP.NO_PROVIDER.secondaryAction.type,
    ).toBe("open-execution-console");
    expect(
      MODEL_SELECTION_BLOCKED_GUIDANCE_MAP.NO_MODEL.secondaryAction.type,
    ).toBe("open-execution-console");
  });
});
```

### Dispatcher 統合テスト

```typescript
it("N-03: openExecutionConsole handler が dispatcher で解決される", () => {
  const mockOpenExecutionConsole = vi.fn();

  const resolveAction = createGuidanceActionDispatcher({
    openSettings: vi.fn(),
    openExecutionConsole: mockOpenExecutionConsole,
  });

  const action = resolveAction("open-execution-console");
  action?.();

  expect(mockOpenExecutionConsole).toHaveBeenCalledTimes(1);
});
```

---

## 5. コンポーネント Mock

### 子コンポーネント mock 方針

| コンポーネント         | Mock 方針                | 理由                                 |
| ---------------------- | ------------------------ | ------------------------------------ |
| `ExecutionConsoleView` | data-testid stub         | R-02 では描画有無のみ検証            |
| `RuntimeBanner`        | data-testid + props 透過 | CTA テストの対象外                   |
| `LLMSelectorPanel`     | data-testid stub         | CTA テストの対象外                   |
| `SkillSelector`        | data-testid stub         | CTA テストの対象外                   |
| `ChatMessageList`      | data-testid stub         | CTA テストの対象外                   |
| `ErrorGuidance`        | data-testid stub         | CTA テストの対象外                   |
| `HandoffBlock`         | **実コンポーネント**     | C-04, L-01 のテスト対象              |
| `ComposerArea`         | data-testid stub         | CTA テストの対象外                   |
| `GuidanceBlock`        | **実コンポーネント**     | C-03 で secondaryAction click を検証 |

### Mock テンプレート

```typescript
vi.mock("../../components/chat/ChatMessageList", () => ({
  ChatMessageList: () => <div data-testid="mock-chat-message-list" />,
}));

vi.mock("../../components/chat/ComposerArea", () => ({
  ComposerArea: () => <div data-testid="mock-composer-area" />,
}));
```

---

## 6. Import パス注意点 (P40/P63 準拠)

### P40: 実行ディレクトリ依存

全テストは `apps/desktop/` から実行する。`vitest.config.ts` の `resolve.alias` (`@` -> `src`) が適用されるため、テストファイル内の import は以下の形式を使用する。

```typescript
// OK: 相対パス (テストファイルからの相対)
import { HandoffBlock } from "../HandoffBlock";
import { openExecutionConsole } from "../../../actions/executionConsole";

// OK: エイリアス (vitest.config.ts で解決)
import { openExecutionConsole } from "@/renderer/actions/executionConsole";
```

### P63: 既存テストの import パス参照

新規テストファイル作成時は、同ディレクトリの既存テストの import パスを必ず参照する。

```bash
# 参照コマンド: 既存テストの import パスを確認
grep -n "^import" apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx | head -20
grep -n "^import" apps/desktop/src/renderer/views/WorkspaceView/components/__tests__/GuidanceBlock.test.tsx | head -10
```

### vi.mock パスの注意

`vi.mock()` のパスは**テストファイルからの相対パス**ではなく、**テスト対象ファイルの import パスと一致**させる必要がある。

```typescript
// テスト対象ファイル (ChatPanel.tsx) の import:
// import { useAppStore } from "../../store";

// テストファイル (__tests__/ChatPanel.test.tsx) の vi.mock:
vi.mock("../../../store", () => ({ ... }));
//       ^^^ テストファイルからの相対パス（ChatPanel.tsx からではない）
```

---

## 7. テストファイル一覧と Mock 依存関係

| テストファイル                                            | Store Mock | Action Mock | Component Mock            | 実モジュール           |
| --------------------------------------------------------- | ---------- | ----------- | ------------------------- | ---------------------- |
| `__tests__/executionConsole.route.test.tsx`               | 必要       | 不要        | ExecutionConsoleView stub | types.ts               |
| `__tests__/executionConsole.cta.test.tsx`                 | 必要       | 必要        | 複数 stub                 | -                      |
| `chat/__tests__/HandoffBlock.test.tsx`                    | 不要       | 不要        | 不要                      | HandoffBlock           |
| `chat/__tests__/ChatPanel.executionConsole.test.tsx`      | 必要       | 必要        | 複数 stub                 | -                      |
| `organisms/TerminalHandoffCard/__tests__/*.test.tsx`      | 不要       | 不要        | 不要                      | TerminalHandoffCard    |
| `organisms/AppLayout/__tests__/TerminalLauncher.test.tsx` | 不要       | 不要        | 不要                      | TerminalLauncher       |
| `guidance/__tests__/modelSelectionGuidance.test.ts`       | 不要       | 不要        | 不要                      | modelSelectionGuidance |
