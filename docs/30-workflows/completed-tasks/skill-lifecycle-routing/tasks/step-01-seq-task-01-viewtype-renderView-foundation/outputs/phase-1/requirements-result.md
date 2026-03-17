# Phase 1: 要件定義 - 調査結果

## 調査日時

2026-03-17

## 現状調査結果

### 1. ViewType union（store/types.ts）

現在15メンバー:

- dashboard, workspace, editor, chat, graph, settings, agent, skillCenter, historySearch, chainBuilder, scheduleManager, debugPanel, analyticsDashboard, skill-editor, skill-center

### 2. renderView() switch文（App.tsx L269-316）

全15 case + default:

- dashboard, workspace, editor, chat, graph, agent, skillCenter, historySearch, chainBuilder, scheduleManager, debugPanel, analyticsDashboard, skill-editor, settings, default(ComingSoonView)

### 3. SkillLifecycleJobGuide型（skillLifecycleJourney.ts L13-20）

現在のフィールド:

- id: SkillLifecycleJob ("create" | "use" | "improve")
- title: string
- entryLabel: string
- handoffLabel: string
- summary: string
- completion: string
- onAction フィールドは未定義

### 4. navigationSlice.ts の setCurrentView

型シグネチャ: `setCurrentView: (view: ViewType) => void`
ViewType拡張で自動的に新メンバーを受け入れる。

## 不整合調査結果

### "skill-center" / "skillCenter" の normalize ロジック

- `normalizeSkillLifecycleView()` が `"skill-center"` → `"skillCenter"` に変換
- 戻り値型: `Exclude<ViewType, "skill-center">`
- 新ViewType追加後も正しく機能する（新メンバーはExclude対象外）

### "skill-editor" の利用状況

- renderView() L295-304で使用
- SkillEditorViewを描画し、onCloseでskillCenterに戻る
- skillAnalysis caseと同様のパターン

### 追加予定コンポーネント確認

- SkillAnalysisView: apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx に存在
  - Props: { skillName: string; onClose: () => void }
- SkillCreateWizard: apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx に存在
  - Props: { onClose: () => void }
- 両コンポーネントは components/skill/index.ts からexport済み
- App.tsx L41で既にimport済み

## currentSkillName の渡し方判断

- skillAnalysis: `currentSkillName ?? "demo-skill"` を渡す（skill-editorと同じパターン）
- skillCreate: 新規作成のためcurrentSkillNameは不要

## 受入基準 AC-1〜AC-6 確認済み

- AC-1: ViewType に "skillAnalysis" | "skillCreate" を追加する
- AC-2: renderView() に対応する case を追加する
- AC-3: 既存ViewTypeが破壊されない
- AC-4: SkillLifecycleJobGuide に onAction?: () => void を追加する
- AC-5: pnpm typecheck が PASS する
- AC-6: 既存テストが全て PASS する

## Phase 2 への引き継ぎ事項

- ViewType union に "skillAnalysis" | "skillCreate" を追加（L18の"skill-center"の直後）
- renderView() に2 caseを追加（L304の"skill-editor" caseの直後）
- SkillLifecycleJobGuide に onAction?: () => void を追加（L19のcompletion直後）
- SkillAnalysisView / SkillCreateWizardは既にimport済みのため追加不要
