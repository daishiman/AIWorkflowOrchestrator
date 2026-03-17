# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001                                                                                   |
| Phase      | 4 - テスト作成                                                                                                                |
| 前 Phase   | Phase 3 - 設計レビュー（PASS）                                                                                                |
| 次 Phase   | Phase 5 - 実装                                                                                                                |
| 依存成果物 | `phase-2-design.md`（設計スニペット）、`phase-3-design-review.md`（レビュー結果）                                             |
| 成果物パス | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-4-test-creation.md` |
| ステータス | not_started                                                                                                                   |

## 目的

テストファーストの原則に従い、Phase 5 の実装前にテストコードを作成する。実装が存在しない段階でテストを書き（Red フェーズ）、Phase 5 の実装後に全テストが PASS することを目標とする。

対象テストの範囲:

1. `store/types.ts` - ViewType union に `"skillAnalysis"` と `"skillCreate"` が含まれることの型レベル検証
2. `App.tsx` - renderView() の新 case が正しいコンポーネントを返すことの動作検証
3. `navigation/skillLifecycleJourney.ts` - SkillLifecycleJobGuide 型に `onAction?` が追加された後の互換性検証

## 実行タスク

### Task 1: 事前確認（Phase 4 開始前チェック）

**App.tsx の import 副作用チェック:**

以下を確認してから作業に入る。

```bash
# SkillAnalysisView と SkillCreateWizard が既に App.tsx に import されているか確認
grep -n "SkillAnalysisView\|SkillCreateWizard" apps/desktop/src/renderer/App.tsx
```

確認結果（Phase 2 設計時に調査済み）:

- L41: `import { SkillAnalysisView, SkillCreateWizard } from "./components/skill";` が既に存在
- テスト作成時にモック追加が必要

---

### Task 2: `store/types.test.ts` への ViewType テスト追加

既存の `apps/desktop/src/renderer/store/types.test.ts` に以下のテストを追加する。

**追加位置:** ファイル末尾

**追加するテストコード:**

```typescript
describe("ViewType 型 - skillAnalysis / skillCreate 追加（TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001）", () => {
  it("TC-VT-01: skillAnalysis が ViewType union に含まれること", () => {
    // TypeScript のコンパイル時型チェックが通ることを実行時に検証
    const validViewTypes: import("./types").ViewType[] = ["skillAnalysis"];
    expect(validViewTypes).toContain("skillAnalysis");
  });

  it("TC-VT-02: skillCreate が ViewType union に含まれること", () => {
    const validViewTypes: import("./types").ViewType[] = ["skillCreate"];
    expect(validViewTypes).toContain("skillCreate");
  });

  it("TC-VT-03: 既存の ViewType member が引き続き有効であること", () => {
    const existingViewTypes: import("./types").ViewType[] = [
      "dashboard",
      "workspace",
      "editor",
      "chat",
      "graph",
      "settings",
      "agent",
      "skillCenter",
      "historySearch",
      "chainBuilder",
      "scheduleManager",
      "debugPanel",
      "analyticsDashboard",
      "skill-editor",
      "skill-center",
    ];
    expect(existingViewTypes).toHaveLength(15);
  });

  it("TC-VT-04: ViewType union が合計 17 member を持つこと", () => {
    // 既存 15 + 新規 2 = 17
    const allViewTypes: import("./types").ViewType[] = [
      "dashboard",
      "workspace",
      "editor",
      "chat",
      "graph",
      "settings",
      "agent",
      "skillCenter",
      "historySearch",
      "chainBuilder",
      "scheduleManager",
      "debugPanel",
      "analyticsDashboard",
      "skill-editor",
      "skill-center",
      "skillAnalysis",
      "skillCreate",
    ];
    expect(allViewTypes).toHaveLength(17);
  });
});
```

---

### Task 3: `App.test.tsx` への renderView case テスト追加

既存の `apps/desktop/src/renderer/__tests__/App.debug-removal.test.tsx` のモック構成を参考にして、新規テストファイル `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx` を作成する。

**注意:** 既存 `App.debug-removal.test.tsx` は動的 import（`await import("@/renderer/App")`）を使用している。新テストでも同じパターンを踏襲する。

**新規テストファイルのコード:**

```typescript
/**
 * @file App.tsx renderView() - skillAnalysis / skillCreate case 検証
 * @description TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001
 *
 * renderView() に追加した 2 case が正しいコンポーネントを返すことを検証する。
 * - TC-RV-01: skillAnalysis case が SkillAnalysisView を描画すること (AC-2)
 * - TC-RV-02: skillCreate case が SkillCreateWizard を描画すること (AC-3)
 * - TC-RV-03: 既存の case（dashboard / skillCenter 等）が引き続き正しく描画されること (AC-5)
 * - TC-RV-04: 未知の ViewType で ComingSoonView（フォールバック）が描画されること
 *
 * @see .claude/rules/06-known-pitfalls.md#P39 (happy-dom: fireEvent使用)
 * @see .claude/rules/06-known-pitfalls.md#P9 (テスト間状態リセット)
 */

