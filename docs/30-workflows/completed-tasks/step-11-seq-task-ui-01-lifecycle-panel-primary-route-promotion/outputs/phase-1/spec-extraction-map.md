# Phase 1 成果物: 仕様抽出マップ

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| Phase      | 1          |
| 作成日     | 2026-04-06 |
| ステータス | completed  |

---

## Task 1: ルート所有者調査

### App.tsx の現行ルート定義

| ViewType          | コンポーネント         | 備考                                     |
| ----------------- | ---------------------- | ---------------------------------------- |
| `skillCreate`     | `SkillCreateWizard`    | 現在の「スキル作成」一次導線             |
| `skillManagement` | `SkillManagementPanel` | `SkillLifecyclePanel` を内包する二次導線 |
| `skillCenter`     | `SkillCenterView`      | スキルセンター（入口画面）               |
| `skillAnalysis`   | `SkillAnalysisView`    | スキル分析                               |
| `skill-editor`    | `SkillEditorView`      | スキルエディタ                           |

### `normalizeSkillLifecycleView()` の現行ロジック

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

- 変換対象: `"skill-center"` → `"skillCenter"` のみ
- その他の ViewType はそのまま返す

### SkillLifecyclePanel への現在のアクセス経路

1. `skillCenter` → `SkillManagementPanel` 経由 → 内部で `View = "lifecycle"` に切り替え
   - `SkillManagementPanel.tsx` 内: `setCurrentView("lifecycle")` → `SkillLifecyclePanel`
2. URL ルート: `/advanced/skill-management-panel` → `SkillManagementPanel`（内部で同様）

---

## Task 2: 既存ハンドオフ調査

### SkillCreateWizard からの遷移パターン

- `onClose` prop → `setCurrentView("skillCenter")` (App.tsx から渡される)
- 完了時も `onClose` 経由でリセット

### SkillManagementPanel → SkillLifecyclePanel の遷移ロジック

```tsx
// SkillManagementPanel.tsx
type View = "list" | "editor" | "analysis" | "create" | "lifecycle";
// ボタンクリック
<button onClick={() => setCurrentView("lifecycle")}>
  <SkillLifecyclePanel onClose={handleBackToList} onOpenWizard={() => setCurrentView("create")} />
```

### メインナビゲーション（SkillCenterView）からの遷移パターン

- `useSkillCenter.navigateToSkillCreate` → `setCurrentView("skillCreate")` → `SkillCreateWizard`（現在の一次導線）
- `useSkillCenter.navigateToSkillManagement` → `setCurrentView("skillManagement")` → `SkillManagementPanel`

---

## Task 3: 状態管理者調査

### `skillLifecycleJourney.ts` のナビゲーション状態定義

- `SKILL_LIFECYCLE_ENTRY_VIEW = "skillCenter"` (一次入口)
- `SKILL_LIFECYCLE_JOB_GUIDES` — create/use/improve の3ジョブガイド
  - `create.ctaLabel = "作成を始める"` (現在 `navigateToSkillCreate` に紐づく)
- `SKILL_LIFECYCLE_SURFACE_RESPONSIBILITIES` — 6面の責務定義
- `normalizeSkillLifecycleView()` — `skill-center` → `skillCenter` のみ正規化

### ViewType 定義（`store/types.ts`）

```typescript
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
  | "skillManagement"
  | "agent"
  | "executionConsole"
  | "chainBuilder"
  | "scheduleManager"
  | "historySearch"
  | "debugPanel"
  | "analyticsDashboard";
```

**`"skillLifecycle"` は未定義** — 追加が必要

### `DockViewType`（navContract.ts）

`skillCenter` はナビに含まれるが `skillCreate`/`skillManagement`/`skillLifecycle` は含まれない（DockViewType 外）。

---

## Task 4: 対象ビュー調査

### SkillLifecyclePanel Props

```typescript
export interface SkillLifecyclePanelProps {
  onClose: () => void;
}
```

