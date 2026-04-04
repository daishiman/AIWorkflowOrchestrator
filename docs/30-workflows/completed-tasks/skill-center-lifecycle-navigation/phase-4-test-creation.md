# Phase 4: テスト作成

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

---

## 1. 命名規則確認（Phase 1 より）

- ViewType 値: camelCase（`"skillCreate"`, `"skillManagement"`）
- navigate 関数: `navigateTo{ViewName}` camelCase
- testid: kebab-case（`header-create-cta`, `header-management-cta`, `skill-management-back-button`）

---

## 2. テストケース一覧

### TC-01: navigateToSkillManagement が setCurrentView("skillManagement") を呼ぶ

**ファイル**: `apps/desktop/src/renderer/views/SkillCenterView/hooks/__tests__/useSkillCenter.navigation.test.ts`

```typescript
it("navigateToSkillManagement calls setCurrentView with skillManagement", () => {
  const { result } = renderHook(() => useSkillCenter());
  act(() => result.current.navigateToSkillManagement());
  expect(setCurrentView).toHaveBeenCalledWith("skillManagement");
});
```

### TC-02: currentView="skillManagement" で SkillManagementPanel がレンダリングされる

**ファイル**: `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx`

```typescript
it("renders SkillManagementPanel when currentView is skillManagement", () => {
  useAppStore.setState({ currentView: "skillManagement" });
  render(<App />);
  expect(screen.getByTestId("skill-management-panel")).toBeInTheDocument();
});
```

### TC-03: currentView="skillManagement" でも desktop / mobile の dock-sidebar active state は skillCenter として扱われる

```typescript
it("normalizes skillManagement to skillCenter for dock rendering", () => {
  useAppStore.setState({ currentView: "skillManagement" });
  render(<App />);
  // mock した AppLayout / AppDock に渡された currentView を確認する
  expect(appDockCurrentView).toBe("skillCenter");
});
```

### TC-04: 「+新規作成」クリックで `skillCreate` が維持される

**ファイル**: `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.cta.test.tsx`

```typescript
it("clicking header create CTA still calls skillCreate", async () => {
  render(<SkillCenterView />);
  await userEvent.click(screen.getByTestId("header-create-cta"));
  expect(mockSetCurrentView).toHaveBeenCalledWith("skillCreate");
});
```

### TC-05: 「スキル管理」クリックで `skillManagement` が呼ばれる

```typescript
it("clicking management CTA calls skillManagement", async () => {
  render(<SkillCenterView />);
  await userEvent.click(screen.getByTestId("header-management-cta"));
  expect(mockSetCurrentView).toHaveBeenCalledWith("skillManagement");
});
```

### TC-06: SkillManagementPanel の戻る操作で SkillCenterView に戻る

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx`

```typescript
it("back button navigates to skillCenter", async () => {
  render(<SkillManagementPanel onClose={mockOnClose} />);
  await userEvent.click(screen.getByTestId("skill-management-back-button"));
  expect(mockOnClose).toHaveBeenCalled();
});
```

---

## 3. 既存テスト修正対象

| ファイル                                             | 修正内容                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `useSkillCenter.navigation.test.ts`                  | `navigateToSkillManagement` の追加                         |
| `SkillCenterView.cta.test.tsx`                       | `header-management-cta` の追加と `skillCreate` 回帰確認    |
| `App.renderView.viewtype.test.tsx`                   | `skillManagement` case と dock 正規化のケースを追加        |
| `SkillManagementPanel.route-classification.test.tsx` | 既存の lifecycle/create 切替を維持しつつ、回帰固定を再確認 |

---

## 4. Red 状態確認計画

Phase 5 実装前に `pnpm vitest run` を実行し、TC-01〜TC-06 が全て **FAIL（Red）** であることを確認する。

```bash
pnpm --filter @repo/desktop vitest run --reporter verbose 2>&1 | grep -E "TC-0[1-6]|FAIL|PASS"
```

---

## Phase 4 完了確認

- [x] テストケース TC-01〜TC-06 設計完了
- [x] 命名規則との整合確認完了
- [x] 既存テスト修正対象特定完了
- [x] Red 確認計画策定完了
