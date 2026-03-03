# Phase 4: テスト作成

## メタ情報

| 項目      | 値                                                            |
| --------- | ------------------------------------------------------------- |
| Phase     | 4                                                             |
| 機能名    | TASK-10A-D スキルライフサイクルUI統合                         |
| 作成日    | 2026-03-03                                                    |
| 状態      | 未着手                                                        |
| 前提Phase | Phase 1（要件定義）, Phase 2（設計）, Phase 3（設計レビュー） |

## 目的

TDD Red フェーズとして、TASK-10A-D の全実装対象に対するテストケースを設計・作成する。テストは全て Red 状態（実装前のため失敗する）で作成し、Phase 5 の実装で Green にする。

## 実行タスク

- SkillManagementPanel 統合テスト作成: analysis/create ビュー統合と戻る導線を Red テストで定義する。
- agentSlice アクションテスト作成: analyze/applyImprovements/autoImprove/create の成功・失敗系を Red テストで定義する。
- 個別セレクタ安定性テスト作成: P31 対策として個別セレクタの再レンダー安定性を Red テストで定義する。
- ChatPanel 導線テスト作成: スキル管理パネルの開閉とビュー遷移を Red テストで定義する。

## 参照資料

| 資料名                           | パス                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Phase 1 要件定義                 | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/phase-1-requirements.md`  |
| Phase 2 設計                     | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/phase-2-design.md`        |
| Phase 3 設計レビュー             | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/phase-3-design-review.md` |
| 既存 SkillManagementPanel テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`                   |
| 既存 agentSlice テスト           | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts`                                  |
| useSkillAnalysis フック          | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`                                 |
| SkillAnalysisView                | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                                     |
| SkillCreateWizard                | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                     |
| 共有型定義                       | `packages/shared/src/types/skill-improver.ts`                                                          |
| P31 Zustand 無限ループ対策       | `.claude/rules/06-known-pitfalls.md#P31`                                                               |
| P39 happy-dom userEvent 非互換   | `.claude/rules/06-known-pitfalls.md#P39`                                                               |

## テスト環境の前提条件

- テスト実行コマンド: `cd apps/desktop && pnpm vitest run`（P40 対策: モノレポではパッケージディレクトリから実行）
- テスト環境: happy-dom（`vitest.config.ts` で設定済み）
- イベント操作: `fireEvent` を使用（P39: `userEvent` は happy-dom で使用禁止）
- 状態リセット: `beforeEach` で全モック・状態をリセット（P9: テスト間リーク防止）
- Store モック: 個別セレクタをモック（P31: 合成 Store Hook の使用禁止）

## テストケース設計

### テストファイル 1: SkillManagementPanel 統合テスト

**ファイルパス**: `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx`

#### モック構成

```typescript
// Store 個別セレクタのモック（P31 対策: 合成 Hook を避ける）
vi.mock("../../../store", () => ({
  useImportedSkills: () => currentStoreState.importedSkills,
  useIsLoadingSkills: () => currentStoreState.isLoadingSkills,
  useSkillError: () => currentStoreState.skillError,
  useFetchSkills: () => currentStoreState.fetchSkills,
  useRemoveSkill: () => currentStoreState.removeSkill,
  useAnalyzeSkill: () => currentStoreState.analyzeSkill,
  useCurrentAnalysis: () => currentStoreState.currentAnalysis,
  useApplyImprovements: () => currentStoreState.applyImprovements,
  useAutoImprove: () => currentStoreState.autoImprove,
  useCreateSkill: () => currentStoreState.createSkill,
}));
```

#### テストケース一覧

