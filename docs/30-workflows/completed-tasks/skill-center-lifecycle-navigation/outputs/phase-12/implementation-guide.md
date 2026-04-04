# TASK-SKILL-CENTER-LIFECYCLE-NAV-001 実装ガイド

## 概要

`SkillCenterView` から `SkillManagementPanel` への副導線を追加し、`SkillLifecyclePanel` を main-shell から自然に到達できるようにした。
`skillCreate` の主導線は維持し、`skillManagement` は補助導線として扱う。

## 変更内容

### 修正ファイル

| ファイル                                                                                            | 変更内容                                                                                                        |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                         | `header-management-cta` を追加し、`SkillCenterView` のヘッダーに副導線を追加                                    |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                           | `navigateToSkillManagement` を追加                                                                              |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                               | `onClose` と `skill-management-back-button` を追加                                                              |
| `apps/desktop/src/renderer/App.tsx`                                                                 | `case "skillManagement"` と `dockCurrentView` 正規化、`/advanced/skill-center` で view 状態に合わせた描画を追加 |
| `apps/desktop/src/renderer/store/types.ts`                                                          | `ViewType` に `skillManagement` を追加                                                                          |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/__tests__/useSkillCenter.navigation.test.ts` | `navigateToSkillManagement` テストを追加                                                                        |
| `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.cta.test.tsx`            | `header-management-cta` テストを追加                                                                            |
| `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx`                              | `skillManagement` 分岐と dock 正規化の回帰テストを追加                                                          |

## 設計判断

### 主導線と副導線

```text
SkillCenterView
  ├── 「+新規作成」(primary)   → skillCreate → SkillCreateWizard
  └── 「スキル管理」(secondary) → skillManagement → SkillManagementPanel
```

- `skillCreate` はそのまま維持する
- `skillManagement` は secondary surface として追加する
- `SkillLifecyclePanel` は `SkillManagementPanel` 内部で再利用する

### dock 正規化

`skillManagement` は `skillCenter` の派生 surface として扱うため、サイドバーの active 表示は `skillCenter` に正規化する。

```typescript
const dockCurrentView = (
  currentView === "skillManagement" ? "skillCenter" : currentView
) as DockViewType;
```

### `SkillManagementPanel` の戻り設計

- main-shell: `onClose={() => setCurrentView("skillCenter")}`
- `/advanced/skill-management-panel`: `onClose={() => window.history.back()}`

同一コンポーネントを main-shell と direct route の両方で再利用できる。

## 画面証跡

| TC       | ファイル                                                              | 確認内容                         |
| -------- | --------------------------------------------------------------------- | -------------------------------- |
| TC-11-01 | `outputs/phase-11/screenshots/TC-11-01-skill-center-light.png`        | `SkillCenterView` light          |
| TC-11-01 | `outputs/phase-11/screenshots/TC-11-01-skill-center-dark.png`         | `SkillCenterView` dark           |
| TC-11-02 | `outputs/phase-11/screenshots/TC-11-02-skill-create-light.png`        | `SkillCreateWizard` light        |
| TC-11-02 | `outputs/phase-11/screenshots/TC-11-02-skill-create-dark.png`         | `SkillCreateWizard` dark         |
| TC-11-03 | `outputs/phase-11/screenshots/TC-11-03-skill-management-light.png`    | `SkillManagementPanel` light     |
| TC-11-03 | `outputs/phase-11/screenshots/TC-11-03-skill-management-dark.png`     | `SkillManagementPanel` dark      |
| TC-11-04 | `outputs/phase-11/screenshots/TC-11-04-skill-lifecycle-light.png`     | `SkillLifecyclePanel` light      |
| TC-11-05 | `outputs/phase-11/screenshots/TC-11-05-skill-center-return-light.png` | 戻り後の `SkillCenterView` light |

## 検証結果

```text
Test Files  5 passed (5)
Tests       75 passed (75)
```

## Phase 12 同期

- `manual-test-report.md` を実画像ベースに更新
- `SkillCenterView` / `SkillManagementPanel` / `SkillLifecyclePanel` の視覚証跡を `phase-11/screenshots/` に保存
- `skillManagement` の secondary 導線と back 導線を仕様書・実装・証跡で一致させた