import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// --- Store モック ---
const mockInitializeAuth = vi.fn();
const mockSetCurrentView = vi.fn();
const mockGoBack = vi.fn();
const mockSetWindowSize = vi.fn();
const mockSetCurrentSkillName = vi.fn();
let mockCurrentView = "dashboard";
let mockCurrentSkillName: string | null = null;

vi.mock("@/renderer/store", () => ({
  useAppStore: vi.fn(
    (selector: (state: Record<string, unknown>) => unknown) => {
      const mockState: Record<string, unknown> = {
        initializeAuth: mockInitializeAuth,
        isAuthenticated: false,
        isLoading: false,
        themeMode: "system",
        setThemeMode: vi.fn(),
        updateUserProfile: vi.fn(),
        userProfile: { name: "Test User" },
        setCurrentView: mockSetCurrentView,
        goBack: mockGoBack,
        viewHistory: ["dashboard"],
        currentSkillName: mockCurrentSkillName,
        setCurrentSkillName: mockSetCurrentSkillName,
        dynamicIsland: { status: "idle", message: "", visible: false },
        setWindowSize: mockSetWindowSize,
      };
      return selector(mockState);
    },
  ),
  useCurrentView: vi.fn(() => mockCurrentView),
  useResponsiveMode: vi.fn(() => "desktop"),
}));

vi.mock("@/renderer/hooks/useThemeInitializer", () => ({
  useThemeInitializer: vi.fn(),
}));

vi.mock("@/renderer/hooks/useNavShortcuts", () => ({
  useNavShortcuts: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "browser-router" }, children),
  Routes: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "routes" }, children),
  Route: ({ element, path }: { element: React.ReactNode; path?: string }) => {
    // path="*" のみレンダリングする（catch-all route）
    if (path === "*" || path === undefined) {
      return React.createElement(
        "div",
        { "data-testid": `route-${path ?? "unknown"}` },
        element,
      );
    }
    return null;
  },
}));

vi.mock("@/renderer/components/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "auth-guard" }, children),
}));

vi.mock("@/renderer/components/organisms/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "app-layout" }, children),
}));

vi.mock("@/renderer/components/organisms/NotificationCenter", () => ({
  NotificationCenter: () => React.createElement("div"),
}));

vi.mock("@/renderer/components/molecules/DynamicIsland", () => ({
  DynamicIsland: () => React.createElement("div"),
}));

vi.mock("@/renderer/components/organisms/OnboardingWizard", () => ({
  OnboardingWizard: () => null,
  ONBOARDING_STORE_KEYS: {
    hasCompleted: "hasCompleted",
    userName: "userName",
    selectedStarterTool: "selectedStarterTool",
    lastCompletedAt: "lastCompletedAt",
  },
  isOnboardingStarterToolId: vi.fn(() => false),
}));

// --- View / Component モック ---
const mockComponent = (name: string) => () =>
  React.createElement("div", { "data-testid": name });

