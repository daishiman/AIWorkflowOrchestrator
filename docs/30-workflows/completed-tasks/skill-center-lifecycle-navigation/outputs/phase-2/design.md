# Phase 2 出力: 設計

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

### 実装した設計

| ファイル                    | 変更内容                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `store/types.ts`            | `"skillManagement"` を ViewType に追加（既実装済み）                                 |
| `App.tsx`                   | `case "skillManagement"` + `dockCurrentView` 正規化（既実装済み）                    |
| `useSkillCenter.ts`         | `navigateToSkillManagement` 追加（既実装済み）                                       |
| `SkillCenterView/index.tsx` | `header-management-cta` ボタン + `headerCtaSecondary` スタイル追加（本タスクで実装） |
| `SkillManagementPanel.tsx`  | `onClose` + `skill-management-back-button`（既実装済み）                             |

### dock 正規化パターン

```typescript
const dockCurrentView = (
  currentView === "skillManagement" ? "skillCenter" : currentView
) as DockViewType;
```

skillManagement は skillCenter の派生 surface。サイドバーの強調表示は skillCenter のまま維持する。

### SkillCenterView ヘッダー構造

```
<div data-testid="header-row"> (flex justify-between)
  <div>                         (title section)
    <h1>ツールを探す</h1>
    <p>subtitle</p>
  </div>
  <div class="flex items-center gap-2"> (CTA group)
    <button data-testid="header-management-cta" data-route-kind="secondary" />
    <button data-testid="header-create-cta"     data-route-kind="primary"   />
  </div>
</div>
```
