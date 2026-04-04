# Phase 5 出力: 実装

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

### 実装内容

#### `SkillCenterView/index.tsx`（主要変更）

1. `viewStyles` に `headerCtaSecondary` スタイル追加
2. `useSkillCenter()` から `navigateToSkillManagement` を destructure
3. ヘッダーに `data-testid="header-row"` 追加
4. CTA ラッパー div 追加（`flex items-center gap-2`）
5. 「スキル管理」ボタン追加（`header-management-cta` / `data-route-kind="secondary"`）

#### 既実装済み（変更不要）

- `store/types.ts`: `"skillManagement"` 追加済み
- `App.tsx`: case 追加・dockCurrentView 正規化済み
- `useSkillCenter.ts`: `navigateToSkillManagement` 実装済み
- `SkillManagementPanel.tsx`: `onClose` / back button 実装済み

### 型チェック

```
pnpm typecheck → PASS
```
