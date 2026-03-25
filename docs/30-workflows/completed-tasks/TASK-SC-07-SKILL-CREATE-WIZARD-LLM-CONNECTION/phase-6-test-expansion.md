# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 6                                             |
| Phase名    | テスト拡充                                    |
| 前提Phase  | Phase 5                                       |
| 後続Phase  | Phase 7                                       |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

Phase 4〜5 で作成・実装した Happy Path テストに加え、エラーパス・エッジケース・回帰テストを追加する。カバレッジゲート（Line 80%+, Branch 60%+, Function 80%+）の達成に向けて、未カバーの分岐を網羅する。

## 背景

Phase 5 で AC-1〜AC-10 の基本フローが実装・Green 確認された。しかし Happy Path のみでは Branch Coverage が不足する可能性がある。本 Phase では以下の観点でテストを拡充する:

- planSkill / executePlan の失敗パス
- API 未接続時のフォールバック
- 二重呼出防止ガード（isGenerating）
- Hybrid State Pattern 対称クリアの検証
- generationMode 切替後の状態リセット
- 既存テンプレートフローの回帰テスト

---

## 実行タスク

### タスク1: planSkill エラーパス追加

**目的**: planSkill が失敗した場合のエラー表示と状態管理を検証する

**実行手順**:

1. `SkillCreateWizard.llm-generation.test.tsx` に以下のテストケースを追加する

**追加テストケース**:

| テストID | 説明                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| E-1      | planSkill が `{ success: false, error: "..." }` を返すとき setGenerationError が呼ばれる |
| E-2      | planSkill が例外をスローするとき setGenerationError が呼ばれる                           |
| E-3      | planSkill 失敗時に GenerateStep にエラーが表示される（error prop 経由）                  |
| E-4      | planSkill 失敗時に setIsGenerating(false) が呼ばれる（finally 保証）                     |

**テストケース例**:

```typescript
describe("E-1〜E-4: planSkill エラーパス", () => {
  it("E-1: planSkill が失敗レスポンスを返すとき setGenerationError が呼ばれる", async () => {
    mockPlanSkill.mockResolvedValue({
      success: false,
      error: "APIキーが無効です",
    });

    render(<SkillCreateWizard onClose={vi.fn()} />);

    // LLMモードに切替
    fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テストスキル" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSetGenerationError).toHaveBeenCalledWith("APIキーが無効です");
  });

  it("E-2: planSkill が例外をスローするとき setGenerationError が呼ばれる", async () => {
    mockPlanSkill.mockRejectedValue(new Error("ネットワークエラー"));

    render(<SkillCreateWizard onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テストスキル" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSetGenerationError).toHaveBeenCalledWith("ネットワークエラー");
  });

  it("E-4: planSkill 失敗後に isGenerating が false に戻る（finally 保証）", async () => {
    mockPlanSkill.mockRejectedValue(new Error("失敗"));

    render(<SkillCreateWizard onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テストスキル" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));

    await act(async () => {
      await Promise.resolve();
    });

    // setIsGenerating(false) が呼ばれていること
    const setIsGeneratingCalls = mockSetIsGenerating.mock.calls;
    expect(setIsGeneratingCalls[setIsGeneratingCalls.length - 1]).toEqual([false]);
  });
});
```

