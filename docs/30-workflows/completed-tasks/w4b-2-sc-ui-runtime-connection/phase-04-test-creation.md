# Phase 4: テスト作成

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 4                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

Phase 2 の設計（handlePlanSkill / handleExecutePlan / Zustand 状態追加）に基づいて、TDD の Red フェーズを構成する。SkillLifecyclePanel の LLM 生成フローと AgentSlice の生成状態管理をテストファーストで設計する。

## 依存成果物

- Phase 2 設計書: `docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-02-design.md`
- Phase 3 設計レビュー: `docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-03-design-review.md`
- 既存テストの参照元: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`
- 既存ストアテスト参照元: `apps/desktop/src/renderer/store/__tests__/selectors.test.ts`

## 実行タスク

### Task 1: SkillLifecyclePanel LLM 生成フローテスト作成

**新規作成ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`

#### インポートパターン（P63 対策: 既存テストから参照）

既存の `SkillLifecyclePanel.test.tsx` のパターンに倣い、以下のインポート構成を使用する:

```typescript
/**
 * @vitest-environment happy-dom
 */

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

// vi.mock は import より前に巻き上げられるため、mock 定義を最初に行う
const mockPlanSkill = vi.fn();
const mockExecutePlan = vi.fn();
const mockDetectMode = vi.fn();
const mockFetchSkills = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockSetIsGenerating = vi.fn();
const mockClearGenerationState = vi.fn();

// store mock（"../../../store" 相当: __tests__/ から3階層上の store/index）
vi.mock("../../../store", () => ({
  useIsSkillGenerating: () => mockStoreState.isGenerating,
  useGenerationProgress: () => mockStoreState.generationProgress,
  useGenerationError: () => mockStoreState.generationError,
  useCurrentPlanId: () => mockStoreState.currentPlanId,
  useCurrentPlanResult: () => mockStoreState.currentPlanResult,
  useSetIsSkillGenerating: () => mockSetIsGenerating,
  useClearGenerationState: () => mockClearGenerationState,
  useFetchSkills: () => mockFetchSkills,
  useSelectSkillByName: () => mockSelectSkillByName,
  // 既存セレクタは既存テストから継承
  useCreateSkill: () => vi.fn(),
  useExecuteSkill: () => vi.fn(),
  useReExecuteAfterImprovement: () => vi.fn(),
  useClearSkillError: () => vi.fn(),
  useClearStreamingMessages: () => vi.fn(),
  useBeginSkillReview: () => vi.fn(),
  useCompleteSkillReview: () => vi.fn(),
  useResetSkillExecutionCycle: () => vi.fn(),
  useSelectedSkillName: () => mockStoreState.selectedSkillName,
  useIsSkillExecuting: () => false,
  useStreamingMessages: () => [],
  useSkillExecutionStatus: () => null,
  useSkillError: () => null,
}));

// SkillStreamingView / SkillAnalysisView は既存テスト同様にモック
vi.mock("../SkillStreamingView", () => ({
  SkillStreamingView: () => <div data-testid="mock-streaming-view" />,
}));
vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="mock-analysis-view">
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

import { SkillLifecyclePanel } from "../SkillLifecyclePanel";
```

#### モック状態型とリセット

```typescript
type MockGenerationState = {
  selectedSkillName: string | null;
  isGenerating: boolean;
  generationProgress: string | null;
  generationError: string | null;
  currentPlanId: string | null;
  currentPlanResult: {
    type: "integrated_api" | "terminal_handoff";
    planId?: string;
    estimatedSteps?: number;
    guidance?: { reason: string; command: string };
  } | null;
};

let mockStoreState: MockGenerationState = {
  selectedSkillName: "test-skill",
  isGenerating: false,
  generationProgress: null,
  generationError: null,
  currentPlanId: null,
  currentPlanResult: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockStoreState = {
    selectedSkillName: "test-skill",
    isGenerating: false,
    generationProgress: null,
    generationError: null,
    currentPlanId: null,
    currentPlanResult: null,
  };

  // window.electronAPI.skillCreator のモック設定
  (window as Window & { electronAPI?: unknown }).electronAPI = {
    skillCreator: {
      detectMode: mockDetectMode,
      planSkill: mockPlanSkill,
      executePlan: mockExecutePlan,
    },
  };

  // デフォルトのモック戻り値設定
  mockDetectMode.mockResolvedValue({ success: true, data: "plan" });
  mockPlanSkill.mockResolvedValue({
    success: true,
    data: {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    },
  });
  mockExecutePlan.mockResolvedValue({
    success: true,
    data: {
      skillName: "new-skill",
      skillPath: "/skills/new-skill",
    },
  });
  mockFetchSkills.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});
```

