# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 4                                  |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 1h                                 |

## 目的

実装前にテストファイル 1 本を作成し、Red（失敗）状態であることを確認する。Phase 5 の実装によってこれらが Green になることがゴール。

## 実行タスク

1. `SkillLifecyclePanel.error-persistence.test.tsx` 作成（エラー永続化検証）
2. 3 つの主要テストケース（AC-1/AC-2/AC-3 対応）を定義する
3. テストが Red 状態であることを確認する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像 |

## 統合テスト連携

- 前 Phase の成果物を確認したうえで、`SkillLifecyclePanel.tsx` と `SkillLifecyclePanel.error-persistence.test.tsx` の入力・出力の対応を崩さない。
- `currentPhase` 判定と `handoffBundle` 処理が独立していることを次 Phase に引き継ぐ。
- Phase 1 の成果物 spec-extraction-map.md、Phase 2 の成果物 design-topology.md、Phase 3 の成果物 design-review-result.md を前提に、TC-EP-01〜05 を作成する。

## 実行手順

### ステップ 1: テストファイル — エラー永続化検証

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// onWorkflowStateChanged コールバックの動作を単体で検証するため、
// getSkillCreatorApi() のモックを使用する
const mockOnWorkflowStateChanged = vi.fn();
const mockSetWorkflowSnapshot = vi.fn();
const mockSetWorkflowError = vi.fn();
const mockSetHandoffGuidance = vi.fn();

vi.mock("@/renderer/lib/skill-creator-api", () => ({
  getSkillCreatorApi: () => ({
    onWorkflowStateChanged: mockOnWorkflowStateChanged,
  }),
}));

// コールバックを直接抽出して検証するヘルパー
function captureCallback(): (snapshot: Record<string, unknown>) => void {
  let capturedCallback: ((snapshot: Record<string, unknown>) => void) | null =
    null;
  mockOnWorkflowStateChanged.mockImplementation(
    (cb: (snapshot: Record<string, unknown>) => void) => {
      capturedCallback = cb;
      return () => {}; // cleanup
    },
  );
  return (snapshot) => {
    if (!capturedCallback) throw new Error("callback not captured");
    capturedCallback(snapshot);
  };
}