2. 記録: `outputs/phase-6/error-path-tests.md` に追加テストケース一覧を記録する

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`（更新済み）
- `outputs/phase-6/error-path-tests.md`

---

### タスク2: executePlan エラーパス追加

**目的**: executePlan が失敗した場合のエラー表示と状態管理を検証する

**実行手順**:

1. `SkillCreateWizard.llm-generation.test.tsx` に以下のテストケースを追加する

**追加テストケース**:

| テストID | 説明                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| E-5      | executePlan が `{ success: false, error: "..." }` を返すとき setGenerationError が呼ばれる      |
| E-6      | executePlan が例外をスローするとき setGenerationError が呼ばれる                                |
| E-7      | executePlan 失敗時に CompleteStep に遷移しない（step=2 のまま）                                 |
| E-8      | executePlan 失敗時に localPlanResult / storePlanResult がクリアされない（失敗後も plan を保持） |
| E-9      | executePlan 失敗時に setIsGenerating(false) が呼ばれる（finally 保証）                          |

**テストケース例**:

```typescript
describe("E-5〜E-9: executePlan エラーパス", () => {
  it("E-5: executePlan が失敗レスポンスを返すとき setGenerationError が呼ばれる", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 3,
    };
    mockExecutePlan.mockResolvedValue({
      success: false,
      error: "実行環境が不正です",
    });

    render(<SkillCreateWizard onClose={vi.fn()} />);
    // GenerateStep に直接遷移するための goToStep(2) をシミュレート
    fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テストスキル" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));
    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: "実行する" })).toBeInTheDocument();
    });

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockSetGenerationError).toHaveBeenCalledWith("実行環境が不正です");
  });

  it("E-7: executePlan 失敗時に「スキルが作成されました」が表示されない", async () => {
    // executePlan 失敗後も CompleteStep に遷移しないことを確認
    mockExecutePlan.mockResolvedValue({ success: false, error: "失敗" });

    render(<SkillCreateWizard onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テストスキル" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));
    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: "実行する" })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "実行する" }));
    });

    expect(
      screen.queryByText("スキルが作成されました"),
    ).not.toBeInTheDocument();
  });
});
```

2. 記録: `outputs/phase-6/execute-plan-error-tests.md` に追加テストケース一覧を記録する

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`（更新済み）
- `outputs/phase-6/execute-plan-error-tests.md`

---

### タスク3: API 未接続時フォールバック追加

**目的**: `planSkill` / `executePlan` が undefined のとき graceful degradation することを検証する

**実行手順**:

1. `SkillCreateWizard.llm-generation.test.tsx` に以下のテストケースを追加する

**追加テストケース**:

| テストID | 説明                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| F-1      | `electronAPI.skillCreator` が undefined のとき planSkill 呼出でエラーが設定される |
| F-2      | `planSkill` 関数が undefined のとき setGenerationError が呼ばれる                 |
| F-3      | `executePlan` 関数が undefined のとき setGenerationError が呼ばれる               |
| F-4      | API 未接続時もアプリがクラッシュしない（例外が画面に露出しない）                  |

**テストケース例**:

```typescript
describe("F-1〜F-4: API 未接続時フォールバック（C-1 回避検証）", () => {
  it("F-2: planSkill が undefined のとき setGenerationError が呼ばれてクラッシュしない", async () => {
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      skillCreator: {
        // planSkill を意図的に未定義にする
        executePlan: mockExecutePlan,
      },
    };

    render(<SkillCreateWizard onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テスト" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));

    await act(async () => {
      await Promise.resolve();
    });

    // クラッシュせず setGenerationError が呼ばれること
    expect(mockSetGenerationError).toHaveBeenCalled();
    expect(mockSetGenerationError.mock.calls[0][0]).toContain(
      "planSkill API が利用できません",
    );
  });

  it("F-3: executePlan が undefined のとき setGenerationError が呼ばれてクラッシュしない", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 3,
    };
    (window as Window & { electronAPI?: unknown }).electronAPI = {
      skillCreator: {
        planSkill: mockPlanSkill,
        // executePlan を意図的に未定義にする
      },
    };

    render(<SkillCreateWizard onClose={vi.fn()} />);
    // GenerateStep 表示状態に遷移してから「実行する」をクリック
    fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テスト" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));
    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: "実行する" })).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "実行する" }));
    });

    expect(mockSetGenerationError).toHaveBeenCalled();
  });
});
```

2. 記録: `outputs/phase-6/api-fallback-tests.md` に追加テストケース一覧を記録する

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`（更新済み）
- `outputs/phase-6/api-fallback-tests.md`

---

### タスク4: 二重呼出防止（isGenerating ガード）追加

**目的**: `isGenerating=true` 中に planSkill が再呼出されないことを検証する

**実行手順**:

1. `SkillCreateWizard.llm-generation.test.tsx` に以下のテストケースを追加する

**追加テストケース**:

| テストID | 説明                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| G-1      | isGenerating=true 中に「次へ」を連打しても planSkill は1回しか呼ばれない       |
| G-2      | isGenerating=true 中に「実行する」を連打しても executePlan は1回しか呼ばれない |

**テストケース例**:

```typescript
describe("G-1〜G-2: 二重呼出防止ガード（isGenerating）", () => {
  it("G-1: planSkill 実行中に再度トリガーしても planSkill は呼ばれない", async () => {
    // store の isGenerating を true に設定
    mockStoreState.isGenerating = true;

    render(<SkillCreateWizard onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テスト" },
    });

    const nextButton = screen.getByRole("button", { name: "次へ" });
    fireEvent.click(nextButton);
    fireEvent.click(nextButton); // 二重クリック

    await act(async () => {
      await Promise.resolve();
    });

    // isGenerating=true のガードにより planSkill は呼ばれない
    expect(mockPlanSkill).not.toHaveBeenCalled();
  });
});
```

2. 記録: `outputs/phase-6/double-invoke-guard-tests.md` に追加テストケース一覧を記録する

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`（更新済み）
- `outputs/phase-6/double-invoke-guard-tests.md`

