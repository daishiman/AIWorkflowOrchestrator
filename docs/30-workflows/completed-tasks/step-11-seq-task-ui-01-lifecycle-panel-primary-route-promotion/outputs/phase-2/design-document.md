# Phase 2 成果物: 設計文書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| Phase      | 2          |
| 作成日     | 2026-04-06 |
| ステータス | completed  |

---

## Task 1: ルーティング設計

### 現行ルート構造（変更前）

```
App.tsx renderView():
  "skillCreate"     → <SkillCreateWizard>        ← 現一次導線
  "skillManagement" → <SkillManagementPanel>      ← SkillLifecyclePanel含む
  "skillCenter"     → <SkillCenterView>
```

### 変更後ルート構造

```
App.tsx renderView():
  "skillLifecycle"  → <SkillLifecyclePanel>       ← 新一次導線 (AC-1)
  "skillCreate"     → <SkillCreateWizard>          ← 後方互換 (AC-2)
  "skillManagement" → <SkillManagementPanel>       ← 既存維持 (AC-2)
  "skillCenter"     → <SkillCenterView>
```

### 追加するルート定義（App.tsx renderView）

```tsx
case "skillLifecycle":
  return (
    <SkillLifecyclePanel onClose={() => setCurrentView("skillCenter")} />
  );
```

### エントリポイント変更設計

```
SkillCenterView の create ジョブ CTA:
  変更前: navigateToSkillCreate → setCurrentView("skillCreate")
  変更後: navigateToSkillLifecycle → setCurrentView("skillLifecycle")

SkillCenterView のヘッダー「+新規作成」ボタン:
  変更なし: navigateToSkillCreate → setCurrentView("skillCreate")  (AC-2 後方互換)
```

---

## Task 2: `normalizeSkillLifecycleView()` 変更設計

### 現行実装

```typescript
export function normalizeSkillLifecycleView(
  view: ViewType,
): Exclude<ViewType, "skill-center"> {
  if (view === "skill-center") {
    return "skillCenter";
  }
  return view;
}
```

### 変更後実装

`"skillLifecycle"` は有効な ViewType として追加するため、正規化変換は不要。
ただし、将来の型安全性のために戻り値型を更新する。

```typescript
// 変更なし: skillLifecycle は正規化不要（そのままパス）
// 型定義から "skill-center" を除外する既存のロジックは維持
export function normalizeSkillLifecycleView(
  view: ViewType,
): Exclude<ViewType, "skill-center"> {
  if (view === "skill-center") {
    return "skillCenter";
  }
  return view;
}
```

**結論**: `normalizeSkillLifecycleView()` 自体の変更は不要。`"skillLifecycle"` を ViewType に追加すれば型安全に通過する。

---

## Task 3: ナビゲーション定義変更設計（skillLifecycleJourney.ts）

### 追加する定数

```typescript
// 一次導線: SkillLifecyclePanel への直接アクセスビュー
export const SKILL_LIFECYCLE_PRIMARY_VIEW = "skillLifecycle" as const;
```

### SKILL_LIFECYCLE_ADVANCED_ROUTES への追加

`"skillLifecycle"` は一次導線として App.tsx の `renderView()` でハンドルされるため、
advanced ルートには追加しない（advanced は補助導線のみ）。

### SKILL_LIFECYCLE_SURFACE_RESPONSIBILITIES の `skillCreator` 更新

既存の `skillCreator` surface の `primaryResponsibility` を更新し、
一次導線としての SkillLifecyclePanel を明記する：

```typescript
{
  id: "skillCreator",
  label: "Skill Creator",
  primaryResponsibility: "新規スキルの作成工程を担う。SkillLifecyclePanel が一次導線。",
  forbiddenResponsibility: "探索・実行・改善結果の一覧責務を持たない。",
  handoff: "作成完了後は Workspace / Agent へ戻す。",
},
```

---

## Task 4: 後方互換設計

### SkillCreateWizard への既存導線維持