| TC ID   | テストケース名                                        | 検証内容                                                                                      |
| ------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| TC-I-01 | analysis ビューで SkillAnalysisView が表示される      | `handleAnalyze` 呼び出し後、`data-testid="skill-analysis-view"` が DOM に存在する             |
| TC-I-02 | analysis ビューにスキル名が渡される                   | SkillAnalysisView に `skillName` props として選択されたスキル名が渡されている                 |
| TC-I-03 | create ビューで SkillCreateWizard が表示される        | 新規作成ボタンクリック後、`data-testid="skill-create-wizard"` が DOM に存在する               |
| TC-I-04 | analysis ビューから戻るボタンでリストビューに戻る     | analysis ビューで「戻る」クリック後、`data-testid="skill-management-panel-list"` が表示される |
| TC-I-05 | create ビューから戻るボタンでリストビューに戻る       | create ビューで「キャンセル」操作後、`data-testid="skill-management-panel-list"` が表示される |
| TC-I-06 | create 完了後にスキルリストが更新される               | SkillCreateWizard の onComplete コールバック発火後、`fetchSkills` が呼ばれる                  |
| TC-I-07 | analysis ビューで改善適用後にスキルリストが更新される | 改善適用のコールバック発火後、`fetchSkills` が呼ばれる                                        |

#### テストコード構造

```typescript
describe("SkillManagementPanel Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentStoreState = { ...defaultStoreState };
  });

  afterEach(() => {
    cleanup();
  });

  describe("analysis ビュー統合", () => {
    it("TC-I-01: analysis ビューで SkillAnalysisView が表示される", async () => {
      currentStoreState.importedSkills = [mockSkill];
      render(<SkillManagementPanel />);
      const analyzeButton = screen.getByLabelText(`${mockSkill.name} を分析`);
      await act(async () => {
        fireEvent.click(analyzeButton);
      });
      expect(screen.getByTestId("skill-analysis-view")).toBeDefined();
    });

    // TC-I-02, TC-I-04, TC-I-07 同様のパターン
  });

  describe("create ビュー統合", () => {
    it("TC-I-03: create ビューで SkillCreateWizard が表示される", async () => {
      render(<SkillManagementPanel />);
      const createButton = screen.getByText("新規作成");
      await act(async () => {
        fireEvent.click(createButton);
      });
      expect(screen.getByTestId("skill-create-wizard")).toBeDefined();
    });

    // TC-I-05, TC-I-06 同様のパターン
  });
});
```

---

### テストファイル 2: agentSlice スキルライフサイクルアクションテスト

**ファイルパス**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts`

#### モック構成

```typescript
// window.electronAPI.skill のモック
const mockElectronAPI = {
  skill: {
    analyze: vi.fn(),
    create: vi.fn(),
    applyImprovements: vi.fn(),
    autoImprove: vi.fn(),
    list: vi.fn().mockResolvedValue([]),
    getImported: vi.fn().mockResolvedValue([]),
    // 既存モックは省略
  },
};

