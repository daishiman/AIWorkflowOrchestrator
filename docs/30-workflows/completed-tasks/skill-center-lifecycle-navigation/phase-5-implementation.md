# Phase 5: 実装

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

---

## 1. 実装計画（新規作成/修正ファイル一覧）

| 種別 | ファイルパス                                                              | 変更内容                                      |
| ---- | ------------------------------------------------------------------------- | --------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/store/types.ts`                                | `ViewType` に `skillManagement` 追加          |
| 修正 | `apps/desktop/src/renderer/App.tsx`                                       | `skillManagement` case 追加 + dock 正規化     |
| 修正 | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | `navigateToSkillManagement` 追加              |
| 修正 | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | 「スキル管理」ボタン追加 + `skillCreate` 維持 |
| 修正 | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`     | `onClose` / 戻るボタン追加                    |

---

## 2. Step 1: store/types.ts — ViewType 追加

```typescript
// Before
export type ViewType =
  | ...
  | "skillCreate"
  | "agent"
  | ...

// After
export type ViewType =
  | ...
  | "skillCreate"
  | "skillManagement" // 追加: SkillManagementPanel を表示
  | "agent"
  | ...
```

---

## 3. Step 2: App.tsx — renderView() と dock 正規化

```typescript
// renderView() に追加
case "skillManagement":
  return (
    <SkillManagementPanel onClose={() => setCurrentView("skillCenter")} />
  );
```

```typescript
// shell の active state には skillCenter を渡す
const dockCurrentView =
  currentView === "skillManagement" ? "skillCenter" : currentView;
```

`renderStandaloneView` で `/advanced/skill-management-panel` を開く場合は `onClose={() => window.history.back()}` を渡し、main-shell と advanced route の両方で同じコンポーネントを再利用する。

---

## 4. Step 3: useSkillCenter.ts — navigate 関数追加

```typescript
const navigateToSkillManagement = useCallback(
  () => setCurrentView("skillManagement"),
  [setCurrentView],
);
```

return オブジェクトに `navigateToSkillManagement` を追加する。`navigateToSkillCreate` は変更しない。

---

## 5. Step 4: SkillCenterView/index.tsx — UI 変更

### 4-A: 「スキル管理」ボタン追加

```typescript
<button
  type="button"
  className={viewStyles.headerCtaSecondary}
  onClick={navigateToSkillManagement}
  data-testid="header-management-cta"
  data-route-kind="secondary"
>
  <Icon name="settings" size={16} />
  <span>スキル管理</span>
</button>
```

### 4-B: 「+新規作成」は `skillCreate` のまま維持

```typescript
onClick = { navigateToSkillCreate };
```

Journey Panel の CTA も `skillCreate` を維持する。今回の task は主導線を変更しない。

---

## 6. Step 5: SkillManagementPanel — 戻るボタン追加

`SkillManagementPanel` は main-shell では `onClose` を使い、`onClose` が未指定の場合だけ `window.history.back()` にフォールバックする。

```typescript
const handleClose = useCallback(() => {
  if (onClose) {
    onClose();
    return;
  }

  window.history.back();
}, [onClose]);
```

list view の上部に戻るボタンを置き、`data-testid="skill-management-back-button"` で固定する。

---

## Phase 5 完了確認

- [ ] store/types.ts 修正完了
- [ ] App.tsx 修正完了（case + dock 正規化）
- [ ] useSkillCenter.ts 修正完了（navigate 関数追加）
- [ ] SkillCenterView/index.tsx 修正完了（管理ボタン追加）
- [ ] SkillManagementPanel.tsx 修正完了（戻るボタン追加）
- [ ] `pnpm typecheck` PASS
- [ ] TC-01〜TC-06 全 PASS
