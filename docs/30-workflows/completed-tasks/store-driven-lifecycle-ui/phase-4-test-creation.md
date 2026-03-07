# Phase 4: テスト作成（TDD: Red） — Store駆動ライフサイクルUI統合

## メタ情報

| 項目      | 値                         |
| --------- | -------------------------- |
| Phase     | 4                          |
| 機能名    | store-driven-lifecycle-ui  |
| タスクID  | TASK-10A-F                 |
| 作成日    | 2026-03-07                 |
| 前提Phase | Phase 1-3 完了             |
| 次Phase   | Phase 5（実装: TDD Green） |

## 目的

SkillCreateWizard と SkillAnalysisView（useSkillAnalysis）の直接 `window.electronAPI` 呼び出しを排除し、Zustand agentSlice の store action 経由に統一するためのテストをテストファーストで作成する。全テストが Red（失敗）状態であることを確認する。

## 参照資料

| 資料                                                                                            | 用途                                                                                                   |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts:849-959`                                  | store action 定義（analyzeSkill, applySkillImprovements, autoImproveSkill, createSkill）               |
| `apps/desktop/src/renderer/store/index.ts:625-649`                                              | 個別セレクタ定義（useAnalyzeSkill, useApplySkillImprovements, useAutoImproveSkill, useCreateSkill 等） |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                              | 現行実装（直接IPC呼び出し: L46）                                                                       |
| `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`                          | 現行実装（直接IPC呼び出し: L94, L140, L171）                                                           |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                           | 親コンポーネント（作成完了後の一覧同期）                                                               |
| `apps/desktop/src/renderer/components/skill/__tests__/helpers/mock-electron-api.ts`             | 既存モックヘルパー                                                                                     |
| `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts`           | store action 単体テスト（既存）                                                                        |
| `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle-selectors.test.ts` | セレクタ安定参照テスト（既存）                                                                         |

### 前提Phase成果物

| 資料名         | パス               | 用途                       |
| -------------- | ------------------ | -------------------------- |
| Phase 1 成果物 | `outputs/phase-1/` | 要件定義の出力を参照する   |
| Phase 2 成果物 | `outputs/phase-2/` | 設計の出力を参照する       |
| Phase 3 成果物 | `outputs/phase-3/` | 設計レビュー結果を参照する |

## 実行タスク

### Task 1: SkillCreateWizard Store統合テスト作成

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx`

既存の `SkillCreateWizard.test.tsx` は直接 `window.electronAPI.skill.create` をモックしている。新テストファイルでは store の `createSkill` action 経由でスキル作成が行われることを検証する。

#### テストケース一覧

```typescript
describe("SkillCreateWizard Store統合", () => {
  describe("store action 経由のスキル作成", () => {
    it(
      "「スキルを生成」クリックで store.createSkill が呼ばれる（window.electronAPI.skill.create は直接呼ばれない）",
    );
    it("store.createSkill に description と options が正しく渡される");
    it(
      "store.createSkill 成功後に Step 4（完了）に遷移し、生成パスが表示される",
    );
    it(
      "store.createSkill 失敗時にエラーメッセージが GenerateStep に表示される",
    );
    it(
      "store.createSkill 失敗時に Error 以外のオブジェクトでもフォールバックメッセージが表示される",
    );
    it(
      "生成中は isGenerating が true で GenerateStep にローディング状態が表示される",
    );
  });

  describe("作成完了後の一覧同期", () => {
    it(
      "store.createSkill 成功後に store.fetchSkills が呼ばれてスキル一覧が更新される",
    );
  });
});
```

#### モック設計

- `useCreateSkill` セレクタをモックし、返り値として `vi.fn()` を設定する
- `window.electronAPI.skill.create` が直接呼ばれないことを `expect(...).not.toHaveBeenCalled()` で検証する
- store action のモックは `vi.mock("../../store", ...)` で行い、個別セレクタ単位でモック関数を返す

