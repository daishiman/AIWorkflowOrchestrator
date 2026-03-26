# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 4                                             |
| Phase名    | テスト作成                                    |
| 前提Phase  | Phase 3                                       |
| 後続Phase  | Phase 5                                       |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

TDD の Red フェーズとして、AC-1〜AC-10 をカバーするテストを実装より先に作成する。実装が存在しないため全テストが失敗（Red）することを確認し、Phase 5 の実装完了基準を明確にする。

## 背景

Phase 3 設計レビューで PASS が確認され、型定義・データフロー・ステップ遷移の設計が確定した。TDD原則に従い、テストを先に書くことで実装の契約を確定させる。TASK-SC-06 の苦戦箇所（C-1〜C-4）がテストレベルでも検出できるよう、回避観点のテストケースを含める。

---

## 実行タスク

### タスク1: DescribeStep テスト更新（AC-1 対応）

**目的**: 生成モード選択 UI の描画とコールバックをテストする

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx` を読み込み、既存テストを確認する
2. 以下のテストケースを既存ファイルに追記する（既存テストは削除しない）

**追加テストケース**:

```typescript
// Phase 4 追加: TASK-SC-07 AC-1 - 生成モード選択UI
describe("生成モード選択UI（AC-1）", () => {
  let mockOnGenerationModeChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnGenerationModeChange = vi.fn();
  });

  it("generationMode='template' でテンプレートラジオが選択状態になる", () => {
    render(
      <DescribeStep
        description="テストスキル"
        onDescriptionChange={mockOnDescriptionChange}
        generationMode="template"
        onGenerationModeChange={mockOnGenerationModeChange}
        onNext={mockOnNext}
      />,
    );
    const templateRadio = screen.getByRole("radio", { name: /テンプレート/ });
    expect(templateRadio).toBeChecked();
  });

  it("generationMode='llm' でLLMラジオが選択状態になる", () => {
    render(
      <DescribeStep
        description="テストスキル"
        onDescriptionChange={mockOnDescriptionChange}
        generationMode="llm"
        onGenerationModeChange={mockOnGenerationModeChange}
        onNext={mockOnNext}
      />,
    );
    const llmRadio = screen.getByRole("radio", { name: /LLM/ });
    expect(llmRadio).toBeChecked();
  });

  it("LLMラジオ選択でonGenerationModeChangeが'llm'で呼ばれる", () => {
    render(
      <DescribeStep
        description="テストスキル"
        onDescriptionChange={mockOnDescriptionChange}
        generationMode="template"
        onGenerationModeChange={mockOnGenerationModeChange}
        onNext={mockOnNext}
      />,
    );
    const llmRadio = screen.getByRole("radio", { name: /LLM/ });
    fireEvent.click(llmRadio);
    expect(mockOnGenerationModeChange).toHaveBeenCalledWith("llm");
  });

  it("テンプレートラジオ選択でonGenerationModeChangeが'template'で呼ばれる", () => {
    render(
      <DescribeStep
        description="テストスキル"
        onDescriptionChange={mockOnDescriptionChange}
        generationMode="llm"
        onGenerationModeChange={mockOnGenerationModeChange}
        onNext={mockOnNext}
      />,
    );
    const templateRadio = screen.getByRole("radio", { name: /テンプレート/ });
    fireEvent.click(templateRadio);
    expect(mockOnGenerationModeChange).toHaveBeenCalledWith("template");
  });

  it("generationMode未指定時も既存テスト(onNext等)は動作する（後方互換）", () => {
    // generationMode/onGenerationModeChange を渡さないケース（デフォルト値）
    render(
      <DescribeStep
        description="テストスキル"
        onDescriptionChange={mockOnDescriptionChange}
        onNext={mockOnNext}
      />,
    );
    const button = screen.getByRole("button", { name: "次へ" });
    expect(button).toBeEnabled();
  });
});
```

3. 記録: `outputs/phase-4/describe-step-tests.md` に追加テストケース一覧を記録する

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`（更新済み）
- `outputs/phase-4/describe-step-tests.md`

---

### タスク2: GenerateStep テスト更新（AC-3, AC-4, AC-5, AC-6, AC-7 対応）