vi.mock("@/renderer/components/atoms", () => ({
  ComingSoonView: ({ title }: { title?: string }) =>
    React.createElement("div", { "data-testid": "coming-soon" }, title),
}));
vi.mock("@/renderer/components/organisms/AppDock", () => ({
  AppDock: mockComponent("app-dock"),
}));
vi.mock("@/renderer/views/DashboardView", () => ({
  DashboardView: mockComponent("dashboard-view"),
}));
vi.mock("@/renderer/views/EditorView", () => ({
  EditorView: mockComponent("editor-view"),
}));
vi.mock("@/renderer/views/ChatView", () => ({
  ChatView: mockComponent("chat-view"),
}));
vi.mock("@/renderer/views/GraphView", () => ({
  GraphView: mockComponent("graph-view"),
}));
vi.mock("@/renderer/views/SettingsView", () => ({
  SettingsView: mockComponent("settings-view"),
}));
vi.mock("@/renderer/views/AgentView", () => ({
  AgentView: mockComponent("agent-view"),
}));
vi.mock("@/renderer/components/skill/SkillManagementPanel", () => ({
  SkillManagementPanel: mockComponent("skill-management"),
}));
vi.mock("@/renderer/views/SkillChainBuilder", () => ({
  SkillChainBuilder: mockComponent("skill-chain-builder"),
}));
vi.mock("@/renderer/views/ScheduleManager", () => ({
  ScheduleManager: mockComponent("schedule-manager"),
}));
vi.mock("@/renderer/views/DebugPanel", () => ({
  DebugPanel: mockComponent("debug-panel"),
}));
vi.mock("@/renderer/views/AnalyticsDashboard", () => ({
  AnalyticsDashboard: mockComponent("analytics-dashboard"),
}));
vi.mock("@/renderer/views/ChatHistoryView", () => ({
  ChatHistoryView: mockComponent("chat-history"),
}));
vi.mock("@/renderer/views/HistorySearchView", () => ({
  HistorySearchView: mockComponent("history-search"),
}));
vi.mock("@/renderer/views/SkillCenterView", () => ({
  SkillCenterView: mockComponent("skill-center-view"),
}));
vi.mock("@/renderer/views/ConcurrencyGuardReviewHarness", () => ({
  ConcurrencyGuardReviewHarness: mockComponent("concurrency-guard"),
}));
vi.mock("@/renderer/views/SkillEditorView", () => ({
  SkillEditorView: mockComponent("skill-editor-view"),
}));
vi.mock("@/renderer/views/UIDesignFoundationPreview", () => ({
  UIDesignFoundationPreview: mockComponent("ui-design-foundation"),
}));
vi.mock("@/renderer/views/WorkspaceView", () => ({
  WorkspaceView: mockComponent("workspace-view"),
}));
vi.mock("@/renderer/views/OrganismsShowcaseView", () => ({
  OrganismsShowcaseView: mockComponent("organisms-showcase"),
}));
vi.mock("@/renderer/pages/HistoryPage", () => ({
  HistoryPage: mockComponent("history-page"),
}));
vi.mock("@/renderer/pages/AgentSDKPage", () => ({
  AgentSDKPage: mockComponent("agent-sdk-page"),
}));

// --- SkillAnalysisView / SkillCreateWizard モック（検証対象） ---
vi.mock("@/renderer/components/skill", () => ({
  SkillAnalysisView: ({
    skillName,
    onClose,
  }: {
    skillName: string;
    onClose: () => void;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "skill-analysis-view", "data-skill-name": skillName },
      React.createElement(
        "button",
        { "data-testid": "skill-analysis-close", onClick: onClose },
        "close",
      ),
    ),
  SkillCreateWizard: ({ onClose }: { onClose: () => void }) =>
    React.createElement(
      "div",
      { "data-testid": "skill-create-wizard" },
      React.createElement(
        "button",
        { "data-testid": "skill-create-close", onClick: onClose },
        "close",
      ),
    ),
}));

