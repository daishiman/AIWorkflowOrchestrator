# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 4                         |
| タスクID | TASK-10A-F                |
| 機能名   | store-driven-lifecycle-ui |
| 作成日   | 2026-03-08                |

## 目的

SkillCreateWizard と SkillAnalysisView が store action 経由で動作し、`window.electronAPI` を直接呼び出さないことを検証するテストを先行作成する（Red Phase）。P31/P48 対策の回帰テストも含む。

## 実行タスク

- Store action 経由テストケースの設計（createSkill / analyzeSkill / applySkillImprovements / autoImproveSkill）
- 直接 IPC 呼び出し排除検証テストの設計
- P31 対策テスト: 個別セレクタが安定参照を返すことの検証
- P48 対策テスト: `useShallow` が必要な派生セレクタの無限ループ防止テスト
- 状態遷移テスト（idle → loading → success/error → idle）
- アクセシビリティテスト（ARIA 属性、disabled 状態管理）

## 参照資料

| 資料名               | パス                                                                                        | 説明                             |
| -------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 2 設計         | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`             | Store 統合設計詳細               |
| Phase 3 設計レビュー | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-3-design-review.md`      | 設計レビュー結果                 |
| 状態管理仕様         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | action/selector 責務分離         |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Store 駆動 UI パターン、P48 対策 |
| エラー仕様           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーステート定義               |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テスト・品質ゲート基準           |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender/P42/境界検証              |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                                        | P31/P39/P40/P48                  |

### 前 Phase 成果物

| 資料名         | パス                                                                                   | 用途               |
| -------------- | -------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-1-requirements.md`  | 要件定義を参照     |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`        | 設計を参照         |
| Phase 3 成果物 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-3-design-review.md` | レビュー指摘を反映 |

## 実行手順

### ステップ 1: 既存テスト構造の確認

1. 以下の既存テストファイルを確認し、モックパターンと `beforeEach` 構造を把握する:
   - `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`
   - `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`
   - `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx`
   - `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx`
2. 既存テストが store セレクタモック経由で動作していることを確認する
3. `window.electronAPI` のスパイパターン（afterEach で delete）を確認する

### ステップ 2: SkillCreateWizard Store 統合テストの拡充

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx`

以下のテストケースを追加する:

| テストID | テスト内容                                                                          | 対応要件           |
| -------- | ----------------------------------------------------------------------------------- | ------------------ |
| TC-CW-01 | `useCreateSkill` から返される関数が store action 経由で呼ばれる                     | 直接 IPC 排除      |
| TC-CW-02 | `window.electronAPI.skill.create` が直接呼ばれないことを検証                        | 直接 IPC 排除      |
| TC-CW-03 | 生成成功時: Step 0 → Step 1 → Step 2（生成中）→ Step 3（完了）の状態遷移            | 状態遷移           |
| TC-CW-04 | 生成失敗時: Step 2（生成中）に留まりエラーメッセージが表示される                    | エラーハンドリング |
| TC-CW-05 | `createSkill` が null/undefined を返した場合にフォールバックエラーが表示される      | エラーハンドリング |
| TC-CW-06 | 生成中（isGenerating === true）に「スキルを生成」ボタンが非活性になる               | UI 制御            |
| TC-CW-07 | `useCreateSkill` が安定参照を返すこと（P31 対策: 再レンダーで関数参照が変わらない） | P31 回帰テスト     |

**テスト骨格（TC-CW-02 の例）**:

```typescript
it("window.electronAPI.skill.create が直接呼ばれない", async () => {
  render(<SkillCreateWizard onClose={mockOnClose} />);
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "テスト" },
  });
  fireEvent.click(screen.getByRole("button", { name: "次へ" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
  });
  expect(mockCreateSkill).toHaveBeenCalledTimes(1);
  expect(spySkillCreate).not.toHaveBeenCalled();
});
```

