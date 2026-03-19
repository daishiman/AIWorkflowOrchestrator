# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 4                                       |
| Phase名    | テスト作成                              |
| タスクID   | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 前提Phase  | Phase 3（設計レビュー PASS/MINOR）      |
| 後続Phase  | Phase 5（実装）                         |
| ステータス | not_started                             |
| 作成日     | 2026-03-17                              |
| 機能名     | skilldetail-action-buttons              |

## 目的

TC-01〜TC-08 のテストコードを作成し、Red（失敗）状態で Phase 5 実装のガイドにする。SkillDetailPanel のレンダリングテストと useSkillCenter の遷移フローテストを網羅する。

## 前提条件

- Phase 3 の設計レビューが PASS または MINOR 判定で完了していること
- 既存テストファイル `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx` を確認済みであること
- happy-dom 環境のため `fireEvent` を使用する（P39 準拠、`userEvent` 禁止）

## 実行タスク

- 既存テスト確認: 既存テストファイルの構造・import パターン・テストヘルパーを確認する
- レンダリングテスト作成: `SkillDetailPanel` のレンダリングテスト（TC-01〜TC-05、TC-08）を作成する
- 遷移フローテスト作成: `useSkillCenter` の遷移フローテスト（TC-06〜TC-07）を作成する
- Red確認: テストを実行して Red 状態（失敗）であることを確認する

## テストケース一覧

| TC番号 | テストファイル            | 観点                                    | 期待動作                                                                                     |
| ------ | ------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| TC-01  | SkillDetailPanel.test.tsx | isImported=true 時のボタン表示          | `data-testid="action-buttons-zone"` が存在し、2つのボタンが表示される                        |
| TC-02  | SkillDetailPanel.test.tsx | isImported=false 時のボタン非表示       | `data-testid="action-buttons-zone"` が DOM に存在しない                                      |
| TC-03  | SkillDetailPanel.test.tsx | 編集ボタンクリック → onEdit 呼び出し    | `fireEvent.click(editButton)` で `onEdit("test-skill")` が1回呼び出される                    |
| TC-04  | SkillDetailPanel.test.tsx | 分析ボタンクリック → onAnalyze 呼び出し | `fireEvent.click(analyzeButton)` で `onAnalyze("test-skill")` が1回呼び出される              |
| TC-05  | SkillDetailPanel.test.tsx | Escape キー → onClose 呼び出し          | `fireEvent.keyDown(document, { key: 'Escape' })` で onClose が呼び出され、ボタン動作変化なし |
| TC-06  | useSkillCenter.test.ts    | handleEditSkill 遷移フロー              | `setCurrentSkillName` + `setCurrentView("skill-editor")` + `handleCloseDetail` が実行される  |
| TC-07  | useSkillCenter.test.ts    | handleAnalyzeSkill 遷移フロー           | `setCurrentSkillName` + `setCurrentView("skillAnalysis")` + `handleCloseDetail` が実行される |
| TC-08  | SkillDetailPanel.test.tsx | onEdit/onAnalyze が undefined の場合    | アクションボタンゾーンが表示されない（`data-testid="action-buttons-zone"` が不在）           |

## テストコード設計

### SkillDetailPanel テスト（TC-01〜TC-05、TC-08）

```typescript
// apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx
// ---- 新規追加テストケースの骨格 ----

describe("SkillDetailPanel - アクションボタンゾーン", () => {
  const defaultProps = {
    skillName: "test-skill",
    isOpen: true,
    onClose: vi.fn(),
    onDelete: vi.fn(),
    isImported: true,
    onEdit: vi.fn(),
    onAnalyze: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC-01
  it("isImported=true の場合にアクションボタンゾーンが表示される", () => {
    render(<SkillDetailPanel {...defaultProps} isImported={true} />);
    expect(
      screen.getByTestId("action-buttons-zone")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("edit-skill-button")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("analyze-skill-button")
    ).toBeInTheDocument();
  });

  // TC-02
  it("isImported=false の場合にアクションボタンゾーンが表示されない", () => {
    render(<SkillDetailPanel {...defaultProps} isImported={false} />);
    expect(
      screen.queryByTestId("action-buttons-zone")
    ).not.toBeInTheDocument();
  });

  // TC-03
  it("編集ボタンクリックで onEdit(skillName) が呼び出される", () => {
    render(<SkillDetailPanel {...defaultProps} />);
    fireEvent.click(screen.getByTestId("edit-skill-button"));
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    expect(defaultProps.onEdit).toHaveBeenCalledWith("test-skill");
  });

  // TC-04
  it("分析ボタンクリックで onAnalyze(skillName) が呼び出される", () => {
    render(<SkillDetailPanel {...defaultProps} />);
    fireEvent.click(screen.getByTestId("analyze-skill-button"));
    expect(defaultProps.onAnalyze).toHaveBeenCalledTimes(1);
    expect(defaultProps.onAnalyze).toHaveBeenCalledWith("test-skill");
  });

  // TC-05
  it("Escape キーで onClose が呼び出され、アクションボタンの動作は変わらない", () => {
    render(<SkillDetailPanel {...defaultProps} />);
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    // アクションボタンはまだ表示されている（パネルが閉じる前）
    expect(
      screen.getByTestId("action-buttons-zone")
    ).toBeInTheDocument();
  });

  // TC-08
  it("onEdit/onAnalyze が undefined の場合にアクションボタンゾーンが表示されない", () => {
    const { onEdit, onAnalyze, ...propsWithoutHandlers } = defaultProps;
    render(
      <SkillDetailPanel
        {...propsWithoutHandlers}
        isImported={true}
        onEdit={undefined}
        onAnalyze={undefined}
      />
    );
    expect(
      screen.queryByTestId("action-buttons-zone")
    ).not.toBeInTheDocument();
  });
});
```