### Task 2: SkillAnalysisView Store統合テスト作成

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx`

既存の `SkillAnalysisView.test.tsx` は `window.electronAPI.skill.analyze` 等を直接モックしている。新テストファイルでは store action 経由で分析・改善が行われることを検証する。

#### テストケース一覧

```typescript
describe("SkillAnalysisView Store統合", () => {
  describe("store action 経由の分析", () => {
    it(
      "マウント時に store.analyzeSkill が呼ばれる（window.electronAPI.skill.analyze は直接呼ばれない）",
    );
    it("store.analyzeSkill に skillName が正しく渡される");
    it("store の isAnalyzing が true のとき「分析中...」が表示される");
    it(
      "store の currentAnalysis が設定されると分析結果（スコア・提案・リスク）が表示される",
    );
    it(
      "store の skillError が設定されるとエラーメッセージが role='alert' で表示される",
    );
  });

  describe("store action 経由の改善適用", () => {
    it(
      "「選択を適用」クリックで store.applySkillImprovements が呼ばれる（window.electronAPI.skill.applyImprovements は直接呼ばれない）",
    );
    it(
      "store.applySkillImprovements に skillName と選択された suggestions が渡される",
    );
    it(
      "store の isImproving が true のとき適用ボタンと全自動改善ボタンが disabled になる",
    );
  });

  describe("store action 経由の全自動改善", () => {
    it(
      "「全自動改善」クリックで window.confirm 後に store.autoImproveSkill が呼ばれる（window.electronAPI.skill.autoImprove は直接呼ばれない）",
    );
    it("store.autoImproveSkill に skillName が渡される");
    it(
      "window.confirm でキャンセルした場合 store.autoImproveSkill は呼ばれない",
    );
  });

  describe("再試行フロー", () => {
    it("エラー表示後「再試行」クリックで store.analyzeSkill が再度呼ばれる");
    it("再試行成功後にエラーが消えて分析結果が表示される");
  });

  describe("提案選択のローカル状態管理", () => {
    it(
      "提案チェックボックスのトグルがローカル state で管理される（store を経由しない）",
    );
    it("「自動修正可能を選択」で autoFixable な提案のみが選択される");
  });
});
```

#### モック設計

- `useAnalyzeSkill`, `useApplySkillImprovements`, `useAutoImproveSkill`, `useCurrentAnalysis`, `useIsAnalyzingSkill`, `useIsImprovingSkill`, `useSkillError`, `useClearSkillError`, `useClearAnalysis` をモックする
- `window.electronAPI.skill.analyze`, `window.electronAPI.skill.applyImprovements`, `window.electronAPI.skill.autoImprove` が直接呼ばれないことを検証する

### Task 3: 状態遷移テスト作成

**ファイル**: Task 1・Task 2 の各テストファイル内に含める

#### テストケース一覧

```typescript
// SkillCreateWizard.store-integration.test.tsx 内
describe("状態遷移: idle → loading → success/error", () => {
  it("初期状態は idle（isGenerating: false, error: null）");
  it("生成開始で loading 状態（isGenerating: true）に遷移する");
  it("生成成功で success 状態（Step 4 表示）に遷移する");
  it("生成失敗で error 状態（エラーメッセージ表示）に遷移する");
});

// SkillAnalysisView.store-integration.test.tsx 内
describe("状態遷移: idle → analyzing → analyzed/error", () => {
  it("マウント直後に analyzing 状態に遷移する");
  it("分析完了で analyzed 状態（スコア表示）に遷移する");
  it("分析失敗で error 状態（アラート表示）に遷移する");
  it("改善適用中は improving 状態（ボタン disabled）に遷移する");
  it("改善完了で analyzed 状態に戻る（再分析結果が反映される）");
});
```

### Task 4: P31回帰テスト作成

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.p31-regression.test.tsx`

個別セレクタ（`useAnalyzeSkill` 等）の関数参照が安定しており、`useEffect` 依存配列に含めても無限ループしないことを検証する。

#### テストケース一覧

```typescript
describe("P31回帰: 個別セレクタの安定参照", () => {
  it("useAnalyzeSkill の返り値参照が re-render 間で同一（Object.is で true）");
  it("useApplySkillImprovements の返り値参照が re-render 間で同一");
  it("useAutoImproveSkill の返り値参照が re-render 間で同一");
  it("useCreateSkill の返り値参照が re-render 間で同一");
  it(
    "useAnalyzeSkill を useEffect 依存配列に含めた場合に無限ループしない（renderCount <= 3）",
  );
});
```

#### テスト手法

- `renderHook` でセレクタを呼び出し、`rerender()` 後に `result.current` の参照が前回と `===` で一致することを検証する
- `useEffect` 内のカウンタで renderCount をカウントし、3回以下であることを確認する（React StrictMode の2回 + 初回の1回 = 最大3回）