- `onClose`: 必須。呼出元が決める戻り先を渡す。

### SkillCreateWizard Props

```typescript
interface SkillCreateWizardProps {
  onClose: () => void;
}
```

- `onClose`: 必須。構造は同じ。

### 初期化要件の差異

| 観点             | SkillLifecyclePanel                                       | SkillCreateWizard      |
| ---------------- | --------------------------------------------------------- | ---------------------- |
| 内部状態         | フルライフサイクル（plan→review→execute→verify→improve）  | 4ステップフォーム      |
| 起動パラメータ   | なし（`onClose` のみ）                                    | なし（`onClose` のみ） |
| 既存導線での利用 | `SkillManagementPanel` 内部 + `onOpenWizard` コールバック | `App.tsx` 直接         |

---

## Task 5: 受入条件マッピング（コードアンカー対応）

| AC   | 条件                                                       | 変更対象                                                                      | 具体的変更箇所                                                               |
| ---- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| AC-1 | `SkillLifecyclePanel` が一次導線として直接アクセス可能     | `store/types.ts`, `App.tsx`, `useSkillCenter.ts`, `SkillCenterView/index.tsx` | ViewType追加、case追加、navigateToSkillLifecycle追加、create job mapping変更 |
| AC-2 | 既存 `SkillCreateWizard` への導線は維持                    | `App.tsx`                                                                     | `case "skillCreate"` を維持                                                  |
| AC-3 | `normalizeSkillLifecycleView()` が新ルーティングをハンドル | `skillLifecycleJourney.ts`                                                    | `skillLifecycle` を正規化するか確認                                          |
| AC-4 | `skillLifecycleJourney.ts` のナビゲーション定義更新        | `skillLifecycleJourney.ts`                                                    | 一次導線定数追加                                                             |
| AC-5 | モバイル/デスクトップ両対応                                | -                                                                             | ViewType ベースのレンダリングで自動対応                                      |
| AC-6 | 既存テスト pass                                            | テストファイル群                                                              | TC-CTA-12 等を更新                                                           |

---

## Task 6: スコープ境界の確定

### 含む

- `store/types.ts`: `"skillLifecycle"` ViewType 追加
- `App.tsx`: `renderView()` に `case "skillLifecycle"` 追加
- `skillLifecycleJourney.ts`: 一次導線定数・normalizeSkillLifecycleView() 確認・更新
- `views/SkillCenterView/hooks/useSkillCenter.ts`: `navigateToSkillLifecycle` 追加
- `views/SkillCenterView/index.tsx`: `create` job → `navigateToSkillLifecycle` に変更
- テスト更新: TC-CTA-12 等

### 含まない

- `SkillCreateWizard` の廃止・変更（`skillCreate` → `SkillCreateWizard` は維持）
- `SkillLifecyclePanel` の内部ロジック変更
- `SkillManagementPanel.tsx` の変更（既存導線はそのまま）
- 新規 UI コンポーネントの作成
- バックエンド / IPC の変更

---

## Task 7: skill 準拠基準の固定

- `task-specification-creator`: Phase 12 必須 6 成果物 + blocked PR boundary → Phase 13 は pr-readiness.md のみ作成
- `aiworkflow-requirements`: same-wave sync → Phase 12 で 6 成果物を同一 wave で出力
- Phase 3 の 30思考法 → Phase 12 close-out をつなぐ評価軸: 最小複雑性・後方互換・到達性改善

---

## 影響範囲サマリ

```
変更必須:
  apps/desktop/src/renderer/store/types.ts               (ViewType追加)
  apps/desktop/src/renderer/App.tsx                      (case追加)
  apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts (定数・normalizer更新)
  apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts (関数追加)
  apps/desktop/src/renderer/views/SkillCenterView/index.tsx (job mapping変更)

テスト更新:
  apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.cta.test.tsx
  apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts

変更不要:
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
  apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
  packages/shared/* (バックエンド変更なし)
```
