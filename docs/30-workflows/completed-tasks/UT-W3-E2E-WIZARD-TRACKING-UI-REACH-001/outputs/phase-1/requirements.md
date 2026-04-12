# Phase 1 要件定義サマリー

## タスクID: UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001

## 計装ポイント一覧（W3-seq-04 実装済み）

1. `skill_wizard_started` - ウィザード起動時（useEffect）
2. `skill_wizard_step1_completed` - Step 1（詳細設定）完了時（handleGenerate）
3. `skill_wizard_generation_completed` - スキル生成完了時（handleGenerate 内）
4. `skill_skeleton_quality_feedback` - 品質フィードバック時（handleQualityFeedback）
5. `skill_wizard_next_action` - 次アクション選択時（handleExecuteNow / handleOpenInEditor / handleCreateAnother）

## スタブ要件

- `trackEvent.e2e-stub.ts` を Vite alias で差し替え
- `window.__trackEventCalls` で発火を記録
- `SkillWizardEvents` 型と整合（AC-8）
- `page.addInitScript` で初回描画前に初期化

## チェックリスト

- [x] AC-1〜AC-9 がすべて文書化されている
- [x] TC-03、TC-05、TC-06、TC-08、TC-09、TC-11、TC-12 の 7 ケースを定義した
- [x] trackEvent スタブの型要件と注入パターン方針を記述した
- [x] CI `e2e-desktop` ジョブの改修要件を記述した
- [x] スコープ境界（含む 5 ファイル / 含まない 4 項目）を確定した
