# Phase 4: テスト作成

## メタ情報

| 項目          | 内容                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase番号     | 4                                                                                                                        |
| 機能名        | チャット向けコンパクトモデルセレクタ共通コンポーネント作成 (TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT)                     |
| 作成日        | 2026-03-21                                                                                                               |
| 担当          | -                                                                                                                        |
| ステータス    | 未着手                                                                                                                   |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-3-design-review.md` |

## 目的

Phase 2 で設計した `InlineModelSelector` コンポーネントに対するテストケースを先に設計・実装し、Red 状態（テスト失敗）から始める TDD サイクルを確立する。ドロップダウン開閉・プロバイダー選択・モデル選択・ヘルスステータス表示・各種 prop の動作を網羅する。

## 実行タスク

### タスク1: テスト対象の確認

P63 対策として、既存テストファイルのインポートパスを参照してから新規テストを作成する。

```bash
# 既存の llm 関連テストファイルを確認
find apps/desktop/src/renderer/components/llm -name "*.test.tsx" -o -name "*.spec.tsx"

# 既存コンポーネントテストのインポートパス参照（P63対策）
# 上記で発見したファイルに対して実行
# grep -n "^import" <発見したテストファイルのパス>

# テスト実行環境の確認（P40対策）
cat apps/desktop/vitest.config.ts | grep -A 5 "environment"
```

### タスク2: デザイントークン定数のテスト準備（P47対策）

InlineModelSelector がデザイントークン（CSS 変数）を使用する場合、コンポーネント側で `export const` として定数を公開し、テストからインポートして期待値を生成する。

```typescript
// コンポーネント側（InlineModelSelector.tsx）でエクスポートする例
export const selectorVariantStyles = {
  default: "border-[var(--border-default)] bg-[var(--bg-surface)]",
  active: "border-[var(--accent-primary)] bg-[var(--bg-elevated)]",
} as const;

// テスト側でインポートして使用する
import { selectorVariantStyles } from "../InlineModelSelector";
expect(triggerEl.className).toContain(selectorVariantStyles.active);
```

### タスク3: テストケース設計と実装

**テストファイルパス**: `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`

**テストケース一覧**:

| ID   | テスト名                                                                   | 分類       |
| ---- | -------------------------------------------------------------------------- | ---------- |
| T1-1 | 初期状態でドロップダウンが閉じていること                                   | 正常系     |
| T1-2 | トリガーをクリックするとドロップダウンが開くこと                           | 正常系     |
| T1-3 | ドロップダウンが開いた状態でトリガーを再クリックすると閉じること           | 正常系     |
| T1-4 | ドロップダウンが開いた状態で外部クリックすると閉じること                   | 正常系     |
| T2-1 | 利用可能なプロバイダーリストが表示されること                               | 正常系     |
| T2-2 | プロバイダーをクリックすると選択が変わること                               | 正常系     |
| T2-3 | プロバイダー選択後に対応するモデルリストが表示されること                   | 正常系     |
| T3-1 | モデルをクリックすると選択が変わること                                     | 正常系     |
| T3-2 | モデル選択後に onSelectionChange コールバックが呼ばれること                | 正常系     |
| T3-3 | モデル選択後に正しい provider/model の組み合わせが渡されること             | 正常系     |
| T4-1 | ヘルスステータス「healthy」でグリーンドットが表示されること                | 正常系     |
| T4-2 | ヘルスステータス「degraded」でイエロードットが表示されること               | 正常系     |
| T4-3 | ヘルスステータス「checking」でアニメーション状態のドットが表示されること   | 正常系     |
| T4-4 | ヘルスステータス「error」でレッドドットが表示されること                    | 正常系     |
| T5-1 | 未選択状態（selectedProviderId が null）でプレースホルダーが表示されること | 境界値     |
| T5-2 | 未選択状態でトリガーをクリックするとドロップダウンが開くこと               | 境界値     |
| T6-1 | compact prop が true の場合、コンパクトサイズで表示されること              | 正常系     |
| T6-2 | compact prop が false の場合（デフォルト）、通常サイズで表示されること     | 正常系     |
| T7-1 | disabled prop が true の場合、トリガーがクリック不可能であること           | 正常系     |
| T7-2 | disabled prop が true の場合、ドロップダウンが開かないこと                 | 正常系     |
| T8-1 | Escape キーを押すとドロップダウンが閉じること                              | キーボード |
| T8-2 | ドロップダウン内で Tab キーで項目を移動できること                          | キーボード |
| T8-3 | Enter キーでプロバイダー/モデルを選択できること                            | キーボード |

**テストコード例**:

```typescript
// P39対策: happy-dom環境では fireEvent を使用（userEvent 禁止）
import { render, screen } from "@testing-library/react";
import { fireEvent, act } from "@testing-library/react";
import { InlineModelSelector } from "../InlineModelSelector";

const mockProviders = [
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
      { id: "claude-3-haiku", name: "Claude 3 Haiku" },
    ],
  },
];

