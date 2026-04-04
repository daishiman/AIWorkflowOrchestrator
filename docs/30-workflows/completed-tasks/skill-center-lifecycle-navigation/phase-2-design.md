# Phase 2: 設計

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

---

## 1. アーキテクチャ設計

### 状態遷移トポロジー（変更後）

```
App.tsx renderView() switch
  ├── case "skillCenter"     → SkillCenterView          ← 変更なし
  ├── case "skillCreate"     → SkillCreateWizard         ← 変更なし（主導線 / /advanced/ URL用）
  ├── case "skillManagement" → SkillManagementPanel      ← 【新規追加】
  └── ... 他は変更なし
```

`SkillManagementPanel` は main-shell と advanced route の両方から同じコンポーネントを再利用する。`SkillLifecyclePanel` は `SkillManagementPanel` の内側に閉じたサブビューとして扱う。

### ViewType 追加設計

```typescript
// apps/desktop/src/renderer/store/types.ts
export type ViewType =
  | "dashboard"
  | "workspace"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  | "skillCenter"
  | "skill-editor"
  | "skill-center"
  | "skillAnalysis"
  | "skillCreate"
  | "skillManagement" // 【追加】SkillManagementPanel を表示
  | "agent"
  | "executionConsole"
  | "chainBuilder"
  | "scheduleManager"
  | "historySearch"
  | "debugPanel"
  | "analyticsDashboard";
```

---

## 2. TASK-A 設計: shell / routing 連携

### App.tsx 変更

```typescript
// renderView() に追加
case "skillManagement":
  return (
    <SkillManagementPanel onClose={() => setCurrentView("skillCenter")} />
  );
```

`skillManagement` は top-level の新しい shell surface ではなく、`skillCenter` の派生 surface として扱う。したがって `AppLayout` / `AppDock`（desktop / mobile の両方）には `skillCenter` を渡してナビゲーションの強調表示を維持する。

```typescript
const dockCurrentView =
  currentView === "skillManagement" ? "skillCenter" : currentView;
```

### SkillManagementPanel 連携

`SkillManagementPanel` は `onClose` を受け取り、main-shell では `skillCenter` に戻す関数を、`/advanced/skill-management-panel` では `window.history.back()` を渡す。これで main-shell と advanced route の両方を同じ実装で扱える。

---

## 3. TASK-B 設計: SkillCenterView の主導線維持

### SkillCenterView 変更

`SkillCenterView` の主 CTA は `skillCreate` のまま維持する。`SkillManagementPanel` への導線は副 CTA として追加し、既存の `SkillCreateWizard` を上書きしない。

```typescript
// useSkillCenter.ts に追加
const navigateToSkillManagement = useCallback(
  () => setCurrentView("skillManagement"),
  [setCurrentView],
);

// index.tsx にボタン追加（ヘッダー右上、「+新規作成」の隣）
<button
  type="button"
  onClick={navigateToSkillManagement}
  data-testid="header-management-cta"
  data-route-kind="secondary"
>
  スキル管理
</button>
```

---

## 4. 責務境界マップ

| レイヤー             | コンポーネント         | 責務                                         | 状態所有権                |
| -------------------- | ---------------------- | -------------------------------------------- | ------------------------- |
| Store                | Zustand `currentView`  | View 切り替えの正本                          | App-global                |
| Routing              | App.tsx `renderView()` | currentView に基づくコンポーネント選択       | なし（純粋関数）          |
| SkillCenterView      | navigate 関数群        | SkillCenter 内の CTA → View 切り替えトリガー | なし                      |
| SkillManagementPanel | `onClose` callback     | 終了後の View 遷移                           | なし（呼び出し元に委譲）  |
| SkillLifecyclePanel  | 内部サブビュー         | 画面内の作成・検証フロー                     | `SkillManagementPanel` 内 |

---

## 5. テスト戦略

### Unit Test 対象

| テスト | ファイル                            | 内容                                                                           |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------ |
| TC-01  | `useSkillCenter.navigation.test.ts` | `navigateToSkillManagement` が `setCurrentView("skillManagement")` を呼ぶ      |
| TC-02  | `App.renderView.viewtype.test.tsx`  | `currentView="skillManagement"` で `SkillManagementPanel` がレンダリングされる |
| TC-03  | `App.renderView.viewtype.test.tsx`  | `skillManagement` 時も dock/sidebar は `skillCenter` として扱われる            |
| TC-04  | `SkillCenterView.cta.test.tsx`      | 「+新規作成」クリックで `skillCreate` が維持される                             |
| TC-05  | `SkillCenterView.cta.test.tsx`      | 「スキル管理」クリックで `skillManagement` が呼ばれる                          |
| TC-06  | `SkillManagementPanel.test.tsx`     | back / close で `SkillCenterView` に戻る                                       |

### 既存テストへの影響

- `SkillCenterView` の既存スナップショットテストは `header-management-cta` の追加に合わせて更新が必要
- `SkillManagementPanel.route-classification.test.tsx` は既存の lifecycle/create 切替をそのまま維持する

---

## 6. 変更ファイル詳細（Before/After）

| ファイル                    | Before                     | After                                        |
| --------------------------- | -------------------------- | -------------------------------------------- |
| `store/types.ts`            | ViewType 18種              | ViewType 19種（+skillManagement）            |
| `App.tsx`                   | renderView() 14 case       | renderView() 15 case（+1）                   |
| `useSkillCenter.ts`         | navigateToSkillCreate のみ | +navigateToSkillManagement                   |
| `SkillCenterView/index.tsx` | 「+新規作成」→ skillCreate | 「+新規作成」維持 + 「スキル管理」ボタン追加 |
| `SkillManagementPanel.tsx`  | onClose なし               | onClose / back button 追加                   |

---

## Phase 2 完了確認

- [x] 状態遷移トポロジー設計完了
- [x] ViewType 変更設計完了
- [x] TASK-A 設計完了
- [x] TASK-B 設計完了
- [x] 責務境界マップ完了
- [x] テスト戦略策定完了
- [x] 変更ファイル Before/After 記録完了