---

### タスク5: Hybrid State Pattern 対称クリア検証追加（AC-10）

**目的**: `localPlanResult` と `storePlanResult` の両方が対称にクリアされることを検証する

**実行手順**:

1. `SkillCreateWizard.llm-generation.test.tsx` に以下のテストケースを追加する

**追加テストケース**:

| テストID | 説明                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| S-1      | executePlan 成功後: setLocalPlanResult(null) + clearGenerationState() が両方呼ばれる         |
| S-2      | handleCancelPlan 後: setLocalPlanResult(null) + clearGenerationState() が両方呼ばれる        |
| S-3      | キャンセル後に再度 LLM モードで planSkill を実行できる（localPlanResult がクリアされている） |

**テストケース例**:

```typescript
describe("S-1〜S-3: Hybrid State Pattern 対称クリア（AC-10）", () => {
  it("S-1: executePlan 成功後に setLocalPlanResult と clearGenerationState が両方呼ばれる", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 3,
    };

    render(<SkillCreateWizard onClose={vi.fn()} />);

    // GenerateStep 表示状態に遷移
    fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テストスキル" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));
    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: "実行する" })).toBeInTheDocument();
    });

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockClearGenerationState).toHaveBeenCalledTimes(1);
    // localPlanResult は内部 useState なので間接的にテスト（plan 結果が消えていること）
    expect(screen.queryByText("生成計画")).not.toBeInTheDocument();
  });

  it("S-2: キャンセル後に setLocalPlanResult と clearGenerationState が両方呼ばれる", () => {
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 3,
    };

    render(<SkillCreateWizard onClose={vi.fn()} />);

    // GenerateStep 表示状態に遷移
    fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テストスキル" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));
    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole("button", { name: "キャンセル" });
    fireEvent.click(cancelBtn);

    expect(mockClearGenerationState).toHaveBeenCalledTimes(1);
  });
});
```

2. 記録: `outputs/phase-6/symmetric-clear-tests.md` に追加テストケース一覧を記録する

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`（更新済み）
- `outputs/phase-6/symmetric-clear-tests.md`

---

### タスク6: generationMode 切替後の状態リセット追加

**目的**: `generationMode` を切り替えた際に不整合な状態が残らないことを検証する

**実行手順**:

1. `SkillCreateWizard.llm-generation.test.tsx` に以下のテストケースを追加する

**追加テストケース**:

| テストID | 説明                                                                   |
| -------- | ---------------------------------------------------------------------- |
| M-1      | LLM -> テンプレート切替後に「次へ」クリックで ConfigureStep に遷移する |
| M-2      | テンプレート -> LLM 切替後に「次へ」クリックで planSkill が呼ばれる    |
| M-3      | DescribeStep のデフォルト generationMode が "template" である          |

**テストケース例**:

```typescript
describe("M-1〜M-3: generationMode 切替後の遷移検証", () => {
  it("M-1: LLM から テンプレートに切り替えた後「次へ」で ConfigureStep に遷移する", () => {
    render(<SkillCreateWizard onClose={vi.fn()} />);

    // LLM → テンプレートに戻す
    fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
    fireEvent.click(screen.getByRole("radio", { name: /テンプレート/ }));

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テスト" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));

    // ConfigureStep（step=1）に遷移していること
    expect(screen.getByText("タスク生成")).toBeInTheDocument();
    expect(mockPlanSkill).not.toHaveBeenCalled();
  });

  it("M-3: デフォルトはテンプレートモードで「次へ」クリックが ConfigureStep に遷移する", () => {
    render(<SkillCreateWizard onClose={vi.fn()} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "テスト" },
    });
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));

    // デフォルト（template）なので ConfigureStep に遷移
    expect(screen.getByRole("button", { name: "スキルを生成" })).toBeInTheDocument();
  });
});
```

2. 記録: `outputs/phase-6/mode-switch-tests.md` に追加テストケース一覧を記録する

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`（更新済み）
- `outputs/phase-6/mode-switch-tests.md`

