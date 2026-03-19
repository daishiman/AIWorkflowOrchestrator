# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 6                                       |
| Phase名    | テスト拡充                              |
| タスクID   | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 前提Phase  | Phase 5（実装 Green 確認済み）          |
| 後続Phase  | Phase 7（カバレッジ確認）               |
| ステータス | not_started                             |
| 作成日     | 2026-03-17                              |
| 機能名     | skilldetail-action-buttons              |

## 目的

Phase 4 の TC-01〜TC-08 で網羅できていない境界値・異常系・レスポンシブレイアウトの観点を追加し、カバレッジ基準（Line 80% / Branch 60% / Function 80%）の達成を確実にする。

## 追加テストケース一覧

### 境界値テスト

| TC番号 | 観点                            | 期待動作                                                                             |
| ------ | ------------------------------- | ------------------------------------------------------------------------------------ |
| TC-09  | skillName が null の場合        | アクションボタンが表示されていても、クリック時に onEdit / onAnalyze が呼び出されない |
| TC-10  | skillName が空文字列 "" の場合  | onEdit / onAnalyze が呼び出されない（`skillName && onEdit(skillName)` ガード確認）   |
| TC-11  | onEdit のみ undefined の場合    | アクションボタンゾーンが表示されない（両方 undefined でなくてもゾーン非表示）        |
| TC-12  | onAnalyze のみ undefined の場合 | アクションボタンゾーンが表示されない                                                 |

### レスポンシブテスト

| TC番号 | 観点                                 | 期待動作                                                                      |
| ------ | ------------------------------------ | ----------------------------------------------------------------------------- |
| TC-13  | デスクトップレイアウトでのボタン表示 | `data-testid="action-buttons-zone"` が desktop 向け PanelContent 内に存在する |
| TC-14  | モバイルレイアウトでのボタン表示     | `data-testid="action-buttons-zone"` が mobile 向け PanelContent 内に存在する  |
| TC-15  | ボタンの flex-1 クラス適用確認       | edit-skill-button / analyze-skill-button の両方が `flex-1` クラスを持つ       |

### useSkillCenter 追加テスト

| TC番号 | 観点                                          | 期待動作                                                                                       |
| ------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| TC-16  | handleEditSkill の呼び出し順序検証            | `setCurrentSkillName` が `setCurrentView` より先に呼ばれ、`handleCloseDetail` が最後に呼ばれる |
| TC-17  | handleAnalyzeSkill の呼び出し順序検証         | `setCurrentSkillName` が `setCurrentView` より先に呼ばれ、`handleCloseDetail` が最後に呼ばれる |
| TC-18  | handleEditSkill / handleAnalyzeSkill の安定性 | `useCallback` の依存配列が変化しない限り、同一参照が返される（再レンダー最適化の確認）         |

## テストコード設計

### 境界値テスト（TC-09〜TC-12）

```typescript
describe("SkillDetailPanel - アクションボタンゾーン 境界値", () => {
  // TC-09: skillName = null
  it("skillName が null の場合にボタンクリックで onEdit が呼ばれない", () => {
    const onEdit = vi.fn();
    const onAnalyze = vi.fn();
    render(
      <SkillDetailPanel
        skillName={null}
        isOpen={true}
        onClose={vi.fn()}
        onDelete={vi.fn()}
        isImported={true}
        onEdit={onEdit}
        onAnalyze={onAnalyze}
      />
    );
    fireEvent.click(screen.getByTestId("edit-skill-button"));
    expect(onEdit).not.toHaveBeenCalled();
  });

  // TC-10: skillName = ""
  it("skillName が空文字列の場合にボタンクリックで onEdit が呼ばれない", () => {
    const onEdit = vi.fn();
    render(
      <SkillDetailPanel
        skillName=""
        isOpen={true}
        onClose={vi.fn()}
        onDelete={vi.fn()}
        isImported={true}
        onEdit={onEdit}
        onAnalyze={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("edit-skill-button"));
    expect(onEdit).not.toHaveBeenCalled();
  });

  // TC-11: onEdit のみ undefined
  it("onEdit のみ undefined の場合にアクションボタンゾーンが表示されない", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={vi.fn()}
        onDelete={vi.fn()}
        isImported={true}
        onEdit={undefined}
        onAnalyze={vi.fn()}
      />
    );
    expect(
      screen.queryByTestId("action-buttons-zone")
    ).not.toBeInTheDocument();
  });

  // TC-12: onAnalyze のみ undefined
  it("onAnalyze のみ undefined の場合にアクションボタンゾーンが表示されない", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={vi.fn()}
        onDelete={vi.fn()}
        isImported={true}
        onEdit={vi.fn()}
        onAnalyze={undefined}
      />
    );
    expect(
      screen.queryByTestId("action-buttons-zone")
    ).not.toBeInTheDocument();
  });
});
```