**目的**: plan 結果表示、実行/キャンセルボタン、generationProgress、エラー表示をテストする

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx` を読み込み、既存テストを確認する
2. 以下のテストケースを既存ファイルに追記する

**追加テストケース**:

```typescript
// Phase 4 追加: TASK-SC-07 AC-3,4,5,6,7 - LLMモード拡張
import type { PlanResult } from "../../../../store/slices/agentSlice";

const mockOnExecutePlan = vi.fn();
const mockOnCancelPlan = vi.fn();

// AC-6: generationProgress 表示
describe("generationProgress 表示（AC-6）", () => {
  it("generationProgress が設定されているとき進捗テキストが表示される", () => {
    render(
      <GenerateStep
        isGenerating={true}
        error={null}
        generationMode="llm"
        generationProgress="計画を生成中..."
        planResult={null}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    expect(screen.getByText("計画を生成中...")).toBeInTheDocument();
  });

  it("generationProgress=null のとき進捗テキストが表示されない", () => {
    render(
      <GenerateStep
        isGenerating={true}
        error={null}
        generationMode="llm"
        generationProgress={null}
        planResult={null}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    expect(screen.queryByText("計画を生成中...")).not.toBeInTheDocument();
  });
});

// AC-3: plan 結果表示
describe("plan 結果表示（AC-3）", () => {
  const planResult: PlanResult = {
    type: "integrated_api",
    planId: "plan-001",
    estimatedSteps: 5,
  };

  it("planResult が設定されているとき生成計画セクションが表示される", () => {
    render(
      <GenerateStep
        isGenerating={false}
        error={null}
        generationMode="llm"
        generationProgress={null}
        planResult={planResult}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    expect(screen.getByText("生成計画")).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it("planResult=null のとき生成計画セクションが表示されない", () => {
    render(
      <GenerateStep
        isGenerating={false}
        error={null}
        generationMode="llm"
        generationProgress={null}
        planResult={null}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    expect(screen.queryByText("生成計画")).not.toBeInTheDocument();
  });

  it("terminal_handoff のとき guidance が表示される", () => {
    const terminalPlan: PlanResult = {
      type: "terminal_handoff",
      guidance: {
        reason: "大規模タスクはCLIで実行する必要があります",
        command: "npx skill-creator plan",
      },
    };
    render(
      <GenerateStep
        isGenerating={false}
        error={null}
        generationMode="llm"
        generationProgress={null}
        planResult={terminalPlan}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    expect(
      screen.getByText(/大規模タスクはCLIで実行する必要があります/),
    ).toBeInTheDocument();
  });
});

// AC-4: 実行ボタン
describe("実行ボタン（AC-4）", () => {
  const planResult: PlanResult = {
    type: "integrated_api",
    planId: "plan-001",
    estimatedSteps: 3,
  };

  it("planResult が設定されているとき「実行する」ボタンが表示される", () => {
    render(
      <GenerateStep
        isGenerating={false}
        error={null}
        generationMode="llm"
        generationProgress={null}
        planResult={planResult}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    expect(
      screen.getByRole("button", { name: "実行する" }),
    ).toBeInTheDocument();
  });

  it("「実行する」クリックで onExecutePlan が呼ばれる", () => {
    render(
      <GenerateStep
        isGenerating={false}
        error={null}
        generationMode="llm"
        generationProgress={null}
        planResult={planResult}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "実行する" }));
    expect(mockOnExecutePlan).toHaveBeenCalledTimes(1);
  });

  it("isGenerating=true のとき「実行する」ボタンが disabled になる", () => {
    render(
      <GenerateStep
        isGenerating={true}
        error={null}
        generationMode="llm"
        generationProgress={null}
        planResult={planResult}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    expect(screen.getByRole("button", { name: "実行する" })).toBeDisabled();
  });
});

// AC-5: キャンセルボタン
describe("キャンセルボタン（AC-5）", () => {
  const planResult: PlanResult = {
    type: "integrated_api",
    planId: "plan-001",
    estimatedSteps: 3,
  };

  it("planResult が設定されているとき「キャンセル」ボタンが表示される", () => {
    render(
      <GenerateStep
        isGenerating={false}
        error={null}
        generationMode="llm"
        generationProgress={null}
        planResult={planResult}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    expect(
      screen.getByRole("button", { name: "キャンセル" }),
    ).toBeInTheDocument();
  });

  it("「キャンセル」クリックで onCancelPlan が呼ばれる", () => {
    render(
      <GenerateStep
        isGenerating={false}
        error={null}
        generationMode="llm"
        generationProgress={null}
        planResult={planResult}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(mockOnCancelPlan).toHaveBeenCalledTimes(1);
  });
});

// AC-7: エラー表示（generationError 対応）
describe("generationError 表示（AC-7）", () => {
  it("error が設定されているとき エラーメッセージが表示される（LLMモード）", () => {
    render(
      <GenerateStep
        isGenerating={false}
        error={new Error("planSkill 呼び出しに失敗しました")}
        generationMode="llm"
        generationProgress={null}
        planResult={null}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    expect(
      screen.getByText("planSkill 呼び出しに失敗しました"),
    ).toBeInTheDocument();
  });
});

// AC-8: テンプレートフロー非破壊 - テンプレートモードでは実行/キャンセルが表示されない
describe("テンプレートモード非破壊（AC-8）", () => {
  it("generationMode='template' のとき「実行する」/「キャンセル」ボタンが表示されない", () => {
    render(
      <GenerateStep
        isGenerating={true}
        error={null}
        generationMode="template"
        generationProgress={null}
        planResult={null}
        onExecutePlan={mockOnExecutePlan}
        onCancelPlan={mockOnCancelPlan}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "実行する" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "キャンセル" }),
    ).not.toBeInTheDocument();
  });
});
```

3. 記録: `outputs/phase-4/generate-step-tests.md` に追加テストケース一覧を記録する

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`（更新済み）
- `outputs/phase-4/generate-step-tests.md`

---

### タスク3: SkillCreateWizard LLM 生成テスト新規作成（AC-2, AC-4, AC-5, AC-8, AC-9, AC-10 対応）

**目的**: SkillCreateWizard の LLM 生成フロー統合テストを新規ファイルで作成する

**実行手順**:

1. 以下のファイルを新規作成する:
   `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`

2. `SkillLifecyclePanel.llm-generation.test.tsx` のモックパターンを参考に store モックを構築する（vi.mock は巻き上げられるため mock 関数を先に宣言する）

**新規ファイルの構成**:

```typescript
/**
 * @vitest-environment happy-dom
 * @file SkillCreateWizard.llm-generation.test.tsx
 * @description SkillCreateWizard LLM 生成フロー統合テスト
 * @phase Phase 4: テスト作成（TDD: Red）
 * @task TASK-SC-07
 *
 * AC-2: LLM選択 -> planSkill 呼出
 * AC-4: executePlan -> CompleteStep 遷移
 * AC-5: キャンセル -> DescribeStep 戻り
 * AC-8: テンプレートフロー非破壊
 * AC-9: PlanResult Single Source of Truth
 * AC-10: 対称クリア
 */
```

**テストケース構成**:

| テストID | AC    | テスト説明                                                    |
| -------- | ----- | ------------------------------------------------------------- |
| W-1      | AC-2  | LLMモード選択 + 「次へ」クリックで planSkill が呼ばれる       |
| W-2      | AC-2  | planSkill 呼出し時に setGenerationProgress が呼ばれる         |
| W-3      | AC-2  | planSkill 成功時に setCurrentPlanResult が呼ばれる            |
| W-4      | AC-4  | 「実行する」クリックで executePlan が呼ばれる                 |
| W-5      | AC-4  | executePlan 成功後に CompleteStep に遷移する                  |
| W-6      | AC-5  | 「キャンセル」クリックで DescribeStep に戻る                  |
| W-7      | AC-8  | テンプレートモード（デフォルト）で ConfigureStep に遷移する   |
| W-8      | AC-8  | テンプレートモードで createSkill が呼ばれる（既存フロー維持） |
| W-9      | AC-9  | GenerateStep に渡される planResult が agentSlice 由来である   |
| W-10     | AC-10 | executePlan 成功後に clearGenerationState が呼ばれる          |
| W-11     | AC-10 | キャンセル後に clearGenerationState が呼ばれる（対称クリア）  |

3. store モックは `SkillLifecyclePanel.llm-generation.test.tsx` L69-98 のパターンを踏襲する
4. window.electronAPI の設定は `beforeEach` 内で行う（planSkill, executePlan をモック）
5. 記録: `outputs/phase-4/wizard-llm-tests.md` にテストケース一覧を記録する

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`（新規）
- `outputs/phase-4/wizard-llm-tests.md`

---

### タスク4: TDD Red 状態確認

**目的**: Phase 4 で作成したテストが全て失敗（Red）していることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop vitest run -- \
  DescribeStep.test \
  GenerateStep.test \
  SkillCreateWizard.llm-generation.test
```

2. 出力を確認し、新規追加テストケースが全て `FAIL` であることを確認する
3. 既存テスト（Phase 4 追加前）は `PASS` のままであることを確認する
4. 結果を `outputs/phase-4/red-state-confirmation.md` に記録する

**期待される成果物**:

- `outputs/phase-4/red-state-confirmation.md`（テスト実行ログ・Red 確認結果）

---

## 参照資料

| 参照資料                           | パス                                                                                               | 内容                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 2 型定義設計                 | `outputs/phase-2/type-definitions.md`                                                              | GenerationMode, Props 拡張            |
| Phase 2 データフロー設計           | `outputs/phase-2/data-flow.md`                                                                     | LLM / テンプレート 両フロー           |
| 既存 DescribeStep テスト           | `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`                | 既存テスト（更新対象）                |
| 既存 GenerateStep テスト           | `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`                | 既存テスト（更新対象）                |
| SkillLifecyclePanel LLM テスト参考 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | モックパターン参考（TASK-SC-06 実装） |
| agentSlice PlanResult 型           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                             | PlanResult 型（L34-39）               |
| SkillCreateWizard 現状             | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                 | 変更対象                              |

---

## 成果物

| 成果物                               | パス                                                                                             | 内容                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------- |
| DescribeStep テスト（更新）          | `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`              | AC-1 生成モード選択 UI テスト追加 |
| GenerateStep テスト（更新）          | `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`              | AC-3〜8 テスト追加                |
| SkillCreateWizard LLM テスト（新規） | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | AC-2,4,5,8,9,10 統合テスト        |
| DescribeStep テスト一覧              | `outputs/phase-4/describe-step-tests.md`                                                         | 追加テストケース記録              |
| GenerateStep テスト一覧              | `outputs/phase-4/generate-step-tests.md`                                                         | 追加テストケース記録              |
| Wizard LLM テスト一覧                | `outputs/phase-4/wizard-llm-tests.md`                                                            | 統合テストケース記録              |
| Red 状態確認                         | `outputs/phase-4/red-state-confirmation.md`                                                      | テスト失敗確認ログ                |

---

## 統合テスト連携

- `SkillCreateWizard.llm-generation.test.tsx` では store の全 hook（`useIsSkillGenerating`, `useGenerationProgress`, `useCurrentPlanResult`, `useCurrentPlanId`, `useClearGenerationState` 等）をモックする
- `window.electronAPI.skillCreator.planSkill` / `executePlan` を `beforeEach` 内でモックし、各テストで必要なレスポンスを設定する
- `PlanResult` 型は必ず `agentSlice.ts` からインポートし、ローカル型を定義しないこと（AC-9 / C-4 回避）

---

## 完了条件

- [ ] `DescribeStep.test.tsx` に AC-1 対応のテストケース（5件以上）が追加されている
- [ ] `GenerateStep.test.tsx` に AC-3〜8 対応のテストケース（10件以上）が追加されている
- [ ] `SkillCreateWizard.llm-generation.test.tsx` が新規作成されている（W-1〜W-11 全11件）
- [ ] 全新規テストが Red（失敗）状態であることが確認されている
- [ ] 既存テストが引き続き Green（成功）であることが確認されている
- [ ] 全成果物が `outputs/phase-4/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS または MINOR（対応済み）で完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-5-implementation.md`