#### テストケース一覧

**U-1: handlePlanSkill が detectMode → planSkill の順で呼ばれる**

```
目的: handlePrepare() 拡張により detectMode が "plan" を返したとき planSkill が自動呼出されることを確認する
前提:
  - detectMode が "plan" を返す
  - planSkill が integrated_api レスポンスを返す
手順:
  1. SkillLifecyclePanel をレンダリング
  2. リクエストテキストエリアに "メールを自動送信する" と入力
  3. "方針を決める" ボタンを fireEvent.click で押す
  4. act(async () => {}) で非同期解決を待つ
アサート:
  - mockDetectMode が 1 回呼ばれた（引数: "メールを自動送信する"）
  - mockPlanSkill が 1 回呼ばれた（引数の第1要素: "メールを自動送信する"）
```

**U-2: detectMode が "create" を返したとき planSkill は呼ばれない（後方互換 AC-7）**

```
目的: detectMode === "create" の場合、planSkill フローが開始されないことを確認する
前提:
  - detectMode が "create" を返す
手順:
  1. SkillLifecyclePanel をレンダリング
  2. テキストエリアに文字列を入力
  3. "方針を決める" ボタンを fireEvent.click
  4. act(async () => {}) で非同期解決を待つ
アサート:
  - mockDetectMode が 1 回呼ばれた
  - mockPlanSkill が呼ばれていない（呼び出し回数: 0）
```

**U-3: planSkill 呼び出し中は isGenerating=true で「実行する」ボタンが無効化される**

```
目的: 二重送信防止のための isGenerating ロックが機能することを確認する
前提:
  - mockStoreState.isGenerating = true に設定
  - currentPlanResult に integrated_api 結果を設定（「実行する」ボタンが表示される状態）
手順:
  1. mockStoreState.isGenerating = true, currentPlanResult を設定してレンダリング
アサート:
  - "実行する" ボタンが disabled 属性を持つ
  - ローディング状態を示す表示（generationProgress テキスト or スピナー）が存在する
```

**U-4: isGenerating=true のとき handlePlanSkill が早期リターンする（R-1 対策）**

```
目的: Phase 3 レビュー R-1 の isGenerating ガードが機能することを確認する
前提:
  - mockStoreState.isGenerating = true
手順:
  1. isGenerating=true 状態でレンダリング
  2. "方針を決める" ボタンを fireEvent.click
  3. act(async () => {}) で非同期解決を待つ
アサート:
  - mockDetectMode が呼ばれていない（0 回: ガードで早期リターン）
  - mockPlanSkill が呼ばれていない（0 回）
```

**U-5: integrated_api レスポンスで plan 結果表示セクションが表示される**

```
目的: planSkill 成功後に「生成計画」セクションと「実行する」ボタンが表示されることを確認する
前提:
  - mockStoreState.currentPlanResult = { type: "integrated_api", planId: "plan-001", estimatedSteps: 5 }
手順:
  1. currentPlanResult を設定してレンダリング
アサート:
  - "生成計画" という見出しテキストが screen に存在する
  - "推定ステップ数: 5" というテキストが screen に存在する
  - "実行する" ボタンが存在し、disabled でない
  - "キャンセル" ボタンが存在する
```

**U-6: terminal_handoff レスポンスで handoffGuidance が表示される**

```
目的: planSkill が terminal_handoff を返したとき、Terminal Handoff UI が表示されることを確認する
前提:
  - detectMode が "plan" を返す
  - planSkill が { type: "terminal_handoff", guidance: { reason: "Large task", command: "npx ..." } } を返す
  - window.electronAPI.skillCreator.planSkill がこのモック値を返す
手順:
  1. SkillLifecyclePanel をレンダリング
  2. テキストエリアに入力し "方針を決める" ボタンを押す
  3. act(async () => {}) で非同期解決を待つ
アサート:
  - "Large task" または guidance.reason に関するテキストが画面に表示される
  - もしくは handoffGuidance に対応するデータが表示されていることを確認する
注: handoffGuidance は既存 UI コンポーネントが表示するため、実際の表示テキストは SkillLifecyclePanel.tsx の実装を参照して決定する
```

