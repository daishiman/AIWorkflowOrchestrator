# Phase 4: テスト作成

## メタ情報

| 項目          | 内容                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 4                                                                                                                             |
| 機能名        | WorkspaceChatPanelへのインラインモデルセレクタ配置 (TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION)                             |
| 作成日        | 2026-03-21                                                                                                                    |
| 担当          | -                                                                                                                             |
| ステータス    | 未着手                                                                                                                        |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-3-design-review.md` |

## 目的

WorkspaceChatPanelにInlineModelSelectorが正しく配置・連動することを検証する統合テストをTDDサイクルに従い先に作成し、Red状態（テスト失敗）から始める。

## 実行タスク

### タスク1: テスト対象ファイルの確認

P63対策として、既存テストファイルのインポートパスを参照してからテストを作成する。

```bash
# WorkspaceChatPanel 関連の既存テストを確認
find apps/desktop/src/renderer/views/WorkspaceView -name "*.test.*" -o -name "*.spec.*"

# 既存テストのインポートパス確認（P63対策）
# 発見した既存テストファイルに対して実行
# grep -n "^import" <発見したテストファイルのパス>

# InlineModelSelectorコンポーネントの実装確認（Task 01成果物）
find apps/desktop/src -name "InlineModelSelector*" -not -name "*.test.*"

# useWorkspaceChatController の確認
find apps/desktop/src -name "useWorkspaceChatController*"
```

### タスク2: 統合テストケースの設計

**テストファイル**: `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx`

**テストケース一覧**:

| ID  | テスト名                                                                         | 分類   |
| --- | -------------------------------------------------------------------------------- | ------ |
| I-1 | WorkspaceChatPanelの上部にInlineModelSelector(compact)が表示される               | 正常系 |
| I-2 | モデル選択後にGuidanceBlock(variant="blocked")が非表示になる                     | 正常系 |
| I-3 | モデル未選択時にGuidanceBlock(variant="blocked")が表示される                     | 正常系 |
| I-4 | モデル選択後にチャット入力フィールドが有効化される                               | 正常系 |
| I-5 | ストリーミング中はInlineModelSelectorがdisabled状態になる                        | 正常系 |
| I-6 | useWorkspaceChatControllerのblocked判定と連動してGuidanceBlockの表示が切り替わる | 正常系 |

**テストコード例（happy-dom環境でのfireEvent使用、P39準拠）**:

```typescript
// P39: happy-dom環境ではfireEventを使用（userEvent禁止）
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { act } from "react";

describe("WorkspaceChatPanel統合テスト", () => {
  beforeEach(() => {
    // P9: テスト間で状態を共有しない
    vi.clearAllMocks();
  });

  it("I-1: WorkspaceChatPanel上部にInlineModelSelector(compact)が表示される", () => {
    render(<WorkspaceChatPanel />);
    // InlineModelSelectorのcompactモードを確認
    const selector = screen.getByTestId("inline-model-selector");
    expect(selector).toBeInTheDocument();
    expect(selector).toHaveAttribute("data-compact", "true");
  });

  it("I-2: モデル選択後にGuidanceBlock(blocked)が非表示になる", async () => {
    render(<WorkspaceChatPanel />);
    const guidanceBlock = screen.queryByTestId("guidance-block-blocked");
    // モデル選択操作（fireEvent使用）
    const modelOption = screen.getByRole("option", { name: /claude/i });
    await act(async () => {
      fireEvent.click(modelOption);
    });
    expect(screen.queryByTestId("guidance-block-blocked")).not.toBeInTheDocument();
  });

  it("I-3: モデル未選択時にGuidanceBlock(blocked)が表示される", () => {
    // 初期状態（未選択）でレンダリング
    render(<WorkspaceChatPanel initialModelSelected={false} />);
    expect(screen.getByTestId("guidance-block-blocked")).toBeInTheDocument();
  });

  it("I-4: モデル選択後にチャット入力が有効化される", async () => {
    render(<WorkspaceChatPanel />);
    const input = screen.getByRole("textbox");
    // 初期状態では無効
    expect(input).toBeDisabled();
    // モデル選択後に有効化
    await act(async () => {
      fireEvent.click(screen.getByTestId("model-select-trigger"));
    });
    expect(input).not.toBeDisabled();
  });

  it("I-5: ストリーミング中はInlineModelSelectorがdisabled", () => {
    render(<WorkspaceChatPanel isStreaming={true} />);
    const selector = screen.getByTestId("inline-model-selector");
    expect(selector).toHaveAttribute("aria-disabled", "true");
  });

  it("I-6: blocked判定がGuidanceBlockの表示に連動する", () => {
    const { rerender } = render(<WorkspaceChatPanel blocked={true} />);
    expect(screen.getByTestId("guidance-block-blocked")).toBeInTheDocument();

    rerender(<WorkspaceChatPanel blocked={false} />);
    expect(screen.queryByTestId("guidance-block-blocked")).not.toBeInTheDocument();
  });
});
```

### タスク3: テストファイルの作成

タスク2のテストを実際のファイルに記述する。

**注意事項**:

- P39対策: happy-dom環境では`fireEvent`を使用し、`userEvent`は使用禁止
- P40対策: テスト実行は `cd apps/desktop && pnpm vitest run` で行う
- P9対策: `beforeEach` でモックをリセットし、テスト間で状態を共有しない
- P63対策: 既存テストファイルのインポートパスを必ず参照してから記述する

### タスク4: Red状態の確認

```bash
# apps/desktopディレクトリから実行（P40対策）
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx
```

実装前にすべてのテストが失敗（Red）することを確認する。

## 参照資料

### Phase 1-3 ドキュメント

| 資料名                                          | パス                                                                                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（WorkspaceChat配置設計 3.2/3.3） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/` （Task 01完了後に参照） |
| Task 01 成果物（InlineModelSelector）           | `apps/desktop/src/renderer/components/InlineModelSelector.tsx`（Task 01完了後に参照）                                         |

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

1. **タスク1の実施**: 既存テストファイルを確認し、インポートパスを把握する
2. **タスク2の実施**: テストケース設計を確認・確定する
3. **タスク3の実施**: テストファイルを作成する（fireEvent使用、P39準拠）
4. **タスク4の実施**: Red状態（テスト失敗）を確認する

## 成果物

| 成果物                       | パス                                                                                                                 | 説明              |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Phase 4 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-4-test.md` | テスト設計書      |
| 統合テストファイル           | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx`                    | I-1 〜 I-6 テスト |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

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

- [ ] タスク1で既存テストファイルのインポートパスを確認した
- [ ] I-1（InlineModelSelector表示）テストが実装され、Red状態であることを確認した
- [ ] I-2（モデル選択後GuidanceBlock非表示）テストが実装され、Red状態であることを確認した
- [ ] I-3（モデル未選択時GuidanceBlock表示）テストが実装され、Red状態であることを確認した
- [ ] I-4（モデル選択後チャット入力有効化）テストが実装され、Red状態であることを確認した
- [ ] I-5（ストリーミング中disabled）テストが実装され、Red状態であることを確認した
- [ ] I-6（blocked判定連動）テストが実装され、Red状態であることを確認した
- [ ] P39対策: `userEvent` を使用せず `fireEvent` を使用している
- [ ] P9対策: `beforeEach` でモックをリセットし、テスト間で状態を共有していない

## 次のPhase

Phase 5: 実装（`phase-5-implementation.md`）