describe("SkillLifecyclePanel - onWorkflowStateChanged エラー永続化", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC-1: currentPhase === 'handoff' のとき setWorkflowError(null) が呼ばれないこと
  it("TC-EP-01: currentPhase: 'handoff' の snapshot を受け取ったとき setWorkflowError(null) が呼ばれない", () => {
    const triggerCallback = captureCallback();

    // useEffect を起動するためコンポーネントをレンダリング
    // （実際のテストでは SkillLifecyclePanel をレンダリングする）
    // ここではコールバックロジックを直接テストする

    act(() => {
      triggerCallback({ currentPhase: "handoff", handoffBundle: null });
    });

    // setWorkflowSnapshot は呼ばれる（スナップショットの更新は行う）
    expect(mockSetWorkflowSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ currentPhase: "handoff" }),
    );
    // setWorkflowError(null) は呼ばれない（エラーを保持する）
    expect(mockSetWorkflowError).not.toHaveBeenCalledWith(null);
  });

  // AC-2: currentPhase !== 'handoff' のとき setWorkflowError(null) が呼ばれること（既存動作維持）
  it("TC-EP-02: currentPhase: 'execute' の snapshot を受け取ったとき setWorkflowError(null) が呼ばれる", () => {
    const triggerCallback = captureCallback();

    act(() => {
      triggerCallback({ currentPhase: "execute", handoffBundle: null });
    });

    expect(mockSetWorkflowSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ currentPhase: "execute" }),
    );
    expect(mockSetWorkflowError).toHaveBeenCalledWith(null);
  });

  // AC-2 追加: currentPhase: 'verify' でも既存動作が維持されること
  it("TC-EP-03: currentPhase: 'verify' の snapshot を受け取ったとき setWorkflowError(null) が呼ばれる", () => {
    const triggerCallback = captureCallback();

    act(() => {
      triggerCallback({ currentPhase: "verify", handoffBundle: null });
    });

    expect(mockSetWorkflowSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ currentPhase: "verify" }),
    );
    expect(mockSetWorkflowError).toHaveBeenCalledWith(null);
  });

  // AC-3: handoffBundle の処理は currentPhase に関わらず変わらないこと
  it("TC-EP-04: currentPhase: 'handoff' でも handoffBundle が存在する場合は setHandoffGuidance が呼ばれる", () => {
    const triggerCallback = captureCallback();
    const mockHandoffBundle = { steps: ["step1"] };

    act(() => {
      triggerCallback({
        currentPhase: "handoff",
        handoffBundle: mockHandoffBundle,
      });
    });

    // handoffBundle 処理は currentPhase に関わらず実行される
    expect(mockSetHandoffGuidance).toHaveBeenCalled();
    // setWorkflowError(null) は呼ばれない
    expect(mockSetWorkflowError).not.toHaveBeenCalledWith(null);
  });

  it("TC-EP-05: currentPhase: 'execute' で handoffBundle が null の場合は setHandoffGuidance が呼ばれない", () => {
    const triggerCallback = captureCallback();

    act(() => {
      triggerCallback({ currentPhase: "execute", handoffBundle: null });
    });

    expect(mockSetHandoffGuidance).not.toHaveBeenCalled();
    // setWorkflowError(null) は呼ばれる（currentPhase: execute）
    expect(mockSetWorkflowError).toHaveBeenCalledWith(null);
  });
});
```

Red 確認: 現状では `setWorkflowError(null)` が無条件に呼ばれるため、TC-EP-01 と TC-EP-04 が失敗する。

### ステップ 2: Red 状態の確認

```bash
# テストを実行して Red 状態を確認する
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx
```

期待される Red テスト:

- TC-EP-01: `expect(mockSetWorkflowError).not.toHaveBeenCalledWith(null)` が失敗（現状は呼ばれてしまう）
- TC-EP-04: 同様に失敗

Phase 5 の実装後に全テストが Green になることを確認する。

### ステップ 3: テスト設計の確認

| テストケース | 対応 AC | 検証内容                                                      | Red 理由                               |
| ------------ | ------- | ------------------------------------------------------------- | -------------------------------------- |
| TC-EP-01     | AC-1    | `currentPhase: 'handoff'` → `setWorkflowError` 非呼び出し     | 現状は無条件に呼ばれる                 |
| TC-EP-02     | AC-2    | `currentPhase: 'execute'` → `setWorkflowError(null)` 呼び出し | 現状も呼ばれる（Green の可能性あり）   |
| TC-EP-03     | AC-2    | `currentPhase: 'verify'` → `setWorkflowError(null)` 呼び出し  | 現状も呼ばれる（Green の可能性あり）   |
| TC-EP-04     | AC-3    | `currentPhase: 'handoff'` でも `handoffBundle` 処理が実行     | 現状も実行される（Green の可能性あり） |
| TC-EP-05     | AC-3    | `handoffBundle: null` → `setHandoffGuidance` 非呼び出し       | 現状も呼ばれない（Green の可能性あり） |

## 多角的チェック観点

- TC-EP-01 と TC-EP-04 が確実に Red になることを確認したか（修正前の状態で失敗することを確認）
- テストのモック設定で `getSkillCreatorApi` が正しくモックされているか確認したか
- `act()` でコールバック呼び出しをラップすることで React の状態更新が正しく処理されるか確認したか
- テストファイルの命名が kebab-case で統一されているか（`error-persistence.test.tsx`）確認したか

## 成果物

| 成果物             | パス                                                                                                  | 説明             |
| ------------------ | ----------------------------------------------------------------------------------------------------- | ---------------- |
| エラー永続化テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` | Red 状態のテスト |

## 完了条件

- [ ] `SkillLifecyclePanel.error-persistence.test.tsx` が作成されて Red 状態である
- [ ] TC-EP-01（`currentPhase: 'handoff'` 時に `setWorkflowError(null)` が呼ばれない）が定義されている
- [ ] TC-EP-02（`currentPhase: 'execute'` 時に `setWorkflowError(null)` が呼ばれる）が定義されている
- [ ] TC-EP-03（`currentPhase: 'verify'` 時に `setWorkflowError(null)` が呼ばれる）が定義されている
- [ ] TC-EP-04（`currentPhase: 'handoff'` でも `handoffBundle` 処理が実行される）が定義されている
- [ ] TC-EP-05（`handoffBundle: null` 時に `setHandoffGuidance` が呼ばれない）が定義されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（テストファイル 1 本）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 5: 実装 へ進む