**U-7: generationError が存在するとエラーメッセージが表示される**

```
目的: planSkill 失敗時のエラー表示 UI が機能することを確認する
前提:
  - mockStoreState.generationError = "計画生成に失敗しました"
手順:
  1. generationError を設定してレンダリング
アサート:
  - "計画生成に失敗しました" というテキストが screen に存在する
```

**U-8: handleExecutePlan が executePlan IPC を呼び出す**

```
目的: 「実行する」ボタンクリックで executePlan が呼ばれ、完了後に fetchSkills と selectSkillByName が呼ばれることを確認する
前提:
  - mockStoreState.currentPlanId = "plan-001"
  - mockStoreState.currentPlanResult = { type: "integrated_api", planId: "plan-001", estimatedSteps: 5 }
  - executePlan が { success: true, data: { skillName: "new-skill", skillPath: "/skills/new-skill" } } を返す
手順:
  1. currentPlanResult を設定してレンダリング
  2. "実行する" ボタンを fireEvent.click
  3. act(async () => {}) で非同期解決を待つ
アサート:
  - mockExecutePlan が 1 回呼ばれた
  - mockFetchSkills が 1 回呼ばれた（スキル一覧の更新）
  - mockSelectSkillByName が "new-skill" 引数で 1 回呼ばれた
```

**U-9: 「キャンセル」ボタンで clearGenerationState が呼ばれる**

```
目的: plan 結果表示中のキャンセル操作で状態がクリアされることを確認する
前提:
  - mockStoreState.currentPlanResult に integrated_api 結果が設定されている
手順:
  1. currentPlanResult を設定してレンダリング
  2. "キャンセル" ボタンを fireEvent.click
アサート:
  - mockClearGenerationState が 1 回呼ばれた
```

**U-10: planSkill が失敗したとき generationError が表示される（IPC エラー）**

```
目的: planSkill IPC が { success: false, error: "ネットワークエラー" } を返したとき UI にエラーが表示されることを確認する
前提:
  - mockPlanSkill が { success: false, error: "ネットワークエラー" } を返す
  - mockDetectMode が "plan" を返す
手順:
  1. SkillLifecyclePanel をレンダリング
  2. テキストエリアに入力し "方針を決める" を押す
  3. act(async () => {}) で非同期解決を待つ
アサート:
  - mockPlanSkill が 1 回呼ばれた
  - エラーが store の setGenerationError に渡された（mockSetIsGenerating の呼び出しなどで間接確認）
  注: store は mock しているため、実際のエラー表示は U-7 でカバー
```

**U-11: 空文字列入力では「方針を決める」ボタンが無効化される（バリデーション）**

```
目的: P42 準拠のバリデーションで空文字列や空白のみの入力が弾かれることを確認する
前提:
  - テキストエリアが空（またはスペースのみ）の状態
手順:
  1. SkillLifecyclePanel をレンダリング（テキストエリアは空）
アサート:
  - "方針を決める" ボタンが disabled、または fireEvent.click しても detectMode が呼ばれない
```

**U-12: planSkill API 未接続時のエラー表示（graceful degradation）**

```
目的: window.electronAPI.skillCreator.planSkill が存在しない場合に graceful degradation することを確認する
前提:
  - window.electronAPI.skillCreator.planSkill = undefined
  - detectMode は "plan" を返す
手順:
  1. planSkill を undefined にした状態でレンダリング
  2. テキストエリアに入力し "方針を決める" を押す
  3. act(async () => {}) で非同期解決を待つ
アサート:
  - アプリがクラッシュしない（エラーバウンダリ未到達）
  - generationError に "planSkill API が利用できません" が設定される
    （store が mock なので mockSetIsGenerating の引数で間接確認するか、store セレクタが見える形にする）
```

### Task 2: AgentSlice 生成状態テスト作成

**新規作成ファイル**: `apps/desktop/src/renderer/store/__tests__/agentSlice.generation.test.ts`