### ステップ 3: SkillAnalysisView Store 統合テストの拡充

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx`

以下のテストケースを追加する:

| テストID | テスト内容                                                                                                        | 対応要件       |
| -------- | ----------------------------------------------------------------------------------------------------------------- | -------------- |
| TC-AV-01 | マウント時に `analyzeSkill` が store action 経由で呼ばれる                                                        | 直接 IPC 排除  |
| TC-AV-02 | `window.electronAPI.skill.analyze` が直接呼ばれないことを検証                                                     | 直接 IPC 排除  |
| TC-AV-03 | `applySkillImprovements` が store action 経由で呼ばれる                                                           | 直接 IPC 排除  |
| TC-AV-04 | `window.electronAPI.skill.applyImprovements` が直接呼ばれないことを検証                                           | 直接 IPC 排除  |
| TC-AV-05 | `autoImproveSkill` が store action 経由で呼ばれる                                                                 | 直接 IPC 排除  |
| TC-AV-06 | `window.electronAPI.skill.autoImprove` が直接呼ばれないことを検証                                                 | 直接 IPC 排除  |
| TC-AV-07 | 状態遷移: idle（`isAnalyzing=false`, `analysis=null`）→ loading（`isAnalyzing=true`）→ success（`analysis` 設定） | 状態遷移       |
| TC-AV-08 | 状態遷移: loading → error（`skillError` 設定）→ 再試行 → success                                                  | エラー回復     |
| TC-AV-09 | `isImproving=true` のとき「選択を適用」「全自動改善」ボタンが disabled                                            | UI 制御        |
| TC-AV-10 | `isAnalyzing=true` のとき「選択を適用」「全自動改善」ボタンが disabled                                            | UI 制御        |
| TC-AV-11 | `useAnalyzeSkill` / `useApplySkillImprovements` / `useAutoImproveSkill` が安定参照を返すこと（P31 対策）          | P31 回帰テスト |

**テスト骨格（TC-AV-08 の例）**:

```typescript
it("エラー状態から再試行で分析成功に遷移する", async () => {
  mockSkillError = "一時的なエラー";
  mockCurrentAnalysis = null;
  await act(async () => {
    render(
      <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
    );
  });
  expect(screen.getByRole("alert")).toHaveTextContent("一時的なエラー");

  // 再試行ボタンクリック
  mockSkillError = null;
  mockCurrentAnalysis = defaultAnalysis;
  await act(async () => {
    fireEvent.click(screen.getByText("再試行"));
  });
  expect(mockAnalyzeSkill).toHaveBeenCalledWith("test-skill");
});
```

### ステップ 4: useSkillAnalysis フック単体テストの作成

**テストファイル（新規）**: `apps/desktop/src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts`

| テストID | テスト内容                                                                            | 対応要件           |
| -------- | ------------------------------------------------------------------------------------- | ------------------ |
| TC-UA-01 | `renderHook` で初期化時に `analyzeSkill` が呼ばれる                                   | 自動分析           |
| TC-UA-02 | `handleToggleSuggestion` で選択/選択解除がトグルする                                  | ローカル状態管理   |
| TC-UA-03 | `handleSelectAutoFixable` で `autoFixable=true` の提案のみ選択される                  | 一括選択           |
| TC-UA-04 | `handleApplySelected` で選択済み提案が `applySkillImprovements` に渡される            | 改善適用           |
| TC-UA-05 | `handleAutoImprove` で `window.confirm(true)` のとき `autoImproveSkill` が呼ばれる    | 全自動改善         |
| TC-UA-06 | `handleAutoImprove` で `window.confirm(false)` のとき `autoImproveSkill` が呼ばれない | キャンセル         |
| TC-UA-07 | `handleApplySelected` で `selectedSuggestions.size === 0` のとき早期リターンする      | バリデーション     |
| TC-UA-08 | `handleApplySelected` で `analysis === null` のとき早期リターンする                   | null ガード        |
| TC-UA-09 | `buildAutoFixableSelection` が `autoFixable=true` のインデックスのみ含む Set を返す   | ユーティリティ関数 |

**テスト骨格（TC-UA-01 の例）**:

```typescript
import { renderHook, act } from "@testing-library/react";
import { useSkillAnalysis } from "../hooks/useSkillAnalysis";

it("初期化時に analyzeSkill が呼ばれる", async () => {
  await act(async () => {
    renderHook(() => useSkillAnalysis("test-skill"));
  });
  expect(mockAnalyzeSkill).toHaveBeenCalledWith("test-skill");
});
```

### ステップ 5: P31/P48 回帰テスト

**テストファイル**: 各既存テストファイルに `describe("P31/P48 回帰テスト")` ブロックを追加

| テストID  | テスト内容                                                                     | 対応 Pitfall |
| --------- | ------------------------------------------------------------------------------ | ------------ |
| TC-P31-01 | `useCreateSkill` が複数レンダー間で同一参照を返す                              | P31          |
| TC-P31-02 | `useAnalyzeSkill` が複数レンダー間で同一参照を返す                             | P31          |
| TC-P31-03 | `useApplySkillImprovements` が複数レンダー間で同一参照を返す                   | P31          |
| TC-P31-04 | `useAutoImproveSkill` が複数レンダー間で同一参照を返す                         | P31          |
| TC-P31-05 | `useCurrentAnalysis` が同一オブジェクト参照を返す（state 未変更時）            | P31          |
| TC-P48-01 | 派生セレクタ（フィルタリング結果を返すセレクタ）が `useShallow` 適用で安定する | P48          |

**テスト骨格（TC-P31-01 の例）**:

```typescript
it("useCreateSkill が複数レンダー間で同一参照を返す（P31 対策）", () => {
  const { result, rerender } = renderHook(() => useCreateSkill());
  const firstRef = result.current;
  rerender();
  const secondRef = result.current;
  expect(firstRef).toBe(secondRef);
});
```

### ステップ 6: テスト実行と Red 確認

1. 以下のコマンドでテストを実行し、新規テストが Red（失敗）であることを確認する:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts
```