### Task 5: P48回帰テスト作成

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.p48-regression.test.tsx`

`useShallow` が必要な派生セレクタ（`.filter()` / `.map()` で新しい配列を返すセレクタ）が無限ループしないことを検証する。

#### テストケース一覧

```typescript
describe("P48回帰: useShallow 適用の派生セレクタが無限ループしない", () => {
  it(
    "useCurrentAnalysis が毎回新しいオブジェクト参照を返しても re-render が収束する",
  );
  it(
    "分析結果の suggestions 配列を .filter() で絞り込む派生セレクタが無限ループしない",
  );
});
```

#### テスト手法

- `renderHook` で派生セレクタを呼び出し、store を更新（`set({ currentAnalysis: ... })`）しても renderCount が有限回（10回以下）で収束することを `vi.useFakeTimers` + `advanceTimersByTime` で検証する（P13準拠: `runAllTimers` は使用しない）

### Task 6: アクセシビリティテスト作成

**ファイル**: Task 1・Task 2 の各テストファイル内に含める

#### テストケース一覧

```typescript
// SkillCreateWizard.store-integration.test.tsx 内
describe("アクセシビリティ", () => {
  it("StepIndicator に aria-label='ウィザードの進捗' が設定されている");
  it("生成中のステップに aria-busy='true' が設定される");
  it("エラーメッセージに role='alert' が設定される");
  it("「次へ」ボタンが disabled のとき aria-disabled 属性が反映される");
});

// SkillAnalysisView.store-integration.test.tsx 内
describe("アクセシビリティ", () => {
  it("エラーメッセージに role='alert' が設定される");
  it("閉じるボタンに aria-label='閉じる' が設定される");
  it("改善適用中のボタンに disabled 属性が設定される");
  it("チェックボックスに適切な aria-label が設定される");
  it("ローディング状態に aria-busy='true' が設定される");
});
```

## テスト環境設定

| 項目                 | 値                                                    |
| -------------------- | ----------------------------------------------------- |
| テストフレームワーク | Vitest                                                |
| UIテスト             | @testing-library/react + happy-dom                    |
| イベント発火         | fireEvent（P39準拠: userEvent 使用禁止）              |
| テスト実行           | `cd apps/desktop && pnpm vitest run`（P40準拠）       |
| カバレッジ           | v8 プロバイダ                                         |
| タイマー             | `vi.useFakeTimers` + `advanceTimersByTime`（P13準拠） |

## store モック戦略

### アプローチ: 個別セレクタモック

`vi.mock("../../store", ...)` で store モジュール全体をモックし、各セレクタが返す値を `beforeEach` で制御する。

```typescript
// モック例
const mockAnalyzeSkill = vi.fn();
const mockApplySkillImprovements = vi.fn();
const mockAutoImproveSkill = vi.fn();
const mockCreateSkill = vi.fn();

vi.mock("../../../store", () => ({
  useAnalyzeSkill: () => mockAnalyzeSkill,
  useApplySkillImprovements: () => mockApplySkillImprovements,
  useAutoImproveSkill: () => mockAutoImproveSkill,
  useCreateSkill: () => mockCreateSkill,
  useCurrentAnalysis: () => mockCurrentAnalysis,
  useIsAnalyzingSkill: () => mockIsAnalyzing,
  useIsImprovingSkill: () => mockIsImproving,
  useSkillError: () => mockSkillError,
  useClearSkillError: () => mockClearSkillError,
  useClearAnalysis: () => mockClearAnalysis,
}));
```

### 直接IPC呼び出し検証

各テストファイルで `window.electronAPI` をスパイし、直接呼び出しがないことを検証する。

```typescript
const spyAnalyze = vi.fn();
beforeEach(() => {
  (window as Record<string, unknown>).electronAPI = {
    skill: {
      analyze: spyAnalyze,
      applyImprovements: vi.fn(),
      autoImprove: vi.fn(),
      create: vi.fn(),
    },
  };
});

// テスト内
expect(spyAnalyze).not.toHaveBeenCalled();
```

## 成果物

| 成果物                            | パス                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| SkillCreateWizard Store統合テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx` |
| SkillAnalysisView Store統合テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx` |
| P31回帰テスト                     | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.p31-regression.test.tsx`    |
| P48回帰テスト                     | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.p48-regression.test.tsx`    |

## 完了条件

- [ ] Task 1: SkillCreateWizard Store統合テスト（7テストケース）が作成されている
- [ ] Task 2: SkillAnalysisView Store統合テスト（14テストケース）が作成されている
- [ ] Task 3: 状態遷移テスト（9テストケース）が Task 1・Task 2 内に含まれている
- [ ] Task 4: P31回帰テスト（5テストケース）が作成されている
- [ ] Task 5: P48回帰テスト（2テストケース）が作成されている
- [ ] Task 6: アクセシビリティテスト（9テストケース）が Task 1・Task 2 内に含まれている
- [ ] 全テストが Red 状態（実装が未変更のため失敗する）であることを `cd apps/desktop && pnpm vitest run` で確認済み
- [ ] `window.electronAPI` の直接呼び出しを検証するスパイが全テストに含まれている
- [ ] テストファイル冒頭に P39/P40/P9/P13 準拠コメントが記載されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 5: 実装（TDD: Green）へ進む。