### useSkillCenter テスト（TC-06〜TC-07）

```typescript
// apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts
// ---- 新規追加テストケースの骨格 ----

describe("useSkillCenter - 遷移ハンドラ", () => {
  const mockSetCurrentSkillName = vi.fn();
  const mockSetCurrentView = vi.fn();

  // Zustand ストアのモック設定
  beforeEach(() => {
    vi.clearAllMocks();
    // useNavigationStore のモックを設定
  });

  // TC-06
  it("handleEditSkill はスキル名設定・skill-editor遷移・パネル閉じを順に実行する", () => {
    const { result } = renderHook(() => useSkillCenter());
    act(() => {
      result.current.handleEditSkill("test-skill");
    });
    expect(mockSetCurrentSkillName).toHaveBeenCalledWith("test-skill");
    expect(mockSetCurrentView).toHaveBeenCalledWith("skill-editor");
    // handleCloseDetail（detailOpen = false）が呼ばれていることを確認
  });

  // TC-07
  it("handleAnalyzeSkill はスキル名設定・skillAnalysis遷移・パネル閉じを順に実行する", () => {
    const { result } = renderHook(() => useSkillCenter());
    act(() => {
      result.current.handleAnalyzeSkill("test-skill");
    });
    expect(mockSetCurrentSkillName).toHaveBeenCalledWith("test-skill");
    expect(mockSetCurrentView).toHaveBeenCalledWith("skillAnalysis");
    // handleCloseDetail が呼ばれていることを確認
  });
});
```

## 参照資料

| 参照資料                    | パス                                                                                  | 内容                                         |
| --------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| Phase 1（要件定義）         | `outputs/phase-1/` / `phase-1-requirements.md`                                        | AC と scope 境界を確認する                   |
| Phase 2（設計）             | `phase-2-design.md`                                                                   | テスト対象コンポーネントの設計仕様を確認する |
| Phase 3（設計レビュー）     | `phase-3-design-review.md`                                                            | MINOR 指摘を確認しテスト設計に反映する       |
| SkillDetailPanel 既存テスト | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx` | 既存テストの構造・import パターンを確認する  |
| useSkillCenter 既存テスト   | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/` 以下                     | 既存テストのモックパターンを確認する         |
| P39 fireEvent 準拠          | `.claude/rules/06-known-pitfalls.md#P39`                                              | happy-dom 環境での userEvent 禁止を確認する  |
| P13 タイマーテスト          | `.claude/rules/06-known-pitfalls.md#P13`                                              | 非同期テストでの注意事項を確認する           |

### システム仕様（aiworkflow-requirements）

> テスト作成でも parent index 止まりにせず、UI contract / navigation / state handoff の正本を使う。

| 参照資料                                                     | パス                                                                                                                | 内容                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| workflow-skill-lifecycle-routing-render-view-foundation      | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`      | `skillAnalysis` 依存、`renderView()`、close 導線、follow-up backlog の正本 |
| ui-ux-navigation                                             | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                             | `skillCenter` / `skill-editor` / `skillAnalysis` の遷移契約                |
| ui-ux-feature-components-reference                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md`                           | `SkillDetailPanel` / `useSkillCenter` / `SkillCenterView` の UI 契約       |
| arch-state-management-core                                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                   | ViewType / state handoff / new slice 不要の判断根拠                        |
| arch-state-management-reference-permissions-import-lifecycle | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | SkillCenter hook / selector の既存責務と P31 個別セレクタ運用              |

## 実行手順

### ステップ 1: 既存テストファイルを確認する

```bash
# 既存テストファイルの構造確認
cat apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx

# useSkillCenter のテストファイル確認
ls apps/desktop/src/renderer/views/SkillCenterView/__tests__/
```

### ステップ 2: SkillDetailPanel のテスト（TC-01〜TC-05、TC-08）を追加する

既存テストファイルに新規 `describe` ブロックを追加する形式で TC-01〜TC-05 と TC-08 を実装する。P39 準拠で `fireEvent` を使用する。

### ステップ 3: useSkillCenter のテスト（TC-06〜TC-07）を追加する

`useSkillCenter.test.ts` を確認し、TC-06〜TC-07 を追加する。Zustand ストアの mock 設定は既存パターンを踏襲する。

### ステップ 4: テストを実行して Red 状態を確認する

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/SkillCenterView/__tests__/
```

テストが Red（失敗）であることを確認し、Phase 5 実装の準備が整っていることを記録する。

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                    | パス                                   | 内容                                             |
| ------------------------- | -------------------------------------- | ------------------------------------------------ |
| テスト実行ログ（Red確認） | `outputs/phase-4/test-run-red.md`      | テスト実行結果（失敗ログ）を記録する             |
| テスト設計メモ            | `outputs/phase-4/test-design-notes.md` | 既存テストとの統合方針・モックパターンを記録する |

## 完了条件

- [ ] 既存テストファイルの構造・モックパターンを確認済みである
- [ ] TC-01〜TC-05 および TC-08 が SkillDetailPanel.test.tsx に追加されている
- [ ] TC-06〜TC-07 が useSkillCenter 関連テストファイルに追加されている
- [ ] `pnpm vitest run` でテストが Red（失敗）状態であることを確認済みである
- [ ] P39 準拠（fireEvent 使用、userEvent 禁止）が守られている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次の Phase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
