# Phase 6: テスト拡充

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

---

## 1. エッジケーステスト

### EC-01: skillManagement → onClose → skillCenter に戻る

```typescript
it("SkillManagementPanel onClose navigates back to skillCenter", () => {
  useAppStore.setState({ currentView: "skillManagement" });
  render(<App />);
  fireEvent.click(screen.getByTestId("skill-management-back-button"));
  expect(useAppStore.getState().currentView).toBe("skillCenter");
});
```

### EC-02: skillManagement → 戻るボタン → skillCenter に戻る

```typescript
it("SkillManagementPanel back button navigates to skillCenter", () => {
  render(<SkillManagementPanel onClose={mockOnClose} />);
  fireEvent.click(screen.getByTestId("skill-management-back-button"));
  expect(mockOnClose).toHaveBeenCalled();
});
```

### EC-03: SkillCenterView の「+新規作成」が skillCreate のまま維持される

```typescript
it("header create CTA still navigates to skillCreate", async () => {
  render(<SkillCenterView />);
  await userEvent.click(screen.getByTestId("header-create-cta"));
  expect(mockSetCurrentView).toHaveBeenCalledWith("skillCreate");
});
```

### EC-04: SkillCenterView の「スキル管理」が skillManagement を呼ぶ

```typescript
it("header management CTA navigates to skillManagement", async () => {
  render(<SkillCenterView />);
  await userEvent.click(screen.getByTestId("header-management-cta"));
  expect(mockSetCurrentView).toHaveBeenCalledWith("skillManagement");
});
```

---

## 2. 回帰テスト

### RG-01: 既存 skillCreate ルートが破壊されていない

```typescript
it("skillCreate still renders SkillCreateWizard", () => {
  useAppStore.setState({ currentView: "skillCreate" });
  render(<App />);
  expect(screen.getByTestId("skill-create-wizard")).toBeInTheDocument();
});
```

### RG-02: 既存 SkillCenterView の workspace / skillAnalysis 導線が保持

```typescript
it("navigateToWorkspace still works from SkillCenterView", async () => {
  render(<SkillCenterView />);
  await userEvent.click(screen.getByTestId("journey-use-cta"));
  expect(mockSetCurrentView).toHaveBeenCalledWith("workspace");
});
```

### RG-03: `SkillManagementPanel.route-classification.test.tsx` で内部 lifecycle/create 切替を継続担保

既存の route-classification テストを再実行し、`SkillLifecyclePanel` を top-level にしないまま内部サブビューとして維持できていることを確認する。

---

## Phase 6 完了確認

- [ ] エッジケース EC-01〜EC-04 追加完了
- [ ] 回帰テスト RG-01〜RG-03 追加完了
- [ ] 全テスト PASS