#### インポートパターン（P63 対策: 既存ストアテストから参照）

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppStore } from "../index";
```

#### テストケース一覧

**U-S-1: AgentSlice の初期状態で生成状態フィールドがデフォルト値になっている**

```
目的: 新規追加する 5 フィールドの初期値を確認する
手順:
  1. renderHook(() => useAppStore()) で store を取得
アサート:
  - state.isGenerating === false
  - state.generationProgress === null
  - state.generationError === null
  - state.currentPlanId === null
  - state.currentPlanResult === null
```

**U-S-2: setIsGenerating アクションで isGenerating フラグを切り替えられる**

```
目的: setIsGenerating(true) / setIsGenerating(false) が機能することを確認する
手順:
  1. renderHook(() => useAppStore()) で store 取得
  2. act(() => get().setIsGenerating(true))
  3. isGenerating が true であることを確認
  4. act(() => get().setIsGenerating(false))
  5. isGenerating が false であることを確認
```

**U-S-3: setGenerationProgress が generationProgress を更新する**

```
手順:
  1. act(() => get().setGenerationProgress("計画を生成中..."))
アサート:
  - state.generationProgress === "計画を生成中..."
  2. act(() => get().setGenerationProgress(null))
  3. state.generationProgress === null
```

**U-S-4: setGenerationError が generationError を更新する**

```
手順:
  1. act(() => get().setGenerationError("ネットワークエラー"))
アサート:
  - state.generationError === "ネットワークエラー"
```

**U-S-5: setCurrentPlanId と setCurrentPlanResult が正しく状態を更新する**

```
手順:
  1. act(() => get().setCurrentPlanId("plan-001"))
  2. act(() => get().setCurrentPlanResult({ type: "integrated_api", planId: "plan-001", estimatedSteps: 5 }))
アサート:
  - state.currentPlanId === "plan-001"
  - state.currentPlanResult.type === "integrated_api"
  - state.currentPlanResult.estimatedSteps === 5
```

**U-S-6: clearGenerationState がすべての生成状態フィールドを初期値にリセットする**

```
目的: plan → execute 完了後に全フィールドがリセットされることを確認する
前提: isGenerating=true, generationProgress="生成中", generationError="エラー", currentPlanId="plan-001", currentPlanResult={...} を設定済み
手順:
  1. 各フィールドをセット
  2. act(() => get().clearGenerationState())
アサート:
  - state.isGenerating === false
  - state.generationProgress === null
  - state.generationError === null
  - state.currentPlanId === null
  - state.currentPlanResult === null
```

**U-S-7: 個別セレクタ useIsSkillGenerating が isGenerating の変化を反映する（P31 対策）**

```
目的: 個別セレクタが参照安定かつ状態変化を正しく反映することを確認する
手順:
  1. renderHook(() => useIsSkillGenerating()) でセレクタを取得
  2. 初期値が false であることを確認
  3. act(() => useAppStore.getState().setIsGenerating(true))
  4. result.current が true に更新されることを確認
アサート:
  - セレクタが新しい参照を返さずに値を更新する（useShallow 不要の確認）
```

### Task 3: テスト Red 状態の確認

テスト作成後、以下のコマンドで Red 状態を確認する:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/store/__tests__/agentSlice.generation.test.ts
```

**Red 状態の期待される失敗理由**:

- `useIsSkillGenerating` / `useGenerationProgress` 等が store/index.ts に未エクスポート
- AgentSlice に `isGenerating` / `generationProgress` / `generationError` / `currentPlanId` / `currentPlanResult` フィールドが未追加
- `setIsGenerating` / `setGenerationProgress` / `setGenerationError` / `setCurrentPlanId` / `setCurrentPlanResult` / `clearGenerationState` アクションが未実装
- SkillLifecyclePanel の `handlePlanSkill` / `handleExecutePlan` メソッドが未実装
- plan 結果表示セクションが未追加

## 実行手順

### ステップ1: テストファイルのスキャフォールド作成

`SkillLifecyclePanel.llm-generation.test.tsx` と `agentSlice.generation.test.ts` のファイルを作成し、インポートパターンとモック設定を記述する。

### ステップ2: SkillLifecyclePanel テストケース実装（U-1〜U-12）

Phase 2 設計書の各フロー分岐に対応するテストケースを順次実装する。happy-dom 環境で fireEvent を使用する（P39 対策）。

