# Phase 4: テスト作成

## メタ情報

| 項目          | 内容                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 4                                                                                                                             |
| 機能名        | WorkspaceChatPanelへのインラインモデルセレクタ配置 (TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION)                             |
| 作成日        | 2026-03-21                                                                                                                    |
| 更新日        | 2026-03-23                                                                                                                    |
| 担当          | -                                                                                                                             |
| ステータス    | 完了                                                                                                                          |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-3-design-review.md` |

## 目的

WorkspaceChatPanelにInlineModelSelectorが正しく配置・連動することを検証する統合テストをTDDサイクルに従い先に作成し、Red状態（テスト失敗）から始める。

## 実行タスク

### タスク1: テスト対象ファイルの確認

P63対策として、既存テストファイルのインポートパスを参照してからテストを作成する。

```bash
# WorkspaceChatPanel 関連の既存テストを確認
find apps/desktop/src/renderer/views/WorkspaceView/__tests__ -name "WorkspaceChatPanel*"

# 既存テストのインポートパス確認（P63対策）
grep -n "^import" apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx
grep -n "^import" apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.runtime.test.tsx

# InlineModelSelectorコンポーネントのexport確認（Task 01成果物）
grep -n "export.*InlineModelSelector" apps/desktop/src/renderer/components/llm/index.ts
```

**既存テストパターン（参照必須）**:

- `WorkspaceChatPanel.guidance.test.tsx`: `createMockController()` ファクトリでモックcontroller生成
- `WorkspaceChatPanel.runtime.test.tsx`: `mockController` オブジェクトでモック
- **Props**: `{ controller: WorkspaceChatController }` のみ
- **GuidanceBlock testid**: `"workspace-guidance-block"`（`"guidance-block-blocked"` ではない）
- **Store mock**: `vi.mock("@/renderer/store", ...)` で `useSetCurrentView` 等を提供

### タスク2: 統合テストケースの設計

**テストファイル**: `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx`

**テストケース一覧**:

| ID  | テスト名                                                                   | 分類   |
| --- | -------------------------------------------------------------------------- | ------ |
| I-1 | WorkspaceChatPanelの上部にInlineModelSelector(compact)が表示される         | 正常系 |
| I-2 | blockedReason=nullの場合にGuidanceBlockが非表示になる                      | 正常系 |
| I-3 | blockedReason="NO_MODEL"の場合にGuidanceBlockが表示される                  | 正常系 |
| I-4 | blockedReason=null（モデル選択済み）でチャット入力が有効化される           | 正常系 |
| I-5 | controller.isStreaming=trueの場合にInlineModelSelectorがdisabled状態になる | 正常系 |
| I-6 | controller.blockedReasonの変化でGuidanceBlockの表示が切り替わる            | 正常系 |

**テストコード例（happy-dom環境でのfireEvent使用、P39準拠）**:

```typescript
/**
 * WorkspaceChatPanel InlineModelSelector統合テスト
 *
 * P39 準拠: happy-dom 環境では fireEvent を使用
 * P63 準拠: 既存テスト WorkspaceChatPanel.guidance.test.tsx のインポートパスを参照
 * P9  準拠: beforeEach で全 mock をリセット
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { WorkspaceChatController } from "../hooks/useWorkspaceChatController";
import type { ModelSelectionBlockedReason } from "@/renderer/guidance/modelSelectionGuidance";

// ---------------------------------------------------------------------------
// Mock: store（InlineModelSelectorが使用するStore Hooks）
// ---------------------------------------------------------------------------
const mockSetCurrentView = vi.fn();
const mockFetchProviders = vi.fn();
const mockSelectProvider = vi.fn();
const mockSelectModel = vi.fn();
const mockCheckLLMHealth = vi.fn();

vi.mock("@/renderer/store", () => ({
  useSetCurrentView: () => mockSetCurrentView,
  useLLMProviders: () => [],
  useSelectedProviderId: () => null,
  useSelectedModelId: () => null,
  useLLMHealthStatus: () => "unknown",
  useFetchProviders: () => mockFetchProviders,
  useSelectProvider: () => mockSelectProvider,
  useSelectModel: () => mockSelectModel,
  useCheckLLMHealth: () => mockCheckLLMHealth,
}));

// ---------------------------------------------------------------------------
// Mock: WorkspaceChatController ファクトリ
// （既存テスト WorkspaceChatPanel.guidance.test.tsx のパターンを踏襲）
// ---------------------------------------------------------------------------
const createMockController = (
  overrides: Partial<WorkspaceChatController> = {},
): WorkspaceChatController => ({
  messages: [],
  input: "",
  isSending: false,
  isStreaming: false,
  streamContent: "",
  errorMessage: null,
  selectedFiles: [],
  selectedFilePath: null,
  selectedModelId: null,
  blockedReason: null as ModelSelectionBlockedReason | null,
  pendingCursorPosition: null,
  mention: {
    isOpen: false,
    options: [],
    highlightedIndex: 0,
    mentionStart: -1,
    mentionEnd: -1,
    query: "",
    moveHighlight: vi.fn(),
    setHighlightedIndex: vi.fn(),
    reset: vi.fn(),
  },
  setInputValue: vi.fn(),
  clearPendingCursorPosition: vi.fn(),
  applySuggestion: vi.fn(),
  sendMessage: vi.fn().mockResolvedValue(undefined),
  cancelStream: vi.fn().mockResolvedValue(undefined),
  removeSelectedFile: vi.fn(),
  attachSelectedFile: vi.fn(),
  handleComposerKeyDown: vi.fn().mockResolvedValue(undefined),
  selectMentionAtIndex: vi.fn().mockResolvedValue(undefined),
  openMentionPreviewAtIndex: vi.fn(),
  streamingError: null,
  retryLastMessage: vi.fn().mockResolvedValue(undefined),
  dismissStreamingError: vi.fn(),
  ...overrides,
});

// ---------------------------------------------------------------------------
// Import: テスト対象（vi.mock の後に import）
// ---------------------------------------------------------------------------
import { WorkspaceChatPanel } from "../WorkspaceChatPanel";

describe("WorkspaceChatPanel InlineModelSelector統合テスト", () => {
  beforeEach(() => {
    // P9: テスト間で状態を共有しない
    vi.clearAllMocks();
  });

  it("I-1: WorkspaceChatPanel上部にInlineModelSelector(compact)が表示される", () => {
    const controller = createMockController({ selectedModelId: "gpt-4o", blockedReason: null });
    render(<WorkspaceChatPanel controller={controller} />);
    // InlineModelSelectorはcomboboxロールで検出可能
    const selector = screen.getByRole("combobox");
    expect(selector).toBeInTheDocument();
  });

  it("I-2: blockedReason=nullの場合にGuidanceBlockが非表示になる", () => {
    const controller = createMockController({ selectedModelId: "gpt-4o", blockedReason: null });
    render(<WorkspaceChatPanel controller={controller} />);
    expect(screen.queryByTestId("workspace-guidance-block")).not.toBeInTheDocument();
  });

  it("I-3: blockedReason='NO_MODEL'の場合にGuidanceBlockが表示される", () => {
    const controller = createMockController({ selectedModelId: null, blockedReason: "NO_MODEL" });
    render(<WorkspaceChatPanel controller={controller} />);
    expect(screen.getByTestId("workspace-guidance-block")).toBeInTheDocument();
  });

  it("I-4: blockedReason=null（モデル選択済み）でチャット入力エリアが操作可能", () => {
    const controller = createMockController({ selectedModelId: "gpt-4o", blockedReason: null });
    render(<WorkspaceChatPanel controller={controller} />);
    // GuidanceBlockが非表示 = ブロック解除済み
    expect(screen.queryByTestId("workspace-guidance-block")).not.toBeInTheDocument();
  });

  it("I-5: controller.isStreaming=trueの場合にInlineModelSelectorがdisabled", () => {
    const controller = createMockController({
      selectedModelId: "gpt-4o",
      blockedReason: null,
      isStreaming: true,
    });
    render(<WorkspaceChatPanel controller={controller} />);
    // InlineModelSelectorに disabled prop が渡されていることを確認
    // SelectorTriggerは disabled HTML属性をbutton要素に直接付与する
    const selector = screen.getByRole("combobox");
    expect(selector).toBeDisabled();
  });

  it("I-6: controller.blockedReasonの変化でGuidanceBlockの表示が切り替わる", () => {
    const blockedController = createMockController({
      selectedModelId: null,
      blockedReason: "NO_MODEL",
    });
    const { rerender } = render(<WorkspaceChatPanel controller={blockedController} />);
    expect(screen.getByTestId("workspace-guidance-block")).toBeInTheDocument();

    const unblockedController = createMockController({
      selectedModelId: "gpt-4o",
      blockedReason: null,
    });
    rerender(<WorkspaceChatPanel controller={unblockedController} />);
    expect(screen.queryByTestId("workspace-guidance-block")).not.toBeInTheDocument();
  });
});
```

### タスク3: テストファイルの作成

タスク2のテストを実際のファイルに記述する。

**注意事項**:

- P39対策: happy-dom環境では`fireEvent`を使用し、`userEvent`は使用禁止
- P40対策: テスト実行は `cd apps/desktop && pnpm vitest run` で行う
- P9対策: `beforeEach` でモックをリセットし、テスト間で状態を共有しない
- P63対策: 既存テスト `WorkspaceChatPanel.guidance.test.tsx` のインポートパスとモックパターンを必ず参照してから記述する
- **Props API**: WorkspaceChatPanelは `{ controller: WorkspaceChatController }` のみを受け取る。`initialModelSelected`, `isStreaming`, `blocked` 等のpropsは存在しない
- **data-testid**: GuidanceBlockは `"workspace-guidance-block"` を使用

### タスク4: Red状態の確認

```bash
# apps/desktopディレクトリから実行（P40対策）
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx
```

実装前にすべてのテストが失敗（Red）することを確認する。

**Red状態の確認ポイント**:

- I-1: InlineModelSelectorが未配置のため `combobox` ロールが見つからない → Red
- I-5: InlineModelSelectorが未配置のため `combobox` ロールが見つからない → Red
- I-2〜I-4, I-6: GuidanceBlock関連は既存実装で PASS する可能性あり（これは正常）

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 参照資料

### Phase 1-3 ドキュメント

| 資料名                                | パス                                                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（配置設計・連動設計）  | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-2-design.md` |
| Task 01 成果物（InlineModelSelector） | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                                                     |

### 既存テスト（P63対策: インポートパスの参照元）

| テストファイル                                | パス                                                                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| GuidanceBlock改善テスト（モックパターン参照） | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx` |
| ランタイム整合テスト（モックパターン参照）    | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.runtime.test.tsx`  |

### システム仕様

| 資料名              | パス                                                                              |
| ------------------- | --------------------------------------------------------------------------------- |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         |
| テストパターン      | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                   | 対策                                                     |
| ---------- | -------------------------------------- | -------------------------------------------------------- |
| P9         | テスト間で状態共有                     | `beforeEach` でモック・ストアをリセット                  |
| P39        | happy-dom環境でのuserEvent非互換       | `fireEvent` を使用、`userEvent.setup()` は使用禁止       |
| P40        | テスト実行ディレクトリ依存（モノレポ） | `cd apps/desktop && pnpm vitest run` で実行              |
| P63        | サブエージェントのインポートパス誤り   | 既存テストファイルのインポートパスを必ず参照してから記述 |

## 実行手順

1. **タスク1の実施**: 既存テストファイルを確認し、インポートパスとモックパターンを把握する
2. **タスク2の実施**: テストケース設計を確認・確定する
3. **タスク3の実施**: テストファイルを作成する（createMockControllerパターン、fireEvent使用、P39準拠）
4. **タスク4の実施**: Red状態（テスト失敗）を確認する

## 成果物

| 成果物                       | パス                                                                                                                 | 説明              |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Phase 4 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-4-test.md` | テスト設計書      |
| 統合テストファイル           | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx`                    | I-1 〜 I-6 テスト |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION --phase 4
```

## 完了条件

- [ ] タスク1で既存テストファイルのインポートパスとモックパターンを確認した
- [ ] I-1（InlineModelSelector表示）テストが実装され、Red状態であることを確認した
- [ ] I-2（blockedReason=null時GuidanceBlock非表示）テストが実装された
- [ ] I-3（blockedReason="NO_MODEL"時GuidanceBlock表示）テストが実装された
- [ ] I-4（モデル選択済みでチャット操作可能）テストが実装された
- [ ] I-5（ストリーミング中disabled）テストが実装され、Red状態であることを確認した
- [ ] I-6（blockedReason変化でGuidanceBlock連動）テストが実装された
- [ ] P39対策: `userEvent` を使用せず `fireEvent` を使用している
- [ ] P9対策: `beforeEach` でモックをリセットし、テスト間で状態を共有していない
- [ ] テストが `createMockController()` パターンで `{controller}` propsを渡している

## 次のPhase

Phase 5: 実装（`phase-5-implementation.md`）