beforeEach(() => {
  (window as unknown as { electronAPI: typeof mockElectronAPI }).electronAPI =
    mockElectronAPI;
  vi.clearAllMocks();
});
```

#### テストケース一覧

| TC ID    | テストケース名                                                    | 検証内容                                                                                        |
| -------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| TC-SL-01 | analyzeSkill アクションが IPC 経由で分析結果を取得する            | `window.electronAPI.skill.analyze(skillName)` が呼ばれ、戻り値が `currentAnalysis` に保存される |
| TC-SL-02 | analyzeSkill 実行中に isAnalyzing が true になる                  | アクション開始時 `isAnalyzing: true`、完了時 `isAnalyzing: false` に遷移する                    |
| TC-SL-03 | analyzeSkill 失敗時にエラーが skillError に設定される             | IPC 失敗時、`skillError` に `"スキル分析に失敗しました"` が設定される                           |
| TC-SL-04 | applyImprovements アクションが選択サジェスション付きで IPC を呼ぶ | `window.electronAPI.skill.applyImprovements(skillName, indices)` が正しい引数で呼ばれる         |
| TC-SL-05 | applyImprovements 成功後に currentAnalysis がクリアされる         | 改善適用成功後、`currentAnalysis` が `null` にリセットされる                                    |
| TC-SL-06 | autoImprove アクションが IPC 経由で自動改善を実行する             | `window.electronAPI.skill.autoImprove(skillName)` が呼ばれる                                    |
| TC-SL-07 | createSkill アクションが IPC 経由でスキルを作成する               | `window.electronAPI.skill.create(params)` が正しいパラメータで呼ばれる                          |
| TC-SL-08 | createSkill 成功後に fetchSkills が呼ばれスキルリストが更新される | 作成成功後、`fetchSkills` が自動で呼ばれ、スキルリストが最新状態になる                          |
| TC-SL-09 | createSkill 失敗時にエラーが skillError に設定される              | IPC 失敗時、`skillError` に `"スキル作成に失敗しました"` が設定される                           |
| TC-SL-10 | applyImprovements 失敗時にエラーが skillError に設定される        | IPC 失敗時、`skillError` に `"改善の適用に失敗しました"` が設定される                           |

#### テストコード構造

```typescript
describe("agentSlice skill-lifecycle actions", () => {
  let store: AgentSlice;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestSlice();
    setupMockElectronAPI();
  });

  describe("analyzeSkill", () => {
    it("TC-SL-01: IPC 経由で分析結果を取得する", async () => {
      const mockAnalysis = createMockAnalysis();
      mockElectronAPI.skill.analyze.mockResolvedValue(mockAnalysis);
      await store.analyzeSkill("test-skill");
      expect(mockElectronAPI.skill.analyze).toHaveBeenCalledWith("test-skill");
      expect(store.currentAnalysis).toEqual(mockAnalysis);
    });
  });

  describe("createSkill", () => {
    it("TC-SL-07: IPC 経由でスキルを作成する", async () => {
      const params = { name: "new-skill", description: "Test" };
      mockElectronAPI.skill.create.mockResolvedValue({ success: true });
      await store.createSkill(params);
      expect(mockElectronAPI.skill.create).toHaveBeenCalledWith(params);
    });
  });

  // 他のテストケース同様のパターン
});
```

---

### テストファイル 3: 個別セレクタ安定性テスト

**ファイルパス**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle-selectors.test.ts`

#### テストケース一覧

| TC ID    | テストケース名                                | 検証内容                                                                           |
| -------- | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| TC-SS-01 | useAnalyzeSkill が安定した関数参照を返す      | 2回連続で取得した参照が `===` で一致する（P31 対策: Zustand アクション参照は安定） |
| TC-SS-02 | useCurrentAnalysis が分析結果を正しく返す     | Store に設定した `currentAnalysis` の値が正確に返される                            |
| TC-SS-03 | useApplyImprovements が安定した関数参照を返す | 2回連続で取得した参照が `===` で一致する                                           |
| TC-SS-04 | useAutoImprove が安定した関数参照を返す       | 2回連続で取得した参照が `===` で一致する                                           |
| TC-SS-05 | useCreateSkill が安定した関数参照を返す       | 2回連続で取得した参照が `===` で一致する                                           |
| TC-SS-06 | useIsAnalyzing が分析中フラグを正しく返す     | Store に設定した `isAnalyzing` の boolean 値が正確に返される                       |

#### テストコード構造

```typescript
describe("agentSlice skill-lifecycle selectors (P31 stability)", () => {
  beforeEach(() => {
    setupMockElectronAPI();
  });

  it("TC-SS-01: useAnalyzeSkill が安定した関数参照を返す", () => {
    const { result, rerender } = renderHook(() => useAnalyzeSkill());
    const first = result.current;
    rerender();
    const second = result.current;
    expect(first).toBe(second); // 参照が同一であること
  });

  it("TC-SS-02: useCurrentAnalysis が分析結果を正しく返す", () => {
    const mockAnalysis = createMockAnalysis();
    useAppStore.setState({ currentAnalysis: mockAnalysis });
    const { result } = renderHook(() => useCurrentAnalysis());
    expect(result.current).toEqual(mockAnalysis);
  });
});
```

---

### テストファイル 4: ChatPanel スキル管理アクセステスト

**ファイルパス**: `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`

#### モック構成