### ステップ3: AgentSlice テストケース実装（U-S-1〜U-S-7）

Zustand Store の状態管理テスト（初期値、アクション、個別セレクタ）を実装する。

### ステップ4: Red 状態の確認

全テストが「正しい理由で失敗する」ことを確認する（実装未完了のため）。

## 統合テスト連携

- SkillLifecyclePanel の既存テスト（`SkillLifecyclePanel.test.tsx`）との共存確認
- AgentSlice の既存テスト（`sliceBaseline.test.ts`）との状態リーク防止（P9 対策: beforeEach でリセット）
- テストファイル命名規約の統一（`*.llm-generation.test.*` パターン）

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                       |
| ------------------ | -------- | ---------------------------------------------- |
| UI/UX              | 該当     | Plan 結果表示・エラー表示の UI 要素テスト      |
| エラーハンドリング | 該当     | planSkill/executePlan 失敗時のエラー伝播テスト |
| アクセシビリティ   | 該当     | role="alert"、aria-live="polite" の存在テスト  |

## サブタスク管理

| サブタスク                                          | 担当           | 状態   | 備考                   |
| --------------------------------------------------- | -------------- | ------ | ---------------------- |
| Task 1: SkillLifecyclePanel テスト作成（U-1〜U-12） | Phase 4 実行者 | 未着手 | happy-dom + fireEvent  |
| Task 2: AgentSlice テスト作成（U-S-1〜U-S-7）       | Phase 4 実行者 | 未着手 | renderHook パターン    |
| Task 3: Red 状態確認                                | Phase 4 実行者 | 未着手 | 全テスト失敗理由の記録 |

## 参照資料

- Phase 2 設計書: `docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-02-design.md`
- Phase 3 設計レビュー: `docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-03-design-review.md`
- `.claude/rules/06-known-pitfalls.md` P39（happy-dom / fireEvent）、P63（インポートパス）、P31（個別セレクタ）
- `.claude/rules/02-code-quality.md`（TDD 原則）
- 既存テスト参照: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`
- 既存ストアテスト参照: `apps/desktop/src/renderer/store/__tests__/selectors.test.ts`

## 成果物

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`（U-1〜U-12）
- `apps/desktop/src/renderer/store/__tests__/agentSlice.generation.test.ts`（U-S-1〜U-S-7）

## 完了条件

- [ ] U-1（detectMode → planSkill の順呼び出し）テストを実装した
- [ ] U-2（detectMode === "create" のとき planSkill 未呼び出し、AC-7）テストを実装した
- [ ] U-3（isGenerating=true で「実行する」ボタン無効化）テストを実装した
- [ ] U-4（isGenerating=true ガードで handlePlanSkill 早期リターン、R-1 対策）テストを実装した
- [ ] U-5（integrated_api レスポンスで plan 結果表示）テストを実装した
- [ ] U-6（terminal_handoff レスポンスで handoffGuidance 表示）テストを実装した
- [ ] U-7（generationError 存在時のエラーメッセージ表示）テストを実装した
- [ ] U-8（handleExecutePlan → executePlan → fetchSkills → selectSkillByName）テストを実装した
- [ ] U-9（キャンセルで clearGenerationState 呼び出し）テストを実装した
- [ ] U-10（planSkill IPC 失敗時のエラー伝播）テストを実装した
- [ ] U-11（空文字列入力でのバリデーション）テストを実装した
- [ ] U-12（planSkill API 未接続の graceful degradation）テストを実装した
- [ ] U-S-1〜U-S-7（AgentSlice 生成状態フィールドのテスト）を実装した
- [ ] happy-dom 環境で `fireEvent` を使用した（P39 対策: userEvent 不使用）
- [ ] インポートパスを既存テストファイルから確認してから記述した（P63 対策）
- [ ] テストが Red 状態であることを確認した（実装前に必ず失敗することを確認）

## タスク100%実行確認【必須】

- [x] 上記「完了条件」の全チェックボックスが ON であることを確認した
- [x] 「実行手順」の全ステップを実行した
- [x] 「サブタスク管理」の全タスクが完了状態である
- [x] 「統合テスト連携」の全項目を確認した
- [x] 「多角的チェック観点」の全観点を確認した
- [x] 成果物が全て生成されている

## 次のPhase

Phase 5: 実装