describe("InlineModelSelector", () => {
  beforeEach(() => {
    // P9対策: テスト間でモックをリセット
    vi.clearAllMocks();
  });

  it("T1-1: 初期状態でドロップダウンが閉じている", () => {
    render(<InlineModelSelector providers={mockProviders} />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("T1-2: トリガークリックでドロップダウンが開く", async () => {
    render(<InlineModelSelector providers={mockProviders} />);
    const trigger = screen.getByRole("button");
    await act(async () => {
      fireEvent.click(trigger);
    });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("T7-1: disabled=true のとき、トリガーがクリック不可能", () => {
    render(<InlineModelSelector providers={mockProviders} disabled />);
    const trigger = screen.getByRole("button");
    expect(trigger).toBeDisabled();
  });

  it("T3-2: モデル選択後に onSelectionChange が呼ばれる", async () => {
    const onSelectionChange = vi.fn();
    render(
      <InlineModelSelector
        providers={mockProviders}
        onSelectionChange={onSelectionChange}
      />,
    );
    // ドロップダウンを開く
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    // プロバイダーを選択
    await act(async () => {
      fireEvent.click(screen.getByText("Anthropic"));
    });
    // モデルを選択
    await act(async () => {
      fireEvent.click(screen.getByText("Claude 3.5 Sonnet"));
    });
    expect(onSelectionChange).toHaveBeenCalledWith({
      providerId: "anthropic",
      modelId: "claude-3-5-sonnet",
    });
  });
});
```

### タスク4: Store モックの準備

InlineModelSelector が Zustand Store（個別セレクタ）を使用する場合、テスト用モックを設定する。

```typescript
// テストファイル内でのStoreモック設定例
vi.mock("@/renderer/store", () => ({
  useSelectedProviderId: vi.fn(() => null),
  useSelectedModelId: vi.fn(() => null),
  useSetSelectedProviderId: vi.fn(() => vi.fn()),
  useSetSelectedModelId: vi.fn(() => vi.fn()),
  useLLMProviders: vi.fn(() => mockProviders),
}));
```

### タスク5: テスト実行でRed確認

```bash
# apps/desktop ディレクトリから実行（P40対策）
cd apps/desktop
pnpm vitest run src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx
```

## 参照資料

### システム仕様

| 資料名               | パス                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| UIコンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| テストパターン       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           |

### 関連ソースコード

| ファイル                 | パス                                                                       |
| ------------------------ | -------------------------------------------------------------------------- |
| テスト対象コンポーネント | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`（新規） |
| llmコンポーネントindex   | `apps/desktop/src/renderer/components/llm/index.ts`                        |

### 既知の落とし穴

| 落とし穴ID | 説明                                  | 対策                                                   |
| ---------- | ------------------------------------- | ------------------------------------------------------ |
| P9         | テスト間で状態共有                    | `beforeEach` でモック・状態をリセット                  |
| P39        | happy-dom環境でのuserEvent非互換      | `fireEvent` を使用し、`userEvent` は使用しない         |
| P40        | テスト実行ディレクトリ依存            | `apps/desktop` ディレクトリからテストを実行する        |
| P47        | CSS変数ベーステストのアサーション戦略 | デザイントークン定数を `export` してテストでインポート |
| P63        | サブエージェントのインポートパス誤り  | 既存テストファイルのインポートパスを必ず参照する       |

## 実行手順

1. **既存テストファイルの確認**: タスク1のコマンドを実行し、インポートパスを把握する
2. **デザイントークン定数の設計**: タスク2に従い、コンポーネントのエクスポート構成を計画する
3. **テストケースの実装**: T1-1 から順にテストを実装する（Red 状態を確認しながら進める）
4. **Store モックの設定**: タスク4に従い、Store モックを設定する
5. **テスト実行でRed確認**: 全テストが失敗（Red）することを確認する

## 成果物

| 成果物                       | パス                                                                                                            | 説明                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Phase 4 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-4-test.md` | テスト設計書              |
| テストファイル               | `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`                               | T1-1 〜 T8-3 テストケース |

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT --phase 4
```

## 完了条件

- [ ] タスク1のコマンドを実行し、既存テストファイルのインポートパスを確認した
- [ ] P47対策（デザイントークン定数のエクスポート計画）を設計した
- [ ] T1-1 〜 T1-4（ドロップダウン開閉）のテストを実装し、Red 状態を確認した
- [ ] T2-1 〜 T2-3（プロバイダー選択）のテストを実装し、Red 状態を確認した
- [ ] T3-1 〜 T3-3（モデル選択・コールバック）のテストを実装し、Red 状態を確認した
- [ ] T4-1 〜 T4-4（ヘルスステータス表示）のテストを実装し、Red 状態を確認した
- [ ] T5-1 〜 T5-2（未選択状態）のテストを実装し、Red 状態を確認した
- [ ] T6-1 〜 T6-2（compact prop）のテストを実装し、Red 状態を確認した
- [ ] T7-1 〜 T7-2（disabled prop）のテストを実装し、Red 状態を確認した
- [ ] T8-1 〜 T8-3（キーボード操作）のテストを実装し、Red 状態を確認した
- [ ] P39対策（fireEvent 使用、userEvent 禁止）が適用されている
- [ ] テスト間で状態が共有されていない（P9対策）

## 次のPhase

Phase 5: 実装（`phase-5-implementation.md`）