2. 既存テストが引き続き PASS であることを確認する:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx
```

**P40 準拠**: テストは `apps/desktop` ディレクトリから実行する。プロジェクトルートからの実行は禁止。

**P39 準拠**: `happy-dom` 環境では `userEvent` を使用しない。`fireEvent` と `act` のみ使用する。

## 統合テスト連携

### TASK-10A-G への引き渡し観点

Phase 4 で作成するテストは、TASK-10A-G（統合テスト）の基盤となる。以下の観点を Phase 6（テスト拡充）で追加する:

| 観点                 | 検証内容                                                        |
| -------------------- | --------------------------------------------------------------- |
| 作成後一覧同期       | `createSkill` 成功後に `fetchSkills` が呼ばれ一覧が更新される   |
| 改善後再分析         | `applySkillImprovements` 成功後に `analyzeSkill` が再実行される |
| 削除後一覧更新       | `removeSkill` 成功後に一覧から該当スキルが消える                |
| インポート後一覧同期 | `importSkill` 成功後に一覧に新スキルが表示される                |

## 多角的チェック観点

| 観点                 | 確認事項                                                                  |
| -------------------- | ------------------------------------------------------------------------- |
| 直接 IPC 排除        | `window.electronAPI` のスパイが 0 回呼び出しであることを全テストで検証    |
| P31 安定参照         | action セレクタが再レンダー間で `===` 同一参照を保つ                      |
| P48 派生セレクタ     | `useShallow` が必要なセレクタに適用されていることを無限ループテストで検証 |
| P39 テスト環境       | `happy-dom` 環境で `userEvent` を使用していないこと                       |
| P40 実行ディレクトリ | テスト実行コマンドが `apps/desktop` から実行されること                    |
| P9 状態リセット      | `beforeEach` で全モック状態がリセットされること                           |
| エラーカテゴリ       | ERR_3001（AI API Error）、ERR_4004（Network Error）の表示テスト           |
| a11y                 | `role="alert"` / `aria-label` / `disabled` 状態の検証                     |

## 成果物

| 成果物                                    | パス                                                                                                | 説明                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------- |
| SkillCreateWizard Store統合テスト（拡充） | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx` | TC-CW-01 〜 TC-CW-07              |
| SkillAnalysisView Store統合テスト（拡充） | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx` | TC-AV-01 〜 TC-AV-11              |
| useSkillAnalysis フック単体テスト（新規） | `apps/desktop/src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts`                     | TC-UA-01 〜 TC-UA-09              |
| P31/P48 回帰テスト                        | 各既存テストファイル内に追加                                                                        | TC-P31-01 〜 TC-P31-05, TC-P48-01 |

## 完了条件

- [ ] TC-CW-01 〜 TC-CW-07 のテストコードが作成されている
- [ ] TC-AV-01 〜 TC-AV-11 のテストコードが作成されている
- [ ] TC-UA-01 〜 TC-UA-09 のテストコードが作成されている
- [ ] TC-P31-01 〜 TC-P31-05, TC-P48-01 のテストコードが作成されている
- [ ] 全テストに `window.electronAPI` スパイが設定され、直接呼び出し 0 回を検証している
- [ ] P39 準拠: `userEvent` を使用していない（`fireEvent` + `act` のみ）
- [ ] P40 準拠: テスト実行コマンドが `apps/desktop` ディレクトリから実行される
- [ ] P9 準拠: `beforeEach` で全モック状態がリセットされている
- [ ] 新規テストが Red（失敗）状態で Phase 5 に引き渡される（TDD Red Phase 完了）
- [ ] 既存テストが引き続き PASS している

## 次の Phase

Phase 5: 実装（`docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-5-implementation.md`）