```typescript
// Store 個別セレクタ + ナビゲーション のモック
vi.mock("../../../store", () => ({
  useSelectedSkillName: () => currentStoreState.selectedSkillName,
  useStreamingMessages: () => currentStoreState.streamingMessages,
  useIsSkillExecuting: () => currentStoreState.isExecuting,
  useSkillExecutionStatus: () => currentStoreState.skillExecutionStatus,
  usePendingSkillPermission: () => currentStoreState.pendingPermission,
  // その他既存セレクタ
}));
```

#### テストケース一覧

| TC ID    | テストケース名                                       | 検証内容                                                                             |
| -------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| TC-CP-01 | スキル管理ボタンが ChatPanel ヘッダーに表示される    | `data-testid="skill-management-button"` が DOM に存在する                            |
| TC-CP-02 | スキル管理ボタンクリックでスキル管理パネルへ遷移する | ボタンクリック後、ナビゲーション関数が `/advanced/skill-management-panel` で呼ばれる |
| TC-CP-03 | スキル実行中はスキル管理ボタンが無効化される         | `isExecuting: true` の場合、ボタンに `disabled` 属性が付与される                     |

#### テストコード構造

```typescript
describe("ChatPanel skill-management access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentStoreState = { ...defaultChatState };
  });

  afterEach(() => {
    cleanup();
  });

  it("TC-CP-01: スキル管理ボタンが表示される", () => {
    render(<ChatPanel />);
    expect(screen.getByTestId("skill-management-button")).toBeDefined();
  });

  it("TC-CP-02: スキル管理ボタンクリックで遷移する", async () => {
    render(<ChatPanel />);
    const button = screen.getByTestId("skill-management-button");
    await act(async () => {
      fireEvent.click(button);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/advanced/skill-management-panel");
  });
});
```

---

## テストデータ定義

### 共通モックデータ

```typescript
// 共通で使用するモックスキル
const mockSkill: ImportedSkill = {
  name: "test-skill",
  description: "テスト用スキル",
  version: "1.0.0",
  category: "general",
  importedAt: "2026-03-01T00:00:00Z",
};

// 共通で使用するモック分析結果
function createMockAnalysis(): SkillAnalysis {
  return {
    overallScore: 75,
    categories: [
      { name: "prompt", score: 80 },
      { name: "structure", score: 70 },
    ],
    suggestions: [
      {
        type: "prompt",
        priority: "high",
        description: "プロンプトの明確化が必要",
        autoFixable: true,
      },
    ],
    risks: [],
  };
}
```

## 統合テスト連携

- SkillManagementPanel 統合テストは、SkillAnalysisView と SkillCreateWizard のレンダリングを検証するが、内部ロジックの詳細テストは各コンポーネントの既存テストに委譲する
- agentSlice テストは IPC 呼び出しの正確性と状態遷移を検証し、Preload 層のテストとは独立して動作する
- ChatPanel テストはナビゲーション遷移のみを検証し、SkillManagementPanel 自体の動作テストとは独立する

## 成果物

| 種類         | パス                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------ |
| テストコード | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx` |
| テストコード | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts`            |
| テストコード | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle-selectors.test.ts`  |
| テストコード | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`        |

## 完了条件

- [ ] テストファイル 4 本が作成されている
- [ ] 全テストケース（TC-I-01〜07、TC-SL-01〜10、TC-SS-01〜06、TC-CP-01〜03）が実装されている
- [ ] `cd apps/desktop && pnpm vitest run` でテストが実行可能（Red 状態: 失敗は期待どおり）
- [ ] コンパイルエラー（型エラー）がない — 未実装のセレクタ・アクションはモックで対処
- [ ] happy-dom 環境で `fireEvent` を使用し、`userEvent` を使用していない（P39 対策）
- [ ] 各テストの `beforeEach` で状態がリセットされている（P9 対策）
- [ ] 個別セレクタの安定性テスト（TC-SS-01〜06）が P31 パターンを検証している

## 次のPhase

Phase 5: 実装 → `phase-5-implementation.md`