| 導線                                       | 維持方法                                           |
| ------------------------------------------ | -------------------------------------------------- |
| `useSkillCenter.navigateToSkillCreate()`   | 変更なし（`setCurrentView("skillCreate")` を維持） |
| `App.tsx case "skillCreate"`               | 変更なし（`<SkillCreateWizard>` をレンダリング）   |
| URL ルート `/advanced/skill-create-wizard` | 変更なし                                           |
| ヘッダー「+新規作成」ボタン                | 変更なし（`navigateToSkillCreate` を呼び続ける）   |

### SkillManagementPanel → SkillLifecyclePanel 導線維持

- `SkillManagementPanel.tsx` は変更しない
- 内部の `setCurrentView("lifecycle")` は SkillManagementPanel 内部の state であり、
  App.tsx の ViewType とは独立している

---

## Task 5: 状態管理影響分析

### ViewType への影響

```diff
// store/types.ts
export type ViewType =
  | "dashboard" | "workspace" | "editor" | "chat" | "graph" | "settings"
  | "skillCenter" | "skill-editor" | "skill-center" | "skillAnalysis"
  | "skillCreate" | "skillManagement"
+ | "skillLifecycle"
  | "agent" | "executionConsole" | "chainBuilder" | "scheduleManager"
  | "historySearch" | "debugPanel" | "analyticsDashboard";
```

### DockViewType への影響

`DockViewType` は `navContract.ts` で `ViewType` の一部を `Extract` して定義されており、
`"skillLifecycle"` は DockViewType に含まれない（変更不要）。

`App.tsx` の `dockCurrentView` 変換:

```tsx
const dockCurrentView = (
  currentView === "skillManagement" ? "skillCenter" : currentView
) as DockViewType;
```

`"skillLifecycle"` は DockViewType に含まれないため、型アサーション `as DockViewType` が問題になりうる。
→ **追加の変換が必要**:

```tsx
const dockCurrentView = (
  currentView === "skillManagement" || currentView === "skillLifecycle"
    ? "skillCenter"
    : currentView
) as DockViewType;
```

### 状態初期化パターン

`SkillLifecyclePanel` の `onClose` に `() => setCurrentView("skillCenter")` を渡す。
既存の `SkillManagementPanel` → `SkillLifecyclePanel` の `onClose` と同じパターン。

---

## Task 6: SubAgent 分割設計（Phase 3 受け渡し単位）

| 論点                        | Phase 3 で検証する内容                                                 |
| --------------------------- | ---------------------------------------------------------------------- |
| ViewType追加                | `"skillLifecycle"` 追加の影響範囲（型安全性、switch exhaustiveness）   |
| App.tsx case                | `dockCurrentView` 変換の整合性                                         |
| normalizeSkillLifecycleView | 変更不要の判断が正しいか                                               |
| 後方互換                    | `navigateToSkillCreate` / `skillCreate` / header button が維持されるか |
| テスト更新                  | TC-CTA-12 変更と TC-01/TC-CTA-03/TC-04d 維持の整合                     |

---

## 変更ファイル一覧

| ファイル                                        | 変更内容                                               | 変更規模 |
| ----------------------------------------------- | ------------------------------------------------------ | -------- |
| `store/types.ts`                                | ViewType に `"skillLifecycle"` 追加                    | 1行      |
| `App.tsx`                                       | `renderView()` に case追加、`dockCurrentView` 変換更新 | 5行      |
| `navigation/skillLifecycleJourney.ts`           | 定数追加、surface責務更新                              | 5行      |
| `views/SkillCenterView/hooks/useSkillCenter.ts` | `navigateToSkillLifecycle` 追加                        | 5行      |
| `views/SkillCenterView/index.tsx`               | create job mapping変更                                 | 1行      |
| テスト: `SkillCenterView.cta.test.tsx`          | TC-CTA-12 更新、mock追加                               | 10行     |
| テスト: `skillLifecycleJourney.test.ts`         | normalizer新ケース、定数テスト追加                     | 15行     |

**合計変更量: 約42行**（最小複雑性）