---

### タスク7: 拡充テスト実行・Green 確認

**目的**: Phase 6 で追加した全テストが Green であることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop vitest run -- \
  DescribeStep.test \
  GenerateStep.test \
  SkillCreateWizard.llm-generation.test \
  SkillCreateWizard.test \
  SkillCreateWizard.llm-generation.test
```

2. 全テストが `PASS` であることを確認する
3. 失敗したテストがある場合は実装を修正する
4. 結果を `outputs/phase-6/expansion-test-results.md` に記録する

**期待される成果物**:

- `outputs/phase-6/expansion-test-results.md`（テスト全 PASS ログ）

---

## 参照資料

| 参照資料                               | パス                                                                                               | 内容                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Phase 4 テスト（Red）                  | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`   | 基本テスト（更新対象）                         |
| SkillLifecyclePanel LLM テスト参考     | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | エラーパス・フォールバックの参考（U-10〜U-12） |
| Phase 5 実装チェックリスト             | `outputs/phase-5/implementation-checklist.md`                                                      | 対称クリア実装確認結果                         |
| Phase 2 データフロー設計（エラーパス） | `outputs/phase-2/data-flow.md`                                                                     | 失敗時のフロー設計                             |
| agentSlice                             | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                             | PlanResult 型・store 状態                      |

---

## 成果物

| 成果物                               | パス                                                                                             | 内容                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------- |
| SkillCreateWizard LLM テスト（更新） | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | E/F/G/S/M シリーズ追加 |
| エラーパステスト一覧                 | `outputs/phase-6/error-path-tests.md`                                                            | E-1〜E-4 記録          |
| executePlan エラーパス一覧           | `outputs/phase-6/execute-plan-error-tests.md`                                                    | E-5〜E-9 記録          |
| API フォールバックテスト一覧         | `outputs/phase-6/api-fallback-tests.md`                                                          | F-1〜F-4 記録          |
| 二重呼出防止テスト一覧               | `outputs/phase-6/double-invoke-guard-tests.md`                                                   | G-1〜G-2 記録          |
| 対称クリアテスト一覧                 | `outputs/phase-6/symmetric-clear-tests.md`                                                       | S-1〜S-3 記録          |
| モード切替テスト一覧                 | `outputs/phase-6/mode-switch-tests.md`                                                           | M-1〜M-3 記録          |
| 拡充テスト実行結果                   | `outputs/phase-6/expansion-test-results.md`                                                      | 全テスト PASS ログ     |

---

## 統合テスト連携

- エラーパスのテストでは `mockSetGenerationError` が呼ばれること、かつ引数が適切であることを検証する
- API フォールバックテスト（F シリーズ）は `SkillLifecyclePanel.llm-generation.test.tsx` の U-12 と同等のパターンを採用する
- 対称クリアテスト（S シリーズ）は `mockClearGenerationState` の呼出回数と順序を検証する

---

## 完了条件

- [ ] E シリーズ（planSkill エラーパス）: E-1〜E-4 が全て追加・Green
- [ ] E シリーズ（executePlan エラーパス）: E-5〜E-9 が全て追加・Green
- [ ] F シリーズ（API フォールバック）: F-1〜F-4 が全て追加・Green
- [ ] G シリーズ（二重呼出防止）: G-1〜G-2 が全て追加・Green
- [ ] S シリーズ（対称クリア）: S-1〜S-3 が全て追加・Green
- [ ] M シリーズ（モード切替）: M-1〜M-3 が全て追加・Green
- [ ] 既存テスト（Phase 4・5 作成分）が引き続き全 PASS
- [ ] 全成果物が `outputs/phase-6/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了し、基本テストが全 Green であること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-7-coverage-check.md`