vi.mock("@/renderer/i18n/config", () => ({}));

// --- テスト本体 ---
describe("App renderView() - skillAnalysis / skillCreate case (TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentSkillName = null;
  });

  afterEach(() => {
    cleanup();
  });

  it("TC-RV-01: currentView が skillAnalysis のとき SkillAnalysisView が描画されること (AC-2)", async () => {
    mockCurrentView = "skillAnalysis";
    mockCurrentSkillName = "my-test-skill";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue(
      "skillAnalysis",
    );
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: "my-test-skill",
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    expect(screen.getByTestId("skill-analysis-view")).toBeTruthy();
    expect(
      screen.getByTestId("skill-analysis-view").getAttribute("data-skill-name"),
    ).toBe("my-test-skill");
  });

  it("TC-RV-01b: skillAnalysis で currentSkillName が null のとき demo-skill をフォールバックとして渡すこと", async () => {
    mockCurrentView = "skillAnalysis";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue(
      "skillAnalysis",
    );
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: null,
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    const analysisView = screen.getByTestId("skill-analysis-view");
    expect(analysisView.getAttribute("data-skill-name")).toBe("demo-skill");
  });

  it("TC-RV-02: currentView が skillCreate のとき SkillCreateWizard が描画されること (AC-3)", async () => {
    mockCurrentView = "skillCreate";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("skillCreate");
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: null,
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    expect(screen.getByTestId("skill-create-wizard")).toBeTruthy();
  });

  it("TC-RV-03: currentView が dashboard のとき DashboardView が引き続き描画されること (AC-5)", async () => {
    mockCurrentView = "dashboard";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("dashboard");
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: null,
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    expect(screen.getByTestId("dashboard-view")).toBeTruthy();
  });
});
```

---

### Task 4: `skillLifecycleJourney.test.ts` への onAction 互換性テスト追加

既存の `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts` に以下のテストを追加する。

**追加位置:** `describe("skillLifecycleJourney", ...)` ブロック内の末尾

**追加するテストコード:**

```typescript
it("TC-SL-01: SkillLifecycleJobGuide 型が onAction?: () => void を受け入れること (AC-4)", () => {
  // TypeScript の型チェックが通ることを実行時に検証
  const guideWithAction: SkillLifecycleJobGuide = {
    id: "create",
    title: "テスト",
    entryLabel: "テストエントリ",
    handoffLabel: "テストハンドオフ",
    summary: "テストサマリー",
    completion: "テスト完了",
    onAction: () => {
      // CTA コールバック
    },
  };
  expect(guideWithAction.onAction).toBeTypeOf("function");
});

it("TC-SL-02: SkillLifecycleJobGuide 型で onAction を省略できること (AC-4)", () => {
  const guideWithoutAction: SkillLifecycleJobGuide = {
    id: "use",
    title: "テスト",
    entryLabel: "テストエントリ",
    handoffLabel: "テストハンドオフ",
    summary: "テストサマリー",
    completion: "テスト完了",
    // onAction を省略
  };
  expect(guideWithoutAction.onAction).toBeUndefined();
});

it("TC-SL-03: 既存の SKILL_LIFECYCLE_JOB_GUIDES 定数が onAction なしで有効であること (AC-4)", () => {
  // as const 定数が onAction フィールドを省略しても型エラーにならないことを確認
  SKILL_LIFECYCLE_JOB_GUIDES.forEach((guide) => {
    expect(guide.onAction).toBeUndefined();
  });
});

it("TC-SL-04: normalizeSkillLifecycleView が skillAnalysis を変換せず返すこと (AC-6)", () => {
  // 新 ViewType が normalize 関数を通過して変換されないことを確認
  // ※ 実装後に PASS するテスト（Phase 5 の実装確認用）
  expect(
    normalizeSkillLifecycleView(
      "skillAnalysis" as import("../store/types").ViewType,
    ),
  ).toBe("skillAnalysis");
});

