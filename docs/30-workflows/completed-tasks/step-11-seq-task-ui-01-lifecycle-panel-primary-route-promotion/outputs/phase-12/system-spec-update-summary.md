# Phase 12 成果物: システム仕様更新サマリ

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| Phase      | 12         |
| 作成日     | 2026-04-06 |
| ステータス | completed  |

---

## 変更された仕様

### 1. ViewType 定義（store/types.ts）

**変更前**: `"skillLifecycle"` なし  
**変更後**: `"skillLifecycle"` 追加（スキル作成一次導線ビュー）

### 2. SkillCenterView ナビゲーション（useSkillCenter.ts）

**変更前**: `journeyActions.create` → `navigateToSkillCreate` → `skillCreate`  
**変更後**: `journeyActions.create` → `navigateToSkillLifecycle` → `skillLifecycle`

### 3. skillLifecycleJourney.ts 契約

**追加**: `SKILL_LIFECYCLE_PRIMARY_VIEW = "skillLifecycle"` 定数  
**更新**: `skillCreator` surface の `primaryResponsibility` に SkillLifecyclePanel 一次導線明記

### 4. App.tsx ルーティング

**追加**: `case "skillLifecycle"` → `<SkillLifecyclePanel onClose={() => handleViewChange("skillCenter")} onOpenWizard={() => handleViewChange("skillCreate")} />`  
**追加**: `renderAdvancedSkillCenterView()` でも `skillLifecycle` を同一契約で表示  
**追加**: `dockCurrentView` 変換に `skillLifecycle → skillCenter` を追加

---

## 不変仕様

- `case "skillCreate"` → `SkillCreateWizard`（後方互換維持）
- `normalizeSkillLifecycleView()` の変換ロジック（変更なし）
- `SkillManagementPanel` → `SkillLifecyclePanel` 遷移（変更なし）
- `DockViewType` の定義（変更なし）
