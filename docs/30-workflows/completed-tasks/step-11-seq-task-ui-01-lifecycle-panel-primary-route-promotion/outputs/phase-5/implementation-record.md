# Phase 5 成果物: 実装記録

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| Phase      | 5          |
| 作成日     | 2026-04-06 |
| ステータス | completed  |

---

## 変更ファイル一覧

| ファイル                                                                  | 変更内容                                                                                                                          |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/types.ts`                                | `ViewType` に `"skillLifecycle"` 追加                                                                                             |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | `SKILL_LIFECYCLE_PRIMARY_VIEW` 定数追加、`skillCreator` surface 責務更新                                                          |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | `navigateToSkillLifecycle` を型定義・実装・返り値に追加                                                                           |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | `navigateToSkillLifecycle` destructure、`journeyActions.create` を `navigateToSkillLifecycle` に変更                              |
| `apps/desktop/src/renderer/App.tsx`                                       | `SkillLifecyclePanel` import 追加、`dockCurrentView` 変換に `skillLifecycle` 追加、`renderView()` に `case "skillLifecycle"` 追加 |

## テスト変更ファイル

| ファイル                                                                                            | 変更内容                                                     |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts`                                | TC-SL-16/17 追加、`SKILL_LIFECYCLE_PRIMARY_VIEW` import 追加 |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/__tests__/useSkillCenter.navigation.test.ts` | TC-07/08 追加                                                |
| `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.cta.test.tsx`            | mock 追加、TC-CTA-12/20/21/24 更新                           |

---

## 変更内容サマリ

### 1. ViewType 追加（store/types.ts）

```diff
+ | "skillLifecycle" // TASK-UI-01: SkillLifecyclePanel 一次導線
```

### 2. 一次導線定数追加（skillLifecycleJourney.ts）

```diff
+ export const SKILL_LIFECYCLE_PRIMARY_VIEW = "skillLifecycle" as const;
```

### 3. navigateToSkillLifecycle 追加（useSkillCenter.ts）

```diff
+ navigateToSkillLifecycle: () => void;  // 型定義
...
+ const navigateToSkillLifecycle = useCallback(
+   () => setCurrentView("skillLifecycle"),
+   [setCurrentView],
+ );
...
+ navigateToSkillLifecycle,  // 返り値
```

### 4. create ジョブマッピング変更（SkillCenterView/index.tsx）

```diff
- create: navigateToSkillCreate,
+ create: navigateToSkillLifecycle,
  use: navigateToWorkspace,
  improve: navigateToSkillAnalysis,
```

### 5. App.tsx ルート追加

```diff
+ import { SkillLifecyclePanel } from "./components/skill/SkillLifecyclePanel";
...
  const dockCurrentView = (
-   currentView === "skillManagement" ? "skillCenter" : currentView
+   currentView === "skillManagement" || currentView === "skillLifecycle"
+     ? "skillCenter"
+     : currentView
  ) as DockViewType;
...
+ case "skillLifecycle":
+   return <SkillLifecyclePanel onClose={() => setCurrentView("skillCenter")} />;
  case "skillCreate":
    return <SkillCreateWizard onClose={() => setCurrentView("skillCenter")} />;
```

---

## テスト結果（TDD Green フェーズ）

- テスト実行: `pnpm vitest run` (関連5ファイル)
- 結果: **93 tests passed**
- 型チェック: `pnpm --filter @repo/desktop exec tsc --noEmit` → **エラーなし**

---

## AC 検証結果

| AC   | 実装状態                                                                            | 検証結果                    |
| ---- | ----------------------------------------------------------------------------------- | --------------------------- |
| AC-1 | `case "skillLifecycle"` + `navigateToSkillLifecycle` + `journeyActions.create` 変更 | TC-07/08/TC-CTA-12 pass     |
| AC-2 | `case "skillCreate"` 維持、`navigateToSkillCreate` 維持                             | TC-01/TC-CTA-03/TC-04d pass |
| AC-3 | `skillLifecycle` は `normalizeSkillLifecycleView()` を変換なしで通過                | TC-SL-17 pass               |
| AC-4 | `SKILL_LIFECYCLE_PRIMARY_VIEW = "skillLifecycle"` 追加                              | TC-SL-16 pass               |
| AC-5 | `dockCurrentView` 変換で `skillLifecycle → skillCenter` に対応                      | 構造的保証                  |
| AC-6 | 既存テスト全件 pass                                                                 | 93 tests passed             |