it("TC-SL-05: normalizeSkillLifecycleView が skillCreate を変換せず返すこと (AC-6)", () => {
  expect(
    normalizeSkillLifecycleView(
      "skillCreate" as import("../store/types").ViewType,
    ),
  ).toBe("skillCreate");
});
```

**注意:** `SkillLifecycleJobGuide` 型を import するために既存の import 文を更新する。

```typescript
// 追加する import
import type { SkillLifecycleJobGuide } from "./skillLifecycleJourney";
```

---

## 参照資料

### タスク関連

| 資料名                            | パス                                                                 | 説明                             |
| --------------------------------- | -------------------------------------------------------------------- | -------------------------------- |
| Phase 2 設計                      | `phase-2-design.md`                                                  | 設計スニペット・影響範囲テーブル |
| 既存 ViewType テスト              | `apps/desktop/src/renderer/store/types.test.ts`                      | 追加対象の既存テストファイル     |
| 既存 App テスト（モック構成参考） | `apps/desktop/src/renderer/__tests__/App.debug-removal.test.tsx`     | モック構成のリファレンス         |
| 既存 skillLifecycleJourney テスト | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts` | 追加対象の既存テストファイル     |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                              | 説明                                         |
| -------------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| ナビゲーションUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | ViewType一覧・Global Navigation設計          |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Zustand Store・ViewType状態管理              |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                                | カバレッジ基準・TDD設計                      |
| 既知の落とし穴 P39   | `.claude/rules/06-known-pitfalls.md#P39`                                          | happy-dom 環境では fireEvent を使用          |
| 既知の落とし穴 P40   | `.claude/rules/06-known-pitfalls.md#P40`                                          | テスト実行は対象パッケージのディレクトリから |
| 既知の落とし穴 P9    | `.claude/rules/06-known-pitfalls.md#P9`                                           | テスト間で状態を共有しない                   |

## 実行手順

1. `apps/desktop/src/renderer/store/types.test.ts` を Read して現在の内容を確認する
2. Task 2 のコードを `types.test.ts` の末尾に追加する（Phase 5 実装前は型エラーで Red）
3. `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx` を新規作成する（Task 3）
4. `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts` を Read して現在の内容を確認する
5. Task 4 のコードを `skillLifecycleJourney.test.ts` の既存 describe ブロック末尾に追加する
6. テストを実行して Red 状態（実装前のため失敗）であることを確認する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/store/types.test.ts src/renderer/__tests__/App.renderView.viewtype.test.tsx src/renderer/navigation/skillLifecycleJourney.test.ts
   ```
7. Red 状態を記録して Phase 5 に引き継ぐ

## 統合テスト連携

Phase 5 の実装完了後、以下のコマンドで全テストが Green になることを確認する:

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/types.test.ts src/renderer/__tests__/App.renderView.viewtype.test.tsx src/renderer/navigation/skillLifecycleJourney.test.ts
```

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 成果物

| 成果物                           | パス                                                                         | 種別         |
| -------------------------------- | ---------------------------------------------------------------------------- | ------------ |
| ViewType テスト追加              | `apps/desktop/src/renderer/store/types.test.ts`（追記）                      | テストコード |
| App renderView テスト新規作成    | `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx`       | テストコード |
| skillLifecycleJourney テスト追加 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts`（追記） | テストコード |

## 完了条件

- [ ] `apps/desktop/src/renderer/store/types.test.ts` に TC-VT-01〜TC-VT-04 の 4 テストが追加されている
- [ ] `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx` が新規作成されており TC-RV-01〜TC-RV-03 の 4 テストが含まれている
- [ ] `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts` に TC-SL-01〜TC-SL-05 の 5 テストが追加されている
- [ ] Phase 5 実装前の段階でテストが Red（失敗）であることが確認されている
- [ ] `SkillLifecycleJobGuide` の import 文が skillLifecycleJourney.test.ts に追加されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 4
```

## 次のPhase

Phase 5 - 実装（`phase-5-implementation.md`）