### レスポンシブテスト（TC-13〜TC-15）

```typescript
describe("SkillDetailPanel - アクションボタンゾーン レスポンシブ", () => {
  // TC-15: flex-1 クラス確認
  it("編集・分析ボタンが flex-1 クラスを持つ", () => {
    render(
      <SkillDetailPanel
        skillName="test-skill"
        isOpen={true}
        onClose={vi.fn()}
        onDelete={vi.fn()}
        isImported={true}
        onEdit={vi.fn()}
        onAnalyze={vi.fn()}
      />
    );
    expect(screen.getByTestId("edit-skill-button")).toHaveClass("flex-1");
    expect(screen.getByTestId("analyze-skill-button")).toHaveClass("flex-1");
  });
});
```

**注意**: TC-13・TC-14 のデスクトップ/モバイル PanelContent テストは、`SkillDetailPanel` が PanelContent を共有実装しているため、既存の isOpen=true テストで自動的にカバーされる可能性が高い。カバレッジ計測後に判断する。

### useSkillCenter 追加テスト（TC-16〜TC-18）

```typescript
describe("useSkillCenter - 遷移ハンドラ 拡張", () => {
  // TC-16: handleEditSkill の呼び出し順序検証
  it("handleEditSkill の setCurrentSkillName → setCurrentView の順序が正しい", () => {
    const callOrder: string[] = [];
    mockSetCurrentSkillName.mockImplementation(() => {
      callOrder.push("setCurrentSkillName");
    });
    mockSetCurrentView.mockImplementation(() => {
      callOrder.push("setCurrentView");
    });

    const { result } = renderHook(() => useSkillCenter());
    act(() => {
      result.current.handleEditSkill("test-skill");
    });

    expect(callOrder[0]).toBe("setCurrentSkillName");
    expect(callOrder[1]).toBe("setCurrentView");
  });
});
```

## 参照資料

| 参照資料              | パス                                     | 内容                                             |
| --------------------- | ---------------------------------------- | ------------------------------------------------ |
| Phase 4（テスト作成） | `phase-4-test-creation.md`               | 基本テストケース（TC-01〜TC-08）の構造を確認する |
| Phase 5（実装）       | `phase-5-implementation.md`              | 実装の詳細（ガード条件・クラス設定）を確認する   |
| P39 fireEvent 準拠    | `.claude/rules/06-known-pitfalls.md#P39` | happy-dom 環境での userEvent 禁止を確認する      |
| P48 派生セレクタ      | `.claude/rules/06-known-pitfalls.md#P48` | useShallow 未適用による無限ループを確認する      |

## 実行タスク

- タスク 1: カバレッジを再計測し不足ブランチを抽出する
- タスク 2: 境界値テスト（TC-09〜TC-12）を追加する
- タスク 3: レスポンシブ観点（TC-13〜TC-15）を補強する
- タスク 4: useSkillCenter 拡張テスト（TC-16〜TC-18）を追加する
- タスク 5: 再計測で基準達成を確認し、成果物を更新する

## 実行手順

### ステップ 1: カバレッジ計測で不足箇所を特定する

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillCenterView/__tests__/
```

カバレッジレポートで Branch Coverage が 60% 未満の箇所を特定する。

### ステップ 2: TC-09〜TC-18 を追加する

境界値テスト（TC-09〜TC-12）を優先して追加し、その後レスポンシブテスト（TC-13〜TC-15）と useSkillCenter 拡張テスト（TC-16〜TC-18）を追加する。

### ステップ 3: カバレッジを再計測して基準を確認する

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillCenterView/__tests__/
```

Line 80% / Branch 60% / Function 80% の達成を確認し、不足が残る場合は追加テストを作成する。

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                   | パス                                   | 内容                                                    |
| ------------------------ | -------------------------------------- | ------------------------------------------------------- |
| テスト実行ログ（拡充後） | `outputs/phase-6/test-run-expanded.md` | TC-09〜TC-18 追加後のテスト実行結果を記録する           |
| カバレッジ計測結果       | `outputs/phase-6/coverage-report.md`   | Line / Branch / Function カバレッジの計測結果を記録する |

## 完了条件

- [ ] TC-09〜TC-12（境界値テスト）が追加されて全て Green である
- [ ] TC-13〜TC-15（レスポンシブテスト）が追加または「既存カバー済み」として記録されている
- [ ] TC-16〜TC-18（useSkillCenter 拡張テスト）が追加されて全て Green である
- [ ] カバレッジ計測で Line 80%・Branch 60%・Function 80% 以上を確認済みである
- [ ] P39 準拠（fireEvent 使用）が全テストで守られている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次の Phase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md) に進む
